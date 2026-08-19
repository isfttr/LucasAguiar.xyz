---
date: 2026-08-18T18:06:55.000Z
draft: false
title: "Como Dividir um Commit do Git: Guia Passo a Passo [2026]"
description: "Guia passo a passo para dividir um commit git em vários commits com git puro: git reset --soft, git add -p e rebase interativo. Funciona em qualquer versão do git."
featured_image: ""
categories:
  - article
tags:
  - git
  - version-control
  - developer-tools
  - workflows
  - command-line
slug: dividir-commit-git-guia
translation_source_hash: 74ae46f2ff6300e6ee2a8ec679aa5cd6a6a823070d640966480aa4c8cfe0d1b7
---
Este guia aborda os dois casos que você realmente vai enfrentar: dividir o commit mais recente (o caminho rápido) e dividir um commit mais antigo enterrado no histórico (o caminho do rebase interativo). Ambos produzem commits atômicos — do tipo que torna `git log`, code review e `git bisect` muito mais úteis.

## Por que dividir um commit?

Um commit deve ser uma única mudança lógica. Quando você mistura uma renomeação não relacionada com uma correção de segurança em um único commit, você cria três problemas concretos:

- **A revisão fica mais difícil.** Seu revisor não consegue dizer qual parte do diff pertence a qual preocupação.
- **`git bisect` mente para você.** Quando uma regressão é encontrada, o bisect aponta para um commit que contém dezenas de mudanças não relacionadas, e isolar a linha ruim vira arqueologia.
- **Reverter é tudo ou nada.** Se o refactor é ruim mas a correção de bug é boa, você não pode reverter apenas o refactor.

Dividir é a solução. Se você quiser o panorama completo de reescrever a história com segurança — incluindo os fluxos de trabalho mais novos `fixup` e `reword` — veja nosso [guia completo de comandos de histórico do git]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}).

## Caso 1: Dividir o commit mais recente

Este é o caso mais simples e cobre a maioria das necessidades do mundo real. A ideia: desfazer o commit mas manter suas alterações na área de staging, e então commitá-las novamente em pedaços menores.

### Passo 1 — Desfazer o commit, mantendo as alterações

```bash
git reset --soft HEAD~1
```

`--soft` move o `HEAD` um commit para trás, mas deixa seu índice e sua árvore de trabalho exatamente como estavam. Nada é perdido — as alterações do último commit agora estão em staging, como se você nunca tivesse commitado.

### Passo 2 — Remover tudo do staging

```bash
git reset
```

Isso remove todos os arquivos do staging (reset misto para HEAD). Agora você está vendo suas alterações como uma árvore de trabalho limpa, exatamente como antes do commit original.

### Passo 3 — Adicionar ao staging e commitar a primeira parte

```bash
git add -p
```

`git add -p` percorre cada hunk das suas alterações e pergunta, hunk por hunk, se você quer adicioná-lo ao staging. Digite `y` para adicionar um hunk ao staging, `n` para pulá-lo, `s` para dividir um hunk ainda mais, e `e` para editá-lo manualmente. É aqui que você separa as duas mudanças lógicas.

```bash
git commit -m "fix: correct the login redirect"
```

### Passo 4 — Commitar o restante

```bash
git add -A
git commit -m "refactor: extract auth helper"
```

É isso. Um commit virou dois, cada um com uma mensagem focada. Verifique com `git log --oneline -3`.

## Caso 2: Dividir um commit mais antigo

Quando o commit a ser dividido não é o `HEAD`, você precisa de um rebase interativo para retroceder temporariamente a história até aquele ponto.

### Passo 1 — Iniciar um rebase interativo

```bash
git rebase -i HEAD~N
```

onde `N` é o número de commits atrás em que o seu alvo se encontra (por exemplo, `HEAD~5` se o commit está há cinco commits). Seu editor abre uma lista de commits:

```
pick abc1234 Mixed changes nobody asked for
pick def5678 Add feature X
pick 9ab0123 Fix tests
```

### Passo 2 — Marcar o commit como `edit`

Altere `pick` para `edit` na linha do commit que você quer dividir, salve e feche o editor. O Git para logo após reproduzir esse commit, deixando suas alterações em staging.

### Passo 3 — Aplicar a mesma rotina de divisão

Agora você está na mesma situação do Caso 1:

```bash
git reset            # unstage everything
git add -p           # stage hunk by hunk
git commit -m "fix: correct the login redirect"
git add -A
git commit -m "refactor: extract auth helper"
```

### Passo 4 — Continuar o rebase

```bash
git rebase --continue
```

O Git reproduz os commits restantes no topo dos seus dois novos commits. Se commits posteriores tocarem nas mesmas linhas que você moveu, você pode ter conflitos de merge — resolva-os com o ciclo usual de `git add` + `git rebase --continue`.

## Um exemplo completo

Suponha que seu histórico seja assim:

```
$ git log --oneline -3
7f3a9d1 add search + fix CSS bug
b2c4e77 add search endpoint
a1b2c3d update README
```

`7f3a9d1` mistura uma funcionalidade (search) com uma correção de CSS não relacionada. Para dividi-lo:

```bash
git reset --soft HEAD~1
git reset
git add -p              # stage only the search feature hunks
git commit -m "feat: add search"
git add -A
git commit -m "fix: CSS bug in results page"
```

Resultado:

```
$ git log --oneline -4
f0e1d2c fix CSS bug in results page
e8a7b6c feat: add search
b2c4e77 add search endpoint
a1b2c3d update README
```

Dois commits limpos e atômicos em vez de uma miscelânea.

## E o novo comando `git history split`?

Se você estiver no git 2.54+ (abril de 2026), agora existe um recurso experimental integrado que automatiza exatamente esse fluxo de trabalho: `git history split <ref>` pergunta a você, hunk por hunk, o que vai no primeiro commit e escreve as duas mensagens de commit para você. É conveniente, mas é experimental e restrito à versão — o fluxo de trabalho com git puro acima funciona em qualquer lugar, e é por isso que continua sendo a abordagem documentada na [thread canônica do Stack Overflow sobre dividir um commit em vários commits](https://stackoverflow.com/questions/6217156/break-a-previous-commit-into-multiple-commits) (a resposta mais votada lá ainda é a variante trabalhosa; a [resposta curta moderna](https://stackoverflow.com/a/79929889) é a rotina `reset --soft` + `add -p` mostrada aqui). O [capítulo do livro oficial do git sobre reescrever a história](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) cobre o mesmo assunto.

## Armadilhas comuns

- **Nunca reescreva commits que você já enviou para um branch compartilhado.** Dividir reescreve a história; qualquer pessoa que puxou o commit antigo vai encontrar históricos divergentes. Se o branch é compartilhado, combine com a equipe e espere um force-push (`git push --force-with-lease`) — ou mantenha a divisão local e faça isso antes de enviar, em primeiro lugar.
- **`git reset --soft` vs `git reset`:** o primeiro mantém as alterações em staging, o segundo as remove do staging. Perder o segundo passo deixa você incapaz de selecionar hunks de forma seletiva.
- **Hunks que não podem ser divididos automaticamente.** `git add -p` nem sempre divide um hunk; pressione `e` para editá-lo manualmente. Alterações em linhas adjacentes frequentemente precisam disso.
- **Conflitos durante `git rebase --continue`:** esperados se commits posteriores tocarem o mesmo código. Resolva, `git add`, continue — os dois novos commits permanecem intactos.
- **Não use `git commit --amend` por acidente** no meio de uma divisão — ele vai mesclar seu primeiro commit parcial com o anterior. Commite normalmente, não com `--amend`.

## Quando dividir se encaixa no seu fluxo de trabalho

Dividir é a etapa de limpeza que torna tudo a jusante mais fácil: [pull requests empilhadas]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) funcionam melhor quando cada commit na pilha é atômico, e ferramentas como [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) existem em grande parte para evitar o problema do "commit único grande" na origem. Mesmo assim, conhecer a rotina com git puro é a habilidade básica — ela funciona em um checkout limpo, em containers de CI e em servidores onde nenhuma ferramenta sofisticada está instalada.

A regra para levar com você: commite pequeno, commite com frequência, e quando escorregar, divida.

Leia também:

- [Histórico do Git em 2026: Guia Completo para os Comandos fixup, reword e split]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Pull Requests Empilhados: Guia Completo e Melhores Práticas [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})
- [GitButler: O Que É, Review e Alternativas [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.
