---
date: 2026-08-06T18:07:52.000Z
draft: true
title: 'Proxmox VE em ARM64: Guia Completo de Homelab [2026]'
description: 'Proxmox VE 9.2 agora suporta oficialmente ARM64: hardware suportado (NVIDIA Grace, Vera), SBCs de melhor esforço, boot somente UEFI, limitações e o que isso significa para homelabs.'
featured_image: ''
categories:
  - article
tags:
  - proxmox
  - arm64
  - homelab
  - virtualization
  - linux
slug: proxmox-ve-arm64-guia-homelab
translation_source_hash: dfdb2401187b64a37f23a545320804e0d6186a7fec1da2dc61acbbf02dc8a18e
---
Em 5 de agosto de 2026, a Proxmox lançou algo que a comunidade homelab pedia desde o início da era do Raspberry Pi: a primeira versão oficial do Proxmox Virtual Environment para ARM de 64 bits (arm64/aarch64). Por anos, executar o PVE em ARM significava portas não oficiais, compilações da comunidade e torcer para que seu cartão SD não se corrompesse. Essa era acabou — mas a realidade do suporte a ARM64 é mais sutil do que “Proxmox agora roda em um Raspberry Pi”. Veja o que o lançamento realmente significa, quais hardwares funcionam e como decidir se um cluster ARM tem lugar no seu homelab.

## O que foi anunciado

O Proxmox VE 9.2 é a primeira versão com suporte oficial a uma segunda arquitetura de CPU. Até agora, o PVE era exclusivo para x86-64 (amd64). A compilação ARM64 compartilha a base de código, os repositórios de pacotes e o ciclo de lançamentos com sua contraparte x86-64 — não é um fork nem uma prévia tecnológica. Internamente, executa [Debian 13.5 "Trixie"](https://www.debian.org/releases/trixie/) com o kernel Linux 7.0 como padrão estável, e traz as mesmas versões da pilha principal: QEMU 11.0, LXC 7.0 e ZFS 2.4.

O [comunicado oficial](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-launches-official-arm64-support) (5 de agosto de 2026) destaca a validação desde o primeiro dia para as arquiteturas de CPU NVIDIA Grace e NVIDIA Vera, com “paridade total de recursos entre as pilhas de armazenamento KVM, LXC, ZFS e Ceph”. O [anúncio no fórum](https://forum.proxmox.com/threads/proxmox-virtual-environment-now-available-for-64-bit-arm-arm64.185527/) da equipe Proxmox confirma que ele já está implantado em produção nas plataformas suportadas, graças a uma estreita colaboração com a NVIDIA.

## Hardware suportado: as letras miúdas

Esta é a parte que mais importa para quem tem homelab. Os níveis de suporte são:

| Nível | Hardware | Status |
|------|----------|--------|
| Totalmente suportado | Plataformas NVIDIA Grace Hopper e NVIDIA Vera | Oficial, mesmo ciclo de vida do x86-64 |
| Melhor esforço | Outros hardwares ARMv9-A ou mais novos baseados em UEFI (ARMv8-A geralmente também funciona) | Suporte em nível de comunidade |
| Não suportado | Computadores de placa única somente com device tree (ex.: Raspberry Pi) | Não inicializará |

A exclusão do Raspberry Pi é o destaque para a maioria dos homelabs. Como o host precisa inicializar via UEFI e descrever seu hardware por meio de ACPI, SBCs somente com device tree ficam de fora. Isso exclui o Pi 4/5, a maioria das placas Banana Pi e as clássicas placas ARM para homelab. Os alvos realistas para o suporte de “melhor esforço” são plataformas ARM com capacidade de UEFI, como os servidores Ampere Altra/AmpereOne, a família Mac Mini da série M e a crescente variedade de caixas de desenvolvimento ARM (ex.: as placas [Rock 5B+](https://www.okdo.com/p/rock-5b-plus/) e [Radxa](https://radxa.com/) com firmware UEFI).

Se você está pensando em comprar, procure duas palavras na ficha técnica: **UEFI** e **ACPI**. Essa combinação é a linha divisória entre “provavelmente vai funcionar” e “não vai inicializar”.

## O que é diferente no ARM64

A configuração, as ferramentas e a documentação são idênticas às do x86-64, com um pequeno conjunto de diferenças específicas da arquitetura:

- **VMs sempre inicializam via UEFI**, usando a compilação ARM do OVMF (AAVMF). O SeaBIOS não está disponível no arm64 — o boot no estilo BIOS legado acabou.
- **A criptografia de memória AMD SEV e as vGPUs mediadas por Intel GVT-g são exclusivas do x86.**
- **Não há pacote de microcódigo de CPU em nível de sistema operacional** (o equivalente ARM de `intel-microcode`/`amd64-microcode` não existe).
- **Convidados só executam em nós que correspondem à sua arquitetura**, e a migração ao vivo só funciona entre nós da mesma arquitetura. Você não pode misturar nós amd64 e arm64 em um cluster e esperar migração ao vivo entre eles.

O último ponto é importante para quem planeja uma migração: um cluster ARM64 é uma frota separada, não uma extensão plug-and-play de um cluster x86 existente. Armazenamento (ZFS, Ceph) e rede se comportam da mesma forma, mas a computação é particionada por arquitetura.

## Por que o ARM64 é importante para homelabs

O lançamento chega num momento em que os servidores ARM estão se tornando realmente interessantes para quem faz self-hosting:

1. **Eficiência energética.** Os núcleos ARM64 entregam desempenho por watt muito melhor que o x86 para cargas de trabalho típicas de homelab — contêineres, serviços web, pilhas de mídia, bancos de dados com carga moderada. Um pequeno cluster ARM pode substituir uma torre x86 barulhenta consumindo uma fração da energia em idle.
2. **Densidade.** Plataformas como a NVIDIA Grace Hopper são voltadas para densidade em datacenter, mas a mesma engenharia (alta contagem de núcleos, memória integrada) está chegando ao mercado de usados e ao hardware para desenvolvedores.
3. **Validação empresarial.** O envolvimento da NVIDIA significa que o porte foi endurecido contra cargas de produção reais — gerenciamento de memória, ZFS e Ceph em ARM receberam testes sérios. Isso também eleva o nível de qualidade para o nível de melhor esforço.

O contraponto honesto: para um homelab de nó único fazendo virtualização leve, o x86-64 continua sendo o caminho de menor resistência. Todo guia, toda resposta de fórum, todo script Proxmox do ecossistema assume amd64. O ARM64 é a escolha certa quando você está construindo uma frota dedicada de baixo consumo ou executando cargas de trabalho nativas ARM (Docker em ARM, runners de CI ARM, serviços de borda).

## Primeiros passos

A [ISO ARM64](https://www.proxmox.com/en/downloads) está disponível na página de downloads normal (o espelho enterprise também a disponibiliza). A instalação segue o mesmo fluxo do instalador x86-64; as principais diferenças práticas são os requisitos de boot (UEFI) e o firmware (AAVMF). A [documentação do PVE](https://pve.proxmox.com/pve-docs) se aplica a ambas as arquiteturas, e o [roadmap](https://pve.proxmox.com/wiki/Roadmap) mostra o que vem a seguir.

Antes de instalar, verifique se o seu hardware inicializa via UEFI e expõe ACPI — confira as configurações de firmware do fabricante. Se você estiver em uma placa de melhor esforço, planeje testar primeiro com uma carga de trabalho não produtiva e espere contar com o [fórum da comunidade](https://forum.proxmox.com) em vez do suporte enterprise.

## O que acompanhar a seguir

O anúncio diz explicitamente que a Proxmox está “trabalhando com mais fornecedores de servidores enterprise em seus esforços ARM” — espere que a lista de hardwares oficialmente suportados cresça. As duas coisas que estou observando:

- **Placas ARM de consumo com firmware UEFI.** Se o ecossistema Rockchip/Amlogic lançar firmware UEFI+ACPI adequado, um SBC ARM de US$ 200 pode se tornar um nó PVE legítimo.
- **Suporte a ARM64 no ecossistema mais amplo.** O PBS (Proxmox Backup Server) e os scripts da comunidade ([que o blog já cobre]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})) precisarão de compilações ARM64 antes que os homelabs ARM pareçam totalmente de primeira classe.

Para quem já executa o PVE, o caminho de migração é simples — [o guia de atualização 8→9]({{< relref "posts/migracao-proxmox-8-9-2026/" >}}) cobre o lado x86, e o instalador ARM64 cuida de implantações novas. Se você encontrar problemas de login ou de interface web em um novo nó ARM, o [guia de solução de problemas de login do Proxmox]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}}) se aplica sem alterações.

## Conclusão

O lançamento para ARM64 é um marco genuíno: o Proxmox não é mais uma plataforma exclusiva para x86, e o ecossistema de servidores ARM ganhou um hipervisor de primeira classe com respaldo empresarial. Para homelabs, a conclusão prática é clara — ARM64 é para hardware ARM baseado em UEFI (Grace, Vera, Ampere e placas de consumo de melhor esforço), não para Raspberry Pis, e um cluster ARM é uma frota separada dos seus nós x86. Se você estava de olho em um servidor ARM de baixo consumo, 2026 é o ano em que ele deixou de ser um improviso.

Leia também:

- [Proxmox Backup Server: instalação via community-scripts e configuração de backup [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Como migrar do Proxmox VE 8 para 9: guia passo a passo [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})
- [Corrigir erros de login na interface web do Proxmox; um guia passo a passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
