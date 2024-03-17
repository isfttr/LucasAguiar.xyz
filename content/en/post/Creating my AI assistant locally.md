---
date: 2024-03-16
draft: false
title: Creating my AI assistant locally
description: For the first time I tried to break with ChatGPT and Copilot to see what I could come up with. 
featured_image: 
tags:
  - AI
  - RAG
  - ollama
  - mistral
  - privateGPT
  - M2
  - MacBook-Air
---

It surprised me how easy it was to build a local solution with [Ollama](https://ollama.com/).

# Introduction

This itch to have a private solution for AI came to me after I saw that OpenAI changed their settings on the playground section and does not allow for free users to test the models. With that I went to check Gemini but it was the same thing. Both of them are costing $20/month and for me it isn't worth it at the moment. Because of that I went looking for private ones, since I had already seen people doing running AI solution locally. Coupled with the fact that I got a new M2 MacBook Air, I decided to test the limits.

# Ollama

Ollama is the first try for me and it worked out the box. You download and run from the terminal with the command `ollama run llama2`. This command will download the model llama2 and start the program with that model already running. This specific model has around 7 billion parameters and is a little more than 3 GB in size. If you a decent connection it goes really fast. I tested it and it was surprisingly quick. Then I tested the `mistral`and `gemma`models.
The `mistral`model ran fine, but the `gemma` model did not run well and since I didn't have the time to check what was wrong, I just checked to see if there was a solution and sure enough, there seems to be one but I did not test it.

# PrivageGPT

This is the second part which is a little bit harder to implement but is easy enough to implement a Retrieval-augmented generation (RAG), which basically means that you can provide the source files to be ingested by the model and provide you with a query interface for those files. So I stumbled upon the [imartinez/privateGPT](https://github.com/imartinez/privateGPT) repository. The setup is somewhat straight forward and well document at [PrivateGPT | Docs](https://docs.privategpt.dev/installation/getting-started/installation).
The main problem that I had was with Poetry and Python versions to run the project. The project must be ran using the 3.11 version. But the more I tried it was always running with 3.12. This the workaround that made it work.

```bash
$ brew install pyenv

# Any modern version python should do. I don't think Python 2 is required any more.
$ pyenv install 3.10.3
$ pyenv global 3.10.3

# Add pyenv to your PATH so that you can reference python (not python3)
$ echo "export PATH=\"\${HOME}/.pyenv/shims:\${PATH}\"" >> ~/.zshrc
$ source ~/.zshrc

# open a new terminal window and confirm your pyenv version is mapped to python
$ which python
$ python --version

```

Also, see for reference: [Managing environments | Documentation | Poetry - Python dependency management and packaging made easy](https://python-poetry.org/docs/managing-environments/#switching-between-environments)

# Running privateGPT

To run it needs to have the `ollama` server running. This can be done in MacOS by having it open in the background, or through the command `ollama serve`.
Than, in another terminal window, run the following commands from the directory where privateGPT is. In my case I forked the repository it so I could make changes to the files with no worries.

```bash

# Pull the models, the LLM and embedding

ollama pull mistral # LLM
ollama pull nomic-embed-text # Embedding model

# Install dependencies

poetry install --extras "ui llms-ollama embeddings-ollama vector-stores-qdrant"

# Run privateGPT

PGPT_PROFILES=ollama make run
```

The interface should be available to be viewed by opening the following address on the browser [127.0.0.1:8001](http://127.0.0.1:8001/).

# Ingesting files and queries

I used a article from a research in biodegradable plastics for Bagheri et al. The ingesting can be seen in the image as the first line. After it is ingested i can query the file for information.

![Ingesting a single file](/static/images/Ingesting%20files%2020240316213238.png)

I made a question about biodegradable plastics.

![Querying the Bagheri article](/static/images/Querying%20Bagheri%2020240316213653.png)
![Querying the Bagheri article](/public/images/Querying%20Bagheri%2020240316213653.png)

Then I made a question about something that is not mentioned in the article to see what would be the answer.
Surprisingly to me it did not allucinate. It plainly answered that the subject is not discussed in the paper. You can add a large amount of documents. I already tried with markdown files and PDFs, but there a number of file extensions that are supported. Also, the ingested files are kept in place until you delete them. And this deletion is just from the ingested files. It does not mean deleting the original file.

![Querying about foreign subject to the Bagheri article](/static/images/Query%20about%20kraft%20paper%2020240316214244.png)

# Conclusion

This is private model and open source, which is somewhat simple to get set up. I tried other ones, using AnythingLLM and it didn't work. This is the easiest project to set up and there is a lot more that can be done with it. For me the integration with my Obsidian notes is the next thing that I am aiming for.

You can reach out to contact me about this or other topics at my email lucas.fernandes.df@gmail.com.
