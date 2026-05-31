import { isDefined } from '@freik/typechk';
import { $ } from 'bun';
import os from 'node:os';
import { join } from 'node:path';

const cache_name = 'cpp.module.cache';

// This thing exists because the standards body was too hamstrung by legacy
// mentality to tell the compiler vendors that the binary-module-interface
// files should be named the same fucking thing on any platform, and that the
// compiler vendors are responsible for ensuring that they're actually built
// properly. So instead, we're left with CMake's hacky support for modules,
// which I really dislike, thus I'm building out support myself.

// In addition, Windows is the only widely available desktop where in 2026, the
// 'default' toolchain supports "import std;" so I've also had to mess with
// Conan & CMake configuration to use a custom installed toolchain.

type os_handler = {
  // Validate the machine configuration:
  // compiler version, conan global.conf, conan default profile, etc...
  // Ideally provides feedback
  check_config: () => Promise<boolean>;
  // Get (and create, if necessary) the path to the BMI cache
  cache_loc: () => Promise<string>;
  // Build the std BMI
  build_std: () => Promise<void>;
  // Build the std.compat BMI (if possible: This doesn't work right everywhere)
  build_std_compat?: () => Promise<void>;
  // Returns a tuple of std.bmi and std.compat.bmi (if they exist)
  check_bmi_presence: () => Promise<[string, string]>;
  // Clears the cache entirely
  clean: () => Promise<void>;
};

/*
function win32(): os_hander {
  async function cache_loc(): Promise<string> {
    const dir = join(process.env.LOCALAPPDATA || '', cache_name);
    await $`mkdir -p ${dir}`;
    return dir;
  }
}

function linux(): os_handler {
  async function cache_loc(): Promise<string> {
    const cacheHome = process.env.XDG_CACHE_HOME || join(process.env.HOME, ".cache");
    const dir = join(cacheHome, cache_name);
    await $`mkdir -p ${dir}`
    return dir;
  }
}
*/
function darwin(): os_handler {
  async function check_config(): Promise<boolean> {
    // TODO: Make this validate the machine configuration:
    // The compiler installation location,
    // Conan's global.conf value
    // Conan's default profile setup
    return true;
  }
  async function cache_loc(): Promise<string> {
    const dir = join(process.env.HOME || '', 'Library', 'Caches', cache_name);
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
  async function check_bmi_presence(): Promise<[string, string]> {
    // TODO: Fill this in
    return ['', ''];
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
    case 'cache': {
      console.log('Binary Module Interface cache location:');
      console.log(await handler.cache_loc());
      break;
    }
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
      if (std.length === 0) {
        throw new Error('No BMI found for std!');
      }
      break;
    }
    case 'check_compat': {
      const [, compat] = await handler.check_bmi_presence();
      if (!compat) {
        throw new Error('No BMI found for std.compat!');
      }
      break;
    }
    case 'demand_std': {
      let [std] = await handler.check_bmi_presence();
      if (std.length === 0) {
        await handler.build_std();
        [std] = await handler.check_bmi_presence();
        if (std.length === 0) {
          console.error('Unable to build the std BMI');
        }
      }
      break;
    }
    case 'demand_compat': {
      const [, compat] = await handler.check_bmi_presence();
      if (!compat) {
        if (handler.build_std_compat) {
          await handler.build_std_compat();
        } else {
          throw new Error('Unable to build std.compat on this platform');
        }
      }
      break;
    }
    default: {
      console.log('Usage: bun (run) bmi <arg>');
      console.log('Valid arg values:');
      console.log(
        'config:',
        '\n\tConfigure the machine (and provides diagnostics)',
      );
      console.log(
        'build:',
        '\n\tBuilds both the std and std.compat BMI, puts them in the cache',
      );
      console.log(
        'check_std:',
        '\n\tChecks to make sure that the std BMI is in the cache',
        '\n\tPrints the full path to the std BMI',
      );
      console.log(
        'check_compat:',
        '\n\tChecks to make sure that the std.compat BMI is in the cache',
      );
      console.log(
        'demand_std:',
        "\n\tBuilds the std BMI if it's not already in the cache",
      );
      console.log(
        'demand_compat:',
        "\n\tBuilds the std.compat BMI if it's not already in the cache",
      );
      console.log(
        'cache:',
        '\n\tShow the location of the BMI cache (Binary Module Interface)',
      );
      console.log('clean:', '\n\tEmpty the BMI cache');
    }
  }
}

main().catch((err) => console.error(err));
