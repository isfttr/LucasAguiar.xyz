---
date: 2026-08-14T15:00:00-03:00
draft: true
title: "Self-Host RustDesk: Unattended Remote Access Guide [2026]"
description: "Complete guide to self-hosting RustDesk with Docker in 2026: hbbs/hbbr setup, firewall ports, Wayland unattended access and secure client config."
featured_image: ""
categories:
  - article
tags:
  - rustdesk
  - remote-access
  - selfhosted
  - homelab
  - wayland
  - docker
---

It is 11 PM on a Wednesday and your home server is a thousand kilometers away — or worse, in the next room with a dead login screen. You need to fix a config, grab a file, or restart a service, and the only thing between you and the machine is a remote desktop client that demands someone physically approve the session. If you have ever been locked out of your own hardware because a commercial remote tool decided Wayland was "experimental", this guide is for you.

RustDesk is the open-source answer: a TeamViewer/AnyDesk alternative you can run entirely on your own infrastructure. This guide covers why you should self-host it, how to deploy the server with Docker Compose, and how to get true unattended access — including the Wayland support that landed in August 2026.

## Why RustDesk, and why self-host it

RustDesk is a remote desktop application written in Rust, distributed under AGPL-3.0, with over 120,000 stars on [GitHub](https://github.com/rustdesk/rustdesk). The pitch is simple: the same features as commercial tools — screen sharing, file transfer, clipboard sync, unattended access — without routing your screen through a third-party relay you do not control.

Self-hosting matters for three reasons:

1. **Privacy.** Your sessions never leave your network. The rendezvous and relay traffic go through machines you own.
2. **Independence.** No free-tier limits, no "this session looks commercial" popups, no vendor deciding your usage is abusive.
3. **Cost.** The hardware requirements are minimal: the [official docs](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/) note that a Raspberry Pi or the cheapest cloud VM is enough. Relay traffic runs between 30 KB/s and 3 MB/s for a 1080p screen, and office work sits around 100 KB/s.

If you are already running a homelab with containers, the server slots in next to everything else. If you are still deciding between container runtimes, our [containers vs VMs guide]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) explains the trade-offs.

## How RustDesk works: hbbs and hbbr

The self-hosted server is two binaries:

- **hbbs** — the ID/rendezvous server. Clients register their ID here and it coordinates the NAT type test and TCP hole punching for direct connections.
- **hbbr** — the relay server. When a direct connection is impossible (symmetric NAT, strict firewalls), traffic is relayed through hbbr.

Ports to open on the firewall:

| Port | Protocol | Purpose |
|------|----------|---------|
| 21115 | TCP | NAT type test |
| 21116 | TCP + UDP | ID registration, heartbeat, TCP hole punching |
| 21117 | TCP | Relay service (hbbr) |
| 21118 / 21119 | TCP | Web client support (optional) |

The [Docker self-host docs](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/) recommend opening 21115–21119/TCP and 21116/UDP. If you do not need the web client, ports 21118/21119 can stay closed.

## Deploying the server with Docker Compose

The simplest and most reliable setup on a Linux server is Docker Compose with host networking — it avoids port-mapping complexity and keeps upgrades repeatable. Create a directory with a data volume and a `docker-compose.yml`:

```yaml
services:
  hbbs:
    container_name: hbbs
    image: rustdesk/rustdesk-server:latest
    command: hbbs -r <relay-host-or-ip>
    volumes:
      - ./data:/root
    network_mode: "host"
    depends_on:
      - hbbr
    restart: unless-stopped

  hbbr:
    container_name: hbbr
    image: rustdesk/rustdesk-server:latest
    command: hbbr
    volumes:
      - ./data:/root
    network_mode: "host"
    restart: unless-stopped
```

Replace `<relay-host-or-ip>` with the public address clients can reach on port 21117 — this tells hbbs which relay to advertise. Then start it:

```bash
docker compose up -d
```

The `./data` volume persists the keypair hbbs generates on first run — back it up, because clients registered against that key will not match a fresh one.

If you run UFW, open the ports with:

```bash
sudo ufw allow 21114:21119/tcp
sudo ufw allow 21116/udp
```

## Pointing clients at your server

On each client, open Settings → Network and fill in the ID server and relay server fields with your host (or use `rustdesk-utils` to generate a pre-configured installer for fleets). After the first connection, the client shows the server-assigned ID and the connection is end-to-end encrypted with the keypair generated on your hbbs.

This is the moment the commercial-tool comparison stops being theoretical: your sessions register against *your* server, and nothing depends on a vendor's availability. For homelab hardening, the same discipline applies as to any exposed service — our guide on [detecting and blocking bot traffic]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) covers the basics of locking down what you expose.

## Unattended access on Wayland: the August 2026 milestone

Wayland has historically been the weak point of Linux remote desktop. In August 2026, [RustDesk announced true unattended access on Wayland](https://rustdesk.com/blog/unattended-remote-access-wayland/), including multi-monitor setups and connections from the login screen after a reboot — no one needs to be at the machine to approve the session.

This matters because the alternatives are still behind. AnyDesk requires Xorg for incoming Linux sessions, and TeamViewer still describes Wayland support as experimental for common desktop environments. The RustDesk implementation is currently a preview build for x86_64 Debian/Ubuntu systems, with Fedora and Arch support planned once the implementation stabilizes. The [HN discussion](https://news.ycombinator.com/item?id=49300759) reflects the reception: this is the feature Linux users have been waiting for.

## Security notes

A few things worth knowing before you expose the server:

- **WebSocket ports and IP spoofing.** When 21118/21119 are open for the web client, hbbs/hbbr trust `X-Real-IP`/`X-Forwarded-For` headers without validation. The [docs warn](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/) that anyone reaching those ports directly can spoof an IP and bypass rate limiting — expose the web client only through a reverse proxy that sets `X-Real-IP` itself.
- **Keys, not passwords.** Self-hosted RustDesk uses the server keypair for encryption; keep the generated key files safe and back them up with your data volume.
- **License.** The server is AGPL-3.0 — fine for personal and internal use, but if you plan to offer RustDesk as a commercial service, review the obligations. The [Pro version](https://rustdesk.com) adds a web console and ACLs for larger deployments.

## When does self-hosting make sense?

If you administer more than one Linux machine, or you want remote access to a home server from anywhere, the setup cost is one evening and the payoff is permanent: no session limits, no login-screen dead ends, and now, no Wayland excuse. Pair it with a [Proxmox backup strategy]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}) and your homelab becomes something you can operate from anywhere.

Also read:

- [Containers vs VMs: A Complete Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Detect and Block Bot Traffic on Self-Hosted Services [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Proxmox Backup Server: Community Scripts Guide [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
