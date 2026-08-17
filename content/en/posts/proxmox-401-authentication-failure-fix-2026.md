---
date: 2026-08-17T11:16:25-03:00
draft: true
title: "Proxmox 401 'authentication failure': Fix Login and API Errors [2026]"
description: "Proxmox returns HTTP 401 'authentication failure' on login or API? Causes: wrong realm, user lockout, expired ticket, clock skew. Step-by-step fixes with pveum."
featured_image: ""
categories:
  - article
tags:
  - proxmox
  - troubleshooting
  - linux
  - homelab
  - authentication
---

You open the Proxmox web interface, type your credentials, and nothing happens. The browser's dev tools show a red `401` in the network tab. Or worse: your automation script that worked yesterday now fails with the same code. "authentication failure" is the single most common Proxmox login error — and in most cases it's not a server problem, it's a small configuration detail. Here's how to diagnose and fix it.

## authentication failure (401)

That's the exact error: the Proxmox API returns **HTTP 401** with the body **`authentication failure`** whenever the login endpoint rejects your credentials. You'll see it in three places:

- **Web UI**: the login screen shows `Login failed. Please try again` (older versions) or `Login failed: authentication failure` (newer versions) — the server message embedded in the red error box.
- **API calls**: `curl` and SDKs get `401` with the raw body `authentication failure`.
- **Sessions/console**: with an expired cookie or ticket, the API responds `permission denied - invalid PVE ticket` (and `invalid PVEVNC ticket` for noVNC/console).

The frustrating part: the server deliberately gives the same generic message for wrong passwords, missing users and locked accounts — so you have to check each cause in order.

## Most common causes (ranked)

| # | Cause | Clue |
|---|---|---|
| 1 | Wrong password / username | Recent password change, keyboard layout, caps lock |
| 2 | User doesn't exist in the selected **realm** | Logging in as `root@pve` when the user only exists as `root@pam` (fresh installs create the root user in the PAM realm) |
| 3 | User locked after repeated failed attempts | Proxmox 8.x auto-locks PVE-realm users after too many failures |
| 4 | Expired/invalid ticket | Stale `PVEAuthCookie`, service restart, copied cookie between machines |
| 5 | Clock skew (NTP broken) | Tickets are signed with timestamps; a wrong clock invalidates every ticket immediately |
| 6 | API token misconfiguration | Wrong header format, expired token, wrong `user@realm` |
| 7 | `/etc/pve/access.cfg` missing/corrupt | Cluster-wide auth breakage — see the [deep-dive guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) |

## How to fix it

**1. Confirm the user and realm**

```bash
pveum user list
```

Fresh Proxmox installs authenticate `root` through **Linux PAM standard authentication** (`root@pam`). The `root@pve` user is a separate PVE-internal user that only exists if someone created it. In the login dropdown, pick the correct realm — or log in as `root@pam`.

**2. Unlock a locked user**

```bash
pveum user unlock root@pve
```

**3. Reset a PVE-realm password**

```bash
pveum passwd root@pve
```

**4. Restart the web frontends** after any auth/config change:

```bash
systemctl restart pveproxy pvedaemon
```

**5. Fix clock skew**

Proxmox 8 defaults to chrony. If the server clock is off by more than the ticket lifetime, every login fails:

```bash
systemctl enable --now chrony
systemctl restart chrony
chronyc tracking      # check the offset
chronyc makestep      # if offset is large
```

**6. API tokens: check the header format**

The correct header is `Authorization: PVEAPIToken=USER@REALM!TOKENID=SECRET`. A common mistake is omitting the realm or the exclamation separator:

```bash
pveum user token add root@pam mytoken --privsep 0
# prints the secret — store it now

curl -H "Authorization: PVEAPIToken=root@pam!mytoken=SECRET" \
     https://<host>:8006/api2/json/version
```

**7. Watch the auth log live** while reproducing the failure:

```bash
journalctl -u pveproxy -f | grep -i authentication
```

For the cluster-wide variant (missing `/etc/pve/access.cfg`, corosync issues), I have a [full step-by-step on fixing Proxmox web interface login errors]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) — that cause is rare but catastrophic, and it's not fixed by any of the commands above.

## Prevention

- Use API tokens for automation instead of the ticket endpoint — tokens are revocable and don't expire the same way tickets do. See the [official API docs](https://pve.proxmox.com/wiki/Proxmox_VE_API) and the [pveum man page](https://pve.proxmox.com/pve-docs/pveum.1.html).
- Keep NTP working (`chronyc tracking` in your monitoring).
- Document which realm each user belongs to — most "authentication failure" mysteries are realm confusion.
- Monitor `pveproxy` logs for repeated failed attempts (lockout triggers).

If you're still stuck, these community threads cover the same error in depth: [authentication failure](https://forum.proxmox.com/threads/authentication-failure.178081/) and [API ticket 401 authentication failure](https://forum.proxmox.com/threads/api-ticket-401-authentication-failure.106758/).

Read also:

- [Fix Proxmox Web Interface Login Errors: Missing access.cfg [2026]]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to migrate from Proxmox VE 8 to 9: step-by-step guide [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
