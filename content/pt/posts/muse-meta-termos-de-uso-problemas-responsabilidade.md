---
date: 2026-10-18T10:15:14-03:00
draft: false
title: "Termos de uso do Muse da Meta: o que um usuário comum precisa saber antes de conectar suas contas"
description: "Guia sobre os problemas dos termos de uso e política de privacidade do Muse (agente de IA da Meta): treinamento por padrão, teto de responsabilidade de US$ 250, arbitragem e o que fazer na prática."
featured_image: ""
categories:
  - article
tags:
  - ia
  - privacidade
  - direito-digital
  - termos-de-uso
  - meta
---
O Muse, agente pessoal de IA da Meta, chegou com uma promessa de privacidade e segurança, mas os documentos que regulam o serviço — termos suplementares e política de privacidade — escondem pontos que merecem atenção antes de você conectá-lo à sua caixa de e-mail, agenda ou conta bancária. Este guia resume os principais problemas encontrados nesses contratos, explica os limites de responsabilidade da Meta em caso de falha e dá recomendações práticas para um usuário comum.

A análise abaixo baseia-se nos documentos oficiais do serviço: os [termos suplementares do Muse](https://muse.ai/terms), a [política de privacidade](https://muse.ai/privacy), os [termos de IA da Meta](https://www.facebook.com/legal/ai-terms) e a [documentação técnica de segurança](https://research.meta.ai/blog/security-and-safety-for-ai-agents-our-approach-with-muse). Nem todos os termos puderam ser conferidos na íntegra durante a consulta — alguns trechos vêm de reproduções públicas —, então trate as cláusulas exatas como sujeitas à confirmação da versão aplicável.

## A Meta pode ler o que você compartilha com o Muse

A resposta curta é: sim, a Meta pode acessar mensagens e outros dados disponibilizados ao Muse, nas condições descritas pela própria empresa. Não existe hoje uma garantia de que suas conversas sejam tecnicamente inacessíveis à Meta.

A Meta informa que o acesso de funcionários é restringido por políticas operacionais, mas a arquitetura atual não impede o acesso da própria empresa quando necessário. Isso não significa que qualquer funcionário possa ler tudo livremente — a proteção depende também de controles internos. A prometida **Confidential VM**, que criptografaria a máquina virtual com uma chave somente na mão do usuário, ainda aparece como recurso futuro.

## Os principais problemas de privacidade

| Problema | Consequência para você |
|---|---|
| **Treinamento ativado por padrão** | Conversas, chamadas de ferramentas e interações podem alimentar o treinamento de modelos após a remoção de identificadores. Você precisa desativar essa opção no menu de configurações. |
| **Remover identificadores não elimina conteúdo confidencial** | Tirar o nome ou o e-mail não remove uma fórmula, estratégia comercial, informação médica ou a descrição de uma invenção ainda não publicada. |
| **Desativar treinamento não impede todo acesso** | A opção trata de uma finalidade específica. Ela não impede o processamento operacional, o suporte ou as verificações de segurança. |
| **Promessa sobre anúncios tem alcance limitado** | A Meta declara que conversas e dados da máquina virtual não são compartilhados com seus sistemas de anúncios, mas reconhece que navegação, compras e reservas feitas pelo agente podem influenciar anúncios indiretamente. |

Há ainda três problemas adicionais: excluir conteúdo pode não apagar a memória derivada (o agente pode seguir lembrando informações aprendidas de itens excluídos, exigindo uma ação adicional de esquecimento); a retenção de registros é pouco determinada nos termos; e há um mecanismo de unificação de contas quando o Muse participa da mesma Central de Contas de outros produtos. Uma opção de exclusão na interface não prova, sozinha, a eliminação de todas as cópias, incluindo backups e inferências.

## As cláusulas contratuais mais desfavoráveis

| Cláusula reportada | Objeção sob a perspectiva do usuário |
|---|---|
| **Responsabilidade do usuário pelos atos do Muse** | Tenta colocar no consumidor o risco de uma ferramenta cuja implementação ele não controla. A aplicação a falhas do próprio serviço é questionável. |
| **Assunção dos riscos financeiros** | Transfere ao usuário perdas, limites, monitoramento e contestação de operações. É especialmente desfavorável quando o agente interpreta incorretamente uma instrução. |
| **Ausência de garantia de cumprimento das instruções** | A empresa oferece execução de tarefas, mas busca limitar consequências contratuais quando a execução falha. |
| **Teto de responsabilidade** | As reproduções indicam o maior valor entre **US$ 250 e os pagamentos dos 12 meses anteriores**, inclusive para determinadas ações erradas ou não autorizadas. |

Há exceções reportadas ao limite, como dolo, fraude e negligência grave — ou seja, o teto não é absoluto. Outras cláusulas merecem atenção:

- **Renúncia ampla a reclamações**: há disposição que procura afastar reclamações relacionadas a conteúdo e ações dos agentes. Qualquer interpretação que abrangesse defeitos de segurança ou descumprimento do serviço seria questionável.
- **Arbitragem individual e restrição a ações coletivas**: o regime vale para residentes nos EUA e no Canadá, com possibilidade de recusa da arbitragem em 30 dias. É uma restrição relevante à forma de buscar reparação, dependendo da jurisdição.
- **Licença ampla sobre conteúdo, inclusive de serviços conectados**: a cláusula concede licença mundial, gratuita, transferível e sublicenciável, limitada à prestação, manutenção, segurança e melhoria do Muse. Isso não é transferência de titularidade, mas exige cautela com documentos de terceiros, material sob NDA e conteúdo institucional.
- **Atribuição ao usuário das transferências para terceiros**: o contrato trata o envio a serviços conectados como dirigido pelo usuário, o que pode ser contestado quando o agente escolhe dados ou destinatários além do que foi claramente autorizado.

## O limite de responsabilidade da Meta em caso de falha

O ponto central para entender o risco real do serviço está no teto de responsabilidade: **US$ 250 ou o valor pago nos 12 meses anteriores, o que for maior**, inclusive para "transações não intencionais" executadas pelo agente. Isso significa que, se o Muse fizer uma compra errada, enviar um e-mail indevido ou causar um prejuízo financeiro maior, a exposição da Meta é limitada — e o usuário assume "todo o risco de perda financeira decorrente dessas ações" e é declarado "unicamente responsável" pela supervisão.

Na prática: o prejuízo possível com um agente autônomo conectado a contas bancárias ou a um e-mail profissional pode superar facilmente esse teto. Essa é a razão técnica e jurídica pela qual a recomendação de cautela não é mera teoria.

## Como essas cláusulas se comportam no Brasil

Estar escrito no contrato não torna uma cláusula automaticamente válida. Se o **Código de Defesa do Consumidor (CDC)** for aplicável, há fundamentos fortes para questionar a exoneração de responsabilidade por defeitos, a renúncia de direitos, a desvantagem exagerada e a arbitragem compulsória — especialmente pelo artigo 51, que declara nulas cláusulas que coloquem o consumidor em desvantagem exagerada.

Pela **LGPD**, quando o tratamento de dados depende de consentimento, ele precisa ter finalidades determinadas; autorizações genéricas são nulas. Existem direitos de acesso, informação sobre compartilhamento, revogação e eliminação, com exceções legais. Conceder acesso técnico à caixa de e-mail não resolve, por si só, a licitude de todos os usos posteriores dos dados, inclusive dos interlocutores.

## Recomendações práticas para o usuário comum

Com base nos problemas encontrados, estas são as recomendações para quem quer usar o Muse sem exposição desnecessária:

- **Não conecte e-mail institucional, pedidos de patente ainda não publicados, pareceres internos ou informações sob sigilo** sem uma avaliação contratual específica.
- **Desative o treinamento** (Settings → Data Controls → "Help improve our AI models"). É uma medida útil, mas não transforma o Muse em um ambiente com garantia de sigilo profissional.
- **Use uma conta separada** com dados sem confidencialidade para experimentar o serviço.
- **Ative a aprovação individual para envios e transações** em vez de permitir ações automáticas.
- **Revise periodicamente os registros de atividade** do agente (o "audit trail" disponível) e revogue o acesso de qualquer serviço conectado que não estiver em uso.
- **Antes de qualquer uso profissional, verifique a versão atual dos termos**, pois nem todos os trechos puderam ser conferidos na íntegra e as cláusulas mudam.

## Os problemas judiciais da Meta com adolescentes e crianças nos EUA

A análise dos termos do Muse se conecta a um histórico maior: a Meta enfrenta há anos, nos Estados Unidos, uma frente judicial e regulatória sobre o impacto de seus produtos em menores. O padrão vale de contexto para entender como a empresa trata (e limita) sua responsabilidade.

**Ação dos estados (N.D. da Califórnia).** Em outubro de 2023, mais de 30 estados e o Distrito de Columbia processaram a Meta, acusando-a de projetar Facebook e Instagram para gerar uso compulsivo por crianças e adolescentes, enganar sobre segurança e coletar ilegalmente dados de menores (COPPA). [1][2] O julgamento começou em agosto de 2026, com a juíza Yvonne Gonzalez Rogers à frente; a defesa da Meta foi a negação de responsabilidade. [3]

**Acordo de agosto de 2026.** O julgamento foi encerrado por um acordo que envolveu 51 procuradores-gerais estaduais, sujeito a aprovação do tribunal. A Meta se comprometeu a pagar até ~US$ 17 bilhões em dez anos (a Reuters citou ~US$ 18 bilhões) e a adotar mudanças estruturais nos produtos para menores de 18 anos: limite de uso padrão de 2 horas por dia, bloqueio noturno removível apenas por pais ou responsáveis, restrições a notificações, verificações de idade, controles parentais e um auditor independente. [4][2] A Meta negou culpa mesmo ao assinar o acordo.

**Outros fronts.** Em maio de 2026, a Meta pediu a um juiz da Califórnia que anulasse um "veredicto marco" de danos pessoais por vício em redes sociais; em julho de 2026, enfrentou julgamentos no Tennessee sobre alegações de que o Instagram foi "desenhado para ser viciante" e que a empresa teria ignorado sua própria pesquisa sobre danos a adolescentes (Reuters, bloqueado a curl — URLs canônicas confirmadas). [5][6] O procurador-geral do Novo México também processou a Meta por proteção insuficiente de menores contra predadores e conteúdo de abuso, e a Meta contestou um plano estadual de ~US$ 37 bilhões. [7]

**Como a Meta reage.** O padrão recorrente é: negar responsabilidade nas cortes e na comunicação pública, buscar anular veredictos ou reduzir reparações, e ao mesmo tempo anunciar mudanças de produto sob pressão — ampliar controles de conteúdo para adolescentes, reforçar controle parental e novas salvaguardas de IA para menores. [8] Há ainda um movimento inverso: por meio da associação NetChoice, a Meta já litigou contra leis estaduais que protegem menores, como a lei da Califórnia sobre feeds "aditivos" (SB 976). [9]

A conexão com o Muse é direta: tanto nos termos do serviço quanto na defesa em juízo, a Meta estrutura sua exposição para transferir ao usuário — inclusive ao usuário adolescente — o risco das decisões do produto, ao mesmo tempo em que limita o próprio teto de responsabilidade.


**Fontes:**
1. [The Guardian — Estados processam a Meta por danos a jovens usuários](https://www.theguardian.com/technology/2023/nov/27/meta-instagram-facebook-kids-addicted-lawsuit)
2. [Wikipedia — People of the State of California v. Meta Platforms, Inc.](https://en.wikipedia.org/wiki/People_of_the_State_of_California_v._Meta_Platforms,_Inc.)
3. [The Guardian — Julgamento da Meta sobre privacidade de crianças](https://www.theguardian.com/technology/2026/aug/22/meta-trial-children-privacy)
4. [Procuradoria-geral da Califórnia — Acordo de US$ 17 bi](https://oag.ca.gov/news/press-releases/attorney-general-bonta-secures-transformative-17-billion-settlement-meta)
5. [Reuters — Meta pede anulação de veredicto sobre vício (bloqueado a curl)](https://www.reuters.com/legal/litigation/meta-asks-california-judge-throw-out-landmark-social-media-addiction-verdict-2026-05-06)
6. [Reuters — Julgamento no Tennessee (bloqueado a curl)](https://www.reuters.com/legal/litigation/meta-faces-tennessee-trial-over-allegations-instagram-was-designed-be-addictive-2026-07-20)
7. [Wikipedia — Raúl Torrez](https://en.wikipedia.org/wiki/Raúl_Torrez)
8. [Reuters — Meta reforça controles para adolescentes (bloqueado a curl)](https://www.reuters.com/legal/litigation/meta-expands-teen-content-controls-globally-tests-new-instagram-tool-diversify-2026-06-02)
9. [Wikipedia — NetChoice v. Bonta](https://en.wikipedia.org/wiki/NetChoice_v._Bonta)

## Conclusão

O Muse é um produto tecnicamente interessante, mas seus contratos transferem ao usuário boa parte do risco de um agente autônomo — incluindo um teto de responsabilidade que pode ser muito inferior ao prejuízo real, sobretudo em uso profissional. A privacidade declarada ("não compartilhamos conversas com o sistema de anúncios") não equivale a uma garantia geral de confidencialidade. Antes de dar a um agente de IA acesso à sua caixa de entrada ou à sua conta bancária, vale ler o que está no contrato — e intuir que o que a interface oferece pode não cobrir o que o contrato exclui.

Leia também:

- [Portabilidade de Sessões de IA: Por que Suas Conversas com IA Estão se Tornando Lock-In [2026]]({{< relref "posts/ai-session-portability-guide-2026/" >}})
- [Claude Tag e o risco à propriedade intelectual das empresas]({{< relref "posts/claude-tag-propriedade-intelectual-empresarial/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
