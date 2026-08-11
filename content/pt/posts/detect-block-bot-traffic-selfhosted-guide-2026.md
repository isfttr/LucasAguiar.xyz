---
date: 2026-08-07T18:06:52.000Z
draft: true
title: Como Detectar e Bloquear Tráfego de Bots no Seu Site Auto-Hospedado [2026]
description: 'Guia passo a passo para detectar e bloquear tráfego de bots em sites auto-hospedados: análise de logs com GoAccess, limitação de taxa do nginx, fail2ban, CrowdSec, Cloudflare Bot Fight Mode e robots.txt para rastreadores de IA.'
featured_image: ''
categories:
  - article
tags:
  - selfhosted
  - security
  - nginx
  - homelab
  - devops
slug: detectar-bloquear-trafego-bots-site-autohospedado
translation_source_hash: afef41d060a56abb6d9aa15e72e413ebd86fc1df8c5caa147ff43d8b3bdcfd53
---
É sábado de manhã. Você abre seu painel de análises para ver como seu blog auto-hospedado foi esta semana — e lá está: 4.000 "visitantes" durante o fim de semana, cada um aterrissando em uma única página e saindo instantaneamente. Você sabe que não teve 4.000 leitores. Teve talvez quarenta, e os outros 3.960 eram máquinas.

Você não está sozinho. Um post que chegou à primeira página do Hacker News em agosto de 2026 (257 pontos) descreveu exatamente essa situação: um dono de site descobrindo que 99% do tráfego era de bots, com milhares de requisições por dia martelando um servidor pequeno ([fonte](https://patronview.com/news/99-percent-of-my-website-traffic-is-bots/), [discussão](https://news.ycombinator.com/item?id=49211386)). Os comentários se encheram de pessoas que tiveram a mesma experiência — algumas relatando 99,999% de tráfego de bots.

Este guia é o manual que eu gostaria de ter tido quando vi aquele painel pela primeira vez. Ele cobre como descobrir o que está realmente atingindo seu servidor e as camadas de defesa que você pode empilhar em um VPS barato ou em uma máquina de homelab — desde análise gratuita de logs até limitação de taxa no nginx, fail2ban, CrowdSec e Cloudflare. Nenhuma camada isolada impede tudo, mas juntas elas reduzem o ruído em ordens de magnitude.

## Primeiro: saiba com o que você está lidando

Antes de bloquear qualquer coisa, passe uma hora entendendo seu tráfego. Os bots não são um monolito. Os que martelam um site pessoal típico caem em algumas categorias:

- **Rastreadores de IA e busca** — OpenAI, Anthropic, Perplexity, Common Crawl e serviços semelhantes re-raspam a web continuamente. Esta é a categoria que mais cresce.
- **Raspadores de conteúdo** — ferramentas que copiam páginas para republicar ou para treinar conjuntos de dados. Elas tendem a revisitar as mesmas URLs repetidamente.
- **Escâneres de vulnerabilidades** — bots sondando WordPress, arquivos `.env` expostos, painéis administrativos e CVEs conhecidos. Eles atingem todos os servidores da internet, o dia todo, todos os dias.
- **Spam de SEO e verificadores de links** — lixo que infla as contagens de "visitantes" que você depois terá de explicar a um revisor do AdSense.

Os sinais reveladores são os mesmos que o autor do Hacker News notou: sem referrer, uma taxa de rejeição de 99%, exatamente uma página por "visitante" e rajadas de milhares de acessos chegando em poucos dias. Se o seu site está atrás de nginx ou Caddy, seus logs de acesso já contêm a história completa.

## Meça antes de bloquear

Bloquear sem medir significa que você acabará bloqueando algo de que precisa — mais comumente o Googlebot, que pode destruir seu ranking de busca da noite para o dia.

Instale o [GoAccess](https://goaccess.io/), um analisador de logs baseado em terminal, e aponte-o para o seu log de acesso:

```bash
goaccess /var/log/nginx/access.log --log-format=COMBINED
```

Ele dá uma visão ao vivo dos principais IPs, user agents e caminhos de requisição em segundos. Ordene por requisições por IP e você verá imediatamente os infratores: milhares de acessos de um punhado de números de sistema autônomo, muitas vezes com user agents que você nunca ouviu falar.

O [Project Honey Pot](https://www.projecthoneypot.org/) é um recurso complementar: ele mantém um banco de dados público de IPs conhecidos de coleta e ataques de dicionário. Muitos dos IPs que estão martelando seu site já estarão listados lá.

## Camada 1: robots.txt é o pedido educado, não um firewall

O [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309) padronizou o robots.txt como um protocolo para rastreadores bem-comportados. Ele funciona contra Google, Bing e as principais empresas de IA — elas geralmente o respeitam. Ele não faz nada contra raspadores que nunca o leem. Ainda assim, é o filtro mais barato que você tem e fornece uma trilha documental se uma empresa o ignorar.

```text
User-agent: *
Disallow: /admin/
Disallow: /api/private/

User-agent: GPTBot
Disallow: /
```

Lembre-se de que o robots.txt é apenas uma recomendação. A aplicação real exige as camadas abaixo.

## Camada 2: filtragem no nível do nginx

Seu servidor web é o lugar certo para os primeiros filtros rígidos, porque ele roda antes de qualquer código de aplicação.

**Bloqueie user agents obviamente ruins** com o [módulo de acesso](https://nginx.org/en/docs/http/ngx_http_access_module.html). Um padrão comum é retornar 444 (derrubar conexão) para agentes de escâner conhecidos:

```nginx
if ($http_user_agent ~* (SemrushBot|AhrefsBot|Mageeng|python-requests|curl)) {
    return 444;
}
```

**Limite a taxa agressivamente** com `limit_req`, que faz parte do [módulo principal](https://nginx.org/en/docs/http/ngx_http_core_module.html#limit_req_zone). Esta é a mudança mais eficaz para um servidor pequeno: ela limita as requisições por IP por segundo, então as 1.000 requisições por minuto de um raspador reduzem-se a um fio d'água sem afetar um humano que carrega uma página e a lê:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

server {
    location / {
        limit_req zone=general burst=20 nodelay;
    }
}
```

**O bloqueio geográfico** é tentador, mas é uma ferramenta bruta. A discussão do Hacker News teve um longo debate sobre isso: bloquear países inteiros pode deixar de fora leitores legítimos que viajam ou moram lá. Reserve regras geográficas para endpoints administrativos, não para o site inteiro.

## Camada 3: fail2ban para infratores reincidentes

O [fail2ban](https://github.com/fail2ban/fail2ban) monitora arquivos de log e bane IPs que se comportam mal repetidamente — o uso clássico é força bruta em SSH, mas ele funciona igualmente bem em logs web ([referência](https://en.wikipedia.org/wiki/Fail2ban)). Defina uma jail que bane um IP depois que ele gera muitos 404s ou aciona seu limite de taxa do nginx:

```ini
[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 86400
```

Banir um IP por 24 horas após cinco requisições óbvias de bot remove os escâneres dos seus logs quase completamente em uma semana.

## Camada 4: CrowdSec — inteligência compartilhada

O [CrowdSec](https://github.com/crowdsecurity/crowdsec) é o primo moderno do fail2ban: um sistema de prevenção de intrusão de código aberto que compartilha listas de bloqueio entre milhares de servidores. Quando um membro da comunidade vê um ataque, todos os outros membros aprendem o IP em segundos. O [bouncer para nginx](https://github.com/crowdsecurity/cs-nginx-bouncer) conecta-se diretamente ao seu servidor e descarta requisições maliciosas antes que elas cheguem ao seu aplicativo. Ele é mais pesado de configurar do que o fail2ban, mas a lista de bloqueio da comunidade captura botnets que um servidor sozinho nunca conseguiria identificar.

## Camada 5: Cloudflare na frente (o trade-off)

O conselho mais comum naquela discussão do Hacker News era "é só colocar o Cloudflare na frente". O [Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/) é gratuito e bloqueia uma grande parcela do tráfego automatizado na borda, antes que um único byte chegue ao seu VPS ([documentação](https://developers.cloudflare.com/bots/)).

O trade-off é arquitetural: seu tráfego agora passa por um terceiro que pode vê-lo, e alguns comentaristas fizeram exatamente esse ponto — eles se recusam a centralizar a internet em torno de um punhado de CDNs. Para um blog pessoal, o custo de privacidade geralmente é aceitável. Para um serviço de homelab com o qual você se importa, prefira as camadas auto-hospedadas e pule o proxy.

## Camada 6: barreiras de prova de trabalho para sites estáticos

Se você tem um site estático e os bots são implacáveis, o [Anubis](https://github.com/TecharoHQ/anubis) é uma opção elegante: ele apresenta um pequeno desafio de prova de trabalho aos visitantes antes de mostrar a página e faz proxy do conteúdo real. Humanos o resolvem em menos de um segundo; bots que raspam em escala acham isso economicamente inútil. A discussão no HN debateu se o desafio pode ser contornado — um atacante determinado pode, mas o objetivo é impedir a raspagem *em massa* que degrada seu servidor, não o adversário único e determinado.

## O que não fazer

- **Não bloqueie apenas pelo user agent** e ache que está resolvido — raspadores reais falsificam agentes de navegador, incluindo o do Googlebot. Se você filtrar por agente, verifique o Googlebot por DNS reverso antes de confiar nele.
- **Não bloqueie ASNs ou países inteiros**, a menos que você tenha um ataque específico e contínuo. Você perderá leitores.
- **Não bloqueie demais no lado administrativo** — suas próprias ferramentas de monitoramento, verificações de uptime e leitores de RSS também são "bots". Mantenha listas de permissão para as coisas que você controla.
- **Fique de olho nos seus números do AdSense/analytics**: se você está se candidatando a redes de anúncios, um painel cheio de tráfego de bots é um sinal de alerta para os revisores. Filtre o tráfego de bots nas suas análises (ou exclua-o no servidor) para que seus números reais sejam os que contam.

## O resultado

Empilhe as camadas em ordem — robots.txt, limitação de taxa no nginx, fail2ban, CrowdSec — e um VPS de US$ 5 que estava com a CPU fixada em 100% por causa dos raspadores voltará a servir seus leitores reais com carga de um dígito. Os bots nunca param, mas você para de prestar atenção neles. Esse é o objetivo: não um site perfeitamente livre de bots, mas um servidor que tem espaço para as pessoas que importam.

Leia também:

- [Oracle Cloud Free Tier 2026: Ainda Vale a Pena? Guia Completo + Alternativas]({{< relref "posts/oracle_cloud_vps/" >}})
- [SPF, DKIM e DMARC: Guia Completo de Autenticação de Email [2026]]({{< relref "posts/spf-dkim-dmarc-email-authentication-guide-2026/" >}})
- [Como Configurar e Usar GitHub Secrets com Contêineres e Aplicações Voltadas para a Internet]({{< relref "posts/how-to-setup-github-secrets/" >}})

---

Você pode entrar em contato para falar sobre isso e outros assuntos em <contact@lucasaguiar.xyz>
