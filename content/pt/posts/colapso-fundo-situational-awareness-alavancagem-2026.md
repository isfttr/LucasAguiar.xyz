---
date: 2026-08-22T12:39:36-03:00
draft: true
title: "O que Acontece Quando Você Alavanca uma Tese de 166 Anos? O Colapso do Fundo Situational Awareness [2026]"
description: "Subiu 439% com alavancagem de 4x e foi liquidado em semanas: o que o colapso do fundo Situational Awareness ensina sobre retorno esperado e duração."
featured_image: ""
categories:
  - opinion
tags:
  - ai
  - valuation
  - investing
  - ai-bubble
  - markets
  - alavancagem
---

Em 24 de junho de 2026, Leopold Aschenbrenner, 24 anos, era tratado como o próximo Warren Buffett. Seu fundo, Situational Awareness, tinha acabado de entregar o que parecia ser o melhor retorno de um fundo grande no mundo: +439% líquido em menos de dois anos. Cinco semanas depois, o fundo não existia mais — a carteira pública inteira, de compras e vendas a descoberto, foi vendida em um único bloco para a Citadel, com desconto, depois de uma cascata de chamadas de margem.

Este texto é a continuação direta do post sobre [quantos anos de fluxo de caixa o preço de uma ação representa]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}}). Lá, o argumento era sobre o retorno esperado embutido em empresas altamente valorizadas: quanto menor a diferença entre a taxa de desconto e o crescimento perpétuo, mais longe no futuro mora o valor — e mais frágil a aposta fica diante do risco de sobrevivência. O fundo de Aschenbrenner pegou exatamente essa aposta, a mais longa e frágil da tabela, e a multiplicou por quatro com dívida. O que o colapso mostra é o que acontece quando a matemática da duração encontra a aritmética da alavancagem: o tempo, que era a única coisa que a tese precisava, é a primeira coisa que a margem tira de você.

## O caso em números

Aschenbrenner é um produto do ecossistema de IA que ele apostou que venceria: nascido na Alemanha em 2001, entrou na Columbia aos 15, trabalhou no fundo da FTX de Sam Bankman-Fried, foi pesquisador de segurança de IA na OpenAI e saiu (demitido, segundo a OpenAI; contestado por ele) em 2024, logo depois de publicar o ensaio viral de 165 páginas *Situational Awareness: The Decade Ahead* — a tese de que a inteligência artificial superinteligente chegaria "logo" e transformaria o mundo. Meses depois, fundou o fundo homônimo com cerca de US$ 5 milhões de investidores como os irmãos Collison (Stripe), Nat Friedman e Daniel Gross — e, incomumente, a Jane Street ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/)).

A tese de investimento era simples e direta: a IA vai vencer, e vai vencer rápido. Comprar os "picks and shovels" da construção da infraestrutura — energia, computação, armazenamento — e vender a descoberto o software e as empresas que a IA destruiria. Não é uma visão rara; Damodaran observa que boa parte do capex de IA das Big Tech é movida pela mesma crença. O que distinguia o fundo era a intensidade com que a crença foi convertida em posição:

| Métrica | Valor |
|---|---|
| Retorno líquido até 30/06/2026 (carta H1, via FT) | +439% |
| Retorno do high-water mark (Damodaran, ago/25 → jun/26) | +367% |
| Nasdaq no mesmo período | +24% |
| Pico de ativos | ~US$ 45 bilhões |
| Lançamento (fim de 2024) | ~US$ 5 milhões |
| Alavancagem reportada | até 4x (400%) |
| Concentração (13F Q1/26) | US$ 1,86 bi em 26 posições; top 5 = 76% |
| Desfecho em julho | -2/3 do valor público; fundo liquidado |

A concentração do 13F do primeiro trimestre de 2026 conta a história sozinha: Bloom Energy (22,8%), SanDisk (18,8%), CoreWeave (14,4%), IREN (10,4%) e Core Scientific (10,1%) somavam 76% do livro divulgado — empresas de energia, memória e nuvem de GPU, muitas delas jovens, cíclicas e com valuation inteiro construído sobre o futuro distante ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/), [CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)).

Em julho, o setor que o fundo comprou virou contra ele de uma vez: Nebius, SanDisk, Micron e CoreWeave caíram entre 27% e 54% no mês, o Nasdaq 100 recuou mais de 10% e o Kospi — casa da SK Hynix, outra posição do fundo — perdeu cerca de um terço. Com 4x de alavancagem, um recuo de 25% no colateral não é um drawdown: é o fim. Em 29 de julho a Citadel começou a negociar; em 30 de julho o fundo vendeu o livro público inteiro em um bloco único, antes da abertura, e foi liquidado. Os ativos caíram de US$ 45 bilhões para cerca de US$ 10 bilhões — o buraco só não foi maior porque a posição privada na Anthropic não foi marcada a mercado ([CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)). Em 21 de agosto, Ken Griffin confirmou que a Citadel já tinha desfeito mais de 80% do risco comprado, em mais de 100 block trades somando US$ 4 bilhões ([CNBC](https://www.cnbc.com/2026/08/21/citadel-situational-awareness-ken-griffin.html)).

## De volta ao post anterior: o retorno esperado mora lá na frente

No post anterior, a tabela mostrava quando 90% do valor de uma ação é entregue, dado o spread entre taxa de desconto e crescimento perpétuo. O caso extremo — crescimento com spread de 1,5% — empurrava 90% do valor para ~166 anos no futuro. A conclusão era dupla: fluxos de caixa tão distantes tendem a decepcionar (a pesquisa sobre duração mostra que ações "longas" não entregam crescimento maior), e a maioria das empresas não sobrevive nem 30 anos, quanto mais 166.

Repare no que o fundo realmente comprou: não eram as megacaps de fluxo de caixa robusto, mas a segunda derivada da infraestrutura — empresas jovens e cíclicas de energia, memória e nuvem de GPU, o tipo de ativo em que a incerteza de preço é máxima. Na estrutura de Damodaran, empresa jovem é exatamente onde a convicção deveria ser *menor*: a incerteza de avaliação é enorme, os catalisadores de correção são poucos (balanços de empresas jovens não carregam informação), e o timing de qualquer correção é imprevisível. Menos convicção deveria significar mais diversificação e quase nenhuma alavancagem.

O fundo fez o oposto exato: 4x de dívida, 76% em cinco nomes, todos na mesma tese macro. Damodaran resume o erro em uma frase: ele tratou uma aposta macro de risco altíssimo — "a IA vence logo" — como se fosse um título mal precificado, com maturidade finita e correção garantida. "Por que você está agindo como se fosse um bond mal precificado, emprestando 400%?" ([Damodaran, *Lessons from Leo: The Dark Side of Investment Conviction*](https://youtu.be/dNEWqinHrW8)).

## A aritmética da alavancagem: o retorno esperado vira ruína

Aqui está a ponte direta com o post anterior. Lá, o risco de sobrevivência era um desconto silencioso sobre o valor presente: empresas morrem antes de pagar os fluxos distantes, então o valor realizado esperado fica abaixo do que a perpetuidade "promete". O fundo de Aschenbrenner é esse mesmo risco, mas aplicado ao veículo de investimento em vez da empresa.

A alavancagem não muda o retorno esperado da tese — ela muda a *distribuição* de resultados. Multiplica os dois lados: +20% da tese vira +80% no patrimônio com 4x; -20% vira -80%. E adiciona um ponto de não-retorno que a tese pura não tinha: a chamada de margem. Com 4x, uma queda de ~25% no colateral dispara a exigência de capital; se você não pode ou não quer aportar, o book é vendido *no pior momento*, transformando uma perda de marcação — que um horizonte longo poderia esperar reverter — em perda realizada e permanente. A liquidação forçada de 30 de julho é isso em estado puro.

É por isso que o retorno reportado não é o retorno esperado. +439% é a realização de *um* caminho sorteado numa distribuição com cauda gorda e alavancada — não a média dos resultados possíveis. Damodaran aponta ainda que boa parte do "alpha" era momentum: as compras tinham momentum positivo e as vendas a descoberto, momentum negativo, exatamente onde o mercado já estava. Quando o momentum virou, o livro inteiro virou junto. A tese de IA pode até estar certa; a estrutura do investimento é que não sobreviveu para descobrir.

## O que isso significa

Três lições, todas continuidade do post anterior:

1. **Retorno reportado ≠ retorno esperado.** Um retorno de 439% num fundo 4x alavancado não é evidência de que a tese estava certa — é evidência de que a alavancagem amplificou um caminho favorável. O post anterior mostrou que o mercado paga mais por fluxos de caixa distantes e eles decepcionam; aqui o multiplicador converteu a decepção em extinção.

2. **O risco de sobrevivência vale para o veículo, não só para a empresa.** A lição dos dados de longevidade do S&P era: possuir a cesta ampla e ficar parado supera tentar escolher os vencedores de trinta anos. Um fundo com 4x de dívida não sobrevive nem a um mês ruim. A alavancagem é a antítese do "não morra".

3. **A estrutura importa tanto quanto a tese.** Os mesmos US$ 45 bilhões apostados sem dívida, diversificados, teriam tomado um tombo feio em julho — e o investidor ainda estaria no jogo. A combinação de concentração, alavancagem e taxa 2-and-20 (Damodaran chama a estrutura de "abominação") faz o investidor pagar o pior dos dois mundos: fee alta nos dois sentidos e risco de ruína. Quando ele pergunta "quem deveria administrar seu dinheiro — smart money ou humble money?", o colapso deste fundo é o argumento visual.

Nada disso prova que a IA é uma bolha — o próprio Damodaran diz que a história macro pode estar certa, e o post anterior argumentou que a tecnologia provavelmente vencerá. O que o Situational Awareness prova é o ponto mais estreito e mais útil: numa aposta cujo valor mora décadas no futuro, a única coisa que você não pode alavancar é o tempo. A matemática da duração não mudou. O multiplicador é que não perdoa.

*Esta é uma análise pessoal para um público geral, não é aconselhamento de investimento. Não sou consultor financeiro; faça sua própria pesquisa e considere sua própria situação.*

Leia também:

- [Quantos Anos de Fluxo de Caixa Representa o Preço de uma Ação? Duração, Sobrevivência e o Boom de Capex de IA]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [Da Procrastinação ao Progresso: Como a IA me tem ajudado]({{< relref "posts/ai-beats-procrastination/" >}})
- [De Desenvolvedores a Cientistas: Como a IA Está Transformando a Complexidade do Código]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
