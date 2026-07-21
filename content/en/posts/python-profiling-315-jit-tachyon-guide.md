---
date: 2026-07-21T15:07:11-03:00
draft: true
title: "How to Profile Python Code in 2026: A Guide to Python 3.15's JIT Compiler and Tachyon Profiler"
description: "Complete guide to Python 3.15's new profiling ecosystem: the upgraded JIT compiler with ultra-low overhead tracing, Tachyon statistical sampling profiler, migration from cProfile, and practical code examples. [2026]"
featured_image: ""
categories:
  - article
tags:
  - python
  - profiling
  - performance
  - JIT
  - developer-tools
---

You have a Python script that takes fifty seconds to run. You have no idea why. Every profiling tool you try either slows it to a crawl or gives confusing output. This has been the Python profiling story for years — until Python 3.15.

The 3.15 release (expected October 2026) brings two complementary changes that fundamentally alter how you approach Python performance: an upgraded JIT compiler with an ultra-low-overhead profiling mode, and a brand-new standard library module called `profiling` — home to Tachyon, a statistical sampling profiler that introduces near-zero overhead.

This guide covers both systems, when to use each, and how to migrate from the legacy tools.

## The Problem with Traditional Python Profiling

Before 3.15, Python shipped two tracing profilers: `profile` (pure Python, slow) and `cProfile` (C-based, practical). Both work by instrumenting every function call and return — deterministic tracing. This introduces overhead even for minimal use, and critically, it can disable certain interpreter optimizations introduced by PEP 659 (the earlier "specializing adaptive interpreter").

cProfile also only observes the main thread, making it nearly useless for modern concurrent programs using threading, asyncio, or the free-threaded build (available since 3.13).

Several third-party tools filled the gap: py-spy (statistical sampling), pyperf (microbenchmarking), scalene (CPU+memory profiling). But the standard library offering was stuck in the 2000s.

## Python 3.15's Dual Approach to Profiling

The 3.15 release addresses this from two angles simultaneously — one for the interpreter's own JIT compilation pipeline, and one for the developer who needs to understand where their code spends time.

### 1. The Upgraded JIT Compiler: Ultra-Low Overhead Tracing

Python 3.13 introduced an experimental JIT compiler (copy-and-patch). 3.15 significantly upgrades it with a trace-recording JIT — the interpreter records a stream of instructions during actual program execution, then compiles hot paths.

The key innovation is the profiling mechanism itself. CPython core developer Ken Jin documented the approach in detail: instead of the traditional two-interpreter design (one for execution, one for profiling) or a branch-heavy profiling mode, CPython 3.15 uses **dual dispatch tables**.

At runtime, switching between normal and profiling mode is just swapping a pointer — no branches, no interpreter duplication:

```c
#define ENTER_TRACING() \
    DISPATCH_TABLE_VAR = TRACING_DISPATCH_TABLE;
#define LEAVE_TRACING() \
    DISPATCH_TABLE_VAR = DISPATCH_TABLE;
```

The profiling dispatch table funnels all opcodes into a single recording instruction (fan-in), which does the profiling work and then dispatches back to the normal interpreter for execution (fan-out). The result, measured on Ken Jin's benchmark: the profiling interpreter runs only **4.5× slower** than the bare interpreter — compared to PyPy's meta-tracing overhead of 900-1000×.

This matters even if you never call a profiler explicitly: it enables the JIT to identify and compile hot code paths without the overhead that would defeat the purpose.

### 2. The `profiling` Module and Tachyon (PEP 799)

PEP 799, authored by Pablo Galindo Salgado and László Kiss Kollár, reorganizes Python's profiling tools under a single coherent namespace:

| Module | What it does | Status |
|--------|-------------|--------|
| `profiling.tracing` | Deterministic function-call tracing (relocated from `cProfile`) | New in 3.15 |
| `profiling.sampling` | Statistical sampling profiler — **Tachyon** | New in 3.15 |
| `cProfile` | Old tracing profiler | Alias, deprecated |
| `profile` | Pure-Python tracing profiler | Deprecated, removed in 3.17 |

**Tachyon** is the headline feature. It uses statistical sampling to infer performance characteristics by periodically recording the program's call stack. This means:

- Near-zero runtime overhead (fraction of a percent vs. 2-10× for tracing)
- Works with multiple threads, async functions, and free-threaded builds
- Can attach to already-running processes
- Works with interpreter optimizations enabled (tracing profilers disable some of them)

## Practical Guide: Profiling Your Python Code in 3.15

### Quick Start: Sampling with Tachyon

```python
import profiling.sampling
import time

profiler = profiling.sampling.Profiler()
profiler.start()

# Your code here
def slow_function():
    total = 0
    for i in range(10_000_000):
        total += i ** 2
    return total

result = slow_function()
time.sleep(1)

profiler.stop()
profiler.print_stats()
```

The output shows which functions consumed the most CPU time, sampled at millisecond-scale intervals. No function-call instrumentation required.

### Comparing Tracing vs. Sampling

```python
# Old approach: cProfile tracing
import cProfile
cProfile.run('slow_function()', sort='cumtime')

# New approach: profiling.tracing (semantic equivalent)
import profiling.tracing
profiling.tracing.run('slow_function()', sort='cumtime')

# New approach: Tachyon sampling (recommended for most cases)
import profiling.sampling
prof = profiling.sampling.Profiler()
prof.start()
slow_function()
prof.stop()
prof.print_stats()
```

Use `profiling.tracing` when you need exact call counts — you must know that a function was called exactly 14,327 times. Use `profiling.sampling` when you need to understand where time is going with minimal distortion.

### Attaching to a Running Process

Tachyon can attach to an already-running Python process — invaluable for debugging production issues:

```bash
# Start your script normally
python my_script.py

# In another terminal, attach:
python -m profiling.sampling --attach $(pgrep -f my_script.py) --duration 30
```

This works because statistical sampling doesn't modify the target process's bytecode or execution — it just reads the call stack at intervals.

### Profiling Asyncio and Multi-threaded Code

```python
import asyncio
import profiling.sampling

async def main():
    prof = profiling.sampling.Profiler()
    prof.start()
    
    async def worker(n):
        await asyncio.sleep(0.1)
        return sum(i ** n for i in range(10_000))
    
    tasks = [worker(i) for i in range(1, 5)]
    results = await asyncio.gather(*tasks)
    
    prof.stop()
    prof.print_stats()

asyncio.run(main())
```

Tachyon correctly attributes samples to the right thread or async task — something cProfile cannot do.

## Migration Guide: Moving from cProfile

If you have existing profiling code using `cProfile`, the migration is straightforward:

```python
# Before (Python ≤3.14)
import cProfile
p = cProfile.Profile()
p.enable()
run_code()
p.disable()
p.print_stats(sort='time')

# After (Python 3.15+)
import profiling.tracing
p = profiling.tracing.Profile()
p.enable()
run_code()
p.disable()
p.print_stats(sort='time')
```

For most users, switching from `cProfile` to `profiling.sampling` is the bigger upgrade — but the API is different because the methodology (sampling vs. tracing) is fundamentally different.

## What the JIT Means for Performance

The upgraded JIT with trace recording means that **hot loops and frequently-called functions compile to native machine code at runtime**. The ultra-low-overhead profiling mode makes it feasible to profile more code paths than before, leading to better JIT optimization decisions.

In practice, benchmarks on pyperformance show modest but consistent speedups — typically 5-15% on CPU-bound code, with larger gains on specific patterns (tight loops, numerical operations). The real win is the profiling infrastructure: the JIT can now trace and compile code patterns that were previously too expensive to profile.

## When to Use Which Tool

| Scenario | Tool | Why |
|----------|------|-----|
| Finding slow functions in your code | `profiling.sampling` (Tachyon) | Near-zero overhead, works with optimizations |
| Debugging a production issue | `profiling.sampling --attach` | No code changes needed |
| Counting exact function calls | `profiling.tracing` | Only option for call counts |
| Microbenchmarking a hot path | `timeit` + JIT warmup | Avoid profiling overhead entirely |
| Understanding JIT behavior | `PYTHON_JIT_RESUME_INITIAL_VALUE=1` | Control when JIT tracing triggers |

## What Was Deprecated

- **`profile` module** — pure-Python tracing profiler. Deprecated in 3.15, removal warnings in 3.16, removed in 3.17. Replace with `profiling.sampling` for most use cases, or `profiling.tracing` if you need exact call counts.
- **`cProfile`** — remains as an alias for `profiling.tracing` for backwards compatibility, but new code should import from `profiling.tracing`.

## Summary

Python 3.15's profiling improvements represent the most significant upgrade to performance tooling in the standard library since `cProfile` was added in Python 2.5 (2006). The combination of a trace-recording JIT with a low-overhead profiling mode, plus the new `profiling` module and Tachyon statistical sampler, means Python developers finally have first-class, modern profiling tools built into the language.

If you're maintaining Python code in 2026, the single most impactful change you can make this year is switching from `cProfile` to `profiling.sampling` for your day-to-day performance work. The overhead difference — 4.5× vs. 900× in extreme cases — is the difference between profiling as a chore and profiling as a reflex.

Read also:

- [Python Modules: A Beginner's Guide to Organizing Your Code]({{< relref "posts/python-modules-guide/" >}})
- [SQLite Performance and Best Practices: A Practical Guide for Developers and Homelab Users [2026]]({{< relref "posts/sqlite-performance-best-practices-guide-2026/" >}})
- [Two Weeks with GitButler: Streamlining My Git Workflow]({{< relref "posts/one-week-review-gitbutler/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
