---
date: 2024-03-22
draft: true
title: Creating my AI assistant locally - part 2
description: Using a script to automate the process of running my local AI model
url: "/creating-local-ai-part2/"
featured_image: "/images/ollama-privategpt-2.png"
tags:
  - AI
  - RAG
  - ollama
  - mistral
  - privateGPT
  - M2
  - MacBook-Air
---

This is the part 2 of the first post about the a local AI assistant. See more at [Part 1](<../../Creating my AI assistant locally.md>).

The main problem that I faced running the configuration was that I needed to run at least three commands on the terminal to get everything running. This is far from perfect, I wanted it to work just like a normal application. 

First, I forked the [imartinez/privateGPT](https://github.com/imartinez/privateGPT) repository into my own. You can visit it at [isfttr/privateGPT](https://github.com/isfttr/privateGPT).

Clone the repository:

```bash
git clone https://github.com/isfttr/privateGPT.git & cd /privateGPT

```

Once at the repository, you can run the script using the command

```bash
./run-privateGPT.sh
```

The script is simple but the name of the repository folder must be "privateGPT" to work out of the box. If not, you can open the script `run-privateGPT.sh` and change the folder name to what is being used.

```bash
# Change directory to the desired folder
cd $HOME/privateGPT
```

Well, as I said this is mainly a change for my self so I didn't had to overcomplicate it.

### Contacts

You can reach out to contact me about this or other topics at my email lucas.fernandes.df@gmail.com.
