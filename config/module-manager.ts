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

function showUsage() {
  console.log('Usage: bun [run] mod <command>');
  console.log('Valid command values:');
  console.log(
    'build (-f)',
    '\n\tBuilds both the std and std.compat BMI, puts them in the cache',
    "\n\tUse -f to force the removal and rebuild of the BMI's",
  );
  console.log(
    'cache:',
    '\n\tPrint the location of the BMI cache (Binary Module Interface)',
  );
  console.log('clean:', '\n\tEmpty and remove the BMI cache');
  console.log(
    'cmake (-f) <config/mod_config.cmake>',
    '\n\tWrite the CMake configuration file if not already there.',
    '\n\tUse -f to force overwriting an existing file',
  );
  console.log(
    'config',
    '\n\tConfigure the machine however necessary (and provide diagnostics)',
  );
}

function check(name: string, res: true | string[]): number {
  if (res === true) {
    return 0;
  }
  console.error('Errors occurred when attempting to run', name);
  res.forEach((v) => console.error(v));
  return -1;
}

// Check to see if we have a '-f' before an argument
function getArg(args: string[]): [boolean, string | false] {
  if (args.length < 2 || args.length !== (args[1] === '-f' ? 3 : 2)) {
    return [false, false];
  }
  const force = args[1] === '-f';
  return [force, args[force ? 2 : 1]];
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
      const std = await handler.buildStd();
      const num = check('build [std]', std);
      let compat: boolean | string[] = false;
      if (handler.buildStdCompat) {
        compat = await handler.buildStdCompat();
      }
      const cNum = compat === false ? -1 : check('build [compat]', compat);
      return num === 0 ? cNum : num;
    }
    case 'cache': {
      console.log(await handler.cacheLocation());
      break;
    }
    case 'clean': {
      await handler.clean();
      return 0;
    }
    case 'cmake': {
      const [force, arg] = getArg(args);
      if (arg === false) {
        showUsage();
        return -1;
      }
      await handler.cmake(force, arg);
      break;
    }
    case 'config': {
      const cfg_res = await handler.machineConfig();
      return check('config', cfg_res);
    }
    default:
      showUsage();
      break;
  }
  return 0;
}

main()
  .then((v: number) => process.exit(v))
  .catch((err) => console.error(err));
