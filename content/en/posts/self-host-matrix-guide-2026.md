---
date: 2026-11-19T15:03:13-03:00
draft: true
title: "How to Self-Host Matrix in 2026: Complete Guide (Synapse, Docker, Bridges)"
description: "Step-by-step guide to self-hosting Matrix in 2026: Synapse vs Dendrite vs Conduit, Docker Compose setup, federation, Element client and mautrix bridges."
featured_image: ""
categories:
  - article
tags:
  - matrix
  - self-hosted
  - docker
  - homelab
  - privacy
---

Matrix is an open, federated protocol for secure, decentralized communication — and in November 2026 the European Commission publicly documented how it rolled it out to more than 40,000 staff across the institution. If a government the size of the EC runs Matrix self-hosted, the protocol is no longer an early-adopter experiment: it is a production-grade alternative to Slack, Discord and Microsoft Teams that you can run on your own hardware. This guide covers what Matrix is, how to pick a homeserver in 2026, and how to get a working setup running with Docker Compose, Element and bridges in about an hour.

## Why self-host Matrix instead of using Discord or Slack

The core difference between Matrix and the proprietary chat platforms is that Matrix is a **protocol**, not a product. Anyone can run a homeserver and join a global federation where rooms are shared across servers. Your data stays on hardware you control, messages are end-to-end encrypted by default (E2EE is built into the protocol, not an opt-in premium feature), and there is no company that can unilaterally change the terms or shut your workspace down.

For a homelab, the practical wins are:

- **Ownership** — messages, media and history live in your Postgres database, not on someone else's cloud.
- **Federation** — your homelab server can talk to matrix.org and any other homeserver; users on other servers can join your rooms.
- **E2EE** — encrypted by default between clients, with cross-signing and device verification.
- **No per-seat pricing** — the software is free; you pay your electricity bill.

The tradeoffs are real too: you are responsible for backups, upgrades and uptime, and encrypted rooms mean you cannot "just query the database" to recover lost history — backups matter more, not less.

## Choosing a homeserver in 2026: Synapse vs Dendrite vs Conduit

The homeserver is the heart of your deployment. There are three mature options, with very different resource profiles:

| Homeserver | Language | Stars | Best for | Notes |
|---|---|---|---|---|
| [Synapse](https://github.com/element-hq/synapse) | Python/Twisted + Rust | ~4.8k | Reference deployment, full compatibility | The most battle-tested server; what most big deployments (incl. public sector) use; heavier on RAM |
| [Dendrite](https://github.com/element-hq/dendrite) | Go | ~1k | Lower-resource, single binary | Second-generation server from Element; simpler ops, good federation support |
| [Tuwunel](https://github.com/matrix-construct/tuwunel) | Rust | ~2.8k | Very low footprint, embedded devices | Official successor to Conduwuit/Conduit; single binary, tiny RAM usage; federation and E2EE mature |

Synapse remains the safest default: it is the reference implementation, every Matrix feature lands there first, and its documentation and community support are unmatched. Dendrite is a solid middle ground for people who want a single Go binary. Tuwunel (the Rust fork lineage that began with Conduit at [conduit.rs](https://conduit.rs/)) is the right choice if you are running on a Raspberry Pi or a low-RAM VPS — it can run comfortably in a few hundred MB of RAM.

**Hardware reality check:** a small Synapse instance (a handful of users, a few active rooms) runs fine on 1–2 GB of RAM and one vCPU. The EC uses a big clustered deployment, but you do not need that for a family or team server. Plan for ~10 GB of disk per year of active use, more if you federate with busy public rooms — media is the disk hog.

## Step-by-step: Synapse + Element with Docker Compose

This is the fastest path to a working server. You need a host with Docker and Docker Compose installed and a domain name — you can run it on a LAN without a domain, but for federation (and sane TLS) a domain is strongly recommended.

The official Synapse image is [`matrixdotorg/synapse`](https://hub.docker.com/r/matrixdotorg/synapse) (also mirrored at `ghcr.io/element-hq/synapse`), and the maintainers ship a [reference Compose file](https://element-hq.github.io/synapse/latest/setup/installation.html) that wires Synapse to Postgres. A minimal, production-sane version looks like this:

```yaml
services:
  synapse:
    image: docker.io/matrixdotorg/synapse:latest
    container_name: synapse
    restart: unless-stopped
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    volumes:
      - ./files:/data
    ports:
      - 8448:8448/tcp
    depends_on:
      - db

  db:
    image: docker.io/postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_PASSWORD=changeme
      - POSTGRES_DB=synapse
    volumes:
      - ./db:/var/lib/postgresql/data
```

Docker Compose will not automatically generate `homeserver.yaml` for you. The first run needs a config file; the easiest way is to generate one with the image:

```bash
docker run -it --rm -v "$PWD/files:/data" -e SYNAPSE_SERVER_NAME=matrix.yourdomain.com \
  -e SYNAPSE_REPORT_STATS=yes docker.io/matrixdotorg/synapse:latest generate
```

Then start the stack, create your first admin user and log in:

```bash
docker compose up -d
docker exec -it synapse register_new_matrix_user http://localhost:8008 \
  -u alice -p a-strong-password -a   # -a makes the user admin
```

Registering users this way is the old but still reliable path. For self-serve registration you enable `enable_registration` in `homeserver.yaml` — but keep that **off** unless you are prepared for spam and abuse, and add CAPTCHA (reCAPTCHA or the built-in turnstile) if you turn it on.

### Adding the Element web client

A homeserver without a client is not very useful. The official web client, [Element](https://element.io/), is the default choice and can be self-hosted as a static site. The simplest approach: serve the prebuilt Element Web with another container behind the same reverse proxy, pointing `config.json` at `https://matrix.yourdomain.com`. For a single-user homelab, you can also skip self-hosting the client entirely and use the hosted Element at `app.element.io` — you only lose the "everything on my hardware" purity, not functionality.

## Federation: the part everyone gets wrong

Federation is what makes Matrix different from a private chat server: other homeservers can reach your rooms and your users. Getting it right requires three things:

1. **Port 8448 open** — the standard federation TLS port. Synapse listens on it (the Compose file above maps it).
2. **`.well-known` delegation** — a small JSON file at `https://yourdomain.com/.well-known/matrix/server` pointing to `m.server: matrix.yourdomain.com:8448`. This lets you keep your user IDs as `@alice:yourdomain.com` while the actual server lives at `matrix.yourdomain.com`. For clean setup this is the recommended approach.
3. **A valid TLS certificate for `matrix.yourdomain.com`** — either terminate TLS in a reverse proxy (Caddy and Traefik make this automatic), or let Synapse handle it directly.

The reverse proxy pattern (recommended): Caddy or Traefik in front, terminating TLS, forwarding ports 8008 (client-server API) on `matrix.yourdomain.com` and 8448 (federation) on the same host. Caddy's automatic HTTPS removes the entire certificate-acquisition problem.

> **Security note:** never expose the Synapse `8008` port directly to the internet without TLS — the client-server API expects to be behind HTTPS, and plain HTTP leaks tokens in transit.

## Bridges: connect WhatsApp, Discord, Signal and Telegram

The killer feature for real-world adoption is *bridging*: Matrix rooms that mirror your WhatsApp, Telegram, Discord, Signal or Slack conversations. The [mautrix](https://github.com/mautrix/whatsapp) project maintains a family of puppeting bridges — the bridge account itself can encrypt messages so your Matrix devices stay the only ones that can decrypt.

Bridges add operational weight (each one is a service, each one needs its own config), so start with one bridge for the platform you actually use daily, not all of them. For WhatsApp and Discord the mautrix bridges are the most mature. The downside to keep in mind: bridging a proprietary network depends on that network not breaking its unofficial APIs, which happens periodically — budget for occasional maintenance.

## The production shortcut: matrix-docker-ansible-deploy

If the manual path above feels like too much plumbing, there is a well-maintained shortcut: [spantaleev/matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy) (~6.5k stars, actively maintained). One Ansible playbook deploys the whole stack — Synapse (or Dendrite), Postgres, Element, Coturn for VoIP, a reverse proxy, automatic SSL, and most mautrix bridges — with sane defaults and one command:

```bash
ansible-playbook -i inventory/hosts setup.yml --tags=setup-all
```

For anything beyond a single-server experiment, this is the path I recommend: it gives you the same stack in a reproducible, upgradeable form, and the project's docs handle edge cases (like VoIP/TURN) that are easy to get wrong by hand. It was also the approach the [European Commission's own rollout](https://element.io/blog/how-the-european-commission-rolled-out-matrix-to-more-than-40-000-staff/) ecosystem is built around — community tooling proven at government scale.

## Maintenance: backups and upgrades

Two habits will save you:

- **Back up Postgres, not just files.** All room history and account data live in the database. `pg_dump` on a schedule (or a nightly `docker exec` dump plus offsite copy) is the minimum. Since E2EE keys live in each client, a database restore gets your rooms back but devices may need re-verification.
- **Upgrade deliberately.** Matrix moves fast — follow the Synapse release notes before updating, especially the config schema changes between major versions. With Docker this is a `docker compose pull && docker compose up -d`, but always take the DB backup first.

## Conclusion

Matrix in 2026 is the most credible self-hosted answer to the "we need team chat but we won't give our data to a vendor" question — and the European Commission's 40,000-user deployment published this month is the strongest possible proof that it scales beyond hobbyist territory. For a homelab, the entry cost is one domain, one small VM or Raspberry Pi, and an afternoon: Synapse in Docker, Element on top, federation delegated via `.well-known`, and a mautrix bridge for the one network you cannot leave. Start with the Docker Compose path for learning, then graduate to `matrix-docker-ansible-deploy` when you want upgrades and bridges handled for you.

Also read:

- [Containers vs VMs: Complete Guide for Homelabs (2026)]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Self-Hosted GitHub Alternatives: Comparison Guide (2026)]({{< relref "posts/github-alternatives-self-hosted-comparison-2026/" >}})
- [How to Self-Host RustDesk for Unattended Remote Access]({{< relref "posts/self-host-rustdesk-unattended-remote-access-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
