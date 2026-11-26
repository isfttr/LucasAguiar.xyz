---
date: 2026-11-26T15:01:41-03:00
draft: true
title: "Minipg: Run PostgreSQL as a Single Executable [2026 Guide]"
description: "Minipg turns PostgreSQL into one executable that runs with no server, no Docker and no config. Complete guide to commands, how it works, Docker-free setup and limits."
featured_image: ""
categories:
  - article
tags:
  - postgresql
  - databases
  - dev-tools
  - homelab
  - selfhosted
---

PostgreSQL is notoriously the opposite of "just works": you install a server, initialize a data directory, manage auth, run a daemon and keep it alive. Minipg removes almost all of that — a single binary where a `.pgdb` directory *is* the database, and a server starts only when a command needs it.

Minipg comes from Jeff Lindsay (progrium), author of many "single thing" tools, and hit the front page of Hacker News in late 2026. It packs PostgreSQL 18 from the official Docker image into one executable, using his h9 runtime instead of a Linux kernel or a Docker daemon. If you've ever wanted the power of Postgres with the portability of SQLite's single file, this is the closest thing that exists today.

```
minipg app.pgdb                  # open a psql shell (creates the db)
minipg app.pgdb "select 1"       # run one statement
minipg url app.pgdb              # print a postgres:// connection string
minipg serve app.pgdb            # explicit foreground server
minipg run app.pgdb -- npm start # run your app with DATABASE_URL set
minipg dump app.pgdb > dump.sql  # backup
minipg restore app.pgdb dump.sql # restore
```

## What makes a `.pgdb` different

Instead of a running server with a data directory somewhere else, a `.pgdb` is a plain directory that contains everything: `minipg.toml` (settings and the generated superuser password) and a `pgdata/` folder with Postgres' data files. Because it's just a directory, a stopped database can be copied, moved, versioned or backed up like any other folder — there's no daemon to stop first.

A server process starts in the background when a command needs one and stops itself when it's idle. Exactly one Postgres process runs per `.pgdb`, enforced by a lock file, so two commands on the same database don't step on each other.

This directory-based model makes Minipg a natural fit for CI: you can spin up a fresh database per test job, run your tests against real Postgres, and throw the directory away. The README even shows a job as small as `minipg init test.pgdb` followed by `minipg run test.pgdb -- go test ./...`.

## How it works underneath

Minipg embeds the `postgres:18-alpine` Docker image and runs it with **h9**, used as a Zig library. h9's Linux "personality" runs Alpine's own Postgres binaries directly on your host hypervisor, with h9's Plan 9 kernel answering their system calls. There is no Linux kernel to boot, no VM image, and no Docker. On CI, the Linux binary is static and needs no privileges — without `/dev/kvm`, h9 falls back to its native backend.

The trade-off is performance. On h9's native backend, Postgres runs about **2x slower than native for a single client**, and slower under load. For development, tests, demos and scripts that's perfectly fine; for production traffic it is not.

## Where Minipg fits (and where it doesn't)

Reach for Minipg when you want **real Postgres without the ceremony**: a throwaway database for a tutorial, a hermetic test environment, a portable dev setup that follows a project around, or a quick data munging session. New clusters use Postgres' built-in `C.UTF-8` locale, which sorts the same on every platform — a small but welcome consistency win over locale-dependent `initdb` output.

Don't reach for it yet for production workloads. The project itself is explicit: it's early, h9's Linux personality is young, the 2x slowdown under load is real, and you shouldn't trust it with data you can't recreate. If you need a durable, always-on Postgres for a self-hosted app, a normal install with proper [performance tuning]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}}) is still the right call.

## Building and platform support

Minipg is MIT-licensed and open source. Building from source needs Zig 0.16 plus `curl`, `jq`, `tar` and `xz`, then `make build` pulls the root for your host's architecture. Supported hosts include Linux x86_64 with KVM (or the native backend on Linux 5.11+), Linux arm64 with KVM, macOS on Apple Silicon via Hypervisor.framework, and even the browser (the demo runs directly in a page via v86).

## The bottom line

Minipg is the most appealing "Postgres as a portable artifact" I've seen yet. It doesn't replace a server — it erases the concept of one for the cases where you just want a database that comes and goes with your code. It sits somewhere between SQLite's single-file simplicity and full PostgreSQL compatibility, and for local development and testing that's precisely the niche worth a look.

Compare it with the trade-offs other storage choices make in [SQLite WAL corruption handling]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}}) and the broader [Docker vs Podman vs Incus]({{< relref "posts/kubernetes-vs-docker-compose-guia-2026/" >}}) runtime landscape before deciding.

Also read:

- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [SQLite WAL Corruption: How to Detect, Fix and Prevent It in your Homelab [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>.