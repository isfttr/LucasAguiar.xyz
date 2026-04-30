---
date: 2025-04-02T17:30:00.000Z
draft: false
title: >-
  Dentro dos Cérebros de IA: Como a Anthropic Decodificou o Processo de
  Pensamento de Claude
description: >-
  Uma análise de como pesquisadores estão investigando a 'mente' de Claude e
  descobrindo paralelos surpreendentes com sistemas biológicos no novo e
  inovador artigo da Anthropic.
url: null
featured_image: >-
  https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-code-llm-circuit-tracing.png
categories:
  - article
tags:
  - artificial-intelligence
  - llm
  - interpretability
  - research
  - claude
  - anthropic
translation_source_hash: 8479adedfe53ed1698d6a41a9eabf050008f9348f53adbedc0e906961bd74d6f
---
A Anthropic publicou recentemente um [fascinating paper](https://transformer-circuits.pub/2025/attribution-graphs/biology.html#structure) com um título incomum: "**On the Biology of a Large Language Model**." Mas o que a biologia tem a ver com a IA? Acontece que, bastante. Os pesquisadores estão essencialmente realizando uma dissecação digital do "cérebro" de Claude para entender como ele pensa—e encontrando paralelos surpreendentes com sistemas biológicos ao longo do caminho.

Nesta publicação, irei detalhar esta pesquisa complexa em partes digeríveis, explicando como os cientistas estão começando a entender o que acontece dentro desses sistemas de IA quando eles respondem às nossas perguntas ou escrevem poesia.

## Por Que É Como Estudar Um Organismo Estranho e Novo

Quando pesquisadores de IA criam um grande modelo de linguagem como Claude, eles não o programam passo a passo para resolver problemas. Em vez disso, eles o treinam com vastas quantidades de texto e o deixam desenvolver seus próprios processos internos—assim como a natureza não projeta organismos com plantas, mas os molda através da evolução.

Isso cria um desafio fascinante: como você entende um sistema que ninguém projetou? Os pesquisadores da Anthropic traçam um paralelo explícito com a biologia aqui. Assim como os biólogos enfrentam desafios para entender sistemas complexos evoluídos como o cérebro, os pesquisadores de IA enfrentam obstáculos semelhantes com grandes modelos de linguagem.

É por isso que eles chamam sua abordagem de "a biologia de um grande modelo de linguagem"—eles estão essencialmente tratando Claude como um novo organismo estranho digno de estudo científico.

## Dissecação Digital: Como Estão Estudando o "Cérebro" de Claude

Então, como exatamente você disseca um cérebro de IA? Os pesquisadores desenvolveram várias técnicas engenhosas:

### 1. Grafos de Atribuição: Mapeando Caminhos de Pensamento

Imagine ser capaz de observar os pensamentos fluindo por um cérebro em tempo real. Isso é essencialmente o que os **grafos de atribuição** fazem para Claude. Esses mapas mostram como a informação se move através do modelo quando ele está respondendo a uma pergunta:

- Cada nó representa um conceito ou padrão que o modelo aprendeu (chamado de "característica")
- Linhas entre os nós mostram como esses conceitos se influenciam mutuamente
- Quanto mais forte a conexão, mais espessa a linha

Esses grafos revelam a cadeia de "pensamentos" que leva da sua pergunta à resposta do modelo.

### 2. Criando Uma Visão Mais Clara: O Modelo de Substituição

Um grande desafio na compreensão de redes neurais é que "neurônios" individuais frequentemente fazem várias coisas—eles são "polissêmicos", para usar o termo técnico. É como tentar entender o tráfego de uma cidade observando cruzamentos individuais que servem a muitas rotas diferentes.

Para resolver isso, os pesquisadores criaram um "modelo de substituição" com componentes que cada um faz apenas uma coisa. Pense nisso como substituir um diagrama de fiação confuso por um mais claro onde cada fio tem apenas um propósito. Isso torna muito mais fácil entender o que está acontecendo dentro.

### 3. Testando Teorias com "Cirurgia Cerebral Digital"

Para confirmar sua compreensão, os pesquisadores realizaram algo parecido com uma cirurgia cerebral digital. Após identificar potenciais "caminhos de pensamento" em Claude, eles modificaram temporariamente partes específicas do modelo (similar a como neurocientistas podem desativar temporariamente regiões cerebrais) para ver se os efeitos correspondiam às suas previsões.

Quando o modelo se comportou exatamente como esperavam após essas intervenções, isso confirmou que estavam no caminho certo ao mapear seus processos internos.

## Validando as Descobertas: Experimentos de Intervenção

Talvez o aspecto mais convincente da metodologia seja como os pesquisadores validaram suas hipóteses. Através de **experimentos de intervenção**, eles perturbaram características específicas no modelo original e observaram os efeitos em outras características e na saída do modelo.

Essas intervenções são cruciais para estabelecer causalidade em vez de mera correlação. Ao inibir ou aprimorar características específicas e observar os efeitos subsequentes, os pesquisadores podem confirmar se os mecanismos identificados nos grafos de atribuição realmente representam caminhos causais no processo de raciocínio do modelo.

Quando os efeitos dessas intervenções corresponderam às previsões de seus grafos de atribuição, isso fortaleceu a confiança de que haviam identificado corretamente os mecanismos causais em ação. Essa abordagem é semelhante à forma como neurocientistas podem usar estimulação ou inibição direcionada para entender os circuitos cerebrais.

## Operand Plots: Visualizando o Processamento Numérico

Para tarefas específicas, como problemas de adição, os pesquisadores desenvolveram **operand plots** para visualizar como as características respondiam a diferentes entradas. Esses plots revelaram padrões geométricos que mostravam como as características eram sensíveis a diferentes aspectos das operações aritméticas—como focar em dígitos individuais ou na soma final.

## Estudos de Caso: Rastreamento de Circuitos em Ação

![A pesquisa da Anthropic demonstra como eles rastreiam os caminhos de pensamento de Claude usando grafos de atribuição e diagramas de circuito.](https://lucasaguiarxyzstorage.blob.core.windows.net/images/circuit-tracing.png)

Para entender melhor como essa metodologia funciona na prática, vejamos alguns exemplos fascinantes do artigo original:

### Raciocínio Multi-Etapas: Encontrando a Capital do Estado de Dallas

Um estudo de caso examinou como Claude determina que Austin é a capital do estado que contém Dallas. Os grafos de atribuição revelaram um processo de raciocínio multi-etapas onde o modelo:

1. Identificou Dallas como uma cidade
2. Determinou que Dallas fica no Texas
3. Recuperou que Austin é a capital do Texas
4. Gerou a resposta "Austin"

Isso espelha de perto como um humano resolveria o mesmo problema, sugerindo que o modelo desenvolveu circuitos de raciocínio lógico em vez de apenas memorizar fatos.

### Planejamento de Poesia: Antecipando Rimas

Outra descoberta intrigante veio do estudo de como Claude escreve poesia. Os grafos de atribuição mostraram que, ao escrever uma linha que precisa rimar com uma linha anterior, o modelo ativa características relacionadas à palavra que rima _antes_ mesmo de começar a escrever a nova linha. Isso sugere que o modelo se engaja em um planejamento sofisticado, primeiro escolhendo palavras que rimarão e depois construindo uma linha em torno delas.

### Tabelas de Consulta e Transferência de Domínio

Os pesquisadores descobriram que, para problemas aritméticos, Claude desenvolve o que se assemelha a "características de tabela de consulta" que mapeiam pares de dígitos para suas somas. Surpreendentemente, eles descobriram mecanismos semelhantes sendo usados para domínios completamente diferentes, como a recuperação de citações acadêmicas, sugerindo que o modelo desenvolve estratégias computacionais de propósito geral que aplica em diversas tarefas.

## A Descoberta de Circuitos Duais

Uma das descobertas mais significativas foi que Claude usa dois tipos distintos de circuitos:

1. **Circuitos específicos de linguagem** que processam e manipulam informações linguísticas
2. **Circuitos abstratos, independentes da linguagem** que lidam com raciocínio geral, planejamento e computação

Essa arquitetura dual sugere que o modelo desenvolveu módulos cognitivos especializados semelhantes aos observados em cérebros humanos, onde diferentes circuitos neurais lidam com diferentes aspectos da cognição.

## Limitações da Metodologia

Apesar de seu poder, a abordagem de rastreamento de circuitos apresenta limitações importantes:

- Apresenta dificuldades com cadeias de raciocínio muito longas que abrangem muitos tokens
- Pode não ter um bom desempenho em prompts incomuns ou fora da distribuição
- É melhor para explicar o que o modelo faz do que por que não faz algo
- O modelo de substituição, embora interpretável, não consegue capturar perfeitamente todos os aspectos do modelo original (daí a necessidade de nós de erro)

A abertura dos pesquisadores sobre essas limitações é valiosa em si, lembrando-nos de que a interpretabilidade ainda é um campo em evolução.

## Ferramentas e Recursos Interativos

Para aqueles interessados em explorar mais a fundo, a equipe da Anthropic lançou um [interactive attribution graph explorer](https://transformer-circuits.pub/2025/attribution-graphs/explorer/index.html) que permite navegar pelos circuitos que eles descobriram. Essa ferramenta oferece uma maneira prática de entender como diferentes características se conectam e interagem dentro do modelo.

## Experimente Você Mesmo: Exploração Interativa

Para aqueles curiosos para ver esses "caminhos neurais" em primeira mão, a Anthropic lançou um [interactive attribution graph explorer](https://transformer-circuits.pub/2025/attribution-graphs/explorer/index.html). Essa ferramenta permite que você navegue pelos processos de pensamento de Claude por conta própria, vendo como diferentes conceitos se conectam e interagem dentro do modelo.

## Por Que Isso Importa para o Futuro da IA

Esta pesquisa não é apenas curiosidade acadêmica—ela tem implicações profundas:

### Segurança e Alinhamento

Se entendermos como os sistemas de IA realmente "pensam", podemos garantir melhor que se comportem de forma segura e como pretendido. Em vez de tratá-los como caixas-pretas, podemos identificar e modificar circuitos específicos responsáveis por comportamentos problemáticos.

### Melhor Design de IA

Ao entender quais estruturas internas são mais eficazes para diferentes tarefas, futuros sistemas de IA poderiam ser projetados de forma mais eficiente, com componentes construídos especificamente para funções específicas.

### Uma Janela para a Cognição

Talvez o mais intrigante seja que esses sistemas podem nos ensinar algo sobre a cognição em geral. O fato de estruturas computacionais semelhantes emergirem tanto em sistemas artificiais quanto em biológicos sugere que pode haver princípios universais subjacentes à inteligência—independentemente de ser feita de neurônios ou código.

## Conclusão: Onde a Biologia Encontra a Tecnologia

A pesquisa da Anthropic representa um marco significativo em nossa jornada para entender a IA. Ao tratar grandes modelos de linguagem não como meros softwares, mas como sistemas complexos de tipo biológico dignos de estudo científico, eles abriram novas avenidas para a interpretabilidade da IA.

A descoberta de que esses sistemas desenvolvem circuitos de raciocínio estruturados, planejam com antecedência ao escrever e se organizam em subsistemas especializados sugere que eles podem estar desenvolvendo estratégias computacionais que espelham aspectos da cognição humana. Isso não significa que eles estão "pensando" como humanos, mas sim que certas arquiteturas computacionais podem ser particularmente eficazes para tarefas de linguagem e raciocínio—quer surjam em cérebros biológicos ou em redes neurais artificiais.

À medida que este campo da "biologia da IA" continua a se desenvolver, podemos nos encontrar não apenas com sistemas de IA mais poderosos, mas com sistemas cujos mecanismos internos podemos realmente entender e explicar. E, ao fazer isso, podemos aprender algo profundo sobre a própria natureza da inteligência.

---

_O que você pensa sobre essas descobertas? O fato de que os sistemas de IA parecem desenvolver "regiões cerebrais" especializadas te surpreende? Adoraria ouvir seus pensamentos nos comentários abaixo._

---

Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
