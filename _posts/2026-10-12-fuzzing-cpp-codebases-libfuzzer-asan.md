---
layout: post
title: "Fuzzing C/C++ Codebases: Uncovering Memory Corruption with LibFuzzer and AddressSanitizer"
date: 2026-10-12
categories: [Security, Systems Programming]
tags: [C++, Security, Fuzzing, ASan, Linux, Low-Level]
---

Unit tests verify that code behaves correctly under expected inputs. But in C and C++, the most severe vulnerabilities—buffer overflows, use-after-free conditions, integer wraps, and out-of-bounds reads—hide in unexpected edge cases and malformed input payloads.

**Coverage-guided fuzz testing** automatically generates millions of mutated inputs to find the exact byte sequences that cause undefined behavior and memory crashes.

Here is a practical guide to fuzzing C and C++ projects using LLVM's `libFuzzer` and **AddressSanitizer (ASan)**.

---

## What is Coverage-Guided Fuzzing?

Unlike random black-box fuzzers, `libFuzzer` is an in-process, coverage-guided engine. The compiler instruments every basic block of your code during compilation:

```
[ Input Corpus Generator ]
           |
     (Mutate Bytes)
           v
  [ Target Function ] ---> [ Code Coverage Feedback ]
           |                           |
  (Did it crash?)                      |
     /          \                      v
  [YES]         [NO] ----------> Did it explore NEW branch/code path?
    |                                  |
Crash Report + Reproducer          [Add input to Corpus]
```

When a mutated input executes an unseen `if` condition or reaches a new code branch, the engine saves that input into the **corpus** to serve as the parent for future mutations.

---

## Writing a Fuzz Target

A `libFuzzer` target is a single function with this exact C signature:

```c
#include <stdint.h>
#include <stddef.h>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
    // Pass Data and Size to your API or parser
    return 0; // Return non-zero values are reserved
}
```

Let's test a vulnerable JSON/packet parser:

```cpp
// vulnerable_parser.cpp
#include <stdint.h>
#include <stddef.h>
#include <string.h>

struct PacketHeader {
    uint16_t length;
    uint8_t  type;
};

bool parse_network_packet(const uint8_t* data, size_t size) {
    if (size < sizeof(PacketHeader)) return false;

    PacketHeader header;
    memcpy(&header, data, sizeof(PacketHeader));

    // Vulnerability: No validation that header.length matches remaining bytes!
    // Heap buffer overflow or stack overrun risk:
    char payload_buffer[128];
    if (header.type == 0x01) {
        memcpy(payload_buffer, data + sizeof(PacketHeader), header.length);
        return true;
    }

    return false;
}

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
    parse_network_packet(Data, Size);
    return 0;
}
```

---

## Compiling with Clang and AddressSanitizer

To enable coverage instrumentation and instant detection of memory corruption, compile using `clang++` with `-fsanitize=fuzzer,address`:

```bash
clang++ -O1 -g -fsanitize=fuzzer,address \
  vulnerable_parser.cpp -o packet_fuzzer
```

- `-fsanitize=fuzzer`: Links `libFuzzer` runtime and enables coverage tracking.
- `-fsanitize=address`: Injects AddressSanitizer shadow memory checks to catch buffer overflows immediately, even if they don't produce an immediate `SIGSEGV`.
- `-g`: Generates debugging symbols so stack traces show exact file names and line numbers.

---

## Running the Fuzzer

Create an initial seed corpus directory:

```bash
mkdir corpus
# Provide a valid sample payload as a hint
echo -ne "\x04\x00\x01test" > corpus/valid_seed.bin

# Run the fuzzer using the corpus
./packet_fuzzer corpus/ -max_total_time=60 -jobs=4
```

Within seconds, the fuzzer generates thousands of permutations per second and halts with a crash report:

```text
INFO: Seed: 184920482
INFO: Loaded 1 modules (17 guards): 17 [0x100004000, 0x100004044)
corpus/valid_seed.bin: (4 bytes)
#2      INITED cov: 7 ft: 8 corp: 1/4b exec/s: 0 rss: 32Mb
#241    NEW    cov: 12 ft: 15 corp: 2/12b lim: 8 exec/s: 0 rss: 33Mb
#18492  NEW    cov: 15 ft: 19 corp: 3/140b lim: 140 exec/s: 18492 rss: 36Mb

=================================================================
==18492==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffee14b9880
WRITE of size 240 at 0x7ffee14b9880 thread T0
    #0 0x100001f30 in parse_network_packet vulnerable_parser.cpp:18:9
    #1 0x100002140 in LLVMFuzzerTestOneInput vulnerable_parser.cpp:25:5
    #2 0x100018a10 in fuzzer::Fuzzer::ExecuteCallback()
    ...

artifact_prefix='./'; Test unit written to ./crash-6a3f91048b2d3c
```

`libFuzzer` automatically saves the minimal reproducing payload to `crash-6a3f91048b2d3c`.

---

## Reproducing and Fixing the Defect

To verify the crash, run the binary directly against the crash file:

```bash
./packet_fuzzer crash-6a3f91048b2d3c
```

Now fix the logic in `parse_network_packet`:

```cpp
bool parse_network_packet(const uint8_t* data, size_t size) {
    if (size < sizeof(PacketHeader)) return false;

    PacketHeader header;
    memcpy(&header, data, sizeof(PacketHeader));

    size_t payload_size = size - sizeof(PacketHeader);
    if (header.length > payload_size || header.length >= sizeof(payload_buffer)) {
        return false; // Bounds check prevents overflow
    }

    char payload_buffer[128];
    if (header.type == 0x01) {
        memcpy(payload_buffer, data + sizeof(PacketHeader), header.length);
        return true;
    }

    return false;
}
```

Recompile and re-run against the crash artifact:

```bash
clang++ -O1 -g -fsanitize=fuzzer,address vulnerable_parser.cpp -o packet_fuzzer
./packet_fuzzer crash-6a3f91048b2d3c
# Exits cleanly with status 0!
```

---

## Integrating Fuzzing into CI/CD

To make fuzzing part of standard software engineering practices:
1. **Regression Fuzzing in GitHub Actions**: Run the fuzzer against saved corpus inputs on every pull request for 30 seconds.
2. **ClusterFuzz / OSS-Fuzz**: For large open-source projects, integrate with Google's OSS-Fuzz service for automated 24/7 continuous distributed fuzzing.
3. **Combine Sanitizers**: Combine fuzz testing with UndefinedBehaviorSanitizer (`-fsanitize=undefined`) to catch integer overflows and alignment issues simultaneously.

Writing fuzz targets alongside standard unit tests ensures that your low-level C and C++ code remains resilient against the most adversarial real-world inputs.
