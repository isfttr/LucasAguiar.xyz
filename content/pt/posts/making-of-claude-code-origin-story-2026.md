---
date: 2026-07-07T18:00:00.000Z
draft: true
title: 'A Criação do Claude Code: Da CLI Interna ao Agente de Codificação da Anthropic [2026]'
description: A história interna de como o Claude Code evoluiu de um experimento de dois dias para o agente de codificação que transformou o desenvolvimento de software. Contada pelas pessoas que o construíram.
featured_image: ''
categories:
  - article
tags:
  - ai
  - dev
  - dev-tools
  - open-source
translation_source_hash: ce886029494f38ea6e4fc00cd57ad70d12d31237efbe3fa4a07ef80c3d356a9c
---
Em 6 de julho de 2026, a Anthropic publicou uma peça incomum em seu site. Não era um anúncio de modelo, uma inauguração de escritório ou um artigo de pesquisa. Era uma história contada por 14 pessoas — pesquisadores, engenheiros, designers e usuários externos — sobre como o Claude Code nasceu.

*The Making of Claude Code* é uma história oral: um mosaico de depoimentos que traçam o caminho de uma ferramenta que começou como uma CLI interna chamada *clide* e se tornou um dos produtos mais influentes da Anthropic. O que emerge não é uma linha reta até o sucesso, mas uma sequência de tentativas, fracassos, intuições e modelos que não estavam prontos — até que estiveram.

## Origens: De 2021 ao Clide

Antes de o Claude Code existir, a Anthropic já pensava em assistentes de codificação. Shauna Kravac, head de Reinforcement Learning, lembra que no início de 2022 a empresa estava trabalhando em "agentes de engenharia de software autônomos". Dawn Drain, engenheira de pesquisa, passou seus primeiros três anos na Anthropic — começando em 2021 — tentando fazer um modelo "tão bom em codificação quanto eu".

O primeiro produto tangível foi uma extensão do VS Code em 2022. Ben Mann, cofundador, afirma que ela dava quatro sugestões diferentes por comando e alcançou cerca de 100 usuários externos. A infraestrutura necessária para agir no mundo real, no entanto, era muito mais complexa do que um chatbot exige. Execução de código em contêineres, gerenciamento de ambiente, timeouts — desafios que a equipe enfrentou em 2022 e que, segundo Shauna, "são os mesmos que as pessoas enfrentam com agentes hoje".

Dawn passou um "tempo vergonhosamente longo" ensinando o Claude a escrever diffs. Desse trabalho surgiu o *clide*, uma ferramenta de linha de comando para conversar com o Claude sobre edição de código. Era lento e limitado, mas funcionava. Adam Wolff, que mais tarde se tornou o primeiro gerente do Claude Code, lembra de implementar uma versão "baby agentic": o modelo inferia o que você queria a partir de uma mudança parcial. "Na primeira vez que funcionou, eu estava dançando pela minha cozinha. Não conseguia acreditar."

## A Centelha: Uma Demonstração de Dois Dias

Em setembro de 2024, Boris Cherny, agora head do Claude Code, começou a trabalhar no que chamou de "Claude CLI". Era um projeto de dois dias. Ele gravou uma demonstração: o Claude CLI tirou um print do Apple Music para descobrir qual música estava tocando. "Postei no Slack. Acho que recebi dois ou três likes."

No dia seguinte, Boris viu Robert Boyce trabalhando e reconheceu os caracteres vermelhos e verdes de código — "que são meio icônicos agora". Robert disse: "É, está fazendo minha codificação. Foi a coisa mais louca — era útil."

A urgência tomou conta. Boris começou a trabalhar todos os fins de semana. "Meus amigos diziam: 'O que está acontecendo? Vem sair!' Mas havia essa coisa na qual eu não conseguia parar de pensar."

## O Pequeno Time que Voou

O time que construiu o Claude Code foi propositalmente pequeno. Adam Wolff, que havia trabalhado no React no Facebook, sabia que escalar prematuramente é um risco. "Boris estava pressionando por crescimento rápido. Eu queria o oposto. Escalar torna tudo mais difícil em termos de processo, cultura e visão."

O time inicial era essencialmente Boris, Sid Bidasaria e Ben Mann. Em dezembro de 2024, mais algumas pessoas entraram e eles começaram um sprint de duas semanas rumo ao lançamento. A maioria das funcionalidades principais que existem hoje foram construídas nessas duas semanas — incluindo relatórios de bugs e o fluxo de login.

"Foi quando senti: 'OK, isso está se transformando em algo real'", diz Sid.

A velocidade foi possível porque o produto era uma CLI. Sem arquitetura web complexa. Sem pipeline de deploy. Apenas auto-updates e boas métricas de uso. Quando um usuário reclamava, a correção chegava cinco minutos depois.

## Lançamento e o Ponto de Virada

O lançamento externo ocorreu em fevereiro de 2025 — e a recepção foi morna. "Algumas pessoas acharam que era uma ideia legal, mas tinha uma tonelada de bugs", diz Cat Wu, head de produto. Foi quando o Claude CLI foi renomeado para Claude Code.

Igor Kofman, tarde da noite antes do lançamento, pensou: "Não seria legal se tivéssemos um logo ASCII?" Ele colaborou com o Claude para preencher fontes de arte ASCII, e o icônico logo em letras maiúsculas do Claude Code nasceu. Meaghan Choi, designer de produto, adicionou o personagem "Clawd" ao terminal — um Easter egg visual que sobrevive até hoje.

O ponto de virada veio com os modelos Claude 4. "Até então, não havia tanto design de UX que pudéssemos fazer", diz Meaghan. "O modelo simplesmente não estava pronto para o produto que queríamos construir. Mas então ele estava."

## O Novo Mundo

Em fevereiro de 2025, o Claude Code escrevia talvez 10% do código de Boris. Em maio, já era 30-40%. Quando o Sonnet 4 foi lançado, Boris lembra de pensar: "Uau, isso está ficando muito bom." No inverno de 2025, 100% do seu código era escrito pelo Claude Code. "Nem uma única linha à mão."

Shauna Kravac, que não escrevia muito código há anos como líder de pesquisa, agora é uma power user: "Tenho um enxame de doze Claudes diferentes rodando — lendo documentos, atualizando coisas, puxando do Slack."

Austin Ray, da Ramp (que usa o Claude Code em produção), diz que a ferramenta mudou fundamentalmente a forma como a empresa trabalha: "Inicialmente, todo mundo lia cada solicitação de permissão. Hoje em dia, uma grande parte dos nossos usuários simplesmente aceita tudo automaticamente. O Claude conquistou a confiança deles."

## O Que Vem a Seguir

Adam Wolff, que viu o React crescer de uma ideia pura de ciência da computação para "um logo, uma marca, um sentimento", faz uma previsão: "O Claude Code evoluirá da mesma forma. O que quer que você pense que o Claude Code seja — o terminal, a personalidade do Claude, uma técnica específica de prompt — nenhuma dessas coisas importa no limite."

Igor Kofman, que começou a programar em BASIC aos sete anos na Ucrânia, não escreve mais código à mão — desde o inverno de 2025. Shauna projeta que "durante a maior parte de 2026 e 2027, vai acontecer bastante coisa em apenas três meses. Três meses de progresso em 2024 teriam sido uma melhoria, mas de forma menos dramática. Essa é a parte desorientadora — e não tenho certeza se alguém está preparado para isso."

O artigo completo da Anthropic está disponível em [anthropic.com/features/making-of-claude-code](https://www.anthropic.com/features/making-of-claude-code).

Leia também:

- [Experiences with Cursor, Windsurf, and the State of AI Coding Tools]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Claude Sonnet 5: Anthropic's New Model Has Arrived]({{< relref "posts/claude-sonnet-5-2026/" >}})

Leia também:

- [A História do Claude Code: Como um CLI Interno Virou o Agente de Código da Anthropic [2026]]({{< relref "posts/making-of-claude-code-historia-origem-2026/" >}})
- [Claude Sonnet 5: Anthropic's Most Agentic AI Model Arrives at a Reduced Price [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Inside AI Brains: How Anthropic Decoded Claude's Thinking Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})

---

Sinta-se à vontade para entrar em contato para discutir este e outros assuntos em <contact@lucasaguiar.xyz>
