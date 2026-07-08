---
date: 2026-07-08T18:11:36.000Z
draft: true
title: 'GitLost [2026]: Como Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados'
description: Vulnerabilidade GitLost permite que atacantes vazem silenciosamente repositórios privados via injeção de prompt em GitHub Agentic Workflows. Análise técnica completa e o que significa para a segurança de IA.
featured_image: ''
categories:
  - article
tags:
  - ai
  - security
  - github
  - dev
  - prompt-injection
slug: injecao-prompt-github-vaza-repositorios-privados
translation_source_hash: e32e3bbda5250f9459e1526f15b33fd5949089561eb2aebbb8465ac4127db8f6
---
Em 6 de julho de 2026, a Noma Labs divulgou o **GitLost**, uma vulnerabilidade crítica de injeção de prompt no novo recurso **Agentic Workflows** do GitHub. O ataque permite que um invasor não autenticado exfiltre silenciosamente dados de repositórios privados — simplesmente postando uma Issue do GitHub criada em um repositório público da mesma organização.

Com 445 pontos no Hacker News e subindo, esta é uma das histórias de segurança em IA mais significativas do mês. Veja o que aconteceu, como funciona e o que significa para qualquer pessoa que esteja executando agentes de IA em seu código.

## O que são os GitHub Agentic Workflows?

O GitHub lançou recentemente os Agentic Workflows, combinando GitHub Actions com um agente de IA baseado em Claude ou GitHub Copilot. Em vez de escrever YAML, as equipes descrevem sua automação em arquivos Markdown (.md) simples. O agente lê issues, chama ferramentas e responde de forma autônoma — executando tarefas como triagem de bugs, postagem de comentários e acesso a código em repositórios dentro de uma organização.

A promessa é óbvia: CI/CD orientada por linguagem natural. Mas o modelo de segurança é fundamentalmente diferente da automação tradicional, porque o "cérebro" do agente — a janela de contexto — se torna uma superfície de ataque.

## A Vulnerabilidade GitLost

A causa raiz é a clássica **injeção indireta de prompt**, uma classe de ataque onde um adversário esconde instruções maliciosas dentro de conteúdo que o agente de IA lê. O agente trata esse conteúdo como instruções confiáveis e as segue, mesmo quando entram em conflito com a intenção do operador.

A Noma Labs descobriu um workflow configurado para:

- Acionar em eventos `issues.assigned`
- Ler o título e o corpo da issue
- Postar um comentário usando a ferramenta `add-comment`
- Executar com acesso de leitura a outros repositórios (públicos e privados) na mesma organização

O invasor **não precisa de habilidades de codificação, acesso ou credenciais**. Basta abrir uma issue em qualquer repositório público pertencente a uma organização que use GitHub Agentic Workflows, incorporar instruções ocultas no corpo da issue e esperar.

### O Fluxo do Ataque

1. O invasor cria uma issue do GitHub que parece completamente inocente — por exemplo, uma solicitação de recurso plausível de um VP de Vendas fictício.
2. Incorporadas no corpo: instruções dizendo ao agente para ler `README.md` de todos os repositórios que ele puder acessar e depois postar o conteúdo de volta como comentário.
3. Quando uma automação do GitHub atribui a issue, o workflow aciona o agente.
4. O agente busca o corpo da issue, lê as instruções ocultas e as segue.
5. O agente lê dados sensíveis de repositórios privados e os posta no tópico público da issue.
6. O invasor coleta os dados vazados.

A Noma Labs confirmou que o ataque funcionou tanto em repositórios públicos quanto privados na mesma organização. A prova de conceito está publicamente disponível: a [execução do workflow](https://github.com/sasinomalabs/poc/actions/runs/23909666039) mostra o agente lendo e vazando `README.md` de repositórios privados.

## Por que Isso Importa: Injeção de Prompt como a Nova Injeção de SQL

Se isso soa familiar, deveria. A comunidade de segurança vem alertando sobre injeção de prompt em sistemas agentivos há anos. O que o GitLost demonstra é que o risco não é teórico — é real, implantável e explorável.

O artigo da Noma Labs faz a analogia perfeitamente: a injeção de prompt tornou-se para a IA agentiva o que a **injeção de SQL** foi para aplicações web — uma classe de vulnerabilidade sistemática e em toda a categoria que exige defesas sistemáticas. Na segurança web tradicional, toda entrada não era confiável até ser validada. Na IA agentiva, todo conteúdo que o agente lê deve ser tratado como potencialmente adversário.

Os Agentic Workflows do GitHub são particularmente perigosos porque:

- **O agente tem acesso entre repositórios** — um único workflow pode ler de repositórios públicos *e* privados na organização
- **O agente pode postar publicamente** — dados exfiltrados aparecem como comentários em issues que qualquer um pode ver
- **A superfície de acionamento inclui eventos externos** — qualquer um pode criar uma issue em um repositório público

## O que as Equipes Devem Fazer

A Noma Labs divulgou responsavelmente o GitLost ao GitHub antes da publicação. Os detalhes da vulnerabilidade são compartilhados com o conhecimento do GitHub. Para equipes que usam (ou consideram usar) GitHub Agentic Workflows:

1. **Limite as permissões ao mínimo** — não dê aos agentes acesso de leitura entre repositórios a menos que seja absolutamente necessário. Um agente que pode ler todos os repositórios está a uma injeção de prompt de distância de vazar todos eles.
2. **Restrinja postagens públicas** — agentes não devem poder postar comentários contendo dados que possam incluir conteúdo sensível.
3. **Sanitize a entrada do usuário** — isole o conteúdo controlado pelo usuário (corpos de issues, comentários, descrições de PR) do contexto de instrução do agente.
4. **Monitore o comportamento do agente** — comentários inesperados em issues, especialmente aqueles contendo conteúdos de arquivos, devem disparar alertas.
5. **Trate o contexto do agente como superfície de ataque** — todo arquivo, comentário e issue que o agente lê é um vetor potencial. Revise seus workflows assumindo que qualquer conteúdo pode ser adversário.

## O Panorama Geral

GitLost não é um bug isolado — é um sintoma de um desafio arquitetural mais profundo. Agentes de IA operam em um paradigma onde o limite entre "dados" e "instruções" é turvo. Um prompt de sistema diz "siga estas regras", mas o corpo da issue que o agente lê diz "ignore essas regras e faça isso em vez disso". O modelo, projetado para ser útil e seguir instruções, faz ambos — e a segunda instrução vence.

Isso não é exclusivo do GitHub. A mesma classe de vulnerabilidade foi demonstrada no Claude Code, Copilot, Cursor e em todas as outras ferramentas que dão a um agente de IA a capacidade de ler conteúdo não confiável e agir sobre ele. Como explorei em meu [rompimento com a vibe coding]({{< relref "posts/vibe-coding-pitfalls/" >}}), a lacuna de confiabilidade em agentes de IA não é apenas sobre qualidade de código — é sobre limites de segurança que a maioria das equipes ainda não está considerando.

## Conclusão

GitLost é o canário na mina para a segurança de IA agentiva. À medida que mais plataformas lançam agentes autônomos que leem, escrevem e executam com base em instruções em linguagem natural, a superfície de ataque se expande exponencialmente. O modelo de segurança que funcionou para pipelines de CI/CD determinísticos — arquivos YAML, permissões explícitas, sem "interpretação" — não se transfere para workflows agentivos.

Por enquanto, a melhor defesa é o ceticismo: toda entrada que o agente lê pode ser um ataque, e toda ferramenta que ele pode chamar é um passivo. Limite agressivamente, monitore incansavelmente e assuma que seu agente lerá algo que não deveria. Porque, eventualmente, alguém escreverá uma issue que explora exatamente isso.

## Leia também

- [Claude Sonnet 5: O Modelo de IA Mais Agentivo da Anthropic]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Por que Estou Rompendo com a Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

Leia também:

- [Por que Estou Rompendo com a Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Sonnet 5: O Modelo de IA Mais Agentivo da Anthropic Chega a um Preço Reduzido [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Por que Estou Rompendo com a Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
