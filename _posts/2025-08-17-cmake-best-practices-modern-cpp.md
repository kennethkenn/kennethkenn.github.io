---
layout: post
title: "CMake Best Practices for Modern C++ Projects"
date: 2025-08-17
categories: [C++, Build Systems]
tags: [CMake, C++, Build Tools]
---

CMake is the de facto build system for C++ projects. Here's how to use it effectively.

## Modern CMake (3.15+)

```cmake
cmake_minimum_required(VERSION 3.15)
project(MyApp VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Create executable
add_executable(myapp
    src/main.cpp
    src/utils.cpp
)

# Link libraries
target_link_libraries(myapp PRIVATE
    pthread
    fmt::fmt
)

# Include directories
target_include_directories(myapp PRIVATE
    ${PROJECT_SOURCE_DIR}/include
)
```

## Finding Dependencies

```cmake
# Find system libraries
find_package(Threads REQUIRED)
find_package(Boost 1.70 REQUIRED COMPONENTS filesystem)

# Link
target_link_libraries(myapp PRIVATE
    Threads::Threads
    Boost::filesystem
)
```

## Creating Libraries

```cmake
# Static library
add_library(mylib STATIC
    src/lib.cpp
)

# Shared library
add_library(mylib SHARED
    src/lib.cpp
)

# Header-only library
add_library(mylib INTERFACE)
target_include_directories(mylib INTERFACE include/)
```

## Compiler Warnings

```cmake
target_compile_options(myapp PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra -Wpedantic>
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
)
```

## Testing

```cmake
enable_testing()

add_executable(tests test/main_test.cpp)
target_link_libraries(tests PRIVATE mylib GTest::gtest_main)

add_test(NAME MyTests COMMAND tests)
```

## Installation

```cmake
install(TARGETS myapp
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)

install(DIRECTORY include/
    DESTINATION include
)
```

## Best Practices

1. **Use target-based commands** (`target_link_libraries` not `link_libraries`)
2. **Avoid global settings** (use `target_*` not `set`)
3. **Use generator expressions** for platform-specific settings
4. **Version your CMake** (`cmake_minimum_required`)
5. **Export targets** for library consumers

---

*What CMake patterns do you use? Share your tips!*
