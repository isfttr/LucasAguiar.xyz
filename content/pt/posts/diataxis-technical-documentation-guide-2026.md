---
date: 2026-08-02T18:10:00.000Z
draft: false
title: 'Como Estruturar Documentação Técnica: Um Guia Diátaxis [2026]'
description: 'Framework Diátaxis explicado: os 4 tipos de documentação técnica (tutoriais, guias de como fazer, referência, explicação) e como organizar a documentação para que os usuários realmente a encontrem. Guia prático.'
featured_image: ''
categories:
  - article
tags:
  - technical-documentation
  - diataxis
  - technical-writing
  - developer-tools
  - dev
slug: guia-diataxis-documentacao-tecnica
translation_source_hash: c4603514f8d6d03f3e0bf035d6bd407bcdf64ef0acf397ddcbfbadf7f6ea35cf
---
Você conhece a sensação. Você chega à página de documentação de um projeto para resolver um problema específico — "como configuro o timeout?" — e recebe uma parede de prosa que explica a filosofia do produto por três parágrafos antes de chegar a algo utilizável. Ou pior: a página é chamada de "tutorial", mas na verdade é uma lista de comandos sem contexto algum, e você não faz ideia do que acabou de fazer.

A documentação falha na maioria das vezes não porque é mal escrita, mas porque é mal *estruturada*. Cada página tenta ser tudo ao mesmo tempo e acaba não servindo para ninguém. Existe uma resposta sistemática para esse problema, é gratuita e foi adotada discretamente por algumas das melhores equipes de documentação da indústria: o **framework Diátaxis**.

## O que é Diátaxis?

Diátaxis (do grego antigo *diátaxis*: *dia*, "através", e *taxis*, "arranjo") é uma abordagem sistemática para a autoria de documentação técnica criada por [Daniele Procida](https://diataxis.fr/). Sua afirmação central é simples: há **quatro tipos fundamentalmente diferentes de documentação**, respondendo a quatro necessidades diferentes dos usuários, e cada um deve ser escrito e organizado de maneira diferente.

Os quatro tipos são:

| Tipo | O que é | A pergunta do usuário |
|------|-----------|---------------------|
| **Tutorial** | Uma lição | "Ensine-me, passo a passo" |
| **Guia de como fazer** | Instruções | "Ajude-me a resolver este problema" |
| **Referência** | Descrição técnica | "Qual é o fato exato que eu preciso?" |
| **Explicação** | Compreensão | "Por que isso funciona dessa forma?" |

O framework prescreve abordagens para conteúdo (o que escrever), estilo (como escrever) e arquitetura (como organizar). É leve, não impõe restrições de implementação e funciona tanto para um wiki de startup com duas pessoas quanto para a [documentação para desenvolvedores da Cloudflare](https://developers.cloudflare.com/), que usou Diátaxis como sua "estrela do norte" durante um redesenho — ou para a [documentação do Django](https://docs.djangoproject.com/en/5.2/), cuja estrutura (tutoriais, guias de como fazer, referência, tópicos) mapeia quase perfeitamente para os quatro quadrantes.

O framework alcançou a primeira página do Hacker News novamente em agosto de 2026 com quase 500 pontos — um sinal de que a dor de "documentação quebrada" é tão real quanto sempre, e de que a comunidade continua voltando ao Diátaxis como a resposta.

## Os quatro quadrantes

### Tutoriais: a lição

Um tutorial é uma **lição**: ele guia um estudante pela mão através de uma experiência de aprendizado. É sempre prático — o aprendiz faz algo significativo, sob a orientação do instrutor, em direção a um objetivo alcançável. "Vamos criar um jogo simples em Python" é um tutorial. Uma aula de direção é o exemplo canônico: o objetivo não é ir do ponto A ao ponto B, mas desenvolver habilidade e confiança.

A parte difícil: na documentação escrita, o instrutor está ausente. Não há ninguém para perceber que o aprendiz está travado e corrigir o rumo. Portanto, um bom tutorial deve ser *significativo* (o aprendiz precisa de uma sensação de realização), *bem-sucedido* (ele deve conseguir completá-lo), *lógico* (o caminho faz sentido) e *completo* (ele encontra todos os conceitos e ferramentas de que precisa). Tutoriais raramente são bem feitos e são constantemente confundidos com guias de como fazer — o erro mais comum do Diátaxis.

### Guias de como fazer: a receita

Um guia de como fazer aborda um **objetivo ou problema do mundo real** com instruções práticas. Ao contrário de um tutorial, ele pressupõe um usuário já competente: alguém que está no trabalho, não na escola. "Como configurar o perfilamento de frames", "Como solucionar problemas de implantação", "Como rotacionar suas credenciais de banco de dados sem tempo de inatividade" — esses são guias de como fazer.

A diferença em relação a um tutorial é a diferença entre uma lição e uma receita: o tutorial se preocupa com o *estudo*, o guia de como fazer com o *trabalho*. Se o leitor já conhece a ferramenta, ele não precisa ser ensinado — ele precisa concluir a tarefa e voltar para o seu dia.

### Referência: o manual

A documentação de referência é a **descrição técnica** — os fatos de que um usuário precisa para fazer as coisas corretamente: precisos, completos, confiáveis, livres de distração e interpretação. Assinaturas de API, opções de configuração, códigos de retorno, esquemas. Ela contém conhecimento proposicional, não guias para ação.

A referência é onde a maioria dos projetos falha na direção oposta: eles adicionam prosa, opiniões e exemplos à referência até que ela deixe de ser referência. O Diátaxis é implacável aqui — a referência deve ser chata de propósito. A empolgação pertence aos tutoriais e à explicação.

### Explicação: a discussão

A explicação é um **tratamento discursivo** de um assunto que permite reflexão. É orientada para a compreensão: aprofunda e amplia o entendimento do leitor, traz clareza e contexto. Ela responde à pergunta "Você pode me falar sobre…?" — e é o único tipo de documentação que faz sentido ler longe do produto em si. (O autor do framework observa, apenas meia brincadeira, que a explicação é a única documentação que você pode ler no banho.)

A explicação é o quadrante que a maioria das equipes ignora por completo, o que é uma pena: é ela que transforma uma coleção de instruções em um corpo de conhecimento com o qual as pessoas podem raciocinar.

## A bússola: decidindo onde o conteúdo pertence

A intuição nem sempre é confiável. Quando você não tem certeza se uma página é um tutorial, um guia de como fazer, referência ou explicação, o Diátaxis oferece uma **bússola** — um procedimento de decisão baseado em duas perguntas:

1. **Ação ou cognição?** — o conteúdo é sobre fazer, ou sobre saber/pensar?
2. **Aquisição ou aplicação?** — ele serve ao estudo, ou serve ao trabalho?

A [tabela da bússola](https://diataxis.fr/compass/) mapeia as respostas:

| O conteúdo… | …serve à… do usuário | …portanto pertence a |
|---|---|---|
| informa ação | aquisição de habilidade | um **tutorial** |
| informa ação | aplicação de habilidade | um **guia de como fazer** |
| informa cognição | aplicação de habilidade | **referência** |
| informa cognição | aquisição de habilidade | **explicação** |

Aplique essas perguntas em qualquer nível — de um documento inteiro até uma única frase. A bússola é uma ferramenta de correção de rota: sempre que você sentir que uma página "não está funcionando", passe-a pelas duas perguntas e normalmente descobrirá que ela está tentando fazer dois trabalhos ao mesmo tempo.

## Aplicando Diátaxis à sua documentação (e à sua documentação gerada por IA)

O [conselho oficial](https://diataxis.fr/start-here/) é começar *aplicando*, não lendo teoria. Um fluxo de trabalho prático:

1. **Auditoria.** Liste todas as páginas da sua documentação e mapeie cada uma para um quadrante usando a bússola. Você encontrará imediatamente órfãs: tutoriais que na verdade são guias de como fazer, páginas de referência com três parágrafos de opinião e uma seção de explicação ausente.
2. **Mova, não reescreva.** Diátaxis é, na maior parte, reorganização. Desloque o conteúdo para o seu quadrante, divida páginas que atendem a duas necessidades e não exclua nada ainda.
3. **Preencha as lacunas.** A maioria dos projetos não tem explicação. Escreva uma página por tópico principal respondendo "Você pode me falar sobre…?"
4. **Imponha a estrutura.** Adicione uma divisão "Tutoriais / Guias de como fazer / Referência / Explicação" à sua navegação e torne a regra explícita para colaboradores: conteúdo novo deve declarar seu quadrante.

Isso é mais importante em 2026 do que quando o framework surgiu, porque a IA agora escreve uma enorme parcela da documentação. LLMs são excelentes em gerar prosa e péssimos em decidir estrutura — deixados por conta própria, produzem paredes indiferenciadas de texto que misturam tutorial, referência e explicação na mesma página. O Diátaxis oferece a você (e ao seu pipeline de escrita com IA) um esquema a impor: é a diferença entre documentação que meramente existe e documentação que responde a perguntas. Se você já usa um assistente de IA para escrever ou revisar código — e lida com a qualidade da sua saída — a mesma disciplina se aplica: [vibe coding sem estrutura produz o mesmo tipo de bagunça no código que a documentação não estruturada produz na documentação]({{< relref "posts/vibe-coding-pitfalls/" >}}).

## A conclusão

Diátaxis não é um *estilo* de documentação — é uma maneira de *pensar* sobre documentação. Quatro quadrantes, uma bússola, zero restrições de implementação. Custa uma tarde para aprender e se paga toda vez que alguém encontra a página certa na primeira tentativa.

Se você mantém um site Hugo, a estrutura mapeia naturalmente para a organização de conteúdo — consulte nosso guia sobre [estrutura de arquivos de conteúdo Hugo]({{< relref "posts/hugo-content-file-structure/" >}}) para o lado prático de organizar diretórios de conteúdo. E se quiser se aprofundar no framework em si, o [site Diátaxis](https://diataxis.fr/) é curto, legível e gratuito — comece com a [introdução de cinco minutos](https://diataxis.fr/start-here/) e aplique-o a algo pequeno hoje. A comunidade [Write the Docs](https://www.writethedocs.org/) também é o melhor lugar para discutir práticas de documentação com pessoas que fazem isso profissionalmente.

Leia também:

- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Estrutura de Ficheiros de Conteúdo Hugo]({{< relref "posts/hugo-content-file-structure/" >}})
- [Por Que Estou Terminando Com o Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
