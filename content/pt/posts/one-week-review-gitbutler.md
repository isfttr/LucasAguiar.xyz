---
date: 2025-04-10T16:36:59.000Z
draft: false
title: 'GitButler 2026: Review, Preço e Alternativas [Testado]'
description: 'Review do GitButler em 2026: como funcionam as virtual branches, cliente grátis vs Cloud pago, CLI e TUI, e GitButler vs jujutsu, worktrees, lazygit e Graphite.'
url: ''
featured_image: 'https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png'
categories:
  - article
tags:
  - git
  - workflow
  - gitbutler
  - developer-tools
  - productivity
  - version-control
aliases:
  - /pt/posts/gitbutler-what-is-review-alternatives-2026/
translation_source_hash: a9a04e1c49efe2c1b05840e4319adc86eae28496249ab5d985c090febf34837b
---

Você está no meio de uma feature, o time pede um hotfix urgente em produção, e sua working tree é um cemitério de mudanças pela metade. Git clássico: stash, troca de branch, stash de novo, e uma reza para lembrar qual stash era qual. Esse é exatamente o problema que o [GitButler](https://gitbutler.com) nasceu para resolver — e depois de usá-lo desde 2025, posso dizer que ele resolve isso na maior parte do tempo.

Este review cobre o que é o GitButler em 2026, como as virtual branches se comportam no uso diário, o que o cliente gratuito inclui e como ele se compara com jujutsu, git worktrees, lazygit e os outros clientes Git que valem consideração.

## O que é o GitButler?

O GitButler é um cliente Git moderno (aplicativo desktop, CLI `but` e TUI de terminal) construído sobre o Git padrão, criado por [Scott Chacon](https://github.com/schacon) — um dos cofundadores do GitHub. Ele não faz fork do Git nem inventa um novo formato de armazenamento: seu repositório continua sendo um repositório Git normal e cada branch criada nele é uma branch real. O projeto cresceu rápido: **21,5 mil estrelas no GitHub**, com a versão estável **0.22.0 "Catch 22"** (julho/2026), depois de um ano que incluiu uma **Série A de US$ 17 milhões liderada pela a16z** ([anúncio](https://blog.gitbutler.com/series-a/)).

A ideia central são as **virtual branches**: em vez de uma branch ativa e uma pilha de stashes, você mantém várias branches "abertas" ao mesmo tempo no mesmo diretório de trabalho. As mudanças são atribuídas a uma branch virtual — manualmente ou por regras automáticas (por exemplo, uma branch por arquivo). Cada branch virtual pode ser commitada e enviada (push) de forma independente para sua branch de destino. Acabou o vai-e-vem de `git checkout`. Quando você quer pausar o trabalho em uma branch, basta "unapply": as mudanças saem da working tree, mas continuam armazenadas com segurança no Git como commits ocultos. Conflitos são tratados como cidadãos de primeira classe — rebases sempre funcionam e os commits em conflito ficam guardados até você resolvê-los, em qualquer ordem.

Parte dessas ideias vem claramente de sistemas de controle de versão alternativos, como o [Jujutsu](https://jj-vcs.github.io/jj/), criado por engenheiros do Google. No Jujutsu, tudo o que acontece entre um ponto e o próximo é commitado automaticamente — conceito que o GitButler trouxe para uma ferramenta compatível com Git e com interface gráfica, e é justamente por isso que ele é mais fácil de adotar.

## Como é usar o GitButler

Depois de instalar o GitButler, você configura seu primeiro repositório local. Você tem duas opções:

1. Criar um novo repositório do zero.
2. Clonar um repositório existente de um remoto.

O GitButler também oferece uma ótima integração com o GitHub, principalmente para criar pull requests, além de recursos de IA para gerar mensagens de commit e descrições de PR. Esses recursos foram particularmente úteis para mim.

![Screenshot of GitButler Repository Setup](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-repo-setup.png)

Depois de escolher o repositório, você recebe um workspace limpo: a barra lateral esquerda lista suas branches virtuais (criar, excluir, alternar), a direita mostra o status do repositório e as alterações não commitadas, e você pode mover arquivos alterados entre branches. Toda mudança cai na lane padrão, e se você tiver mais de uma lane aplicada pode definir quais recebem as novas mudanças automaticamente. Levei um tempo para internalizar isso, mas virou algo natural.

![Screenshot of GitButler Workspace](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-workspace.png)

As mensagens de commit podem ser geradas por IA depois que você seleciona os arquivos ou trechos que quer commitar: o GitButler lê o diff e sugere a mensagem, o que ajuda de verdade quando você volta a uma alteração horas depois. Normalmente aceito a sugestão e acrescento o contexto que vou precisar no futuro.

![Screenshot of GitButler Commit message](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-commit.png)

## O que mudou desde o primeiro review

Escrevi sobre o GitButler pela primeira vez depois de duas semanas de uso diário (2025). Um ano depois, o que mudou são justamente as partes que importam para quem avalia a ferramenta em 2026:

- **A CLI e a TUI `but`** (série 0.19+) levam o mesmo motor para o terminal, com saída `--json` para scripts. O `but land` faz merge direto na main e branches empilhadas são tratadas nativamente — essencial para quem trabalha com [pull requests empilhados]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}).
- **O log de operações é o recurso matador.** Toda operação é registrada, e `but undo` / `but redo` / `but oplog` dão uma rede de segurança de undo/redo que o Git puro não tem. Commitou na branch errada por acidente? Desfaz.
- **Editar histórico sem terror de `rebase -i`:** squash, reword, split, amend e mover commits por drag-and-drop ou CLI. Se você ainda está começando com [fluxos de histórico interativos]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}), esta é uma porta de entrada mais suave.
- **IA onde ela ajuda:** mensagens de commit, nomes de branch, descrições de PR e, desde a 0.22, resolução assistida de conflitos (`but resolve --ai`). No primeiro review, a integração com modelos locais via Ollama estava quebrada e os recursos de IA dependiam da nuvem — as versões de 2026 estão bem mais confiáveis.
- **PRs empilhados nativos** (0.22) no GitHub.

## O que funciona e o que não funciona

Depois de meses de uso, a lista honesta:

**O que funciona bem**

- **Virtual branches** eliminam de fato o custo da troca de contexto. Mantenho uma branch de feature, uma de tarefas e uma de experimentos abertas ao mesmo tempo, e os commits caem no lugar certo sem eu pensar nisso.
- **O histórico de undo/redo** acabou com meu medo de erro irreversível. É o recurso mais subestimado da ferramenta.
- **Commits granulares**: selecionar trechos específicos visualmente é melhor que `git add -p` para quem pensa em arquivos e telas.
- **Continua sendo Git padrão.** Se o GitButler desaparecer amanhã, `git log` e `git push` seguem funcionando exatamente igual. Sem lock-in.

**Limitações atuais**

- **É um modelo mental diferente.** Se você vive de `git checkout` + stash por reflexo, a primeira semana parece mais lenta, não mais rápida.
- **Evolui rápido** (0.19 → 0.22 em seis meses) e a CLI mudou nomes de comandos no caminho. A [documentação](https://docs.gitbutler.com/cli-overview) acompanha, mas não é a estabilidade do Git.
- **A integração com forges é GitHub-first.** GitLab e Bitbucket funcionam, mas o capricho está no GitHub.
- **O cliente gratuito** é o que a maioria dos desenvolvedores solo precisa, mas os recursos de equipe estão no Cloud.

## Preço em 2026

O cliente — aplicativo desktop, CLI `but` e TUI — é **gratuito**, distribuído sob a [licença Fair Source](https://github.com/gitbutlerapp/gitbutler): você pode ver, usar e contribuir, só não pode construir um produto concorrente em cima, e ele passa a MIT depois de dois anos. O plano pago é o **GitButler Cloud** (app.gitbutler.com), uma plataforma por assinatura com programa de "preço travado" para apoiadores iniciais; não há tabela pública de preços no site e o pagamento é gerenciado dentro do aplicativo. Para desenvolvedores solo e homelab, o cliente gratuito basta.

## Alternativas ao GitButler em 2026

| Ferramenta | Melhor para | Licença / Preço |
|---|---|---|
| [GitButler](https://gitbutler.com) | Virtual branches, undo, Git com IA | Cliente grátis + Cloud pago |
| [Jujutsu (jj)](https://jj-vcs.github.io/jj/) | VCS baseado em mudanças, edição de histórico, compatível com Git | Grátis, open source |
| [Git worktrees](https://git-scm.com/docs/git-worktree) | Várias branches em paralelo, sem ferramenta nova | Incluído no Git |
| [lazygit](https://github.com/jesseduffield/lazygit) | TUI de terminal rápida para Git | Grátis, open source |
| [Fork](https://git-fork.com) | GUI desktop polida para macOS/Windows | Grátis (doação) |
| [Sublime Merge](https://www.sublimemerge.com) | Cliente desktop focado em performance e diff | Pago |
| [Tower](https://www.git-tower.com) | Cliente desktop para iniciantes, com bom material de aprendizado | Pago (teste) |
| [GitKraken](https://www.gitkraken.com) | GUI com grafo de commits, LFS e ferramentas de time | Freemium + pago |
| [Graphite](https://graphite.dev) | Fluxo de PRs empilhados para trunk-based em escala | Grátis + pago |

Se você quer ficar 100% no terminal e em open source, **lazygit** e **Jujutsu** são as melhores escolhas. Se quer GUI + CLI sem aprender um novo modelo de VCS, o GitButler é a opção mais inovadora hoje. E se você não troca de branch mais de duas vezes por dia, [git worktrees]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) pode ser tudo o que você precisa.

## Veredito

O GitButler não é "Git com interface gráfica" — é uma releitura real de como as branches deveriam funcionar, e a aposta de 2026 em CLI, TUI e agentes o torna relevante até para quem vive no terminal. É gratuito, mantém seu repositório padrão, e o log de operações sozinho já justifica o download. Teste as virtual branches por duas semanas; se ainda sentir falta do `git stash`, a tabela de alternativas acima resolve.

## Referências

- [Jujutsu - A Git-compatible VCS](https://www.youtube.com/watch?v=LV0JzI8IcCY) - apresentação de Martin von Zweigbergk no GitMerge 2024 sobre os princípios de design do Jujutsu.
- [GitButler Product Demo](https://www.youtube.com/watch?v=agfyTN3HpRM) - visão geral das funcionalidades centrais e do fluxo de trabalho do GitButler.
- [Scott Chacon sobre internals do Git](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s) - a palestra que me convenceu de que o GitButler entendia o problema.

Leia também:

- [Histórico do Git em 2026: Guia Completo de fixup, reword e split]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Pull Requests Empilhados: Guia Completo e Boas Práticas [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})
- [De Cursor a Windsurf a Zed: Minha Jornada por Editores de Código com IA]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
