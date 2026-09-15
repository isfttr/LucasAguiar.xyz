---
date: 2026-09-15T15:00:00-03:00
draft: true
title: "MinIO Is Archived: Self-Hosted S3 Alternatives for Your Homelab [2026]"
description: "MinIO is archived and no longer ships free Docker images. Compare the best self-hosted S3 alternatives in 2026 - VersityGW, Garage, SeaweedFS, RustFS - with working Docker configs."
featured_image: ""
categories:
  - article
tags:
  - homelab
  - self-hosted
  - storage
  - docker
  - s3
---

MinIO is archived. The repository that for a decade was the default answer to "how do I get an S3 endpoint in my homelab" was archived on GitHub, its last commit is from April 2026, and the project stopped distributing free Docker images in late 2025. If you have `minio/minio` pinned in a Compose file, that pinned tag still works — but you are running software that nobody is patching.

This guide covers what actually changed, what you should migrate to depending on your use case, and working configurations for the four alternatives that have real community traction in 2026.

## What Actually Happened to MinIO

The sequence of events matters because it explains why the alternatives are what they are:

1. **Late 2025:** MinIO stopped publishing free Docker images for the community edition. The `latest` tag stopped moving. Existing tags stayed on Docker Hub.
2. **Early 2026:** The `minio/minio` GitHub repository entered maintenance mode — commit activity effectively stopped.
3. **April 2026:** The repository was formally archived. Read-only. Issues closed, pull requests rejected.
4. **The AGPL-3.0 license never changed.** This is the part people get wrong. MinIO did not relicense to something proprietary — it just stopped maintaining the open source edition and moved the company toward a commercial product.

The practical consequence: your `minio/minio:RELEASE.2025-xx-xx` image still boots and still serves the S3 API. But any CVE published after that date goes unfixed unless you move. For a homelab storing family photos or a dev environment, that is a manageable risk. For anything touching the internet, it is not.

There is a community fork, [pgsty/minio](https://github.com/pgsty/minio), which promises a maintained, CVE-patched distribution. It is worth knowing about, but it is a one-maintainer effort that inherits a very large codebase — treat it as a stopgap rather than a destination.

## What You Actually Need From an S3 Endpoint

Before picking a replacement, be honest about which of these you need:

| Requirement | If you need this | If you don't |
|---|---|---|
| S3 API compatibility | Any of the options below | `sftp` or NFS |
| Data durability / replication | Garage, SeaweedFS, Ceph | VersityGW, S3Proxy |
| Tiny footprint (one container, one binary) | VersityGW, S3Proxy | Garage, SeaweedFS |
| Mount the same data over POSIX | VersityGW | most others |
| Works with a single disk | all of them | — |
| Long track record | SeaweedFS (2012), S3Proxy (2014) | RustFS (2024) |

Most homelabs need something much simpler than they think. If your requirement is "my backup tool speaks S3 and I want it to write to a folder on my NAS", you do not need a distributed object store with a cluster layout API.

## Option 1: VersityGW — The One People Actually Recommend

If you read the Hacker News thread that followed [Robin Moffatt's comparison of MinIO alternatives](https://rmoff.net/2026/01/14/alternatives-to-minio-for-single-node-local-s3/) — 80 comments, and the top-voted recommendation in the thread — one name keeps coming up unprompted: [VersityGW](https://github.com/versity/versitygw).

The pattern from practitioners is consistent. "Switched to Versity for homelab, been simple and stable as a rock. Point at a directory per bucket and done." Another: "My goal was to replace MinIO, which I could run and configure with a single Docker command. VersityGW works just as well for that."

It is Apache-2.0, written in Go, actively developed (commits within the last day as of this writing), and — critically — it is a **gateway**, not a storage engine. It translates the S3 API onto a POSIX filesystem you already have. That means a bucket is just a directory: you can `ls` it, `rsync` it, or read the same files over NFS without going through S3 at all.

Minimal Docker setup:

```yaml
services:
  versitygw:
    image: versity/versitygw:latest
    ports:
      - "7070:7070"
    environment:
      ROOT_ACCESS_KEY: "your-access-key"
      ROOT_SECRET_KEY: "your-secret-key"
    volumes:
      - /mnt/pool/s3data:/data
      - /mnt/pool/versions:/versions
    command: >
      --port :7070
      --iam-dir /data/.iam
      posix --versioning-dir /versions /data
```

Then point any S3 client at `http://your-host:7070` with path-style addressing. It also ships an optional WebGUI and supports static-website hosting from buckets, which is a neat trick if you want to serve assets without running nginx.

**Trade-off:** VersityGW gives you no replication and no erasure coding. Your durability is whatever the underlying filesystem gives you. That is fine on a single-node homelab with ZFS or Btrfs, and it is not fine if you were relying on MinIO's distributed mode.

## Option 2: Garage — The Distributed Option

[Garage](https://garagehq.deuxfleurs.fr/) is an S3-compatible object store designed for small self-hosted, geographically distributed clusters. It is AGPL-3.0, backed by NGI/NLnet grants, and it is the option that actually does the distributed thing properly.

The historical complaint about Garage was configuration friction — it required a layout step, a separate key format (`GK` prefix plus hex), and a TOML file. That changed in **v2.3.0**, which added a single-node mode using environment variables:

```yaml
services:
  garage:
    image: dxflrs/garage:v2.3.0
    ports:
      - "3900:3900"
      - "3902:3902"
      - "3903:3903"
    environment:
      GARAGE_DEFAULT_ACCESS_KEY: "GK$(openssl rand -hex 16)"
      GARAGE_DEFAULT_SECRET_KEY: "$(openssl rand -hex 32)"
      GARAGE_DEFAULT_BUCKET: "default-bucket"
    volumes:
      - ./garage.toml:/etc/garage.toml
      - ./meta:/var/lib/garage/meta
      - ./data:/var/lib/garage/data
```

With a minimal `garage.toml` pointing `metadata_dir` and `data_dir` at those volumes, plus an `rpc_secret` from `openssl rand -hex 32`. The [quick-start](https://garagehq.deuxfleurs.fr/documentation/quick-start/) documents the full file.

**Choose Garage if** you plan to add a second node later and want to grow into a real cluster. **Skip it if** you want a drop-in single container — the abstraction is heavier than a homelab needs, and the AWS-compatibility surface is deliberately narrower than MinIO's.

## Option 3: SeaweedFS — The Veteran

[SeaweedFS](https://github.com/seaweedfs/seaweedfs) has been around since 2012 and has supported S3 since 2018. Apache-2.0, 34k+ stars, one primary maintainer (Chris Lu) plus a commercial enterprise offering. It handles the "billions of small files" case better than anything else on this list, which is a real difference if your workload is millions of tiny objects rather than a few large ones.

Operational notes from people who have run it: user management through the admin API has had rough edges (the delete-user endpoint was reported as unreliable), and lifecycle expiry rules require config rather than the S3 API. The authors responded by removing an extra auth-config-file requirement shortly after the January 2026 comparison, which simplifies single-node startup.

**Choose SeaweedFS if** you need scale in the number of objects, or you want a project with a decade of production history. **Skip it if** you want the smallest possible surface area.

## Option 4: RustFS — Fast, New, Read With Care

[RustFS](https://github.com/rustfs/rustfs) appeared in 2024 and grew fast — 32k stars, Apache-2.0, and benchmarks claiming roughly 2.3x MinIO on 4KB payloads. It has a bundled GUI and migration tooling for coexisting with MinIO or Ceph.

The honest assessment from the community is mixed and worth quoting directly. One commenter: "We use RustFS in a production system with no issues. We switched over after MinIO license changes." Another, from someone who tried earlier versions: "Hit bug after bug after bug in RustFS. Current version seems to work fine for now but it's definitely 'new project'. The maintainers react very fast on any bug I submitted."

There was also a security vulnerability reported in the project during its alpha period, and it was still labelled alpha in early 2026.

**Choose RustFS if** you want performance and are willing to track releases closely. **Skip it if** you want to configure it once and forget it for three years.

## The Two-Hour Option: `rclone serve s3`

If you have `rclone` installed already — and if you do backups, you probably do — you may not need any of the above for local development:

```bash
rclone serve s3 --auth-proxy /path/to/config --addr :8080 /mnt/storage
```

This exposes a local directory over the S3 API. It is not a production object store and it will not do replication, but for "I need an S3 endpoint so my test suite stops hitting the real bucket", it is about as simple as it gets. The docs are at [rclone.org/commands/rclone_serve_s3](https://rclone.org/commands/rclone_serve_s3/).

There is also [S3Proxy](https://github.com/gaul/s3proxy) (Apache-2.0, from 2014), which does much the same thing in Java. One caveat: one of its dependencies, jclouds, was retired to the Apache Attic in 2025.

## Migrating Without Re-uploading Everything

The good news is that S3 is S3. Migration is a copy operation, and `rclone` is the tool:

```bash
# Copy from old MinIO to new endpoint, server-side where possible
rclone copy minio:my-bucket newgw:my-bucket \
  --s3-provider Other \
  --s3-endpoint http://localhost:7070 \
  --transfers 8 --checkers 16 --progress
```

Configure both remotes in `~/.config/rclone/rclone.conf` with `provider = Other` (or `Minio`) and explicit `endpoint` values. Then verify before you decommission the old container — an object count and a checksum comparison, not just a directory listing:

```bash
rclone check minio:my-bucket newgw:my-bucket --size-only
```

If your buckets hold database dumps or backups, this is exactly the moment to confirm the copies actually restore, which is a separate discipline worth reading about in our guide on [how to verify your PostgreSQL backups actually restore]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}}).

And if you are moving analytics workloads onto object storage — the pattern that made MinIO ubiquitous in the first place — DuckDB can query Parquet files directly from any of these endpoints. Our [DuckDB for self-hosted analytics guide]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}}) walks through the `httpfs` secret configuration; only the endpoint URL changes when you swap the backend.

## Which One Should You Pick

For a single-node homelab storing backups, media, or files that other services read over S3:

- **VersityGW** — simplest, most recommended, POSIX-transparent. Start here.
- **SeaweedFS** — if you have an enormous number of small objects or want 14 years of history.
- **Garage** — if you want to grow into a cluster and like the project's governance model.
- **RustFS** — if you want to follow a fast-moving project and can track releases.
- **Stay on your pinned MinIO image** — if the data is non-critical, never exposed to the internet, and you accept that it is frozen software.

The one thing not worth doing is starting a new deployment on MinIO in 2026. The images will keep booting for years, but you will be rebuilding this decision later under worse circumstances than today.

One housekeeping note: if you are swapping the container for the first time, this is a good moment to sanity-check whether you should be running it in a container at all versus a purpose-built VM. The trade-offs are covered in our [containers vs virtual machines comparison]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).

Read also:

- [How to Verify Your PostgreSQL Backups Actually Restore [2026]]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}})
- [DuckDB for Self-Hosted Analytics: Query CSV, Parquet, and JSON in Seconds [2026]]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
