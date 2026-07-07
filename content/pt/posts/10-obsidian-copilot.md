---
date: 2025-02-04T15:00:59.000Z
draft: false
title: "Obsidian Copilot + Ollama + OpenRouter: Setup Completo e Gratuito [2026]"
description: "Aprenda a configurar o Obsidian Copilot com Ollama local ou OpenRouter. Guia passo a passo para usar IA no seu vault de notas sem depender de assinaturas."
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-obsidian-copilot.png
categories:
  - tutorial
tags:
  - technology
  - artificial-intelligence
  - obsidian
  - RAG
translation_source_hash: f9c7ba345c8b425a9b6e064caffd03ed7b553f2422d63f3793feff97a18e04e3
aliases:
  - /posts/10_obsidian-copilot/
---
Eu precisava de uma opção fácil e barata para integrar meu vault com inteligência artificial. A opção mais fácil poderia ser pagar por assinaturas, o que seria um custo alto para mim, já que eu não usaria o serviço com tanta frequência para justificar. Outra opção seria pagar por um serviço de Cloud GPU para executar grandes consultas que seriam inviáveis de executar localmente. Esta opção parecia muito complicada para o meu caso. Eventualmente, descobri o OpenRouter, que parece ser a solução mais fácil porque posso acessar vários modelos em um único lugar e também ter uma API que posso conectar a outros serviços.

Esta solução visa criar uma espécie de NotebookLM para minhas notas dentro do meu Vault Obsidian. O primeiro plugin que chamou minha atenção foi o Obsidian Copilot, que tinha um serviço de assinatura, mas também dava a opção de usar APIs de terceiros. O segundo plugin é chamado Smart Connections, que é similar. Ambos podem ser usados ao mesmo tempo.

Todos os [Links](#links) para as referências estão no final.

## Configuração

Esta é uma configuração simples passo a passo usando Obsidian, plugin Copilot, OpenRouter e Ollama.

Primeiro, crie uma conta no OpenRouter e adicione algum crédito à conta. No meu caso, adicionei 10 dólares, mas acho que você poderia adicionar menos. Depois disso, vá para sua foto (canto superior direito) e clique em Keys. Crie uma nova chave, esta chave será usada para acessar a API dos plugins dentro do Obsidian.

No Obsidian, primeiro adicione o Copilot. Acesse as configurações do plugin Copilot e clique em "Set Key". Um pop-up como o abaixo aparecerá.

![1](/images/Pasted%20image%2020250204211022.png)

Cole a chave da API que você acabou de copiar e clique em "Verificar". Uma vez verificada, vá para a aba Model. Lá, você pode adicionar os modelos que estão disponíveis no OpenRouter.

![1](/images/Pasted%20image%2020250204211334.png)

Antes de adicionar um modelo, primeiro verifique dentro do OpenRouter os modelos que estão disponíveis.

![1](/images/Pasted%20image%2020250204211446.png)

Uma vez que os modelos são adicionados, você pode definir qual será o modelo de chat padrão na aba Basic.

![1](/images/Pasted%20image%2020250204211555.png)

### Criando um modelo para o seu vault

Isso pode ser feito usando Ollama e o modelo `nomic-embed-text` (modelo de embedding). Para isso, você precisa ter o Ollama instalado localmente e o modelo de embedding baixado.

```bash
ollama serve
ollama pull nomic-embed-text
```

Com o Ollama rodando em segundo plano, vá para o seu vault e use o comando para indexar o vault.

![1](/images/Pasted%20image%2020250204211956.png)

Agora você está pronto.

Esta é uma captura de tela de uma nota dentro do meu vault. No painel direito você tem notas relacionadas por similaridade.

![1](/images/Pasted%20image%2020250204213406.png)

Ao rolar para baixo, você pode ver prompts sugeridos.

![1](/images/Pasted%20image%2020250204213447.png)

Aqui reside a diferença entre Copilot e Smart Connections. Smart Connections é capaz de pesquisar em todo o vault, não apenas na nota selecionada.

![1](/images/Pasted%20image%2020250204213748.png)

Com o Smart Connections você terá uma facilidade de uso semelhante à vista no Copilot.

### Custos

Estou usando esta configuração há uma semana. Desde então, não tive muito uso para ela, como já esperava, e abaixo estão os custos para usar os modelos. Como você pode ver, é barato executar consultas ocasionalmente.

![1](/images/Pasted%20image%2020250204230941.png)

![1](/images/Pasted%20image%2020250204230809.png)

Você pode visitar a página Model e ver por si mesmo os custos para executar cada modelo.

![1](/images/Pasted%20image%2020250204231200.png)

## Conclusão

No geral, acho que esta é uma configuração muito boa. É fácil de solucionar problemas, se necessário, e é acessível. Como uso meu vault quase todos os dias, fica mais fácil para mim gerenciar a configuração, em vez de ter que ir a um serviço diferente toda vez que tenho a necessidade. Além disso, o OpenRouter pode ser usado diretamente para conversar, em vez de depender do chat dentro do Obsidian.

## Links

- [Obsidian - Afie seu pensamento](https://obsidian.md/)
- [GitHub - logancyang/obsidian-copilot: O Copilot no Obsidian](https://github.com/logancyang/obsidian-copilot)
- [Smart Connections](https://smartconnections.app/)
- [OpenRouter](https://openrouter.ai/)
- [Ollama](https://ollama.com/)
- [nomic-embed-text](https://ollama.com/library/nomic-embed-text)
- [Assistente de IA Local](3_local-ai-assistant)


Você pode entrar em contato comigo sobre este ou outros tópicos pelo meu e-mail <contact@lucasaguiar.xyz>.

Leia também:

- [Criando meu assistente de IA localmente]({{< relref "posts/creating-my-ai-assistant-locally/" >}})
- [Dentro dos Cérebros de IA: Como a Anthropic Decifrou o Processo de Pensamento de Claude]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [Da Procrastinação ao Progresso: Como a IA me tem ajudado]({{< relref "posts/ai-beats-procrastination/" >}})
