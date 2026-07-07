---
date: 2026-07-06T15:00:00-03:00
draft: false
title: "Claude Sonnet 5: Janela de Contexto Limitada o torna útil apenas como
subagente"
description: "Anthropic lança Claude Sonnet 5 com capacidades agênticas de nível Opus a US$ 2/M tokens — codificação autônoma, uso de ferramentas e browsers, e segurança aprimorada contra jailbreak."
featured_image: ""
categories:
  - article
tags:
  - ia
  - inteligencia-artificial
  - anthropic
  - dev
  - tecnologia
---

Em 30 de junho de 2026, a Anthropic lançou o **Claude Sonnet 5**, a nova geração de seu modelo de médio porte que promete redefinir o custo-benefício em agentes de IA. O modelo chega com capacidades agênticas que até recentemente eram exclusivas de modelos maiores e mais caros — e a um preço que torna viável escalar agentes de IA em produção.

## O salto agêntico do Sonnet

A linha Sonnet tem uma história importante no ecossistema Claude. Os modelos Sonnet 3.5, 3.6 e 3.7 foram os primeiros a demonstrar habilidades impressionantes em codificação e uso de ferramentas, marcando o início da era dos agentes de IA para muitos desenvolvedores. Mas, nos últimos meses, os ganhos mais expressivos em capacidades agênticas estavam concentrados nos modelos Opus.

O Sonnet 5 muda esse cenário. Segundo a Anthropic, o modelo tem performance **próxima ao Opus 4.8** — atualmente o modelo mais capaz da empresa — mas com preço significativamente menor. A melhoria em relação ao seu antecessor, Sonnet 4.6, é substancial em raciocínio, uso de ferramentas, codificação e trabalho cognitivo.

Nas avaliações internas, o Sonnet 5 apresenta ganhos consistentes em múltiplas frentes:

- **BrowseComp** (avaliação de busca agêntica): performance superior ao Sonnet 4.6 em todos os níveis de esforço, aproximando-se do Opus 4.8 em configurações de alto esforço
- **OSWorld-Verified** (uso de computador via agente): cobre uma faixa maior de opções custo-performance que o Opus 4.8
- **Humanity's Last Exam**: o modelo se beneficia do sistema de "esforço" ajustável, permitindo equilibrar custo e precisão conforme a tarefa

## Preço e disponibilidade

O Claude Sonnet 5 está disponível desde 30 de junho em todos os planos (Free, Pro, Max, Team e Enterprise) e também via Claude Code e API.

| Parâmetro | Preço (US$ por milhão de tokens) |
|-----------|----------------------------------|
| **Input (introdução até 31/ago)** | US$ 2 |
| **Output (introdução até 31/ago)** | US$ 10 |
| **Input (preço normal)** | US$ 3 |
| **Output (preço normal)** | US$ 15 |

Para comparação, o Opus 4.8 custa US$ 5/MTok input e US$ 25/MTok output. O preço introdutório de US$ 2/MTok foi calibrado para que a migração do Sonnet 4.6 seja aproximadamente neutra em custo, considerando que o Sonnet 5 usa um tokenizador atualizado que pode aumentar o número de tokens em 1,0–1,35× dependendo do conteúdo.

Os rate limits também foram aumentados em todos os tiers (Start, Build, Scale) para acomodar o maior consumo de tokens em configurações de alto esforço.

## Minhas impressões

Desde o lançamento tenho testado esporadicamente o Sonnet 5. Antes do seu
lançamento, estava usando quase sempre o Opus 4.8 para quase todas as tarefas
relacionadas ao Chat e ao Claude Code. No Claude Code percebi que o Sonnet 5 está
basicamente inutilizável, já que qualquer tarefa que consistir em mais do que um
simples "fix" chegará ao limite de contexto de 200k tokens. Então de fato o futuro
desse modelo está em performar essas tarefas como subagente com um contexto bem
limitado.

Leia também:

- [Dentro dos Cérebros de IA: Como a Anthropic Decifrou o Processo de Pensamento de Claude]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Tag e o risco à propriedade intelectual das empresas]({{< relref "posts/claude-tag-propriedade-intelectual-empresarial/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
