---
date: 2026-08-03T15:06:39-03:00
draft: true
title: "How to Run 70B LLMs on a 4GB GPU: Low-VRAM Inference Guide [2026]"
description: "Run 70B-class LLMs on 4-8GB GPUs: layer streaming, llama.cpp partial offload, AirLLM setup, quantization, and real performance expectations. Step-by-step guide."
featured_image: ""
categories:
  - article
tags:
  - llm
  - gpu
  - inference
  - homelab
  - selfhosted
---

Your GPU has 4GB of VRAM. Every tutorial you find says you need at least 24GB — ideally 80GB — to run anything serious. A 70B model is 140GB of weights in FP16. The math doesn't work, so you assume local AI is out of reach.

That assumption is wrong. In 2026, running 70B-class models on a 4GB card is a solved problem — not with heroic hacks, but with three well-understood techniques: quantization, partial offloading, and layer streaming. This guide explains how they work, when to use each, and what performance you can realistically expect. It's the GPU complement to our CPU-only guide for old servers without any accelerator.

## Why a 70B model needs so much memory

Before talking about tricks, understand the constraint. A model's memory footprint has three components:

| Component | What it is | 70B model, FP16 |
|-----------|-----------|-----------------|
| Weights | The learned parameters | ~140 GB |
| KV cache | Context tokens stored during generation | ~1-2 GB per 8K context |
| Activations | Intermediate tensors per layer | ~1-4 GB |

A 4GB card can't even hold one layer's weights of a dense 70B model in FP16 (a single layer is ~300MB for attention + ~1.6GB for the MLP). So the entire approach has to change: instead of loading the model into the GPU, you stream it through the GPU.

## Technique 1: Quantization — the 4x multiplier

Quantization shrinks weights from 16-bit to 4-bit or 8-bit. It's not a hack; it's the default way serious local inference runs. The same 70B model that needs 140GB in FP16 fits in ~35-40GB at Q4_K_M — still too big for 4GB, but the right starting point.

Key formats in 2026:

- **GGUF (llama.cpp ecosystem):** Q4_K_M, Q5_K_M, Q8_0. Best quality-per-byte for CPU and mixed CPU/GPU.
- **FP8 (AirLLM v3+, newer GPUs):** supported on Ada and Hopper architectures; near-lossless for most workloads.
- **AWQ/GPTQ:** older GPU-centric formats, less relevant now that GGUF dominates.

Rule of thumb: **Q4 is the floor for quality-sensitive work, Q8 the ceiling for CPU-bound runs.** Going lower (Q2/Q3) makes models noticeably dumber.

## Technique 2: Partial offload with llama.cpp and Ollama

If your GPU has *some* VRAM — 6GB, 8GB, 12GB — the pragmatic answer is partial offloading: keep the largest possible number of layers on the GPU, let the CPU handle the rest. Both [llama.cpp](https://github.com/ggerganov/llama.cpp) and [Ollama](https://ollama.com) support this natively.

With llama.cpp:

```bash
# Offload as many layers as fit; llama.cpp spills the rest to CPU
llama-cli -m Qwen3-32B-Q4_K_M.gguf -ngl 20 --context-size 8192
```

With Ollama, set the `num_gpu` parameter in the model's Modelfile:

```dockerfile
FROM qwen3:32b
PARAMETER num_gpu 20
```

The sweet spot: fit **all** layers if you can (pure GPU, ~10x faster), or at least the attention layers, which benefit most from GPU parallelism. If you're running inference inside a VM, remember you need [GPU passthrough]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) to expose the card to the guest.

## Technique 3: Layer streaming with AirLLM — 70B on 4GB

For the extreme case — a genuine 4GB card (GTX 1650, RTX 3050 laptop) — you need layer streaming. This is what [AirLLM](https://github.com/lyogavin/airllm) does: it loads one layer at a time onto the GPU, computes, frees it, and moves to the next. The GPU acts as a fast scratchpad instead of a weight warehouse. No quantization required — a 70B model runs in FP16 on 4GB because only one layer lives in VRAM at any instant.

[AirLLM](https://github.com/lyogavin/airllm) (Apache-2.0, ~27k stars) makes this a one-liner:

```python
from airllm import AutoModel

# 70B class on a 4GB GPU — same API for any supported model
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

# Even bigger, with the exact same call:
# model = AutoModel.from_pretrained("Qwen/Qwen3-235B-A22B")   # ~3GB VRAM
# model = AutoModel.from_pretrained("deepseek-ai/DeepSeek-V3") # 671B, ~12GB VRAM

output = model.generate("Explain why the sky is blue.")
```

AirLLM also added prefetching (overlaps loading and compute, ~10% faster) and a compression mode that claims 3x speedup. For sparse MoE models — DeepSeek-V3 (671B) on ~12GB, Kimi K3 (2.8T) on under 4GB — it streams one expert at a time instead of a whole layer, which is why those enormous models fit on tiny cards.

The tradeoff is speed. Streaming weights from RAM to VRAM is bottlenecked by PCIe bandwidth, not compute. Expect **0.5-3 tokens/sec** for dense 70B on a 4GB card — fine for batch jobs and experiments, painful for chat.

## What performance should you expect?

| Setup | Model | Tokens/sec | Use case |
|-------|-------|-----------|----------|
| RTX 3060 12GB, full offload | 7-8B Q4 | 30-60 | Daily chat, coding |
| RTX 3060 12GB, partial offload | 32B Q4 | 6-12 | Long-form reasoning |
| 4GB GPU, AirLLM streaming | 70B FP16 | 0.5-3 | Batch inference, experiments |
| 4GB GPU, AirLLM streaming | MoE 235B+ | 1-4 | Sparse model testing |
| No GPU, old Xeon (CPU-only) | 13-26B Q8 | 4-15 | Server-class batch workloads |

## When to skip the GPU entirely

Layer streaming is impressive but slow. For many homelab workloads — nightly batch summarization, embeddings, code review of a PR queue — a CPU-only box with lots of RAM and memory bandwidth beats a 4GB GPU at streaming. Memory-bandwidth-bound inference means a dual-Xeon with 8 DDR4 channels feeds weights to the CPU faster than a PCIe 3.0 x16 link feeds a GPU.

The decision matrix:

- **You want interactive chat** → buy/borrow a 12GB+ card, or use a 7-8B model fully offloaded.
- **You have an old GPU lying around** → use llama.cpp partial offload; every layer counts.
- **You must run a 70B+ model and have 4GB** → AirLLM-style streaming, and be patient.
- **You have a server with 64GB+ RAM and no GPU** → go CPU-only.

## The one-line summary

Quantization cuts the model 4x, partial offload spreads it across CPU+GPU, and layer streaming lets a 4GB card run models 40x its size. The era of "you need an H100" is over — the bottleneck in 2026 is knowing which technique fits your hardware, not the hardware itself.

Also read:

- [Vibe Coding Pitfalls: What Actually Goes Wrong]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [KVM and virsh: Linux Virtualization Guide [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
