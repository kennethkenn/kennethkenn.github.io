---
layout: post
title: "Linux System Calls: The Bridge Between User and Kernel Space"
date: 2025-08-07
categories: [Systems Programming, Linux]
tags: [Linux, System Calls, Kernel, Low-Level]
---

Every time your program opens a file, allocates memory, or creates a thread, it's making a system call. System calls are the fundamental interface between user programs and the operating system kernel. Understanding them is essential for systems programming, debugging, and performance optimization.

## What is a System Call?

A system call is a programmatic way for a user-space program to request services from the kernel. Think of it as an API provided by the operating system.

**Why do we need them?**

Modern CPUs have protection rings:
- **Ring 0 (Kernel Mode)**: Full hardware access, can execute privileged instructions
- **Ring 3 (User Mode)**: Restricted access, cannot directly access hardware

User programs run in Ring 3 for security. To access hardware (disk, network, memory), they must ask the kernel via system calls.

## The System Call Lifecycle

```
User Program → System Call → Context Switch → Kernel → Hardware → Return
```

1. **User program** calls a wrapper function (e.g., `read()`)
2. **Wrapper** loads syscall number into register and triggers interrupt
3. **CPU switches** to kernel mode
4. **Kernel** executes the syscall handler
5. **CPU switches** back to user mode
6. **Wrapper** returns result to program

## Example: The `write()` System Call

Let's trace what happens when you write to a file:

```c
#include <unistd.h>
#include <fcntl.h>

int main() {
    int fd = open("test.txt", O_WRONLY | O_CREAT, 0644);
    write(fd, "Hello, World!\n", 14);
    close(fd);
    return 0;
}
```

### Step 1: User Space Wrapper

The `write()` function in libc is a thin wrapper:

```c
ssize_t write(int fd, const void *buf, size_t count) {
    ssize_t ret;
    asm volatile (
        "mov $1, %%rax\n"      // Syscall number for write
        "mov %1, %%rdi\n"      // fd
        "mov %2, %%rsi\n"      // buf
        "mov %3, %%rdx\n"      // count
        "syscall\n"            // Trigger interrupt
        "mov %%rax, %0\n"      // Return value
        : "=r" (ret)
        : "r" (fd), "r" (buf), "r" (count)
        : "rax", "rdi", "rsi", "rdx"
    );
    return ret;
}
```

### Step 2: Context Switch

The `syscall` instruction:
1. Saves user-space registers
2. Switches to kernel stack
3. Jumps to kernel's syscall handler

### Step 3: Kernel Handler

The kernel looks up syscall #1 in the syscall table:

```c
// Simplified kernel code
asmlinkage long sys_write(unsigned int fd, const char __user *buf, size_t count) {
    struct file *file;
    ssize_t ret;
    
    file = fget(fd);  // Get file struct from fd
    if (!file)
        return -EBADF;
    
    ret = vfs_write(file, buf, count, &file->f_pos);
    
    fput(file);
    return ret;
}
```

### Step 4: Return to User Space

The kernel:
1. Restores user-space registers
2. Switches back to user stack
3. Returns control to the wrapper function

## Common System Calls

### File Operations

```c
// Open a file
int fd = open("/path/to/file", O_RDONLY);

// Read from file
char buffer[1024];
ssize_t bytes_read = read(fd, buffer, sizeof(buffer));

// Write to file
ssize_t bytes_written = write(fd, "data", 4);

// Close file
close(fd);
```

### Process Management

```c
// Create a new process
pid_t pid = fork();

if (pid == 0) {
    // Child process
    execve("/bin/ls", argv, envp);
} else {
    // Parent process
    int status;
    waitpid(pid, &status, 0);
}
```

### Memory Management

```c
// Allocate memory
void *ptr = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
                 MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

// Free memory
munmap(ptr, 4096);

// Change memory protection
mprotect(ptr, 4096, PROT_READ);  // Make read-only
```

### Networking

```c
// Create socket
int sockfd = socket(AF_INET, SOCK_STREAM, 0);

// Connect to server
struct sockaddr_in addr;
addr.sin_family = AF_INET;
addr.sin_port = htons(80);
inet_pton(AF_INET, "93.184.216.34", &addr.sin_addr);
connect(sockfd, (struct sockaddr*)&addr, sizeof(addr));

// Send data
send(sockfd, "GET / HTTP/1.0\r\n\r\n", 18, 0);

// Receive data
char buffer[4096];
recv(sockfd, buffer, sizeof(buffer), 0);
```

## Tracing System Calls with `strace`

`strace` shows all syscalls made by a program:

```bash
$ strace ./myprogram
```

Output:

```
execve("./myprogram", ["./myprogram"], 0x7ffd...) = 0
brk(NULL)                               = 0x55a1b2c3d000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=123456, ...}) = 0
mmap(NULL, 123456, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f8a...
close(3)                                = 0
...
write(1, "Hello, World!\n", 14)         = 14
exit_group(0)                           = ?
```

**Use cases:**
- Debugging: "Why is my program hanging?"
- Performance: "Which syscalls are slow?"
- Security: "What files is this program accessing?"

## Performance Implications

System calls are **expensive** due to context switching:

```c
// Benchmark: 1 million syscalls
#include <time.h>

int main() {
    struct timespec start, end;
    clock_gettime(CLOCK_MONOTONIC, &start);
    
    for (int i = 0; i < 1000000; i++) {
        getpid();  // Syscall
    }
    
    clock_gettime(CLOCK_MONOTONIC, &end);
    
    long ns = (end.tv_sec - start.tv_sec) * 1000000000 +
              (end.tv_nsec - start.tv_nsec);
    
    printf("Time: %ld ns per syscall\n", ns / 1000000);
    return 0;
}
```

Result: **~100ns per syscall** (varies by CPU)

### Optimization: Batching

```c
// Bad: Many small writes
for (int i = 0; i < 1000; i++) {
    write(fd, &data[i], 1);  // 1000 syscalls
}

// Good: One large write
write(fd, data, 1000);  // 1 syscall
```

### Optimization: Buffering

```c
// Bad: Unbuffered I/O
int fd = open("file.txt", O_WRONLY);
for (int i = 0; i < 1000; i++) {
    write(fd, &data[i], 1);
}

// Good: Buffered I/O (stdio)
FILE *f = fopen("file.txt", "w");
for (int i = 0; i < 1000; i++) {
    fputc(data[i], f);  // Buffered in userspace
}
fclose(f);  // One syscall to flush
```

## Making Raw System Calls

You can bypass libc and call syscalls directly:

```c
#include <sys/syscall.h>
#include <unistd.h>

int main() {
    const char *msg = "Hello from raw syscall!\n";
    
    // write(1, msg, 25)
    syscall(SYS_write, 1, msg, 25);
    
    // exit(0)
    syscall(SYS_exit, 0);
}
```

**When to use:**
- Writing a minimal C runtime
- Avoiding libc dependencies
- Exploiting kernel bugs (security research)

## System Call Numbers

Each syscall has a unique number:

```c
// From /usr/include/asm/unistd_64.h
#define __NR_read     0
#define __NR_write    1
#define __NR_open     2
#define __NR_close    3
#define __NR_stat     4
#define __NR_fstat    5
#define __NR_lstat    6
#define __NR_poll     7
#define __NR_lseek    8
#define __NR_mmap     9
#define __NR_mprotect 10
// ... 300+ more
```

**Architecture-specific:**
- x86-64: Different numbers than x86-32
- ARM: Different numbers than x86

## Error Handling

Syscalls return -1 on error and set `errno`:

```c
int fd = open("nonexistent.txt", O_RDONLY);
if (fd == -1) {
    perror("open");  // Prints: "open: No such file or directory"
    printf("errno = %d\n", errno);  // errno = 2 (ENOENT)
}
```

Common error codes:

```c
#define EPERM        1  // Operation not permitted
#define ENOENT       2  // No such file or directory
#define ESRCH        3  // No such process
#define EINTR        4  // Interrupted system call
#define EIO          5  // I/O error
#define ENXIO        6  // No such device or address
#define E2BIG        7  // Argument list too long
#define ENOEXEC      8  // Exec format error
#define EBADF        9  // Bad file descriptor
#define ECHILD      10  // No child processes
```

## Advanced: vDSO (Virtual Dynamic Shared Object)

Some "syscalls" don't actually enter the kernel:

```c
#include <time.h>

int main() {
    struct timespec ts;
    clock_gettime(CLOCK_REALTIME, &ts);  // No syscall!
}
```

`clock_gettime` is implemented in the vDSO - a shared library mapped by the kernel into every process. It reads kernel data directly from userspace.

**Benefits:**
- No context switch overhead
- Much faster (~20ns vs ~100ns)

**vDSO functions:**
- `gettimeofday()`
- `clock_gettime()`
- `getcpu()`

## Security: Syscall Filtering with seccomp

Restrict which syscalls a process can make:

```c
#include <seccomp.h>

int main() {
    scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL);
    
    // Allow only these syscalls
    seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
    seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(write), 0);
    seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit), 0);
    
    seccomp_load(ctx);
    
    // Now any other syscall will kill the process
    open("file.txt", O_RDONLY);  // KILLED
}
```

**Use cases:**
- Sandboxing untrusted code
- Container security (Docker uses this)
- Browser process isolation

## Conclusion

System calls are the fundamental interface between programs and the OS. Understanding them helps you:

- **Debug** mysterious program behavior
- **Optimize** performance by reducing syscall overhead
- **Secure** applications with syscall filtering
- **Understand** how high-level APIs (file I/O, networking) work

**Key Takeaways:**

- Syscalls involve expensive context switches
- Batch operations to minimize syscall count
- Use `strace` to debug and profile
- vDSO provides fast syscalls without kernel entry

**Next Steps:**

- Read the Linux syscall man pages (`man 2 syscall_name`)
- Explore the kernel source code (`fs/read_write.c`)
- Write a minimal program using only raw syscalls

---

*What's the most interesting syscall you've used? Share in the comments!*
