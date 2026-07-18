---
date: 2026-07-18T11:09:25-03:00
draft: true
title: "Patente de Software vs Registro de Programa de Computador no Brasil: Qual a Diferença? [2026]"
description: "Guia completo comparando patente de invenção implementada por computador e registro de programa de computador no INPI. Quando usar cada um, custos, prazos, requisitos legais e decisão prática para startups e desenvolvedores."
featured_image: ""
categories:
  - article
tags:
  - patentes
  - programa-de-computador
  - inpi
  - propriedade-intelectual
  - software
---

Desenvolvedores e startups brasileiras enfrentam uma dúvida recorrente ao proteger seu software: devo registrar o programa de computador no INPI ou tentar patentear minha invenção? A confusão é compreensível — as duas formas de proteção coexistem no sistema jurídico brasileiro, mas operam sob regimes completamente diferentes.

O registro de programa de computador (Lei 9.609/98) protege o software como obra autoral, enquanto a patente de invenção implementada por computador (Lei 9.279/96 — LPI) protege a solução técnica que o software executa. Escolher o caminho errado pode significar desperdiçar tempo e recursos — ou, pior, perder o direito de proteger sua criação.

Este guia compara as duas alternativas com base na legislação vigente, nas diretrizes de exame do INPI e nos custos de 2026.

## Entendendo a diferença fundamental

No Brasil, **programa de computador** (software) é protegido por direitos autorais, nos termos da Lei 9.609/98 (Lei de Software) e da Lei 9.610/98 (Lei de Direitos Autorais). O registro no INPI é declaratório — não há exame de mérito, apenas o depósito de um hash do código que estabelece um marco temporal de autoria.

Já **invenções implementadas por computador** (computer-implemented inventions, CII) são uma categoria de patente. O INPI examina se a invenção atende aos requisitos de novidade, atividade inventiva e aplicação industrial (art. 8º da LPI). O foco não está no código, mas no **efeito técnico** que o software produz.

| Aspecto | Registro de Programa de Computador | Patente de Invenção Implementada por Computador |
|---------|-----------------------------------|------------------------------------------------|
| **Base legal** | Lei 9.609/98 + Lei 9.610/98 | Lei 9.279/96 (LPI) |
| **Natureza** | Direito autoral (declaratório) | Propriedade industrial (concessivo) |
| **O que protege** | O código-fonte como obra literária | A solução técnica executada pelo software |
| **Exame de mérito** | Não (apenas registro de hash) | Sim (novidade, atividade inventiva, aplicação industrial) |
| **Prazo de proteção** | 50 anos da data de criação ou 1º jan. do ano seguinte | 20 anos da data de depósito |
| **Custo (taxas INPI 2026)** | R$ 85 a R$ 1.400 (código 730) | R$ 130 a R$ 2.500 (depósito + exame) |
| **Tempo médio** | 30 a 60 dias | 5 a 10 anos (dependendo do backlog) |
| **Exame pelo INPI** | Automático | Técnico (examinador de patentes) |

> Os valores acima são as taxas oficiais do INPI para 2026, variando conforme o porte do depositante (pessoa física/MEI = menor valor; pessoa jurídica de grande porte = maior valor). Consulte a [tabela de retribuições do INPI](https://www.gov.br/inpi/pt-br/servicos/tabela-de-retribuicoes) para valores exatos.

## O que a lei brasileira diz sobre patentes de software

O art. 10 da LPI (Lei 9.279/96) lista o que **não é considerado invenção** nem modelo de utilidade:

> Art. 10. Não se considera invenção nem modelo de utilidade:
> I — descobertas, teorias científicas e métodos matemáticos;
> II — concepções puramente abstratas;
> III — esquemas, planos, princípios ou métodos comerciais, contábeis, financeiros, educativos, publicitários, sorteios e de fiscalização;
> **IV — programas de computador em si;**
> (grifo nosso)

O inciso IV é a razão pela qual "software puro" não é patenteável no Brasil. No entanto, a jurisprudência do INPI e a prática internacional consolidaram o entendimento de que **invenções implementadas por computador** (CII) são patenteáveis quando produzem um **efeito técnico** adicional, além da mera execução de um programa.

### O que torna uma invenção de software patenteável?

Para que uma invenção implementada por computador seja patenteável no INPI, três condições devem ser atendidas:

1. **Efeito técnico** — o software deve produzir um resultado técnico que vai além do processamento normal de dados. Exemplo: um algoritmo de compressão de vídeo que reduz o uso de banda em 40% é técnico; um programa que gera relatórios financeiros não é.

2. **Aplicação técnica concreta** — a invenção deve estar ancorada a uma aplicação específica. Exemplo: "método de reconhecimento de padrões em imagens médicas" é concreto; "sistema genérico de IA" não é.

3. **Não reivindicar o programa em si** — as reivindicações devem ser dirigidas ao método, sistema ou uso, nunca ao código-fonte.

O [guia de patentes de IA generativa do blog]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}}) detalha como esses critérios se aplicam especificamente a invenções de inteligência artificial.

## Quando usar cada tipo de proteção

A escolha entre registro de programa de computador e patente depende do que você quer proteger.

### Escolha o registro de programa de computador quando:

- Seu objetivo é comprovar **autoria e titularidade** do código em eventuais disputas
- O software é um **produto comercial** (ERP, app, plataforma) sem inovação técnica significativa
- Você precisa de **proteção rápida e de baixo custo**
- O software **não resolve um problema técnico** — apenas automatiza processos de negócio

### Considere a patente de invenção implementada por computador quando:

- Seu software implementa uma **solução técnica inovadora** para um problema técnico
- Você quer **impedir concorrentes** de usar a mesma solução, mesmo que implementada em código diferente
- A inovação está no **algoritmo, método ou arquitetura**, não na interface ou funcionalidade comercial
- Você planeja **licenciar a tecnologia** para terceiros

Uma estratégia comum é **combinar as duas proteções**: registrar o programa de computador para proteger a autoria do código e depositar o pedido de patente para proteger a solução técnica inovadora. As duas proteções são independentes e cumulativas.

## O processo de cada modalidade

### Registro de Programa de Computador (passo a passo)

O processo é relativamente simples e não exige exame técnico. Veja o [guia completo de registro de programa de computador no INPI]({{< relref "posts/guia-registro-programa-computador-inpi/" >}}) para detalhes.

1. **Gerar o hash** do código-fonte (usando refer ou hash SHA-512 do arquivo ZIP)
2. **Emitir a GRU** (código 730) no sistema e-INPI
3. **Preencher o formulário e-Software**, anexar o código e pagar a taxa
4. **Aguardar a publicação** na RPI (30 a 60 dias)
5. **Obter o certificado** digital de registro

Em julho de 2026, o sistema de peticionamento de programa de computador do INPI passou por instabilidade e [voltou a funcionar em 1º de julho](https://www.gov.br/inpi/pt-br/central-de-conteudo/noticias/sistema-de-peticionamento-de-programa-de-computador-volta-a-funcionar). Usuários que tentaram protocolar entre 20 e 30 de junho e não receberam o protocolo final devem acessar a área de peticionamento com o número da GRU para fazer o download.

### Depósito de Patente de Invenção (passo a passo)

1. **Busca de anterioridade** — essencial para verificar se a invenção já existe. O [guia de credenciamento de busca de patentes]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}}) explica como fazer.

2. **Redação do pedido** — relatório descritivo, quadro reivindicatório, resumo e desenhos (se aplicável). Para invenções implementadas por computador, as reivindicações devem focar no método, sistema ou uso, nunca no código.

3. **Depósito** — via sistema e-Patentes, com pagamento da GRU código 200 (depósito) ou 201 (para pessoa física/MEI com desconto)

4. **Exame formal** — o INPI verifica se a documentação está completa

5. **Publicação** — após 18 meses do depósito (salvo pedido de sigilo)

6. **Exame técnico** — solicitação do exame (código 203, até 36 meses do depósito). O INPI analisa novidade, atividade inventiva e aplicação industrial

7. **Decisão** — concessão ou indeferimento

O prazo médio de concessão no INPI é de **5 a 10 anos**, embora o [trâmite prioritário]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}}) possa acelerar o processo em algumas situações.

## Custos comparativos (taxas INPI 2026)

| Serviço | Código GRU | PF/MEI | PJ pequeno porte | PJ grande porte |
|---------|-----------|--------|-----------------|----------------|
| Registro de programa de computador | 730 | R$ 85 | R$ 340 | R$ 1.400 |
| Depósito de PI | 200/201 | R$ 130 | R$ 510 | R$ 2.500 |
| Exame de PI (solicitação) | 203 | R$ 140 | R$ 565 | R$ 2.780 |
| Anuidade de PI (primeira) | Diversos | ~R$ 170 | ~R$ 685 | ~R$ 3.390 |

O custo total de uma patente é significativamente maior que o registro de programa de computador, considerando depósito + exame + anuidades anuais por 20 anos. Para startups e pessoas físicas, o INPI oferece descontos substanciais — o [guia de custos de registro de marca]({{< relref "posts/quanto-custa-registrar-marca-inpi-2026/" >}}) explica a lógica de descontos por porte, que se aplica de forma similar a patentes.

## Tendências e contexto global

A discussão sobre patentes de software está longe de ser exclusivamente brasileira. Em julho de 2026, a WIPO publicou dados mostrando que [a inovação em IA generativa está em expansão acelerada](https://www.wipo.int/pressroom/en/articles/2026/article_0012.html), com a atividade de patentes quase triplicando em dois anos — de 14.000 famílias de patentes em 2023 para mais de 37.800 em 2025. A IA generativa já representa 8,7% de todas as publicações de patentes relacionadas a IA.

Esse movimento global pressiona os escritórios de patentes — inclusive o INPI — a aprimorar suas diretrizes de exame para invenções implementadas por computador. Nos Estados Unidos, o USPTO atualizou suas diretrizes de patentabilidade de IA em 2025. Na Europa, o EPO mantém jurisprudência consolidada sobre o "efeito técnico adicional" como critério para patentear software. O Brasil, alinhado a essa tendência, vem refinando a aplicação do art. 10 da LPI por meio de resoluções e diretrizes internas do INPI.

### O caso da seção H04: prioridade para telecomunicações

Em junho de 2026, o INPI [retomou o trâmite prioritário para pedidos de patente classificados no símbolo H04](https://www.gov.br/inpi/pt-br/central-de-conteudo/noticias/retoramado-tramite-prioritario-de-patentes-de-tecnica-de-comunicacao-eletrica-h04) (Técnica de Comunicação Elétrica), que inclui invenções implementadas por computador nas áreas de telecomunicações, redes 5G/6G e protocolos de comunicação. Cada depositante pode solicitar um pedido prioritário por mês para essa classificação, com limite excepcional de 2 requerimentos em julho de 2026. Essa é uma sinalização importante para startups de telecom e conectividade que desenvolvem software inovador na área.

## Quadro de decisão prática

| Sua situação | Recomendação |
|-------------|-------------|
| App comercial sem inovação técnica | Registro de programa de computador |
| Algoritmo inovador com aplicação industrial | Patente + registro de programa de computador |
| Método de negócio automatizado por software | Registro de programa de computador (não patenteável) |
| Arquitetura de IA generativa com novo efeito técnico | Patente (CII) + registro de programa de computador |
| Protótipo em estágio inicial | Registro de programa de computador primeiro; avalie patente depois |
| Software para processo industrial (IoT, manufatura) | Patente (CII) fortemente recomendada |

## Conclusão

A principal diferença entre patente de software e registro de programa de computador no Brasil está no **objeto da proteção**: o registro protege o código como obra autoral; a patente protege a solução técnica que o software executa. Uma não substitui a outra — são complementares.

Para a maioria dos desenvolvedores e startups, o registro de programa de computador é o primeiro passo, rápido e de baixo custo. Quando há uma inovação técnica substancial — um novo algoritmo de compressão, um método de otimização industrial, uma arquitetura de IA com efeito técnico demonstrável — a patente de invenção implementada por computador oferece proteção muito mais forte e com 20 anos de exclusividade.

A decisão depende do que você criou: se é um **produto**, registre o código; se é uma **solução técnica**, busque a patente.

Para mais detalhes sobre cada modalidade de proteção intelectual no Brasil, consulte o [guia comparativo completo de tipos de proteção intelectual]({{< relref "posts/tipos-protecao-intelectual-brasil-guia-completo/" >}}).

Leia também:

- [Patentes de Inteligência Artificial Generativa no Brasil: Guia Completo [2026]]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}})
- [Como Registrar um Programa de Computador no INPI: Guia Completo Passo a Passo [2026]]({{< relref "posts/guia-registro-programa-computador-inpi/" >}})
- [INPI vai pagar R$ 1.025 por busca de patentes: guia de credenciamento [2026]]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
