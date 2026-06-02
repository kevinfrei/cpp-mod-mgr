if(APPLE)
  set(CMAKE_C_COMPILER "/opt/homebrew/opt/llvm/bin/clang")
  set(CMAKE_CXX_COMPILER "/opt/homebrew/opt/llvm/bin/clang++")
elseif(UNIX)
  # wrapper G++ to enable overriding the module mapper
  set(CMAKE_CXX_COMPILER "${CMAKE_SOURCE_DIR}/config/wrapper-gxx")
endif()
