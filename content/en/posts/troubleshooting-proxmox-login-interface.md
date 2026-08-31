---
date: 2025-03-14T02:29:45.000Z
draft: false
title: "Proxmox Login Failed? Fix 'authentication failure' 401 [2026]"
description: "Proxmox login failed with 'authentication failure 401'? Fix wrong realm, blocked user, expired ticket, unsynced clock or missing access.cfg. Step-by-step [2026]."
url: ''
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-proxmox-login-error.png
categories:
  - tutorial
tags:
  - linux
  - proxmox
  - troubleshooting
  - tutorial
  - autenticacao
translation_source_hash: 3144fa007970f019b49e826e2575534226424bf042c94bc85029dfa6a5355be0
aliases:
  - /posts/fix-proxmox-web-interface-login-errors/
---

You open the Proxmox web interface, enter your credentials, and nothing happens. The browser's dev tools show a red `401` in the network tab. Or worse: your automation script that worked yesterday now fails with the same code. "authentication failure" is Proxmox's most common login error — and in most cases it's not a server problem, it's a small configuration detail. This guide covers every common cause, from a wrong realm to a missing cluster file.

## What "authentication failure (401)" means

The Proxmox API returns **HTTP 401** with the body **`authentication failure`** whenever the login endpoint rejects your credentials. You'll see it in three places:

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
| 7 | `/etc/pve/access.cfg` missing/corrupted | Breaks authentication on the entire cluster — see the cluster case below |

## How to fix it

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
chronyc tracking      # check the offset
chronyc makestep      # if the offset is large
```

**6. API tokens: check the header format**

The correct header is `Authorization: PVEAPITOKEN=user@realm!tokenid=SECRET`. A common mistake is omitting the realm or the `!` separator:

```bash
pveum user token add root@pam mytoken --privsep 0
# prints the secret — save it now

curl -H "Authorization: PVEAPITOKEN=root@pam!mytoken=SECRET" \
     https://<host>:8006/api2/json/version
```

**7. Track the authentication log live** while reproducing the failure:

```bash
journalctl -u pveproxy -f | grep -i authentication
```

## The rare cluster case: missing /etc/pve/access.cfg

If none of the commands above fix it, the root cause may be a missing `/etc/pve/access.cfg` file — crucial for user authentication, likely due to `corosync` communication issues. It's rare but catastrophic, and it breaks login for the entire cluster.

### Investigation

1. **Service Status:** Checked the status of `pve-cluster` and `pveproxy` services, which were running.
2. **Logs:** Examined logs for errors related to RRD database updates.
3. **Authentication Configuration:** Verified `/etc/pve/user.cfg`.
4. **Missing Configuration File:** Discovered that `/etc/pve/access.cfg` was missing.

```bash
# 1. Check service status
systemctl status pve-cluster
systemctl status pveproxy

# 2. Check logs for errors
journalctl -u pveproxy -n 100
journalctl -u pve-cluster -n 100

# 3. Verify authentication configuration
cat /etc/pve/user.cfg
ls -la /etc/pve/user.cfg

# 4. Check for missing access.cfg
ls -la /etc/pve/access.cfg
```

### Solution

1. **Restarted `pve-cluster` service:** stopped and started it to attempt to re-establish cluster connectivity.
2. **Forced Quorum:** `pvecm expected 1` in a single-node setup re-establishes cluster leadership.
3. **Created `access.cfg`:** manually created the file with minimal content.
4. **Restarted `pveproxy`:** forced it to recognize the new file.

```bash
# 1. Restart pve-cluster service
systemctl stop pve-cluster
systemctl start pve-cluster

# 2. Force quorum in a single-node setup
pvecm expected 1

# 3. Create minimal access.cfg file
cat > /etc/pve/access.cfg << 'EOF'
acl:1
path /
role Administrator
user root@pam
EOF

chmod 0640 /etc/pve/access.cfg
chown root:www-data /etc/pve/access.cfg

# 4. Restart pveproxy service
systemctl restart pveproxy
```

After these steps, users were able to log in to the Proxmox web interface successfully.

## Prevention

- **Use API tokens for automation** instead of the ticket endpoint — tokens are revocable and do not expire like tickets. See the [official API documentation](https://pve.proxmox.com/wiki/Proxmox_VE_API) and the [pveum man page](https://pve.proxmox.com/pve-docs/pveum.1.html).
- **Keep NTP working** (`chronyc tracking` in your monitoring).
- **Document which realm each user belongs to** — most "authentication failure" mysteries are realm confusion.
- **Monitor `pveproxy` logs** for repeated attempts (blocking trigger).
- **Back up `/etc/pve` regularly** so a missing `access.cfg` can be restored quickly.
- **Shut down nodes gracefully** — abrupt power loss can corrupt cluster config.
- **Keep Proxmox updated** and review permissions in `/etc/pve` carefully.

If you're still stuck, these community threads cover the same error in depth: [authentication failure](https://forum.proxmox.com/threads/authentication-failure.178081/) and [API ticket 401 authentication failure](https://forum.proxmox.com/threads/api-ticket-401-authentication-failure.106758/).

Read also:

- [How to migrate from Proxmox VE 8 to 9: step-by-step guide [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})
- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Feel free to get in touch to talk about this and other topics via email <contact@lucasaguiar.xyz>
