import { $ } from 'bun';
import { join } from 'node:path';
import { cache_name, os_handler } from './mod-types';

export function linux(): os_handler {
  // A bunch of locations:
  const gcc_n = 'g++';
  const bits_p = 'bits';
  const std_f = join(bits_p, 'std.cc');
  const compat_f = join(bits_p, 'std.compat.cc');
  const cache_p = join(
    process.env.XDG_CACHE_HOME || join(process.env.HOME || '', '.cache'),
    cache_name,
  );
  const std_bmi_n = 'std.gcm';
  const compat_bmi_n = 'std.compat.gcm';

  async function machineConfig(): Promise<true | string[]> {
    // TODO: Make this validate the machine configuration:
    // The compiler installation location,
    // Conan's global.conf value
    // Conan's default profile setup
    return ['Not', 'Yet', 'Implemented'];
  }
  async function cacheLocation(): Promise<string> {
    await $`mkdir -p ${cache_p}`;
    return cache_p;
  }
  async function buildStd(overwrite?: boolean): Promise<true | string[]> {
    // Let's make sure the coche is available
    const cache_p = await cacheLocation();
    // here's the compile command for the std.ifc
    // MSVC calls them "Interface Files": ifc suffix (c is cache?)
    // cl /std:c++latest /EHsc /nologo /MT /DNDEBUG /c std.ixx /ifcOutput MT\ /FoMT\
    const bmi_p = join(cache_p, std_bmi_n);
    if (!overwrite && (await Bun.file(bmi_p).exists())) {
      return true;
    }
    const res =
      await $`${gcc_n} -std=c++23 -fmodules "-fmodule-mapper=|@g++-mapper-server -r ${cache_p}" -fsearch-include-path -c ${std_f}`;
    if (res.exitCode !== 0) {
      return res.text().split('\n');
    }
    return true;
  }
  async function buildStdCompat(overwrite?: boolean): Promise<true | string[]> {
    // Let's make sure the coche is available
    const cache_p = await cacheLocation();
    // here's the compile command for the std.compat.ifc
    // MSVC calls them "Interface Files": ifc suffix (c is cache?)
    const bmi_p = join(cache_p, compat_bmi_n);
    if (!overwrite && (await Bun.file(bmi_p).exists())) {
      return true;
    }
    const res =
      await $`${gcc_n} -std=c++23 -fmodules "-fmodule-mapper=|@g++-mapper-server -r ${cache_p}" -fsearch-include-path -c ${compat_f}`;
    if (res.exitCode !== 0) {
      return res.text().split('\n');
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
# GCC requires a compiler interposition, instead of CMake settings, so this
# file is just empty.
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
