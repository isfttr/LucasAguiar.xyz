---
date: 2025-03-13T23:29:45-03:00
draft: false
title: "Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo"
description:
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-proxmox-login-error.png
categories:
- tutorial
tags:
- linux
- proxmox
- troubleshooting
- tutorial
---


Este artigo detalha o processo de diagnóstico de uma falha de autenticação em um cluster Proxmox que impedia os usuários de acessar a interface web. A causa raiz foi identificada como um arquivo `/etc/pve/access.cfg` ausente, essencial para a autenticação de usuários, provavelmente devido a problemas de comunicação no `corosync`. O problema foi resolvido reiniciando o serviço `pve-cluster`, forçando quórum, criando manualmente um arquivo `access.cfg` mínimo e reiniciando o serviço `pveproxy`. As medidas preventivas incluem verificações regulares de integridade do cluster, backups automatizados de arquivos de configuração, garantia de procedimentos adequados de desligamento, manutenção da estabilidade da rede, monitoramento de integridade do armazenamento, aplicação de atualizações do Proxmox e gerenciamento cuidadoso de permissões.

## Investigação Inicial

1. **Status dos Serviços:** Verificado o status dos serviços `pve-cluster` e `pveproxy`, que estavam em execução.
2. **Logs:** Examinados logs para erros relacionados a atualizações do banco de dados RRD.
3. **Configuração de Autenticação:** Verificado `/etc/pve/user.cfg`.
4. **Arquivo de Configuração Ausente:** Descoberto que `/etc/pve/access.cfg` estava ausente.
5. **Interferência do Firewall:** Suspeita de que regras de firewall do Tailscale pudessem estar interferindo. Tentativa de ajuste do iptables.

Aqui estão os comandos usados durante a investigação:

```bash
# 1. Verificar status dos serviços
systemctl status pve-cluster
systemctl status pveproxy

# 2. Verificar logs para erros
journalctl -u pveproxy -n 100
journalctl -u pve-cluster -n 100
tail -n 100 /var/log/pveproxy/access.log

# 3. Verificar configuração de autenticação
cat /etc/pve/user.cfg
ls -la /etc/pve/user.cfg

# 4. Verificar access.cfg ausente
ls -la /etc/pve/access.cfg
file /etc/pve/access.cfg

# 5. Verificar regras de firewall e status do Tailscale
iptables -L -n -v
tailscale status
systemctl status tailscaled
```

## Análise da Causa Raiz

A causa principal do problema de login foi a ausência do arquivo `/etc/pve/access.cfg`. Esse arquivo é essencial para a autenticação de usuários no Proxmox. Sua ausência indicava um problema potencial com a configuração do cluster Proxmox, possivelmente relacionado ao serviço `corosync`.

Uma investigação mais aprofundada revelou problemas com conectividade do `corosync` e permissões relacionadas ao `pve-ha-lrm`. Embora o `corosync` estivesse em execução, erros indicavam problemas de comunicação dentro do cluster. O arquivo `/etc/pve/access.cfg` não estava sendo gerado ou preenchido automaticamente, levando a falhas de autenticação.

A verificação do sistema de arquivos em `/etc/pve` mostrou ser um sistema de arquivos FUSE, tornando problemas de armazenamento subjacentes menos prováveis e concentrando a investigação na própria configuração do cluster.

## Solução

As seguintes etapas foram tomadas para resolver o problema:

1. **Reiniciado o serviço `pve-cluster`:** Parado e iniciado o serviço `pve-cluster` para tentar restabelecer a conectividade do cluster.
2. **Forçado o Quórum:** Esta etapa potencialmente ajudou a restabelecer a liderança do cluster.
3. **Criado o arquivo `access.cfg`:** Criado manualmente o arquivo `/etc/pve/access.cfg` com conteúdo mínimo.
4. **Reiniciado o serviço `pveproxy`:** Reiniciado o serviço `pveproxy` para forçá-lo a reconhecer o arquivo `access.cfg` recém-criado.

Aqui estão os comandos usados para implementar a solução:

```bash
# 1. Reiniciar o serviço pve-cluster
systemctl stop pve-cluster
systemctl start pve-cluster
systemctl status pve-cluster

# 2. Forçar quórum em uma configuração de nó único
pvecm expected 1

# 3. Criar arquivo access.cfg mínimo
cat > /etc/pve/access.cfg << 'EOF'
acl:1
path /
role Administrator
user root@pam
EOF

chmod 0640 /etc/pve/access.cfg
chown root:www-data /etc/pve/access.cfg

# 4. Reiniciar o serviço pveproxy
systemctl restart pveproxy
systemctl status pveproxy
```

Após essas etapas, os usuários conseguiram fazer login na interface web do Proxmox com sucesso.

## Notas Adicionais

- Se o login ainda falhar após essas etapas, pode ser necessária uma investigação adicional sobre as permissões de usuário e o conteúdo do `access.cfg`. As ferramentas de linha de comando `pveum` podem ser usadas para gerenciar usuários e permissões.

## Medidas Preventivas

Prevenir o erro de "Falha de Autenticação do Proxmox por Ausência de Arquivo de Configuração do Cluster" envolve garantir a estabilidade e o funcionamento adequado do cluster Proxmox e seus arquivos de configuração. Aqui estão algumas estratégias:

1. **Verificações Regulares de Integridade do Cluster:**

  - Implemente monitoramento automatizado da integridade do cluster Proxmox, incluindo verificações de:
  - Status de quórum do Corosync: Garanta que o cluster mantenha um quórum para evitar inconsistências de configuração.
  - Status dos serviços: Monitore o status de serviços críticos como `pve-cluster`, `pveproxy`, `corosync`, `pve-ha-lrm` e `pve-ha-crm`.
  - Análise de logs: Verifique regularmente os logs para erros ou avisos relacionados à comunicação do cluster, autenticação e armazenamento.

2. **Backups de Arquivos de Configuração:**

  - Automatize backups regulares do diretório `/etc/pve`. Isso permite a restauração rápida dos arquivos de configuração em caso de exclusão acidental ou corrupção.

3. **Procedimentos Adequados de Desligamento:**

  - Garanta que todos os nós do Proxmox sejam desligados adequadamente. Evite desligamentos abruptos ou quedas de energia, pois podem levar à corrupção de dados ou inconsistências de configuração.

4. **Estabilidade da Rede:**

  - Mantenha uma conexão de rede estável e confiável entre os nós do Proxmox. Interrupções na rede podem levar à instabilidade do cluster e problemas de configuração.

5. **Monitoramento de Integridade do Armazenamento:**

  - Monitore a integridade do armazenamento subjacente usado pelo cluster Proxmox. Falhas de armazenamento podem levar à perda de dados e corrupção de configuração.

6. **Atualizações e Patches do Proxmox:**

  - Mantenha a instalação do Proxmox atualizada com as últimas atualizações e patches de segurança.

7. **Gerenciamento de Permissões:**

  - Revise e gerencie as permissões de arquivos dentro do diretório `/etc/pve`. Garanta que os usuários e grupos corretos tenham as permissões necessárias.

8. **Consciência do Cluster durante a Manutenção:**

  - Ao realizar manutenção em qualquer nó do cluster, garanta que os outros nós estejam cientes da manutenção e possam manter o quórum.

9. **Implementar Redundância**

  - Considere ter múltiplos nós. Se `/etc/pve/access.cfg` estiver ausente em um nó, ele pode ser copiado de outro.

Implementando essas medidas preventivas, você pode reduzir significativamente o risco de encontrar o erro de "Falha de Autenticação do Proxmox por Ausência de Arquivo de Configuração do Cluster" e garantir a estabilidade e confiabilidade do seu cluster Proxmox.

---
Você pode me contatar sobre este e outros tópicos pelo e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
