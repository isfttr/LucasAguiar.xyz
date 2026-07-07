---
date: 2026-07-03T13:00:00.000Z
draft: false
title: 'How to migrate from Proxmox VE 8 to 9: step-by-step guide [2026]'
description: 'Complete guide to migrating from Proxmox VE 8 (Debian 12-based) to Proxmox VE 9 (Debian 13 Trixie): repositories, kernel 6.14 upgrade, ZFS 2.3, common pitfalls and post-upgrade verification.'
featured_image: ''
categories:
  - article
tags:
  - proxmox
  - linux
  - virtualizacao
  - homelab
  - self-hosting
  - tutorial
translation_source_hash: a3ad4de02966644b9e5fc4144d5a604a5388873f060b1f949545ab14523a8d2e
---
Proxmox VE 9 is now available, bringing as its main new features the Debian 13 "Trixie" base, the Proxmox kernel 6.14 (based on Ubuntu 24.04 LTS), and ZFS 2.3 with draid support and compression improvements. If you are still on PVE 8, the migration is straightforward, but requires attention to a few details — especially repositories, cluster, and storage compatibility.

This guide covers the complete step-by-step process to migrate your Proxmox VE 8.x node to 9, including the exact commands, post-upgrade checks, and the most common pitfalls.

---

## Before you start: requirements

PVE 9 maintains the same hardware requirements as PVE 8:

- x86-64 CPU with VT-x/AMD-V and AES-NI (2+ cores, recommended 4+)
- Minimum 4 GB RAM (recommended 8 GB+)
- Minimum 32 GB disk for the system
- Clusters: all nodes must be on PVE 8.x and healthy

### Pre-migration checklist

Before any upgrade command, ensure that:

- [ ] Full backup of configurations and VMs/CTs (vzdump, PBS, or snapshot)
- [ ] Cluster in quorum: `pvecm status` — all nodes online
- [ ] PVE 8 on the latest patch: `apt update && apt dist-upgrade -y`
- [ ] Sufficient free disk space (at least 5 GB)
- [ ] Backup restore test in an isolated environment (recommended)

If you have a cluster, the upgrade must be done **node by node**, removing HA from VMs before each node.

---

## Step-by-step migration

### 1. Adjust the repositories

PVE 9 uses the same `bookworm` repository naming (don't be fooled: PVE 9 packages are still in the repository called `bookworm` for internal compatibility, but they point to packages compiled for Debian 13).

For users with an enterprise subscription:

```bash
cat << EOF > /etc/apt/sources.list.d/pve-enterprise.list
deb https://enterprise.proxmox.com/debian/pve bookworm pve-enterprise
EOF
```

For users without a subscription (free repository):

```bash
cat << EOF > /etc/apt/sources.list.d/pve-no-subscription.list
deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription
EOF
```

Remove old or incorrect repositories:

```bash
rm -f /etc/apt/sources.list.d/pve-enterprise.list
rm -f /etc/apt/sources.list.d/pve-no-subscription.list
# Then recreate with the content above
```

> **Note:** If you used third-party repositories (Ceph, ZFS), check if they have a version compatible with Debian 13.

### 2. Update the Proxmox packages

```bash
apt update
apt dist-upgrade -y
```

This installs the latest PVE 9 package versions still in the `bookworm` repository. The system remains technically on Debian 12, but with updated Proxmox packages.

### 3. Update the Debian base (Bookworm → Trixie)

Now you switch the system base to Debian 13:

```bash
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list
```

Check that no other files in `/etc/apt/sources.list.d/` still point to `bookworm`:

```bash
grep -r "bookworm" /etc/apt/sources.list.d/
```

If found, evaluate whether they should also be updated (third-party repositories may or may not have a Trixie version).

Then perform the full upgrade:

```bash
apt update
apt upgrade -y
apt full-upgrade -y
```

### 4. Reboot

```bash
reboot
```

After reboot, verify the active kernel:

```bash
uname -r
```

The expected output is something like `6.14.x-1-pve` (Proxmox kernel 6.14). If a 6.8 kernel still appears, check the bootloader:

```bash
dpkg -l | grep pve-kernel-6.14
proxmox-boot-tool status
```

### 5. Post-upgrade checks

```bash
# Cluster status (if applicable)
pvecm status

# Web service
systemctl status pveproxy

# ZFS storage
zpool status
zfs list

# VMs and containers
qm list
pct list

# Error logs
journalctl -p 3 -xb | grep -i error

# Proxmox version
pveversion
```

The `pveversion` command should return `pve-manager/X.X.X` with version 9.x.

---

## What changed in PVE 9

### Kernel 6.14

PVE 9 comes with the Proxmox VE Kernel 6.14, based on the Ubuntu 24.04 LTS kernel. Improvements include a more efficient scheduler, support for newer hardware (network cards, NVMe controllers, GPUs), and security fixes. **The legacy kernel (5.15) has been removed** — the `pve-kernel-5.15` meta-package no longer exists.

### Debian 13 "Trixie"

The new base brings updated glibc, systemd, and toolchain. Most user packages remain compatible, but check LXC containers with very old systems.

### ZFS 2.3

ZFS has been updated to version 2.3, which brings:

- Support for `draid` (distributed RAID) — more efficient allocation than traditional raidz
- Compression improvements with Zstandard
- Enhanced `zfs_autoimport`

### Ceph Squid (19.2)

For those using Ceph, the version has been updated from Reef (18.2) to Squid (19.2). The Ceph migration must be done separately — refer to the official Ceph Squid guide.

### Corosync 3.1

Corosync has been updated to 3.1.x. Configurations in 2.x format still work, but with warnings. PVE 9 recommends migrating to the new YAML configuration format.

---

## Common pitfalls and solutions

| Problem | Symptom | Solution |
|---------|---------|----------|
| Repository 404 | `apt update` fails | Check that sources.list use `bookworm` (not `trixie`) for PVE repositories |
| Kernel not updating | `uname -r` shows kernel 6.8 | `apt install pve-kernel-6.14` and `proxmox-boot-tool refresh` |
| Corosync offline | `pvecm status` shows node offline | Edit `/etc/corosync/corosync.conf` to YAML format for corosync 3.x |
| ZFS not mounting | `zpool import` fails | `zpool import -a` then `zfs mount -a` |
| Network drops after reboot | No connectivity | Check `/etc/network/interfaces` — if using classic `ifupdown`, reinstall |
| VM fails to start | Kernel panic in guest | Convert IDE/SCSI disk controller to VirtIO SCSI single |
| PBS disconnects | Client error | `apt install proxmox-backup-client` for compatible version |
| HA resources stop | HA services shut down | `systemctl restart pve-ha-manager pve-ha-crm` |

---

## Cluster migration

For clusters with multiple nodes, the recommended procedure is:

1. Remove HA from all VMs/CTs on the node to be migrated
2. Migrate the VMs/CTs to other nodes
3. Upgrade the node (steps 1-4 above)
4. Verify the node has returned to the cluster (pvecm status)
5. Migrate the VMs/CTs back (optional)
6. Repeat for each node

Never try to upgrade all nodes simultaneously — you may lose cluster quorum.

---

## Final considerations

If you encounter errors during the upgrade, the official Proxmox forum and the [upgrade documentation](https://pve.proxmox.com/wiki/Upgrade_from_8_to_9) are the best sources of reference.

Also read:

- [Fixing Login Errors in Proxmox Web Interface: Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to Install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})


Read also:

- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Feel free to get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
