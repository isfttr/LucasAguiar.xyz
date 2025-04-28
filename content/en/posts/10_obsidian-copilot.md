---
date: 2025-02-04T11:00:59-04:00
draft: false
title: Obsidian + Copilot
description: Using OpenRouter to power AI in Obsidian.
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-obsidian-copilot.png
categories:
  - tutorial
tags:
  - technology
  - artificial-intelligence
  - obsidian
  - RAG
---

I needed an easy and cheap option to integrate my vault with artificial intelligence. The easiest option could be to pay for subscriptions, which would be a high cost for me, since I am would not use the service that often to justify. Another option would be to pay for a Cloud GPU service to run big queries that would be unfeasible to run locally. This option seemed too cumbersome for my case. Eventually I discovered OpenRouter, which seems to be the easiest to solution because I can access multiple models at a single place and also have a API that I can connect to other services.

This solution aims at creating a kind of NotebookLM for my notes inside my Obsidian Vault. The first plugin that caught my attention was Obsidian Copilot, which had a subscription service, but also gave the option to use third-party APIs. The second plugin is called Smart Connections, which is similar. Both can be used at the same time.

All the [Links](#links) for the references are at the end.

## Setup

This is a simple step by step setup using Obsidian, Copilot plugin, OpenRouter, and Ollama.

First, create an account on OpenRouter and add some credit to the account. In my case I added 10 dollars, but I think you could add less. After this, go to your photo (top right corner) and click Keys. Create a new key, this key will be used to access the API from the plugins inside Obsidian.

In Obsidian, first add Copilot. Access the settings for the Copilot plugin and click on "Set Key". A pop-up like the one below will appear.

![1](/images/Pasted%20image%2020250204211022.png)

Paste the API key that you just copied and click "Verify". Once verified, go to the Model tab. There, you can add the models that are available in OpenRouter.

![1](/images/Pasted%20image%2020250204211334.png)

Before adding a model, first check inside OpenRouter the models that are available.

![1](/images/Pasted%20image%2020250204211446.png)

Once the models are added, you can set what the default chat model will be in the Basic tab.

![1](/images/Pasted%20image%2020250204211555.png)

### Creating a model for your vault

This can be done using Ollama and the `nomic-embbed-text` model (embedding model). For this, you have to have Ollama locally installed and the embedding model downloaded.

```bash
ollama serve
ollama pull nomic-embed-text
```

With Ollama running in the background, go to your vault and use the command to index the vault.

![1](/images/Pasted%20image%2020250204211956.png)

Now you are set.

This a screenshot from a note inside my vault. On the right pane you have related notes by similarity.

![1](/images/Pasted%20image%2020250204213406.png)

When you scroll down, you can see suggested prompts.

![1](/images/Pasted%20image%2020250204213447.png)

Here lies the difference between Copilot and Smart Connections. Smart connections is able to search on the entire vault, not just the selected note.

![1](/images/Pasted%20image%2020250204213748.png)

With Smart Connections you'll similar easy of use as seen on Copilot.

### Costs

I have been using this setup for a week. Since then I didn't have much use for it, like I already expected, and below are the costs for using the models.  As you can see is cheap to run queries every now and then.

![1](/images/Pasted%20image%2020250204230941.png)

![1](/images/Pasted%20image%2020250204230809.png)

You can visit the Model page and see for yourself the costs for running each model.

![1](/images/Pasted%20image%2020250204231200.png)

## Conclusion

Overall I think this is a pretty nice setup. It is easy to troubleshoot if necessary and is affordable. Since I use my vault almost every day, it becomes easier for me to manage the setup, instead of having to go to a different service every time I have the need. Also, OpenRouter can be used directly to chat, instead of relying on the chat inside Obsidian.

## Links

- [Obsidian - Sharpen your thinking](https://obsidian.md/)
- [GitHub - logancyang/obsidian-copilot: THE Copilot in Obsidian](https://github.com/logancyang/obsidian-copilot)
- [Smart Connections](https://smartconnections.app/)
- [OpenRouter](https://openrouter.ai/)
- [Ollama](https://ollama.com/)
- [nomic-embed-text](https://ollama.com/library/nomic-embed-text)
- [Local AI Assistant](3_local-ai-assistant)

You can reach out to contact me about this or other topics at my email <contact@lucasaguiar.xyz>.
