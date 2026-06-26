---
date: 2024-04-25T01:33:19.000Z
draft: false
title: "Oracle Cloud Free Tier 2026: Ainda Vale a Pena? Guia Completo + Alternativas"
description: "O Oracle Cloud Always Free Tier ainda funciona em 2026? Guia completo com configuração passo a passo, Tailscale, Docker e alternativas gratuitas de VPS."
url: /oracle_cloud_free_tier
featured_image: /images/oracle_cloud_vps_thumb.png
categories:
  - article
  - tutorial
tags:
  - linux
  - oracle
  - cloud
  - web
  - vps
  - nginx
  - tailscale
  - docker
translation_source_hash: f6003c2b2cd0c0870b13cdfb01a9a6f4765893b65f469dbbc238eae1e436ff71
---
## O problema

Esta semana, tenho procurado soluções para usar domínios com minhas aplicações rodando em contêineres no meu servidor MacBook Pro. Sim, converti meu MacBook Pro em um servidor, pelo menos por enquanto. A primeira solução foi usar um Pi-Hole como DNS local e funciona bem, mas o problema é que tenho que especificar portas para acessar as aplicações e isso se torna irritante. A solução parecia simples o suficiente: criar um contêiner Nginx Proxy Manager (NPM), usá-lo para apontar para os contêineres na rede local e isso deveria resolver o problema. Bem, foi o que pensei.

Isso me levou a uma busca de três dias por uma solução porque tudo o que eu fazia não conseguia fazer o NPM direcionar o tráfego corretamente. Eventualmente, descobri que o problema estava com meu provedor de internet (ISP) e possivelmente com a configuração padrão de CG-NAT. Portanto, este texto é para o leitor que tentou o seguinte e não funcionou.

## Redirecionamento de Portas no Roteador

Esta parecia ser a solução no início. Basta configurar o tráfego de entrada das portas 80 e 443 para ser redirecionado para as portas relacionadas no contêiner NPM, e então o NPM distribuiria o tráfego de acordo. Mas isso não funcionou.

## DMZ para o host executando NPM

Esta é outra possível solução que também tentei e não funcionou. Eu vi isso em algum lugar, com um usuário explicando que usar a DMZ era essencialmente o mesmo que redirecionar portas para este host específico. Tentei e não funcionou.

## Configurar domínios e endereços IP

Pensei que o principal problema poderia ser o fato de eu estar usando um subdomínio onde o domínio principal apontava para outros servidores e, por causa disso, não conseguia chegar ao host correto. Então configurei outro domínio (barato) para testar essa hipótese e também não funcionou.

## Cloud VPS

Eventualmente, cheguei a este vídeo de [Raid Owl](https://www.youtube.com/watch?v=2fA6u9eahNw&t=562s&pp=ygUScmFpZCBvd2wgY2xvdWQgdnBz) no YouTube que me abriu os olhos para a solução definitiva para este problema. Veja bem, eu poderia ter ligado para o ISP e verificado com eles o que estava acontecendo e se eles poderiam arranjar algo do lado deles, mas bem, isso é cansativo. Em vez disso, esta solução parecia óbvia depois de tantas tentativas e erros. O ISP está bloqueando as conexões de entrada para a rede, não sei como. Não consegui descobrir. O Cloudflare estava dando um erro 522, o que basicamente significa que não havia resposta do servidor. O servidor não estava recebendo tráfego. Então, significa que com a configuração de rede normal eu não conseguiria fazer isso funcionar.

A solução proposta por Raid Owl é usar um Cloud VPS como forma de obter acesso a outro endereço público, fora da minha rede local, e então tunelar o tráfego deste Cloud VPS para a máquina host executando contêineres na minha rede local. A solução, à primeira vista, parece funcionar, mas há custos potenciais envolvidos. Como tenho alguma experiência com Azure, sabia que não poderia executar uma máquina virtual lá 24 horas por dia, 7 dias por semana para este fim, talvez eu precisasse iniciar e desligar as máquinas automaticamente todos os dias... Após alguma pesquisa, encontrei a solução perfeita para este problema: Oracle Cloud.

## Oracle Cloud Free Tier

O Oracle Cloud Free Tier é uma maneira de obter acesso a máquinas virtuais com Linux que são sempre gratuitas para usar. Para este uso específico é perfeito, já que a quantidade de tráfego é limitada.

A configuração é direta, e como Raid Owl faz um trabalho perfeito ao explicar todos os passos para isso, serei breve.

Primeiro, depois de criar uma instância no Oracle Cloud, você precisa redirecionar as portas 80, 81 e 443. Essas são as portas que precisam estar abertas para que o tráfego chegue ao contêiner NPM. Após configurar isso, vá para a instância e instale o Docker e todos os outros pacotes relacionados, como o Docker Compose. Para os detalhes sobre esses passos, estou deixando os links nas referências. Além disso, configure o Tailscale dentro da instância (também nos links abaixo). Então, depois que tudo estiver configurado, o que você quer ter é uma conexão Tailscale dentro desta nova instância. A conexão Tailscale dará acesso à máquina host dentro da sua rede local porque essa máquina também estará executando um daemon Tailscale.

O NPM será configurado como o proxy reverso da sua rede local enquanto ele está fisicamente em um datacenter da Oracle em algum lugar. Todo o tráfego de entrada que é direcionado para o endereço público desta instância no Oracle Cloud será canalizado para o NPM, que terá proxies para serviços que estão sendo executados dentro da sua rede local. Como o Tailscale está dentro desta instância Oracle, ele será configurado para `--accept-routes`, o que significa que receberá o tráfego de entrada e o enviará para o que estiver na rede que é `--advertise-routes=<ip-adress>`. Todo esse tráfego será enviado usando a sua tailnet para a sua rede local. No meu caso, decidi usar um contêiner Tailscaled como host para anunciar as rotas para sub-redes específicas.

Esta é uma visão geral deste problema e como o resolvi. Existem muitos pequenos passos para fazê-lo funcionar, mas se você quiser testar suas habilidades ou simplesmente não quiser verificar com o ISP se este é o problema deles, você pode usar esta estratégia.

## Links de referência

- [Raid Owl: configurando NPM na rede local e certificados SSL](https://www.youtube.com/watch?v=GarMdDTAZJo&t=10s&pp=ygUMcmFpZCBvd2wgdnBz)
- [Tony Teaches Tech: configurando instâncias e redirecionamento de portas no Oracle Cloud](https://www.youtube.com/watch?v=yWVD6qmQrb8)
- [Fabricio Veronez: Proxy reverso Nginx e como funciona (PT-BR)](https://www.youtube.com/watch?v=bFZurhL14LA)
- [Sauber Lab: Como obter certificados SSL com NPM (PT-BR)](https://www.youtube.com/watch?v=SELkrrexIkQ&t=4s)
- [Dev.to: Instalar Docker e Docker Compose no Oracle Linux 8](https://dev.to/kylejschwartz/install-docker-compose-on-oracle-linux-8-1kb0)
- [Nginx Proxy Manager: configurações padrão com Docker Compose](https://nginxproxymanager.com/setup/#using-mysql-mariadb-database)
- [Tailscale SSH em contêineres](https://tailscale.com/learn/ssh-into-docker-container)
- [Tailscale no Oracle Linux 8](https://tailscale.com/kb/1117/install-oracle-linux-8)
- [Roteadores de sub-rede Tailscale](https://tailscale.com/kb/1019/subnets)
- [Oracle Cloud](https://www.oracle.com/br/cloud/sign-in.html)

## Conclusão

Espero que este artigo tenha sido útil para alguns de vocês que estão tentando expor alguma aplicação interna ao tráfego externo, mas não conseguem devido a algumas configurações do provedor de internet (ISP).

Leia também:

- [Guia Completo: Como Integrar Beehiiv ao Hugo via Cloudflare Workers]{{< relref "posts/newsletter-beehiiv-cloudflare-github/" >}}
- [NixOS - Máquina Virtual usando QEMU]{{< relref "posts/nixos-vm1/" >}}
- [Corrigir Erros de Login na Interface Web do Proxmox; um Guia Passo a Passo]{{< relref "posts/troubleshooting-proxmox-login-interface/" >}}

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
