---
date: 2026-06-24T09:45:00-03:00
draft: false
title: "Habilitando o WhatsApp no Hermes Agent self-hosted: três armadilhas (e como passei por elas)"
description: "A saga de plugar o WhatsApp num Hermes Agent rodando em Docker dentro de um LXC no Proxmox: do EACCES no npm ao 'disconnected' fantasma e ao nono dígito brasileiro."
featured_image: ""
categories:
  - tutorial
tags:
  - homelab
  - self-hosting
  - docker
  - proxmox
  - whatsapp
  - ai
---

Eu queria uma coisa simples: mandar mensagem pro meu agente de IA pelo WhatsApp. O
[Hermes Agent](https://github.com/NousResearch/hermes-agent), da Nous Research,
promete exatamente isso — você sobe o gateway e fala com ele pelo Telegram,
Discord, Slack, **WhatsApp**, Signal ou e-mail. Na teoria, é um comando: `hermes
whatsapp`.

Na prática, acabei apanhando até descobrir a alternativa mais simples. Esse
post é o relato honesto de **o que testei, o que não deu certo e o que deu certo**
— com os logs reais. Se você roda o Hermes em Docker (ainda mais dentro de um
container LXC com dados em NAS, como eu), provavelmente vai bater nas mesmas três
armadilhas.

## O setup

- Imagem oficial `nousresearch/hermes-agent:latest`, via Docker Compose.
- O Docker roda dentro de um **LXC não-privilegiado no Proxmox** — o mesmo tipo de
  ambiente sobre o qual já escrevi quando montei [um script pra atualizar o Open
  WebUI num LXC](https://www.lucasaguiar.xyz/posts/script-update-open_webui-lxc/).
- Estado do Hermes (`/opt/data`) mora num share de NAS; o container roda como
  `PUID/PGID=1000`.

Guarde esses dois detalhes — **container roda como uid 1000** e **estado fica em
`/opt/data`** —, porque eles são o pano de fundo das três armadilhas.

## Armadilha 1 — `EACCES` no `npm install`

Rodei o setup e tomei isso na cara:

```text
→ Installing WhatsApp bridge dependencies (this can take a few minutes)...
  ✗ npm install failed:
npm error code EACCES
npm error path /opt/hermes/scripts/whatsapp-bridge/node_modules
npm error Error: EACCES: permission denied, mkdir '/opt/hermes/scripts/whatsapp-bridge/node_modules'
```

**O que eu testei primeiro (e não deu certo):** o instinto é `docker exec` como
root e mandar o `npm install` na mão. Não resolve — e o motivo é elegante. Olhando
o diretório dentro do container:

```text
dr-xr-xr-x 1 0 0  4096 ... /opt/hermes/scripts/whatsapp-bridge
```

Todo o `/opt/hermes` é **somente-leitura, dono `root`**, assado na imagem. Mas tem
um detalhe escondido: o comando `hermes` é um *shim* (`/opt/hermes/bin/hermes`) que
**baixa o privilégio de root pra uid 1000** antes de rodar qualquer coisa — uma
decisão de segurança pra não escrever arquivos como root no volume de dados.
Resultado: o `npm` roda como uid 1000 tentando criar `node_modules` num diretório
`root`-only. Não tem permissão que dê.

**O que deu certo:** já que o caminho do bridge é fixo no código
(`/opt/hermes/scripts/whatsapp-bridge`, não dá pra mover por env), a saída é montar
**só o `node_modules`** num bind-mount gravável e persistente. No
`docker-compose.yaml`:

```yaml
volumes:
  - /mnt/nas/hermes:/opt/data
  # node_modules gravável por cima do dir read-only da imagem
  - /opt/docker/hermes/whatsapp-bridge-node_modules:/opt/hermes/scripts/whatsapp-bridge/node_modules
```

Coloquei o diretório no **disco local** (não no NAS) de propósito: `node_modules` é
dependência reproduzível, não estado precioso, e disco local evita a lentidão e os
problemas de symlink de `node_modules` sobre SMB. `chown 1000:1000` no host,
recriei o container, e instalei como uid 1000.

Aí veio o **segundo `EACCES`**, mais sutil: o `npm install` popula o
`node_modules`, mas no fim tenta **reescrever o `package-lock.json`** — que também
é read-only na imagem. A correção é dizer pro npm não tocar no lockfile:

```bash
npm install --no-package-lock --no-fund --no-audit
# added 143 packages in 8m
```

Detalhe: o bridge usa o [Baileys](https://github.com/WhiskeySockets/Baileys) (a
biblioteca não-oficial de WhatsApp Web), que vem como dependência **direto do
GitHub** — então o container precisa de `git` instalado pra resolver o clone. Por
sorte, tem.

Reparei o QR code, escaneei, `creds.json` gravado. Vitória, né? **Não.**

## Armadilha 2 — o "disconnected" fantasma

O dashboard mostrava o WhatsApp como **disconnected**, e mandar mensagem pra mim
mesmo não respondia nada. Fui nos logs do gateway:

```text
[Whatsapp] Installing WhatsApp bridge dependencies...
[Whatsapp] npm install failed:
[Whatsapp] Disconnecting (external bridge left running)
[Whatsapp] Disconnected
```

Esse loop a cada poucos minutos foi a pista. Acontece que **existem dois
instaladores diferentes**. O wizard `hermes whatsapp` é um. Mas o *gateway* tem o
**próprio launcher** do bridge (`gateway/platforms/whatsapp.py`), que roda um `npm
install --silent` toda vez que sobe — a não ser que encontre um carimbo de "deps já
instaladas":

```python
_dep_stamp = bridge_dir / "node_modules" / ".hermes-pkg-hash"
_deps_fresh = (_dep_stamp.read_text().strip() == sha256(package.json)[:16])
if not _deps_fresh:
    # roda npm install --silent  → morre no package-lock.json read-only
```

Como eu instalei na mão com `--no-package-lock`, esse carimbo nunca foi escrito.
Então o gateway achava que faltava instalar, tentava de novo, batia no mesmo
lockfile read-only e **desconectava em looping**.

**O que deu certo:** escrever o carimbo na mão, com exatamente o hash que o gateway
espera, e reiniciar:

```bash
# .hermes-pkg-hash = primeiros 16 hex do sha256 do package.json
python3 -c "import hashlib,pathlib; \
  bd=pathlib.Path('/opt/hermes/scripts/whatsapp-bridge'); \
  (bd/'node_modules'/'.hermes-pkg-hash').write_text( \
    hashlib.sha256((bd/'package.json').read_bytes()).hexdigest()[:16])"
```

Reiniciei e finalmente:

```text
[Whatsapp] Bridge ready (status: connected)
[Whatsapp] Bridge started on port 3000
```

`/health` retornando `{"status":"connected"}`. **Agora sim foi**, pensei. (Spoiler: ainda não.)

## Armadilha 3 — o nono dígito brasileiro

Bridge conectado, conta pareada… e as mensagens que eu mandava pra mim mesmo
**continuavam sem resposta**. Liguei o log de debug do bridge e vi a verdade:

```json
{"event":"ignored","reason":"self_chat_mode_rejects_non_self",
 "chatId":"5561XXXXXXXX@s.whatsapp.net","senderId":"5561XXXXXXXX@s.whatsapp.net"}
```

As mensagens **chegavam** — e eram **rejeitadas**. Repare no número que o WhatsApp
reportava. No `creds.json` da sessão, o ID da minha conta era:

```text
me.id = +55 61 9•••-••••   (12 dígitos — SEM o nono dígito)
```

Mas no allowlist eu tinha cadastrado meu número como eu disco ele:

```text
allowlist = +55 61 99•••-••••  (13 dígitos — COM o nono dígito)
```

Esse é o famoso **nono dígito**. Desde 2012, o Brasil foi adicionando o `9` na
frente dos celulares, processo concluído nacionalmente em [fevereiro de 2017,
segundo a Anatel](https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito).
O problema: **muitas contas de WhatsApp — sobretudo as registradas há mais tempo —
têm o JID interno *sem* o nono dígito**, mesmo que o número que você disca tenha. O
`@s.whatsapp.net` da minha conta simplesmente não tinha o `9` extra.

No modo *self-chat*, o bridge só processa mensagens cujo remetente bate com a
identidade da conta. Eu comparando `99•••-••••` com `9•••-••••` dava mismatch — e
toda mensagem minha era descartada como "não sou eu".

**O que deu certo:** trocar o número cadastrado para a **versão de 8 dígitos** (sem
o nono), batendo com o JID real. Mensagem mandada, resposta na hora. Fim da saga.

## Resumo: o que não deu × o que deu

| Armadilha | O que NÃO resolveu | O que resolveu |
|---|---|---|
| `EACCES` no npm | `docker exec` como root; instalar no dir da imagem | Bind-mount de `node_modules` gravável + `npm install --no-package-lock` |
| "disconnected" em loop | Reinstalar deps; reparear | Escrever o carimbo `.hermes-pkg-hash` = `sha256(package.json)[:16]` |
| Sem resposta no self-chat | Conferir allowlist com o número "certo" (com o 9) | Usar o número **sem** o nono dígito, como no JID |

## Lições que levo

1. **Imagem read-only + processo não-root = pense em bind-mounts**, não em `chmod`.
   O design da imagem do Hermes é deliberado; brigar com ele é pior que
   acompanhá-lo.
2. **Quando algo "instala em looping", procure o gate.** O carimbo
   `.hermes-pkg-hash` é invisível até você ler o código — e é o tipo de coisa que
   vai me morder de novo no próximo update da imagem (quando o `package.json`
   mudar, terei que refazer o carimbo).
3. **No Brasil, número de telefone é sempre uma pegadinha.** Em qualquer integração
   de WhatsApp/SMS, o nono dígito vai aparecer. Quando a comparação for de
   identidade (allowlist, self-chat), **use a forma que o serviço usa
   internamente**, não a que você disca.

Se você se vira bem com troubleshooting de homelab, talvez goste também do meu
relato de quando o [login do Proxmox parou de
funcionar](https://www.lucasaguiar.xyz/posts/troubleshooting-proxmox-login-interface/)
— outra caçada a uma causa raiz nada óbvia.

Leia também:

- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
