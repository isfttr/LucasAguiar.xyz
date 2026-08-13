---
date: 2026-08-13T11:00:00-03:00
draft: false
title: "Busca de Anterioridade de Marcas no INPI: Guia Completo Passo a Passo"
description: "Guia completo para fazer busca de anterioridade de marcas no INPI: acesso ao sistema pePI, busca exata e radical, classes de Nice, interpretação de resultados e dicas práticas."
featured_image: ""
categories:
  - article
tags:
  - marcas
  - inpi
  - busca-de-anterioridade
  - propriedade-intelectual
  - guia
---

A busca de anterioridade é o passo zero de qualquer estratégia de marcas no Brasil — e o mais negligenciado. Depositar um pedido de registro no INPI sem verificar antes se a marca já existe é apostar contra a estatística: pedidos colidentes com marcas anteriores são indeferidos com base no art. 124, inciso XIX, da Lei da Propriedade Industrial (Lei nº 9.279/96), que veda o registro de sinal que reproduza ou imite marca de terceiro para produtos ou serviços idênticos, semelhantes ou afins, causando confusão.

O custo do erro não é só a taxa perdida: é o retrabalho de um novo depósito, a demora no lançamento de um produto e, no pior cenário, a violação do direito de uso exclusivo de terceiro (art. 129 da LPI), com risco de ação judicial.

A boa notícia: a busca pode ser feita gratuitamente, sem cadastro, na base oficial do INPI. Este guia mostra o caminho completo — do acesso ao sistema até a interpretação dos resultados.

## Quando Fazer a Busca de Anterioridade

A consulta à base de marcas não serve apenas para checar se o nome que você escolheu já está registrado. Ela é útil em vários momentos:

| Cenário | Tipo de busca | Objetivo |
|---------|--------------|----------|
| Antes de depositar o pedido | Busca de anterioridade | Verificar se a marca já foi pedida/registrada por terceiro |
| Antes de lançar um produto ou serviço | Busca de colidência | Evitar violar marca de terceiro no mercado |
| Ao receber uma notificação de oposição | Busca de confronto | Avaliar a força do direito invocado pelo oponente |
| Em negociações de licenciamento ou M&A | Due diligence de PI | Confirmar titularidade e vigência dos registros |
| No monitoramento da carteira | Busca de marcas idênticas/semelhantes | Detectar pedidos de terceiros que colidem com a sua marca |

## Onde Fazer a Busca: o Sistema pePI

A base oficial de marcas do INPI está no **pePI (Pesquisa em Propriedade Industrial)**, acessível em [busca.inpi.gov.br](https://busca.inpi.gov.br/pePI/jsp/marcas/Pesquisa_num_processo.jsp) (também conhecido como Busca Web). O acesso é gratuito e não exige cadastro: basta clicar em **Continuar** na tela de login para pesquisar anonimamente. Criar uma conta (ou entrar com gov.br) dá acesso a serviços adicionais, como a disponibilização de documentos.

Duas observações importantes sobre a base:

- O acervo cobre **documentos publicados a partir do ano 2000** (e, para contratos de tecnologia, a partir de outubro de 2009).
- Para efeitos legais, o canal oficial de publicações é a **Revista Eletrônica da Propriedade Industrial (RPI)** — a base de busca é um instrumento de consulta, não um substituto da RPI para contagem de prazos.

## Passo a Passo da Busca Básica

Com o sistema aberto, acesse **Pesquisa Básica** (o link "Marca" leva à mesma consulta por nome). Os campos principais são:

1. **Tipo de Pesquisa: Exata ou Radical** — a escolha mais importante da busca (detalhada abaixo).
2. **Marca** — o nome que você quer verificar.
3. **Classificação de Nice (NCL)** — opcional, mas altamente recomendada para filtrar resultados pela classe de produtos ou serviços.
4. **Nº de Processos por Página** — 20 a 100 resultados por tela.

### Exata vs. Radical: Qual Usar?

- **Exata** retorna apenas registros com a palavra idêntica à pesquisada. Útil quando você quer saber se aquela marca específica existe.
- **Radical** retorna todos os registros que contêm o termo pesquisado em qualquer posição — inclusive combinações e variações. É a busca recomendada para anterioridade, porque captura marcas semelhantes, e não só idênticas.

Para entender a diferença na prática: uma busca **radical** por "natura" retornou, em agosto de 2026, **19.907 processos** — de "VIVA NATURAL" a "NATURANA" e "NATURAL LOOK". Uma busca exata por "natura" retorna apenas os processos com a marca exatamente "NATURA". Na anterioridade, o radical é quase sempre a escolha certa: a colidência que o INPI examina inclui semelhança, não apenas identidade.

### Filtrando por Classe de Nice

Marcas são registradas por classes de produtos e serviços da [Classificação de Nice](https://www.gov.br/inpi/pt-br/servicos/marcas/classificacao-marcas) (NCL). Duas marcas idênticas podem coexistir se estiverem em classes diferentes e não houver afinidade entre os produtos. Por isso, buscar sem filtrar classe gera ruído: milhares de processos em classes irrelevantes para o seu caso.

A busca básica permite preencher a classe diretamente. O resultado mostra a classe em que cada processo foi depositado, no formato `NCL(8) 31`, `NCL(12) 32` etc. — o número entre parênteses indica a edição da classificação usada no depósito (registros antigos aparecem em formato legado, como `03 : 20`).

### Outras Formas de Consulta

Além da busca por nome, o pePI permite consultar por:

- **Titular** — localizar todos os processos de uma empresa ou pessoa.
- **Cód. Figura** — busca por elementos figurativos de marcas mistas e figurativas (relevante para marcas com logotipo).
- **Nº do Processo, GRU, Protocolo ou Inscrição Internacional** — localizar um processo específico quando você já tem o número.

## Como Interpretar os Resultados

Cada linha do resultado traz: **Número** (do processo), **Prioridade**, o **tipo** da marca (nominativa, mista ou figurativa), o **nome** da marca, a **situação** com o detalhamento, o **titular** e a **classe**. A situação é o campo mais importante:

| Situação exibida | O que significa |
|------------------|-----------------|
| Marca Registrada — Registro de marca em vigor | Registro concedido e vigente: bloqueia colidência |
| Marca Registrada — Registro extinto | Já foi registrada, mas o registro caducou ou foi extinto: pode liberar o caminho |
| Marca Arquivada — Pedido definitivamente arquivado | Pedido foi arquivado: não gera direito |
| Marca Arquivada — Extinto | Processo encerrado sem registro |
| Em exame / Publicado | Pedido em andamento: ainda pode virar registro |

Um detalhe que escapa a quem busca pela primeira vez: **um registro extinto não bloqueia para sempre** — a extinção por caducidade, renúncia ou falta de pagamento pode abrir espaço para um novo registro. A leitura correta da situação evita tanto o falso positivo (achar que está tudo bloqueado) quanto o falso negativo (achar que o caminho está livre quando há pedido anterior em exame).

## Limitações da Busca e Boas Práticas

A busca no pePI é indispensável, mas tem limites que a análise profissional cobre:

1. **Colidência não é só identidade.** O INPI examina semelhança fonética, visual e conceitual, além da afinidade entre produtos. Busque variações: plurais, traduções, versões fonéticas ("Pharma" e "Farma", "K" e "C").
2. **Classes não óbvias.** O risco de colidência existe em classes afins, não só na classe exata do seu produto. Uma análise de afinidade entre classes é parte do exame.
3. **Marca notória e alto renome.** Marcas de [alto renome](https://www.gov.br/inpi/pt-br/servicos/marcas/alto-renome/) e notoriamente conhecidas (art. 125 e 126 da LPI) têm proteção ampliada, fora da lógica de classe — um registro aparentemente "livre" pode esbarrar nelas.
4. **A base não substitui a RPI** para efeitos legais, e o resultado de uma busca não é uma garantia de registrabilidade: é um insumo para decisão.

A busca gratuita resolve a triagem inicial. Quando o resultado indicar conflito potencial — ou quando a marca tiver valor estratégico — vale a análise detalhada de um especialista em PI.

## Depois da Busca: Próximos Passos

Se a busca não apontar colidência relevante, o depósito é feito no [e-Marcas](https://www.gov.br/inpi/pt-br/servicos/marcas/e-marcas), com os custos atualizados na [tabela oficial](https://www.gov.br/inpi/pt-br/servicos/marcas/custos) (MEI e ME têm desconto de 50%). Depois do depósito, o acompanhamento do processo — incluindo oposições de terceiros — é parte do ciclo. Saiba como [consultar o andamento de um processo no INPI]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}}).

## Conclusão

A busca de anterioridade é o investimento mais barato de todo o processo de registro de marca: gratuita, leva minutos e evita o indeferimento, o retrabalho e o risco de violar direito de terceiro. Dominar o pePI — a diferença entre busca exata e radical, o filtro por classe e a leitura da situação — coloca qualquer empresa em posição de tomar decisão informada antes de gastar com o depósito.

Leia também:

- [Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})
- [Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})
- [Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
