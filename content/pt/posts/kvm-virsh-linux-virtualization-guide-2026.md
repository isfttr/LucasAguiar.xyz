---
date: 2026-07-10T18:05:54.000Z
draft: true
title: 'KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]'
description: 'Guia completo para virtualização KVM no Linux: instalar, configurar e gerenciar VMs com virsh e virt-install. Aborda redes, pools de armazenamento, cloud-init e comparação com Vagrant, VirtualBox e Proxmox.'
featured_image: ''
categories:
  - article
tags:
  - kvm
  - virtualization
  - linux
  - homelab
  - devops
slug: kvm-virsh-linux-guia-maquinas-virtuais-2026
translation_source_hash: 122706c4424f437a02ae88ff201ccd48b66d799da8b55545a4567f0e0a75d506
---
São Paulo estava quente e úmido naquela noite de janeiro. Eu estava a duas horas de profundidade em mais um `up` do Vagrant que continuava falhando na sincronização de montagem NFS, observando o mesmo cursor âmbar do terminal piscando de volta para mim. A VM tinha inicializado. O SSH funcionava. Mas `config.vm.synced_folder` simplesmente não cooperava — e eu nem conseguia fazer SSH para dentro da máquina para corrigir isso porque o provedor libvirt do Vagrant estava brigando com a camada de rede. Eu matei o processo, deletei o diretório `.vagrant` e decidi que estava farto.

Eu não precisava do Vagrant. Eu precisava do KVM.

## O que é KVM?

KVM (Kernel-based Virtual Machine) é um hipervisor tipo 1 integrado diretamente ao kernel Linux desde a versão 2.6.20 (2007). Ele transforma o kernel Linux em um hipervisor bare-metal — sem overhead de SO hospedeiro, sem camada de abstração extra — apenas seu hardware, o kernel e máquinas virtuais rodando com desempenho quase nativo.

Sobre o KVM está o **libvirt**, um daemon de gerenciamento que fornece uma API estável e ferramentas de linha de comando. **Virsh** é a interface de linha de comando para o libvirt, e é tudo que você precisa para criar, gerenciar e destruir VMs a partir do terminal.

A pilha se parece com isso:

```
┌──────────────────────┐
│   virsh / virt-install │  ← Ferramentas CLI
├──────────────────────┤
│       libvirtd         │  ← Daemon de gerenciamento
├──────────────────────┤
│   QEMU / KVM (kernel)  │  ← Hipervisor (kernel Linux)
├──────────────────────┤
│      Hardware          │  ← CPU com Intel VT-x / AMD-V
└──────────────────────┘
```

Por que isso importa em 2026? Porque toda grande plataforma de nuvem e virtualização — AWS Nitro, Google Compute Engine, OpenStack, Proxmox, oVirt — roda sobre KVM por baixo. Aprender KVM diretamente é aprender a base sobre a qual todo o resto é construído.

## Instalação

No Debian 12 / Ubuntu 24.04 LTS:

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

No Fedora / RHEL 9:

```bash
sudo dnf install -y @virtualization
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt $(whoami)
```

Verifique se o KVM está funcionando:

```bash
# Should show "KVM acceleration can be used"
virt-host-validate qemu

# Or check the kernel module
lsmod | grep kvm
```

## Ciclo de Vida Básico de VM com Virsh

Uma vez que o libvirtd está em execução, você pode gerenciar VMs inteiramente a partir do terminal.

### Listando VMs

```bash
# All VMs (running + stopped)
virsh list --all

# Only running
virsh list
```

### Iniciando e Parando

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

### Criando e Deletando VMs

```bash
# Define a VM from an XML config
virsh define /path/to/vm.xml

# Undefine (delete) a VM
virsh undefine my-vm

# Undefine + remove storage volumes
virsh undefine my-vm --remove-all-storage
```

### Conectando ao Console de uma VM

```bash
# Serial console (like a physical monitor)
virsh console my-vm

# If the VM doesn't have a serial console configured,
# use SSH after the VM boots:
virsh domifaddr my-vm   # get the IP address
```

## Rede: NAT vs Bridged

### Rede NAT Padrão

O Libvirt cria uma rede NAT padrão (`192.168.122.0/24`) durante a instalação. As VMs conectadas a ela têm acesso à internet através da conexão do hospedeiro, mas ficam isoladas do resto da sua LAN.

```bash
# List networks
virsh net-list --all

# View default NAT network info
virsh net-info default
virsh net-dhcp-leases default
```

### Rede em Ponte (Bridged)

Para VMs que precisam aparecer como dispositivos normais em sua rede física (servidores de homelab, serviços que precisam de IPs reais), crie uma ponte:

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

Em seguida, crie uma rede em ponte no libvirt:

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

Agora, qualquer VM conectada à rede `bridged` receberá um IP do DHCP do seu roteador.

## Armazenamento: Pools e Volumes

O Libvirt organiza o armazenamento em **pools** (diretórios, grupos de volume LVM, alvos iSCSI) e **volumes** (imagens de disco).

### Armazenamento Baseado em Diretório (Padrão)

```bash
# Default pool location: /var/lib/libvirt/images/
virsh pool-list --all

# Create a custom pool
virsh pool-define-as --name vms --type dir --target /data/vms
virsh pool-build vms
virsh pool-start vms
virsh pool-autostart vms
```

### Criando Imagens de Disco

```bash
# qcow2 (copy-on-write, thin-provisioned) — recommended
virsh vol-create-as vms my-vm.qcow2 50G --format qcow2

# Raw (pre-allocated, faster I/O)
virsh vol-create-as vms my-vm.raw 50G --format raw

# List volumes in a pool
virsh vol-list vms
```

### Anexando Discos a VMs em Execução

```bash
virsh attach-disk my-vm /data/vms/extra-disk.qcow2 vdc --live --cache writeback
```

## Criando VMs: virt-install

A maneira mais prática de criar VMs a partir da CLI é o `virt-install`:

### Exemplo de Ubuntu Server Mínimo

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

Isso cria uma VM Ubuntu headless com acesso ao console serial e um disco qcow2 de 20 GB conectado à rede NAT padrão.

### Debian com Preseed (Totalmente Automatizado)

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

### Cloud-Init com Imagens Ubuntu Cloud

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

## Avançado: Snapshots, Migração e Templates

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

### Migração ao Vivo (Mesmo Armazenamento do Hospedeiro)

```bash
virsh migrate --live my-vm qemu+ssh://target-host/system --verbose
```

### Template a partir de uma VM Existente

```bash
# Create a generic template VM, then:
virt-sysprep -d template-vm --operations machine-id,logfiles,tmp-files,ssh-hostkeys,net-hostname

# Clone it
virt-clone --original template-vm --name new-vm --file /data/vms/new-vm.qcow2
```

## KVM vs Vagrant vs VirtualBox vs Proxmox

| Característica | KVM + Virsh | Vagrant | VirtualBox | Proxmox |
|---------|-------------|---------|------------|---------|
| **Tipo de hipervisor** | Tipo 1 (bare metal) | Provisionador (encapsula libvirt/VB) | Tipo 2 | Tipo 1 (baseado em KVM) |
| **Desempenho** | Quase nativo | Igual ao KVM por baixo | ~15-20% de overhead | Quase nativo |
| **Headless por padrão** | Sim | Sim | Não | Sim (interface web) |
| **Curva de aprendizado** | Média | Baixa | Baixa | Baixa-Média |
| **Automação** | Scripts virsh, Ansible | Vagrantfile, Ansible | VBoxManage | API, Terraform |
| **Interface gráfica** | virt-manager (opcional) | Nenhuma | GUI completa | Interface web completa |
| **Caso de uso** | Homelab, servidor, CI/CD | Ambientes de desenvolvimento | Desenvolvimento desktop | VMs + contêineres de produção |
| **Imagens de disco** | qcow2, raw, qed | Boxes (formato vagrant) | VDI, VMDK, VHD | qcow2, raw, zvol |

Quando usar KVM + virsh diretamente:

- **Você usa um servidor headless ou homelab** — sem GUI, apenas SSH + terminal.
- **Você quer entender virtualização desde o início** — libvirt é a API por trás do OpenStack, Proxmox e oVirt.
- **Você precisa automatizar a criação de VMs em CI/CD** — `virt-install` é scriptável e idempotente.
- **Você está cansado das abstrações do Vagrant quebrando** — a transparência do KVM direto compensa.

Quando usar Proxmox em vez disso:

- **Você precisa de uma interface web para múltiplos hosts** — a interface web do Proxmox é excelente.
- **Você quer contêineres (LXC) junto com VMs** — o Proxmox integra ambos.
- **Você precisa de clustering e migração ao vivo** — o Proxmox possui HA integrado.

O blog já tem guias sobre [configuração do Proxmox Backup Server]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}), [executando Proxmox em um Mac Mini]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}}) e [solução de problemas de login no Proxmox]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}). A diferença é que esses guias assumem que você está usando a camada de abstração do Proxmox — este guia ensina o que está por baixo.

## O que Aprendi Abandonando o Vagrant

Voltando à história que abriu este post: após aquela falha do Vagrant tarde da noite, deletei o diretório `.vagrant`, instalei `virt-install` e `virsh`, e nunca mais olhei para trás.

O que mudou:

1. **Transparência.** Quando uma VM não inicializa, o virsh console mostra exatamente o porquê — sem middleware do Vagrant obscurecendo o erro do QEMU.
2. **Velocidade.** As VMs inicializam cerca de 2x mais rápido através do virsh do que através da camada de provedor do Vagrant.
3. **Controle.** Rede é apenas uma configuração de ponte. Armazenamento é apenas um caminho de pool. Nenhum DSL para aprender — apenas ferramentas Linux padrão.
4. **Portabilidade.** A definição XML de uma VM é portátil entre qualquer host libvirt. Nenhum Vagrantfile necessário.

A compensação: você perde o ecossistema de boxes do Vagrant e a simplicidade do `vagrant up`. Para ambientes de desenvolvimento rápidos, o Vagrant ainda tem seu lugar. Mas para VMs de homelab, runners de CI e servidores persistentes, KVM + virsh é a ferramenta certa.

## Conclusão

KVM é o mecanismo de virtualização nativo do kernel Linux. Aprender a usá-lo diretamente através do virsh e virt-install abre todo o ecossistema de virtualização Linux — desde homelabs de nó único até clusters multi-host alimentados por OpenStack ou oVirt.

Comece com uma única VM. Aprenda virsh list, virsh start, virsh console. Depois avance para rede, pools de armazenamento e cloud-init. Quando chegar a hora de escalar, você entenderá exatamente o que está acontecendo sob o capô — sem nenhuma camada de abstração entre você e suas VMs.

Leia também:

- [Proxmox Backup Server: instalação via community-scripts e configuração de backup [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como instalar Proxmox VE no Mac Mini 2018 (chip T2): o guia passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Corrigir erros de login na interface web do Proxmox; um guia passo a passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---

Você pode entrar em contato para discutir este e outros tópicos por e-mail em <contact@lucasaguiar.xyz>
