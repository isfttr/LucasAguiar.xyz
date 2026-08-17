---
date: 2026-08-17T11:16:25-03:00
draft: true
title: "GitButler: What It Is, Review & Alternatives [2026]"
description: "GitButler is a Git client with virtual branches, CLI and TUI. Honest review after months of use, pricing model and the best alternatives in 2026."
featured_image: ""
categories:
  - article
tags:
  - git
  - gitbutler
  - developer-tools
  - version-control
  - productivity
---

You are mid-task on a feature, your team lead asks you to hotfix a production bug, and your working tree is a graveyard of half-finished changes. Classic Git. You stash, switch, stash again, and pray you remember which stash was which. This is exactly the problem GitButler set out to kill — and after using it on and off since 2025, I think it mostly succeeds.

## What is GitButler?

GitButler is a modern Git client (desktop app, `but` CLI and a terminal TUI) built on top of standard Git, from [Scott Chacon](https://github.com/schacon) — one of the co-founders of GitHub. It doesn't fork Git or invent a new storage format: your repository stays a normal Git repo, and every feature branch you create with it is a real branch. The project has grown fast: **21.5K stars on GitHub** and the current stable release is **0.22.0 "Catch 22"** (July 2026), after a year that included a **$17M Series A led by a16z** ([announcement](https://blog.gitbutler.com/series-a/)).

The core idea is **virtual branches**: instead of one active branch and a pile of stashes, you keep several branches "open" at the same time in the same working directory. Changes are assigned to a virtual branch — manually, or automatically by rules (for example, branch-per-file). Each virtual branch can be committed and pushed independently to its own target branch. No `git checkout` dance. When you want to pause work on one branch, you "unapply" it: the changes disappear from your working tree but stay safely stored in Git as hidden commits. Conflicts are first-class citizens — rebases always succeed, and conflicted commits stay stored until you resolve them, in any order.

## Review: what I actually use

My [first two weeks with GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) were about the desktop app and virtual branches. The honest verdict from months of daily use:

**What works well**
- **Virtual branches** genuinely remove context-switching overhead. I keep a feature branch, a chore branch and an experiment open at once, and commits land in the right place without me thinking about it.
- **The operations log**. Every operation is logged, and `but undo` / `but redo` / `but oplog` give you an undo/redo safety net that plain git doesn't have. Accidentally committed to the wrong branch? Undo. The single most underrated feature.
- **Commit editing without `rebase -i` fear**: squash, reword, split, amend, move commits around by drag-and-drop or CLI. If you're new to [interactive rebase workflows]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}), this is a gentler entry point.
- **The `but` CLI and TUI** (0.19+ series): the same engine from the terminal, with `--json` output for scripting. `but land` merges to main directly; stacked branches are handled natively.
- **AI where it helps**: AI-generated commit messages, branch names and PR descriptions, and since 0.22, AI-assisted conflict resolution (`but resolve --ai`).

**Current limitations**
- It's a different mental model. If you live in `git checkout` + stash muscle memory, the first week feels slower, not faster.
- The desktop app and CLI are evolving fast (0.19 → 0.22 in six months), and the CLI changed some command names along the way. The [docs](https://docs.gitbutler.com/cli-overview) keep up, but it's not the stability you get from git itself.
- Forge integration is GitHub-first. GitLab and Bitbucket work, but GitHub is where the polish is (native stacked PRs landed in 0.22).

## Pricing model

The client — desktop app, `but` CLI and TUI — is **free**, distributed under the [Fair Source license](https://github.com/gitbutlerapp/gitbutler) (you can view, use and contribute; you just can't build a competing product on it; it becomes MIT after two years). The paid layer is GitButler Cloud (app.gitbutler.com), a subscription-based platform with an early-supporter program offering "locked-in pricing". There is no public price list on the site — pricing is managed inside the app. For solo devs and homelabbers, the free client is everything you need.

## Alternatives in 2026

| Tool | Best for | License / Price |
|---|---|---|
| [GitButler](https://gitbutler.com) | Virtual branches, undo, AI-assisted git | Free client + paid Cloud |
| [Jujutsu (jj)](https://jj-vcs.github.io/jj/) | Change-based VCS, powerful history editing, Git-compatible | Free, open source |
| [Git worktrees](https://git-scm.com/docs/git-worktree) | Multiple branches in parallel, zero new tools | Built into Git |
| [lazygit](https://github.com/jesseduffield/lazygit) | Fast terminal TUI for Git | Free, open source |
| [Fork](https://git-fork.com) | Polished desktop GUI for macOS/Windows | Free (donation-supported) |
| [Sublime Merge](https://www.sublimemerge.com) | Performance-focused desktop client, great diff engine | Paid |
| [Tower](https://www.git-tower.com) | Beginner-friendly desktop client with great learning content | Paid (trial) |
| [GitKraken](https://www.gitkraken.com) | Desktop GUI with commit graph, LFS and team tools | Freemium + paid |
| [Graphite](https://graphite.dev) | Stacked-PR workflow for trunk-based dev at scale | Free tier + paid |

If you want to stay 100% terminal and open source, **lazygit** or **Jujutsu** are the strongest picks. If you want the GUI-plus-CLI power combo without learning a new VCS mental model, GitButler is the most innovative option right now. And if you never switch branches more than twice a day, plain [git worktrees]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) might be all you need.

## Verdict

GitButler is not "git, but a GUI" — it's a real rethink of how branches should feel, and the CLI/TUI/agent push of 2026 makes it relevant even for hardcore terminal users. It's free, it keeps your repo standard, and the undo log alone is worth the download. Try virtual branches for two weeks; if you still miss `git stash`, the alternatives table above has you covered.

Read also:

- [Two Weeks with GitButler: Streamlining My Git Workflow]({{< relref "posts/one-week-review-gitbutler/" >}})
- [Git History in 2026: Complete Guide to fixup, reword, and split Commands]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Stacked Pull Requests: Complete Guide and Best Practices [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
