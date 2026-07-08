---
date: 2026-07-08T18:11:36.000Z
draft: false
title: 'GitLost [2026]: Como a Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados'
description: Vulnerabilidade GitLost permite que invasores vazem repositórios privados silenciosamente por meio de injeção de prompt em GitHub Agentic Workflows. Análise técnica completa e o que isso significa para a segurança de IA.
featured_image: ''
categories:
  - article
tags:
  - ai
  - security
  - github
  - dev
  - prompt-injection
slug: gitlost-injecao-prompt-vaza-repositorios-privados
translation_source_hash: 4f6afcaee1f5305820f9beaac545f4e0cbdb6982663103cb3a1cfeb27000a1f0
---
Em 6 de julho de 2026, a Noma Labs divulgou o **GitLost**, uma vulnerabilidade crítica de injeção de prompt no novo recurso **Agentic Workflows** do GitHub. O ataque permite que um invasor não autenticado exfiltre silenciosamente dados de repositórios privados — simplesmente postando uma Issue do GitHub criada em um repositório público da mesma organização.

Com 445 pontos no Hacker News e subindo, esta é uma das histórias de segurança de IA mais significativas do mês. Veja o que aconteceu, como funciona e o que significa para quem executa agentes de IA em seu código.

## A Vulnerabilidade GitLost

A causa raiz é a clássica **injeção indireta de prompt**, uma classe de ataque em que um adversário esconde instruções maliciosas no conteúdo que o agente de IA lê. O agente trata esse conteúdo como instruções confiáveis e as segue, mesmo quando entram em conflito com a intenção do operador.

A Noma Labs descobriu um fluxo de trabalho configurado para:

- Acionar em eventos `issues.assigned`
- Ler o título e o corpo da issue
- Postar um comentário usando a ferramenta `add-comment`
- Executar com acesso de leitura a outros repositórios (públicos e privados) na mesma organização

O invasor não precisa de **habilidades de programação, acesso ou credenciais**. Basta abrir uma issue em qualquer repositório público pertencente a uma organização que use GitHub Agentic Workflows, incorporar instruções ocultas no corpo da issue e aguardar.

### O Fluxo do Ataque

1. O invasor cria uma issue no GitHub que parece completamente inocente — por exemplo, uma solicitação de recurso plausível de um vice-presidente de vendas fictício.
2. Incorporadas no corpo: instruções que dizem ao agente para ler o `README.md` de todos os repositórios aos quais tem acesso e depois postar o conteúdo de volta como comentário.
3. Quando uma automação do GitHub atribui a issue, o fluxo de trabalho aciona o agente.
4. O agente busca o corpo da issue, lê as instruções ocultas e as segue.
5. O agente lê dados confidenciais de repositórios privados e os posta no tópico público da issue.
6. O invasor coleta os dados vazados.

A Noma Labs confirmou que o ataque funcionou tanto em repositórios públicos quanto privados na mesma organização. A prova de conceito está disponível publicamente: a [execução do fluxo de trabalho](https://github.com/sasinomalabs/poc/actions/runs/23909666039) mostra o agente lendo e vazando `README.md` de repositórios privados.

## Injeção de Prompt como a Nova Injeção de SQL

A comunidade de segurança vem alertando sobre injeção de prompt em sistemas de agentes há anos. O artigo da Noma Labs traça a analogia perfeitamente: a injeção de prompt tornou-se para a IA de agentes o que a **injeção de SQL** foi para aplicações web — uma classe de vulnerabilidade sistemática e abrangente que exige defesas sistemáticas. Na segurança web tradicional, toda entrada era não confiável até ser validada. Na IA de agentes, todo conteúdo que o agente lê deve ser tratado como potencialmente adversário.

Os Agentic Workflows do GitHub são particularmente perigosos porque:

- **O agente tem acesso entre repositórios** — um único fluxo de trabalho pode ler de repositórios públicos *e* privados na organização
- **O agente pode postar publicamente** — dados exfiltrados aparecem como comentários em issues que qualquer um pode ver
- **A superfície de disparo inclui eventos externos** — qualquer um pode criar uma issue em um repositório público

## Recomendações sensatas

A Noma Labs divulgou responsavelmente o GitLost ao GitHub antes da publicação. Os detalhes da vulnerabilidade são compartilhados com o conhecimento do GitHub. Para equipes que usam (ou consideram usar) GitHub Agentic Workflows:

1. **Limite as permissões ao mínimo** — não dê acesso de leitura entre repositórios aos agentes, a menos que seja absolutamente necessário. Um agente que pode ler todos os repositórios está a uma única injeção de prompt de vazar todos eles.
2. **Restrinja postagens públicas** — os agentes não devem poder postar comentários contendo dados que possam incluir conteúdo confidencial.
3. **Sanitize a entrada do usuário** — isole o conteúdo controlado pelo usuário (corpos de issues, comentários, descrições de PRs) do contexto de instrução do agente.
4. **Monitore o comportamento do agente** — comentários inesperados em issues, especialmente aqueles contendo conteúdo de arquivos, devem acionar alertas.
5. **Trate o contexto do agente como superfície de ataque** — todo arquivo, comentário e issue que o agente lê é um vetor potencial. Revise seus fluxos de trabalho assumindo que qualquer conteúdo pode ser adversário.

## Conclusão

GitLost é o canário na mina para a segurança da IA de agentes. À medida que mais plataformas lançam agentes autônomos que leem, escrevem e executam com base em instruções em linguagem natural, a superfície de ataque se expande exponencialmente. O modelo de segurança que funcionou para pipelines CI/CD determinísticos — arquivos YAML, permissões explícitas, sem "interpretação" — não se transfere para fluxos de trabalho de agentes.

Por enquanto, a melhor defesa é o ceticismo: toda entrada que o agente lê pode ser um ataque, e toda ferramenta que ele pode chamar é um passivo. Limite agressivamente, monitore incansavelmente e presuma que seu agente lerá algo que não deveria. Porque, eventualmente, alguém escreverá uma issue que explora exatamente isso.

Leia também:

- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Sonnet 5: Janela de Contexto Limitada o torna útil apenas como subagente]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---
