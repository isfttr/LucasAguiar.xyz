---
date: 2026-07-11T11:11:29-03:00
draft: true
title: "Como Registrar um Programa de Computador no INPI: Guia Completo Passo a Passo [2026]"
description: "Guia completo para registro de software no INPI: taxas, documentos necessários, certificado digital ICP-Brasil, GRU, e-Software e prazos. Passo a passo para pessoa física e jurídica."
featured_image: ""
categories:
  - article
tags:
  - registro-software
  - inpi
  - programa-de-computador
  - propriedade-intelectual
  - guia
---

Registrar um programa de computador no INPI é o equivalente, para o desenvolvedor de software, a registrar uma marca ou patentear uma invenção. O registro confere segurança jurídica ao titular e serve como prova de autoria e titularidade em casos de disputa judicial ou comercial.

Diferente do que muitos desenvolvedores imaginam, o INPI **não examina o código-fonte** — o registro é declaratório, não concessivo. O que o INPI faz é armazenar um resumo digital (hash) do código e publicar o registro na Revista da Propriedade Industrial (RPI), criando um marco temporal que prova a existência do software naquela data.

Este guia cobre todo o processo, da geração do hash à obtenção do certificado, com base na Instrução Normativa INPI nº 99/2019 e na Lei de Software (Lei 9.609/98).

## O que é o Registro de Programa de Computador no INPI?

O registro de programa de computador no INPI é regulado pela **Lei 9.609/98** (Lei de Software) e pela **Instrução Normativa INPI nº 99/2019**. O serviço é feito exclusivamente pelo código de retribuição **730** e custa **R$ 210,00** (consulte a [tabela oficial de retribuições](https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/NovaTabeladeRetribuiesINPI_SOFTWARE_versofinal.pdf) para valores atualizados).

A proteção por direito autoral do software é automática desde a criação (Convenção de Berna, da qual o Brasil é signatário junto com 176 países), mas o registro no INPI é a prova material mais sólida de titularidade disponível no ordenamento jurídico brasileiro.

### Por que registrar?

| Benefício | Descrição |
|-----------|-----------|
| Prova de autoria | Estabelece marco temporal de existência do software |
| Segurança em litígios | Facilita a comprovação de titularidade em ações judiciais |
| Contratos e licenciamento | Requisito para formalizar cessão de direitos ou licenciamento |
| Transferência de tecnologia | Necessário para contratos de franchising e transferência |
| Proteção internacional | Reconhecido nos 176 países signatários da Convenção de Berna |

## Pré-requisitos

Antes de iniciar o pedido, você precisa de:

1. **Certificado digital qualificado ICP-Brasil** — obrigatório. O sistema do INPI **não aceita** assinaturas avançadas, incluindo Gov.br e ACOAB. Apenas certificados A1 ou A3 emitidos por Autoridade Certificadora credenciada pela ICP-Brasil (ex: Certisign, Soluti, Serasa).
2. **Cadastro no e-INPI** — necessário para acessar os sistemas de peticionamento. Veja nosso [guia de acesso ao INPI com CNPJ e conta Gov.br]({{< relref "posts/inpi-acesso-cnpj-conta-govbr-guia-2026/" >}}).
3. **Código-fonte do software** — para gerar o resumo hash.
4. **GRU paga** — Guia de Recolhimento da União, código 730 (R$ 210,00).

> ⚠️ **Verifique a validade do seu certificado digital** no [validador oficial do ITI](https://validar.iti.gov.br/) antes de iniciar. Certificados vencidos ou não qualificados são rejeitados pelo sistema do INPI.

## Passo a Passo do Registro

### 1. Gere o Resumo Hash do Código-Fonte

O primeiro passo é gerar um **resumo digital hash** (SHA-256 é o mais comum) do arquivo que contém o código-fonte. Esse hash é o que será depositado no INPI — o próprio código permanece sigiloso.

Em um terminal Linux ou macOS:

```bash
sha256sum meu-software.zip > hash-software.txt
# Ou, para um diretório:
find src/ -type f -exec sha256sum {} \; | sort | sha256sum
```

No Windows (PowerShell):

```powershell
Get-FileHash -Algorithm SHA256 .\meu-software.zip
```

> 📌 **Boa prática:** mantenha uma cópia do arquivo original na mesma data da geração do hash. Se houver disputa judicial anos depois, você precisará demonstrar que o hash corresponde ao arquivo original. Recomenda-se armazenar uma cópia em mídia física lacrada ou em storage imutável.

### 2. Prepare a Declaração de Veracidade (DV)

A Declaração de Veracidade é um documento gerado pelo próprio sistema de GRU do INPI. Você deve:

1. Acessar o [sistema de emissão de GRU](https://www.gov.br/inpi/pt-br/servacos/gru) do INPI
2. Selecionar o código 730 (Pedido de Registro de Programas de Computador)
3. Preencher os dados do depositante
4. **Baixar a Declaração de Veracidade** gerada automaticamente
5. **Assinar digitalmente** a DV com seu certificado qualificado ICP-Brasil
6. Gerar a GRU para pagamento

A DV assinada digitalmente deverá ser anexada ao pedido na etapa de peticionamento.

### 3. Pague a GRU — Código 730 (R$ 210,00)

O valor do pedido de registro é de **R$ 210,00** (código 730). A GRU pode ser paga em qualquer banco credenciado (incluindo internet banking).

| Serviço | Código | Valor (R$) |
|---------|--------|-----------|
| Pedido de Registro de Programa de Computador | 730 | **210,00** |
| Alteração de nome (pessoa física) | 731 | 210,00 |
| Alteração de razão social (pessoa jurídica) | 732 | 210,00 |
| Transferência de titularidade | 704 | 210,00 |
| Solicitação de levantamento do sigilo | 719 | 1.350,00 |
| Correção de dados no certificado (por falha do interessado) | 747 | 210,00 |

> 💡 **Guarde o número da GRU** ("Nosso Número") — você precisará dele na etapa de peticionamento e, se houver problemas com o sistema, para recuperar o protocolo do pedido.

### 4. Acesse o e-Software e Preencha o Pedido

Com a GRU paga e a DV assinada, acesse o [sistema e-Software](https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/peticionamento) (é necessário login com certificado digital).

No formulário você deverá informar:

- **Dados do titular** (pessoa física: CPF, nome; pessoa jurídica: CNPJ, razão social)
- **Dados do software** (título, versão, data de criação, linguagem de programação)
- **Resumo hash** gerado na etapa 1
- **Declaração de Veracidade** assinada digitalmente
- **Procuração** (se houver procurador) — também deve ser assinada digitalmente

Em julho de 2026, o sistema de peticionamento de programa de computador apresentou instabilidade entre 20 e 30 de junho, mas foi restabelecido em 1º de julho. Se você chegou a peticionar durante esse período e não recebeu o protocolo, acesse a área de peticionamento, informe o número da GRU e faça o download do protocolo.

### 5. Acompanhe o Andamento

Após o protocolo do pedido, o prazo de publicação é de **até 10 dias** contados da data do pedido. O andamento pode ser acompanhado de duas formas:

- **RPI (Revista da Propriedade Industrial):** publicada toda terça-feira. Consulte na seção de Programas de Computador.
- **Meus Pedidos (BuscaWeb):** cadastre o número do seu pedido no [BuscaWeb](https://busca.inpi.gov.br/) para receber notificações por e-mail. Atenção: este é um serviço adicional e não substitui a consulta à RPI.

### 6. Baixe o Certificado de Registro

Após a publicação na RPI, o certificado digital de registro de programa de computador fica disponível para download no sistema e-Software. O certificado contém os dados do titular, o título do software, a data de depósito e o número de registro.

## Validade do Registro

O registro de programa de computador é válido por **50 anos** a partir de **1º de janeiro do ano subsequente à sua criação** ou da data de criação, o que for mais vantajoso para o titular.

Exemplo: um software criado em março de 2026 e registrado em julho de 2026 terá proteção até 1º de janeiro de 2077 (50 anos após 2027).

A proteção é reconhecida nos **176 países signatários da Convenção de Berna** (1886), o que cobre praticamente todos os países relevantes para o mercado de software.

## Dúvidas Frequentes

### Preciso registrar o software ou o direito autoral já me protege?

A proteção autoral sobre software é automática no Brasil desde a criação (art. 2º da Lei 9.609/98). O registro no INPI não é obrigatório, mas é **altamente recomendado** como prova material. Sem registro, a comprovação de autoria depende de outros meios de prova, que podem ser frágeis em disputas judiciais.

### Posso registrar mais de uma versão do mesmo software?

Sim. Cada versão significativa pode (e deve) ser registrada separadamente, com seu próprio hash e data de criação. Versões meramente corretivas (patches) não exigem novo registro.

### Pessoa física pode registrar?

Sim. Pessoas físicas podem registrar software no INPI, com CPF e certificado digital. O valor é o mesmo (R$ 210,00). Pessoas jurídicas também usam o mesmo código e valor.

### O que o INPI faz com o código-fonte?

Nada. O INPI armazena apenas o **resumo hash** do código-fonte, não o código em si. O código permanece sigiloso e de posse exclusiva do titular. Por isso é essencial manter a cópia arquivada — o hash só prova que o arquivo existia naquela data se você puder apresentar o arquivo correspondente.

### E se o sistema de peticionamento estiver fora do ar?

O INPI informa sobre instabilidades em seus canais oficiais. Se o peticionamento foi realizado durante um período de instabilidade e o protocolo não foi emitido, acesse a área de peticionamento, informe o número da GRU utilizada e faça o download do protocolo. Em caso de dúvidas, utilize os [canais de atendimento do INPI](https://www.gov.br/inpi/pt-br/canais-de-atendimento).

## Conclusão

Registrar um programa de computador no INPI é um processo simples, de custo baixo (R$ 210,00) e que confere segurança jurídica por 50 anos. O passo mais crítico é ter um **certificado digital qualificado ICP-Brasil** — sem ele, o sistema simplesmente não aceita o pedido.

Desenvolvedores, startups e empresas de tecnologia que ainda não registraram seus softwares estão expostos a riscos desnecessários em disputas de titularidade. O investimento é pequeno comparado ao custo de uma ação judicial sem prova documental robusta.

Leia também:

- [INPI Esclarece Acesso com CNPJ no Gov.br: Guia para Vincular sua Empresa [2026]]({{< relref "posts/inpi-acesso-cnpj-conta-govbr-guia-2026/" >}})
- [INPI Esclarece Acesso com CNPJ no Gov.br: Guia para Vincular sua Empresa [2026]]({{< relref "posts/inpi-acesso-cnpj-conta-govbr-guia-2026/" >}})
- [INPI Esclarece Acesso com CNPJ no Gov.br: Guia para Vincular sua Empresa [2026]]({{< relref "posts/inpi-acesso-cnpj-conta-govbr-guia-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
