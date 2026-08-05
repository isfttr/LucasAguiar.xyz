---
date: 2026-08-05T15:10:00-03:00
draft: true
title: "Stateless MCP Guide [2026]: What Changed in the Model Context Protocol 2.0"
description: "Stateless MCP explained: what the 2026-07-28 Model Context Protocol 2.0 spec changed, why single-request servers matter, and how to build and probe your own MCP server."
featured_image: ""
categories:
  - article
tags:
  - mcp
  - ai-agents
  - llm
  - protocol
  - ai-tools
---

You have an AI agent, a database, and a growing suspicion that wiring them together should not require a custom integration every single time. That is the exact problem the Model Context Protocol (MCP) was built to solve — and in July 2026 it got its most significant update since launch: **stateless MCP**, the defining change of the `2026-07-28` specification (informally, MCP 2.0).

This guide covers what changed, why the stateless model matters for anyone building agent tooling, and how to try it today with real tools.

## What MCP is (and why it exists)

MCP is an open protocol that standardizes how LLM applications connect to external tools and data sources. It uses JSON-RPC 2.0 messages between three roles: **hosts** (LLM applications that initiate connections), **clients** (connectors inside the host), and **servers** (services that provide context and capabilities — tools, resources, and prompts). The official [specification](https://modelcontextprotocol.io/specification/2026-07-28) describes it as taking inspiration from the Language Server Protocol: instead of every IDE inventing its own way to talk to language tooling, LSP standardized it, and MCP does the same for the AI agent ecosystem.

Anthropic introduced MCP in November 2024. Interest spiked through 2025, then cooled somewhat when agent frameworks with terminal access (plus Anthropic's Skills) could accomplish much of what MCP did, more flexibly. The [2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28) — rolled out on July 28, 2026 — is the most significant change to the protocol since it launched, and it has reignited the ecosystem. As Simon Willison put it in his analysis of the release, giving an agent a shell and open internet access is risky and demands a very strong model; MCP tools are easier to audit and control, and simple enough that [smaller models running on a laptop]({{< relref "posts/creating-my-ai-assistant-locally/" >}}) can drive them competently.

## The core change: from two requests to one

The clearest way to see the difference between legacy ("stateful") MCP and the new stateless model is side by side. Legacy MCP required **two HTTP requests**: first you `initialize` a session and receive an `Mcp-Session-Id`, then you call the tool, sending that session ID back:

```http
POST /mcp HTTP/1.1
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 1, "method": "initialize",
  "params": { "protocolVersion": "2025-11-25", "capabilities": {},
    "clientInfo": { "name": "my-app", "version": "1.0" } } }
```

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 2, "method": "tools/call",
  "params": { "name": "search", "arguments": { "q": "otters" } } }
```

Stateless MCP collapses this into **a single HTTP request**. The session handshake is replaced by protocol metadata carried in headers, and the client identifies itself in the request body:

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": { "name": "search", "arguments": { "q": "otters" },
    "_meta": { "io.modelcontextprotocol/clientInfo": { "name": "my-app", "version": "1.0" } } } }
```

The spec now describes the base protocol as built on **stateless, self-contained requests with per-request capability negotiation**. No server-side session registry, no `Mcp-Session-Id` to track.

## Why stateless matters

The change is small on the wire and large in practice, for three reasons:

**1. Horizontal scalability.** With stateful sessions, a server must remember every session, and a load balancer must pin each client to the same backend instance (sticky routing) or sessions break. Stateless servers have no memory, so any instance can serve any request. That is the difference between a toy integration and something you can put behind a real web stack.

**2. Simpler implementations.** A stateless MCP server is closer to a plain HTTP endpoint than to a session manager. Simon Willison reported building three MCP implementations the week the spec shipped — a good signal for how much friction the change removed. His [stateless MCP write-up](https://simonwillison.net/2026/Jul/31/stateless-mcp/) walks through all three.

**3. Better fit for the web.** Stateful session IDs are awkward in serverless and containerized environments. Stateless requests map naturally onto HTTP semantics, caching, and standard middleware.

What did **not** change: MCP still uses JSON-RPC 2.0, still exposes servers with **Resources** (context and data), **Prompts** (templated workflows), and **Tools** (functions the model can execute), and still supports the opt-in extensions — **Tasks** for asynchronous long-running operations, **Skills over MCP** for structured agent instructions, and **MCP Apps** for interactive UI elements rendered inline in conversations.

## How to try it today

The fastest way to get a feel for the new model is to probe a live stateless MCP server from your terminal. Willison's [mcp-explorer](https://github.com/simonw/mcp-explorer) is a stateless Python CLI that runs directly with `uvx`, no install step:

```bash
uvx mcp-explorer list https://agentic-mermaid.dev/mcp
uvx mcp-explorer inspect render_svg
uvx mcp-explorer call https://agentic-mermaid.dev/mcp render_svg -a source 'graph TD; A-->B'
```

The `list` command shows the tools a server exposes, `inspect` prints the JSON schema of a tool's inputs and outputs, and `call` invokes it with arguments. Probing a spec this way is one of the best ways to internalize it.

Two more practical examples from the same release wave:

- **[datasette-mcp](https://github.com/datasette/datasette-mcp)** — a Datasette plugin that adds a `/-/mcp` endpoint to any instance. It exposes three tools (`list_databases`, `get_database_schema`, `execute_sql`) that let an agent run read-only SQL against your data. Wire it into ChatGPT or Claude and they can query your instance directly.
- **[llm-mcp-client](https://github.com/simonw/llm-mcp-client)** — an alpha plugin for the `llm` CLI that adds first-class MCP integration: `llm -t 'MCP("https://datasette.simonwillison.net/-/mcp")' 'count the notes'`.

If you want to see MCP in action on this very blog's infrastructure, the [tutorial on connecting Google Search Console to an agent via an MCP server]({{< relref "posts/google-search-console-agente-hermes/" >}}) covers a real end-to-end setup — service account, the `gsc-mcp` server, and the Docker adjustments needed to run it on a homelab.

## Security: the case for MCP over raw shell

The protocol's design philosophy is explicit about safety: user consent and control, data privacy, and tool safety are first-class principles in the [specification](https://modelcontextprotocol.io/specification/2026-07-28). MCP's tool-based model gives you a defined surface — a fixed list of functions with typed schemas — instead of "here is a shell, good luck." That is far easier to audit, sandbox, and reason about than arbitrary command execution in an open network environment.

That does not mean MCP is immune to abuse. The protocol enables arbitrary data access and code execution paths, and the pattern of letting users mix and match tools pushes responsibility for avoiding data exfiltration onto the user — the same class of risk discussed in [agentic workflows and prompt injection]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}). Treat any MCP server you connect as untrusted until you have read its tool list, and keep read-only tool sets (like `datasette-mcp`'s current `execute_sql`) read-only where possible.

## When to use MCP, when not to

A useful decision rule after the 2026 spec:

- **Use MCP** when you want a stable, auditable tool surface for agents — especially for sensitive applications, shared integrations, or small models that cannot reliably drive a full shell.
- **Skip MCP** when a task is exploratory and needs the full flexibility of a terminal — an agent harness with a sandboxed shell remains the more general option. The two approaches are complementary, and the ecosystem is increasingly treating them that way (hence Skills over MCP).

## What to watch next

The stateless model lowers the barrier for both server and client implementations, which usually means one thing: more integrations, faster. Watch for MCP support landing in more agent frameworks and CLI tools, for `Tasks` extension adoption as the standard way to handle long-running operations, and for the security guidance around stateless servers to mature as the ecosystem grows. The protocol stopped being "Anthropic's thing" a while ago — with MCP 2.0 it became a genuinely boring, dependable standard, and that is exactly what infrastructure should be.

Also read:

- [Google Search Console via MCP: connecting an agent to your SEO data]({{< relref "posts/google-search-console-agente-hermes/" >}})
- [GitLost and prompt injection in agentic workflows]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
