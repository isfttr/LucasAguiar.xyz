---
date: 2025-04-10T16:36:59.000Z
draft: false
title: 'Duas Semanas com GitButler: Otimizando Meu Fluxo de Trabalho Git'
description: >-
  Minha experiência usando GitButler como um substituto para ferramentas
  tradicionais de fluxo de trabalho Git, incluindo o que funciona bem e algumas
  limitações.
url: ''
featured_image: 'https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png'
categories:
  - article
tags:
  - git
  - workflow
  - gitbutler
  - developer-tools
  - productivity
  - version-control
translation_source_hash: 5814dee34f078540d18be426d431906903d5646448379d20a668614657247259
---
Tenho usado [GitButler](https://docs.gitbutler.com/) há cerca de duas semanas e ele já transformou a forma como interajo com o Git. Como alguém que regularmente lida com múltiplas branches de features e troca de contexto entre tarefas, eu estava procurando uma ferramenta que pudesse simplificar meu fluxo de trabalho Git. O GitButler chamou minha atenção com sua promessa de branches virtuais e recursos de colaboração simplificados.

Meu interesse foi ainda mais despertado depois de assistir a apresentações de Scott Chacon, um dos criadores do GitButler e também co-fundador do GitHub. Seu profundo conhecimento de Git é evidente em palestras como [esta](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s), e isso se reflete em como o GitButler conseguiu criar uma experiência Git quase sem atritos.

## O que é o GitButler?

Para quem não conhece, o GitButler é uma aplicação desktop projetada para modernizar os fluxos de trabalho Git. Ele introduz o conceito de "branches virtuais" que permitem trabalhar em múltiplas funcionalidades simultaneamente sem a sobrecarga do gerenciamento de branches tradicional do Git. Ele também fornece uma interface visual para operações Git comuns e visa otimizar a colaboração através de mensagens de commit automatizadas e geração de PRs.

Curiosamente, algumas das ideias do GitButler parecem ser influenciadas por sistemas de controle de versão alternativos como o Jujutsu, que foi construído por engenheiros do Google. Recentemente, assisti a um [episódio do podcast Bits and Booze sobre Jujutsu](https://www.youtube.com/watch?v=dwyMlLYIrPk) que apresentou um fluxo de trabalho diferente do Git tradicional. Por exemplo, no Jujutsu, você pode iniciar um novo "commit" e tudo o que é feito entre esse ponto e o próximo início é automaticamente commitado — um conceito que parece ter inspirado parte da abordagem do GitButler para gerenciar mudanças. Recomendo muito assistir ao episódio se você estiver interessado na evolução dos sistemas de controle de versão.

## Como é Usar o GitButler

Assim que você instala o GitButler pela primeira vez, terá que configurar seu primeiro repositório local. Você terá algumas opções para fazer isso:

1. Criar um novo repositório do zero.
2. Clonar um repositório existente de um local remoto.

Além disso, o GitButler oferece uma ótima integração com o GitHub, principalmente para criar pull requests, e recursos de IA para criar mensagens de commit e pull requests. Esses recursos têm sido particularmente úteis para mim.

![Captura de tela da configuração do repositório GitButler](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-repo-setup.png)

Depois de escolher seu repositório local, você será recebido com uma interface limpa que exibe seu repositório atual e suas branches. A barra lateral esquerda fornece uma lista de suas branches virtuais, que você pode criar, excluir e alternar. A barra lateral direita exibe o status do seu repositório, incluindo quaisquer alterações não commitadas. Além disso, você também pode mover os arquivos alterados para uma nova branch ou outra branch existente. Cada alteração que você faz será colocada na "lane" padrão, e se você tiver mais de uma branch ("lane") aplicada, poderá definir "lanes" ativas para receber automaticamente essas alterações. Esse recurso me deixou um pouco confuso no início, mas depois de um tempo, tornou-se algo natural.

![Captura de tela do espaço de trabalho GitButler](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-workspace.png)

As mensagens de commit podem ser geradas por IA depois que você seleciona os arquivos ou trechos de código alterados que deseja commitar. O GitButler analisará as alterações e sugerirá uma mensagem de commit com base nas alterações feitas, e é realmente útil quando algo dá errado. Costumo usá-lo e adicionar outras informações que podem ser úteis para o futuro.

![Captura de tela da mensagem de commit do GitButler](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-commit.png)

## Minha Experiência Até Agora

Após duas semanas de uso consistente, o GitButler substituiu completamente meu uso do Git na linha de comando e dentro do meu editor de código. O gerenciamento visual de branches tem sido particularmente útil, permitindo-me alternar rapidamente entre diferentes tarefas sem a sobrecarga mental de guardar ou commitar mudanças em andamento.

### O que está funcionando bem

1. **Branches Virtuais**: A capacidade de trabalhar em múltiplas funcionalidades simultaneamente sem a troca tradicional de branches tem sido um divisor de águas. Posso facilmente alternar o contexto entre diferentes tarefas sem me preocupar em guardar alterações ou criar commits bagunçados.

2. **Interface Visual**: A UI é intuitiva e torna as operações Git mais acessíveis. Poder ver exatamente quais arquivos são alterados em cada branch virtual me ajudou a evitar incluir acidentalmente mudanças não relacionadas em commits.

3. **Integração Perfeita**: Apesar de ser uma aplicação separada, o GitButler se integra bem com o meu fluxo de trabalho existente. Não precisei mudar significativamente a forma como trabalho para acomodar a ferramenta.

4. **Gerenciamento de Commits**: Criar commits granulares e significativos é muito mais fácil com a interface visual, permitindo-me selecionar mudanças específicas para incluir.

### Limitações Atuais

Apesar da experiência geral positiva, encontrei algumas limitações:

1. **Problemas com o Modelo Local do Ollama**: Tenho estado ansioso para experimentar os recursos de geração de mensagens de commit e pull request alimentados por IA usando os modelos locais do Ollama. Infelizmente, essa funcionalidade não parece estar funcionando corretamente no momento. Pelo que entendi, este é um problema conhecido que ainda não foi corrigido.

2. **Convenções de Nomenclatura de Branches**: As convenções de nomenclatura padrão para branches não são as minhas favoritas. No entanto, como as branches virtuais no GitButler são tão efêmeras, isso não me incomodou o suficiente para realmente alterá-las. A facilidade de criar e gerenciar branches supera o pequeno incômodo de seus nomes gerados automaticamente.

3. **Curva de Aprendizagem**: Embora a interface seja intuitiva, ainda há uma pequena curva de aprendizado ao se adaptar inicialmente ao conceito de branch virtual, especialmente se você está profundamente enraizado em fluxos de trabalho Git tradicionais.

## Olhando Para o Futuro

Estou particularmente interessado em ver como a integração do Ollama se desenvolverá assim que os [problemas](https://github.com/gitbutlerapp/gitbutler/issues/5862#issuecomment-2756082477) forem corrigidos. Ter mensagens de commit e descrições de PR geradas localmente e contextualmente, sem enviar código para serviços externos, seria uma vantagem significativa.

Vale ressaltar que, com a vasta experiência de Scott Chacon em Git (como demonstrado em suas [apresentações técnicas](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s)), há bons motivos para ser otimista quanto ao desenvolvimento futuro do GitButler. O aplicativo já demonstra um profundo entendimento do que torna o Git poderoso, ao mesmo tempo em que aborda muitos de seus pontos problemáticos.

Também estou curioso para ver como o GitButler continua a incorporar ideias inovadoras de sistemas de controle de versão alternativos como o Jujutsu. Como o [podcast sobre Jujutsu](https://www.youtube.com/watch?v=dwyMlLYIrPk) revelou, existem algumas abordagens fascinantes para o controle de versão que diferem significativamente do modelo do Git, e o GitButler parece estar unindo alguns desses conceitos em uma ferramenta mais acessível.

Mesmo com as limitações atuais, o GitButler já se mostrou valioso o suficiente para se tornar minha interface Git principal. Os ganhos de produtividade com o gerenciamento simplificado de branches por si só justificam a mudança.

## Conclusão

Após duas semanas de uso, posso afirmar com confiança que o GitButler melhorou meu fluxo de trabalho com Git. O conceito de branches virtuais resolve elegantemente muitos dos pontos problemáticos associados à troca de contexto entre tarefas, e a interface visual torna as operações complexas do Git mais acessíveis.

Embora ainda existam alguns recursos que precisam de refinamento (principalmente a integração do Ollama para mensagens de commit e pull requests automáticas), o aplicativo tem sido estável e confiável para meu uso diário. Não encontrei nenhuma experiência negativa que me fizesse considerar retornar ao meu fluxo de trabalho anterior.

Se você trabalha frequentemente em múltiplas funcionalidades em paralelo ou se sente frustrado com o gerenciamento tradicional de branches do Git, o GitButler definitivamente vale a pena explorar. A equipe por trás dele parece receptiva ao feedback, e estou otimista sobre como a ferramenta continuará a evoluir.

## Referências

- [Jujutsu - Um VCS compatível com Git](https://www.youtube.com/watch?v=LV0JzI8IcCY) - Apresentação de Martin von Zweigbergk no GitMerge 2024 explicando os princípios de design e as funcionalidades do Jujutsu.
- [Demonstração do Produto GitButler](https://www.youtube.com/watch?v=agfyTN3HpRM) - Uma visão geral e demonstração dos recursos principais e melhorias de fluxo de trabalho do GitButler.

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
