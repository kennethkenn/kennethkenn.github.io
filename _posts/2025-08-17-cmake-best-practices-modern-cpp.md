---
layout: post
title: "CMake Best Practices for Modern C++ Projects"
date: 2025-08-17
categories: [C++, Build Systems]
tags: [CMake, C++, Build Tools]
---

CMake is the de facto build system for C++ projects. The biggest shift in "modern CMake" is to think in terms of targets and their properties, not global variables. This makes your builds more predictable, easier to reuse, and safer across platforms.

## Recommended Layout

A simple layout keeps configuration clean:

```
.
|-- CMakeLists.txt
|-- include/
|   `-- myapp/
|-- src/
`-- tests/
```

Keep all build artifacts out of the source tree (out-of-source builds). This avoids stale cache issues and makes cleanup trivial.

## Modern CMake (3.15+)

```cmake
cmake_minimum_required(VERSION 3.15)
project(MyApp VERSION 1.0.0 LANGUAGES CXX)

# Create executable
add_executable(myapp
    src/main.cpp
    src/utils.cpp
)

# Prefer target properties
target_compile_features(myapp PRIVATE cxx_std_17)

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

This single target carries its own compile features, include paths, and link libraries. That makes it portable and predictable.

## Configure and Build

Out-of-source build:

```
cmake -S . -B build
cmake --build build
```

`-S` sets the source directory and `-B` sets the build directory. This works on all platforms and keeps build artifacts isolated.

For multi-config generators (Visual Studio, Xcode), add `--config Debug` or `--config Release` to the build step.

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

The imported targets (`Threads::Threads`, `Boost::filesystem`) encapsulate include paths and link flags, which is why they are preferred over manual `-l` flags.

If you control the dependency, consider adding it as a subdirectory:

```cmake
add_subdirectory(external/mylib)
target_link_libraries(myapp PRIVATE mylib)
```

This is ideal for dependencies you vendor in your repo or build from source alongside your project.

For third-party deps you want to download, use `FetchContent`:

```cmake
include(FetchContent)
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 10.2.1
)
FetchContent_MakeAvailable(fmt)
```

`FetchContent` keeps your build self-contained, but consider pinning tags and using shallow clones for faster CI.

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

Choose `STATIC`, `SHARED`, or `INTERFACE` based on how you want consumers to link and what artifacts you intend to ship.

## Compiler Warnings

```cmake
target_compile_options(myapp PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra -Wpedantic>
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
)
```

Generator expressions let you keep a single block of options that stays portable across compilers.

Keep warning levels on targets, not globally. You can also add an option to enable "warnings as errors" only for CI:

```cmake
option(ENABLE_WERROR "Treat warnings as errors" OFF)
if (ENABLE_WERROR)
  target_compile_options(myapp PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:-Werror>
    $<$<CXX_COMPILER_ID:MSVC>:/WX>
  )
endif()
```

This keeps local dev friendly while allowing CI to enforce stricter rules.

## Options and Definitions

Expose features as options and map them to compile definitions:

```cmake
option(ENABLE_TRACING "Enable tracing logs" OFF)

target_compile_definitions(myapp PRIVATE
    $<$<BOOL:${ENABLE_TRACING}>:MYAPP_ENABLE_TRACING>
)
```

`target_compile_definitions` is a clean way to toggle features without sprinkling `#define` statements in your code.

## Testing

```cmake
enable_testing()

add_executable(tests test/main_test.cpp)
target_link_libraries(tests PRIVATE mylib GTest::gtest_main)

add_test(NAME MyTests COMMAND tests)
```

Registering tests with CTest lets you run `ctest` consistently in local and CI environments.

Prefer `ctest` for running tests, and keep test code under `tests/` or `test/` for clarity.

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

Installation rules make your project consumable by package managers and downstream builds.

If you are building libraries for others, export targets so downstream users can `find_package` your project:

```cmake
install(TARGETS mylib EXPORT MyLibTargets)
install(EXPORT MyLibTargets
    NAMESPACE MyLib::
    DESTINATION lib/cmake/MyLib
)
```

Exported targets allow consumers to `find_package(MyLib)` and link with `MyLib::mylib` cleanly.

## Best Practices

1. **Use target-based commands** (`target_link_libraries` not `link_libraries`)
2. **Avoid global settings** (use `target_*` not `set`)
3. **Use generator expressions** for platform-specific settings
4. **Version your CMake** (`cmake_minimum_required`)
5. **Export targets** for library consumers
6. **Keep builds out-of-source** (`-S` and `-B` workflows)
7. **Prefer `target_compile_features`** over global C++ standard flags
8. **Use presets** (`CMakePresets.json`) for reproducible builds

---

*What CMake patterns do you use? Share your tips!*
