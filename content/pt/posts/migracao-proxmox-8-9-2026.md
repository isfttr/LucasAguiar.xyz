---
date: 2026-07-03T10:00:00-03:00
draft: true
title: "Como migrar do Proxmox VE 8 para o 9: guia passo a passo [2026]"
description: "Guia completo de migração do Proxmox VE 8 (base Debian 12) para o Proxmox VE 9 (Debian 13 Trixie): repositórios, upgrade do kernel 6.14, ZFS 2.3, pitfalls comuns e verificação pós-upgrade."
featured_image: ""
categories:
  - article
tags:
  - proxmox
  - linux
  - virtualizacao
  - homelab
  - self-hosting
  - tutorial
---

O Proxmox VE 9 já está disponível, trazendo como principal novidade a base Debian 13 "Trixie", o kernel Proxmox 6.14 (baseado no Ubuntu 24.04 LTS) e o ZFS 2.3 com suporte a draid e melhorias de compressão. Se você ainda está no PVE 8, a migração é direta, mas exige atenção a alguns detalhes — especialmente repositórios, cluster e compatibilidade de storages.

Este guia cobre o passo a passo completo para migrar seu nó Proxmox VE 8.x para o 9, incluindo os comandos exatos, verificações pós-upgrade e os pitfalls mais comuns.

---

## Antes de começar: requisitos

O PVE 9 mantém os mesmos requisitos de hardware do PVE 8:

- CPU x86-64 com VT-x/AMD-V e AES-NI (2+ cores, recomendado 4+)
- Mínimo 4 GB de RAM (recomendado 8 GB+)
- Mínimo 32 GB de disco para o sistema
- Clusters: todos os nós devem estar no PVE 8.x e saudáveis

### Checklist pré-migração

Antes de qualquer comando de upgrade, garanta que:

- [ ] Backup completo de configurações e VMs/CTs (vzdump, PBS ou snapshot)
- [ ] Cluster em quorum: `pvecm status` — todos os nós online
- [ ] PVE 8 no último patch: `apt update && apt dist-upgrade -y`
- [ ] Espaço em disco livre suficiente (pelo menos 5 GB)
- [ ] Teste de restore do backup em ambiente isolado (recomendado)

Se você tem um cluster, o upgrade deve ser feito **nó por nó**, removendo o HA das VMs antes de cada nó.

---

## Passo a passo da migração

### 1. Ajustar os repositórios

O PVE 9 usa a mesma nomenclatura de repositório `bookworm` (não se engane: os pacotes do PVE 9 continuam no repositório chamado `bookworm` por compatibilidade interna, mas apontam para pacotes compilados para Debian 13).

Para usuários com assinatura enterprise:

```bash
cat << EOF > /etc/apt/sources.list.d/pve-enterprise.list
deb https://enterprise.proxmox.com/debian/pve bookworm pve-enterprise
EOF
```

Para usuários sem assinatura (repositório gratuito):

```bash
cat << EOF > /etc/apt/sources.list.d/pve-no-subscription.list
deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription
EOF
```

Remova repositórios antigos ou incorretos:

```bash
rm -f /etc/apt/sources.list.d/pve-enterprise.list
rm -f /etc/apt/sources.list.d/pve-no-subscription.list
# Depois recrie com o conteúdo acima
```

> **Atenção:** Se você usava repositórios de terceiros (Ceph, ZFS), verifique se eles têm versão compatível com Debian 13.

### 2. Atualizar os pacotes do Proxmox

```bash
apt update
apt dist-upgrade -y
```

Isso instala as últimas versões dos pacotes PVE 9 ainda no repositório `bookworm`. O sistema continua tecnicamente no Debian 12, mas com os pacotes Proxmox atualizados.

### 3. Atualizar a base Debian (Bookworm → Trixie)

Agora você troca a base do sistema para Debian 13:

```bash
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list
```

Verifique se não há outros arquivos em `/etc/apt/sources.list.d/` que ainda apontem para `bookworm`:

```bash
grep -r "bookworm" /etc/apt/sources.list.d/
```

Se encontrar, avalie se devem ser atualizados também (repositórios de terceiros podem ou não ter versão Trixie).

Então faça o upgrade completo:

```bash
apt update
apt upgrade -y
apt full-upgrade -y
```

### 4. Reboot

```bash
reboot
```

Após o reboot, verifique o kernel ativo:

```bash
uname -r
```

O esperado é algo como `6.14.x-1-pve` (kernel Proxmox 6.14). Se ainda aparecer um kernel 6.8, verifique o bootloader:

```bash
dpkg -l | grep pve-kernel-6.14
proxmox-boot-tool status
```

### 5. Verificações pós-upgrade

```bash
# Status do cluster (se aplicável)
pvecm status

# Serviço web
systemctl status pveproxy

# Storage ZFS
zpool status
zfs list

# VMs e containers
qm list
pct list

# Logs de erro
journalctl -p 3 -xb | grep -i error

# Versão do Proxmox
pveversion
```

O comando `pveversion` deve retornar `pve-manager/X.X.X` com versão 9.x.

---

## O que mudou no PVE 9

### Kernel 6.14

O PVE 9 vem com o Proxmox VE Kernel 6.14, baseado no kernel Ubuntu 24.04 LTS. As melhorias incluem scheduler mais eficiente, suporte a hardware mais recente (placa de rede, controladoras NVMe, GPUs) e correções de segurança. **O kernel legacy (5.15) foi removido** — não há mais o meta-pacote `pve-kernel-5.15`.

### Debian 13 "Trixie"

A nova base traz glibc, systemd e toolchain atualizados. A maioria dos pacotes de usuário continua compatível, mas verifique containers LXC com sistemas muito antigos.

### ZFS 2.3

O ZFS foi atualizado para a versão 2.3, que traz:

- Suporte a `draid` (distributed RAID) — alocação mais eficiente que raidz tradicional
- Melhorias de compressão com Zstandard
- `zfs_autoimport` aprimorado

### Ceph Squid (19.2)

Para quem usa Ceph, a versão foi atualizada de Reef (18.2) para Squid (19.2). A migração do Ceph deve ser feita separadamente — consulte o guia oficial do Ceph Squid.

### Corosync 3.1

O Corosync foi atualizado para 3.1.x. Configurações no formato 2.x ainda funcionam, mas com warnings. O PVE 9 recomenda migrar para o novo formato de configuração YAML.

---

## Pitfalls comuns e soluções

| Problema | Sintoma | Solução |
|----------|---------|---------|
| Repositório 404 | `apt update` falha | Verifique se os sources.list usam `bookworm` (não `trixie`) para os repositórios PVE |
| Kernel não atualiza | `uname -r` mostra kernel 6.8 | `apt install pve-kernel-6.14` e `proxmox-boot-tool refresh` |
| Corosync offline | `pvecm status` mostra nó offline | Editar `/etc/corosync/corosync.conf` para formato YAML do corosync 3.x |
| ZFS não monta | `zpool import` falha | `zpool import -a` e depois `zfs mount -a` |
| Rede cai após reboot | Sem conectividade | Verificar `/etc/network/interfaces` — se usava `ifupdown` clássico, reinstalar |
| VM não inicia | Kernel panic no guest | Converter controladora de disco IDE/SCSI para VirtIO SCSI single |
| PBS desconecta | Erro de cliente | `apt install proxmox-backup-client` para versão compatível |
| HA resources param | Serviços HA desligam | `systemctl restart pve-ha-manager pve-ha-crm` |

---

## Migração em cluster

Para clusters com múltiplos nós, o procedimento recomendado é:

1. Remova o HA de todas as VMs/CTs do nó a ser migrado
2. Migre as VMs/CTs para outros nós
3. Faça o upgrade do nó (passos 1-4 acima)
4. Verifique se o nó voltou ao cluster (pvecm status)
5. Migre as VMs/CTs de volta (opcional)
6. Repita para cada nó

Nunca tente fazer upgrade de todos os nós simultaneamente — você pode perder o quorum do cluster.

---

## Considerações finais

A migração do PVE 8 para o 9 é um upgrade inline: não há downgrade oficial. Por isso, teste sempre em ambiente isolado antes de migrar produção. O tempo estimado por nó é de 20 a 40 minutos, dependendo da velocidade de disco e rede.

Se você encontra erros durante o upgrade, o fórum oficial do Proxmox e a [documentação de upgrade](https://pve.proxmox.com/wiki/Upgrade_from_8_to_9) são as melhores fontes de referência.

Leia também:

- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Proxmox Backup Server: instalação via community-scripts e configuração de backups [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
