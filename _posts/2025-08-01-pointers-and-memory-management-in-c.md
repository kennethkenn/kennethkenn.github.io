---
layout: post
title: "Understanding Pointers and Memory Management in C"
date: 2025-08-01
categories: [Systems, C]
description: "Demystifying the stack, the heap, and why segmentation faults happen."
tags: [c, pointers, memory-management, programming, manual-memory]
---

Pointers are the barrier to entry for C. They scare away the faint of heart. But a pointer is just a variable that holds a memory address. That's it. 

## Stack vs. Heap

To understand pointers, you must understand memory layout.

### The Stack

Fast, ordered, automatic. Variables created here die when the function returns.

```c
void foo() {
    int a = 10; // 'a' lives on the stack
} // 'a' is destroyed here
```

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

## The "Segfault" (Segmentation Fault)

This happens when you try to touch memory that doesn't belong to you.

1.  **Dereferencing NULL**: `int* p = NULL; *p = 5;` -> CRASH.
2.  **Use After Free**: You `free(ptr)` but then try to read `*ptr`. The OS has likely revoked your access card or given that room to someone else.

## Why Learn This?

"I use Java/Python, I don't need this."

Yes, you do. When your Java app throws an `OutOfMemoryError`, or your Python script runs slow because of unintentional object copying, understanding what's happening under the hood (on the heap) allows you to fix it. Abstractions are leaky; knowing the basement mechanics makes you a better architect of the skyscraper.
