---
date: 2026-07-09T15:07:22-03:00
draft: true
title: "GPT-5.6 [2026]: Sol, Terra, Luna — OpenAI's Three-Tier Frontier Model Family"
description: "OpenAI launches GPT-5.6 with Sol, Terra, and Luna variants — the first frontier model to beat ARC-AGI-3. Performance, benchmarks, and what this means."
featured_image: ""
categories:
  - article
tags:
  - ai
  - openai
  - llm
  - gpt
  - benchmarks
---

OpenAI just dropped GPT-5.6 — and it's not one model, but three. On July 9, 2026, the company announced a new family of reasoning models under the GPT-5.6 umbrella: **Sol** (flagship), **Terra** (mid-tier), and **Luna** (efficient). Each comes in five reasoning levels — Low, Medium, High, Extra High, and Max — letting developers dial up or down compute spend for each task.

The headline number: Sol at Max reasoning level scores **7.8% on ARC-AGI-3**, making it the first verified frontier model to ever beat an ARC-AGI-3 game. That might sound modest, but ARC-AGI-3 is designed to be the hardest general intelligence benchmark — most models score near zero.

## The Three Variants

GPT-5.6 splits into three distinct tiers, each with its own price-performance target:

**Sol** — The flagship. At Max reasoning, it scores 96.5% on ARC-AGI-1, 92.5% on ARC-AGI-2, and 7.8% on ARC-AGI-3. According to HN commenters and the ARC Prize page, Sol is the first frontier model to register meaningful progress on ARC-AGI-3 puzzles. Interesting detail from the HN discussion: Sol autonomously post-trained Luna, meaning OpenAI's own model was used to improve its smaller sibling.

**Terra** — The mid-tier, and arguably the most interesting for cost-conscious developers. Early reports from HN suggest Terra at Max reasoning is competitive with Claude Fable on DeepSWE, while being cheaper than Opus API pricing. Terra at Max hits 96.5% on ARC-AGI-1 and 83.9% on ARC-AGI-2.

**Luna** — The smallest variant, designed for efficiency. Luna at Max scores 88% on ARC-AGI-1 and 59.5% on ARC-AGI-2. For fast, cheap inference where you don't need frontier reasoning, this fits.

## What Makes GPT-5.6 Different

Beyond the tier structure, GPT-5.6 introduces several capability jumps:

**Better intent understanding.** OpenAI's developer guide notes that GPT-5.6 "can better infer the user's underlying goal and intended level of work without you specifying every step." Constraints and approval boundaries still need to be stated, but the model fills in more implicit context.

**Design judgment.** One of the more surprising claims: "GPT-5.6 delivers a step change in design judgment. With only high-level direction, it creates tasteful, ergonomic, and functional interfaces." This has been a traditional gap between OpenAI and Anthropic models — Claude has historically been better at UI/design work.

**Autonomous self-improvement.** Sol was used to post-train Luna, which hints at a self-improvement pipeline where the largest model helps train smaller, cheaper variants. This is a pattern we've seen before (e.g., DeepSeek-R1), but having it inside OpenAI's stack is notable.

**Improved computer use.** The model can inspect and refine rendered results — not just generate code, but look at the visual output, catch issues, and apply fixes autonomously.

## Benchmark Comparison Table

| Variant | Level | ARC-AGI-1 | ARC-AGI-2 | ARC-AGI-3 |
|---------|-------|-----------|-----------|-----------|
| **Sol** | Max | 96.5% | 92.5% | **7.8%** |
| Sol | Extra High | 97.5% | 90.0% | 7.0% |
| Sol | High | 97.0% | 85.4% | 2.1% |
| Sol | Medium | 92.5% | 67.1% | 1.1% |
| Sol | Low | 74.5% | 42.5% | 0.3% |
| **Terra** | Max | 96.5% | 83.9% | 0.8% |
| Terra | Extra High | 94.0% | 74.2% | 0.7% |
| **Luna** | Max | 88.0% | 59.5% | 0.2% |
| Luna | Medium | 56.5% | 7.4% | 0.2% |

## Context: July 2026 Is a Stacked Month

GPT-5.6 arrives at a moment of extreme velocity in AI model releases:

- **Claude Fable 5** was re-deployed globally on July 1 after safety upgrades.
- **Claude Sonnet 5** launched June 30 with "frontier performance across coding, agents, and professional work."
- **Meta's Muse Spark 1.1** launched the very same day — July 9 — with a 1M token context window, multi-agent orchestration, and computer-use capabilities.
- **Anthropic's "Inviting hard questions"** campaign launched today as well, signaling the company is leaning into public transparency.

The competitive pressure is visible. Each release is trying to one-up the others on benchmarks, agentic capability, and pricing.

## Availability

GPT-5.6 is available through the OpenAI API (the safety system card is published at `deploymentsafety.openai.com/gpt-5-6/gpt-5-6.pdf`). The "ChatGPT Work" announcement — a new tier of ChatGPT for ambitious professional use — also dropped alongside GPT-5.6, suggesting the model powers the high-end ChatGPT experience.

Pricing details remain behind Cloudflare, but the tier structure (Sol / Terra / Luna × 5 reasoning levels) suggests granular cost control — you pay for exactly the reasoning depth you need.

## What to Watch

1. **Fable vs. Sol on DeepSWE.** The HN consensus is that Terra already competes with Fable on coding. Sol at Max should be a clear step above — we'll need third-party benchmarks to confirm.
2. **Self-improvement loops.** If Sol can train Luna, can a future Sol train Sol? That's the recursive self-improvement scenario everyone is watching.
3. **Pricing war.** With Muse Spark 1.1, Claude Sonnet 5, and GPT-5.6 all available in the same week, API prices are under heavy pressure.

Read also:

- [Claude Sonnet 5: Anthropic's Most Agentic AI Model Arrives at a Reduced Price [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [SubQ: The First Fully Subquadratic LLM — Cost Comparison with Transformers [2026]]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}})
- [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})

---

Please feel free to reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
