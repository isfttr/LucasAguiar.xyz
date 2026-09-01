---
date: 2026-09-01T15:02:52-03:00
draft: true
title: "Self-Hosted Bird Sound Identification with BirdNET-Go [2026 Guide]"
description: "How to turn your existing security cameras into an automatic bird identification system with BirdNET-Go. No cloud, no subscriptions — just RTSP audio and a local AI model."
featured_image: ""
categories:
  - article
  - tutorial
tags:
  - homelab
  - self-hosting
  - ai
  - birdnet
  - frigate
---

Your security cameras already record audio 24/7. With a self-hosted tool called BirdNET-Go, that same audio can tell you which bird species are visiting your yard — automatically, locally, and with no subscription. This guide walks through the full setup: architecture, installation, configuration, and how to cut false positives down to a useful signal.

The idea is not new, but it keeps resurfacing for a good reason: it is one of the most satisfying homelab projects you can build with hardware you already own. A [post by Jason Tucker](https://jasontucker.blog/how-i-turned-my-security-cameras-into-an-automatic-bird-identification-system-with-birdnet-go/) describing exactly this setup hit the top of Hacker News, and the comments section shows dozens of people running variations of it — from UniFi doorbell cameras to solar-powered bird stations.

## Why audio, not video

Bird identification from video is hard: birds are small, fast, and often out of frame. Audio is the opposite — bird calls are loud, distinctive, and carry for tens of meters. The [BirdNET model from the Cornell Lab of Ornithology](https://birdnet.cornell.edu/) classifies over 6,000 species from sound alone, and it runs entirely offline. BirdNET-Go is a Go implementation that wraps that model with an RTSP client, a scheduler, and a web dashboard, so you can point it at your camera feeds and forget about it.

## The architecture

The setup has three moving parts:

1. **Camera with audio** — most IP cameras expose an RTSP stream that includes an audio track, even budget ones.
2. **BirdNET-Go** — connects to the RTSP feed, extracts the audio with embedded FFmpeg, runs the BirdNET model on configurable intervals, and stores detections in an embedded database.
3. **Notifications** — BirdNET-Go can push detections to Discord, Telegram, or MQTT, so you get a message the moment an interesting species shows up.

It runs happily on a Raspberry Pi 4/5, an old NUC, or a small VM on your Proxmox host — the same kind of hardware people use for [self-hosted speech-to-text]({{< relref "posts/self-hosted-speech-to-text-homelab-guide-2026/" >}}) or [running LLMs on old servers]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}).

## Step 1: Find your camera's RTSP URL

Every camera brand has its own URL scheme. Common patterns:

```
rtsp://user:password@192.168.1.50:554/stream1        # generic RTSP
rtsp://user:password@192.168.1.50:554/h264Preview_01_main  # Reolink
rtsp://user:password@192.168.1.50:7447/Streaming/Channels/101  # Hikvision
```

If you already run [Frigate](https://frigate.video/) or [go2rtc](https://github.com/AlexxIT/go2rtc) in your homelab, you may not need the raw URL at all — BirdNET-Go can consume the same stream you are already pulling. Test the stream first with VLC or `ffprobe` to confirm it has an audio track:

```bash
ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "rtsp://user:pass@192.168.1.50:554/stream1"
```

If this prints a codec name (like `aac` or `pcm_alaw`), you are good to go. If it prints nothing, your camera has no audio — see the troubleshooting section below.

## Step 2: Install BirdNET-Go

The project ships a Docker image, which is the cleanest path ([GitHub: tphakala/birdnet-go](https://github.com/tphakala/birdnet-go)). A minimal `docker-compose.yml` looks like this:

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

On first boot it generates a default configuration file in `./config`. The web dashboard becomes available at `http://<host>:8080`.

## Step 3: Point it at the camera

In the generated `config.yaml`, set the RTSP source and the analysis schedule:

```yaml
source:
  - url: "rtsp://user:pass@192.168.1.50:554/stream1"

realtime:
  interval: 15        # analyze every 15 seconds of audio
  overlap: 3          # overlap between windows (seconds)
```

The defaults analyze in near real time, which is fine on a Pi 4. The model is light enough that the classification itself takes a fraction of the audio duration.

## Step 4: Reduce false positives

This is the step that separates a fun project from a notification spammer. The two most effective knobs:

- **Confidence threshold** — the model outputs a confidence score per detection. Start at `0.7` and raise it if you are getting garbage. One HN commenter running BirdNET-Go for years describes reaching a "very steady state" after tuning this value.
- **Species filter** — restrict detection to a list of species known to occur in your region. The Cornell [eBird frequency database](https://ebird.org/science/status-and-trends) is the reference for what is plausible in your area by season, and BirdNET-Go supports whitelisting species.

Camera microphones are notoriously bad, so expect misses on distant or quiet calls. If your camera audio is unusable, the community fallback is a dedicated USB microphone or an ESP32-based audio node — several people in the HN thread built exactly that ([example: fugleramme](https://github.com/arnegiacomo/fugleramme)).

## Step 5: Notifications and integration

With detections flowing, wire up notifications in the config:

```yaml
telegram:
  enabled: true
  token: "..."
  chat_id: "..."

discord:
  enabled: true
  webhook_url: "..."
```

BirdNET-Go also publishes detections over MQTT, which makes it trivial to feed Home Assistant automations — for example, snapshot the camera with Frigate when a rare species is detected. If you are already dealing with [bot traffic and noisy alerts in your self-hosted stack]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}), you will appreciate that BirdNET-Go's own dashboard filters detections by confidence and species before anything reaches your phone.

## Alternatives worth knowing

- **BirdNET-Pi** — the older Raspberry Pi image, if you prefer a dedicated device over Docker. Note that the project recommends BirdNET-Go for new installs.
- **Merlin Bird ID** (Cornell) — the excellent phone app, which uses the same BirdNET model. Great for on-the-go confirmation of what your homelab detected.
- **Frigate** — if you want the video side too (object detection, snapshots, clips), [Frigate](https://frigate.video/) pairs naturally with this setup; they are complementary, not competing.

## What to expect

After a week, the dashboard accumulates a species list with first/last seen times — a genuine, local record of your yard's biodiversity. One HN user reported 110 detections in 7 days on strict settings; someone in Sydney joked they would get 110 *per day*. The exact number depends on your region, your camera placement, and how aggressive your confidence filter is. The point is not the count: it is that the data lives on your hardware, with no cloud service that can change its terms or shut down in two years.

Also read:

- [Self-Hosted Speech-to-Text for Your Homelab [2026 Guide]]({{< relref "posts/self-hosted-speech-to-text-homelab-guide-2026/" >}})
- [How to Run LLMs on an Old Server: Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [Detect and Block Bot Traffic in Your Self-Hosted Stack [2026 Guide]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
