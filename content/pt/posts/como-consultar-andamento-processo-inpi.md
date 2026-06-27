---
date: 2026-06-26T12:00:00-03:00
draft: false
title: "Como Consultar o Andamento de um Processo no INPI: Guia Passo a Passo [2026]"
description: "Guia completo para consultar processos de patentes, marcas e desenhos industriais no INPI. Aprenda a usar o e-INPI, o sistema de busca e a interpretar os códigos de andamento."
featured_image: ""
categories:
  - article
tags:
  - inpi
  - guia
  - tutorial
  - propriedade-intelectual
  - patentes
  - marcas
---

Acompanhar o andamento de um processo no INPI é essencial — seja para saber se sua
marca foi deferida, se sua patente entrou em exame, ou se há alguma exigência
pendente. Mas o sistema pode ser confuso para quem nunca usou.

Este guia mostra **passo a passo** como consultar qualquer processo no INPI,
interpretar os códigos de andamento e não perder prazos importantes.

---

## 1. Acessando o Sistema Busca Web INPI

O INPI migrou para o sistema **e-INPI** (antigo INPI-Sistema). Toda a consulta é online e gratuita.

**Passo 1:** Acesse [Busca Web - INPI](https://busca.inpi.gov.br/pePI/)

**Passo 2:** Na tela de login não é necessário criar um, clique em "Para realizar a Pesquisa anonimamente aperte apenas o botão **Continuar....**"

A partir das opções, será possível entrar diretamente nos subsistemas para cada um
dos bancos de dados de marcas, patentes, desenhos industriais, indicações
geográficas, programas de computador, topografias de circuito integrado, e contratos
de transferência de tecnologia.

---

## 2. Consulta de Marcas

### Pelo número do processo

1. Vá em [Busca de Marcas](https://www.gov.br/inpi/pt-br/servicos/marcas/busca)
2. Digite o **número do processo** (formato: `9 dígitos + 1 dígito verificador`, ex: 938529072)
3. Clique em "Pesquisar"

### Pelo nome da marca

1. Na mesma página, selecione "Marca" no campo de busca
2. Digite o nome da marca (ex: "LFA CONSULTORIA")
3. Escolha a classe desejada (se souber)
4. Clique em "Pesquisar"

### O que você vai ver

O resultado mostra:

| Campo | O que significa |
|-------|----------------|
| **Número do processo** | Identificador único do pedido |
| **Marca** | Nome ou imagem da marca |
| **Classe** | Classificação de Nice (produtos/serviços) |
| **Titular** | Nome do proprietário |
| **Situação** | Status atual (ex: "Depósito publicado", "Deferido", "Indeferido") |
| **Despacho** | Último ato publicado na RPI |

---

## 3. Consulta de Patentes

1. Acesse [Busca de Patentes](https://www.gov.br/inpi/pt-br/servicos/patentes/busca)
2. Você pode buscar por:
   - **Número do pedido** (ex.: PI9915985-6, ou BR112016000561-9)
   - **Número do PCT** (se for depósito internacional)
   - **Titular** (nome do depositante)
   - **Inventor**
   - **Título** (palavras-chave)

### Dica: Busca avançada

Use o campo "Pesquisa Avançada" para combinar critérios - uso de operadores
booleanos (E/OU, * - wildcard para prefixos e sufixos). Exemplo: título = "pirid* E
carbam*" retorna resultados que contenham simultaneamente piridina e carbamato.
Caso use o operador "OU", aparecerão resultados que contenham piridina, carbamato e
piridina + carbamato.

---

## 4. Entendendo os Códigos de Andamento (Despachos)

Cada movimentação do processo gera um **despacho** publicado na **RPI (Revista da
Propriedade Industrial)**. Os códigos mais comuns:

### Marcas
| Código | Significado (despacho oficial correspondente)                                                                   | O que fazer                                                                                                                                                                                                                                                                                                 |
|--------|-----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2.1    | Depósito publicado — protocolo confirmado                                                                       | ✅ Pedido protocolado e número de processo gerado. Aguarde o exame formal. Guarde o número de 9 dígitos.                                                                                                                                                                                                     |
| 3.1    | Exame formal concluído — pedido publicado para oposição (cód. 009)                                              | ⚠️ A partir desta publicação na RPI, terceiros têm 60 dias corridos para apresentar oposição. Monitore a RPI semanalmente nesse período.                                                                                                                                                                     |
| 3.2    | Exigência formal (cód. 005)                                                                                     | 🚨 INPI detectou pendência documental ou de pagamento. Prazo de 5 dias corridos para responder, contados da publicação na RPI. Se não responder, o pedido é considerado inexistente.                                                                                                                         |
| 5.1    | Exigência de mérito (cód. 136)                                                                                  | ⚠️ INPI solicitou esclarecimentos sobre o mérito da marca (especificação, distinção, licitude, etc.). Prazo de 60 dias para resposta. Não respondida, o pedido é arquivado definitivamente.                                                                                                                  |
| 5.2    | Sobrestamento do exame de mérito (cód. 142)                                                                     | ⏳ Exame suspenso enquanto há decisão pendente em processo(s) conflitante(s). Nenhuma ação necessária — aguarde a decisão dos processos anteriores.                                                                                                                                                          |
| 6.1    | Notificação de oposição ao pedido de registro (cód. 423 para Madri; publicação direta para depósitos nacionais) | ⚠️ Terceiro apresentou oposição ao seu pedido de registro. Você tem 60 dias para apresentar manifestação (defesa). A manifestação é facultativa, mas fortemente recomendada.                                                                                                                                 |
| 6.4    | Manifestação protocolada                                                                                        | ✅ Sua resposta à oposição foi registrada. Aguarde o exame de mérito — o INPI analisará oposição e manifestação em conjunto.                                                                                                                                                                                 |
| 7.1    | Deferido (cód. 029)                                                                                             | 🎉 Marca aprovada no mérito. Para pedidos com deferimento publicado a partir de 22/06/2025: o certificado é emitido automaticamente, sem taxa adicional. Para pedidos anteriores a essa data: havia prazo de 60 dias (+ 30 dias extraordinários) para recolher a GRU de concessão, sob pena de arquivamento. |
| 7.2    | Deferido parcialmente                                                                                           | ⚠️ Aprovado em parte das classes solicitadas, ou com restrição de ofício na especificação. Você pode recorrer da parte indeferida em até 60 dias da publicação.                                                                                                                                              |
| 7.5    | Indeferido (cód. 024)                                                                                           | ❌ Pedido negado. Você pode interpor recurso em até 60 dias contados da publicação na RPI (art. 212 da LPI). O recurso deve ser fundamentado.                                                                                                                                                                |
| 8.1    | Recurso protocolado — notificação a terceiros (cód. 360)                                                        | ✅ O INPI publicou o recurso na RPI. Terceiros interessados têm 60 dias para apresentar contrarrazões (art. 213 da LPI). Nenhuma ação sua necessária neste momento.                                                                                                                                          |
| 8.4    | Recurso não provido — decisão mantida (cód. 235)                                                                | ❌ Recurso negado. Indeferimento mantido. A via administrativa está encerrada. Somente ação judicial para contestar.                                                                                                                                                                                         |
| 8.5    | Recurso provido — decisão reformada para deferimento (cód. 237)                                                 | 🎉 Recurso aceito — marca deferida. Aplica-se o mesmo regime do código 7.1 quanto à concessão automática ou necessidade de pagamento.                                                                                                                                                                        |
| 9.1    | Registro concedido (cód. 158)                                                                                   | ✅ Certificado emitido. Registro válido por 10 anos a partir da data de publicação deste ato na RPI (art. 133 da LPI). Anote a data de vencimento — a renovação deve ser requerida no último ano de vigência.                                                                                                |
| 9.3    | Registro renovado / prorrogado                                                                                  | ✅ Vigência prorrogada por mais 10 anos. Nova data de vencimento confirmada no certificado de prorrogação.                                                                                                                                                                                                   |
| 10.1   | Arquivamento definitivo (cód. 106, 139, 157, entre outros)                                                      | ❌ Processo encerrado por prazo perdido, exigência não cumprida ou falta de procuração. Não há retomada pela via administrativa. Avalie novo depósito ou, em casos específicos, recurso.                                                                                                                     |
| 10.2   | Processo Administrativo de Nulidade — PAN (cód. 400 ou 437)                                                     | ⚠️ Nulidade instaurada (por terceiro ou de ofício) contra seu registro. Você tem 60 dias para se manifestar (art. 170 da LPI). Contrate assessoria especializada.                                                                                                                                            |

### Patentes

| Código      | Significado                                                                         | O que fazer                                                                                                                                                                                                                                                                                                                                                                          |
|-------------|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2.1         | Depósito efetuado — protocolo confirmado                                            | ✅ Pedido protocolado e número de processo gerado. O pedido fica em sigilo por 18 meses. Atenção: anuidades devem ser pagas anualmente a partir do 3º ano (24º mês) do depósito, independentemente do andamento do exame.                                                                                                                                                             |
| 2.5         | Exigência formal (art. 21 da LPI)                                                   | 🚨 Documento obrigatório ausente ou com vício (relatório, reivindicações, comprovante de pagamento, etc.). Prazo de 30 dias para resposta. Não respondida: pedido arquivado. É o prazo mais curto de todo o processo de patentes.                                                                                                                                                     |
| 3.1         | Publicação do pedido na RPI (~18 meses após o depósito)                             | ⚠️ Sigilo encerrado — pedido publicado. Terceiros podem agora acessar o documento e submeter subsídios ao exame. Verifique: o requerimento de exame técnico deve ser apresentado em até 36 meses do depósito (GRU 204). Se não requerido, o pedido é arquivado (11.1).                                                                                                                |
| 5.1         | Requerimento de exame técnico recebido                                              | ✅ INPI registrou o pedido de exame. O processo entra na fila técnica. Tempo médio de espera para início do exame: 5 a 9 anos (salvo Trâmite Prioritário). Continue pagando anuidades normalmente durante a espera.                                                                                                                                                                   |
| 6.1         | Exigência técnica                                                                   | ⚠️ O examinador identificou problemas de novidade, atividade inventiva, aplicação industrial, reivindicações ou suficiência descritiva (arts. 8, 10, 11, 13, 15, 18, 22–25 da LPI). Prazo de 90 dias para resposta fundamentada. Não respondida: pedido arquivado definitivamente (11.2).                                                                                             |
| 6.21 / 6.23 | Exigência preliminar — busca realizada por escritório estrangeiro (USPTO, EPO etc.) | ⚠️ Anterioridades identificadas por buscas feitas no exterior foram aproveitadas pelo INPI. Argumente sobre novidade e atividade inventiva frente a cada documento citado (relevância N = novidade; I/Y = atividade inventiva). Prazo: 90 dias.                                                                                                                                       |
| 6.22        | Exigência preliminar — busca realizada pelo próprio INPI                            | ⚠️ INPI realizou busca de anterioridades internamente (pedido sem correspondentes no exterior). Mesma lógica de resposta do 6.21. Prazo: 90 dias.                                                                                                                                                                                                                                     |
| 6.7         | Outras exigências                                                                   | ⚠️ Exigência complementar após resposta insatisfatória ao 6.1/6.21/6.22. Foque nos pontos específicos não resolvidos. Prazo: 90 dias.                                                                                                                                                                                                                                                 |
| 7.1         | Parecer técnico — conhecimento do parecer                                           | 🔴 O examinador não foi convencido pelas respostas anteriores. Este é o segundo e último parecer técnico antes do indeferimento. Prazo de 90 dias para argumentação final. Tudo que não for arguido aqui não poderá ser usado no recurso posterior. Use argumentos inéditos e altamente específicos.                                                                                  |
| 8.6         | Arquivamento — anuidade anual não paga (art. 86 da LPI)                             | ⚠️ Anuidade não recolhida no prazo. Você tem 3 meses para requerer a restauração do andamento via GRU 208 + formulário 1.02 + pagamento da anuidade em atraso. Se não restaurado: despacho 8.11 (definitivo).                                                                                                                                                                         |
| 8.11        | Manutenção do arquivamento por anuidade — definitivo                                | ❌ Restauração não solicitada no prazo. Arquivamento definitivo. O conteúdo torna-se domínio público. Nenhuma ação administrativa cabível.                                                                                                                                                                                                                                            |
| 9.1         | Deferimento                                                                         | 🎉 Pedido aprovado no exame técnico. Para deferimentos publicados a partir da RPI nº 2855 (23/09/2025): a carta-patente é expedida automaticamente, sem pagamento adicional (serviços 212/213 são R$0,00 desde 20/12/2025). Para deferimentos anteriores: havia prazo de 60 dias (GRU 212, ordinário) + 30 dias (GRU 213, extraordinário) para pagamento. Continue pagando anuidades. |
| 9.2         | Indeferimento                                                                       | ❌ Pedido negado. Caberá recurso em até 60 dias da publicação na RPI (art. 212 da LPI). O recurso vai para banca de 3–4 examinadores. A decisão do recurso é final e irrecorrível na via administrativa.                                                                                                                                                                              |
| 9.2.4       | Manutenção do indeferimento — recurso não provido                                   | ❌ Recurso negado e indeferimento mantido. Via administrativa esgotada. Somente ação judicial de nulidade (art. 56 da LPI) para contestar, no prazo de prescrição.                                                                                                                                                                                                                    |
| 11.1        | Arquivamento — falta de requerimento de exame (art. 33 da LPI)                      | ⚠️ Exame não requerido dentro de 36 meses do depósito. O pedido pode ser desarquivado no prazo de 60 dias da publicação deste despacho, mediante pagamento de taxa específica. Não desarquivado: despacho 11.1.1 (definitivo).                                                                                                                                                        |
| 11.2        | Arquivamento definitivo — despacho não respondido (art. 36 §1°)                     | ❌ Exigência técnica ou formal não respondida dentro do prazo de 90 dias. Definitivo. Sem reversão administrativa possível.                                                                                                                                                                                                                                                           |
| 11.4        | Arquivamento definitivo — carta-patente não paga (art. 38 §2°)                      | ❌ GRU de expedição de carta-patente não recolhida dentro do prazo total de 90 dias após o deferimento (9.1). Definitivo. Não se aplica a pedidos deferidos a partir de 23/09/2025, onde a expedição é automática.                                                                                                                                                                    |
| 12.2        | Recurso contra o indeferimento — protocolado                                        | ✅ INPI registrou o recurso. Não há prazo adicional para complementar argumentos — o que foi apresentado é o que será analisado pela banca revisora.                                                                                                                                                                                                                                  |
| 15.10       | Mudança de natureza da invenção                                                     | ⚠️ O examinador entende que o objeto não atinge o patamar de atividade inventiva de Patente de Invenção (PI), propondo conversão para Modelo de Utilidade (MU). MU tem critério mais baixo (ato inventivo), mas vigência menor: 15 anos do depósito vs. 20 anos da PI. Avalie estrategicamente — a conversão pode ser vantajosa para salvar a proteção.                               |
| 16.1        | Expedição da carta-patente                                                          | ✅ Patente concedida e carta-patente emitida. Vigência: 20 anos do depósito (PI) ou 15 anos do depósito (MU). Continue pagando anuidades anuais até o fim da vigência — o não pagamento extingue a patente (art. 78, IV da LPI). Anote a data de vencimento.                                                                                                                          |

---

## 5. Como Acompanhar sem Saber o Número do Processo

Se você não tem o número do processo, há outras formas:

### Pelo CPF/CNPJ do titular

Na busca de marcas, selecione "Titular" e digite seu CPF ou CNPJ. Isso lista **todos os processos** vinculados àquele titular.

### Pela RPI (Revista da Propriedade Industrial)

A RPI é publicada **toda terça e quinta-feira** no site do INPI. Você pode:

1. Acessar a [página da RPI](https://revistas.inpi.gov.br/rpi/)
2. Escolher a seção (Marcas, Patentes, Desenhos)
3. Procurar por CPF/CNPJ ou número de processo

---

## 8. Prazos Importantes

| Evento | Prazo | Consequência se Perder |
|--------|-------|------------------------|
| Contestar oposição (marcas) | 60 dias da publicação | Registro pode ser arquivado |
| Recurso contra indeferimento (marcas) | 60 dias | Decisão se torna definitiva |
| Recurso contra indeferimento (patentes) | 60 dias | Perda do direito de recorrer |
| Pagamento de anuidade (patentes) | Até 6 meses após o vencimento | Patente pode ser extinta |
| Prorrogação de marca | Até 6 meses após o vencimento | Marca pode ser extinta |
| Resposta a exigência técnica | 90 dias (prorrogável) | Pedido pode ser arquivado |

---

## 9. Problemas Comuns e Soluções

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| "Processo não encontrado" | Número digitado errado | Verifique o formato (9 dígitos + verificador para marcas) |
| "Sistema indisponível" | Manutenção programada | Tente após 2 horas ou no dia seguinte |
| Despacho não aparece | RPI acaba de ser publicada | A atualização do banco de dados e disponibilização de documentos ocorre às quartas-feiras, 1 dia após publicação da RPI |

---

Leia também:

- [Quanto Custa Registrar uma Marca no INPI em 2026? [Tabela Completa]]({{< relref "posts/quanto-custa-registrar-marca-inpi-2026/" >}})
- [INPI 4.0: O Plano de Automação do INPI (2025-2029) e o Futuro das Patentes no Brasil]({{< relref "posts/inpi-automation-roadmap-2025-2029/" >}})
- [INPI esgota cotas de trâmite prioritário para marcas no comércio eletrônico — e agora?]({{< relref "posts/inpi-esgotamento-cotas-tramite-prioritario-marcas-ecommerce/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
