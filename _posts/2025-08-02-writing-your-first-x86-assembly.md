---
layout: post
title: "Writing Your First Line of x86 Assembly"
date: 2025-08-02
categories: [Systems, Assembly]
description: "A Hello World tutorial in Assembly that explains registers and system calls."
tags: [assembly, x86, low-level, linux, syscalls]
---

We are going to write a program that prints "Hello, World!" to the Linux console and exits. No standard library. No `printf`. Just raw communication with the kernel.

This example uses **32-bit Linux syscalls** because they are easy to understand. If you're on a 64-bit system, a 64-bit variant is shown later.

## The Code (NASM syntax)

```assembly
section .data
    msg db 'Hello, World!', 0xA  ; 0xA is the newline character
    len equ $ - msg              ; Calculate length automatically

section .text
    global _start                ; Entry point for the linker

_start:
    ; syscall: write(1, msg, len)
    mov eax, 4      ; System call number for sys_write (Linux 32-bit)
    mov ebx, 1      ; File descriptor 1 is stdout
    mov ecx, msg    ; Pointer to the message string
    mov edx, len    ; Length of message
    int 0x80        ; Interrupt Kernel to execute command

    ; syscall: exit(0)
    mov eax, 1      ; System call number for sys_exit
    mov ebx, 0      ; Return code 0
    int 0x80        ; Interrupt
```

## Explanation

1.  **Registers**: `eax`, `ebx`, `ecx`, `edx`. These are tiny storage buckets directly on the CPU.
2.  **Int 0x80**: This is the magic phone line to the Kernel. You put the "function ID" in `eax`, the arguments in the other registers, and then trigger interrupt 0x80 (128 in decimal). The CPU pauses your program, switches to Kernel Mode, checks `eax`, sees "4" (Print), reads your string, puts pixels on the screen, and returns control to you.
3.  **Sections**: `.data` holds initialized data (your string). `.text` holds the executable instructions.
4.  **File descriptors**: `1` is stdout, `2` is stderr, `0` is stdin.

## Compiling & Running

```bash
nasm -f elf32 hello.asm -o hello.o  # Assemble
ld -m elf_i386 hello.o -o hello     # Link
./hello
```

## 64-bit Linux Version (syscall)

On x86_64, syscalls use a different ABI and the `syscall` instruction:

```assembly
section .data
    msg db 'Hello, World!', 0xA
    len equ $ - msg

section .text
    global _start

_start:
    mov rax, 1      ; sys_write
    mov rdi, 1      ; stdout
    mov rsi, msg    ; buffer
    mov rdx, len    ; length
    syscall

    mov rax, 60     ; sys_exit
    xor rdi, rdi    ; status 0
    syscall
```

Build it with:

```bash
nasm -f elf64 hello.asm -o hello.o
ld hello.o -o hello
```

## Why This Matters

Once you write to stdout and exit without a runtime, you can read any system-level code with less fear. It also explains why C programs need a runtime: they have to set up the process before `main()` ever runs.

If you can understand this, you understand how every computer program in history ultimately interacts with the hardware.
