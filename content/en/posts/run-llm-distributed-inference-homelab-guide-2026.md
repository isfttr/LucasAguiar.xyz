---
date: 2026-10-13T15:02:29-03:00
draft: true
title: "Run LLMs Across Multiple Machines: Distributed Inference Guide for Your Homelab [2026]"
description: "How to run a large language model on several machines at once: weight sharding, llama.cpp RPC, MLX, vLLM and the lessons from Apple's Minions research."
featured_image: ""
categories:
  - article
tags:
  - llm
  - homelab
  - distributed-inference
  - self-hosted
  - machine-learning
---

You have several computers at home, each with a modest GPU or a lot of RAM, and none of them alone can fit the model you want to run. Distributed inference lets you pool those machines into a single virtual GPU so the model's weights are spread across all of them. This guide explains how that works, which tools actually support it today, and why the network — not the GPUs — is usually the real bottleneck.

## Why distribute inference at all

A 70B-parameter model needs roughly 140 GB of weights in FP16. No single consumer GPU fits that. The usual answer is to buy a bigger card or rent cloud GPUs — both expensive. But most homelabs and small teams already own several devices with idle compute: a Mac mini, an old workstation with a 12 GB GPU, a spare gaming PC. Distributed inference treats that collection as one pool.

There are two reasons to do it:

- **Capacity.** Sharding the weights lets a model run that no single device in your fleet could host alone.
- **Throughput.** Parallelism across devices can serve more concurrent requests than one machine, since the work is spread across many GPUs instead of one.

The catch is latency. In single-device inference the model lives in one machine's VRAM; distributed inference moves tensor data over your network for every token. A 1 Gbps link is roughly 100x slower than a PCIe bus, so distributed setups are best for batch or offline workloads, not for interactive chat with strict latency budgets.

## How it works: sharding the weights

All current approaches follow the same principle. The model's weight matrices are split into shards, and each participating device holds one shard. When the model generates a token, every device computes its shard in parallel and the results are combined. This is called **tensor parallelism** when the split is inside each layer, and **pipeline parallelism** when whole layers are distributed across machines.

The software that handles the splitting, the network transfer and the aggregation is what you actually choose. As of 2026 the practical options are:

| Tool | Ecosystem | Best for |
|------|-----------|----------|
| **llama.cpp (GGML RPC server)** | CPU + GPU, wide hardware support | Simple multi-machine serving with GGUF models |
| **MLX (mlx.distributed)** | Apple Silicon only | Apple-only clusters, research and MLX models |
| **vLLM (tensor parallelism + Ray)** | NVIDIA / production GPU | High-throughput serving, tensor parallelism |
| **Exo** | Heterogeneous, p2p | Zero-config pooling of mixed consumer devices |

## llama.cpp RPC: the homelab entry point

For a mixed homelab the simplest starting point is llama.cpp's RPC server, documented in its [multi-GPU guide](https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md). One machine runs the main server and loads the model, while the others run as lightweight RPC backends that contribute their compute over the network. `llama-server` with `--rpc` exposes the local GPU and CPU to the main instance, which then shards weights across whatever backends are available.

The practical setup:

1. Install llama.cpp on every machine.
2. Start `llama-rpc-server` on each worker with `--host 0.0.0.0 --port 50052`.
3. Start the main server with `--rpc worker1:50052 --rpc worker2:50052` and the model file.
4. Load the GGUF model; it is now sharded across all workers.

This works with plain CPU workers too, so you can pool an old Xeon server with a Mac just to add memory for a big context window. It is the closest thing to a drop-in distributed runtime for the GGUF ecosystem.

## MLX and the Apple story

Apple's [MLX framework](https://github.com/ml-explore/mlx) has a [distributed module](https://ml-explore.github.io/mlx/build/html/usage/distributed.html) that shards model weights across multiple Apple Silicon devices automatically. It uses the fast Thunderbolt/USB-C links between Macs, which is why Apple clusters perform far better than most heterogeneous homelab setups.

Apple's Machine Learning Research group took this further in October 2026 with **Minions**, a "dynamic and distributed virtual GPU cloud built on idle Apple Silicon devices" ([research paper](https://machinelearning.apple.com/research/distributed-gpu-cloud)). The system aggregates idle Mac GPUs to run large-scale inference, adding fault tolerance and dynamic resource allocation — a device can join or leave the pool without stopping the workload. The team's conclusion is the core argument of this guide: idle consumer hardware can become a practical distributed inference platform when centralized GPU resources are constrained or too expensive.

## vLLM: production-grade parallelism

If you run NVIDIA GPUs and care about throughput, [vLLM](https://docs.vllm.ai/) is the production choice. It implements tensor parallelism natively and can distribute a single model across multiple GPUs on one host or across several hosts using [Ray](https://docs.ray.io/). This is the stack behind most self-hosted model serving that needs high concurrency, and it pairs well with OpenAI-compatible APIs so existing clients keep working.

## The network is the bottleneck

The single most important practical fact: distributed inference moves a lot of data per token. A 4-bit quantized 70B model is ~35 GB of weights; every generation step exchanges tensor fragments between shards. On a 1 Gbps home network this adds tens of milliseconds of overhead per step, which is why:

- **Use the fastest link you have.** Thunderbolt (10–40 Gbps) beats 10 GbE, which beats 1 GbE.
- **Prefer fewer, bigger machines** over many small ones — fewer hops, less aggregation overhead.
- **Quantize aggressively.** Q4_K_M weights move 4x less data than FP16, which directly cuts network traffic.

If your workload is interactive chat, a single GPU with quantization usually beats a distributed pool on latency. If you are doing batch processing, RAG indexing, or fine-tuning experiments, distributed inference is where it shines.

## When it is worth it

Distributed inference earns its complexity in three situations: a model that physically does not fit on any single machine you own; batch jobs where latency does not matter; and throughput targets that one GPU cannot reach. For everything else — a model that fits in one card, interactive use — buy nothing and keep it simple. As Apple's research shows, though, the ceiling of what "one machine" can run is lower than what your whole fleet can, and idle hardware is compute you are already paying for.

Also read:

- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/how-to-run-llms-on-old-server-hardware-a-practical-homelab-guide-2026/" >}})
- [How to Fine-Tune an LLM on a Consumer GPU: LoRA and QLoRA Guide [2026]]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}})

---

You can reach out to contact me about this and other topics by filling the form below.

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.
