---
date: 2026-09-01T18:02:52.000Z
draft: true
title: Identificação Auto-hospedada de Sons de Pássaros com BirdNET-Go [Guia de 2026]
description: Como transformar suas câmeras de segurança existentes em um sistema automático de identificação de aves com BirdNET-Go. Sem nuvem, sem assinaturas — apenas áudio RTSP e um modelo de IA local.
featured_image: ''
categories:
  - article
  - tutorial
tags:
  - homelab
  - self-hosting
  - ai
  - birdnet
  - frigate
slug: identificacao-autohospedada-sons-passaros-birdnetgo-guia-2026
translation_source_hash: ef6750ecac3115af9cf897164b9f13bd9fdc6ea3b606da24a699fab81b260f8c
---
Suas câmeras de segurança já gravam áudio 24/7. Com uma ferramenta auto-hospedada chamada BirdNET-Go, esse mesmo áudio pode te dizer quais espécies de pássaros estão visitando seu quintal — automaticamente, localmente e sem assinatura. Este guia percorre a configuração completa: arquitetura, instalação, configuração e como reduzir falsos positivos a um sinal útil.

A ideia não é nova, mas continua reaparecendo por um bom motivo: é um dos projetos de homelab mais satisfatórios que você pode construir com o hardware que já possui. Um [post de Jason Tucker](https://jasontucker.blog/how-i-turned-my-security-cameras-into-an-automatic-bird-identification-system-with-birdnet-go/) descrevendo exatamente essa configuração chegou ao topo do Hacker News, e a seção de comentários mostra dezenas de pessoas rodando variações dela — de câmeras de campainha UniFi a estações de pássaros movidas a energia solar.

## Por que áudio, e não vídeo

Identificação de pássaros por vídeo é difícil: pássaros são pequenos, rápidos e frequentemente fora do enquadramento. O áudio é o oposto — os cantos são altos, distintos e alcançam dezenas de metros. O [modelo BirdNET do Cornell Lab of Ornithology](https://birdnet.cornell.edu/) classifica mais de 6.000 espécies apenas pelo som, e funciona totalmente offline. BirdNET-Go é uma implementação em Go que envolve esse modelo com um cliente RTSP, um agendador e um painel web, para que você possa apontá-lo para seus feeds de câmera e esquecer.

## A arquitetura

A configuração tem três partes principais:

1. **Câmera com áudio** — a maioria das câmeras IP expõe um stream RTSP que inclui uma trilha de áudio, até as de entrada.
2. **BirdNET-Go** — conecta-se ao feed RTSP, extrai o áudio com FFmpeg embutido, executa o modelo BirdNET em intervalos configuráveis e armazena as detecções em um banco de dados embutido.
3. **Notificações** — o BirdNET-Go pode enviar detecções para Discord, Telegram ou MQTT, para que você receba uma mensagem no momento em que uma espécie interessante aparecer.

Ele roda tranquilamente em um Raspberry Pi 4/5, um NUC antigo ou uma VM pequena no seu host Proxmox — o mesmo tipo de hardware que as pessoas usam para [speech-to-text auto-hospedado]({{< relref "posts/self-hosted-speech-to-text-homelab-guide-2026/" >}}) ou [executar LLMs em servidores antigos]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}).

## Passo 1: Encontre a URL RTSP da sua câmera

Cada marca de câmera tem seu próprio esquema de URL. Padrões comuns:

```
rtsp://user:password@192.168.1.50:554/stream1        # generic RTSP
rtsp://user:password@192.168.1.50:554/h264Preview_01_main  # Reolink
rtsp://user:password@192.168.1.50:7447/Streaming/Channels/101  # Hikvision
```

Se você já usa [Frigate](https://frigate.video/) ou [go2rtc](https://github.com/AlexxIT/go2rtc) no seu homelab, talvez não precise da URL bruta — o BirdNET-Go pode consumir o mesmo stream que você já está puxando. Teste o stream primeiro com VLC ou `ffprobe` para confirmar que ele tem uma trilha de áudio:

```bash
ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "rtsp://user:pass@192.168.1.50:554/stream1"
```

Se isso imprimir um nome de codec (como `aac` ou `pcm_alaw`), você está pronto. Se não imprimir nada, sua câmera não tem áudio — veja a seção de solução de problemas abaixo.

## Passo 2: Instale o BirdNET-Go

O projeto oferece uma imagem Docker, que é o caminho mais limpo ([GitHub: tphakala/birdnet-go](https://github.com/tphakala/birdnet-go)). Um `docker-compose.yml` mínimo fica assim:

```yaml
services:
  birdnet-go:
    image: ghcr.io/tphakala/birdnet-go:latest
    container_name: birdnet-go
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./config:/config
      - ./data:/data
    environment:
      TZ: "America/Sao_Paulo"
```

No primeiro boot, ele gera um arquivo de configuração padrão em `./config`. O painel web fica disponível em `http://<host>:8080`.

## Passo 3: Aponte para a câmera

No `config.yaml` gerado, defina a origem RTSP e o agendamento de análise:

```yaml
source:
  - url: "rtsp://user:pass@192.168.1.50:554/stream1"

realtime:
  interval: 15        # analyze every 15 seconds of audio
  overlap: 3          # overlap between windows (seconds)
```

Os padrões analisam em tempo quase real, o que funciona bem em um Pi 4. O modelo é leve o suficiente para que a classificação em si leve uma fração da duração do áudio.

## Passo 4: Reduza os falsos positivos

Este é o passo que separa um projeto divertido de um spam de notificações. Os dois controles mais eficazes:

- **Limite de confiança** — o modelo gera uma pontuação de confiança por detecção. Comece em `0.7` e aumente se estiver recebendo lixo. Um comentarista do HN que usa BirdNET-Go há anos descreve ter alcançado um "estado muito estável" após ajustar esse valor.
- **Filtro de espécies** — restrinja a detecção a uma lista de espécies conhecidas por ocorrer na sua região. O [banco de dados de frequência eBird](https://ebird.org/science/status-and-trends) da Cornell é a referência para o que é plausível na sua área por estação, e o BirdNET-Go suporta lista de permissões de espécies.

Os microfones de câmera são notoriamente ruins, então espere perder chamados distantes ou silenciosos. Se o áudio da sua câmera for inutilizável, a alternativa da comunidade é um microfone USB dedicado ou um nó de áudio baseado em ESP32 — várias pessoas no tópico do HN construíram exatamente isso ([exemplo: fugleramme](https://github.com/arnegiacomo/fugleramme)).

## Passo 5: Notificações e integração

Com as detecções fluindo, configure as notificações no config:

```yaml
telegram:
  enabled: true
  token: "..."
  chat_id: "..."

discord:
  enabled: true
  webhook_url: "..."
```

O BirdNET-Go também publica detecções via MQTT, o que torna trivial alimentar automações do Home Assistant — por exemplo, tirar um snapshot da câmera com o Frigate quando uma espécie rara for detectada. Se você já lida com [tráfego de bots e alertas ruidosos na sua stack auto-hospedada]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}), vai apreciar que o próprio painel do BirdNET-Go filtra as detecções por confiança e espécie antes que qualquer coisa chegue ao seu celular.

## Alternativas que valem a pena conhecer

- **BirdNET-Pi** — a imagem mais antiga para Raspberry Pi, se você preferir um dispositivo dedicado em vez de Docker. Observe que o projeto recomenda o BirdNET-Go para novas instalações.
- **Merlin Bird ID** (Cornell) — o excelente aplicativo de celular, que usa o mesmo modelo BirdNET. Ótimo para confirmar em qualquer lugar o que seu homelab detectou.
- **Frigate** — se você também quiser o lado do vídeo (detecção de objetos, snapshots, clipes), o [Frigate](https://frigate.video/) combina naturalmente com essa configuração; eles são complementares, não concorrentes.

## O que esperar

Depois de uma semana, o painel acumula uma lista de espécies com horários de primeira/última aparição — um registro genuíno e local da biodiversidade do seu quintal. Um usuário do HN relatou 110 detecções em 7 dias com configurações rigorosas; alguém em Sydney brincou que receberia 110 *por dia*. O número exato depende da sua região, do posicionamento da câmera e de quão agressivo é o seu filtro de confiança. A questão não é a contagem: é que os dados vivem no seu hardware, sem serviço de nuvem que possa mudar seus termos ou ser descontinuado em dois anos.

Leia também:

- [Speech-to-Text Auto-Hospedado para Seu Homelab [Guia 2026]]({{< relref "posts/self-hosted-speech-to-text-homelab-guide-2026/" >}})
- [Como Executar LLMs em um Servidor Antigo: Guia de Homelab [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [Detecte e Bloqueie Tráfego de Bots na Sua Stack Auto-Hospedada [Guia 2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
