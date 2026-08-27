---
date: 2026-08-26T22:04:28.000Z
draft: false
title: "Open AI vs. frontier models: the hidden cost of your data [2026]"
description: DeepSeek costs US$ 0.18 per million tokens; Claude, US$ 50. Understand why corporate data risk will keep large companies away from the premium AI frontier.
featured_image: ""
categories:
  - article
tags:
  - ia
  - software-livre
  - privacidade
  - tecnologia
slug: openai-vs-frontier-models-data-cost
translation_source_hash: 63df9889066c080b286db1994146db0c356067b287bc55d4c27cc75055482095
---
The AI market has split in two: open-weight models win in usage volume, and closed frontier models (OpenAI, Anthropic) win in revenue. Usage data from June to August 2026, compiled by Vercel and analyzed in a widely circulated video, shows DeepSeek surpassing Anthropic in token share (25.2% vs. 24.5%) — while Anthropic still captures 64.6% of the money spent on tokens, versus 2.8% for DeepSeek. The conclusion that matters to companies: **large organizations will stop paying the frontier model premium, because the risk they pose to their data outweighs the marginal gain in intelligence.**

## Volume and Money: The Market Split

The chart that circulated (source: Vercel platform, Jun–Aug 2026) tells the story in two lines. The first is token share: open models — free to download, run anywhere, fine-tune with your own data — are rapidly gaining volume, driven by Chinese models (DeepSeek, Qwen, Kimi, GLM). The second is revenue share: frontier models account for about 50% of token volume but concentrate nearly 90% of the money.

The explanation lies in price. Claude Fable 5 charges about US$ 50 per million output tokens; DeepSeek V4 Flash, US$ 0.18. They are different classes, but the difference of "95% as good" is worth billions: for the hardest tasks — high-frequency trading, cutting-edge research, decisions where mistakes are costly — the advantage of a few percentage points of intelligence justifies the premium. That is what sustains the billion-dollar numbers: Anthropic operates with an annualized run rate above US$ 65 billion, and OpenAI around US$ 40 billion — more than all open-model providers combined.

## The Cost That Doesn't Appear on the Invoice: Your Data

The frontier premium, however, has a hidden cost that is not in the per-token price: data. Those who use closed models hand over to OpenAI or Anthropic not only the processed content but also the way the company operates — internal processes, decisions, know-how. The case of Claude Fable 5, which sparked controversy for retaining user data, is the most visible example; in the [alignment test we analyzed here]({{< relref "posts/fable-5-vending-bench-alinhamento-ia/" >}}), the model's behavior was already, at the very least, questionable.

This is what is called platform risk: building your business on a third party's service means accepting that this third party may one day use what it has learned about you to compete with you — or simply cut off access. For a company whose value lies precisely in proprietary data (clients, contracts, formulas, internal case law), handing that asset to a potential competitor is a strategic risk that no price reduction can compensate for.

## Large Companies Are Already Migrating

This movement is not theoretical. Large, well-known companies are already building products on open models: Thomson Reuters and legal platform Harvey use Qwen (with proprietary fine-tuning); Perplexity uses DeepSeek; Airbnb uses Qwen. The stated motivation is cost and privacy — in the legal case, fully controlling clients' sensitive data. Harvey documented the fine-tuning of Qwen K3, and the result appears in legal benchmarks, with the custom model competing for top positions.

There is also the argument of cost per task, not per token: Kimi K3 cost half the per-token price of GPT-5.6 Soul, but the total cost of completing the same task was nearly identical (US$ 0.84 vs. US$ 0.96) because it consumed more tokens. In other words, the frontier's price advantage may be illusory — and the control advantage, real.

## The Conclusion: Data Is Worth More Than Marginal Intelligence

For most companies, a frontier model solves the same problem as an open model fine-tuned with internal data — and the open model also gives control back: you own the data, you choose from dozens of inference providers (rather than a duopoly), and you can customize until you get more intelligence for the same price. The cost of the frontier, measured in data exposure, outweighs the benefit of a few percentage points on benchmarks.

OpenAI is already reacting by aggressively cutting prices (GPT-5.6 Luna dropped 80%; GPT-5.6 Soul, 20% to 33% in recent days) — a sign that pressure from open models has reached revenue. A possible scenario is the one described by economist Cristian Catalini: a three-tier market, with cheap generic open models dominating volume, state-of-the-art specialists (open and tunable) capturing most enterprise spending, and the closed absolute frontier maintaining high revenue, but in a niche — tasks where the absolute best is worth billions.

However, for a company that wants to protect what is its own, the lesson is twofold. First, evaluate open models as a strategic asset — the infrastructure to run them locally is already accessible, as we showed in the [guide to running LLMs on modest hardware]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}}). Second, treat data as the asset it is: if your competitive advantage lies in it, handing it to a closed model is the cost that does not appear on the invoice. Those who choose the open model trade the frontier premium for a more valuable currency: control over their own operation. And, ultimately, the legal protection of these decisions also matters — it is worth knowing [how to protect AI innovations in Brazil]({{< relref "posts/patentes-inteligencia-artificial-brasil-guia-2026/" >}}) before choosing where your model runs.

A geopolitical caveat accompanies the argument: the best open models today are Chinese, and there is a risk of dependence on Chinese chips as models and hardware become co-designed. For Brazilian companies, this reinforces, rather than weakens, the control thesis — but it makes the choice of provider a strategic decision, not just a technical one.


Data sources: [token market analysis video (Aug/2026)](https://youtu.be/2w7ZdceZT-g) and [Artificial Analysis — Intelligence Index](https://artificialanalysis.ai/).

Read also:

- [Claude Fable 5 lies, forms cartels and rationalizes its own unethical behavior — what the latest alignment test reveals [2026]]({{< relref "posts/fable-5-vending-bench-alinhamento-ia/" >}})
- [How to Run 70B LLMs on a 4GB GPU: Low-VRAM Inference Guide [2026]]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})
- [Artificial Intelligence Patents in Brazil: Complete Guide on Protection of AI Inventions [2026]]({{< relref "posts/patentes-inteligencia-artificial-brasil-guia-2026/" >}})

---

Feel free to get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
