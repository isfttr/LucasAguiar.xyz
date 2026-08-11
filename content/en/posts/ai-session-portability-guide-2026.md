---
date: 2026-07-31T15:06:04-03:00
draft: false
title: "AI Session Portability: Why Your AI Conversations Are Becoming Lock-In [2026]"
description: "AI sessions are drifting into lock-in: encrypted reasoning, hidden search, opaque compaction. The 5 portability tests — and how to keep your transcripts yours."
featured_image: ""
categories:
  - article
tags:
  - ai
  - llm
  - ai-agents
  - privacy
  - open-source
---

The original promise of an inference API was wonderfully simple: send some input, receive some output, and if you kept both, you had the conversation. You could inspect it, archive it, replay it, or hand it to a different model. The transcript belonged to you.

That abstraction is quietly breaking. A growing share of what an AI session produces — reasoning tokens, search evidence, compaction state, inter-agent messages — is returned as encrypted, provider-bound blobs that only the original model can interpret. An essay by [Earendil Engineering](https://earendil.com/posts/session-portability/) titled *The Session You Cannot Take With You* made exactly this argument and reached the top of [Hacker News](https://news.ycombinator.com/item?id=49118781) this week with roughly 700 upvotes and 200 comments. This post unpacks what session portability means, why providers are eroding it, and what you can do today to keep your AI conversations yours.

## What "portable" actually means

Portability does not require a different model to produce the same next token. Models differ in capabilities, context windows and tooling — that is a given. The bar is more modest:

```js
const transcript = session.export();
revokeCredentials(oldProvider);
session = newProvider.continueFrom(transcript);
```

The archive must contain enough intelligible information for another model to continue the work, without the old provider dereferencing an ID, decrypting a blob or reconstructing a summary. That gives five practical tests:

- **Inspection** — can you see what the model saw, what tools did, and what agents told each other?
- **Export** — is the session self-contained, apart from artifacts you can also download?
- **Replay** — can another implementation reconstruct a semantically equivalent context?
- **Audit** — can a human explain why the system took an action after the fact?
- **Deletion** — can you identify and remove every server-side copy the session depends on?

## The drift toward provider-sealed state

### Encrypted reasoning tokens

All major labs claim legitimate reasons not to expose raw chain of thought, and on closed-weight models you typically do not see it. But the encryption that replaces it is not a privacy feature under your control. Anthropic returns the full thinking in a `signature` field; the readable "thinking" text, when enabled, is a summary produced by another model — and the documentation says thinking blocks are tied to the model that produced them and should be stripped when switching models. OpenAI, with `store: false`, returns `encrypted_content` that the client must preserve and replay. Earendil's term for this is **provider-sealed state**: the encryption does not hide the data from the inference provider, it hides it from you. We covered the interpretability frontier of this opaque reasoning in [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}}).

### Stored conversations turn transcripts into pointers

OpenAI's Responses API stores response objects by default (at least 30 days), and chaining turns via `previousResponseId` means your local record becomes a foreign key into a database you do not control. Google's newer Gemini Interactions API defaults to `store: true` — 55 days on paid tiers, one day on free. `store: false` exists and should be the documented default, not an opt-out you have to know about.

### Hidden searches

Hosted search is the clearest example of a transcript with holes. A client-side search tool behaves like any other tool: the query, ranking, retrieved passages and timestamps can be recorded and replayed. With provider-hosted search, you receive citations and URLs — but not the ranking, the extracted passages, or the material that was filtered out. A URL is not stable evidence: its contents change, and it may have been reduced to a short snippet before the model saw it. The next model gets an answer and a few links, not the evidence the first model actually used.

### Opaque compaction

Long agent sessions eventually need compaction, and here the divergence between providers is sharp. OpenAI's server-side compaction emits an encrypted item described as "opaque and not intended to be human-interpretable"; the `/responses/compact` endpoint returns a "canonical next context window" clients are told to pass on as-is. Anthropic's server-side compaction, by contrast, returns a readable content field, lets you provide custom summarization instructions, and produces a summary you can inspect and pass to another model. A sealed artifact may preserve more model-specific state, but it should accompany a readable handoff summary — not replace one.

### Subagents come with hidden instructions

Multi-agent systems compound the problem, because there is no longer one transcript — there is a tree of sessions. OpenAI's hosted Responses multi-agent beta returns `multi_agent_call` and `agent_message` items whose content is encrypted, enables server-side compaction automatically, and injects root and subagent instructions you cannot edit or remove. A related change landed in the open-source Codex client in June 2026: the commit *"Encrypt multi-agent v2 message payloads"* replaced the parent's `message` argument with ciphertext, leaving Codex's own `InterAgentCommunication.content` empty. When a child agent changes the wrong file or leaks a secret, the user cannot answer the simplest question: *what was that agent asked to do?*

## Why this matters even if you never switch models

Most people do not switch providers mid-session. But the option to leave is what creates discipline: if your accumulated context can only be interpreted by one provider, it stops competing on quality, price, reliability and trust. And you may need to move a session for reasons that have nothing to do with preference — a model is retired, a service goes down, a price changes, a policy blocks the next request, a confidential phase must run locally, or an auditor needs to reconstruct what happened. Agents are making sessions much longer: a coding or research session accumulates days of decisions and evidence, and a personal assistant may accumulate transcripts going back years.

## What a portable inference API should promise

Earendil proposes a small set of rules worth adopting as a checklist when you evaluate AI tools:

1. **The local event log is canonical** — the client can reconstruct the session without dereferencing server IDs.
2. **Storage is explicit** — `store: false` easy, documented, and preferably the default.
3. **No opaque item is the sole carrier of meaning** — every encrypted artifact has a readable, provider-neutral handoff.
4. **Hosted tools have full-fidelity logs** — exact inputs, outputs, evidence, provenance and hashes, not just citations.
5. **Subagent communication is auditable** — readable task, messages, lineage, model and permissions for every agent.
6. **Compaction is inspectable** — readable summary plus the instructions used to create it.
7. **Artifacts are exportable** — files and snapshots downloadable into a local archive.

## What you can do today

- **Opt out of retention where available**: set `store: false` on OpenAI Responses and Gemini Interactions, and prefer APIs that do not persist state by default.
- **Keep your own transcripts**: local-first clients and event logs give you inspection, replay and audit even when the provider offers none.
- **Make handoffs readable**: prefer client-side summarization you can review and edit over sealed compaction.
- **Run open-weights models locally** when continuity, confidentiality or long-term ownership matter — smaller open models that run on your own hardware, like [SubQ: The First Fully Subquadratic LLM]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}}), are also a hedge against provider lock-in.

The minimum freedom is simple: you should be able to close an account, keep a session, and hand it to another model. The new model may disagree, ask questions, or perform worse — but it should not be staring at ciphertext where the old model saw your history, evidence and delegated work. Stateful APIs are fine; coupling better performance to less user control is not.

Read also:

- [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [SubQ: The First Fully Subquadratic LLM — Cost Comparison with Transformers [2026]]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}})
- [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
