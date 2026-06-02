# cpp-mod-mgr

## A tool for using import std; with _cross-platform_ C++ code

### TODO: Document how this tool works (after I've published it...)

I've been trying out C++23 and modules (including `import std;`) across GCC,
Clang (on Mac!), and MSVC. Currently, it appears to be working on MacOX with
LLVM 22 (custom installed using [HomeBrew](https://brew.sh)), Linux (Debian)
with a 'from source' build of GCC 16.1, and Windows 11 with Visual Studio 2026
compilers.

There's a single big mess that the `import std;` work leaves as an exersize for
the user: How to manage the _vendor-specific_ "Binary Module Interface" (BMI)
files. So, since I got the basics working, I'm adding a per-user BMI cache so
that, as long as you've got the correct compiler installed, you shouldn't have
to do anything else. I'm going to put them in
`${Platform Cache Location}/cpp.module.cache`.

I have looked at the initial CMake support, but it's clearly experimental, and I
really didn't like the idea of sticking some awful GUID in my build system to do
this stuff. So I wrote a bunch of code, instead, because that's **clearly** the
better way to go :/

### Here are details:

|       |                                                             |
| ----- | ----------------------------------------------------------- |
| MacOS | [Using a custom Clang](docs/custom-clang-and-import-std.md) |
| Linux | [Using a custom GCC](docs/custom-gcc-and-import-std.md)     |
| Win11 | [Using import std](docs/import-std-on-msvc.md)              |

Here's some documentation I've found useful to get this up and going:

- [Modern C++ Modules Practice](https://www.albertogramaglia.com/modern-cpp-modules-practice/)
- [C++ Modules an CMake](https://cryos.net/2024/01/c-modules-and-cmake/)
- [CMake C++ Module docs](https://cmake.org/cmake/help/latest/manual/cmake-cxxmodules.7.html)

Other notes:

- Putting #include's above imports, even in the 'global module fragent' section,
  seems like the right thing to get compilers to stop whining. I think this
  mostly eliminates the value of `import std;` but it does allow decent
  compatibility with non-module (read "all") external libraries.

## What's in this repo

| Folder             | Contents                                                           |
| ------------------ | ------------------------------------------------------------------ |
| [src](src)         | The Typescript code for the module manager                         |
| [testing](testing) | CMake & C++ code                                                   |
| [docs](docs)       | Documentation for the custom build stuff                           |
| build              | The bundled javascript code (exists after you run `bun run build`) |
| node_modules       | This is where _javascript_ external dependencies get installed     |
