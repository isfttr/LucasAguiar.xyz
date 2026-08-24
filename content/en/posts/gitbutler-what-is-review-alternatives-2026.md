---
date: 2026-08-17T14:16:25.000Z
draft: false
title: 'GitButler: What It Is, Review and Alternatives [2026]'
description: GitButler is a Git client with virtual branches, CLI, and TUI. Honest review after months of use, pricing model, and the best alternatives in 2026.
featured_image: ''
categories:
  - article
tags:
  - git
  - gitbutler
  - ferramentas-de-desenvolvimento
  - controle-de-versao
  - produtividade
slug: gitbutler-review-alternatives
translation_source_hash: cbbca7376ba16db2c9d0459a0f066ae896eb51d6b42fd7f8413b60258c2466c8
---
You're in the middle of a feature, your team lead asks for an urgent production hotfix, and your working tree is a graveyard of half-finished changes. Classic Git: you stash, switch branches, stash again, and pray to remember which stash was which. That's exactly the problem GitButler was born to kill — and after using it, off and on, since 2025, I think it solves it most of the time.

## What is GitButler?

GitButler is a modern Git client (desktop app, `but` CLI, and a terminal TUI) built on top of standard Git, created by [Scott Chacon](https://github.com/schacon) — one of GitHub's co-founders. It doesn't fork Git or invent a new storage format: your repository remains a normal Git repo, and every branch you create with it is a real branch. The project grew fast: **21.5k stars on GitHub**, with the current stable version **0.22.0 "Catch 22"** (July/2026), after a year that included a **US$17 million Series A led by a16z** ([announcement](https://blog.gitbutler.com/series-a/)).

The core idea is **virtual branches**: instead of one active branch and a pile of stashes, you keep several "open" branches at once in the same working directory. Changes are assigned to a virtual branch — manually or by automatic rules (for example, one branch per file). Each virtual branch can be committed and pushed independently to its target branch. No more `git checkout` back-and-forth. When you want to pause work on a branch, just "unapply": the changes disappear from the working tree but remain safely stored in Git as hidden commits. Conflicts are treated as first-class citizens — rebases always work, and conflicting commits stay stored until you resolve them, in any order.

## Review: What I Actually Use

My [first fifteen days with GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) were about the desktop app and virtual branches. The honest verdict after months of use:

**What works well**
- **Virtual branches** genuinely eliminate the cost of context switching. I keep a feature branch, a chores branch, and an experiment branch open at the same time, and commits land in the right place without me thinking about it.
- **The operations log**. Every operation is logged, and `but undo` / `but redo` / `but oplog` provide an undo/redo safety net that plain Git doesn't have. Accidentally committed to the wrong branch? Undo. It's the tool's most underrated feature.
- **Commit editing without fear of `rebase -i`**: squash, reword, split, amend, and moving commits via drag-and-drop or CLI. If you're new to [interactive history workflows]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}), this is a gentler entry point.
- **The `but` CLI and TUI** (0.19+ series): the same engine straight from the terminal, with `--json` output for scripting. `but land` merges straight into main; stacked branches are natively handled.
- **AI where it helps**: AI-generated commit messages, branch names, and PR descriptions, and since 0.22, AI-assisted conflict resolution (`but resolve --ai`).

**Current limitations**
- It's a different mental model. If you live in `git checkout` + stash by reflex, the first week feels slower, not faster.
- The app and CLI evolve quickly (0.19 → 0.22 in six months), and the CLI changed command names along the way. The [documentation](https://docs.gitbutler.com/cli-overview) keeps up, but it's not Git-level stability.
- Forge integration is GitHub-first. GitLab and Bitbucket work, but GitHub is where the polish is (native stacked PRs arrived in 0.22).

## Pricing model

The client — desktop app, `but` CLI, and TUI — is **free**, distributed under the [Fair Source license](https://github.com/gitbutlerapp/gitbutler) (you can view, use, and contribute; you just can't build a competing product on top; it becomes MIT after two years). The paid tier is GitButler Cloud (app.gitbutler.com), a subscription platform with an early-supporter "locked price" program. There's no public pricing table on the site — payment is managed inside the app. For solo devs and homelabbers, the free client is all you need.

## Alternatives in 2026

| Tool | Best for | License / Price |
|---|---|---|
| [GitButler](https://gitbutler.com) | Virtual branches, undo, AI-powered Git | Free client + paid Cloud |
| [Jujutsu (jj)](https://jj-vcs.github.io/jj/) | Change-based VCS, powerful history editing, Git-compatible | Free, open source |
| [Git worktrees](https://git-scm.com/docs/git-worktree) | Multiple branches in parallel, zero new tools | Included in Git |
| [lazygit](https://github.com/jesseduffield/lazygit) | Fast terminal TUI for Git | Free, open source |
| [Fork](https://git-fork.com) | Polished desktop GUI for macOS/Windows | Free (donation) |
| [Sublime Merge](https://www.sublimemerge.com) | Desktop client focused on performance, great diff | Paid |
| [Tower](https://www.git-tower.com) | Desktop client for beginners with great learning content | Paid (trial) |
| [GitKraken](https://www.gitkraken.com) | Desktop GUI with commit graph, LFS, and team tools | Freemium + paid |
| [Graphite](https://graphite.dev) | Stacked PR workflow for trunk-based dev at scale | Free + paid |

If you want to stay 100% terminal and open source, **lazygit** or **Jujutsu** are the strongest choices. If you want the GUI + CLI combo without learning a new VCS mental model, GitButler is the most innovative option right now. And if you never switch branches more than twice a day, [git worktrees]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) might be all you need.

## Verdict

GitButler isn't "Git with a GUI" — it's a real rethink of how branches should work, and the 2026 bet on CLI/TUI/agents makes it relevant even for hardcore terminal users. It's free, keeps your repository standard, and the operations log alone justifies the download. Try virtual branches for two weeks; if you still miss `git stash`, the alternatives table above has you covered.

Read also:

- [GitButler Review 2026: Two Weeks Replacing My Git Workflow (Honest)]({{< relref "posts/one-week-review-gitbutler/" >}})
- [Git History in 2026: Complete Guide to fixup, reword, and split Commands]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Stacked Pull Requests: Complete Guide and Best Practices [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})

---

You can get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
