---
date: 2026-08-03T18:06:39.000Z
draft: true
title: 'Como Executar LLMs de 70B em uma GPU de 4GB: Guia de Inferência com Baixo VRAM [2026]'
description: 'Execute LLMs da classe 70B em GPUs de 4-8GB: streaming de camadas, offload parcial do llama.cpp, configuração do AirLLM, quantização e expectativas reais de desempenho. Guia passo a passo.'
featured_image: ''
categories:
  - article
tags:
  - llm
  - gpu
  - inference
  - homelab
  - selfhosted
slug: executar-llms-70b-gpu-4gb-baixo-vram
translation_source_hash: 8ca8f5f4faa22330d6fb3a8ff88d871bd094d5480e4f56b9ecb16bcf75f601e0
---
Sua GPU tem 4GB de VRAM. Todos os tutoriais que você encontrar dizem que você precisa de pelo menos 24GB — idealmente 80GB — para executar algo sério. Um modelo de 70B tem 140GB de pesos em FP16. A matemática não fecha, então você assume que IA local está fora de alcance.

Essa suposição está errada. Em 2026, executar modelos da classe 70B em uma placa de 4GB é um problema resolvido — não com hacks heroicos, mas com três técnicas bem compreendidas: quantização, offloading parcial e streaming de camadas. Este guia explica como elas funcionam, quando usar cada uma e qual desempenho você pode esperar de forma realista. É o complemento para GPU do nosso guia apenas com CPU para servidores antigos sem nenhum acelerador.

## Por que um modelo de 70B precisa de tanta memória

Antes de falar de truques, entenda a restrição. A pegada de memória de um modelo tem três componentes:

| Componente | O que é | Modelo 70B, FP16 |
|-----------|-----------|-----------------|
| Pesos | Os parâmetros aprendidos | ~140 GB |
| Cache KV | Tokens de contexto armazenados durante a geração | ~1-2 GB por contexto de 8K |
| Ativações | Tensores intermediários por camada | ~1-4 GB |

Uma placa de 4GB não consegue nem segurar os pesos de uma camada de um modelo denso de 70B em FP16 (uma única camada tem ~300MB para atenção + ~1.6GB para o MLP). Portanto, a abordagem inteira tem que mudar: em vez de carregar o modelo na GPU, você o transmite através da GPU.

## Técnica 1: Quantização — o multiplicador 4x

A quantização reduz os pesos de 16 bits para 4 bits ou 8 bits. Não é um hack; é a forma padrão como inferência local séria é executada. O mesmo modelo de 70B que precisa de 140GB em FP16 cabe em ~35-40GB em Q4_K_M — ainda grande demais para 4GB, mas é o ponto de partida certo.

Formatos-chave em 2026:

- **GGUF (ecossistema llama.cpp):** Q4_K_M, Q5_K_M, Q8_0. Melhor qualidade por byte para CPU e CPU/GPU misto.
- **FP8 (AirLLM v3+, GPUs mais novas):** suportado nas arquiteturas Ada e Hopper; quase sem perdas para a maioria das cargas de trabalho.
- **AWQ/GPTQ:** formatos mais antigos focados em GPU, menos relevantes agora que GGUF domina.

Regra prática: **Q4 é o piso para trabalhos sensíveis à qualidade, Q8 é o teto para execuções limitadas por CPU.** Ir mais baixo (Q2/Q3) torna os modelos visivelmente mais burros.

## Técnica 2: Offloading parcial com llama.cpp e Ollama

Se sua GPU tem *alguma* VRAM — 6GB, 8GB, 12GB — a resposta pragmática é o offloading parcial: mantenha o maior número possível de camadas na GPU e deixe a CPU cuidar do resto. Tanto [llama.cpp](https://github.com/ggerganov/llama.cpp) quanto [Ollama](https://ollama.com) suportam isso nativamente.

Com llama.cpp:

```bash
# Offload as many layers as fit; llama.cpp spills the rest to CPU
llama-cli -m Qwen3-32B-Q4_K_M.gguf -ngl 20 --context-size 8192
```

Com Ollama, defina o parâmetro `num_gpu` no Modelfile do modelo:

```dockerfile
FROM qwen3:32b
PARAMETER num_gpu 20
```

O ponto ideal: coloque **todas** as camadas se puder (GPU pura, ~10x mais rápido), ou pelo menos as camadas de atenção, que são as que mais se beneficiam do paralelismo da GPU. Se você estiver executando inferência dentro de uma VM, lembre-se de que precisa de [GPU passthrough]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) para expor a placa ao convidado.

## Técnica 3: Streaming de camadas com AirLLM — 70B em 4GB

Para o caso extremo — uma placa de 4GB de verdade (GTX 1650, RTX 3050 laptop) — você precisa de streaming de camadas. É isso que o [AirLLM](https://github.com/lyogavin/airllm) faz: ele carrega uma camada por vez na GPU, calcula, libera e passa para a próxima. A GPU age como um rascunho rápido em vez de um depósito de pesos. Nenhuma quantização é necessária — um modelo de 70B roda em FP16 em 4GB porque apenas uma camada vive na VRAM a cada instante.

[AirLLM](https://github.com/lyogavin/airllm) (Apache-2.0, ~27k estrelas) torna isso algo de uma linha:

```python
from airllm import AutoModel

# 70B class on a 4GB GPU — same API for any supported model
model = AutoModel.from_pretrained("Qwen/Qwen3-32B")

# Even bigger, with the exact same call:
# model = AutoModel.from_pretrained("Qwen/Qwen3-235B-A22B")   # ~3GB VRAM
# model = AutoModel.from_pretrained("deepseek-ai/DeepSeek-V3") # 671B, ~12GB VRAM

output = model.generate("Explain why the sky is blue.")
```

O AirLLM também adicionou prefetch (sobrepõe carregamento e computação, ~10% mais rápido) e um modo de compressão que afirma ser 3x mais rápido. Para modelos MoE esparsos — DeepSeek-V3 (671B) em ~12GB, Kimi K3 (2.8T) em menos de 4GB — ele transmite um especialista por vez em vez de uma camada inteira, e é por isso que esses modelos enormes cabem em placas minúsculas.

O tradeoff é velocidade. Transmitir pesos da RAM para a VRAM é limitado pela largura de banda do PCIe, não pela computação. Espere **0,5-3 tokens/seg** para um 70B denso em uma placa de 4GB — ok para trabalhos em lote e experimentos, doloroso para chat.

## Qual desempenho você deve esperar?

| Configuração | Modelo | Tokens/seg | Caso de uso |
|-------|-------|-----------|----------|
| RTX 3060 12GB, offload total | 7-8B Q4 | 30-60 | Chat diário, codificação |
| RTX 3060 12GB, offload parcial | 32B Q4 | 6-12 | Raciocínio de texto longo |
| GPU 4GB, streaming AirLLM | 70B FP16 | 0,5-3 | Inferência em lote, experimentos |
| GPU 4GB, streaming AirLLM | MoE 235B+ | 1-4 | Teste de modelos esparsos |
| Sem GPU, Xeon antigo (somente CPU) | 13-26B Q8 | 4-15 | Cargas de trabalho em lote para servidores |

## Quando pular a GPU completamente

O streaming de camadas é impressionante, mas lento. Para muitas cargas de trabalho de homelab — sumarização em lote noturna, embeddings, revisão de código de uma fila de PRs — uma máquina somente com CPU, com muita RAM e largura de banda de memória, vence uma GPU de 4GB no streaming. Inferência limitada por largura de banda de memória significa que um dual-Xeon com 8 canais DDR4 alimenta a CPU com pesos mais rápido do que um link PCIe 3.0 x16 alimenta uma GPU.

A matriz de decisão:

- **Você quer chat interativo** → compre/pegue emprestada uma placa de 12GB+, ou use um modelo de 7-8B totalmente em offload.
- **Você tem uma GPU antiga parada** → use offload parcial com llama.cpp; cada camada conta.
- **Você precisa executar um modelo de 70B+ e tem 4GB** → streaming no estilo AirLLM, e tenha paciência.
- **Você tem um servidor com 64GB+ de RAM e sem GPU** → vá apenas com CPU.

## O resumo em uma linha

A quantização reduz o modelo em 4x, o offload parcial o distribui entre CPU+GPU, e o streaming de camadas permite que uma placa de 4GB execute modelos 40x maiores do que ela. A era do "você precisa de um H100" acabou — o gargalo em 2026 é saber qual técnica se encaixa no seu hardware, não o hardware em si.

Leia também:

- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [Por que estou rompendo com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
