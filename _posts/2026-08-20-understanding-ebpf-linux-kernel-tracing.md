---
layout: post
title: "Understanding eBPF: Kernel Tracing and Observability Without Kernel Modules"
date: 2026-08-20
categories: [Systems Programming, Linux]
tags: [Linux, eBPF, Kernel, Observability, Systems]
---

Historically, modifying or observing Linux kernel behavior meant writing out-of-tree Kernel Modules (`.ko` files). One null-pointer dereference in a kernel module would instantly trigger a kernel panic and crash the entire machine.

**eBPF** (extended Berkeley Packet Filter) has revolutionized Linux systems engineering by turning the kernel into a safe, sandboxed, programmable runtime.

---

## What is eBPF?

eBPF lets developers run custom bytecode directly inside the Linux kernel in response to kernel events, hardware tracepoints, system calls, and network packet arrivals—all without re-compiling the kernel or rebooting.

```
+-----------------------------------------------------------+
| User Space                                                |
|                                                           |
|  [ eBPF C Code ] ---> Clang/LLVM ---> [ eBPF Bytecode ]   |
|                                             |             |
|                                        bpf() syscall      |
+---------------------------------------------|-------------+
                                              v
+-----------------------------------------------------------+
| Kernel Space                                              |
|                                                           |
|  1. Verifier (Guarantees memory safety & halts loops)     |
|  2. JIT Compiler (Translates bytecode to native x86/ARM)  |
|                                                           |
|       Attaches to:                                        |
|       - kprobes / kretprobes                              |
|       - tracepoints                                       |
|       - XDP (network driver layer)                        |
|       - perf events                                       |
|                                                           |
|  [ eBPF Maps ] <---> Bidirectional data sharing with User |
+-----------------------------------------------------------+
```

---

## The Safety Guarantee: The In-Kernel Verifier

Before any eBPF bytecode executes, the kernel **Verifier** performs rigorous static analysis to guarantee:
1. **No infinite loops**: Every loop must have a statically bounded number of iterations.
2. **No out-of-bounds memory accesses**: Pointers cannot be dereferenced without validating buffer bounds.
3. **Restricted function calls**: The program can only call approved in-kernel helper functions (`bpf_ktime_get_ns`, `bpf_trace_printk`, etc.).
4. **Privilege separation**: Only privileged administrators (`CAP_BPF` / `root`) can load tracing programs.

If the verifier fails to mathematically prove safety, the program is rejected immediately.

---

## Writing Your First eBPF Program with libbpf and BPF CO-RE

Modern eBPF development relies on **CO-RE** (Compile Once – Run Everywhere) and `libbpf`.

Let's write an eBPF program that monitors every execution of the `execve` system call (when any process runs an executable):

### The Kernel Probe (`exec_tracker.bpf.c`)

```c
#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

char LICENSE[] SEC("license") = "Dual BSD/GPL";

// Ring buffer map to stream events to user space
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024); // 256KB
} rb SEC(".maps");

struct event_t {
    u32 pid;
    char comm[16];
    char filename[256];
};

SEC("tp/syscalls/sys_enter_execve")
int handle_execve(struct trace_event_raw_sys_enter *ctx) {
    struct event_t *e;
    
    // Reserve slot in ring buffer
    e = bpf_ring_buffer_reserve(&rb, sizeof(*e), 0);
    if (!e) return 0;

    e->pid = bpf_get_current_pid_tgid() >> 32;
    bpf_get_current_comm(&e->comm, sizeof(e->comm));

    // Read userspace pointer safely into kernel memory
    const char *filename_ptr = (const char *)ctx->args[0];
    bpf_probe_read_user_str(&e->filename, sizeof(e->filename), filename_ptr);

    bpf_ring_buffer_submit(e, 0);
    return 0;
}
```

---

## Consuming Events in User Space (`exec_tracker.c`)

```c
#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <bpf/libbpf.h>
#include "exec_tracker.skel.h"

static int handle_event(void *ctx, void *data, size_t data_sz) {
    const struct event_t *e = data;
    printf("PID %-6d [%-16s] launched: %s\n", e->pid, e->comm, e->filename);
    return 0;
}

int main(int argc, char **argv) {
    struct exec_tracker_bpf *skel = exec_tracker_bpf__open_and_load();
    if (!skel) {
        fprintf(stderr, "Failed to open and load BPF skeleton\n");
        return 1;
    }

    exec_tracker_bpf__attach(skel);

    struct ring_buffer *rb = ring_buffer__new(
        bpf_map__fd(skel->maps.rb), handle_event, NULL, NULL
    );

    printf("Tracing execve() syscalls. Press Ctrl+C to exit...\n");
    while (1) {
        ring_buffer__poll(rb, 100 /* timeout ms */);
    }

    ring_buffer__free(rb);
    exec_tracker_bpf__destroy(skel);
    return 0;
}
```

When compiled and executed with `sudo ./exec_tracker`, you will see live output whenever any process starts anywhere on the machine:

```text
PID 142091 [bash            ] launched: /usr/bin/ls
PID 142095 [git             ] launched: /usr/bin/git-status
PID 142102 [node            ] launched: /usr/local/bin/esbuild
```

---

## eBPF vs. Linux Tracing Alternatives

| Technology | Overhead | Safety | Dynamic Capabilities |
| :--- | :--- | :--- | :--- |
| **`ptrace` / `strace`** | Massive (pauses process on every syscall) | Moderate | Observes syscalls only |
| **Kernel Modules** | Low | **None** (Can crash OS) | Unlimited |
| **`ftrace` / `perf`** | Very Low | High | Predefined trace events only |
| **eBPF** | **Ultra Low** | **Guaranteed** | **Custom filtering, aggregation & logic in-kernel** |

---

## Real-World Impact

1. **High-Performance Networking (Cilium & XDP)**: eBPF can inspect and drop or route packets at the network driver level before the kernel network stack even allocates an `sk_buff`, easily handling 10+ million packets per second for DDoS mitigation.
2. **Zero-Instrumentation Security (Falco)**: Monitor unauthorized file writes, suspicious shell executions, or container escapes in real time without modifying production containers or binaries.
3. **Continuous Profiling (Parca & Pixie)**: Sample stack traces from native C++, Go, and JVM runtimes simultaneously with less than 1% CPU overhead.

eBPF is one of the most transformative technologies in modern Linux systems engineering, merging the security of user space with the speed and reach of the kernel.
