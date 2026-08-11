---
date: 2026-08-04T15:04:09-03:00
draft: false
title: "How to Fine-Tune an LLM on a Consumer GPU: LoRA and QLoRA Guide [2026]"
description: "Fine-tune 7-8B LLMs on 4-8GB GPUs with LoRA and QLoRA: memory math, tools (PEFT, TRL, Unsloth), step-by-step training, and realistic expectations for consumer hardware."
featured_image: ""
categories:
  - article
tags:
  - llm
  - fine-tuning
  - lora
  - gpu
  - machine-learning
---

Your desktop has an RTX 3060 with 12GB of VRAM. Or maybe an old laptop with a 4GB card. You want to teach an LLM your domain — your codebase's conventions, your support tickets, your writing voice. Every tutorial you find starts with "provision an A100 with 80GB" or "rent a cluster". So you assume fine-tuning is out of reach.

It isn't. In 2026, fine-tuning a 7-8B model on a single consumer GPU is a solved problem, and this week's Hacker News front page proves the appetite: a project that [fine-tunes an 8B model on a 4GB laptop GPU](https://github.com/MakazhanAlpamys/Soup) and another that [runs an 80B Qwen in 4.3GB of RAM on a Mac](https://github.com/leonickson1/Swiftlet) both climbed the rankings. The magic isn't a new breakthrough — it's a technique from 2021 (LoRA) and its 2023 refinement (QLoRA), plus tooling that matured into one-command workflows.

This guide explains why fine-tuning is memory-hungry, how LoRA and QLoRA sidestep the problem, and the exact steps to train a model on the hardware you already own.

## Why full fine-tuning needs 80GB

Fine-tuning updates the weights of a model. The memory bill has four components, and the base weights are only part of it:

| Component | 8B model, FP16 |
|-----------|---------------|
| Weights (frozen or trainable) | ~16 GB |
| Gradients | ~16 GB |
| Optimizer states (AdamW: two moments + master weights) | ~48 GB |
| Activations (per training step) | ~4-16 GB depending on sequence length |

Add it up: a naive full fine-tune of an 8B model needs roughly 80-100GB of memory just for the training state — before you even load a batch of data. That's why cloud GPU rentals became the default. But notice the structure of the problem: the optimizer states dominate, and they exist because you're updating **every** parameter.

## LoRA: train a tiny adapter instead

[LoRA (Low-Rank Adaptation)](https://arxiv.org/abs/2106.09685), from Hu et al. (2021), freezes the original weights and injects small trainable matrices into each layer. Instead of updating 8 billion parameters, you update a few million — typically 0.1-1% of the model.

The math is simple: a weight matrix `W` of shape `d × d` is approximated as `W + BA`, where `B` is `d × r` and `A` is `r × d`, with rank `r` typically 8-64. The adapter is tiny: for a 7B model with rank 16, that's roughly 34M trainable parameters — about 130MB in FP16. Everything else stays frozen.

This collapses the memory bill. With LoRA, the 8B model's footprint becomes:

| Component | Full fine-tune | LoRA |
|-----------|---------------|------|
| Weights | ~16 GB (all trainable) | ~16 GB (frozen) |
| Gradients | ~16 GB | ~0.1 GB (adapter only) |
| Optimizer states | ~48 GB | ~0.4 GB |
| Activations | 4-16 GB | 4-16 GB |

The activations — which scale with batch size and sequence length — become the binding constraint. That's manageable with small batches and gradient checkpointing.

## QLoRA: quantize the frozen base to 4-bit

[QLoRA](https://arxiv.org/abs/2305.14314), from Dettmers et al. (2023), takes the next step: it quantizes the **frozen** base model to 4-bit (NF4 format) and keeps only the LoRA adapters in full precision. The original paper fine-tuned a 65B model on a single 48GB GPU. The memory math for an 8B model drops to roughly:

- 4-bit base weights: ~5 GB
- Adapters + optimizer: ~1 GB
- Activations: a few GB with gradient checkpointing

Total: **~8-10GB comfortably, ~4-6GB with tight settings**. That's a gaming laptop with a 4GB card, not a datacenter.

## The tooling in 2026

The Hugging Face stack is the default: [PEFT](https://github.com/huggingface/peft) provides the LoRA/QLoRA layers, and [TRL](https://github.com/huggingface/trl) provides the training loop (`SFTTrainer` for supervised fine-tuning, plus DPO/ORPO for preference tuning). Three layers of abstraction sit on top:

1. **Raw stack (PEFT + TRL):** maximum control, ~60 lines of Python. Best when you need to understand every knob.
2. **[Unsloth](https://github.com/unslothai/unsloth):** a drop-in replacement that claims roughly 2x faster training with up to 70% less VRAM, thanks to manual attention kernels and smarter memory management. If you're on a 4-6GB card, this is often the difference between training and not training.
3. **[Soup](https://github.com/MakazhanAlpamys/Soup)** (this week's Show HN): a one-command CLI — `soup init --template chat && soup train` — that handles batch size, GPU detection, and quantization automatically. It even runs preference losses (DPO, ORPO, SimPO, KTO) over *layer streaming*: the frozen base model never fully enters VRAM, which is how it fits an 8B fine-tune on 4GB.

If you want the fastest path to a working model, start with Unsloth or Soup. If you want to understand what's happening, start with PEFT + TRL.

## Step by step: QLoRA on a consumer GPU

This recipe assumes a 7-8B base model (Qwen2.5-7B or Llama-3.1-8B) and 8GB of VRAM; adjust the numbers down for 4GB (smaller base, rank 8, shorter sequences).

**1. Pick your base model.** For most domain work, a quantized 7-8B instruct model is the right trade-off. If you need a language the base model barely knows, consider a multilingual model as the starting point.

**2. Prepare your dataset.** You need instruction-style pairs: prompt, response, and optionally a system prompt. A few hundred high-quality examples already move the needle for style/domain adaptation; thousands are better for capability transfer. Format as JSONL with `{"instruction": ..., "output": ...}` and load it with the `datasets` library. Your own data beats any public dataset for domain work — that's the whole point of fine-tuning vs prompting.

**3. Configure the adapter.** Use PEFT's `LoraConfig` with `r=16`, `alpha=32`, `target_modules` covering the attention and MLP projections, and `quantization_config` with `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")`.

**4. Train with the memory-saving flags.** The non-negotiable set:
- `gradient_checkpointing=True` — recompute activations instead of storing them (the single biggest VRAM saver)
- `per_device_train_batch_size=1` — let gradient accumulation (`gradient_accumulation_steps=8-16`) recover effective batch size
- `bf16=True` (or `fp16` on older cards)
- `optim="paged_adamw_8bit"` — QLoRA's paged optimizer offloads optimizer states to CPU RAM when VRAM runs out
- `max_seq_length` as short as your data allows (512-2048) — sequence length multiplies activation memory

**5. Train.** A few hundred steps on a single GPU takes 1-4 hours for a 7B model. Watch the eval loss; overfitting on a small dataset shows up fast.

**6. Merge and export.** After training, merge the LoRA adapter back into the base weights (`model.merge_and_unload()`) and save in GGUF if you plan to run it with llama.cpp.

## What you can actually train (expectations)

| VRAM | What fits | Realistic outcome |
|------|-----------|-------------------|
| 4 GB | 1-3B model, QLoRA, rank 8-16 | Style/domain adaptation on small datasets; several hours per run |
| 6-8 GB | 7-8B model, QLoRA, rank 8-16, short sequences | The sweet spot for consumer cards — most of this guide |
| 12 GB | 7-8B model, QLoRA with longer contexts, or rank 32+ | Comfortable runs, faster iteration |
| 24 GB | 13-14B models, or full fine-tunes of small models | Approaching the point where full fine-tuning becomes feasible |

Time-wise, expect 1-4 hours per run on a mid-range consumer GPU for a 7B QLoRA fine-tune. That's fast enough to iterate, slow enough that you should validate your dataset before launching.

## When NOT to fine-tune

Fine-tuning is a hammer, and not every problem is a nail. If you need your model to know facts from a document collection, [retrieval-augmented generation (RAG)]({{< relref "posts/vibe-coding-pitfalls/" >}}) or a long-context prompt will get you there with zero training. If you need a specific output format, structured prompting and output schemas usually suffice. Fine-tuning earns its cost when:

- The **style and voice** matter — support tone, legal language, your codebase's idioms
- The base model **systematically fails** on your task, and examples fix it
- You need **latency and privacy** — a small tuned model on your own hardware beats an API call

A useful heuristic: if a few dozen well-crafted examples in a prompt don't move the needle, fine-tuning with hundreds or thousands of examples will.

## The bottom line

Fine-tuning on consumer hardware stopped being exotic the moment QLoRA shipped in 2023 — what changed by 2026 is that the tooling made it boring. You no longer need to hand-roll quantization configs or fight SSH into a rented box; one-command tools like Unsloth and Soup sit on top of the same PEFT/TRL foundation and handle the plumbing. The remaining skill is data work, not GPU work.

If you're already running local inference on a low-VRAM card, the same hardware will almost certainly train a small model too. And if you're virtualizing GPUs in your homelab, remember you need [GPU passthrough]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) to expose the card to the training VM.

Read also:

- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [KVM and Virsh on Linux: Complete Guide to Virtual Machines [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
