---
date: 2026-09-08T18:01:30.000Z
draft: true
title: "Guia de Quantização de LLM 2026: Formatos GGUF, Q4 vs Q8 e Como Escolher"
description: "Como escolher a quantização de LLMs em 2026: formatos GGUF explicados (Q8_0, Q4_K_M, Q2, IQ1), quedas abruptas de qualidade, cálculo de VRAM e regras práticas para modelos locais."
featured_image: ""
categories:
  - article
tags:
  - llm
  - quantization
  - gguf
  - llama-cpp
  - machine-learning
slug: guia-quantizacao-llm-2026-gguf-q4-q8
translation_source_hash: 5c55927a0dd73e0fcb95e74fa9e19b81f54b65198f87a27c2fdd7ec75deb9fb4
scheduledAt: 2026-09-12T18:47:00.000Z
---
Baixar um modelo é apenas metade da batalha. A outra metade é escolher qual arquivo baixar: um modelo de 27B pode ser distribuído como um arquivo BF16 de 55 GB, um Q8_0 de 29 GB, um Q4_K_M de 17 GB ou um arquivo de 1 bit de 6 GB — e a diferença de qualidade entre esses extremos é a diferença entre um assistente de codificação e um modelo que responde ao acaso. A quantização é a compressão que torna os LLMs locais possíveis, e escolher o formato errado desperdiça VRAM que você não tem ou prejudica silenciosamente o modelo que você pagou para rodar. Este guia explica como funciona a quantização GGUF, o que significam os nomes dos formatos e como escolher o formato certo para o seu hardware em 2026.

## O que a quantização realmente faz

LLMs são treinados em precisão de 16 bits (FP16 ou BF16): cada peso ocupa 2 bytes. Um modelo de 27B portanto precisa de cerca de 54-55 GB apenas para os pesos, razão pela qual modelos de classe frontier historicamente exigiam GPUs de datacenter. A quantização mapeia esses pesos de 16 bits para menos bits por valor — 8, 4, 2, até menos de 1 — trocando uma pequena quantidade de precisão por uma grande redução de memória e uma aceleração na inferência, já que pesos menores se movem mais rápido em cargas de trabalho com gargalo de memória.

O formato dominante para inferência local é o **GGUF**, o container usado pelo llama.cpp e seus derivados (Ollama, LM Studio, Jan e a maioria das pilhas self-hosted). A convenção de nomenclatura conta a história: `Q8_0` é de 8 bits, `Q5_K_M` e `Q4_K_M` são "K-quants" de 5 e 4 bits (uma família de esquemas de precisão mista em que tensores importantes mantêm mais bits), e os formatos mais novos `IQ` (como `IQ2_XXS` ou `IQ1_S`) são quants de "matriz de importância" que vão abaixo de 2 bits explorando estrutura estatística. Em 2026, o menu prático é:

| Formato | ~Tamanho para 27B | Uso típico |
|--------|--------------|-------------|
| BF16/FP16 | ~55 GB | Qualidade de referência, apenas datacenter |
| Q8_0 | ~29 GB | Quase sem perdas, quando a VRAM permite |
| Q5_K_M | ~19 GB | Ligeiramente melhor que Q4, ganhos marginais |
| Q4_K_M | ~17 GB | O ponto ideal de qualidade por GB em 2026 |
| Q2_K / UD-Q2_K_XL | ~10-11 GB | Esticando GPUs pequenas, trade-offs visíveis |
| IQ1_S / UD-IQ1_S | ~6 GB | Apenas casos extremos — a qualidade desmorona |

Os tamanhos acima seguem os [arquivos GGUF do Qwen3.8 27B publicados pela Unsloth no Hugging Face](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF).

## A evidência de 2026: 4 bits se sustenta, 1 bit desmorona

O ponto de dados recente mais útil vem do [benchmark da Quesma com quantizações do Qwen3.8 27B](https://www.quesma.com/blog/qwen38-27b-quantizations-benchmarked/), que chegou à primeira página do Hacker News em setembro de 2026. Piotr Migdał executou o modelo completo em BF16 e quatro variantes quantizadas — Q8_0 (29 GB), Q4_K_M (17 GB), UD-Q2_K_XL (10,7 GB) e UD-IQ1_S de 1 bit (6,2 GB) — em três benchmarks: GPQA Diamond (ciência de nível de pós-graduação), IFBench (seguir instruções) e Terminal-Bench 2.1 (codificação agêntica).

O resultado principal: **Q4_K_M igualou o modelo de precisão total no Terminal-Bench 2.1** ocupando menos de um terço da memória — 17 GB cabem em uma RTX 4090 de 24 GB com espaço restante para cerca de 64 mil tokens de contexto. A compressão degrada suavemente até 2 bits, onde o modelo ainda faz trabalho útil com 10,7 GB. Então ela atinge um despenhadeiro: com 1 bit, o modelo obteve cerca de chance aleatória no GPQA Diamond, e o raciocínio mais longo o tornou *pior* — um modelo quantizado que começa a alucinar cedo acaba acumulando os próprios erros.

Duas lições práticas decorrem desse benchmark. Primeiro, as reclamações do tipo "meu modelo quantizado parece mais burro" que circulam no Reddit geralmente são sobre descer longe demais na escada de bits, não sobre a quantização em si. Segundo, a escolha da configuração de esforço de raciocínio importou tanto quanto a escolha do formato nos testes — um modelo de 4 bits bem configurado com esforço de raciocínio adequado vence um modelo de 8 bits mal configurado. Detalhes sobre como replicar as execuções estão no [repositório llama.cpp](https://github.com/ggml-org/llama.cpp), que também documenta a lista completa de tipos de quantização.

## Como escolher: regras práticas para 2026

Não existe uma única quantização "melhor" — existe um formato melhor para o seu orçamento de VRAM e para a sua carga de trabalho. Comece com estas regras:

1. **Q4_K_M é o padrão.** Para quase todo caso de uso local — codificação, chat, trabalho agêntico — o K-quant de 4 bits é o vencedor em qualidade por gigabyte. Se você não tiver certeza, baixe o Q4_K_M primeiro.
2. **Use Q8_0 apenas quando a qualidade for crítica e a VRAM for abundante.** Q8_0 é quase sem perdas e custa cerca de 70% mais disco e memória que o Q4_K_M. Ele brilha em tarefas em que a precisão importa (saída estruturada, matemática) em hardware que pode arcar com isso.
3. **2 bits é para espremer em hardware fraco, não para qualidade.** As variantes IQ2/UQ2 permitem que um modelo de 27B rode em ~10 GB, o que é notável — mas espere uma degradação visível em tarefas com muito raciocínio. Reserve-os para máquinas em que o Q4_K_M simplesmente não cabe.
4. **Evite 1 bit para qualquer coisa que raciocine.** Os dados da Quesma são inequívocos: quantizações de 1 bit colapsam para um desempenho quase aleatório em benchmarks difíceis. O único uso defensável é em experimentos ou dispositivos de borda extremamente limitados.
5. **Ajuste a quantização ao tamanho do modelo, não ao hábito.** Um modelo de 7-8B em Q4 tem ~4-5 GB e roda em quase qualquer coisa; um de 70B em Q4 tem ~40 GB e precisa de hardware sério. Quando você não consegue encaixar o modelo desejado em Q4, as opções honestas são um modelo menor em Q4 ou Q8, não um modelo maior em IQ1.

## Dimensionando a memória: pesos não são a história completa

Um erro comum é comprar VRAM apenas para o arquivo de pesos e ignorar o cache KV. O cache KV armazena as chaves e os valores de atenção da sua janela de contexto e escala com o comprimento do contexto, não com o tamanho do modelo. Nas execuções da Quesma, um cache KV em FP16 pesava cerca de 2,3 GB por 32 mil tokens — em um contexto longo de 128 mil, isso são ~9 GB por cima dos pesos. Planeje o orçamento considerando ambos: um Q4_K_M de 27B (17 GB) mais um cache KV de 64 mil tokens precisa de cerca de 22 GB de VRAM livre, e é por isso que placas de 24 GB são o piso prático para essa configuração.

Dois outros fatores importam. Primeiro, a maioria dos runtimes em 2026 suporta caches KV quantizados (Q8 ou Q4) que reduzem drasticamente a memória de contexto com impacto mínimo de qualidade em documentos longos — ative-os em configurações com pouca memória. Segundo, o llama.cpp melhora constantemente; o autor da Quesma observou que apenas builds de meados de agosto de 2026 lidavam corretamente com o Qwen3.8. Se um modelo se comportar de forma estranha, atualize o seu runtime antes de culpar a quantização.

## O fluxo de trabalho

Concretamente, escolher uma quantização em 2026 se parece com isto: encontre o seu modelo no Hugging Face (os [repositórios GGUF da Unsloth](https://huggingface.co/unsloth) são o padrão de facto para arquivos de quantização bem ajustados), leia a lista de arquivos, escolha o maior formato que caiba na sua VRAM depois de reservar espaço para o cache KV — geralmente Q4_K_M — baixe o arquivo `.gguf` e aponte o seu runtime para ele. Ollama e LM Studio abstraem o nome do arquivo com tags como `q4_K_M`, enquanto o llama.cpp puro usa o caminho do arquivo diretamente. Se você já roda modelos localmente, a mesma lógica de quantização se aplica quer você esteja [rodando modelos de 70B em uma GPU de 4 GB]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}}), [servindo inferência a partir de um servidor homelab antigo]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) ou [fazendo fine-tuning com QLoRA em uma placa de consumo]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}}) — QLoRA é quantização aplicada ao treinamento em vez da inferência.

## Conclusão

A quantização em 2026 é um problema resolvido com uma resposta entediante: use Q4_K_M a menos que você tenha um motivo específico para não usar. A escada de bits desmorona na base — 4 bits se sustenta em benchmarks difíceis, 2 bits é um meio-termo, 1 bit é uma armadilha — e os resultados recentes do Qwen3.8 27B são a evidência pública mais clara até agora de que um arquivo de 17 GB pode igualar um modelo de 55 GB em tarefas reais de codificação. Dimensionar seu orçamento de VRAM com pesos e cache KV em mente, e manter seu build do llama.cpp atualizado, importa mais do que se angustiar com a tabela de formatos.

Leia também:

- [Como Rodar LLMs de 70B em uma GPU de 4GB: Guia de Inferência com Baixo VRAM [2026]]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})
- [Como Rodar LLMs em Hardware de Servidor Antigo: Um Guia Prático de Homelab [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [Como Fazer Fine-Tuning em um LLM em uma GPU de Consumo: Guia de LoRA e QLoRA [2026]]({{< relref "posts/fine-tune-llm-consumer-gpu-guide-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros tópicos em <contact@lucasaguiar.xyz>
