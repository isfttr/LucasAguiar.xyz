---
date: 2026-07-07T18:00:00.000Z
draft: true
title: 'A Criação do Claude Code: De CLI Interno ao Agente de Codificação da Anthropic [2026]'
description: A história interna de como o Claude Code evoluiu de um experimento de dois dias para o agente de codificação que transformou o desenvolvimento de software. Contada pelas pessoas que o construíram.
featured_image: ''
categories:
  - article
tags:
  - ai
  - dev
  - dev-tools
  - open-source
translation_source_hash: 5d19c559e43e900aabbcd8aa94092ccdd9331bc76ca040fb83f94333df628606
---
Em 6 de julho de 2026, a Anthropic publicou uma peça incomum em seu site. Não era um anúncio de modelo, uma inauguração de escritório ou um artigo de pesquisa. Era uma história contada por 14 pessoas — pesquisadores, engenheiros, designers e usuários externos — sobre como o Claude Code nasceu.

*The Making of Claude Code* é uma história oral: um mosaico de depoimentos que traçam o caminho de uma ferramenta que começou como uma CLI interna chamada *clide* e se tornou um dos produtos mais influentes da Anthropic. O que emerge não é uma linha reta para o sucesso, mas uma sequência de tentativas, fracassos, intuições e modelos que não estavam prontos — até que estivessem.

## Origens: De 2021 ao Clide

Antes do Claude Code existir, a Anthropic já estava pensando em assistentes de codificação. Shauna Kravac, chefe de Aprendizagem por Reforço, lembra que no início de 2022 a empresa estava trabalhando em "agentes autônomos de engenharia de software." Dawn Drain, engenheira de pesquisa, passou seus primeiros três anos na Anthropic — começando em 2021 — tentando fazer um modelo "tão bom em codificação quanto eu."

O primeiro produto tangível foi uma extensão do VS Code em 2022. Ben Mann, cofundador, diz que ela dava quatro sugestões diferentes por comando e alcançou cerca de 100 usuários externos. A infraestrutura necessária para agir no mundo real, no entanto, era muito mais complexa do que um chatbot requer. Execução de código em contêineres, gerenciamento de ambiente, timeouts — desafios que a equipe enfrentou em 2022 que, segundo Shauna, "são os mesmos que as pessoas enfrentam com agentes hoje."

Dawn passou um "tempo vergonhosamente longo" ensinando Claude a escrever diffs. Desse trabalho nasceu *clide*, uma ferramenta de linha de comando para conversar com Claude sobre edição de código. Era lenta e limitada, mas funcionava. Adam Wolff, que mais tarde se tornou o primeiro gerente do Claude Code, lembra de implementar uma versão "baby agentic": o modelo inferia o que você queria a partir de uma alteração parcial. "Na primeira vez que funcionou, eu estava dançando pela minha cozinha. Não conseguia acreditar."

## A Centelha: Uma Demonstração de Dois Dias

Em setembro de 2024, Boris Cherny, agora chefe do Claude Code, começou a trabalhar no que chamou de "Claude CLI." Era um projeto de dois dias. Ele gravou uma demonstração: Claude CLI tirou uma captura de tela do Apple Music para descobrir qual música estava tocando. "Postei no Slack. Acho que recebi dois ou três curtidas."

No dia seguinte, Boris viu Robert Boyce trabalhando e reconheceu os caracteres de código vermelho e verde — "que são meio icônicos agora." Robert disse: "É, está fazendo minha codificação. Foi a coisa mais louca — era útil."

A urgência tomou conta. Boris começou a trabalhar todos os fins de semana. "Meus amigos estavam tipo, 'O que está acontecendo? Vem sair!' Mas havia essa coisa que eu não conseguia parar de pensar."

## A Pequena Equipe Que Voou

A equipe que construiu o Claude Code foi deliberadamente pequena. Adam Wolff, que trabalhou no React no Facebook, sabia que escalar prematuramente é um risco. "Boris estava pressionando por um crescimento rápido. Eu queria o oposto. Escalar torna tudo sobre processo, cultura e visão mais difícil."

A equipe inicial era essencialmente Boris, Sid Bidasaria e Ben Mann. Em dezembro de 2024, mais algumas pessoas se juntaram e eles começaram um sprint de duas semanas para o lançamento. A maioria dos recursos principais que existem hoje foram construídos nessas duas semanas — incluindo relatórios de bugs e o fluxo de login.

"Foi aí que senti: 'OK, isso está se tornando algo real'", diz Sid.

A velocidade foi possível porque o produto era uma CLI. Sem arquitetura web complexa. Sem pipeline de implantação. Apenas atualizações automáticas e boas métricas de uso. Quando um usuário reclamava, a correção chegava cinco minutos depois.

## Lançamento e o Ponto de Virada

O lançamento externo veio em fevereiro de 2025 — e a recepção foi morna. "Algumas pessoas acharam que era uma ideia legal, mas tinha toneladas de bugs", diz Cat Wu, chefe de produto. Foi quando Claude CLI foi renomeado para Claude Code.

Igor Kofman, tarde da noite antes do lançamento, pensou: "Não seria legal se tivéssemos um logotipo ASCII?" Ele colaborou com Claude para preencher fontes de arte ASCII, e o icônico logotipo em letras maiúsculas do Claude Code nasceu. Meaghan Choi, designer de produto, adicionou o personagem "Clawd" ao terminal — um ovo de Páscoa visual que sobrevive até hoje.

O ponto de virada veio com os modelos Claude 4. "Até então, não havia muito design de UX que pudéssemos fazer", diz Meaghan. "O modelo simplesmente não estava pronto para o produto que queríamos construir. Mas então ficou."

## O Novo Mundo

Em fevereiro de 2025, o Claude Code estava escrevendo talvez 10% do código de Boris. Em maio, era 30-40%. Quando o Sonnet 4 foi lançado, Boris lembra de pensar: "Uau, isso está ficando muito bom." No inverno de 2025, 100% do seu código era escrito pelo Claude Code. "Nem uma única linha à mão."

Shauna Kravac, que não escrevia muito código há anos como líder de pesquisa, agora é uma usuária avançada: "Tenho um enxame de doze Claudes diferentes rodando — lendo documentos, atualizando coisas, puxando do Slack."

Austin Ray, da Ramp (que usa Claude Code em produção), diz que a ferramenta mudou fundamentalmente a forma como a empresa trabalha: "Inicialmente, todo mundo estava lendo cada solicitação de permissão. Hoje em dia, uma grande parte dos nossos usuários simplesmente auto-aceita tudo. Claude conquistou a confiança deles."

## O Que Vem a Seguir

Adam Wolff, que viu o React crescer de uma ideia pura de ciência da computação para "um logotipo, uma marca, um sentimento", oferece uma previsão: "O Claude Code evoluirá da mesma forma. O que quer que você pense que Claude Code é — o terminal, a personalidade de Claude, uma técnica específica de prompting — nada disso importa no limite."

Igor Kofman, que começou a programar em BASIC aos sete anos de idade na Ucrânia, não escreve mais código à mão — desde o inverno de 2025. Shauna projeta que "para a maior parte de 2026 e 2027, vai acontecer bastante coisa em apenas três meses. Três meses de progresso em 2024 teriam sido uma melhoria, mas menos dramaticamente. Essa é a parte desorientadora — e não tenho certeza se alguém está pronto para isso."

O artigo completo da Anthropic está disponível em [anthropic.com/features/making-of-claude-code](https://www.anthropic.com/features/making-of-claude-code).

Leia também:

- [Cursor vs Windsurf vs Zed 2026: Qual Editor de Código com IA é o Melhor?]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Claude Sonnet 5: Janela de Contexto Limitada o torna útil apenas como subagente]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Cursor vs Windsurf vs Zed 2026: Qual Editor de Código com IA é o Melhor?]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})

Leia também:

- [Do Cursor ao Windsurf e ao Zed: Minha Jornada pelos Editores de Código com IA]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Claude Sonnet 5: O Modelo de IA Mais Agentic da Anthropic Chega com Preço Reduzido [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [A História do Claude Code: Como uma CLI Interna se Tornou o Agente de Código da Anthropic [2026]]({{< relref "posts/making-of-claude-code-historia-origem-2026/" >}})

---

Sinta-se à vontade para entrar em contato para discutir este e outros tópicos em <contact@lucasaguiar.xyz>
