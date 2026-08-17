---
date: 2026-08-17T14:16:25.000Z
draft: false
title: 'Proxmox 401 ''authentication failure'': Fix Login and API Errors [2026]'
description: 'Does Proxmox return HTTP 401 ''authentication failure'' on login or API? Causes: wrong realm, blocked user, expired ticket, unsynchronized clock. Fixes with pveum.'
featured_image: ''
categories:
  - article
tags:
  - proxmox
  - solucao-de-problemas
  - linux
  - homelab
  - autenticacao
slug: proxmox-401-authentication-failure-fix
translation_source_hash: 36d2ed68c39f012fc5122849dbb01a035c36a2691bd0399a2a3349dcc2c165ea
---
You open the Proxmox web interface, enter your credentials, and nothing happens. The browser's dev tools show a red `401` in the network tab. Or worse: your automation script that worked yesterday now fails with the same code. "authentication failure" is Proxmox's most common login error — and in most cases it's not a server problem, it's a small configuration detail. Here's how to diagnose and fix it.

## authentication failure (401)

This is the exact error: the Proxmox API returns **HTTP 401** with the body **`authentication failure`** whenever the login endpoint rejects your credentials. You'll see it in three places:

- **Web interface**: the login screen shows `Login failed. Please try again` (old versions) or `Login failed: authentication failure` (new versions) — the server message embedded in the red error box.
- **API calls**: `curl` and SDKs receive `401` with the raw body `authentication failure`.
- **Sessions/console**: with an expired cookie or ticket, the API responds `permission denied - invalid PVE ticket` (and `invalid PVEVNC ticket` for noVNC/console).

The frustrating part: the server deliberately returns the same generic message for wrong password, nonexistent user, and blocked account — so you need to check each cause in order.

## Most common causes (in order)

| # | Cause | Clue |
|---|---|---|
| 1 | Wrong password / user | Recent password change, keyboard layout, caps lock |
| 2 | User does not exist in the selected **realm** | Logging in as `root@pve` when the user only exists as `root@pam` (new installs create root in the PAM realm) |
| 3 | User blocked after repeated attempts | Proxmox 8.x automatically blocks users from the PVE realm after too many failures |
| 4 | Expired/invalid ticket | Old `PVEAuthCookie`, service restart, cookie copied between machines |
| 5 | Unsynchronized clock (broken NTP) | Tickets are signed with a timestamp; wrong clock invalidates all tickets immediately |
| 6 | Misconfigured API token | Wrong header format, expired token, wrong `user@realm` |
| 7 | `/etc/pve/access.cfg` missing/corrupted | Breaks authentication on the entire cluster — see the [in-depth guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) |

## How to fix

**1. Confirm the user and the realm**

```bash
pveum user list
```

New Proxmox installs authenticate `root` via **Linux PAM standard authentication** (`root@pam`). The `root@pve` user is a separate internal user that only exists if someone created it. In the login dropdown, choose the correct realm — or log in as `root@pam`.

**2. Unlock a blocked user**

```bash
pveum user unlock root@pve
```

**3. Reset the password of a PVE realm user**

```bash
pveum passwd root@pve
```

**4. Restart the web frontends** after any authentication/configuration change:

```bash
systemctl restart pveproxy pvedaemon
```

**5. Fix the clock**

Proxmox 8 uses chrony by default. If the server clock has an offset greater than the ticket's validity, every login fails:

```bash
systemctl enable --now chrony
systemctl restart chrony
chronyc tracking      # veja o offset
chronyc makestep      # se o offset for grande
```

**6. API tokens: check the header format**

The correct header is `Authorization: PVEAPIToken=USER@REALM!TOKENID=SECRET`. A common mistake is omitting the realm or the `!` separator:

```bash
pveum user token add root@pam mytoken --privsep 0
# imprime o segredo — guarde agora

curl -H "Authorization: PVEAPIToken=root@pam!mytoken=SECRET" \
     https://<host>:8006/api2/json/version
```

**7. Track the authentication log live** while reproducing the failure:

```bash
journalctl -u pveproxy -f | grep -i authentication
```

For the cluster variant (missing `/etc/pve/access.cfg` file, corosync issues), I have a [complete step-by-step guide to Proxmox web interface login errors]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) — this cause is rare but catastrophic, and none of the commands above fix it.

## Prevention

- Use API tokens for automation instead of the ticket endpoint — tokens are revocable and do not expire like tickets. See the [official API documentation](https://pve.proxmox.com/wiki/Proxmox_VE_API) and the [pveum man page](https://pve.proxmox.com/pve-docs/pveum.1.html).
- Keep NTP working (`chronyc tracking` in your monitoring).
- Document which realm each user belongs to — most "authentication failure" mysteries are realm confusion.
- Monitor the `pveproxy` logs for repeated attempts (blocking trigger).

If you're still stuck, these community threads cover the same error in depth: [authentication failure](https://forum.proxmox.com/threads/authentication-failure.178081/) and [API ticket 401 authentication failure](https://forum.proxmox.com/threads/api-ticket-401-authentication-failure.106758/).

Read also:

- [Fix Proxmox Web Interface Login Errors: Missing access.cfg [2026]]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Fix Proxmox Web Interface Login Errors: Missing access.cfg [2026]]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Fix Proxmox Web Interface Login Errors: Missing access.cfg [2026]]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---

Feel free to get in touch to talk about this and other topics via email <contact@lucasaguiar.xyz>
