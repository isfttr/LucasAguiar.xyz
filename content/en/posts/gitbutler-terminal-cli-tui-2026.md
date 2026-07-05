---
date: 2026-07-05T13:00:00.000Z
draft: true
title: GitButler in the Terminal
description: Exploring GitButler's new CLI and TUI — how 'but' is transforming Git workflow directly from the terminal, without leaving the editor. Comparison with the Desktop and command tips.
featured_image: ''
categories:
  - article
tags:
  - git
  - gitbutler
  - cli
  - terminal
  - developer-tools
  - productivity
  - versao-controle
translation_source_hash: bb0c9d84668c2092361176dff382f8cb19b95549c006f813458ca2d31d7cd8e2
---
It's 11 PM on a Friday night, you open the terminal, type `mkdir`, `git init`, and dive into the code. Two hours later, the editor is full of tabs, you have half a dozen modified files, and that voice in your head says: "this deserves some organized commits."

If you use GitButler, this whole process involves multiple `Cmd+Tab` switches to GitButler Desktop. Create a virtual branch. Go back to the editor. Write more code. `Cmd+Tab` back. Move files between branches. Commit. Generate an AI message. `Cmd+Tab` to the editor. And again. And again.

[GitButler Desktop](https://docs.gitbutler.com/overview) won me over in April 2025 — I wrote [my experience](/pt/posts/one-week-review-gitbutler/) two weeks after starting to use it, and ever since it completely replaced my command-line Git. Virtual branches, the operations timeline, visual conflict resolution... all of it made sense in a dedicated window.

But time passed. And GitButler grew.

## The discovery in the terminal

One night, while browsing the documentation site, I came across a section that wasn't there last time: "[GitButler CLI](https://docs.gitbutler.com/cli-overview)". The description said something that made me stop: *"all of the same powerful things that the GUI does, but from the terminal or via scripts or agents."*

Everything the Desktop does? In the terminal?

I typed `but tui` in a side project repository, somewhat skeptical. And the terminal turned into an interactive Git workspace. Quite similar to LazyGit, for those who've used it — only with a simpler UI.

![GitButler TUI](https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-gitbutler.png)

The interface isn't just an improved `git log`. It was full GitButler: applied branches, uncommitted changes, commits, diff, all in a split display, navigable by keyboard. `j`/`k` to navigate, `d` to open commit details, `c` to commit, `?` to see all available shortcuts.

[GitButler's TUI](https://docs.gitbutler.com/gitbutler-tui) is what `git` should be in 2026: a visual workspace without leaving the terminal.

## How it works in practice

Let me illustrate with a concrete scenario. Imagine you're building a small project — say, a bookmark API. You code for a few hours, creating models, controllers, and routes. Before any Git command, `but status` shows something like this:

```
╭┄zz [unstaged changes]
┊   g0 M Gemfile
┊   h0 A app/controllers/bookmarks_controller.rb
┊   i0 A app/models/bookmark.rb
┊   j0 M app/models/user.rb
┊   k0 A app/views/bookmarks/index.html.erb
┊   l0 M config/routes.rb
│
┴ 204e309 (common base) [origin/main]
```

Notice: you haven't created a branch yet. No `git checkout -b`. The files are there, "unassigned" — exactly like in the Desktop. The difference is you didn't leave the terminal to see this.

The next natural step:

```bash
$ but branch new user-bookmarks
✓ Created branch user-bookmarks
```

```bash
$ but commit -m 'feat: add bookmarks table, controller, and views'
✓ Created commit d4147cc on branch user-bookmarks
```

Done. Branch created, commit made, message written. All without a single window switch. The [complete branching and committing tutorial](https://docs.gitbutler.com/cli-guides/cli-tutorial/branching-and-commiting) has more examples, including how to create branches from uncommitted changes and how to commit to specific branches.

## Desktop vs CLI

[My previous post about GitButler](/pt/posts/one-week-review-gitbutler/) was basically a testament to the Desktop. And it's still a fantastic tool for certain moments. But after a few weeks using the CLI, I developed a personal heuristic:

**Desktop** is for when you want to *explore* — open a repository you haven't seen in weeks, understand the branch tree, resolve conflicts visually by dragging hunks between branches, or inspect history with the timeline.

**CLI/TUI** is for when you're in *flow* — coding uninterrupted, making granular commits, switching between branches in seconds, without taking your hands off the keyboard.

In my opinion, the CLI complements the Desktop app. And the integration between the two is seamless since version [0.20.1](https://github.com/gitbutlerapp/gitbutler/releases): changes made with `but` automatically appear in the Desktop without manual refresh, and vice versa.

### Commands that became my new standard

Some commands I use all the time:

- `but diff` — full diff with workspace context, better than `git diff` because it understands virtual branches
- `but diff --tui` — interactive diff viewer, with file list on the left and diff on the right
- `but stage` — interactive hunk staging, essential when you want to separate unrelated changes in the same file across different branches
- `but rub` — the most GitButler command of all: "rubbing" is the act of moving changes between branches or commits, something you do by dragging in the Desktop and in the terminal is `but rub feature-a` to toss the current branch's changes to another
- `but branch list` — lists all applied virtual branches
- `but oplog` — the operations log, which saves every action you take in the CLI so you can undo/redo
- `but undo` / `but redo` — undo/redo any operation

One of the most surprising things is `but show` with `--json`. You can see the readable output:

```
Commit:    26724656b8856871542da1e69c888b2e7330294a
Change-ID: pzyoupplvookqoqpussrpnnlrwqsnzkr
Author:    Scott Chacon
Date:      2026-02-04 07:22:53 +0100 (3d ago)

hero update - new branding

Files changed:
  M app/models/user.rb
  M app/views/home/index.html.erb
  A test.md
```

Or, with `but show --json 2672465 | jq`:

```json
{
  "commit": "26724656b8856871542da1e69c888b2e7330294a",
  "author": { "name": "Scott Chacon" },
  "message": "hero update - new branding\n",
  "files": [
    { "path": "app/models/user.rb", "status": "modified" },
    { "path": "app/views/home/index.html.erb", "status": "modified" },
    { "path": "test.md", "status": "added" }
  ]
}
```

As the [scripting documentation](https://docs.gitbutler.com/cli-guides/cli-tutorial/scripting) says: *"you can do this with any command — commit, status, diff. Just throw a `--json` and you get parseable data."*

## The case of AI agents

Here's where things get really interesting. GitButler's CLI wasn't made just for humans. Since [version 0.20.0](https://github.com/gitbutlerapp/gitbutler/releases/tag/release/0.20.0) (June 2026), the team's main focus has shifted to use by **AI agents**.

The `but agent setup` command is an interactive wizard that configures GitButler to work with coding agents like Claude Code or Codex. It installs a GitButler skill in the repository and sets up automatic version control workflows. The [AI Agents documentation](https://docs.gitbutler.com/ai-agents/overview) details how multiple agents can work in parallel, each using `but` to branch, commit, and PR without stepping on each other's toes.

For those following the world of code agents, this is a huge step forward. Previously, any agent that needed to commit or create a branch had to either (a) use raw Git on the command line — and deal with merge hell — or (b) have its own proprietary flow. With GitButler CLI, the agent simply runs `but branch new` and `but commit -m`, and everything is orchestrated by the virtual branch workspace.

`but commit --ai` also deserves a highlight: instead of spending your model's tokens generating commit messages, GitButler analyzes the changes and generates a contextualized message locally. The [AI guide](https://docs.gitbutler.com/cli-guides/cli-tutorial/ai-stuff) explains how to set everything up.

## What's been left behind

When I wrote the Desktop review in 2025, I mentioned some limitations: issues with local Ollama, branch naming conventions, and a small learning curve with the virtual branch concept.

With the CLI, these points evolved in interesting ways:

- The keyboard interface (`j`/`k` to navigate, `?` for help) is natural for those who already use Vim or less in the terminal
- `but tui` has a command mode (`:`) that lets you run `but` commands without leaving the TUI — so you never need to remember "which key does what", you can just type `:commit -m "message"`
- The learning curve became "just another CLI" — if you know how to use `git`, `but` is familiar, only more powerful

## Is it worth migrating?

If you already use GitButler Desktop, the answer is: **try it**. Install the CLI (it comes with the Desktop, just make sure `but` is in your PATH), go into a repository you know well, and spend an afternoon using only `but status`, `but diff`, `but commit`, and `but tui`.

You'll miss some things from the Desktop — the drag-and-drop conflict resolution is irreplaceable, and the timeline with visual undo is easier to navigate with a mouse. But for 80% of daily work — committing, creating branches, diffing, inspecting history — the terminal is faster.

My flow today is hybrid: I code in the editor, commit and branch with the CLI, and open the Desktop for conflict resolution, visual PR review, and when I want to see the "big picture" of the repository with multiple stacked branches.

For those who **don't** use GitButler yet, the CLI is a lower entry point. No need to install another GUI. No need to learn a new interface. Just `brew install gitbutler` or download from the [official site](https://gitbutler.com), run `but setup` in your repository, and get started.

---

GitButler Desktop won me over in 2025. The CLI kept me in 2026. It's rare to see a tool that excels both as a GUI and as a terminal — and Scott Chacon's team is pulling it off.

If you try it, I suggest starting with the [CLI overview](https://docs.gitbutler.com/cli-overview), then check the [TUI guide](https://docs.gitbutler.com/gitbutler-tui), and let `but` become part of your terminal vocabulary. Who knows, you might also abandon plain `git` for good.

Read also:

- [Two Weeks with GitButler: Simplifying My Git Workflow]({{< relref "posts/one-week-review-gitbutler/" >}})
- [Cursor vs Windsurf vs Zed 2026: Which AI Code Editor is Best?]({{< relref "posts/experience-with-cursor-and-windsurf/" >}})
- [From Procrastination to Progress: How AI Has Helped Me]({{< relref "posts/ai-beats-procrastination/" >}})

---

Feel free to reach out to discuss this and other topics via email at <contact@lucasaguiar.xyz>
