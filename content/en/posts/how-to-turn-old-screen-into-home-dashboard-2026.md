---
date: 2026-10-08T15:04:34-03:00
draft: true
title: "How to Turn an Old Screen Into a Home Dashboard or Digital Sign [2026]"
description: "Step-by-step guide to repurposing an old monitor, tablet, or laptop into a home dashboard or digital sign with Home Assistant, Netdata, Glances, and kiosk-mode browsers. Cheap, evergreen, self-hosted."
featured_image: ""
categories:
  - article
tags:
  - homelab
  - selfhosted
  - dashboard
  - home-assistant
  - linux
---

An old monitor, tablet, or laptop sitting in a drawer is one of the cheapest components of a memorable homelab: turned into an always-on dashboard, it becomes the single most useful screen in the house. This guide walks through the practical options — from a two-minute kiosk browser to a full Home Assistant wall panel — and the hardware, energy, and security trade-offs you should think about before wiring anything up.

The idea keeps surfacing in the community: everything from tiny web apps that [turn any screen into a sign](https://bigwords.page/) to elaborate smart-home panels. The underlying question is always the same — "I have an old screen, what can I actually do with it that's useful?" — and it's a genuinely timeless one.

## What you actually have (and what to use it for)

Almost any old display works. A retired laptop (the hinge broken, the battery swollen) is a full computer with an integrated screen — the most practical starting point. An Android tablet is perfect for a wall-mounted home control panel. A standalone monitor needs a small host (a Raspberry Pi or an old Mini PC). An e-ink reader is the low-power outlier for always-on, update-slowly displays.

Pick the job before you pick the hardware:

- **System monitoring** (CPU, RAM, disks, network): best served by a web dashboard served from one of your servers.
- **Home automation control** (lights, thermostats, cameras): a Home Assistant panel.
- **Public-ish signage** (calendar on the fridge, weather, to-do): a kiosk browser pointed at a single URL.

## The lazy option: point a kiosk browser at a URL

If all you need is "this screen shows this page and nothing else," a kiosk-mode browser is the lowest-effort, highest-reliability path. On Linux, Chromium and Firefox both ship kiosk flags, so a Raspberry Pi (or that old laptop running Linux) can boot straight into a dashboard. It takes minutes and is easy to undo.

For the dashboard itself you can start with tools you may already run. [Netdata](https://www.netdata.cloud/) gives you real-time, per-second graphs of every metric on a host out of the box, with zero configuration — point your kiosk at its web UI and you instantly have a living "is my homelab OK" screen. [Glances](https://github.com/nicolargo/glances) is a lighter Python alternative that can export an embedded web interface and even run in the terminal for a minimalist text panel.

Both are covered in more depth in our [lightweight Linux VPS monitoring guide]({{< relref "posts/lightweight-linux-vps-monitoring-guide-2026/" >}}), which compares their RAM footprints on small machines — useful reading before you commit a whole screen to one.

## The fully loaded option: a Home Assistant wall panel

If your dashboard is going to control your smart home, a screen running the Home Assistant front end is the de-facto standard. Install HA (the [official installation](https://www.home-assistant.io/installation/) supports many target platforms), build a dashboard with the [Lovelace interface](https://www.home-assistant.io/dashboards/), and you have a control surface for lighting, climate, media, and cameras.

For a dedicated panel, the [lovelace-wallpanel](https://github.com/j-a-n/lovelace-wallpanel) custom card is the piece that turns a browser into a proper wall panel: it adds features like auto-hiding the cursor after inactivity, turning the screen off overnight, and waking it on a tap. It's the single most common "make my old tablet a home panel" building block in 2026.

A common pattern is to run Home Assistant on a server (in a container or VM) and only run a thin kiosk client on the old screen — that keeps the screen dumb, cheap, and replaceable. If you're deciding where that backend should live, our [containers vs virtual machines comparison]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) covers the trade-offs.

## Hardware, energy, and burn-in

This is the part most tutorials skip, and it's where abandoned projects die.

- **Power:** an always-on screen draws a surprising amount of electricity. A 15–20 W monitor running 24/7 costs a few dollars a month; an e-ink panel is essentially free. If power is a concern, put the display on a schedule (dim/brightness rules; wallpanel-style "screensaver at night"). Netdata on the host makes the cost measurable rather than guessed.
- **Burn-in:** OLED and older plasma screens degrade with static content. Use a screensaver when idle and design dashboards with minimal long-term-stationary bright elements.
- **Heat and safety:** old swollen batteries should be removed before a laptop becomes a 24/7 sign. Recycle the battery, run on AC.
- **Repurposing matters:** an old [Mini PC or laptop]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}}) running a lightweight Linux is often powerful enough for the whole job, keeping the investment at zero.

## Don't put the dashboard on your open network

A dashboard that shows cameras, energy data, or server internals should not be exposed to the internet or even broadcast on your LAN without a thought. Keep dashboards and their backends inside your home network (or a management VLAN), use authentication on anything that can mutate state, and if you genuinely need to check it remotely, reach it through a VPN rather than port forwarding. Our [self-hosted mesh VPN guide]({{< relref "posts/self-hosted-mesh-vpn-wireguard-headscale-guide-2026/" >}}) shows how to build that secure remote-access layer.

If the display will ever be connected to untrusted networks, treat the kiosk as a disposable, reflashable client — the recovery business is covered in our [bot-traffic and self-hosted security guide]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}).

## Putting it together

A realistic, cheap starting build: an old laptop running Linux, in kiosk mode, pointed at Netdata (or Glances) for server health, plus a second browser tab or dashboard view toward Home Assistant for control. That's a functional, useful, near-zero-cost dashboard in an afternoon — and it's the kind of project that still earns its place on a wall two years from now.

The key is to pick the single job the screen should do, wire the simplest tool that does it, and not over-engineer past the hardware you already own.

Also read:

- [How to Monitor a Linux VPS: Lightweight Tools Compared [2026]]({{< relref "posts/lightweight-linux-vps-monitoring-guide-2026/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Self-Hosted Mesh VPN in 2026: WireGuard and Headscale Complete Guide]({{< relref "posts/self-hosted-mesh-vpn-wireguard-headscale-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
