---
date: 2026-08-02T18:10:00.000Z
draft: true
title: 'Como Estruturar Documentação Técnica: Um Guia Diátaxis [2026]'
description: 'Framework Diátaxis explicado: os 4 tipos de documentação técnica (tutoriais, guias de como fazer, referência, explicação) e como organizar a documentação que os usuários realmente encontram. Guia prático.'
featured_image: ''
categories:
  - article
tags:
  - technical-documentation
  - diataxis
  - technical-writing
  - developer-tools
  - dev
slug: estruturar-documentacao-tecnica-diataxis
translation_source_hash: deddd81ae89337fd25500fba6f2a4e4c779285ee80fc67fd711db235f1667979
---
Você conhece a sensação. Você chega à página de documentação de um projeto para resolver um problema específico — "como configuro o timeout?" — e se depara com uma parede de prosa que explica a filosofia do produto por três parágrafos antes de chegar a algo utilizável. Ou pior: a página é chamada de "tutorial", mas na verdade é uma lista de comandos sem nenhum contexto, e você não faz ideia do que acabou de fazer.

A documentação falha na maioria das vezes não porque é mal escrita, mas porque é mal *estruturada*. Cada página tenta ser tudo ao mesmo tempo e acaba não servindo para ninguém. Existe uma resposta sistemática para esse problema, ela é gratuita e foi discretamente adotada por algumas das melhores equipes de documentação da indústria: o **framework Diátaxis**.

## O que é Diátaxis?

Diátaxis (do grego antigo *diátaxis*: *dia*, "através", e *taxis*, "arranjo") é uma abordagem sistemática para a criação de documentação técnica criada por [Daniele Procida](https://diataxis.fr/). Sua afirmação central é simples: existem **quatro tipos fundamentalmente diferentes de documentação**, que respondem a quatro necessidades diferentes dos usuários, e cada um deve ser escrito e organizado de maneira diferente.

Os quatro tipos são:

| Tipo | O que é | A pergunta do usuário |
|------|-----------|---------------------|
| **Tutorial** | Uma lição | "Ensine-me, passo a passo" |
| **Guia de como fazer** | Instruções | "Ajude-me a resolver este problema" |
| **Referência** | Descrição técnica | "Qual é o fato exato que preciso?" |
| **Explicação** | Compreensão | "Por que isso funciona dessa forma?" |

O framework prescreve abordagens para conteúdo (o que escrever), estilo (como escrever) e arquitetura (como organizar). Ele é leve, não impõe restrições de implementação e funciona tanto para um wiki de uma startup de duas pessoas quanto para a [documentação para desenvolvedores da Cloudflare](https://developers.cloudflare.com/), que usou Diátaxis como sua "estrela do norte" durante uma reformulação — ou para a [documentação do Django](https://docs.djangoproject.com/en/5.2/), cuja estrutura (tutoriais, guias de como fazer, referência, tópicos) mapeia quase perfeitamente os quatro quadrantes.

O framework chegou à primeira página do Hacker News novamente em agosto de 2026 com quase 500 pontos — um sinal de que a dor de 'documentação quebrada' é tão real quanto sempre, e de que a comunidade continua voltando ao Diátaxis como a resposta.

## Os quatro quadrantes

### Tutoriais: a lição

Um tutorial é uma **lição**: ele conduz um estudante pela mão através de uma experiência de aprendizado. É sempre prático — o aprendiz faz algo significativo, sob a orientação do instrutor, em direção a um objetivo alcançável. "Vamos criar um jogo simples em Python" é um tutorial. Uma aula de direção é o exemplo canônico: o objetivo não é ir do ponto A ao ponto B, mas desenvolver habilidade e confiança.

A parte difícil: na documentação escrita, o instrutor está ausente. Não há ninguém para perceber que o aprendiz está travado e corrigir o rumo. Portanto, um bom tutorial deve ser *significativo* (o aprendiz precisa de uma sensação de realização), *bem-sucedido* (ele precisa conseguir concluí-lo), *lógico* (o caminho faz sentido) e *completo* (ele encontra todos os conceitos e ferramentas de que precisa). Tutoriais raramente são bem feitos e são constantemente confundidos com guias de como fazer — de longe o erro mais comum do Diátaxis.

### Guias de como fazer: a receita

Um guia de como fazer aborda um **objetivo ou problema do mundo real** com instruções práticas. Diferentemente de um tutorial, ele pressupõe um usuário já competente: alguém que está no trabalho, não na escola. "Como configurar o perfilamento de frames", "Como solucionar problemas de implantação", "Como rotacionar suas credenciais de banco de dados sem tempo de inatividade" — esses são guias de como fazer.

A diferença em relação a um tutorial é a diferença entre uma lição e uma receita: o tutorial está preocupado com o *estudo*, o guia de como fazer com o *trabalho*. Se o leitor já conhece a ferramenta, ele não precisa ser ensinado — ele precisa concluir a tarefa e voltar para o seu dia.

### Referência: o manual

A documentação de referência é a **descrição técnica** — os fatos que um usuário precisa para fazer as coisas corretamente: precisa, completa, confiável, livre de distração e interpretação. Assinaturas de API, opções de configuração, códigos de retorno, esquemas. Ela contém conhecimento proposicional, não guias para ação.

A referência é onde a maioria dos projetos falha na direção oposta: eles adicionam prosa, opiniões e exemplos à referência até que ela deixe de ser referência. Diátaxis é implacável aqui — a referência deve ser chata de propósito. A empolgação pertence aos tutoriais e às explicações.

### Explicação: a discussão

A explicação é um **tratamento discursivo** de um assunto que permite reflexão. É orientada para a compreensão: aprofunda e amplia o entendimento do leitor, traz clareza e contexto. Ela responde à pergunta "Você pode me falar sobre…?" — e é o único tipo de documentação que faz sentido ler longe do produto em si. (O autor do framework observa, apenas meio brincando, que a explicação é a única documentação que você pode ler na banheira.)

A explicação é o quadrante que a maioria das equipes ignora por completo, o que é uma pena: é ela que transforma uma coleção de instruções em um corpo de conhecimento com o qual as pessoas podem raciocinar.

## A bússola: decidir onde o conteúdo pertence

A intuição nem sempre é confiável. Quando você não tem certeza se uma página é um tutorial, um guia de como fazer, uma referência ou uma explicação, o Diátaxis oferece uma **bússola** — um procedimento de decisão baseado em duas perguntas:

1. **Ação ou cognição?** — o conteúdo é sobre fazer, ou sobre saber/pensar?
2. **Aquisição ou aplicação?** — ele serve ao estudo, ou serve ao trabalho?

A [tabela da bússola](https://diataxis.fr/compass/) mapeia as respostas:

| O conteúdo… | …serve à necessidade do usuário de… | …portanto pertence a |
|---|---|---|
| informa ação | aquisição de habilidade | um **tutorial** |
| informa ação | aplicação de habilidade | um **guia de como fazer** |
| informa cognição | aplicação de habilidade | **referência** |
| informa cognição | aquisição de habilidade | **explicação** |

Aplique essas perguntas em qualquer nível — de um documento inteiro a uma única frase. A bússola é uma ferramenta de correção de rumo: sempre que você sentir que uma página "não está funcionando", passe-a pelas duas perguntas e você normalmente descobrirá que ela está tentando fazer dois trabalhos ao mesmo tempo.

## Aplicando Diátaxis à sua documentação (e à sua documentação gerada por IA)

O [conselho oficial](https://diataxis.fr/start-here/) é começar *aplicando*, não lendo teoria. Um fluxo de trabalho prático:

1. **Audite.** Liste todas as páginas da sua documentação e mapeie cada uma para um quadrante usando a bússola. Você imediatamente encontrará órfãos: tutoriais que na verdade são guias de como fazer, páginas de referência com três parágrafos de opinião e uma seção de explicação ausente.
2. **Mova, não reescreva.** Diátaxis é, em sua maior parte, reorganização. Transfira o conteúdo para o seu quadrante, divida páginas que servem a duas necessidades e ainda não exclua nada.
3. **Preencha as lacunas.** A maioria dos projetos não tem explicação. Escreva uma página por tópico principal respondendo "Você pode me falar sobre…?"
4. **Imponha a estrutura.** Adicione uma divisão "Tutoriais / Guias de como fazer / Referência / Explicação" à sua navegação e torne a regra explícita para colaboradores: novo conteúdo deve declarar seu quadrante.

Isso é mais importante em 2026 do que quando o framework surgiu, porque a IA agora escreve uma grande parcela da documentação. LLMs são excelentes em gerar prosa e péssimos em decidir estrutura — deixados por conta própria, eles produzem paredes de texto indiferenciado que misturam tutorial, referência e explicação na mesma página. Diátaxis dá a você (e ao seu pipeline de escrita com IA) um esquema a ser imposto: é a diferença entre documentação que simplesmente existe e documentação que responde a perguntas. Se você já está usando um assistente de IA para escrever ou revisar código — e lidando com a qualidade da sua produção — a mesma disciplina se aplica: [vibe coding sem estrutura produz o mesmo tipo de bagunça no código que documentação sem estrutura produz na documentação]({{< relref "posts/vibe-coding-pitfalls/" >}}).

## Conclusão

Diátaxis não é um *estilo* de documentação — é uma forma de *pensar* sobre documentação. Quatro quadrantes, uma bússola, zero restrições de implementação. Custa uma tarde para aprender e compensa toda vez que alguém encontra a página certa na primeira tentativa.

Se você tem um site Hugo, a estrutura mapeia naturalmente a organização de conteúdo — veja nosso guia sobre [estrutura de arquivos de conteúdo do Hugo]({{< relref "posts/hugo-content-file-structure/" >}}) para o lado prático de organizar diretórios de conteúdo. E se quiser se aprofundar no próprio framework, o [site do Diátaxis](https://diataxis.fr/) é curto, legível e gratuito — comece com a [introdução de cinco minutos](https://diataxis.fr/start-here/) e aplique-a a algo pequeno hoje. A comunidade [Write the Docs](https://www.writethedocs.org/) também é o melhor lugar para discutir práticas de documentação com pessoas que fazem isso profissionalmente.

Leia também:

- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Estrutura de Ficheiros de Conteúdo Hugo]({{< relref "posts/hugo-content-file-structure/" >}})
- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
