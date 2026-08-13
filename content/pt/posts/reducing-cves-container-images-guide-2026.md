---
date: 2026-08-13T18:07:43.000Z
draft: false
title: 'Como Reduzir CVEs nas Suas Imagens Docker: Guia de Segurança de Containers [2026]'
description: 'Guia prático para reduzir CVEs em imagens de contêineres Docker: varredura com Trivy e Grype, builds multi-estágio e distroless, atualizações seguras de dependências, backporting e SBOMs. Inclui comandos e um checklist para CI.'
featured_image: ''
categories:
  - article
tags:
  - containers
  - docker
  - security
  - devops
  - homelab
slug: reduzir-cves-imagens-docker-seguranca-containers
translation_source_hash: eafca21d533450365d1b9c3a3d87e1a97f27bef1f768af6be7c1e3ddb9c11d98
---
Começa de forma inocente. Você baixa uma imagem popular, executa `docker scan` ou Trivy por curiosidade e, de repente, se depara com uma parede vermelha: centenas de vulnerabilidades em um contêiner que você criou ontem. A reação comum é pânico e depois descaso — "é só uma imagem base, todo mundo usa isso." Ambas as reações estão erradas. Reduzir CVEs em imagens de contêiner não é chegar a zero (isso raramente é realista), mas entender de onde vêm as vulnerabilidades e reduzir a superfície de ataque de forma sistemática.

Este guia é o manual prático que eu gostaria de ter quando comecei a endurecer minha própria stack auto-hospedada. Ele cobre varredura, estratégia de imagem base, atualizações de dependências, os casos difíceis que exigem backport e ferramentas de cadeia de suprimentos — com comandos reais que você pode executar hoje.

## Por que imagens de contêiner acumulam CVEs

Uma imagem de contêiner não é um artefato único; é uma pilha de camadas, cada uma com sua própria árvore de dependências. As imagens padrão que a maioria das pessoas usa carregam três fontes distintas de risco:

1. **A camada do sistema operacional.** Imagens como `node:22-slim` são construídas sobre Debian — neste caso, Debian 12 (bookworm). A distribuição acompanha milhares de pacotes, e com eles vem uma longa cauda de vulnerabilidades no nível do SO. Cada `apt-get install` no seu Dockerfile adiciona mais superfície.
2. **Dependências da aplicação.** Seu `package.json`, `requirements.txt` ou `go.mod` traz bibliotecas que muitas vezes estão a um salto de versão principal da versão corrigida. Os scanners sinalizam isso mesmo quando a versão instalada "funciona normalmente".
3. **Restos de build.** Builds multi-estágio feitos errado deixam compiladores, símbolos de depuração e gerenciadores de pacotes na imagem final — ferramentas inúteis em tempo de execução, mas extremamente úteis para um atacante.

Uma ilustração concreta de agosto de 2026: quando a equipe por trás do [Echo e NanoClaw publicou o post sobre a colaboração por baixo dos panos](https://www.echo.ai/blog/echo-xnanoclaw-under-the-hood), eles mostraram que a varredura da imagem padrão do NanoClaw (construída sobre `node:22-slim`) com scanners independentes — Trivy, Grype e Wiz — revelou **1.400 CVEs**. Depois de remover os relacionados ao Chromium que eram seguros de atualizar, aproximadamente **600 vulnerabilidades ainda exigiam trabalho real**. Isso não é um caso isolado; é o estado normal de uma imagem Node típica em 2026.

## Passo 1: Escaneie tudo, na CI, em todo build

Você não pode corrigir o que não consegue ver. O mínimo é um scanner de vulnerabilidades integrado ao seu pipeline de build, não um comando manual que você executa quando lembra.

**Trivy** ([trivy.dev](https://trivy.dev/), [GitHub](https://github.com/aquasecurity/trivy)) é o padrão de fato — rápido, suporta pacotes do SO, dependências específicas de linguagem, IaC e SBOMs, e tem um modelo claro de severidade:

```bash
# Scan a local image (default: all severities, OS + language deps)
trivy image myapp:latest

# Fail CI on critical/high, ignore known-unfixable for now
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest

# Scan a Dockerfile before you even build
trivy fs --scanners misconfig .
```

**Grype** ([github.com/anchore/grype](https://github.com/anchore/grype)) é a outra opção sólida, especialmente se você já está no ecossistema Anchore/Syft. O post do Echo é um bom lembrete para usar **mais de um scanner**: bancos de dados independentes capturam coisas diferentes, e cruzar os resultados é barato.

**Docker Scout** ([docs.docker.com/scout](https://docs.docker.com/scout/)) vale a pena conhecer se você já está no Docker Hub — ele adiciona avaliação de políticas e recomendações de correção diretamente no fluxo de trabalho do Docker, e seu comando `docker scout cves` oferece triagem rápida.

Para um homelab, a configuração mínima viável é um cron job ou uma etapa de CI que escaneie cada imagem publicada e alerte sobre novas vulnerabilidades críticas. Para qualquer coisa pública, `--exit-code 1` em critical/high deve ser um bloqueio rígido. Se você auto-hospeda seus serviços, lembre-se de que a varredura também se aplica às imagens que você *puxa* — veja nosso guia sobre [detecção e bloqueio de tráfego de bots em sites auto-hospedados]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) para o problema adjacente de quem está batendo à porta dos seus serviços expostos.

## Passo 2: Reduza a imagem base

A mudança estrutural mais eficaz é trocar imagens "gordas" baseadas em distribuições por imagens mínimas ou distroless. Menos pacotes na base significa menos pacotes para corrigir.

- **Imagens distroless** ([github.com/GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless)) contêm apenas seu runtime e suas dependências diretas — sem shell, sem gerenciador de pacotes, sem compiladores. São mantidas pelo Google e disponíveis para Node, Python, Java, Go e muito mais.
- **`scratch`** é a base mínima definitiva para binários compilados estaticamente (Go e Rust são os exemplos clássicos). Você controla tudo, então sabe exatamente o que está dentro.
- **Alpine** é um meio-termo pragmático: pequena, tem gerenciador de pacotes para quando você precisa, mas usa musl em vez de glibc — teste sua aplicação antes de presumir compatibilidade.

A técnica que torna possíveis as bases mínimas é o **build multi-estágio** ([docs.docker.com/build/building/multi-stage/](https://docs.docker.com/build/building/multi-stage/)): compile e instale as dependências em um estágio de build completo e depois copie apenas os artefatos de runtime para um estágio final enxuto:

```dockerfile
# Stage 1: build
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime — no node_modules dev deps, no build tools
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot
CMD ["dist/server.js"]
```

Repare na linha `USER nonroot` — rodar como root dentro de um contêiner é um dos erros de segurança mais comuns (e mais baratos de corrigir). Combine base mínima + non-root + rootfs somente leitura (`--read-only` em runtime) e você terá eliminado a maioria dos caminhos de ataque fáceis.

## Passo 3: Atualize dependências regularmente — mas conheça os três níveis

Quando a varredura se torna contínua, você descobrirá que as correções se dividem em três níveis, exatamente como a equipe do NanoClaw descreveu:

**Nível 1 — Atualizações seguras.** Bibliotecas conhecidas por compatibilidade com versões anteriores (Chromium é o exemplo canônico) podem ser atualizadas com confiança. Automatize-as com Renovate ou Dependabot e mescle-as rapidamente. A maior parte da sua contagem de CVEs está aqui, e a maior parte é barata de corrigir.

**Nível 2 — Saltos de versão principal.** O scanner diz "corrigido na v3, você está na v1." Antes de empreender uma atualização arriscada, verifique a correção: às vezes o commit corrigido existe em uma versão muito mais próxima do que o banco de dados do scanner conhece. A equipe do NanoClaw descobriu que a correção do Hono `node-server` estava disponível na 1.19.14, mesmo sem os scanners ainda a conhecerem — e contribuiu com ela para o advisory. Sempre verifique o repositório upstream antes de presumir que você precisa do grande salto.

**Nível 3 — Won't-fix e backports.** Mantenedores de distribuições frequentemente corrigem apenas em novas versões principais, ou marcam um CVE como won't-fix para um lançamento antigo. É aqui que você aceita o risco (documentado e monitorado), faz vendor do pacote ou faz **backport** da correção — aplicando um fix de uma versão mais nova na versão que sua aplicação exige.

Fazer backport é genuinamente difícil. Um ótimo exemplo do post do Echo é o [CVE-2025-59375 no expat](https://www.echo.ai/blog/echo-xnanoclaw-under-the-hood): um documento XML de ~250 KiB poderia causar ~800 MiB de alocação — uma amplificação de 3.300x levando à exaustão de memória. A defesa existente contra billion laughs media os bytes de saída analisados, não o uso real de heap; portanto, a correção teve que introduzir uma contabilização real de alocação, atravessando `expat_malloc`/`expat_free`, e mudar assinaturas em uma dúzia de funções internas. Isso não é um cherry-pick de uma linha; é uma mudança no nível de subsistema. Se você não tem capacidade para fazer isso, suas opções são uma distribuição que faça backport para você (veja abaixo) ou aceitar e monitorar o risco.

## Passo 4: Escolha bases que são corrigidas para você

A razão pela qual a imagem do NanoClaw começou com 1.400 CVEs é que as imagens base do Debian 12 carregam uma longa cauda de vulnerabilidades no nível do SO, e o backport padrão das distribuições é lento. Existem alternativas:

- **Chainguard Images** ([edu.chainguard.dev](https://edu.chainguard.dev/)) — imagens mínimas, no estilo distroless, com quase zero CVEs por design, reconstruídas continuamente e com SBOMs incluídos por padrão. Para muitos runtimes, são uma substituição direta.
- **Echo OS** (da mesma empresa por trás do post do NanoClaw) — uma distribuição construída a partir do código-fonte para que cada pacote possa ser corrigido continuamente; a equipe afirma ter eliminado mais de 1,1 milhão de CVEs em seus pacotes. É a opção de artilharia pesada para organizações que precisam zerar as varreduras voltadas para o cliente.

Para homelab e projetos pequenos, Chainguard (ou distroless + suas próprias atualizações) costuma ser o tamanho certo. O trade-off é controle: imagens mínimas significam que você não pode resolver a falta de uma ferramenta com `apt-get install`, então a disciplina no Dockerfile importa mais.

## Passo 5: SBOMs e higiene da cadeia de suprimentos

Escanear sua imagem diz o que está dentro *agora*. Um **SBOM** (Software Bill of Materials) diz o que está dentro, de forma reproduzível, para que você possa auditar mudanças e responder a novos CVEs consultando "quais das minhas imagens incluem este pacote?"

- **Syft** (da equipe do Grype) gera SBOMs em vários formatos; o Trivy também pode produzi-los.
- **`cosign`** ([sigstore.dev](https://www.sigstore.dev/)) assina suas imagens, e **cosign attest** pode anexar o SBOM como uma atestação, para que os consumidores possam verificar tanto *quem* construiu a imagem quanto *o que* está nela.
- **osv-scanner** ([github.com/google/osv-scanner](https://github.com/google/osv-scanner)) usa o banco de dados OSV para escanear projetos e lockfiles, e combina bem com CI.

Uma linha de base pragmática para a cadeia de suprimentos: gere um SBOM em todo build, assine os lançamentos que você publica e fixe as imagens base por digest (`node:22-slim@sha256:...`) para que "latest" não mude sob seus pés. Fixar por digest é o hábito de maior alavancagem para imagens reproduzíveis e auditáveis.

| Passo | Ferramenta / técnica | Quando |
|------|------------------|------|
| Escanear imagens | Trivy ou Grype | Todo build (gate de CI em CRITICAL/HIGH) |
| Verificação cruzada | Segundo scanner (Grype + Trivy) | Periódico / antes do lançamento |
| Reduzir base | Distroless, scratch ou Alpine | Redesenho da imagem |
| Build multi-estágio | Docker multi-stage | Todo Dockerfile |
| Usuário não-root | `USER nonroot` + rootfs somente leitura | Toda imagem |
| Atualizar deps automaticamente | Renovate / Dependabot | Contínuo |
| Verificar correções | Checar repositório upstream, não só o banco do scanner | Saltos de nível 2 |
| SBOM | Syft / Trivy sbom + cosign attest | Todo lançamento |
| Fixar por digest | `image@sha256:...` | Toda imagem base |

## O que acompanhar a seguir

A segurança de contêineres em 2026 está caminhando para **policy-as-code para imagens** (varredura de configuração incorreta do Trivy, políticas do Docker Scout) e **cadeias de suprimentos orientadas por atestação** (Sigstore se tornando o padrão para imagens assinadas com SBOM anexado). Para quem auto-hospeda, a fronteira prática é a mesma que para todos os outros: reduzir a base, automatizar as varreduras e tratar "a imagem funciona" e "a imagem é sabidamente segura" como duas coisas diferentes que precisam ser verdadeiras ao mesmo tempo.

Se você ainda está decidindo entre contêineres e VMs para sua carga de trabalho, nosso [guia de comparação entre Docker Containers e Virtual Machines]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) cobre os trade-offs de isolamento e densidade que interagem com as escolhas de segurança. E para o lado de API da sua stack — incluindo inspecionar o que suas ferramentas de IA enviam para provedores de LLM — veja o [guia de segurança de API LLM]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}}).

Leia também:

- [Como Detectar e Bloquear Tráfego de Bots no Seu Site Auto-Hospedado [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Docker Containers vs Virtual Machines: Guia de Comparação Completo [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Segurança de API LLM em 2026: Como Inspecionar Tráfego de IA e Proteger Suas Chaves]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
