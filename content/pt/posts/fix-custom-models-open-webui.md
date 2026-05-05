---
date: 2025-03-12T01:32:27.000Z
draft: false
title: Como corrigir o bug de Modelos Personalizados Ausentes
description: null
url: ''
featured_image: >-
  https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-custom-model-fix.png
categories:
  - article
tags:
  - open-webui
  - fix
translation_source_hash: f35965c3160f9d4aed213dcad6269ca77cc432adbe04b9a648f2599a9ee0bca8
---
Esta é uma solução rápida para um problema que tive com o Open WebUI, que era o facto de os modelos personalizados não aparecerem na lista de modelos. Não havia nada na documentação ou nos problemas que apontasse para uma solução. Decidi abrir um novo problema há 4 dias e hoje o utilizador [@dcolley](https://github.com/open-webui/open-webui/discussions/11404) forneceu a informação em falta e funcionou.

Por alguma razão, os modelos personalizados não funcionam quando se utilizam Conexões Diretas. No meu caso, utilizo o OpenRouter para usar LLMs, por isso pensei que a forma de configurar a API era a partir do menu Conexões Diretas. Acontece que é possível configurar a API do OpenRouter a partir da página Conexões, especificamente na secção da API OpenAI. E esta é a solução, **replique a sua configuração para a API dentro da secção OpenAI**.

## A solução

![Configuração da API OpenAI no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/connections-page.png)

Os modelos personalizados estão agora a funcionar como esperado.

![Página de modelos personalizados no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/custom-models-page.png)

E a lista de modelos deve mostrar os seus modelos personalizados.

![Lista de modelos no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/model-list.png)

Leia também:

- [Script para Atualizar Open WebUI em um LXC Proxmox]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---
Pode contactar-me sobre este e outros tópicos através do meu email **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
