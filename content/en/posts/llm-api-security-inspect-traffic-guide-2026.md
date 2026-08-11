---
date: 2026-08-11T15:08:10-03:00
draft: false
title: "LLM API Security in 2026: How to Inspect AI Traffic and Protect Your Keys"
description: "Practical guide to LLM API security in 2026: reasoning-trace extraction, MitM inspection of Copilot and Claude Desktop traffic, and a defense-in-depth checklist for API keys."
featured_image: ""
categories:
  - article
tags:
  - llm
  - security
  - privacy
  - api
  - devops
---

Two things happened in August 2026 that most developers missed. Researchers from the ELLIS Institute Tübingen and the Max Planck Institute published a paper showing they could recover the *hidden reasoning* of frontier LLMs — from Anthropic, OpenAI, and Google — by replaying encrypted thinking blocks into weaker models. Around the same time, an engineer named Rafael put GitHub Copilot behind a MitM proxy and published exactly what VS Code sends to the cloud, line by line.

Neither is a one-off bug. Both point to the same reality: **every conversation you have with an AI assistant is a security surface you cannot see.** This guide explains what actually travels over the wire when you use Copilot, Claude, or ChatGPT, how you can inspect that traffic yourself with mitmproxy, and a practical checklist to lock down your keys, your prompts, and your organization's data.

## What Actually Travels Over the Wire

Almost every mainstream AI assistant is an Electron app — VS Code, Claude Desktop, ChatGPT Desktop, Cursor, Notion. Electron bundles a Node.js runtime with Chromium, which means they all share the same network stack and the same rough architecture. That is good news for anyone who wants to understand them: learn to inspect one, and the knowledge transfers to the rest.

When you send a prompt, the request typically contains:

- The prompt itself, in plaintext over TLS (visible to you, your proxy, and the provider)
- Code context, file contents, or conversation history attached by the harness
- Session and account identifiers
- For reasoning models: an **encrypted chain-of-thought block** returned by the API and sent back on the next turn

The first three are well understood. The fourth is the new frontier of LLM security research.

## Reasoning Traces: The Hidden Layer

Frontier models from Anthropic, OpenAI, and Google return their chain-of-thought to the client as an **encrypted block** — a signed blob that the client stores and sends back when the conversation continues. Providers encrypt it to prevent distillation and to keep their models' internal reasoning proprietary.

The [Tübingen research](https://stolen-thoughts.com/) showed that this encryption is not a security boundary. Because the blocks are *portable* — they can be replayed across sessions, users, and models — the researchers took a trace produced by a frontier model (for example, `claude-opus-4-8`), replayed it into a weaker sibling model (`claude-haiku-4-5`), jailbroke the weaker model, and asked it to transcribe the reasoning verbatim. It did. They demonstrated the attack across frontier models from OpenAI, Anthropic, and Google, decoding reasoning on 120 Codeforces problems — without ever attacking the stronger model directly or triggering its anti-distillation safeguards.

The same paper found that recovered reasoning frequently contains **secrets**: API keys, internal project details, and data that was never meant to leave the conversation. If your team pastes tokens, URLs, or customer data into a reasoning model's prompt, assume that content is recoverable from the encrypted trace — not by the provider's safeguards, but by anyone who obtains the block.

## How to Inspect Your Own AI Traffic

You do not need to be a reverse engineer to see what your AI tools send. A [mitmproxy](https://docs.mitmproxy.org/stable/) setup takes about ten minutes:

1. Install mitmproxy and run `mitmweb` (or `mitmproxy`) on your workstation.
2. Install the mitmproxy CA certificate in your system trust store.
3. Point the Electron app at the proxy. For most tools, setting `HTTPS_PROXY=http://127.0.0.1:8080` before launching the app is enough; some honor the system proxy settings directly.
4. Watch the traffic to `api.anthropic.com`, `api.openai.com`, `api.githubcopilot.com`, and friends.

What you will see matches [Rafael's Copilot experiment](https://www.lighthousenewsletter.com/p/i-put-github-copilot-behind-a-mitm): your editor's harness attaches local context, file paths, and conversation memory to every request, and the request bodies are fully readable on your own machine. The point is not paranoia — it is *knowing your blast radius*. If your company's codebase is loaded into a cloud model every keystroke, that is a decision you should make deliberately, not by default.

One honest caveat: some apps pin certificates or refuse to run with a custom CA. When that happens, the proxy shows nothing — which is itself useful information, and a sign that inspecting that particular app requires a different approach (DNS-level logging, or a firewall that logs connections).

## Defense in Depth: Protecting Keys, Prompts, and Data

Seeing the traffic is step one. Locking it down is step two. This checklist works for individuals and teams:

**API key hygiene.** Store keys in environment variables or a secrets manager, never in source code. Use scoped keys per application, rotate them on a schedule, and treat a leaked key as compromised immediately. [OpenAI's production best practices](https://platform.openai.com/docs/guides/production-best-practices) and [Anthropic's trust center](https://trust.anthropic.com/) are good baselines for key management and data handling commitments.

**Assume traces can be recovered.** The Tübingen attack means you should treat *everything in a reasoning model's prompt* as potentially extractable. Never paste credentials, tokens, or regulated data into a cloud LLM — even a "private" one. If a workflow needs a secret, inject it at runtime in your own infrastructure, not in the prompt.

**Prefer local models for sensitive work.** For proprietary code, customer data, or anything under an NDA, a self-hosted model is the only option where the traffic never leaves your network. Running LLMs on modest hardware is more practical than most people think — see our [guide to running LLMs on old server hardware]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) and the [low-VRAM GPU guide]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}}). The cost of a mid-range GPU is often cheaper than a year of leaked-secret cleanup.

**Apply the OWASP LLM Top 10.** The [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) is the industry baseline: prompt injection, sensitive information disclosure, supply chain, and insecure output handling. If your team ships anything with an LLM in the loop, run the checklist — it will catch the categories above before they become incidents.

**Monitor spend and anomalies.** An attacker with your key does not need your code — they need your quota. Alert on unusual token consumption, new regions, and unexpected model IDs. Cheap insurance.

**Combine with sandboxing.** Inspecting traffic protects your data leaving the machine; [sandboxing AI coding agents]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}}) protects what runs *on* it, and [prompt-injection defenses]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}) protect against malicious instructions arriving from the outside. The three layers cover the full loop: input, execution, and egress.

## The Bottom Line

The August 2026 stories are not vulnerabilities to patch — they are properties of how cloud AI works today. Encrypted reasoning blocks are portable by design; Electron harnesses attach context by design; keys are the single point of failure by design. None of this means you should stop using Copilot or Claude. It means you should use them with the same threat model you apply to any other third-party service that handles your source code: know what leaves the building, protect the credentials, and keep the truly sensitive workloads local.

Leia também /

Read also:

- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [How to Run 70B LLMs on a 4GB GPU: Low-VRAM Inference Guide [2026]]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})
- [How to Safely Run AI Coding Agents: A Practical Sandboxing Guide [2026]]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
