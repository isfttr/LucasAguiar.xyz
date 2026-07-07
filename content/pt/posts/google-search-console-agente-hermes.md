---
date: 2026-07-07T01:51:48Z
draft: false
title: "Como configurar o Google Search Console junto ao seu agente Hermes"
description: "Passo a passo para conectar o Google Search Console ao agente Hermes via MCP: service account, o servidor gsc-mcp e os ajustes necessários para rodar dentro do Docker."
featured_image: ""
categories:
  - tutorial
tags:
  - technology
  - artificial-intelligence
  - self-hosting
  - homelab
  - docker
  - mcp
---

Eu já acompanhava o **Google Search Console** há um tempo, mas o fluxo era manual e chato: abrir o painel, copiar as queries, colar no meu agente. Dá pra fazer bem melhor. Neste tutorial mostro como conectar o Search Console direto ao **Hermes** — o agente de IA que roda no meu homelab — usando um servidor **MCP**, para que ele leia cliques, impressões e queries **via API**. Vou cobrir tanto o que o repositório do criador já entrega pronto quanto os ajustes que precisei fazer para rodar tudo dentro do Docker, que é onde a documentação oficial para de te ajudar.

## O que é MCP e o que o gsc-mcp entrega

O [Model Context Protocol (MCP)](https://modelcontextprotocol.io) é um padrão aberto para dar "ferramentas" a agentes de IA — cada servidor MCP expõe funções que o agente pode chamar. Para o Search Console existe o [`google-search-console-mcp`](https://github.com/ncosentino/google-search-console-mcp), do **Nick Cosentino** (Dev Leader), sob licença MIT.

O que me fez escolher esse projeto:

- **Binários self-contained**, com *"zero runtime dependencies"* — há builds em Go e em C# (Native AOT) para Linux, macOS e Windows na [página de Releases](https://github.com/ncosentino/google-search-console-mcp/releases/latest). Ou seja: **você não precisa instalar Go nem Node** para rodar. Baixa o executável e pronto.
- **Três ferramentas, todas de leitura**: `list_sites` (lista as propriedades acessíveis), `list_sitemaps` (sitemaps enviados e status) e `query_search_analytics` (cliques, impressões, CTR e posição média — com dimensões como query, página, país e device, até 25 mil linhas e 16 meses de histórico).
- A [API do Search Console é gratuita](https://github.com/ncosentino/google-search-console-mcp): *"No billing account is required."*

Como só há ferramentas de leitura, não há risco de o agente alterar algo na sua conta — um detalhe que me deixou tranquilo para plugar no assistente.

## Pré-requisitos no Google

Essa parte é igual para qualquer client MCP e está bem descrita no [README do projeto](https://github.com/ncosentino/google-search-console-mcp):

1. No [Google Cloud](https://console.cloud.google.com), crie/selecione um projeto e **habilite a Google Search Console API**.
2. Em **IAM & Admin → Service Accounts**, crie uma *service account* e gere uma **chave JSON** (baixe o arquivo).
3. Abra o JSON e copie o campo `client_email` (algo como `gsc-mcp@seu-projeto.iam.gserviceaccount.com`).
4. No [Google Search Console](https://search.google.com/search-console), vá em **Configurações → Usuários e permissões → Adicionar usuário**, cole esse e-mail e dê permissão de leitura, **para cada propriedade** que o agente deve acessar.

Detalhe importante: propriedades de domínio usam o formato `sc-domain:exemplo.com` (e não `https://www.exemplo.com/`). Se errar aqui, o `list_sites` volta vazio.

## Onde a documentação para e o Hermes começa

Todos os exemplos do repositório miram **clients de desktop** — Claude Desktop, Cursor, VS Code. Neles, o binário mora no seu disco e o próprio client o executa como subprocesso. Simples.

O [Hermes](https://github.com/NousResearch/hermes-agent), quando você o roda self-hosted, vive **dentro de um container Docker**. E é o Hermes que lança o servidor MCP (via *stdio*) como um subprocesso — **dentro do container**. Isso muda três coisas:

- O binário **e** a chave JSON precisam existir *no sistema de arquivos do container* — não adianta deixá-los só no host.
- Os caminhos no `config.yaml` têm que ser os caminhos **de dentro** do container.
- O Hermes roda como usuário não-root (uid `1000` na minha imagem), então o binário precisa ser executável e a chave legível por esse usuário — sem vazar a chave para onde não deve.

Nada disso está no README, porque o README assume o cenário desktop. Foi aqui que gastei meu tempo.

## Passo a passo (com os ajustes para Docker)

**1. Baixe o binário e tenha a chave.** Peguei o `gsc-mcp-go-linux-amd64` da [página de releases](https://github.com/ncosentino/google-search-console-mcp/releases/latest) e o `service-account.json` do passo anterior.

**2. Coloque tudo em disco local e ajuste permissões.** Guardo numa pasta ao lado do meu `docker-compose.yaml` (disco local, **não** em armazenamento compartilhado — mais sobre isso na seção de segurança):

```bash
mkdir -p gsc-mcp
mv gsc-mcp-go-linux-amd64 service-account.json gsc-mcp/
chown -R 1000:1000 gsc-mcp                     # = usuário do Hermes no container
chmod 755 gsc-mcp/gsc-mcp-go-linux-amd64       # executável
chmod 600 gsc-mcp/service-account.json         # só o dono lê a chave privada
```

**3. Monte a pasta no container (read-only).** No serviço do Hermes, dentro de `volumes:`:

```yaml
    volumes:
      # ... seus volumes existentes ...
      - ./gsc-mcp:/opt/gsc-mcp:ro
```

**4. Registre o servidor MCP no `config.yaml`.** O Hermes lê servidores MCP no bloco de topo [`mcp_servers`](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp). Note que os caminhos são os **de dentro** do container:

```yaml
mcp_servers:
  search-console:
    command: /opt/gsc-mcp/gsc-mcp-go-linux-amd64
    args: []
    env:
      GOOGLE_SERVICE_ACCOUNT_FILE: /opt/gsc-mcp/service-account.json
```

**5. Recrie o container.** Como adicionei um *volume novo*, um simples reload não basta — precisa recriar:

```bash
docker compose up -d
```

(Para mudanças **só** no `config.yaml`, sem volume novo, o Hermes tem hot-reload: basta rodar `/reload-mcp` numa sessão de chat, sem reiniciar nada.)

## Confie, mas verifique

Antes de sair usando, vale confirmar em três camadas — isso separa "problema no Google" de "problema no Hermes":

1. **O binário roda no container:** `docker exec hermes /opt/gsc-mcp/gsc-mcp-go-linux-amd64 --help`.
2. **O Hermes registrou as ferramentas:** nos logs deve aparecer algo como `MCP server 'search-console' (stdio): registered 3 tool(s)`.
3. **A API responde:** peça ao agente para rodar `list_sites`. O retorno tem esta cara:

```json
{"sites":[{"siteUrl":"sc-domain:exemplo.com","permissionLevel":"siteFullUser"}]}
```

Se vier **vazio** ou com erro de permissão, o problema quase sempre é o passo 4 dos pré-requisitos (a service account não foi adicionada na propriedade) — não é o Hermes. Dica de quem apanhou: dá para testar o binário **sozinho**, mandando um handshake MCP por `stdin` (`initialize` → `tools/call` `list_sites`), isolando o Google do agente antes de culpar a integração.

## Segurança: onde NÃO guardar a chave

O `service-account.json` é uma **chave privada**. Dois cuidados que valem o post inteiro:

- **Não** coloque a chave num volume compartilhado que outros containers/serviços montam — mantenha em **disco local**, montado como `:ro`, com `chmod 600`.
- **Nunca** faça commit dela. Adicione a pasta ao `.gitignore`:

```gitignore
gsc-mcp/
```

Parece óbvio, mas é exatamente o tipo de arquivo que acaba num repositório público por descuido.

## Conclusão

Com isso, o mesmo agente que montei quando [criei meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}}) agora responde sozinho a perguntas como *"quais queries trouxeram mais cliques nos últimos 28 dias?"* — puxando os dados direto da API, sem eu copiar e colar nada. Por serem ferramentas somente-leitura, é seguro deixar ligado no dia a dia, e qualquer ajuste futuro entra com um `/reload-mcp`.

Conectar dados reais (Search Console, analytics, o que for) via MCP é o pulo do gato que transforma um chatbot num assistente que realmente conhece o *seu* contexto.

Leia também:

- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})

Você pode entrar em contato comigo sobre este ou outros tópicos pelo meu e-mail <contact@lucasaguiar.xyz>.
