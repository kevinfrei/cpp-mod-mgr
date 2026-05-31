import { isDefined } from '@freik/typechk';
import { $ } from 'bun';
import os from 'node:os';

// This thing exists because the standards body was too hamstrung by legacy
// mentality to tell the compiler vendors that the binary-module-interface
// files should be named the same fucking thing on any platform, and that the
// compiler vendors are responsible for ensuring that they're actually built
// properly. So instead, we're left with CMake's hacky support for modules,
// which I really dislike. So I'm building out support myself.

// In addition, Windows is the only OS where the 'default' toolchain supports
// "import std;" so I've also had to monkey with Conan & CMake configuration to
// support usage of a custom installed toolchain.

type os_handler = {
  // Validate the machine configuration:
  // compiler version, conan global.conf, conan default profile
  check_config: () => Promise<boolean>;
  // Get (and create, if necessary) the path to the BMI cache
  cache_loc: () => Promise<string>;
  // Build the std BMI
  build_std: () => Promise<void>;
  build_std_compat?: () => Promise<void>;
  check_bmi_presence: () => Promise<[boolean, boolean]>;
  clean: () => Promise<void>;
};

function darwin(): os_handler {
  async function check_config(): Promise<boolean> {
    // Make this validate the machine configuration:
    // The compiler installation location,
    // Conan's global.conf value
    // Conan's default profile setup
    return true;
  }
  async function cache_loc(): Promise<string> {
    const dir = `${process.env.HOME}/Library/Caches/cpp.bmi.freik`;
    await $`mkdir -p ${dir}`;
    return dir;
  }
  async function build_std(): Promise<void> {
    // TODO: Fill this in
    await $`rm -rf build/Debug`;
    await $`rm -rf build/Release`;
  }
  async function build_std_compat(): Promise<void> {
    // TODO: Fill this in
  }
  async function check_bmi_presence(): Promise<[boolean, boolean]> {
    return [false, false];
  }
  async function clean(): Promise<void> {
    await $`rm -rf ${await cache_loc()}`;
  }
  return {
    check_config,
    cache_loc,
    build_std,
    build_std_compat,
    check_bmi_presence,
    clean,
  };
}

const handlers: Map<string, os_handler> = new Map([['darwin', darwin()]]);

async function main() {
  const args = Bun.argv.slice(2);
  // const scriptName = args[0];
  const platform = os.platform();
  const handler = handlers.get(platform);
  if (!isDefined(handler)) {
    throw new Error(`No handler found for ${platform}`);
  }
  const cmd = args[1];
  switch (cmd) {
    case 'clean': {
      await handler.clean();
      break;
    }
    case 'build': {
      await handler.build_std();
      if (handler.build_std_compat) {
        await handler.build_std_compat();
      }
      break;
    }
    case 'check_std': {
      const [std] = await handler.check_bmi_presence();
      if (!std) {
        throw new Error('No BMI found for std!');
      }
      break;
    }
    case 'check_std_compat': {
      const [, compat] = await handler.check_bmi_presence();
      if (!compat) {
        throw new Error('No BMI found for std.compat!');
      }
      break;
    }
    case 'check': {
      const [std, compat] = await handler.check_bmi_presence();
      if (!std || !compat) {
        throw new Error(
          `No BMI found for ${std ? 'std' : ''} ${compat ? 'std.compat' : ''}!`,
        );
      }
      break;
    }
  }
}

main().catch((err) => console.error(err));
