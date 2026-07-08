---
date: 2026-06-20T22:45:00.000Z
draft: false
title: 'How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked'
description: Transforming a 2018 Mac Mini with a T2 chip into a Proxmox node seems simple, but Secure Boot and the black screen issue stop almost everyone. See the exact settings that made the installation succeed.
featured_image: ''
categories:
  - tutorial
tags:
  - proxmox
  - homelab
  - linux
  - self-hosting
translation_source_hash: b4bac54c33233364cec54bf63c3a4210ffe007776dd6693c06254780a70d5e5a
slug: install-proxmox-ve-mac-mini-2018-t2
aliases:
  - /posts/proxmox-mac-mini-2018-t2/
---
Installing **Proxmox on Mac Mini 2018** seems like a five-minute task: burn the ISO to a USB drive, boot, and follow the installer. In practice, Apple's T2 security chip places two obstacles in the way — blocked boot and a screen that simply turns off — and it's easy to spend hours hitting these two walls. This post documents the exact settings that made the installation work end-to-end, so you don't lose the time I did.

The target machine here is a Mac Mini 2018 (Intel, 32 GB RAM) that became a dedicated node in a Proxmox cluster. If your goal is similar — repurposing an old Mac as a virtualization server — this is the path that worked.

## The underlying obstacle: the T2 chip

Every Intel Mac from 2018 to 2020 has the [Apple T2 chip](https://support.apple.com/en-us/102522), which handles Secure Boot, storage encryption, and boot media policy. By default, it only trusts Apple-signed systems (and Windows via Boot Camp). Any Linux bootloader — including Proxmox's — is rejected.

That's why, when trying to boot from the USB drive, instead of the installer, you land on a screen similar to macOS Recovery. It's not your bug: it's the T2 doing its job.

## Step 1 — Disable Secure Boot (the detail that `csrutil disable` does NOT solve)

Here lies the first trap. Many guides instruct to run `csrutil disable` in Recovery, and this seems to solve it — but **it doesn't**. `csrutil disable` deactivates **SIP** (System Integrity Protection), which is something else. What blocks Linux boot is **Secure Boot**, and it is only turned off by the graphical tool **Startup Security Utility**.

The correct procedure, according to the [Apple documentation](https://support.apple.com/en-us/102522) itself:

1. Restart holding **Command (⌘) + R** to enter Recovery.
2. In the menu bar, go to **Utilities → Startup Security Utility**.
3. Authenticate with a macOS administrator account.
4. Adjust **both** options:
   - **Secure Boot** → *No Security*
   - **Allowed Boot Media** → *Allow booting from external or removable media*

The second adjustment is the most overlooked. Media policy is independent of Secure Boot: even with Secure Boot set to "No Security", the T2 still rejects the USB drive if you don't explicitly allow external media. Both need to be checked.

Once this is done, the Proxmox installer finally loads when selecting the **EFI Boot** entry from the Option button menu.

## The black screen problem (and why `nomodeset` might not be enough)

Boot resolved, the second wall appears: when choosing "Install Proxmox VE", the screen turns off and the monitor goes into standby mode. The cause is the integrated graphics card (Intel UHD 630): the ISO kernel tries to change the video mode, fails on the T2 hardware, and the signal dies.

The classic recipe is to edit the boot entry (`e` key) and add the `nomodeset` parameter, which prevents the kernel from loading the graphics driver and maintains the firmware framebuffer. It's worth a try — but in my case, with a high-resolution monitor, **not even `nomodeset` saved it**: the screen kept turning off. If you only have a 4K monitor at hand, prepare for this scenario.

Instead of continuing to fight with the video, the solution was to change strategy.

## Step 2 — The turning point: headless and automated installation

The trick is simple: if the problem is the installer's video, **take video out of the equation**. Proxmox supports automated (unattended) installation since version 8.2, and that's what solves it for good. You prepare an answer file, embed it in an ISO, boot blindly, and manage everything over the network.

According to the [official automated installation wiki](https://pve.proxmox.com/wiki/Automated_Installation), the workflow uses the `proxmox-auto-install-assistant` tool. On any Debian/Proxmox host you already have:

```bash
apt update
apt install proxmox-auto-install-assistant
```

Create `answer.toml` with the minimal configuration (adjust the fields):

```toml
[global]
keyboard = "pt-br"
country = "br"
fqdn = "proxmox-mini.seudominio.com"
mailto = "seu-email@dominio.com"
timezone = "America/Sao_Paulo"
root_password = "SUA_SENHA_FORTE"

[network]
source = "from-dhcp"

[disk-setup]
filesystem = "ext4"
disk_list = ["nvme0n1"]
```

Two important details of this file:

- **`disk_list = ["nvme0n1"]`**: with Secure Boot disabled, the Mac Mini's internal SSD appears as `nvme0n1`, while the installation USB drive appears as `/dev/sda`. There is no ambiguity — it installs to the correct disk.
- **`source = "from-dhcp"`**: here lies the catch of the next step (more on this later).

Now prepare the automated ISO from the official Proxmox ISO:

```bash
proxmox-auto-install-assistant prepare-iso proxmox-ve_9.2-1.iso \
  --fetch-from iso --answer-file ./answer.toml
```

This generates a `*-auto-from-iso.iso` file. Burn it to the USB drive, boot via EFI Boot, and **don't touch anything**: after 10 seconds, the "Automated Installation" entry starts automatically. The installation runs entirely without you seeing the screen — and a few minutes later Proxmox is already installed and reboots.

> **Risk tip:** On some T2 Macs, the ISO kernel cannot write to NVRAM and the bootloader installation fails invisibly. If the node does not appear on the network after about 20 minutes, the solution is to remaster the ISO including `nomodeset efi=noruntime` in the command line of the automated entry. The `efi=noruntime` parameter is the documented solution on the [t2linux wiki](https://wiki.t2linux.org/distributions/debian/installation/) for this specific NVRAM issue.

## Step 3 — The network gotcha (`192.168.100.2`)

Here's the lesson that cost an extra reconfiguration: **plug in the Ethernet cable before installing**.

In my case, the Mac Mini was on WiFi only during installation. Since `answer.toml` requested `from-dhcp` and there was no cable, the wired card had no link, no lease was obtained, and Proxmox defaulted to the installer's IP: `192.168.100.2/24` — a different subnet from my real network.

Worse: Proxmox uses a bridge over the wired card (`vmbr0`), not WiFi. And the Mac Mini's Broadcom WiFi doesn't even work without the T2 patches. In other words, without a cable, there is no usable network.

Since the local console was black (the video problem), the correction was made via a direct connection: laptop cable directly into the Mac Mini, laptop on a `192.168.100.x` IP, and SSH access to `root@192.168.100.2`. Inside, I edited `/etc/network/interfaces` for a static IP on my network:

```bash
nano /etc/network/interfaces
```

Changing only the `address` and `gateway` lines of the `vmbr0` block (keeping `bridge-ports` as it was):

```
auto vmbr0
iface vmbr0 inet static
        address 192.168.10.30/24
        gateway 192.168.10.1
        bridge-ports enp0s31f6
        bridge-stp off
        bridge-fd 0
```

A `reboot`, the cable moved to the real switch, and the node came up on the definitive IP. For a cluster node, a static IP is the recommended path anyway — clusters don't like IPs that change.

The moral: **if you plug in the Ethernet cable before installing, `from-dhcp` works first try and you skip this entire step.**

## Step 4 — What's still missing: T2 kernel for video and fan

At this point, Proxmox (version 9.2.2, in my case) is installed, on the network, and accessible via the [web interface](/posts/troubleshooting-proxmox-login-interface/) — without ever needing a monitor again. But the local video still goes black on boot, because the default Proxmox kernel does not support T2 hardware.

For a node that will be on 24/7, the final step is to install, via SSH, the kernel with T2 patches and Apple's proprietary firmwares, maintained by the [t2linux](https://wiki.t2linux.org/) project. It's this kernel that makes video, fan control, and sensors work correctly — something essential to prevent the machine from overheating during continuous use.

However, in my experience, I didn't need to make any changes, the
fan was working normally after the installation process (steps 1 to
3).

## Conclusion

The Mac Mini 2018 is a great candidate for a homelab node — silent, efficient, and with good processing power — but the T2 chip turns a trivial installation into a puzzle. The three points that unlock everything are: disabling **Secure Boot with the correct tool** (not `csrutil`), circumventing the black screen with an **automated headless installation**, and **plugging in the network cable beforehand** for DHCP to work.

If you are deciding between systems to repurpose Apple hardware, it might be worth reading [Linux, Windows, or macOS: which to use in 2026](/posts/linux-windows-macos-qual-usar-2026/) before erasing macOS. But if the decision is already made and the destination is Proxmox, the path above is what works.

Read also:

- [Script for Updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [10 years using the MacBook Pro 9,2]({{< relref "posts/10-years-of-macbook-pro/" >}})

---
