# cpp-mod-mgr

## A tool for using import std; with _cross-platform_ C++ code

# TL;DR:

# **As of June 2026, C++ Modules are _still_ not ready for prime time.**

Current status:

| Compiler | OS    | Version  | Status                                                   |
| -------- | ----- | -------- | -------------------------------------------------------- |
| Clang    | MacOS | 22.1.6   | Can't use `import std;` on one file (out of about 15     |
| GCC      | Linux | 16.1.0   | At the end, stil had multiply defined skyms at link time |
| MSVC     | Win11 | May 2026 | An ICE in one file and a 'module problem' with another   |

---

This tool does its job. To get my (very small!) personal project working on
Mac/Clang required that I stop using `import std;` and go back to
`#include <...>` in one of the source files (out of maybe 20 files). Windows? I
hit 1 ICE (that I couldn't find a work-around for) and another incompatibility
with modules in some code from Boost's ASIO library (because testing Boost is
too much for Microsoft or something?). On GCC, after making some unnecessary
changes to CrowCPP (ditto on GCC: Can't test _Crow_? WTaF?!?), I got everything
to compile, but linking failed with multiple defined functions. The thing is,
I'm not a 'normal' compiler user. I was one of the 3 engineers involved in
bringing up the AMD64 C++ compiler at Microsoft way back in the day, and the
last couple years I was at Meta, I worked on the LLDB debugger. I know the C++
toolchain, and this stuff is still not working at any reasonable level.

# **You should _not_ be using C++ modules yet.**

They look great on paper, but one other interesting side note: I got my little
app up and going on mac, but the build which took about 6 seconds before
modules, took about 20 seconds after migrating to modules. So, syntactically and
semantically, I really like modules, bu the compiler ecosystem is still an
unmitigated mess. You're taking a risk by using them, and the risks are even
greater if you're trying to do something across platforms/compilers.

### Back to what I wrote before:

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

### What's in this repo

| Folder             | Contents                                                           |
| ------------------ | ------------------------------------------------------------------ |
| [src](src)         | The Typescript code for the module manager                         |
| [testing](testing) | CMake & C++ code                                                   |
| [docs](docs)       | Documentation for the custom build stuff                           |
| build              | The bundled javascript code (exists after you run `bun run build`) |
| node_modules       | This is where _javascript_ external dependencies get installed     |
