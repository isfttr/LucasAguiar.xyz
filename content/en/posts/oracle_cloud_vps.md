---
date: 2024-04-24T22:33:19-03:00
draft: false
title: Using Oracle Cloud Free tier
description: 
url: "/oracle_cloud_free_tier"
featured_image: "/images/oracle_cloud_vps_thumb.png"
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
---


## The problem

This week I have been searching for solutions to use domains with my applications running in containers in my MacBook Pro server. Yes, I have converted my MacBook Pro into a server, at least for now. The first solution was to use a Pi-Hole as a local DNS and it works fine, but the problem is that I have to specify ports to get into the applications and it gets annonying. The solution seemed simple enough, create a Nginx Proxy Manager (NPM) container, use it to point to the containers in the local network and this should solve the issue. Well, that's what I thought.

This sent me in a three-day hunt for a solution because everything I did was not able to make NPM direct the traffic correctly. Eventually I pinned down that the problema was with my ISP and possibly the default CG-NAT configuration. So, this text is for the reader that tried the following and it did not work.

## Port Forwarding in the Router

This seemed the solution at first. Just configure the incoming traffic from ports 80 and 443 to be forwarded to the related ports in the NPM container, and then the NPM would distribute the traffic accordingly. But that did not work.

## DMZ for the host running NPM

This is another possible solution that I also tried and didn't work. I saw this one somewhere, with a user explaining that using the DMZ was essentially the same as forwarding ports for this specific host. I tried and it did not work.

## Set up domains and IP addresses

I thought that the main problem could be the fact that I was using a subdomain where the main domain was pointing to other servers and because of this it wasn't able to get to the correct host. So I did set up another domain (cheap) to test this hypothesis and it did not work either.

## Cloud VPS

Eventually I arrived at this video by [Raid Owl](https://www.youtube.com/watch?v=2fA6u9eahNw&t=562s&pp=ygUScmFpZCBvd2wgY2xvdWQgdnBz) on YouTube that opened my eyes to the ultimate solution for this problem. You see, I could have called to the ISP and check with them what was going on and if they could check if they could arrange something on their side, but well, this is tiresome. Instead, this solution seemed obvious after so much trying and error. The ISP is blocking incoming connections to the network, I don't know how. I couldn't figure it out. Cloudflare was giving a 522 error, which basically means that there was no response from the server. The server was getting no traffic. So it means that from the normal network setup I could not get this to work.

The Raid Owl proposed solution is to use a Cloud VPS as a way to get access to another public address, outside my local network, and then tunnel the traffic from this Cloud VPS to the host machine running containers in my local network. The solution on its face seems to work, but there are potential costs envolved. As I have some experience with Azure, I knew that I couldn't run a virtual machine there 24/7 for this purpose, maybe I would need to autostart and shutdown the machines everyday... After some research I've found the perfect solution for this problem: Oracle Cloud.

## Oracle Cloud Free Tier

Oracle Cloud Free Tier is a way to get access to virtual machines with Linux which are always free to use. For this specific use it is perfect, since the amount of traffic is limited.

The setup is straight forward, and since Raid Owl does a perfect job at explaining all the steps for this I am going to be brief.

First, after creating a instance in Oracle Cloud, you need to forward the ports 80, 81 and 443. Those are the ports that need to be open for the traffic to reach the NPM container. After setting this up, go to the instance, and install Docker and all the other related packages, such as Docker Compose. For the specifics on these steps, I'm leaving the links in the references. Also, setup Tailscale inside the instance (also in the links below). Then, after everything is setup, what you want to have is a Tailscale connection inside this new instance. The Tailscale connection will give access to the host machine inside you local network because that machine will also be running a tailscale daemon.

NPM will be setup as the reverse proxy of your local network while it is physically at a Oracle datacenter somewhere. All the incoming traffic which is directed at the public address for this instace at Oracle Cloud, will be piped to NPM, which will have proxies for services that are running inside your local network. Since tailscale is inside this Oracle instance, it will the configured to `--accept-routes`, which means that it will receive the incoming traffic and send to whatever in the network that is `--advertise-routes=<ip-adress>`. All this traffic will be sent using the you tailnet to you local network. In my case, I decided to use a Tailscaled container as the host for advertising the routes to specific subnets.

This is an overview of this problem and how I solved it. That are many little steps to get it going, but if you want to test your skills or just don't want to see with the ISP if this is their problem, you can use this strategy.

## Reference links

- [Raid Owl: setting up NPM in local network and SSL certificates](https://www.youtube.com/watch?v=GarMdDTAZJo&t=10s&pp=ygUMcmFpZCBvd2wgdnBz)
- [Tony Teaches Tech: setting up instances and port forwarding in Oracle Cloud](https://www.youtube.com/watch?v=yWVD6qmQrb8)
- [Fabricio Veronez: Nginx reverse proxy and how it works (PT-BR)](https://www.youtube.com/watch?v=bFZurhL14LA)
- [Sauber Lab: How to get SSL certificates with NPM (PT-BR)](https://www.youtube.com/watch?v=SELkrrexIkQ&t=4s)
- [Dev.to: Install Docker and Docker Compose on Oracle Linux 8](https://dev.to/kylejschwartz/install-docker-compose-on-oracle-linux-8-1kb0)
- [Nginx Proxy Manager: default configurations with Docker Compsoe](https://nginxproxymanager.com/setup/#using-mysql-mariadb-database)
- [Tailscale SSH into containers](https://tailscale.com/learn/ssh-into-docker-container)
- [Tailscale on Oracle Linux 8](https://tailscale.com/kb/1117/install-oracle-linux-8)
- [Tailscale subnet routers](https://tailscale.com/kb/1019/subnets)
- [Oracle Cloud](https://www.oracle.com/br/cloud/sign-in.html)

## Conclusion

I hope this article was useful to some of you who are trying to expose some internal application to external traffic but can't do it because of some ISP configurations.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.

{{< form-contact >}}
