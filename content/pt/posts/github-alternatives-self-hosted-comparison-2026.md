---
date: 2026-08-17T18:10:00.000Z
draft: false
title: 'Alternativas ao GitHub em 2026: comparação entre opções auto-hospedadas e gerenciadas'
description: 'Compare Gitea, Forgejo, GitLab CE, Codeberg, SourceHut e Radicle em 2026: auto-hospedado vs gerenciado, uso de recursos, CI/CD, o histórico de indisponibilidades de 2026 que impulsiona a migração e uma lista de verificação prática.'
featured_image: ''
categories:
  - article
tags:
  - git
  - github
  - self-hosting
  - devops
  - version-control
slug: alternativas-github-2026-auto-hospedadas-gerenciadas
translation_source_hash: b5b277bb9093a522d67c046fb9c38464dd056ec353237b3a8fdc996460edbce7
---
Este guia é um passeio prático e orientado a decisões pelas alternativas reais: as forjas leves auto-hospedadas (Gitea, Forgejo, Gogs), a plataforma completa (GitLab CE), a sem fins lucrativos hospedada (Codeberg), a minimalista (SourceHut) e a totalmente descentralizada (Radicle). Para cada uma: o que é, quanto custa, quanto pesa e para quem é — além de uma lista de verificação de migração no final.

## O panorama num relance

| Opção | Tipo | Licença | Auto-hospedagem | CI/CD | Melhor para |
|---|---|---|---|---|---|
| **Gitea** | Forja leve | MIT | Sim (binário único) | Gitea Actions | Homelab, desenvolvedores solo, pequenas equipes |
| **Forgejo** | Forja leve (fork do Gitea) | MIT | Sim (binário único) | Forgejo Actions | Auto-hospedagem governada pela comunidade |
| **GitLab CE** | Plataforma DevOps completa | MIT (núcleo) | Sim (mais pesado) | GitLab CI/CD | Empresas, fluxos de trabalho complexos |
| **Gogs** | Forja ultraleve | MIT | Sim (binário único) | Limitado | Auto-hospedagem mínima |
| **Codeberg** | Forja hospedada (Forgejo) | — | Não (grátis para FOSS) | Forgejo Actions | Projetos de código aberto, postura contra IA |
| **SourceHut** | Forja minimalista | Serviço pago | Sim (auto-hospedável) | builds do sr.ht | Fluxos de trabalho centrados em e-mail |
| **Radicle** | Rede ponto a ponto | MIT | Nenhum servidor necessário | Radicle CI | Puristas da descentralização |

## Por que as pessoas estão procurando, afinal

As motivações aparecem em todas as discussões de "alternativas" e merecem ser nomeadas porque orientam a escolha:

- **Controle e privacidade.** Seus repositórios, issues e atividade ficam na infraestrutura de outra pessoa. Auto-hospedar significa que seu código nunca sai de um servidor que você controla — relevante para donos de homelab que já usam [Proxmox e contêineres]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).
- **Recursos de IA impostos por padrão.** Assistentes estilo Copilot, bots de revisão de código e debates sobre marca d'água em conteúdo (os mesmos que atingem todos os grandes produtos de IA em 2026) deixaram muitos desenvolvedores desconfortáveis com uma plataforma que decide por você como é a "assistência".
- **Interrupções e disponibilidade.** Quando uma plataforma falha bem na hora do deploy, o valor de um `git push` funcionando contra o seu próprio servidor se torna muito concreto. O GitHub registrou **nove incidentes críticos somente entre meados de junho e meados de agosto de 2026** — incluindo um grave no dia em que este post foi escrito (veja [o histórico de confiabilidade de 2026](#the-2026-reliability-record-today-is-not-an-exception) abaixo).
- **Custo.** Repositórios privados são baratos no GitHub, mas "barato" não é "grátis", e auto-hospedar no hardware que você já possui é efetivamente gratuito.
- **Filosofia.** O Git é descentralizado por design; uma única forja é uma escolha, não uma lei.

A nuance importante: o próprio Git não é um aprisionamento. Todas as opções abaixo falam Git padrão — seu histórico, branches e tags vão com você. A questão é apenas onde a *forja* (issues, PRs, CI, wiki) vive.

## O histórico de confiabilidade de 2026: hoje não é exceção

Se você encontrou este post porque o GitHub está tendo um dia ruim, aqui está o contexto que torna esse dia ruim significativo. Em **17 de agosto de 2026**, o GitHub registrou um incidente **crítico** — "Incidente com GitHub.com" — começando por volta das 13:40 UTC (10:40 BRT). Horas depois, a [página de status](https://www.githubstatus.com/) ainda mostrava uma "Interrupção Parcial do Sistema", com requisições de API degradadas, Issues degradadas e falhas esporádicas de autenticação; as operações de Git foram eventualmente mitigadas, mas com impacto residual. A Microsoft confirmou uma enorme interrupção global, coberta pela Forbes, The Economic Times, DevOps.com e outros, enquanto o Downdetector registrou milhares de relatos de usuários. O Hacker News produziu um raro trio no mesmo dia: "[Pergunte ao HN: O GitHub está frito hoje?](https://news.ycombinator.com/item?id=49333136)", "[O GitHub tem um problema de disponibilidade. Está na hora de procurar outro lugar?](https://news.ycombinator.com/item?id=49333728)" — e, claro, "[Pergunte ao HN: Alternativas ao GitHub](https://news.ycombinator.com/item?id=49331033)" (357 pontos).

E isso não é um caso isolado. A página pública de status, que atualmente lista incidentes desde meados de junho, mostra **nove incidentes críticos em dois meses**:

- 17 de agosto — GitHub.com (ainda aberto no momento em que este texto foi escrito)
- 06 de agosto — GitHub Actions
- 25 de julho — falhas e atrasos em execuções do Actions
- 24 de julho — Pull Requests
- 21 de julho — conexões SSH usando chaves de deploy
- 19 de julho — GitHub Actions
- 16 de julho — interrupção geral do serviço
- 09 de julho — atrasos ao iniciar execuções do Actions
- 17 de junho — disponibilidade do Copilot

O padrão salta aos olhos na lista: **GitHub Actions e a superfície de IA/Copilot são os pontos fracos recorrentes**. Quatro dos nove incidentes críticos atingiram o Actions, e os incidentes de Copilot/modelos de IA marcados como menores (30 de julho, 1 de agosto, 3 de agosto, 5 de agosto, 10 de agosto, 13 de agosto) são frequentes demais para enumerar. Uma thread "[O GitHub caiu de novo](https://news.ycombinator.com/item?id=46946827)" chegou a atingir 514 pontos em fevereiro de 2026. O histórico não é "o GitHub está sempre fora do ar" — é que, quando quebra, tende a quebrar os componentes dos quais os desenvolvedores mais dependem, no momento em que dependem deles, e as falhas são **correlacionadas**: push, PRs, CI e autenticação podem cair juntos.

Essa correlação é exatamente o que a auto-hospedagem elimina. Sua própria instância do Gitea pode cair porque você a configurou mal — mas não vai cair porque a frota de outra pessoa teve uma terça-feira ruim, e não vai levar seu pipeline de deploy junto. Para equipes cujo fluxo de trabalho já é conteinerizado (veja [contêineres vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})), rodar a forja ao lado das cargas de trabalho é um pequeno passo com um valor de seguro imenso.

## Gitea: a opção leve padrão para auto-hospedagem

O [Gitea](https://about.gitea.com/) é um aplicativo em Go que roda como um único binário — nenhum servidor de banco de dados é necessário além do SQLite embutido (PostgreSQL/MySQL também são suportados). É um fork de 2016 do Gogs e hoje é a forja auto-hospedada mais popular de longe, com cerca de **57 mil estrelas** no GitHub. A proposta: "Git com uma xícara de chá" — sem dor, tudo-em-um e rápido.

O uso típico de recursos é notavelmente baixo: um VPS pequeno com 1 GB de RAM roda confortavelmente, e ele inicia em segundos. Instalar com Docker é um comando de uma linha:

```bash
docker run -d --name gitea -p 3000:3000 \
  -v /opt/gitea:/data \
  -e USER_UID=1000 -e USER_GID=1000 \
  gitea/gitea:latest
```

(Instruções completas no [guia oficial de Docker](https://docs.gitea.com/installation/install-with-docker).)

Para CI/CD, o Gitea inclui **Gitea Actions** — um runner compatível com GitHub Actions ([visão geral](https://docs.gitea.com/usage/actions/overview)). Se seus pipelines estiverem escritos como fluxos de trabalho do GitHub Actions, a maioria roda no Gitea com mudanças mínimas, o que reduz drasticamente o custo de migração.

Para quem é: o dono de homelab ou desenvolvedor solo que quer recursos parecidos com os do GitHub — issues, pull requests, releases, wiki, pacotes — com uma fração do consumo de recursos. O consenso da comunidade após anos de operação é que as atualizações são entediantes: mude a tag da imagem, reinicie, pronto.

## Forgejo: o irmão do Gitea com governança comunitária

O [Forgejo](https://forgejo.org/) começou em 2022 como um fork do Gitea após uma disputa de governança — a comunidade estava preocupada com o rumo do projeto. Também é licenciado sob MIT, também é um único binário em Go e permanece intencionalmente compatível com o ecossistema do Gitea: os mesmos conceitos de interface, o mesmo formato de runner do Actions, a mesma facilidade de auto-hospedagem ([instalação via Docker](https://forgejo.org/docs/latest/admin/installation-docker/)).

A diferença é a governança: o Forgejo é dirigido pela comunidade e aderiu à **Software Freedom Conservancy**, uma organização guarda-chuva sem fins lucrativos, o que significa que o projeto não pode ser comprado nem redirecionado por uma empresa. Ele também impulsiona recursos experimentais como a **Forgejo Federation** — um protocolo que permite que forjas independentes conversem entre si, de modo que um repositório no seu servidor possa receber pull requests do servidor de outra pessoa.

Para quem é: pessoas que querem a experiência do Gitea, mas preferem propriedade comunitária, e qualquer um que se importe com o futuro da hospedagem de código federada. Sua principal instância hospedada, o Codeberg (abaixo), é a prova de que o software é de nível de produção.

## GitLab CE: a plataforma completa, com um custo

O [GitLab Community Edition](https://about.gitlab.com/install/) é o que mais se aproxima do GitHub em recursos quando você precisa de tudo: aprovações de merge requests, CI/CD embutido com um editor de pipelines de primeira linha, registro de contêineres, varredura de dependências, SSO e permissões granulares. Para uma empresa migrando uma grande organização do GitHub, é o destino menos surpreendente.

O preço é o peso operacional. Uma instalação de produção do GitLab exige PostgreSQL, Redis e alguns GB de RAM; a [implantação via Docker](https://docs.gitlab.com/ee/install/docker/installation.html) é o caminho mais fácil, mas você passa a administrar uma pequena plataforma, não um único binário. Equipes que auto-hospedam o GitLab há anos relatam que ele funciona bem — e também que é preciso reservar orçamento para atualizações, runners e o eventual rollback. Se você é um usuário solo de homelab, o GitLab é quase certamente exagero; se você é uma empresa, é a opção séria.

## Alternativas hospedadas: sem necessidade de servidor

Nem todo mundo quer administrar infraestrutura. Três opções hospedadas se destacam:

**[Codeberg](https://codeberg.org/)** — uma forja sem fins lucrativos administrada pela associação Codeberg e.V. na Alemanha, construída sobre o Forgejo. É gratuito para software livre e de código aberto, tem uma [posição clara contra treinamento de IA e contra raspagem de dados](https://docs.codeberg.org/) e é um destino comum de migração para quem sai do GitHub especificamente por causa das políticas de IA. Doações e voluntários o mantêm em funcionamento.

**[SourceHut](https://sr.ht/)** — "a forja do hacker". O SourceHut é deliberadamente minimalista: sem interface cheia de JavaScript, fluxos de trabalho orientados a e-mail (`git send-email` para patches) e uma coleção de pequenos serviços (git, listas, builds, páginas man, paste). É um serviço pago com uma taxa anual baixa, o que o mantém independente e sem anúncios; o mantenedor, Drew DeVault, é um dos críticos mais veementes do "enshittification" em ferramentas para desenvolvedores. É a escolha certa se você vive no terminal e gosta de ferramentas austeras.

**[Radicle](https://radicle.xyz/)** — uma pilha ponto a ponto para colaboração de código (MIT, ~900 estrelas). Não há servidor central algum: os repositórios são replicados diretamente entre as máquinas das pessoas que trabalham neles, com issues e patches trocados por uma rede P2P. É a resposta filosoficamente mais pura para "colocar todos os ovos na mesma cesta" — e também a mais de nicho: você precisa que seus colaboradores também a adotem.

## O extremo ultramínimo

Se até o Gitea parece pesado, lembre-se dos ancestrais. O **[Gogs](https://gogs.io/)** — o "serviço Git auto-hospedado sem dor" original, também em Go, também MIT — ainda roda em hardware medido em centenas de MB. E abaixo disso existe a pilha Unix clássica: **gitolite + cgit**, onde o `git` é simplesmente servido a partir de um repositório bare em um servidor que você já tem, sem interface web alguma. Não é glamoroso, mas roda código de produção desde antes de o GitHub existir.

## Como escolher: um guia de decisão

- **Desenvolvedor solo com um servidor antigo ou um VPS de US$ 5** → Gitea (ou Forgejo, se você preferir a governança). Ambos cabem em 1 GB de RAM com folga.
- **Equipe pequena que precisa de CI/CD** → Forgejo ou Gitea com Actions; seus fluxos de trabalho do GitHub são, em sua maioria, aproveitados.
- **Empresa migrando uma grande organização do GitHub** → GitLab CE. Reserve orçamento para PostgreSQL, Redis e tempo de operação.
- **Purista de software livre, contra IA por padrão, sem orçamento para hospedagem** → Codeberg.
- **Fluxos de trabalho centrados no terminal e em e-mail** → SourceHut.
- **Você não quer nenhum ponto central de falha** → Radicle.

## Lista de verificação de migração

Mudar para uma nova forja é quase mecânico — essa é a feliz consequência de o Git ser o substrato universal:

1. **Exporte os repositórios.** Faça `git clone --mirror` em cada repositório, ou use o arquivamento/exportação do GitHub se você também precisar de issues e PRs.
2. **Crie o destino.** Gitea, Forgejo e GitLab têm importadores integrados que podem puxar um repositório (e geralmente as issues) diretamente de uma URL do GitHub — o caminho mais rápido para projetos pequenos.
3. **Envie o histórico.** `git push --mirror <new-remote>` preserva branches e tags exatamente como estão.
4. **Reconfigure o CI.** Fluxos de trabalho do GitHub Actions rodam no Gitea/Forgejo Actions com mudanças mínimas; o CI do GitLab usa sintaxe própria, então reserve tempo para traduzir os pipelines.
5. **Atualize os remotes para a equipe.** `git remote set-url origin <new-url>` e reemita tokens/chaves SSH.
6. **Mantenha o GitHub como um espelho somente leitura** (opcional). Faça push para sua forja e espelhe no GitHub para visibilidade — muitos projetos funcionam assim permanentemente.

Também vale a pena revisar enquanto você faz isso: se sua equipe depende de fluxos de trabalho com PRs empilhados, ferramentas como [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) ou uma configuração de [pull requests empilhados]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) são agnósticas em relação à forja — funcionam da mesma forma tanto se o remote for GitHub, Gitea ou um servidor bare.

## O que observar

Duas tendências merecem ser acompanhadas em 2026. Primeiro, a **federação**: a Forgejo Federation e esforços semelhantes estão lentamente transformando as forjas de jardins murados em uma rede, da mesma forma que o e-mail e o ActivityPub fizeram em seus domínios. Segundo, a **política de IA como fator de migração**: a postura que uma plataforma adota em relação ao treinamento com seu código e à marca d'água em conteúdo gerado por IA está se tornando um critério de primeira classe — exatamente o que levou tanta gente ao Codeberg este ano. Terceiro, a **confiabilidade como escolha operacional**: após o histórico de interrupções de 2026, o padrão de espelhamento está ganhando terreno — forja auto-hospedada como primária, GitHub mantido como espelho somente leitura para visibilidade — o que transforma o risco de disponibilidade em algo que você controla, em vez de algo que você absorve.

A versão curta: você não precisa da permissão do GitHub para sair, e não precisa sacrificar recursos para isso. Um único binário em Go num servidor que você controla oferece 90% da experiência sem nenhuma vigilância — e o Git torna a mudança reversível a qualquer momento.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitButler: O Que É, Review e Alternativas [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
