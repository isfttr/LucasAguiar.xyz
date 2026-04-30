---
date: 2025-03-12T01:32:27.000Z
draft: false
title: "Como corrigir o bug de Modelos Personalizados Ausentes"
description: null
url: ''
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-custom-model-fix.png
categories:
  - article
tags:
  - open-webui
  - fix
translation_source_hash: d2293da940edec27b6cb941d4d0e88a72c0b6fc316aa433a513e95326a46632b
---
Esta é uma solução rápida para um problema que tive com o Open WebUI, que era o de modelos personalizados não estarem a aparecer na lista de modelos. Não havia nada na documentação ou nas questões a apontar para uma solução. Decidi abrir uma nova questão há 4 dias e hoje o utilizador [@dcolley](https://github.com/open-webui/open-webui/discussions/11404) deu a informação em falta e funcionou.

Por alguma razão, os modelos personalizados não estão a funcionar quando se usam Conexões Diretas. No meu caso, uso o OpenRouter para usar LLMs, então pensei que a forma de configurar a API era pelo menu Conexões Diretas. Acontece que se pode configurar a API do OpenRouter a partir da página Conexões, especificamente na secção API do OpenAI. E esta é a solução, **replique a sua configuração para a API dentro da secção OpenAI**.

## A solução

![Configuração da API OpenAI no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/connections-page.png)

Os modelos personalizados estão agora a funcionar como esperado.

![Página de modelos personalizados no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/custom-models-page.png)

E a lista de modelos deve mostrar os seus modelos personalizados.

![Lista de modelos no Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/model-list.png)

---
Pode contactar-me sobre este e outros tópicos no meu email **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
