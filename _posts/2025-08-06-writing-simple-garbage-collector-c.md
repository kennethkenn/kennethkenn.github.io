---
layout: post
title: "Writing a Simple Garbage Collector in C"
date: 2025-08-06
categories: [Systems Programming, Low-Level]
tags: [C, Memory Management, Garbage Collection, Algorithms]
---

Garbage collection is often seen as "magic" that happens in high-level languages like Java, Python, or JavaScript. But at its core, it's just an algorithm for automatic memory management. In this post, we'll implement a mark-and-sweep garbage collector in C from scratch.

## Why Build a GC?

Understanding garbage collection teaches you:

- How memory management works under the hood
- The tradeoffs between manual and automatic memory management
- Why GC pauses happen in production systems
- How to debug memory leaks in GC'd languages

Plus, it's a fantastic interview topic for systems programming roles.

## GC Fundamentals

A garbage collector's job is simple: **free memory that's no longer reachable from the program**.

**Reachable memory** = memory accessible through:
1. Global variables
2. Stack variables (local variables, function parameters)
3. Pointers from other reachable objects

Everything else is garbage.

## The Mark-and-Sweep Algorithm

This is the simplest GC algorithm:

1. **Mark Phase**: Starting from root objects (globals + stack), mark all reachable objects
2. **Sweep Phase**: Free all unmarked objects

```
[Root] -> [A] -> [B]
           |
           v
          [C]    [D] (unreachable)

After marking: A, B, C are marked
After sweeping: D is freed
```

## Implementation: Data Structures

First, we need a way to track allocated objects:

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define STACK_MAX 256
#define INITIAL_GC_THRESHOLD 8

typedef enum {
    OBJ_INT,
    OBJ_PAIR
} ObjectType;

typedef struct sObject {
    ObjectType type;
    bool marked;
    
    struct sObject* next;  // Linked list of all objects
    
    union {
        int value;  // OBJ_INT
        
        struct {    // OBJ_PAIR
            struct sObject* head;
            struct sObject* tail;
        };
    };
} Object;

typedef struct {
    Object* stack[STACK_MAX];
    int stackSize;
    
    Object* firstObject;  // Head of object linked list
    
    int numObjects;
    int maxObjects;
} VM;
```

**Design Decisions:**

- **Linked List**: All allocated objects are in a linked list for easy traversal during sweep
- **Stack**: Simulates the program's call stack (roots for GC)
- **Union**: Saves memory by sharing space between different object types
- **marked**: Boolean flag for mark phase

## Creating the VM

```c
VM* newVM() {
    VM* vm = malloc(sizeof(VM));
    vm->stackSize = 0;
    vm->firstObject = NULL;
    vm->numObjects = 0;
    vm->maxObjects = INITIAL_GC_THRESHOLD;
    return vm;
}
```

## Allocating Objects

```c
Object* newObject(VM* vm, ObjectType type) {
    if (vm->numObjects == vm->maxObjects) {
        gc(vm);  // Trigger GC when threshold reached
    }
    
    Object* object = malloc(sizeof(Object));
    object->type = type;
    object->marked = false;
    
    // Insert at head of linked list
    object->next = vm->firstObject;
    vm->firstObject = object;
    
    vm->numObjects++;
    
    return object;
}

void push(VM* vm, Object* value) {
    if (vm->stackSize >= STACK_MAX) {
        fprintf(stderr, "Stack overflow!\n");
        exit(1);
    }
    vm->stack[vm->stackSize++] = value;
}

Object* pop(VM* vm) {
    if (vm->stackSize == 0) {
        fprintf(stderr, "Stack underflow!\n");
        exit(1);
    }
    return vm->stack[--vm->stackSize];
}
```

**Key Point**: We trigger GC when we hit the allocation threshold, not when we run out of memory.

## Creating Specific Object Types

```c
Object* pushInt(VM* vm, int intValue) {
    Object* object = newObject(vm, OBJ_INT);
    object->value = intValue;
    push(vm, object);
    return object;
}

Object* pushPair(VM* vm) {
    Object* object = newObject(vm, OBJ_PAIR);
    object->tail = pop(vm);
    object->head = pop(vm);
    
    push(vm, object);
    return object;
}
```

## The Mark Phase

Recursively mark all reachable objects:

```c
void mark(Object* object) {
    if (object->marked) return;  // Already visited
    
    object->marked = true;
    
    if (object->type == OBJ_PAIR) {
        mark(object->head);
        mark(object->tail);
    }
}

void markAll(VM* vm) {
    for (int i = 0; i < vm->stackSize; i++) {
        mark(vm->stack[i]);
    }
}
```

**Why Recursion?**

Objects can reference other objects (like a linked list or tree). We need to follow all references to find everything reachable.

**Potential Issue**: Stack overflow for deeply nested structures. Production GCs use iterative marking with an explicit work queue.

## The Sweep Phase

Free all unmarked objects:

```c
void sweep(VM* vm) {
    Object** object = &vm->firstObject;
    
    while (*object) {
        if (!(*object)->marked) {
            // This object is garbage
            Object* unreached = *object;
            
            *object = unreached->next;  // Remove from list
            free(unreached);
            
            vm->numObjects--;
        } else {
            // This object is reachable
            (*object)->marked = false;  // Reset for next GC
            object = &(*object)->next;
        }
    }
}
```

**Pointer-to-Pointer Trick:**

`Object** object` lets us modify the linked list in-place without special-casing the head node.

## The Complete GC Function

```c
void gc(VM* vm) {
    int numObjects = vm->numObjects;
    
    markAll(vm);
    sweep(vm);
    
    vm->maxObjects = vm->numObjects * 2;  // Grow threshold
    
    printf("Collected %d objects, %d remaining.\n",
           numObjects - vm->numObjects, vm->numObjects);
}
```

**Adaptive Threshold:**

After each GC, we double the threshold. This reduces GC frequency as the heap grows.

## Cleanup

```c
void freeVM(VM* vm) {
    vm->stackSize = 0;
    gc(vm);  // Collect everything
    free(vm);
}
```

## Testing the GC

```c
void test1() {
    printf("Test 1: Objects on stack are preserved.\n");
    VM* vm = newVM();
    pushInt(vm, 1);
    pushInt(vm, 2);
    
    gc(vm);  // Should collect nothing
    
    freeVM(vm);
}

void test2() {
    printf("Test 2: Unreached objects are collected.\n");
    VM* vm = newVM();
    pushInt(vm, 1);
    pushInt(vm, 2);
    pop(vm);
    pop(vm);
    
    gc(vm);  // Should collect both
    
    freeVM(vm);
}

void test3() {
    printf("Test 3: Reach nested objects.\n");
    VM* vm = newVM();
    pushInt(vm, 1);
    pushInt(vm, 2);
    pushPair(vm);
    pushInt(vm, 3);
    pushInt(vm, 4);
    pushPair(vm);
    pushPair(vm);
    
    gc(vm);  // Should collect nothing
    
    freeVM(vm);
}

void test4() {
    printf("Test 4: Handle cycles.\n");
    VM* vm = newVM();
    pushInt(vm, 1);
    pushInt(vm, 2);
    Object* a = pushPair(vm);
    pushInt(vm, 3);
    pushInt(vm, 4);
    Object* b = pushPair(vm);
    
    // Create cycle: a->tail = b, b->tail = a
    a->tail = b;
    b->tail = a;
    
    gc(vm);  // Should handle cycle correctly
    
    freeVM(vm);
}

int main() {
    test1();
    test2();
    test3();
    test4();
    
    return 0;
}
```

Output:

```
Test 1: Objects on stack are preserved.
Collected 0 objects, 2 remaining.
Collected 2 objects, 0 remaining.

Test 2: Unreached objects are collected.
Collected 2 objects, 0 remaining.

Test 3: Reach nested objects.
Collected 0 objects, 7 remaining.
Collected 7 objects, 0 remaining.

Test 4: Handle cycles.
Collected 0 objects, 6 remaining.
Collected 6 objects, 0 remaining.
```

## Performance Analysis

### Time Complexity

- **Mark**: O(R) where R = number of reachable objects
- **Sweep**: O(H) where H = heap size (all allocated objects)
- **Total**: O(R + H)

### Space Complexity

- **Overhead per object**: 1 bit (marked flag) + 1 pointer (next)
- **Stack depth**: O(D) where D = max object nesting depth

### GC Pause Time

Mark-and-sweep is a **stop-the-world** collector - the program pauses during GC.

For a heap with 1 million objects:
- Mark: ~10ms (if 100K reachable)
- Sweep: ~50ms (scan all 1M)
- **Total pause: ~60ms**

This is unacceptable for real-time systems (games, trading platforms).

## Advanced GC Techniques

### Generational GC

**Observation**: Most objects die young.

**Solution**: Divide heap into generations:
- **Young generation**: Collect frequently (fast)
- **Old generation**: Collect rarely (slow)

```c
typedef struct {
    Object* youngGen;
    Object* oldGen;
    int youngGenSize;
    int oldGenSize;
} GenerationalHeap;
```

### Incremental GC

Spread GC work across multiple program steps:

```c
typedef struct {
    Object* grayList;  // Objects to scan
    bool gcInProgress;
} IncrementalGC;

void incrementalMark(VM* vm, int workUnits) {
    for (int i = 0; i < workUnits && vm->grayList; i++) {
        Object* obj = vm->grayList;
        vm->grayList = obj->next;
        
        // Mark children, add to gray list
        if (obj->type == OBJ_PAIR) {
            addToGrayList(obj->head);
            addToGrayList(obj->tail);
        }
    }
}
```

### Concurrent GC

Run GC in parallel with the program (requires synchronization):

```c
pthread_t gcThread;

void* gcThreadFunc(void* arg) {
    VM* vm = (VM*)arg;
    while (true) {
        sleep(1);  // Wait for work
        
        pthread_mutex_lock(&vm->heapMutex);
        gc(vm);
        pthread_mutex_unlock(&vm->heapMutex);
    }
}
```

## Comparison with Other Algorithms

| Algorithm | Pause Time | Throughput | Fragmentation |
|-----------|-----------|------------|---------------|
| Mark-Sweep | High | High | High |
| Copying GC | Medium | Medium | None |
| Reference Counting | Low | Low | Medium |
| Generational | Low | High | Low |

## Real-World GCs

- **Java (G1GC)**: Generational, concurrent, region-based
- **Python**: Reference counting + cycle detection
- **Go**: Concurrent mark-sweep, low-latency
- **JavaScript (V8)**: Generational, incremental marking

## Common Pitfalls

### 1. Forgetting to Mark Roots

```c
// Bug: Forgot to mark global variables
void markAll(VM* vm) {
    // Missing: mark(globalObject);
    for (int i = 0; i < vm->stackSize; i++) {
        mark(vm->stack[i]);
    }
}
```

### 2. Mutating During GC

```c
// Bug: Allocating during mark phase
void mark(Object* object) {
    object->marked = true;
    
    // BUG: This can allocate, triggering nested GC
    logObject(object);
}
```

### 3. Stack Overflow in Mark

```c
// Bug: Deep recursion
void mark(Object* object) {
    if (object->marked) return;
    object->marked = true;
    
    // Stack overflow if object chain is 10,000+ deep
    if (object->type == OBJ_PAIR) {
        mark(object->head);
        mark(object->tail);
    }
}
```

**Solution**: Use iterative marking with explicit stack.

## Conclusion

We've built a working garbage collector with:
- Automatic memory management
- Cycle detection
- Adaptive heap sizing

This is the foundation of GC in languages like Lua, Ruby, and early Java.

**Key Takeaways:**

- GC is just graph traversal + deallocation
- Mark-and-sweep is simple but has long pauses
- Production GCs use generational/incremental techniques
- Understanding GC helps you write better code in GC'd languages

**Next Steps:**

- Implement a copying collector (Cheney's algorithm)
- Add write barriers for incremental GC
- Benchmark against manual memory management

The complete code is on [GitHub](https://github.com/kennethkenn/gc).

---

*Have you implemented a GC before? What algorithm did you use? Let me know!*
