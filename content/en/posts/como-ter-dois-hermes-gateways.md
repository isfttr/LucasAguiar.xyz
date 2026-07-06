---
date: 2026-07-05T13:00:00.000Z
draft: false
title: 'How to Run Two Hermes Gateways: One Remote and One Local'
description: Practical guide to configuring two Hermes profiles — one remote, one local on Mac. Includes the mental model that avoids 90% of the confusion and all the problems I encountered along the way.
featured_image: ''
categories:
  - article
tags:
  - hermes
  - agentes-ia
  - auto-hospedagem
  - macos
  - gateway
  - devops
translation_source_hash: 0bc1946805a07d8e1a2fbcfe019c0483932c505e2dce8f3e32027dd7c7db46ae
---
I wanted something seemingly simple: keep my `default` profile in [Hermes](https://hermes-agent.nousresearch.com/docs/) pointing to my remote instance while also having a second profile — `macbook-local` — running **100% on my Mac**. Switching between them directly from the desktop app.

"Simple" lasted until I discovered that Hermes has **several independent notions of 'active profile' and 'local vs. remote'**, and they don't talk to each other automatically. This post is the guide I wish I had: first the mental model, then the correct step-by-step, and finally all the problems I encountered and how I solved each one.

> Environment: macOS (Apple Silicon M2), Hermes Agent v0.17.x, desktop app (Electron). The desktop config paths are macOS-specific; on Linux they live at `~/.config/hermes/`.

---

## The mental model (read before you start configuring)

The mistake almost everyone makes (myself included) is thinking that "profile" and "local vs. remote" are the same thing. They are not. There are **four independent pieces**:

| Piece | What it controls | Where it lives |
|-------|-----------------|----------------|
| **Gateway** | Messaging + cron layer (WhatsApp, Telegram, scheduled jobs). Runs as a `launchd` service. | `~/Library/LaunchAgents/ai.hermes.gateway-<profile>.plist` |
| **Desktop backend** | What the desktop app uses for chat. In local mode, the app **spins up its own backend** (`hermes dashboard`) on an ephemeral port `127.0.0.1`. In remote mode, it connects to a URL. | child process of the app |
| **CLI active profile** | Which profile the terminal uses. | `~/.hermes/active_profile` |
| **Desktop active profile** | Which profile the **app** uses. **It is a separate file** from the CLI's. | `~/Library/Application Support/Hermes/active-profile.json` |
| **Desktop connection mode** | Whether the app runs locally or remotely (global + per-profile override). | `~/Library/Application Support/Hermes/connection.json` |

The two points that cause the most confusion:

1. **Gateway ≠ desktop backend.** The *gateway* is the messaging/cron worker; it connects *outward* (it does not open a TCP port for the desktop). The *desktop backend* is something else: in local mode, the app spawns a `hermes dashboard` on an ephemeral port. That is, fixing the gateway **does not** make the desktop go local — they are separate paths.

2. **The desktop has its own "active profile".** Running `hermes profile use macbook-local` changes only the CLI. The desktop app reads *its own* `active-profile.json`. If it does not exist, the app falls back to `default` — no matter what the CLI says.

Once you internalize those two truths, the rest flows.

### How local vs. remote resolution works

`connection.json` looks like this:

```json
{
  "mode": "local",
  "remote": {},
  "profiles": {
    "default": { "mode": "remote", "url": "http://YOUR-REMOTE-HOST", "authMode": "oauth" }
  }
}
```

The precedence, **per profile**, is:

1. Remote override per profile (`profiles[<name>]`) →
2. Env override (`HERMES_DESKTOP_REMOTE_URL/_TOKEN`) →
3. Global `mode: "remote"` →
4. otherwise, **local**.

The crucial (and counterintuitive) detail: **a per-profile override can only point a profile to *its own remote* — it cannot force a profile to be local while the global `mode` is `remote`.**

Therefore, to have "some local, some remote", the recipe is:

- Global `mode` = **`local`** (this becomes the default for everyone), and
- each profile that should be **remote** goes in as an **override** in `profiles`.

That is why, in my case, `default` (remote) becomes an override and `macbook-local` (local) simply inherits the global.

---

## Step by step

Prerequisite: you already have `default` working against a remote instance and want to **add** the local `macbook-local`.

### 1. Create the local profile

```bash
hermes profile create macbook-local
# (optional) clone config/skills from an existing profile:
#   see flags at: hermes profile create --help
```

### 2. Configure the profile for local

```bash
hermes --profile macbook-local config edit
```

The essentials:

```yaml
model:
  # your local model/provider (e.g., deepseek, ollama, openai-compat…)
  provider: deepseek

terminal:
  backend: local        # runs on your Mac
  cwd: /path/to/your/project

gateway:
  host: 127.0.0.1
  port: 8091            # see note below
```

> **Note on the port:** the `gateway.host/port` is for the *messaging gateway*. The **desktop backend** in local mode starts on its **own ephemeral port** (`--port 0`), so you **do not** need to worry about 8091 for the app's connection. Leave it configured, but know that is not how the desktop connects.

Also make sure credentials are in the profile's `.env`:

```bash
hermes --profile macbook-local config env-path   # shows the .env path
```

### 3. Start the local profile's gateway — **never with `sudo`**

```bash
hermes --profile macbook-local gateway install   # creates the launchd service (runs as you)
hermes --profile macbook-local gateway start
hermes --profile macbook-local gateway status     # should show "running" / LastExitStatus 0
```

> **The golden rule:** run gateway commands **always as your normal user**. If you use `sudo` even once, the gateway creates runtime files (`gateway.lock`, `gateway.pid`, etc.) owned by `root`, and then your user's service **can never** start again (I detail this in the problems section). If you fall into this, the fix is also below.

### 4. Configure the desktop connection (default remote + macbook-local local)

You can do it via the app (**Settings → Gateway**) or by editing the file directly. Editing the file is more explicit:

```bash
# backup first
cp ~/Library/Application\ Support/Hermes/connection.json \
   ~/Library/Application\ Support/Hermes/connection.json.bak
```

Set `~/Library/Application Support/Hermes/connection.json` to:

```json
{
  "mode": "local",
  "remote": {},
  "profiles": {
    "default": {
      "mode": "remote",
      "url": "http://YOUR-REMOTE-HOST",
      "authMode": "oauth"
    }
  }
}
```

This says: "by default, everything local; **except** `default`, which is remote." (`authMode` can be `oauth` or `token` — if `token`, you also store the token here.)

### 5. Point the **desktop** to the local profile

This is the step almost everyone forgets. Create/edit `~/Library/Application Support/Hermes/active-profile.json`:

```json
{ "profile": "macbook-local" }
```

Once the profile selector appears in the app (it only shows when **2+ profiles** are visible), you can also switch from there — but for the app to *open* in local mode the first time, this file must exist.

### 6. Restart the desktop app

- **Cmd+Q** on Hermes (close it properly — just closing the window is not enough on macOS).
- Reopen.

> **The first local startup takes ~30-60s** on a loading screen: the app recompiles the web UI the first time. This is normal — let it finish.

### 7. Verify

```bash
# Both profiles visible, gateways "running":
hermes profile list

# The local gateway runs as YOU (your user uid), not root:
ps -eo pid,uid,user,command | grep "profile macbook-local gateway run" | grep -v grep

# No profile files owned by root:
find ~/.hermes/profiles/macbook-local -user root    # (empty = ok)
```

In the app, you should see the **profile selector** with `macbook-local` (local, active) and `default` (remote). Clicking `default` redirects the backend to remote; clicking `macbook-local` starts the local backend.

---

## Problems I encountered (and how I fixed each)

This is the part nobody documents. There were three real problems (cascading) and a few minor warnings.

### Problem 1 — The local gateway wouldn't start: `PermissionError` on `gateway.lock`

**Symptom:** the `launchd` service for `macbook-local` failed on every attempt and the app fell back to remote. In the log:

```
PermissionError: [Errno 13] Permission denied:
  '.../profiles/macbook-local/gateway.lock'
  at gateway/status.py: is_gateway_runtime_lock_active → get_running_pid → start_gateway
```

**Root cause:** at some point the gateway had been started with `sudo`. This left:
- an **orphan process running as `root`** (reparented to PID 1), and
- 4 runtime files owned by `root`: `gateway.lock`, `gateway.pid`, `gateway_state.json`, `channel_directory.json`.

With `gateway.lock` owned by root, my user's service could not even open the file (mode `a+`) to check if a gateway was already running → `PermissionError` → `exit 1` → launchd's `KeepAlive` kept looping → the desktop gave up and went remote.

**How I fixed it:**

```bash
# 1. Stop the service that kept trying (and failing)
hermes --profile macbook-local gateway stop
#    (equivalent: launchctl bootout gui/$UID/ai.hermes.gateway-macbook-local)

# 2. Kill the orphan root process (needs sudo — it's root)
sudo kill <PID_OF_ROOT_PROCESS>

# 3. Give the runtime files back to your user (or delete them; they are recreated)
sudo chown $USER:staff ~/.hermes/profiles/macbook-local/gateway.lock \
                       ~/.hermes/profiles/macbook-local/gateway.pid \
                       ~/.hermes/profiles/macbook-local/gateway_state.json \
                       ~/.hermes/profiles/macbook-local/channel_directory.json

# 4. Remove stale lock/pid/state (they point to the already dead process)
rm -f ~/.hermes/profiles/macbook-local/gateway.lock \
      ~/.hermes/profiles/macbook-local/gateway.pid \
      ~/.hermes/profiles/macbook-local/gateway_state.json

# 5. Start again, as a normal user
hermes --profile macbook-local gateway start
```

Result: gateway running with my uid, `gateway.lock`/`gateway.pid` recreated with correct ownership, `PermissionError` gone.

**Prevention:** **never** run `hermes ... gateway ...` with `sudo`. That was the root cause of everything.

> Tip: you can delete root-owned files **without sudo** if the parent directory is yours (`rm` depends on write permission on the directory, not file ownership). `sudo` is only truly needed for **killing the root process**.

### Problem 2 — Even with the gateway OK, the desktop stayed remote

**Symptom:** local gateway 100% healthy, but `desktop.log` insisted:

```
[boot] Connecting to remote Hermes backend at http://YOUR-REMOTE-HOST
[boot] Remote Hermes backend is ready
```

**Root cause:** the app's "local vs. remote" **does not come from the gateway** — it comes from `connection.json`, which had `mode: "remote"`. Fixing the gateway does not change this file. They are independent paths (remember the mental model?).

**How I fixed it:** changed `connection.json` to global `mode: "local"`, with `default` as a **remote override** (exactly the JSON from Step 4). Then `macbook-local` inherits `local`.

### Problem 3 — After switching to local, the desktop only showed the `default` profile

**Symptom:** restarted the app and… only `default` appeared. `macbook-local` worked in the CLI but **did not even appear** in the app's selector.

**Root cause:** two things combined:
- The app uses **its own** `active-profile.json`, which **did not exist** → the app opened in `default`.
- Since `default` is remote (by my override), the app connected to the remote server, which only exposes `default`. And the app's profile selector **is hidden when there are fewer than 2 visible profiles**.

In other words: the app was on the wrong profile (`default`/remote), so it never even saw the local `macbook-local`.

**How I fixed it:** created `~/Library/Application Support/Hermes/active-profile.json` with `{ "profile": "macbook-local" }` (Step 5). Then the app opens in `macbook-local`, starts the local backend, and the local `/api/profiles` lists **both** profiles → the selector appears.

> Before asking for another restart, I also "dry-tested" the local backend with  
> `hermes --profile macbook-local dashboard --no-open --host 127.0.0.1 --port 0`  
> and confirmed the `HERMES_DASHBOARD_READY port=<n>` signal. Worth the habit: validate the backend in isolation before restarting the app.

### Minor issues (non-blocking)

They appeared in the logs but **did not** prevent the local setup — I am logging them so you do not panic:

- **WhatsApp bridge failing** (`Bridge process died (exit code 1)`): messaging platform connection/credential issue. The gateway keeps running ("continue for cron job execution").
- **MCP `composio` with `401 Unauthorized`**: MCP token expired. Does not affect the gateway or local backend.
- **`kanban dispatcher lock` already held by another gateway**: because I left **both** gateways running (default + local), the default one held the kanban dispatcher lock. If you want the local one to be the "owner", just stop the other profile's gateway (`hermes gateway stop`) — but it's optional.

---

## Lessons I take away

1. **Separate the concepts.** In Hermes there are *four* independent things: gateway (messaging/cron), desktop backend (chat), CLI active profile, and desktop active profile — plus the connection mode. Half the confusion disappears when you stop treating them as one.
2. **Gateway ≠ desktop backend.** The gateway does not open a port for the app; the app's local backend is a `hermes dashboard` on an ephemeral port.
3. **The desktop has its own `active-profile.json`.** `hermes profile use` in the CLI does not change the app.
4. **For "some local, some remote": global `local` + remote overrides.** A per-profile override cannot force local over a global remote.
5. **Never `sudo` on the gateway.** The root cause of everything was runtime files owned by root.

---

## Conclusion

In the end, the ideal setup ("`default` remote, `macbook-local` local, switching via the app") is just **three well-configured files** — `connection.json`, `active-profile.json`, and the profile's `config.yaml` — plus the gateway service running as your user. What turned it into a saga was treating independent pieces as if they were one. I hope this guide saves you the back-and-forth I went through.

If this post helped you (or if you fell into the same `PermissionError`), let me know.

Read also:

- [Enabling WhatsApp on Hermes Agent self-hosted: three pitfalls (and how I overcame them)]({{< relref "posts/configuracao-whatsapp-hermes/" >}})
- [Creating my local AI assistant]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Feel free to reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
