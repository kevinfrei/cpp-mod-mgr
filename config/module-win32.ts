import { $ } from 'bun';
import path from 'node:path';
import { cache_name, os_handler } from './mod-types';

function join(...args: string[]): string {
  return path.join(...args).replace(/\\/g, '/');
}

export function win32(): os_handler {
  // A bunch of locations:
  const vc_p = process.env.VCToolsInstallDir || '';
  const cl_n = 'cl.exe';
  const lib_p = join(vc_p, 'modules');
  const std_f = join(lib_p, 'std.ixx');
  const compat_f = join(lib_p, 'std.compat.ixx');
  const cache_p = join(process.env.LOCALAPPDATA || '', cache_name);
  const std_bmi_n = 'std.ifc';
  const compat_bmi_n = 'std.compat.ifc';
  const cfg_pairs: [string, string, string, string][] = [
    ['MT', 'NDEBUG', '', 'STATIC'],
    ['MTd', '_DEBUG', 'DEBUG_', 'STATIC'],
    ['MD', 'NDEBUG', '', 'DYNAMIC'],
    ['MDd', '_DEBUG', 'DEBUG_', 'DYNAMIC'],
  ];
  async function machineConfig(): Promise<true | string[]> {
    // TODO: Make this validate the machine configuration:
    // The compiler installation location,
    // Conan's global.conf value
    // Conan's default profile setup
    return ['Not', 'Yet', 'Implemented'];
  }
  async function cacheLocation(): Promise<string> {
    for (const [d] of cfg_pairs) {
      await $`mkdir -p ${join(cache_p, d)}`;
    }
    return cache_p;
  }
  async function buildStd(overwrite?: boolean): Promise<true | string[]> {
    // Let's make sure the coche is available
    const cache_p = await cacheLocation();
    // here's the compile command for the std.ifc
    // MSVC calls them "Interface Files": ifc suffix (c is cache?)
    // cl /std:c++latest /EHsc /nologo /MT /DNDEBUG /c std.ixx /ifcOutput MT\ /FoMT\

    for (const [crt, dbg] of cfg_pairs) {
      const dir_p = join(cache_p, crt);
      const bmi_p = join(dir_p, std_bmi_n);
      if (!overwrite && (await Bun.file(bmi_p).exists())) {
        continue;
      }
      const res =
        await $`${cl_n} /std:c++latest /EHsc /nologo /${crt} /D${dbg} /c ${std_f} /ifcOutput ${bmi_p} /Fo${join(dir_p, 'std.obj')}`;
      if (res.exitCode !== 0) {
        return res.text().split('\n');
      }
    }
    return true;
  }
  async function buildStdCompat(overwrite?: boolean): Promise<true | string[]> {
    // Let's make sure the coche is available
    const cache_p = await cacheLocation();
    // here's the compile command for the std.compat.ifc
    // MSVC calls them "Interface Files": ifc suffix (c is cache?)
    for (const [crt, dbg] of cfg_pairs) {
      const dir_p = join(cache_p, crt);
      if (!overwrite && (await Bun.file(join(dir_p, compat_bmi_n)).exists())) {
        continue;
      }
      const res =
        await $`${cl_n} /std:c++latest /EHsc /nologo /${crt} /reference ${join(dir_p, std_bmi_n)} /D${dbg} /c ${compat_f} /ifcOutput ${dir_p}/ /Fo${dir_p}/`;
      if (res.exitCode !== 0) {
        return res.text().split('\n');
      }
    }
    return true;
  }
  async function clean(): Promise<void> {
    await $`rm -rf ${await cacheLocation()}`;
  }
  async function cmake(overwrite: boolean, dest_f: string): Promise<void> {
    if (!overwrite && (await Bun.file(dest_f).exists())) {
      return;
    }
    await Bun.write(
      dest_f,
      `# Auto-generated location for the std.ifc/std.compat.ifc files:
${cfg_pairs
  .map(
    ([crt, , dbg, lib]) =>
      `set(${lib}_${dbg}STD_BMI_LOC "${join(cache_p, crt, std_bmi_n)}")
set(${lib}_${dbg}STD_COMPAT_BMI_LOC "${join(cache_p, crt, compat_bmi_n)}")
`,
  )
  .join('')}
`,
    );
  }
  return {
    machineConfig,
    cacheLocation,
    buildStd,
    buildStdCompat,
    clean,
    cmake,
  };
}
