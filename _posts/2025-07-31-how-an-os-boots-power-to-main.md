---
layout: post
title: "From Power On to Main(): How an OS Boots"
date: 2025-07-31
categories: [Systems, OS]
description: "A journey from the moment you press the power button to the first line of C code in your kernel."
tags: [operating-systems, bootloader, c, assembly, kernel]
---

When you press the power button, magic happens. But it's not magic—it's legacy engineering from the 1980s.

Before your beautiful React app loads, your CPU has to wake up in a mode that resembles a 40-year-old Intel 8086 chip.

## 1. The BIOS/UEFI Phase

The PSU stabilizes power. The CPU wakes up. It looks at a specific memory address (`0xFFFFFFF0` on modern x86) for the **Reset Vector**. This jumps to the BIOS (or UEFI) code on the motherboard's flash chip.

The BIOS runs **POST** (Power-On Self-Test). RAM okay? Keyboard connected? Then, it looks for a bootable device (HDD, SSD, USB).

It reads the first 512 bytes (Sector 0) of the drive. This is the **MBR** (Master Boot Record). If the last 2 bytes are `0x55AA`, it loads that code into memory at `0x7C00` and jumps there.

## 2. The Bootloader (Legacy Mode)

You now have 512 bytes of code space. That's microscopic. Modern bootloaders (like GRUB) are split into stages.
*   **Stage 1**: Fits in the MBR. Its only job is to load Stage 2.
*   **Stage 2**: Understands file systems (FAT32, EXT4) and loads the Kernel image.

## 3. Entering Protected Mode

Your CPU is still in **Real Mode** (16-bit). It can only address 1MB of RAM. To run a real OS, we need **Protected Mode** (32-bit) or **Long Mode** (64-bit).

```assembly
; Switch to Protected Mode
cli                 ; Disable interrupts
lgdt [gdt_descriptor] ; Load Global Descriptor Table
mov eax, cr0
or eax, 1           ; Set the PE (Protection Enable) bit
mov cr0, eax
jmp 08h:clear_pipe  ; Far jump to flush CPU pipeline
```

## 4. The Kernel

Finally, the bootloader passes control to the kernel's entry point (often a designated C function like `kmain()`).

From here, you are the god of the machine. You have to write drivers for the screen, the keyboard, the disk. There is no `printf`. There is no `malloc`. You have to build them yourself.

That is the joy of Systems Programming.
