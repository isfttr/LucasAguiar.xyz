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

No fim de junho de 2026, Leopold Aschenbrenner, 24 anos, era tratado como o próximo Warren Buffett. Seu fundo, Situational Awareness, acabava de entregar +439% líquido no primeiro semestre — o melhor retorno de um fundo grande do mundo. Cinco semanas depois, o fundo não existia mais: a carteira pública inteira, long e short, foi vendida em bloco único para a Citadel, com desconto, após uma cascata de chamadas de margem.

Este texto é a continuação direta de [Quantos Anos de Fluxo de Caixa Representa o Preço de uma Ação? Duração, Sobrevivência e o Boom de Capex de IA]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}}). Aquele post perguntava até onde no futuro mora o valor embutido no preço de uma ação e concluía: quanto menor o spread entre a taxa de desconto e o crescimento perpétuo (`r − g`), mais longe o valor reside, e mais frágil a aposta fica diante do risco de sobrevivência. Na linha mais extrema da tabela — crescimento com spread de 1,5% —, 90% do valor só é entregue em ~166 anos; com o risco histórico de mortalidade, o horizonte encolhe para ~30 anos. O fundo de Aschenbrenner pegou exatamente essa aposta, a mais longa e frágil da tabela, e a multiplicou por quatro com dívida. Este texto é sobre o que acontece quando a matemática da duração encontra a aritmética da alavancagem: o tempo, a única coisa que a tese precisava, é a primeira coisa que a margem tira de você.

## O caso em números

Nascido na Alemanha em 2001, Aschenbrenner entrou na Columbia aos 15, passou pelo fundo da FTX de Sam Bankman-Fried, foi pesquisador de segurança de IA na OpenAI e saiu em 2024 — demitido, segundo a OpenAI; contestado por ele — logo depois de publicar o ensaio viral de 165 páginas *Situational Awareness: The Decade Ahead*, a tese de que a superinteligência chegaria "logo". Meses depois, fundou o fundo homônimo com cerca de US$ 5 milhões de investidores como os irmãos Collison (Stripe), Nat Friedman e Daniel Gross — e, incomumente, a Jane Street ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/)).

A tese de investimento era simples e direta: a IA vai vencer, e vai vencer rápido. Comprar os "picks and shovels" da construção da infraestrutura — energia, computação, armazenamento — e vender a descoberto o software e as empresas que a IA destruiria. Não é uma visão rara — boa parte do capex de IA das Big Tech é movida pela mesma crença. O que distinguia o fundo era a intensidade com que a crença virou posição:

| Métrica | Valor |
|---|---|
| Retorno líquido 1º semestre/2026 (carta H1, via FT) | +439% |
| Retorno do high-water mark (Damodaran, ago/25 → jun/26) | +367% |
| Nasdaq no mesmo período | +24% |
| Pico de ativos | ~US$ 45 bilhões |
| Lançamento (fim de 2024) | ~US$ 5 milhões |
| Alavancagem reportada | até 4x (400%) |
| Concentração (13F Q1/26) | US$ 1,86 bi em 26 posições; top 5 = 76% |
| Desfecho em julho | -2/3 do valor público; fundo liquidado |

A concentração do 13F do Q1/2026 conta a história sozinha: Bloom Energy (22,8%), SanDisk (18,8%), CoreWeave (14,4%), IREN (10,4%) e Core Scientific (10,1%) somavam 76% do livro divulgado — empresas de energia, memória e nuvem de GPU, muitas delas jovens, cíclicas e com valuation inteiro construído sobre o futuro distante ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/), [CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)).

Em julho, o setor que o fundo comprou virou contra ele de uma vez: Nebius, SanDisk, Micron e CoreWeave caíram entre 27% e 54% no mês, o Nasdaq 100 recuou mais de 10% e o Kospi (casa da SK Hynix, outra posição) perdeu cerca de um terço. Com 4x de alavancagem, um recuo de 25% no colateral não é um drawdown: é o fim. Em 29 de julho a Citadel começou a negociar; em 30 de julho o fundo vendeu o livro público inteiro em um bloco único, antes da abertura, e foi liquidado. Os ativos caíram de US$ 45 bilhões para cerca de US$ 10 bilhões ([CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)). Em 21 de agosto, Ken Griffin confirmou que a Citadel desfez mais de 80% do risco comprado, em mais de 100 block trades de US$ 4 bilhões ([CNBC](https://www.cnbc.com/2026/08/21/citadel-situational-awareness-ken-griffin.html)).

Um detalhe amarra este caso ao post anterior: a posição privada na Anthropic, que "salvou" o número do fundo na queda, é o tipo de avaliação que aquele post chamou de mais frágil. Lá, citei o Deutsche Bank avaliando OpenAI em ~38x e Anthropic em ~44x a receita futura: preços que dependem de fluxos distantes e que só se realizam com um evento de liquidez. Sem evento, o retorno reportado é uma marcação, não um retorno — e, no colapso, a marcação simplesmente não aconteceu.

## De volta ao post anterior: o retorno esperado mora lá na frente

O post anterior apoiava a tese em duas pernas. Primeiro, a aritmética: no modelo de crescimento perpétuo (Gordon), o valor de uma ação é o fluxo de caixa do próximo ano dividido pelo spread `r − g`; quanto menor o spread, mais longe o valor reside — a linha de crescimento extremo (spread de 1,5%) empurra 90% do valor para ~166 anos. Segundo, a evidência de que essas previsões distantes decepcionam: as expectativas de crescimento superestimam o futuro justamente quando os múltiplos já estão altos (De la O e Myers), ações de alta duração entregam o *mesmo* crescimento de lucros que as de baixa duração (Weber), e a sobrevivência é a exceção — só 61% das empresas listadas sobrevivem 10 anos, e a expectativa de vida de uma empresa do S&P 500 caiu de ~67 anos nos anos 1920 para ~15-18 anos hoje.

Repare no que o fundo realmente comprou: não eram as megacaps de fluxo de caixa robusto, mas a segunda derivada da infraestrutura — empresas jovens e cíclicas de energia, memória e nuvem de GPU, o tipo de ativo em que a incerteza de preço é máxima. Na estrutura de Damodaran, empresa jovem é exatamente onde a convicção deveria ser *menor*: a incerteza de avaliação é enorme, os catalisadores de correção são poucos (balanços jovens não carregam informação), e o timing de qualquer correção é imprevisível. Menos convicção deveria significar mais diversificação e quase nenhuma alavancagem.

O fundo fez o oposto exato: 4x de dívida, 76% em cinco nomes, todos na mesma tese macro. Damodaran resume o erro: ele tratou uma aposta macro de risco altíssimo — "a IA vence logo" — como se fosse um título mal precificado. "Por que agir como se fosse um bond mal precificado, emprestando 400%?" ([Damodaran, *Lessons from Leo: The Dark Side of Investment Conviction*](https://youtu.be/dNEWqinHrW8)).

## A aritmética da alavancagem: o retorno esperado vira ruína

Aqui está a ponte direta com o post anterior. Lá, o risco de mortalidade foi modelado como um aumento na taxa de desconto: empresas morrem antes de pagar os fluxos distantes, então o horizonte comprime (166 → ~30 anos) e o valor realizado esperado fica abaixo do que a perpetuidade "promete". Para um fundo alavancado, o evento de "morte" relevante não é a empresa do portfólio — é a chamada de margem. Ela se comporta exatamente como mortalidade: trunca a distribuição de retornos no pior momento. O fundo de Aschenbrenner é esse mesmo risco aplicado ao veículo, acelerado ao extremo.

A alavancagem não muda o retorno esperado da tese — ela muda a *distribuição* de resultados. Multiplica os dois lados: +20% da tese vira +80% no patrimônio com 4x; -20% vira -80%. E adiciona um ponto de não-retorno que a tese pura não tinha: a chamada de margem. Com 4x, uma queda de ~25% no colateral dispara a exigência de capital; sem aporte, o book é vendido *no pior momento*, transformando uma perda de marcação — que um horizonte longo poderia esperar reverter — em perda realizada e permanente. A liquidação forçada de 30 de julho é isso em estado puro: a venda com desconto à Citadel realizou de uma vez o pior cenário que a simulação do post anterior estimava.

É por isso que o retorno reportado não é o retorno esperado. +439% é a realização de *um* caminho sorteado numa distribuição com cauda gorda e alavancada — não a média dos resultados possíveis. Damodaran lista os avisos que o teriam impedido de entrar no fundo em 19 de junho: dois anos de sucesso são um milissegundo no tempo de mercado, retornos de 300-400% só existem com dívida por trás, e a estrutura 2-and-20 drena o investidor nos dois sentidos. E boa parte do "alpha" era momentum: compras com momentum positivo, vendas a descoberto com momentum negativo, onde o mercado já estava. Quando o momentum virou, o livro inteiro virou junto. A tese de IA pode até estar certa; a estrutura do investimento é que não sobreviveu para descobrir.

## O que isso significa

O post anterior terminava separando duas apostas: estar certo sobre a *tecnologia* e capturar isso como *acionista* são problemas diferentes, e a história continua os separando — ferrovias, fibra e pontocom enriqueceram a economia enquanto destruíam o capital que as financiou. O Situational Awareness é o caso mais limpo dessa separação em 2026: Aschenbrenner pode estar inteiramente certo sobre a IA, e os investidores ainda assim perderam. Quatro lições, todas continuidade do post anterior:

1. **Retorno reportado ≠ retorno esperado.** Um retorno de 439% num fundo 4x alavancado não é evidência de que a tese estava certa — é evidência de que a alavancagem amplificou um caminho favorável. O post anterior mostrou que fluxos distantes decepcionam; aqui o multiplicador converteu a decepção em extinção.

2. **O risco de sobrevivência vale para o veículo, não só para a empresa.** O post anterior documentou que quatro em cada dez empresas listadas desaparecem em uma década — o fundo não durou seis dias de drawdown. A lição era: possuir a cesta ampla e ficar parado supera tentar escolher os vencedores de trinta anos. Um fundo com 4x de dívida não sobrevive nem a um mês ruim. A alavancagem é a antítese do "não morra".

3. **O retorno esperado de uma posição alavancada depende de quando você entra.** Os primeiros investidores, que entraram com o fundo pequeno, provavelmente saíram com múltiplos mesmo depois do colapso. Quem entrou perto do pico viu o fundo cair ~43% no total (e ~2/3 no livro público), com a liquidação com desconto tornando a perda permanente. Numa aposta alavancada, chegar atrasado não é só pagar mais caro: é herdar a cauda.

4. **A estrutura importa tanto quanto a tese.** Os mesmos US$ 45 bilhões apostados sem dívida, diversificados, teriam tomado um tombo feio em julho — e o investidor ainda estaria no jogo. A combinação de concentração, alavancagem e taxa 2-and-20 (Damodaran chama a estrutura de "abominação") faz o investidor pagar o pior dos dois mundos: fee alta nos dois sentidos e risco de ruína. Quando ele pergunta "smart money ou humble money?", o colapso deste fundo é o argumento visual.

Nada disso prova que a IA é uma bolha — o próprio Damodaran diz que a história macro pode estar certa. O que o Situational Awareness prova é o ponto mais estreito e mais útil: numa aposta cujo valor mora décadas no futuro, a única coisa que você não pode alavancar é o tempo. A matemática da duração não mudou. O multiplicador é que não perdoa.

*Esta é uma análise pessoal para um público geral, não é aconselhamento de investimento. Não sou consultor financeiro; faça sua própria pesquisa e considere sua própria situação.*

Leia também:

- [Quantos Anos de Fluxo de Caixa Representa o Preço de uma Ação? Duração, Sobrevivência e o Boom de Capex de IA]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [Quantos Anos de Fluxo de Caixa Representa o Preço de uma Ação? Duração, Sobrevivência e o Boom de Capex de IA]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [Da Procrastinação ao Progresso: Como a IA me tem ajudado]({{< relref "posts/ai-beats-procrastination/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
