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
slug: executar-seguranca-agentes-codificacao-ia-sandboxing
translation_source_hash: 6c83adcfaed61adb557bd6617e26fb084758edcb770c65b9974d25bf5e92fc4e
---
Um agente de codificação de IA com acesso ao sistema de arquivos é uma vulnerabilidade prestes a acontecer. Semana passada, foi o Grok CLI enviando um diretório inteiro do home para o Google Cloud Storage. Na próxima semana, podem ser suas chaves de API, suas chaves SSH ou as credenciais do banco de dados do seu cliente indo parar onde não deveriam.

O problema é estrutural: agentes de codificação de IA precisam de acesso amplo ao sistema para serem úteis. Eles instalam pacotes, editam arquivos, executam testes e se conectam a servidores. Mas o mesmo acesso que os torna produtivos os torna perigosos — especialmente quando injeção de prompt ou simples uso indevido de ferramentas pode transformar um agente em um vetor de exfiltração não intencional.

Este guia aborda as abordagens práticas para isolar agentes de codificação de IA, desde a definição de permissões leves até o isolamento total em VM. Você aprenderá contra o que cada abordagem protege, o que ela deixa passar e como configurá-la.

## O Modelo de Ameaça

Antes de escolher uma estratégia de isolamento, entenda contra o que você está se protegendo.

**Exfiltração de dados** — O agente lê um arquivo contendo segredos (chaves de API, chaves SSH, arquivos .env) e os escreve em um servidor externo. Isso pode acontecer por meio de chamadas de ferramenta diretas (o agente executa `curl` com o conteúdo do arquivo) ou por canais indiretos (o agente inclui o segredo em um commit enviado para um repositório remoto).

**Corrupção do sistema de arquivos** — O agente executa `rm -rf` no diretório errado, sobrescreve arquivos de configuração ou modifica arquivos que não deveria tocar. Mesmo agentes bem-intencionados podem cometer erros destrutivos — o incidente do Grok CLI não foi malicioso; o agente simplesmente seguiu instruções para "fazer backup" do diretório home sem entender quais arquivos deveriam permanecer locais.

**Injeção na cadeia de suprimentos** — Ao instalar dependências, o agente baixa um pacote malicioso de um registro comprometido. A confiança do agente nos registros de pacotes é sua superfície de ataque.

**Escalonamento por injeção de prompt** — Um atacante insere instruções em um arquivo, issue ou comentário que o agente lê. O agente segue os comandos do atacante com os privilégios da sua conta — lendo repositórios privados, enviando código ou expondo credenciais.

## Abordagem 1: Escopo de Permissões (Mais Leve)

O isolamento mais simples é aquele embutido na configuração do seu agente. A maioria dos agentes de codificação modernos oferece suporte a alguma forma de escopo de permissões.

**Claude Code** tem níveis de permissão embutidos:

```bash
# Padrão: perguntar para cada ação potencialmente perigosa
claude

# Pular perguntas, mas ainda alertar (não recomendado para produção)
claude --dangerously-skip-permissions

# Restringir acesso ao sistema de arquivos a um diretório específico
claude --allowed-directories /home/user/project
```

A flag `--allowed-directories` é a mais importante. Ela restringe operações de leitura/gravação de arquivos ao caminho especificado, impedindo que o agente acesse chaves SSH em `~/.ssh`, arquivos de token em `~/.config` ou credenciais em arquivos `.env` fora do diretório do projeto.

**Aider** tem uma flag `--read` que limita o agente a acesso somente leitura em arquivos especificados:

```bash
# O agente pode ler tudo, mas só editar arquivos especificados
aider --read-only README.md --read-only .env.example
```

**Cursor/Windsurf** têm configurações de confiança em nível de projeto. O modelo de confiança de workspace do VSCode se aplica aqui: se você marcar um projeto como "restrito", o agente não pode acessar arquivos fora da pasta do workspace.

**O que o escopo de permissões protege contra:** Leituras acidentais de arquivos confidenciais fora do projeto. Modificação acidental de configuração do sistema.

**O que ele perde:** Exfiltração maliciosa de dados dentro do escopo permitido. Se o seu projeto contém chaves de API (não deveria, mas muitos têm), um agente comprometido ainda pode lê-las e exfiltrá-las. A injeção de prompt não é impedida — o agente ainda pode ser enganado para escrever segredos em um servidor remoto ou enviá-los para um repositório público.

## Abordagem 2: Isolamento Baseado em Contêiner (Médio)

Contêineres Docker fornecem isolamento mais forte ao restringir a visão do agente sobre o sistema de arquivos e a rede apenas ao que você monta e permite explicitamente.

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

# Permitir registros específicos
# O firewall de rede do Docker não suporta lista de permissões por URL nativamente.
# Em vez disso, use um proxy encaminhado:
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

Para uma abordagem mais simples sem proxy, use `--network none` e deixe o agente trabalhar apenas com código local — sem instalações de pacotes, sem git push. Você perde utilidade, mas o isolamento é absoluto.

### Boas Práticas de Segurança no Docker

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

**O que o isolamento em contêiner protege contra:** Acesso ao sistema de arquivos fora do diretório do projeto montado. Comprometimento em nível de sistema. Exfiltração de rede (com proxy adequado/ausência de rede). A maioria dos ataques à cadeia de suprimentos (limitado ao ciclo de vida do contêiner).

**O que ele perde:** O agente ainda pode exfiltrar qualquer arquivo dentro do projeto montado. Se o seu arquivo `.env` está na raiz do projeto, ele está acessível. Vulnerabilidades de escape de contêiner existem (raras, mas reais em cenários de kernel compartilhado). A montagem do socket Docker (`/var/run/docker.sock` montado) daria ao contêiner acesso root ao host — nunca faça isso para agentes de IA.

## Abordagem 3: Isolamento Total em VM (Mais Forte)

Para isolamento máximo, execute o agente dentro de uma máquina virtual descartável. É o que [Clawk](https://github.com/clawkwork/clawk) faz — provisiona uma VM Linux leve por projeto, monta seu código dentro e restringe a rede a uma lista de permissões.

```bash
# Instalar Clawk
brew install clawkwork/tap/clawk

# cd para o seu projeto e inicie um agente dentro de uma VM
cd my-project
clawk

# O agente recebe uma VM Linux completa com:
# - Seus arquivos do projeto montados leitura-escrita
# - Seu agente SSH encaminhado (para git push)
# - Rede restrita apenas à lista de permissões
# - Sem acesso a ~/.ssh, ~/.config ou qualquer coisa fora do projeto

# Bloqueando uma tentativa de exfiltração:
$ curl https://tracker.evil.example
# => curl: (7) Failed to connect: Connection refused

# Suas chaves nunca entraram na VM:
$ cat ~/.ssh/id_rsa
# => cat: /home/agent/.ssh/id_rsa: No such file or directory

# Mas git push ainda funciona (ssh-agent encaminhado):
$ git push
# => Enumerando objetos: 5, concluído.
```

Quando o agente inevitavelmente quebrar algo:

```bash
clawk destroy && clawk     # nova VM, mesmo repositório
clawk --resume              # restaurar conversa da sessão anterior
```

### Alternativa: Configuração Manual com QEMU/Libvirt

Se preferir não usar uma ferramenta dedicada, uma VM manual com virt-manager ou `virsh` funciona:

```bash
# Criar uma VM leve com cloud-init
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

**O que o isolamento em VM protege contra:** Tudo. O agente não pode escapar do limite da VM. Seu sistema de arquivos host, chaves SSH, tokens de API e dados pessoais estão fisicamente isolados. A lista de permissões de rede impede exfiltração para servidores desconhecidos. Mesmo que o agente seja comprometido por injeção de prompt, o atacante ganha acesso a uma VM descartável sem segredos.

**O que ele perde:** Agente SSH encaminhado — o agente pode enviar para remotos permitidos, o que significa que ele poderia enviar código confidencial para um repositório público se instruído. A área de transferência do host da VM (copiar/colar) pode vazar dados se compartilhada. A sobrecarga de desempenho é maior que a do Docker.

## Recomendações Práticas

| Abordagem | Tempo de Configuração | Segurança | Desempenho | Melhor Para |
|-----------|------------------------|-----------|------------|-------------|
| Escopo de permissões | Minutos | Baixa | Nativo | Tarefas rápidas, bases de código confiáveis |
| Sandbox Docker | 30 minutos | Média | Quase nativo | Desenvolvimento regular, projetos semiconfiáveis |
| Isolamento em VM | 1-2 horas | Alta | Moderada | Projetos sensíveis, código não confiável, trabalho de cliente |

**Para desenvolvimento diário em seus próprios projetos:** Comece com escopo de permissões (`--allowed-directories`). Adicione isolamento Docker ao trabalhar com código que envolve chaves de API ou dependências de terceiros. Use isolamento total em VM para projetos de cliente onde a confidencialidade é contratual.

**Para revisar código não confiável:** Sempre use isolamento em VM. Se você estiver executando um agente de IA em código de fonte desconhecida (um PR de um novo colaborador, uma base de código clonada do GitHub sem revisão), o agente pode ser comprometido por arquivos maliciosos no repositório. O isolamento em VM descartável é a única opção segura.

**Para pipelines CI/CD:** Use contêineres Docker efêmeros ou VMs construídas do zero para cada execução. Nunca monte credenciais de CI diretamente — use segredos com escopo de ambiente e passe-os explicitamente. Ferramentas como o `services` do GitHub Actions ou a palavra-chave `services` do GitLab CI fornecem isolamento em nível de contêiner gratuitamente.

## Conclusão

O incidente do Grok CLI era inevitável. Não porque o Grok é exclusivamente perigoso, mas porque toda ferramenta de codificação de IA com amplo acesso ao sistema de arquivos compartilha a mesma superfície de vulnerabilidade. A única correção é o isolamento — uma fronteira que não pode ser persuadida, contornada ou ignorada pelo agente.

O nível certo de isolamento depende do que você está protegendo. Se o seu projeto não tem segredos, o escopo de permissões pode ser suficiente. Se ele tem chaves de API, dados de cliente ou credenciais, opte pelo menos pelo isolamento em nível de Docker. Se a confidencialidade é contratual ou regulatória (SOC 2, HIPAA, GDPR), o isolamento em VM é a única escolha defensável.

O padrão é claro: agentes de IA são ferramentas, não funcionários. Confie a eles ambientes isolados, não seu diretório home.

Leia também:

- [KVM e Virsh no Linux: Guia Completo de Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [KVM e Virsh no Linux: Guia Completo de Máquinas Virtuais [2026]]({{< relref "posts/kvm-virsh-linux-virtualization-guide-2026/" >}})
- [GitLost [2026]: Como Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

Você pode entrar em contato para falar sobre isso e outros tópicos em <contact@lucasaguiar.xyz>
