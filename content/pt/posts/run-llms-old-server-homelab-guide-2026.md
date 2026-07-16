---
date: 2026-07-15T18:05:00.000Z
draft: true
title: 'Como Executar LLMs em Hardware de Servidor Antigo: Um Guia Prático para Homelab [2026]'
description: Guia passo a passo para executar LLMs modernos em servidores empresariais antigos/usados sem GPU. Escolhas de hardware, pilha de software, desempenho esperado e comparação de custos com APIs de nuvem.
featured_image: ''
categories:
  - article
tags:
  - llm
  - homelab
  - selfhosted
  - inference
  - linux
slug: executar-llms-servidor-antigo-guia-pratico-homelab
translation_source_hash: 36ea0ceb5e2d81239cbeded8e2398764fb90296e8b583a6bb09536da3162fa5d
---
Você tem um servidor antigo acumulando poeira na garagem — um PowerEdge aposentado, um nó Proxmox reutilizado, talvez uma workstation HP de 2013. Alguém lhe disse que para rodar IA localmente é necessário uma NVIDIA H100 ou pelo menos uma RTX 4090. Isso não é verdade.

Rodar LLMs modernos em equipamentos empresariais antigos, sem GPU, não só é possível — é prático. Este guia aborda o hardware necessário, a pilha de software que faz isso funcionar, números de desempenho reais por geração de CPU e a matemática de custos que prova que uma caixa de $300 no porão supera uma conta de nuvem de $1.500/mês para muitas cargas de trabalho.

## Por que hardware antigo funciona para inferência

Modelos de linguagem grandes são limitados pela largura de banda da memória durante a inferência, não pelo poder de processamento. O gargalo é mover os pesos da RAM para a CPU, não a matemática em si. Esta é a percepção chave: um Xeon de 13 anos com oito canais DDR3 pode alimentar dados para a CPU aproximadamente na mesma taxa que um laptop moderno.

Por exemplo, um sistema dual Xeon E5-2690 v2 (2013, Ivy Bridge) com DDR3-1600 tem uma largura de banda teórica de memória de ~102 GB/s em oito canais. Um modelo de 26B parâmetros quantizado para Q8_0 (aproximadamente 26 GB de pesos) leva cerca de 0,25 segundos por passagem apenas para mover os dados para a CPU. Isso por si só explica por que você obtém ~4-5 tokens por segundo — a CPU está esperando pela RAM, não pela sua própria velocidade de clock.

Você não precisa de uma GPU. Você não precisa de uma CPU moderna. Você precisa de uma placa com canais de memória suficientes e RAM suficiente para armazenar o modelo.

## Requisitos de hardware

### Especificações mínimas

| Componente | Mínimo | Recomendado |
|-----------|---------|-------------|
| CPU | Dual Xeon E5 v2 (Ivy Bridge) ou mais recente | Dual Xeon E5 v3/v4 (Haswell/Broadwell) |
| Conjuntos de instruções | AVX1+ | AVX2, FMA3 (Haswell+, 2014) |
| RAM | 32 GB (para modelos 7B) | 64-128 GB (para modelos 13B-30B) |
| Tipo de RAM | DDR3-1333+ | DDR3-1600 ou DDR4 |
| Canais de memória | 4+ | 8+ (soquete duplo) |
| Armazenamento | 50 GB livres | NVMe SSD para swap/cache quente |
| GPU | Nenhuma necessária | Nenhuma necessária |

### Gerações de CPU e o que significam para LLMs

A característica de CPU mais importante para inferência local é o **AVX2**. Foi introduzido com Intel Haswell (2014, também conhecido como Xeon "v3"). Sem AVX2, os kernels otimizados no llama.cpp e seus forks não compilam ou rodam extremamente devagar. AVX2 é o piso que a maioria dos motores de inferência assume.

| Geração de CPU | Ano | AVX2? | Modelo 7B (tok/s) | Modelo 13B (tok/s) | MoE 26B (tok/s) | Observações |
|---------------|------|-------|-------------------|--------------------|---------------------|-------|
| Westmere (X56xx) | 2010 | Não | 1-3 | 0,5-1 | N/A | Não vale a pena |
| Sandy Bridge (E5 v1) | 2011 | Não | 3-5 | 1-2 | N/A | Marginal |
| Ivy Bridge (E5 v2) | 2013 | **Não** | 5-8 | 3-4 | ~5 (com patch) | Precisa de fork com patch |
| Haswell (E5 v3) | 2014 | **Sim** | 10-15 | 6-8 | 8-12 | Ponto ideal para orçamento |
| Broadwell (E5 v4) | 2016 | Sim | 12-18 | 8-10 | 10-15 | Melhor custo-benefício hoje |
| Skylake (Escalável) | 2017+ | Sim | 15-25 | 10-15 | 12-18 | Exagero para apenas inferência |

O melhor custo-benefício em 2026: um Dell PowerEdge R730 ou HP ProLiant DL380 Gen9 usado com dual E5-2690 v4 (Broadwell). Eles custam entre $200-400 no eBay, suportam até 768 GB DDR4 e têm 8+ canais de memória.

### Guia de dimensionamento de RAM

| Tamanho do Modelo | Quantização | Aprox. RAM Necessária | Uso Típico |
|-----------|-------------|-------------------|-------------|
| 7B | Q4_K_M | ~5 GB | Completar código, chat |
| 7B | Q8_0 | ~8 GB | Chat de melhor qualidade |
| 13B | Q4_K_M | ~9 GB | Raciocínio, escrita |
| 13B | Q8_0 | ~14 GB | Raciocínio de alta qualidade |
| 26B MoE | Q8_0 | ~15 GB (parâmetros ativos ~4B) | Tarefas complexas, análise |
| 30B | Q4_K_M | ~18 GB | Geração de código |
| 70B | Q4_K_M | ~42 GB | Raciocínio completo |
| 70B | Q8_0 | ~70 GB | Qualidade máxima |

Observe que modelos MoE (mistura de especialistas) como Gemma 4 26B ativam apenas ~4B parâmetros por token. Isso significa que eles cabem em muito menos RAM do que seu número total de parâmetros sugere, enquanto entregam qualidade próxima a um modelo denso de 26B.

## Pilha de Software

### Motor de Inferência: llama.cpp (ou forks)

[llama.cpp](https://github.com/ggerganov/llama.cpp) é a base. Ele roda em qualquer CPU, não usa GPU e suporta todos os principais formatos de modelo (GGUF). Forks principais:

| Fork | Melhor para | Observações |
|------|----------|-------------|
| llama.cpp (principal) | Uso geral, estável | Suporta a maioria dos modelos, AVX2+ |
| [ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp) | Modelos MoE (Gemma 4, DeepSeek) | Decodificação especulativa, roteamento MoE em CPU |
| ollama | Facilidade de uso, API | Encapsula llama.cpp, amigável com CLI |

### Quantização

Sempre use modelos quantizados (formato GGUF). A quantização reduz o tamanho do modelo em 2-4x com perda mínima de qualidade:

- **Q4_K_M** — Melhor relação qualidade/tamanho, ~4,5 bits por peso
- **Q5_K_M** — Qualidade superior, ~5,5 bits por peso, ~20% mais RAM
- **Q8_0** — Quase sem perdas, ~8 bits por peso, 2x RAM do Q4
- **IQ4_NL** — Bom para modelos 70B+, qualidade ligeiramente inferior

### Sistema Operacional

Qualquer distribuição Linux funciona. Proxmox (baseado em Debian) com contêineres LXC é uma excelente escolha — você pode alocar núcleos de CPU e RAM específicos para um contêiner de LLM sem dedicar o servidor inteiro.

## Passo a passo: Da compra no eBay até rodar um modelo

### Passo 1: Obtenha o hardware

Compre um servidor empresarial usado. Em 2026, as melhores opções são:

- **Dell PowerEdge R730** — Dual E5-2690 v4 (Broadwell), até 768 GB DDR4, 8 canais. ~$300-400 no eBay.
- **HP ProLiant DL380 Gen9** — Mesma geração, especificações semelhantes. ~$250-350.
- **Supermicro 6028U-TR4T+** — Soquete duplo, 16 slots DIMM. ~$200-300.

Pule a GPU. O BMC integrado (iDRAC/iLO) para gerenciamento remoto é mais útil.

### Passo 2: Instale o Linux

Instale uma distribuição de servidor mínima:

```bash
# Ubuntu Server 24.04 LTS — escolha segura, bom suporte de pacotes
# Proxmox VE 8.x — se quiser rodar LLM junto com outros serviços
# Debian 12 — se quiser sobrecarga mínima
```

Para Proxmox, crie um contêiner LXC não privilegiado com:

```bash
pct create 100 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
  --cores 16 --memory 65536 --swap 0 \
  --storage local-zfs --net0 name=eth0,bridge=vmbr0,ip=dhcp
```

### Passo 3: Instale o llama.cpp

```bash
# Instale dependências de compilação
apt update && apt install -y build-essential cmake git

# Clone e compile
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
cmake -B build -DLLAMA_CPU=ON
cmake --build build --config Release -j$(nproc)
```

Para CPUs pré-AVX2, use o fork ik_llama.cpp ou adicione `-DGGML_USE_IQK_MULMAT=OFF` no momento da compilação.

### Passo 4: Baixe um modelo

Escolha um modelo GGUF quantizado. O Hugging Face hospeda milhares:

```bash
# Instale huggingface-cli
pip install huggingface-hub

# Baixe Gemma 4 26B (MoE, ~15 GB em Q8_0)
huggingface-cli download \
  google/gemma-4-26b-it-GGUF \
  gemma-4-26b-it-Q8_0.gguf \
  --local-dir ./models

# Ou Mistral 7B (~4,5 GB em Q4_K_M)
huggingface-cli download \
  TheBloke/Mistral-7B-Instruct-v0.3-GGUF \
  mistral-7b-instruct-v0.3.Q4_K_M.gguf \
  --local-dir ./models
```

### Passo 5: Execute a inferência

```bash
# Modo de chat básico
./build/bin/llama-cli \
  -m ./models/gemma-4-26b-it-Q8_0.gguf \
  -p "Escreva um script Python curto para fazer backup de um diretório" \
  -n 512 \
  -t 8

# Modo servidor (fornece API compatível com OpenAI)
./build/bin/llama-server \
  -m ./models/mistral-7b-instruct-v0.3.Q4_K_M.gguf \
  --host 0.0.0.0 --port 8080 \
  -t 8 -c 4096
```

Assim que o servidor estiver rodando, você pode apontar qualquer cliente compatível com OpenAI (Open WebUI, Continue.dev, scripts personalizados) para `http://your-server:8080/v1`.

### Passo 6: Otimize as flags

| Flag | O que faz | Quando usar |
|------|-------------|-------------|
| `-t N` | Número de threads | N = núcleos físicos (não hyperthreads) |
| `-c N` | Tamanho do contexto | 2048-8192 para a maioria dos casos |
| `--mlock` | Travar modelo na RAM | Sempre use em hardware antigo |
| `--no-mmap` | Carregar modelo totalmente na RAM | Se for detectada interferência de swap |
| `-b N` | Tamanho do lote para avaliação do prompt | 512-2048 para CPU |

## Desempenho esperado por caso de uso

### Inferência em velocidade de leitura (5-10 tok/s)

Isso cobre modelos 7B em Ivy Bridge ou modelos 13B-26B em Haswell/Broadwell. Adequado para:
- Chatbots e respostas a perguntas
- Completar código com contexto pequeno a médio
- Sumarização de documentos (lote off-line)

### Inferência em velocidade interativa (10-20 tok/s)

Isso cobre modelos 7B em Broadwell ou 13B em Haswell+. Adequado para:
- Assistentes de codificação interativos (Continue.dev, alternativas ao Copilot)
- Chat em tempo real com contexto mais longo
- Fluxos de trabalho leves de agentes

### Inferência em velocidade de processamento em lote (20+ tok/s)

Isso cobre modelos 7B em Skylake+ ou hardware AVX-512. Adequado para:
- Processamento de documentos em grande escala
- Tradução ou classificação em massa
- Pipelines de conteúdo automatizados

## Comparação de custos: Caixa no porão vs. API na nuvem

A economia é evidente para qualquer pessoa que execute cargas de trabalho frequentes de inferência.

| Cenário | Servidor antigo (custo total) | API na nuvem (mensal) | Ponto de equilíbrio |
|----------|------------------------|---------------------|------------|
| Uso leve (100 consultas/dia, modelo 7B) | $300 únicos + ~$15/mês de eletricidade | $20-30/mês (GPT-4o-mini) | ~12 meses |
| Uso moderado (1K consultas/dia, modelo 13B) | $400 únicos + ~$25/mês de eletricidade | $150-200/mês (GPT-4o) | ~2-3 meses |
| Uso intenso (10K consultas/dia, modelo 26B) | $500 únicos + ~$40/mês de eletricidade | $1.500-2.500/mês | ~1-2 semanas |
| Processamento em lote (10M tokens/dia) | $500 únicos + ~$50/mês de eletricidade | $5.000+/mês (API em lote) | ~3 dias |

O custo de eletricidade assume $0,12/kWh e uma média de ~300W de idle a carga para um servidor de soquete duplo. A maioria dos servidores de homelab já roda 24/7 para outros serviços — o custo incremental de rodar inferência é insignificante.

## Limitações conhecidas

- **Sem aceleração de GPU:** Você não obterá 100+ tok/s. Tudo bem — a velocidade de leitura é tudo que você precisa para a maioria das tarefas.
- **Hardware pré-AVX2 precisa de compilações com patch:** Se sua CPU for mais antiga que Haswell (2014), você precisa do fork ik_llama.cpp ou compilar com `GGML_USE_IQK_MULMAT=OFF`. O [patch para fallback AVX1 em Ivy Bridge](https://github.com/ikawrakow/ik_llama.cpp/pull/2138) é uma referência funcional.
- **Largura de banda da memória é o gargalo:** Adicionar CPUs mais rápidas ajuda menos do que adicionar mais canais de memória. Uma placa de soquete duplo com 8 canais de DDR3-1600 geralmente supera uma placa de soquete único com 4 canais de DDR5 em taxa de transferência bruta de inferência.
- **Modelos 70B são possíveis, mas lentos:** Em dual Broadwell com 64 GB de DDR4, um 70B Q4_K_M roda a 2-3 tok/s. Funciona para trabalhos em lote, mas não para uso interativo.

## O que rodar no seu servidor antigo

| Carga de trabalho | Modelo recomendado | Hardware mínimo | Velocidade esperada |
|----------|-------------------|---------------|---------------|
| Assistente de codificação | DeepSeek Coder 6.7B Q4_K_M | Ivy Bridge | 8-12 tok/s |
| Chat geral | Gemma 4 26B Q8_0 (MoE) | Haswell | 8-12 tok/s |
| Análise de documentos | Mistral 7B Q8_0 | Sandy Bridge+ | 5-10 tok/s |
| Tradução | Gemma 4 9B Q8_0 | Ivy Bridge | 10-15 tok/s |
| Geração de código | Qwen 14B Q4_K_M | Haswell | 6-10 tok/s |
| Backend de agente | Llama 3.1 8B Q8_0 | Broadwell | 12-18 tok/s |

No mesmo mês em que este guia foi escrito, benchmarks independentes mostraram um [HP StoreVirtual de 13 anos rodando Gemma 4 26B a 5 tok/s](https://www.neomindlabs.com/2026/06/08/running-gemma-4-26b-at-5-tokens-sec-on-a-13-year-old-xeon-with-no-gpu/) com apenas um investimento de $300 em hardware e um [patch que adicionou fallback AVX1](https://github.com/ikawrakow/ik_llama.cpp/pull/2138) para silício anterior a Haswell. Se uma caixa de armazenamento reaproveitada pode fazer isso, seu servidor de homelab também pode.

Leia também:

- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Habilitando o WhatsApp no Hermes Agent self-hosted: três armadilhas (e como passei por elas)]({{< relref "posts/configuracao-whatsapp-hermes/" >}})

---

Você pode entrar em contato para falar sobre este e outros tópicos em <contact@lucasaguiar.xyz>
