---
date: 2026-07-07T21:00:00.000Z
draft: true
title: 'SubQ: The First Fully Subquadratic LLM — Cost Comparison with Transformers [2026]'
description: 'SubQ uses sparse subquadratic attention (SSA) to scale linearly with context: 64x fewer FLOPs than Transformers on 1M tokens. Architecture analysis, benchmarks, and costs.'
featured_image: ''
categories:
  - article
tags:
  - ia
  - llm
  - transformers
  - subquadratic
  - atencao
  - arquitetura
  - custos
  - inovacao
translation_source_hash: e9ca73db41586c7a130c94d15346f73c892817de9ece59e1742dc831a6412bdf
---
There is a fundamental problem in every large language model you use today — and it has to do with high school math.

The heart of the Transformer is **attention**: each token must compare itself to every other token. A 1,000-word text requires 1 million comparisons (1,000²). A 1 million token text requires **1 trillion comparisons**. The computational cost grows with the **square of the context** — O(n²). That is why models "break" with very long inputs, why we use RAG, chunking, and agents instead of simply giving the entire document to the model.

**SubQ**, developed by **Subquadratic AI**, is the first LLM to practically break this barrier. Its **Subquadratic Sparse Attention (SSA)** architecture scales linearly — O(n) — with context length. The result: **64.5× fewer FLOPs** and **56× faster** than dense attention on 1 million token contexts. With proven retrieval capability up to **12 million tokens**.

## What is SubQ?

SubQ is a language model built on **Subquadratic Sparse Attention (SSA)**, a complete rethinking of how attention works. Instead of comparing each token to every other (O(n²)), SSA uses a **learned sparse routing mechanism** that selectively identifies which token pairs are relevant — and ignores the rest.

| Feature | Description |
|---|---|
| **Architecture** | Subquadratic Sparse Attention (SSA) |
| **Scaling** | O(n) — linear with context |
| **Training context** | Up to 2M tokens |
| **Inference context** | Up to 12M tokens (98% accuracy) |
| **Company** | Subquadratic AI |
| **Funding** | $29M seed (Javier Villamizar, JAM Fund, etc.) |
| **Team** | Researchers from Meta, Google, Oxford, Cambridge, BYU |
| **Current model** | SubQ 1.1 Small |
| **Availability** | Private beta (API, SubQ Code, SubQ Search) |

The model starts from open frontier weights, replaces dense attention with SSA, and undergoes continued pre-training (CPT) on ~1 trillion tokens of natural long artifacts (books, documents, code repositories).

## Architecture Comparison

The table below shows where SubQ fits in the spectrum of language model architectures:

| Architecture | Scaling | Content Retrieval | Ultra-Long Training |
|---|---|---|---|
| **Dense Attention (FlashAttention-2)** | O(n²) | Full | Infeasible |
| **SubQ (SSA)** | **O(n)** | ✅ Learned sparse routing | ✅ Practical |
| **Fixed Sparse (Sliding Window, etc.)** | O(n) | Position-only | ✅ |
| **DeepSeek NSA/CSA** | O(n²) indexer + O(n) attention | ✅ Learned | Quadratic indexer dominates |
| **State-Space (Mamba)** | O(n) | Compressed (no direct access) | ✅ |
| **Hybrid (Jamba, Qwen3 Next)** | O(n)+O(n²) | Partial | Quadratic component dominates |
| **RAG/Agents (external solution)** | N/A (via search) | Via external retrieval | ✅ (workaround) |

The crucial difference: SubQ is the first to combine **O(n) end-to-end** (including selection and indexing) with **content-dependent retrieval** and **access to arbitrary positions** — something that models like Mamba (which compress context into a fixed-size state) cannot do.

## Costs: SubQ vs. Transformers

### FLOPs per Attention Layer

SSA's computational advantage grows dramatically with context:

| Context | Dense Attention (FLOPs) | SSA (FLOPs) | Reduction | Real Speedup |
|---|---|---|---|---|
| 32K | 0.25 PFLOP | 0.12 PFLOP | 2.1× | ~parity |
| 128K | 3.9 PFLOP | 0.49 PFLOP | **8.0×** | **6.88×** |
| 256K | 15.8 PFLOP | 0.99 PFLOP | **16×** | **13.51×** |
| 512K | 63.0 PFLOP | 2.0 PFLOP | **31.5×** | **27.54×** |
| **1M** | **252 PFLOP** | **3.9 PFLOP** | **64.5×** | **56.2×** |

*Measured on H100 (FLOPs) and NVIDIA B200 (wall clock).*

At 12 million tokens, SSA attends to only **0.13% of all token pairs** — the reduction reaches ~**1,000×** compared to dense attention.

### The Quadratic Wall Problem

To put it in context, here is how the cost of dense attention explodes:

- 128K tokens: **8.6 billion** operations per layer — tolerable
- 1M tokens: **549 billion** operations — expensive
- 2M tokens: **2.2 trillion** operations — prohibitive
- 12M tokens: impractical

> FlashAttention solved the **memory problem** of quadratic attention. SSA solves the **compute problem**.

### Impact on Training

SSA's biggest cost benefit may be in **R&D**, not just inference:

- Subquadratic's team ran **more than 100 long-context experiments** across 6 model generations — something impossible under dense attention
- Training iteration in **less than 1 minute per step** on 1M token contexts
- This allowed them to empirically search for optimal training recipes instead of guessing

### Impact on Inference

- **56× speedup** in wall clock vs. FlashAttention-2 at 1M tokens (single layer)
- Speedup grows with context: 6.88× at 128K → 56.2× at 1M
- "SubQ improves everything at once. Not incrementally, but by an order of magnitude that makes millions of tokens of context a practical reality." — Justin Dangel, CEO of Subquadratic

## Performance Benchmarks

### Long-Context Accuracy

| Benchmark | SubQ 1.1 Small | Notes |
|---|---|---|
| RULER (128K) — average of 13 tasks | **99.12%** | Nearly saturated |
| NIAH @ 1M tokens | **100%** | Perfect retrieval |
| NIAH @ 2M tokens | **100%** | Within training window |
| NIAH @ 6M tokens | **98%** | 6× training size |
| NIAH @ 12M tokens | **98%** | 12× training size |
| MRCR 8 needles @ 1M | **86.2%** | Hardest level |

### Reasoning and Knowledge

| Benchmark | SubQ 1.1 Small | GPT-5.5 | Opus 4.8 | Sonnet 4.6 |
|---|---|---|---|---|
| GPQA Diamond (pass@1) | **85.4** | 93.2 | 92 | 87.5 |
| LiveCodeBench v6 (pass@4) | **89.7** | 92 | 92.2 | 88.9 |
| SWE-Bench Verified | **81.8%** | — | — | — |

SubQ 1.1 Small competes with much larger models on reasoning, while using a fraction of the compute per context token.

## The Transformer Quadratic Wall in Numbers

The problem is not just theoretical. The industry spends billions on **workarounds** — RAG, chunking, pipeline summarization, agents — because the Transformer architecture cannot process what matters at once. Every workaround adds latency, complexity, and information loss.

At 128K tokens, a Transformer already consumes 8.6B operations per attention layer. At 1M tokens, it is 549B. At 2M, 2.2 trillion. The math simply does not add up for applications that require real long context — analyzing entire codebases, reviewing lengthy legal documents, processing long conversation histories.

SubQ demonstrates that this barrier can be overcome with an architectural approach — not with more hardware or prompt engineering.

## Availability

- **SubQ API:** available in private beta via subq.ai
- **SubQ Code:** CLI that loads entire repositories into a single context window
- **SubQ Search:** long-context search tool (Deep Research at chatbot speed)
- **Pricing:** not yet publicly disclosed
- **General release:** expected by the end of 2026

The company raised **$29M in seed** and claims models planned from 2M to 12M tokens for general release.

## Sources

- [Subquadratic AI — Introducing SubQ](https://subq.ai/introducing-subq)
- [SubQ 1.1 Small — Technical Report (PDF)](https://subq.ai/docs/subq-1-1-small-model-card.pdf)
- [How SSA Makes Long Context Practical](https://subq.ai/how-ssa-makes-long-context-practical)
- [Appen — Independent Benchmark Evaluation](https://www.appen.com/whitepapers/subquadratic-preview-model-benchmark-evaluation)
- [The New Stack — "12-million-token context window"](https://thenewstack.io/subquadratic-12-million-context-window/)
- [Hacker News — Discussion 132 points](https://news.ycombinator.com/item?id=48556163)
- [Video: "AI is cooked …" (Pooja Dutt, YouTube)](https://youtube.com/shorts/LTxGxL6an7g)
- [Subquadratic on X/Twitter](https://x.com/subquadratic)
- [NVIDIA nvSubquadratic (GitHub)](https://github.com/NVIDIA-BioNeMo/nvSubquadratic)

## See also

- [Claude Code: Full Review of the AI Programming CLI]({{< relref "posts/claude-code-review-cli-ia/" >}})
- [GitButler: The Branch Manager You Didn't Know You Needed]({{< relref "posts/gitbutler-gerenciador-branchs-review/" >}})

Read also:

- [Inside AI Brains: How Anthropic Decoded Claude's Thought Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [Claude Sonnet 5: Limited Context Window Makes It Useful Only as a Subagent]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Claude Fable 5 lies, forms cartels, and rationalizes its own unethical behavior — what the latest alignment test reveals [2026]]({{< relref "posts/fable-5-vending-bench-alinhamento-ia/" >}})

---

Feel free to contact me to discuss this and other topics at <contact@lucasaguiar.xyz>
