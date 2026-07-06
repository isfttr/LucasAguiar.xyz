---
date: 2026-07-05T10:00:00-03:00
draft: true
title: "Como Rodar Dois Hermes Gateways: Um Remoto e Um Local"
description: "Guia prático para configurar dois profiles do Hermes — um remoto, um local no Mac. Inclui o modelo mental que evita 90% da confusão e todos os problemas que encontrei no caminho."
featured_image: ""
categories:
  - article
tags:
  - hermes
  - agentes-ia
  - auto-hospedagem
  - macos
  - gateway
  - devops
---

# Como Rodar Dois Hermes Gateways: Um Remoto e Um Local

Eu queria uma coisa aparentemente simples: manter meu profile `default` do [Hermes](https://hermes-agent.nousresearch.com/docs/) apontando para a minha instância remota e, ao mesmo tempo, ter um segundo profile — `macbook-local` — rodando **100% no meu Mac**. Alternando entre os dois direto pelo app desktop.

"Simples" durou até eu descobrir que o Hermes tem **várias noções independentes de 'profile ativo' e 'local vs. remoto'**, e que elas não conversam entre si automaticamente. Este post é o guia que eu queria ter tido: primeiro o modelo mental, depois o passo a passo correto e, no fim, todos os problemas que encontrei e como resolvi cada um.

> Ambiente: macOS (Apple Silicon), Hermes Agent v0.17.x, app desktop (Electron). Os caminhos de config do desktop são específicos do macOS; no Linux ficam em `~/.config/hermes/`.

---

## O modelo mental (leia antes de sair configurando)

O erro que quase todo mundo comete (eu inclusive) é achar que "profile" e "local vs. remoto" são uma coisa só. Não são. Existem **quatro peças independentes**:

| Peça | O que controla | Onde mora |
|------|----------------|-----------|
| **Gateway** | Camada de mensageria + cron (WhatsApp, Telegram, jobs agendados). Roda como serviço `launchd`. | `~/Library/LaunchAgents/ai.hermes.gateway-<profile>.plist` |
| **Backend do desktop** | O que o app desktop usa para o chat. Em modo local, o app **sobe o próprio backend** (`hermes dashboard`) numa porta efêmera `127.0.0.1`. Em modo remoto, conecta numa URL. | processo filho do app |
| **Profile ativo do CLI** | Qual profile o terminal usa. | `~/.hermes/active_profile` |
| **Profile ativo do desktop** | Qual profile o **app** usa. **É um arquivo separado** do CLI. | `~/Library/Application Support/Hermes/active-profile.json` |
| **Modo de conexão do desktop** | Se o app roda local ou remoto (global + override por profile). | `~/Library/Application Support/Hermes/connection.json` |

Os dois pontos que mais confundem:

1. **Gateway ≠ backend do desktop.** O *gateway* é o worker de mensageria/cron; ele conecta *para fora* (não abre porta TCP pro desktop). O *backend do desktop* é outra coisa: em modo local, o app sobe um `hermes dashboard` numa porta efêmera. Ou seja, corrigir o gateway **não** faz o desktop virar local — são caminhos diferentes.

2. **O desktop tem o próprio "profile ativo".** Rodar `hermes profile use macbook-local` muda só o CLI. O app desktop lê o *próprio* `active-profile.json`. Se ele não existe, o app cai no `default` — não importa o que o CLI diga.

Guardando essas duas verdades, o resto flui.

### Como a resolução local vs. remoto funciona

O `connection.json` tem esta cara:

```json
{
  "mode": "local",
  "remote": {},
  "profiles": {
    "default": { "mode": "remote", "url": "http://SEU-HOST-REMOTO", "authMode": "oauth" }
  }
}
```

A precedência, **por profile**, é:

1. Override remoto por profile (`profiles[<nome>]`) →
2. Override por env (`HERMES_DESKTOP_REMOTE_URL/_TOKEN`) →
3. `mode: "remote"` global →
4. senão, **local**.

O detalhe crucial (e contraintuitivo): **um override por profile só serve para apontar um profile para o *próprio remoto* dele — ele não consegue forçar um profile a ser local enquanto o `mode` global for `remote`.**

Logo, para ter "uns locais, uns remotos", a receita é:

- `mode` global = **`local`** (esse vira o padrão de todos), e
- cada profile que deve ser **remoto** entra como um **override** em `profiles`.

É por isso que, no meu caso, o `default` (remoto) vira um override e o `macbook-local` (local) simplesmente herda o global.

---

## Passo a passo

Premissa: você já tem o `default` funcionando contra a instância remota e quer **adicionar** o `macbook-local` local.

### 1. Crie o profile local

```bash
hermes profile create macbook-local
# (opcional) clonar config/skills de um profile existente:
#   veja as flags em: hermes profile create --help
```

### 2. Configure o profile para local

```bash
hermes --profile macbook-local config edit
```

O essencial:

```yaml
model:
  # seu modelo/provider locais (ex.: deepseek, ollama, openai-compat...)
  provider: deepseek

terminal:
  backend: local        # executa no seu Mac
  cwd: /caminho/do/seu/projeto

gateway:
  host: 127.0.0.1
  port: 8091            # ver nota abaixo
```

> **Nota sobre a porta:** o `gateway.host/port` é do *gateway de mensageria*. O **backend do desktop** em modo local sobe numa **porta efêmera** própria (`--port 0`), então você **não** precisa se preocupar com a 8091 para a conexão do app. Deixe configurado, mas saiba que não é por ali que o desktop conecta.

Garanta também que as credenciais estão no `.env` do profile:

```bash
hermes --profile macbook-local config env-path   # mostra o caminho do .env
```

### 3. Suba o gateway do profile local — **nunca com `sudo`**

```bash
hermes --profile macbook-local gateway install   # cria o serviço launchd (roda como você)
hermes --profile macbook-local gateway start
hermes --profile macbook-local gateway status     # deve mostrar "running" / LastExitStatus 0
```

> **A regra de ouro:** rode os comandos de gateway **sempre como o seu usuário normal**. Se você usar `sudo` uma única vez, o gateway cria arquivos de runtime (`gateway.lock`, `gateway.pid`, etc.) pertencentes ao `root`, e depois o serviço do seu usuário **nunca mais** consegue subir (detalho isso na seção de problemas). Se cair nessa, a correção também está lá embaixo.

### 4. Configure a conexão do desktop (default remoto + macbook-local local)

Você pode fazer pelo app (**Settings → Gateway**) ou editando o arquivo direto. Pelo arquivo é mais explícito:

```bash
# faça backup antes
cp ~/Library/Application\ Support/Hermes/connection.json \
   ~/Library/Application\ Support/Hermes/connection.json.bak
```

Deixe o `~/Library/Application Support/Hermes/connection.json` assim:

```json
{
  "mode": "local",
  "remote": {},
  "profiles": {
    "default": {
      "mode": "remote",
      "url": "http://SEU-HOST-REMOTO",
      "authMode": "oauth"
    }
  }
}
```

Isso diz: "por padrão, tudo local; **exceto** o `default`, que é remoto". (`authMode` pode ser `oauth` ou `token` — se for `token`, você também guarda o token aqui.)

### 5. Aponte o **desktop** para o profile local

Esse é o passo que quase todo mundo esquece. Crie/edite o `~/Library/Application Support/Hermes/active-profile.json`:

```json
{ "profile": "macbook-local" }
```

Depois que o seletor de profiles aparecer no app (ele só aparece com **2+ profiles** visíveis), você também pode alternar por lá — mas para o app *abrir* no local pela primeira vez, esse arquivo precisa existir.

### 6. Reinicie o app desktop

- **Cmd+Q** no Hermes (feche de verdade — só fechar a janela não basta no macOS).
- Reabra.

> **A primeira inicialização local demora ~30-60s** numa tela de loading: o app recompila a web UI na primeira vez. É normal — deixe terminar.

### 7. Verifique

```bash
# Ambos os profiles visíveis, gateways "running":
hermes profile list

# O gateway local roda como VOCÊ (uid do seu usuário), não root:
ps -eo pid,uid,user,command | grep "profile macbook-local gateway run" | grep -v grep

# Nenhum arquivo do profile pertence ao root:
find ~/.hermes/profiles/macbook-local -user root    # (vazio = ok)
```

No app, você deve ver o **seletor de profiles** com `macbook-local` (local, ativo) e `default` (remoto). Clicar no `default` re-homeia o backend para o remoto; clicar no `macbook-local` sobe o backend local.

---

## Problemas que encontrei (e como resolvi cada um)

Essa é a parte que ninguém documenta. Foram três problemas reais (em cascata) e alguns avisos menores.

### Problema 1 — O gateway local não subia: `PermissionError` no `gateway.lock`

**Sintoma:** o serviço `launchd` do `macbook-local` falhava em toda tentativa e o app caía de volta pro remoto. No log:

```
PermissionError: [Errno 13] Permission denied:
  '.../profiles/macbook-local/gateway.lock'
  at gateway/status.py: is_gateway_runtime_lock_active → get_running_pid → start_gateway
```

**Causa raiz:** em algum momento o gateway tinha sido iniciado com `sudo`. Isso deixou:
- um **processo órfão rodando como `root`** (reparented pro PID 1), e
- 4 arquivos de runtime pertencentes ao `root`: `gateway.lock`, `gateway.pid`, `gateway_state.json`, `channel_directory.json`.

Com o `gateway.lock` pertencendo ao root, o serviço do meu usuário não conseguia nem abrir o arquivo (modo `a+`) para checar se já havia um gateway rodando → `PermissionError` → `exit 1` → `KeepAlive` do launchd ficava batendo em loop → o desktop desistia e ia pro remoto.

**Como resolvi:**

```bash
# 1. Parar o serviço que ficava tentando (e falhando)
hermes --profile macbook-local gateway stop
#    (equivalente: launchctl bootout gui/$UID/ai.hermes.gateway-macbook-local)

# 2. Matar o processo órfão de root (precisa de sudo — é root)
sudo kill <PID_DO_PROCESSO_ROOT>

# 3. Devolver os arquivos de runtime ao seu usuário (ou apagá-los; são recriados)
sudo chown $USER:staff ~/.hermes/profiles/macbook-local/gateway.lock \
                       ~/.hermes/profiles/macbook-local/gateway.pid \
                       ~/.hermes/profiles/macbook-local/gateway_state.json \
                       ~/.hermes/profiles/macbook-local/channel_directory.json

# 4. Limpar lock/pid/state obsoletos (apontam pro processo já morto)
rm -f ~/.hermes/profiles/macbook-local/gateway.lock \
      ~/.hermes/profiles/macbook-local/gateway.pid \
      ~/.hermes/profiles/macbook-local/gateway_state.json

# 5. Subir de novo, como usuário normal
hermes --profile macbook-local gateway start
```

Resultado: gateway rodando com o meu uid, `gateway.lock`/`gateway.pid` recriados com a posse certa, `PermissionError` extinto.

**Prevenção:** **nunca** rode `hermes ... gateway ...` com `sudo`. Foi a causa de tudo.

> Dica: você consegue apagar os arquivos de root **sem sudo** se o diretório-pai é seu (o `rm` depende da permissão de escrita no diretório, não da posse do arquivo). O `sudo` só é realmente necessário para **matar o processo root**.

### Problema 2 — Mesmo com o gateway ok, o desktop continuava no remoto

**Sintoma:** gateway local 100% saudável, mas o `desktop.log` insistia:

```
[boot] Connecting to remote Hermes backend at http://SEU-HOST-REMOTO
[boot] Remote Hermes backend is ready
```

**Causa raiz:** o "local vs. remoto" do app **não vem do gateway** — vem do `connection.json`, que estava com `mode: "remote"`. Consertar o gateway não muda esse arquivo. São caminhos independentes (lembra do modelo mental?).

**Como resolvi:** troquei o `connection.json` para `mode: "local"` global, com o `default` como **override remoto** (exatamente o JSON do Passo 4). Aí o `macbook-local` passa a herdar o `local`.

### Problema 3 — Depois de virar local, o desktop só mostrava o profile `default`

**Sintoma:** reiniciei o app e... só aparecia o `default`. O `macbook-local` funcionava no CLI, mas **nem aparecia** no seletor do app.

**Causa raiz:** duas coisas se somaram:
- O app usa o **próprio** `active-profile.json`, que **não existia** → o app abriu no `default`.
- Como o `default` é remoto (pelo meu override), o app conectava no servidor remoto, que só expõe o `default`. E o seletor de profiles do app **fica escondido quando há menos de 2 profiles visíveis**.

Ou seja: o app estava no profile errado (`default`/remoto), então nem chegava a enxergar o `macbook-local` local.

**Como resolvi:** criei o `~/Library/Application Support/Hermes/active-profile.json` com `{ "profile": "macbook-local" }` (Passo 5). Aí o app abre no `macbook-local`, sobe o backend local, e o `/api/profiles` local enumera **os dois** profiles → o seletor aparece.

> Antes de pedir mais um restart, eu ainda "testei em seco" o backend local com
> `hermes --profile macbook-local dashboard --no-open --host 127.0.0.1 --port 0`
> e confirmei o sinal `HERMES_DASHBOARD_READY port=<n>`. Vale o hábito: valide o backend isolado antes de reiniciar o app.

### Problemas menores (não-bloqueantes)

Apareceram nos logs, mas **não** impediam o setup local — deixo registrado para você não se assustar:

- **WhatsApp bridge falhando** (`Bridge process died (exit code 1)`): plataforma de mensageria com problema de conexão/credencial. O gateway segue rodando ("continue for cron job execution").
- **MCP `composio` com `401 Unauthorized`**: token do MCP expirado. Não afeta o gateway nem o backend local.
- **`kanban dispatcher lock` já detido por outro gateway**: como eu deixei os **dois** gateways rodando (default + local), o do `default` segurava o lock do dispatcher de kanban. Se você quiser que o local seja o "dono", basta parar o gateway do outro profile (`hermes gateway stop`) — mas é opcional.

---

## Lições que eu levo

1. **Separe os conceitos.** No Hermes há *quatro* coisas independentes: gateway (mensageria/cron), backend do desktop (chat), profile ativo do CLI e profile ativo do desktop — além do modo de conexão. Metade da confusão some quando você para de tratá-los como um só.
2. **Gateway ≠ backend do desktop.** O gateway não abre porta pro app; o backend local do app é um `hermes dashboard` em porta efêmera.
3. **O desktop tem o próprio `active-profile.json`.** `hermes profile use` no CLI não muda o app.
4. **Para "uns local, uns remoto": global `local` + overrides remotos.** Override por profile não força local sobre um global remoto.
5. **Nunca `sudo` no gateway.** A causa raiz de tudo foram arquivos de runtime pertencentes ao root.

---

## Conclusão

No fim, o setup ideal ("`default` remoto, `macbook-local` local, alternando pelo app") são só **três arquivos** bem configurados — `connection.json`, `active-profile.json` e o `config.yaml` do profile — mais o serviço de gateway subindo como o seu usuário. O que transformou isso numa saga foi tratar peças independentes como se fossem uma. Espero que este guia te poupe as idas e vindas que eu tive.

Se este post te ajudou (ou se você caiu no mesmo `PermissionError`), me conta.

Leia também:

- [Habilitando o WhatsApp no Hermes Agent self-hosted: três armadilhas (e como passei por elas)]({{< relref "posts/configuracao-whatsapp-hermes/" >}})
- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
