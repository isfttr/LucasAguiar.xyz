---
date: 2026-08-17T18:10:00.000Z
draft: true
title: 'Alternativas ao GitHub em 2026: Comparação entre Opções Auto-hospedadas e Gerenciadas'
description: 'Compare Gitea, Forgejo, GitLab CE, Codeberg, SourceHut e Radicle em 2026: auto-hospedado vs gerenciado, uso de recursos, CI/CD, o histórico de indisponibilidades de 2026 que impulsiona a migração, e um checklist prático.'
featured_image: ''
categories:
  - article
tags:
  - git
  - github
  - self-hosting
  - devops
  - version-control
slug: alternativas-github-2026-comparacao-autohospedadas-gerenciadas
translation_source_hash: 8b1485208fb0bfb11b95b3428e371c8cd733e07d2d7d0948f8153a691a1ad211
---
É domingo à noite, sua janela de deploy está fechando e o GitHub acabou de cair — de novo. Ou talvez nada dramático tenha acontecido: você simplesmente abriu seu feed e o assistente de IA que você nunca pediu estava lá, esperando para "ajudar", enquanto mais um debate sobre código gerado por IA e marca d'água em conteúdo continuava acirrado. Então você digita a pergunta no Hacker News: "Alternativas ao GitHub?" Em poucas horas, ela tem 357 pontos e quase 200 comentários. Você não está sozinho — e a boa notícia é que em 2026 a resposta é melhor do que "é só mudar para o GitLab".

Este guia é um passeio prático e orientado a decisões pelas alternativas reais: os forges leves auto-hospedados (Gitea, Forgejo, Gogs), a plataforma completa (GitLab CE), o serviço hospedado sem fins lucrativos (Codeberg), o minimalista (SourceHut) e o totalmente descentralizado (Radicle). Para cada um: o que é, quanto custa, quanto pesa e para quem é — além de uma lista de verificação de migração no final.

## O panorama de relance

| Opção | Tipo | Licença | Auto-hospedagem | CI/CD | Melhor para |
|---|---|---|---|---|---|
| **Gitea** | Forge leve | MIT | Sim (binário único) | Gitea Actions | Homelab, devs solo, equipes pequenas |
| **Forgejo** | Forge leve (fork do Gitea) | MIT | Sim (binário único) | Forgejo Actions | Auto-hospedagem governada pela comunidade |
| **GitLab CE** | Plataforma DevOps completa | MIT (núcleo) | Sim (mais pesado) | GitLab CI/CD | Empresas, fluxos de trabalho complexos |
| **Gogs** | Forge ultra leve | MIT | Sim (binário único) | Limitado | Auto-hospedagem mínima |
| **Codeberg** | Forge hospedado (Forgejo) | — | Não (gratuito para FOSS) | Forgejo Actions | Projetos de código aberto, postura sem IA |
| **SourceHut** | Forge minimalista | Serviço pago | Sim (auto-hospedável) | sr.ht builds | Fluxos de trabalho baseados em e-mail |
| **Radicle** | Rede ponto a ponto | MIT | Nenhum servidor necessário | Radicle CI | Puristas da descentralização |

## Por que as pessoas estão procurando

As motivações aparecem em todos os tópicos de "alternativas" e merecem ser citadas porque direcionam a escolha:

- **Controle e privacidade.** Seus repositórios, issues e atividade ficam na infraestrutura de outra pessoa. Auto-hospedar significa que seu código nunca sai de um servidor que você controla — relevante para donos de homelab que já rodam [Proxmox e containers]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).
- **Recursos de IA empurrados por padrão.** Assistentes no estilo Copilot, bots de revisão de código e debates sobre marca d'água em conteúdo (os mesmos que atingem todos os grandes produtos de IA em 2026) deixaram muitos desenvolvedores desconfortáveis com uma plataforma que decide por você o que "assistência" significa.
- **Interrupções e disponibilidade.** Quando uma plataforma engasga bem na hora do deploy, o valor de `git push` funcionar contra o seu próprio servidor fica muito concreto. O GitHub registrou **nove incidentes críticos só entre meados de junho e meados de agosto de 2026** — incluindo um grande no dia em que este post foi escrito (veja [o registro de confiabilidade de 2026](#the-2026-reliability-record-today-is-not-an-exception) abaixo).
- **Custo.** Repositórios privados são baratos no GitHub, mas "barato" não é "grátis", e auto-hospedar no hardware que você já roda é efetivamente grátis.
- **Filosofia.** O Git é descentralizado por design; um forge único é uma escolha, não uma lei.

A nuance importante: o Git em si não prende. Todas as opções abaixo falam Git padrão — seu histórico, branches e tags vão com você. A questão é apenas onde o *forge* (issues, PRs, CI, wiki) fica.

## O registro de confiabilidade de 2026: hoje não é exceção

Se você encontrou este post porque o GitHub está tendo um dia ruim, aqui está o contexto que dá sentido ao dia ruim. Em **17 de agosto de 2026**, o GitHub registrou um incidente **crítico** — "Incidente com GitHub.com" — começando por volta das 13:40 UTC (10:40 BRT). Horas depois, a [página de status](https://www.githubstatus.com/) ainda mostrava uma "Interrupção Parcial do Sistema", com requisições de API degradadas, Issues degradadas e falhas esporádicas de autenticação; as operações do Git foram eventualmente mitigadas, mas com impacto residual. A Microsoft confirmou uma enorme interrupção global, coberta pela Forbes, The Economic Times, DevOps.com e outros, enquanto o Downdetector registrou milhares de relatos de usuários. O Hacker News produziu uma rara trinca no mesmo dia: "[Ask HN: O GitHub está frito hoje?](https://news.ycombinator.com/item?id=49333136)", "[O GitHub tem um problema de disponibilidade. Está na hora de procurar outro lugar?](https://news.ycombinator.com/item?id=49333728)" — e, claro, "[Ask HN: Alternativas ao GitHub](https://news.ycombinator.com/item?id=49331033)" (357 pontos).

E isso não é um caso isolado. A página pública de status, que atualmente lista incidentes desde meados de junho, mostra **nove incidentes críticos em dois meses**:

- Ago 17 — GitHub.com (ainda aberto no momento em que este post foi escrito)
- Ago 06 — GitHub Actions
- Jul 25 — falhas e atrasos na execução do Actions
- Jul 24 — Pull Requests
- Jul 21 — conexões SSH usando deploy keys
- Jul 19 — GitHub Actions
- Jul 16 — interrupção geral do serviço
- Jul 09 — atrasos para iniciar execuções do Actions
- Jun 17 — disponibilidade do Copilot

O padrão salta aos olhos na lista: **o GitHub Actions e a superfície de IA/Copilot são os pontos fracos recorrentes**. Quatro dos nove críticos atingiram o Actions, e os incidentes de Copilot/modelos de IA marcados como menores (Jul 30, Ago 1, Ago 3, Ago 5, Ago 10, Ago 13) são frequentes demais para enumerar. Um tópico "[O GitHub caiu de novo](https://news.ycombinator.com/item?id=46946827)" chegou a bater 514 pontos em fevereiro de 2026. O registro não é "o GitHub está sempre fora do ar" — é que, quando quebra, tende a quebrar os componentes dos quais os desenvolvedores mais dependem, no momento em que mais dependem deles, e as falhas são **correlacionadas**: push, PRs, CI e autenticação podem cair juntos.

Essa correlação é exatamente o que a auto-hospedagem elimina. Sua própria instância do Gitea pode cair porque você a configurou errado — mas não vai cair porque a frota de outra pessoa teve uma terça-feira ruim, e não vai levar seu pipeline de deploy junto. Para equipes cujo fluxo de trabalho já é containerizado (veja [containers vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})), rodar o forge ao lado das cargas de trabalho é um pequeno passo com um valor de seguro desproporcional.

## Gitea: o padrão leve para auto-hospedagem

[Gitea](https://about.gitea.com/) é um aplicativo Go que roda como um único binário — nenhum servidor de banco de dados é necessário além do SQLite embutido (PostgreSQL/MySQL também são suportados). É um fork de 2016 do Gogs e hoje é o forge auto-hospedado mais popular de longe, com cerca de **57k estrelas** no GitHub. A proposta: "Git com uma xícara de chá" — sem dor, tudo-em-um e rápido.

O uso típico de recursos é notavelmente baixo: um VPS pequeno com 1 GB de RAM roda confortavelmente, e ele inicia em segundos. Instalar com Docker é uma linha:

```bash
docker run -d --name gitea -p 3000:3000 \
  -v /opt/gitea:/data \
  -e USER_UID=1000 -e USER_GID=1000 \
  gitea/gitea:latest
```

(Instruções completas no [guia oficial do Docker](https://docs.gitea.com/installation/install-with-docker).)

Para CI/CD, o Gitea vem com **Gitea Actions** — um runner compatível com GitHub Actions ([visão geral](https://docs.gitea.com/usage/actions/overview)). Se seus pipelines são escritos como workflows do GitHub Actions, a maioria deles roda no Gitea com mudanças mínimas, o que reduz drasticamente o custo de migração.

Para quem é: o dono de homelab ou desenvolvedor solo que quer recursos parecidos com os do GitHub — issues, pull requests, releases, wiki, pacotes — com uma fração do consumo de recursos. O consenso da comunidade após anos de operação é que upgrades são entediantes: mude a tag da imagem, reinicie, pronto.

## Forgejo: o irmão do Gitea governado pela comunidade

[Forgejo](https://forgejo.org/) começou em 2022 como um fork do Gitea após uma disputa de governança — a comunidade estava preocupada com a direção do projeto. Também é licenciado sob MIT, também é um único binário Go, e permanece intencionalmente compatível com o ecossistema do Gitea: os mesmos conceitos de interface, o mesmo formato de runner do Actions, a mesma facilidade de auto-hospedagem ([instalação via Docker](https://forgejo.org/docs/latest/admin/installation-docker/)).

A diferença é a governança: o Forgejo é administrado pela comunidade e se juntou à **Software Freedom Conservancy**, um guarda-chuva sem fins lucrativos, o que significa que o projeto não pode ser comprado ou redirecionado por uma empresa. Ele também impulsiona recursos experimentais como o **Forgejo Federation** — um protocolo que permite que forges independentes conversem entre si, então um repositório no seu servidor pode receber pull requests do servidor de outra pessoa.

Para quem é: pessoas que querem a experiência do Gitea, mas preferem a propriedade comunitária, e qualquer pessoa que se importa com o futuro da hospedagem de código federada. Sua instância hospedada carro-chefe, o Codeberg (abaixo), é a prova de que o software é de nível de produção.

## GitLab CE: a plataforma completa, com um custo

O [GitLab Community Edition](https://about.gitlab.com/install/) é a opção com recursos mais próxima do GitHub quando você precisa de tudo: aprovações de merge request, CI/CD embutido com um editor de pipeline de primeira classe, registry de containers, varredura de dependências, SSO e permissões granulares. Para uma empresa migrando uma grande organização do GitHub, é o destino menos surpreendente.

O preço é peso operacional. Uma instalação de GitLab em produção quer PostgreSQL, Redis e alguns GB de RAM; a [implantação via Docker](https://docs.gitlab.com/ee/install/docker/installation.html) é o caminho mais fácil, mas você passa a rodar uma pequena plataforma, não um único binário. Equipes que auto-hospedam GitLab há anos relatam que funciona bem — e também que você precisa reservar orçamento para upgrades, runners e o rollback ocasional. Se você é um usuário solo de homelab, o GitLab é quase certamente exagero; se você é uma empresa, é a opção séria.

## Alternativas hospedadas: sem necessidade de servidor

Nem todo mundo quer administrar infraestrutura. Três opções hospedadas se destacam:

**[Codeberg](https://codeberg.org/)** — um forge sem fins lucrativos administrado pela associação Codeberg e.V. na Alemanha, construído sobre o Forgejo. É gratuito para software livre e de código aberto, tem uma postura clara [contra treinamento de IA / anti-raspagem](https://docs.codeberg.org/) e é um destino comum de migração para pessoas que saem do GitHub especificamente por causa das políticas de IA. Doações e voluntários o mantêm funcionando.

**[SourceHut](https://sr.ht/)** — "o forge do hacker". O SourceHut é deliberadamente minimalista: sem interface carregada de JavaScript, fluxos de trabalho baseados em e-mail (`git send-email` para patches) e uma coleção de pequenos serviços (git, listas, builds, man pages, paste). É um serviço pago com uma taxa anual baixa, o que o mantém independente e sem anúncios; o mantenedor, Drew DeVault, é um dos críticos mais veementes da "enshittification" em ferramentas para desenvolvedores. É a escolha certa se você vive no terminal e gosta de ferramentas austeras.

**[Radicle](https://radicle.xyz/)** — uma stack ponto a ponto para colaboração de código (MIT, ~900 estrelas). Não há nenhum servidor central: os repositórios se replicam diretamente entre as máquinas das pessoas que trabalham neles, com issues e patches trocados por uma rede P2P. É a resposta filosoficamente mais pura para "colocar todos os ovos na mesma cesta" — e também a mais de nicho: você precisa que seus colaboradores também o adotem.

## O extremo ultraminimalista

Se até o Gitea parece pesado, lembre-se dos antepassados. **[Gogs](https://gogs.io/)** — o "serviço Git auto-hospedado sem dor" original, também em Go, também MIT — ainda roda em hardware medido em centenas de MB. E abaixo disso há a stack Unix clássica: **gitolite + cgit**, onde o `git` é simplesmente servido a partir de um repositório bare em um servidor que você já tem, sem nenhuma interface web. Não é glamouroso, mas roda código em produção desde antes de o GitHub existir.

## Como escolher: um framework de decisão

- **Dev solo com um servidor antigo ou um VPS de $5** → Gitea (ou Forgejo se você preferir a governança). Ambos cabem em 1 GB de RAM com folga.
- **Equipe pequena que precisa de CI/CD** → Forgejo ou Gitea com Actions; seus workflows do GitHub em sua maioria são aproveitados.
- **Empresa migrando uma organização grande do GitHub** → GitLab CE. Reserve orçamento para PostgreSQL, Redis e tempo de operação.
- **Purista de FOSS, padrão anti-IA, sem orçamento de hospedagem** → Codeberg.
- **Fluxo de trabalho em primeiro lugar no terminal, baseado em e-mail** → SourceHut.
- **Você não quer nenhum ponto central de falha** → Radicle.

## Checklist de migração

Mudar para um novo forge é em sua maioria mecânico — essa é a consequência feliz de o Git ser o substrato universal:

1. **Exporte os repositórios.** Use `git clone --mirror` em cada repositório, ou use o arquivo/exportação do GitHub se você precisar também das issues e PRs.
2. **Crie o destino.** Gitea, Forgejo e GitLab têm importadores integrados que podem puxar um repositório (e frequentemente issues) diretamente de uma URL do GitHub — o caminho mais rápido para projetos pequenos.
3. **Envie o histórico.** `git push --mirror <new-remote>` preserva branches e tags exatamente.
4. **Reconfigure o CI.** Workflows do GitHub Actions rodam no Gitea/Forgejo Actions com mudanças menores; o GitLab CI usa a própria sintaxe, então reserve tempo para traduzir pipelines.
5. **Atualize os remotes da equipe.** `git remote set-url origin <new-url>` e reemita tokens/chaves SSH.
6. **Mantenha o GitHub como um espelho somente-leitura** (opcional). Envie para o seu forge, espelhe no GitHub para descoberta — muitos projetos funcionam assim permanentemente.

Vale a pena revisitar também: se sua equipe depende de fluxos de trabalho com PRs empilhados, ferramentas como [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) ou uma configuração de [pull requests empilhados]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) são agnósticas de forge — funcionam de forma idêntica, não importa se o remote é GitHub, Gitea ou um servidor bare.

## O que observar

Duas tendências merecem atenção em 2026. Primeiro, **federação**: o Forgejo Federation e esforços semelhantes estão lentamente transformando forges de jardins murados em uma rede, da mesma forma que o e-mail e o ActivityPub fizeram para seus domínios. Segundo, **política de IA como motor de migração**: a postura que uma plataforma adota em relação ao treinamento com seu código e à marca d'água em saídas de IA está se tornando um critério de primeira classe — exatamente o que levou tanta gente ao Codeberg este ano. Terceiro, **confiabilidade como escolha operacional**: depois do registro de interrupções de 2026, o padrão de espelhamento está ganhando terreno — forge auto-hospedado como primário, GitHub mantido como espelho somente-leitura para descoberta — o que transforma o risco de disponibilidade em algo que você controla, em vez de algo que você absorve.

A versão curta: você não precisa da permissão do GitHub para sair, e não precisa sacrificar recursos para isso. Um único binário Go em um servidor que você controla dá a você 90% da experiência, sem nenhuma da vigilância — e o Git torna a mudança reversível a qualquer momento.

Leia também:

- [Containers Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Containers Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitButler: O Que É, Análise e Alternativas [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
