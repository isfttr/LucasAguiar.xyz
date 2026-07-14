---
date: 2026-07-13T18:05:20.000Z
draft: true
title: 'Como Executar com Segurança Agentes de Codificação de IA: Um Guia Prático de Sandboxing [2026]'
description: Guia passo a passo para isolar agentes de codificação de IA como Claude Code, Codex e Cursor. Evite vazamentos de dados, restrinja o acesso à rede e execute agentes com segurança usando Docker, VMs e escopo de permissões.
categories:
  - article
tags:
  - ai
  - security
  - dev
  - homelab
  - linux
slug: seguranca-agentes-codificacao-ia-sandboxing
translation_source_hash: e8f9c97cf7292f32e9f978beda5979e69043aab15df67c3dbd053f4083e1c597
---
Um agente de codificação de IA com acesso ao sistema de arquivos é uma vulnerabilidade prestes a acontecer. Na semana passada, foi o Grok CLI enviando um diretório home inteiro para o Google Cloud Storage. Na próxima semana, podem ser suas chaves de API, suas chaves SSH ou as credenciais do banco de dados do seu cliente terminando em algum lugar onde não deveriam.

O problema é estrutural: agentes de codificação de IA precisam de amplo acesso ao sistema para serem úteis. Eles instalam pacotes, editam arquivos, executam testes e se conectam a servidores. Mas o mesmo acesso que os torna produtivos os torna perigosos — especialmente quando injeção de prompt ou simples uso indevido de ferramentas pode transformar um agente em um vetor de exfiltração não intencional.

Este guia aborda as abordagens práticas para isolar (sandboxing) agentes de codificação de IA, desde o escopo de permissões leve até o isolamento total de VM. Você aprenderá contra o que cada abordagem protege, o que ela perde e como configurá-la.

## O Modelo de Ameaça

Antes de escolher uma estratégia de sandboxing, entenda contra o que você está se protegendo.

**Exfiltração de dados** — O agente lê um arquivo contendo segredos (chaves de API, chaves SSH, arquivos .env) e os escreve em um servidor externo. Isso pode acontecer por meio de chamadas diretas de ferramentas (o agente executa `curl` com o conteúdo do arquivo) ou por canais indiretos (o agente inclui o segredo em um commit enviado para um repositório remoto).

**Corrupção do sistema de arquivos** — O agente executa `rm -rf` no diretório errado, sobrescreve arquivos de configuração ou modifica arquivos que não deveria tocar. Mesmo agentes bem-intencionados podem cometer erros destrutivos — o incidente do Grok CLI não foi malicioso; o agente simplesmente seguiu instruções para "fazer backup" do diretório home sem entender quais arquivos deveriam permanecer locais.

**Injeção na cadeia de suprimentos** — Ao instalar dependências, o agente baixa um pacote malicioso de um registro comprometido. A confiança do agente nos registros de pacotes é sua superfície de ataque.

**Escalonamento por injeção de prompt** — Um atacante incorpora instruções em um arquivo, issue ou comentário que o agente lê. O agente segue os comandos do atacante com os privilégios da sua conta — lendo repositórios privados, enviando código ou expondo credenciais.

## Abordagem 1: Escopo de Permissões (Mais Leve)

O sandbox mais simples é aquele embutido na configuração do seu agente. A maioria dos agentes de codificação modernos suporta alguma forma de escopo de permissões.

**Claude Code** tem níveis de permissão embutidos:

```bash
# Default: prompt for every potentially dangerous action
claude

# Skip prompts but still warn (not recommended for production)
claude --dangerously-skip-permissions

# Restrict filesystem access to a specific directory
claude --allowed-directories /home/user/project
```

A flag `--allowed-directories` é a mais importante. Ela restringe as operações de leitura/escrita de arquivos ao caminho especificado, impedindo que o agente acesse chaves SSH em `~/.ssh`, arquivos de token em `~/.config` ou credenciais em arquivos `.env` fora do diretório do projeto.

**Aider** tem uma flag `--read` que limita o agente a acesso somente leitura em arquivos especificados:

```bash
# Agent can read everything but only edit specified files
aider --read-only README.md --read-only .env.example
```

**Cursor/Windsurf** têm configurações de confiança em nível de projeto. O modelo de confiança de workspace do VSCode se aplica aqui: se você marcar um projeto como "restrito", o agente não pode acessar arquivos fora da pasta do workspace.

**O que o escopo de permissões protege:** Leituras acidentais de arquivos sensíveis fora do projeto. Modificação acidental de configuração do sistema.

**O que ele perde:** Exfiltração maliciosa de dados dentro do escopo permitido. Se o seu projeto contém chaves de API (não deveria, mas muitos contêm), um agente comprometido ainda pode lê-las e exfiltrá-las. A injeção de prompt não é evitada — o agente ainda pode ser enganado para escrever segredos em um servidor remoto ou enviá-los para um repositório público.

## Abordagem 2: Isolamento Baseado em Contêiner (Médio)

Os contêineres Docker fornecem um isolamento mais forte ao restringir a visão do agente sobre o sistema de arquivos e a rede apenas ao que você monta e permite explicitamente.

### Sandbox Docker Básico

```dockerfile
FROM python:3.12-slim

# Install your tools
RUN apt-get update && apt-get install -y \
    git curl jq \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /project
COPY . /project

# Run as non-root user
RUN useradd -m agent
USER agent
ENTRYPOINT ["claude"]
```

Execute-o com montagens restritas e somente leitura quando possível:

```bash
docker build -t ai-sandbox .
docker run --rm -it \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --mount type=bind,source=$(pwd),target=/project \
  --network ai-restricted \
  ai-sandbox
```

### Restrições de Rede

A flag `--network` é crítica. Crie uma rede Docker personalizada com acesso de saída em lista de permissões:

```bash
docker network create --driver bridge ai-restricted

# Allow specific registries
# Docker's network firewall does not support per-URL allow-listing natively.
# Instead, use a forward proxy:
docker run -d --name ai-proxy \
  --network ai-restricted \
  -e ALLOWED_DOMAINS="github.com,registry.npmjs.org,pypi.org" \
  your-proxy-image

docker run --rm -it \
  --network ai-restricted \
  --env HTTP_PROXY=http://ai-proxy:8080 \
  --env HTTPS_PROXY=http://ai-proxy:8080 \
  --mount type=bind,source=$(pwd),target=/project \
  ai-sandbox
```

Para uma abordagem mais simples sem proxy, use `--network none` e deixe o agente trabalhar apenas no código local — sem instalação de pacotes, sem git push. Você perde utilidade, mas o isolamento é absoluto.

### Melhores Práticas de Segurança no Docker

```bash
# Read-only root filesystem prevents system modification
# No new privileges prevents privilege escalation
# Seccomp profile restricts system calls
docker run --rm -it \
  --read-only \
  --security-opt=no-new-privileges:true \
  --security-opt=seccomp=default \
  --cap-drop=ALL \
  --mount type=bind,source=$(pwd),target=/project \
  ai-sandbox
```

**O que o isolamento de contêiner protege:** Acesso ao sistema de arquivos fora do diretório do projeto montado. Comprometimento em nível de sistema. Exfiltração de rede (com proxy adequado/configuração sem rede). A maioria dos ataques à cadeia de suprimentos (limitados ao ciclo de vida do contêiner).

**O que ele perde:** O agente ainda pode exfiltrar qualquer arquivo dentro do projeto montado. Se o seu arquivo `.env` está na raiz do projeto, ele está acessível. Vulnerabilidades de escape de contêiner existem (raras, mas reais para cenários de kernel compartilhado). A vinculação do socket Docker (`/var/run/docker.sock` montado) daria ao contêiner acesso root ao host — nunca faça isso para agentes de IA.

## Abordagem 3: Isolamento Total de VM (Mais Forte)

Para máximo isolamento, execute o agente dentro de uma máquina virtual descartável. É o que o [Clawk](https://github.com/clawkwork/clawk) faz — ele provisiona uma VM Linux leve por projeto, monta seu código dentro e restringe a rede a uma lista de permissões.

```bash
# Install Clawk
brew install clawkwork/tap/clawk

# cd into your project and launch an agent inside a VM
cd my-project
clawk

# The agent gets a full Linux VM with:
# - Your project files mounted read-write
# - Your SSH agent forwarded (for git push)
# - Network restricted to allow-list only
# - No access to ~/.ssh, ~/.config, or anything outside the project

# Blocking an exfiltration attempt:
$ curl https://tracker.evil.example
# => curl: (7) Failed to connect: Connection refused

# Your keys never entered the VM:
$ cat ~/.ssh/id_rsa
# => cat: /home/agent/.ssh/id_rsa: No such file or directory

# But git push still works (ssh-agent forwarded):
$ git push
# => Enumerating objects: 5, done.
```

Quando o agente inevitavelmente quebrar algo:

```bash
clawk destroy && clawk     # fresh VM, same repo
clawk --resume              # restore conversation from previous session
```

### Alternativa: Configuração Manual com QEMU/Libvirt

Se você preferir não usar uma ferramenta dedicada, uma VM manual com virt-manager ou `virsh` funciona:

```bash
# Create a lightweight VM with cloud-init
virt-install \
  --name ai-agent-sandbox \
  --memory 2048 \
  --vcpus 2 \
  --disk size=10 \
  --network default \
  --cloud-init user-data=cloud-init.yaml \
  --os-variant ubuntu24.04

# The cloud-init script installs your tools and sets up
# network restrictions via iptables/nftables
```

O blog tem um [guia detalhado sobre virtualização KVM/libvirt]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) se você quiser configurar isso do zero.

**O que o isolamento de VM protege:** Tudo. O agente não pode escapar do limite da VM. Seu sistema de arquivos host, chaves SSH, tokens de API e dados pessoais estão fisicamente isolados. A lista de permissões de rede impede a exfiltração para servidores desconhecidos. Mesmo que o agente seja comprometido por injeção de prompt, o atacante ganha acesso a uma VM descartável sem segredos.

**O que ele perde:** Agente SSH encaminhado — o agente pode enviar para remotos permitidos, o que significa que ele poderia enviar código sensível para um repositório público se instruído. A área de transferência do host da VM (copiar/colar) pode vazar dados se compartilhada. A sobrecarga de desempenho é maior que a do Docker.

## Recomendações Práticas

| Abordagem | Tempo de Configuração | Segurança | Desempenho | Melhor Para |
|-----------|----------------------|-----------|------------|-------------|
| Escopo de permissões | Minutos | Baixa | Nativo | Tarefas rápidas, bases de código confiáveis |
| Sandbox Docker | 30 minutos | Média | Quase nativo | Desenvolvimento regular, projetos semiconfiáveis |
| Isolamento de VM | 1-2 horas | Alta | Moderada | Projetos sensíveis, código não confiável, trabalho de cliente |

**Para desenvolvimento diário em seus próprios projetos:** Comece com escopo de permissões (`--allowed-directories`). Adicione isolamento Docker ao trabalhar com código que envolve chaves de API ou dependências de terceiros. Use isolamento total de VM para projetos de cliente onde a confidencialidade é contratual.

**Para revisar código não confiável:** Sempre use isolamento de VM. Se você está executando um agente de IA em código de origem desconhecida (um PR de um novo contribuidor, uma base de código que você clonou do GitHub sem revisão), o agente pode ser comprometido por arquivos maliciosos no repositório. O isolamento de VM descartável é a única opção segura.

**Para pipelines CI/CD:** Use contêineres Docker efêmeros ou VMs construídas do zero para cada execução. Nunca monte credenciais de CI diretamente — use segredos com escopo de ambiente e passe-os explicitamente. Ferramentas como o `services` do GitHub Actions ou a palavra-chave `services` do GitLab CI fornecem isolamento em nível de contêiner gratuitamente.

## Conclusão

O incidente do Grok CLI era inevitável. Não porque o Grok seja exclusivamente perigoso, mas porque toda ferramenta de codificação de IA com amplo acesso ao sistema de arquivos compartilha a mesma superfície de vulnerabilidade. A única solução é o isolamento — um limite que não pode ser contornado, sobrescrito ou ignorado pelo agente.

O nível certo de isolamento depende do que você está protegendo. Se o seu projeto não tem segredos, o escopo de permissões pode ser suficiente. Se ele tem chaves de API, dados de cliente ou credenciais, opte pelo menos pelo isolamento em nível de Docker. Se a confidencialidade é contratual ou regulatória (SOC 2, HIPAA, GDPR), o isolamento de VM é a única escolha defensável.

O padrão é claro: agentes de IA são ferramentas, não funcionários. Confie neles com ambientes isolados, não com seu diretório home.

Leia também:

- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})

---

Você pode entrar em contato para falar sobre isso e outros tópicos em <contact@lucasaguiar.xyz>
