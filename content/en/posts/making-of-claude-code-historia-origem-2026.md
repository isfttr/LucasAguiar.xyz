---
date: 2026-07-07T18:00:00.000Z
draft: true
title: 'The History of Claude Code: How an Internal CLI Became Anthropic''s Code Agent [2026]'
description: The story of how Claude Code evolved from a two-day internal experiment into the code agent that transformed software development. Behind the scenes told by those who built it.
featured_image: ''
categories:
  - article
tags:
  - ia
  - dev
  - ferramentas-desenvolvimento
  - software-livre
translation_source_hash: 70c03f9beb45c6bbbee1a52c763cc9d6de84f5657678c800501dfc76cfe92be9
---
On July 6, 2026, Anthropic published an unusual article on its website. It was not the announcement of a new model, nor the opening of an office, nor a research paper. It was a story told by 14 people—researchers, engineers, designers, and external users—about how Claude Code was born.

The article, *The Making of Claude Code*, is an oral history: a collage of testimonies that reconstructs the trajectory of a tool that began as an internal CLI called *clide* and became one of Anthropic’s most influential products. What emerges throughout the text is not a straight line of success, but a succession of attempts, failures, intuitions, and models that were not ready—until they were.

## The Origins: from 2021 to Clide

Before Claude Code was conceived, Anthropic was already thinking about coding assistants. Shauna Kravac, head of Reinforcement Learning, recalls that in early 2022 the company was already working on "autonomous software engineering agents." Dawn Drain, research engineer, spent the first three years at Anthropic—since 2021—trying to make a model "as good at programming as I am."

The first tangible product was a VS Code extension in 2022. Ben Mann, co-founder, says it gave four different suggestions for each prompt. It reached about 100 external users. The infrastructure needed to act in the real world, however, was—and still is—much more complex than that of a chatbot. Code execution in containers, environment management, timeouts—challenges the team faced in 2022 and which, according to Shauna, "are the same ones people face today with agents."

Dawn spent an "embarrassingly long" time trying to teach Claude to write diffs. From that work came *clide*, a command-line tool that allowed conversations with Claude for code editing. It was slow, had limitations, but it worked. Adam Wolff, who later became the first manager of the Claude Code team, remembers implementing a "baby agentic" version in clide: the model inferred what you wanted to do from a partial change. "The first time it worked, I was dancing in the kitchen. I couldn't believe it."

## The Spark: the Two-Day Demo

In September 2024, Boris Cherny, now head of Claude Code, started working on what he called "Claude CLI." It was a two-day project. He recorded a demo: the Claude CLI took a screenshot of Apple Music to find out which song was playing. "I posted it on Slack. I think I got two or three likes."

The next day, Boris saw Robert Boyce working and recognized the red and green characters of code—"which are kind of iconic now," says Boris. "He was like, 'Yeah, it's doing my code.' It was the craziest thing—it was being useful."

Urgency took over. Boris started working every weekend. "My friends would ask 'What's going on? Come hang out!' But there was this thing I couldn't stop thinking about."

## The Small Team That Soared

The team that built Claude Code was deliberately small. Adam Wolff, who had worked on React at Facebook, knew that premature scaling is a risk. "Boris wanted fast growth. I wanted the opposite. It's good to have more people, but scale makes everything harder—process, culture, vision."

The initial team was basically Boris, Sid Bidasaria, and Ben Mann. In December 2024, a few more people joined, and they began a two-week sprint for the launch. Most of the core features that exist today were built in those two weeks—including bug reporting and the login flow.

"That's when I felt: 'OK, this is becoming something real,'" says Sid.

Speed was possible because the product was a CLI. No complex web architecture. No deploy. Just auto-update and good usage metrics. When a user complained, the fix arrived five minutes later.

## The Launch and the Turning Point

The external launch was in February 2025—and the initial reception was lukewarm. "Some people thought it was a cool idea, but there were tons of bugs," says Cat Wu, head of product. That was when the Claude CLI was renamed to Claude Code.

Igor Kofman, one night before the launch, thought: "Wouldn't it be cool to have an ASCII logo?" He collaborated with Claude to fill in ASCII fonts—and the uppercase Claude Code logo was born. Meaghan Choi, product designer, added the "Clawd" character to the terminal, a visual Easter egg that survives to this day.

The turning point came with the Claude 4 models. "Until then, there wasn't much UX design we could do," says Meaghan. "The model simply wasn't ready for the product we wanted to build. But then it became."

## The New World

In February 2025, Claude Code wrote about 10% of Boris's code. In May, it rose to 30-40%. When Sonnet 4 came out, Boris recalls: "Wow, this is getting really good." By winter 2025, 100% of Boris's code was written by Claude Code. "Not a single line by hand."

Shauna Kravac, who hadn't written code in years as a research lead, is now a power user: "I have a swarm of twelve different Claudes running—reading documents, updating things, pulling info from Slack."

Austin Ray, from Ramp (which uses Claude Code in production), says the tool has fundamentally changed how the company works: "At the beginning, everyone read every permission request Claude Code made. Today, the vast majority of our users accept everything automatically. Claude has earned trust."

## What Comes Next

Adam Wolff, who saw React grow from a pure computer science idea to "a logo, a brand, a feeling," makes a prediction: "Claude Code will evolve the same way. Whatever you think it is—the terminal, Claude's personality, a specific prompting technique—none of that matters in the limit."

Igor Kofman, who started programming in BASIC at age seven in Ukraine, no longer writes code manually since winter 2025. Shauna projects that "for most of 2026 and 2027, a lot will happen in just three months. Three months of progress in 2024 would have been an improvement, but not so dramatic. That's the disorienting part—and I don't think anyone is prepared."

The full Anthropic article can be read at [anthropic.com/features/making-of-claude-code](https://www.anthropic.com/features/making-of-claude-code).

Read also:

- [Cursor vs Windsurf vs Zed 2026: Which AI Code Editor is Best?]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Sonnet 5: Limited Context Window Makes It Useful Only as a Sub-agent]({{< relref "posts/claude-sonnet-5-2026/" >}})

---

Feel free to get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
