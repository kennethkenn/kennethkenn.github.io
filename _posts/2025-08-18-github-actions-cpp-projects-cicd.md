---
layout: post
title: "GitHub Actions for C++ Projects: CI/CD Pipeline"
date: 2025-08-18
categories: [DevOps, C++]
tags: [GitHub Actions, CI/CD, C++, Automation]
---

Automate your C++ builds, tests, and releases with GitHub Actions. The key is to make the workflow **reproducible**, **fast**, and **consistent across platforms**.

## Core Ideas

1.  **Use out-of-source builds**: Keep artifacts in `build/`.
2.  **Test every PR**: Fail fast before merge.
3.  **Cache dependencies**: Reduce cold-start time.
4.  **Publish artifacts**: Make binaries easy to download.

## Basic Workflow

{% raw %}
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y cmake g++ libboost-all-dev
    
    - name: Configure
      run: cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
    
    - name: Build
      run: cmake --build build
    
    - name: Test
      run: cd build && ctest --output-on-failure
```
{% endraw %}

## Use CMake Presets

If you have `CMakePresets.json`, your workflow becomes cleaner and consistent with local builds:

{% raw %}
```yaml
- name: Configure
  run: cmake --preset linux-release

- name: Build
  run: cmake --build --preset linux-release
```
{% endraw %}

## Multi-Platform Build

{% raw %}
```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        compiler: [gcc, clang, msvc]
        exclude:
          - os: windows-latest
            compiler: gcc
          - os: ubuntu-latest
            compiler: msvc
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build
      run: |
        cmake -S . -B build -DCMAKE_CXX_COMPILER=${{ matrix.compiler }}
        cmake --build build
```
{% endraw %}

Use `exclude` to avoid invalid compiler/OS combos. For MSVC on Windows, consider using the Visual Studio generator and omit `CMAKE_CXX_COMPILER`.

## Caching Dependencies

{% raw %}
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.conan
      build/_deps
    key: ${{ runner.os }}-deps-${{ hashFiles('**/CMakeLists.txt') }}
```
{% endraw %}

For faster compiles, add `ccache`:

{% raw %}
```yaml
- name: Cache ccache
  uses: actions/cache@v3
  with:
    path: ~/.ccache
    key: ${{ runner.os }}-ccache-${{ hashFiles('**/*.cpp', '**/*.h') }}
```
{% endraw %}

## Code Coverage

{% raw %}
```yaml
- name: Coverage
  run: |
    cmake -B build -DCMAKE_BUILD_TYPE=Debug -DENABLE_COVERAGE=ON
    cmake --build build
    cd build && ctest
    lcov --capture --directory . --output-file coverage.info
    
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: build/coverage.info
```
{% endraw %}

## Upload Build Artifacts

{% raw %}
```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: binaries-${{ matrix.os }}
    path: build/bin/
```
{% endraw %}

## Release Automation

{% raw %}
```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Release
      run: |
        cmake -B build -DCMAKE_BUILD_TYPE=Release
        cmake --build build
        cpack --config build/CPackConfig.cmake
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: build/*.tar.gz
```
{% endraw %}

---

*How do you automate your C++ builds? Share your workflows!*
