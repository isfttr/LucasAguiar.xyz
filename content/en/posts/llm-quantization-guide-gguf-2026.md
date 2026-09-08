---
date: 2026-09-08T15:01:30-03:00
draft: true
title: "LLM Quantization Guide 2026: GGUF Formats, Q4 vs Q8, and How to Choose"
description: "How to choose LLM quantization in 2026: GGUF formats explained (Q8_0, Q4_K_M, Q2, IQ1), quality cliffs, VRAM math, and practical rules for local models."
featured_image: ""
categories:
  - article
tags:
  - llm
  - quantization
  - gguf
  - llama-cpp
  - machine-learning
---

Downloading a model is only half the battle. The other half is picking which file to download: a 27B model can ship as a 55 GB BF16 blob, a 29 GB Q8_0, a 17 GB Q4_K_M, or a 6 GB 1-bit file — and the quality difference between those extremes is the difference between a coding assistant and a model that answers at random chance. Quantization is the compression that makes local LLMs possible, and choosing the wrong format wastes VRAM you don't have or silently cripples the model you paid to run. This guide explains how GGUF quantization works, what the format names mean, and how to pick the right one for your hardware in 2026.

## What quantization actually does

LLMs are trained in 16-bit precision (FP16 or BF16): every weight occupies 2 bytes. A 27B model therefore needs about 54-55 GB just for weights, which is why frontier-class models historically demanded datacenter GPUs. Quantization maps those 16-bit weights into fewer bits per value — 8, 4, 2, even less than 1 — trading a small amount of precision for a large reduction in memory and a speedup in inference, since smaller weights move faster through memory-bound workloads.

The dominant format for local inference is **GGUF**, the container used by llama.cpp and its derivatives (Ollama, LM Studio, Jan, and most self-hosted stacks). The naming convention tells you the story: `Q8_0` is 8-bit, `Q5_K_M` and `Q4_K_M` are 5- and 4-bit "K-quants" (a family of mixed-precision schemes where important tensors keep more bits), and the newer `IQ` formats (like `IQ2_XXS` or `IQ1_S`) are "importance matrix" quants that push below 2 bits by exploiting statistical structure. In 2026 the practical menu is:

| Format | ~Size for 27B | Typical use |
|--------|--------------|-------------|
| BF16/FP16 | ~55 GB | Reference quality, datacenter only |
| Q8_0 | ~29 GB | Near-lossless, when VRAM allows |
| Q5_K_M | ~19 GB | Slightly better than Q4, marginal gains |
| Q4_K_M | ~17 GB | The 2026 sweet spot for quality-per-GB |
| Q2_K / UD-Q2_K_XL | ~10-11 GB | Stretching small GPUs, visible trade-offs |
| IQ1_S / UD-IQ1_S | ~6 GB | Edge cases only — quality collapses |

Sizes above follow the [Qwen3.8 27B GGUF files published by Unsloth on Hugging Face](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF).

## The 2026 evidence: 4-bit holds up, 1-bit collapses

The most useful recent data point comes from [Quesma's benchmark of Qwen3.8 27B quantizations](https://www.quesma.com/blog/qwen38-27b-quantizations-benchmarked/), which hit the Hacker News front page in September 2026. Piotr Migdał ran the full BF16 model and four quantized variants — Q8_0 (29 GB), Q4_K_M (17 GB), UD-Q2_K_XL (10.7 GB), and 1-bit UD-IQ1_S (6.2 GB) — through three benchmarks: GPQA Diamond (graduate-level science), IFBench (instruction following), and Terminal-Bench 2.1 (agentic coding).

The headline result: **Q4_K_M matched the full-precision model on Terminal-Bench 2.1** while taking less than a third of the memory — 17 GB fits on a 24 GB RTX 4090 with room left for roughly 64k tokens of context. Compression degrades gracefully down to 2-bit, where the model still does useful work at 10.7 GB. Then it hits a cliff: at 1 bit the model scored around random chance on GPQA Diamond, and longer reasoning made it *worse* — a quantized model that starts hallucinating early compounds its own errors.

Two practical lessons come out of that benchmark. First, the "my quantized model feels dumber" complaints that circulate on Reddit are often about pushing too far down the bit ladder, not about quantization itself. Second, the choice of reasoning effort setting mattered as much as the choice of format in the tests — a well-configured 4-bit model with adequate reasoning effort beats a badly-configured 8-bit one. Details on replicating the runs are in the [llama.cpp repository](https://github.com/ggml-org/llama.cpp), which also documents the full quantization type list.

## How to choose: rules of thumb for 2026

There is no single "best" quantization — there is a best format for your VRAM budget and your workload. Start with these rules:

1. **Q4_K_M is the default.** For almost every local use case — coding, chat, agentic work — 4-bit K-quant is the quality-per-gigabyte winner. If you are unsure, download Q4_K_M first.
2. **Go Q8_0 only when quality is critical and VRAM is plentiful.** Q8_0 is near-lossless and costs about 70% more disk and memory than Q4_K_M. It shines for tasks where precision matters (structured output, math) on hardware that can afford it.
3. **2-bit is for squeezing onto weak hardware, not for quality.** IQ2/UQ2 variants let a 27B model run in ~10 GB, which is remarkable — but expect visible degradation on reasoning-heavy tasks. Reserve them for machines where Q4_K_M simply does not fit.
4. **Avoid 1-bit for anything that reasons.** The Quesma data is unambiguous: 1-bit quantizations collapse to near-random performance on hard benchmarks. The only defensible use is experiments or extremely constrained edge devices.
5. **Match quantization to model size, not to habit.** A 7-8B model in Q4 is ~4-5 GB and runs on almost anything; a 70B in Q4 is ~40 GB and needs serious hardware. When you cannot fit the model you want at Q4, the honest options are a smaller model at Q4 or Q8, not a bigger model at IQ1.

## Sizing memory: weights are not the whole story

A common mistake is buying VRAM for the weight file alone and ignoring the KV cache. The KV cache holds the attention keys and values for your context window and scales with context length, not model size. In the Quesma runs, an FP16 KV cache weighed roughly 2.3 GB per 32k tokens — over a long 128k context that is ~9 GB on top of the weights. Budget for both: a 27B Q4_K_M (17 GB) plus a 64k-token KV cache needs roughly 22 GB of free VRAM, which is why 24 GB cards are the practical floor for that configuration.

Two more factors matter. First, most runtimes in 2026 support quantized KV caches (Q8 or Q4) that cut context memory sharply with minimal quality impact on long documents — enable them on memory-tight setups. Second, llama.cpp improves constantly; the Quesma author noted that only builds from mid-August 2026 handled Qwen3.8 correctly. If a model behaves oddly, update your runtime before blaming the quant.

## The workflow

Concretely, picking a quantization in 2026 looks like this: find your model on Hugging Face (the [Unsloth GGUF repos](https://huggingface.co/unsloth) are the de facto standard for well-tuned quant files), read the file list, choose the largest format that fits your VRAM after reserving KV cache — usually Q4_K_M — download the `.gguf` file, and point your runtime at it. Ollama and LM Studio abstract the filename away with tags like `q4_K_M`, while raw llama.cpp takes the file path directly. If you already run models locally, the same quantization logic applies whether you are [running 70B models on a 4 GB GPU]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}}), [serving inference from an old homelab server]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}), or [fine-tuning with QLoRA on a consumer card]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}}) — QLoRA is quantization applied to training rather than inference.

## The bottom line

Quantization in 2026 is a solved problem with a boring answer: use Q4_K_M unless you have a specific reason not to. The bit ladder collapses at the bottom — 4-bit holds up on hard benchmarks, 2-bit is a compromise, 1-bit is a trap — and the recent Qwen3.8 27B results are the clearest public evidence yet that a 17 GB file can match a 55 GB model on real coding tasks. Sizing your VRAM budget with both weights and KV cache in mind, and keeping your llama.cpp build current, matters more than agonizing over the format table.

Read also:

- [How to Run 70B LLMs on a 4GB GPU: Low-VRAM Inference Guide [2026]]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})
- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [How to Fine-Tune an LLM on a Consumer GPU: LoRA and QLoRA Guide [2026]]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
