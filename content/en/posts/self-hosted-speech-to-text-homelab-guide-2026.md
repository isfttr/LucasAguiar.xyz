---
date: 2026-07-19T15:06:52-03:00
draft: true
title: "Self-Hosted Speech-to-Text in Your Homelab: A Practical Guide [2026]"
description: "Complete guide to self-hosting speech-to-text in your homelab: Whisper.cpp, Transcribe.cpp, faster-whisper, and Moonshine. Docker setup, GPU acceleration, and integration tips."
url: ""
featured_image: ""
categories:
  - article
tags:
  - homelab
  - selfhosted
  - stt
  - whisper
  - ai
---

It is 10 PM on a Wednesday. You have just recorded a 45-minute brainstorming session, a podcast episode with a friend, or a lecture you need to revisit. Your options: send the audio to a cloud service and pay per minute (plus hope they are not training on your conversation), or spend an hour transcribing by hand. Neither is acceptable for a homelab operator in 2026.

The good news: local speech-to-text (STT) has matured past the "barely works on high-end GPUs" phase. A $200 mini PC with an integrated GPU can transcribe faster than real time using models that rival cloud APIs in accuracy. Privacy is preserved, latency is lower, and the only recurring cost is electricity.

This guide covers the tools, the setup, and the trade-offs so you can pick the right stack for your homelab.

## The Landscape in July 2026

The open-source STT ecosystem has settled into four main players, each with a different sweet spot:

| Tool | Stars | Models | Strengths |
|------|-------|--------|-----------|
| **Whisper.cpp** | 51.8k | OpenAI Whisper family | Battle-tested, largest community, LLVM-free CPU path |
| **faster-whisper** | 14k+ | CTranslate2 optimised Whisper | 4× faster than original Whisper, lower memory |
| **Transcribe.cpp** | New | 16 ASR families, 60+ models | GPU acceleration everywhere, drop-in whisper.cpp replacement |
| **Moonshine** | 9.3k | Own architecture | Sub-500KB micro model, real-time voice agents, TTS built-in |

**Whisper.cpp** ([github.com/ggerganov/whisper.cpp](https://github.com/ggerganov/whisper.cpp)) is the reference implementation. It is maintained by the ggml team and has 51,000 GitHub stars for a reason: it works on everything from an RK3566 ARM board to a MacBook Pro, and it is trivial to embed.

**faster-whisper** ([github.com/SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper)) reimplements Whisper using CTranslate2 for 4× speedup over the original Python inference. It is ideal when you have CUDA hardware and want the best throughput on a single GPU.

**Transcribe.cpp** ([workshop.cjpais.com/projects/transcribe-cpp](https://workshop.cjpais.com/projects/transcribe-cpp)) is the new contender that hit the front page of Hacker News with 671 points on July 19, 2026. Built by the maintainer of the Handy STT app, it supports 16 ASR model families (60+ individual models) and accelerates every one of them via Vulkan, Metal, CUDA, or TinyBLAS. Every model is numerically verified against the reference implementation before release. It is a drop-in replacement for whisper.cpp and ships with first-party bindings for Python, JavaScript/TypeScript, Rust, and Swift. If you want broad model choice and hardware acceleration without vendor lock-in, this is the one to watch.

**Moonshine** ([github.com/moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)) takes a different approach: ultra-low latency for voice agents. Its micro model fits in under 500 KB and runs on embedded hardware. The repository also includes intent recognition and text-to-speech, making it a complete voice interaction stack rather than just a transcription engine.

## Setting Up Whisper.cpp in a Proxmox LXC

Whisper.cpp remains the safest starting point for homelab operators because it has zero Python dependencies and compiles to a single binary. Here is the minimal setup in a Proxmox LXC:

```bash
# Create the LXC (Ubuntu 24.04, 4 cores, 8 GB RAM, 32 GB disk)
# Install dependencies
apt update && apt install -y build-essential git cmake

# Clone and build
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
cmake -B build
cmake --build build --config Release

# Download a model
bash models/download-ggml-model.sh base.en
```

That is it. You now have a working `build/bin/whisper-cli` binary. Transcribe a file:

```bash
./build/bin/whisper-cli -m models/ggml-base.en.bin -f recording.wav
```

For the Proxmox user who wants containerised deployment, the official Docker image is straightforward:

```bash
docker run --rm -v $(pwd):/data ghcr.io/ggerganov/whisper.cpp:main \
  -m /data/models/ggml-medium.bin -f /data/recording.wav
```

### Choosing the Right Model Size

Whisper models come in sizes from `tiny` (39 MB) to `large-v3` (3.1 GB). On homelab hardware:

| Model | RAM | Speed on CPU (4 cores, 2.5 GHz) | Accuracy |
|-------|-----|----------------------------------|----------|
| tiny.en | 150 MB | 10× realtime | Good for clean audio |
| base.en | 300 MB | 6× realtime | Good |
| small.en | 900 MB | 2.5× realtime | Very good |
| medium.en | 2.2 GB | 1× realtime | Excellent |
| large-v3 | 6 GB | 0.5× realtime | Best, but slow |

For most homelab use cases (meetings, podcasts, voice notes), **base.en** or **small.en** strike the best balance of speed and accuracy on CPU-only hardware.

## Setting Up Transcribe.cpp for GPU Acceleration

If your Proxmox node has a spare GPU (or an iGPU), Transcribe.cpp delivers dramatically better performance. The Vulkan backend works on any GPU with Vulkan 1.2 support, which includes most Intel, AMD, and NVIDIA hardware from the last five years.

```bash
git clone https://github.com/cjpais/transcribe.cpp
cd transcribe.cpp
cmake -B build -DGGML_VULKAN=ON
cmake --build build --config Release
```

The Python bindings are equally simple:

```bash
pip install transcribe-cpp
```

```python
from transcribe_cpp import TranscribeModel
model = TranscribeModel("models/whisper-base.bin")
result = model.transcribe("recording.wav")
print(result["text"])
```

Transcribe.cpp supports streaming transcription, which is useful for live captioning or voice-controlled home automation. The benchmark published by the author shows a Ryzen 4750U (Vulkan) running the medium model at 2.5× realtime — solid for a six-core laptop APU from 2020.

## Moonshine for Low-Latency Voice Agents

Moonshine ([github.com/moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)) is the right choice when you need sub-100ms latency for interactive voice agents. Its micro model fits in 500 KB and runs on Cortex-M class microcontrollers, but the Python library also works on standard homelab hardware:

```bash
pip install moonshine
```

```python
import moonshine
stt = moonshine.load_model("micro")
result = stt.transcribe("command.wav")
print(result["text"], result["intent"])
```

The intent recognition model classifies utterances into categories (question, command, statement) without an extra inference pass. Combined with the built-in TTS, Moonshine can power a complete voice assistant that never touches a cloud server.

## Integration Ideas for Your Homelab

Once you have a working transcription stack, here is where it gets interesting:

**Voice-controlled home automation.** Point a cheap USB microphone at your living room, run Whisper.cpp in streaming mode, pipe the text into Home Assistant's conversation agent. No cloud, no wake-word licensing.

**Podcast and meeting archiving.** A cron job watches a directory for new recordings, feeds them through faster-whisper, and dumps the transcript alongside the audio. Searchable archives without a third-party service.

**Open WebUI speech input.** The Open WebUI project supports Whisper integration for voice-to-text in the chat interface. Point it at your local Whisper endpoint and you never need to type another prompt.

**Self-hosted live captioning.** Run Transcribe.cpp with streaming on a media server to generate live captions for Jellyfin or Plex — useful for accessibility and for watching videos with the sound off.

## Which One Should You Pick?

| If you have... | Choose... | Reason |
|----------------|-----------|--------|
| An old CPU-only server | Whisper.cpp (tiny/base model) | Minimal dependencies, compiles clean, works on ARM |
| A GPU in your homelab | Transcribe.cpp | Vulkan/CUDA acceleration across 60+ models |
| The most throughput per watt on CUDA | faster-whisper | CTranslate2 optimisation is still the best for NVIDIA GPUs |
| A voice agent / embedded project | Moonshine | Micro model, intent recognition, TTS in one package |
| A mix and want to experiment | Transcribe.cpp | Drop-in whisper.cpp compatible + broadest model support |

## The Bottom Line

Local speech-to-text in 2026 is not a science experiment any more. Whisper.cpp runs faster than real time on a Raspberry Pi 5. Transcribe.cpp has made GPU-accelerated transcription accessible across model families. Moonshine has shrunk the stack to 500 KB for embedded use. All of them respect your privacy and cost nothing beyond the hardware you already own.

The next time you record something, think before reaching for a cloud API. Your homelab can handle it.

Read also:

- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Enabling WhatsApp on Hermes Agent self-hosted: three pitfalls (and how I overcame them)]({{< relref "posts/configuracao-whatsapp-hermes/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
