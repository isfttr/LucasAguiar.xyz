---
date: 2026-08-19T18:08:12.000Z
draft: true
title: 'Sondas de Saúde do Kubernetes Explicadas: Liveness, Readiness e Startup [2026]'
description: 'Guia completo sobre sondas de saúde do Kubernetes: liveness vs readiness vs startup, exemplos reais de YAML, erros de configuração comuns e como as sondas evitam loops de reinicialização e tráfego descartado durante rollouts.'
featured_image: ''
categories:
  - article
tags:
  - kubernetes
  - devops
  - homelab
  - containers
  - observability
slug: sondas-saude-kubernetes-liveness-readiness-startup
translation_source_hash: 0347c1ef27a160c4f51edd1199234e11c246c3fb814603c1b8c47f0144bd627e
---
As sondas de integridade do Kubernetes — vivacidade (liveness), prontidão (readiness) e inicialização (startup) — são o mecanismo que informa ao cluster se um contêiner está realmente saudável, e não apenas em execução. Configurá-las errado resulta em loops de reinicialização que levam horas para serem resolvidos, tráfego perdido durante rollouts, ou pods que permanecem “Ready” enquanto respondem com erros. Configurá-las certo e o cluster se auto-recupera sem intervenção humana. Este guia explica como cada tipo de sonda funciona, como configurá-las com YAML real e os erros de configuração que mais causam problemas.

## Por que as sondas existem: “Running” não é “Ready”

Quando um contêiner é iniciado, o kubelet o marca como Ready quase imediatamente — mesmo que o aplicativo interno ainda esteja inicializando, conectando-se a um banco de dados ou carregando modelos. O contêiner está em execução, mas ainda não pode servir tráfego. Sem sondas, o Kubernetes não tem como saber a diferença.

Este é um modo de falha clássico em homelabs e clusters pequenos: você reinicia um pod (ou um nó o drena), e durante os segundos ou minutos que o aplicativo leva para iniciar, as requisições falham mesmo com o pod reportando Ready. As sondas fecham essa lacuna fazendo o kubelet verificar ativamente a saúde do contêiner.

Há três tipos de sonda, cada um respondendo a uma pergunta diferente:

- **Sonda de inicialização (startup)** — o aplicativo dentro do contêiner terminou de iniciar?
- **Sonda de prontidão (readiness)** — o aplicativo está pronto para receber tráfego?
- **Sonda de vivacidade (liveness)** — o aplicativo precisa ser reiniciado?

## Os três tipos de sondas

### Sondas de inicialização

Uma sonda de inicialização protege aplicativos que demoram para iniciar de serem mortos pela sonda de vivacidade. Se o seu aplicativo leva 60 segundos para inicializar, e a sua sonda de vivacidade tem `periodSeconds: 10` com `failureThreshold: 3`, a sonda de vivacidade matará o contêiner após 30 segundos — antes mesmo de ele terminar de iniciar.

A sonda de inicialização é executada primeiro e, enquanto estiver falhando, as sondas de vivacidade e prontidão ficam desabilitadas. Quando a sonda de inicialização obtém sucesso, o kubelet passa o controle para as sondas regulares. Uma configuração típica para um aplicativo que precisa de ~30 segundos para iniciar:

```yaml
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  periodSeconds: 5
  failureThreshold: 6   # 5s x 6 = 30s budget before the container is killed
```

Use sondas `exec` (`exec: { command: ["sh", "-c", "..."] }`) quando o aplicativo ainda não tiver um endpoint HTTP durante a inicialização, e `tcpSocket` quando ele precisar apenas abrir uma porta.

### Sondas de prontidão

Uma sonda de prontidão decide se um pod recebe tráfego por meio de Services e EndpointSlices. Quando a sonda falha, o pod é removido dos endpoints do Service — o tráfego para de fluir para ele — mas o contêiner **não** é reiniciado. Esta é a ferramenta correta para estados transitórios como “ainda carregando cache” ou “banco de dados temporariamente indisponível”.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
  successThreshold: 1
```

`successThreshold` é importante aqui: para prontidão, o Kubernetes espera `successThreshold` sucessos consecutivos antes de marcar o pod como Ready novamente. Para vivacidade, ele deve ser sempre 1.

### Sondas de vivacidade

Uma sonda de vivacidade responde: “este processo está em deadlock ou travado?” Quando ela falha, o kubelet mata o contêiner e o reinicia de acordo com a política de reinicialização (entrando em `CrashLoopBackOff` após falhas repetidas). Ela deve verificar algo que só falhe quando o aplicativo estiver realmente travado — um deadlock, um loop infinito, um estado interno corrompido.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
```

O erro clássico é apontar a sonda de vivacidade para uma dependência (banco de dados, cache, API externa). Se o banco de dados falhar por 40 segundos, a sonda de vivacidade falha, o Kubernetes reinicia o contêiner e agora você tem um aplicativo que reinicia em loop — o que piora a indisponibilidade, em vez de melhorá-la. Dependências pertencem às sondas de prontidão, não às de vivacidade.

## Mecânica das sondas: kubelet, limites e backoff

As sondas são executadas pelo **kubelet**, o agente que roda em cada nó. Cada sonda dispara a cada `periodSeconds` (padrão: 10s) e falha após `failureThreshold` (padrão: 3) falhas consecutivas. Códigos de status 200–399 contam como sucesso para sondas `httpGet`; todo o resto é falha. Uma sonda `tcpSocket` tem sucesso se a conexão abrir; uma sonda `exec` tem sucesso com código de saída 0.

O campo `initialDelaySeconds` (quanto tempo esperar após o contêiner iniciar antes de sondar) ainda existe, mas para aplicativos lentos a sonda de inicialização é a alternativa moderna e mais confiável — ela oferece uma janela dinâmica em vez de um palpite.

Quando uma sonda de vivacidade falha repetidamente, o Kubernetes entra em `CrashLoopBackOff`: o atraso de reinicialização começa em 10 segundos e dobra a cada falha até um máximo de 5 minutos. Um pod preso nesse estado mostra `CrashLoopBackOff` no `kubectl get pods`, e debugar esse pod é um rito de passagem bem conhecido em homelabs — verifique `kubectl logs` e `kubectl describe pod` primeiro.

## Erros de configuração comuns (e como evitá-los)

A equipe de engenharia da ngrok publicou uma análise aprofundada sobre sondas em agosto de 2026 que percorre esses modos de falha com um cluster simulado interativo — vale a pena ler se você quiser ver o problema do loop de reinicialização acontecer em tempo real.

1. **Sonda de vivacidade que verifica dependências.** Banco de dados lento → contêiner reiniciado → todas as réplicas reiniciam → indisponibilidade. Mantenha as verificações de vivacidade baratas e locais ao processo.

2. **Sonda de prontidão ausente durante rollouts.** Durante um rollout, pods antigos são encerrados conforme novos surgem. Sem sondas de prontidão, os novos pods aceitam tráfego antes de poderem servi-lo, e você perde requisições a cada deploy.

3. **Sonda de vivacidade com `failureThreshold` apertado demais para inicializações lentas.** Resolva com uma sonda de inicialização, não afrouxando a sonda de vivacidade.

4. **Verificações sem limites.** Um endpoint `/healthz` que faz uma consulta completa ao banco de dados a cada sonda (padrão: a cada 10 segundos, por pod) pode sobrecarregar seu banco de dados em escala. Mantenha os endpoints de sonda baratos.

5. **Mesmo endpoint para tudo.** Um único `/healthz` que retorna 200 independentemente do estado não diz nada ao cluster. Endpoints diferentes (ou lógicas diferentes) para inicialização, prontidão e vivacidade dão ao Kubernetes a informação de que ele realmente precisa.

## Sondas em Kubernetes de homelab (k3s, k0s, MicroK8s)

Distribuições leves como k3s, k0s e MicroK8s implementam a mesma semântica de sondas do Kubernetes completo — o comportamento do kubelet é idêntico. A diferença prática em um homelab é escala e recursos: cada sonda é uma requisição HTTP extra por pod a cada poucos segundos, algo trivial na escala de um homelab, mas ainda assim compensa manter os endpoints de sonda baratos, especialmente em nós da classe Raspberry Pi.

Se você executa o Kubernetes junto com outros [contêineres e máquinas virtuais no mesmo host]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}), lembre-se de que um nó que fica sem memória (OOM) mata pods independentemente das sondas — sondas não podem corrigir limites de recursos. E se você auto-hospeda inferência de LLM em um servidor antigo, [as mesmas restrições de hardware]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) se aplicam ao design das sondas: carregamento lento de modelos é exatamente para isso que servem as sondas de inicialização.

## Checklist de boas práticas

- Defina sempre uma **sonda de prontidão** para qualquer coisa atrás de um Service ou Ingress — caso contrário, rollouts causam queda de tráfego.
- Use uma **sonda de inicialização** para qualquer aplicativo que leve mais de ~10 segundos para iniciar; não afrouxe a sonda de vivacidade para compensar.
- Mantenha as **sondas de vivacidade** locais ao processo, baratas e rápidas. Nunca as aponte para dependências externas.
- Prefira `httpGet` com um endpoint de saúde dedicado em vez de `tcpSocket` — uma porta aberta não significa que o aplicativo está saudável.
- Defina `periodSeconds` conscientemente: 10s é o padrão por um bom motivo; 1s quase nunca se justifica.
- Verifique com `kubectl describe pod` e `kubectl get events` — falhas de sonda aparecem lá imediatamente.

Leia também:

- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Como Executar LLMs em Hardware de Servidor Antigo: Um Guia Prático para Homelab [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
