---
date: 2026-06-20T19:45:00-03:00
draft: false
title: "Como instalar o Proxmox VE no Mac Mini 2018 (chip T2): o passo a passo que funcionou"
description: "Transformar um Mac Mini 2018 com chip T2 em um nó Proxmox parece simples, mas o Secure Boot e a tela preta travam quase todo mundo. Veja as configurações exatas que fizeram a instalação dar certo."
featured_image: ""
categories:
  - tutorial
tags:
  - proxmox
  - homelab
  - linux
  - self-hosting
---

Instalar o **Proxmox no Mac Mini 2018** parece tarefa de cinco minutos: grava o ISO num pendrive, dá boot e segue o instalador. Na prática, o chip de segurança T2 da Apple coloca dois obstáculos no caminho — o boot bloqueado e uma tela que simplesmente apaga — e é fácil passar horas batendo nesses dois muros. Este post documenta as configurações exatas que fizeram a instalação funcionar de ponta a ponta, para que você não perca o tempo que eu perdi.

A máquina-alvo aqui é um Mac Mini 2018 (Intel, 32 GB de RAM) que virou um nó dedicado de um cluster Proxmox. Se o seu objetivo é parecido — reaproveitar um Mac antigo como servidor de virtualização —, este é o caminho que deu certo.

## O obstáculo de fundo: o chip T2

Todo Mac de 2018 a 2020 com Intel tem o [chip T2 da Apple](https://support.apple.com/en-us/102522), que cuida de Secure Boot, criptografia de armazenamento e da política de mídia de inicialização. Por padrão, ele só confia em sistemas assinados pela Apple (e no Windows via Boot Camp). Qualquer bootloader de Linux — incluindo o do Proxmox — é recusado.

É por isso que, ao tentar dar boot pelo pendrive, em vez do instalador você cai numa tela parecida com o Recovery do macOS. Não é bug seu: é o T2 fazendo o trabalho dele.

## Passo 1 — Liberar o Secure Boot (o detalhe que o `csrutil disable` NÃO resolve)

Aqui mora a primeira armadilha. Muitos guias mandam rodar `csrutil disable` no Recovery, e isso parece resolver — mas **não resolve**. O `csrutil disable` desativa o **SIP** (System Integrity Protection), que é outra coisa. O que bloqueia o boot do Linux é o **Secure Boot**, e ele só é desligado pela ferramenta gráfica **Utilitário de Segurança de Inicialização**.

O procedimento correto, segundo a própria [documentação da Apple](https://support.apple.com/en-us/102522):

1. Reinicie segurando **Command (⌘) + R** para entrar no Recovery.
2. Na barra de menu, vá em **Utilitários → Utilitário de Segurança de Inicialização**.
3. Autentique com uma conta de administrador do macOS.
4. Ajuste **as duas** opções:
   - **Inicialização Segura** → *Sem Segurança*
   - **Mídia de Inicialização Permitida** → *Permitir inicialização a partir de mídia externa ou removível*

O segundo ajuste é o mais esquecido. A política de mídia é independente do Secure Boot: mesmo com o Secure Boot em "Sem Segurança", o T2 continua recusando o pendrive USB se você não liberar a mídia externa explicitamente. As duas precisam estar marcadas.

Feito isso, o instalador do Proxmox finalmente carrega ao selecionar a entrada **EFI Boot** no menu do botão Option.

## O problema da tela preta (e por que o `nomodeset` pode não bastar)

Resolvido o boot, surge o segundo muro: ao escolher "Install Proxmox VE", a tela apaga e o monitor entra em modo standby. A causa é a placa gráfica integrada (Intel UHD 630): o kernel do ISO tenta trocar o modo de vídeo, falha no hardware do T2, e o sinal morre.

A receita clássica é editar a entrada de boot (tecla `e`) e acrescentar o parâmetro `nomodeset`, que impede o kernel de carregar o driver gráfico e mantém o framebuffer do firmware. Vale a tentativa — mas no meu caso, com um monitor de alta resolução, **nem o `nomodeset` salvou**: a tela continuou apagando. Se você só tem um monitor 4K à mão, prepare-se para esse cenário.

Em vez de continuar brigando com o vídeo, a saída foi mudar de estratégia.

## Passo 2 — A virada: instalação headless e automatizada

A sacada é simples: se o problema é o vídeo do instalador, **tire o vídeo da equação**. O Proxmox suporta instalação automatizada (sem interação) desde a versão 8.2, e é isso que resolve de vez. Você prepara um arquivo de respostas, embute num ISO, dá boot às cegas e administra tudo pela rede.

Segundo o [wiki oficial de instalação automatizada](https://pve.proxmox.com/wiki/Automated_Installation), o fluxo usa a ferramenta `proxmox-auto-install-assistant`. Em qualquer host Debian/Proxmox que você já tenha:

```bash
apt update
apt install proxmox-auto-install-assistant
```

Crie o `answer.toml` com a configuração mínima (ajuste os campos):

```toml
[global]
keyboard = "pt-br"
country = "br"
fqdn = "proxmox-mini.seudominio.com"
mailto = "seu-email@dominio.com"
timezone = "America/Sao_Paulo"
root_password = "SUA_SENHA_FORTE"

[network]
source = "from-dhcp"

[disk-setup]
filesystem = "ext4"
disk_list = ["nvme0n1"]
```

Dois detalhes importantes desse arquivo:

- **`disk_list = ["nvme0n1"]`**: com o Secure Boot desativado, o SSD interno do Mac Mini aparece como `nvme0n1`, enquanto o pendrive de instalação fica como `/dev/sda`. Não há ambiguidade — ele instala no disco certo.
- **`source = "from-dhcp"`**: aqui mora a pegadinha do próximo passo (mais sobre isso adiante).

Agora prepare o ISO automatizado a partir do ISO oficial do Proxmox:

```bash
proxmox-auto-install-assistant prepare-iso proxmox-ve_9.2-1.iso \
  --fetch-from iso --answer-file ./answer.toml
```

Isso gera um arquivo `*-auto-from-iso.iso`. Grave no pendrive, dê boot pelo EFI Boot e **não toque em nada**: após 10 segundos, a entrada "Automated Installation" inicia sozinha. A instalação roda inteira sem você ver a tela — e poucos minutos depois o Proxmox já está instalado e reinicia.

> **Dica de risco:** em alguns Macs T2, o kernel do ISO não consegue gravar na NVRAM e a instalação do bootloader falha de forma invisível. Se o nó não aparecer na rede depois de uns 20 minutos, o caminho é remasterizar o ISO incluindo `nomodeset efi=noruntime` na linha de comando da entrada automatizada. O parâmetro `efi=noruntime` é a solução documentada no [wiki do t2linux](https://wiki.t2linux.org/distributions/debian/installation/) para esse problema específico de NVRAM.

## Passo 3 — A pegadinha da rede (`192.168.100.2`)

Aqui está a lição que custou uma reconfiguração extra: **plugue o cabo Ethernet antes de instalar**.

No meu caso, o Mac Mini estava só no WiFi durante a instalação. Como o `answer.toml` pedia `from-dhcp` e não havia cabo, a placa com fio não tinha link, nenhum lease foi obtido, e o Proxmox caiu no IP padrão do instalador: `192.168.100.2/24` — uma sub-rede diferente da minha rede real.

Pior: o Proxmox usa bridge sobre a placa cabeada (`vmbr0`), não WiFi. E o WiFi Broadcom do Mac Mini nem funciona sem os patches do T2. Ou seja, sem cabo não há rede utilizável.

Como o console local estava preto (o tal problema de vídeo), a correção foi feita por uma conexão direta: cabo do notebook direto no Mac Mini, notebook num IP `192.168.100.x`, e acesso via SSH a `root@192.168.100.2`. Lá dentro, editei o `/etc/network/interfaces` para um IP estático na minha rede:

```bash
nano /etc/network/interfaces
```

Mudando apenas as linhas `address` e `gateway` do bloco `vmbr0` (mantendo a `bridge-ports` como já estava):

```
auto vmbr0
iface vmbr0 inet static
        address 192.168.10.30/24
        gateway 192.168.10.1
        bridge-ports enp0s31f6
        bridge-stp off
        bridge-fd 0
```

Um `reboot`, o cabo movido para o switch real, e o nó subiu no IP definitivo. Para um nó de cluster, IP estático é o caminho recomendado de qualquer forma — clusters não gostam de IPs que mudam.

A moral: **se você plugar o cabo Ethernet antes de instalar, o `from-dhcp` funciona de primeira e você pula esse passo inteiro.**

## Passo 4 — O que ainda falta: kernel T2 para vídeo e ventoinha

A esta altura o Proxmox (versão 9.2.2, no meu caso) está instalado, na rede e acessível pela [interface web](/posts/troubleshooting-proxmox-login-interface/) — sem nunca mais precisar de monitor. Mas o vídeo local ainda fica preto no boot, porque o kernel padrão do Proxmox não tem suporte ao hardware do T2.

Para um nó que vai ficar ligado 24/7, o passo final é instalar, via SSH, o kernel com patches T2 e os firmwares proprietários da Apple, mantidos pelo projeto [t2linux](https://wiki.t2linux.org/). É esse kernel que faz o vídeo, o controle de ventoinha e os sensores funcionarem direito — algo essencial para não cozinhar a máquina em uso contínuo.

No entanto, na minha experiência, não precisei fazer qualquer alteração, a
ventoinha estava funcionando normalmente após o processo de instalação (passos 1 à
3).

## Conclusão

O Mac Mini 2018 é um ótimo candidato a nó de homelab — silencioso, eficiente e com bom poder de processamento — mas o chip T2 transforma uma instalação trivial num quebra-cabeça. Os três pontos que destravam tudo são: liberar o **Secure Boot pela ferramenta correta** (não o `csrutil`), contornar a tela preta com uma **instalação headless automatizada**, e **plugar o cabo de rede antes** para o DHCP funcionar.

Se você está decidindo entre sistemas para reaproveitar hardware Apple, talvez valha a leitura de [Linux, Windows ou macOS: qual usar em 2026](/posts/linux-windows-macos-qual-usar-2026/) antes de apagar o macOS. Mas se a decisão já está tomada e o destino é o Proxmox, o caminho acima é o que funciona.

Leia também:

- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [10 anos usando o MacBook Pro 9,2]({{< relref "posts/10-years-of-macbook-pro/" >}})

---
