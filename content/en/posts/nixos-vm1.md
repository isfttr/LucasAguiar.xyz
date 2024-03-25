---
title: NixOS - Virtual Machine using QEMU
date: 2023-07-03T14:15:29-03:00
draft: false
description: Correcting the `No internet available` error on NixOS Installation
url: "/NixOS-fix-virtual-machine/"
featured_image: images/jigar-panchal-OU7Adpd4z2Y-unsplash.jpg
tags:
  - nixos
  - qemu
  - virtual-machine
---


This is a quick guide for those that are having trouble installing NixOS and getting the `No Internet Available` error.

Since I'm using the GUI program Virtual Manager, I went into the VM's configuration.

Select the VM and the `Open` button on the top bar. You could do this while the VM is running but the changes will only take effect the next time the VM boots up, so it is better to have the VM shutdown.

Since the VM is down, the screen will show that the VM is not running, and on top bar there will be a `i` blue button. Click on it and go to `NIC ...`. This stands for network interface component and this is virtual NIC. Change the Network source to 'default'. If the network source is set to `docker0` as it was my case, the new host is not inside the docker network, so there is not a gateway to connect to. In this case, the right network is the `virbr0` which is specific for virtual machines.

![Screenshot (PT-BR).](/images/nixos-vm-network.png)

The device model could be set to `virtio` or other models, from what I tested there was not changes.