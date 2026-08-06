---
date: 2026-08-06T15:07:52-03:00
draft: true
title: "Proxmox VE on ARM64: Complete Homelab Guide [2026]"
description: "Proxmox VE 9.2 now officially supports ARM64: supported hardware (NVIDIA Grace, Vera), best-effort SBCs, UEFI-only boot, limitations and what it means for homelabs."
featured_image: ""
categories:
  - article
tags:
  - proxmox
  - arm64
  - homelab
  - virtualization
  - linux
---

On August 5, 2026, Proxmox shipped something the homelab community had been asking for since the Raspberry Pi era began: the first official release of Proxmox Virtual Environment for 64-bit ARM (arm64/aarch64). For years, running PVE on ARM meant unofficial ports, community builds, and praying that your SD card wouldn't corrupt itself. That era is over — but the reality of ARM64 support is more nuanced than "Proxmox now runs on a Raspberry Pi." Here's what the release actually means, what hardware works, and how to decide whether an ARM cluster belongs in your homelab.

## What was announced

Proxmox VE 9.2 is the first release with official support for a second CPU architecture. Until now, PVE was x86-64 (amd64) only. The ARM64 build shares the code base, package repositories, and release lifecycle with its x86-64 counterpart — it is not a fork or a technology preview. Under the hood it runs [Debian 13.5 "Trixie"](https://www.debian.org/releases/trixie/) with Linux kernel 7.0 as the stable default, and ships the same versions of the core stack: QEMU 11.0, LXC 7.0, and ZFS 2.4.

The [official press release](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-launches-official-arm64-support) (August 5, 2026) highlights day-one validation for NVIDIA Grace and NVIDIA Vera CPU architectures, with "complete feature parity across KVM, LXC, ZFS, and Ceph storage stacks." The [forum announcement](https://forum.proxmox.com/threads/proxmox-virtual-environment-now-available-for-64-bit-arm-arm64.185527/) from Proxmox staff confirms it is already deployed in production on the supported platforms, thanks to a close collaboration with NVIDIA.

## Supported hardware: the fine print

This is the part that matters most for homelabbers. The support tiers are:

| Tier | Hardware | Status |
|------|----------|--------|
| Fully supported | NVIDIA Grace Hopper and NVIDIA Vera platforms | Official, same lifecycle as x86-64 |
| Best-effort | Other UEFI-based ARMv9-A or newer hardware (ARMv8-A generally works too) | Community-level support |
| Not supported | Device-tree-only single-board computers (e.g. Raspberry Pi) | Will not boot |

The Raspberry Pi exclusion is the headline for most homelabs. Because the host must boot through UEFI and describe its hardware through ACPI, device-tree-only SBCs are out. That rules out the Pi 4/5, most Banana Pi boards, and the classic ARM homelab boards. The realistic targets for "best-effort" support are UEFI-capable ARM platforms like the Ampere Altra/AmpereOne servers, the Mac Mini M-series family, and the growing range of ARM developer boxes (e.g. the [Rock 5B+](https://www.okdo.com/p/rock-5b-plus/), [Radxa](https://radxa.com/) boards with UEFI firmware).

If you're considering a purchase, look for two words in the spec sheet: **UEFI** and **ACPI**. That combination is the dividing line between "will probably work" and "will not boot."

## What's different on ARM64

Configuration, tooling, and documentation are identical to x86-64, with a small set of architecture-specific differences:

- **VMs always boot through UEFI**, using the ARM build of OVMF (AAVMF). SeaBIOS is not available on arm64 — legacy BIOS-style boot is gone.
- **AMD SEV memory encryption and Intel GVT-g mediated vGPUs are x86-only.**
- **No OS-level CPU microcode package** (the ARM equivalent of `intel-microcode`/`amd64-microcode` doesn't exist).
- **Guests only run on nodes matching their architecture**, and live migration only works between nodes of the same architecture. You can't mix amd64 and arm64 nodes in a cluster and expect live migration between them.

The last point matters for anyone planning a migration: an ARM64 cluster is a separate fleet, not a drop-in extension of an existing x86 cluster. Storage (ZFS, Ceph) and networking behave the same, but compute is partitioned by architecture.

## Why ARM64 matters for homelabs

The release lands at a moment when ARM servers are becoming genuinely interesting for self-hosters:

1. **Power efficiency.** ARM64 cores deliver far better performance-per-watt than x86 for typical homelab workloads — containers, web services, media stacks, databases with moderate load. A small ARM cluster can replace a loud x86 tower at a fraction of the idle draw.
2. **Density.** Platforms like NVIDIA Grace Hopper are aimed at datacenter density, but the same engineering (high core counts, integrated memory) is trickling down to the used market and developer hardware.
3. **Enterprise validation.** NVIDIA's involvement means the port is hardened against real production workloads — memory management, ZFS, and Ceph on ARM got serious testing. That raises the quality bar for the best-effort tier too.

The honest counterpoint: for a single-node homelab doing light virtualization, x86-64 remains the path of least resistance. Every guide, every forum answer, every Proxmox script in the ecosystem assumes amd64. ARM64 is the right choice when you're building a dedicated low-power fleet or running ARM-native workloads (Docker on ARM, ARM CI runners, edge services).

## Getting started

The [ARM64 ISO](https://www.proxmox.com/en/downloads) is available from the regular downloads page (the enterprise mirror also carries it). Installation follows the same installer flow as x86-64; the main practical differences are boot requirements (UEFI) and firmware (AAVMF). The [PVE documentation](https://pve.proxmox.com/pve-docs) applies to both architectures, and the [roadmap](https://pve.proxmox.com/wiki/Roadmap) tracks what's next.

Before installing, verify your hardware boots UEFI and exposes ACPI — check the vendor firmware settings. If you're on a best-effort board, plan to test with a non-production workload first, and expect to lean on the [community forum](https://forum.proxmox.com) rather than enterprise support.

## What to watch next

The announcement explicitly says Proxmox is "working together with further enterprise server vendors on their ARM efforts" — expect the officially supported hardware list to grow. The two things I'm watching:

- **Consumer ARM boards with UEFI firmware.** If the Rockchip/Amlogic ecosystem ships proper UEFI+ACPI firmware, a $200 ARM SBC could become a legitimate PVE node.
- **ARM64 support in the wider ecosystem.** PBS (Proxmox Backup Server) and the community scripts ([which the blog already covers]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})) will need ARM64 builds before ARM homelabs feel fully first-class.

For anyone already running PVE, the migration path is straightforward — [the 8→9 upgrade guide]({{< relref "posts/migracao-proxmox-8-9-2026/" >}}) covers the x86 side, and the ARM64 installer handles fresh deployments. If you run into login or web-interface issues on a new ARM node, the [Proxmox login troubleshooting guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) applies unchanged.

## Conclusion

The ARM64 release is a genuine milestone: Proxmox is no longer an x86-only platform, and the ARM server ecosystem has a first-class hypervisor with enterprise backing. For homelabs, the practical takeaway is clear — ARM64 is for UEFI-based ARM hardware (Grace, Vera, Ampere, and best-effort consumer boards), not for Raspberry Pis, and an ARM cluster is a separate fleet from your x86 nodes. If you've been eyeing a low-power ARM server, 2026 is the year it stopped being a hack.

Read also:

- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to migrate from Proxmox VE 8 to 9: step-by-step guide [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})
- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
