---
layout: post
title: "Writing Python Extensions in C++ for Performance"
date: 2025-08-24
categories: [Python, C++, Performance]
tags: [Python, C++, pybind11, Performance]
---

Python is slow. C++ is fast. Combine them for the best of both worlds.

## When to Use C++ Extensions

- **CPU-bound operations** (image processing, simulations)
- **Performance-critical code** (hot loops)
- **Existing C++ libraries** you want to use from Python

## Tool: pybind11

```bash
pip install pybind11
```

## Simple Example

### C++ Code

```cpp
// example.cpp
#include <pybind11/pybind11.h>

int add(int a, int b) {
    return a + b;
}

PYBIND11_MODULE(example, m) {
    m.def("add", &add, "Add two numbers");
}
```

### Build

```python
# setup.py
from pybind11.setup_helpers import Pybind11Extension, build_ext
from setuptools import setup

ext_modules = [
    Pybind11Extension("example", ["example.cpp"]),
]

setup(
    name="example",
    ext_modules=ext_modules,
    cmdclass={"build_ext": build_ext},
)
```

```bash
pip install .
```

### Use in Python

```python
import example
print(example.add(2, 3))  # 5
```

## Real-World Example: Image Processing

### Python (Slow)

```python
def blur_image(image):
    height, width = image.shape
    result = np.zeros_like(image)
    
    for y in range(1, height-1):
        for x in range(1, width-1):
            result[y,x] = (
                image[y-1,x] + image[y+1,x] +
                image[y,x-1] + image[y,x+1]
            ) / 4
    
    return result

# Time: 2.5 seconds for 1000x1000 image
```

### C++ (Fast)

```cpp
#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>

namespace py = pybind11;

py::array_t<uint8_t> blur_image(py::array_t<uint8_t> input) {
    auto buf = input.request();
    auto result = py::array_t<uint8_t>(buf.size);
    auto res_buf = result.request();
    
    uint8_t *ptr = (uint8_t *) buf.ptr;
    uint8_t *res_ptr = (uint8_t *) res_buf.ptr;
    
    int height = buf.shape[0];
    int width = buf.shape[1];
    
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            int idx = y * width + x;
            res_ptr[idx] = (
                ptr[(y-1)*width + x] + ptr[(y+1)*width + x] +
                ptr[y*width + (x-1)] + ptr[y*width + (x+1)]
            ) / 4;
        }
    }
    
    return result;
}

PYBIND11_MODULE(image_ops, m) {
    m.def("blur_image", &blur_image);
}
```

**Speedup: 50x faster (50ms vs 2.5s)**

## Working with NumPy

```cpp
#include <pybind11/numpy.h>

py::array_t<double> process_array(py::array_t<double> input) {
    py::buffer_info buf = input.request();
    
    double *ptr = (double *) buf.ptr;
    size_t size = buf.size;
    
    for (size_t i = 0; i < size; i++) {
        ptr[i] *= 2;  // Double each element
    }
    
    return input;
}
```

## Classes and Objects

```cpp
class Calculator {
public:
    Calculator(int initial) : value(initial) {}
    
    void add(int x) { value += x; }
    int get() const { return value; }
    
private:
    int value;
};

PYBIND11_MODULE(calc, m) {
    py::class_<Calculator>(m, "Calculator")
        .def(py::init<int>())
        .def("add", &Calculator::add)
        .def("get", &Calculator::get);
}
```

```python
from calc import Calculator

c = Calculator(10)
c.add(5)
print(c.get())  # 15
```

## Benchmarking

```python
import time
import numpy as np

# Python version
start = time.time()
result_py = blur_image_python(image)
print(f"Python: {time.time() - start:.3f}s")

# C++ version
start = time.time()
result_cpp = blur_image_cpp(image)
print(f"C++: {time.time() - start:.3f}s")
```

## Conclusion

C++ extensions give you:
- **50-100x speedups** for CPU-bound code
- **Access to C++ libraries** from Python
- **Best of both worlds** (Python ease + C++ speed)

**When to use:**
- Profiling shows Python is the bottleneck
- You have existing C++ code
- NumPy/Numba aren't fast enough

---

*Have you written Python extensions? What speedups did you achieve?*
