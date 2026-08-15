---
date: 2026-08-15T18:07:40.000Z
draft: true
title: 'Como bloquear anúncios e rastreadores em 2026: Firefox, uBlock Origin e filtragem de DNS [Guia]'
description: 'Bloqueie anúncios e rastreadores em 2026: uBlock Origin no Firefox, uBO Lite para Chromium, além de filtragem em nível de DNS com Pi-hole ou AdGuard Home. Guia passo a passo.'
featured_image: ''
categories:
  - article
tags:
  - privacy
  - firefox
  - adblocking
  - dns
  - homelab
slug: bloquear-anuncios-rastreadores-firefox-ublock-origin-dns
translation_source_hash: 0ff0b321e8b622bb5798a0d642c0176cb305a388f536887090756381f538213c
---
Em algum momento no último ano você provavelmente notou: seu bloqueador de anúncios parou silenciosamente de fazer seu trabalho. Sem mensagem de erro, sem aviso — apenas banners e pré-rolls do YouTube de volta nas páginas que você visita. Se você usa Chrome ou Edge, isso não é coincidência. É o fim de uma longa transição para o Manifest V3, e isso mudou o cenário do bloqueio de anúncios permanentemente. O Firefox agora é o último navegador importante que ainda suporta totalmente o uBlock Origin — uma história que chegou ao topo do Hacker News com mais de 1.500 pontos em agosto de 2026 ([PCWorld](https://www.pcworld.com/article/3212428/firefox-is-now-the-last-major-browser-that-still-supports-ublock-origin.html), [discussão no HN](https://news.ycombinator.com/item?id=49303202)).

A boa notícia: bloquear anúncios e rastreadores em 2026 ainda é totalmente viável — você só precisa de uma configuração que corresponda à realidade. Este guia cobre as duas camadas que realmente funcionam: a camada do navegador e a camada de DNS. Juntas, elas cobrem todos os dispositivos da sua casa, não apenas um navegador.

## Por que seu antigo bloqueador de anúncios morreu

A versão curta: a plataforma de extensões do Chrome (Manifest V3) removeu a API `webRequest` de bloqueio, na qual bloqueadores poderosos como o uBlock Origin dependiam para inspecionar e cancelar requisições de rede em tempo real. A API substituta, `declarativeNetRequest`, suporta apenas um conjunto limitado de regras estáticas. Essa é uma decisão de design deliberada — o Google é uma empresa de publicidade — e isso se aplica a todos os navegadores Chromium: Chrome, Edge, Opera, os shields padrão do Brave são separados, e assim por diante.

O uBlock Origin ainda existe, mas nos navegadores Chromium ele foi substituído pelo uBlock Origin Lite ([Chrome Web Store](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecngfh)), uma versão compatível com Manifest V3 com menos listas de filtros e sem filtragem dinâmica. No Safari, o uBlock Origin desapareceu completamente. Apenas o Firefox — que manteve a API `webRequest` de bloqueio — ainda executa o uBlock Origin completo ([addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/), [código-fonte](https://github.com/gorhill/uBlock)).

## Camada 1: o navegador

### Firefox + uBlock Origin (a configuração completa)

Se bloquear anúncios é uma prioridade, o Firefox é o padrão racional em 2026. Instale-o e então:

1. Instale o [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/) na loja oficial de complementos do Mozilla.
2. Deixe as configurações padrão por uma semana. As listas de filtros padrão (EasyList, EasyPrivacy, filtros do uBlock) já bloqueiam a grande maioria dos anúncios e rastreadores com zero configuração.
3. Quando você encontrar uma página com poluição visual restante, use o seletor de elementos (o ícone de conta-gotas) para ocultá-la permanentemente. Esse é o recurso que o uBO Lite não pode oferecer.

O Firefox também vem com proteção integrada: a Proteção Aprimorada contra Rastreamento bloqueia cookies entre sites, fingerprinters e criptomineradores de fábrica. Defina-a como **Estrita** em Configurações → Privacidade e Segurança — para a maioria das pessoas, o único efeito colateral é que alguns sites pedem que você faça login novamente.

### Se você precisa ficar no Chromium: uBO Lite + Privacy Badger

Algumas equipes, políticas corporativas ou aplicativos web forçam o uso do Chromium. Nesse caso:

- Instale o [uBlock Origin Lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecngfh) e ative todas as listas de filtros que ele oferece.
- Adicione o [Privacy Badger](https://privacybadger.org/) da EFF, que aprende a identificar rastreadores observando o comportamento deles em vez de depender de listas estáticas — ele complementa a limitação de regras estáticas do uBO Lite.

Essa é uma configuração boa, não ótima. Aceite a diferença e siga em frente.

## Camada 2: filtragem em nível de DNS (a que cobre tudo)

Extensões de navegador protegem apenas o navegador. Seus aplicativos de celular, smart TV e dispositivos IoT ainda estão se comunicando com domínios de anúncios e rastreadores o dia todo. A filtragem em nível de DNS resolve isso para toda a rede: em vez de bloquear no navegador, você bloqueia no momento em que o dispositivo pergunta "onde está ads.example.com?" — a resposta é simplesmente "em lugar nenhum" ([AdGuard Home](https://adguard.com/en/adguard-home.html), [Pi-hole](https://pi-hole.net/)).

### Pi-hole

O clássico. Roda em um Raspberry Pi ou em qualquer máquina baseada em Debian, instala com um único script e oferece um painel mostrando exatamente quais dispositivos estão consultando quais domínios de rastreadores. Se você já tem um Raspberry Pi juntando poeira, essa é a atualização de privacidade mais barata que você pode fazer.

### AdGuard Home

A alternativa moderna. É um único binário Go que roda em qualquer coisa — x86, ARM, até um VPS de US$ 5 — e instala em minutos. Seu painel é, pode-se dizer, mais bonito, suporta upstreams DoH/DoT de fábrica e é fácil de executar em um contêiner. Para usuários de homelab, ambos são cidadãos de primeira classe: se você ainda está decidindo entre contêineres e VMs para serviços como este, nossa [comparação completa entre contêineres e VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) ajuda.

A configuração é a mesma para ambos:

1. Instale em uma máquina que fique sempre ligada.
2. Aponte as configurações de DHCP do seu roteador para o IP do bloqueador como servidor DNS.
3. Observe o log de consultas por um dia — você vai se surpreender com a quantidade de rastreamento que seus dispositivos "inteligentes" fazem.
4. Adicione suas próprias listas de permissões para qualquer coisa que quebrar (algumas smart TVs e aplicativos ficam irritadiços).

Sem homelab? Você pode obter a maior parte do benefício com um DNS de filtragem em nuvem como NextDNS ou o DNS público do AdGuard — defina-o como DNS do seu dispositivo e o bloqueio acontece remotamente.

## Camada 3: o lado do servidor (bônus para quem faz self-hosting)

Se você mantém um site, lembre-se de que o problema tem duas direções. O bloqueio de DNS e de navegador protege *você* de *eles*; proteger seu próprio servidor de scrapers e bots é o problema inverso. Escrevemos um guia completo sobre [detecção e bloqueio de tráfego de bots em sites self-hosted]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) — análise de logs, rate limiting, fail2ban e CrowdSec — que combina naturalmente com um bloqueador de DNS na mesma máquina.

## Ressalvas: barreiras anti-adblock e falsos positivos

Espere atritos ocasionais. Alguns sites detectam bloqueadores de anúncios e exibem um aviso insistente no estilo paywall; o seletor de elementos do uBO ou uma lista de permissões específica para o site geralmente resolve. Ocasionalmente, um bloqueador de DNS quebrará um serviço legítimo — é para isso que serve a lista de permissões. Nada disso é novo, e nada disso é motivo para desistir: as camadas absorvem as lacunas umas das outras.

## A conclusão

Bloquear anúncios em 2026 é uma stack em camadas, não uma extensão única: Firefox + uBlock Origin no navegador, filtragem de DNS na borda da rede e um pouco de tolerância para casos extremos. As peças são gratuitas, a configuração leva uma noite, e a recompensa — sem pré-rolls, sem rastreamento entre sites e uma rede mais silenciosa — dura anos.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Como Detectar e Bloquear Tráfego de Bots no Seu Site Self-Hosted [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
