---
date: 2025-04-10T16:36:59.000Z
draft: false
title: 'GitButler 2026: Review, Pricing and Alternatives [Tested]'
description: 'GitButler review 2026: how virtual branches work, free client vs paid Cloud, the but CLI and TUI, and GitButler vs jujutsu, worktrees, lazygit and Graphite.'
url: ''
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png
categories:
  - article
tags:
  - git
  - workflow
  - gitbutler
  - developer-tools
  - productivity
  - version-control
aliases:
  - /posts/two-weeks-gitbutler-streamlining-git-workflow/
  - /posts/gitbutler-review-alternatives/
  - /posts/gitbutler-what-is-review-alternatives-2026/
  - /posts/gitbutler-terminal-cli-tui-2026/

---

You're in the middle of a feature, your team lead asks for an urgent production hotfix, and your working tree is a graveyard of half-finished changes. Classic Git: you stash, switch branches, stash again, and pray to remember which stash was which. That is the problem [GitButler](https://gitbutler.com) was built to kill — and after using it since 2025, I can say it solves it most of the time.

This review covers what GitButler is in 2026, how virtual branches actually behave in daily use, what the free client includes, and how it compares with jujutsu, git worktrees, lazygit and the other Git clients worth considering.

## What is GitButler?

GitButler is a modern Git client (desktop app, `but` CLI and a terminal TUI) built on top of standard Git, created by [Scott Chacon](https://github.com/schacon) — one of GitHub's co-founders. It does not fork Git or invent a new storage format: your repository remains a normal Git repo, and every branch you create with it is a real branch. The project grew fast: **21.5k stars on GitHub**, with the stable version **0.22.0 "Catch 22"** (July/2026), after a year that included a **US$ 17 million Series A led by a16z** ([announcement](https://blog.gitbutler.com/series-a/)).

The core idea is **virtual branches**: instead of one active branch and a pile of stashes, you keep several "open" branches at once in the same working directory. Changes are assigned to a virtual branch — manually or by automatic rules (for example, one branch per file). Each virtual branch can be committed and pushed independently to its target branch. No more `git checkout` back-and-forth. When you want to pause work on a branch, just "unapply": the changes disappear from the working tree but remain safely stored in Git as hidden commits. Conflicts are treated as first-class citizens — rebases always work, and conflicting commits stay stored until you resolve them, in any order.

Some of these ideas clearly come from alternative version control systems like [Jujutsu](https://jj-vcs.github.io/jj/), built by Google engineers. In Jujutsu, everything between one point and the next is committed automatically — a concept GitButler brought into a Git-compatible tool with a GUI, which is exactly why it is easier to adopt.

## What using GitButler looks like

Once you install GitButler, you set up your first local repository. You have a couple of options:

1. Create a new repository from scratch.
2. Clone an existing repository from a remote location.

GitButler also offers a GitHub integration, mainly for creating pull requests, plus AI features for commit messages and PR descriptions. Those features have been particularly useful for me.

![Screenshot of GitButler Repository Setup](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-repo-setup.png)

Once you choose your repository, you get a clean workspace: the left sidebar lists your virtual branches (create, delete, switch), the right sidebar shows repository status and uncommitted changes, and you can move changed files between branches. Every change lands on the default lane, and if you have more than one lane applied you can set which lanes receive new changes automatically. That took me a while to internalize, but it became second nature.

![Screenshot of GitButler Workspace](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-workspace.png)

Commit messages can be AI-generated after you select the files or hunks you want to commit: GitButler reads the diff and suggests a message, which is genuinely useful when you come back to a change hours later. I usually accept it and append the context I will need in the future.

![Screenshot of GitButler Commit message](https://lucasaguiarxyzstorage.blob.core.windows.net/images/screenshot-gitbutler-commit.png)

## What changed since the first review

I first wrote about GitButler after two weeks of daily use (2025). A year later, the parts that changed are the ones that matter for anyone evaluating it in 2026:

- **The `but` CLI and TUI** (0.19+ series) bring the same engine to the terminal, with `--json` output for scripting. `but land` merges straight into main, and stacked branches are natively handled — a big deal if you work with [stacked pull requests]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}).
- **The operations log is the killer feature.** Every operation is recorded, and `but undo` / `but redo` / `but oplog` give you an undo/redo safety net plain Git does not have. Committed to the wrong branch by accident? Undo it.
- **History editing without `rebase -i` terror:** squash, reword, split, amend and move commits by drag-and-drop or CLI. If you are new to [interactive history workflows]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}), this is a gentler entry point.
- **AI where it helps:** commit messages, branch names, PR descriptions and, since 0.22, AI-assisted conflict resolution (`but resolve --ai`). When I first reviewed it, the local Ollama integration was broken and AI features depended on the cloud — the 2026 versions are noticeably more reliable.
- **Native stacked PRs** (0.22) on GitHub.

## What works and what does not

After months of use, the honest list:

**What works well**

- **Virtual branches** genuinely eliminate the cost of context switching. I keep a feature branch, a chores branch and an experiment branch open at the same time, and commits land in the right place without me thinking about it.
- **The undo/redo history** removed my fear of irreversible mistakes. It is the tool's most underrated feature.
- **Granular commits**: selecting specific hunks visually beats `git add -p` for people who think in files and screenshots.
- **It is still standard Git.** If GitButler disappears tomorrow, `git log` and `git push` keep working exactly as before. No lock-in.

**Current limitations**

- **It is a different mental model.** If you live in `git checkout` + stash by reflex, the first week feels slower, not faster.
- **It moves quickly** (0.19 → 0.22 in six months) and the CLI changed command names along the way. The [documentation](https://docs.gitbutler.com/cli-overview) keeps up, but it is not Git-level stability.
- **Forge integration is GitHub-first.** GitLab and Bitbucket work, but GitHub is where the polish is.
- **Free client only** is what most solo developers need, but the Cloud tier is where team features live.

## Pricing in 2026

The client — desktop app, `but` CLI and TUI — is **free**, distributed under the [Fair Source license](https://github.com/gitbutlerapp/gitbutler): you can view, use and contribute, you just cannot build a competing product on top of it, and it becomes MIT after two years. The paid tier is **GitButler Cloud** (app.gitbutler.com), a subscription platform with an early-supporter "locked price" program; there is no public pricing table on the site, and payment is managed inside the app. For solo developers and homelabbers, the free client is all you need.

## GitButler alternatives in 2026

| Tool | Best for | License / Price |
|---|---|---|
| [GitButler](https://gitbutler.com) | Virtual branches, undo, AI-powered Git | Free client + paid Cloud |
| [Jujutsu (jj)](https://jj-vcs.github.io/jj/) | Change-based VCS, powerful history editing, Git-compatible | Free, open source |
| [Git worktrees](https://git-scm.com/docs/git-worktree) | Multiple branches in parallel, zero new tools | Included in Git |
| [lazygit](https://github.com/jesseduffield/lazygit) | Fast terminal TUI for Git | Free, open source |
| [Fork](https://git-fork.com) | Polished desktop GUI for macOS/Windows | Free (donation) |
| [Sublime Merge](https://www.sublimemerge.com) | Desktop client focused on performance, great diff | Paid |
| [Tower](https://www.git-tower.com) | Desktop client for beginners with great learning content | Paid (trial) |
| [GitKraken](https://www.gitkraken.com) | Desktop GUI with commit graph, LFS and team tools | Freemium + paid |
| [Graphite](https://graphite.dev) | Stacked PR workflow for trunk-based dev at scale | Free + paid |

If you want to stay 100% terminal and open source, **lazygit** or **Jujutsu** are the strongest choices. If you want the GUI + CLI combo without learning a new VCS mental model, GitButler is the most innovative option right now. And if you never switch branches more than twice a day, [git worktrees]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) might be all you need.

## Verdict

GitButler is not "Git with a GUI" — it is a real rethink of how branches should work, and the 2026 bet on CLI, TUI and agents makes it relevant even for hardcore terminal users. It is free, keeps your repository standard, and the operations log alone justifies the download. Try virtual branches for two weeks; if you still miss `git stash`, the alternatives table above has you covered.

## References

- [Jujutsu - A Git-compatible VCS](https://www.youtube.com/watch?v=LV0JzI8IcCY) - Martin von Zweigbergk's presentation at GitMerge 2024 explaining the design principles and features of Jujutsu.
- [GitButler Product Demo](https://www.youtube.com/watch?v=agfyTN3HpRM) - An overview and demonstration of GitButler's core features and workflow improvements.
- [Scott Chacon on Git internals](https://www.youtube.com/watch?v=Md44rcw13k4&t=1032s) - the talk that convinced me GitButler understood the problem.

Read also:

- [Git History in 2026: Complete Guide to fixup, reword, and split Commands]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Stacked Pull Requests: Complete Guide and Best Practices [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})
- [How to Split a Git Commit: Step-by-Step Guide [2026]]({{< relref "posts/how-to-split-git-commit-guide-2026/" >}})

---

You can reach out to contact me about this and other topics at my email **<contact@lucasaguiar.xyz>** or by filling the form below.
