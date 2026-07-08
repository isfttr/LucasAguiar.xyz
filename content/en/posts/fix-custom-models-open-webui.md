---
date: 2025-03-12T01:32:27.000Z
draft: false
title: How to fix the Missing Custom Models bug
description: null
url: ''
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-custom-model-fix.png
categories:
  - article
tags:
  - open-webui
  - fix
slug: fix-missing-custom-models-bug
aliases:
  - /posts/fix-custom-models-open-webui/
---

This is a quick fix to a problem I experienced with Open WebUI, which was that custom models were not showing in the models list. There was nothing in the documentation or in the issues pointing to a solution. I decided to open a new issue 4 days ago and today the user [@dcolley](https://github.com/open-webui/open-webui/discussions/11404) gave the missing information and it worked.

For some reason, custom models are not working when you use Direct Connections. In my case, I use OpenRouter to use LLMs, so I thought the way to setup the API was from the Direct Connections menu. It turns out that you can setup the OpenRouter API from the Connections page, specifically in the OpenAI API section. And this is the solution, **replicate your configuration for the API inside the OpenAI section**.

## The solution

![OpenAI API configuration in Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/connections-page.png)

Custom models are now working as expected.

![Custom models page in Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/custom-models-page.png)

And the model list should show your custom models.

![Models list in Open WebUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/model-list.png)

Read also:

- [Script for Updating Open WebUI in a Proxmox LXC]({{< relref "posts/script-update-open_webui-lxc/" >}})
- [Creating my AI assistant locally]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})

---
You can reach out to contact me about this and other topics at my email **<contact@lucasaguiar.xyz>** or by filling the form below.
