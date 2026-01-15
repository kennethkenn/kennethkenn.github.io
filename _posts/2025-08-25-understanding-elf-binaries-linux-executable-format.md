---
layout: post
title: "Understanding ELF Binaries: Linux Executable Format"
date: 2025-08-25
categories: [Systems Programming, Linux]
tags: [ELF, Binaries, Linux, Low-Level]
---

Every time you run a program on Linux, you're executing an ELF binary. Here's what's actually inside.

## What is ELF?

**ELF** = Executable and Linkable Format

It's the standard binary format for:
- Executables (`./myprogram`)
- Shared libraries (`.so` files)
- Object files (`.o` files)
- Core dumps

## Inspecting ELF Files

```bash
# File type
file /bin/ls
# Output: ELF 64-bit LSB executable, x86-64

# Headers
readelf -h /bin/ls

# Sections
readelf -S /bin/ls

# Symbols
readelf -s /bin/ls

# Disassemble
objdump -d /bin/ls
```

## ELF Structure

```
+-------------------+
| ELF Header        |  Magic number, architecture, entry point
+-------------------+
| Program Headers   |  How to load into memory
+-------------------+
| .text             |  Executable code
+-------------------+
| .data             |  Initialized global variables
+-------------------+
| .bss              |  Uninitialized global variables
+-------------------+
| .rodata           |  Read-only data (string literals)
+-------------------+
| .symtab           |  Symbol table
+-------------------+
| .strtab           |  String table
+-------------------+
| Section Headers   |  Metadata about sections
+-------------------+
```

## The ELF Header

```bash
$ readelf -h /bin/ls

ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x5850
```

**Key Fields:**
- **Magic:** `0x7F 'E' 'L' 'F'` - Identifies ELF files
- **Class:** 32-bit or 64-bit
- **Entry point:** Where execution starts

## Sections Explained

### .text (Code)

```bash
$ objdump -d -j .text myprogram

0000000000001149 <main>:
    1149:   55                      push   %rbp
    114a:   48 89 e5                mov    %rsp,%rbp
    114d:   48 8d 3d b0 0e 00 00    lea    0xeb0(%rip),%rdi
    1154:   e8 f7 fe ff ff          callq  1050 <puts@plt>
```

### .data (Initialized Globals)

```c
int global_var = 42;  // Goes in .data
```

### .bss (Uninitialized Globals)

```c
int uninitialized[1000];  // Goes in .bss (no disk space used!)
```

### .rodata (Constants)

```c
const char* message = "Hello";  // String goes in .rodata
```

## Symbol Table

```bash
$ readelf -s myprogram

Symbol table '.symtab' contains 65 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
    50: 0000000000001149    27 FUNC    GLOBAL DEFAULT   14 main
    51: 0000000000004010     4 OBJECT  GLOBAL DEFAULT   24 global_var
```

**Symbol Types:**
- **FUNC:** Function
- **OBJECT:** Variable
- **NOTYPE:** Unknown

**Binding:**
- **GLOBAL:** Visible to other files
- **LOCAL:** Only visible in this file

## Dynamic Linking

```bash
# List shared library dependencies
ldd /bin/ls

# Output:
# linux-vdso.so.1 => (0x00007fff...)
# libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6
```

### How it Works

1. **Compile time:** Linker records needed libraries
2. **Load time:** Dynamic linker (`ld.so`) loads libraries
3. **Runtime:** Functions resolved via PLT/GOT

### PLT (Procedure Linkage Table)

```asm
<puts@plt>:
    jmp    *0x2fc2(%rip)    # Jump to GOT entry
    push   $0x0             # Push relocation index
    jmp    <_init>          # Call dynamic linker
```

### GOT (Global Offset Table)

Initially points to PLT, updated on first call (lazy binding).

## Creating an ELF Binary

```c
// hello.c
#include <stdio.h>

int main() {
    printf("Hello, ELF!\n");
    return 0;
}
```

```bash
# Compile to object file
gcc -c hello.c -o hello.o

# Link to executable
gcc hello.o -o hello

# Or in one step
gcc hello.c -o hello
```

## Stripping Binaries

```bash
# Original size
ls -lh myprogram
# 14K

# Strip symbols
strip myprogram

# New size
ls -lh myprogram
# 6K (57% smaller!)
```

**Trade-off:** Smaller binary, but harder to debug.

## Security Features

### ASLR (Address Space Layout Randomization)

```bash
# Check if PIE (Position Independent Executable)
readelf -h myprogram | grep Type
# Type: DYN (Shared object file)  # PIE enabled

# Disable ASLR (for debugging)
echo 0 | sudo tee /proc/sys/kernel/randomize_va_space
```

### Stack Canaries

```bash
# Compile with stack protection
gcc -fstack-protector-all hello.c -o hello
```

### NX (No-Execute)

```bash
# Check if stack is executable
readelf -l myprogram | grep GNU_STACK
# GNU_STACK      0x000000 0x000000 RW   # Not executable (good!)
```

## Patching Binaries

```bash
# Hex editor
hexedit myprogram

# Or programmatically
echo -n "Patched!" | dd of=myprogram bs=1 seek=0x1234 conv=notrunc
```

**Use cases:**
- Fix bugs without recompiling
- Crack software (educational purposes only!)
- Modify game behavior

## Conclusion

ELF binaries are:
- Structured format for executables
- Support dynamic linking
- Include security features (ASLR, NX, stack canaries)
- Can be inspected and modified

**Key Tools:**
- `readelf` - Inspect ELF structure
- `objdump` - Disassemble code
- `ldd` - List dependencies
- `strip` - Remove symbols

---

*Have you analyzed ELF binaries? What did you discover?*
