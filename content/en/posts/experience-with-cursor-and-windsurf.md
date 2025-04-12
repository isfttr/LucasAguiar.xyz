---
date: 2025-04-12T00:11:32-03:00
draft: true
title: "From Cursor to Windsurf to Zed: My Journey Through AI-Enhanced Code Editors"
description: "A personal review of my experiences with Cursor, Windsurf, and other modern code editors, including their AI capabilities, extension support, and overall user experience."
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-code-editors-journey.png
categories:
  - article
tags:
  - development
  - tools
  - code-editors
  - cursor
  - windsurf
  - zed
  - AI
---

Over the past few months, I've been on a journey to find the perfect code editor that balances excellent developer experience with the productivity boost of AI assistance. This exploration came after I had already spent almost two years using VS Code, which I adopted after ditching Emacs and Neovim in search of a more modern editing experience. My latest search led me through several modern editors, primarily those in the VSCodium family, with some interesting detours along the way. Here's my experience and what I've learned.

## The VSCodium Ecosystem: A Brief Overview

For those unfamiliar, VSCodium editors are essentially forks of Visual Studio Code with a focus on open-source principles. These editors remove Microsoft's telemetry and proprietary elements while maintaining most of the features that make VS Code popular. The ecosystem has expanded recently with several AI-enhanced variants that build on this foundation.

This family of editors shares a common ancestry but diverges in their approach to features, especially AI integration. Some notable members include:

- **VS Code**: Microsoft's original editor
- **VSCodium**: The truly open-source version
- **Cursor**: VS Code with enhanced AI coding assistance
- **Windsurf**: Another AI-focused variant
- **GitPod**: Cloud-based development environment based on VS Code

## My Journey Begins: Cursor

My exploration started with [Cursor](https://cursor.sh/), which initially impressed me with its sleek integration of AI capabilities. After VS Code, it felt like a natural evolution—familiar enough to be comfortable but with added AI superpowers.

During my free trial period with Cursor, I discovered several advantages:

- **Polished UI/UX**: Cursor maintained the familiar VS Code experience while adding thoughtful AI integration points.
- **Seamless AI Assistance**: The ability to get code completions, explanations, and refactoring suggestions felt natural and unobtrusive.
- **Visual Appeal**: The editor's overall aesthetic was pleasant enough that returning to standard VS Code afterward felt like a downgrade.

Cursor's approach to AI felt less intrusive compared to alternatives like Cline or Roo Code. Rather than feeling like an add-on feature, the AI capabilities in Cursor seemed to blend naturally with the development workflow.

## The Windsurf Experiment

After my trial with Cursor ended, I decided to try [Windsurf](https://www.windsurf.io/), another VS Code-based editor promising AI-enhanced development. Unfortunately, this experience was considerably less satisfying:

- **Unpolished Experience**: Windsurf lacked the refinement that made Cursor enjoyable to use.
- **Clunky AI Integration**: The AI features felt bolted on rather than seamlessly integrated.
- **Performance Issues**: I encountered occasional lag and stability problems that disrupted my workflow.

The stark contrast between Cursor and Windsurf highlighted how important thoughtful implementation is for AI-enhanced development tools. Simply adding AI capabilities isn't enough—they need to feel like a natural extension of the editor rather than an afterthought.

## The Extension Problem

Both Cursor and Windsurf (and the broader VSCodium ecosystem) face a significant challenge: extension support. This issue became even more pronounced after Microsoft's recent crackdown on unofficial VS Code variants.

As [Theo Browne discussed in a recent video](https://www.youtube.com/watch?v=a7RxbwZz3OQ), Microsoft has begun restricting access to the official VS Code marketplace for third-party clients. This means users of VSCodium-based editors must rely on alternative extension sources like Open VSX, which severely limits their options.

The Open VSX Registry, while attempting to provide an open-source alternative to Microsoft's marketplace, falls significantly short in several ways:

- **Limited Selection**: Open VSX has only a fraction of the extensions available on the official marketplace
- **Missing Popular Extensions**: Many widely-used extensions haven't been ported over
- **Outdated Versions**: Even when extensions are available, they're often several versions behind their official counterparts
- **Inconsistent Quality**: Without the same review process, extension quality can be hit-or-miss

For many developers, these limitations become dealbreakers. I found myself missing critical extensions, particularly language-specific ones and productivity tools that I had come to depend on in my regular workflow. When you're used to having a rich ecosystem of extensions to solve specific problems, the limitations of Open VSX feel particularly constraining.

## Return to VS Code (Briefly)

The extension limitations eventually drove me back to standard VS Code, but I found myself missing Cursor's aesthetic and AI capabilities. I even tried to reconfigure VS Code to look more like Cursor, which helped somewhat but didn't fully replicate the experience.

This period of returning to VS Code made me realize how much I valued having AI assistance integrated directly into my editing experience, rather than switching contexts to a separate chat window.

## Finding Zed: A Fresh Alternative

Recently, I've been exploring [Zed](https://zed.dev/), which offers a refreshing departure from the VS Code paradigm. Built from the ground up with performance in mind, Zed has recently added robust AI chat support that has impressed me.

What makes Zed stand out:

- **Performance**: It's noticeably faster and more responsive than VS Code-based editors.
- **Clean Design**: The UI is minimalist but thoughtful, focusing on the code rather than surrounding it with panels.
- **Growing AI Capabilities**: While newer, Zed's AI features are already quite useful and improving rapidly.
- **Fresh Approach**: Breaking away from the VS Code ecosystem entirely offers both challenges and opportunities.

Zed feels like the start of something new rather than an iteration on existing technology, which is both exciting and occasionally limiting when specific workflows aren't yet supported.

## Beyond Editors: Claude Desktop and MCP

An unexpected discovery in my journey was realizing that editor-integrated AI isn't the only approach. I've found excellent results using [Claude Desktop](https://www.anthropic.com/claude) with its MCP (Machine Control Protocol) capabilities as a companion to my coding sessions.

This approach:
- Keeps my editor clean and focused on editing
- Provides powerful AI assistance when needed
- Allows for more detailed prompting and context setting
- Works across any editor I choose to use

While not as seamlessly integrated as built-in solutions, there's something to be said for the flexibility of this approach. I can use the editor that best fits my needs while still accessing powerful AI assistance.

## Git Workflows: Enter GitButler

Another component I've added to my development stack is [GitButler](https://gitbutler.com/), which I use in conjunction with Zed. Rather than relying solely on the built-in git tooling, GitButler provides a more visual and intuitive approach to branch management and code changes.

The combination of Zed for editing and GitButler for version control gives me the best of both worlds:
- Clean, focused editing experience
- Powerful visual git workflow
- Freedom from being locked into a single tool's approach to git

## Conclusion: Current State and Future Outlook

For now, I'm continuing with Zed as my primary editor, supplemented by Claude Desktop for AI assistance and GitButler for git management. This combination feels flexible enough to evolve as tools improve while providing a productive environment today.

That said, I'm not going to lie—sometimes using GitButler feels a little cumbersome because I have to change windows just to commit. Even with the many advantages of having a separate dedicated git interface, it sometimes feels like my workflow is more complicated than it needs to be. This is the trade-off of using specialized tools instead of an all-in-one solution.

What I've learned from this journey:
1. The right editor is highly personal and depends on your specific workflow
2. AI assistance can be transformative, but implementation matters greatly
3. Extension ecosystem health is crucial for long-term viability
4. Sometimes the best solution is a combination of specialized tools rather than a single do-everything editor—but this comes with its own friction points

I suspect this journey isn't over, as the landscape of development tools continues to evolve rapidly, especially with AI integration becoming increasingly sophisticated. But for now, I've found a setup that works well for my needs while remaining open to new possibilities.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.

{{< contact_form >}}
