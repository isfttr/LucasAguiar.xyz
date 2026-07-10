---
date: 2026-07-10T15:05:54-03:00
draft: true
title: "KVM and Virsh on Linux: Complete Guide to Virtual Machines [2026]"
description: "Complete guide to KVM virtualization on Linux: install, configure, and manage VMs with virsh and virt-install. Covers networking, storage pools, cloud-init, and comparison with Vagrant, VirtualBox, and Proxmox."
featured_image: ""
categories:
  - article
tags:
  - kvm
  - virtualization
  - linux
  - homelab
  - devops
---

São Paulo was hot and humid that January night. I was two hours deep into yet another Vagrant `up` that kept failing on NFS mount syncing, watching the same amber terminal cursor blink back at me. The VM had booted. SSH worked. But `config.vm.synced_folder` was just not cooperating — and I couldn't even SSH into the box to fix it because Vagrant's libvirt provider was wrestling with the networking layer. I killed the process, deleted the `.vagrant` directory, and decided I was done.

I didn't need Vagrant. I needed KVM.

## What is KVM?

KVM (Kernel-based Virtual Machine) is a type-1 hypervisor built directly into the Linux kernel since version 2.6.20 (2007). It turns the Linux kernel into a bare-metal hypervisor — no host OS overhead, no extra abstraction layer — just your hardware, the kernel, and virtual machines running at near-native performance.

On top of KVM sits **libvirt**, a management daemon that provides a stable API and CLI tooling. **Virsh** is the command-line interface to libvirt, and it's all you need to create, manage, and destroy VMs from the terminal.

The stack looks like this:

```
┌──────────────────────┐
│   virsh / virt-install │  ← CLI tools
├──────────────────────┤
│       libvirtd         │  ← management daemon
├──────────────────────┤
│   QEMU / KVM (kernel)  │  ← hypervisor (Linux kernel)
├──────────────────────┤
│      Hardware          │  ← CPU with Intel VT-x / AMD-V
└──────────────────────┘
```

Why does this matter in 2026? Because every major cloud and virtualization platform — AWS Nitro, Google Compute Engine, OpenStack, Proxmox, oVirt — runs on KVM underneath. Learning KVM directly is learning the foundation that everything else is built on.

## Installation

On Debian 12 / Ubuntu 24.04 LTS:

```bash
# Install KVM, libvirt, and tools
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst virt-manager

# Add your user to the libvirt group
sudo usermod -aG libvirt $(whoami)

# Log out and back in, or run:
newgrp libvirt

# Verify installation
virsh list --all
```

On Fedora / RHEL 9:

```bash
sudo dnf install -y @virtualization
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt $(whoami)
```

Verify KVM is working:

```bash
# Should show "KVM acceleration can be used"
virt-host-validate qemu

# Or check the kernel module
lsmod | grep kvm
```

## Basic VM Lifecycle with Virsh

Once libvirtd is running, you can manage VMs entirely from the terminal.

### Listing VMs

```bash
# All VMs (running + stopped)
virsh list --all

# Only running
virsh list
```

### Starting and Stopping

```bash
# Start a VM
virsh start my-vm

# Graceful shutdown (ACPI)
virsh shutdown my-vm

# Force power-off
virsh destroy my-vm

# Reboot
virsh reboot my-vm
```

### Creating and Deleting VMs

```bash
# Define a VM from an XML config
virsh define /path/to/vm.xml

# Undefine (delete) a VM
virsh undefine my-vm

# Undefine + remove storage volumes
virsh undefine my-vm --remove-all-storage
```

### Connecting to a VM's Console

```bash
# Serial console (like a physical monitor)
virsh console my-vm

# If the VM doesn't have a serial console configured,
# use SSH after the VM boots:
virsh domifaddr my-vm   # get the IP address
```

## Networking: NAT vs Bridged

### Default NAT Network

Libvirt creates a default NAT network (`192.168.122.0/24`) during installation. VMs connected to it get internet access through the host's connection but are isolated from the rest of your LAN.

```bash
# List networks
virsh net-list --all

# View default NAT network info
virsh net-info default
virsh net-dhcp-leases default
```

### Bridged Networking

For VMs that need to appear as regular devices on your physical network (homelab servers, services that need real IPs), create a bridge:

```bash
# Create a permanent bridge with netplan (Ubuntu/Debian)
sudo tee /etc/netplan/01-bridge.yaml > /dev/null <<EOF
network:
  version: 2
  ethernets:
    eno1:
      dhcp4: no
  bridges:
    br0:
      interfaces: [eno1]
      dhcp4: yes
EOF

sudo netplan apply
```

Then create a bridged network in libvirt:

```bash
# Create bridge network XML
cat > /tmp/bridge-net.xml << 'NETXML'
<network>
  <name>bridged</name>
  <forward mode="bridge"/>
  <bridge name="br0"/>
</network>
NETXML

virsh net-define /tmp/bridge-net.xml
virsh net-start bridged
virsh net-autostart bridged
```

Now any VM attached to the `bridged` network gets an IP from your router's DHCP.

## Storage: Pools and Volumes

Libvirt organizes storage in **pools** (directories, LVM volume groups, iSCSI targets) and **volumes** (disk images).

### Directory-Based Storage (Default)

```bash
# Default pool location: /var/lib/libvirt/images/
virsh pool-list --all

# Create a custom pool
virsh pool-define-as --name vms --type dir --target /data/vms
virsh pool-build vms
virsh pool-start vms
virsh pool-autostart vms
```

### Creating Disk Images

```bash
# qcow2 (copy-on-write, thin-provisioned) — recommended
virsh vol-create-as vms my-vm.qcow2 50G --format qcow2

# Raw (pre-allocated, faster I/O)
virsh vol-create-as vms my-vm.raw 50G --format raw

# List volumes in a pool
virsh vol-list vms
```

### Attaching Disks to Running VMs

```bash
virsh attach-disk my-vm /data/vms/extra-disk.qcow2 vdc --live --cache writeback
```

## Creating VMs: virt-install

The most practical way to create VMs from the CLI is `virt-install`:

### Minimal Ubuntu Server Example

```bash
virt-install \
  --name ubuntu-server \
  --ram 2048 \
  --vcpus 2 \
  --disk path=/data/vms/ubuntu-server.qcow2,size=20,format=qcow2 \
  --os-variant ubuntu24.04 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --location https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso \
  --extra-args "console=ttyS0,115200n8 serial"
```

This creates a headless Ubuntu VM with serial console access and a 20 GB qcow2 disk attached to the default NAT network.

### Debian with Preseed (Fully Automated)

```bash
virt-install \
  --name debian-server \
  --ram 2048 \
  --vcpus 2 \
  --disk path=/data/vms/debian-server.qcow2,size=15,format=qcow2 \
  --os-variant debian12 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --location https://deb.debian.org/debian/dists/stable/main/installer-amd64/ \
  --initrd-inject /path/to/preseed.cfg \
  --extra-args "auto console=ttyS0,115200n8 serial"
```

### Cloud-Init with Ubuntu Cloud Images

```bash
# Download the cloud image
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
qemu-img resize noble-server-cloudimg-amd64.img 20G

# Create cloud-init ISO
cat > /tmp/meta-data << 'EOF'
instance-id: kvm-vm-01
local-hostname: kvm-vm-01
EOF

cat > /tmp/user-data << 'EOF'
#cloud-config
ssh_authorized_keys:
  - ssh-ed25519 AAAAC3... your-public-key-here
packages:
  - qemu-guest-agent
runcmd:
  - systemctl enable --now qemu-guest-agent
EOF

mkisofs -o /tmp/cloud-init.iso -V cidata -r /tmp/meta-data /tmp/user-data

# Create the VM
virt-install \
  --name cloud-vm \
  --ram 2048 \
  --vcpus 2 \
  --disk path=noble-server-cloudimg-amd64.img,format=qcow2 \
  --disk path=/tmp/cloud-init.iso,device=cdrom \
  --os-variant ubuntu24.04 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --import
```

## Advanced: Snapshots, Migration, and Templates

### Snapshots

```bash
# Create a snapshot (VM must be running)
virsh snapshot-create-as my-vm pre-upgrade

# List snapshots
virsh snapshot-list my-vm

# Revert to a snapshot
virsh snapshot-revert my-vm pre-upgrade

# Delete a snapshot
virsh snapshot-delete my-vm pre-upgrade
```

### Live Migration (Same Host Storage)

```bash
virsh migrate --live my-vm qemu+ssh://target-host/system --verbose
```

### Template from an Existing VM

```bash
# Create a generic template VM, then:
virt-sysprep -d template-vm --operations machine-id,logfiles,tmp-files,ssh-hostkeys,net-hostname

# Clone it
virt-clone --original template-vm --name new-vm --file /data/vms/new-vm.qcow2
```

## KVM vs Vagrant vs VirtualBox vs Proxmox

| Feature | KVM + Virsh | Vagrant | VirtualBox | Proxmox |
|---------|-------------|---------|------------|---------|
| **Hypervisor type** | Type-1 (bare metal) | Provisioner (wraps libvirt/VB) | Type-2 | Type-1 (KVM-based) |
| **Performance** | Near-native | Same as KVM underneath | ~15-20% overhead | Near-native |
| **Headless by default** | Yes | Yes | No | Yes (web UI) |
| **Learning curve** | Medium | Low | Low | Low-Medium |
| **Automation** | virsh scripts, Ansible | Vagrantfile, Ansible | VBoxManage | API, Terraform |
| **GUI** | virt-manager (optional) | None | Full GUI | Full web UI |
| **Use case** | Homelab, server, CI/CD | Dev environments | Desktop dev | Production VMs + containers |
| **Disk images** | qcow2, raw, qed | Boxes (vagrant format) | VDI, VMDK, VHD | qcow2, raw, zvol |

When to use KVM + virsh directly:

- **You run a headless server or homelab** — no GUI, just SSH + terminal.
- **You want to understand virtualization from the ground up** — libvirt is the API behind OpenStack, Proxmox, and oVirt.
- **You need to automate VM creation in CI/CD** — `virt-install` is scriptable and idempotent.
- **You're tired of Vagrant abstractions breaking** — the transparency of direct KVM pays off.

When to use Proxmox instead:

- **You need a web UI for multiple hosts** — Proxmox's web GUI is excellent.
- **You want containers (LXC) alongside VMs** — Proxmox integrates both.
- **You need clustering and live migration** — Proxmox has built-in HA.

The blog already has guides on [Proxmox Backup Server setup]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}), [running Proxmox on a Mac Mini]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}}), and [troubleshooting Proxmox login issues]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}). The difference is that those assume you're using Proxmox's abstraction layer — this guide teaches you what's underneath.

## What I Learned Ditching Vagrant

Going back to the story that opened this post: after that late-night Vagrant failure, I deleted the `.vagrant` directory, installed `virt-install` and `virsh`, and never looked back.

What changed:

1. **Transparency.** When a VM doesn't boot, virsh console shows you exactly why — no Vagrant middleware obscuring the QEMU error.
2. **Speed.** VMs boot ~2x faster through virsh than through Vagrant's provider layer.
3. **Control.** Networking is just a bridge config. Storage is just a pool path. No DSL to learn — just standard Linux tools.
4. **Portability.** A VMs XML definition is portable across any libvirt host. No Vagrantfile needed.

The tradeoff: you lose Vagrant's box ecosystem and `vagrant up` simplicity. For quick dev environments, Vagrant still has its place. But for homelab VMs, CI runners, and persistent servers, KVM + virsh is the right tool.

## Conclusion

KVM is the Linux kernel's native virtualization engine. Learning to use it directly through virsh and virt-install opens up the entire ecosystem of Linux virtualization — from single-node homelabs to multi-host clusters powered by OpenStack or oVirt.

Start with a single VM. Learn virsh list, virsh start, virsh console. Then move on to networking, storage pools, and cloud-init. By the time you need to scale, you'll understand exactly what's happening under the hood — no abstraction layer standing between you and your VMs.

Also read:

- [Proxmox Backup Server: Setup Guide with Community Scripts]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Proxmox on Mac Mini 2018: Troubleshooting the T2 Chip]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Linux vs Windows vs macOS — Which to Use in 2026?]({{< relref "posts/linux-windows-macos-qual-usar-2026/" >}})

---

You can reach out to discuss this and other topics by email at <contact@lucasaguiar.xyz>
