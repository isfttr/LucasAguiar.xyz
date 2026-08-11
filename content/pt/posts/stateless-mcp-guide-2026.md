---
date: 2026-08-05T18:10:00.000Z
draft: false
title: 'Guia Stateless do MCP [2026]: O que mudou no Model Context Protocol 2.0'
description: 'MCP sem estado explicado: o que a especificação 2.0 do Model Context Protocol de 2026-07-28 mudou, por que servidores de requisição única são importantes e como construir e testar seu próprio servidor MCP.'
featured_image: ''
categories:
  - article
tags:
  - mcp
  - ai-agents
  - llm
  - protocol
  - ai-tools
slug: guia-stateless-mcp-2-2026
translation_source_hash: 34e48fa74be4f57f59c3f44e54223e8ba298fb146b96dd7103f7f7d7d9387ba1
---
Você tem um agente de IA, um banco de dados e uma crescente suspeita de que conectá-los não deveria exigir uma integração personalizada toda vez. Esse é exatamente o problema que o Model Context Protocol (MCP) foi criado para resolver — e em julho de 2026 ele recebeu sua atualização mais significativa desde o lançamento: **MCP sem estado**, a mudança definidora da especificação `2026-07-28` (informalmente, MCP 2.0).

Este guia aborda o que mudou, por que o modelo sem estado é importante para quem constrói ferramentas de agentes e como experimentá-lo hoje com ferramentas reais.

## O que é o MCP (e por que ele existe)

MCP é um protocolo aberto que padroniza como aplicações de LLM se conectam a ferramentas externas e fontes de dados. Ele usa mensagens JSON-RPC 2.0 entre três papéis: **hosts** (aplicações de LLM que iniciam conexões), **clientes** (conectores dentro do host) e **servidores** (serviços que fornecem contexto e capacidades — ferramentas, recursos e prompts). A [especificação](https://modelcontextprotocol.io/specification/2026-07-28) oficial a descreve como inspirada no Language Server Protocol: em vez de cada IDE inventar sua própria forma de falar com ferramentas de linguagem, o LSP padronizou isso, e o MCP faz o mesmo para o ecossistema de agentes de IA.

A Anthropic lançou o MCP em novembro de 2024. O interesse disparou ao longo de 2025 e depois esfriou um pouco quando frameworks de agentes com acesso a terminal (além das Skills da Anthropic) conseguiram realizar grande parte do que o MCP fazia, com mais flexibilidade. A [especificação 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) — lançada em 28 de julho de 2026 — é a mudança mais significativa no protocolo desde seu lançamento e reacendeu o ecossistema. Como Simon Willison disse em sua análise do lançamento, dar a um agente um shell e acesso aberto à internet é arriscado e exige um modelo muito forte; as ferramentas do MCP são mais fáceis de auditar e controlar, e simples o suficiente para que [modelos menores rodando em um laptop]({{< relref "posts/creating-my-ai-assistant-locally/" >}}) possam usá-las com competência.

## A mudança central: de duas requisições para uma

A maneira mais clara de ver a diferença entre o MCP legado (com estado) e o novo modelo sem estado é lado a lado. O MCP legado exigia **duas requisições HTTP**: primeiro você `initialize` uma sessão e recebe um `Mcp-Session-Id`, depois chama a ferramenta, enviando esse ID de sessão de volta:

```http
POST /mcp HTTP/1.1
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 1, "method": "initialize",
  "params": { "protocolVersion": "2025-11-25", "capabilities": {},
    "clientInfo": { "name": "my-app", "version": "1.0" } } }
```

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 2, "method": "tools/call",
  "params": { "name": "search", "arguments": { "q": "otters" } } }
```

O MCP sem estado reduz isso a **uma única requisição HTTP**. O handshake de sessão é substituído por metadados de protocolo transportados nos cabeçalhos, e o cliente se identifica no corpo da requisição:

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search
Content-Type: application/json

{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": { "name": "search", "arguments": { "q": "otters" },
    "_meta": { "io.modelcontextprotocol/clientInfo": { "name": "my-app", "version": "1.0" } } } }
```

A especificação agora descreve o protocolo base como construído sobre **requisições sem estado e autocontidas, com negociação de capacidades por requisição**. Sem registro de sessão no servidor, sem `Mcp-Session-Id` para rastrear.

## Por que o modelo sem estado é importante

A mudança é pequena na transmissão e grande na prática, por três motivos:

**1. Escalabilidade horizontal.** Com sessões com estado, um servidor precisa lembrar de cada sessão, e um balanceador de carga precisa fixar cada cliente à mesma instância de backend (sticky routing) ou as sessões quebram. Servidores sem estado não têm memória, então qualquer instância pode atender qualquer requisição. Essa é a diferença entre uma integração de brinquedo e algo que você pode colocar atrás de uma stack web de verdade.

**2. Implementações mais simples.** Um servidor MCP sem estado está mais próximo de um endpoint HTTP simples do que de um gerenciador de sessões. Simon Willison relatou ter construído três implementações de MCP na semana em que a especificação foi lançada — um bom sinal de quanta fricção a mudança removeu. O [artigo sobre MCP sem estado](https://simonwillison.net/2026/Jul/31/stateless-mcp/) dele detalha as três.

**3. Melhor adequação à web.** IDs de sessão com estado são desconfortáveis em ambientes serverless e conteinerizados. Requisições sem estado se mapeiam naturalmente para a semântica HTTP, cache e middleware padrão.

O que **não** mudou: o MCP ainda usa JSON-RPC 2.0, ainda expõe servidores com **Resources** (contexto e dados), **Prompts** (fluxos de trabalho com modelos) e **Tools** (funções que o modelo pode executar), e ainda suporta as extensões opcionais — **Tasks** para operações assíncronas de longa duração, **Skills over MCP** para instruções estruturadas de agentes e **MCP Apps** para elementos de UI interativos renderizados inline nas conversas.

## Como experimentar hoje

A maneira mais rápida de sentir o novo modelo é testar um servidor MCP sem estado ao vivo a partir do seu terminal. O [mcp-explorer](https://github.com/simonw/mcp-explorer) do Willison é uma CLI Python sem estado que roda diretamente com `uvx`, sem etapa de instalação:

```bash
uvx mcp-explorer list https://agentic-mermaid.dev/mcp
uvx mcp-explorer inspect render_svg
uvx mcp-explorer call https://agentic-mermaid.dev/mcp render_svg -a source 'graph TD; A-->B'
```

O comando `list` mostra as ferramentas que um servidor expõe, `inspect` imprime o schema JSON das entradas e saídas de uma ferramenta, e `call` a invoca com argumentos. Testar uma especificação dessa forma é uma das melhores maneiras de internalizá-la.

Mais dois exemplos práticos da mesma leva de lançamentos:

- **[datasette-mcp](https://github.com/datasette/datasette-mcp)** — um plugin Datasette que adiciona um endpoint `/-/mcp` a qualquer instância. Ele expõe três ferramentas (`list_databases`, `get_database_schema`, `execute_sql`) que permitem a um agente executar SQL somente leitura nos seus dados. Conecte-o ao ChatGPT ou Claude e eles poderão consultar sua instância diretamente.
- **[llm-mcp-client](https://github.com/simonw/llm-mcp-client)** — um plugin alfa para a CLI `llm` que adiciona integração MCP de primeira classe: `llm -t 'MCP("https://datasette.simonwillison.net/-/mcp")' 'count the notes'`.

Se você quiser ver o MCP em ação na infraestrutura deste próprio blog, o [tutorial sobre como conectar o Google Search Console a um agente via um servidor MCP]({{< relref "posts/google-search-console-agente-hermes/" >}}) cobre uma configuração real de ponta a ponta — conta de serviço, o servidor `gsc-mcp` e os ajustes de Docker necessários para executá-lo em um homelab.

## Segurança: o caso do MCP em vez de shell puro

A filosofia de design do protocolo é explícita sobre segurança: consentimento e controle do usuário, privacidade de dados e segurança das ferramentas são princípios de primeira classe na [especificação](https://modelcontextprotocol.io/specification/2026-07-28). O modelo baseado em ferramentas do MCP oferece uma superfície definida — uma lista fixa de funções com schemas tipados — em vez de "aqui está um shell, boa sorte". Isso é muito mais fácil de auditar, isolar (sandbox) e raciocinar do que execução arbitrária de comandos em um ambiente de rede aberto.

Isso não significa que o MCP seja imune a abusos. O protocolo permite caminhos arbitrários de acesso a dados e execução de código, e o padrão de permitir que usuários misturem e combinem ferramentas empurra para o usuário a responsabilidade de evitar exfiltração de dados — a mesma classe de risco discutida em [fluxos de trabalho agentivos e injeção de prompt]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}). Trate qualquer servidor MCP ao qual você se conectar como não confiável até ler sua lista de ferramentas e mantenha conjuntos de ferramentas somente leitura (como o `execute_sql` atual do `datasette-mcp`) somente leitura sempre que possível.

## Quando usar MCP e quando não usar

Uma regra de decisão útil após a especificação de 2026:

- **Use MCP** quando você quiser uma superfície de ferramentas estável e auditável para agentes — especialmente para aplicações sensíveis, integrações compartilhadas ou modelos pequenos que não conseguem operar um shell completo de forma confiável.
- **Pule o MCP** quando uma tarefa for exploratória e precisar de toda a flexibilidade de um terminal — um harness de agente com shell em sandbox continua sendo a opção mais geral. As duas abordagens são complementares, e o ecossistema está cada vez mais tratando-as dessa forma (daí o Skills over MCP).

## O que observar a seguir

O modelo sem estado reduz a barreira tanto para implementações de servidor quanto de cliente, o que geralmente significa uma coisa: mais integrações, mais rápido. Fique de olho no suporte ao MCP chegando a mais frameworks de agentes e ferramentas CLI, na adoção da extensão `Tasks` como padrão para lidar com operações de longa duração e no amadurecimento das orientações de segurança para servidores sem estado conforme o ecossistema cresce. O protocolo deixou de ser "coisa da Anthropic" há um tempo — com o MCP 2.0, ele se tornou um padrão genuinamente chato e confiável, e é exatamente isso que infraestrutura deveria ser.

Leia também:

- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Como configurar o Google Search Console junto ao seu agente Hermes]({{< relref "posts/google-search-console-agente-hermes/" >}})
- [GitLost [2026]: Como a Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
