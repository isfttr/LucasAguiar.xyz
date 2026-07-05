---
date: 2026-07-05T10:00:00-03:00
draft: true
title: "GitButler no Terminal"
description: "Explorando o novo CLI e TUI do GitButler — como o 'but' está transformando o fluxo de trabalho Git direto do terminal, sem precisar sair do editor. Comparação com o Desktop e dicas de comandos."
featured_image: ""
categories:
  - article
tags:
  - git
  - gitbutler
  - cli
  - terminal
  - developer-tools
  - productivity
  - versao-controle
---

São 23h de uma sexta-feira, você abre o terminal, dá um `mkdir`, um `git init`, e mergulha no código. Duas horas depois, o editor está cheio de abas, você tem meia dúzia de arquivos alterados e aquela voz na cabeça diz: "isso merece uns commits organizados".

Se você usa o GitButler, todo esse processo passa por diversos `Cmd+Tab` para o GitButler Desktop. Criar uma virtual branch. Voltar para o editor. Escrever mais código. `Cmd+Tab` de volta. Mover os arquivos entre branches. Fazer o commit. Gerar uma mensagem com IA. `Cmd+Tab` para o editor. E de novo. E de novo.

O [GitButler Desktop](https://docs.gitbutler.com/overview) me conquistou em abril de 2025 — escrevi [minha experiência](/pt/posts/one-week-review-gitbutler/) duas semanas depois de começar a usar, e desde então ele substituiu completamente meu Git na linha de comando. As virtual branches, a timeline de operações, a resolução visual de conflitos... tudo isso fazia sentido numa janela dedicada.

Mas o tempo passou. E o GitButler cresceu.

## A descoberta no terminal

Uma noite, fuçando o site de documentação, me deparei com uma seção que não estava lá da última vez: "[GitButler CLI](https://docs.gitbutler.com/cli-overview)". A descrição dizia algo que me fez parar: *"all of the same powerful things that the GUI does, but from the terminal or via scripts or agents."*

Tudo o que o Desktop faz? No terminal?

Digitei `but tui` no repositório de um side project, meio cético. E o terminal virou um workspace Git interativo. Bem parecido com o LazyGit, para que já utilizou - só que com a UI mais simplificada.

![TUI do GitButler](https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png)

A interface não é um mero `git log` melhorado. Era o GitButler completo: branches aplicadas, mudanças não atribuídas, commits, diff, tudo num display dividido, navegável por teclado. `j`/`k` pra navegar, `d` pra abrir detalhes de um commit, `c` pra commitar, `?` pra ver todos os atalhos disponíveis.

A [TUI do GitButler](https://docs.gitbutler.com/gitbutler-tui) é o que o `git` deveria ser em 2026: um workspace visual sem sair do terminal.

## Como funciona na prática

Vou ilustrar com um cenário concreto. Imagine que você está criando um projetinho — digamos, uma API de bookmarks. Você codifica durante umas horas, criando modelos, controladores e rotas. Antes de qualquer comando Git, `but status` mostra algo assim:

```
╭┄zz [unstaged changes]
┊   g0 M Gemfile
┊   h0 A app/controllers/bookmarks_controller.rb
┊   i0 A app/models/bookmark.rb
┊   j0 M app/models/user.rb
┊   k0 A app/views/bookmarks/index.html.erb
┊   l0 M config/routes.rb
│
┴ 204e309 (common base) [origin/main]
```

Repare: você não criou uma branch ainda. Não fez `git checkout -b`. Os arquivos estão ali, "não atribuídos" — exatamente como no Desktop. A diferença é que você não saiu do terminal para ver isso.

O próximo passo natural:

```bash
$ but branch new user-bookmarks
✓ Created branch user-bookmarks
```

```bash
$ but commit -m 'feat: add bookmarks table, controller, and views'
✓ Created commit d4147cc on branch user-bookmarks
```

Pronto. Branch criada, commit feito, mensagem escrita. Tudo sem uma única troca de janela. O [tutorial completo de branching e committing](https://docs.gitbutler.com/cli-guides/cli-tutorial/branching-and-commiting) tem mais exemplos, incluindo como criar branches a partir de mudanças não atribuídas e como comitar para branches específicas.

## Desktop vs CLI

O [meu post anterior sobre o GitButler](/pt/posts/one-week-review-gitbutler/) foi basicamente um testamento ao Desktop. E ele continua sendo uma ferramenta fantástica para certos momentos. Mas depois de algumas semanas usando o CLI, criei uma heurística pessoal:

**Desktop** é para quando você quer *explorar* — abrir um repositório que não vê há semanas, entender a árvore de branches, resolver conflitos visualmente arrastando hunks entre branches, ou inspecionar o histórico com a timeline.

**CLI/TUI** é para quando você está no *fluxo* — codificando sem interrupção, fazendo commits granulares, alternando entre branches em segundos, sem tirar as mãos do teclado.

Na minha opinião, o CLI complementa o app Desktop. E a integração entre os dois é transparente desde a versão [0.20.1](https://github.com/gitbutlerapp/gitbutler/releases): mudanças feitas pelo `but` aparecem automaticamente no Desktop sem refresh manual, e vice-versa.

### Comandos que viraram meu novo padrão

Alguns comandos que uso toda hora:

- `but diff` — diff completo com contexto de workspace, melhor que `git diff` porque entende branches virtuais
- `but diff --tui` — visualizador de diff interativo, com lista de arquivos à esquerda e diff à direita
- `but stage` — stage interativo de hunks, essencial quando você quer separar alterações não relacionadas no mesmo arquivo entre branches diferentes
- `but rub` — o comando mais GitButler de todos: "rubbing" é o ato de mover alterações entre branches ou commits, algo que no Desktop você faz arrastando e que no terminal é `but rub feature-a` para jogar as mudanças do branch atual para outro
- `but branch list` — lista todas as branches virtuais aplicadas
- `but oplog` — o operations log, que salva cada ação que você faz no CLI para poder desfazer/refazer
- `but undo` / `but redo` — desfazer/refazer qualquer operação

Uma das coisas mais surpreendentes é o `but show` com `--json`. Da para ver o output legível:

```
Commit:    26724656b8856871542da1e69c888b2e7330294a
Change-ID: pzyoupplvookqoqpussrpnnlrwqsnzkr
Author:    Scott Chacon
Date:      2026-02-04 07:22:53 +0100 (3d ago)

hero update - new branding

Files changed:
  M app/models/user.rb
  M app/views/home/index.html.erb
  A test.md
```

Ou, com `but show --json 2672465 | jq`:

```json
{
  "commit": "26724656b8856871542da1e69c888b2e7330294a",
  "author": { "name": "Scott Chacon" },
  "message": "hero update - new branding\n",
  "files": [
    { "path": "app/models/user.rb", "status": "modified" },
    { "path": "app/views/home/index.html.erb", "status": "modified" },
    { "path": "test.md", "status": "added" }
  ]
}
```

Como a [documentação de scripting](https://docs.gitbutler.com/cli-guides/cli-tutorial/scripting) diz: *"você pode fazer isso com qualquer comando — commit, status, diff. É só jogar um `--json` e você obtém dados parseáveis."*

## O caso dos agentes de IA

Aqui a coisa fica realmente interessante. O CLI do GitButler não foi feito só para humanos. Desde a [versão 0.20.0](https://github.com/gitbutlerapp/gitbutler/releases/tag/release/0.20.0) (junho/2026), o foco principal do time virou o uso por **agentes de IA**.

O comando `but agent setup` é um wizard interativo que configura o GitButler para funcionar com agentes de coding como Claude Code ou Codex. Ele instala uma skill GitButler no repositório e configura workflows de version control automáticos. A [documentação de AI Agents](https://docs.gitbutler.com/ai-agents/overview) detalha como múltiplos agentes podem trabalhar em paralelo, cada um usando o `but` para branch, commit e PR sem pisar nos outros.

Para quem acompanha o mundo de agentes de código, isso é um avanço enorme. Antes, cada agente que precisava fazer um commit ou criar uma branch tinha que ou (a) usar Git puro na linha de comando — e lidar com merge hell — ou (b) ter seu próprio fluxo proprietário. Com o GitButler CLI, o agente simplesmente executa `but branch new` e `but commit -m`, e tudo fica orquestrado pelo workspace de branches virtuais.

O `but commit --ai` também merece destaque: em vez de gastar tokens do seu modelo gerando mensagens de commit, o GitButler analisa as mudanças e gera uma mensagem contextualizada localmente. O [guia de IA](https://docs.gitbutler.com/cli-guides/cli-tutorial/ai-stuff) explica como configurar tudo.

## O que ficou para trás

Quando escrevi o review do Desktop em 2025, mencionei algumas limitações: problemas com o Ollama local, convenções de nomenclatura de branches, e uma pequena curva de aprendizado com o conceito de virtual branches.

Com o CLI, esses pontos evoluíram de forma interessante:

- A interface de teclado (`j`/`k` para navegar, `?` para ajuda) é natural para quem já usa Vim ou menos no terminal
- O `but tui` tem um modo de comando (`:`) que permite executar comandos `but` sem sair da TUI — então você nunca precisa lembrar "qual tecla faz o quê", pode só digitar `:commit -m "mensagem"`
- A curva de aprendizado virou "só mais um CLI" — se você sabe usar `git`, o `but` é familiar, só que mais poderoso

## Vale a pena migrar?

Se você já usa o GitButler Desktop, a resposta é: **experimente**. Instale o CLI (vem junto com o Desktop, é só ter o `but` no PATH), entre num repositório que você conhece bem, e passe uma tarde usando só `but status`, `but diff`, `but commit` e `but tui`.

Você vai sentir falta de algumas coisas do Desktop — a visualização de conflitos arrastando hunks é insubstituível, e a timeline com undo visual é mais fácil de navegar com mouse. Mas para 80% do trabalho do dia a dia — commitar, criar branches, fazer diff, inspecionar o histórico — o terminal é mais rápido.

Meu fluxo hoje é híbrido: codifico no editor, commito e branchio com o CLI, e abro o Desktop para resolução de conflitos, revisão visual de PRs, e quando quero ver o "big picture" do repositório com várias branches empilhadas.

Para quem **não** usa o GitButler ainda, o CLI é uma porta de entrada mais baixa. Não precisa instalar mais uma GUI. Não precisa aprender uma interface nova. É só `brew install gitbutler` ou baixar do [site oficial](https://gitbutler.com), rodar `but setup` no seu repositório, e começar.

---

O GitButler Desktop me conquistou em 2025. O CLI me manteve em 2026. É raro ver uma ferramenta que consegue ser excelente tanto como GUI quanto como terminal — e a equipe do Scott Chacon está conseguindo.

Se você experimentar, sugiro começar pela [visão geral do CLI](https://docs.gitbutler.com/cli-overview), depois ver o [guia do TUI](https://docs.gitbutler.com/gitbutler-tui), e deixar o `but` virar parte do seu vocabulário de terminal. Quem sabe você também abandona o `git` puro de vez.

Leia também:

- [Duas Semanas com GitButler: Simplificando Meu Fluxo de Trabalho Git]({{< relref "posts/one-week-review-gitbutler/" >}})
- [Cursor vs Windsurf vs Zed 2026: Qual Editor de Código com IA é o Melhor?]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Da Procrastinação ao Progresso: Como a IA me tem ajudado]({{< relref "posts/ai-beats-procrastination/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
