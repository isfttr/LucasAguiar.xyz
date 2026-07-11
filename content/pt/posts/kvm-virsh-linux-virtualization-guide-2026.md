---
date: 2026-07-10T18:05:54.000Z
draft: false
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
translation_source_hash: e0aed6becfc9355d12c67df35d135d357ee6a1d47d1663b6ce6bf832225ca98d
---
KVM (Máquina Virtual Baseada em Kernel) é um hipervisor tipo 1 construído diretamente no kernel Linux desde a versão 2.6.20 (2007). Ele transforma o kernel Linux em um hipervisor bare-metal — sem sobrecarga do sistema operacional hospedeiro, sem camada extra de abstração — apenas seu hardware, o kernel e máquinas virtuais rodando com desempenho quase nativo.

Sobre o KVM está o **libvirt**, um daemon de gerenciamento que fornece uma API estável e ferramentas de linha de comando. **Virsh** é a interface de linha de comando para o libvirt, e é tudo que você precisa para criar, gerenciar e destruir VMs a partir do terminal.

A pilha fica assim:

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

Por que isso é importante em 2026? Porque toda grande plataforma de nuvem e virtualização — AWS Nitro, Google Compute Engine, OpenStack, Proxmox, oVirt — roda sobre KVM por baixo. Aprender KVM diretamente é aprender a base sobre a qual tudo mais é construído.

## Instalação

No Debian 12 / Ubuntu 24.04 LTS:

```bash
# Instalar KVM, libvirt e ferramentas
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst virt-manager

# Adicionar seu usuário ao grupo libvirt
sudo usermod -aG libvirt $(whoami)

# Sair e entrar novamente, ou executar:
newgrp libvirt

# Verificar instalação
virsh list --all
```

No Fedora / RHEL 9:

```bash
sudo dnf install -y @virtualization
sudo systemctl enable --now libvirtd
sudo usermod -aG libvirt $(whoami)
```

Verificar se o KVM está funcionando:

```bash
# Deve mostrar "KVM acceleration can be used"
virt-host-validate qemu

# Ou verificar o módulo do kernel
lsmod | grep kvm
```

## Ciclo de Vida Básico de VMs com Virsh

Uma vez que o libvirtd está em execução, você pode gerenciar VMs inteiramente pelo terminal.

### Listando VMs

```bash
# Todas as VMs (em execução + paradas)
virsh list --all

# Apenas em execução
virsh list
```

### Iniciando e Parando

```bash
# Iniciar uma VM
virsh start my-vm

# Desligamento suave (ACPI)
virsh shutdown my-vm

# Forçar desligamento
virsh destroy my-vm

# Reiniciar
virsh reboot my-vm
```

### Criando e Excluindo VMs

```bash
# Definir uma VM a partir de um arquivo XML
virsh define /caminho/para/vm.xml

# Indefinir (excluir) uma VM
virsh undefine my-vm

# Indefinir + remover volumes de armazenamento
virsh undefine my-vm --remove-all-storage
```

### Conectando ao Console de uma VM

```bash
# Console serial (como um monitor físico)
virsh console my-vm

# Se a VM não tiver um console serial configurado,
# use SSH após a VM inicializar:
virsh domifaddr my-vm   # obter o endereço IP
```

## Rede: NAT vs Bridge

### Rede NAT Padrão

O Libvirt cria uma rede NAT padrão (`192.168.122.0/24`) durante a instalação. VMs conectadas a ela têm acesso à internet através da conexão do hospedeiro, mas ficam isoladas do resto da sua LAN.

```bash
# Listar redes
virsh net-list --all

# Ver informações da rede NAT padrão
virsh net-info default
virsh net-dhcp-leases default
```

### Rede em Bridge

Para VMs que precisam aparecer como dispositivos regulares na sua rede física (servidores de homelab, serviços que precisam de IPs reais), crie uma bridge:

```bash
# Criar uma bridge permanente com netplan (Ubuntu/Debian)
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

Em seguida, crie uma rede em bridge no libvirt:

```bash
# Criar XML da rede bridge
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

O Libvirt organiza o armazenamento em **pools** (diretórios, grupos de volume LVM, targets iSCSI) e **volumes** (imagens de disco).

### Armazenamento Baseado em Diretório (Padrão)

```bash
# Localização padrão do pool: /var/lib/libvirt/images/
virsh pool-list --all

# Criar um pool personalizado
virsh pool-define-as --name vms --type dir --target /data/vms
virsh pool-build vms
virsh pool-start vms
virsh pool-autostart vms
```

### Criando Imagens de Disco

```bash
# qcow2 (copy-on-write, provisionamento fino) — recomendado
virsh vol-create-as vms my-vm.qcow2 50G --format qcow2

# Raw (pré-alocado, E/S mais rápida)
virsh vol-create-as vms my-vm.raw 50G --format raw

# Listar volumes em um pool
virsh vol-list vms
```

### Anexando Discos a VMs em Execução

```bash
virsh attach-disk my-vm /data/vms/extra-disk.qcow2 vdc --live --cache writeback
```

## Criando VMs: virt-install

A maneira mais prática de criar VMs a partir da CLI é o `virt-install`:

### Exemplo Mínimo de Ubuntu Server

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
  --initrd-inject /caminho/para/preseed.cfg \
  --extra-args "auto console=ttyS0,115200n8 serial"
```

### Cloud-Init com Imagens Ubuntu Cloud

```bash
# Baixar a imagem cloud
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
qemu-img resize noble-server-cloudimg-amd64.img 20G

# Criar ISO cloud-init
cat > /tmp/meta-data << 'EOF'
instance-id: kvm-vm-01
local-hostname: kvm-vm-01
EOF

cat > /tmp/user-data << 'EOF'
#cloud-config
ssh_authorized_keys:
  - ssh-ed25519 AAAAC3... sua-chave-publica-aqui
packages:
  - qemu-guest-agent
runcmd:
  - systemctl enable --now qemu-guest-agent
EOF

mkisofs -o /tmp/cloud-init.iso -V cidata -r /tmp/meta-data /tmp/user-data

# Criar a VM
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
# Criar um snapshot (a VM deve estar em execução)
virsh snapshot-create-as my-vm pre-upgrade

# Listar snapshots
virsh snapshot-list my-vm

# Reverter para um snapshot
virsh snapshot-revert my-vm pre-upgrade

# Excluir um snapshot
virsh snapshot-delete my-vm pre-upgrade
```

### Migração ao Vivo (Mesmo Armazenamento do Hospedeiro)

```bash
virsh migrate --live my-vm qemu+ssh://host-destino/system --verbose
```

### Template a Partir de uma VM Existente

```bash
# Criar uma VM template genérica e depois:
virt-sysprep -d template-vm --operations machine-id,logfiles,tmp-files,ssh-hostkeys,net-hostname

# Cloná-la
virt-clone --original template-vm --name new-vm --file /data/vms/new-vm.qcow2
```

## KVM vs Vagrant vs VirtualBox vs Proxmox

| Característica | KVM + Virsh | Vagrant | VirtualBox | Proxmox |
|---------|-------------|---------|------------|---------|
| **Tipo de hipervisor** | Tipo 1 (bare metal) | Provisionador (envolve libvirt/VB) | Tipo 2 | Tipo 1 (baseado em KVM) |
| **Desempenho** | Quase nativo | Igual ao KVM por baixo | ~15-20% de sobrecarga | Quase nativo |
| **Headless por padrão** | Sim | Sim | Não | Sim (interface web) |
| **Curva de aprendizado** | Média | Baixa | Baixa | Baixa-Média |
| **Automação** | Scripts virsh, Ansible | Vagrantfile, Ansible | VBoxManage | API, Terraform |
| **Interface gráfica** | virt-manager (opcional) | Nenhuma | GUI completa | GUI web completa |
| **Caso de uso** | Homelab, servidor, CI/CD | Ambientes de desenvolvimento | Desenvolvimento desktop | VMs de produção + contêineres |
| **Imagens de disco** | qcow2, raw, qed | Boxes (formato vagrant) | VDI, VMDK, VHD | qcow2, raw, zvol |

Quando usar KVM + virsh diretamente:

- **Você opera um servidor headless ou homelab** — sem GUI, apenas SSH + terminal.
- **Você quer entender virtualização desde a base** — libvirt é a API por trás do OpenStack, Proxmox e oVirt.
- **Você precisa automatizar a criação de VMs em CI/CD** — `virt-install` é scriptável e idempotente.
- **Você está cansado de abstrações do Vagrant quebrando** — a transparência do KVM direto compensa.

Quando usar Proxmox em vez disso:

- **Você precisa de uma interface web para múltiplos hosts** — a GUI web do Proxmox é excelente.
- **Você quer contêineres (LXC) junto com VMs** — o Proxmox integra ambos.
- **Você precisa de clustering e migração ao vivo** — o Proxmox tem HA embutido.

O blog já possui guias sobre [configuração do Proxmox Backup Server]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}), [executando Proxmox em um Mac Mini]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}}) e [solução de problemas de login no Proxmox]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}). A diferença é que aqueles assumem que você está usando a camada de abstração do Proxmox — este guia ensina o que está por baixo.

## Conclusão

KVM é o mecanismo de virtualização nativo do kernel Linux. Aprender a usá-lo diretamente através do virsh e virt-install abre todo o ecossistema de virtualização Linux — desde homelabs de nó único até clusters multi-host alimentados por OpenStack ou oVirt.

Comece com uma única VM. Aprenda virsh list, virsh start, virsh console. Depois avance para redes, pools de armazenamento e cloud-init. Quando você precisar escalar, entenderá exatamente o que está acontecendo nos bastidores — nenhuma camada de abstração entre você e suas VMs.

Leia também:

- [Proxmox Backup Server: instalação via community-scripts e configuração de backups [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---

Você pode entrar em contato para discutir este e outros tópicos por e-mail em <contact@lucasaguiar.xyz>
