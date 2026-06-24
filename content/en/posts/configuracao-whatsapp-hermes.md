---
date: 2026-06-24T12:45:00.000Z
draft: false
title: 'Enabling WhatsApp on Hermes Agent self-hosted: three pitfalls (and how I overcame them)'
description: 'The saga of plugging WhatsApp into a Hermes Agent running in Docker inside an LXC on Proxmox: from EACCES in npm to the ghostly ''disconnected'' and the Brazilian ninth digit.'
featured_image: ''
categories:
  - tutorial
tags:
  - homelab
  - self-hosting
  - docker
  - proxmox
  - whatsapp
  - ai
translation_source_hash: bc9cf54e90efcf37b7656ed817f7f40c0353d8ece729b700d3a9279119cb5042
---
I wanted a simple thing: to send a message to my AI agent via WhatsApp. The
[Hermes Agent](https://github.com/NousResearch/hermes-agent), from Nous Research,
promises exactly that — you spin up the gateway and talk to it via Telegram,
Discord, Slack, **WhatsApp**, Signal, or email. In theory, it's one command: `hermes
whatsapp`.

In practice, I ended up struggling until I discovered the simplest alternative. This
post is an honest account of **what I tested, what didn't work, and what did work**
— with real logs. If you run Hermes in Docker (especially within an
unprivileged LXC container with data on NAS, like me), you'll probably hit the same three
pitfalls.

## The setup

- Official image `nousresearch/hermes-agent:latest`, via Docker Compose.
- Docker runs inside an **unprivileged LXC on Proxmox** — the same type of
  environment I've already written about when I set up [a script to update Open
  WebUI in an LXC](https://www.lucasaguiar.xyz/posts/script-update-open_webui-lxc/).
- Hermes state (`/opt/data`) lives on a NAS share; the container runs as
  `PUID/PGID=1000`.

Keep these two details in mind — **container runs as uid 1000** and **state is in
`/opt/data`** — because they are the backdrop for the three pitfalls.

## Pitfall 1 — `EACCES` in `npm install`

I ran the setup and got this in my face:

```text
→ Installing WhatsApp bridge dependencies (this can take a few minutes)...
  ✗ npm install failed:
npm error code EACCES
npm error path /opt/hermes/scripts/whatsapp-bridge/node_modules
npm error Error: EACCES: permission denied, mkdir '/opt/hermes/scripts/whatsapp-bridge/node_modules'
```

**What I tested first (and didn't work):** the instinct is to `docker exec` as
root and manually run `npm install`. It doesn't solve it — and the reason is elegant. Looking
at the directory inside the container:

```text
dr-xr-xr-x 1 0 0  4096 ... /opt/hermes/scripts/whatsapp-bridge
```

The entire `/opt/hermes` is **read-only, owned by `root`**, baked into the image. But there's
a hidden detail: the `hermes` command is a *shim* (`/opt/hermes/bin/hermes`) that
**drops root privileges to uid 1000** before running anything — a
security decision to avoid writing files as root to the data volume.
Result: `npm` runs as uid 1000 trying to create `node_modules` in a `root`-only
directory. No permission will grant that.

**What worked:** since the bridge path is fixed in the code
(`/opt/hermes/scripts/whatsapp-bridge`, it can't be moved via env), the solution is to mount
**only the `node_modules`** in a writable and persistent bind-mount. In
`docker-compose.yaml`:

```yaml
volumes:
  - /mnt/nas/hermes:/opt/data
  # node_modules gravável por cima do dir read-only da imagem
  - /opt/docker/hermes/whatsapp-bridge-node_modules:/opt/hermes/scripts/whatsapp-bridge/node_modules
```

I placed the directory on the **local disk** (not on the NAS) on purpose: `node_modules` is
a reproducible dependency, not precious state, and local disk avoids the slowness and
symlink issues of `node_modules` over SMB. `chown 1000:1000` on the host,
recreated the container, and installed as uid 1000.

Then came the **second `EACCES`**, more subtle: `npm install` populates
`node_modules`, but at the end tries to **rewrite `package-lock.json`** — which is also
read-only in the image. The fix is to tell npm not to touch the lockfile:

```bash
npm install --no-package-lock --no-fund --no-audit
# added 143 packages in 8m
```

Detail: the bridge uses [Baileys](https://github.com/WhiskeySockets/Baileys) (the
unofficial WhatsApp Web library), which comes as a dependency **directly from
GitHub** — so the container needs `git` installed to resolve the clone. Luckily, it has it.

I noticed the QR code, scanned it, `creds.json` saved. Victory, right? **No.**

## Pitfall 2 — the "disconnected" ghost

The dashboard showed WhatsApp as **disconnected**, and sending messages to myself
didn't get any response. I checked the gateway logs:

```text
[Whatsapp] Installing WhatsApp bridge dependencies...
[Whatsapp] npm install failed:
[Whatsapp] Disconnecting (external bridge left running)
[Whatsapp] Disconnected
```

This loop every few minutes was the clue. It turns out that **there are two
different installers**. The `hermes whatsapp` wizard is one. But the *gateway* has its
**own launcher** for the bridge (`gateway/platforms/whatsapp.py`), which runs an `npm
install --silent` every time it starts — unless it finds a "deps already
installed" timestamp:

```python
_dep_stamp = bridge_dir / "node_modules" / ".hermes-pkg-hash"
_deps_fresh = (_dep_stamp.read_text().strip() == sha256(package.json)[:16])
if not _deps_fresh:
    # roda npm install --silent  → morre no package-lock.json read-only
```

Since I installed manually with `--no-package-lock`, this timestamp was never written.
So the gateway thought it needed to install, tried again, hit the same
read-only lockfile, and **disconnected in a loop**.

**What worked:** writing the timestamp manually, with exactly the hash the gateway
expects, and restarting:

```bash
# .hermes-pkg-hash = primeiros 16 hex do sha256 do package.json
python3 -c "import hashlib,pathlib; \
  bd=pathlib.Path('/opt/hermes/scripts/whatsapp-bridge'); \
  (bd/'node_modules'/'.hermes-pkg-hash').write_text( \
    hashlib.sha256((bd/'package.json').read_bytes()).hexdigest()[:16])"
```

I restarted and finally:

```text
[Whatsapp] Bridge ready (status: connected)
[Whatsapp] Bridge started on port 3000
```

`/health` returning `{"status":"connected"}`. **Now it really worked**, I thought. (Spoiler: not yet.)

## Pitfall 3 — the Brazilian ninth digit

Bridge connected, account paired… and the messages I sent to myself
**still got no response**. I turned on the bridge's debug log and saw the truth:

```json
{"event":"ignored","reason":"self_chat_mode_rejects_non_self",
 "chatId":"5561XXXXXXXX@s.whatsapp.net","senderId":"5561XXXXXXXX@s.whatsapp.net"}
```

The messages **arrived** — and were **rejected**. Notice the number WhatsApp
reported. In the session's `creds.json`, my account ID was:

```text
me.id = +55 61 9•••-••••   (12 dígitos — SEM o nono dígito)
```

But in the allowlist, I had registered my number as I dial it:

```text
allowlist = +55 61 99•••-••••  (13 dígitos — COM o nono dígito)
```

This is the famous **ninth digit**. Since 2012, Brazil has been adding the `9` to
the front of cell phone numbers, a process nationally concluded in [February 2017,
according to Anatel](https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito).
The problem: **many WhatsApp accounts — especially older ones —
have the internal JID *without* the ninth digit**, even if the number you dial has it. The
`@s.whatsapp.net` for my account simply didn't have the extra `9`.

In *self-chat* mode, the bridge only processes messages whose sender matches the
account's identity. My comparison of `99•••-••••` with `9•••-••••` resulted in a mismatch — and
every message of mine was discarded as "not me".

**What worked:** changing the registered number to the **8-digit version** (without
the ninth), matching the real JID. Message sent, instant reply. End of the saga.

## Summary: what didn't work × what worked

| Pitfall | What did NOT solve it | What solved it |
|---|---|---|
| `EACCES` in npm | `docker exec` as root; install in image dir | Writable `node_modules` bind-mount + `npm install --no-package-lock` |
| "disconnected" in loop | Reinstall deps; re-pair | Write the `.hermes-pkg-hash` stamp = `sha256(package.json)[:16]` |
| No response in self-chat | Check allowlist with the "correct" number (with the 9) | Use the number **without** the ninth digit, as in the JID |

## Lessons I take away

1.  **Read-only image + non-root process = think bind-mounts**, not `chmod`.
    The Hermes image design is deliberate; fighting it is worse than
    following it.
2.  **When something "installs in a loop", look for the gate.** The
    `.hermes-pkg-hash` stamp is invisible until you read the code — and it's the kind of thing that
    will bite me again in the next image update (when `package.json`
    changes, I'll have to re-create the stamp).
3.  **In Brazil, phone numbers are always a trick.** In any WhatsApp/SMS integration, the
    ninth digit will appear. When comparing identity (allowlist, self-chat), **use the form the service uses
    internally**, not the one you dial.

If you're good at homelab troubleshooting, you might also like my
account of when [Proxmox login stopped
working](https://www.lucasaguiar.xyz/posts/troubleshooting-proxmox-login-interface/)
— another hunt for a not-so-obvious root cause.

Read also:

- [Script for Updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
