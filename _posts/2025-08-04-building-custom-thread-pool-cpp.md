---
layout: post
title: "Building a Custom Thread Pool in C++ from Scratch"
date: 2025-08-04
categories: [Backend, Systems Programming]
tags: [C++, Concurrency, Thread Pool, Performance]
---

A thread pool is one of the most fundamental concurrency patterns in systems programming. Instead of spawning a new thread for each task (expensive and wasteful), we maintain a pool of worker threads that process tasks from a shared queue. In this post, we'll build a production-quality thread pool from scratch in C++17.

## Why Thread Pools Matter

Creating and destroying threads is expensive. Each thread creation involves:
- Kernel syscalls for thread allocation
- Stack memory allocation (typically 1-8MB per thread)
- Context switching overhead

A thread pool amortizes these costs by reusing threads. This is critical for high-throughput servers, parallel computation engines, and any system that processes many short-lived tasks.

## Architecture Overview

Our thread pool will have three main components:

1. **Task Queue**: A thread-safe queue holding pending work
2. **Worker Threads**: Fixed number of threads that consume tasks
3. **Synchronization Primitives**: Mutexes and condition variables for coordination

```cpp
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <future>
#include <memory>

class ThreadPool {
public:
    explicit ThreadPool(size_t numThreads);
    ~ThreadPool();
    
    template<typename F, typename... Args>
    auto enqueue(F&& f, Args&&... args) 
        -> std::future<typename std::result_of<F(Args...)>::type>;
    
private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    
    std::mutex queueMutex;
    std::condition_variable condition;
    bool stop;
    
    void workerThread();
};
```

## Implementation: Worker Thread Logic

Each worker thread runs an infinite loop, waiting for tasks:

```cpp
void ThreadPool::workerThread() {
    while (true) {
        std::function<void()> task;
        
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            
            // Wait until there's a task or we're stopping
            condition.wait(lock, [this] { 
                return stop || !tasks.empty(); 
            });
            
            if (stop && tasks.empty()) {
                return;  // Exit thread
            }
            
            task = std::move(tasks.front());
            tasks.pop();
        }
        
        task();  // Execute outside the lock
    }
}
```

**Key Design Decisions:**

1. **Scoped Locking**: The mutex is only held while accessing the queue, not during task execution
2. **Condition Variable**: Efficiently puts threads to sleep instead of busy-waiting
3. **Move Semantics**: `std::move` avoids copying the task function object

## Constructor: Spawning Workers

```cpp
ThreadPool::ThreadPool(size_t numThreads) : stop(false) {
    for (size_t i = 0; i < numThreads; ++i) {
        workers.emplace_back([this] { workerThread(); });
    }
}
```

We use `emplace_back` to construct threads in-place, and capture `this` to access member variables.

## Enqueue: Adding Tasks with Futures

The enqueue method is the most complex part. It needs to:
1. Accept any callable with any arguments
2. Return a `std::future` for the result
3. Handle exceptions properly

```cpp
template<typename F, typename... Args>
auto ThreadPool::enqueue(F&& f, Args&&... args) 
    -> std::future<typename std::result_of<F(Args...)>::type> 
{
    using ReturnType = typename std::result_of<F(Args...)>::type;
    
    // Wrap the task in a packaged_task
    auto task = std::make_shared<std::packaged_task<ReturnType()>>(
        std::bind(std::forward<F>(f), std::forward<Args>(args)...)
    );
    
    std::future<ReturnType> result = task->get_future();
    
    {
        std::unique_lock<std::mutex> lock(queueMutex);
        
        if (stop) {
            throw std::runtime_error("enqueue on stopped ThreadPool");
        }
        
        tasks.emplace([task]() { (*task)(); });
    }
    
    condition.notify_one();  // Wake up one worker
    return result;
}
```

**Why `std::packaged_task`?**

`std::packaged_task` connects a callable to a `std::future`, allowing us to retrieve the result asynchronously. We wrap it in `shared_ptr` because the lambda needs to be copyable.

## Destructor: Graceful Shutdown

```cpp
ThreadPool::~ThreadPool() {
    {
        std::unique_lock<std::mutex> lock(queueMutex);
        stop = true;
    }
    
    condition.notify_all();  // Wake all threads
    
    for (std::thread& worker : workers) {
        worker.join();  // Wait for completion
    }
}
```

This ensures all pending tasks complete before destruction.

## Usage Example

```cpp
int main() {
    ThreadPool pool(4);  // 4 worker threads
    
    std::vector<std::future<int>> results;
    
    for (int i = 0; i < 8; ++i) {
        results.emplace_back(
            pool.enqueue([i] {
                std::this_thread::sleep_for(std::chrono::seconds(1));
                return i * i;
            })
        );
    }
    
    for (auto& result : results) {
        std::cout << result.get() << " ";
    }
    
    return 0;
}
```

Output: `0 1 4 9 16 25 36 49` (order may vary due to concurrency)

## Performance Considerations

### Thread Count Selection

Rule of thumb: `std::thread::hardware_concurrency()` for CPU-bound tasks, higher for I/O-bound tasks.

```cpp
ThreadPool pool(std::thread::hardware_concurrency());
```

### False Sharing

If tasks modify adjacent memory locations, cache line ping-ponging can occur. Solution: pad data structures to cache line boundaries (typically 64 bytes).

### Lock Contention

Our implementation uses a single mutex. For extreme throughput, consider:
- **Work Stealing**: Each thread has its own queue, can steal from others
- **Lock-Free Queues**: Using atomic operations instead of mutexes

## Advanced: Work Stealing

```cpp
class WorkStealingThreadPool {
    std::vector<std::deque<Task>> perThreadQueues;
    std::vector<std::mutex> perThreadMutexes;
    
    void workerThread(size_t threadId) {
        while (true) {
            Task task;
            
            // Try own queue first
            if (tryPopLocal(threadId, task)) {
                task();
                continue;
            }
            
            // Try stealing from others
            if (tryStealFrom(threadId, task)) {
                task();
                continue;
            }
            
            // Sleep if no work
            std::this_thread::yield();
        }
    }
};
```

## Common Pitfalls

1. **Deadlock**: Never enqueue a task that waits for another task in the same pool
2. **Exception Safety**: Uncaught exceptions in tasks terminate the program. Always catch in tasks.
3. **Lifetime Issues**: Ensure captured variables outlive the task execution

## Benchmarking

```cpp
// Sequential
auto start = std::chrono::high_resolution_clock::now();
for (int i = 0; i < 1000; ++i) {
    expensiveComputation(i);
}
auto end = std::chrono::high_resolution_clock::now();
// Time: ~10 seconds

// Thread Pool
ThreadPool pool(8);
std::vector<std::future<void>> futures;
for (int i = 0; i < 1000; ++i) {
    futures.push_back(pool.enqueue(expensiveComputation, i));
}
for (auto& f : futures) f.wait();
// Time: ~1.5 seconds (6.6x speedup on 8 cores)
```

## Conclusion

We've built a fully functional thread pool with:
- Type-safe task submission
- Future-based result retrieval
- Graceful shutdown
- Exception handling

This pattern is used in production systems like web servers (Nginx, Apache), databases (PostgreSQL), and game engines (Unreal Engine).

**Next Steps:**
- Implement priority queues for task scheduling
- Add thread pool resizing (dynamic worker count)
- Explore lock-free queue implementations

The complete code is available on [GitHub](https://github.com/kennethkenn/threadpool).

---

*Have you implemented a thread pool before? What challenges did you face? Let me know in the comments!*
