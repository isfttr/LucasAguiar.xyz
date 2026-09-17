---
date: 2026-09-17T15:02:14-03:00
draft: true
title: "Using LLMs for Text Classification in Production [2026]: From Raw Prompts to Calibrated Features"
description: "How to use LLMs for text classification in production: zero-shot limits, calibration problems, treating LLM output as a feature, and structured output. Practical guide with code."
featured_image: ""
categories:
  - article
tags:
  - llm
  - machine-learning
  - ai
  - python
  - data-engineering
---

Using a large language model as a classifier feels like the easy path: write a prompt, get back a label, ship it. In practice, LLM-as-classifier output is hard to calibrate, ignores structured signals you already have, and gives you no principled way to trade precision against recall. The robust pattern for production is to treat the LLM not as the classifier but as a **feature extractor**, and let a small, calibrated downstream model make the final decision. This guide explains why, and shows a concrete pipeline.

The argument that "LLM classification is feature engineering" was laid out clearly in a [well-known 2026 essay](https://minimallysufficient.com/posts/llm-classification-is-feature-extraction/), and it matches what many teams hit once they move a prototype classifier into a system that has to meet a precision target.

## Why the naive LLM-as-classifier approach breaks down

A classifier in production has requirements that a raw prompt just does not satisfy:

- **Calibration.** An LLM gives you a hard label, sometimes a self-reported "confidence" that has no reason to be accurate. You cannot set a threshold on a logit the model never produced. Without calibrated probabilities you cannot tune the operating point to the cost of a false positive versus a false negative.
- **Using what you already know.** You often have structured fields — user country, plan tier, timestamp, price — alongside the text. You can paste them into the prompt, but you have no way to know whether the model actually used them, or whether its baked-in priors match *your* population (a rare-positive problem looks different from an enriched one).
- **Interpretability.** A prose prompt reads interpretable, but you cannot audit which parts of the context the model followed. Debugging a bad batch means re-reading prompts, not inspecting features.

None of this is a failure of the model; it is a mismatch between a generative component and the requirements of a classifier.

## The pattern: LLM verdicts as features

Instead of asking the LLM for the final answer, ask it for a judgment and feed that judgment, together with your structured features, into a small downstream model. The simplest version is a logistic regression on the LLM verdict:

```
p(y = 1 | x) = sigmoid(alpha + beta * LLM(x))
```

In the limit of a large positive `beta` this recovers the plain LLM classifier — but a sensible policy estimates `alpha` and `beta` on labeled training data. Doing that gives you:

- **Calibrated probabilities.** Empirical rates per prediction, which are calibrated in expectation.
- **Threshold control.** With real probabilities out, you pick the operating point that meets your precision/recall goal.
- **Room for more signal.** Add other features and the classifier decides how much weight the LLM's judgment actually deserves.

This generalizes: treat the LLM as one component in a feature pipeline, not as the decision-maker.

## A practical pipeline

For a document triage task (e.g. "does this support ticket require a refund?"), the steps are:

1. **Extract features with the LLM.** Ask for structured output — a JSON object with a label, a severity score, and a confidence — using a constrained schema. Constraining the output format removes parsing headaches and gives the downstream model clean inputs.
2. **Combine with structured fields.** Build a feature row: the LLM's predicted label and score, plus your existing columns.
3. **Train a small model on labeled history.** A logistic regression or gradient-boosted tree over the feature table. It learns the calibration between LLM opinion and ground truth for *your* distribution.
4. **Evaluate at the operating point.** Pick the threshold on the calibrated probability that meets your business target, and re-check it as the distribution drifts.
5. **Fall back and route.** When the small model is uncertain, route the case to a human or to a more expensive frontier model — this is where the cost/latency budget lives.

## Choosing the pieces: model size, embeddings, retries

Not every task needs a frontier model, which matters when you are [running models on limited hardware]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) or [quantizing to fit a GPU]({{< relref "posts/llm-quantization-guide-gguf-2026/" >}}). Two levers to consider:

- **Embeddings + a shallow classifier** are often better calibrated and far cheaper than generation for high-volume routing. Use the LLM's embeddings as the feature vector and let a logistic regression classify directly. This is the classic, robust baseline.
- **Generation + structured output** wins when the task needs comprehension, reasoning, or taxonomy definitions the classifier cannot absorb. Ask for JSON, validate it against your schema, and feed it downstream.
- **Retries and confidence.** For generated labels, retry on schema failures and use the downstream model's probability (not the prompt's "confidence") to decide when to escalate.

## Cost, latency, and evaluation

LLM-based classifiers have two costs the prompt-only world hides:

- **Inference cost per item**, which becomes material at high volume. Classifying with a small embedding model first, and reserving frontier inference for the ambiguous tail, collapses the bill — the [quantization and local-model guides]({{< relref "posts/llm-quantization-guide-gguf-2026/" >}}) cover how far you can push this on self-hosted hardware.
- **Calibration cost** — every re-fit of the downstream model on new labeled data. Budget labeling as a recurring task, and monitor the expected positive rate to catch drift early.

Evaluate on precision/recall at your chosen threshold, not on raw accuracy. Track the calibration curve (predicted probability vs observed rate) after every retrain, and treat "the model is right 60% of the time" as meaningless without a threshold.

## The bottom line

The LLM's real strength in a classifier is **understanding**, not **decision-making**. Use it to extract rich features — labels, scores, structured attributes, embeddings — and hand the calibrated decision to a small model that fits your distribution and your cost goals. That division of labor is what turns a demo prompt into a classifier you can ship to a precision target, and it is the difference teams notice once traffic grows.

Also read:

- [Running 70B LLMs on low-VRAM GPUs]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})
- [LLM quantization guide: GGUF and beyond]({{< relref "posts/llm-quantization-guide-gguf-2026/" >}})
- [Running LLMs on an old homelab server]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})

---

You can reach out to discuss this and other topics by emailing <contact@lucasaguiar.xyz>