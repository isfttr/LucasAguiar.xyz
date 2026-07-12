---
date: 2026-07-12T15:05:37-03:00
draft: true
title: "How AI Coding Agents Actually Work: An Architectural Guide [2026]"
description: "AI coding agents explained from first principles: the tool-calling loop, agent architectures (single vs multi-agent, MCP), and practical tips for using them effectively in real projects."
featured_image: ""
categories:
  - article
tags:
  - artificial-intelligence
  - coding-agents
  - software-engineering
  - dev-tools
  - llm
---

When Terence Tao — one of the most celebrated mathematicians alive, a Fields Medalist, someone who has spent decades pushing the boundaries of human reasoning — sat down last week to port 25-year-old Java applets to modern JavaScript, he didn't write a single line of code by hand. He described what he wanted to an AI agent, reviewed the output, and in a few hours had working applets that had been broken for years.

More striking: the agent found bugs in Tao's original code that he didn't know existed. And when he decided to build a visualization tool for special relativity that had been too complex to code by hand back in 1999, the agent delivered an "alpha" version in an afternoon.

This isn't a futuristic scenario. It happened last week, [documented on Tao's blog](https://terrytao.wordpress.com/2026/07/11/old-and-new-apps-via-modern-coding-agents/).

But what, exactly, is an "AI coding agent"? How does it differ from pasting code into ChatGPT? And how should developers think about integrating these tools into real workflows?

This guide explains the architecture, the trade-offs, and the practical decisions you need to make.

## What an AI Coding Agent Actually Is

At its core, an AI coding agent is a loop. Strip away the GUIs, the fancy editors, the marketing, and every single coding agent shares this fundamental structure:

1. **Receive a task** from the user (text, voice, or structured prompt)
2. **Plan** — decide what needs to happen (optional, but common in advanced agents)
3. **Act** — generate code, run a terminal command, read a file, or call an API
4. **Observe** — see the result of the action (output, error, file content)
5. **Loop** — decide if the task is done or needs another action

This is the **tool-calling loop**, also called ReAct (Reasoning + Acting). It's not new — the concept dates back to research papers from 2022. What changed is reliability. Modern frontier models (Claude Sonnet, GPT-5, Gemini Ultra) can execute this loop with enough accuracy that the output is usable, not a toy.

The simplest possible implementation fits in [100 lines of Common Lisp](https://thebeach.dev/posts/lisp-agent/), as demonstrated on Hacker News this week. The author's insight: an agent is just a recursive function. The model returns either a final answer or a tool request. If it requests a tool, you execute it, append the result, and recur.

## The Three Agent Architectures

Not all coding agents work the same way. There are three main approaches, each with different trade-offs.

### 1. Inline Agent (Cursor, Windsurf, Zed AI)

The agent lives inside the editor. It reads and writes your files directly, sees the open tabs, and uses the editor's built-in terminal. The tight integration means the agent has perfect context about your project — it sees <em>exactly</em> what you see.

**Strengths:** Fast iteration; the agent sees your linter errors, terminal output, and test results in real time. No context shuffling between tools.

**Weaknesses:** Tied to a specific editor. You're locked into Cursor, Windsurf, or whatever platform you choose. The agent's actions are limited to what the editor exposes.

### 2. Agentic CLI (Claude Code, Aider, Open CLAI)

The agent runs in your terminal as a standalone process. It reads files from disk, writes changes back, and runs shell commands directly. There is no editor integration — the agent IS the interface.

**Strengths:** Editor-agnostic. You can use it with Vim, Emacs, VS Code, or nothing at all. Claude Code, in particular, has become the default baseline for agentic coding — it handles git operations, linting, and testing out of the box.

**Weaknesses:** No visual context (the agent cannot see your editor layout, open tabs, or in-progress changes). Everything is file-based, so the agent's understanding of "what's happening right now" depends entirely on what files it reads.

### 3. Framework Agent (LangChain Agents, CrewAI, AutoGPT)

A library-based approach where you define tools, memory, and orchestration in code. The developer controls the full pipeline — which model, which tools, what planning strategy.

**Strengths:** Full control. You can chain multiple agents, add custom tools, implement RAG, and define complex orchestration logic. Best for production workflows that need reliability guarantees.

**Weaknesses:** Significant setup overhead. You are now maintaining agent infrastructure alongside your application code. For most individual developers, the overhead is not worth it — the inline and CLI approaches cover 90% of use cases with zero infrastructure.

## The Secret Sauce: Tool Choice

The difference between a mediocre coding agent and an excellent one is not the model — it's <em>which tools the agent can use and how reliably it can use them</em>.

The essential tools every coding agent needs:

| Tool | Why It Matters |
|------|---------------|
| **File read/write** | The core capability. The agent needs to see and edit your codebase. |
| **Terminal execution** | Run tests, linters, build commands, and see output. Without this, the agent is blind to runtime behavior. |
| **Git integration** | Create commits, review diffs, rollback bad changes. Essential for safe iteration. |
| **Search/grep** | Find relevant code across the project. Without it, the agent relies entirely on its context window. |
| **Web search** | Look up documentation, API references, and Stack Overflow. More useful than memorized training data for current libraries. |

The emerging standard for tool definition is the **Model Context Protocol (MCP)**, an open protocol that standardizes how agents discover and call tools. Tools built as MCP servers work across any MCP-compatible agent — define once, reuse everywhere.

## How to Structure Your Project for AI Agents

The blog has covered [how AI changes the economics of codebase consistency]({{< relref "posts/ai-changes-software-rewrite-economics-2026/" >}}), but the practical implication is straightforward: AI agents work best with consistent, well-documented codebases.

Here is what I have found makes the biggest difference:

**Use standard frameworks for everything.** If your codebase uses Flask, FastAPI, or Django — the model knows them. If you built a custom async microframework from scratch, the model has to learn it from your code comments and type hints, inside a limited context window.

**Write clear type hints and docstrings.** Modern agents read type annotations to understand function contracts. A well-typed function signature communicates more to the agent than a paragraph of comments.

**Keep a project-level README and CONTRIBUTING.md.** Claude Code, in particular, reads these files at the start of a session. The agent uses them to understand project conventions before it writes a single line of code.

**Commit often.** Agents understand git history. If an agent can see the last 10 commits, it understands which direction the project is moving. A clean commit history is better context than any architecture document.

## Common Pitfalls (and How to Avoid Them)

The blog has a [detailed post on vibe coding traps]({{< relref "posts/vibe-coding-pitfalls/" >}}), but three architectural pitfalls deserve emphasis:

**1. The context window is never big enough.** Even with 200K-token models, an agent that reads your entire 50-file project will lose coherence. The fix: let the agent use search tools to find <em>only</em> what it needs, rather than dumping everything into context.

**2. Agents hallucinate tool outputs.** When a terminal command fails, some agents invent the error message rather than reading the actual stderr. Reliable agents verify — they read the terminal output and incorporate it. If your agent keeps making the same mistake, check whether it is actually reading command output or guessing.

**3. Agent chains amplify errors.** A multi-agent system where Agent A generates code, Agent B reviews it, and Agent C tests it sounds great — but each step can introduce new errors. The error rate compounds. For most projects, a single well-configured agent with the right tools outperforms a multi-agent orchestra.

## Getting Started

If you have never used a coding agent, the best place to start is with a CLI-based agent on a small personal project:

1. **Install Claude Code** — `npm install -g @anthropic-ai/claude-code`
2. **Open a small project** (a Python script, a personal website, a side project)
3. **Give it a concrete task** — "Add a search endpoint to this API" or "Write tests for this module"
4. **Review every change** before accepting it

For editor-integrated agents, **Cursor** remains the most polished option, with **Windsurf** and **Zed AI** close behind. The best tool depends on your editing habits — if you already use VS Code, Cursor is the natural upgrade path. If you use Neovim or Emacs, a CLI agent like Claude Code or Aider fits better.

The key realization from this week's HN discussion — Tao's blog, the Lisp agent experiment, and the broader conversation — is that coding agents have crossed a threshold. They are no longer toys or curiosities. They are tools that a Fields Medalist uses for production mathematical visualization work. The question is no longer <em>if</em> you should use them, but <em>how</em>.

Also read:

- [How AI Changes the Economics of Software Rewrites]({{< relref "posts/ai-changes-software-rewrite-economics-2026/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
