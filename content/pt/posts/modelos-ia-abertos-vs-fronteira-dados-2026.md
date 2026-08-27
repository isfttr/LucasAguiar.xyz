---
date: 2026-08-26T19:04:28-03:00
draft: false
title: "IA aberta vs. modelos de fronteira: o custo oculto dos seus dados [2026]"
description: DeepSeek custa US$ 0,18 por milhão de tokens; Claude, US$ 50. Entenda por que o risco com dados corporativos vai afastar grandes empresas do premium da fronteira de IA.
featured_image: ""
categories:
  - article
tags:
  - ia
  - software-livre
  - privacidade
  - tecnologia
---
O mercado de IA se dividiu em dois: modelos de pesos abertos (open weights) vencem em volume de uso, e os modelos fechados de fronteira (OpenAI, Anthropic) vencem em receita. Os dados de uso de junho a agosto de 2026, compilados pela Vercel e analisados em um vídeo de grande circulação, mostram a DeepSeek ultrapassando a Anthropic em participação de tokens (25,2% contra 24,5%) — enquanto a Anthropic ainda captura 64,6% do dinheiro gasto em tokens, contra 2,8% da DeepSeek. A conclusão que interessa a empresas: **as grandes organizações vão parar de pagar o prêmio dos modelos de fronteira, porque o risco que eles representam para os seus dados pesa mais do que o ganho marginal de inteligência.**

## Volume e dinheiro: a divisão do mercado

O gráfico que circulou (fonte: plataforma da Vercel, jun–ago/2026) conta a história em duas linhas. A primeira é a participação de tokens: os modelos abertos — grátis para baixar, rodar onde quiser, ajustar com dados próprios — estão tomando volume rapidamente, puxados pelos modelos chineses (DeepSeek, Qwen, Kimi, GLM). A segunda é a participação em receita: os modelos de fronteira ocupam cerca de 50% do volume de tokens, mas concentram perto de 90% do dinheiro.

A explicação está no preço. Claude Fable 5 cobra cerca de US$ 50 por milhão de tokens de saída; DeepSeek V4 Flash, US$ 0,18. São classes diferentes, mas a diferença de "95% tão bom" vale bilhões: para as tarefas mais difíceis — negociação de alta frequência, pesquisa de ponta, decisões em que o erro custa caro — a vantagem de alguns pontos percentuais de inteligência justifica o prêmio. É isso que sustenta os números bilionários: a Anthropic opera com run rate anualizado acima de US$ 65 bilhões e a OpenAI, em torno de US$ 40 bilhões — mais do que todos os provedores de modelos abertos somados.

## O custo que não aparece na fatura: seus dados

O prêmio da fronteira, porém, tem um custo escondido que não está no preço por token: os dados. Quem usa modelos fechados entrega à OpenAI ou à Anthropic não só o conteúdo processado, mas também a forma como a empresa opera — processos internos, decisões, know-how. O caso do Claude Fable 5, que gerou polêmica por reter dados dos usuários, é o exemplo mais visível; no [teste de alinhamento que analisamos aqui]({{< relref "posts/fable-5-vending-bench-alinhamento-ia/" >}}), o comportamento do modelo já era, no mínimo, questionável.

Isso é o que se chama de platform risk: construir o negócio sobre o serviço de um terceiro significa aceitar que esse terceiro pode, um dia, usar o que aprendeu sobre você para competir com você — ou simplesmente desligar o acesso. Para uma empresa cujo valor está exatamente nos dados proprietários (clientes, contratos, fórmulas, jurisprudência interna), entregar esse ativo a um concorrente em potencial é um risco estratégico que nenhuma redução de preço compensa.

## Grandes empresas já estão migrando

Esse movimento não é teórico. Empresas grandes e conhecidas já estão construindo produtos sobre modelos abertos: a Thomson Reuters e a plataforma jurídica Harvey usam Qwen (com fine-tuning proprietário); a Perplexity usa DeepSeek; a Airbnb usa Qwen. A motivação declarada é custo e privacidade — no caso jurídico, controlar integralmente os dados sensíveis dos clientes. A Harvey documentou o fine-tuning do Qwen K3 e o resultado aparece nos benchmarks jurídicos, com o modelo customizado disputando as primeiras posições.

Há ainda o argumento do custo por tarefa, não por token: o Kimi K3 custava metade do preço por token do GPT-5.6 Soul, mas o custo total de completar a mesma tarefa era quase idêntico (US$ 0,84 contra US$ 0,96) porque consumia mais tokens. Ou seja, a vantagem de preço da fronteira pode ser ilusória — e a vantagem de controle, real.

## A conclusão: o dado vale mais que a inteligência marginal

Para a maioria das empresas, o modelo de fronteira resolve o mesmo problema que um modelo aberto ajustado com dados internos — e o modelo aberto ainda devolve o controle: você é dono dos dados, escolhe entre dezenas de provedores de inferência (e não um duopólio), e pode customizar até obter mais inteligência pelo mesmo preço. O custo da fronteira, medido em exposição de dados, supera o benefício de alguns pontos percentuais de benchmark.

A OpenAI já reage cortando preços agressivamente (GPT-5.6 Luna caiu 80%; GPT-5.6 Soul, 20% a 33% nos últimos dias) — sinal de que a pressão dos modelos abertos chegou à receita. O cenário provável é o descrito pelo economista Cristian Catalini: um mercado de três camadas, com modelos abertos genéricos baratos dominando o volume, especialistas de estado da arte (abertos e ajustáveis) capturando a maior parte do gasto enterprise, e a fronteira absoluta fechada mantendo receita alta, mas num nicho — o das tarefas em que o melhor absoluto vale bilhões.

Para a empresa que quer proteger o que é seu, a lição é dupla. Primeiro, avaliar modelos abertos como ativo estratégico — a infraestrutura para rodá-los localmente já é acessível, como mostramos no [guia de execução de LLMs em hardware modesto]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}}). Segundo, tratar os dados como o ativo que são: se a sua vantagem competitiva está neles, entregá-los a um modelo fechado é o custo que a fatura não mostra. Quem decide pelo modelo aberto troca o prêmio da fronteira por uma moeda mais valiosa: o controle sobre a própria operação. E, no limite, a proteção legal dessas decisões também importa — vale saber [como proteger inovações de IA no Brasil]({{< relref "posts/patentes-inteligencia-artificial-brasil-guia-2026/" >}}) antes de escolher onde o seu modelo roda.

Uma ressalva geopolítica acompanha o argumento: os melhores modelos abertos hoje são chineses, e há o risco de dependência de chips chineses conforme modelos e hardware passam a ser co-desenhados. Para empresas brasileiras, isso reforça, e não enfraquece, a tese de controle — mas torna a escolha de provedor uma decisão estratégica, não apenas técnica.

Leia também:

- [Patentes de Inteligência Artificial no Brasil: Guia Completo sobre Proteção de Invenções de IA [2026]]({{< relref "posts/patentes-inteligencia-artificial-brasil-guia-2026/" >}})
- [Claude Fable 5 mente, forma cartéis e racionaliza seu próprio comportamento antiético — o que o último teste de alinhamento revela [2026]]({{< relref "posts/fable-5-vending-bench-alinhamento-ia/" >}})
- [Como Executar LLMs de 70B em uma GPU de 4GB: Guia de Inferência com Baixo VRAM [2026]]({{< relref "posts/run-70b-llm-low-vram-gpu-guide-2026/" >}})

Fonte dos dados: [vídeo de análise de mercado de tokens (ago/2026)](https://youtu.be/2w7ZdceZT-g) e [Artificial Analysis — Intelligence Index](https://artificialanalysis.ai/).

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
