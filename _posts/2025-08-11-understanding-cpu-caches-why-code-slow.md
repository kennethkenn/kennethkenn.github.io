---
layout: post
title: "Understanding CPU Caches: Why Your Code is Slow"
date: 2025-08-11
categories: [Performance, Low-Level]
tags: [CPU, Caching, Performance, Optimization]
---

You've optimized your algorithm from O(n²) to O(n log n), but it's still slow. The culprit? CPU cache misses. Modern CPUs can execute billions of instructions per second, but memory access is the bottleneck. Understanding caches is the key to writing fast code.

## The Memory Hierarchy

```
CPU Registers:    ~1 cycle   (4 KB)
L1 Cache:         ~4 cycles  (32 KB per core)
L2 Cache:         ~12 cycles (256 KB per core)
L3 Cache:         ~40 cycles (8 MB shared)
Main RAM:         ~200 cycles (16 GB)
SSD:              ~100,000 cycles
```

**Key Insight:** Accessing RAM is 50x slower than L1 cache. Cache-friendly code can be 10-100x faster.

## Cache Lines: The Fundamental Unit

CPUs don't fetch individual bytes—they fetch **cache lines** (typically 64 bytes):

```cpp
struct Point {
    int x, y;  // 8 bytes total
};

Point points[1000];

// This fetches 8 cache lines (64 bytes each = 8 Points per line)
for (int i = 0; i < 1000; i++) {
    points[i].x += 1;
}
```

**Implication:** Accessing `points[0].x` also loads `points[1]` through `points[7]` into cache for free.

## Cache Miss Types

### 1. Compulsory Miss (Cold Start)

First access to data—unavoidable:

```cpp
int sum = 0;
for (int i = 0; i < n; i++) {
    sum += array[i];  // First iteration is a compulsory miss
}
```

### 2. Capacity Miss

Data doesn't fit in cache:

```cpp
// If array is larger than L3 cache (e.g., 100 MB)
int huge_array[25000000];  // 100 MB
for (int i = 0; i < 25000000; i++) {
    huge_array[i] = i;  // Thrashes cache
}
```

### 3. Conflict Miss

Multiple addresses map to the same cache location:

```cpp
// Accessing every 4096th element (common stride)
for (int i = 0; i < n; i += 4096) {
    array[i] = 0;  // May conflict in cache
}
```

## Optimization 1: Spatial Locality

**Bad:** Jumping around memory
```cpp
struct Player {
    int id;
    char name[64];
    float x, y, z;
    // ... 200 bytes total
};

Player players[10000];

// Update positions (scattered access)
for (int i = 0; i < 10000; i++) {
    players[i].x += velocity[i].x;
    players[i].y += velocity[i].y;
    players[i].z += velocity[i].z;
}
```

**Good:** Struct of Arrays (SoA)
```cpp
struct Players {
    float x[10000];
    float y[10000];
    float z[10000];
};

Players players;

// Sequential access, cache-friendly
for (int i = 0; i < 10000; i++) {
    players.x[i] += velocity.x[i];
    players.y[i] += velocity.y[i];
    players.z[i] += velocity.z[i];
}
```

**Speedup:** 5-10x faster due to better cache utilization.

## Optimization 2: Temporal Locality

Reuse data while it's still in cache:

```cpp
// Bad: Two separate loops
for (int i = 0; i < n; i++) {
    a[i] = b[i] + c[i];
}
for (int i = 0; i < n; i++) {
    d[i] = a[i] * 2;  // a[i] might not be in cache anymore
}

// Good: Fuse loops
for (int i = 0; i < n; i++) {
    a[i] = b[i] + c[i];
    d[i] = a[i] * 2;  // a[i] is definitely in cache
}
```

## Optimization 3: Cache Blocking (Tiling)

For matrix operations:

```cpp
// Bad: Poor cache locality
for (int i = 0; i < N; i++) {
    for (int j = 0; j < N; j++) {
        for (int k = 0; k < N; k++) {
            C[i][j] += A[i][k] * B[k][j];  // B accessed non-sequentially
        }
    }
}

// Good: Block/tile the computation
const int BLOCK = 64;
for (int i = 0; i < N; i += BLOCK) {
    for (int j = 0; j < N; j += BLOCK) {
        for (int k = 0; k < N; k += BLOCK) {
            // Multiply BLOCK x BLOCK submatrices
            for (int ii = i; ii < min(i + BLOCK, N); ii++) {
                for (int jj = j; jj < min(j + BLOCK, N); jj++) {
                    for (int kk = k; kk < min(k + BLOCK, N); kk++) {
                        C[ii][jj] += A[ii][kk] * B[kk][jj];
                    }
                }
            }
        }
    }
}
```

**Speedup:** 3-5x for large matrices.

## False Sharing: The Hidden Performance Killer

When multiple threads write to different variables on the same cache line:

```cpp
// Bad: False sharing
struct Counter {
    int count1;  // Thread 1 writes here
    int count2;  // Thread 2 writes here
};  // Both on same cache line!

Counter counter;

// Thread 1
for (int i = 0; i < 1000000; i++) {
    counter.count1++;  // Invalidates cache line for Thread 2
}

// Thread 2
for (int i = 0; i < 1000000; i++) {
    counter.count2++;  // Invalidates cache line for Thread 1
}
```

**Good:** Pad to separate cache lines
```cpp
struct Counter {
    alignas(64) int count1;  // Force 64-byte alignment
    char padding[60];
    alignas(64) int count2;
};
```

**Speedup:** 10-100x in multi-threaded code.

## Prefetching: Hint the CPU

```cpp
// Manual prefetch
for (int i = 0; i < n; i++) {
    __builtin_prefetch(&array[i + 8]);  // Prefetch 8 elements ahead
    process(array[i]);
}
```

**When to use:** When access patterns are predictable but not sequential.

## Measuring Cache Performance

### Linux: perf

```bash
perf stat -e cache-references,cache-misses,L1-dcache-loads,L1-dcache-load-misses ./myprogram

# Output:
# 1,234,567 cache-references
#   123,456 cache-misses  # 10% miss rate
```

### Intel VTune

```bash
vtune -collect memory-access ./myprogram
```

### Valgrind Cachegrind

```bash
valgrind --tool=cachegrind ./myprogram
cg_annotate cachegrind.out.12345
```

## Real-World Example: Binary Search

```cpp
// Cache-unfriendly: Random jumps
int binary_search(int* arr, int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Cache-friendly: Eytzinger layout (BFS order)
// Rearrange array so parent/children are nearby
int eytzinger_search(int* arr, int n, int target) {
    int i = 0;
    while (i < n) {
        if (arr[i] == target) return i;
        i = 2 * i + 1 + (arr[i] < target);
    }
    return -1;
}
```

**Speedup:** 2-3x for large arrays.

## Conclusion

Cache optimization is about:
- **Spatial locality:** Access nearby memory
- **Temporal locality:** Reuse recently accessed data
- **Avoiding false sharing:** Pad multi-threaded data structures
- **Blocking:** Process data in cache-sized chunks

**Key Takeaways:**
- RAM access is 50x slower than L1 cache
- Cache lines are 64 bytes—use them fully
- Struct of Arrays beats Array of Structs
- Profile with `perf` or VTune

---

*What cache optimizations have you implemented? Share your results!*
