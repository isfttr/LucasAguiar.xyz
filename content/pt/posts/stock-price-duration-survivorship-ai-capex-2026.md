---
date: 2026-08-17T13:00:00.000Z
draft: false
title: Quantos Anos de Fluxo de Caixa Representa o Preço de uma Ação? Duração, Sobrevivência e o Boom de Capex de IA
description: O preço de uma ação é o valor presente de décadas de fluxos de caixa futuros — mas a maioria das empresas nunca sobrevive por tanto tempo. O que essa antiga matemática financeira diz sobre o boom de investimentos em IA e o ceticismo crescente em torno dele.
featured_image: ''
categories:
  - opinion
tags:
  - ai
  - valuation
  - investing
  - ai-bubble
  - markets
slug: anos-fluxo-caixa-preco-acao-capex-ia
translation_source_hash: 5dfb182b986ad0a5e835c8181311fb1bd969809641c5ea0bab9194b48b702fce
---
O preço de uma ação é o valor presente de todos os fluxos de caixa futuros que uma empresa produzirá, descontados para hoje. Essa é a definição dos livros-texto, e quase ninguém a contesta. O que recebe muito menos atenção é uma pergunta de acompanhamento simples: **até onde no futuro esse valor realmente está?** E depois que você tem a resposta, uma segunda pergunta desconfortável se segue — as empresas sobrevivem tempo suficiente para entregar esses fluxos de caixa?

Este não é o meu território habitual. Eu escrevo aqui principalmente sobre patentes, tecnologia e regulação da saúde. Mas o ceticismo que agora se acumula em torno do boom de capex em IA — a escala absoluta dos gastos versus os retornos que alguém pode efetivamente apontar — levou muitas pessoas a procurar uma estrutura para entender isso. Esta é a estrutura à qual continuo voltando, e ela acaba sendo mais antiga que a internet.

## A aritmética desconfortável do preço de uma ação

Considere o modelo padrão de crescimento perpétuo (Gordon). O valor de uma ação é o fluxo de caixa do próximo ano dividido pela diferença entre a taxa de desconto `r` e a taxa de crescimento perpétuo `g`. Calcule quanto desse valor total chega até o ano *N*, e você obtém uma fórmula limpa para a fração capturada em qualquer horizonte.

Peça a ele para dizer quando **90%** do valor foi entregue, e os números são muito maiores do que a intuição sugere:

| Perfil | r | g | Spread (r − g) | Anos para atingir 90% |
|---|---|---|---|---|
| Madura / de valor | 10% | 2% | 8.0% | ~30 anos |
| Mista / semelhante a índice | 9% | 4% | 5.0% | ~49 anos |
| Crescimento | 10% | 7% | 3.0% | ~83 anos |
| Crescimento extremo | 9% | 8% | 1.5% | ~166 anos |

O padrão é o ponto principal: **quanto menor a diferença entre `r` e `g`, mais longe no futuro o valor de uma ação reside.** Uma empresa madura, de crescimento lento, tem a maior parte do seu valor dentro de algumas décadas. Uma empresa de alto crescimento — do tipo cujo preço é construído sobre um spread pequeno — depende de fluxos de caixa que estão a *muitas décadas* de distância, muito além da janela de 5 a 10 anos que qualquer analista honesto realmente preverá antes de acenar com as mãos e chamar o restante de "valor terminal".

E essas previsões distantes tendem a ser otimistas demais. A pesquisa sobre expectativas subjetivas descobre que as expectativas de crescimento são responsáveis pela esmagadora maioria do movimento nos índices preço/lucro do mercado — mas que essas expectativas são sistematicamente superestimadas exatamente quando os múltiplos já estão altos ([De la O e Myers, resumo da pesquisa](https://www.ricardodelao.com/research)). O trabalho sobre *duração do fluxo de caixa* mostra a mesma coisa no nível da empresa: ações de alta duração ("longas") cresceram mais rápido no passado, mas entregaram essencialmente o **mesmo** crescimento de lucros que ações de baixa duração nos cinco anos seguintes ([Weber, *Cash Flow Duration and the Term Structure of Equity Returns*](https://www.sciencedirect.com/science/article/abs/pii/S0304405X18300667)). O mercado paga mais por fluxos de caixa concentrados no longo prazo, e os fluxos de caixa concentrados no longo prazo decepcionam.

## A maioria das empresas não vive tanto tempo

Aqui é onde fica pior para a aposta de longo prazo. Esses horizontes de 30, 80, 160 anos assumem que a empresa ainda está *lá* para pagar você. A história diz que essa é uma suposição heroica.

- A taxa de sobrevivência em 10 anos para empresas listadas na NYSE e AMEX entre 1963 e 1995 foi de apenas **61%** ([Baker e Kennedy, *Survivorship and the Economic Grim Reaper*](https://academic.oup.com/jleo/article-abstract/18/2/324/2193956)). Quatro em cada dez desapareceram em uma década — um horizonte muito mais curto do que a avaliação de crescimento precisa.
- A expectativa de vida média de uma empresa do S&P 500 caiu de cerca de 67 anos na década de 1920 para aproximadamente 15–18 anos hoje, com projeções de que três quartos do índice atual estarão desaparecidos ou em processo de desaparecimento por volta de 2027 ([Imperial Business School, *Why companies die*](https://www.imperial.ac.uk/business-school/blogs/executive-education/why-companies-die/)).
- Das 500 empresas originais do S&P de março de 1957, apenas cerca de **17%** sobreviveram cinquenta anos como empresas independentes ([*On Survivor Stocks in the S&P 500 Stock Index*](https://www.mdpi.com/1911-8074/15/2/95)) — menos de 130 ainda estavam de pé por conta própria em 2003.

Executei uma simulação rápida para ver o que acontece com esses números de horizonte de 90% quando você incorpora uma taxa anual constante de "morte". Matematicamente, um risco de mortalidade se comporta como um aumento na taxa de desconto — e comprime os horizontes drasticamente. Aquele número absurdo de 166 anos para crescimento extremo cai para aproximadamente 30 anos quando você aplica o risco histórico implícito nos dados de longevidade de Foster. Em outras palavras: **ou o mercado está precificando uma probabilidade de sobrevivência muito maior do que a média histórica, ou não está precificando o risco de sobrevivência de forma alguma** — e em vez disso tratando `r` como risco puramente sistemático enquanto ignora o risco idiossincrático de simplesmente desaparecer.

Uma ressalva crucial, porque ela corta na direção oposta: *sair do índice* não é o mesmo que *ir a zero*. A maioria das saídas são fusões e aquisições, não falências, e uma aquisição geralmente paga o valor justo — às vezes um prêmio — por esses fluxos de caixa futuros. Portanto, a "morte" que realmente destrói valor para o acionista (falência) é um subconjunto dos desaparecimentos. Minha simulação sugere que, mesmo em um cenário generoso em que apenas 15% das saídas são dificuldades genuínas, o valor realizado *esperado* ainda fica quase 20% abaixo do que a perpetuidade "prometeu". Em cenários mais duros, é um cara ou coroa.

## O paradoxo do sobrevivente — e por que você não pode simplesmente escolhê-los

O teste mais famoso disso é o estudo de Siegel e Schwartz sobre o S&P 500 original de 1957 ([CFA Institute / *Financial Analysts Journal*](https://rpc.cfainstitute.org/research/financial-analysts-journal/2006/long-term-returns-on-the-original-sp-500-companies)). Eles compraram os 500 originais e não fizeram *nada* — deixaram os fracassos fracassarem, reinvestiram os lucros das aquisições nos sobreviventes e nunca consultaram um analista. Esse portfólio sem cérebro superou o índice continuamente atualizado em cerca de **um ponto percentual por ano**, transformando um dólar de 1957 em aproximadamente $124 contra $93 no índice padrão ([resumo do The Motley Fool](https://www.fool.com/investing/general/2015/02/20/just-leave-it-alone.aspx)).

É tentador ler isso como "então basta manter os vencedores". Mas esse é exatamente o problema, e vale a pena deixar claro o porquê. A superação exigiu **zero previsão**. Ela não veio de identificar as ~125 empresas que sobreviveriam cinquenta anos — veio de se recusar a negociar completamente, enquanto o índice oficial continuava comprando os novos entrantes caros que empolgavam a todos e descartando os nomes baratos e sem glamour no caminho de saída. Escolher os sobreviventes eventuais *antecipadamente* é quase impossível; os sobreviventes, ao que parece, tendem a ser ações de valor chatas e de alta lucratividade, não os nomes de crescimento glamorosos da sua época. Comprar a cesta ampla e ficar parado é o movimento genuinamente conservador. Tentar selecionar manualmente os vencedores de amanhã é o especulativo, mesmo quando parece o inteligente.

## Agora aponte essa lente para a IA

Alinhe os números atuais contra esse pano de fundo e o motivo do ceticismo se torna óbvio.

Os maiores hiperscaladores estão no caminho para gastar algo em torno de **$805 bilhões** em capex em 2026, acima dos aproximadamente $261 bilhões em 2024, com algumas projeções chegando a $1,1 trilhão em 2027 ([estimativa da Pinetree Macro / Morgan Stanley](https://pinetreemacroresearch.substack.com/p/the-ai-capex-bubble-bigger-than-you)). O capex tem crescido de 60% a 80% ao ano, enquanto a receita nessas mesmas empresas cresce cerca de 15–16% ([Futuriom](https://www.futuriom.com/articles/news/ctp-is-hyperscaler-ai-spending-sustainable/2026/04)). O resultado previsível: o fluxo de caixa livre agregado do grupo tornou-se negativo pelo que analistas descrevem como a primeira vez em cerca de 35 anos ([Allianz Trade](https://www.allianz-trade.com/en_global/news-insights/economic-insights/AI-capex-cycle-war-proof-now.html)).

Duas coisas tornam isso mais difícil do que os otimistas admitem. Primeiro, os ativos se depreciam rapidamente. Ao contrário do cabo de fibra óptica dos anos 1990 — que ainda carrega tráfego hoje — o capex de IA é em grande parte chips e servidores que se tornam obsoletos em um ciclo curto, criando uma esteira que exige reinvestimento constante em vez de um ativo durável no qual você cresce ([Project Syndicate via LinkedIn](https://www.linkedin.com/top-content/finance/financial-crisis-case-studies/impact-of-the-dot-com-bubble-burst/)). Segundo, os retornos ainda não estão aparecendo onde importa: um estudo da NANDA do MIT descobriu que, apesar de US$ 30–40 bilhões em gastos empresariais, cerca de **95%** dos pilotos de IA generativa corporativa não geraram impacto mensurável nos resultados financeiros ([cobertura da Fortune](https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html)).

Enquanto isso, as avaliações privadas se apoiam fortemente no extremo distante da curva de fluxo de caixa — uma análise do Deutsche Bank avaliou a OpenAI em cerca de 38x e a Anthropic em 44x a receita futura ([via iTiger](https://www.itiger.com/news/1171064290)). Volte à primeira tabela: essas são apostas de spread pequeno e duração longa, as mais frágeis tanto para o risco de sobrevivência *quanto* para a tendência documentada de o crescimento de longo prazo decepcionar. (Os gigantes de capital aberto, financiados em grande parte por seu próprio fluxo de caixa em vez de dívida, são um caso diferente e mais robusto — mas mesmo aí o debate é inteiramente sobre *quando* o retorno chega.)

A esteira também aparece no lado do software: [a IA está transformando a complexidade do código]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}}) tão rápido quanto o hardware que o executa, então tanto as cargas de trabalho quanto as ferramentas continuam escalando em vez de se estabelecerem em um ativo durável. O ciclo de capex não é uma construção única; é um compromisso de continuar operando.

## A história não se repete, mas rima

Nada disso é novo. A história do ciclo de capital está cheia de tecnologias transformadoras que enriqueceram a sociedade e empobreceram os acionistas.

- **Febre das Ferrovias, Grã-Bretanha dos anos 1840.** No pico de 1846, o Parlamento autorizou atos ferroviários cobrindo milhares de quilômetros de trilhos, com investimento alcançando cerca de 7% do PIB. A Grã-Bretanha ganhou uma rede ferroviária nacional que impulsionou a Revolução Industrial — construída em grande parte com capital que nunca rendeu um retorno aos seus financiadores originais ([Market Histories](https://www.markethistories.com/en/the-railway-mania-britains-victorian-tech-bubble-1840s)).
- **Telecom / fibra, final dos anos 1990.** As operadoras gastaram mais de $500 bilhões para instalar fibra em todo o mundo. Em meados dos anos 2000, cerca de 85% dela estava ociosa, os preços de banda larga caíram mais de 90%, e o índice de ações de telecomunicações caiu 92% do seu pico — um nível que ainda não recuperou um quarto de século depois. Essa fibra "desperdiçada" acabou carregando Netflix, YouTube e tudo o que veio depois ([Financial Advisor Magazine](https://www.fa-mag.com/news/what-history-tells-us-about-the-ai-investment-boom-87567.html)).
- **Bolha das pontocom, 1999–2000.** A Amazon sobreviveu a um colapso de 93% do pico ao vale e reinventou o varejo; a maioria de seus contemporâneos simplesmente não sobreviveu ([Market Histories](https://www.markethistories.com/en/the-dot-com-bubble-irrational-exuberance-and-the-internet-gold-rush-1995-2000)). Os sobreviventes, em retrospecto, não eram as melhores *ideias* — eram os melhores *operadores*, obcecados com logística, margens e fluxo de caixa.

A forma recorrente é inconfundível: uma expansão de infraestrutura cria valor enorme e duradouro para a economia enquanto destrói a maior parte do capital dos acionistas que a financiou, e os vencedores eventuais são raros e quase impossíveis de identificar antecipadamente. Essa é a mesma conclusão a que os dados de sobrevivência chegam pela direção oposta.

## O que isso realmente significa

Quero ser cuidadoso com a afirmação aqui, porque é fácil exagerar. Esta **não** é uma previsão de que a IA falhe como tecnologia — o cenário base é provavelmente o oposto, assim como a internet nunca foi a coisa que falhou. É um ponto muito mais restrito sobre a diferença entre duas apostas muito distintas:

1. Quanto mais uma avaliação depende de fluxos de caixa distantes, mais frágil ela é — ao risco de a empresa não sobreviver para entregá-los, *e* à tendência bem documentada de previsões de crescimento de longo prazo ficarem aquém do esperado.
2. Mesmo se você tiver certeza de que uma tecnologia vai remodelar o mundo, capturar isso como *acionista* é um problema completamente separado e muito mais difícil do que estar certo sobre a *tecnologia*.

Vencer para a sociedade e vencer para os acionistas não são o mesmo evento, e a história continua os separando. Isso não é uma afirmação de que a IA é inútil — os ganhos em nível individual são reais, e escrevi sobre como a [IA me ajudou]({{< relref "posts/ai-beats-procrastination/" >}}) de maneiras que nenhum P&L corporativo jamais capturará. Mas utilidade pessoal e retorno para o acionista são perguntas diferentes. Se há um aprendizado prático, é o sem glamour que os dados de sobrevivência do S&P já nos entregaram: possuir a cesta ampla e ficar parado supera tentar selecionar manualmente quais nomes específicos ainda estarão de pé em trinta anos. A matemática da duração e a história da sobrevivência apontam na mesma direção.

*Esta é uma análise pessoal para um público geral, não é aconselhamento de investimento. Não sou consultor financeiro; faça sua própria pesquisa e considere sua própria situação.*

Leia também:

- [De Desenvolvedores a Cientistas: Como a IA está Transformando a Complexidade do Código]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}})
- [Da Procrastinação ao Progresso: Como a IA me ajudou]({{< relref "posts/ai-beats-procrastination/" >}})
- [De Desenvolvedores a Cientistas: Como a IA está Transformando a Complexidade do Código]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
