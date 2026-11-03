---
date: 2026-11-03T18:02:36.000Z
draft: true
title: 'Auditar Plugins de IA nas Suas Ferramentas de Desenvolvedor: Um Guia Prático [2026]'
description: Postman instalou automaticamente os plugins Codex e Claude e alterou as configurações globais. Aqui está como auditar plugins de IA, servidores MCP e ganchos de agente nas suas ferramentas de desenvolvimento antes (ou depois) que alterem a sua configuração.
featured_image: ''
categories:
  - article
tags:
  - ai
  - security
  - dev-tools
  - mcp
  - privacidade
slug: auditar-plugins-ia-ferramentas-desenvolvedor
translation_source_hash: 52a52230157c51d27a3bce037fc30f99881dc20e15492fab6c3d33174d0fe8ad
---
No final de outubro de 2026, uma [issue do GitHub](https://github.com/postmanlabs/postman-app-support/issues/14370) no rastreador do Postman viralizou: abrir o aplicativo de desktop Postman instalou silenciosamente os plugins Codex e Claude, editou configurações globais de agentes, confiou em seus próprios hooks de inicialização e apontou uma conexão MCP remota para `mcp.postman.com` — tudo sem uma autorização explícita do usuário. O relatório registrou 157 pontos no [Hacker News](https://news.ycombinator.com/item?id=50354960) em menos de um dia.

Independentemente de todas as alegações desse relatório serem válidas, é um sinal de alerta concreto para qualquer pessoa que utilize agentes de codificação de IA em 2026: suas ferramentas de desenvolvimento agora vêm com **plugins de IA que podem modificar toda a sua configuração de agente**, e o limite de consentimento é frequentemente mais tênue do que você pensa. Este guia mostra como auditar o que realmente está instalado em suas ferramentas, onde essas alterações residem no disco e como controlá-las antes que elas controlem seu fluxo de trabalho.

## Por que isso importa: o plugin mudou mais do que a si mesmo

O caso Postman vale a pena ser dissecado porque mostra o raio de impacto de uma única "integração de IA". De acordo com a [issue](https://github.com/postmanlabs/postman-app-support/issues/14370), o incidente envolveu:

- Um **plugin Postman para todo o usuário** e um Postman CLI instalado separadamente
- Um **hook de instrução de inicialização** que instruiu o agente a carregar uma habilidade `postman:api-engineer` para qualquer "tarefa de engenharia de API não trivial"
- Um **plugin Claude Code** mais uma **conexão MCP** remota para `mcp.postman.com/mcp`
- O instalador tentando **aprovar seu próprio hook** (`trusted_hash`) na configuração do agente

O ponto chave não é o fornecedor específico — é a **classe de comportamento**. Um cliente de API, um editor de código ou uma extensão de IDE podem, em princípio, gravar em configurações que todo agente de codificação que você executa então confia. Isso transforma uma ferramenta de produtividade em uma superfície de ataque para injeção de prompt, exfiltração de credenciais através de servidores MCP e alterações silenciosas na forma como seus agentes se comportam.

## Onde os plugins de IA se escondem em uma pilha de agentes moderna

Antes de auditar, você precisa saber onde a configuração reside. Os caminhos diferem por ferramenta, mas as categorias são consistentes:

| Camada | O que reside lá | Local típico (macOS/Linux) |
|---|---|---|
| Configuração global do agente | Possui plugins, marketplaces, hooks | `~/.codex/config.toml`, `~/.claude/settings.json` |
| Plugins instalados | Registro de plugins habilitados | `~/.claude/plugins/installed_plugins.json` |
| Servidores MCP | Definições de servidor remoto/local | `~/.codex/mcp.json`, `~/.claude.json` |
| Hooks / comandos | Instruções de inicialização injetadas em cada sessão | `hooks/` dentro do diretório do plugin |
| CLIs / binários | Executáveis autônomos | `~/.local/bin` |

Obtenha uma visão completa do que mudou recentemente em sua máquina e do que está registrado nessas configurações de agente.

## Passo 1: crie um snapshot de suas configurações de agente antes que mudem novamente

O hábito mais valioso é um **baseline**. Antes de instalar qualquer coisa, salve uma cópia de cada configuração de agente que você considera importante:

```bash
mkdir -p ~/agent-config-backup/$(date +%F)
for f in ~/.codex/config.toml ~/.claude/settings.json ~/.codex/mcp.json ~/.claude.json; do
  [ -f "$f" ] && cp "$f" ~/agent-config-backup/$(date +%F)/
done
```

Depois de ter um baseline, um `diff` após qualquer atualização de ferramenta lhe dirá exatamente o que a atualização tocou. Sem um baseline, você está fazendo arqueologia forense — com um, você detecta mudanças em segundos.

## Passo 2: liste o que seus agentes realmente carregam

Não confie na interface do usuário. Leia os arquivos de configuração diretamente. Para o Codex:

```bash
# What plugins and marketplaces are enabled?
grep -A5 "\[plugins\.\]" ~/.codex/config.toml 2>/dev/null
grep -A5 "\[marketplaces\.\]" ~/.codex/config.toml 2>/dev/null
```

Para o Claude Code, verifique as configurações e o registro de instalação:

```bash
cat ~/.claude/settings.json 2>/dev/null
cat ~/.claude/plugins/installed_plugins.json 2>/dev/null
```

Para **qualquer** ferramenta, liste os servidores MCP definidos:

```bash
cat ~/.codex/mcp.json 2>/dev/null; echo "---"; cat ~/.claude.json 2>/dev/null | python3 -m json.tool | grep -i "mcp"
```

Qualquer coisa que você não adicionou explicitamente é candidata à remoção. Em particular, desconfie de `mcpServers` apontando para domínios remotos que você não reconhece — um servidor MCP remoto é uma conexão de rede ativa do seu agente para terceiros.

## Passo 3: inspecione hooks e instruções de inicialização

Hooks são o primitivo mais perigoso porque são executados **em cada inicialização de sessão** e podem injetar instruções que o agente tratará como contexto. No caso do Postman, o hook instalado continha um arquivo de contexto de inicialização de sessão instruindo o agente a carregar uma habilidade do Postman para qualquer tarefa de API.

Verifique quais hooks estão registrados:

```bash
grep -rn "hooks\." ~/.codex/config.toml 2>/dev/null
ls -la ~/.claude/hooks 2>/dev/null
```

Se um plugin registrou um hook que você não aprovou, remova a entrada do hook da configuração do agente e desinstale o plugin que o criou. Nunca permita que um plugin auto-aprove seu próprio `trusted_hash` — a decisão de confiança pertence a você, no host do agente.

## Passo 4: remova qualquer coisa que você não tenha optado por instalar

Para cada peça indesejada, remova-a na fonte:

1.  **Desinstale o plugin** do host do agente (por exemplo, `codex plugin uninstall <name>` ou através do gerenciador de plugins do Claude)
2.  **Remova a entrada do marketplace** se o plugin veio de um
3.  **Exclua a definição do servidor MCP** de `mcp.json` / `.claude.json` para que o agente pare de fazer chamadas externas
4.  **Restaure a configuração** do seu baseline se o aplicativo adicionar entradas novamente

No caso do Postman, a [resolução solicitada](https://github.com/postmanlabs/postman-app-support/issues/14370) foi um caminho completo de rollback cobrindo configurações de agente, confiança de hook, marketplaces, caches, conexões MCP e o CLI — e recusando a reinstalação sem ação explícita. Aplique o mesmo padrão a qualquer ferramenta que se introduza em seus agentes.

## Passo 5: torne os limites de consentimento explícitos daqui para frente

Você não pode auditar para evitar todas as surpresas futuras, então projete o limite com antecedência:

-   **Trate servidores MCP remotos como terceiros em rede.** Conecte agentes apenas a servidores MCP que você controla ou confia explicitamente. Um servidor MCP remoto pode ler o mesmo contexto de conversa que seu agente vê — o que frequentemente inclui segredos.
-   **Execute agentes de codificação de IA em sandbox.** Dê ao agente apenas o acesso à rede e ao sistema de arquivos de que ele precisa. Você pode reutilizar a abordagem em nosso [guia de sandbox para agentes de codificação de IA]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}}).
-   **Observe o que cruza a rede.** Se uma ferramenta insiste em se comunicar com servidores externos, inspecione o tráfego antes de confiar nela — consulte nosso [guia de segurança da API LLM]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}}) para saber como inspecionar o tráfego de IA em sua própria máquina.
-   **Fixe as atualizações e leia os changelogs.** As atualizações automáticas são como muitas dessas integrações chegam. Desative as atualizações silenciosas para ferramentas que interagem com as configurações do seu agente e revise as notas de lançamento para qualquer coisa rotulada como "IA" ou "agente".

## O aprendizado prático

O relatório do Postman não é um motivo para abandonar os agentes de codificação de IA — é um lembrete de que **sua configuração de agente agora é um limite de confiança**, e os fornecedores de ferramentas nem sempre a respeitam em seu nome. Um backup de baseline, o hábito de ler arquivos de configuração em vez de confiar na interface do usuário e uma política rigorosa sobre servidores MCP remotos o manterão no controle.

Se você está construindo esses fluxos de trabalho para seu próprio uso, a mesma disciplina se aplica ao [software pessoal na era da IA]({{< relref "posts/personal-software-ai-guide-2026/" >}}) — as ferramentas são tão confiáveis quanto a configuração que você permite que elas escrevam.

Leia também:

- [Como Executar Agentes de Codificação de IA com Segurança: Um Guia Prático de Sandbox [2026]]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}})
- [Segurança da API LLM em 2026: Como Inspecionar o Tráfego de IA e Proteger Suas Chaves]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros tópicos em <contact@lucasaguiar.xyz>
