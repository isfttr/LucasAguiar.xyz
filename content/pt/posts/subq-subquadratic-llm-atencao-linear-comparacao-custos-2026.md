---
date: 2026-07-07T18:00:00-03:00
draft: true
title: "SubQ: O Primeiro LLM Totalmente Subquadrático — Comparação de Custos com Transformers [2026]"
description: "SubQ usa atenção esparsa subquadrática (SSA) para escalar linearmente com o contexto: 64x menos FLOPs que Transformers em 1M tokens. Análise de arquitetura, benchmarks e custos."
featured_image: ""
categories:
  - article
tags:
  - ia
  - llm
  - transformers
  - subquadratic
  - atencao
  - arquitetura
  - custos
  - inovacao
---

Há um problema fundamental em todos os grandes modelos de linguagem que você usa hoje — e ele tem a ver com matemática do ensino médio.

O coração do Transformer é a **atenção**: cada token precisa se comparar com todos os outros tokens. Um texto de 1.000 palavras exige 1 milhão de comparações (1.000²). Um texto de 1 milhão de tokens exige **1 trilhão de comparações**. O custo computacional cresce com o **quadrado do contexto** — O(n²). É a razão pela qual modelos "quebram" com entradas muito longas, pela qual usamos RAG, chunking e agentes em vez de simplesmente dar o documento inteiro para o modelo.

**SubQ**, desenvolvido pela **Subquadratic AI**, é o primeiro LLM a quebrar essa barreira de forma prática. Sua arquitetura de **Atenção Esparsa Subquadrática (SSA)** escala linearmente — O(n) — com o comprimento do contexto. O resultado: **64,5× menos FLOPs** e **56× mais rápido** que a atenção densa em contextos de 1 milhão de tokens. Com capacidade comprovada de recuperação em até **12 milhões de tokens**.

## O que é SubQ?

SubQ é um modelo de linguagem construído sobre **Subquadratic Sparse Attention (SSA)**, uma reformulação completa de como a atenção funciona. Em vez de comparar cada token com todos os outros (O(n²)), o SSA usa um **mecanismo de roteamento esparso aprendido** que identifica seletivamente quais pares de tokens são relevantes — e ignora o restante.

| Característica | Descrição |
|---|---|
| **Arquitetura** | Subquadratic Sparse Attention (SSA) |
| **Escalonamento** | O(n) — linear com o contexto |
| **Contexto de treino** | Até 2M de tokens |
| **Contexto em inferência** | Até 12M de tokens (98% de acurácia) |
| **Empresa** | Subquadratic AI |
| **Funding** | $29M seed (Javier Villamizar, JAM Fund, etc.) |
| **Equipe** | Pesquisadores de Meta, Google, Oxford, Cambridge, BYU |
| **Modelo atual** | SubQ 1.1 Small |
| **Disponibilidade** | Beta privado (API, SubQ Code, SubQ Search) |

O modelo parte de pesos abertos de fronteira, substitui a atenção densa por SSA, e passa por continuação de pré-treino (CPT) em ~1 trilhão de tokens de artefatos longos naturais (livros, documentos, repositórios de código).

## Comparação de Arquiteturas

A tabela abaixo mostra onde o SubQ se encaixa no espectro de arquiteturas de modelos de linguagem:

| Arquitetura | Escalonamento | Recuperação por Conteúdo | Treino Ultra-Longo |
|---|---|---|---|
| **Atenção Densa (FlashAttention-2)** | O(n²) | Completa | Inviável |
| **SubQ (SSA)** | **O(n)** | ✅ Roteamento esparso aprendido | ✅ Prático |
| **Sparsa Fixa (Sliding Window, etc.)** | O(n) | Apenas por posição | ✅ |
| **DeepSeek NSA/CSA** | O(n²) indexador + O(n) atenção | ✅ Aprendido | Indexador quadrático domina |
| **State-Space (Mamba)** | O(n) | Comprimida (sem acesso direto) | ✅ |
| **Híbrido (Jamba, Qwen3 Next)** | O(n)+O(n²) | Parcial | Componente quadrático domina |
| **RAG/Agentes (solução externa)** | N/A (via busca) | Via recuperação externa | ✅ (workaround) |

A diferença crucial: SubQ é o primeiro a combinar **O(n) end-to-end** (incluindo seleção e indexação) com **recuperação dependente de conteúdo** e **acesso a posições arbitrárias** — algo que modelos como Mamba (que comprimem o contexto em um estado de tamanho fixo) não conseguem fazer.

## Custos: SubQ vs. Transformers

### FLOPs por Camada de Atenção

A vantagem computacional do SSA cresce dramaticamente com o contexto:

| Contexto | Atenção Densa (FLOPs) | SSA (FLOPs) | Redução | Aceleração Real |
|---|---|---|---|---|
| 32K | 0.25 PFLOP | 0.12 PFLOP | 2,1× | ~paridade |
| 128K | 3.9 PFLOP | 0.49 PFLOP | **8,0×** | **6,88×** |
| 256K | 15.8 PFLOP | 0.99 PFLOP | **16×** | **13,51×** |
| 512K | 63.0 PFLOP | 2.0 PFLOP | **31,5×** | **27,54×** |
| **1M** | **252 PFLOP** | **3.9 PFLOP** | **64,5×** | **56,2×** |

*Medido em H100 (FLOPs) e NVIDIA B200 (wall clock).*

A 12 milhões de tokens, o SSA atende a apenas **0,13% de todos os pares de tokens** — a redução chega a ~**1.000×** em relação à atenção densa.

### O Problema da Parede Quadrática

Para contextualizar, veja como o custo da atenção densa explode:

- 128K tokens: **8,6 bilhões** de operações por camada — tolerável
- 1M tokens: **549 bilhões** de operações — caro
- 2M tokens: **2,2 trilhões** de operações — proibitivo
- 12M tokens: impraticável

> O FlashAttention resolveu o **problema de memória** da atenção quadrática. O SSA resolve o **problema de computação**.

### Impacto em Treinamento

O maior benefício de custo do SSA pode estar em **P&D**, não apenas em inferência:

- A equipe da Subquadratic executou **mais de 100 experimentos** de contexto longo em 6 gerações de modelos — algo impossível sob atenção densa
- Iteração de treino em **menos de 1 minuto por passo** em contextos de 1M de tokens
- Isso permitiu buscar receitas ótimas de treinamento empiricamente, em vez de chutar

### Impacto em Inferência

- **56× de speedup** em wall clock vs. FlashAttention-2 a 1M tokens (camada única)
- O speedup cresce com o contexto: 6,88× a 128K → 56,2× a 1M
- "SubQ melhora tudo de uma vez. Não incrementalmente, mas em uma ordem de grandeza que torna milhões de tokens de contexto uma realidade prática." — Justin Dangel, CEO da Subquadratic

## Benchmarks de Performance

### Precisão em Contexto Longo

| Benchmark | SubQ 1.1 Small | Notas |
|---|---|---|
| RULER (128K) — média 13 tarefas | **99,12%** | Quase saturado |
| NIAH @ 1M tokens | **100%** | Recuperação perfeita |
| NIAH @ 2M tokens | **100%** | Dentro da janela de treino |
| NIAH @ 6M tokens | **98%** | 6× o tamanho de treino |
| NIAH @ 12M tokens | **98%** | 12× o tamanho de treino |
| MRCR 8 agulhas @ 1M | **86,2%** | Nível mais difícil |

### Raciocínio e Conhecimento

| Benchmark | SubQ 1.1 Small | GPT-5.5 | Opus 4.8 | Sonnet 4.6 |
|---|---|---|---|---|
| GPQA Diamond (pass@1) | **85,4** | 93,2 | 92 | 87,5 |
| LiveCodeBench v6 (pass@4) | **89,7** | 92 | 92,2 | 88,9 |
| SWE-Bench Verified | **81,8%** | — | — | — |

O SubQ 1.1 Small compete com modelos muito maiores em raciocínio, enquanto usa uma fração do compute por token de contexto.

## A Parede Quadrática dos Transformers em Números

O problema não é apenas teórico. A indústria gasta bilhões em **workarounds** — RAG, chunking, sumarização em pipeline, agentes — porque a arquitetura Transformer não consegue processar o que importa de uma vez. Cada workaround adiciona latência, complexidade e perda de informação.

Em 128K tokens, um Transformer já consome 8,6B operações por camada de atenção. A 1M de tokens, são 549B. A 2M, 2,2 trilhões. A conta simplesmente não fecha para aplicações que exigem contexto longo real — análise de codebases inteiros, revisão de documentos jurídicos extensos, processamento de históricos longos de conversa.

SubQ demonstra que essa barreira pode ser superada com uma abordagem arquitetural — não com mais hardware ou engenharia de prompt.

## Disponibilidade

- **API SubQ:** disponível em beta privado via subq.ai
- **SubQ Code:** CLI que carrega repositórios inteiros em uma única janela de contexto
- **SubQ Search:** ferramenta de busca long-context (Deep Research em velocidade de chatbot)
- **Preço:** ainda não divulgado publicamente
- **Lançamento geral:** previsão para o final de 2026

A empresa levantou **$29M em seed** e afirma ter modelos planejados de 2M a 12M de tokens para lançamento geral.

## Fontes

- [Subquadratic AI — Introducing SubQ](https://subq.ai/introducing-subq)
- [SubQ 1.1 Small — Technical Report (PDF)](https://subq.ai/docs/subq-1-1-small-model-card.pdf)
- [How SSA Makes Long Context Practical](https://subq.ai/how-ssa-makes-long-context-practical)
- [Appen — Independent Benchmark Evaluation](https://www.appen.com/whitepapers/subquadratic-preview-model-benchmark-evaluation)
- [The New Stack — "12-million-token context window"](https://thenewstack.io/subquadratic-12-million-context-window/)
- [Hacker News — Discussão 132 pontos](https://news.ycombinator.com/item?id=48556163)
- [Vídeo: "AI is cooked …" (Pooja Dutt, YouTube)](https://youtube.com/shorts/LTxGxL6an7g)
- [Subquadratic no X/Twitter](https://x.com/subquadratic)
- [NVIDIA nvSubquadratic (GitHub)](https://github.com/NVIDIA-BioNeMo/nvSubquadratic)

## Leia também

- [Claude Code: Review Completo do CLI de Programação com IA]({{< relref "posts/claude-code-review-cli-ia/" >}})
- [GitButler: O Gerenciador de Branchs que Você Não Sabia que Precisava]({{< relref "posts/gitbutler-gerenciador-branchs-review/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
