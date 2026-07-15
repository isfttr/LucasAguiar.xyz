---
date: 2026-07-15T15:05:00-03:00
draft: true
title: "How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]"
description: "Step-by-step guide to running modern LLMs on old/used enterprise servers with no GPU. Hardware picks, software stack, expected performance, and cost comparison vs cloud APIs."
featured_image: ""
categories:
  - article
tags:
  - llm
  - homelab
  - selfhosted
  - inference
  - linux
---

You have an old server gathering dust in the garage — a retired PowerEdge, a repurposed Proxmox node, maybe an HP workstation from 2013. Somebody told you that running AI locally requires an NVIDIA H100 or at least an RTX 4090. That is not true.

Running modern LLMs on old enterprise iron with no GPU is not only possible — it is practical. This guide covers the hardware you need, the software stack that makes it work, real-world performance numbers per CPU generation, and the cost math that proves a $300 basement box beats a $1,500/month cloud bill for many workloads.

## Why Old Hardware Works for Inference

Large language models are memory-bandwidth-bound during inference, not compute-bound. The bottleneck is moving weights from RAM into the CPU, not the math itself. This is the key insight: a 13-year-old Xeon with eight DDR3 channels can feed data to the CPU at roughly the same rate a modern laptop can.

For example, a dual Xeon E5-2690 v2 system (2013, Ivy Bridge) with DDR3-1600 has a theoretical memory bandwidth of ~102 GB/s across eight channels. A 26B-parameter model quantized to Q8_0 (roughly 26 GB of weights) takes about 0.25 seconds per pass just to move the data into the CPU. That alone explains why you get ~4-5 tokens per second — the CPU is waiting on RAM, not on its own clock speed.

You do not need a GPU. You do not need a modern CPU. You need a board with enough memory channels and enough RAM to hold the model.

## Hardware Requirements

### Minimum Specs

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Dual Xeon E5 v2 (Ivy Bridge) or newer | Dual Xeon E5 v3/v4 (Haswell/Broadwell) |
| Instruction sets | AVX1+ | AVX2, FMA3 (Haswell+, 2014) |
| RAM | 32 GB (for 7B models) | 64-128 GB (for 13B-30B models) |
| RAM type | DDR3-1333+ | DDR3-1600 or DDR4 |
| Memory channels | 4+ | 8+ (dual socket) |
| Storage | 50 GB free | NVMe SSD for swap/hot-caching |
| GPU | None required | None required |

### CPU Generations and What They Mean for LLMs

The single most important CPU feature for local inference is **AVX2**. It was introduced with Intel Haswell (2014, aka "v3" Xeons). Without AVX2, the optimized kernels in llama.cpp and its forks either do not compile or run extremely slowly. AVX2 is the floor that most inference engines assume.

| CPU Generation | Year | AVX2? | 7B model (tok/s) | 13B model (tok/s) | 26B MoE (tok/s) | Notes |
|---------------|------|-------|-------------------|--------------------|---------------------|-------|
| Westmere (X56xx) | 2010 | No | 1-3 | 0.5-1 | N/A | Not worth it |
| Sandy Bridge (E5 v1) | 2011 | No | 3-5 | 1-2 | N/A | Marginal |
| Ivy Bridge (E5 v2) | 2013 | **No** | 5-8 | 3-4 | ~5 (patched) | Needs patched fork |
| Haswell (E5 v3) | 2014 | **Yes** | 10-15 | 6-8 | 8-12 | Sweet spot for budget |
| Broadwell (E5 v4) | 2016 | Yes | 12-18 | 8-10 | 10-15 | Best value today |
| Skylake (Scalable) | 2017+ | Yes | 15-25 | 10-15 | 12-18 | Overkill for inference-only |

The best bang for the buck in 2026: a used Dell PowerEdge R730 or HP ProLiant DL380 Gen9 with dual E5-2690 v4 (Broadwell). These go for $200-400 on eBay, support up to 768 GB DDR4, and have 8+ memory channels.

### RAM Sizing Guide

| Model Size | Quantization | Approx RAM Needed | Typical Use |
|-----------|-------------|-------------------|-------------|
| 7B | Q4_K_M | ~5 GB | Code completion, chat |
| 7B | Q8_0 | ~8 GB | Better quality chat |
| 13B | Q4_K_M | ~9 GB | Reasoning, writing |
| 13B | Q8_0 | ~14 GB | High-quality reasoning |
| 26B MoE | Q8_0 | ~15 GB (active params ~4B) | Complex tasks, analysis |
| 30B | Q4_K_M | ~18 GB | Code generation |
| 70B | Q4_K_M | ~42 GB | Full reasoning |
| 70B | Q8_0 | ~70 GB | Maximum quality |

Note that MoE (mixture-of-experts) models like Gemma 4 26B activate only ~4B parameters per token. This means they fit in far less RAM than their total parameter count suggests, while delivering quality closer to a dense 26B model.

## Software Stack

### Inference Engine: llama.cpp (or Forks)

[llama.cpp](https://github.com/ggerganov/llama.cpp) is the foundation. It runs on any CPU, uses no GPU, and supports all major model formats (GGUF). Key forks:

| Fork | Best for | Notes |
|------|----------|-------|
| llama.cpp (mainline) | General use, stable | Supports most models, AVX2+ |
| [ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp) | MoE models (Gemma 4, DeepSeek) | Speculative decoding, CPU MoE routing |
| ollama | Ease of use, API | Wraps llama.cpp, CLI-friendly |

### Quantization

Always use quantized models (GGUF format). Quantization reduces model size 2-4x with minimal quality loss:

- **Q4_K_M** — Best quality/size tradeoff, ~4.5 bits per weight
- **Q5_K_M** — Higher quality, ~5.5 bits per weight, ~20% more RAM
- **Q8_0** — Near-lossless, ~8 bits per weight, 2x RAM of Q4
- **IQ4_NL** — Good for 70B+ models, slightly lower quality

### Operating System

Any Linux distribution works. Proxmox (Debian-based) with LXC containers is an excellent choice — you can allocate specific CPU cores and RAM to an LLM container without dedicating the whole server.

## Step-by-Step: From eBay Purchase to Running a Model

### Step 1: Get the hardware

Buy a used enterprise server. In 2026, the best options are:

- **Dell PowerEdge R730** — Dual E5-2690 v4 (Broadwell), up to 768 GB DDR4, 8 channels. ~$300-400 on eBay.
- **HP ProLiant DL380 Gen9** — Same generation, similar specs. ~$250-350.
- **Supermicro 6028U-TR4T+** — Dual socket, 16 DIMM slots. ~$200-300.

Skip the GPU. The integrated BMC (iDRAC/iLO) for remote management is more useful.

### Step 2: Install Linux

Install a minimal server distro:

```bash
# Ubuntu Server 24.04 LTS — safe choice, good package support
# Proxmox VE 8.x — if you want to run LLM alongside other services
# Debian 12 — if you want minimal overhead
```

For Proxmox, create an unprivileged LXC container with:

```bash
pct create 100 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
  --cores 16 --memory 65536 --swap 0 \
  --storage local-zfs --net0 name=eth0,bridge=vmbr0,ip=dhcp
```

### Step 3: Install llama.cpp

```bash
# Install build dependencies
apt update && apt install -y build-essential cmake git

# Clone and build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
cmake -B build -DLLAMA_CPU=ON
cmake --build build --config Release -j$(nproc)
```

For pre-AVX2 CPUs, use the ik_llama.cpp fork or add `-DGGML_USE_IQK_MULMAT=OFF` at build time.

### Step 4: Download a model

Pick a quantized GGUF model. Hugging Face hosts thousands:

```bash
# Install huggingface-cli
pip install huggingface-hub

# Download Gemma 4 26B (MoE, ~15 GB in Q8_0)
huggingface-cli download \
  google/gemma-4-26b-it-GGUF \
  gemma-4-26b-it-Q8_0.gguf \
  --local-dir ./models

# Or Mistral 7B (~4.5 GB in Q4_K_M)
huggingface-cli download \
  TheBloke/Mistral-7B-Instruct-v0.3-GGUF \
  mistral-7b-instruct-v0.3.Q4_K_M.gguf \
  --local-dir ./models
```

### Step 5: Run inference

```bash
# Basic chat mode
./build/bin/llama-cli \
  -m ./models/gemma-4-26b-it-Q8_0.gguf \
  -p "Write a short Python script to backup a directory" \
  -n 512 \
  -t 8

# Server mode (provides OpenAI-compatible API)
./build/bin/llama-server \
  -m ./models/mistral-7b-instruct-v0.3.Q4_K_M.gguf \
  --host 0.0.0.0 --port 8080 \
  -t 8 -c 4096
```

Once the server is running, you can point any OpenAI-compatible client (Open WebUI, Continue.dev, custom scripts) at `http://your-server:8080/v1`.

### Step 6: Optimize flags

| Flag | What it does | When to use |
|------|-------------|-------------|
| `-t N` | Thread count | N = physical cores (not hyperthreads) |
| `-c N` | Context size | 2048-8192 for most use cases |
| `--mlock` | Lock model in RAM | Always use for old hardware |
| `--no-mmap` | Load model fully into RAM | If swap interference is detected |
| `-b N` | Batch size for prompt eval | 512-2048 for CPU |

## Expected Performance by Use Case

### Reading-speed inference (5-10 tok/s)

This covers 7B models on Ivy Bridge or 13B-26B models on Haswell/Broadwell. Suitable for:
- Chatbots and question-answering
- Code completion with small-to-medium context
- Document summarization (offline batch)

### Interactive-speed inference (10-20 tok/s)

This covers 7B models on Broadwell or 13B on Haswell+. Suitable for:
- Interactive coding assistants (Continue.dev, Copilot alternatives)
- Real-time chat with longer context
- Light agent workflows

### Batch-processing speed (20+ tok/s)

This covers 7B models on Skylake+ or AVX-512 hardware. Suitable for:
- Large-scale document processing
- Bulk translation or classification
- Automated content pipelines

## Cost Comparison: Basement Box vs. Cloud API

The economics are stark for anyone running frequent inference workloads.

| Scenario | Old Server (total cost) | Cloud API (monthly) | Break-even |
|----------|------------------------|---------------------|------------|
| Light use (100 queries/day, 7B model) | $300 one-time + ~$15/mo electricity | $20-30/mo (GPT-4o-mini) | ~12 months |
| Moderate use (1K queries/day, 13B model) | $400 one-time + ~$25/mo electricity | $150-200/mo (GPT-4o) | ~2-3 months |
| Heavy use (10K queries/day, 26B model) | $500 one-time + ~$40/mo electricity | $1,500-2,500/mo | ~1-2 weeks |
| Batch processing (10M tokens/day) | $500 one-time + ~$50/mo electricity | $5,000+/mo (batch API) | ~3 days |

The electricity cost assumes $0.12/kWh and ~300W idle-to-load average for a dual-socket server. Most homelab servers already run 24/7 for other services — the incremental cost of running inference is negligible.

## Known Limitations

- **No GPU acceleration:** You won't get 100+ tok/s. That's fine — reading speed is all you need for most tasks.
- **Pre-AVX2 hardware needs patched builds:** If your CPU is older than Haswell (2014), you need the ik_llama.cpp fork or compile with `GGML_USE_IQK_MULMAT=OFF`. The [patch for Ivy Bridge AVX1 fallback](https://github.com/ikawrakow/ik_llama.cpp/pull/2138) is a working reference.
- **Memory bandwidth is the bottleneck:** Adding faster CPUs helps less than adding more memory channels. A dual-socket board with 8 channels of DDR3-1600 often outperforms a single-socket board with 4 channels of DDR5 in raw inference throughput.
- **70B models are possible but slow:** On dual Broadwell with 64 GB of DDR4, a Q4_K_M 70B runs at 2-3 tok/s. It works for batch jobs but not for interactive use.

## What to Run on Your Old Server

| Workload | Recommended Model | Hardware Floor | Expected Speed |
|----------|-------------------|---------------|---------------|
| Coding assistant | DeepSeek Coder 6.7B Q4_K_M | Ivy Bridge | 8-12 tok/s |
| General chat | Gemma 4 26B Q8_0 (MoE) | Haswell | 8-12 tok/s |
| Document analysis | Mistral 7B Q8_0 | Sandy Bridge+ | 5-10 tok/s |
| Translation | Gemma 4 9B Q8_0 | Ivy Bridge | 10-15 tok/s |
| Code generation | Qwen 14B Q4_K_M | Haswell | 6-10 tok/s |
| Agent backend | Llama 3.1 8B Q8_0 | Broadwell | 12-18 tok/s |

The same month this guide was written, independent benchmarks showed a [13-year-old HP StoreVirtual running Gemma 4 26B at 5 tok/s](https://www.neomindlabs.com/2026/06/08/running-gemma-4-26b-at-5-tokens-sec-on-a-13-year-old-xeon-with-no-gpu/) with only a $300 hardware investment and a [patch that added AVX1 fallback](https://github.com/ikawrakow/ik_llama.cpp/pull/2138) for pre-Haswell silicon. If a repurposed storage box can do that, your homelab server can too.

Read also:

- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Script for Updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Enabling WhatsApp on Hermes Agent self-hosted: three pitfalls (and how I overcame them)]({{< relref "posts/configuracao-whatsapp-hermes/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
