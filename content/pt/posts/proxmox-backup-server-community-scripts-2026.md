---
date: 2026-07-03T10:30:00-03:00
draft: false
title: "Proxmox Backup Server: instalação via community-scripts e configuração de backups [2026]"
description: "Guia completo para instalar o Proxmox Backup Server (PBS) usando community-scripts em um LXC container, configurar datastore, integrar com o Proxmox VE e automatizar backups com schedule e verificação de integridade."
featured_image: ""
categories:
  - article
tags:
  - proxmox
  - linux
  - backup
  - homelab
  - self-hosting
  - tutorial
---

Se você roda Proxmox VE em casa ou num homelab, uma das primeiras coisas que precisa resolver é backup. O **Proxmox Backup Server (PBS)** é a solução oficial integrada — backup incremental, deduplicação, compressão Zstandard e verificação de integridade, tudo nativo.

A forma mais rápida de colocar o PBS de pé é usando os **community-scripts** (antigo Proxmox VE Helper-Scripts), que instalam o PBS em um container LXC em poucos minutos. Este guia cobre tudo: instalação, configuração do datastore, integração com o PVE e automação de backup.

---

## O que é o Proxmox Backup Server

O PBS é um servidor de backup especializado para ambientes Proxmox. Diferente de soluções genéricas (rsync, Bacula, Veeam), ele entende o formato de disco QEMU e os snapshots do Proxmox VE, o que permite:

- **Backups incrementais** — apenas blocos alterados são transferidos
- **Deduplicação** — dados idênticos (mesmo entre VMs diferentes) ocupam espaço uma única vez
- **Compressão Zstandard** — rápida e eficiente
- **Verificação de integridade** — detecta bit rot e corrupção silenciosa
- **Restore granular** — arquivo individual, VM inteira ou container

---

## Instalação via Community-Scripts

Os community-scripts ([site oficial](https://community-scripts.org/scripts/proxmox-backup-server)) são scripts mantidos pela comunidade que automatizam a criação de containers e VMs para serviços comuns no Proxmox.

No shell do nó Proxmox (via SSH ou console), execute:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/proxmox-backup-server.sh)"

```

O script fará as seguintes perguntas:

| Configuração | Sugestão |
|-------------|----------|
| ID do container | 102 (ou próximo disponível) |
| Hostname | `pbs` |
| Tamanho do disco root | 8 GB |
| Tamanho do datastore | 100 GB+ (ajuste conforme necessidade) |
| RAM | 4096 MB |
| CPU cores | 2 |
| Bridge | vmbr0 |
| IP estático | Escolha um IP fixo na sua rede |
| Gateway | IP do seu roteador |
| DNS | 8.8.8.8 (ou seu DNS preferido) |

Ao final, o script exibe a senha gerada para o usuário `root` do PBS — **anote-a**.

---

## Configuração inicial do PBS

### 1. Acessar a interface web

Abra o navegador em: **https://<IP_DO_PBS>:8007**

- Usuário: `root`
- Senha: a fornecida pelo script

> Se o navegador reclamar do certificado auto-assinado, é normal — é um certificado gerado na instalação. Você pode substituir depois por um Let's Encrypt.

### 2. Criar o datastore

No painel do PBS, vá em **Datastore → Add Datastore**:

- Name: `backups` (ou o nome que preferir)
- Path: `/mnt/datastore/backups` (o script já cria o ponto de montagem)
- Compression: **Zstandard (zstd)** — melhor relação velocidade/compressão
- Keep backups: defina política de retenção (ex: manter backups dos últimos 14 dias)

### 3. Verificar o disco do datastore

O script do community-scripts já cria e formata um disco extra para o datastore. Para verificar:

```bash
df -h /mnt/datastore/backups
lsblk
```

Se precisar adicionar um disco manualmente depois:

```bash
mkfs.ext4 /dev/vdb
mount /dev/vdb /mnt/datastore/backups
echo '/dev/vdb /mnt/datastore/backups ext4 defaults 0 0' >> /etc/fstab
```

---

## Integração PVE → PBS

### 1. Obter o fingerprint do PBS

No shell do container PBS:

```bash
proxmox-backup-manager cert info | grep Fingerprint
```

Copie o fingerprint (uma string longa como `SHA256:...`).

### 2. Adicionar o PBS como storage no PVE

No Proxmox VE, vá em **Datacenter → Storage → Add → Proxmox Backup Server** e preencha:

- ID: `pbs-backup`
- Server: IP do PBS
- Datastore: `backups` (exatamente o nome que você criou)
- Username: `root@pam`
- Password: senha do root do PBS
- Fingerprint: cole o fingerprint copiado acima (opcional: marque "Não verificar" na primeira vez)

### 3. Testar a conexão

Após adicionar, clique no storage `pbs-backup` e depois em **Content**. A lista deve aparecer vazia (sem erros) — significa que a conexão está funcionando.

---

## Automatizando backups

### 1. Criar um job de backup

No PVE, vá em **Datacenter → Backup → Add**:

- **ID**: `backup-semanal`
- **Node**: selecione o(s) nó(s)
- **Storage**: `pbs-backup`
- **Schedule**: `0 2 * * 0` (domingos às 02:00) ou o horário que preferir
- **Selection Mode**: `Include selected VMs` e marque as VMs/CTs
- **Mode**: **Snapshot** (recomendado — sem downtime)
- **Compression**: Zstandard (herdado do PBS)
- **Rate limit**: opcional (ex: 100 MB/s para não saturar a rede)

### 2. Política de retenção

Defina quantos backups manter:

- **Keep-Last**: 7 (últimos 7 backups)
- **Keep-Hourly**: 24
- **Keep-Daily**: 7
- **Keep-Weekly**: 4
- **Keep-Monthly**: 3

O PBS aplica a política mais restritiva — por exemplo, se você programa backup diário com Keep-Last=7, apenas os 7 mais recentes são mantidos.

---

## Verificação e restore

### Verificação automática de integridade

A grande vantagem do PBS é a verificação contra bit rot. Para ativar:

No PBS, vá em **Administration → Verification Jobs → Add**:

- Schedule: `0 1 * * *` (todos os dias às 01:00)
- Datastore: `backups`
- Action: **verify**

Isso lê cada backup do disco e verifica o checksum — se encontrar corrupção, alerta imediatamente.

### Verificação manual via CLI

```bash
proxmox-backup-client verify --crypt-mode none backup/ct/<backup-id>
```

### Restaurando um backup

No PVE, vá em **Datacenter → pbs-backup → Content**, clique no backup desejado e escolha **Restore**. Você pode restaurar:

- Na mesma VM/CT (substitui o disco)
- Em uma nova VM/CT (clona o backup)

Via CLI:

```bash
pvesm extractconfig pbs-backup:backup/<backup-id> --vmtype qemu
```

---

## Dicas e boas práticas

- **Datastore dedicado**: use um disco ou partição separada para o datastore — nunca o mesmo disco do sistema PBS
- **Rede isolada**: se possível, mantenha o tráfego de backup em uma VLAN ou rede separada
- **Namespace**: use namespaces diferentes no PBS para organizar backups de diferentes ambientes (dev, prod, homelab)
- **Notificações**: configure o PBS para enviar e-mail em caso de falha de verificação ou backup (Administration → Notification)
- **PBS em cluster**: é possível montar um cluster PBS com múltiplos nós, mas para homelab um único nó já resolve
- **Atualizações**: mantenha tanto o PVE quanto o PBS atualizados — versões incompatíveis do `proxmox-backup-client` podem causar erros de conexão

---

## FAQ rápido

| Pergunta | Resposta |
|----------|----------|
| Preciso de assinatura Proxmox? | Não. O PBS funciona sem assinatura, apenas com repositório gratuito. |
| Quantos GB de datastore? | Regra geral: 2-3x o tamanho total das VMs para backups diários com 7 dias de retenção. |
| O PBS funciona com containers LXC? | Sim. O script do community-scripts instala em LXC privilegiado Ubuntu. |
| Posso fazer backup de máquinas que não são Proxmox? | Não diretamente. O PBS foi feito para o ecossistema Proxmox. Para outros sistemas, use `proxmox-backup-client` no cliente. |
| O backup snapshot afeta a VM? | Não. Modo snapshot usa o recurso de snapshot do QEMU/KVM — a VM continua rodando. |

Leia também:

- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
