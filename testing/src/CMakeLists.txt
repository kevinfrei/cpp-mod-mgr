# Order matters, as the dependencies should declared & built first, right?
add_subdirectory(header)
#add_subdirectory(leaf)
#add_subdirectory(core)

# Compile main.cpp
add_executable(cppmod main.cpp)

# Link with the core_lib target build in the components subdir.
# Most of the code lives in there, so it's more easily tested.
target_link_libraries(cppmod PRIVATE ipc_module)
