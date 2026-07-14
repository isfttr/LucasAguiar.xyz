---
date: 2026-07-13T15:05:20-03:00
draft: true
title: "How to Safely Run AI Coding Agents: A Practical Sandboxing Guide [2026]"
description: "Step-by-step guide to sandboxing AI coding agents like Claude Code, Codex, and Cursor. Prevent data leaks, restrict network access, and run agents safely with Docker, VMs, and permission scoping."
categories:
  - article
tags:
  - ai
  - security
  - dev
  - homelab
  - linux
---

An AI coding agent with filesystem access is a vulnerability waiting to happen. Last week, it was Grok CLI uploading an entire home directory to Google Cloud Storage. Next week, it could be your API keys, your SSH keys, or your client's database credentials ending up somewhere they should not be.

The problem is structural: AI coding agents need broad system access to be useful. They install packages, edit files, run tests, and connect to servers. But the same access that makes them productive makes them dangerous — especially when prompt injection or simple tool misuse can turn an agent into an unintentional exfiltration vector.

This guide covers the practical approaches to sandboxing AI coding agents, from lightweight permission scoping to full VM isolation. You will learn what each approach protects against, what it misses, and how to set it up.

## The Threat Model

Before choosing a sandboxing strategy, understand what you are protecting against.

**Data exfiltration** — The agent reads a file containing secrets (API keys, SSH keys, .env files) and writes them to an external server. This can happen through direct tool calls (the agent runs `curl` with the file content) or through indirect channels (the agent includes the secret in a commit pushed to a remote).

**Filesystem corruption** — The agent runs `rm -rf` on the wrong directory, overwrites configuration files, or modifies files it should not touch. Even well-intentioned agents can make destructive mistakes — the Grok CLI incident was not malicious; the agent simply followed instructions to "back up" the home directory without understanding which files should stay local.

**Supply chain injection** — While installing dependencies, the agent downloads a malicious package from a compromised registry. The agent's trust in package registries is your attack surface.

**Prompt injection escalation** — An attacker embeds instructions in a file, issue, or comment that the agent reads. The agent follows the attacker's commands with the privileges of your account — reading private repos, pushing code, or exposing credentials.

## Approach 1: Permission Scoping (Lightest)

The simplest sandbox is the one built into your agent's configuration. Most modern coding agents support some form of permission scoping.

**Claude Code** has built-in permission levels:

```bash
# Default: prompt for every potentially dangerous action
claude

# Skip prompts but still warn (not recommended for production)
claude --dangerously-skip-permissions

# Restrict filesystem access to a specific directory
claude --allowed-directories /home/user/project
```

The `--allowed-directories` flag is the most important. It restricts file read/write operations to the specified path, preventing the agent from accessing SSH keys in `~/.ssh`, token files in `~/.config`, or credentials in `.env` files outside the project directory.

**Aider** has a `--read` flag that limits the agent to read-only access on specified files:

```bash
# Agent can read everything but only edit specified files
aider --read-only README.md --read-only .env.example
```

**Cursor/Windsurf** have project-level trust settings. VSCode's workspace trust model applies here: if you mark a project as "restricted," the agent cannot access files outside the workspace folder.

**What permission scoping protects against:** Accidental reads of sensitive files outside the project. Accidental modification of system configuration.

**What it misses:** Malicious data exfiltration within the allowed scope. If your project contains API keys (it should not, but many do), a compromised agent can still read and exfiltrate them. Prompt injection is not prevented — the agent can still be tricked into writing secrets to a remote server or pushing them to a public repository.

## Approach 2: Container-Based Isolation (Medium)

Docker containers provide stronger isolation by restricting the agent's view of the filesystem and network to what you explicitly mount and allow.

### Basic Docker Sandbox

```dockerfile
FROM python:3.12-slim

# Install your tools
RUN apt-get update && apt-get install -y \
    git curl jq \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /project
COPY . /project

# Run as non-root user
RUN useradd -m agent
USER agent
ENTRYPOINT ["claude"]
```

Run it with restricted mounts and read-only where possible:

```bash
docker build -t ai-sandbox .
docker run --rm -it \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --mount type=bind,source=$(pwd),target=/project \
  --network ai-restricted \
  ai-sandbox
```

### Network Restrictions

The `--network` flag is critical. Create a custom Docker network with allow-listed outbound access:

```bash
docker network create --driver bridge ai-restricted

# Allow specific registries
# Docker's network firewall does not support per-URL allow-listing natively.
# Instead, use a forward proxy:
docker run -d --name ai-proxy \
  --network ai-restricted \
  -e ALLOWED_DOMAINS="github.com,registry.npmjs.org,pypi.org" \
  your-proxy-image

docker run --rm -it \
  --network ai-restricted \
  --env HTTP_PROXY=http://ai-proxy:8080 \
  --env HTTPS_PROXY=http://ai-proxy:8080 \
  --mount type=bind,source=$(pwd),target=/project \
  ai-sandbox
```

For a simpler approach without a proxy, use `--network none` and only let the agent work on local code — no package installs, no git push. You lose utility, but the isolation is absolute.

### Docker Security Best Practices

```bash
# Read-only root filesystem prevents system modification
# No new privileges prevents privilege escalation
# Seccomp profile restricts system calls
docker run --rm -it \
  --read-only \
  --security-opt=no-new-privileges:true \
  --security-opt=seccomp=default \
  --cap-drop=ALL \
  --mount type=bind,source=$(pwd),target=/project \
  ai-sandbox
```

**What container isolation protects against:** Filesystem access outside the mounted project directory. System-level compromise. Network exfiltration (with proper proxy/no-network setup). Most supply chain attacks (limited to the container's lifecycle).

**What it misses:** The agent can still exfiltrate any file inside the mounted project. If your `.env` file is in the project root, it is accessible. Container escape vulnerabilities exist (rare, but real for shared kernel scenarios). Docker socket binding (mounted `/var/run/docker.sock`) would give the container root access to the host — never do this for AI agents.

## Approach 3: Full VM Isolation (Strongest)

For maximum isolation, run the agent inside a disposable virtual machine. This is what [Clawk](https://github.com/clawkwork/clawk) does — it provisions a lightweight Linux VM per project, mounts your code inside, and restricts the network to an allow-list.

```bash
# Install Clawk
brew install clawkwork/tap/clawk

# cd into your project and launch an agent inside a VM
cd my-project
clawk

# The agent gets a full Linux VM with:
# - Your project files mounted read-write
# - Your SSH agent forwarded (for git push)
# - Network restricted to allow-list only
# - No access to ~/.ssh, ~/.config, or anything outside the project

# Blocking an exfiltration attempt:
$ curl https://tracker.evil.example
# => curl: (7) Failed to connect: Connection refused

# Your keys never entered the VM:
$ cat ~/.ssh/id_rsa
# => cat: /home/agent/.ssh/id_rsa: No such file or directory

# But git push still works (ssh-agent forwarded):
$ git push
# => Enumerating objects: 5, done.
```

When the agent inevitably breaks something:

```bash
clawk destroy && clawk     # fresh VM, same repo
clawk --resume              # restore conversation from previous session
```

### Alternative: Manual QEMU/Libvirt Setup

If you prefer not to use a dedicated tool, a manual VM with virt-manager or `virsh` works:

```bash
# Create a lightweight VM with cloud-init
virt-install \
  --name ai-agent-sandbox \
  --memory 2048 \
  --vcpus 2 \
  --disk size=10 \
  --network default \
  --cloud-init user-data=cloud-init.yaml \
  --os-variant ubuntu24.04

# The cloud-init script installs your tools and sets up
# network restrictions via iptables/nftables
```

The blog has a [detailed guide on KVM/libvirt virtualization]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) if you want to set this up from scratch.

**What VM isolation protects against:** Everything. The agent cannot escape the VM boundary. Your host filesystem, SSH keys, API tokens, and personal data are physically isolated. Network allow-listing prevents exfiltration to unknown servers. Even if the agent is compromised through prompt injection, the attacker gains access to a disposable VM with no secrets.

**What it misses:** Forwarded SSH agent — the agent can push to allowed remotes, which means it could push sensitive code to a public repository if instructed. The VM host's clipboard (copy/paste) can leak data if shared. Performance overhead is higher than Docker.

## Practical Recommendations

| Approach | Setup Time | Security | Performance | Best For |
|----------|-----------|----------|-------------|----------|
| Permission scoping | Minutes | Low | Native | Quick tasks, trusted codebases |
| Docker sandbox | 30 minutes | Medium | Near-native | Regular development, semi-trusted projects |
| VM isolation | 1-2 hours | High | Moderate | Sensitive projects, untrusted code, client work |

**For daily development on your own projects:** Start with permission scoping (`--allowed-directories`). Add Docker isolation when working with code that involves API keys or third-party dependencies. Use full VM isolation for client projects where confidentiality is contractual.

**For reviewing untrusted code:** Always use VM isolation. If you are running an AI agent on code from an unknown source (a PR from a new contributor, a codebase you cloned from GitHub without review), the agent could be compromised by malicious files in the repository. Disposable VM isolation is the only safe option.

**For CI/CD pipelines:** Use ephemeral Docker containers or VMs built fresh for each run. Never mount CI credentials directly — use environment-scoped secrets and pass them explicitly. Tools like GitHub Actions' `services` or GitLab CI's `services` keyword provide container-level isolation for free.

## The Bottom Line

The Grok CLI incident was inevitable. Not because Grok is uniquely dangerous, but because every AI coding tool with broad filesystem access shares the same vulnerability surface. The only fix is isolation — a boundary that cannot be talked out of, overridden, or ignored by the agent.

The right level of isolation depends on what you are protecting. If your project has no secrets, permission scoping might be enough. If it has API keys, client data, or credentials, go with at least Docker-level isolation. If confidentiality is contractual or regulatory (SOC 2, HIPAA, GDPR), VM isolation is the only defensible choice.

The pattern is clear: AI agents are tools, not employees. Trust them with isolated environments, not with your home directory.

Read also:

- [KVM and Virsh on Linux: Complete Guide to Virtual Machines [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [KVM and Virsh on Linux: Complete Guide to Virtual Machines [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [GitLost [2026]: How Prompt Injection in GitHub's AI Agent Leaks Private Repos]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
