---
date: 2026-08-15T15:07:40-03:00
draft: true
title: "How to Block Ads and Trackers in 2026: Firefox, uBlock Origin, and DNS Filtering [Guide]"
description: "Block ads and trackers in 2026: uBlock Origin on Firefox, uBO Lite for Chromium, plus DNS-level filtering with Pi-hole or AdGuard Home. Step-by-step guide."
featured_image: ""
categories:
  - article
tags:
  - privacy
  - firefox
  - adblocking
  - dns
  - homelab
---

At some point in the last year you probably noticed it: your ad blocker quietly stopped doing its job. No error message, no warning — just banner ads and YouTube pre-rolls back on the pages you visit. If you are on Chrome or Edge, this is not a coincidence. It is the end of a long transition to Manifest V3, and it changed the ad-blocking landscape permanently. Firefox is now the last major browser that still fully supports uBlock Origin — a story that topped Hacker News with more than 1,500 points in August 2026 ([PCWorld](https://www.pcworld.com/article/3212428/firefox-is-now-the-last-major-browser-that-still-supports-ublock-origin.html), [HN discussion](https://news.ycombinator.com/item?id=49303202)).

The good news: blocking ads and trackers in 2026 is still completely doable — you just need a setup that matches reality. This guide covers the two layers that actually work: the browser layer and the DNS layer. Together they cover every device in your home, not just one browser.

## Why your old ad blocker died

The short version: Chrome's extension platform (Manifest V3) removed the blocking `webRequest` API that powerful blockers like uBlock Origin relied on to inspect and cancel network requests in real time. The replacement API, `declarativeNetRequest`, only supports a limited set of static rules. That is a deliberate design decision — Google is an advertising company — and it applies to every Chromium browser: Chrome, Edge, Opera, Brave's default shields are separate, and so on.

uBlock Origin still exists, but on Chromium browsers it was replaced by uBlock Origin Lite ([Chrome Web Store](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecngfh)), a Manifest V3-compatible version with fewer filter lists and no dynamic filtering. On Safari, uBlock Origin is gone entirely. Only Firefox — which kept the blocking `webRequest` API — still runs the full uBlock Origin ([addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/), [source code](https://github.com/gorhill/uBlock)).

## Layer 1: the browser

### Firefox + uBlock Origin (the full setup)

If blocking ads is a priority, Firefox is the rational default in 2026. Install it, then:

1. Install [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/) from the official Mozilla add-ons store.
2. Leave the default settings for a week. The default filter lists (EasyList, EasyPrivacy, uBlock filters) already block the vast majority of ads and trackers with zero configuration.
3. When you hit a page with leftover clutter, use the element picker (the eyedropper icon) to hide it permanently. This is the feature uBO Lite cannot offer.

Firefox also ships with built-in protection: Enhanced Tracking Protection blocks cross-site cookies, fingerprinters and cryptominers out of the box. Set it to **Strict** in Settings → Privacy & Security — for most people the only side effect is that some sites ask you to log in again.

### If you must stay on Chromium: uBO Lite + Privacy Badger

Some teams, corporate policies or web apps force Chromium. In that case:

- Install [uBlock Origin Lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecngfh) and enable all filter lists it offers.
- Add the EFF's [Privacy Badger](https://privacybadger.org/), which learns trackers by observing their behavior instead of relying on static lists — it complements uBO Lite's static-rule limitation.

This is a good setup, not a great one. Accept the difference and move on.

## Layer 2: DNS-level filtering (the one that covers everything)

Browser extensions only protect the browser. Your phone apps, smart TV, and IoT devices are still phoning home to ad and tracker domains all day. DNS-level filtering fixes that for the whole network: instead of blocking in the browser, you block at the moment the device asks "where is ads.example.com?" — the answer is simply "nowhere" ([AdGuard Home](https://adguard.com/en/adguard-home.html), [Pi-hole](https://pi-hole.net/)).

### Pi-hole

The classic. Runs on a Raspberry Pi or any Debian-based machine, installs with a single script, and gives you a dashboard showing exactly which devices are querying which tracker domains. If you already have a Raspberry Pi collecting dust, this is the cheapest privacy upgrade you can make.

### AdGuard Home

The modern alternative. It is a single Go binary that runs on anything — x86, ARM, even a $5 VPS — and installs in minutes. Its dashboard is arguably nicer, it supports DoH/DoT upstreams out of the box, and it is easy to run inside a container. For homelab users, both are first-class citizens: if you are still deciding between containers and VMs for services like this, our [complete containers vs. VMs comparison]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) helps.

Setup is the same for both:

1. Install on a machine that is always on.
2. Point your router's DHCP settings to the blocker's IP as the DNS server.
3. Watch the query log for a day — you will be surprised how much tracking your "smart" devices do.
4. Add your own allowlists for anything that breaks (some smart TVs and apps get cranky).

No homelab? You can get most of the benefit from a cloud filtering DNS like NextDNS or AdGuard's public DNS — set it as your device's DNS and the blocking happens remotely.

## Layer 3: the server side (bonus for self-hosters)

If you run a website, remember the problem has two directions. DNS and browser blocking protect *you* from *them*; protecting your own server from scrapers and bots is the inverse problem. We wrote a full guide on [detecting and blocking bot traffic on self-hosted sites]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) — log analysis, rate limiting, fail2ban and CrowdSec — which pairs naturally with a DNS blocker on the same box.

## Caveats: anti-adblock walls and false positives

Expect occasional friction. Some sites detect ad blockers and show a paywall-style nag; uBO's element picker or a site-specific allowlist usually solves it. Occasionally a DNS blocker will break a legit service — that is what the allowlist is for. None of this is new, and none of it is a reason to give up: the layers absorb each other's gaps.

## The takeaway

Blocking ads in 2026 is a layered stack, not a single extension: Firefox + uBlock Origin in the browser, DNS filtering at the network edge, and a little tolerance for edge cases. The pieces are free, the setup takes an evening, and the payoff — no pre-rolls, no cross-site tracking, and a quieter network — lasts years.

Read also:

- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [How to Detect and Block Bot Traffic on Your Self-Hosted Website [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
