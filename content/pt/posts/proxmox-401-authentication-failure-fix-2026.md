---
date: 2026-08-17T11:16:25-03:00
draft: true
title: "Proxmox 401 'authentication failure': Corrija Erros de Login e API [2026]"
description: "O Proxmox retorna HTTP 401 'authentication failure' no login ou na API? Causas: realm errado, usuário bloqueado, ticket expirado, relógio dessincronizado. Correções com pveum."
featured_image: ""
categories:
  - article
tags:
  - proxmox
  - solucao-de-problemas
  - linux
  - homelab
  - autenticacao
---

Você abre a interface web do Proxmox, digita suas credenciais e nada acontece. O dev tools do navegador mostra um `401` vermelho na aba de rede. Ou pior: seu script de automação que funcionava ontem agora falha com o mesmo código. "authentication failure" é o erro de login mais comum do Proxmox — e na maioria dos casos não é problema de servidor, é um detalhe pequeno de configuração. Veja como diagnosticar e corrigir.

## authentication failure (401)

Esse é o erro exato: a API do Proxmox retorna **HTTP 401** com o corpo **`authentication failure`** sempre que o endpoint de login rejeita suas credenciais. Você vai vê-lo em três lugares:

- **Interface web**: a tela de login mostra `Login failed. Please try again` (versões antigas) ou `Login failed: authentication failure` (versões novas) — a mensagem do servidor embutida na caixa vermelha de erro.
- **Chamadas de API**: `curl` e SDKs recebem `401` com o corpo cru `authentication failure`.
- **Sessões/console**: com cookie ou ticket expirado, a API responde `permission denied - invalid PVE ticket` (e `invalid PVEVNC ticket` para noVNC/console).

A parte frustrante: o servidor entrega deliberadamente a mesma mensagem genérica para senha errada, usuário inexistente e conta bloqueada — então você precisa checar cada causa em ordem.

## Causas mais comuns (por ordem)

| # | Causa | Pista |
|---|---|---|
| 1 | Senha / usuário errados | Troca recente de senha, layout de teclado, caps lock |
| 2 | Usuário não existe no **realm** selecionado | Logar como `root@pve` quando o usuário só existe como `root@pam` (instalações novas criam o root no realm PAM) |
| 3 | Usuário bloqueado após tentativas repetidas | Proxmox 8.x bloqueia automaticamente usuários do realm PVE após muitas falhas |
| 4 | Ticket expirado/inválido | `PVEAuthCookie` velho, restart de serviços, cookie copiado entre máquinas |
| 5 | Relógio dessincronizado (NTP quebrado) | Tickets são assinados com timestamp; relógio errado invalida todos os tickets imediatamente |
| 6 | Token de API mal configurado | Formato de header errado, token expirado, `user@realm` errado |
| 7 | `/etc/pve/access.cfg` ausente/corrompido | Quebra de autenticação no cluster inteiro — veja o [guia aprofundado]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) |

## Como corrigir

**1. Confirme o usuário e o realm**

```bash
pveum user list
```

Instalações novas do Proxmox autenticam `root` via **Linux PAM standard authentication** (`root@pam`). O usuário `root@pve` é um usuário interno separado, que só existe se alguém o criou. No menu suspenso do login, escolha o realm correto — ou entre como `root@pam`.

**2. Desbloqueie um usuário bloqueado**

```bash
pveum user unlock root@pve
```

**3. Redefina a senha de um usuário do realm PVE**

```bash
pveum passwd root@pve
```

**4. Reinicie os frontends web** depois de qualquer mudança de autenticação/configuração:

```bash
systemctl restart pveproxy pvedaemon
```

**5. Corrija o relógio**

O Proxmox 8 usa chrony por padrão. Se o relógio do servidor estiver com offset maior que a validade do ticket, todo login falha:

```bash
systemctl enable --now chrony
systemctl restart chrony
chronyc tracking      # veja o offset
chronyc makestep      # se o offset for grande
```

**6. Tokens de API: confira o formato do header**

O header correto é `Authorization: PVEAPIToken=USER@REALM!TOKENID=SECRET`. Erro comum é omitir o realm ou o separador `!`:

```bash
pveum user token add root@pam mytoken --privsep 0
# imprime o segredo — guarde agora

curl -H "Authorization: PVEAPIToken=root@pam!mytoken=SECRET" \
     https://<host>:8006/api2/json/version
```

**7. Acompanhe o log de autenticação ao vivo** enquanto reproduz a falha:

```bash
journalctl -u pveproxy -f | grep -i authentication
```

Para a variante de cluster (arquivo `/etc/pve/access.cfg` ausente, problemas de corosync), tenho um [passo a passo completo de erros de login na interface web do Proxmox]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) — essa causa é rara, mas catastrófica, e nenhum dos comandos acima resolve.

## Prevenção

- Use tokens de API para automação em vez do endpoint de ticket — tokens são revogáveis e não expiram como tickets. Veja a [documentação oficial de API](https://pve.proxmox.com/wiki/Proxmox_VE_API) e a [man page do pveum](https://pve.proxmox.com/pve-docs/pveum.1.html).
- Mantenha o NTP funcionando (`chronyc tracking` no seu monitoramento).
- Documente a qual realm cada usuário pertence — a maioria dos mistérios de "authentication failure" é confusão de realm.
- Monitore os logs do `pveproxy` em busca de tentativas repetidas (gatilho de bloqueio).

Se ainda estiver travado, estes tópicos da comunidade cobrem o mesmo erro em profundidade: [authentication failure](https://forum.proxmox.com/threads/authentication-failure.178081/) e [API ticket 401 authentication failure](https://forum.proxmox.com/threads/api-ticket-401-authentication-failure.106758/).

Leia também:

- [Erros de Login na Interface Web do Proxmox: Solução Passo a Passo [2026]]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Proxmox Backup Server: instalação via community-scripts e configuração de backups [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como migrar do Proxmox VE 8 para o 9: guia passo a passo [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
