---
date: 2026-10-13T18:02:29.000Z
draft: true
title: "Executar LLMs em Múltiplas Máquinas: Guia de Inferência Distribuída para o Seu Homelab [2026]"
description: "Como executar um modelo de linguagem grande em várias máquinas ao mesmo tempo: fragmentação de pesos, llama.cpp RPC, MLX, vLLM e as lições da pesquisa Minions da Apple."
featured_image: ""
categories:
  - article
tags:
  - llm
  - homelab
  - distributed-inference
  - self-hosted
  - machine-learning
slug: llms-inferencia-distribuida-homelab
translation_source_hash: b156b6117c8b880734df131cb4acbd1fadd45e982f4bba00f5bea933b998365c
scheduledAt: 2026-10-21T13:52:00.000Z
---
Um modelo de 70 bilhões de parâmetros precisa de aproximadamente 140 GB de pesos em FP16. Nenhuma GPU de consumidor única se encaixa nisso. A resposta usual é comprar uma placa maior ou alugar GPUs na nuvem — ambos caros. Mas a maioria dos homelabs e pequenas equipes já possui vários dispositivos com capacidade de computação ociosa: um Mac mini, uma workstation antiga com uma GPU de 12 GB, um PC de jogos sobressalente. A inferência distribuída trata essa coleção como um único pool.

Existem duas razões para fazer isso:

- **Capacidade.** A fragmentação dos pesos permite que um modelo seja executado que nenhum dispositivo único em sua frota poderia hospedar sozinho.
- **Throughput.** O paralelismo entre dispositivos pode atender a mais requisições concorrentes do que uma única máquina, já que o trabalho é distribuído por muitas GPUs em vez de uma.

A desvantagem é a latência. Na inferência em um único dispositivo, o modelo reside na VRAM de uma máquina; a inferência distribuída move dados de tensor pela sua rede para cada token. Um link de 1 Gbps é aproximadamente 100 vezes mais lento que um barramento PCIe, então configurações distribuídas são melhores para cargas de trabalho em lote ou offline, e não para chat interativo com orçamentos de latência rigorosos.

## Como funciona: fragmentação dos pesos

Todas as abordagens atuais seguem o mesmo princípio. As matrizes de pesos do modelo são divididas em fragmentos (shards), e cada dispositivo participante mantém um fragmento. Quando o modelo gera um token, cada dispositivo calcula seu fragmento em paralelo e os resultados são combinados. Isso é chamado de **paralelismo de tensor** quando a divisão ocorre dentro de cada camada, e **paralelismo de pipeline** quando camadas inteiras são distribuídas entre máquinas.

O software que lida com a divisão, a transferência de rede e a agregação é o que você realmente escolhe. A partir de 2026, as opções práticas são:

| Ferramenta | Ecossistema | Melhor para |
|------|-----------|----------|
| **llama.cpp (servidor RPC GGML)** | CPU + GPU, amplo suporte de hardware | Servir modelos GGUF multi-máquina de forma simples |
| **MLX (mlx.distributed)** | Apenas Apple Silicon | Clusters apenas Apple, pesquisa e modelos MLX |
| **vLLM (paralelismo de tensor + Ray)** | NVIDIA / GPU de produção | Servir com alto throughput, paralelismo de tensor |
| **Exo** | Heterogêneo, p2p | Agrupamento de dispositivos de consumidor mistos sem configuração |

## llama.cpp RPC: o ponto de entrada para homelabs

Para um homelab misto, o ponto de partida mais simples é o servidor RPC do llama.cpp, documentado em seu [guia multi-GPU](https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md). Uma máquina executa o servidor principal e carrega o modelo, enquanto as outras funcionam como backends RPC leves que contribuem com sua capacidade de computação pela rede. `llama-server` com `--rpc` expõe a GPU e CPU locais à instância principal, que então fragmenta os pesos entre quaisquer backends disponíveis.

A configuração prática:

1. Instale o llama.cpp em todas as máquinas.
2. Inicie `llama-rpc-server` em cada worker com `--host 0.0.0.0 --port 50052`.
3. Inicie o servidor principal com `--rpc worker1:50052 --rpc worker2:50052` e o arquivo do modelo.
4. Carregue o modelo GGUF; ele agora está fragmentado em todos os workers.

Isso funciona também com workers de CPU simples, então você pode agrupar um antigo servidor Xeon com um Mac apenas para adicionar memória para uma grande janela de contexto. É o mais próximo de um runtime distribuído plug-and-play para o ecossistema GGUF.

## MLX e a história da Apple

O [framework MLX](https://github.com/ml-explore/mlx) da Apple possui um [módulo distribuído](https://ml-explore.github.io/mlx/build/html/usage/distributed.html) que fragmenta os pesos do modelo automaticamente entre múltiplos dispositivos Apple Silicon. Ele usa os rápidos links Thunderbolt/USB-C entre Macs, e é por isso que os clusters da Apple têm um desempenho muito superior à maioria das configurações heterogêneas de homelabs.

O grupo de Pesquisa em Machine Learning da Apple levou isso adiante em outubro de 2026 com **Minions**, uma "nuvem de GPU virtual dinâmica e distribuída construída sobre dispositivos Apple Silicon ociosos" ([artigo de pesquisa](https://machinelearning.apple.com/research/distributed-gpu-cloud)). O sistema agrega GPUs de Macs ociosos para executar inferência em larga escala, adicionando tolerância a falhas e alocação dinâmica de recursos — um dispositivo pode entrar ou sair do pool sem interromper a carga de trabalho. A conclusão da equipe é o argumento central deste guia: hardware de consumidor ocioso pode se tornar uma plataforma prática de inferência distribuída quando os recursos de GPU centralizados são limitados ou muito caros.

## vLLM: paralelismo de nível de produção

Se você executa GPUs NVIDIA e se preocupa com o throughput, [vLLM](https://docs.vllm.ai/) é a escolha para produção. Ele implementa paralelismo de tensor nativamente e pode distribuir um único modelo por várias GPUs em um host ou por vários hosts usando [Ray](https://docs.ray.io/). Esta é a pilha por trás da maioria dos serviços de modelos auto-hospedados que precisam de alta concorrência, e combina bem com APIs compatíveis com OpenAI para que os clientes existentes continuem funcionando.

## A rede é o gargalo

O fato prático mais importante: a inferência distribuída move muitos dados por token. Um modelo de 70B quantizado de 4 bits tem ~35 GB de pesos; cada etapa de geração troca fragmentos de tensor entre os shards. Em uma rede doméstica de 1 Gbps, isso adiciona dezenas de milissegundos de sobrecarga por etapa, e é por isso que:

- **Use o link mais rápido que tiver.** Thunderbolt (10–40 Gbps) supera 10 GbE, que supera 1 GbE.
- **Prefira menos máquinas, mas maiores** em vez de muitas pequenas — menos saltos, menos sobrecarga de agregação.
- **Quantize agressivamente.** Pesos Q4_K_M movem 4x menos dados do que FP16, o que reduz diretamente o tráfego de rede.

Se sua carga de trabalho é um chat interativo, uma única GPU com quantização geralmente supera um pool distribuído em termos de latência. Se você está fazendo processamento em lote, indexação RAG ou experimentos de fine-tuning, a inferência distribuída é onde ela brilha.

## Quando vale a pena

A inferência distribuída justifica sua complexidade em três situações: um modelo que fisicamente não cabe em nenhuma máquina que você possui; trabalhos em lote onde a latência não importa; e metas de throughput que uma GPU sozinha não consegue atingir. Para todo o resto — um modelo que cabe em uma única placa, uso interativo — não compre nada e mantenha a simplicidade. No entanto, como a pesquisa da Apple mostra, o limite do que "uma máquina" pode executar é menor do que o que toda a sua frota pode, e hardware ocioso é capacidade de computação pela qual você já está pagando.

Leia também:

- [Como Executar LLMs em Hardware de Servidor Antigo: Um Guia Prático para Homelabs [2026]]({{< relref "posts/how-to-run-llms-on-old-server-hardware-a-practical-homelab-guide-2026/" >}})
- [Como Fazer Fine-Tuning de um LLM em uma GPU de Consumidor: Guia de LoRA e QLoRA [2026]]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}})

---

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.
