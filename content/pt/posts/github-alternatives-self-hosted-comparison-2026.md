---
date: 2026-08-17T18:10:00.000Z
draft: true
title: 'Alternativas ao GitHub em 2026: Opções Auto-Hospedadas e Gerenciadas Comparadas'
description: 'Compare Gitea, Forgejo, GitLab CE, Codeberg, SourceHut e Radicle em 2026: self-hosted vs gerenciado, uso de recursos, CI/CD, o histórico de indisponibilidade de 2026 que está impulsionando a migração e um checklist prático.'
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
translation_source_hash: e23e7b3d5ae4bedc512138e92c31b1eb800d8a9215837817bfe933a32fc16948
---
É domingo à noite, sua janela de deploy está fechando e o GitHub acabou de cair — de novo. Ou talvez nada dramático tenha acontecido: você abriu seu feed e lá estava o assistente de IA que você nunca pediu, esperando para "ajudar", enquanto mais um debate sobre código gerado por IA e marca d'água de conteúdo fervia. Então você digita a pergunta no Hacker News: "Alternativas ao GitHub?" Em poucas horas, são 357 pontos e quase 200 comentários. Você não está sozinho — e a boa notícia é que em 2026 a resposta é melhor do que "é só trocar para o GitLab".

This guide is a practical, decision-oriented tour of the real alternatives: the self-hosted lightweight forges (Gitea, Forgejo, Gogs), the full platform (GitLab CE), the hosted non-profit (Codeberg), the minimalist (SourceHut), and the fully decentralized (Radicle). For each one: what it is, what it costs, what it weighs, and who it's for — plus a migration checklist at the end.

## O panorama de relance

| Opção | Tipo | Licença | Auto-hospedagem | CI/CD | Melhor para |
|---|---|---|---|---|---|
| **Gitea** | Forge leve | MIT | Sim (binário único) | Gitea Actions | Homelab, devs solo, equipes pequenas |
| **Forgejo** | Forge leve (fork do Gitea) | MIT | Sim (binário único) | Forgejo Actions | Auto-hospedagem com governança comunitária |
| **GitLab CE** | Plataforma DevOps completa | MIT (núcleo) | Sim (mais pesado) | GitLab CI/CD | Empresas, fluxos de trabalho complexos |
| **Gogs** | Forge ultraleve | MIT | Sim (binário único) | Limitado | Auto-hospedagem mínima |
| **Codeberg** | Forge hospedado (Forgejo) | — | Não (grátis para FOSS) | Forgejo Actions | Projetos open-source, postura sem IA |
| **SourceHut** | Forge minimalista | Serviço pago | Sim (auto-hospedável) | builds sr.ht | Fluxos de trabalho centrados em e-mail |
| **Radicle** | Rede ponto a ponto | MIT | Sem servidor necessário | Radicle CI | Puristas da descentralização |

## Por que as pessoas estão procurando alternativas

As motivações aparecem em todo tópico sobre "alternativas" e merecem ser nomeadas porque orientam a escolha:

- **Controle e privacidade.** Seus repositórios, issues e atividade vivem na infraestrutura de outra pessoa. Auto-hospedar significa que seu código nunca sai de um servidor que você controla — relevante para donos de homelab que já rodam [Proxmox e containers]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).
- **Recursos de IA empurrados por padrão.** Assistentes no estilo Copilot, bots de revisão de código e debates sobre marca d'água de conteúdo (os mesmos que atingem todos os grandes produtos de IA em 2026) deixaram muitos desenvolvedores desconfortáveis com uma plataforma que decide por você como a "assistência" deve ser.
- **Interrupções e disponibilidade.** Quando uma plataforma engasga bem na hora do deploy, o valor de um `git push` funcionando contra seu próprio servidor se torna muito concreto. O GitHub registrou **nove incidentes críticos entre meados de junho e meados de agosto de 2026** — incluindo um grande no dia em que este post foi escrito (veja a seção sobre o histórico de indisponibilidade abaixo).
- **Custo.** Repositórios privados são baratos no GitHub, mas "barato" não é "grátis", e auto-hospedar no hardware que você já opera é efetivamente grátis.
- **Filosofia.** O Git é descentralizado por design; um único forge é uma escolha, não uma lei.

A nuance importante: o Git em si não é um aprisionamento. Todas as opções abaixo falam Git padrão — seu histórico, branches e tags vão com você. A questão é apenas onde o *forge* (issues, PRs, CI, wiki) vive.

## O histórico de indisponibilidade em 2026: hoje não é exceção

Se você chegou a este post porque o GitHub está tendo um dia ruim, aqui está o contexto que torna o dia ruim significativo. Em **17 de agosto de 2026**, o GitHub registrou um incidente **crítico** — "Incident with GitHub.com" — começando por volta das 13:40 UTC (10:40 no horário de Brasília). Horas depois, a [página de status](https://www.githubstatus.com/) ainda mostrava "Partial System Outage", com requisições de API degradadas, Issues degradados e falhas de autenticação esporádicas; as operações de Git foram eventualmente mitigadas, mas com impacto residual. A Microsoft confirmou uma interrupção global massiva, coberta por Forbes, The Economic Times, DevOps.com e outros, enquanto o Downdetector registrava milhares de relatos de usuários. O Hacker News produziu uma trinca rara no mesmo dia: "[Ask HN: Is GitHub Fried Today?](https://news.ycombinator.com/item?id=49333136)", "[GitHub Has an Availability Problem. Is It Time to Look Elsewhere?](https://news.ycombinator.com/item?id=49333728)" — e, claro, "[Ask HN: Alternatives to GitHub](https://news.ycombinator.com/item?id=49331033)" (357 pontos).

E isso não é um caso isolado. A página de status pública, que hoje lista incidentes desde meados de junho, mostra **nove incidentes críticos em dois meses**:

- 17/08 — GitHub.com (ainda aberto no momento em que escrevo)
- 06/08 — GitHub Actions
- 25/07 — falhas e atrasos em execuções do Actions
- 24/07 — Pull Requests
- 21/07 — conexões SSH com deploy keys
- 19/07 — GitHub Actions
- 16/07 — interrupção geral de serviços
- 09/07 — atrasos para iniciar execuções do Actions
- 17/06 — disponibilidade do Copilot

O padrão salta da lista: **GitHub Actions e a superfície de IA/Copilot são os pontos fracos recorrentes**. Quatro dos nove críticos atingiram o Actions, e os incidentes de Copilot/provedores de IA marcados como menores (30/07, 01/08, 03/08, 05/08, 10/08, 13/08) são frequentes demais para enumerar. Um tópico "[GitHub is down again](https://news.ycombinator.com/item?id=46946827)" chegou a 514 pontos em fevereiro de 2026. O histórico não é "o GitHub está sempre fora do ar" — é que, quando quebra, tende a quebrar justamente os componentes de que os desenvolvedores mais dependem, no momento em que dependem deles, e as falhas são **correlacionadas**: push, PRs, CI e autenticação podem cair juntos.

E essa correlação é exatamente o que a auto-hospedagem elimina. Sua própria instância do Gitea pode cair porque você a configurou mal — mas não cai porque a frota de outra pessoa teve uma terça-feira ruim, e não leva seu pipeline de deploy junto. Para times cujo fluxo já é containerizado (veja [containers vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})), rodar o forge ao lado das workloads é um passo pequeno com um valor de seguro desproporcional.

## Gitea: o padrão leve para auto-hospedagem

[Gitea](https://about.gitea.com/) é uma aplicação Go que roda como um binário único — sem necessidade de servidor de banco de dados além do SQLite embutido (PostgreSQL/MySQL também são suportados). É um fork de 2016 do Gogs e, hoje, é o forge auto-hospedado mais popular de longe, com cerca de **57 mil estrelas** no GitHub. A proposta: "Git com uma xícara de chá" — sem dor, tudo-em-um e rápido.

O uso típico de recursos é notavelmente baixo: um VPS pequeno com 1 GB de RAM roda confortavelmente e ele inicializa em segundos. Instalar com Docker é um comando só:

```bash
docker run -d --name gitea -p 3000:3000 \
  -v /opt/gitea:/data \
  -e USER_UID=1000 -e USER_GID=1000 \
  gitea/gitea:latest
```

(Instruções completas no [guia oficial de Docker](https://docs.gitea.com/installation/install-with-docker).)

Para CI/CD, o Gitea traz **Gitea Actions** — um runner compatível com GitHub Actions ([visão geral](https://docs.gitea.com/usage/actions/overview)). Se seus pipelines são escritos como workflows do GitHub Actions, a maioria roda no Gitea com mudanças mínimas, o que reduz drasticamente o custo de migração.

Para quem é: o dono de homelab ou desenvolvedor solo que quer recursos parecidos com os do GitHub — issues, pull requests, releases, wiki, pacotes — com uma fração do consumo de recursos. O consenso da comunidade após anos de operação é que atualizações são entediantes: troque a tag da imagem, reinicie, pronto.

## Forgejo: o irmão do Gitea com governança comunitária

[Forgejo](https://forgejo.org/) começou em 2022 como um fork do Gitea após uma disputa de governança — a comunidade estava preocupada com os rumos do projeto. Também é licenciado sob MIT, também é um binário Go único e permanece intencionalmente compatível com o ecossistema Gitea: os mesmos conceitos de interface, o mesmo formato de runner de Actions, a mesma facilidade de auto-hospedagem ([instalação com Docker](https://forgejo.org/docs/latest/admin/installation-docker/)).

A diferença é a governança: o Forgejo é administrado pela comunidade e se juntou à **Software Freedom Conservancy**, uma entidade guarda-chuva sem fins lucrativos, o que significa que o projeto não pode ser comprado nem redirecionado por uma empresa. Ele também impulsiona recursos experimentais como a **Forgejo Federation** — um protocolo que permite que forges independentes conversem entre si, de modo que um repositório no seu servidor possa receber pull requests do servidor de outra pessoa.

Para quem é: pessoas que querem a experiência do Gitea, mas preferem propriedade comunitária, e qualquer pessoa que se importa com o futuro da hospedagem de código federada. Sua instância hospedada principal, o Codeberg (abaixo), é a prova de que o software está em nível de produção.

## GitLab CE: a plataforma completa, a um custo

[GitLab Community Edition](https://about.gitlab.com/install/) é o que mais se aproxima do GitHub em recursos quando você precisa de tudo: aprovações de merge request, CI/CD integrado com editor de pipeline de primeira linha, registry de containers, varredura de dependências, SSO e permissões granulares. Para uma empresa migrando uma grande organização do GitHub, é o destino com menos surpresas.

O preço é o peso operacional. Uma instalação de GitLab em produção exige PostgreSQL, Redis e alguns GB de RAM; a [implantação com Docker](https://docs.gitlab.com/ee/install/docker/installation.html) é o caminho mais fácil, mas você agora está rodando uma pequena plataforma, não um binário único. Equipes que auto-hospedam GitLab há anos relatam que funciona bem — e também que é preciso reservar orçamento para atualizações, runners e o eventual rollback. Se você é um usuário solo de homelab, o GitLab é quase certamente exagero; se você é uma empresa, é a opção séria.

## Alternativas hospedadas: sem necessidade de servidor

Nem todo mundo quer administrar infraestrutura. Três opções hospedadas se destacam:

**[Codeberg](https://codeberg.org/)** — um forge sem fins lucrativos mantido pela associação Codeberg e.V. na Alemanha, construído sobre o Forgejo. É gratuito para software livre e de código aberto, tem uma posição clara [contra treinamento de IA / anti-raspagem](https://docs.codeberg.org/), e é um destino comum de migração para quem sai do GitHub especificamente por causa das políticas de IA. Doações e voluntários mantêm o projeto de pé.

**[SourceHut](https://sr.ht/)** — "o forge do hacker". O SourceHut é deliberadamente minimalista: sem interface cheia de JavaScript, fluxos de trabalho centrados em e-mail (`git send-email` para patches) e uma coleção de pequenos serviços (git, listas, builds, man pages, paste). É um serviço pago com uma taxa anual baixa, o que o mantém independente e sem anúncios; o mantenedor, Drew DeVault, é um dos críticos mais veementes do enshittification nas ferramentas de desenvolvimento. É a escolha certa se você vive no terminal e gosta de ferramentas austeras.

**[Radicle](https://radicle.xyz/)** — uma pilha ponto a ponto para colaboração de código (MIT, ~900 estrelas). Não há nenhum servidor central: os repositórios são replicados diretamente entre as máquinas das pessoas que trabalham neles, com issues e patches trocados por uma rede P2P. É a resposta filosoficamente mais pura para "não coloque todos os ovos na mesma cesta" — e também a mais de nicho: você precisa que seus colaboradores também adotem a ferramenta.

## O extremo ultraminimalista

Se até o Gitea parece pesado, lembre-se dos ancestrais. **[Gogs](https://gogs.io/)** — o "serviço Git auto-hospedado sem dor" original, também em Go, também MIT — ainda roda em hardware medido em centenas de MB. E abaixo disso existe a pilha Unix clássica: **gitolite + cgit**, onde o `git` é simplesmente servido a partir de um repositório bare em um servidor que você já tem, sem nenhuma interface web. Não é glamouroso, mas roda código de produção desde antes de o GitHub existir.

## Como escolher: um guia de decisão

- **Dev solo com servidor antigo ou VPS de US$ 5** → Gitea (ou Forgejo se você preferir a governança). Ambos cabem em 1 GB de RAM com folga.
- **Equipe pequena que precisa de CI/CD** → Forgejo ou Gitea com Actions; seus workflows do GitHub são aproveitados na maioria dos casos.
- **Empresa migrando uma organização grande do GitHub** → GitLab CE. Reserve orçamento para PostgreSQL, Redis e tempo de operação.
- **Purista de FOSS, anti-IA por padrão, sem orçamento para hospedagem** → Codeberg.
- **Fluxos de trabalho centrados no terminal e em e-mail** → SourceHut.
- **Você não quer nenhum ponto central de falha** → Radicle.

## Checklist de migração

Migrar para um novo forge é em grande parte mecânico — essa é a consequência feliz de o Git ser o substrato universal:

1. **Exporte os repositórios.** Faça `git clone --mirror` em cada repositório, ou use o recurso de arquivamento/exportação do GitHub se você precisar também de issues e PRs.
2. **Crie o destino.** Gitea, Forgejo e GitLab têm importadores integrados que podem puxar um repositório (e geralmente issues) diretamente de uma URL do GitHub — o caminho mais rápido para projetos pequenos.
3. **Envie o histórico.** `git push --mirror <new-remote>` preserva branches e tags exatamente.
4. **Reconfigure o CI.** Workflows do GitHub Actions rodam nas Actions do Gitea/Forgejo com mudanças menores; o GitLab CI usa sintaxe própria, então reserve tempo para traduzir os pipelines.
5. **Atualize os remotes para a equipe.** `git remote set-url origin <new-url>` e reemita tokens/chaves SSH.
6. **Mantenha o GitHub como um espelho somente leitura** (opcional). Envie para o seu forge e espelhe no GitHub para ter visibilidade — muitos projetos funcionam assim permanentemente.

Também vale a pena revisitar enquanto você faz isso: se sua equipe depende de fluxos de trabalho com PRs empilhados, ferramentas como [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) ou uma configuração de [pull requests empilhados]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) são independentes do forge — funcionam de forma idêntica quer o remote seja GitHub, Gitea ou um servidor bare.

## O que observar

Duas tendências valem a pena acompanhar em 2026. Primeiro, **federação**: a Forgejo Federation e esforços semelhantes estão lentamente transformando forges de jardins murados em uma rede, da mesma forma que o e-mail e o ActivityPub fizeram em seus domínios. Segundo, **política de IA como motor de migração**: a postura que uma plataforma adota em relação ao treinamento com seu código e à marca d'água em saídas de IA está se tornando um critério de primeira classe — exatamente o que levou tanta gente ao Codeberg este ano. Terceiro, **confiabilidade como escolha operacional**: depois do histórico de indisponibilidade de 2026, o padrão de espelhamento está ganhando espaço — forge auto-hospedado como principal, GitHub mantido como espelho somente leitura para visibilidade — o que transforma o risco de disponibilidade em algo que você controla, em vez de algo que você absorve.

A versão curta: você não precisa da permissão do GitHub para sair, e não precisa sacrificar recursos para isso. Um único binário Go em um servidor que você controla oferece 90% da experiência, sem nenhuma vigilância — e o Git torna a mudança reversível a qualquer momento.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitButler: O Que É, Review e Alternativas [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
