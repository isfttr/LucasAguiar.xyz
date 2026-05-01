---
date: 2024-04-25T01:33:19.000Z
draft: false
title: Usando a Camada Gratuita do Oracle Cloud
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
translation_source_hash: 2333ecdff3711822b9bb2bcb671d88f76c4eccab97e63022d4d518256834ce4d
---
## O problema

Esta semana eu estive procurando soluções para usar domínios com minhas aplicações rodando em containers no meu servidor MacBook Pro. Sim, eu converti meu MacBook Pro em um servidor, pelo menos por enquanto. A primeira solução foi usar um Pi-Hole como um DNS local e funciona bem, mas o problema é que eu tenho que especificar portas para acessar as aplicações e isso se torna irritante. A solução parecia simples o suficiente, criar um container Nginx Proxy Manager (NPM), usá-lo para apontar para os containers na rede local e isso deveria resolver o problema. Bem, foi o que eu pensei.

Isso me levou a uma busca de três dias por uma solução porque tudo o que eu fazia não conseguia fazer o NPM direcionar o tráfego corretamente. Eventualmente, eu identifiquei que o problema era com minha provedora de internet (ISP) e possivelmente a configuração padrão de CG-NAT. Então, este texto é para o leitor que tentou o seguinte e não funcionou.

## Redirecionamento de Portas no Roteador

Esta parecia ser a solução a princípio. Apenas configurar o tráfego de entrada das portas 80 e 443 para ser redirecionado para as portas relacionadas no container NPM, e então o NPM distribuiria o tráfego de acordo. Mas isso não funcionou.

## DMZ para o host executando NPM

Esta é outra possível solução que também tentei e não funcionou. Vi isso em algum lugar, com um usuário explicando que usar a DMZ era essencialmente o mesmo que redirecionar portas para este host específico. Tentei e não funcionou.

## Configurar domínios e endereços IP

Pensei que o principal problema poderia ser o fato de estar usando um subdomínio onde o domínio principal estava apontando para outros servidores e, por causa disso, não estava conseguindo chegar ao host correto. Então, configurei outro domínio (barato) para testar essa hipótese e também não funcionou.

## VPS na Nuvem

Eventualmente, cheguei a este vídeo de [Raid Owl](https://www.youtube.com/watch?v=2fA6u9eahNw&t=562s&pp=ygUScmFpZCBvd2wgY2xvdWQgdnBz) no YouTube que me abriu os olhos para a solução definitiva para este problema. Veja bem, eu poderia ter ligado para a provedora de internet e verificar com eles o que estava acontecendo e se eles poderiam arranjar algo do lado deles, mas bem, isso é cansativo. Em vez disso, esta solução pareceu óbvia depois de tantas tentativas e erros. A provedora de internet está bloqueando conexões de entrada para a rede, eu não sei como. Não consegui descobrir. O Cloudflare estava dando um erro 522, o que basicamente significa que não havia resposta do servidor. O servidor não estava recebendo tráfego. Então, significa que, com a configuração de rede normal, eu não conseguiria fazer isso funcionar.

A solução proposta por Raid Owl é usar uma VPS na Nuvem como forma de obter acesso a outro endereço público, fora da minha rede local, e então tunelar o tráfego desta VPS na Nuvem para a máquina host que executa containers na minha rede local. A solução, à primeira vista, parece funcionar, mas há custos potenciais envolvidos. Como tenho alguma experiência com Azure, eu sabia que não poderia executar uma máquina virtual lá 24/7 para este propósito, talvez eu precisasse iniciar e desligar as máquinas automaticamente todos os dias... Após alguma pesquisa, encontrei a solução perfeita para este problema: Oracle Cloud.

## Oracle Cloud Free Tier

O Oracle Cloud Free Tier é uma maneira de obter acesso a máquinas virtuais com Linux que são sempre gratuitas para usar. Para este uso específico, é perfeito, já que a quantidade de tráfego é limitada.

A configuração é direta, e como Raid Owl faz um trabalho perfeito ao explicar todos os passos para isso, serei breve.

Primeiro, depois de criar uma instância na Oracle Cloud, você precisa redirecionar as portas 80, 81 e 443. Essas são as portas que precisam estar abertas para que o tráfego chegue ao container NPM. Após configurar isso, vá para a instância e instale o Docker e todos os outros pacotes relacionados, como o Docker Compose. Para os detalhes desses passos, estou deixando os links nas referências. Além disso, configure o Tailscale dentro da instância (também nos links abaixo). Então, depois que tudo estiver configurado, o que você deseja ter é uma conexão Tailscale dentro desta nova instância. A conexão Tailscale dará acesso à máquina host dentro da sua rede local porque essa máquina também estará executando um daemon Tailscale.

O NPM será configurado como o proxy reverso da sua rede local enquanto estiver fisicamente em um datacenter da Oracle em algum lugar. Todo o tráfego de entrada, que é direcionado para o endereço público desta instância na Oracle Cloud, será direcionado ao NPM, que terá proxies para serviços que estão rodando dentro da sua rede local. Como o Tailscale está dentro desta instância da Oracle, ele será configurado para `--accept-routes`, o que significa que receberá o tráfego de entrada e enviará para qualquer coisa na rede que esteja `--advertise-routes=<ip-adress>`. Todo este tráfego será enviado usando a sua tailnet para a sua rede local. No meu caso, decidi usar um container Tailscaled como o host para anunciar as rotas para sub-redes específicas.

Esta é uma visão geral deste problema e como eu o resolvi. Há muitos pequenos passos para fazê-lo funcionar, mas se você quiser testar suas habilidades ou simplesmente não quiser verificar com a provedora de internet se este é o problema deles, você pode usar esta estratégia.

## Links de referência

- [Raid Owl: configurando NPM na rede local e certificados SSL](https://www.youtube.com/watch?v=GarMdDTAZJo&t=10s&pp=ygUMcmFpZCBvd2wgdnBz)
- [Tony Teaches Tech: configurando instâncias e redirecionamento de portas na Oracle Cloud](https://www.youtube.com/watch?v=yWVD6qmQrb8)
- [Fabricio Veronez: Nginx reverse proxy e como funciona (PT-BR)](https://www.youtube.com/watch?v=bFZurhL14LA)
- [Sauber Lab: Como obter certificados SSL com NPM (PT-BR)](https://www.youtube.com/watch?v=SELkrrexIkQ&t=4s)
- [Dev.to: Instalar Docker e Docker Compose no Oracle Linux 8](https://dev.to/kylejschwartz/install-docker-compose-on-oracle-linux-8-1kb0)
- [Nginx Proxy Manager: configurações padrão com Docker Compose](https://nginxproxymanager.com/setup/#using-mysql-mariadb-database)
- [Tailscale SSH em containers](https://tailscale.com/learn/ssh-into-docker-container)
- [Tailscale no Oracle Linux 8](https://tailscale.com/kb/1117/install-oracle-linux-8)
- [Tailscale roteadores de sub-rede](https://tailscale.com/kb/1019/subnets)
- [Oracle Cloud](https://www.oracle.com/br/cloud/sign-in.html)

## Conclusão

Espero que este artigo tenha sido útil para alguns de vocês que estão tentando expor alguma aplicação interna ao tráfego externo, mas não conseguem devido a algumas configurações da provedora de internet.

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
