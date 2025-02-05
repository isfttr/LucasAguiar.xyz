---
date: "'{{ .Date }}'"
draft: true
title: "'{{ replace .File.ContentBaseName `-` ` ` | title }}'"
description: 
featured_image: 
categories:
  - article
  - tutorial
  - video
tags:
    - linux
    - macos
    - technology
    - personal
---

I needed a easy and cheap way to integrate my vault with artificial intelligence. One of the ways would be to pay for subscriptions, which would be a high cost for me, since I am would not use the service that often. Another way would be to pay for a Cloud GPU service to run big queries, that would be unfeasible to run locally. Eventually I discovered OpenRouter, which seems to be the easiest to solution because I can access multiple models at a single place and also have a API that I can connect to other services.

This solution aims at creating a kind of NotebookLM for my notes inside my Obsidian Vault. The first plugin that caught my attention was Obsidian Copilot, which had a subscription service, but also gave the option to use third-party APIs. The second plugin is called Smart Connections, which is similar. Both can be used at the same time. 

All the[[#Links]] for the references are at the end.
# Setup

This is a simple step by step setup using Obsidian, Copilot plugin, OpenRouter, and Ollama.

First, create an account on OpenRouter and add some credit to the account. In my case I added 10 dollars, but I think you could add less. After this, go to your photo (top right corner) and click Keys. Create a new key, this key will be used to access the API from the plugins inside Obsidian.

In Obsidian, first add Copilot. Access the settings for the Copilot plugin and click on "Set Key". A pop-up like the one below will appear.

![[Pasted image 20250204211022.png]]
Paste the API key that you just copied and click "Verify". Once verified, go to the Model tab. There, you can add the models that are available in OpenRouter.
![[Pasted image 20250204211334.png]]
Before adding a model, first check inside OpenRouter the models that are available.
![[Pasted image 20250204211446.png]]

Once the models are added, you can set what the default chat model will be in the Basic tab.
![[Pasted image 20250204211555.png]]

## Creating a model for your vault

This can be done using Ollama and the `nomic-embbed-text` model (embedding model). For this, you have to have Ollama locally installed and the embedding model downloaded.

```
ollama serve
ollama pull nomic-embed-text
```

With Ollama running in the background, go to your vault and use the command to index the vault.
![[Pasted image 20250204211956.png]]

Now you are set.

## Costs

I have been using this setup for a week. Since then I didn't have much use for it, like I already expected, and below are the costs for using the models.  As you can see is cheap to run queries every now and then. 

This a screenshot from a note inside my vault. On the right pane you have related notes by similarity.

![[Pasted image 20250204213406.png]]
When you scroll down, you can see suggested prompts.

![[Pasted image 20250204213447.png]]

Here lies the difference between Copilot and Smart Connections. Smart connections is able to search on the entire vault, not just the selected note.

![[Pasted image 20250204213748.png]]

With Smart Connections you'll similar easy of use as seen on Copilot.
# Conclusion

Overall I think this is a pretty nice setup. It is easy to troubleshoot if necessary and is affordable.

## Links
- [Obsidian - Sharpen your thinking](https://obsidian.md/)
- [GitHub - logancyang/obsidian-copilot: THE Copilot in Obsidian](https://github.com/logancyang/obsidian-copilot)
- [Smart Connections](https://smartconnections.app/)
- [OpenRouter](https://openrouter.ai/)
- [Ollama](https://ollama.com/)
- [nomic-embed-text](https://ollama.com/library/nomic-embed-text)
- 

You can reach out to contact me about this or other topics at my email lucas.fernandes.df@gmail.com.