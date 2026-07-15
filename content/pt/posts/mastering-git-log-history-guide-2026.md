---
date: 2026-07-14T18:05:22.000Z
draft: true
title: 'Histórico do Git em 2026: Guia Completo para os Comandos fixup, reword e split'
description: Guia passo a passo para o histórico do git — o comando experimental que permite corrigir commits antigos, reescrever mensagens e dividir alterações sem as assustadoras sessões de rebase -i. Inclui exemplos práticos de cada subcomando.
featured_image: ''
categories:
  - article
tags:
  - git
  - developer-tools
  - workflow
  - version-control
  - productivity
slug: guia-git-2026-fixup-reword-split
translation_source_hash: a560cbdf21319c96cb71fa33e1f24e1f5647e460273503f57c787efa2a0f82b3
---
Você está a três commits de profundidade em um branch de funcionalidade quando percebe: um erro de digitação em uma mensagem de commit de dois commits atrás e um bug no código de três commits atrás. Normalmente, isso significa `git rebase -i`, uma sessão interativa, correção manual de conflitos e reorganização dos arquivos da sua árvore de trabalho depois. Se você já passou por um rebase que deu errado e deixou seu repositório em um estado semi-reescrito, sabe o pavor.

Desde o git 2.54 (abril de 2026), existe uma maneira melhor. `git history` é um comando experimental que agrupa três operações — `fixup`, `reword` e `split` — em operações atômicas e livres de conflitos que reescrevem o histórico com segurança, sem nunca deixar sua árvore quebrada. Ele funciona em todos os seus branches, fazendo rebase automaticamente de tudo sobre as alterações.

Este guia aborda cada subcomando com exemplos reais e explica quando usar `git history` em vez de `rebase -i`.

## O Que é git history?

`git history` é um comando experimental adicionado ao git principal em duas versões:

- **git 2.54** (abril de 2026): introduziu `reword` e `split`
- **git 2.55** (junho de 2026): introduziu `fixup`

Todos os três subcomandos compartilham o mesmo design central: eles reescrevem o histórico de forma atômica. Se uma operação produzisse um conflito, o git se recusa a executá-la em vez de deixá-lo em um estado parcialmente rebasado. Isso é fundamentalmente diferente do `rebase -i`, que aplica cada etapa sequencialmente e para no primeiro conflito, muitas vezes deixando a árvore em um estado inconsistente.

O comando vem junto com o próprio git — nenhuma ferramenta extra para instalar. Você pode testá-lo agora mesmo se estiver no git 2.55+:

```bash
git history --help
```

## git history fixup: Corrigindo Commits Antigos

`git history fixup` é o mais impactante dos três. Ele permite que você adicione uma correção na área de staging, aponte para um commit antigo, e o git incorpora a correção naquele commit enquanto faz rebase automaticamente de todos os branches que o continham.

### Uso básico

```bash
# Faça a correção, adicione à área de staging
git add caminho/para/correcao.diff

# Incorpore as alterações em staging no commit ABC123
git history fixup ABC123
```

O git recria o commit `ABC123` com a correção aplicada e depois reconstrói todos os commits descendentes dele — em todos os branches locais. Todos os ponteiros dos branches são movidos junto.

### O que o torna diferente de --fixup + autosquash

A abordagem tradicional é:

```bash
git commit --fixup ABC123
git rebase -i --autosquash ABC123~1
```

Isso funciona, mas tem dois problemas:

1. **Escopo:** `rebase --update-refs` só move referências dentro do intervalo do rebase. `git history fixup` encontra e atualiza **todos** os branches locais descendentes do commit alvo.

2. **Atomicidade:** Se o rebase encontrar um conflito, você é jogado na resolução de conflitos no meio da operação. `git history fixup` simplesmente se recusa se um conflito ocorresse — nenhum estado pela metade.

### Exemplo

Você tem um branch de funcionalidade `feat/search` baseado em `main`, e um colega tem `feat/export` baseado no mesmo ponto. O commit `B` em `main` tem um bug. Você adiciona a correção na área de staging e executa `git history fixup B`. O git reescreve `B` e depois reconstrói automaticamente tanto `feat/search` quanto `feat/export` sobre o commit corrigido.

```bash
# Antes: main → A → B(com bug) → C(ponta de feat/search)
#                          → D(ponta de feat/export)

git add src/fix.diff
git history fixup B

# Depois: main → A → B*(corrigido) → C*(ponta de feat/search)
#                             → D*(ponta de feat/export)
```

Sem rebase manual de branches dependentes. Sem perda de contexto.

## git history reword: Editando Mensagens de Commit

`git history reword` permite que você altere a mensagem de qualquer commit passado sem perturbar sua árvore de trabalho.

```bash
git history reword ABC123
```

Isso abre seu editor com a mensagem de commit existente. Edite, salve, e o git reescreve o commit com a nova mensagem, reconstruindo tudo acima. Diferente do `fixup`, o `reword` nunca toca no seu índice ou árvore de trabalho — ele funciona puramente no grafo de commits.

Isso é útil quando:

- Uma mensagem de commit tem um erro de digitação que você notou três commits depois
- O escopo de uma alteração mudou durante o desenvolvimento e a mensagem original não reflete mais o que o commit realmente faz
- Você quer adicionar uma referência a um rastreador de issues em uma mensagem de commit antiga

```bash
# Reescreva a mensagem do commit anterior ao HEAD
git history reword HEAD~1
```

Como não toca na árvore de trabalho, você pode alterar a mensagem de um commit em um branch que nem está com checkout ativo.

## git history split: Dividindo um Commit em Dois

`git history split` extrai um único commit em dois commits lógicos. Ele o coloca em um prompt interativo, bloco por bloco (hunk), sobre o diff do commit alvo. Os blocos que você selecionar se tornam o primeiro commit; o restante se torna o segundo.

```bash
git history split ABC123
```

Isso é inestimável quando você percebe que um commit agrupou duas alterações não relacionadas. Por exemplo, um commit que tanto refatora uma função quanto adiciona uma nova funcionalidade:

```bash
# Antes: A → B(refatoração + nova funcionalidade) → C
git history split B
# Selecione: mantenha os blocos de refatoração primeiro, pule os blocos da funcionalidade
# Depois: A → B1(refatoração) → B2(nova funcionalidade) → C*
```

A divisão preserva o restante do histórico: o commit `C` é reconstruído sobre `B2`, e todos os branches acompanham.

## Como git history se Compara ao jj

`jj` (Jujutsu) recebe muita atenção como uma alternativa ao git, especialmente por sua abordagem de trabalhar com histórico. As principais diferenças:

| Capacidade | git history | jj |
|-----------|-------------|-----|
| Corrigir commit antigo | `fixup` | `edit` + auto-rebase |
| Alterar mensagem | `reword` | `describe` |
| Dividir commit | `split` | `split` |
| Rebase automático de branches dependentes | Sim (todos locais) | Sim (todos) |
| Tratamento de conflitos | Recusa (atômico) | Conflitos de primeira classe |
| Log de operações / desfazer | Não | Sim |
| Cópia de trabalho como commit | Não | Sim |
| Instalação separada | Não (integrado) | Sim |

`git history` não tem a intenção de substituir o `jj`. Ele traz as operações de histórico mais comuns — corrigir, alterar mensagem, dividir — para o git padrão sem exigir que você mude todo o seu fluxo de trabalho.

## Limitações

A partir do git 2.55, `git history` tem limitações importantes:

- **Sem commits de merge:** ele se recusa a operar em ou através de commits de merge
- **Sem resolução de conflitos:** as operações abortam se ocorrer um conflito, em vez de carregar os conflitos adiante como o `jj` faz
- **Apenas branches locais:** funciona em branches locais, não em branches de rastreamento remoto

A documentação explicitamente deixa espaço para melhorias futuras:

> "Esta limitação é proposital, pois reescritas de histórico não têm a intenção de serem operações com estado. A limitação pode ser removida assim que (se) o Git aprender sobre conflitos de primeira classe."

## Primeiros Passos

Se você está no git 2.55 ou superior, `git history` já está disponível:

```bash
# Verifique sua versão do git
git --version

# Ativar comandos experimentais (pode ser necessário)
git config --global set experimental.uiCommands true

# Experimente a ajuda
git history --help
```

Para versões mais antigas, atualize o git através do seu gerenciador de pacotes:

```bash
# Ubuntu/Debian
sudo add-apt-repository ppa:git-core/ppa
sudo apt update && sudo apt install git

# macOS
brew upgrade git

# Arch
sudo pacman -S git
```

## Resumo

`git history` preenche uma lacuna real nas ferramentas do git. As três operações — fixup, reword, split — cobrem os cenários mais comuns de reescrita de histórico que anteriormente exigiam sessões de `rebase -i`, gerenciamento manual de branches e um momento de oração antes de cada comando. É atômico, consciente de branches e já vem integrado ao git.

Se você ainda usa `rebase -i` para cada correção, experimente `git history fixup` uma vez. A diferença na confiança por si só já vale a pena.

— gerenciando branches visualmente sem sair do CLI
- [Duas Semanas com GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) — simplificando o fluxo de trabalho Git com uma camada GUI
- [GitLost: Injeção de Prompt no Agente de IA do GitHub]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}) — implicações de segurança de fluxos de trabalho Git com IA

Leia também:

- [Duas Semanas com GitButler: Simplificando Meu Fluxo de Trabalho Git]({{< relref "posts/one-week-review-gitbutler/" >}})
- [GitLost [2026]: Como a Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})
- [GitButler no Terminal]({{< relref "posts/gitbutler-terminal-cli-tui-2026/" >}})

---

Entre em contato para falar sobre este e outros assuntos pelo email <contact@lucasaguiar.xyz>
