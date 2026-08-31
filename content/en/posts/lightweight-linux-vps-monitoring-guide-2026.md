---
date: 2026-08-25T15:04:59-03:00
draft: false
title: "How to Monitor a Linux VPS: Lightweight Tools Compared [2026]"
description: "Practical guide to monitoring a Linux VPS or homelab server with minimal RAM: btop, Glances, Netdata, node_exporter and vpsmon compared, with real setup steps for small machines."
featured_image: ""
categories:
  - article
tags:
  - linux
  - monitoring
  - vps
  - selfhosted
  - homelab
  - devops
---

Your VPS has 512 MB of RAM, maybe 1 GB. It runs a small web service, a VPN, a few Docker containers — and you have no idea what it is doing right now. Installing a "proper" monitoring stack (Prometheus + Grafana + Alertmanager) would eat a third of your memory before collecting a single metric. This guide compares lightweight monitoring tools that actually fit small Linux servers, with setup steps you can copy today.

The trigger for this post was a small project that hit Hacker News recently: [vpsmon](https://github.com/leodeim/vpsmon), a single Go binary that promises a web dashboard with about 5 MB of RAM. It is a young project (created in April 2026, still under 10 stars), so treat it as a promising option, not a proven one — but its existence points to a real gap in the ecosystem that this guide covers end to end.

## Why Full Observability Stacks Don't Fit Small VPS

The default advice for "monitoring" is Prometheus + Grafana + node_exporter (+ Alertmanager if you want alarms). That stack is excellent — for a cluster. On a small VPS it means:

- **node_exporter**: ~20-40 MB resident.
- **Prometheus**: ~150-300 MB with default settings, more as the TSDB grows.
- **Grafana**: ~100-150 MB.
- **Alertmanager**: another ~50-100 MB.

Total: 300 MB to 600 MB just for monitoring, before retention settings, before the web server that fronts it. On a 512 MB VPS that is not an option. On a 2 GB VPS it is a heavy tax for a single node. The tools below give you 80% of the value with 5-10% of the footprint.

## The Lightweight Toolkit

### Terminal dashboards: btop and Glances

[btop](https://github.com/aristocratos/btop) (34k stars, C++) is the modern replacement for `top`/`htop`. It shows CPU per-core graphs, memory, disk I/O, network, and processes in a single full-screen TUI, with mouse support and a clean theme. It is interactive-only: no history, no alerts, no web UI. That is fine for the 80% of cases where you just want to know "what is eating my CPU right now."

[Glances](https://github.com/nicolargo/glances) (33k stars, Python) is a `top` alternative with more ambition: it runs in the terminal but can also export to a web UI, JSON, or InfluxDB, and supports threshold-based alerts via a config file. Because it is Python, it is heavier (~50-80 MB) and slower to start, but it is cross-platform and the threshold alerts make it a step up from btop without going full Prometheus.

### Web dashboards: Netdata and vpsmon

[Netdata](https://github.com/netdata/netdata) (80k stars, Go) is the heavyweight champion of lightweight monitoring. It auto-discovers hundreds of metrics (CPU, memory, disk, network, per-process, containers, databases) with zero configuration and ships a polished web UI with built-in alarms and notifications. The catch is memory: a default install uses 100-150 MB. On a 2 GB VPS that is acceptable; on a 512 MB one, you can trim it (disable unused collectors, lower the history retention in `netdata.conf`) down to roughly 40-60 MB, but it requires fiddling.

[vpsmon](https://github.com/leodeim/vpsmon) is the opposite extreme: one static Go binary, ~5 MB RSS, web UI with login, auto-refresh every 5 seconds. It monitors CPU, memory, swap, disk, network, uptime, and process count — the essentials, nothing more. Install is a one-liner (`curl -sL https://raw.githubusercontent.com/leodeim/vpsmon/main/install.sh | sudo bash` — review the script before piping it, as with any curl-to-bash installer). Configuration is via environment variables: `MONITOR_ADDR` (default `:8088`), `MONITOR_USER` (default `admin`), and `MONITOR_PASS_HASH` (bcrypt; the default password is `changeme` — change it before exposing anything).

### Metrics exporter: node_exporter

[node_exporter](https://github.com/prometheus/node_exporter) (13.7k stars, Go) is the Prometheus agent that exposes raw machine metrics on port 9100. Alone it is useless (no UI), but it is the standard way to feed metrics into any collector — Prometheus, VictoriaMetrics, or even a cron-based scraper. If you plan to grow into a real stack later, run node_exporter now and keep the door open.

### Uptime and availability: Uptime Kuma

Monitoring is not only about resources — it is also about "is my service reachable?" [Uptime Kuma](https://github.com/louislam/uptime-kuma) (90k stars) is the self-hosted status page everyone uses: it pings HTTP(S), TCP, ICMP, and more from outside the machine, with rich notifications (Telegram, Discord, email, webhooks). It runs in Docker and uses 100-200 MB, so it usually lives on a separate small server or a homelab node — ideally not on the very VPS it is monitoring.

## Comparison Table

| Tool | Type | RAM (typical) | Install effort | Alerting | Best for |
|------|------|---------------|----------------|----------|----------|
| btop | Terminal TUI | ~10-20 MB | `apt install btop` | No | Quick interactive checks |
| Glances | Terminal + web/export | ~50-80 MB | `pip install glances` or apt | Yes (thresholds) | Cross-platform, scriptable stats |
| Netdata | Web dashboard | 100-150 MB (40-60 tuned) | One-liner or Docker | Yes (built-in alarms) | Rich auto-discovered metrics |
| vpsmon | Web dashboard | ~5 MB | One-liner (Go binary) | No | Minimal VPS, essentials only |
| node_exporter | Metrics exporter | ~20-40 MB | Binary + systemd unit | No (feeds others) | Future-proofing for Prometheus |
| Uptime Kuma | Uptime/status | ~100-200 MB (Docker) | Docker compose | Yes (many channels) | Availability monitoring from outside |

## Practical Setup for a Small VPS

The pragmatic combo for a 512 MB VPS: **btop for interactive checks + Uptime Kuma (on another machine) for availability + one lightweight web dashboard**. For the dashboard, start with vpsmon if you want the smallest footprint, or Netdata if you want depth and can spare the RAM.

**vpsmon (minimal):**

```bash
curl -sL https://raw.githubusercontent.com/leodeim/vpsmon/main/install.sh | sudo bash
# set a real password, then restart the service
# MONITOR_ADDR=:8088 MONITOR_USER=admin MONITOR_PASS_HASH=$(htpasswd -bnBC 10 "" 'your-password' | tr -d ':\n')
```

**Netdata (docker, 2 GB+ VPS):**

```bash
docker run -d --name=netdata \
  --pid=host --network=host \
  -v netdataconfig:/etc/netdata -v netdatalib:/var/cache/netdata \
  --restart=unless-stopped \
  netdata/netdata
```

**node_exporter (systemd):**

```bash
curl -sL -o /tmp/node_exporter.tar.gz https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
sudo tar -xzf /tmp/node_exporter.tar.gz -C /opt
sudo ln -s /opt/node_exporter-1.8.2.linux-amd64/node_exporter /usr/local/bin/
# create a systemd unit and enable it; metrics at :9100/metrics
```

**One rule for all of them:** never expose a monitoring dashboard to the public internet without authentication. Dashboards are an attack surface — they reveal your services, versions, and usage patterns. Put them behind a reverse proxy with auth, or bind them to localhost and reach them over SSH tunneling. If you are already filtering junk traffic at the edge, [our guide on detecting and blocking bot traffic]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) shows how to protect exposed services.

## How to Choose

- **512 MB VPS, single service** → btop + Uptime Kuma elsewhere. Add vpsmon only if you want a web view.
- **2 GB VPS, several containers** → Netdata (tuned) or Glances + Uptime Kuma.
- **Homelab node (8 GB+)** → this is where Prometheus + Grafana start making sense; run node_exporter and a proper stack. See the [container vs VM comparison]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) to decide what you are monitoring in the first place, and [PostgreSQL tuning for homelab]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}}) if a database is the thing you care about most.

## Conclusion

Monitoring a small Linux server does not require a full observability stack. Start with btop for the moment you suspect a problem, add Uptime Kuma for the "is it actually up?" question, and pick one lightweight dashboard — vpsmon at ~5 MB or Netdata for depth — for the always-on view. Track disk and memory trends before you need them: the first time a 512 MB VPS runs out of swap is not the time to learn your monitoring tool.

Read also:

- [How to Detect and Block Bot Traffic on Your Self-Hosted Website [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
