---
date: 2026-08-17T18:10:00.000Z
draft: false
title: 'Alternativas ao GitHub em 2026: Opções Auto-hospedadas e Gerenciadas Comparadas'
description: 'Compare Gitea, Forgejo, GitLab CE, Codeberg, SourceHut e Radicle em 2026: auto-hospedado vs gerenciado, uso de recursos, CI/CD, o histórico de indisponibilidades de 2026 que impulsiona a migração, e uma lista de verificação prática.'
featured_image: ''
categories:
  - article
tags:
  - git
  - github
  - self-hosting
  - devops
  - version-control
slug: alternativas-github-2026-auto-hospedadas-gerenciadas-comparadas
translation_source_hash: 1a029331788e5411b3f634151d9c80a42ea70c0247f826a47d2c7fa167e6f0e1
---
É domingo à noite, sua janela de deploy está se fechando, e o GitHub acabou de cair — de novo. Ou talvez nada dramático tenha acontecido: você simplesmente abriu seu feed e o assistente de IA que você nunca pediu estava lá, esperando para "ajudar", enquanto mais um debate sobre código gerado por IA e marca d'água de conteúdo acontecia. Então você digita a pergunta no Hacker News: "Alternativas ao GitHub?" Em poucas horas, tem 357 pontos e quase 200 comentários. Você não está sozinho — e a boa notícia é que em 2026 a resposta é melhor do que "é só mudar para o GitLab".

Este guia é um passeio prático e orientado a decisões pelas alternativas reais: os forges leves auto-hospedados (Gitea, Forgejo, Gogs), a plataforma completa (GitLab CE), o sem fins lucrativos hospedado (Codeberg), o minimalista (SourceHut) e o totalmente descentralizado (Radicle). Para cada um: o que é, quanto custa, quanto pesa e para quem é — além de uma checklist de migração no final.

## O panorama de relance

| Opção | Tipo | Licença | Auto-hospedagem | CI/CD | Melhor para |
|---|---|---|---|---|---|
| **Gitea** | Forge leve | MIT | Sim (binário único) | Gitea Actions | Homelab, devs solo, pequenas equipes |
| **Forgejo** | Forge leve (fork do Gitea) | MIT | Sim (binário único) | Forgejo Actions | Auto-hospedagem com governança comunitária |
| **GitLab CE** | Plataforma DevOps completa | MIT (núcleo) | Sim (mais pesado) | GitLab CI/CD | Empresas, fluxos de trabalho complexos |
| **Gogs** | Forge ultra leve | MIT | Sim (binário único) | Limitado | Auto-hospedagem mínima |
| **Codeberg** | Forge hospedado (Forgejo) | — | Não (grátis para FOSS) | Forgejo Actions | Projetos open-source, posição contra IA |
| **SourceHut** | Forge minimalista | Serviço pago | Sim (auto-hospedável) | builds sr.ht | Fluxos de trabalho focados em e-mail |
| **Radicle** | Rede ponto a ponto | MIT | Não precisa de servidor | Radicle CI | Puristas da descentralização |

## Por que as pessoas estão procurando, afinal

As motivações aparecem em todos os tópicos de "alternativas" e merecem ser nomeadas porque orientam a escolha:

- **Controle e privacidade.** Seus repositórios, issues e atividade vivem na infraestrutura de outra pessoa. Auto-hospedar significa que seu código nunca sai de um servidor que você controla — relevante para donos de homelab que já rodam [Proxmox e contêineres]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).
- **Recursos de IA empurrados por padrão.** Assistentes estilo Copilot, bots de revisão de código e debates sobre marca d'água de conteúdo (os mesmos que afetam todos os grandes produtos de IA em 2026) deixaram muitos desenvolvedores desconfortáveis com uma plataforma que decide por você como é a "assistência".
- **Interrupções e disponibilidade.** Quando uma plataforma falha bem na hora do deploy, o valor de um `git push` funcionando contra o seu próprio servidor se torna muito concreto. O GitHub registrou **nove incidentes críticos só entre meados de junho e meados de agosto de 2026** — incluindo um grande no dia em que este post foi escrito (veja [o registro de confiabilidade de 2026](#the-2026-reliability-record-today-is-not-an-exception) abaixo).
- **Custo.** Repositórios privados são baratos no GitHub, mas "barato" não é "grátis", e auto-hospedar no hardware que você já tem é efetivamente grátis.
- **Filosofia.** O Git é descentralizado por design; um forge único é uma escolha, não uma lei.

A nuance importante: o Git em si não é um aprisionamento. Todas as opções abaixo falam Git padrão — seu histórico, branches e tags vão com você. A questão é apenas onde o *forge* (issues, PRs, CI, wiki) vive.

## O registro de confiabilidade de 2026: hoje não é uma exceção

Se você encontrou este post porque o GitHub está tendo um dia ruim, aqui está o contexto que torna esse dia ruim significativo. Em **17 de agosto de 2026**, o GitHub registrou um incidente **crítico** — "Incident with GitHub.com" — começando por volta das 13:40 UTC (10:40 BRT). Horas depois, a [página de status](https://www.githubstatus.com/) ainda mostrava uma "Partial System Outage", com requisições de API degradadas, Issues degradadas e falhas esporádicas de autenticação; as operações Git foram eventualmente mitigadas, mas com impacto residual. A Microsoft confirmou uma enorme interrupção global, coberta pela Forbes, The Economic Times, DevOps.com e outros, enquanto o Downdetector registrou milhares de relatos de usuários. O Hacker News produziu uma rara trinca no mesmo dia: "[Pergunte ao HN: O GitHub está frito hoje?](https://news.ycombinator.com/item?id=49333136)", "[O GitHub tem um problema de disponibilidade. Está na hora de procurar em outro lugar?](https://news.ycombinator.com/item?id=49333728)" — e, claro, "[Pergunte ao HN: Alternativas ao GitHub](https://news.ycombinator.com/item?id=49331033)" (357 pontos).

E isso não é um caso isolado. A página de status pública, que atualmente lista incidentes desde meados de junho, mostra **nove incidentes críticos em dois meses**:

- 17 de ago — GitHub.com (ainda aberto no momento em que este texto foi escrito)
- 06 de ago — GitHub Actions
- 25 de jul — Falhas e atrasos em execuções do Actions
- 24 de jul — Pull Requests
- 21 de jul — Conexões SSH usando chaves de deploy
- 19 de jul — GitHub Actions
- 16 de jul — Interrupção geral do serviço
- 09 de jul — Atrasos ao iniciar execuções do Actions
- 17 de jun — Disponibilidade do Copilot

O padrão salta da lista: **o GitHub Actions e a superfície de IA/Copilot são os pontos fracos recorrentes**. Quatro dos nove críticos atingiram o Actions, e os incidentes de Copilot/modelos de IA marcados como menores (30 de jul, 1º de ago, 3 de ago, 5 de ago, 10 de ago, 13 de ago) são frequentes demais para enumerar. Um tópico "[O GitHub caiu de novo](https://news.ycombinator.com/item?id=46946827)" chegou a 514 pontos em fevereiro de 2026. O registro não é "o GitHub está sempre fora do ar" — é que, quando quebra, tende a quebrar os componentes dos quais os desenvolvedores mais dependem, no momento em que dependem deles, e as falhas são **correlacionadas**: push, PRs, CI e autenticação podem cair todos juntos.

Essa correlação é exatamente o que a auto-hospedagem elimina. Sua própria instância do Gitea pode cair porque você a configurou mal — mas não vai cair porque a frota de outra pessoa teve uma terça-feira ruim, e não vai levar seu pipeline de deploy junto. Para equipes cujo fluxo de trabalho já é containerizado (veja [contêineres vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})), rodar o forge ao lado das cargas de trabalho é um pequeno passo com um valor de seguro desproporcional.

## Gitea: o padrão leve para auto-hospedagem

[Gitea](https://about.gitea.com/) é um aplicativo Go que roda como um único binário — nenhum servidor de banco de dados é necessário além do SQLite embutido (PostgreSQL/MySQL também são suportados). É um fork de 2016 do Gogs e hoje é o forge auto-hospedado mais popular de longe, com cerca de **57 mil estrelas** no GitHub. A proposta: "Git com uma xícara de chá" — sem dor, tudo-em-um e rápido.

O uso típico de recursos é notavelmente baixo: um VPS pequeno com 1 GB de RAM roda confortavelmente, e ele inicia em segundos. Instalar com Docker é um comando só:

```bash
docker run -d --name gitea -p 3000:3000 \
  -v /opt/gitea:/data \
  -e USER_UID=1000 -e USER_GID=1000 \
  gitea/gitea:latest
```

(Instruções completas no [guia oficial do Docker](https://docs.gitea.com/installation/install-with-docker).)

Para CI/CD, o Gitea traz o **Gitea Actions** — um runner compatível com GitHub Actions ([visão geral](https://docs.gitea.com/usage/actions/overview)). Se seus pipelines são escritos como workflows do GitHub Actions, a maioria roda no Gitea com mudanças mínimas, o que reduz drasticamente o custo de migração.

Para quem é: o dono de homelab ou desenvolvedor solo que quer recursos parecidos com os do GitHub — issues, pull requests, releases, wiki, pacotes — com uma fração do consumo de recursos. O consenso da comunidade após anos de operação é que as atualizações são entediantes: troque a tag da imagem, reinicie, pronto.

## Forgejo: o irmão do Gitea com governança comunitária

[Forgejo](https://forgejo.org/) começou em 2022 como um fork do Gitea após uma disputa de governança — a comunidade estava preocupada com o rumo do projeto. Também é licenciado sob MIT, também é um único binário Go, e permanece intencionalmente compatível com o ecossistema do Gitea: os mesmos conceitos de interface, o mesmo formato de runner do Actions, a mesma facilidade de auto-hospedagem ([instalação com Docker](https://forgejo.org/docs/latest/admin/installation-docker/)).

A diferença é a governança: o Forgejo é administrado pela comunidade e se juntou à **Software Freedom Conservancy**, uma organização guarda-chuva sem fins lucrativos, o que significa que o projeto não pode ser comprado ou redirecionado por uma empresa. Ele também impulsiona recursos experimentais como o **Forgejo Federation** — um protocolo que permite que forges independentes conversem entre si, de modo que um repositório no seu servidor possa receber pull requests do servidor de outra pessoa.

Para quem é: pessoas que querem a experiência do Gitea, mas preferem a propriedade comunitária, e qualquer pessoa que se importa com o futuro do hospedagem de código federada. Sua instância hospedada principal, o Codeberg (abaixo), é a prova de que o software é de nível de produção.

## GitLab CE: a plataforma completa, por um custo

O [GitLab Community Edition](https://about.gitlab.com/install/) é o que mais se aproxima do GitHub em termos de recursos quando você precisa de tudo: aprovações de merge request, CI/CD embutido com um editor de pipelines de primeira linha, registry de contêineres, varredura de dependências, SSO e permissões granulares. Para uma empresa migrando uma grande organização do GitHub, é o destino menos surpreendente.

O preço é o peso operacional. Uma instalação de produção do GitLab exige PostgreSQL, Redis e alguns GB de RAM; o [deployment com Docker](https://docs.gitlab.com/ee/install/docker/installation.html) é o caminho mais fácil, mas você passa a executar uma pequena plataforma, não um único binário. Equipes que auto-hospedam o GitLab há anos relatam que ele funciona bem — e também que é preciso reservar orçamento para atualizações, runners e um rollback ocasional. Se você é um usuário solo de homelab, o GitLab é quase certamente exagero; se você é uma empresa, é a opção séria.

## Alternativas hospedadas: sem necessidade de servidor

Nem todo mundo quer administrar infraestrutura. Três opções hospedadas se destacam:

**[Codeberg](https://codeberg.org/)** — um forge sem fins lucrativos mantido pela associação Codeberg e.V. na Alemanha, construído sobre o Forgejo. É gratuito para software livre e de código aberto, tem uma postura clara [contra treinamento de IA / anti-raspagem](https://docs.codeberg.org/) e é um destino comum de migração para quem sai do GitHub especificamente por causa das políticas de IA. Doações e voluntários o mantêm de pé.

**[SourceHut](https://sr.ht/)** — "o forge dos hackers". O SourceHut é deliberadamente minimalista: sem interface carregada de JavaScript, fluxos de trabalho orientados a e-mail (`git send-email` para patches) e uma coleção de pequenos serviços (git, listas, builds, man pages, colar). É um serviço pago com uma taxa anual baixa, o que o mantém independente e sem anúncios; o mantenedor, Drew DeVault, é um dos críticos mais veementes do "enshittification" (a degradação progressiva de plataformas) nas ferramentas de desenvolvimento. É a escolha certa se você vive no terminal e gosta de ferramentas austeras.

**[Radicle](https://radicle.xyz/)** — uma pilha ponto a ponto para colaboração de código (MIT, ~900 estrelas). Não há servidor central: os repositórios são replicados diretamente entre as máquinas das pessoas que trabalham neles, com issues e patches trocados por uma rede P2P. É a resposta filosoficamente mais pura para "colocar todos os ovos em uma cesta" — e também a mais de nicho: você precisa que seus colaboradores também o adotem.

## O extremo ultraminimalista

Se até o Gitea parece pesado, lembre-se dos ancestrais. **[Gogs](https://gogs.io/)** — o "serviço Git auto-hospedado sem dor" original, também em Go, também MIT — ainda roda em hardware medido em centenas de MB. E abaixo disso há a pilha Unix clássica: **gitolite + cgit**, onde o `git` é simplesmente servido a partir de um repositório bare em um servidor que você já tem, sem interface web nenhuma. Não é glamouroso, mas roda código de produção desde antes de o GitHub existir.

## Como escolher: um framework de decisão

- **Dev solo com um servidor antigo ou um VPS de US$ 5** → Gitea (ou Forgejo se você preferir a governança). Ambos cabem em 1 GB de RAM com folga.
- **Equipe pequena que precisa de CI/CD** → Forgejo ou Gitea com Actions; seus workflows do GitHub são aproveitados na maior parte.
- **Empresa migrando uma grande organização do GitHub** → GitLab CE. Reserve orçamento para PostgreSQL, Redis e tempo de operação.
- **Purista de FOSS, contra IA por padrão, sem orçamento de hospedagem** → Codeberg.
- **Fluxos de trabalho em primeiro lugar no terminal, orientados a e-mail** → SourceHut.
- **Você não quer nenhum ponto central de falha** → Radicle.

## Checklist de migração

Mudar para um novo forge é quase todo mecânico — essa é a consequência feliz de o Git ser o substrato universal:

1. **Exporte os repositórios.** `git clone --mirror` em cada repositório, ou use o arquivo/exportação do GitHub se você também precisar de issues e PRs.
2. **Crie o destino.** Gitea, Forgejo e GitLab têm importadores integrados que podem puxar um repositório (e muitas vezes as issues) diretamente de uma URL do GitHub — o caminho mais rápido para projetos pequenos.
3. **Envie o histórico.** `git push --mirror <new-remote>` preserva branches e tags exatamente.
4. **Religue o CI.** Workflows do GitHub Actions rodam no Gitea/Forgejo Actions com mudanças menores; o GitLab CI usa sintaxe própria, então reserve tempo para traduzir pipelines.
5. **Atualize os remotes para a equipe.** `git remote set-url origin <new-url>` e reemita tokens/chaves SSH.
6. **Mantenha o GitHub como espelho somente leitura** (opcional). Faça push para o seu forge e espelhe no GitHub para descoberta — muitos projetos rodam assim permanentemente.

Também vale a pena revisitar enquanto você faz isso: se sua equipe depende de fluxos de trabalho com PRs empilhados, ferramentas como [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) ou uma configuração de [pull requests empilhados]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) são independentes de forge — funcionam de forma idêntica tanto faz se o remote é GitHub, Gitea ou um servidor bare.

## O que observar

Duas tendências merecem ser acompanhadas em 2026. Primeiro, **federação**: o Forgejo Federation e esforços semelhantes estão lentamente transformando forges de jardins murados em uma rede, da mesma forma que e-mail e ActivityPub fizeram por seus domínios. Segundo, **política de IA como motor de migração**: a postura que uma plataforma adota em relação a treinar com seu código e aplicar marca d'água em saídas de IA está se tornando um critério de primeira classe — exatamente o que levou tanta gente ao Codeberg este ano. Terceiro, **confiabilidade como uma escolha operacional**: depois do histórico de interrupções de 2026, o padrão de espelho está ganhando terreno — forge auto-hospedado como principal, GitHub mantido como espelho somente leitura para descoberta — o que transforma o risco de disponibilidade em algo que você controla, em vez de algo que você absorve.

A versão curta: você não precisa da permissão do GitHub para sair, e não precisa sacrificar recursos para isso. Um único binário Go em um servidor que você controla oferece 90% da experiência, sem nenhuma vigilância — e o Git torna a mudança reversível a qualquer momento.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitButler: O que é, Análise e Alternativas [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
