---
date: 2026-08-14T18:00:00.000Z
draft: true
title: 'Auto-hospedagem do RustDesk: Guia de Acesso Remoto Não Assistido [2026]'
description: 'Guia completo para auto-hospedar RustDesk com Docker em 2026: configuração do hbbs/hbbr, portas de firewall, acesso não supervisionado via Wayland e configuração segura do cliente.'
featured_image: ''
categories:
  - article
tags:
  - rustdesk
  - remote-access
  - selfhosted
  - homelab
  - wayland
  - docker
slug: rustdesk-autohospedagem-acesso-remoto-nao-assistido
translation_source_hash: 9d9bd9d4f02a760604da764a83bb0afcd27d31959f90d6133ae6fd12a12c32cf
---
São 23h de uma quarta-feira e seu servidor doméstico está a mil quilômetros de distância — ou pior, na sala ao lado com uma tela de login morta. Você precisa corrigir uma configuração, pegar um arquivo ou reiniciar um serviço, e a única coisa entre você e a máquina é um cliente de área de trabalho remota que exige que alguém aprove fisicamente a sessão. Se você já ficou trancado para fora do seu próprio hardware porque uma ferramenta remota comercial decidiu que Wayland era "experimental", este guia é para você.

RustDesk é a resposta open-source: uma alternativa ao TeamViewer/AnyDesk que você pode executar inteiramente na sua própria infraestrutura. Este guia aborda por que você deve fazer auto-hospedagem, como implantar o servidor com Docker Compose e como obter acesso verdadeiramente não assistido — incluindo o suporte a Wayland que chegou em agosto de 2026.

## Por que RustDesk, e por que auto-hospedá-lo

RustDesk é um aplicativo de área de trabalho remota escrito em Rust, distribuído sob AGPL-3.0, com mais de 120.000 estrelas no [GitHub](https://github.com/rustdesk/rustdesk). A proposta é simples: os mesmos recursos das ferramentas comerciais — compartilhamento de tela, transferência de arquivos, sincronização de área de transferência, acesso não assistido — sem rotear sua tela por um relay de terceiros que você não controla.

Auto-hospedar é importante por três razões:

1. **Privacidade.** Suas sessões nunca saem da sua rede. O tráfego de rendezvous e relay passa por máquinas que você possui.
2. **Independência.** Sem limites de plano gratuito, sem popups de "esta sessão parece comercial", sem fornecedor decidindo que seu uso é abusivo.
3. **Custo.** Os requisitos de hardware são mínimos: a [documentação oficial](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/) observa que um Raspberry Pi ou a VM de nuvem mais barata é suficiente. O tráfego de relay fica entre 30 KB/s e 3 MB/s para uma tela 1080p, e o trabalho de escritório fica em torno de 100 KB/s.

Se você já tem um homelab com contêineres, o servidor se encaixa ao lado de tudo o mais. Se você ainda está decidindo entre runtimes de contêineres, nosso [guia de contêineres vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) explica os trade-offs.

## Como o RustDesk funciona: hbbs e hbbr

O servidor auto-hospedado é composto por dois binários:

- **hbbs** — o servidor de ID/rendezvous. Os clientes registram seu ID aqui e ele coordena o teste de tipo NAT e o TCP hole punching para conexões diretas.
- **hbbr** — o servidor de relay. Quando uma conexão direta é impossível (NAT simétrico, firewalls restritos), o tráfego é retransmitido através do hbbr.

Portas a abrir no firewall:

| Porta | Protocolo | Finalidade |
|------|----------|---------|
| 21115 | TCP | Teste de tipo NAT |
| 21116 | TCP + UDP | Registro de ID, heartbeat, TCP hole punching |
| 21117 | TCP | Serviço de relay (hbbr) |
| 21118 / 21119 | TCP | Suporte ao cliente web (opcional) |

A [documentação de auto-hospedagem com Docker](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/) recomenda abrir 21115–21119/TCP e 21116/UDP. Se você não precisa do cliente web, as portas 21118/21119 podem permanecer fechadas.

## Implantando o servidor com Docker Compose

A configuração mais simples e confiável em um servidor Linux é Docker Compose com rede host — isso evita a complexidade de mapeamento de portas e mantém as atualizações reproduzíveis. Crie um diretório com um volume de dados e um `docker-compose.yml`:

```yaml
services:
  hbbs:
    container_name: hbbs
    image: rustdesk/rustdesk-server:latest
    command: hbbs -r <relay-host-or-ip>
    volumes:
      - ./data:/root
    network_mode: "host"
    depends_on:
      - hbbr
    restart: unless-stopped

  hbbr:
    container_name: hbbr
    image: rustdesk/rustdesk-server:latest
    command: hbbr
    volumes:
      - ./data:/root
    network_mode: "host"
    restart: unless-stopped
```

Substitua `<relay-host-or-ip>` pelo endereço público que os clientes podem acessar na porta 21117 — isso informa ao hbbs qual relay anunciar. Depois inicie:

```bash
docker compose up -d
```

O volume `./data` persiste o par de chaves que o hbbs gera na primeira execução — faça backup dele, porque os clientes registrados com essa chave não corresponderão a um novo par.

Se você usa UFW, abra as portas com:

```bash
sudo ufw allow 21114:21119/tcp
sudo ufw allow 21116/udp
```

## Apontando clientes para o seu servidor

Em cada cliente, abra Configurações → Rede e preencha os campos de servidor de ID e servidor de relay com o seu host (ou use `rustdesk-utils` para gerar um instalador pré-configurado para frotas). Após a primeira conexão, o cliente mostra o ID atribuído pelo servidor e a conexão é criptografada de ponta a ponta com o par de chaves gerado no seu hbbs.

Este é o momento em que a comparação com ferramentas comerciais deixa de ser teórica: suas sessões são registradas no *seu* servidor, e nada depende da disponibilidade de um fornecedor. Para o endurecimento do homelab, aplica-se a mesma disciplina de qualquer serviço exposto — nosso guia sobre [detecção e bloqueio de tráfego de bots]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) aborda o básico para proteger o que você expõe.

## Acesso não assistido no Wayland: o marco de agosto de 2026

Wayland historicamente tem sido o ponto fraco da área de trabalho remota no Linux. Em agosto de 2026, a [RustDesk anunciou acesso não assistido de verdade no Wayland](https://rustdesk.com/blog/unattended-remote-access-wayland/), incluindo configurações com vários monitores e conexões a partir da tela de login após uma reinicialização — ninguém precisa estar na máquina para aprovar a sessão.

Isso importa porque as alternativas ainda estão defasadas. O AnyDesk exige Xorg para sessões Linux de entrada, e o TeamViewer ainda descreve o suporte a Wayland como experimental para ambientes de desktop comuns. A implementação do RustDesk atualmente é uma versão de pré-visualização para sistemas Debian/Ubuntu x86_64, com suporte a Fedora e Arch planejado assim que a implementação estabilizar. A [discussão no HN](https://news.ycombinator.com/item?id=49300759) reflete a recepção: este é o recurso que os usuários de Linux esperavam.

## Notas de segurança

Algumas coisas que vale a pena saber antes de expor o servidor:

- **Portas WebSocket e falsificação de IP.** Quando 21118/21119 estão abertas para o cliente web, o hbbs/hbbr confiam nos cabeçalhos `X-Real-IP`/`X-Forwarded-For` sem validação. A [documentação alerta](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/) que qualquer pessoa que alcance essas portas diretamente pode falsificar um IP e contornar a limitação de taxa — exponha o cliente web apenas por meio de um proxy reverso que defina o `X-Real-IP` por conta própria.
- **Chaves, não senhas.** O RustDesk auto-hospedado usa o par de chaves do servidor para criptografia; mantenha os arquivos de chave gerados em local seguro e faça backup deles junto com o volume de dados.
- **Licença.** O servidor é AGPL-3.0 — adequado para uso pessoal e interno, mas se você planeja oferecer o RustDesk como serviço comercial, revise as obrigações. A [versão Pro](https://rustdesk.com) adiciona um console web e ACLs para implantações maiores.

## Quando a auto-hospedagem faz sentido?

Se você administra mais de uma máquina Linux, ou quer acesso remoto a um servidor doméstico de qualquer lugar, o custo de configuração é uma noite e o retorno é permanente: sem limites de sessão, sem becos sem saída na tela de login e, agora, sem desculpas de Wayland. Combine isso com uma [estratégia de backup do Proxmox]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}) e seu homelab se torna algo que você pode operar de qualquer lugar.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Como Detectar e Bloquear Tráfego de Bots no Seu Site Auto-Hospedado [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Proxmox Backup Server: instalação via community-scripts e configuração de backup [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
