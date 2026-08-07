---
date: 2026-08-07T15:06:52-03:00
draft: true
title: "How to Detect and Block Bot Traffic on Your Self-Hosted Website [2026]"
description: "Step-by-step guide to detecting and blocking bot traffic on self-hosted sites: log analysis with GoAccess, nginx rate limiting, fail2ban, CrowdSec, Cloudflare Bot Fight Mode and robots.txt for AI crawlers."
featured_image: ""
categories:
  - article
tags:
  - selfhosted
  - security
  - nginx
  - homelab
  - devops
---

It's Saturday morning. You open your analytics dashboard to see how your self-hosted blog did this week — and there it is: 4,000 "visitors" over the weekend, each one landing on a single page and leaving instantly. You know you didn't have 4,000 readers. You had maybe forty, and the other 3,960 were machines.

You are not alone. A post that made the front page of Hacker News in August 2026 (257 points) described exactly this situation: a site owner discovering that 99% of their traffic was bots, with thousands of requests per day hammering a small server ([source](https://patronview.com/news/99-percent-of-my-website-traffic-is-bots/), [discussion](https://news.ycombinator.com/item?id=49211386)). The comments filled with people who had the same experience — some reporting 99.999% bot traffic.

This guide is the playbook I wish I had when I first saw that dashboard. It covers how to figure out what is actually hitting your server, and the defense layers you can stack on a cheap VPS or a homelab box — from free log analysis to nginx rate limiting, fail2ban, CrowdSec, and Cloudflare. No single layer stops everything, but together they cut the noise by orders of magnitude.

## First: know what you are dealing with

Before blocking anything, spend an hour understanding your traffic. Bots are not one monolith. The ones hammering a typical personal site fall into a few buckets:

- **AI and search crawlers** — OpenAI, Anthropic, Perplexity, Common Crawl and similar services re-scrape the web continuously. This is the fastest-growing category.
- **Content scrapers** — tools that copy pages to republish or to train datasets. They tend to revisit the same URLs over and over.
- **Vulnerability scanners** — bots probing for WordPress, exposed `.env` files, admin panels, and known CVEs. These hit every server on the internet, all day, every day.
- **SEO spam and link checkers** — junk that inflates "visitor" counts you later have to explain to an AdSense reviewer.

The telltale signs are the same ones the Hacker News author noticed: no referrer, a 99% bounce rate, exactly one page per "visitor", and bursts of thousands of hits arriving in a few days. If your site is behind nginx or Caddy, your access logs already contain the full story.

## Measure before you block

Blocking without measuring means you will eventually block something you need — most commonly Googlebot, which can tank your search rankings overnight.

Install [GoAccess](https://goaccess.io/), a terminal-based log analyzer, and point it at your access log:

```bash
goaccess /var/log/nginx/access.log --log-format=COMBINED
```

It gives you a live view of top IPs, user agents, and request paths in seconds. Sort by requests per IP and you will immediately see the offenders: thousands of hits from a handful of autonomous system numbers, often with user agents you have never heard of.

[Project Honey Pot](https://www.projecthoneypot.org/) is a complementary resource: it maintains a public database of known harvesting and dictionary-attack IPs. Many of the IPs hammering your site will already be listed there.

## Layer 1: robots.txt is the polite request, not a firewall

[RFC 9309](https://www.rfc-editor.org/rfc/rfc9309) standardized robots.txt as a protocol for well-behaved crawlers. It works against Google, Bing, and the major AI companies — they generally honor it. It does nothing against scrapers that never read it. Still, it is the cheapest filter you have, and it gives you a paper trail if a company ignores it.

```text
User-agent: *
Disallow: /admin/
Disallow: /api/private/

User-agent: GPTBot
Disallow: /
```

Keep in mind robots.txt is advisory. Real enforcement requires the layers below.

## Layer 2: nginx-level filtering

Your web server is the right place for the first hard filters, because it runs before any application code.

**Block obvious bad user agents** with the [access module](https://nginx.org/en/docs/http/ngx_http_access_module.html). A common pattern is to return 444 (drop connection) for known scanner agents:

```nginx
if ($http_user_agent ~* (SemrushBot|AhrefsBot|Mageeng|python-requests|curl)) {
    return 444;
}
```

**Rate limit aggressively** with `limit_req`, which is part of the [core module](https://nginx.org/en/docs/http/ngx_http_core_module.html#limit_req_zone). This is the single most effective change for a small server: it caps requests per IP per second, so a scraper's 1,000 requests per minute collapse to a trickle without affecting a human who loads a page and reads it:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;

server {
    location / {
        limit_req zone=general burst=20 nodelay;
    }
}
```

**Geo-blocking** is tempting but blunt. The Hacker News thread had a long debate about it: blocking entire countries can lock out legitimate readers who travel or live there. Reserve geo rules for admin endpoints, not for the whole site.

## Layer 3: fail2ban for repeat offenders

[fail2ban](https://github.com/fail2ban/fail2ban) watches log files and bans IPs that misbehave repeatedly — the classic use is SSH brute force, but it works just as well on web logs ([reference](https://en.wikipedia.org/wiki/Fail2ban)). Define a jail that bans an IP after it generates too many 404s or triggers your nginx rate limit:

```ini
[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 86400
```

Banning an IP for 24 hours after five obvious bot requests removes the scanners from your logs almost entirely within a week.

## Layer 4: CrowdSec — shared intelligence

[CrowdSec](https://github.com/crowdsecurity/crowdsec) is fail2ban's modern cousin: an open-source intrusion prevention system that shares blocklists between thousands of servers. When one member of the community sees an attack, every other member learns the IP within seconds. The [nginx bouncer](https://github.com/crowdsecurity/cs-nginx-bouncer) plugs directly into your server and drops malicious requests before they reach your app. It is heavier to set up than fail2ban, but the community blocklist catches botnets that a single server could never identify on its own.

## Layer 5: Cloudflare in front (the tradeoff)

The most common advice in that Hacker News thread was "just put Cloudflare in front of it." [Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/) is free and blocks a large share of automated traffic at the edge, before a single byte reaches your VPS ([docs](https://developers.cloudflare.com/bots/)).

The tradeoff is architectural: your traffic now flows through a third party that can see it, and some commenters made exactly that point — they refuse to centralize the internet around a handful of CDNs. For a personal blog, the privacy cost is usually acceptable. For a homelab service you care about, prefer the self-hosted layers and skip the proxy.

## Layer 6: proof-of-work gates for static sites

If you run a static site and the bots are relentless, [Anubis](https://github.com/TecharoHQ/anubis) is an elegant option: it serves a small proof-of-work challenge to visitors before showing the page, and proxies the real content. Humans solve it in under a second; bots scraping at scale find it economically pointless. The HN thread debated whether the challenge can be bypassed — a determined attacker can, but the point is that it stops the *mass* scraping that degrades your server, not the single determined adversary.

## What not to do

- **Do not block by user agent alone** and call it done — real scrapers spoof browser agents, including Googlebot's. If you filter by agent, verify Googlebot by reverse DNS before trusting it.
- **Do not block entire ASNs or countries** unless you have a specific, ongoing attack. You will lose readers.
- **Do not over-block on the admin side** — your own monitoring tools, uptime checks, and RSS readers are also "bots". Keep allowlists for things you control.
- **Watch your AdSense/analytics numbers**: if you are applying for ad networks, a dashboard full of bot traffic is a red flag for reviewers. Filter bot traffic in your analytics (or exclude it at the server) so your real numbers are the ones that count.

## The result

Stack the layers in order — robots.txt, nginx rate limiting, fail2ban, CrowdSec — and a $5 VPS that was pegged at 100% CPU from scrapers will go back to serving your actual readers at single-digit load. The bots never stop, but you stop paying attention to them. That is the goal: not a perfectly bot-free site, but a server that has room for the people who matter.

Read also:

- [Using Oracle Cloud Free tier]({{< relref "posts/oracle_cloud_vps/" >}})
- [SPF, DKIM, and DMARC: Complete Email Authentication Guide [2026]]({{< relref "posts/spf-dkim-dmarc-email-authentication-guide-2026/" >}})
- [How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications]({{< relref "posts/how-to-setup-github-secrets/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
