---
title: NixOS - Máquina Virtual usando QEMU
date: 2023-07-03T17:15:29.000Z
draft: false
description: Corrigindo o erro `No internet available` na Instalação do NixOS
url: /NixOS-fix-virtual-machine/
featured_image: images/jigar-panchal-OU7Adpd4z2Y-unsplash.jpg
tags:
  - nixos
  - qemu
  - virtual-machine
translation_source_hash: 71b3ede029a6a20b843348f56e1234d691d82743c28529c2d84dd0baed55dd7c
---
Este é um guia rápido para aqueles que estão com problemas para instalar o NixOS e recebendo o erro `No Internet Available`.

Como estou usando o programa GUI Virtual Manager, entrei na configuração da VM.

Selecione a VM e o botão `Open` na barra superior. Você pode fazer isso enquanto a VM está em execução, mas as alterações só terão efeito na próxima vez que a VM inicializar, então é melhor ter a VM desligada.

Como a VM está desligada, a tela mostrará que a VM não está em execução, e na barra superior haverá um botão azul `i`. Clique nele e vá para `NIC ...`. Isso significa componente de interface de rede e esta é uma NIC virtual. Altere a Network source para 'default'. Se a Network source estiver definida como `docker0`, como foi o meu caso, o novo host não está dentro da rede docker, então não há um gateway para se conectar. Neste caso, a rede correta é a `virbr0`, que é específica para máquinas virtuais.

![Screenshot (PT-BR).](/images/nixos-vm-network.png)

O modelo do dispositivo pode ser definido como `virtio` ou outros modelos, pelo que testei não houve alterações.
