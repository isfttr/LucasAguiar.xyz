---
date: 2026-10-22T15:02:14-03:00
draft: true
title: "How to Use the OpenAI CLI: The Official Terminal Client for the OpenAI API [2026]"
description: "Complete guide to the official OpenAI CLI [2026]: installing, API key setup, chat and image commands, JSON output for scripts, and security tips."
featured_image: ""
categories:
  - article
tags:
  - openai
  - cli
  - llm
  - automation
  - dev-tools
scheduledAt: 2026-10-27T12:54:00.000Z
---
The OpenAI CLI is the official command-line client for the OpenAI REST API. It hit the front page of Hacker News in October 2026 with more than two hundred points, and for good reason: it replaces hand-written `curl` calls with a tool that handles authentication, token usage, readable output and JSON parsing for you. Think of it as `gh` for GitHub, but for the OpenAI API — call models, generate images, upload files and submit batches straight from a terminal or a cron job.

## OpenAI CLI vs Codex CLI: what's the difference?

The most common confusion in the Hacker News thread was exactly this: isn't Codex the "OpenAI CLI"? The project's own README settles it:

- **`openai`** — call a specific API operation or put API calls in a script. Generate an image, upload a file, run a batch, list models.
- **`codex`** — a coding agent that works on a project: reads and edits code, runs commands, implements or debugs a change.

Both are separate binaries. If you want an agent that writes code, Codex is your tool. If you want to script the API, `openai` is. They complement each other — a common pattern is using `openai` inside a script that an agent or a cron job drives.

## Installing the OpenAI CLI

There are three supported paths. The simplest is the prebuilt binary from [GitHub Releases](https://github.com/openai/openai-cli/releases/latest): download the archive for macOS, Linux or Windows, extract it and put `openai` in a directory on your `PATH`.

On macOS, Homebrew is one command:

```sh
brew install openai/tools/openai
```

If you have Go 1.26 or newer, you can also build it directly:

```sh
go install 'github.com/openai/openai-cli/cmd/openai@latest'
```

The binary lands in your Go bin directory (`$HOME/go/bin` by default) — add it to your `PATH` if commands aren't found. The CLI checks for updates on interactive runs but never installs them automatically; set `OPENAI_CLI_NO_UPDATE_CHECK=1` if you want to silence that.

## Authentication: setup guide or environment variable

Run the interactive setup once to store your API key safely:

```sh
openai help setup
```

For scripts, the cleaner approach is the `OPENAI_API_KEY` environment variable, set through your secret manager rather than hardcoded. You can create a key in the [API settings page](https://platform.openai.com/settings/organization/api-keys). Admin endpoints use a separate `OPENAI_ADMIN_KEY` — for example, to pull a day of organization usage:

```sh
openai admin organization usage completions \
  --start-time 1735689600 \
  --end-time 1735776000 \
  --bucket-width 1d
```

Try a first request with:

```sh
openai responses create \
  --model gpt-5.5 \
  --input "Say this is a test"
```

Run `openai models list` to see which models your account can access — model names change faster than blog posts do.

## Everyday commands worth knowing

The command structure mirrors the API resources: `openai <resource> <command> [flags]`. A few that I reach for constantly:

```sh
openai images generate --prompt "A tiny orange robot watering a houseplant"
openai files upload report.txt --purpose user_data
openai files download file-example --output downloaded-report.txt
openai responses create --model gpt-5.5 --input @prompt.txt
```

Generated images are saved to `~/Downloads/gpt-images/` and the command prints the paths. The `@file` syntax reads a local file into a JSON input — handy for long prompts stored in files.

For batch workloads, submit a JSONL request file and wait for results:

```sh
openai files upload requests.jsonl --purpose batch
openai batches create --input-file-id file-example \
  --endpoint /v1/responses --completion-window 24h
openai batches wait batch_example --output-dir ./results
```

There are also guides for audio generation, local token counting (no network needed) and webhook testing — covered in the [project's guides](https://github.com/openai/openai-cli#guides).

## Where the CLI shines: scripting and automation

This is the part that made me keep the tool. By default, successful JSON responses display as readable text — even when piped, which is unusual and thoughtful. When you do want the raw data, be explicit about the format:

```sh
openai models list --format jsonl | jq '.id'
openai files list --format json > files.json
```

The `--transform` flag extracts fields with [GJSON syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md), which is perfect for pulling one value out of a response:

```sh
openai files get file-example --transform filename --raw-output
```

Errors go to stderr as readable summaries; use `--format-error json` to inspect API error details in scripts. One caveat the docs stress: **always check the exit status before using redirected output** — a failed request can leave an incomplete output file.

For anything that reads from an untrusted pipe, set `OPENAI_UNTRUSTED_STDIN=1` so input can't trigger local file reads. And if you use credential-bearing headers, export `OPENAI_CUSTOM_HEADERS` in the CLI's environment instead of typing secrets into command arguments — they stay out of shell history and are redacted in debug logs.

## Security notes

- Keep keys in environment variables or a secret manager, never in command arguments.
- `--debug` logs include HTTP request/response bodies — sanitize before sharing.
- Mutual TLS is in beta: configure `OPENAI_BASE_URL=https://mtls.api.openai.com/v1` plus the client certificate/key files.
- The CLI never auto-updates, which is a good default for a tool that may sit in CI pipelines.

## Reception and honest caveats

The Hacker News discussion split into two camps. One side said "it's just curl with extra steps"; the other pointed out, correctly, that `gh` won for the same reason — token-aware formatting, sane errors and less boilerplate beat raw `curl` for day-to-day use. The fair criticism is the one about OpenAI's tooling churn: the company has deprecated interfaces quickly in the past, so treat any CLI as a convenience layer, not a platform bet. Keep scripts small, prefer documented flags over undocumented ones, and the migration cost stays near zero if a replacement ever appears.

## When not to use it

If you're building an application, use the SDKs — this CLI is a terminal tool, not a library. If you need one-off debugging against a specific endpoint, `curl` with a stored key is fine. But for the middle ground — scheduled jobs, image pipelines, batch submissions, quick model checks from a homelab box — the official CLI removes the boilerplate that makes people avoid the API entirely. It's the tool I now reach for first.

Also read:

- [How AI Coding Agents Actually Work: An Architectural Guide [2026]]({{< relref "posts/ai-coding-agents-architectural-guide-2026/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

You can reach out to contact me about this and other topics by filling the form below.

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.
