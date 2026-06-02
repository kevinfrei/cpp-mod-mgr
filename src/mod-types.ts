export const cache_name = 'cpp.module.cache';

export type os_handler = {
  // Validate the machine configuration:
  // compiler version, conan global.conf, conan default profile, etc...
  // Ideally provides feedback
  machineConfig: () => Promise<true | string[]>;
  // Get (and create, if necessary) the path to the BMI cache
  cacheLocation: () => Promise<string>;
  // Build the std BMI
  buildStd: (overwrite?: boolean) => Promise<true | string[]>;
  // Build the std.compat BMI (if possible: This doesn't work right everywhere)
  buildStdCompat?: (overwrite?: boolean) => Promise<true | string[]>;
  // Clears the cache entirely
  clean: () => Promise<void>;
  // emit the cmake set expression into the specified file
  cmake: (overwrite: boolean, dest_f: string) => Promise<void>;
};
