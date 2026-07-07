---
date: 2026-07-03T13:30:00.000Z
draft: false
title: 'Proxmox Backup Server: installation via community-scripts and backup configuration [2026]'
description: Complete guide to installing Proxmox Backup Server (PBS) using community-scripts in an LXC container, configuring datastore, integrating with Proxmox VE, and automating backups with scheduling and integrity verification.
featured_image: ''
categories:
  - article
tags:
  - proxmox
  - linux
  - backup
  - homelab
  - self-hosting
  - tutorial
translation_source_hash: 242bd84d2f96b18a8d1177e567dd581134905743ebc82c6e58bae9746ed1a7a9
---
If you run Proxmox VE at home or in a homelab, one of the first things you need to sort out is backup. **Proxmox Backup Server (PBS)** is the official integrated solution — incremental backup, deduplication, Zstandard compression, and integrity verification, all native.

The fastest way to get PBS up and running is by using the **community-scripts** (formerly Proxmox VE Helper-Scripts), which install PBS in an LXC container in a few minutes. This guide covers everything: installation, datastore configuration, integration with PVE, and backup automation.

---

## What is Proxmox Backup Server

PBS is a specialized backup server for Proxmox environments. Unlike generic solutions (rsync, Bacula, Veeam), it understands the QEMU disk format and Proxmox VE snapshots, which enables:

- **Incremental backups** — only changed blocks are transferred
- **Deduplication** — identical data (even across different VMs) takes up space only once
- **Zstandard compression** — fast and efficient
- **Integrity verification** — detects bit rot and silent corruption
- **Granular restore** — individual file, entire VM, or container

---

## Installation via Community-Scripts

The community-scripts ([official site](https://community-scripts.org/scripts/proxmox-backup-server)) are community-maintained scripts that automate the creation of containers and VMs for common services on Proxmox.

On the Proxmox node shell (via SSH or console), run:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/proxmox-backup-server.sh)"

```

The script will ask the following questions:

| Setting | Suggestion |
|-------------|----------|
| Container ID | 102 (or next available) |
| Hostname | `pbs` |
| Root disk size | 8 GB |
| Datastore size | 100 GB+ (adjust as needed) |
| RAM | 4096 MB |
| CPU cores | 2 |
| Bridge | vmbr0 |
| Static IP | Choose a fixed IP on your network |
| Gateway | IP of your router |
| DNS | 8.8.8.8 (or your preferred DNS) |

At the end, the script displays the generated password for the PBS `root` user — **write it down**.

---

## Initial PBS Configuration

### 1. Access the web interface

Open your browser at: **https://<PBS_IP>:8007**

- User: `root`
- Password: the one provided by the script

> If the browser complains about the self-signed certificate, that is normal — it is a certificate generated during installation. You can replace it later with a Let's Encrypt one.

### 2. Create the datastore

In the PBS dashboard, go to **Datastore → Add Datastore**:

- Name: `backups` (or any name you prefer)
- Path: `/mnt/datastore/backups` (the script already creates the mount point)
- Compression: **Zstandard (zstd)** — best speed/compression ratio
- Keep backups: define retention policy (e.g., keep backups from the last 14 days)

### 3. Verify the datastore disk

The community-scripts script already creates and formats an extra disk for the datastore. To verify:

```bash
df -h /mnt/datastore/backups
lsblk
```

If you need to manually add a disk later:

```bash
mkfs.ext4 /dev/vdb
mount /dev/vdb /mnt/datastore/backups
echo '/dev/vdb /mnt/datastore/backups ext4 defaults 0 0' >> /etc/fstab
```

---

## PVE → PBS Integration

### 1. Obtain the PBS fingerprint

On the PBS container shell:

```bash
proxmox-backup-manager cert info | grep Fingerprint
```

Copy the fingerprint (a long string like `SHA256:...`).

### 2. Add PBS as storage in PVE

In Proxmox VE, go to **Datacenter → Storage → Add → Proxmox Backup Server** and fill in:

- ID: `pbs-backup`
- Server: PBS IP
- Datastore: `backups` (exactly the name you created)
- Username: `root@pam`
- Password: PBS root password
- Fingerprint: paste the fingerprint copied above (optional: check "Do not verify" the first time)

### 3. Test the connection

After adding, click on the `pbs-backup` storage and then on **Content**. The list should appear empty (no errors) — meaning the connection is working.

---

## Automating Backups

### 1. Create a backup job

In PVE, go to **Datacenter → Backup → Add**:

- **ID**: `backup-weekly`
- **Node**: select the node(s)
- **Storage**: `pbs-backup`
- **Schedule**: `0 2 * * 0` (Sundays at 02:00) or your preferred time
- **Selection Mode**: `Include selected VMs` and check the VMs/CTs
- **Mode**: **Snapshot** (recommended — no downtime)
- **Compression**: Zstandard (inherited from PBS)
- **Rate limit**: optional (e.g., 100 MB/s to avoid saturating the network)

### 2. Retention policy

Define how many backups to keep:

- **Keep-Last**: 7 (last 7 backups)
- **Keep-Hourly**: 24
- **Keep-Daily**: 7
- **Keep-Weekly**: 4
- **Keep-Monthly**: 3

PBS applies the most restrictive policy — for example, if you schedule a daily backup with Keep-Last=7, only the 7 most recent ones are kept.

---

## Verification and Restore

### Automatic integrity verification

The big advantage of PBS is the verification against bit rot. To enable it:

In PBS, go to **Administration → Verification Jobs → Add**:

- Schedule: `0 1 * * *` (every day at 01:00)
- Datastore: `backups`
- Action: **verify**

This reads each backup from disk and checks the checksum — if it finds corruption, it alerts immediately.

### Manual verification via CLI

```bash
proxmox-backup-client verify --crypt-mode none backup/ct/<backup-id>
```

### Restoring a backup

In PVE, go to **Datacenter → pbs-backup → Content**, click on the desired backup and choose **Restore**. You can restore:

- To the same VM/CT (replaces the disk)
- To a new VM/CT (clones the backup)

Via CLI:

```bash
pvesm extractconfig pbs-backup:backup/<backup-id> --vmtype qemu
```

---

## Tips and Best Practices

- **Dedicated datastore**: use a separate disk or partition for the datastore — never the same disk as the PBS system
- **Isolated network**: if possible, keep backup traffic on a VLAN or separate network
- **Namespace**: use different namespaces in PBS to organize backups from different environments (dev, prod, homelab)
- **Notifications**: configure PBS to send email on verification or backup failure (Administration → Notification)
- **PBS cluster**: it is possible to set up a PBS cluster with multiple nodes, but for a homelab a single node is sufficient
- **Updates**: keep both PVE and PBS up to date — incompatible versions of `proxmox-backup-client` can cause connection errors

---

## Quick FAQ

| Question | Answer |
|----------|----------|
| Do I need a Proxmox subscription? | No. PBS works without a subscription, only using the free repository. |
| How many GB of datastore? | General rule: 2-3x the total size of VMs for daily backups with 7-day retention. |
| Does PBS work with LXC containers? | Yes. The community-scripts script installs it in a privileged Ubuntu LXC. |
| Can I back up non-Proxmox machines? | Not directly. PBS is built for the Proxmox ecosystem. For other systems, use `proxmox-backup-client` on the client. |
| Does the snapshot backup affect the VM? | No. Snapshot mode uses the QEMU/KVM snapshot feature — the VM keeps running. |

Read also:

- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Script for Updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}})

---

Feel free to reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
