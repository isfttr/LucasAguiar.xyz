---
date: 2026-08-17T11:16:25-03:00
draft: false
title: "Como Atualizar o Open WebUI [2026]: Guia Completo (Docker, pip e LXC)"
description: "Como atualizar o Open WebUI em 2026: Docker Compose, pip/uv e LXC no Proxmox. Faça backup antes, evite bugs pós-update e automatize com Watchtower."
featured_image: ""
categories:
  - article
tags:
  - open-webui
  - homelab
  - docker
  - proxmox
  - auto-hospedagem
---

O Open WebUI é uma das interfaces de IA self-hosted mais usadas por aí, mas atualizá-lo confunde muita gente porque não existe um comando único — o update correto depende inteiramente de como você instalou. Docker, pip e um LXC no Proxmox têm fluxos diferentes. Este guia consolida os três, na ordem em que você deve pensar: backup, update, verificação.

## Antes de atualizar: backup e segredos

Três coisas mordem todo mundo a cada release. Faça-as primeiro:

1. **Faça backup dos dados.** Todas as conversas, usuários, configurações, arquivos enviados e conteúdo gerado ficam no diretório de dados. No Docker, é o volume `open-webui`:
   ```bash
   docker run --rm -v open-webui:/data -v $(pwd):/backup alpine tar czf /backup/openwebui-$(date +%Y%m%d).tar.gz /data
   ```
   Em instalações pip/uv, os dados ficam em `~/.open-webui` (ou onde `DATA_DIR` apontar); na instalação via LXC no Proxmox, em `/root/.open-webui` mais `/root/.env`. Faça backup disso também.
2. **Persista o `WEBUI_SECRET_KEY`.** Se a chave muda a cada recriação do container, todas as sessões são invalidadas e os usuários são deslogados. Gere uma vez com `openssl rand -hex 32` e mantenha-a estável no seu `docker-compose.yml` ou `.env`.
3. **Entenda que as migrações de banco são unidirecionais.** Desde a [v0.11.0](https://github.com/open-webui/open-webui/releases/tag/v0.11.0), as notas de release recomendam explicitamente backup antes de atualizar. Reverter a imagem **não** desfaz mudanças de schema — se precisar voltar atrás, restaure o backup.

A [documentação oficial de update](https://docs.openwebui.com/getting-started/updating) também recomenda fixar uma versão (`:vX.Y.Z`) para setups compartilhados/de time, em vez de seguir `:main`, que é uma tag rolante capaz de entregar mudanças que quebram tudo sem aviso.

## Método 1: Docker Compose (recomendado)

```bash
docker compose pull
docker compose up -d
```

Só isso — o container reinicia com a imagem nova, as migrações rodam no startup e o volume mantém seus dados. Para um setup com `docker run` puro:

```bash
docker rm -f open-webui
docker pull ghcr.io/open-webui/open-webui:main
docker run -d -p 3000:8080 -v open-webui:/app/backend/data -e WEBUI_SECRET_KEY=*** --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### Auto-update com Watchtower

Para uso em homelab, a documentação recomenda explicitamente o [Watchtower](https://github.com/containrrr/watchtower). Um detalhe importante de 2026: a imagem original `containrrr/watchtower` não é mais mantida e falha com Docker 29+, então use o fork mantido `nickfedor/watchtower`:

```bash
# Update único só do Open WebUI
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock nickfedor/watchtower --run-once open-webui

# Auto-update contínuo a cada 6 horas
docker run -d --name watchtower --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e WATCHTOWER_CLEANUP=true \
  nickfedor/watchtower --interval 21600 open-webui
```

`WATCHTOWER_CLEANUP=true` remove imagens antigas automaticamente. A troca: updates automatizados podem quebrar um deployment se um release vier com mudança quebradeira ou migração — exatamente por isso o passo de backup acima é inegociável.

## Método 2: pip / uv

Se você instalou com pip:

```bash
pip install -U open-webui
open-webui serve
```

Com uv (método do quick-start na documentação): `uvx --python 3.11 open-webui@latest serve`. Seus dados continuam em `~/.open-webui`; para reverter, instale a versão anterior explicitamente (`pip install open-webui==X.Y.Z`) e reinicie — lembrando da ressalva das migrações acima.

## Método 3: LXC no Proxmox (community-scripts)

O instalador do [Proxmox VE Community Scripts](https://community-scripts.org/scripts/openwebui) costumava ser uma instalação via git+source (`/opt/open-webui`, build npm, pip install). Isso agora é o **caminho legado**: desde 2026 o instalador e o atualizador usam tool install baseado em uv, e o script de update migra automaticamente instalações source antigas para o novo layout, preservando seus dados e o `.env`.

Para atualizar um LXC do Open WebUI hoje:

```bash
# Rode dentro do LXC (ou via pct exec)
uv tool install --force --python 3.12 open-webui[all]
systemctl restart open-webui
```

O projeto também entrega `tools/pve/update-apps.sh`, um atualizador por container com backup opcional antes do update. Meu script bash antigo para atualizar o Open WebUI em um LXC Proxmox ainda funciona para instalações source legadas, mas para containers novos o caminho uv acima é o suportado.

## Depois de atualizar: verifique

1. **Force o refresh no navegador** (Ctrl+F5 / Cmd+Shift+R) — JS em cache é a fonte nº 1 de relatos de "o update quebrou tudo".
2. Cheque os logs do container em busca de saída de migração: `docker logs open-webui 2>&1 | head -20` (ou `journalctl -u open-webui` no LXC).
3. Se seus **modelos customizados sumiram depois do update**, isso é um bug conhecido relacionado a Direct Connections — veja a [solução passo a passo]({{< relref "posts/fix-custom-models-open-webui/" >}}) antes de abrir uma issue no GitHub.

## Resumo

| Instalação | Comando de update | Auto-update |
|---|---|---|
| Docker Compose | `docker compose pull && up -d` | Watchtower (`nickfedor/watchtower`) |
| pip/uv | `pip install -U open-webui` | Manual (ou cron) |
| LXC Proxmox | `uv tool install --force open-webui[all] && systemctl restart open-webui` | Manual (ou `update-apps.sh`) |

Backup antes de todo update, `WEBUI_SECRET_KEY` estável, versão fixada para qualquer coisa compartilhada, e depois do update sempre hard-refresh e olhada nos logs. Se você ainda está decidindo entre rodar o Open WebUI em um [container ou em uma VM]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}), esse guia também ajuda.

Leia também:

- [Open WebUI: Modelos Não Aparecem? Solução Passo a Passo [2026]]({{< relref "posts/fix-custom-models-open-webui/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
