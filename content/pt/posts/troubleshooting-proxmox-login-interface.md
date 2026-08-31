---
date: 2025-03-13T23:29:45-03:00
draft: false
title: "Proxmox Login Falhou? Corrija o Erro 'authentication failure' 401 [2026]"
description: "Proxmox login falhou com 'authentication failure 401'? Corrija realm errado, usuário bloqueado, ticket expirado, relógio dessincronizado ou access.cfg ausente. Guia [2026]."
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-proxmox-login-error.png
categories:
- tutorial
tags:
- linux
- proxmox
- troubleshooting
- tutorial
- autenticacao
aliases:
  - /pt/posts/fix-proxmox-web-interface-login-errors/
---

Você abre a interface web do Proxmox, digita suas credenciais e nada acontece. O dev tools do navegador mostra um `401` vermelho na aba de rede. Ou pior: seu script de automação que funcionava ontem agora falha com o mesmo código. "authentication failure" é o erro de login mais comum do Proxmox — e na maioria dos casos não é problema de servidor, é um detalhe pequeno de configuração. Este guia cobre todas as causas comuns, de um realm errado a um arquivo de cluster ausente.

## O que significa "authentication failure (401)"

A API do Proxmox retorna **HTTP 401** com o corpo **`authentication failure`** sempre que o endpoint de login rejeita suas credenciais. Você vai vê-lo em três lugares:

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
| 7 | `/etc/pve/access.cfg` ausente/corrompido | Quebra de autenticação no cluster inteiro — veja o caso de cluster abaixo |

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

O header correto é `Authorization: PVEAPITOKEN=user@realm!tokenid=SECRET`. Erro comum é omitir o realm ou o separador `!`:

```bash
pveum user token add root@pam mytoken --privsep 0
# imprime o segredo — guarde agora

curl -H "Authorization: PVEAPITOKEN=root@pam!mytoken=SECRET" \
     https://<host>:8006/api2/json/version
```

**7. Acompanhe o log de autenticação ao vivo** enquanto reproduz a falha:

```bash
journalctl -u pveproxy -f | grep -i authentication
```

## O caso raro de cluster: /etc/pve/access.cfg ausente

Se nenhum dos comandos acima resolver, a causa raiz pode ser um arquivo `/etc/pve/access.cfg` ausente — essencial para a autenticação de usuários, provavelmente devido a problemas de comunicação no `corosync`. É raro, mas catastrófico, e quebra o login de todo o cluster.

### Investigação

1. **Status dos Serviços:** Verificado o status dos serviços `pve-cluster` e `pveproxy`, que estavam em execução.
2. **Logs:** Examinados logs para erros relacionados a atualizações do banco de dados RRD.
3. **Configuração de Autenticação:** Verificado `/etc/pve/user.cfg`.
4. **Arquivo de Configuração Ausente:** Descoberto que `/etc/pve/access.cfg` estava ausente.

```bash
# 1. Verifique o status dos serviços
systemctl status pve-cluster
systemctl status pveproxy

# 2. Verifique os logs em busca de erros
journalctl -u pveproxy -n 100
journalctl -u pve-cluster -n 100

# 3. Verifique a configuração de autenticação
cat /etc/pve/user.cfg
ls -la /etc/pve/user.cfg

# 4. Verifique se o access.cfg está ausente
ls -la /etc/pve/access.cfg
```

### Solução

1. **Reiniciou o serviço `pve-cluster`:** parou e iniciou para tentar restabelecer a conectividade do cluster.
2. **Forçou quórum:** `pvecm expected 1` em configuração de nó único restabelece a liderança do cluster.
3. **Criou o `access.cfg`:** criou manualmente o arquivo com conteúdo mínimo.
4. **Reiniciou o `pveproxy`:** forçou o reconhecimento do novo arquivo.

```bash
# 1. Reinicie o serviço pve-cluster
systemctl stop pve-cluster
systemctl start pve-cluster

# 2. Force o quórum em configuração de nó único
pvecm expected 1

# 3. Crie um access.cfg mínimo
cat > /etc/pve/access.cfg << 'EOF'
acl:1
path /
role Administrator
user root@pam
EOF

chmod 0640 /etc/pve/access.cfg
chown root:www-data /etc/pve/access.cfg

# 4. Reinicie o serviço pveproxy
systemctl restart pveproxy
```

Depois desses passos, os usuários conseguiram acessar a interface web do Proxmox com sucesso.

## Prevenção

- **Use tokens de API para automação** em vez do endpoint de ticket — tokens são revogáveis e não expiram como tickets. Veja a [documentação oficial de API](https://pve.proxmox.com/wiki/Proxmox_VE_API) e a [man page do pveum](https://pve.proxmox.com/pve-docs/pveum.1.html).
- **Mantenha o NTP funcionando** (`chronyc tracking` no seu monitoramento).
- **Documente a qual realm cada usuário pertence** — a maioria dos mistérios de "authentication failure" é confusão de realm.
- **Monitore os logs do `pveproxy`** em busca de tentativas repetidas (gatilho de bloqueio).
- **Faça backup do `/etc/pve` regularmente** para que um `access.cfg` ausente possa ser restaurado rapidamente.
- **Desligue os nós de forma graciosa** — queda abrupta de energia pode corromper a configuração do cluster.
- **Mantenha o Proxmox atualizado** e revise permissões em `/etc/pve` com cuidado.

Se ainda estiver travado, estes tópicos da comunidade cobrem o mesmo erro em profundidade: [authentication failure](https://forum.proxmox.com/threads/authentication-failure.178081/) e [API ticket 401 authentication failure](https://forum.proxmox.com/threads/api-ticket-401-authentication-failure.106758/).

Leia também:

- [Como migrar do Proxmox VE 8 para 9: passo a passo]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})
- [Proxmox Backup Server: instalação via community-scripts]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como instalar o Proxmox VE no Mac Mini 2018 (T2 chip)]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
