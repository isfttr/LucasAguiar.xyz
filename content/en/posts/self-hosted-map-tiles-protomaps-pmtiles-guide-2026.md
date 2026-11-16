---
date: 2026-11-16T15:00:13-03:00
draft: true
title: "Self-Hosted Map Tiles with Protomaps and PMTiles [2026]: Full Guide"
description: "Host your own map tiles with Protomaps PMTiles for a fraction of Mapbox cost. Step-by-step: build a single .pmtiles file, upload with rclone, serve via S3-compatible storage and MapLibre GL."
featured_image: ""
categories:
  - article
tags:
  - self-hosted
  - homelab
  - maps
  - protomaps
  - pmtiles
---

Maps are one of the few "infrastructure" services most developers rent instead of host, mostly because self-hosting them used to mean running a tile server with gigabytes of configuration and a database preloaded with planet data. That changed: with **Protomaps** and the **PMTiles** format, you can now serve a whole world map from a single static file over plain HTTP Range requests — no map server, no tile database, just a file on an S3-compatible bucket. This guide walks through the full setup end to end.

The idea that finally made self-hosted maps "cheap and easy" — which hit the top of Hacker News in late 2026 — is that a map tile set doesn't need to be a service. PMTiles is a tile archive format that stores vector tiles in one file and lets clients read only the slices they need via HTTP `Range` requests, so a CDN like Bunny.net or Cloudflare can cache and serve it with zero server-side logic.

## Why self-host map tiles in 2026

Commercial tile APIs are priced per map load and get brutal the moment your project goes viral. Mapbox, for instance, charges around **$5 per 1,000 map loads** once you exhaust the free tier. If you're building something that could suddenly get traffic — a mapping app, a travel tool, a dashboard with a location view — that bill becomes a real decision.

Self-hosting changes the economics:

- **A single file that serves the whole planet.** The current global Protomaps build is about 139 GB, but you can cut it down drastically by extracting just a bounding box or a zoom range with the Protomaps CLI.
- **Pay for storage and bandwidth, not per-load.** Typical map interactions move a few MB. A user loading a zoomed-in Europe view can cost around **$0.00005** in CDN bandwidth on Bunny.net — roughly 100x cheaper than Mapbox per load.
- **Privacy and control.** You keep your tile data, your referrers, your access rules. For homelab users this is the same appeal as self-hosting anything else: no third party sees your usage.

## Getting the map data

The most practical start is the [Protomaps CLI](https://docs.protomaps.com/pmtiles/cli/), which handles both pulling daily planet builds and extracting only the region and zoom levels you actually need — turning a 139 GB planet file into a few GB (or less) for a country-level app.

The key idea is to *reduce before you host*. A map of Europe at reasonable zoom levels is a fraction of the planet file, and the smaller the `.pmtiles` file, the cheaper both storage and cache-miss transfers.

## Uploading to an S3-compatible bucket with rclone

Once you have your `.pmtiles` file, you need somewhere to serve it. S3-compatible object storage is the sweet spot because virtually every CDN can front it. If you're already running object storage at home, check our [guide to MinIO and self-hosted S3 alternatives]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) — but for a public-facing global map, a cheap CDN-backed bucket is usually better.

A practical, low-cost option is Bunny.net: it supports HTTP Range requests, caches large objects, and runs primarily on EU infrastructure with bandwidth from about **$0.01/GB** for traffic to Europe and North America, and storage from **$0.01/GB/month**. Storing a 139 GB world map with replication across most continents works out to roughly **$5/month** in storage.

The upload itself is best done over the S3 API with `rclone` rather than the HTTP upload endpoint, which can time out on large files. Enable S3 compatibility on your storage zone, then stream the file straight from the build URL:

```bash
# Configure rclone with your Bunny storage zone (S3-compatible)
rclone config create bunnycdn s3 \
  provider=Other \
  access_key_id="<zone-name>" \
  secret_access_key="<storage-key>" \
  endpoint="https://<primary-region>-s3.storage.bunnycdn.com"

# Stream the build directly into the bucket
rclone copyurl "<build-url>" "bunnycdn:<zone-name>/<filename>.pmtiles" \
  --s3-chunk-size 256M \
  --progress
```

Run this from a `tmux` session or a temporary VPS if your home connection is slow — a large planet extraction can take a while.

## Configuring the CDN pull zone

With the file in storage, create a pull zone pointing at the storage zone as its origin. A few settings matter for keeping this cheap and secure:

- **CORS:** restrict allowed origins under *Security → General* so other websites can't embed your tiles for free.
- **Range caching:** make sure *"Optimize for large object delivery"* is enabled under *Caching* — without it, the CDN won't cache Range requests and every tile slice hits your storage.
- **Abuse limits:** the practical way to stop someone downloading your whole 139 GB file in one request is a download speed limit (e.g. 10 kB/s after the first 10 MB) plus sensible requests-per-second and monthly bandwidth caps on the pull zone. Legitimate map usage never approaches these numbers.

## Embedding the map with MapLibre GL

With the `.pmtiles` file served over HTTP, the last step is rendering it in the browser. [MapLibre GL](https://maplibre.org/maplibre-gl-js/docs/) is the open-source renderer of choice. Install the `pmtiles` npm package, register the PMTiles protocol with the MapLibre instance, and point a style at your bucket URL — the official [Protomaps installation guide](https://docs.protomaps.com/pmtiles/) covers the exact wiring.

The result: a fully working, interactive world map that you own, served from a single static file, at a tiny fraction of the cost of a commercial tile API. Once you've done it once, the "map as a service" mental model starts to feel like the expensive legacy it was.

## What this unlocks for homelab projects

Beyond the obvious cost win, the PMTiles model fits beautifully into a self-hosted philosophy. Because the tiles are just a file, you can back it up, version it, pin a build, or even carry a reduced country-level copy to an offline install. It stacks with the rest of a home server: your map lives alongside your dashboards and containers, all under the same access-control and monitoring rules.

For comparison of how different self-hosted infrastructure pieces fit together, our [containers vs VMs guide]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) and the [self-hosted GitHub alternatives comparison]({{< relref "posts/github-alternatives-self-hosted-comparison-2026/" >}}) cover the surrounding stack. And if you're serving this to the public, the same threat model that applies to any exposed service — covered in our [guide to detecting and blocking bot traffic]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) — applies to protecting your map from abuse.

Also read:

- [Containers vs VMs: A Complete Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitHub Alternatives: Self-Hosted Comparison [2026]]({{< relref "posts/github-alternatives-self-hosted-comparison-2026/" >}})

---

You can reach out to contact me about this and other topics by filling the form below.

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.