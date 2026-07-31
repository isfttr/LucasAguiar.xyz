---
date: 2026-07-31T18:06:04.000Z
draft: true
title: 'Portabilidade de Sessões de IA: Por que Suas Conversas com IA Estão se Tornando Lock-In [2026]'
description: 'Sessões de IA estão caminhando para o aprisionamento: raciocínio criptografado, busca oculta, compactação opaca. Os 5 testes de portabilidade — e como manter suas transcrições sob seu controle.'
featured_image: ''
categories:
  - article
tags:
  - ai
  - llm
  - ai-agents
  - privacy
  - open-source
slug: portabilidade-sessoes-ia-conversas-lock-in
translation_source_hash: fe13cb38486d8ae5a4a66d3e1796a50ce54e2de9f03e4f2b4f13bc60cea26338
---
A promessa original de uma API de inferência era maravilhosamente simples: enviar alguma entrada, receber alguma saída e, se você guardasse ambas, ficava com a conversa. Você poderia inspecioná-la, arquivá-la, reproduzi-la ou entregá-la a um modelo diferente. A transcrição pertencia a você.

Essa abstração está se rompendo silenciosamente. Uma parcela crescente do que uma sessão de IA produz — tokens de raciocínio, evidências de busca, estado de compactação, mensagens entre agentes — é retornada como blobs criptografados e vinculados ao provedor, que apenas o modelo original consegue interpretar. Um ensaio de [Earendil Engineering](https://earendil.com/posts/session-portability/) intitulado *A Sessão Que Você Não Pode Levar com Você* defendeu exatamente esse argumento e chegou ao topo do [Hacker News](https://news.ycombinator.com/item?id=49118781) esta semana, com cerca de 700 votos positivos e 200 comentários. Este post explora o que a portabilidade de sessão significa, por que os provedores estão corroendo isso e o que você pode fazer hoje para manter suas conversas de IA suas.

## O que "portátil" significa de fato

Portabilidade não exige que um modelo diferente produza o mesmo próximo token. Modelos diferem em capacidades, janelas de contexto e ferramentas — isso é um dado. A barra é mais modesta:

```js
const transcript = session.export();
revokeCredentials(oldProvider);
session = newProvider.continueFrom(transcript);
```

O arquivo deve conter informação inteligível suficiente para outro modelo continuar o trabalho, sem que o provedor antigo precise desreferenciar um ID, descriptografar um blob ou reconstruir um resumo. Isso dá cinco testes práticos:

- **Inspeção** — você consegue ver o que o modelo viu, o que as ferramentas fizeram e o que os agentes disseram uns aos outros?
- **Exportação** — a sessão é autocontida, além de artefatos que você também pode baixar?
- **Reprodução** — outra implementação consegue reconstruir um contexto semanticamente equivalente?
- **Auditoria** — um humano consegue explicar por que o sistema tomou uma ação depois do fato?
- **Exclusão** — você consegue identificar e remover todas as cópias no lado do servidor das quais a sessão depende?

## A tendência ao estado selado pelo provedor

### Tokens de raciocínio criptografados

Todos os principais laboratórios alegam razões legítimas para não expor a cadeia de pensamento bruta, e em modelos de pesos fechados você normalmente não a vê. Mas a criptografia que a substitui não é um recurso de privacidade sob seu controle. A Anthropic retorna o raciocínio completo em um campo `signature`; o texto "thinking" legível, quando habilitado, é um resumo produzido por outro modelo — e a documentação diz que os blocos de pensamento estão vinculados ao modelo que os produziu e devem ser removidos ao trocar de modelo. A OpenAI, com `store: false`, retorna `encrypted_content` que o cliente deve preservar e reproduzir. O termo de Earendil para isso é **estado selado pelo provedor**: a criptografia não esconde os dados do provedor de inferência, ela os esconde de você. Abordamos a fronteira de interpretabilidade desse raciocínio opaco em [Dentro dos Cérebros de IA: Como a Anthropic Decodificou o Processo de Pensamento de Claude]({{< relref "posts/anthropic-thinking-process-paper/" >}}).

### Conversas armazenadas transformam transcrições em ponteiros

A API Responses da OpenAI armazena objetos de resposta por padrão (pelo menos 30 dias), e encadear turnos via `previousResponseId` significa que seu registro local se torna uma chave estrangeira em um banco de dados que você não controla. A nova API Gemini Interactions do Google usa `store: true` como padrão — 55 dias em planos pagos, um dia no gratuito. `store: false` existe e deveria ser o padrão documentado, não uma opção de exclusão que você precisa conhecer.

### Buscas ocultas

A busca hospedada é o exemplo mais claro de uma transcrição com buracos. Uma ferramenta de busca no lado do cliente se comporta como qualquer outra ferramenta: a consulta, a classificação, as passagens recuperadas e os carimbos de data/hora podem ser registrados e reproduzidos. Com busca hospedada pelo provedor, você recebe citações e URLs — mas não a classificação, nem as passagens extraídas, nem o material que foi filtrado. Uma URL não é uma evidência estável: seu conteúdo muda, e ela pode ter sido reduzida a um trecho curto antes de o modelo vê-la. O próximo modelo recebe uma resposta e alguns links, não a evidência que o primeiro modelo realmente usou.

### Compactação opaca

Sessões longas de agentes eventualmente precisam de compactação, e aqui a divergência entre provedores é acentuada. A compactação no lado do servidor da OpenAI emite um item criptografado descrito como "opaco e não destinado a ser interpretável por humanos"; o endpoint `/responses/compact` retorna uma "próxima janela de contexto canônica" que os clientes devem repassar como está. A compactação no lado do servidor da Anthropic, por outro lado, retorna um campo de conteúdo legível, permite que você forneça instruções personalizadas de resumo e produz um resumo que você pode inspecionar e passar para outro modelo. Um artefato selado pode preservar mais estado específico do modelo, mas deve acompanhar um resumo de repasse legível — não substituí-lo.

### Subagentes vêm com instruções ocultas

Sistemas multiagente agravam o problema, porque não existe mais uma única transcrição — há uma árvore de sessões. O beta multiagente hospedado da API Responses da OpenAI retorna itens `multi_agent_call` e `agent_message` cujo conteúdo é criptografado, ativa a compactação no lado do servidor automaticamente e injeta instruções de raiz e de subagentes que você não pode editar ou remover. Uma mudança relacionada chegou ao cliente Codex de código aberto em junho de 2026: o commit *"Encrypt multi-agent v2 message payloads"* substituiu o argumento `message` do pai por texto cifrado, deixando o próprio `InterAgentCommunication.content` do Codex vazio. Quando um agente filho altera o arquivo errado ou vaza um segredo, o usuário não consegue responder à pergunta mais simples: *o que foi pedido que esse agente fizesse?*

## Por que isso importa mesmo que você nunca troque de modelo

A maioria das pessoas não troca de provedor no meio de uma sessão. Mas a opção de sair é o que cria disciplina: se o seu contexto acumulado só pode ser interpretado por um provedor, ele deixa de competir em qualidade, preço, confiabilidade e confiança. E você pode precisar mover uma sessão por motivos que nada têm a ver com preferência — um modelo é descontinuado, um serviço sai do ar, um preço muda, uma política bloqueia a próxima solicitação, uma fase confidencial precisa ser executada localmente, ou um auditor precisa reconstruir o que aconteceu. Os agentes estão tornando as sessões muito mais longas: uma sessão de programação ou pesquisa acumula dias de decisões e evidências, e um assistente pessoal pode acumular transcrições que remontam a anos.

## O que uma API de inferência portátil deveria prometer

Earendil propõe um pequeno conjunto de regras que vale a pena adotar como lista de verificação ao avaliar ferramentas de IA:

1. **O log de eventos local é canônico** — o cliente consegue reconstruir a sessão sem desreferenciar IDs de servidor.
2. **O armazenamento é explícito** — `store: false` simples, documentado e, de preferência, o padrão.
3. **Nenhum item opaco é o único portador de significado** — todo artefato criptografado tem um repasse legível e neutro em relação ao provedor.
4. **Ferramentas hospedadas têm logs com fidelidade total** — entradas, saídas, evidências, proveniência e hashes exatos, não apenas citações.
5. **A comunicação de subagentes é auditável** — tarefa, mensagens, linhagem, modelo e permissões legíveis para cada agente.
6. **A compactação é inspecionável** — resumo legível mais as instruções usadas para criá-lo.
7. **Artefatos são exportáveis** — arquivos e snapshots baixáveis para um arquivo local.

## O que você pode fazer hoje

- **Desative a retenção quando disponível**: defina `store: false` na API Responses da OpenAI e na API Gemini Interactions, e prefira APIs que não persistem estado por padrão.
- **Mantenha suas próprias transcrições**: clientes local-first e logs de eventos fornecem inspeção, reprodução e auditoria mesmo quando o provedor não oferece nenhuma.
- **Torne os repasses legíveis**: prefira a sumarização no lado do cliente, que você pode revisar e editar, em vez de compactação selada.
- **Execute modelos de pesos abertos localmente** quando continuidade, confidencialidade ou propriedade de longo prazo importarem — modelos abertos menores que rodam no seu próprio hardware, como [SubQ: O Primeiro LLM Totalmente Subquadrático]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}}), também são uma proteção contra o aprisionamento ao provedor.

A liberdade mínima é simples: você deve conseguir fechar uma conta, manter uma sessão e entregá-la a outro modelo. O novo modelo pode discordar, fazer perguntas ou ter desempenho pior — mas não deveria estar encarando texto cifrado onde o modelo antigo via seu histórico, evidências e trabalho delegado. APIs com estado são aceitáveis; atrelar melhor desempenho a menos controle do usuário não é.

Leia também:

- [Dentro dos Cérebros de IA: Como a Anthropic Decodificou o Processo de Pensamento de Claude]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [SubQ: O Primeiro LLM Totalmente Subquadrático — Comparação de Custos com Transformers [2026]]({{< relref "posts/subq-subquadratic-llm-atencao-linear-comparacao-custos-2026/" >}})
- [Dentro dos Cérebros de IA: Como a Anthropic Decodificou o Processo de Pensamento de Claude]({{< relref "posts/anthropic-thinking-process-paper/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
