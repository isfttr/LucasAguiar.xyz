---
date: 2026-07-20T15:07:18-03:00
draft: true
title: "How to Control Reasoning Effort in LLMs: A Practical Guide [2026]"
description: "Practical guide to controlling reasoning depth in LLMs — from API parameters and prompt techniques to cost optimization across GPT-5.6, Claude, and open-source models."
featured_image: ""
categories:
  - article
tags:
  - llm
  - prompt-engineering
  - ai
  - dev
  - optimization
---

Every token a frontier model generates costs money. Every reasoning step it takes adds latency. And increasingly, models are giving you 500 tokens of elaborate chain-of-thought analysis when all you needed was a "yes" or "no."

The ability to **control reasoning effort** — how much compute the model expends before producing an answer — has gone from an academic curiosity to a practical necessity. GPT-5.6 ships with five explicit reasoning levels per model. Anthropic offers extended thinking tiers. Open-source models like DeepSeek R1 let you tune reasoning depth at inference time.

This guide covers the practical techniques for controlling reasoning effort, when to use each, and how much it costs.

## What Is Reasoning Effort?

Reasoning effort refers to the amount of computation an LLM allocates to internal deliberation before generating a visible response. In standard autoregressive models, every output token costs roughly the same. In reasoning models — which include chain-of-thought tokens, branching, verification passes, or explicit search — the model can spend orders of magnitude more compute on a single answer.

The key insight from recent research (including Sebastian Raschka's [Controlling Reasoning Effort in LLMs](https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms)) is that models can learn to operate across multiple reasoning effort regimes. A single model checkpoint can function in "low effort" mode (quick, confident, sometimes wrong) or "high effort" mode (slow, thorough, more accurate) depending on how inference is configured.

## Why Control It?

| Reason | Impact |
|--------|--------|
| **Cost** | GPT-5.6 Sol at Max reasoning costs ~6x more per query than Low. Over 10K queries/day, that's thousands of dollars. |
| **Latency** | High reasoning adds 10–60s per response vs sub-second at low effort. |
| **Quality needs** | Not every query needs deep reasoning. "What time is it?" does not need a 3-minute internal monologue. |
| **Token budgets** | Many applications run under strict context and output limits. |

## Method 1: API-Level Reasoning Parameters (Closed-Source Models)

### GPT-5.6 (Sol, Terra, Luna) — Five Reasoning Levels

OpenAI's GPT-5.6 family introduces the most granular control yet: five explicit levels — **Low, Medium, High, Extra High, Max** — each with a clear cost multiplier.

```
# Python pseudocode
client = OpenAI()
response = client.chat.completions.create(
    model="sol",
    reasoning_effort="medium",  # low | medium | high | extra_high | max
    messages=[{"role": "user", "content": "Explain quantum entanglement"}]
)
```

The cost scales roughly linearly:
- **Low**: baseline (1x)
- **Medium**: ~1.5-2x
- **High**: ~3x
- **Extra High**: ~4-5x
- **Max**: ~6x

From existing benchmarks: Terra at Medium already handles most coding and Q&A tasks at a fraction of Sol's cost. Reserve Max for ARC-AGI puzzles and research-grade reasoning.

### Anthropic Claude — Extended Thinking

Claude (via API) offers a `thinking` parameter that controls whether the model engages in extended chain-of-thought reasoning before responding. The configuration is binary in the standard API, but the `budget_tokens` field lets you allocate a token budget for internal reasoning:

```
response = client.messages.create(
    model="claude-sonnet-5-20260720",
    thinking={"type": "enabled", "budget_tokens": 4096},
    messages=[{"role": "user", "content": "Solve this math proof"}]
)
```

A lower `budget_tokens` forces the model to be concise in its internal reasoning. A higher budget allows deeper deliberation. For simple queries (summarization, classification), setting `budget_tokens` to 512 or disabling thinking entirely cuts latency by 60-80%.

## Method 2: Prompt-Based Control (Open-Source Models)

Open models like DeepSeek R1, Qwen 3, and SubQ don't have native reasoning effort knobs in the API. Instead, you control reasoning depth through prompting and sampling parameters.

### Temperature and Top-P

Lower temperature (0.1-0.3) produces shorter, more deterministic outputs. Higher temperature (0.7-1.0) encourages the model to explore more reasoning paths, producing longer chain-of-thought.

```
# Low effort: deterministic, short
temperature=0.1, top_p=0.1

# High effort: exploratory, verbose
temperature=0.8, top_p=0.9
```

### Explicit Instruction

The most straightforward technique: tell the model how much to think.

- **Low effort**: "Answer briefly in 1-2 sentences. Do not show your reasoning."
- **Medium effort**: "Answer with a brief explanation of your reasoning, max 3 steps."
- **High effort**: "Think step by step. Show all intermediate reasoning. Verify your answer."

This works surprisingly well. DeepSeek R1 and Qwen 3.8 respond predictably to reasoning-depth instructions because they were trained on data with varied output lengths.

### Max Tokens Constraint

A simple but effective technique: set `max_tokens` to a low value for the first pass, and only re-run with higher tokens if the model signals uncertainty:

```
# First pass: very short answer
response = generate(prompt, max_tokens=100)

# Check if answer seems complete (heuristic)
if "I'm not sure" in response.text or response.text.endswith("..."):
    response = generate(prompt + "\nPlease be thorough.", max_tokens=4096)
```

## Method 3: Training-Time Control

For teams fine-tuning their own models, reasoning effort can be baked into the training process. The key technique, described in Raschka's article, involves conditioning the model on a reasoning-effort token during training:

**Training approach:**
1. Append a reasoning-effort tag to training examples (`<|low_reasoning|>`, `<|high_reasoning|>`)
2. Train the model to respect these tags
3. At inference time, prepend the desired tag

This produces a single model that can operate across all effort levels — no separate checkpoints needed. Both DeepSeek R1 and the GPT-5.6 family use variations of this approach internally.

## Cost Comparison Table

Here is the estimated cost impact of reasoning effort levels across providers (per 1M queries):

| Effort Level | GPT-5.6 Sol | Claude Sonnet 5 | DeepSeek R1 (self-hosted) |
|-------------|------------|-----------------|--------------------------|
| Low | $2,500 | $1,800 | ~$200 (electricity) |
| Medium | $4,500 | $3,000 | ~$400 |
| High | $8,000 | $5,500 | ~$800 |
| Max | $15,000 | $10,000 | ~$1,500 (inference is compute-bound) |

*Estimates based on published pricing and self-hosted TCO for 8x H100 setup. Actual costs vary by deployment and average output length.*

## When to Use Each Effort Level

| Use Case | Recommended Effort | Why |
|----------|-------------------|-----|
| Classification / routing | Low | Binary or multi-class decisions don't need reasoning |
| Summarization | Low to Medium | Facts extraction is low-effort; synthesis needs modest depth |
| Code generation | Medium | Most code patterns are well-known. Reserve high for edge cases. |
| Debugging | High | Root cause analysis benefits from systematic reasoning |
| Mathematical proof | Max / Extended | One wrong step corrupts the entire chain |
| Chat / conversation | Low | Users expect sub-second responses, not dissertations |
| Research analysis | High to Max | Depth is the value proposition |

## Implementation Strategy

1. **Default to Low effort** for every endpoint. Only escalate when the model signals uncertainty or the task demands it.
2. **Use adaptive routing**: classify query complexity first, assign reasoning level second. A simple classifier (even a lightweight model) can save 40-60% on API costs.
3. **Set token budgets explicitly** with Anthropic's `budget_tokens` or OpenAI's `reasoning_effort` parameter rather than relying on prompt instructions alone.
4. **Monitor and iterate**: log reasoning effort per query, measure accuracy, and adjust baselines. The optimal Effort/Accuracy trade-off changes as models improve.

The era of "one model, one response mode" is ending. Every query now has a cost dial — and knowing when to turn it up or down is the most practical skill a developer working with LLMs can develop in 2026.

Read also:

- [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [SubQ: The First Fully Subquadratic LLM — Cost Comparison with Transformers [2026]]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}})
- [GPT-5.6 [2026]: Sol, Terra, Luna — OpenAI's Three-Tier Frontier Model Family]({{< relref "posts/gpt-5-6-openai-sol-terra-luna-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
