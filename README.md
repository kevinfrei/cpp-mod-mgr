# cppmod

## A little repo for C++ Module migration & experimentation

I'm trying out C++23 and modules (including 'import std;') across GCC, Clang (on
Mac!), and MSVC. Currently, it appears to be working on macOs with LLVM 22
(custom installed), Linux (Debian) with a 'from source' build of GCC 16.1, and
Visual Studio 2026 Community Edition compilers.

There's a single big mess that the 'import std;' work leaves as an exersize for
the user: How to manage the _vendor-specific_ "Binary Module Interface" (BMI).
So, since I got the basics working, I'm adding a per-user BMI cache so that, as
long as you've got the correct compiler installed, you shouldn't have to do
anything else. I'm going to put them in
`${Platform Cache Location}/cpp.module.cache`.

Here are some articles I'm using to get this up and going:

- [Modern C++ Modules Practice](https://www.albertogramaglia.com/modern-cpp-modules-practice/)
- [C++ Modules an CMake](https://cryos.net/2024/01/c-modules-and-cmake/)
- [CMake C++ Module docs](https://cmake.org/cmake/help/latest/manual/cmake-cxxmodules.7.html)

Other notes:

- Putting #include's above imports, even in the 'global module fragent' section,
  seems like the right thing to get compilers to stop whining
