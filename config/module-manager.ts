import { isDefined } from '@freik/typechk';
import os from 'node:os';
import { os_handler } from './mod-types';
import { darwin } from './module-darwin';

// This thing exists because the standards body was too hamstrung by legacy
// mentality to tell the compiler vendors that the binary-module-interface
// files should be named the same fucking thing on any platform, and that the
// compiler vendors are responsible for ensuring that they're actually built
// properly. So instead, we're left with CMake's hacky support for modules,
// which I really dislike, thus I'm building out support myself.

// In addition, Windows is the only widely available desktop where in 2026, the
// 'default' toolchain supports "import std;" so I've also had to mess with
// Conan & CMake configuration to use a custom installed toolchain.

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

const handlers: Map<string, os_handler> = new Map([['darwin', darwin()]]);

function check(name: string, res: true | string[]): number {
  if (res === true) {
    return 0;
  }
  console.error('errors occurred when attempting to run', name);
  res.forEach((v) => console.error(v));
  return -1;
}

async function main(): Promise<number> {
  const args = Bun.argv.slice(2);
  const platform = os.platform();
  const handler = handlers.get(platform);
  if (!isDefined(handler)) {
    throw new Error(`No handler found for ${platform}`);
  }
  switch (args[0]) {
    case 'build': {
      const std_res = await handler.build_std();
      if (handler.build_std_compat) {
        await handler.build_std_compat();
      }
      break;
    }
    case 'cache': {
      console.log('Binary Module Interface cache location:');
      console.log(await handler.cache_loc());
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
    case 'clean': {
      await handler.clean();
      break;
    }
    case 'cmake': {
      if (args.length < 2 || args.length !== (args[1] === '-f' ? 3 : 2)) {
        throw new Error('Missing file destination for "bun mod cmake" command');
      }
      const force = args[1] === '-f';
      await handler.cmake(force, args[force ? 2 : 1]);
      break;
    }
    case 'config': {
      const cfg_res = await handler.config();
      return check('config', cfg_res);
    }
    case 'demand_std': {
      let [std] = await handler.check_bmi_presence();
      if (std.length === 0) {
        const res = await handler.build_std();
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
      console.log('Usage: bun [run] mod <command>');
      console.log('Valid command values:');
      console.log(
        'build (-f)',
        '\n\tBuilds both the std and std.compat BMI, puts them in the cache',
        "\n\tUse -f to force the removal and rebuild of the BMI's",
      );
      console.log(
        'cmake (-f) config/modconfig.cmake',
        '\n\tWrite the CMake configuration file if not already there.',
        '\n\tUse -f to force overwriting an existing file',
      );
      console.log(
        'config',
        '\n\tConfigure the machine however necessary (and provide diagnostics)',
      );
      console.log(
        'cache:',
        '\n\tPrint the location of the BMI cache (Binary Module Interface)',
      );
      console.log('clean:', '\n\tEmpty and remove the BMI cache');
    }
  }
  return 0;
}

main()
  .then((v: number) => process.exit(v))
  .catch((err) => console.error(err));
