---
date: 2024-03-16T00:00:00.000Z
draft: false
title: Criando meu assistente de IA localmente
description: >-
  Pela primeira vez, tentei romper com o ChatGPT e o Copilot para ver o que eu
  conseguia produzir.
url: /creating-local-ai/
featured_image: /images/ollama-privategpt.png
tags:
  - AI
  - RAG
  - ollama
  - mistral
  - privateGPT
  - M2
  - MacBook-Air
translation_source_hash: 468bbc8142c3e9ca3bfac62cfaf44f7490747c10b2ea94326b00539aa123c84c
---
Surpreendeu-me como foi fácil construir uma solução local com [Ollama](https://ollama.com/).

## Introdução

Essa vontade de ter uma solução privada de IA surgiu depois que vi que a OpenAI mudou as configurações na seção playground e não permite que usuários gratuitos testem os modelos. Com isso, fui verificar o Gemini, mas era a mesma coisa. Ambos estão custando US$ 20/mês e para mim não vale a pena no momento. Por causa disso, fui procurar soluções privadas, já que já tinha visto pessoas executando soluções de IA localmente. Juntamente com o fato de ter adquirido um novo M2 MacBook Air, decidi testar os limites.

## Ollama

Ollama é a primeira tentativa para mim e funcionou perfeitamente. Você baixa e executa a partir do terminal com o comando `ollama run llama2`. Este comando fará o download do modelo llama2 e iniciará o programa com esse modelo já em execução. Este modelo específico tem cerca de 7 bilhões de parâmetros e um pouco mais de 3 GB de tamanho. Se você tiver uma conexão decente, ele funciona muito rápido. Eu o testei e foi surpreendentemente rápido. Depois, testei os modelos `mistral` e `gemma`. O modelo `mistral` funcionou bem, mas o modelo `gemma` não funcionou bem e, como não tive tempo de verificar o que estava errado, apenas verifiquei se havia uma solução e, de fato, parece haver uma, mas não a testei.

## PrivateGPT

Esta é a segunda parte, que é um pouco mais difícil de implementar, mas fácil o suficiente para implementar uma Geração Aumentada por Recuperação (RAG), o que basicamente significa que você pode fornecer os arquivos-fonte para serem ingeridos pelo modelo e fornecer uma interface de consulta para esses arquivos. Então, deparei-me com o repositório [imartinez/privateGPT](https://github.com/imartinez/privateGPT). A configuração é bastante direta e bem documentada em [PrivateGPT | Docs](https://docs.privategpt.dev/installation/getting-started/installation). O principal problema que tive foi com as versões do Poetry e Python para executar o projeto. O projeto deve ser executado usando a versão 3.11. Mas quanto mais eu tentava, ele sempre executava com a 3.12. Esta foi a solução alternativa que o fez funcionar.

```bash
$ brew install pyenv

# Any modern version python should do. I don't think Python 2 is required any more.
$ pyenv install 3.11.8
$ pyenv global 3.11.8

# Add pyenv to your PATH so that you can reference python (not python3)
$ echo "export PATH=\"\${HOME}/.pyenv/shims:\${PATH}\"" >> ~/.zshrc
$ source ~/.zshrc

# open a new terminal window and confirm your pyenv version is mapped to python
$ which python
$ python --version

```

Veja também para referência: [Managing environments | Documentation | Poetry - Python dependency management and packaging made easy](https://python-poetry.org/docs/managing-environments/#switching-between-environments)

## Executando PrivateGPT

Para executá-lo, é necessário ter o servidor `ollama` em funcionamento. Isso pode ser feito no MacOS mantendo-o aberto em segundo plano, ou através do comando `ollama serve`. Em seguida, em outra janela do terminal, execute os seguintes comandos a partir do diretório onde o privateGPT está. No meu caso, fiz um fork do repositório para poder fazer alterações nos arquivos sem preocupações.

```bash

# Pull the models, the LLM and embedding

ollama pull mistral # LLM
ollama pull nomic-embed-text # Embedding model

# Install dependencies

poetry install --extras "ui llms-ollama embeddings-ollama vector-stores-qdrant"

# Run privateGPT

PGPT_PROFILES=ollama make run
```

A interface deve estar disponível para ser visualizada abrindo o seguinte endereço no navegador [127.0.0.1:8001](http://127.0.0.1:8001/).

## Ingerindo arquivos e consultas

Usei um artigo de uma pesquisa em plásticos biodegradáveis de Bagheri et al. A ingestão pode ser vista na imagem como a primeira linha. Depois de ingerido, posso consultar o arquivo para obter informações.

![Ingesting a single file](/images/Ingesting%20files%2020240316213238.png)

Fiz uma pergunta sobre plásticos biodegradáveis.

![Querying the Bagheri article](/images/Querying%20Bagheri%2020240316213653.png)

Então fiz uma pergunta sobre algo que não é mencionado no artigo para ver qual seria a resposta. Surpreendentemente para mim, ele não alucinou. Ele respondeu claramente que o assunto não é discutido no artigo. Você pode adicionar uma grande quantidade de documentos. Já tentei com arquivos markdown e PDFs, mas há várias extensões de arquivo que são suportadas. Além disso, os arquivos ingeridos são mantidos no lugar até que você os exclua. E essa exclusão é apenas dos arquivos ingeridos. Não significa excluir o arquivo original.

![Querying about foreign subject to the Bagheri article](/images/Query%20about%20kraft%20paper%2020240316214244.png)

## Conclusão

Esta é uma configuração simples de um LLM privado e de código aberto. Tentei outros, usando AnythingLLM e não funcionou, ou precisava de soluções alternativas para as quais não tenho tempo. Este foi o projeto mais fácil de configurar e há muito mais que pode ser feito com ele. Para mim, a integração com minhas notas do Obsidian é a próxima coisa que pretendo explorar.

---
Você pode entrar em contato comigo sobre este e outros tópicos em meu e-mail <contact@lucasaguiar.xyz> ou preenchendo o formulário abaixo.
