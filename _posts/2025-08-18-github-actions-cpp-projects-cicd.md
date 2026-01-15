---
layout: post
title: "GitHub Actions for C++ Projects: CI/CD Pipeline"
date: 2025-08-18
categories: [DevOps, C++]
tags: [GitHub Actions, CI/CD, C++, Automation]
---

Automate your C++ builds, tests, and releases with GitHub Actions.

## Basic Workflow

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
      run: cmake -B build -DCMAKE_BUILD_TYPE=Release
    
    - name: Build
      run: cmake --build build
    
    - name: Test
      run: cd build && ctest --output-on-failure
```

## Multi-Platform Build

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
        cmake -B build -DCMAKE_CXX_COMPILER=${{ matrix.compiler }}
        cmake --build build
```

## Caching Dependencies

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.conan
      build/_deps
    key: ${{ runner.os }}-deps-${{ hashFiles('**/CMakeLists.txt') }}
```

## Code Coverage

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

## Release Automation

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

---

*How do you automate your C++ builds? Share your workflows!*
