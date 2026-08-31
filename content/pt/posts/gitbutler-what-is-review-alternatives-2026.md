---
date: 2026-08-17T11:16:25-03:00
draft: false
title: "GitButler: O Que É, Review e Alternativas [2026]"
description: "GitButler é um cliente Git com virtual branches, CLI e TUI. Review honesto após meses de uso, modelo de preço e as melhores alternativas em 2026."
featured_image: ""
categories:
  - article
tags:
  - git
  - gitbutler
  - ferramentas-de-desenvolvimento
  - controle-de-versao
  - produtividade
---

Você está no meio de uma feature, o líder do time pede um hotfix urgente de produção e sua working tree é um cemitério de mudanças pela metade. Git clássico: você faz stash, troca de branch, stash de novo e reza para lembrar qual stash era qual. É exatamente esse problema que o GitButler nasceu para matar — e depois de usá-lo, com idas e vindas, desde 2025, acho que ele resolve na maior parte do tempo.

## O que é o GitButler?

O GitButler é um cliente Git moderno (app desktop, CLI `but` e um TUI de terminal) construído sobre o Git padrão, criado por [Scott Chacon](https://github.com/schacon) — um dos co-fundadores do GitHub. Ele não bifurca o Git nem inventa um formato novo de armazenamento: seu repositório continua sendo um repo Git normal, e toda branch que você cria com ele é uma branch de verdade. O projeto cresceu rápido: **21,5 mil estrelas no GitHub**, com a versão estável atual **0.22.0 "Catch 22"** (julho/2026), depois de um ano que incluiu um **investimento Série A de US$ 17 milhões liderado pela a16z** ([anúncio](https://blog.gitbutler.com/series-a/)).

A ideia central são as **virtual branches**: em vez de uma branch ativa e um monte de stashes, você mantém várias branches "abertas" ao mesmo tempo no mesmo diretório de trabalho. As mudanças são atribuídas a uma virtual branch — manualmente ou por regras automáticas (por exemplo, uma branch por arquivo). Cada virtual branch pode ser commitada e enviada de forma independente para sua branch de destino. Sem o vai-e-vem do `git checkout`. Quando você quer pausar o trabalho em uma branch, é só "desaplicar": as mudanças somem da working tree, mas ficam guardadas em segurança no Git como commits ocultos. Conflitos são tratados como cidadãos de primeira classe — rebases sempre funcionam, e commits conflitantes ficam armazenados até você resolvê-los, em qualquer ordem.

## Review: o que eu realmente uso

Meus [primeiros quinze dias com o GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) foram sobre o app desktop e as virtual branches. O veredito honesto depois de meses de uso:

**O que funciona bem**
- **Virtual branches** eliminam de verdade o custo de trocar de contexto. Mantenho uma branch de feature, uma de chores e uma de experimento abertas ao mesmo tempo, e os commits caem no lugar certo sem eu pensar nisso.
- **O operations log**. Toda operação é registrada, e `but undo` / `but redo` / `but oplog` dão uma rede de segurança de desfazer/refazer que o git puro não tem. Commitou na branch errada sem querer? Undo. É o recurso mais subestimado da ferramenta.
- **Edição de commits sem medo do `rebase -i`**: squash, reword, split, amend e mover commits por arrastar-e-soltar ou via CLI. Se você é novo em [workflows de histórico interativo]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}), essa é uma porta de entrada mais suave.
- **A CLI `but` e o TUI** (série 0.19+): o mesmo motor direto do terminal, com saída `--json` para scripting. `but land` faz merge direto na main; branches empilhadas são tratadas nativamente.
- **IA onde ajuda**: mensagens de commit, nomes de branch e descrições de PR gerados por IA e, desde a 0.22, resolução de conflitos assistida por IA (`but resolve --ai`).

**Limitações atuais**
- É um modelo mental diferente. Se você vive no `git checkout` + stash por reflexo, a primeira semana parece mais lenta, não mais rápida.
- O app e a CLI evoluem rápido (0.19 → 0.22 em seis meses), e a CLI mudou nomes de comandos no caminho. A [documentação](https://docs.gitbutler.com/cli-overview) acompanha, mas não é a estabilidade do git em si.
- A integração com forges é GitHub-first. GitLab e Bitbucket funcionam, mas é no GitHub que está o polimento (stacked PRs nativos chegaram na 0.22).

## Modelo de preço

O cliente — app desktop, CLI `but` e TUI — é **gratuito**, distribuído sob a [Fair Source license](https://github.com/gitbutlerapp/gitbutler) (você pode ver, usar e contribuir; só não pode construir um produto concorrente em cima; vira MIT depois de dois anos). A camada paga é o GitButler Cloud (app.gitbutler.com), uma plataforma por assinatura com programa early-supporter de "preço travado". Não existe tabela pública de preços no site — o pagamento é gerenciado dentro do app. Para devs solo e homelabbers, o cliente gratuito é tudo o que você precisa.

## Alternativas em 2026

| Ferramenta | Melhor para | Licença / Preço |
|---|---|---|
| [GitButler](https://gitbutler.com) | Virtual branches, undo, git com IA | Cliente grátis + Cloud pago |
| [Jujutsu (jj)](https://jj-vcs.github.io/jj/) | VCS baseado em mudanças, edição poderosa de histórico, compatível com Git | Grátis, open source |
| [Git worktrees](https://git-scm.com/docs/git-worktree) | Várias branches em paralelo, zero ferramentas novas | Incluso no Git |
| [lazygit](https://github.com/jesseduffield/lazygit) | TUI de terminal rápida para Git | Grátis, open source |
| [Fork](https://git-fork.com) | GUI desktop polida para macOS/Windows | Grátis (doação) |
| [Sublime Merge](https://www.sublimemerge.com) | Cliente desktop focado em performance, ótimo diff | Pago |
| [Tower](https://www.git-tower.com) | Cliente desktop para iniciantes com ótimo conteúdo de aprendizado | Pago (trial) |
| [GitKraken](https://www.gitkraken.com) | GUI desktop com grafo de commits, LFS e ferramentas de time | Freemium + pago |
| [Graphite](https://graphite.dev) | Workflow de stacked PRs para trunk-based dev em escala | Grátis + pago |

Se você quer continuar 100% terminal e open source, **lazygit** ou **Jujutsu** são as escolhas mais fortes. Se quer o combo GUI + CLI sem aprender um modelo mental novo de VCS, o GitButler é a opção mais inovadora do momento. E se você nunca troca de branch mais de duas vezes por dia, [git worktrees]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) podem ser tudo o que você precisa.

## Veredito

O GitButler não é "git, mas com interface" — é uma repensada real de como branches deveriam funcionar, e a aposta em CLI/TUI/agentes em 2026 o torna relevante até para usuários hardcore de terminal. É gratuito, mantém seu repositório padrão, e o operations log sozinho justifica o download. Teste as virtual branches por duas semanas; se ainda sentir falta do `git stash`, a tabela de alternativas acima resolve.

Leia também:

- [GitButler Review 2026: Meu Veredito Honesto Após 2 Semanas]({{< relref "posts/one-week-review-gitbutler/" >}})
- [Histórico do Git em 2026: Guia Completo para os Comandos fixup, reword e split]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Pull Requests Empilhados: Guia Completo e Melhores Práticas [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
