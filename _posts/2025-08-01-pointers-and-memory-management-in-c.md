---
layout: post
title: "Understanding Pointers and Memory Management in C"
date: 2025-08-01
categories: [Systems, C]
description: "Demystifying the stack, the heap, and why segmentation faults happen."
tags: [c, pointers, memory-management, programming, manual-memory]
---

Pointers are the barrier to entry for C. They scare away the faint of heart. But a pointer is just a variable that holds a memory address. That's it. Once you learn how addresses, lifetimes, and ownership work, most bugs stop being mysterious.

## The Two Operators You Must Know

1.  **Address-of (`&`)**: Get the memory address of a variable.
2.  **Dereference (`*`)**: Read or write the value at an address.

```c
int x = 42;
int* p = &x;   // p holds the address of x
*p = 99;       // writes to x
```

This is the core mental model: a pointer stores an address, and dereferencing writes to the value stored at that address.

If you remember only one rule: **`*p` means "the thing p points to."**

## Stack vs. Heap

To understand pointers, you must understand memory layout.

### The Stack

Fast, ordered, automatic. Variables created here die when the function returns.

```c
void foo() {
    int a = 10; // 'a' lives on the stack
} // 'a' is destroyed here
```

Stack memory is fast and scoped. You never `free()` stack variables because the function boundary cleans them up.

### The Heap

An endless ocean of memory. You ask for a chunk, you get it. But you must give it back.

```c
void foo() {
    int* ptr = malloc(sizeof(int)); // Request 4 bytes
    *ptr = 10;
    // ...
    free(ptr); // You MUST free it!
}
```

If you forget to `free()`, you leak memory. If you `free()` twice, you corrupt the heap. Both are common sources of crashes.

If you allocate memory, you own it. If you return it from a function, whoever receives it is responsible for `free()`.

## Arrays and Pointer Arithmetic

In C, arrays decay into pointers. This means:

```c
int arr[3] = {1, 2, 3};
int* p = arr;       // same as &arr[0]
int second = *(p+1); // == arr[1]
```

This is why `arr[i]` is effectively `*(arr + i)` in C. Understanding that equivalence makes pointer bugs easier to spot.

Pointer arithmetic is scaled by the type size. `p + 1` moves by `sizeof(*p)` bytes, not 1 byte.

## malloc, calloc, realloc

```c
int* a = malloc(10 * sizeof(int));   // uninitialized
int* b = calloc(10, sizeof(int));    // zeroed
int* c = realloc(a, 20 * sizeof(int)); // resize (may move)
```

`realloc` may return a new pointer, so always assign it back (and handle failure carefully).

Always check for `NULL` on allocation failure, especially in long-running services.

## The "Segfault" (Segmentation Fault)

This happens when you try to touch memory that doesn't belong to you.

1.  **Dereferencing NULL**: `int* p = NULL; *p = 5;` -> CRASH.
2.  **Use After Free**: You `free(ptr)` but then try to read `*ptr`. The OS has likely revoked your access card or given that room to someone else.
3.  **Out-of-bounds access**: Writing past an array corrupts nearby memory and can explode later, far from the bug.

## Common Defensive Patterns

1.  **Initialize pointers**: Uninitialized pointers are random addresses.
2.  **Set to NULL after free**: Avoid accidental reuse.
3.  **Prefer `sizeof(*ptr)`**: Safer than hardcoding sizes.

```c
int* data = malloc(5 * sizeof(*data));
/* use data */
free(data);
data = NULL;
```

Setting to `NULL` does not fix memory leaks, but it does prevent accidental use-after-free.
## Tools That Save Your Life

1.  **Compiler warnings**: `-Wall -Wextra -Wpedantic`
2.  **Sanitizers**: `-fsanitize=address,undefined`
3.  **Valgrind**: Finds leaks and invalid reads

## Why Learn This?

"I use Java/Python, I don't need this."

Yes, you do. When your Java app throws an `OutOfMemoryError`, or your Python script runs slow because of unintentional object copying, understanding what's happening under the hood (on the heap) allows you to fix it. Abstractions are leaky; knowing the basement mechanics makes you a better architect of the skyscraper.
