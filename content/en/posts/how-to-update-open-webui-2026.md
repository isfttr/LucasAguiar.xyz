---
date: 2026-08-17T11:16:25-03:00
draft: true
title: "How to Update Open WebUI [2026]: Complete Guide (Docker, pip & LXC)"
description: "How to update Open WebUI in 2026: Docker Compose, pip/uv and Proxmox LXC. Backup first, avoid post-update bugs, set up auto-updates with Watchtower."
featured_image: ""
categories:
  - article
tags:
  - open-webui
  - homelab
  - docker
  - proxmox
  - self-hosted
---

Open WebUI is one of the most self-hosted AI interfaces out there, but updating it confuses people because there is no single command — the correct update depends entirely on how you installed it. Docker, pip and a Proxmox LXC each have their own flow. This guide consolidates all three, in the order you should think about them: backup, update, verify.

## Before updating: backup and secrets

Three things bite people every release, so do them first:

1. **Back up your data.** All chats, users, settings, uploaded files and generated content live in the data directory. On Docker that's the `open-webui` volume:
   ```bash
   docker run --rm -v open-webui:/data -v $(pwd):/backup alpine tar czf /backup/openwebui-$(date +%Y%m%d).tar.gz /data
   ```
   On pip/uv installs the data lives in `~/.open-webui` (or wherever `DATA_DIR` points); on the Proxmox LXC install it's `/root/.open-webui` plus `/root/.env`. Back those up too.
2. **Persist `WEBUI_SECRET_KEY`.** If the key changes on every container recreate, all sessions are invalidated and users get logged out. Generate once with `openssl rand -hex 32` and keep it stable in your `docker-compose.yml` or `.env`.
3. **Understand that database migrations are one-way.** Since [v0.11.0](https://github.com/open-webui/open-webui/releases/tag/v0.11.0) the release notes explicitly recommend backing up before upgrading. Rolling back the image does **not** undo schema changes — if you need to roll back, restore the backup.

The [official updating docs](https://docs.openwebui.com/getting-started/updating) also tell you to pin a version (`:vX.Y.Z`) for shared/team setups instead of following `:main`, which is a rolling tag that can ship breaking changes without warning.

## Update method 1: Docker Compose (recommended)

```bash
docker compose pull
docker compose up -d
```

That's it — the container restarts with the new image, migrations run on startup, and the volume keeps your data. For a plain `docker run` setup:

```bash
docker rm -f open-webui
docker pull ghcr.io/open-webui/open-webui:main
docker run -d -p 3000:8080 -v open-webui:/app/backend/data -e WEBUI_SECRET_KEY="your-key" --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### Auto-updates with Watchtower

For homelab use the docs explicitly recommend [Watchtower](https://github.com/containrrr/watchtower). One important 2026 detail: the original `containrrr/watchtower` image is no longer maintained and fails with Docker 29+, so use the maintained fork `nickfedor/watchtower`:

```bash
# One-time update of just Open WebUI
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock nickfedor/watchtower --run-once open-webui

# Continuous auto-update every 6 hours
docker run -d --name watchtower --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e WATCHTOWER_CLEANUP=true \
  nickfedor/watchtower --interval 21600 open-webui
```

`WATCHTOWER_CLEANUP=true` removes old images automatically. The trade-off: automated updates can break a deployment if a release ships a breaking change or migration — which is exactly why the backup step above is non-negotiable.

## Update method 2: pip / uv

If you installed with pip:

```bash
pip install -U open-webui
open-webui serve
```

With uv (the quick-start method in the docs): `uvx --python 3.11 open-webui@latest serve`. Your data stays in `~/.open-webui`; to roll back, install the previous version explicitly (`pip install open-webui==X.Y.Z`) and restart — remembering the migration caveat above.

## Update method 3: Proxmox LXC (community-scripts)

The [Proxmox VE Community Scripts](https://community-scripts.org/scripts/openwebui) installer used to be a git+source install (`/opt/open-webui`, npm build, pip install). That is now the **legacy path**: since 2026 the installer and updater use a uv-based tool install, and the update script auto-migrates old source installs to the new layout, preserving your data and `.env`.

To update an Open WebUI LXC today:

```bash
# Run inside the LXC (or via pct exec)
uv tool install --force --python 3.12 open-webui[all]
systemctl restart open-webui
```

The project also ships `tools/pve/update-apps.sh`, a per-container updater with optional pre-update backup. My older [bash script for updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}}) still works for legacy source installs, but for new containers the uv path above is the supported one.

## After updating: verify

1. **Hard-refresh the browser** (Ctrl+F5 / Cmd+Shift+R) — stale cached JS is the #1 source of "the update broke everything" reports.
2. Check the container logs for migration output: `docker logs open-webui 2>&1 | head -20` (or `journalctl -u open-webui` on the LXC).
3. If your **custom models disappeared after the update**, that's a known bug related to Direct Connections — see the [step-by-step fix]({{< relref "posts/fix-custom-models-open-webui/" >}}) before opening a GitHub issue.

## Summary

| Install | Update command | Auto-update |
|---|---|---|
| Docker Compose | `docker compose pull && up -d` | Watchtower (`nickfedor/watchtower`) |
| pip/uv | `pip install -U open-webui` | Manual (or cron) |
| Proxmox LXC | `uv tool install --force open-webui[all] && systemctl restart open-webui` | Manual (or `update-apps.sh`) |

Backup before every update, keep `WEBUI_SECRET_KEY` stable, pin versions for anything shared, and after updating always hard-refresh and check the logs. If you're still deciding between running Open WebUI in a [container or a VM]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}), that guide helps too.

Read also:

- [Update Open WebUI in a Proxmox LXC: Bash Script + Cron [2026]]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Open WebUI Missing Custom Models? How to Fix the Bug [2026]]({{< relref "posts/fix-custom-models-open-webui/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
