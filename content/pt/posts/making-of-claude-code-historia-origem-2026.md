---
date: 2026-07-07T15:00:00-03:00
draft: true
title: "A História do Claude Code: Como um CLI Interno Virou o Agente de Código da Anthropic [2026]"
description: "A história de como o Claude Code evoluiu de um experimento interno de dois dias para o agente de código que transformou o desenvolvimento de software. Bastidores contados por quem construiu."
featured_image: ""
categories:
  - article
tags:
  - ia
  - dev
  - ferramentas-desenvolvimento
  - software-livre
---

No dia 6 de julho de 2026, a Anthropic publicou um artigo incomum em seu site. Não era o anúncio de um novo modelo, nem a abertura de um escritório, nem um paper de pesquisa. Era uma história contada por 14 pessoas — pesquisadores, engenheiros, designers e usuários externos — sobre como o Claude Code nasceu.

O artigo, *The Making of Claude Code*, é um oral history: uma colagem de depoimentos que reconstitui a trajetória de uma ferramenta que começou como um CLI interno chamado *clide* e se tornou um dos produtos mais influentes da Anthropic. O que se vê ao longo do texto não é uma linha reta de sucesso, mas uma sucessão de tentativas, fracassos, intuições e modelos que não estavam prontos — até que estiveram.

## As Origens: de 2021 ao Clide

Antes do Claude Code ser concebido, a Anthropic já pensava em assistentes de código. Shauna Kravac, head de Reinforcement Learning, lembra que no início de 2022 a empresa já trabalhava em "agentes autônomos de engenharia de software". Dawn Drain, research engineer, passou os primeiros três anos na Anthropic — desde 2021 — tentando fazer um modelo "tão bom em programação quanto eu".

O primeiro produto tangível foi uma extensão de VS Code em 2022. Ben Mann, co-fundador, conta que ela dava quatro sugestões diferentes para cada prompt. Chegou a ter cerca de 100 usuários externos. A infraestrutura necessária para agir no mundo real, no entanto, era — e ainda é — muito mais complexa que a de um chatbot. Execução de código em containers, gerenciamento de ambiente, timeouts — desafios que a equipe enfrentou em 2022 e que, segundo Shauna, "são os mesmos que as pessoas enfrentam hoje com agentes".

Dawn passou um tempo "embaraçosamente longo" tentando ensinar o Claude a escrever diffs. Desse trabalho nasceu o *clide*, uma ferramenta de linha de comando que permitia conversar com o Claude para edição de código. Era lento, tinha limitações, mas funcionava. Adam Wolff, que mais tarde se tornaria o primeiro manager da equipe do Claude Code, lembra de ter implementado uma versão "baby agentic" no clide: o modelo inferia o que você queria fazer a partir de uma mudança parcial. "A primeira vez que funcionou, eu estava dançando na cozinha. Não acreditava."

## A Centelha: o Demo de Dois Dias

Em setembro de 2024, Boris Cherny, hoje head do Claude Code, começou a trabalhar no que chamou de "Claude CLI". Era um projeto de dois dias. Ele gravou um demo: o Claude CLI tirava um screenshot do Apple Music para descobrir que música estava tocando. "Postei no Slack. Acho que recebi dois ou três likes."

No dia seguinte, Boris viu Robert Boyce trabalhando e reconheceu os caracteres vermelhos e verdes de código — "que são meio icônicos agora", diz Boris. "Ele estava tipo, 'É, está fazendo meu código.' Era a coisa mais louca — estava sendo útil."

A urgência tomou conta. Boris começou a trabalhar todo fim de semana. "Meus amigos perguntavam 'O que está acontecendo? Vem sair!' Mas tinha essa coisa em que eu não conseguia parar de pensar."

## O Time Pequeno Que Voava

A equipe que construiu o Claude Code era deliberadamente pequena. Adam Wolff, que havia trabalhado no React no Facebook, sabia que escala prematura é um risco. "Boris queria crescimento rápido. Eu queria o oposto. É bom ter mais gente, mas escala dificulta tudo — processo, cultura, visão."

O time inicial era basicamente Boris, Sid Bidasaria e Ben Mann. Em dezembro de 2024, mais algumas pessoas entraram, e começaram um sprint de duas semanas para o lançamento. A maioria das funcionalidades principais que existem hoje foi construída nessas duas semanas — incluindo o reporte de bugs e o fluxo de login.

"Foi quando senti: 'OK, isso está virando algo real'", diz Sid.

A velocidade era possível porque o produto era um CLI. Sem arquitetura web complexa. Sem deploy. Bastava uma auto-update e boas métricas de uso. Quando um usuário reclamava, o fix chegava cinco minutos depois.

## O Lançamento e a Virada

O lançamento externo foi em fevereiro de 2025 — e a recepção inicial foi morna. "Algumas pessoas achavam que era uma ideia legal, mas tinha um monte de bugs", conta Cat Wu, head de produto. Foi nesse momento que o Claude CLI foi renomeado para Claude Code.

Igor Kofman, numa noite antes do lançamento, pensou: "Não seria legal ter um logo em ASCII?" Colaborou com o Claude para preencher fontes ASCII — e nasceu o logo em caixa alta do Claude Code. Meaghan Choi, product designer, acrescentou o personagem "Clawd" ao terminal, um Easter egg visual que sobrevive até hoje.

A virada veio com os modelos Claude 4. "Até então, não havia muito design de UX que pudéssemos fazer", diz Meaghan. "O modelo simplesmente não estava pronto para o produto que queríamos construir. Mas então ficou."

## O Novo Mundo

Em fevereiro de 2025, Claude Code escrevia uns 10% do código de Boris. Em maio, subiu para 30-40%. Quando o Sonnet 4 saiu, Boris lembra: "Uau, isso está ficando muito bom." No inverno de 2025, 100% do código de Boris era escrito pelo Claude Code. "Nem uma linha à mão."

Shauna Kravac, que não escrevia código há anos como research lead, hoje é power user: "Tenho um enxame de doze Claudes diferentes rodando — lendo documentos, atualizando coisas, puxando informações do Slack."

Austin Ray, da Ramp (que usa Claude Code em produção), diz que a ferramenta mudou fundamentalmente como a empresa trabalha: "No começo, todo mundo lia cada requisição de permissão que o Claude Code fazia. Hoje, a grande maioria dos nossos usuários aceita tudo automaticamente. O Claude conquistou a confiança."

## O Que Vem a Seguir

Adam Wolff, que viu o React crescer de uma ideia pura de ciência da computação para "um logo, uma marca, um sentimento", faz uma previsão: "Claude Code vai evoluir do mesmo jeito. Seja o que você pensa que ele é — o terminal, a personalidade do Claude, uma técnica de prompting específica — nada disso importa no limite."

Igor Kofman, que começou a programar em BASIC aos sete anos na Ucrânia, hoje não escreve mais código manualmente desde o inverno de 2025. Shauna projeta que "para a maior parte de 2026 e 2027, vai acontecer bastante coisa em apenas três meses. Três meses de progresso em 2024 teriam sido uma melhoria, mas não tão dramática. Essa é a parte desorientadora — e não sei se alguém está preparado."

O artigo completo da Anthropic pode ser lido em [anthropic.com/features/making-of-claude-code](https://www.anthropic.com/features/making-of-claude-code).

Leia também:

- [Experiências com Cursor, Windsurf e o Estado das Ferramentas de IA para Programar]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Vibe Coding: O Lado Oculto da Programação com IA]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Sonnet 5: O Novo Modelo da Anthropic Chegou]({{< relref "posts/claude-sonnet-5-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
