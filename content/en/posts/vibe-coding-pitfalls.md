---
date: 2025-03-20T13:01:03-03:00
draft: false
title: Why I'm Breaking Up With the Vibe Coding
description: 
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-vibe-coding-v2.png
categories:
  - article
tags:
  - artificial-intelligence
  - cursor
  - vibe coding
  - claude
---

We've all been there: headphones on, music pumping, fingers flying across the keyboard, lost in the "flow" with your favorite AI agent. This, my friends, is vibe coding. It's when you're in the zone, seemingly effortlessly producing code.

It's the idea that you can create great software simply by immersing yourself in the feeling of coding, trusting your intuition and riding the wave of inspiration. But lately, I've realized that for me, at least, the vibe is…off.  It's like I'm watching an AI agent code for me, occasionally chiming in with a suggestion or a correction, but often just observing the code unfold without fully grasping the intricacies of what's happening can lead to wasting my time later.

## What is Vibe Coding Anyway?

Vibe coding is less a methodology and more a state of mind. It's about prioritizing the use of an AI agent over really thinking through the code implementation with structured planning and rigorous testing. It's about chasing that dopamine hit of making progress, often without a clear roadmap. It's seductive because it feels productive.

## Why the Vibe is Failing Me

For the last two months, I've been relying heavily on vibe coding, and the results haven't been pretty. Here's why:

First, I was initially drawn to AI agents like Cline, Roo Code, and then tried the Cursor editor because they promised to enhance my coding flow. I loved the idea of having an AI partner that could anticipate my needs and help me write code faster. However, I quickly realized that this approach was leading me astray.

What I realized is that using the AI agent is fine for creating a mockup of what you want, but after that, the context windows and everything leads to more and more rework over time. This happens because in your frustration, the first thing that comes to mind is just explain to the model again, without even knowing what has been implemented in the first place. This is understandable since in a matter of minute, the agent could have written a thousand lines of code and, obviously, this is kind of insane.

The greatest problems that I see in vibe coding are:

- It can be a huge time sink: in the beginning you seem to getting places, but since you have no structure, you are being led by what is appearing in the screen, and you become consumed by the next error or working feature that appears on the screen.
- It is expensive: this is a consequence of the first problem. As context windows grow, the requests get more expensive, and rapidly you can see numbers like 500k tokens sent, and a fraction of that received.

In the end, it doesn't seem to be a huge timesaver for many tasks, if you begin a project with no structure, that is. The time you "save" in the beginning, you'll have to use it later to rewrite the code to do what you intended in the first place. 

## Flip side: an enthusiast's view

But there are also many benefits, since I can at least understand more about the code with time. Beginning this journey, it was clear to me that it would take time and money for me to create worthwhile project. Something that initially can seem unreachable, after reading the code multiple times trying to understand errors, I have begun understand the structure and syntax of the language. In my case, I am focusing my efforts in learning Python, so most of the code that I am creating is in Python. With time I can understand better what is the error and can nudge the model towards the solution.

## Vibe Coding vs. AI Chat vs. Web Search

Vibe Coding: Great for initial exploration and getting a feel for a problem, but terrible for structured development and complex projects.
AI Chat (ChatGPT, etc.): Useful for generating boilerplate code and getting quick answers, but can lead to reliance on AI-generated solutions without fully understanding them. Requires careful verification and can suffer from "AI hallucinations".
Web Search (Google, etc.): Essential for finding specific solutions and understanding concepts, but can be overwhelming and time-consuming if you don't know what you're looking for.

The balance seems to be on using tab completion inside the editor and using something like Gemini Code Assist. I am using the Gemini Code Assistant because it is free, but I am really liking it. I am using it in VS Code and recommend it. It is really good in creating unit tests, and while running tests it is fairly good in resolving the failures. As it is the first time that I am creating unit tests for my code, it is a bit confusing for me to understand what is going on, but with the assistance of Gemini it seems reachable.

Another thing that I tried, but am leaning to the side of ditching it is using an agent like Roo Code or Cline. They can go on for a long time and consume loads of tokens with not guarantee of working in the end. So the problem becomes how to make this cheaper with time. [GosuCoder](https://www.youtube.com/@GosuCoder) is someone that I see testing various strategies on how to keep costs down, but the main bottleneck is the use of Claude. While it seems to be the only one with full support for everything, it is one of the most expensive models to run, and with the tendency to use tons of tokens, the costs becomes prohibitive for most people. If not for this, Gemini 2.0 and DeepSeek V3/Chat seem really good for most uses in coding (at least for me).

Another strategy have been using Open WebUI, which I have been liking a lot. It has a ton of features and options, which gives a lot of control. What I like is to use custom models for different use cases of mine (coding, patents, phd, etc.). It is mostly inexpensive and when using Gemini it gives a really good context window to edit large files. What it seems to be really good use case is pasting text and rearranging it, removing spaces, displaying in tables, and things like that. The ability to do the custom prompts also gives the possibility to save money on tokens.

## Conclusion: Finding a Better Balance

I'm not saying vibe coding is always bad. There's definitely value in letting your creativity flow and exploring ideas without rigid constraints. However, I've learned that it's not a sustainable approach for me, especially when deadlines loom and API costs mount. For me, Gemini Code Assist seem to be a great alternative, because it is free and has a great context window. Also, Open WebUI is great because of the control and customizability, and the costs are relatively low for everyday tasks.

For me, this seems to be the best balance for now, but I am leaning to eventually pay for a chat app, like Perplexity (which has a good free tier and costs 20 dollars per month), since I am paying around 30 dollars/month for the last 2 months in API usage. In the future, maybe it will make sense to have a model running locally, but I think the costs for API usage will be lower as more efficient models are launched.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.

{{< contact_form >}}
