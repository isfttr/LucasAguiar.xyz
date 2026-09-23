---
date: 2026-09-22T18:04:05.000Z
draft: true
title: Agentes de Codificação de IA Estão Inundando Sua CI — Como Reestruturar o Pipeline para Acompanhar [2026]
description: "Guia prático para corrigir o gargalo da CI causado por agentes de codificação de IA: runners mais rápidos, sharding de testes, checkouts enxutos e redução do custo de configuração — com números concretos da equipe de engenharia da Linear."
featured_image: null
categories:
  - article
  - tutorial
tags:
  - ci-cd
  - devops
  - ai-coding-agents
  - testing
  - github-actions
slug: reestruturar-pipeline-agentes-ia-ci
translation_source_hash: b52676426b0cec0c3a3124b193e8e171bb315787fa58b519759b45b56dc5c686
scheduledAt: 2026-09-24T13:34:47.521Z
---
Agentes de codificação de IA agora podem gerar e submeter pull requests ordens de magnitude mais rápido do que um humano pode revisá-los — e para muitas equipes, o gargalo se moveu silenciosamente do editor para o pipeline de integração contínua (CI). Se sua suíte de testes está levando mais de 10 minutos por PR enquanto agentes produzem dezenas de branches por dia, a fila, a conta do runner e a frustração do desenvolvedor apontam para o mesmo problema: o CI não consegue acompanhar. Este guia descreve como reformular um sistema de CI que está sendo sobrecarregado por código gerado por IA, usando o manual concreto que a equipe de engenharia da Linear publicou em setembro de 2026.

## Por que agentes de IA tornaram o CI o gargalo

A mudança fundamental é o volume. Um desenvolvedor humano abre um ou dois pull requests por dia. Um fluxo de trabalho baseado em agentes — ou vários agentes atribuídos a tickets separados — pode produzir muitos mais, e os produz 24 horas por dia. Cada PR, escrito por agente ou não, tem que passar pelos mesmos portões: verificação de tipo (typecheck), lint, testes unitários, testes de integração, verificações de merge. À medida que a taxa de geração de código acelera, a camada de validação deixa de ser uma atividade secundária e se torna o caminho crítico que barra tudo.

A Linear quantificou isso precisamente. Sua suíte de testes quase quadruplicou nos primeiros nove meses de 2026, mas eles ainda reduziram o tempo de espera do pull request de pouco mais de seis minutos para pouco mais de cinco, enquanto reduziram aproximadamente pela metade o tempo de runner por teste. A parte interessante: a maioria de suas vitórias não foi exótica. Foram mudanças disciplinadas na infraestrutura e no fluxo de trabalho que se aplicam a qualquer codebase, em qualquer linguagem.

## Quatro alavancas para desbloquear o CI

A reformulação da Linear se alinha perfeitamente com quatro alavancas. Escolha as que correspondem ao gargalo que você realmente tem.

### 1. Atualize a infraestrutura e as ferramentas primeiro

Antes de otimizar o próprio pipeline, verifique se você o está executando em hardware rápido o suficiente. A Linear migrou de runners hospedados no GitHub para runners de terceiros com CPUs mais rápidas, armazenamento de alto desempenho e melhor infraestrutura de cache. Em uma comparação semelhante, os jobs rodaram 34% mais rápido em média após a mudança, com algumas cargas de trabalho caindo 52%.

A modernização da toolchain rendeu ainda mais. A mudança para o compilador nativo TypeScript (tsgo) reduziu o tempo mediano de sua verificação de tipo (typecheck) em 73% — o suficiente para remover o gargalo da verificação de tipo completamente. Agentes de IA escrevem muito código, então o código que os agentes geram frequentemente aciona análises estáticas caras; tornar essa análise mais rápida é uma das mudanças únicas de maior alavancagem que você pode fazer.

### 2. Otimize os jobs que barram todo o resto

Todo pipeline tem alguns jobs no caminho crítico — o job de detecção de mudanças, o checkout, o portão de merge — que nada mais pode começar antes que eles terminem. Um pequeno atraso aqui se multiplica em todo o trabalho paralelo.

O job de detecção de mudanças da Linear estava fazendo o checkout da árvore de trabalho completa apenas para decidir o que deveria ser executado em seguida (por exemplo, se um diff toca uma migração de banco de dados). Limitar a profundidade do fetch reduziu o mais lento desses portões de 94 segundos para 20; remover o checkout completamente de jobs que nunca precisaram dele economizou mais. A duração mediana do job de detecção de mudanças caiu de 26 para 8 segundos. Se um job apenas inspeciona um diff, não dê a ele o repositório inteiro — um checkout esparso e blobless com histórico limitado geralmente é suficiente.

Quando eles se mudaram para runners de terceiros fora da rede do GitHub, o checkout começou a travar intermitentemente sobre o link IP direto. Eles substituíram `actions/checkout` por uma ação composta que tenta novamente com backoff e define `GIT_HTTP_LOW_SPEED_LIMIT` e `GIT_HTTP_LOW_SPEED_TIME`, de modo que uma conexão travada aborta em cerca de 30 segundos em vez de travar toda a execução. A resiliência de rede no caminho crítico é subestimada: um checkout que trava é um tempo de inatividade do CI para o qual ninguém orça.

### 3. Reduza o custo de configuração repetido

Um job que faz segundos de trabalho real, mas gasta minutos instalando dependências, está consumindo infraestrutura sem entregar valor. Três hábitos eliminam a maior parte desse desperdício:

- **Pré-instale dependências compartilhadas na imagem do CI.** A Linear moveu o cliente Postgres para uma pequena imagem base para que cada shard de teste começasse de um ambiente já pronto para executar, removendo 7-8 segundos de instalação `apt` por shard.
- **Instale apenas o que cada job precisa.** Em seu monorepo pnpm, o fluxo de trabalho de teste da API estava instalando todo o workspace. Restringir a instalação ao pacote da API reduziu o `pnpm install` de 44-73 segundos para 16-18 segundos.
- **Não armazene em cache quando a reconstrução é mais rápida.** Algumas equipes de CI armazenam em cache agressivamente por instinto. A Linear mediu que um acerto de cache levava ~28 segundos para restaurar, enquanto uma instalação filtrada levava ~7.5 — então eles descartaram o cache `node_modules` completamente. Meça isso você mesmo; a frequência de mudança da chave de cache decide se seu cache está ajudando ou atrapalhando.

Eles também evitaram repetir a configuração inalterada: os contêineres da API estavam repetindo todo o histórico de migração do banco de dados em cada execução, mesmo quando um PR não havia alterado o esquema. Carregar um snapshot de esquema gerado, em vez disso, reduziu a configuração do banco de dados de ~12 segundos para 1-2 segundos. E eles agruparam sete pequenas verificações independentes em dois jobs, economizando aproximadamente 87.000 minutos de runner por mês (11.8% do uso total do CI).

### 4. Paralelize a execução de testes — mas respeite a sobrecarga de configuração

Uma vez que o custo fixo por shard é baixo, o sharding compensa. A Linear passou de três para quatro shards de teste, depois para oito, tornando o job crítico ~19% mais rápido e ~19% mais barato em um benchmark inicial.

A maior vitória única foi compartilhar o estado do módulo com regras de isolamento estritas. O Vitest, seu test runner, normalmente isola cada arquivo de teste — o que significava reconstruir os grafos de entidade, GraphQL e decoradores em cada shard. Eles introduziram um projeto opt-in com `isolate: false`, permitindo que arquivos seguros compartilhassem um registro de módulo dentro de cada worker. Isso valeu aproximadamente 17% em economias mensais, e também foi a mudança de maior risco: a elegibilidade tinha que ser explícita por arquivo, com uma correta desmontagem para o estado compartilhado. Notavelmente, como os agentes agora escrevem a maioria de seus testes, eles atualizaram seus arquivos de habilidades de agente para que os testes gerados sigam as mesmas restrições de desempenho por padrão.

Há um limite, porém: o sharding só vale a pena quando a configuração por shard é baixa. Dobrar a contagem de shards dobra o tempo de configuração. Com a configuração em 110-140 segundos por shard, oito shards teriam queimado 15-19 minutos de tempo de runner apenas na configuração — mais do que os testes. Depois de reduzir a configuração para ~40 segundos, oito shards gastaram *menos* tempo total de configuração do que quatro antes, enquanto paralelizaram o dobro.

## Construindo o pipeline para um codebase impulsionado por agentes

A lição mais profunda é organizacional. Quando os agentes escrevem a maioria dos testes, suas restrições de CI se tornam parte da sua engenharia de prompt. A Linear atualizou suas habilidades de agente para que o código gerado siga as mesmas regras de desempenho por padrão — da mesma forma que você documentaria uma configuração de lint para um revisor humano, você codifica o contrato de CI para o agente.

Segundo, espere que o esforço seja contínuo. Uma equipe adicionando aproximadamente 2.000 testes por semana estará sempre buscando o próximo gargalo. A disciplina que escala não é uma única reescrita, mas um processo repetível: meça o que um PR espera, meça o tempo do runner, ataque os jobs no caminho crítico e execute novamente o loop.

## Por onde começar

Se seu CI parece lento sob uma carga de PRs gerados por agentes, comece medindo dois números: quanto tempo um PR espera no CI e quanto tempo de runner cada teste consome. Em seguida, ataque nesta ordem: infraestrutura e ferramentas mais rápidas, os jobs de barreira no caminho crítico, o custo de configuração repetido e, finalmente, o sharding agressivo quando a configuração for barata. Você não precisa adotar tudo de uma vez — as duas primeiras alavancas sozinhas trouxeram a maioria dos ganhos da Linear.

Leia também:

- [Pull requests em pilha: um guia prático para fluxos de trabalho de revisão impulsionados por IA]{{< relref "posts/stacked-pull-requests-guide-2026/" >}}
- [Arquitetura de agentes de codificação de IA: como o pipeline lida com o código gerado]{{< relref "posts/ai-coding-agents-architectural-guide-2026/" >}}
- [Como dividir um commit Git de forma limpa]{{< relref "posts/how-to-split-git-commit-guide-2026/" >}}

---

Você pode entrar em contato comigo sobre este e outros tópicos por e-mail em <contact@lucasaguiar.xyz>
