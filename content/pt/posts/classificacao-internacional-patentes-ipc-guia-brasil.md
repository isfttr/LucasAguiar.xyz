---
date: 2026-07-16T11:00:00-03:00
draft: true
title: "Classificação Internacional de Patentes (IPC): Guia Prático para Entender e Usar Códigos de Patentes no Brasil [2026]"
description: "Guia completo da Classificação Internacional de Patentes (IPC): estrutura das seções A a H, subclasses e grupos, diferença entre IPC e CPC, como consultar classificações de patentes no INPI e exemplos práticos."
featured_image: ""
categories:
  - article
tags:
  - patentes
  - inpi
  - propriedade-intelectual
  - wipo
  - guia
  - classificacao
---

A Classificação Internacional de Patentes (IPC, do inglês *International Patent Classification*) é o sistema global de categorização de documentos de patente. Estabelecido pelo Acordo de Estrasburgo de 1971 e administrado pela Organização Mundial da Propriedade Intelectual (OMPI/WIPO), o IPC permite que examinadores, inventores e profissionais de PI identifiquem documentos técnicos relevantes em mais de 100 países.

No Brasil, o INPI utiliza o IPC como sistema primário de classificação de pedidos de patente. Quando o Instituto publicou em julho de 2026 a retomada do trâmite prioritário para o símbolo **H04** (Técnica de Comunicação Elétrica), estava se referindo exatamente a uma seção da IPC. Da mesma forma, os dados globais de patentes de inteligência artificial generativa divulgados pela WIPO em 2026 — que mostram que o número de famílias de patentes de GenAI saltou de 14 mil (2023) para 37,8 mil (2025) — usam a classificação IPC e CPC para definir o que é uma "patente de IA".

Este guia explica a estrutura da IPC, como os códigos são construídos, como consultar classificações de patentes no Brasil e como usar esse conhecimento para buscar anterioridade técnica.

## O que é a Classificação Internacional de Patentes

A IPC é uma hierarquia taxonômica que organiza toda a tecnologia em aproximadamente 70 mil subdivisões. Cada documento de patente recebe um ou mais códigos IPC que descrevem a área técnica à qual a invenção pertence.

O sistema tem duas funções principais:

1. **Recuperação de informação** — permite encontrar patentes sobre um tema técnico específico sem depender apenas de palavras-chave
2. **Organização do exame** — examinadores do INPI usam o IPC para direcionar cada pedido à área técnica competente

Ao contrário de palavras-chave textuais (que variam por idioma, sinônimos e traduções), o IPC é um código numérico hierárquico padronizado globalmente. Uma patente classificada como **H04L 9/40** será encontrada independentemente de o depositante usar os termos "segurança de rede", "network security" ou "sécurité réseau".

## Estrutura Hierárquica do IPC

O IPC tem cinco níveis hierárquicos, do mais geral ao mais específico:

```
Seção (1 letra)    →  H
Classe (2 números) →  H04
Subclasse (1 letra) →  H04L
Grupo principal     →  H04L 9/00
Subgrupo            →  H04L 9/40
```

### 1. Seções (A a H)

As oito seções cobrem todo o espectro tecnológico:

| Seção | Descrição | Exemplos de classificação |
|-------|-----------|--------------------------|
| **A** | Necessidades Humanas | Agricultura, saúde, alimentos |
| **B** | Operações de Processamento; Transporte | Separação, mistura, impressão |
| **C** | Química; Metalurgia | Compostos orgânicos, polímeros, farmoquímicos |
| **D** | Têxteis; Papel | Fiação, tecelagem, tratamento de papel |
| **E** | Construções Fixas | Edificações, estradas, portas |
| **F** | Engenharia Mecânica; Iluminação; Aquecimento; Armas; Explosão | Motores, bombas, turbinas |
| **G** | Física | Computação (G06), instrumentos de medição, criptografia |
| **H** | Eletricidade | Comunicação (H04), circuitos, energia elétrica |

### 2. Classe (2 dígitos)

Dentro de cada seção, as classes são identificadas por dois dígitos:

- **A01** — Agricultura; silvicultura; pecuária
- **C07** — Química orgânica
- **G06** — Computação; processamento de dados
- **H04** — Técnica de comunicação elétrica

### 3. Subclasse (1 letra)

A subclasse adiciona uma letra maiúscula:

- **H04L** — Transmissão de informação digital
- **G06N** — Sistemas computacionais baseados em modelos computacionais específicos (inclui IA e aprendizado de máquina)
- **A01H** — Novas plantas ou processos para obtê-las

### 4. Grupo (números, barra)

O grupo é identificado por um número de 1 a 3 dígitos, seguido de barra e um número de subgrupo:

- **H04L 9/00** — Arranjos para comunicação secreta ou segura
- **G06N 20/00** — Aprendizado de máquina
- **H04L 9/40** — Segurança de redes

## IPC vs. CPC: Entenda a Diferença

O **CPC (Cooperative Patent Classification)** é um sistema mais detalhado, desenvolvido em parceria pelo USPTO e EPO, e usado por mais de 40 escritórios, incluindo INPI em alguns contextos. O CPC expande o IPC com subdivisões adicionais.

| Característica | IPC | CPC |
|---|---|---|
| Administração | WIPO (OMPI) | USPTO + EPO |
| Número de entradas | ~70.000 | ~250.000 |
| Revisão | Anual (versão official) | Contínua |
| Uso no Brasil | Primário (INPI) | Secundário (aplicações PCT) |
| Cobertura | 100+ países | USPTO, EPO, INPI, outros |

Na prática, o CPC é um **superconjunto** do IPC: todo código IPC tem um equivalente CPC, mas o CPC adiciona subdivisões mais granulares.

Para buscas no INPI, o IPC é suficiente na maioria dos casos. Para buscas internacionais (USPTO, Espacenet), o CPC oferece resultados mais precisos.

## Como Consultar Classificações IPC no INPI

O INPI disponibiliza a consulta de classificações de patentes pelo seu sistema de busca, disponível no [site do INPI](https://www.gov.br/inpi/pt-br/servicos/patentes/guia-basico-de-classificacao-de-patentes). O passo a passo básico:

1. Acesse o **sistema de busca de patentes do INPI**
2. No campo de busca, utilize o formato `IC=(H04L 9/40)` para buscar por código IPC
   - `IC=` indica classificação IPC
   - Use aspas simples ou duplas quando o código contiver espaços
3. Para buscar todas as patentes de uma subclasse, use `IC=(H04L)` sem o grupo
4. Combine com outras estratégias: `IC=(G06N) AND PA=(UNIVERSIDADE)` para buscar patentes de IA de universidades

O INPI também publica a versão em português do IPC, chamada **Classificação Internacional de Patentes (CIP)**, baseada na tradução oficial da WIPO.

Para consultar a íntegra do IPC oficial (em inglês), utilize o [IPCR Master Classification File da WIPO](https://www.wipo.int/classifications/ipc/en/).

## Exemplos Práticos com as Notícias do Dia

### H04 — Técnica de Comunicação Elétrica

Em julho de 2026, o INPI retomou a recepção de requerimentos de trâmite prioritário para o símbolo **H04**, dentro de novas regras de cota por depositante. Isso significa que pedidos de patente classificados na seção H04 — que cobre telecomunicações, transmissão digital, redes, comunicação sem fio e codificação — podem novamente solicitar priorização.

Algumas subclasses relevantes de H04:

| Código | Descrição |
|--------|-----------|
| H04B | Transmissão |
| H04L | Transmissão de informação digital |
| H04W | Redes de comunicação sem fio |
| H04N | Transmissão de imagens; televisão |
| H04M | Comunicação telefônica |

Se você deposita patentes na área de telecomunicações, verifique se seu pedido está classificado em H04 e considere solicitar o trâmite prioritário. Veja o [guia completo de trâmite prioritário de patentes no INPI]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}}) para detalhes sobre custos, modalidades e documentos.

### G06 — Computação e Inteligência Artificial

A classificação **G06** (Computação; Processamento de Dados) é onde a maioria das patentes de inteligência artificial se concentra. Dentro dela, destacam-se:

| Código | Descrição |
|--------|-----------|
| G06N | Sistemas computacionais baseados em modelos específicos (IA, machine learning) |
| G06N 3/00 | Redes neurais |
| G06N 20/00 | Aprendizado de máquina |
| G06V | Reconhecimento de imagens e vídeo |
| G06F 40/00 | Processamento de linguagem natural |

Os dados da WIPO divulgados em julho de 2026 mostram que as famílias de patentes de IA generativa mais que duplicaram em dois anos. A maior parte dessas patentes está classificada em G06, com crescimento expressivo em G06N (modelos neurais) e G06F 40 (processamento de linguagem). Para um guia completo sobre patentes de IA no Brasil, consulte o [guia de patentes de inteligência artificial generativa]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}}).

### A01 — Agricultura

Patentes relacionadas a agricultura, biotecnologia vegetal e cultivares estão na seção **A01**:

| Código | Descrição |
|--------|-----------|
| A01H | Novas plantas ou processos para obtê-las |
| A01N | Conservação de corpos humanos, animais, vegetais ou produtos (biocidas) |
| A01G | Horticultura; cultivo |

O sistema de proteção de cultivares no Brasil, regulado pela Lei 9.456/97, é distinto do sistema de patentes e administrado pelo Ministério da Agricultura, não pelo INPI.

## Como o INPI Atribui Classificações IPC

O INPI segue as diretrizes da WIPO para classificação de patentes. Cada pedido de patente recebe:

1. **Classificação principal (invention information)** — a classificação que melhor descreve a invenção reivindicada
2. **Classificações adicionais (additional information)** — classificações para características técnicas secundárias ou conteúdos de busca

No momento do depósito, o depositante pode sugerir classificações, mas o INPI pode reclassificar o pedido durante o exame técnico, com base na análise do quadro reivindicatório.

Para quem faz a [busca de anterioridade]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}}) como profissional credenciado, entender a estrutura IPC é fundamental: uma busca mal direcionada por erros de classificação pode deixar de encontrar anterioridade relevante e comprometer o exame.

## Estratégias de Busca por IPC

### 1. Expanda para cima na hierarquia

Se uma busca no subgrupo H04L 9/40 retornar poucos resultados, expanda para o grupo H04L 9/00 (arranjos para comunicação segura) ou para a subclasse H04L (transmissão de informação digital).

### 2. Combine IPC com palavras-chave

Use `IC=(H04L 9/00) AND TI=(criptografia OR "blockchain" OR "segurança")` para refinar resultados dentro de uma classificação ampla.

### 3. Use operadores de truncamento

O INPI aceita truncamento: `IC=(G06N 3/)` retorna todos os subgrupos de G06N 3 (redes neurais).

### 4. Considere múltiplas classificações

Uma patente pode receber várias classificações IPC. Não limite sua busca a um único código — uma invenção de veículo autônomo, por exemplo, pode estar classificada em **G05D 1/00** (controle de veículos), **G06V 20/00** (reconhecimento de cenas), **H04W 4/00** (comunicação móvel) e **B60W 60/00** (sistemas de direção autônoma).

## Atualização e Versões do IPC

O IPC é revisado anualmente pela WIPO. A versão atual em julho de 2026 é a **IPC 2026.01**, que entrou em vigor em 1º de janeiro de 2026. As principais mudanças introduzidas recentemente incluem:

- Novas subclasses em **G06** para tecnologias emergentes de IA (redes neurais, transformers, modelos fundacionais)
- Expansão de **H04W** para cobrir novas gerações de redes sem fio (6G, NTN — redes não terrestres)
- Subdivisões em **A61** para terapias avançadas e medicina personalizada

Para acompanhar mudanças, consulte o [calendário de revisões da WIPO](https://www.wipo.int/classifications/ipc/en/preface.html).

## Conclusão

A Classificação Internacional de Patentes é a espinha dorsal da busca e organização de informação tecnológica em patentes. Saber ler e usar códigos IPC não é apenas uma habilidade técnica — é uma ferramenta estratégica para:

- **Identificar concorrentes** — veja quem está depositando na sua área técnica
- **Mapear tendências** — o crescimento de depósitos em uma classe IPC específica revela a direção da inovação
- **Evitar infrações** — buscas bem feitas reduzem o risco de violar patentes existentes
- **Agilizar o exame** — classificações corretas aceleram a tramitação no INPI

Com a retomada do trâmite prioritário para H04 e a explosão de patentes de IA generativa classificadas em G06, dominar o sistema IPC nunca foi tão relevante para quem atua com propriedade industrial no Brasil.

Leia também:

- [Guia Completo de Trâmite Prioritário de Patentes no INPI]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}})
- [Patentes de Inteligência Artificial Generativa no Brasil: Guia Completo]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
