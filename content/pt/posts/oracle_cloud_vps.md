---
date: 2024-04-25T01:33:19.000Z
draft: false
title: Usando o nível gratuito da Oracle Cloud
description: null
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
translation_source_hash: 1c58c1cf082f1970868b8ace3aae0cbfb98d2c600c1fd6a4660421dee597cfd3
---
## O problema

Esta semana tenho procurado soluções para usar as minhas aplicações a correr em containers com domínios no meu servidor MacBook Pro. Sim, converti o meu MacBook Pro num servidor, pelo menos por agora. A primeira solução foi usar um Pi-Hole como DNS local e funciona bem, mas o problema é que tenho de especificar portas para aceder às aplicações e isso torna-se aborrecido. A solução parecia bastante simples, criar um container Nginx Proxy Manager (NPM), usá-lo para apontar para os containers na rede local e isso deveria resolver o problema. Bem, foi o que pensei.

Isto levou-me a uma busca de três dias por uma solução porque tudo o que fiz não conseguiu fazer com que o NPM direcionasse o tráfego corretamente. Eventualmente, descobri que o problema era com o meu ISP e possivelmente a configuração CG-NAT padrão. Portanto, este texto é para o leitor que tentou o seguinte e não funcionou.

## Redirecionamento de Portas no Roteador

Esta parecia ser a solução no início. Apenas configurar o tráfego de entrada das portas 80 e 443 para ser redirecionado para as portas relacionadas no container NPM, e então o NPM distribuiria o tráfego de acordo. Mas isso não funcionou.

## DMZ para o host a executar NPM

Esta é outra possível solução que também tentei e não funcionou. Vi esta em algum lugar, com um utilizador a explicar que usar a DMZ era essencialmente o mesmo que redirecionar portas para este host específico. Tentei e não funcionou.

## Configurar domínios e endereços IP

Pensei que o principal problema poderia ser o facto de eu estar a usar um subdomínio onde o domínio principal apontava para outros servidores e por causa disso não conseguia chegar ao host correto. Então configurei outro domínio (barato) para testar esta hipótese e também não funcionou.

## VPS na Nuvem

Eventualmente, cheguei a este vídeo do [Raid Owl](https://www.youtube.com/watch?v=2fA6u9eahNw&t=562s&pp=ygUScmFpZCBvd2wgY2xvdWQgdnBz) no YouTube que me abriu os olhos para a solução definitiva para este problema. Veja bem, eu poderia ter ligado para o ISP e verificado com eles o que estava a acontecer e se eles poderiam arranjar algo do lado deles, mas bem, isso é cansativo. Em vez disso, esta solução pareceu óbvia depois de tantas tentativas e erros. O ISP está a bloquear as ligações de entrada para a rede, não sei como. Não consegui descobrir. O Cloudflare estava a dar um erro 522, o que basicamente significa que não havia resposta do servidor. O servidor não estava a receber tráfego. Então isso significa que, com a configuração de rede normal, eu não conseguiria fazer isto funcionar.

A solução proposta pelo Raid Owl é usar um VPS na Nuvem como forma de aceder a outro endereço público, fora da minha rede local, e então tunelar o tráfego deste VPS na Nuvem para a máquina host a executar containers na minha rede local. A solução, à primeira vista, parece funcionar, mas há custos potenciais envolvidos. Como tenho alguma experiência com Azure, sabia que não conseguiria executar uma máquina virtual lá 24/7 para este propósito, talvez eu precisasse de iniciar e desligar as máquinas automaticamente todos os dias... Após alguma pesquisa, encontrei a solução perfeita para este problema: Oracle Cloud.

## Oracle Cloud Free Tier

O Oracle Cloud Free Tier é uma forma de obter acesso a máquinas virtuais com Linux que são sempre gratuitas de usar. Para este uso específico é perfeito, uma vez que a quantidade de tráfego é limitada.

A configuração é simples, e como o Raid Owl faz um trabalho perfeito a explicar todos os passos para isto, serei breve.

Primeiro, depois de criar uma instância na Oracle Cloud, precisa de redirecionar as portas 80, 81 e 443. Estas são as portas que precisam de estar abertas para que o tráfego chegue ao container NPM. Depois de configurar isto, vá para a instância e instale o Docker e todos os outros pacotes relacionados, como o Docker Compose. Para os detalhes sobre estes passos, estou a deixar os links nas referências. Além disso, configure o Tailscale dentro da instância (também nos links abaixo). Depois, depois de tudo configurado, o que quer ter é uma conexão Tailscale dentro desta nova instância. A conexão Tailscale dará acesso à máquina host dentro da sua rede local porque essa máquina também estará a executar um daemon tailscale.

O NPM será configurado como o proxy reverso da sua rede local enquanto estiver fisicamente num datacenter da Oracle em algum lugar. Todo o tráfego de entrada que é direcionado para o endereço público para esta instância na Oracle Cloud, será canalizado para o NPM, que terá proxies para serviços que estão a correr dentro da sua rede local. Uma vez que o Tailscale está dentro desta instância Oracle, será configurado para `--accept-routes`, o que significa que receberá o tráfego de entrada e enviará para qualquer coisa na rede que seja `--advertise-routes=<ip-adress>`. Todo este tráfego será enviado usando a sua tailnet para a sua rede local. No meu caso, decidi usar um container Tailscaled como host para anunciar as rotas para sub-redes específicas.

Esta é uma visão geral deste problema e como o resolvi. Há muitos pequenos passos para o fazer funcionar, mas se quiser testar as suas habilidades ou simplesmente não quiser verificar com o ISP se este é o problema deles, pode usar esta estratégia.

## Links de referência

- [Raid Owl: configurando NPM em rede local e certificados SSL](https://www.youtube.com/watch?v=GarMdDTAZJo&t=10s&pp=ygUMcmFpZCBvd2wgdnBz)
- [Tony Teaches Tech: configurando instâncias e redirecionamento de portas na Oracle Cloud](https://www.youtube.com/watch?v=yWVD6qmQrb8)
- [Fabricio Veronez: Nginx reverse proxy e como funciona (PT-BR)](https://www.youtube.com/watch?v=bFZurhL14LA)
- [Sauber Lab: Como obter certificados SSL com NPM (PT-BR)](https://www.youtube.com/watch?v=SELkrrexIkQ&t=4s)
- [Dev.to: Instalar Docker e Docker Compose no Oracle Linux 8](https://dev.to/kylejschwartz/install-docker-compose-on-oracle-linux-8-1kb0)
- [Nginx Proxy Manager: configurações padrão com Docker Compose](https://nginxproxymanager.com/setup/#using-mysql-mariadb-database)
- [Tailscale SSH para containers](https://tailscale.com/learn/ssh-into-docker-container)
- [Tailscale no Oracle Linux 8](https://tailscale.com/kb/1117/install-oracle-linux-8)
- [Tailscale routers de sub-rede](https://tailscale.com/kb/1019/subnets)
- [Oracle Cloud](https://www.oracle.com/br/cloud/sign-in.html)

## Conclusão

Espero que este artigo tenha sido útil para alguns de vocês que estão a tentar expor alguma aplicação interna ao tráfego externo, mas não conseguem devido a algumas configurações do ISP.

Leia também:

- [Guia Completo: Como Integrar o Beehiiv com o Hugo via Cloudflare Workers]{{< relref "posts/newsletter-beehiiv-cloudflare-github/" >}}
- [NixOS - Máquina Virtual usando QEMU]{{< relref "posts/nixos-vm1/" >}}
- [Corrigir Erros de Login na Interface Web do Proxmox; um Guia Passo a Passo]{{< relref "posts/troubleshooting-proxmox-login-interface/" >}}

---
Pode contactar-me sobre este e outros tópicos no meu email **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
