# cppmod

## A little repo for C++ Module migration & experimentation

I'm trying out C++23 and modules (including 'import std;') across GCC, Clang (on
Mac!), and MSVC. Currently, it appears to be working on macOs with LLVM 22
(custom installed). I'm headed over to Windows to try it on MSVC and in Debian
WSL...

Here are some articles I'm using to get this up and going:

- [Modern C++ Modules Practice](https://www.albertogramaglia.com/modern-cpp-modules-practice/)
- [C++ Modules an CMake](https://cryos.net/2024/01/c-modules-and-cmake/)
- [CMake C++ Module docs](https://cmake.org/cmake/help/latest/manual/cmake-cxxmodules.7.html)

Other notes:

- Putting #include's above imports, even in the 'global module fragent' section,
  seems like the right thing to get compilers to stop whining
