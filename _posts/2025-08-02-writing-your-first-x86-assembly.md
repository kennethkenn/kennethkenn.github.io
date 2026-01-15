---
layout: post
title: "Writing Your First Line of x86 Assembly"
date: 2025-08-02
categories: [Systems, Assembly]
description: "A Hello World tutorial in Assembly that explains registers and system calls."
tags: [assembly, x86, low-level, linux, syscalls]
---

We are going to write a program that prints "Hello, World!" to the Linux console and exits. No standard library. No `printf`. Just raw communication with the Kernel.

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

## Compiling & Running

```bash
nasm -f elf32 hello.asm -o hello.o  # Assemble
ld -m elf_i386 hello.o -o hello     # Link
./hello
```

If you can understand this, you understand how every computer program in history ultimately interacts with the hardware.
