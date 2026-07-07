---
date: 2026-07-07T15:00:00-03:00
draft: true
title: "The Making of Claude Code: From Internal CLI to Anthropic's Coding Agent [2026]"
description: "The inside story of how Claude Code evolved from a two-day experiment to the coding agent that transformed software development. Told by the people who built it."
featured_image: ""
categories:
  - article
tags:
  - ai
  - dev
  - dev-tools
  - open-source
---

On July 6, 2026, Anthropic published an unusual piece on their site. It wasn't a model announcement, an office opening, or a research paper. It was a story told by 14 people — researchers, engineers, designers, and external users — about how Claude Code was born.

*The Making of Claude Code* is an oral history: a mosaic of testimonies tracing the path of a tool that began as an internal CLI called *clide* and became one of Anthropic's most influential products. What emerges is not a straight line to success, but a sequence of attempts, failures, hunches, and models that weren't ready — until they were.

## Origins: From 2021 to Clide

Before Claude Code existed, Anthropic was already thinking about coding assistants. Shauna Kravac, head of Reinforcement Learning, recalls that by early 2022 the company was working on "autonomous software engineering agents." Dawn Drain, a research engineer, spent her first three years at Anthropic — starting in 2021 — trying to make a model "as good at coding as I am."

The first tangible product was a VS Code extension in 2022. Ben Mann, co-founder, says it gave four different suggestions per prompt and reached about 100 external users. The infrastructure needed to act in the real world, however, was far more complex than what a chatbot requires. Code execution in containers, environment management, timeouts — challenges the team faced in 2022 that, according to Shauna, "are the same ones people face with agents today."

Dawn spent an "embarrassingly long time" teaching Claude to write diffs. From this work came *clide*, a command-line tool for chatting with Claude about code editing. It was slow and limited, but it worked. Adam Wolff, who later became Claude Code's first manager, recalls implementing a "baby agentic" version: the model inferred what you wanted from a partial change. "The first time it worked, I was dancing around my kitchen. I couldn't believe it."

## The Spark: A Two-Day Demo

In September 2024, Boris Cherny, now head of Claude Code, started working on what he called "Claude CLI." It was a two-day project. He recorded a demo: Claude CLI took a screenshot of Apple Music to find out what song was playing. "I posted it on Slack. I think I got two or three likes."

The next day, Boris saw Robert Boyce working and recognized the red and green code characters — "which are kind of iconic now." Robert was like, "Yeah, it's doing my coding. It was the craziest thing — it was useful."

Urgency took over. Boris started working every weekend. "My friends were like, 'What's going on? Come hang out!' But there was this thing I couldn't stop thinking about."

## The Small Team That Flew

The team that built Claude Code was deliberately small. Adam Wolff, who had worked on React at Facebook, knew that premature scaling is a risk. "Boris was pushing hard for rapid growth. I wanted the opposite. Scale makes everything about process, culture, and vision more difficult."

The initial team was essentially Boris, Sid Bidasaria, and Ben Mann. In December 2024, a few more people joined and they started a two-week sprint toward launch. Most of the core features that exist today were built in those two weeks — including bug reporting and the login flow.

"That's when I felt, 'OK, this is turning into something real,'" Sid says.

Speed was possible because the product was a CLI. No complex web architecture. No deployment pipeline. Just auto-updates and good usage metrics. When a user complained, the fix arrived five minutes later.

## Launch and the Turning Point

External launch came in February 2025 — and reception was lukewarm. "Some people thought it was a cool idea, but it had a ton of bugs," says Cat Wu, head of product. This was when Claude CLI was renamed to Claude Code.

Igor Kofman, late one night before launch, thought: "Wouldn't it be cool if we had an ASCII logo?" He collaborated with Claude to fill out ASCII art fonts, and the iconic Claude Code all-caps logo was born. Meaghan Choi, product designer, added the "Clawd" character to the terminal — a visual Easter egg that survives to this day.

The turning point came with the Claude 4 models. "Until then, there wasn't that much UX design we could do," Meaghan says. "The model just wasn't ready for the product we wanted to build. But then it was."

## The New World

In February 2025, Claude Code was writing perhaps 10% of Boris's code. By May, it was 30-40%. When Sonnet 4 shipped, Boris remembers thinking, "Wow, this is getting really good." By winter 2025, 100% of his code was written by Claude Code. "Not a single line by hand."

Shauna Kravac, who hadn't written much code in years as a research lead, is now a power user: "I have a swarm of twelve different Claudes running — reading documents, updating things, pulling from Slack."

Austin Ray, from Ramp (which uses Claude Code in production), says the tool has fundamentally changed how the company works: "Initially, everyone was reading every single permission request. These days, a huge portion of our users just auto-accept everything. Claude has earned their trust."

## What Comes Next

Adam Wolff, who watched React grow from a pure computer science idea into "a logo, a brand, a feeling," offers a prediction: "Claude Code will evolve the same way. Whatever you think Claude Code is — the terminal, Claude's personality, a specific prompting technique — none of those things matter at the limit."

Igor Kofman, who started coding in BASIC at age seven in Ukraine, no longer writes code by hand — since winter 2025. Shauna projects that "for most of 2026 and 2027, there's going to be quite a lot happening in as little as three months. Three months of progress in 2024 would have been an improvement, but less dramatically so. That's the disorienting part — and I'm not sure if anybody is ready for it."

The full article by Anthropic is available at [anthropic.com/features/making-of-claude-code](https://www.anthropic.com/features/making-of-claude-code).

Read also:

- [From Cursor to Windsurf to Zed: My Journey Through AI-Enhanced Code Editors]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Claude Sonnet 5: Anthropic's Most Agentic AI Model Arrives at a Reduced Price [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [From Cursor to Windsurf to Zed: My Journey Through AI-Enhanced Code Editors]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})

---

Feel free to reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
