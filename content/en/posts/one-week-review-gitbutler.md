---
date: 2025-04-02T13:36:59-03:00
draft: false
title: "One Week with GitButler: Streamlining My Git Workflow"
description: "My experience using GitButler as a replacement for traditional Git workflow tools, including what works well and a few limitations."
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png
categories:
  - article
tags:
  - git
  - gitbutler
  - developer-tools
  - productivity
  - version-control
---

I've been using [GitButler](https://docs.gitbutler.com/) for about a week now, and it's already transformed how I interact with Git. As someone who regularly juggles multiple feature branches and context switches between tasks, I was looking for a tool that could simplify my Git workflow. GitButler caught my attention with its promise of virtual branches and simplified collaboration features.

My interest was further piqued after watching presentations by Scott Chacon, one of GitButler's creators and also a co-founder of GitHub. His deep knowledge of Git is evident in talks like [this one](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s), and it shows in how GitButler has managed to create an almost frictionless Git experience.

## What is GitButler?

For those unfamiliar, GitButler is a desktop application designed to modernize Git workflows. It introduces the concept of "virtual branches" that let you work on multiple features simultaneously without the overhead of Git's traditional branch management. It also provides a visual interface for common Git operations and aims to streamline collaboration through automated commit messages and PR generation.

Interestingly, some of GitButler's ideas appear to be influenced by alternative version control systems like Jujutsu, which was built by Google engineers. I recently watched a [Bits and Booze podcast episode about Jujutsu](https://www.youtube.com/watch?v=dwyMlLYIrPk) that showcased a different workflow from traditional Git. For example, in Jujutsu, you can start a new "commit" and everything done between that point and the next start is automatically committed—a concept that seems to have inspired some of GitButler's approach to managing changes. I highly recommend watching the episode if you're interested in the evolution of version control systems.

## My Experience So Far

After a week of consistent usage, GitButler has completely replaced my use of Git in the command line and within my code editor. The visual branch management has been particularly useful, allowing me to quickly switch between different tasks without the mental overhead of stashing or committing work-in-progress changes.

### What's Working Well

1. **Virtual Branches**: The ability to work on multiple features simultaneously without traditional branch switching has been a game-changer. I can easily context-switch between different tasks without worrying about stashing changes or creating messy commits.

2. **Visual Interface**: The UI is intuitive and makes Git operations more accessible. Being able to see exactly what files are changed in each virtual branch has helped me avoid accidentally including unrelated changes in commits.

3. **Seamless Integration**: Despite being a separate application, GitButler integrates well with my existing workflow. I haven't had to significantly change how I work to accommodate the tool.

4. **Commit Management**: Creating granular, meaningful commits is much easier with the visual interface allowing me to select specific changes to include.

### Current Limitations

Despite the overall positive experience, I've encountered a few limitations:

1. **Ollama Local Model Issues**: I've been eager to try the AI-powered commit message and pull request generation features using Ollama's local models. Unfortunately, this functionality doesn't seem to be working correctly at the moment. From what I understand, this is a known issue that hasn't been fixed yet.

2. **Branch Naming Conventions**: The default naming conventions for branches aren't my favorite. However, since virtual branches in GitButler are so ephemeral, it hasn't bothered me enough to actually change them. The ease of creating and managing branches outweighs the minor annoyance of their automatically generated names.

3. **Learning Curve**: While the interface is intuitive, there's still a slight learning curve when first adapting to the virtual branch concept, especially if you're deeply ingrained in traditional Git workflows.

## Looking Forward

I'm particularly interested in seeing how the Ollama integration develops once the issues are fixed. Having locally-generated, contextual commit messages and PR descriptions without sending code to external services would be a significant advantage.

It's worth noting that with Scott Chacon's extensive background in Git (as demonstrated in his [technical presentations](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s)), there's good reason to be optimistic about GitButler's future development. The app already shows a deep understanding of what makes Git powerful while addressing many of its pain points.

I'm also curious to see how GitButler continues to incorporate innovative ideas from alternative version control systems like Jujutsu. As the [podcast about Jujutsu](https://www.youtube.com/watch?v=dwyMlLYIrPk) revealed, there are some fascinating approaches to version control that differ significantly from Git's model, and GitButler seems to be bridging some of these concepts into a more accessible tool.

Even with the current limitations, GitButler has already proven valuable enough to become my primary Git interface. The productivity gains from simplified branch management alone justify the switch.

## Conclusion

After a week of usage, I can confidently say that GitButler has improved my Git workflow. The virtual branches concept elegantly solves many of the pain points associated with context-switching between tasks, and the visual interface makes complex Git operations more approachable.

While there are still some features that need refinement (particularly the Ollama integration for automatic commit messages and pull requests), the application has been stable and reliable for my day-to-day usage. I haven't encountered any negative experiences that would make me consider reverting to my previous workflow.

If you frequently work on multiple features in parallel or find yourself frustrated with traditional Git branch management, GitButler is definitely worth exploring. The team behind it seems responsive to feedback, and I'm optimistic about how the tool will continue to evolve.

## References

- [Jujutsu - A Git-compatible VCS](https://www.youtube.com/watch?v=LV0JzI8IcCY) - Martin von Zweigbergk's presentation at GitMerge 2024 explaining the design principles and features of Jujutsu.
- [GitButler Product Demo](https://www.youtube.com/watch?v=agfyTN3HpRM) - An overview and demonstration of GitButler's core features and workflow improvements.


---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.
