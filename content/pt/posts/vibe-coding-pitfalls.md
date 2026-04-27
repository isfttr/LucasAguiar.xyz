---
date: 2025-03-20T13:01:03-03:00
draft: false
title: Por Que Estou Terminando Com o Vibe Coding
description:
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-vibe-coding-v2.png
categories:
  - artigo
tags:
  - inteligência-artificial
  - cursor
  - vibe coding
  - claude
---

Já estivemos todos lá: fones no ouvido, música alta, dedos voando pelo teclado, perdidos no "flow" com seu agente de IA favorito. Isso, meus amigos, é o vibe coding. É quando você está na zona, produzindo código aparentemente sem esforço.

É a ideia de que você pode criar software de qualidade simplesmente se imergindo na sensação de programar, confiando na intuição e surfando a onda da inspiração. Mas ultimamente percebi que, pelo menos para mim, o vibe está… errado. É como se eu estivesse assistindo a um agente de IA programar por mim, ocasionalmente dando uma sugestão ou uma correção, mas muitas vezes apenas observando o código se desdobrar sem compreender totalmente as complexidades do que está acontecendo — o que acaba me fazendo perder tempo mais tarde.

## O Que É Vibe Coding, Afinal?

Vibe coding é menos uma metodologia e mais um estado de espírito. É sobre priorizar o uso de um agente de IA em vez de realmente pensar na implementação do código com planejamento estruturado e testes rigorosos. É sobre perseguir aquela dose de dopamina do progresso, muitas vezes sem um roteiro claro. É sedutor porque parece produtivo.

## Por Que o Vibe Está Me Falhando

Nos últimos dois meses, tenho dependido muito do vibe coding, e os resultados não foram bonitos. Eis o porquê:

Primeiro, fui atraído inicialmente por agentes de IA como Cline, Roo Code e depois tentei o editor Cursor porque prometiam aprimorar meu flow de programação. Adorei a ideia de ter um parceiro de IA que pudesse antecipar minhas necessidades e me ajudar a escrever código mais rápido. No entanto, percebi rapidamente que essa abordagem estava me desviando do caminho.

O que percebi é que usar o agente de IA é ótimo para criar um protótipo do que você quer, mas depois disso, as janelas de contexto e tudo mais levam a cada vez mais retrabalho ao longo do tempo. Isso acontece porque, em sua frustração, a primeira coisa que vem à mente é simplesmente explicar ao modelo novamente, sem sequer saber o que foi implementado. Isso é compreensível, pois em questão de minutos o agente pode ter escrito mil linhas de código e, obviamente, isso é meio absurdo.

Os maiores problemas que vejo no vibe coding são:

- **É uma enorme armadilha de tempo:** no começo parece que você está avançando, mas como não há estrutura, você é guiado pelo que aparece na tela, e fica consumido pelo próximo erro ou recurso funcionando que aparece.
- **É caro:** essa é uma consequência do primeiro problema. À medida que as janelas de contexto crescem, as requisições ficam mais caras, e rapidamente você pode ver números como 500 mil tokens enviados e uma fração disso recebida.

No fim das contas, não parece uma grande economia de tempo para muitas tarefas, se você começar um projeto sem estrutura. O tempo que você "economiza" no começo, terá que usar depois para reescrever o código para fazer o que você pretendia.

## O Outro Lado: Uma Visão do Entusiasta

Mas também há muitos benefícios, já que pelo menos posso entender mais sobre o código com o tempo. Ao começar essa jornada, ficou claro para mim que levaria tempo e dinheiro para criar projetos que valessem a pena. Algo que inicialmente pode parecer inalcançável, depois de ler o código várias vezes tentando entender os erros, comecei a compreender a estrutura e a sintaxe da linguagem. No meu caso, estou focando meus esforços em aprender Python, então a maior parte do código que crio é em Python. Com o tempo, consigo entender melhor qual é o erro e posso direcionar o modelo para a solução.

## Vibe Coding vs. Chat com IA vs. Busca na Web

**Vibe Coding:** Ótimo para exploração inicial e entender um problema, mas péssimo para desenvolvimento estruturado e projetos complexos.

**Chat com IA (ChatGPT, etc.):** Útil para gerar código boilerplate e obter respostas rápidas, mas pode levar à dependência de soluções geradas por IA sem compreendê-las totalmente. Requer verificação cuidadosa e pode sofrer com "alucinações de IA".

**Busca na Web (Google, etc.):** Essencial para encontrar soluções específicas e entender conceitos, mas pode ser avassaladora e demorada se você não sabe o que está procurando.

O equilíbrio parece estar no uso de autocompletar no editor e em algo como o Gemini Code Assist. Estou usando o Gemini Code Assistant porque é gratuito e estou gostando muito. Uso no VS Code e recomendo. É muito bom para criar testes unitários e, ao executar testes, é razoavelmente bom em resolver as falhas.

Outra coisa que tentei, mas estou inclinado a abandonar, é usar um agente como Roo Code ou Cline. Eles podem continuar por muito tempo e consumir muitos tokens sem garantia de funcionamento. Portanto, o problema se torna como tornar isso mais barato ao longo do tempo. O [GosuCoder](https://www.youtube.com/@GosuCoder) é alguém que vejo testando várias estratégias para manter os custos baixos, mas o principal gargalo é o uso do Claude. Embora pareça ser o único com suporte completo para tudo, é um dos modelos mais caros de executar e, com a tendência de usar muitos tokens, os custos se tornam proibitivos para a maioria das pessoas. Se não fosse por isso, Gemini 2.0 e DeepSeek V3/Chat parecem muito bons para a maioria dos usos em programação (pelo menos para mim).

Outra estratégia tem sido o uso do Open WebUI, do qual tenho gostado muito. Tem uma tonelada de recursos e opções, o que dá muito controle. O que gosto é de usar modelos personalizados para diferentes casos de uso (programação, patentes, doutorado, etc.). É relativamente barato e ao usar o Gemini oferece uma janela de contexto muito boa para editar arquivos grandes.

## Conclusão: Encontrando um Equilíbrio Melhor

Não estou dizendo que vibe coding é sempre ruim. Há definitivamente valor em deixar a criatividade fluir e explorar ideias sem restrições rígidas. No entanto, aprendi que não é uma abordagem sustentável para mim, especialmente quando os prazos se aproximam e os custos de API aumentam. Para mim, o Gemini Code Assist parece uma ótima alternativa, porque é gratuito e tem uma ótima janela de contexto. Além disso, o Open WebUI é ótimo pelo controle e capacidade de personalização, e os custos são relativamente baixos para tarefas do dia a dia.

Para mim, este parece ser o melhor equilíbrio por agora, mas estou inclinado a eventualmente pagar por um aplicativo de chat, como o Perplexity (que tem um bom nível gratuito e custa 20 dólares por mês), já que estou pagando cerca de 30 dólares/mês nos últimos 2 meses em uso de API. No futuro, talvez faça sentido ter um modelo rodando localmente, mas acho que os custos de uso de API serão menores à medida que modelos mais eficientes forem lançados.

---
Você pode me contatar sobre este e outros tópicos pelo e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
