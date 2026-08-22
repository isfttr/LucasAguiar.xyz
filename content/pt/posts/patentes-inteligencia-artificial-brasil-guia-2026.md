---
date: 2026-07-30T11:00:00-03:00
draft: false
title: "Patentes de Inteligência Artificial no Brasil: Guia Completo sobre Proteção de Invenções de IA [2026]"
description: "Guia completo sobre patentear inteligência artificial no Brasil: o que é patenteável, requisitos do INPI, classificações IPC, como redigir o pedido e diferenças entre software, algoritmo e invenção de IA. Inclui dados WIPO 2026."
featured_image: ""
categories:
  - article
tags:
  - patentes
  - inpi
  - inteligencia-artificial
  - wipo
  - inovacao
  - guia
  - tecnologia
---
Este guia aborda os requisitos legais, as posições do INPI, as classificações internacionais relevantes, o passo a passo do depósito e as diferenças entre proteger um algoritmo, um modelo de IA e uma aplicação concreta.

---

## O que a LPI diz sobre patentes de IA

A Lei da Propriedade Industrial (Lei nº 9.279/96) não menciona explicitamente inteligência artificial — o que é esperado, dado que a lei é de 1996. Mas define no Art. 10 o que **não** é considerado invenção:

> Art. 10. Não se considera invenção nem modelo de utilidade: \
> I — descobertas, teorias científicas e métodos matemáticos; \
> II — concepções puramente abstratas;\
> III — esquemas, planos, princípios ou métodos comerciais, contábeis, financeiros, educativos, publicitários, de sorteio e de fiscalização;\
> IV — as obras literárias, arquitetônicas, artísticas e científicas ou qualquer criação estética;\
> V — programas de computação em si;\
> VI — a apresentação de informações;\
> VII — regras de jogo;\
> VIII — técnicas e métodos operatórios ou cirúrgicos, bem como métodos terapêuticos ou de diagnóstico, para aplicação no corpo humano ou animal;\
> IX — o todo ou parte de seres vivos naturais e materiais biológicos encontrados na natureza, ou ainda dela isolados, inclusive o genoma ou germoplasma de qualquer ser vivo natural e os processos biológicos naturais.

Os dois incisos mais relevantes para IA são:

- **Inciso I (métodos matemáticos):** Modelos de IA são, em sua essência, construções matemáticas. Um classificador, uma rede neural, um transformador — são funções matemáticas que mapeiam entradas em saídas. Sozinhos, não são patenteáveis.
- **Inciso V (programas de computador em si):** Um modelo de IA implementado como software, sem aplicação técnica concreta, é equiparado a programa de computador e protegido pela Lei de Software (Lei nº 9.609/98), não por patente.

**A chave está em como a invenção é apresentada.** Se o pedido reivindica apenas o método matemático ou o algoritmo abstrato, o INPI o considera não patenteável. Se a invenção resolve um **problema técnico concreto** por meio de uma aplicação de IA — e essa aplicação tem efeito técnico, não meramente matemático —, há possibilidade de proteção por patente.

| Tipo de reivindicação | Patenteável? | Exemplo |
|----------------------|-------------|---------|
| Método matemático puro (equação, função abstrata) | Não | Um novo algoritmo de otimização descrito matematicamente |
| Algoritmo de IA como programa de computador isolado | Não | Um modelo de linguagem treinado, sem aplicação específica |
| Método de IA aplicado a problema técnico | Sim, se atender aos requisitos | Sistema de visão computacional para inspeção industrial |
| Dispositivo físico que implementa IA | Sim | Chip especializado para inferência de redes neurais |
| Método de treinamento com efeito técnico | Sim, em alguns casos | Técnica de treinamento que reduz uso de memória em GPU |
| Sistema IA + hardware específico | Sim | Robô autônomo com controle baseado em aprendizado por reforço |

---

## O que o INPI considera patenteável em IA

O INPI não possui uma diretriz específica e consolidada para patentes de inteligência artificial (diferentemente do EPO e do USPTO, que já publicaram orientações). No entanto, o exame segue os critérios gerais da LPI e os precedentes da Diretriz de Exame de Patentes vigente:

### 1. Aplicação técnica concreta

O requisito mais importante é demonstrar que a invenção resolve um **problema técnico** por meios técnicos. Uma rede neural que classifica imagens de raios-X para diagnóstico médico é uma aplicação técnica? Depende — se o pedido descreve o método de classificação como uma ferramenta auxiliar ao médico, sem reivindicar método diagnóstico, pode ser patenteável do ponto de vista técnico, mas atenção à restrição do Art. 10, VIII (métodos terapêuticos e de diagnóstico).

Exemplos de aplicações técnicas que o INPI tende a aceitar:

- **Visão computacional industrial:** Sistema de inspeção de qualidade em linha de produção usando aprendizado profundo
- **Processamento de sinais:** Método de compressão de áudio baseado em redes neurais
- **Controle de processos:** Algoritmo de controle preditivo para reator químico usando aprendizado por reforço
- **Comunicação:** Técnica de codificação/decodificação de canal usando IA (classificação H04 — Técnica de Comunicação Elétrica)
- **Otimização de hardware:** Método de gerenciamento de energia em processador usando inferência de IA

### 2. Atividade inventiva

A INPI exige que a invenção não seja óbvia para um técnico no assunto. Em IA, isso é particularmente desafiador porque:

- O uso de redes neurais para problemas de classificação é amplamente conhecido
- Arquiteturas padrão (CNN, Transformer, LSTM) são estado da técnica
- A mera substituição de um algoritmo clássico por um modelo de IA treinado, sem adaptação substancial, pode ser considerada óbvia

Para superar esse obstáculo, o pedido deve destacar:

- Adaptações específicas da arquitetura ao problema técnico
- Técnicas de treinamento não triviais
- Ganhos mensuráveis de desempenho (precisão, latency, consumo de recursos)
- Limitações técnicas superadas (ex.: redução de complexidade computacional)

### 3. Suficiência de descrição

O INPI exige que o pedido descreva a invenção de forma suficientemente clara e completa para que um técnico no assunto possa realizá-la. Em invenções de IA, isso significa:

- Descrever a arquitetura do modelo (camadas, parâmetros, função de ativação)
- Explicar o método de treinamento (dados, hiperparâmetros, função de perda)
- Apresentar resultados experimentais que comprovem a eficácia
- Descrever a implementação computacional (hardware, software, plataforma)
- Incluir diagramas de blocos do sistema

> A falta de detalhes sobre o treinamento ou a ausência de dados experimentais são as causas mais comuns de exigências técnicas (código 6.23) em pedidos de patente de IA no INPI.

---

## Classificação IPC de patentes de IA

A Classificação Internacional de Patentes (IPC) é o [sistema usado pelo INPI](https://ipc.inpi.gov.br/classifications/ipc/ipcpub/?notion=scheme&version=20260101&symbol=none&menulang=pt&lang=pt&viewmode=f&fipcpc=no&showdeleted=yes&indexes=no&headings=yes&notes=yes&direction=o2n&initial=A&cwid=none&tree=no&searchmode=smart) para categorizar os pedidos. Invenções de IA geralmente se enquadram nas seguintes seções:

| Código IPC | Descrição | Exemplo de aplicação |
|-----------|-----------|---------------------|
| **G06N** 3/00–20/00 | Sistemas baseados em modelos computacionais | Redes neurais, aprendizado de máquina, deep learning |
| **G06N** 5/00–7/00 | Sistemas baseados em conhecimento | Sistemas especialistas, raciocínio probabilístico |
| **G06V** 10/00–40/00 | Reconhecimento de imagens e vídeo | Visão computacional, detecção de objetos |
| **G10L** 15/00–25/00 | Processamento de fala | Reconhecimento de voz, síntese de fala |
| **G06F** 40/00–40/58 | Processamento de linguagem natural | Análise textual, tradução automática |
| **H04L** 9/00–67/00 | Comunicação digital | Segurança de rede, otimização de tráfego com IA |
| **B25J** 9/16 | Robótica controlada por computador | Controle de robôs com aprendizado |

A WIPO utiliza classificações IPC e CPC combinadas para definir o que conta como "patente de IA" em seus relatórios Technology Trends. Se você está fazendo busca de anterioridade, usar esses códigos no sistema de [busca de patentes do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes/busca) é mais preciso que palavras-chave.

---

## Passo a passo: como depositar um pedido de patente de IA

### 1. Busca de anterioridade

Antes de redigir o pedido, realize uma busca nos bancos de patentes para verificar se a invenção já é conhecida. Use preferencialmente os códigos IPC da seção anterior combinados com palavras-chave.

Fontes recomendadas:

- [INPI — Busca de Patentes](https://www.gov.br/inpi/pt-br/servicos/patentes/busca)
- [PATENTSCOPE (WIPO)](https://patentscope.wipo.int/)
- [Espacenet (EPO)](https://worldwide.espacenet.com/)
- [Google Patents](https://patents.google.com/)

Consulte também a [página de patentes do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes) para informações oficiais sobre os sistemas de busca.

### 2. Redação do pedido

A estrutura do pedido segue o formato padrão do INPI, mas com atenção especial aos seguintes pontos:

**Relatório descritivo:**
- Campo da invenção (ex.: "A presente invenção refere-se a um método de inspeção industrial baseado em visão computacional...")
- Estado da técnica (descrever soluções existentes e suas limitações)
- Descrição detalhada da arquitetura de IA (com diagramas)
- Descrição do treinamento (dataset, hiperparâmetros, métricas)
- Exemplos de implementação (código, hardware, resultados)
- Figuras (diagramas de blocos, gráficos de desempenho, arquitetura do modelo)

**Reivindicações:**

| Tipo | Descrição | Estratégia |
|------|-----------|-----------|
| Independente de sistema | Dispositivo ou sistema que implementa a IA | Mais forte, inclui hardware + software |
| Independente de método | Método executado por computador | Boa para processos, mas exige caráter técnico |
| Dependente | Características adicionais | Detalha aspectos específicos (dados de treinamento, arquitetura) |
| De produto | Meio de armazenamento com instruções | Suporte adicional, mas sujeito a restrições |

**Exemplo de reivindicação de método (bem redigida):**

> "Método de inspeção de qualidade em linha de produção, caracterizado por compreender: (a) capturar imagens de produtos em uma esteira transportadora por meio de uma câmera industrial; (b) aplicar uma rede neural convolucional treinada para classificar cada imagem em uma de N classes de defeito; (c) gerar um sinal de rejeição quando a classe predita for diferente de 'sem defeito'; e (d) atuar um atuador pneumático para remover o produto classificado como defeituoso da esteira."

Esse será o método que terá que passar requisitos de patenteabilidade de novidade e atividade inventiva, além da aplicação industrial.

### 3. Depósito

O depósito é feito exclusivamente pelo [sistema e-Patentes do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes/patentes-eletronico). Os custos seguem a Tabela de Retribuições (Portaria INPI/PR nº 10/2025):

| Serviço | Valor (R$) |
|---------|-----------|
| Depósito de pedido de patente (pessoa física/ME/MEI/startup) | R$ 130,00 |
| Depósito de pedido de patente (pessoa jurídica) | R$ 255,00 |
| Depósito de pedido de patente (grande empresa) | R$ 2.500,00 |
| Exame de patente | R$ 490,00 (PF/ME) a R$ 3.200,00 (grande empresa) |

Consulte a [página oficial de patentes do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes) para instruções atualizadas sobre o depósito eletrônico.

### 4. Acompanhamento

Acompanhe o andamento pela RPI (Revista da Propriedade Industrial) e pelo sistema e-Patentes. Consulte o guia [Como Consultar o Andamento de um Processo no INPI]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}}) para instruções detalhadas.

---

## Trâmite prioritário para patentes de IA

O INPI oferece diversas modalidades de trâmite prioritário que podem beneficiar pedidos de patente de IA:

| Modalidade | Público-alvo | Custo |
|-----------|-------------|-------|
| Depositante idoso | Pessoa física ≥ 60 anos | Gratuito |
| Pessoa com deficiência | PF com deficiência | Gratuito |
| Doença grave | PF com doença grave | Gratuito |
| Startup | Empresa enquadrada como startup | Gratuito |
| PPH (Patent Prosecution Highway) | Pedidos com parecer favorável no exterior | Gratuito |
| H04 (Técnica de Comunicação Elétrica) | Pedidos na classificação H04 | Gratuito |

Em julho de 2026, o INPI retomou o trâmite prioritário para a classificação **H04** (Técnica de Comunicação Elétrica), que abrange diversas invenções de IA aplicadas a telecomunicações e redes. Cada depositante pode solicitar 1 pedido prioritário por mês nessa modalidade. Consulte a [página de trâmite prioritário do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes/tramite-prioritario) para detalhes completos das 17 modalidades disponíveis.

---

## Perspectiva internacional

Diferentes escritórios de patentes adotam abordagens distintas para IA:

| Escritório | Posição sobre IA | Diretrizes específicas |
|-----------|-----------------|----------------------|
| **EPO (Europeu)** | Exige "caráter técnico" — a IA deve contribuir para solução de problema técnico | Diretrizes G-II, 3.3 (2024) — exclui métodos matemáticos e programas de computador como tais |
| **USPTO (EUA)** | Mais permissivo — aceita métodos implementados em computador se não forem "abstract ideas" | 2019 Revised Patent Subject Matter Eligibility Guidance + exemplos de IA |
| **INPI (Brasil)** | Segue a LPI — exige aplicação técnica concreta; sem diretriz específica de IA | Diretriz de Exame geral + precedentes do Manual de Patentes |
| **JPO (Japão)** | Aceita IA como invenção se houver interação com hardware | Examination Guidelines for AI-related Inventions (rev. 2023) |
| **CIPO (China)** | Aceita amplamente — China é o maior depositante de patentes de IA do mundo | Examination Guidelines Part II, Chapter 9 (2024) |

A WIPO lançou em junho de 2026 o [Artificial Intelligence Infrastructure Interchange (AIII)]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}}), um fórum global para debater os padrões técnicos de interoperabilidade entre IA e propriedade intelectual. O AIII reúne mais de 90 especialistas de dezenas de países e sinaliza que a harmonização das regras de patenteamento de IA está na agenda internacional.

---

## O que NÃO patenteável em IA (armadilhas comuns)

| Situação | Problema | Solução |
|----------|----------|---------|
| "Método de classificação usando rede neural" sem aplicação específica | Método matemático puro (Art. 10, I) | Especificar a aplicação técnica concreta |
| "Programa de computador que implementa IA" sem hardware | Programa de computador em si (Art. 10, V) | Descrever sistema com hardware + interação técnica |
| "Método de recomendação de conteúdo" para usuários | Método comercial/educativo (Art. 10, III) | Reformular como problema técnico de otimização de sistema |
| "Sistema de diagnóstico médico com IA" | Método de diagnóstico (Art. 10, VIII) | Limitar a método auxiliar, sem reivindicar diagnóstico |
| "Modelo de IA treinado" sem detalhes de treinamento | Insuficiência descritiva | Incluir dados de treinamento, hiperparâmetros, resultados |

---

## Conclusão

O patenteamento de inteligência artificial no Brasil é perfeitamente possível, desde que o pedido seja estruturado para demonstrar aplicação técnica concreta, atividade inventiva e suficiência de descrição. O INPI examina pedidos de IA pelos mesmos critérios gerais da LPI — não há regra especial, mas também não há barreira intransponível.

Com o crescimento explosivo das patentes GenAI globais (37,8 mil famílias em 2025, segundo a WIPO), proteger invenções de IA no Brasil não é apenas uma questão de estratégia empresarial — é uma necessidade para quem quer competir no mercado de tecnologia mais dinâmico da história.

A dica mais importante: **não tente patentear o algoritmo abstrato.** Patentee a aplicação técnica que resolve um problema real. O hardware, o contexto industrial e o efeito técnico mensurável são o que transformam uma ideia matemática em uma invenção protegível.

Leia também:

- [Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})
- [WIPO lança Artificial Intelligence Infrastructure Interchange: o novo fórum global para IA e Propriedade Intelectual]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}})
- [Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
