# Using a custom Clang to build import std on MacOS:

First, `brew install llvm`. LLVM is a "keg-only" installation. You have to
trigger its usage manually. Currently, here's the output of the installation
command, just to have it around: [Homebrew Output](homebrew.md)

That's stuff's got all the details.

TL;DR: I just dumped this into my .zshrc file:

```sh
# @BEGIN@ Some stuff for MacOS to use a custom clang
if [[ -d /opt/homebrew/opt/llvm/bin ]] ; then
  export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
  export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
  export CMAKE_PREFIX_PATH="/opt/homebrew/opt/llvm"
fi
# @END@ Some stuff for MacOS to use a custom clang
```

But here's what else you have to do:

## Conan:

Set `~/.conan2/global.conf`:

```python
# Core configuration (type 'conan config list' to list possible values)
# e.g, for CI systems, to raise if user input would block
# core:non_interactive = True
# some tools.xxx config also possible, though generally better in profiles
# tools.android:ndk_path = my/path/to/android/ndk
tools.cmake:configure_args = ['-DCMAKE_PREFIX_PATH=/opt/homebrew/opt/llvm']
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

I'm in the process of getting all this stuff (except the LLVM installation
itself) automated in a script.
