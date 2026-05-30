# Minimum version of CMake required to build this project
cmake_minimum_required(VERSION 3.28)

include(config/EarlyConfig.cmake)

# Name of the project
project(cppmod LANGUAGES CXX)

# Compiler setup, OS-specific configuration, etc...
include(config/TheBasics.cmake)

# Find Conan2 generated libraries
include(config/ConanLibImports.cmake)

# Stuff that doesn't play nice with Conan
include(config/Extras.cmake)

# The actual C++ project lives in the cpp/ subdirectory
add_subdirectory(src)
