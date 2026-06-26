---
title: NixOS - Máquina Virtual usando QEMU
date: 2023-07-03T17:15:29.000Z
draft: false
description: Corrigindo o `No internet available` erro na Instalação do NixOS
url: /NixOS-fix-virtual-machine/
featured_image: images/jigar-panchal-OU7Adpd4z2Y-unsplash.jpg
tags:
  - nixos
  - qemu
  - virtual-machine
translation_source_hash: d587457855e0bef2f774b3ca49ae28fc8c04df3391fedce0972ac7d5f4701171
---
Este é um guia rápido para aqueles que estão tendo problemas para instalar o NixOS e recebendo o erro `No Internet Available`.

Como estou usando o programa GUI Virtual Manager, acessei a configuração da VM.

Selecione a VM e o botão `Open` na barra superior. Você pode fazer isso enquanto a VM está em execução, mas as alterações só terão efeito na próxima vez que a VM iniciar, então é melhor desligar a VM.

Como a VM está desligada, a tela mostrará que a VM não está em execução, e na barra superior haverá um botão azul `i`. Clique nele e vá para `NIC ...`. Isso significa componente de interface de rede e esta é uma NIC virtual. Altere a fonte de rede para 'default'. Se a fonte de rede estiver definida como `docker0` como no meu caso, o novo host não está dentro da rede docker, então não há um gateway para se conectar. Neste caso, a rede correta é a `virbr0`, que é específica para máquinas virtuais.

![Captura de tela (PT-BR).](/images/nixos-vm-network.png)

O modelo do dispositivo pode ser definido como `virtio` ou outros modelos, pelo que testei não houve alterações.

Leia também:

- [Oracle Cloud Free Tier 2026: Ainda Vale a Pena? Guia Completo + Alternativas]({{< relref "posts/oracle_cloud_vps/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
