---
layout: post
title: "Understanding Linux epoll: Event-Driven I/O Under the Hood"
date: 2026-04-14
categories: [Systems Programming, Linux]
tags: [Linux, epoll, Networking, C, Concurrency]
---

High-concurrency servers like Nginx, Redis, and Node.js owe their throughput to a fundamental kernel abstraction: `epoll`. Instead of dedicating one OS thread per connection, `epoll` enables a single thread to monitor hundreds of thousands of sockets efficiently.

Here is an architectural deep dive into how `epoll` works under the hood, how it compares to `select` and `poll`, and how to implement a non-blocking TCP server using edge-triggered mode.

---

## The Historical Problem: Why `select` and `poll` Don't Scale

In standard blocking I/O, a call to `read()` halts thread execution until data arrives on that specific file descriptor (FD). For thousands of concurrent clients, scaling requires thousands of threads, rapidly hitting memory ceilings and causing excessive CPU context-switching overhead.

To handle multiple descriptors, Linux provided `select(2)` and `poll(2)`. Both operate with $O(N)$ algorithmic complexity:

1. **User-to-Kernel Copy**: Every time `select()` is called, the user process must copy the entire array or bitmask of file descriptors into kernel memory.
2. **Full Scan on Return**: Once any descriptor becomes ready, the kernel wakes the process, but the process must iterate through every descriptor to find out which one fired.

When maintaining 50,000 idle persistent connections with only 10 active at any given millisecond, `select` and `poll` waste 99.9% of their CPU cycles re-checking idle sockets.

---

## How `epoll` Solves $O(N)$ with Red-Black Trees and Ready Lists

`epoll` splits connection monitoring into separate setup and wait phases across three system calls:

```c
int epoll_create1(int flags);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

Under the hood, the Linux kernel manages an `epoll` instance with two primary data structures:

```
+--------------------------------------------------------------+
|                        epoll instance                        |
|                                                              |
|   +--------------------------+   +-----------------------+   |
|   |   Red-Black Tree (rbr)   |   |   Ready List (rdlist) |   |
|   |                          |   |                       |   |
|   |  - Stores all registered |   |  - Doubly-linked list |   |
|   |    FDs (epitem nodes)    |   |  - Contains ONLY FDs  |   |
|   |  - O(log N) insert/delete|   |    with pending events|   |
|   +--------------------------+   +-----------------------+   |
|                ^                             ^               |
+----------------|-----------------------------|---------------+
                 |                             |
      epoll_ctl(EPOLL_CTL_ADD)         Hardware Interrupt /
                                       Kernel Socket Callback
```

1. **Red-Black Tree (`rbr`)**: Stores all file descriptors registered via `epoll_ctl`. Adding, modifying, or removing an FD takes $O(\log N)$ time, and the kernel retains state across calls. You never re-transmit your FD list to the kernel.
2. **Ready List (`rdlist`)**: A doubly linked list containing *only* descriptors that currently have active I/O events. When an Ethernet packet arrives, network interface drivers trigger an interrupt; the socket's internal wait-queue callback pushes the corresponding `epitem` directly into the `rdlist`.
3. **`epoll_wait` Return**: The kernel simply transfers the elements of `rdlist` to the user space events buffer. Complexity is proportional to the number of *active* events ($O(k)$), independent of the total registered connections ($N$).

---

## Edge-Triggered (ET) vs. Level-Triggered (LT)

`epoll` offers two event delivery modes:

| Feature | Level-Triggered (Default) | Edge-Triggered (`EPOLLET`) |
| :--- | :--- | :--- |
| **Notification trigger** | Fires repeatedly as long as the buffer has unread data | Fires only on state transition (e.g., from 0 bytes to >0 bytes) |
| **Missed event risk** | Low | High if loop does not drain the socket |
| **Syscall frequency** | Higher (multiple wakeups if reading in chunks) | Minimal (wakes up once per incoming batch) |
| **Socket requirement** | Blocking or non-blocking | **Must** be strictly non-blocking (`O_NONBLOCK`) |

In **Edge-Triggered** mode, you must drain the socket buffer using a `while` loop until `read()` returns `-1` with `errno == EAGAIN` or `EWOULDBLOCK`. Failing to drain the buffer means `epoll_wait` will never notify you again for that socket until new data arrives.

---

## Building a Minimal Non-Blocking TCP Server

Below is a complete, working C implementation of a non-blocking TCP server using edge-triggered `epoll`:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/epoll.h>

#define MAX_EVENTS 64
#define BUFFER_SIZE 1024

static int set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) return -1;
    return fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}

int main(int argc, char *argv[]) {
    int listen_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(listen_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(8080);

    bind(listen_fd, (struct sockaddr *)&addr, sizeof(addr));
    set_nonblocking(listen_fd);
    listen(listen_fd, SOMAXCONN);

    int epoll_fd = epoll_create1(0);
    struct epoll_event ev, events[MAX_EVENTS];

    ev.events = EPOLLIN | EPOLLET; // Edge-triggered
    ev.data.fd = listen_fd;
    epoll_ctl(epoll_fd, EPOLL_CTL_ADD, listen_fd, &ev);

    printf("Server listening on port 8080 with edge-triggered epoll...\n");

    while (1) {
        int nfds = epoll_wait(epoll_fd, events, MAX_EVENTS, -1);
        for (int i = 0; i < nfds; i++) {
            if (events[i].data.fd == listen_fd) {
                // Accept all pending incoming connections
                while (1) {
                    struct sockaddr_in client_addr;
                    socklen_t client_len = sizeof(client_addr);
                    int client_fd = accept(listen_fd, (struct sockaddr *)&client_addr, &client_len);
                    if (client_fd == -1) {
                        if (errno == EAGAIN || errno == EWOULDBLOCK) break;
                        break;
                    }
                    set_nonblocking(client_fd);
                    ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP;
                    ev.data.fd = client_fd;
                    epoll_ctl(epoll_fd, EPOLL_CTL_ADD, client_fd, &ev);
                }
            } else {
                int client_fd = events[i].data.fd;
                char buf[BUFFER_SIZE];
                // Edge-triggered drain loop
                while (1) {
                    ssize_t bytes_read = read(client_fd, buf, sizeof(buf));
                    if (bytes_read == -1) {
                        if (errno == EAGAIN || errno == EWOULDBLOCK) break; // Finished draining
                        close(client_fd);
                        break;
                    } else if (bytes_read == 0) {
                        // Client disconnected
                        close(client_fd);
                        break;
                    }
                    // Echo response back
                    write(client_fd, buf, bytes_read);
                }
            }
        }
    }
    close(listen_fd);
    close(epoll_fd);
    return 0;
}
```

---

## Key Performance Considerations

1. **Avoid Starvation**: In edge-triggered loops, a single noisy connection reading huge streams can starve other descriptors in the ready queue. Cap the maximum bytes processed per event iteration and re-arm with `EPOLL_CTL_MOD` if data remains.
2. **`EPOLLONESHOT` for Multithreading**: When dispatching ready sockets across a thread pool, use `EPOLLONESHOT` so that the socket is disabled in the epoll set after an event triggers. This prevents two threads from concurrently processing data for the same socket.
3. **The Thundering Herd**: When multiple worker processes listen on the same socket, modern Linux kernels (4.5+) provide `EPOLLEXCLUSIVE` to ensure only one process wakes up per incoming connection.

`epoll` forms the backbone of scalable Unix networking. Mastering its data structures and edge-triggered semantics gives you the exact mental model required to build or debug modern high-performance network runtimes.
