---
date: 2026-07-14T15:05:22-03:00
draft: true
title: "Git History in 2026: Complete Guide to fixup, reword, and split Commands"
description: "Step-by-step guide to git history — the experimental command that lets you fix old commits, rewrite messages, and split changes without scary rebase -i sessions. Includes practical examples of each subcommand."
featured_image: ""
categories:
  - article
tags:
  - git
  - developer-tools
  - workflow
  - version-control
  - productivity
---

You're three commits deep on a feature branch when you spot it: a typo in a
commit message from two commits ago, and a bug in the code from three commits
back. Normally this means `git rebase -i`, an interactive session, manual fixup
of conflicts, and picking up the pieces of your working tree afterward. If
you've ever had a rebase go sideways and leave your repository in a
half-rewritten state, you know the dread.

Since git 2.54 (April 2026), there's a better way. `git history` is an
experimental command that bundles three operations — `fixup`, `reword`, and
`split` — into atomic, conflict-free operations that rewrite history safely
without ever leaving your tree broken. It works across all your branches,
automatically rebasing everything on top of the changes.

This guide covers each subcommand with real examples and explains when to reach
for `git history` instead of `rebase -i`.

## What Is git history?

`git history` is an experimental command added to core git across two releases:

- **git 2.54** (April 2026): introduced `reword` and `split`
- **git 2.55** (June 2026): introduced `fixup`

All three subcommands share the same core design: they rewrite history
atomically. If an operation would produce a conflict, git refuses to execute it
rather than leaving you in a partially-rebased state. This is fundamentally
different from `rebase -i`, which applies each step sequentially and stops on
the first conflict, often leaving the tree in an inconsistent state.

The command is bundled with git itself — no extra tools to install. You can try
it right now if you're on git 2.55+:

```bash
git history --help
```

## git history fixup: Fixing Old Commits

`git history fixup` is the most impactful of the three. It lets you stage a
correction, target an old commit, and have git fold the fix into that commit
while automatically rebasing every branch that contained it.

### Basic usage

```bash
# Make your fix, stage it
git add path/to/fix.diff

# Fold the staged changes into commit ABC123
git history fixup ABC123
```

Git re-creates commit `ABC123` with the fix applied, then rebuilds every commit
descended from it — on every local branch. All branch tips move along.

### What makes it different from --fixup + autosquash

The traditional approach is:

```bash
git commit --fixup ABC123
git rebase -i --autosquash ABC123~1
```

This works but has two problems:

1. **Scope:** `rebase --update-refs` only moves refs within the rebase range.
   `git history fixup` finds and updates **every** local branch descended from
   the target commit.

2. **Atomicity:** If the rebase hits a conflict, you're dropped into conflict
   resolution mid-operation. `git history fixup` simply refuses if a conflict
   would occur — no half-finished state.

### Example

You have a feature branch `feat/search` based on `main`, and a colleague has
`feat/export` based on the same point. Commit `B` on `main` has a bug. You
stage the fix and run `git history fixup B`. Git rewrites `B`, then
automatically rebuilds both `feat/search` and `feat/export` on top of the fixed
commit.

```bash
# Before: main → A → B(buggy) → C(feat/search tip)
#                          → D(feat/export tip)

git add src/fix.diff
git history fixup B

# After: main → A → B*(fixed) → C*(feat/search tip)
#                             → D*(feat/export tip)
```

No manual rebasing of dependent branches. No dropping context.

## git history reword: Editing Commit Messages

`git history reword` lets you change the commit message of any past commit
without disturbing your working tree.

```bash
git history reword ABC123
```

This opens your editor with the existing commit message. Edit it, save, and git
rewrites the commit with the new message, rebuilding everything on top. Unlike
`fixup`, `reword` never touches your index or working tree — it works purely on
the commit graph.

This is useful when:

- A commit message has a typo you noticed three commits later
- The scope of a change shifted during development and the original message no
  longer reflects what the commit actually does
- You want to add a reference to an issue tracker in an old commit message

```bash
# Rewrite the message of the commit before HEAD
git history reword HEAD~1
```

Because it doesn't touch the working tree, you can reword a commit on a branch
you don't even have checked out.

## git history split: Splitting One Commit Into Two

`git history split` extracts a single commit into two logical commits. It drops
you into an interactive hunk-by-hunk prompt over the target commit's diff. The
hunks you select become the first commit; the remainder becomes the second.

```bash
git history split ABC123
```

This is invaluable when you realize a commit bundled two unrelated changes. For
example, a commit that both refactors a function and adds a new feature:

```bash
# Before: A → B(refactor + new feature) → C
git history split B
# Select: keep the refactor hunks first, skip the feature hunks
# After: A → B1(refactor) → B2(new feature) → C*
```

The split preserves the rest of the history: commit `C` is rebuilt on top of
`B2`, and all branches follow.

## How git history Compares to jj

`jj` (Jujutsu) gets a lot of attention as an alternative to git, especially for
its approach to working with history. The core differences:

| Capability | git history | jj |
|-----------|-------------|-----|
| Fix old commit | `fixup` | `edit` + auto-rebase |
| Reword message | `reword` | `describe` |
| Split commit | `split` | `split` |
| Auto-rebase dependent branches | Yes (all local) | Yes (all) |
| Conflict handling | Refuses (atomic) | First-class conflicts |
| Operation log / undo | No | Yes |
| Working copy as commit | No | Yes |
| Install separately | No (bundled) | Yes |

`git history` doesn't aim to replace `jj`. It brings the most common history
operations — fix, reword, split — into standard git without asking you to
change your entire workflow.

## Limitations

As of git 2.55, `git history` has important limitations:

- **No merge commits:** it refuses to operate on or across merge commits
- **No conflict resolution:** operations abort if a conflict would occur,
  rather than carrying conflicts forward like `jj` does
- **Local branches only:** it works on local branches, not remote-tracking
  branches

The documentation explicitly leaves room for future improvement:

> "This limitation is by design as history rewrites are not intended to be
> stateful operations. The limitation can be lifted once (if) Git learns about
> first-class conflicts."

## Getting Started

If you're on git 2.55 or later, `git history` is already available:

```bash
# Check your git version
git --version

# Enable experimental commands (may be needed)
git config --global set experimental.uiCommands true

# Try help
git history --help
```

For older versions, update git through your package manager:

```bash
# Ubuntu/Debian
sudo add-apt-repository ppa:git-core/ppa
sudo apt update && sudo apt install git

# macOS
brew upgrade git

# Arch
sudo pacman -S git
```

## Summary

`git history` fills a real gap in git's tooling. The three operations — fixup,
reword, split — cover the most common history-rewriting scenarios that
previously required `rebase -i` sessions, manual branch management, and a
moment of prayer before each command. It's atomic, branch-aware, and already
bundled with git.

If you're still using `rebase -i` for every fixup, try `git history fixup`
once. The difference in confidence alone is worth it.

— managing branches visually without leaving the CLI
- [Two Weeks with GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) — streamlining Git workflow with a GUI layer
- [GitLost: Prompt Injection in GitHub's AI Agent]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}) — security implications of AI-powered git workflows

Read also:

- [GitButler in the Terminal]({{< relref "posts/gitbutler-terminal-cli-tui-2026/" >}})
- [Two Weeks with GitButler: Streamlining My Git Workflow]({{< relref "posts/one-week-review-gitbutler/" >}})
- [GitLost [2026]: How Prompt Injection in GitHub's AI Agent Leaks Private Repos]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
