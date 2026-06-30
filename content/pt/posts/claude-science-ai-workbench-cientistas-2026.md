---
date: 2026-06-30T19:00:00-03:00
draft: true
title: "Anthropic lança Claude Science: um AI workbench para cientistas [2026]"
description: "A Anthropic apresentou o Claude Science, um ambiente de pesquisa integrado com mais de 60 skills científicas pré-configuradas, artefatos reprodutíveis e suporte a computação em HPC — em beta público para usuários Pro, Max, Team e Enterprise a partir de hoje."
featured_image: ""
categories:
  - article
tags:
  - ia
  - pesquisa-cientifica
  - anthropic
  - tecnologia
  - inovacao
  - genomica
  - proteinas
---

A Anthropic lançou hoje o **Claude Science**, um AI workbench projetado especificamente para cientistas e pesquisadores. O anúncio veio acompanhado do lançamento do Claude Sonnet 5, consolidando o dia como um dos maiores da empresa em 2026.

Disponível em beta público para assinantes dos planos Pro, Max, Team e Enterprise, o Claude Science promete unificar o ecossistema fragmentado de ferramentas de pesquisa científica em um único ambiente controlado por IA.

## O problema que o Claude Science resolve

Pesquisadores científicos lidam com dezenas de fontes de dados — cada uma com seu próprio esquema e linguagem de consulta —, formatos de arquivo que exigem pipelines e visualizadores específicos, e um arsenal de ferramentas que inclui PubMed, Jupyter, R e terminais de cluster. Transitar entre esses sistemas consome tempo e introduz erro.

O Claude Science consolida essas ferramentas em um único ambiente onde o cientista pode conduzir todas as etapas do trabalho: desde a análise de literatura até a execução de pesquisas multi-etapa, passando pela produção de artefatos, figuras e manuscritos prontos para publicação.

## Como funciona

O usuário interage com um **agente coordenador generalista** que tem acesso a mais de 60 skills e conectores pré-configurados para áreas como:

- Genômica
- Single-cell
- Proteômica
- Biologia estrutural
- Quimioinformática

Esses agentes podem criar sub-agentes especializados e interagir com agentes criados pelos próprios usuários. Um **agente revisor** dedicado verifica citações e cálculos, sinalizando e corrigindo erros automaticamente.

### Artefatos científicos ricos e totalmente reprodutíveis

O Claude Science gera figuras e manuscritos junto com o código que os produziu. Ele renderiza nativamente artefatos científicos complexos, incluindo:

- Estruturas 3D de proteínas
- Genome browser tracks
- Estruturas químicas

Cada figura gerada vem acompanhada do código exato, da descrição do ambiente, de uma explicação em linguagem natural de como foi criada e do histórico completo da conversa. O usuário pode pedir alterações em linguagem natural — "remova as linhas de grade" ou "mude o eixo para escala log" — e o agente edita seu próprio código.

### Gerenciamento inteligente de computação

Análises de larga escala — como o dobramento de proteínas ou pipelines genômicos sobre datasets massivos — exigem setup de jobs em cluster, verificação de conclusão e coleta de resultados. O Claude Science automatiza esse processo:

1. Elabora um plano
2. Pede autorização antes de acessar novos recursos
3. Permite revisar ou revogar qualquer decisão
4. Submete o job aos recursos de computação que o laboratório já utiliza (HPC via SSH ou Modal para computação sob demanda)
5. Escala de uma única GPU a centenas conforme necessário

Como os agentes trabalham dentro de uma sessão ativa que mantém contexto em memória, datasets massivos só precisam ser carregados uma vez. E tudo roda na infraestrutura do próprio laboratório — laptop, servidor Linux ou nó de login HPC — sem que dados sensíveis precisem sair dos sistemas onde já estão.

### Conectividade com ecossistemas científicos

O Claude Science usa as skills do **NVIDIA BioNeMo Agent Toolkit** para se conectar nativamente a modelos e bibliotecas como **Evo 2**, **Boltz-2** e **OpenFold3**. Pesquisadores também podem conectar seus próprios modelos, datasets e pipelines, salvando qualquer workflow como uma skill reutilizável.

## Casos de uso reais (beta fechado)

Durante os meses de beta fechado, o Claude Science foi testado por instituições de pesquisa com resultados expressivos:

**Manifold Bio** — startup que desenvolve medicamentos direcionados a tecidos específicos — usou o Claude Science para nomear alvos de seus experimentos mais recentes. Para cada tecido e alvo, o sistema avaliou expressão de superfície, tráfego e segurança, ranqueando candidatos contra os critérios desenvolvidos pela empresa. A diferenciação, segundo a Manifold, foi a capacidade de fazer isso de ponta a ponta.

**Jérôme Lecoq**, neurocientista do Allen Institute, usou o Claude Science para construir um "template computacional de revisão" com cerca de 20 skills customizadas. O sistema lê milhares de artigos, extrai teses centrais e achados quantitativos, e produz revisões com mais de 100 páginas. O que antes levava até dois anos para ser escrito agora é feito em fração do tempo — Lecoq já produziu cerca de 10 revisões.

**Stephen Francis**, professor associado e epidemiologista do UCSF Brain Tumor Center, usou o Claude Science para estudos sobre epidemiologia molecular de glioma. Seu laboratório conseguiu realizar análises germline abrangentes em aproximadamente **um décimo do tempo** anterior, com resultados validados independentemente.

## Disponibilidade e preços

- **Planos:** Pro, Max, Team e Enterprise (Teams e Enterprises precisam de habilitação pelo admin)
- **Plataformas:** macOS e Linux (local ou remoto via SSH/HPC)
- **Desconto acadêmico:** Planos Team com preços especiais para laboratórios ativos em instituições acadêmicas e organizações de pesquisa sem fins lucrativos
- **Programa de apoio:** Até 50 projetos "AI for Science" com até US$ 30.000 em créditos (Modal oferece até US$ 2.000 em computação adicional para projetos selecionados)
- **Inscrições** abertas até 15 de julho de 2026, com notificação até 31 de julho. Projetos rodam de 1º de setembro a 1º de dezembro de 2026.

## O que isso significa

O Claude Science representa uma aposta significativa da Anthropic no mercado de pesquisa científica — um segmento que empresas como Google (com o AlphaFold) e NVIDIA (com o BioNeMo) já disputam. A diferença está na abordagem de **workbench integrado com agentes**: em vez de oferecer ferramentas isoladas para dobramento de proteínas ou análise genômica, o Claude Science unifica todo o fluxo de pesquisa em um ambiente controlado por linguagem natural, com reprodutibilidade e auditoria embutidas.

Para o ecossistema brasileiro de pesquisa, a disponibilidade via acesso remoto (SSH/HPC) e o suporte a laboratórios acadêmicos com preços diferenciados são pontos relevantes — instituições como CNPEM, LNCC e redes de universidades estaduais poderão testar a plataforma sem exigir investimento inicial em infraestrutura adicional.

O lançamento simultâneo do Claude Sonnet 5 — que a Anthropic descreve como "desempenho de fronteira em coding, agentes e trabalho profissional em escala" — sugere que o Claude Science é alimentado pelo modelo mais recente da empresa, o que pode dar a ele vantagens competitivas em tarefas que exigem raciocínio longo e manipulação de código científico.

---

Leia também:

- [Anthropic lança Claude Tag: nova forma de trabalho colaborativo com IA]({{< relref "posts/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
