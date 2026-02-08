---
layout: post
title: "From Power On to Main(): How an OS Boots"
date: 2025-07-31
categories: [Systems, OS]
description: "A journey from the moment you press the power button to the first line of C code in your kernel."
tags: [operating-systems, bootloader, c, assembly, kernel]
---

When you press the power button, magic happens. But it's not magic - it's legacy engineering layered on newer standards.

Before your beautiful React app loads, your CPU has to wake up in a mode that resembles a 40-year-old Intel 8086 chip.

## 1. The Firmware Phase (BIOS or UEFI)

The PSU stabilizes power. The CPU wakes up and jumps to a **reset vector**. Firmware code runs on a flash chip.

**BIOS path (legacy):**
1.  Runs POST (Power-On Self-Test).
2.  Scans for a bootable device.
3.  Reads the first 512 bytes (Sector 0) into memory at `0x7C00` and jumps there.

**UEFI path (modern):**
1.  Loads a boot manager from the EFI System Partition (ESP).
2.  Boots a `.efi` executable (like GRUB or systemd-boot).
3.  Passes control with a richer API and memory map.

## 2. The Bootloader

Legacy BIOS gives you only 512 bytes of stage-1 bootloader space. That's why modern bootloaders are multi-stage:

1.  **Stage 1**: Tiny loader in the MBR.
2.  **Stage 2**: Understands filesystems and loads the kernel image.

Bootloaders also pass critical data to the kernel: memory maps, CPU features, and boot arguments.

## 3. CPU Mode Switch

The CPU starts in **Real Mode** (16-bit). It can address only 1MB of RAM. A real OS needs **Protected Mode** (32-bit) or **Long Mode** (64-bit).

```assembly
; Switch to Protected Mode (simplified)
cli                   ; Disable interrupts
lgdt [gdt_descriptor] ; Load Global Descriptor Table
mov eax, cr0
or eax, 1             ; Set the PE (Protection Enable) bit
mov cr0, eax
jmp 08h:clear_pipe    ; Far jump to flush CPU pipeline
```

In 64-bit mode, you also enable paging and load a 64-bit GDT.

## 4. Kernel Entry

The bootloader jumps to the kernel entry point (often a C function like `kmain()`), but the kernel still needs to set up basics:

1.  **Stack**: Allocate a safe stack for C code.
2.  **IDT/GDT**: Interrupt and descriptor tables.
3.  **Paging**: Virtual memory and page tables.
4.  **Device drivers**: Keyboard, screen, disk, timers.

There is no `printf`. There is no `malloc`. You have to build them yourself.

## 5. Userspace Init

Once the kernel is stable, it launches the first user process:

- Linux: `init` or `systemd`
- BSD: `init`

That process starts services, networking, and finally your login manager or shell.

That is the joy of systems programming: an entire world built from nothing but a few bytes of boot code.
