---
date: 2026-08-04T18:04:09.000Z
draft: true
title: 'Como Fazer Fine-Tuning de um LLM em uma GPU de Consumidor: Guia de LoRA e QLoRA [2026]'
description: 'Ajuste fino de LLMs de 7-8B em GPUs de 4-8GB com LoRA e QLoRA: matemática de memória, ferramentas (PEFT, TRL, Unsloth), treinamento passo a passo e expectativas realistas para hardware de consumo.'
featured_image: ''
categories:
  - article
tags:
  - llm
  - fine-tuning
  - lora
  - gpu
  - machine-learning
slug: finetuning-llm-gpu-consumidor-lora-qlora
translation_source_hash: 5c84eca69638023fb61e8589f5ed4022e265aa71f9e59c4e0f3eeeda9bc162d3
---
Seu desktop tem uma RTX 3060 com 12GB de VRAM. Ou talvez um notebook antigo com uma placa de 4GB. Você quer ensinar o seu domínio a um LLM — as convenções do seu código, seus tickets de suporte, a sua voz de escrita. Todo tutorial que você encontra começa com "provisione um A100 com 80GB" ou "alugue um cluster". Então você assume que o fine-tuning está fora do alcance.

Não está. Em 2026, fazer fine-tuning de um modelo de 7-8B em uma única GPU de consumidor é um problema resolvido, e a página inicial do Hacker News desta semana prova o apetite: um projeto que [faz fine-tuning de um modelo 8B em uma GPU de notebook com 4GB](https://github.com/MakazhanAlpamys/Soup) e outro que [executa um Qwen de 80B em 4.3GB de RAM em um Mac](https://github.com/leonickson1/Swiftlet) — ambos subiram no ranking. A mágica não é um novo avanço — é uma técnica de 2021 (LoRA) e seu refinamento de 2023 (QLoRA), além de ferramentas que evoluíram para fluxos de trabalho de um comando.

Este guia explica por que o fine-tuning é faminto por memória, como LoRA e QLoRA contornam o problema e os passos exatos para treinar um modelo no hardware que você já tem.

## Por que o fine-tuning completo precisa de 80GB

O fine-tuning atualiza os pesos de um modelo. A conta de memória tem quatro componentes, e os pesos base são apenas parte dela:

| Componente | Modelo 8B, FP16 |
|-----------|---------------|
| Pesos (congelados ou treináveis) | ~16 GB |
| Gradientes | ~16 GB |
| Estados do otimizador (AdamW: dois momentos + pesos mestres) | ~48 GB |
| Ativações (por etapa de treinamento) | ~4-16 GB dependendo do comprimento da sequência |

Somando tudo: um fine-tuning completo ingênuo de um modelo 8B precisa de aproximadamente 80-100GB de memória apenas para o estado de treinamento — antes mesmo de carregar um lote de dados. É por isso que o aluguel de GPUs na nuvem se tornou o padrão. Mas observe a estrutura do problema: os estados do otimizador dominam, e eles existem porque você está atualizando **todos** os parâmetros.

## LoRA: treine um adaptador minúsculo em vez disso

[LoRA (Low-Rank Adaptation)](https://arxiv.org/abs/2106.09685), de Hu et al. (2021), congela os pesos originais e injeta pequenas matrizes treináveis em cada camada. Em vez de atualizar 8 bilhões de parâmetros, você atualiza alguns milhões — tipicamente 0.1-1% do modelo.

A matemática é simples: uma matriz de pesos `W` de formato `d × d` é aproximada como `W + BA`, onde `B` é `d × r` e `A` é `r × d`, com rank `r` tipicamente 8-64. O adaptador é minúsculo: para um modelo 7B com rank 16, isso dá aproximadamente 34M de parâmetros treináveis — cerca de 130MB em FP16. Todo o resto permanece congelado.

Isso colapsa a conta de memória. Com LoRA, a pegada do modelo 8B se torna:

| Componente | Fine-tuning completo | LoRA |
|-----------|---------------|------|
| Pesos | ~16 GB (todos treináveis) | ~16 GB (congelados) |
| Gradientes | ~16 GB | ~0.1 GB (apenas adaptador) |
| Estados do otimizador | ~48 GB | ~0.4 GB |
| Ativações | 4-16 GB | 4-16 GB |

As ativações — que escalam com o tamanho do lote e o comprimento da sequência — se tornam a restrição limitante. Isso é gerenciável com lotes pequenos e gradient checkpointing.

## QLoRA: quantize a base congelada para 4 bits

[QLoRA](https://arxiv.org/abs/2305.14314), de Dettmers et al. (2023), dá o próximo passo: quantiza o modelo base **congelado** para 4 bits (formato NF4) e mantém apenas os adaptadores LoRA em precisão total. O artigo original fez fine-tuning de um modelo de 65B em uma única GPU de 48GB. A conta de memória para um modelo 8B cai para aproximadamente:

- Pesos base em 4 bits: ~5 GB
- Adaptadores + otimizador: ~1 GB
- Ativações: alguns GB com gradient checkpointing

Total: **~8-10GB confortavelmente, ~4-6GB com configurações apertadas**. Isso é um notebook gamer com uma placa de 4GB, não um datacenter.

## As ferramentas em 2026

A stack da Hugging Face é o padrão: [PEFT](https://github.com/huggingface/peft) fornece as camadas LoRA/QLoRA, e [TRL](https://github.com/huggingface/trl) fornece o loop de treinamento (`SFTTrainer` para fine-tuning supervisionado, além de DPO/ORPO para ajuste de preferências). Há três camadas de abstração por cima dela:

1. **Stack bruta (PEFT + TRL):** controle máximo, ~60 linhas de Python. Melhor quando você precisa entender cada detalhe.
2. **[Unsloth](https://github.com/unslothai/unsloth):** um substituto drop-in que afirma ser aproximadamente 2x mais rápido no treinamento com até 70% menos VRAM, graças a kernels de atenção manuais e gerenciamento de memória mais inteligente. Se você está com uma placa de 4-6GB, isso costuma ser a diferença entre treinar e não treinar.
3. **[Soup](https://github.com/MakazhanAlpamys/Soup)** (o Show HN desta semana): um CLI de um comando — `soup init --template chat && soup train` — que lida com tamanho de lote, detecção de GPU e quantização automaticamente. Ele até executa funções de perda de preferência (DPO, ORPO, SimPO, KTO) via *layer streaming*: o modelo base congelado nunca entra totalmente na VRAM, e é assim que ele consegue fazer um fine-tune de 8B caber em 4GB.

Se você quer o caminho mais rápido para um modelo funcional, comece com Unsloth ou Soup. Se você quer entender o que está acontecendo, comece com PEFT + TRL.

## Passo a passo: QLoRA em uma GPU de consumidor

Esta receita assume um modelo base de 7-8B (Qwen2.5-7B ou Llama-3.1-8B) e 8GB de VRAM; ajuste os números para baixo no caso de 4GB (base menor, rank 8, sequências mais curtas).

**1. Escolha seu modelo base.** Para a maioria dos trabalhos de domínio, um modelo instruct de 7-8B quantizado é o trade-off certo. Se você precisa de um idioma que o modelo base mal conhece, considere um modelo multilíngue como ponto de partida.

**2. Prepare seu dataset.** Você precisa de pares no estilo instrução: prompt, resposta e, opcionalmente, um system prompt. Algumas centenas de exemplos de alta qualidade já fazem a diferença para adaptação de estilo/domínio; milhares são melhores para transferência de capacidades. Formate como JSONL com `{"instruction": ..., "output": ...}` e carregue-o com a biblioteca `datasets`. Seus próprios dados superam qualquer dataset público para trabalho de domínio — esse é o objetivo do fine-tuning versus prompting.

**3. Configure o adaptador.** Use o `LoraConfig` do PEFT com `r=16`, `alpha=32`, `target_modules` cobrindo as projeções de atenção e MLP, e `quantization_config` com `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")`.

**4. Treine com as flags de economia de memória.** O conjunto inegociável:
- `gradient_checkpointing=True` — recalcula as ativações em vez de armazená-las (o maior economizador de VRAM)
- `per_device_train_batch_size=1` — deixe o acúmulo de gradientes (`gradient_accumulation_steps=8-16`) recuperar o tamanho efetivo do lote
- `bf16=True` (ou `fp16` em placas mais antigas)
- `optim="paged_adamw_8bit"` — o otimizador paginado do QLoRA transfere os estados do otimizador para a RAM da CPU quando a VRAM acaba
- `max_seq_length` tão curto quanto seus dados permitirem (512-2048) — o comprimento da sequência multiplica a memória de ativações

**5. Treine.** Algumas centenas de passos em uma única GPU levam de 1 a 4 horas para um modelo 7B. Fique de olho na loss de validação; overfitting em um dataset pequeno aparece rápido.

**6. Faça merge e exporte.** Após o treinamento, faça merge do adaptador LoRA de volta aos pesos base (`model.merge_and_unload()`) e salve em GGUF se planeja executá-lo com o llama.cpp.

## O que você consegue treinar de fato (expectativas)

| VRAM | O que cabe | Resultado realista |
|------|-----------|-------------------|
| 4 GB | Modelo 1-3B, QLoRA, rank 8-16 | Adaptação de estilo/domínio em datasets pequenos; várias horas por execução |
| 6-8 GB | Modelo 7-8B, QLoRA, rank 8-16, sequências curtas | O ponto ideal para placas de consumidor — a maior parte deste guia |
| 12 GB | Modelo 7-8B, QLoRA com contextos mais longos, ou rank 32+ | Execuções confortáveis, iteração mais rápida |
| 24 GB | Modelos 13-14B, ou fine-tunes completos de modelos pequenos | Aproximando-se do ponto em que o fine-tuning completo se torna viável |

Em termos de tempo, espere de 1 a 4 horas por execução em uma GPU de consumidor de médio porte para um fine-tune QLoRA de 7B. É rápido o suficiente para iterar, e lento o suficiente para que você valide seu dataset antes de iniciar.

## Quando NÃO fazer fine-tuning

Fine-tuning é um martelo, e nem todo problema é um prego. Se você precisa que seu modelo saiba fatos de uma coleção de documentos, [geração aumentada por recuperação (RAG)]({{< relref "posts/vibe-coding-pitfalls/" >}}) ou um prompt de contexto longo vai te levar até lá com zero treinamento. Se você precisa de um formato de saída específico, prompting estruturado e esquemas de saída geralmente são suficientes. O fine-tuning justifica seu custo quando:

- O **estilo e a voz** importam — tom de suporte, linguagem jurídica, os padrões idiomáticos do seu código
- O modelo base **falha sistematicamente** na sua tarefa, e exemplos corrigem isso
- Você precisa de **latência e privacidade** — um pequeno modelo ajustado no seu próprio hardware vence uma chamada de API

Uma heurística útil: se algumas dezenas de exemplos bem elaborados em um prompt não fizerem a diferença, o fine-tuning com centenas ou milhares de exemplos fará.

## Conclusão

Fine-tuning em hardware de consumidor deixou de ser exótico no momento em que o QLoRA foi lançado em 2023 — o que mudou até 2026 é que as ferramentas tornaram isso trivial. Você não precisa mais criar configurações de quantização manualmente nem brigar com o SSH para acessar uma máquina alugada; ferramentas de um comando como Unsloth e Soup são construídas sobre a mesma base PEFT/TRL e cuidam de toda a infraestrutura. A habilidade restante é trabalho de dados, não trabalho de GPU.

Se você já está rodando inferência local em uma placa com pouca VRAM, o mesmo hardware quase certamente também consegue treinar um modelo pequeno. E se você está virtualizando GPUs no seu homelab, lembre-se de que você precisa de [GPU passthrough]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) para expor a placa para a VM de treinamento.

Leia também:

- [Por que estou terminando com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [KVM e Virsh no Linux: Guia Completo de Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [Por que estou terminando com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
