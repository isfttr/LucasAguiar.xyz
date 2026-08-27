---
date: 2026-08-25T18:04:59.000Z
draft: false
title: "Como Monitorar um VPS Linux: Ferramentas Leves Comparadas [2026]"
description: "Guia prático para monitorar um servidor Linux VPS ou homelab com RAM mínima: btop, Glances, Netdata, node_exporter e vpsmon comparados, com etapas reais de configuração para máquinas pequenas."
featured_image: ""
categories:
  - article
tags:
  - linux
  - monitoring
  - vps
  - selfhosted
  - homelab
  - devops
slug: monitorar-vps-linux-ferramentas-leves-comparadas
translation_source_hash: 606028947de27e59b5105c2113cbe477511146d6ffb5154962f57c3b350d74fd
---
Seu VPS tem 512 MB de RAM, talvez 1 GB. Ele executa um pequeno serviço web, uma VPN, alguns contêineres Docker — e você não faz ideia do que ele está fazendo agora. Instalar uma stack de monitoramento "de verdade" (Prometheus + Grafana + Alertmanager) consumiria um terço da sua memória antes de coletar uma única métrica. Este guia compara ferramentas de monitoramento leves que realmente cabem em servidores Linux pequenos, com passos de configuração que você pode copiar hoje.

O que motivou este post foi um pequeno projeto que apareceu recentemente no Hacker News: [vpsmon](https://github.com/leodeim/vpsmon), um único binário Go que promete um painel web com cerca de 5 MB de RAM. É um projeto jovem (criado em abril de 2026, ainda com menos de 10 estrelas), então trate-o como uma opção promissora, não uma comprovada — mas sua existência aponta para uma lacuna real no ecossistema que este guia cobre de ponta a ponta.

## Por que Stacks Completas de Observabilidade Não Cabem em um VPS Pequeno

A recomendação padrão para "monitoramento" é Prometheus + Grafana + node_exporter (+ Alertmanager se você quiser alertas). Essa stack é excelente — para um cluster. Em um VPS pequeno, isso significa:

- **node_exporter**: ~20-40 MB residentes.
- **Prometheus**: ~150-300 MB com configurações padrão, mais à medida que o TSDB cresce.
- **Grafana**: ~100-150 MB.
- **Alertmanager**: mais ~50-100 MB.

Total: de 300 MB a 600 MB só para monitoramento, antes das configurações de retenção, antes do servidor web que fica na frente. Em um VPS de 512 MB, isso não é uma opção. Em um VPS de 2 GB, é um custo pesado para um único nó. As ferramentas abaixo oferecem 80% do valor com 5-10% do consumo de recursos.

## O Kit de Ferramentas Leve

### Dashboards de terminal: btop e Glances

[btop](https://github.com/aristocratos/btop) (34 mil estrelas, C++) é o substituto moderno do `top`/`htop`. Ele mostra gráficos de CPU por núcleo, memória, I/O de disco, rede e processos em uma única TUI de tela cheia, com suporte a mouse e um tema limpo. É apenas interativo: sem histórico, sem alertas, sem interface web. Isso é suficiente para 80% dos casos em que você só quer saber "o que está consumindo minha CPU agora".

[Glances](https://github.com/nicolargo/glances) (33 mil estrelas, Python) é uma alternativa ao `top` com mais ambição: funciona no terminal, mas também pode exportar para uma interface web, JSON ou InfluxDB, e suporta alertas baseados em limites por meio de um arquivo de configuração. Por ser Python, é mais pesado (~50-80 MB) e mais lento para iniciar, mas é multiplataforma e os alertas por limite fazem dele um passo além do btop sem chegar ao Prometheus completo.

### Dashboards web: Netdata e vpsmon

[Netdata](https://github.com/netdata/netdata) (80 mil estrelas, Go) é o campeão dos pesos pesados do monitoramento leve. Ele descobre automaticamente centenas de métricas (CPU, memória, disco, rede, por processo, contêineres, bancos de dados) sem configuração e traz uma interface web refinada com alarmes e notificações integrados. O problema é a memória: uma instalação padrão usa 100-150 MB. Em um VPS de 2 GB, isso é aceitável; em um de 512 MB, você pode reduzir (desativar coletores não utilizados, diminuir a retenção de histórico em `netdata.conf`) para cerca de 40-60 MB, mas isso exige ajustes.

[vpsmon](https://github.com/leodeim/vpsmon) é o extremo oposto: um único binário Go estático, ~5 MB de RSS, interface web com login, atualização automática a cada 5 segundos. Ele monitora CPU, memória, swap, disco, rede, uptime e contagem de processos — o essencial, nada mais. A instalação é um comando de uma linha (`curl -sL https://raw.githubusercontent.com/leodeim/vpsmon/main/install.sh | sudo bash` — revise o script antes de executá-lo, como em qualquer instalador via curl-to-bash). A configuração é feita por variáveis de ambiente: `MONITOR_ADDR` (padrão `:8088`), `MONITOR_USER` (padrão `admin`) e `MONITOR_PASS_HASH` (bcrypt; a senha padrão é `changeme` — altere-a antes de expor qualquer coisa).

### Exportador de métricas: node_exporter

[node_exporter](https://github.com/prometheus/node_exporter) (13,7 mil estrelas, Go) é o agente do Prometheus que expõe métricas brutas da máquina na porta 9100. Sozinho, é inútil (sem interface), mas é a forma padrão de alimentar métricas em qualquer coletor — Prometheus, VictoriaMetrics ou até mesmo um coletor baseado em cron. Se você planeja evoluir para uma stack de verdade no futuro, execute o node_exporter agora e mantenha a porta aberta.

### Uptime e disponibilidade: Uptime Kuma

Monitoramento não é só sobre recursos — é também sobre "meu serviço está acessível?" [Uptime Kuma](https://github.com/louislam/uptime-kuma) (90 mil estrelas) é a página de status self-hosted que todo mundo usa: ele faz ping HTTP(S), TCP, ICMP e mais, a partir de fora da máquina, com notificações completas (Telegram, Discord, e-mail, webhooks). Ele roda em Docker e usa 100-200 MB, então normalmente vive em um servidor pequeno separado ou em um nó de homelab — idealmente não no próprio VPS que está monitorando.

## Tabela de Comparação

| Ferramenta | Tipo | RAM (típica) | Esforço de instalação | Alertas | Melhor para |
|------|------|---------------|----------------|----------|----------|
| btop | TUI de terminal | ~10-20 MB | `apt install btop` | Não | Verificações interativas rápidas |
| Glances | Terminal + web/exportação | ~50-80 MB | `pip install glances` ou apt | Sim (limites) | Estatísticas multiplataforma e scriptáveis |
| Netdata | Dashboard web | 100-150 MB (40-60 ajustado) | One-liner ou Docker | Sim (alarmes integrados) | Métricas ricas descobertas automaticamente |
| vpsmon | Dashboard web | ~5 MB | One-liner (binário Go) | Não | VPS mínimo, apenas o essencial |
| node_exporter | Exportador de métricas | ~20-40 MB | Binário + unit do systemd | Não (alimenta outros) | Preparação para o Prometheus no futuro |
| Uptime Kuma | Uptime/status | ~100-200 MB (Docker) | Docker compose | Sim (muitos canais) | Monitoramento de disponibilidade externo |

## Configuração Prática para um VPS Pequeno

A combinação pragmática para um VPS de 512 MB: **btop para verificações interativas + Uptime Kuma (em outra máquina) para disponibilidade + um dashboard web leve**. Para o dashboard, comece com vpsmon se quiser o menor consumo de recursos, ou Netdata se quiser profundidade e puder gastar RAM.

**vpsmon (mínimo):**

```bash
curl -sL https://raw.githubusercontent.com/leodeim/vpsmon/main/install.sh | sudo bash
# set a real password, then restart the service
# MONITOR_ADDR=:8088 MONITOR_USER=admin MONITOR_PASS_HASH=$(htpasswd -bnBC 10 "" 'your-password' | tr -d ':\n')
```

**Netdata (docker, VPS 2 GB+):**

```bash
docker run -d --name=netdata \
  --pid=host --network=host \
  -v netdataconfig:/etc/netdata -v netdatalib:/var/cache/netdata \
  --restart=unless-stopped \
  netdata/netdata
```

**node_exporter (systemd):**

```bash
curl -sL -o /tmp/node_exporter.tar.gz https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
sudo tar -xzf /tmp/node_exporter.tar.gz -C /opt
sudo ln -s /opt/node_exporter-1.8.2.linux-amd64/node_exporter /usr/local/bin/
# create a systemd unit and enable it; metrics at :9100/metrics
```

**Uma regra para todas elas:** nunca exponha um dashboard de monitoramento à internet pública sem autenticação. Dashboards são uma superfície de ataque — eles revelam seus serviços, versões e padrões de uso. Coloque-os atrás de um proxy reverso com autenticação, ou prenda-os ao localhost e acesse-os via túnel SSH. Se você já está filtrando tráfego indesejado na borda, [nosso guia sobre como detectar e bloquear tráfego de bots]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) mostra como proteger serviços expostos.

## Como Escolher

- **VPS de 512 MB, serviço único** → btop + Uptime Kuma em outro lugar. Adicione vpsmon apenas se quiser uma visão web.
- **VPS de 2 GB, vários contêineres** → Netdata (ajustado) ou Glances + Uptime Kuma.
- **Nó de homelab (8 GB+)** → é aqui que Prometheus + Grafana começam a fazer sentido; execute node_exporter e uma stack de verdade. Veja a [comparação entre contêineres e VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) para decidir o que você está monitorando em primeiro lugar, e [ajuste de PostgreSQL para homelab]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}}) se um banco de dados for o que mais importa para você.

## Conclusão

Monitorar um servidor Linux pequeno não exige uma stack completa de observabilidade. Comece com btop para o momento em que você suspeitar de um problema, adicione Uptime Kuma para a pergunta "ele está no ar?", e escolha um dashboard leve — vpsmon com ~5 MB ou Netdata para profundidade — para a visão sempre ativa. Acompanhe as tendências de disco e memória antes de precisar delas: a primeira vez que um VPS de 512 MB ficar sem swap não é a hora de aprender sua ferramenta de monitoramento.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Boas Práticas de Performance do PostgreSQL para Homelab e Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [Como Detectar e Bloquear Tráfego de Bots em Serviços Self-Hosted [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
