---
date: 2026-11-03T15:02:36-03:00
draft: true
title: "Audit AI Plugins in Your Dev Tools: A Practical Guide [2026]"
description: "Postman auto-installed Codex and Claude plugins and changed global configs. Here is how to audit AI plugins, MCP servers, and agent hooks in your dev tools before (or after) they change your setup."
featured_image: ""
categories:
  - article
tags:
  - ai
  - security
  - dev-tools
  - mcp
  - privacidade
---

In late October 2026, a [GitHub issue](https://github.com/postmanlabs/postman-app-support/issues/14370) on the Postman tracker went viral: opening the Postman desktop app silently installed Codex and Claude plugins, edited global agent configs, trusted its own startup hooks, and pointed a remote MCP connection at `mcp.postman.com` — all without an explicit opt-in from the user. The report logged 157 points on [Hacker News](https://news.ycombinator.com/item?id=50354960) in under a day.

Whether or not every claim in that report holds up, it is a concrete warning sign for anyone who runs AI coding agents in 2026: your dev tools now ship with **AI plugins that can modify your entire agent setup**, and the consent boundary is often thinner than you think. This guide shows you how to audit what is actually installed in your tools, where those changes live on disk, and how to control them before they control your workflow.

## Why this matters: the plugin changed more than itself

The Postman case is worth dissecting because it shows the blast radius of a single "AI integration." According to the [issue](https://github.com/postmanlabs/postman-app-support/issues/14370), the incident involved:

- A **user-wide Postman plugin** and a separately installed Postman CLI
- A **startup instruction hook** that told the agent to load a `postman:api-engineer` skill for any "non-trivial API engineering task"
- A **Claude Code plugin** plus a remote **MCP connection** to `mcp.postman.com/mcp`
- The installer attempting to **approve its own hook** (`trusted_hash`) in the agent's config

The key point is not the specific vendor — it is the **class of behavior**. An API client, a code editor, or an IDE extension can, in principle, write to configuration that every coding agent you run then trusts. That turns a productivity tool into an attack surface for prompt injection, credential exfiltration through MCP servers, and silent changes to how your agents behave.

## Where AI plugins hide in a modern agent stack

Before you can audit, you need to know where the configuration lives. The paths differ by tool, but the categories are consistent:

| Layer | What lives there | Typical location (macOS/Linux) |
|---|---|---|
| Agent global config | Owns plugins, marketplaces, hooks | `~/.codex/config.toml`, `~/.claude/settings.json` |
| Installed plugins | Registry of enabled plugins | `~/.claude/plugins/installed_plugins.json` |
| MCP servers | Remote/local server definitions | `~/.codex/mcp.json`, `~/.claude.json` |
| Hooks / commands | Startup instructions injected into every session | `hooks/` inside the plugin directory |
| CLIs / binaries | Standalone executables | `~/.local/bin` |

Get a full picture of what changed recently on your machine and what is signed into these agent configs.

## Step 1: snapshot your agent configs before they change again

The single most valuable habit is a **baseline**. Before installing anything, save a copy of every agent config you care about:

```bash
mkdir -p ~/agent-config-backup/$(date +%F)
for f in ~/.codex/config.toml ~/.claude/settings.json ~/.codex/mcp.json ~/.claude.json; do
  [ -f "$f" ] && cp "$f" ~/agent-config-backup/$(date +%F)/
done
```

Once you have a baseline, a `diff` after any tool update tells you exactly what the update touched. Without a baseline you are doing forensic archaeology — with one, you catch changes in seconds.

## Step 2: list what your agents actually load

Do not trust the UI. Read the config files directly. For Codex:

```bash
# What plugins and marketplaces are enabled?
grep -A5 "\[plugins\.\]" ~/.codex/config.toml 2>/dev/null
grep -A5 "\[marketplaces\.\]" ~/.codex/config.toml 2>/dev/null
```

For Claude Code, check the settings and the install registry:

```bash
cat ~/.claude/settings.json 2>/dev/null
cat ~/.claude/plugins/installed_plugins.json 2>/dev/null
```

For **any** tool, list the MCP servers defined:

```bash
cat ~/.codex/mcp.json 2>/dev/null; echo "---"; cat ~/.claude.json 2>/dev/null | python3 -m json.tool | grep -i "mcp"
```

Anything you did not explicitly add is a candidate for removal. In particular, be suspicious of `mcpServers` pointing at remote domains you do not recognize — a remote MCP server is a live network connection from your agent to a third party.

## Step 3: inspect hooks and startup instructions

Hooks are the most dangerous primitive because they run **on every session start** and can inject instructions the agent will treat as context. In the Postman case, the installed hook contained a session-start context file telling the agent to load a Postman skill for any API task.

Check what hooks are registered:

```bash
grep -rn "hooks\." ~/.codex/config.toml 2>/dev/null
ls -la ~/.claude/hooks 2>/dev/null
```

If a plugin registered a hook you did not approve, remove the hook entry from the agent config and uninstall the plugin that created it. Never let a plugin self-approve its own `trusted_hash` — the trust decision belongs to you, in the agent host.

## Step 4: remove anything you did not opt into

For each unwanted piece, remove it at the source:

1. **Uninstall the plugin** from the agent host (e.g. `codex plugin uninstall <name>` or via Claude's plugin manager)
2. **Remove the marketplace** entry if the plugin came through one
3. **Delete the MCP server** definition from `mcp.json` / `.claude.json` so the agent stops dialing out
4. **Restore the config** from your baseline if the app re-adds entries

In the Postman case, the [requested resolution](https://github.com/postmanlabs/postman-app-support/issues/14370) was a full rollback path covering agent configs, hook trust, marketplaces, caches, MCP connections, and the CLI — and refusing to reinstall without explicit action. Apply the same standard to any tool that pulls itself into your agents.

## Step 5: make consent boundaries explicit going forward

You cannot audit your way out of every future surprise, so engineer the boundary ahead of time:

- **Treat remote MCP servers as networked third parties.** Only connect agents to MCP servers you control or explicitly trust. A remote MCP server can read the same conversation context your agent sees — which often includes secrets.
- **Run AI coding agents sandboxed.** Give the agent only the network and filesystem access it needs. You can reuse the approach in our [sandboxing guide for AI coding agents]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}}).
- **Watch what crosses the wire.** If a tool insists on phoning home, inspect the traffic before you trust it — see our [LLM API security guide]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}}) for how to inspect AI traffic on your own machine.
- **Pin updates and read changelogs.** Auto-updates are how many of these integrations land. Disable silent updates for tools that interact with your agent configs, and review release notes for anything labeled "AI" or "agent."

## The practical takeaway

The Postman report is not a reason to abandon AI coding agents — it is a reminder that **your agent configuration is now a trust boundary**, and tool vendors do not always respect it on your behalf. A baseline backup, a habit of reading config files instead of trusting the UI, and a strict policy on remote MCP servers will keep you in control.

If you are building these workflows for your own use, the same discipline applies to [personal software in the AI era]({{< relref "posts/personal-software-ai-guide-2026/" >}}) — the tools are only as trustworthy as the config you let them write.

Also read:

- [How to Safely Run AI Coding Agents: A Practical Sandboxing Guide [2026]]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}})
- [LLM API Security in 2026: How to Inspect AI Traffic and Protect Your Keys]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
