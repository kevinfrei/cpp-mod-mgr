import { $ } from 'bun';
import { join } from 'node:path';
import { cache_name, os_handler } from './mod-types';

export function darwin(): os_handler {
  // A bunch of locations:
  const llvm_p = '/opt/homebrew/opt/llvm';
  const clang_f = join(llvm_p, 'bin/clang++');
  const lib_p = join(llvm_p, 'share/libc++/v1');
  const std_f = join(lib_p, 'std.cppm');
  const compat_f = join(lib_p, 'std.compat.cppm');
  const cache_p = join(process.env.HOME || '', 'Library', 'Caches', cache_name);
  const std_bmi_n = 'std.pcm';
  const compat_bmi_n = 'std.compat.pcm';
  const xcode_sdk_p =
    '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';

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
    await cacheLocation();
    // here's the compile command for the std.pcm
    // Clang calls them "Pre Compiled Modules": pcm suffix
    const bmi_f = join(cache_p, std_bmi_n);
    if (!overwrite && (await Bun.file(bmi_f).exists())) {
      return true;
    }
    const res =
      await $`${clang_f} -std=c++23 --precompile ${std_f} -o ${bmi_f} -isysroot ${xcode_sdk_p} -Wno-reserved-module-identifier`;
    if (res.exitCode === 0) {
      return true;
    }
    return res.text().split('\n');
  }
  async function buildStdCompat(overwrite?: boolean): Promise<true | string[]> {
    // Let's make sure the coche is available
    await cacheLocation();
    // here's the compile command for the std.pcm
    // Clang calls them "Pre Compiled Modules": pcm suffix
    const bmi_f = join(cache_p, compat_bmi_n);
    if (!overwrite && (await Bun.file(bmi_f).exists())) {
      return true;
    }
    const res =
      await $`${clang_f} -std=c++23 --precompile ${compat_f} -fmodule-file=std=${join(cache_p, std_bmi_n)} -o ${bmi_f} -isysroot ${xcode_sdk_p} -Wno-reserved-module-identifier`;
    if (res.exitCode === 0) {
      return true;
    }
    return res.text().split('\n');
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
      `# Auto-generated location for the std.pcm/std.compat.pcm files:
set(STD_BMI_LOC "${join(cache_p, std_bmi_n)}")
set(STD_COMPAT_BMI_LOC "${join(cache_p, compat_bmi_n)}")
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
