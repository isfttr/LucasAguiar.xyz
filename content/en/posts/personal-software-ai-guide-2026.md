---
date: 2026-08-01T15:05:33-03:00
draft: true
title: "Personal Software in the AI Era: How Anyone Can Build Apps for an Audience of One"
description: "AI coding tools turned software for a single user into a practical reality. The story of home-cooked apps, the stack that makes them possible, and why your next app may have an audience of one."
featured_image: ""
categories:
  - article
tags:
  - ai
  - software-engineering
  - personal-software
  - development
  - llm
---

It starts with a problem that no app in the App Store solves. For Adam Waxman, it was a PDF from a sleep consultant full of conditional logic — wake windows, nap caps, what to do when a nap fails. His family needed a live schedule that re-plans itself when a nap runs short, shared between him, his wife, and the nanny. No startup was ever going to build that. So he built it himself, in a week of evenings, and it now runs his household's sleep routine.

That story, told in his essay [Software for One](https://www.ajwaxman.com/writing/software-for-one), is not a novelty. It is the clearest sign yet that the economics of software changed: **software built for an audience of one is now practical**. This post explains what personal software is, why AI made it viable, and how you can start building your own.

## What "personal software" means

The term comes from [Robin Sloan's 2020 essay](https://www.robinsloan.com/notes/home-cooked-app/), where he described BoopSnoop, a messaging app he built for his family. Four people downloaded it. Zero churn. He called it "a resounding success" and made the key argument: *an app can be a home-cooked meal*. You don't need scale. You don't need users. You cook for the people you love — and, increasingly, for yourself.

The idea is simple: most commercial software is one-size-fits-all. It carries user profiles, badges, subscription tiers, and hundreds of settings you will never touch, because it was built for the average of millions of users. Personal software skips all of that. It solves *your* problem, with *your* data, in *your* workflow. Lee Robinson — who built a baby tracker with his wife because they "didn't need user profiles, badges, subscription tiers, or any other extra features" — [wrote in 2025](https://leerob.com/n/personal-software) that this inverts the original promise of personal computing: the machine was personal, but the software never was. Now it can be.

## Why AI made it practical

Personal software existed before LLMs. Sloan built BoopSnoop in 2020 — but he also noted that "in a better world, I would have built this in a day." The bottleneck was never imagination. It was engineering cost. Hand-writing the UI, the auth, the database glue, the deployment pipeline, the mobile code-signing, took a week or more per app, and that was *with* Sloan being a professional developer.

That cost collapsed. Six years later, Waxman's essay resurfaced on X with the observation that "personal software was a bit early in 2020 but in 2026, it really can be as personal as a home cooked meal, or a handwritten letter." What changed in between is the obvious thing: AI coding assistants (Claude Code, Cursor, Windsurf, and the rest) that turn a natural-language description into a working app, iterate on it, and debug it alongside you.

The economic consequence is worth stating plainly. When engineering time was expensive, any piece of software had to be amortized across thousands of users to be worth building. That constraint is gone. An app that saves one family one hour a day is now worth the single evening it takes to build. As I argued in my post on [how AI changes the economics of software rewrites]({{< relref "posts/ai-changes-software-rewrite-economics-2026/" >}}), the marginal cost of producing software has fallen so far that entirely new categories become rational. Personal software is the clearest example.

## What a personal software stack looks like

Waxman's stack, after a couple of years of iteration: Next.js on Vercel, Tailwind and shadcn/ui, Better Auth for authentication, and Postgres on Neon with Drizzle ORM. It is a deliberately boring, mainstream stack — which is exactly the point. When you are building for an audience of one, you optimize for *speed of iteration*, not for scale, novelty, or future hiring. You want the stack with the largest amount of AI training data, because the AI assistant will be most reliable on the most common combination of tools.

The pattern that emerges from the people actually shipping personal software:

1. **Describe the problem in plain language first.** A nap schedule with conditional logic. A smoothie recipe that sizes portions to that morning's run. A quiz app for jazz chord voicings. The problem statement is the spec.
2. **Generate the skeleton with an AI assistant.** Boilerplate, auth, database schema, basic UI — the parts that are the same in every app — come almost free.
3. **Iterate against real use.** The advantage of an audience of one is that feedback is immediate and honest: your wife, your nanny, or you. No A/B tests, no analytics funnels, no feature requests from strangers.
4. **Host it cheaply and forget it.** Serverless platforms, a $5 VPS, or your own [homelab]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) all work. A personal app with five users costs almost nothing to run.

The key discipline is scope control. The reason personal apps work is that they *don't* have the features commercial software has. The moment you add user profiles and subscription tiers, you have rebuilt a SaaS product and lost the point.

## The sovereignty argument

There is a second, less obvious reason personal software matters: ownership. Sloan put it directly: "There will be no sudden redesign, no flood of ads, no pivot to chase a userbase inscrutable to us."

Think about what that means in practice. A commercial sleep tracker can change its pricing, delete a feature you depend on, or sell your sleep data — and your only recourse is to find another app and start over. A personal app does what you wrote it to do, forever, with your data in your control. This is the same argument that drives self-hosting and open source, but sharper: at the limit, you don't just *host* the software, you *are* the author of it.

This is also why the privacy angle is underrated. An app built for one user can be ruthlessly simple about data: no analytics, no advertising SDKs, no third-party trackers, because there is nobody asking for them. For sensitive categories — medical records, sleep data, family communication — that alone can justify building something yourself. Waxman's list of personal apps includes a medical records tool that flagged gaps before a specialist visit. That is exactly the kind of data you do not want a random SaaS harvesting.

## The bigger picture

Lee Robinson's prediction is that within a decade, millions of people — designers, marketers, product managers — will create software, not just developers. The essays from 2026 suggest that prediction is on track: the people building personal software this year are doing it with the same casualness they would bring to a spreadsheet. The tooling has crossed a threshold where "can I build this?" is no longer the question. The question is only "is it worth an evening of my time?"

For the software industry, this is a slow-motion structural change. If the marginal cost of a custom app is approaching zero, the one-size-fits-all SaaS model loses its moat at the edges. Not in the enterprise, not in regulated domains, but in the long tail of personal and family workflows — exactly the space where startups have historically struggled to find a business model anyway.

If you have a recurring annoyance in your life — a family schedule, a diet plan, a hobby tracker, a tool your job doesn't provide — that's your entry point. Describe it in a paragraph, open your AI assistant, and see what comes back. The first app you build for an audience of one probably won't be your last.

Also read:

- [How AI Changes the Economics of Software Rewrites [2026]]({{< relref "posts/ai-changes-software-rewrite-economics-2026/" >}})
- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
