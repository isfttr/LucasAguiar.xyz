---
date: 2026-07-07T01:51:48.000Z
draft: false
title: How to set up Google Search Console with your Hermes agent
description: 'Step by step to connect Google Search Console to the Hermes agent via MCP: service account, the gsc-mcp server, and the necessary adjustments to run inside Docker.'
featured_image: ''
categories:
  - tutorial
tags:
  - technology
  - artificial-intelligence
  - self-hosting
  - homelab
  - docker
  - mcp
translation_source_hash: 30bc3202d06cd75cb7cf44bc0eb8568803e03b16fbab60c6d34564ed2eb323d9
---
I had been monitoring **Google Search Console** for a while, but the workflow was manual and tedious: open the dashboard, copy the queries, paste them into my agent. It can be done much better. In this tutorial, I show how to connect Search Console directly to **Hermes** — the AI agent running on my homelab — using an **MCP** server, so it can read clicks, impressions, and queries **via API**. I'll cover both what the creator's repository already delivers out of the box and the tweaks I had to make to run everything inside Docker, which is where the official documentation stops helping.

## What is MCP and what gsc-mcp delivers

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard for giving "tools" to AI agents — each MCP server exposes functions the agent can call. For Search Console there is [`google-search-console-mcp`](https://github.com/ncosentino/google-search-console-mcp), by **Nick Cosentino** (Dev Leader), under MIT license.

What made me choose this project:

- **Self-contained binaries**, with *"zero runtime dependencies"* — there are Go and C# (Native AOT) builds for Linux, macOS, and Windows on the [Releases page](https://github.com/ncosentino/google-search-console-mcp/releases/latest). In other words: **you don't need to install Go or Node** to run it. Download the executable and you're done.
- **Three tools, all read-only**: `list_sites` (lists accessible properties), `list_sitemaps` (submitted sitemaps and status), and `query_search_analytics` (clicks, impressions, CTR, and average position — with dimensions like query, page, country, and device, up to 25,000 rows and 16 months of history).
- The [Search Console API is free](https://github.com/ncosentino/google-search-console-mcp): *"No billing account is required."*

Since there are only read-only tools, there is no risk of the agent altering anything in your account — a detail that made me comfortable plugging it into the assistant.

## Prerequisites on Google

This part is the same for any MCP client and is well described in the project's [README](https://github.com/ncosentino/google-search-console-mcp):

1. In [Google Cloud](https://console.cloud.google.com), create/select a project and **enable the Google Search Console API**.
2. Go to **IAM & Admin → Service Accounts**, create a service account, and generate a **JSON key** (download the file).
3. Open the JSON and copy the `client_email` field (something like `gsc-mcp@your-project.iam.gserviceaccount.com`).
4. In [Google Search Console](https://search.google.com/search-console), go to **Settings → Users and permissions → Add user**, paste that email, and grant read permission **for each property** the agent should access.

Important detail: domain properties use the format `sc-domain:example.com` (not `https://www.example.com/`). If you get this wrong, `list_sites` will return empty.

## Where the documentation stops and Hermes begins

All examples in the repository target **desktop clients** — Claude Desktop, Cursor, VS Code. In those, the binary lives on your disk, and the client itself runs it as a subprocess. Simple.

[Hermes](https://github.com/NousResearch/hermes-agent), when you run it self-hosted, lives **inside a Docker container**. And it is Hermes that launches the MCP server (via *stdio*) as a subprocess — **inside the container**. This changes three things:

- The binary **and** the JSON key must exist *in the container's filesystem* — leaving them only on the host won't work.
- The paths in `config.yaml` must be the paths **inside** the container.
- Hermes runs as a non-root user (uid `1000` in my image), so the binary must be executable and the key readable by that user — without leaking the key where it shouldn't.

None of this is in the README, because the README assumes the desktop scenario. This is where I spent my time.

## Step by step (with Docker adjustments)

**1. Download the binary and have the key.** I grabbed `gsc-mcp-go-linux-amd64` from the [releases page](https://github.com/ncosentino/google-search-console-mcp/releases/latest) and `service-account.json` from the previous step.

**2. Put everything on local disk and adjust permissions.** I keep it in a folder next to my `docker-compose.yaml` (local disk, **not** shared storage — more on that in the security section):

```bash
mkdir -p gsc-mcp
mv gsc-mcp-go-linux-amd64 service-account.json gsc-mcp/
chown -R 1000:1000 gsc-mcp                     # = Hermes user inside the container
chmod 755 gsc-mcp/gsc-mcp-go-linux-amd64       # executable
chmod 600 gsc-mcp/service-account.json         # only owner reads private key
```

**3. Mount the folder in the container (read-only).** In the Hermes service, under `volumes:`:

```yaml
    volumes:
      # ... your existing volumes ...
      - ./gsc-mcp:/opt/gsc-mcp:ro
```

**4. Register the MCP server in `config.yaml`.** Hermes reads MCP servers in the top-level [`mcp_servers`](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) block. Note that the paths are the ones **inside** the container:

```yaml
mcp_servers:
  search-console:
    command: /opt/gsc-mcp/gsc-mcp-go-linux-amd64
    args: []
    env:
      GOOGLE_SERVICE_ACCOUNT_FILE: /opt/gsc-mcp/service-account.json
```

**5. Recreate the container.** Since I added a *new volume*, a simple reload is not enough — you need to recreate:

```bash
docker compose up -d
```

(For changes **only** to `config.yaml`, without a new volume, Hermes has hot-reload: just run `/reload-mcp` in a chat session, without restarting anything.)

## Trust, but verify

Before using it, it's worth checking on three levels — this separates "Google problem" from "Hermes problem":

1. **The binary runs inside the container:** `docker exec hermes /opt/gsc-mcp/gsc-mcp-go-linux-amd64 --help`.
2. **Hermes registered the tools:** in the logs you should see something like `MCP server 'search-console' (stdio): registered 3 tool(s)`.
3. **The API responds:** ask the agent to run `list_sites`. The output looks like this:

```json
{"sites":[{"siteUrl":"sc-domain:example.com","permissionLevel":"siteFullUser"}]}
```

If it comes back **empty** or with a permission error, the problem is almost always step 4 of the prerequisites (the service account was not added to the property) — it's not Hermes. A tip from someone who struggled: you can test the binary **alone** by sending an MCP handshake via `stdin` (`initialize` → `tools/call` `list_sites`), isolating Google from the agent before blaming the integration.

## Security: where NOT to store the key

The `service-account.json` is a **private key**. Two precautions worth the whole post:

- **Do not** put the key on a shared volume that other containers/services mount — keep it on **local disk**, mounted as `:ro`, with `chmod 600`.
- **Never** commit it. Add the folder to `.gitignore`:

```gitignore
gsc-mcp/
```

It seems obvious, but it's exactly the kind of file that ends up in a public repository by carelessness.

## Conclusion

With this, the same agent I set up when I [created my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}}) now answers on its own questions like *"which queries brought the most clicks in the last 28 days?"* — pulling the data directly from the API, without me copying and pasting anything. Because the tools are read-only, it's safe to leave connected day to day, and any future tweaks come in with a `/reload-mcp`.

Connecting real data (Search Console, analytics, whatever) via MCP is the game changer that turns a chatbot into an assistant that truly knows *your* context.

Read also:

- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})

You can contact me about this or other topics at my email <contact@lucasaguiar.xyz>.
