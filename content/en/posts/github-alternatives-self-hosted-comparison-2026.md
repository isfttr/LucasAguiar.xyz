---
date: 2026-08-17T15:10:00-03:00
draft: true
title: "GitHub Alternatives in 2026: Self-Hosted and Managed Options Compared"
description: "Compare Gitea, Forgejo, GitLab CE, Codeberg, SourceHut and Radicle in 2026: self-hosted vs managed, resource use, CI/CD, the 2026 outage record driving migration, and a practical checklist."
featured_image: ""
categories:
  - article
tags:
  - git
  - github
  - self-hosting
  - devops
  - version-control
---

It's Sunday night, your deploy window is closing, and GitHub just went down — again. Or maybe nothing dramatic happened: you simply opened your feed and the AI assistant you never asked for was there, waiting to "help", while yet another debate about AI-generated code and content watermarking raged on. So you type the question into Hacker News: "Alternatives to GitHub?" Within hours it has 357 points and nearly 200 comments. You are not alone — and the good news is that in 2026 the answer is better than "just switch to GitLab".

This guide is a practical, decision-oriented tour of the real alternatives: the self-hosted lightweight forges (Gitea, Forgejo, Gogs), the full platform (GitLab CE), the hosted non-profit (Codeberg), the minimalist (SourceHut), and the fully decentralized (Radicle). For each one: what it is, what it costs, what it weighs, and who it's for — plus a migration checklist at the end.

## The landscape at a glance

| Option | Type | License | Self-host | CI/CD | Best for |
|---|---|---|---|---|---|
| **Gitea** | Lightweight forge | MIT | Yes (single binary) | Gitea Actions | Homelab, solo devs, small teams |
| **Forgejo** | Lightweight forge (Gitea fork) | MIT | Yes (single binary) | Forgejo Actions | Community-governed self-hosting |
| **GitLab CE** | Full DevOps platform | MIT (core) | Yes (heavier) | GitLab CI/CD | Companies, complex workflows |
| **Gogs** | Ultra-lightweight forge | MIT | Yes (single binary) | Limited | Minimal self-hosting |
| **Codeberg** | Hosted forge (Forgejo) | — | No (free for FOSS) | Forgejo Actions | Open-source projects, no-AI stance |
| **SourceHut** | Minimalist forge | Paid service | Yes (self-hostable) | sr.ht builds | Email-first workflows |
| **Radicle** | Peer-to-peer network | MIT | No server needed | Radicle CI | Decentralization purists |

## Why people are looking in the first place

The motivations show up in every "alternatives" thread, and they're worth naming because they drive the choice:

- **Control and privacy.** Your repos, issues, and activity live on someone else's infrastructure. Self-hosting means your code never leaves a server you control — relevant for homelab owners who already run [Proxmox and containers]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).
- **AI features pushed by default.** Copilot-style assistants, code review bots, and content watermarking debates (the same ones hitting every major AI product in 2026) made many developers uncomfortable with a platform that decides for you what "assistance" looks like.
- **Outages and availability.** When a platform hiccups right at deploy time, the value of `git push` working against your own server becomes very concrete. GitHub logged **nine critical incidents between mid-June and mid-August 2026 alone** — including a major one on the day this post was written (see [the 2026 reliability record](#the-2026-reliability-record-today-is-not-an-exception) below).
- **Cost.** Private repos are cheap on GitHub, but "cheap" is not "free", and self-hosting on hardware you already run is effectively free.
- **Philosophy.** Git is decentralized by design; a single forge is a choice, not a law.

The important nuance: Git itself is not locked in. Every option below speaks standard Git — your history, branches, and tags move with you. The question is only where the *forge* (issues, PRs, CI, wiki) lives.

## The 2026 reliability record: today is not an exception

If you found this post because GitHub is having a bad day, here is the context that makes the bad day meaningful. On **August 17, 2026**, GitHub logged a **critical** incident — "Incident with GitHub.com" — starting around 13:40 UTC (10:40 BRT). Hours later the [status page](https://www.githubstatus.com/) still showed a "Partial System Outage", with degraded API requests, degraded Issues and sporadic authentication failures; Git operations were eventually mitigated, but with residual impact. Microsoft confirmed a massive global outage, covered by Forbes, The Economic Times, DevOps.com and others, while Downdetector logged thousands of user reports. Hacker News produced a rare same-day trio: "[Ask HN: Is GitHub Fried Today?](https://news.ycombinator.com/item?id=49333136)", "[GitHub Has an Availability Problem. Is It Time to Look Elsewhere?](https://news.ycombinator.com/item?id=49333728)" — and, of course, "[Ask HN: Alternatives to GitHub](https://news.ycombinator.com/item?id=49331033)" (357 points).

And this is not a one-off. The public status page, which currently lists incidents going back to mid-June, shows **nine critical incidents in two months**:

- Aug 17 — GitHub.com (still open at the time of writing)
- Aug 06 — GitHub Actions
- Jul 25 — Actions run failures and delays
- Jul 24 — Pull Requests
- Jul 21 — SSH connections using deploy keys
- Jul 19 — GitHub Actions
- Jul 16 — general service disruption
- Jul 09 — delays starting Actions runs
- Jun 17 — Copilot availability

The pattern jumps out of the list: **GitHub Actions and the AI/Copilot surface are the recurring weak spots**. Four of the nine criticals hit Actions, and the Copilot/AI-model incidents marked as minor (Jul 30, Aug 1, Aug 3, Aug 5, Aug 10, Aug 13) are too frequent to enumerate. A "[GitHub is down again](https://news.ycombinator.com/item?id=46946827)" thread even hit 514 points back in February 2026. The record is not "GitHub is always down" — it's that when it breaks, it tends to break the components developers depend on most, at the moment they depend on them, and the failures are **correlated**: push, PRs, CI and authentication can all go down together.

That correlation is exactly what self-hosting eliminates. Your own Gitea instance can go down because you misconfigured it — but it won't go down because someone else's fleet had a bad Tuesday, and it won't take your deploy pipeline with it. For teams whose workflow is already containerized (see [containers vs VMs]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})), running the forge next to the workloads is a small step with outsized insurance value.

## Gitea: the lightweight default for self-hosting

[Gitea](https://about.gitea.com/) is a Go application that runs as a single binary — no database server required beyond the embedded SQLite (PostgreSQL/MySQL also supported). It's a 2016 fork of Gogs, and today it's the most popular self-hosted forge by far, with roughly **57k stars** on GitHub. The pitch: "Git with a cup of tea" — painless, all-in-one, and fast.

Typical resource usage is remarkably low: a small VPS with 1 GB of RAM runs it comfortably, and it boots in seconds. Installing with Docker is a one-liner:

```bash
docker run -d --name gitea -p 3000:3000 \
  -v /opt/gitea:/data \
  -e USER_UID=1000 -e USER_GID=1000 \
  gitea/gitea:latest
```

(Full instructions in the [official Docker guide](https://docs.gitea.com/installation/install-with-docker).)

For CI/CD, Gitea ships **Gitea Actions** — a GitHub Actions-compatible runner ([overview](https://docs.gitea.com/usage/actions/overview)). If your pipelines are written as GitHub Actions workflows, most of them run on Gitea with minimal changes, which dramatically lowers the migration cost.

Who it's for: the homelab owner or solo developer who wants GitHub-like features — issues, pull requests, releases, wiki, packages — with a fraction of the resource footprint. The community consensus after years of operation is that upgrades are boring: change the image tag, restart, done.

## Forgejo: Gitea's community-governed sibling

[Forgejo](https://forgejo.org/) started in 2022 as a fork of Gitea after a governance dispute — the community worried about the direction of the project. It's also MIT-licensed, also a single Go binary, and stays intentionally compatible with the Gitea ecosystem: the same UI concepts, the same Actions runner format, the same ease of self-hosting ([Docker installation](https://forgejo.org/docs/latest/admin/installation-docker/)).

The difference is governance: Forgejo is community-run and joined the **Software Freedom Conservancy**, a non-profit umbrella, which means the project can't be bought or redirected by a company. It also drives experimental features like **Forgejo Federation** — a protocol that lets independent forges talk to each other, so a repository on your server can receive pull requests from someone else's server.

Who it's for: people who want the Gitea experience but prefer community ownership, and anyone who cares about the future of federated code hosting. Its flagship hosted instance, Codeberg (below), is the proof that the software is production-grade.

## GitLab CE: the full platform, at a cost

[GitLab Community Edition](https://about.gitlab.com/install/) is the closest feature match to GitHub when you need everything: merge request approvals, built-in CI/CD with a first-class pipeline editor, container registry, dependency scanning, SSO, and fine-grained permissions. For a company migrating a large GitHub organization, it's the least surprising destination.

The price is operational weight. A production GitLab install wants PostgreSQL, Redis, and a few GB of RAM; the [Docker deployment](https://docs.gitlab.com/ee/install/docker/installation.html) is the easiest path, but you are now running a small platform, not a single binary. Teams that self-host GitLab for years report it works well — and also that you must budget for upgrades, runners, and the occasional rollback. If you're a solo homelab user, GitLab is almost certainly overkill; if you're a company, it's the serious option.

## Hosted alternatives: no server required

Not everyone wants to run infrastructure. Three hosted options stand out:

**[Codeberg](https://codeberg.org/)** — a non-profit forge run by the Codeberg e.V. association in Germany, built on Forgejo. It's free for free and open-source software, has a clear [no-AI-training / anti-scraping stance](https://docs.codeberg.org/), and is a common migration target for people leaving GitHub specifically over AI policies. Donations and volunteers keep it running.

**[SourceHut](https://sr.ht/)** — "the hacker's forge". SourceHut is deliberately minimal: no JavaScript-heavy UI, email-driven workflows (`git send-email` for patches), and a collection of small services (git, lists, builds, man pages, paste). It's a paid service with a low annual fee, which keeps it independent and ad-free; the maintainer, Drew DeVault, is one of the most vocal critics of enshittification in developer tools. It's the right choice if you live in the terminal and like your tools austere.

**[Radicle](https://radicle.xyz/)** — a peer-to-peer stack for code collaboration (MIT, ~900 stars). There is no central server at all: repositories replicate directly between the machines of the people working on them, with issues and patches exchanged over a P2P network. It's the most philosophically pure answer to "put your eggs in one basket" — and also the most niche: you need your collaborators to adopt it too.

## The ultra-minimal end

If even Gitea feels heavy, remember the ancestors. **[Gogs](https://gogs.io/)** — the original "painless self-hosted Git service", also Go, also MIT — still runs on hardware measured in hundreds of MB. And below that there's the classic Unix stack: **gitolite + cgit**, where `git` is just served from a bare repository on a server you already have, with no web UI at all. It's not glamorous, but it's been running production code since before GitHub existed.

## How to choose: a decision framework

- **Solo dev with an old server or a $5 VPS** → Gitea (or Forgejo if you prefer the governance). Both fit in 1 GB of RAM with room to spare.
- **Small team that needs CI/CD** → Forgejo or Gitea with Actions; your GitHub workflows mostly carry over.
- **Company migrating a big GitHub org** → GitLab CE. Budget for PostgreSQL, Redis, and operator time.
- **FOSS purist, anti-AI default, no hosting budget** → Codeberg.
- **Terminal-first, email-driven workflows** → SourceHut.
- **You want no central point of failure at all** → Radicle.

## Migration checklist

Moving to a new forge is mostly mechanical — this is the happy consequence of Git being the universal substrate:

1. **Export the repositories.** `git clone --mirror` each repo, or use GitHub's archive/export if you need issues and PRs too.
2. **Create the destination.** Gitea, Forgejo, and GitLab all have built-in importers that can pull a repo (and often issues) directly from a GitHub URL — the fastest path for small projects.
3. **Push the history.** `git push --mirror <new-remote>` preserves branches and tags exactly.
4. **Rewire CI.** GitHub Actions workflows run on Gitea/Forgejo Actions with minor changes; GitLab CI uses its own syntax, so budget time to translate pipelines.
5. **Update remotes for the team.** `git remote set-url origin <new-url>` and re-issue tokens/SSH keys.
6. **Keep GitHub as a read-only mirror** (optional). Push to your forge, mirror to GitHub for discoverability — many projects run this way permanently.

Also worth revisiting while you're at it: if your team relies on stacked-PR workflows, tools like [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) or a [stacked pull requests]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) setup are forge-agnostic — they work identically whether the remote is GitHub, Gitea, or a bare server.

## What to watch

Two trends are worth following in 2026. First, **federation**: Forgejo Federation and similar efforts are slowly turning forges from walled gardens into a network, the same way email and ActivityPub did for their domains. Second, **AI policy as a migration driver**: the stance a platform takes on training on your code and watermarking AI output is becoming a first-class criterion — exactly what pushed so many people to Codeberg this year. Third, **reliability as an operational choice**: after 2026's outage record, the mirror pattern is gaining ground — self-hosted forge as primary, GitHub kept as a read-only mirror for discoverability — which turns availability risk into something you control rather than something you absorb.

The short version: you don't need GitHub's permission to leave, and you don't need to sacrifice features to do it. A single Go binary on a server you control gives you 90% of the experience with none of the surveillance — and Git makes the move reversible at any time.

Read also:

- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [GitButler: What It Is, Review and Alternatives [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

You can get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
