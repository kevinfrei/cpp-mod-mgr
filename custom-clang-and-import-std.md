# Using a custom Clang to build import std on MacOS:

First, `brew install llvm`. LLVM is a "keg-only" installation. You have to
trigger its usage manually. Currently, here's the output of the installation
command, just to have it around:

### Start the Homebrew output:

CLANG_CONFIG_FILE_SYSTEM_DIR: /opt/homebrew/etc/clang
CLANG_CONFIG_FILE_USER_DIR: ~/.config/clang

LLD is now provided in a separate formula: `brew install lld`

Using `clang`, `clang++`, etc., requires a CLT installation at
`/Library/Developer/CommandLineTools`. If you don't want to install the CLT, you
can write appropriate configuration files pointing to your SDK at
`~/.config/clang`.

To use the bundled libunwind please use the following LDFLAGS:

```sh
LDFLAGS="-L/opt/homebrew/opt/llvm/lib/unwind -lunwind"
```

To use the bundled libc++ please use the following LDFLAGS:

```sh
LDFLAGS="-L/opt/homebrew/opt/llvm/lib/c++ -L/opt/homebrew/opt/llvm/lib/unwind -lunwind"
```

Features newer than system libc++ will require the following define to enable
(support for this may be removed in a future major LLVM release):

```sh
CPPFLAGS="-D_LIBCPP_DISABLE_AVAILABILITY"
```

NOTE: You probably want to use the libunwind and libc++ provided by macOS unless
you know what you're doing.

llvm is keg-only, which means it was not symlinked into /opt/homebrew, because
macOS already provides this software and installing another version in parallel
can cause all kinds of trouble.

If you need to have llvm first in your PATH, run:

```sh
  echo 'export PATH="/opt/homebrew/opt/llvm/bin:$PATH"' >> ~/.zshrc
```

For compilers to find llvm you may need to set:

```sh
  export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
```

For cmake to find llvm you may need to set:

```sh
  export CMAKE_PREFIX_PATH="/opt/homebrew/opt/llvm"
```

All that's helpful. I just dumped this into my .zshrc file:

```sh
# Some stuff for MacOS custome clang:
if [[ -d /opt/homebrew/opt/llvm/bin ]] ; then
  export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
  export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
  export CMAKE_PREFIX_PATH="/opt/homebrew/opt/llvm"
fi
```

### End Homebrew output

But here's what else you have to do:

## Conan:

Set `~/.conan2/global.conf`:

```python
# Core configuration (type 'conan config list' to list possible values)
# e.g, for CI systems, to raise if user input would block
# core:non_interactive = True
# some tools.xxx config also possible, though generally better in profiles
# tools.android:ndk_path = my/path/to/android/ndk
tools.cmake:configure_args = ['-DCMAKE_PREFIX_PATH=/opt/homebrew/opt/llvms']
tools.build:compiler_executables = {'c': '/opt/homebrew/opt/llvm/bin/clang', 'cpp': '/opt/homebrew/opt/llvm/bin/clang++'}
```

Plus, you need to set the profile. I just set the default profile, because why
not:

First, delete `~/.conan2/profiles/default` then type:

```
conan profile detect
```

and that should set up the profile. Check to make sure it looks something like
this:

```ini
[settings]
arch=armv8
build_type=Release
compiler=clang
compiler.cppstd=gnu17
compiler.libcxx=libc++
compiler.version=22
os=Macos
```

# Building the STL module

[This page is useful](https://andsav.wordpress.com/2026/04/28/c-std-module-on-macos-with-clang/)

The command to build the STL Module is pretty straight forward:

```sh
cd /opt/homebrew/opt/llvm/share/libc++/v1
clang++ -std=c++23 --precompile std.cppm -o std.pcm -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk -Wno-reserved-module-identifier
clang++ -std=c++23 --precompile std.compat.cppm -o std.compat.pcm -fmodule-file=std=std.pcm -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk -Wno-reserved-module-identifier
```

then you add these two items to your compilation flags:

```
-fmodule-file=std=/opt/homebrew/opt/llvm/share/libc++/v1/std.pcm -fmodule-file=std.compat=/opt/homebrew/opt/llvm/share/libc++/v1/std.compat.pcm
```
