---
date: 2026-08-02T15:10:00-03:00
draft: true
title: "How to Structure Technical Documentation: A Diátaxis Guide [2026]"
description: "Diátaxis framework explained: the 4 types of technical documentation (tutorials, how-to guides, reference, explanation) and how to organize docs users actually find. Practical guide."
featured_image: ""
categories:
  - article
tags:
  - technical-documentation
  - diataxis
  - technical-writing
  - developer-tools
  - dev
---

You know the feeling. You land on a project's docs page to solve one specific problem — "how do I configure the timeout?" — and you get a wall of prose that explains the product's philosophy for three paragraphs before getting to anything usable. Or worse: the page is called a "tutorial" but it's actually a list of commands with zero context, and you have no idea what you just did.

Documentation fails most often not because it's badly written, but because it's badly *structured*. Every page tries to be everything at once, and ends up serving nobody. There is a systematic answer to this problem, it's free, and it's been quietly adopted by some of the best docs teams in the industry: the **Diátaxis framework**.

## What is Diátaxis?

Diátaxis (from the Ancient Greek *diátaxis*: *dia*, "across", and *taxis*, "arrangement") is a systematic approach to technical documentation authoring created by [Daniele Procida](https://diataxis.fr/). Its core claim is simple: there are **four fundamentally different kinds of documentation**, responding to four different user needs, and each one must be written and organized differently.

The four kinds are:

| Kind | What it is | The user's question |
|------|-----------|---------------------|
| **Tutorial** | A lesson | "Teach me, step by step" |
| **How-to guide** | Directions | "Help me solve this problem" |
| **Reference** | Technical description | "What is the exact fact I need?" |
| **Explanation** | Understanding | "Why does this work this way?" |

The framework prescribes approaches to content (what to write), style (how to write it) and architecture (how to organize it). It's lightweight, imposes no implementation constraints, and works for a two-person startup wiki just as well as for [Cloudflare's developer docs](https://developers.cloudflare.com/), which used Diátaxis as its "north star" during a redesign — or for [Django's documentation](https://docs.djangoproject.com/en/5.2/), whose structure (tutorials, how-to guides, reference, topics) maps almost perfectly onto the four quadrants.

The framework hit the front page of Hacker News again in August 2026 with nearly 500 points — a sign that the "docs are broken" pain is as real as ever, and that the community keeps coming back to Diátaxis as the answer.

## The four quadrants

### Tutorials: the lesson

A tutorial is a **lesson**: it takes a student by the hand through a learning experience. It is always practical — the learner does something meaningful, under the guidance of the instructor, towards an achievable goal. "Let's create a simple game in Python" is a tutorial. A driving lesson is the canonical example: the point is not to get from A to B, but to develop skill and confidence.

The hard part: in written documentation the instructor is absent. There's no one to notice the learner is stuck and correct course. So a good tutorial must be *meaningful* (the learner needs a sense of achievement), *successful* (they must be able to complete it), *logical* (the path makes sense), and *complete* (they encounter all the concepts and tools they need). Tutorials are rarely done well, and they are constantly confused with how-to guides — the single most common Diátaxis mistake.

### How-to guides: the recipe

A how-to guide addresses a **real-world goal or problem** with practical directions. Unlike a tutorial, it assumes an already-competent user: someone who is at work, not at school. "How to configure frame profiling", "How to troubleshoot deployment problems", "How to rotate your database credentials without downtime" — these are how-to guides.

The difference from a tutorial is the difference between a lesson and a recipe: the tutorial is concerned with *study*, the how-to guide with *work*. If the reader already knows the tool, they don't need to be taught — they need to get the job done and get back to their day.

### Reference: the manual

Reference documentation is the **technical description** — the facts a user needs to do things correctly: accurate, complete, reliable, free of distraction and interpretation. API signatures, configuration options, return codes, schemas. It contains propositional knowledge, not guides to action.

Reference is where most projects fail in the opposite direction: they add prose, opinions and examples to the reference until it stops being reference. Diátaxis is ruthless here — reference should be boring on purpose. The excitement belongs in tutorials and explanation.

### Explanation: the discussion

Explanation is a **discursive treatment** of a subject that permits reflection. It's understanding-oriented: it deepens and broadens the reader's understanding, brings clarity and context. It answers the question "Can you tell me about…?" — and it's the only kind of documentation that makes sense to read away from the product itself. (The framework's author notes, only half jokingly, that explanation is the only docs you might read in the bath.)

Explanation is the quadrant most teams skip entirely, which is a shame: it's what turns a collection of instructions into a body of knowledge people can reason with.

## The compass: deciding where content belongs

Intuition is not always reliable. When you're unsure whether a page is a tutorial, a how-to, reference or explanation, Diátaxis gives you a **compass** — a decision procedure based on two questions:

1. **Action or cognition?** — is the content about doing, or about knowing/thinking?
2. **Acquisition or application?** — does it serve study, or does it serve work?

The [compass table](https://diataxis.fr/compass/) maps the answers:

| The content… | …serves the user's… | …so it belongs in |
|---|---|---|
| informs action | acquisition of skill | a **tutorial** |
| informs action | application of skill | a **how-to guide** |
| informs cognition | application of skill | **reference** |
| informs cognition | acquisition of skill | **explanation** |

Apply these questions at any level — from a whole document down to a single sentence. The compass is a course-correction tool: whenever you feel a page "isn't working", run it through the two questions and you'll usually find it's trying to do two jobs at once.

## Applying Diátaxis to your docs (and your AI-generated docs)

The [official advice](https://diataxis.fr/start-here/) is to start by *applying*, not by reading theory. A practical workflow:

1. **Audit.** List every page in your docs and map it to a quadrant using the compass. You will immediately find orphans: tutorials that are actually how-to guides, reference pages with three paragraphs of opinion, and a missing explanation section.
2. **Move, don't rewrite.** Diátaxis is mostly reorganization. Shift content into its quadrant, split pages that serve two needs, and delete nothing yet.
3. **Fill the gaps.** Most projects lack explanation. Write one page per major topic answering "Can you tell me about…?"
4. **Enforce the structure.** Add a "Tutorials / How-to / Reference / Explanation" split to your navigation, and make the rule explicit to contributors: new content must declare its quadrant.

This matters more in 2026 than it did when the framework appeared, because AI now writes a huge share of documentation. LLMs are excellent at generating prose and terrible at deciding structure — left to themselves they produce undifferentiated walls of text that mix tutorial, reference and explanation in the same page. Diátaxis gives you (and your AI writing pipeline) a schema to enforce: it's the difference between docs that merely exist and docs that answer questions. If you're already using an AI assistant to write or review code — and dealing with its output quality — the same discipline applies: [vibe coding without structure produces the same kind of mess in code that unstructured docs produce in documentation]({{< relref "posts/vibe-coding-pitfalls/" >}}).

## The bottom line

Diátaxis is not a documentation *style* — it's a way of *thinking* about documentation. Four quadrants, one compass, zero implementation constraints. It costs an afternoon to learn and pays off every time someone finds the right page on the first try.

If you run a Hugo site, the structure maps naturally onto content organization — see our guide on [Hugo content file structure]({{< relref "posts/hugo-content-file-structure/" >}}) for the practical side of arranging content directories. And if you want to go deeper on the framework itself, the [Diátaxis site](https://diataxis.fr/) is short, readable and free — start with the [five-minute primer](https://diataxis.fr/start-here/) and apply it to something small today. The [Write the Docs](https://www.writethedocs.org/) community is also the best place to discuss documentation practice with people who do it professionally.

Read also:

- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Hugo Content File Structure]({{< relref "posts/hugo-content-file-structure/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
