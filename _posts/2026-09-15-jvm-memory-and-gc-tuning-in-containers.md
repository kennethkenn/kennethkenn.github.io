---
layout: post
title: "JVM Memory Footprint and Garbage Collection Tuning in Cloud-Native Containers"
date: 2026-09-15
categories: [Backend, Java]
tags: [Java, JVM, Kubernetes, Docker, Performance]
---

One of the most frustrating experiences in production Java deployments is watching a Kubernetes pod suddenly terminate with `ExitCode 137` (OOMKilled) even when your application logs show that heap usage never exceeded 50%.

Deploying Java microservices in containers requires understanding where memory actually goes beyond the heap, how cgroups limit the JVM, and which Garbage Collector to choose.

---

## The Mystery of ExitCode 137: The Non-Heap Memory Drain

When you configure `-Xmx2g`, you tell the JVM that the **Java Heap** cannot exceed 2 Gigabytes. However, the Linux OS process memory (Resident Set Size - RSS) consists of much more:

$$\text{Total JVM RSS} = \text{Heap} + \text{Metaspace} + \text{Thread Stacks} + \text{Direct ByteBuffers} + \text{Code Cache} + \text{GC Overhead} + \text{Native Memory}$$

```
+---------------------------------------------------------------+
| Container Memory Limit (e.g., 3.0 GB cgroup quota)            |
|                                                               |
|  +---------------------------------------+                    |
|  | Heap (-Xmx2g)                         |                    |
|  | - Young Gen (Eden, S0, S1)            |                    |
|  | - Old Gen                             |                    |
|  +---------------------------------------+                    |
|  +---------------------------------------+                    |
|  | Off-Heap / Native Memory              |                    |
|  | - Metaspace (Class metadata)          |                    |
|  | - Thread Stacks (e.g., 200 threads * 1MB)|                 |
|  | - Direct Memory (Netty buffers)       |                    |
|  | - JIT Code Cache                      |                    |
|  | - GC internal data structures         |                    |
|  +---------------------------------------+                    |
|                                                               |
|  [ Linux Page Cache & Process Overheads ]                      |
+---------------------------------------------------------------+
```

If your heap is 2GB, but you have 300 active threads (300MB), Netty direct byte buffers (500MB), Metaspace (256MB), and JIT code cache (128MB), total process memory reaches 3.2GB. The Linux Kernel OOM-Killer fires and instantly kills the container.

---

## Crucial JVM Flags for Container Environments

In modern Java (Java 17 and 21+), the JVM is container-aware and respects Linux cgroup v1 and v2 limits automatically.

Instead of hardcoding `-Xmx` values in megabytes, use percentage-based flags:

```bash
java \
  -XX:MaxRAMPercentage=70.0 \
  -XX:InitialRAMPercentage=50.0 \
  -XX:+UseContainerSupport \
  -XX:+ExitOnOutOfMemoryError \
  -jar app.jar
```

- **`-XX:MaxRAMPercentage=70.0`**: Allocates 70% of the container's memory limit to the heap, deliberately reserving 30% for thread stacks, Metaspace, and native network buffers.
- **`-XX:+ExitOnOutOfMemoryError`**: Instructs the JVM to terminate immediately if an `OutOfMemoryError` occurs, allowing Kubernetes to restart the unhealthy container promptly rather than leaving it in an unresponsive zombie state.

---

## Choosing the Right Garbage Collector in 2026

Modern Java provides four distinct garbage collectors. Choosing the right collector depends on your latency SLA and memory footprint:

| Collector | Target Workload | Latency SLA | CPU & Memory Overhead |
| :--- | :--- | :--- | :--- |
| **Serial GC** (`-XX:+UseSerialGC`) | Single-core micro-containers (< 1GB RAM) | ~100ms pauses | Minimal (< 15MB GC overhead) |
| **G1 GC** (`-XX:+UseG1GC`) | Default for multi-core, 2GB–16GB heaps | 10ms - 100ms | Balanced |
| **ZGC** (`-XX:+UseZGC -XX:+ZGenerational`) | Ultra-low latency, 4GB–100GB+ heaps | **< 1ms pause times** | ~10–15% higher CPU usage |
| **Shenandoah GC** (`-XX:+UseShenandoahGC`) | Concurrent compaction on medium heaps | < 5ms pause times | Higher memory footprint |

### Recommendation

- **For small containers (1 CPU, < 2GB RAM)**: Use **Serial GC**. Parallel collectors spend more time coordinating GC threads than actually reclaiming objects.
- **For standard microservices (2–4 CPUs, 2GB–8GB RAM)**: Stick with **G1 GC**.
- **For latency-sensitive REST APIs and high-frequency systems**: Enable **Generational ZGC** (default in Java 21+):

```bash
java -XX:+UseZGC -XX:+ZGenerational -XX:MaxRAMPercentage=75.0 -jar app.jar
```

---

## Diagnosing Native Memory Leaks with NMT

When your container memory creeps upward despite flat heap usage, enable **Native Memory Tracking**:

```bash
# Start your application with NMT enabled
java -XX:NativeMemoryTracking=summary -XX:MaxRAMPercentage=70.0 -jar app.jar
```

Then attach to the running process using `jcmd`:

```bash
jcmd <PID> VM.native_memory baseline
# Later, after memory increases:
jcmd <PID> VM.native_memory detail.diff
```

Example output highlighting native memory allocations:

```text
Total: reserved=3240MB (+120MB), committed=2450MB (+95MB)
-                 Java Heap (reserved=1800MB, committed=1800MB)
-                    Thread (reserved=310MB (+25MB), committed=310MB (+25MB))
-                 Metaspace (reserved=260MB, committed=190MB)
-                    Symbol (reserved=35MB, committed=35MB)
-    Native Memory Tracking (reserved=12MB, committed=12MB)
-               DirectBuffer (reserved=450MB (+60MB), committed=450MB (+60MB))
```

In this output, you can immediately identify that direct byte buffers (`DirectBuffer`) grew by 60MB, pointing directly to unreleased network buffers rather than a Java heap leak.

By pairing container-aware heap sizing with the appropriate garbage collector and off-heap tracking, you ensure your Java services stay reliable, responsive, and free from unexpected container terminations.
