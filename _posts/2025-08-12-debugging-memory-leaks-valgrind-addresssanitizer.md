---
layout: post
title: "Debugging Memory Leaks with Valgrind and AddressSanitizer"
date: 2025-08-12
categories: [Debugging, C++]
tags: [Valgrind, AddressSanitizer, Memory Leaks, Debugging]
---

Memory leaks are silent killers. Your program runs fine in development, then crashes in production after running for days. Here's how to catch them early with Valgrind and AddressSanitizer.

## The Problem

```cpp
void processData() {
    int* data = new int[1000];
    // ... process data
    // Oops, forgot to delete[]
}

// After 10,000 calls: 40 MB leaked
```

## Tool 1: Valgrind (Runtime Analysis)

**Install:**
```bash
sudo apt-get install valgrind  # Linux
brew install valgrind          # macOS
```

**Basic Usage:**
```bash
valgrind --leak-check=full ./myprogram
```

**Output:**
```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 4,000 bytes in 1 blocks
==12345==   total heap usage: 1 allocs, 0 frees, 4,000 bytes allocated
==12345==
==12345== 4,000 bytes in 1 blocks are definitely lost
==12345==    at 0x4C2E0EF: operator new[](unsigned long)
==12345==    by 0x400A3C: processData() (main.cpp:15)
==12345==    by 0x400A5D: main (main.cpp:20)
```

**Key Metrics:**
- **Definitely lost**: Memory you leaked
- **Indirectly lost**: Leaked because parent was leaked
- **Possibly lost**: Might be a leak (investigate)
- **Still reachable**: Not freed but still accessible (usually OK)

## Tool 2: AddressSanitizer (Compile-Time Instrumentation)

**Compile with ASan:**
```bash
g++ -fsanitize=address -g main.cpp -o myprogram
clang++ -fsanitize=address -g main.cpp -o myprogram
```

**Run:**
```bash
./myprogram
```

**Output:**
```
=================================================================
==12345==ERROR: LeakSanitizer: detected memory leaks

Direct leak of 4000 byte(s) in 1 object(s) allocated from:
    #0 0x7f8a in operator new[](unsigned long)
    #1 0x400a3c in processData() main.cpp:15
    #2 0x400a5d in main main.cpp:20

SUMMARY: AddressSanitizer: 4000 byte(s) leaked in 1 allocation(s).
```

## Valgrind vs AddressSanitizer

| Feature | Valgrind | AddressSanitizer |
|---------|----------|------------------|
| **Speed** | 10-50x slower | 2x slower |
| **Accuracy** | Very high | Very high |
| **Setup** | No recompilation | Requires recompilation |
| **Platform** | Linux, macOS | Linux, macOS, Windows |
| **Use Case** | Production debugging | Development |

**Recommendation:** Use ASan during development, Valgrind for production issues.

## Common Leak Patterns

### 1. Forgetting delete/delete[]

```cpp
// Leak
int* arr = new int[100];

// Fix
int* arr = new int[100];
delete[] arr;

// Better: Use smart pointers
std::unique_ptr<int[]> arr(new int[100]);
// Or even better
std::vector<int> arr(100);
```

### 2. Exception Safety

```cpp
// Leaks if processData throws
void badFunction() {
    Resource* res = new Resource();
    processData();  // Throws exception
    delete res;     // Never reached
}

// Fix with RAII
void goodFunction() {
    std::unique_ptr<Resource> res(new Resource());
    processData();  // Exception safe
}  // Automatically deleted
```

### 3. Circular References

```cpp
class Node {
    std::shared_ptr<Node> next;  // Circular reference = leak
};

// Fix: Use weak_ptr
class Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // Breaks cycle
};
```

## Advanced Valgrind Options

```bash
# Suppress known leaks
valgrind --leak-check=full --suppressions=myapp.supp ./myprogram

# Track origins of uninitialized values
valgrind --track-origins=yes ./myprogram

# Generate suppression file
valgrind --gen-suppressions=all ./myprogram 2>&1 | grep -A 5 "insert_a_suppression_name_here"
```

## AddressSanitizer Options

```bash
# Detect use-after-free
ASAN_OPTIONS=detect_leaks=1:halt_on_error=0 ./myprogram

# Symbolize stack traces
ASAN_SYMBOLIZER_PATH=/usr/bin/llvm-symbolizer ./myprogram
```

## Integrating into CI/CD

```yaml
# GitHub Actions
- name: Run with AddressSanitizer
  run: |
    cmake -DCMAKE_CXX_FLAGS="-fsanitize=address" .
    make
    ./tests
```

## Conclusion

**Use AddressSanitizer** for fast feedback during development.
**Use Valgrind** for thorough analysis and production debugging.
**Use smart pointers** to avoid manual memory management entirely.

---

*What memory bugs have you caught with these tools? Share your stories!*
