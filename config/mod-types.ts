export const cache_name = 'cpp.module.cache';

export type os_handler = {
  // Validate the machine configuration:
  // compiler version, conan global.conf, conan default profile, etc...
  // Ideally provides feedback
  config: () => Promise<true | string[]>;
  // Get (and create, if necessary) the path to the BMI cache
  cache_loc: () => Promise<string>;
  // Build the std BMI
  build_std: () => Promise<true | string[]>;
  // Build the std.compat BMI (if possible: This doesn't work right everywhere)
  build_std_compat?: () => Promise<true | string[]>;
  // Returns a tuple of std.bmi and std.compat.bmi (if they exist)
  check_bmi_presence: () => Promise<[string, string]>;
  // Clears the cache entirely
  clean: () => Promise<void>;
  // emit the cmake set expression into the specified file
  cmake: (overwrite: boolean, dest_f: string) => Promise<void>;
};
