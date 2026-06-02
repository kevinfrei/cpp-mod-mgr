# This was just a couple headers, but now it should be a couple *modules*

add_library(ipc_module)
target_sources(
  ipc_module
  PUBLIC
  FILE_SET
  CXX_MODULES
  FILES
    CommonTypes.cppm crow_pickling.cppm
)
target_link_libraries(ipc_module PUBLIC ${CROW_LIB})

add_subdirectory(test)
