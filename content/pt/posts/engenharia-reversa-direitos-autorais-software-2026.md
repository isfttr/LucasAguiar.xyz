---
date: 2026-10-14T09:27:11-03:00
draft: true
title: "Engenharia reversa e direitos autorais em software: a linha entre copiar a função e copiar o código [2026]"
description: "Emuladores de videogame e alternativas abertas ao Adobe, como o ArtCraft, reimplementam funções protegidas? Entenda a fronteira legal entre ideia, funcionalidade e expressão no direito autoral de software."
featured_image: ""
categories:
  - article
tags:
  - engenharia-reversa
  - direito-autoral
  - software
  - emuladores
  - propriedade-intelectual
---

Software é protegido pelo direito autoral, mas essa proteção recai sobre a **expressão** do código — não sobre a ideia, o método ou a função que o programa executa. Emuladores de videogame e projetos abertos que reimplementam o Adobe Creative Cloud, como o **ArtCraft**, vivem exatamente nessa fronteira: eles copiam o que o software *faz*, sem copiar o código que o faz. Este artigo explica onde está essa linha, por que ela resiste há décadas nos tribunais e onde os riscos reais aparecem — do PlayStation aos casos recentes de emuladores e jailbreak.

## O que o direito autoral protege (e o que não protege) em software

No Brasil, o ponto de partida é a [Lei 9.609/98](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm) (Lei de Software), que trata o programa de computador como obra literária protegida. Mas a própria lei, assim como a [Lei 9.610/98](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) (LDA), limita o alcance:

- **Ideias, procedimentos, métodos e conceitos matemáticos não são protegidos** — a proteção não se estende à "expressão de ideias, procedimentos operacionais, métodos e conceitos matemáticos".
- O **art. 6º, III** é o dispositivo-chave: não constitui ofensa ao titular "a ocorrência de semelhança de programa a outro, preexistente, quando se der por força das **características funcionais** de sua aplicação, da observância de preceitos normativos e técnicos ou de limitação de forma alternativa para a sua expressão".
- O **art. 6º, IV** também exime a integração de um programa a um sistema aplicativo ou operacional quando tecnicamente indispensável ao uso de quem a promoveu.

Em tradução prática: dois programas podem fazer **exatamente a mesma coisa** sem que isso configure infração de direito autoral, desde que não tenham copiado o código-fonte um do outro. A "semelhança" que nasce da função é livre.

Essa mesma distinção é o coração da jurisprudência americana, que influencia o debate mundial. No caso [*Sega v. Accolade*](https://en.wikipedia.org/wiki/Sega_v._Accolade) (1992), a Corte de Apelações do 9º Circuito decidiu que a **engenharia reversa para alcançar interoperabilidade** é *fair use* (uso justo) — a Accolade podia desmontar o código do Mega Drive para criar jogos não licenciados e compatíveis. Foi o precedente fundador: decodificar um sistema para que outro software funcione com ele é legítimo.

## PlayStation: os precedentes do emulador

É aqui que entram os casos históricos do PlayStation, que ainda norteiam o tema:

- [*Sony Computer Entertainment v. Connectix*](https://en.wikipedia.org/wiki/Sony_Computer_Entertainment,_Inc._v._Connectix_Corp.) (2000, 9º Circuito): a Sony processou a Connectix pelo emulador Virtual Game Station (que rodava jogos de PS1 em Mac). A corte disse que a cópia *intermediária* da BIOS durante a engenharia reversa é *fair use*, porque o objetivo era **interoperabilidade** — criar um produto que rodasse os mesmos discos em outra plataforma. O emulador, por si só, não infringia direito autoral.
- No caso *Sony v. Bleem* (também de 2000), envolvendo o emulador Bleem!, a corte rejeitou os argumentos da Sony; o caso terminou a favor da viabilidade legal do emulador ([contexto](https://en.wikipedia.org/wiki/Bleem!)).

A lógica é robusta e simples: o emulador não copia os jogos nem o sistema — ele **reimplica em software o comportamento do hardware**, escrevendo código original. É engenharia reversa para interoperabilidade, protegida por *fair use* nos EUA e amparada pelo art. 6º, III no Brasil.

## O que mudou: o DMCA e o deslocamento do risco

Se o emulador em si é legal, por que desenvolvedores ainda fecham portas com medo de processo? Porque o direito autoral **não é mais a única** arma. O [Digital Millennium Copyright Act (DMCA)](https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act), de 1998, criou uma camada separada no §1201: a **anti-circunvenção**. Ela proíbe burlar *mecanismos de proteção* (DRM, criptografia, assinaturas) para acessar obra protegida — independentemente de o acesso em si configurar ou não infração de autoria.

Consequência prática: a contornar um controle técnico, mesmo para um propósito que seria legítimo (interoperabilidade, preservação, jailbreak), o risco passa a ser estatutário, e não mais amparado pelo fair use. É por isso que o "jailbreak" de consoles é tratado com tanto cuidado: não se discute a ideia de rodar software próprio, discute-se a **circunvenção** da proteção contra pirataria.

O caso mais emblemático dos últimos anos não foi da Sony, mas da Nintendo, e mostra o deslocamento. Em fevereiro de 2024, a Nintendo processou a **Tropic Haze**, a empresa por trás do emulador Yuzu (do Nintendo Switch); a empresa encerrou as atividades do Yuzu e do Citra em março de 2024 e fez um **acordo de US$ 2,4 milhões** ([relato](https://en.wikipedia.org/wiki/Yuzu_(emulator))). A ação não se baseou em "emulador é pirataria", mas em circunvenção de DRM e facilitação da pirataria de jogos. O recado do setor é claro: o campo de batalha deixou de ser a legalidade da engenharia reversa e passou a ser o **uso** do software reverso e a burla de mecanismos técnicos.

## ArtCraft: a alternativa aberta que reimplementa o Adobe e o Office

O [ArtCraft](https://github.com/storytold/artcraft) (projeto open-source, ~27 mil estrelas, escrito em Rust) leva essa discussão para o mundo dos aplicativos criativos. A proposta é uma suíte de **13 aplicativos nativos e abertos** que espelham, um a um, os nomes e as funções dos líderes de mercado ([catálogo](https://www.getartcraft.com/apps)):

- **PhotoCraft** (Photoshop), **VectorCraft** (Illustrator), **FilmCraft** (Premiere), **LightCraft** (Lightroom), **EffectCraft** (After Effects), **DesignCraft** (InDesign), **PdfCraft** (Acrobat), **FigCraft** (Figma), **WordCraft** (Word), **SoundCraft** (Audition), **DeckCraft** (PowerPoint), **CADCraft** (CAD) e **GridCraft** (Excel).

À primeira vista, parece uma "cópia do Adobe". Juridicamente, não — e é exatamente esse o ponto. Cada app é uma **reimplementação limpa** (clean-room) da *funcionalidade*, não uma cópia do código, dos ícones ou das marca registradas. Ele ocupa o mesmo nicho de GIMP, Inkscape, LibreOffice e Penpot: a concorrência aberta por **função**, sem assinatura nem bloqueio.

Isso cai no mesmo princípio de emuladores: a **ideia** de editar imagem, montar layout ou desenhar vetor não é protegível; a **expressão** (o código do Photoshop) é. Enquanto o ArtCraft escreve código original, não copia ativos protegidos (asset packs, filtros proprietários) e não usa nomes/logos das marcas, ele está no terreno seguro do art. 6º, III brasileiro e da doutrina de *fair use* americana.

Onde o risco aparece de verdade:

1. **Trade dress e identidade visual** — copiar a *aparência distintiva* (layout de interface reconhecível, ícones) pode atrair ação por concorrência desleal ou marca, ainda que o código seja original.
2. **Ativos proprietários** — importar brushes, presets, fontes ou plugins com licença restrita transfere a infração para fora da "mera função".
3. **Mecanismos de proteção** — se um produto precisar burlar DRM ou assinatura criptográfica para alcançar a interoperabilidade, entra-se no campo da anti-circunvenção (DMCA §1201), fora do fair use.
4. **Marcas e trade names** — batizar o clone com nome parecido ou em paródia direta de marca registrada é o atalho mais rápido para a justiça.

## Conclusão: o que observar

A regra de ouro se mantém estável há 30 anos: **copy the function, not the expression.** Copiar o que o software faz, escrevendo código original, é lícito — no Brasil expressamente (art. 6º, III da Lei 9.609/98) e nos EUA por *fair use* (Sega v. Accolade, Sony v. Connectix). Emuladores de PlayStation e plataformas abertas como o ArtCraft provam que dá para competir com gigantes sem tocar no código delas.

O que mudou nas últimas décadas é onde o litígio se concentra: saiu da originalidade do código e foi para a **anti-circunvenção** (DMCA §1201), a **pirataria que o software reverso possibilita** e a **confusão de marcas/trade dress**. O caso recente do Yuzu (2024) ilustra o primeiro e o segundo; o desenho do ArtCraft alerta para o terceiro. Para quem constrói ou defende um produto assim, o checklist é curto: código limpo e original, zero ativos licenciados copiados, nenhum nome/logo de terceiros, e — acima de tudo — nada de burlar mecanismos de proteção sem conhecer as regras específicas de anti-circunvenção do seu país.

Para se aprofundar no lado do registro e da proteção formal do software, veja nosso guia sobre [como registrar um programa de computador no INPI]({{< relref "posts/guia-registro-programa-computador-inpi/" >}}) e a comparação entre [patente de software e registro de programa de computador no Brasil]({{< relref "posts/patente-software-vs-registro-programa-computador-brasil/" >}}). E, para o debate mais amplo do direito autoral na era digital, leia o post sobre [direito autoral na era da IA]({{< relref "posts/pi-em-questao-direito-autoral-inteligencia-artificial-inpi/" >}}).

Leia também:

- [Como Registrar um Programa de Computador no INPI: Guia Completo]({{< relref "posts/guia-registro-programa-computador-inpi/" >}})
- [Patente de Software vs Registro de Programa de Computador no Brasil]({{< relref "posts/patente-software-vs-registro-programa-computador-brasil/" >}})
- [Direito autoral na era da IA: INPI reúne especialistas internacionais]({{< relref "posts/pi-em-questao-direito-autoral-inteligencia-artificial-inpi/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>