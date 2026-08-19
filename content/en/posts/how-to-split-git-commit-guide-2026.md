---
date: 2026-08-18T15:06:55-03:00
draft: true
title: "How to Split a Git Commit: Step-by-Step Guide [2026]"
description: "Step-by-step guide to split a git commit into multiple commits with plain git: git reset --soft, git add -p, and interactive rebase. Works on any git version."
featured_image: ""
categories:
  - article
tags:
  - git
  - version-control
  - developer-tools
  - workflows
  - command-line
---

You committed too much at once: two unrelated changes, a refactor mixed with a bug fix, or a feature that should have been two commits. The good news is that splitting a git commit is a solved problem — and you don't need any experimental command or third-party tool to do it. Everything in this guide works with plain git, on any version, on any platform.

This guide covers the two cases you will actually face: splitting the most recent commit (the quick path) and splitting an older commit buried in history (the interactive rebase path). Both produce atomic commits — the kind that make `git log`, code review, and `git bisect` much more useful.

## Why split a commit at all

A commit should be a single logical change. When you mix an unrelated rename with a security fix in one commit, you create three concrete problems:

- **Review is harder.** Your reviewer cannot tell which part of the diff belongs to which concern.
- **`git bisect` lies to you.** When a regression is found, bisect points at a commit that contains dozens of unrelated changes, and isolating the bad line becomes archaeology.
- **Reverting is all-or-nothing.** If the refactor is bad but the bug fix is good, you cannot revert just the refactor.

Splitting is the fix. If you want the full picture of rewriting history safely — including the newer `fixup` and `reword` workflows — see our [complete guide to git history commands]({{< relref "posts/mastering-git-log-history-guide-2026/" >}}).

## Case 1: Split the most recent commit

This is the simplest case and covers most real-world needs. The idea: undo the commit but keep your changes staged, then commit them again in smaller pieces.

### Step 1 — Uncommit, keeping changes

```bash
git reset --soft HEAD~1
```

`--soft` moves `HEAD` back one commit but leaves your index and working tree exactly as they were. Nothing is lost — the changes from the last commit are now staged, as if you had never committed.

### Step 2 — Unstage everything

```bash
git reset
```

This unstages all files (mixed reset to HEAD). Now you are looking at your changes as a clean working tree, exactly like before the original commit.

### Step 3 — Stage and commit the first part

```bash
git add -p
```

`git add -p` walks you through every hunk of your changes and asks, hunk by hunk, whether to stage it. Type `y` to stage a hunk, `n` to skip it, `s` to split a hunk further, and `e` to edit it manually. This is where you separate the two logical changes.

```bash
git commit -m "fix: correct the login redirect"
```

### Step 4 — Commit the rest

```bash
git add -A
git commit -m "refactor: extract auth helper"
```

That's it. One commit became two, each with a focused message. Verify with `git log --oneline -3`.

## Case 2: Split an older commit

When the commit to split is not `HEAD`, you need an interactive rebase to temporarily rewind history to that point.

### Step 1 — Start an interactive rebase

```bash
git rebase -i HEAD~N
```

where `N` is the number of commits back your target sits (for example, `HEAD~5` if the commit is five commits ago). Your editor opens a list of commits:

```
pick abc1234 Mixed changes nobody asked for
pick def5678 Add feature X
pick 9ab0123 Fix tests
```

### Step 2 — Mark the commit as `edit`

Change `pick` to `edit` on the line of the commit you want to split, save, and close the editor. Git stops right after replaying that commit, leaving its changes staged.

### Step 3 — Apply the same split routine

Now you are in the same situation as Case 1:

```bash
git reset            # unstage everything
git add -p           # stage hunk by hunk
git commit -m "fix: correct the login redirect"
git add -A
git commit -m "refactor: extract auth helper"
```

### Step 4 — Continue the rebase

```bash
git rebase --continue
```

Git replays the remaining commits on top of your two new ones. If later commits touch the same lines you moved, you may get merge conflicts — resolve them with the usual `git add` + `git rebase --continue` cycle.

## A full worked example

Suppose your history looks like this:

```
$ git log --oneline -3
7f3a9d1 add search + fix CSS bug
b2c4e77 add search endpoint
a1b2c3d update README
```

`7f3a9d1` mixes a feature (search) with an unrelated CSS fix. To split it:

```bash
git reset --soft HEAD~1
git reset
git add -p              # stage only the search feature hunks
git commit -m "feat: add search"
git add -A
git commit -m "fix: CSS bug in results page"
```

Result:

```
$ git log --oneline -4
f0e1d2c fix CSS bug in results page
e8a7b6c feat: add search
b2c4e77 add search endpoint
a1b2c3d update README
```

Two clean, atomic commits instead of one grab-bag.

## What about the new `git history split` command?

If you are on git 2.54+ (April 2026), there is now an experimental built-in that automates this exact workflow: `git history split <ref>` asks you hunk by hunk what goes into the first commit and writes both commit messages for you. It is convenient, but it is experimental and version-gated — the plain-git workflow above works everywhere, which is why it remains the approach documented in the canonical [Stack Overflow thread on breaking a commit into multiple commits](https://stackoverflow.com/questions/6217156/break-a-previous-commit-into-multiple-commits) (the highest-voted answer there is still the cumbersome variant; the [modern short answer](https://stackoverflow.com/a/79929889) is the `reset --soft` + `add -p` routine shown here). The official [git book chapter on rewriting history](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) covers the same ground.

## Common pitfalls

- **Never rewrite commits you already pushed to a shared branch.** Splitting rewrites history; anyone who pulled the old commit will hit diverged histories. If the branch is shared, coordinate with the team and expect a force-push (`git push --force-with-lease`) — or keep the split local and do it before pushing in the first place.
- **`git reset --soft` vs `git reset`:** the first keeps changes staged, the second unstages them. Missing the second step leaves you unable to pick hunks selectively.
- **Hunks that cannot be split automatically.** `git add -p` will not always split a hunk; press `e` to edit it manually. Adjacent-line changes often need this.
- **Conflicts during `git rebase --continue`:** expected if later commits touch the same code. Resolve, `git add`, continue — the two new commits stay intact.
- **Don't use `git commit --amend` by accident** while in the middle of a split — it will merge your first partial commit with the previous one. Commit normally, not with `--amend`.

## When splitting fits your workflow

Splitting is the cleanup step that makes everything downstream easier: [stacked pull requests]({{< relref "posts/stacked-pull-requests-guide-2026/" >}}) work best when each commit in the stack is atomic, and tools like [GitButler]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}}) exist largely to avoid the "one big commit" problem at the source. Even so, knowing the plain-git routine is the baseline skill — it works on a fresh checkout, in CI containers, and on servers where no fancy tooling is installed.

The rule to take away: commit small, commit often, and when you slip, split.

Read also:

- [Git History in 2026: Complete Guide to fixup, reword, and split Commands]({{< relref "posts/mastering-git-log-history-guide-2026/" >}})
- [Stacked Pull Requests: Complete Guide and Best Practices [2026]]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})
- [GitButler: What It Is, Review and Alternatives [2026]]({{< relref "posts/gitbutler-what-is-review-alternatives-2026/" >}})

---

You can reach out to contact me about this and other topics by filling the form below.

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.
