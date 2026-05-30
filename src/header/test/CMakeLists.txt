add_executable(ipc_testing json_test.cpp)
target_link_libraries(ipc_testing PUBLIC ipc_lib ${GTEST_LIB})
gtest_discover_tests(ipc_testing)
