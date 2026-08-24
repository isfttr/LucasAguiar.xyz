---
date: 2026-07-30T15:04:08-03:00
draft: false
title: "Stacked Pull Requests: Complete Guide and Best Practices [2026]"
description: "Learn how stacked PRs work, why they speed up code review, and how to use them with GitHub's new native support. Comparisons, CLI tools, and real-world workflows."
featured_image: ""
categories:
  - article
tags:
  - git
  - github
  - dev
  - workflow
  - code-review
---

It is Wednesday at 3 PM. You just pushed a 1,200-line pull request that refactors an API endpoint, adds a database migration, and updates the frontend components that consume the new shape. You know what happens next: the review sits untouched for two days, comes back with "this is too big, can you split it?", and by the time you circle back you have forgotten half of what the code does.

That 1,200-line PR is not the exception — it is the symptom of a workflow where you cannot build on top of work that has not been merged yet. The fix is a pattern called **stacked pull requests**, and as of July 2026, it is now a first-class feature inside GitHub itself.

## What Are Stacked Pull Requests?

Stacked PRs break a large change into an ordered series of small, focused pull requests — each one building on the one below it. Instead of one monolith, you get a stack:

```
┌─ PR #5: Update frontend components
├─ PR #4: Add database migration
├─ PR #3: Refactor API endpoint
├─ PR #2: Add new types and interfaces
└─ PR #1 (base): Configuration changes
```

Each PR in the stack targets the layer directly below it, not `main`. You can review, discuss, and iterate on each layer independently while the rest of the stack stays open. When everything is green, GitHub merges the entire stack — or individual layers — in a single click.

This is not a new idea. Large engineering orgs at Google, Meta, and Uber have used stacked diffs for years. What changed in July 2026 is that GitHub made it native: no third-party tools, no custom scripts, no manual rebase chains. Just `gh` and a CLI extension.

## Why Traditional PRs Slow You Down

The standard GitHub workflow is linear: branch off `main`, write code, open PR, wait for review, merge, repeat. Every dependency chain means waiting:

1. You write the backend change → PR #1
2. You wait for review before starting on the frontend
3. Reviewer gets to it in 48 hours, requests minor changes
4. You fix, push, wait again
5. PR #1 merges → now you can finally branch for PR #2
6. Repeat

This serial bottleneck gets worse with AI-assisted coding. When you can generate large features quickly, the bottleneck shifts from writing code to getting it reviewed and merged. Stacked PRs parallelize the review process: one teammate reviews the API layer while another reviews the frontend layer, and neither blocks the other.

## GitHub's Native Stacked PRs

On July 30, 2026, GitHub announced public preview of stacked pull requests. The implementation is a CLI extension:

```
gh extension install github/gh-stack
```

Once installed, you create branches and PRs as usual, then use `gh stack` to link them into a dependency chain. Each PR shows a **stack map** at the top so reviewers know where their layer fits in the larger change.

Key details from the [GitHub changelog](https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/):

- **Independent review** — Open any PR in the stack to see only the diff for that layer. Multiple reviewers can work on different layers in parallel.
- **One-click merge** — Merge the topmost ready PR and everything below it lands in a single operation.
- **Automatic rebase** — When a lower layer merges, upper layers automatically rebase and retarget.
- **Merge queue support** — Rolling out progressively over the weeks following the launch.
- **Works everywhere** — github.com, GitHub CLI, GitHub Mobile, and GitHub Copilot (via the gh-stack skill).

Testimonials from the announcement include Tim Neutkens (Next.js lead at Vercel), John Resig (creator of jQuery), and Andy Merryman (CTO of TED) — all confirming the same pattern: smaller PRs, faster reviews, more confident merges.

## Alternative Tools for Stacked PRs

GitHub's native support is new, but the concept has existing tooling worth knowing:

| Tool | Approach | Key Feature |
|------|----------|-------------|
| **`gh-stack`** (GitHub official) | CLI extension, native UI | First-class GitHub integration, stack map in PR UI |
| **[stax](https://github.com/cesarferreira/stax)** (⭐119, Rust) | Standalone CLI with TUI | Fastest stacked-branch workflow, safe undo, interactive terminal UI |
| **Graphite** | SaaS + CLI | Stacked PRs with merge queue, team analytics |
| **GitButler** | Desktop app + CLI | Virtual branches, stacked PRs as a native concept |

We covered [GitButler]({{< relref "posts/one-week-review-gitbutler/" >}}) earlier — it implements stacked branches through its virtual branch model, which is a different approach from explicit branch chains. If you prefer a desktop GUI, GitButler remains a strong option.

The main advantage of `gh-stack` over third-party tools is that it lives inside GitHub's own review UI — the stack map, merge button, and branch protection rules all work without leaving github.com.

## Best Practices for Stacked PRs

Based on real usage from large teams and the tooling available in July 2026:

### 1. Keep each layer small and focused

A good rule of thumb: each PR in the stack should be reviewable in under 15 minutes. If a layer touches three unrelated concerns, split it further. The whole point is review velocity.

### 2. Stack depth of 3–5 is ideal

Very shallow stacks (2 layers) don't gain much parallelism. Very deep stacks (8+ layers) become hard to reason about — reviewers lose track of the overall change. Three to five layers hits the sweet spot for most features.

### 3. Use the same branch protection

GitHub's stacked PRs respect your existing branch protection rules and required checks. Each layer is validated independently. This means CI runs on every layer — a feature, not a bug — since it catches failures early.

### 4. Pair with merge queues

For teams with heavy CI pipelines, combine stacked PRs with [GitHub merge queues](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-merge-queues). The merge queue tests the combined state before landing, which is especially valuable when landing multiple stacked layers at once.

### 5. Communicate the stack order

Use the stack description or PR titles to signal intent. A pattern like `[1/5] Config`, `[2/5] Types`, `[3/5] API` makes the dependency order obvious to everyone.

## Stacked vs Traditional: A Comparison

| Aspect | Traditional PR | Stacked PRs |
|--------|---------------|-------------|
| Review unit | Entire feature (200–2000+ lines) | Single logical layer (50–300 lines) |
| Parallelism | Serial — one review at a time | Parallel — multiple layers reviewed simultaneously |
| Merge operation | Single PR merge | One-click stack merge or per-layer |
| Rebase effort | Manual if conflicts arise | Automatic for upper layers |
| Reviewer cognitive load | High — must understand the full change | Low — each layer is narrowly scoped |
| CI cost | One CI run per PR | CI per layer, but faster cycle time |
| Best for | Small, independent fixes | Large features, multi-step refactors |

## When NOT to Use Stacked PRs

Stacked PRs are not a silver bullet. Avoid them when:

- **The change is genuinely small** — a 50-line bug fix does not need a stack.
- **Reviewers are not on board** — if your team is not comfortable with the workflow, the coordination overhead outweighs the benefit.
- **The layers are inseparable** — sometimes a change truly is atomic and splitting it produces meaningless intermediate states.

Start with one experimental stack on a non-critical feature to build team confidence.

## The Bottom Line

GitHub's native stacked PR support is a workflow unlock for teams that ship large features regularly. The bottleneck in modern development is no longer writing code — it is getting that code reviewed and merged safely. Stacked PRs address that directly by parallelizing the review process and keeping each unit of review small enough that reviewers actually want to engage with it.

If you are already using [GitHub for CI/CD and agentic workflows]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}}), adding stacked PRs is the natural next step. And if you are coming from a [GitButler virtual branch workflow]({{< relref "posts/one-week-review-gitbutler/" >}}), you will find the mental model similar even if the mechanics differ.

The `gh stack` command is the quickest way to try it today:

```bash
gh extension install github/gh-stack
gh stack --help
```

Read also:

- [GitButler Review 2026: Two Weeks Replacing My Git Workflow (Honest)]({{< relref "posts/one-week-review-gitbutler/" >}})
- [GitLost [2026]: How Prompt Injection in GitHub's AI Agent Leaks Private Repos]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})
- [GitButler Review 2026: Two Weeks Replacing My Git Workflow (Honest)]({{< relref "posts/one-week-review-gitbutler/" >}})

---

Feel free to reach out about this and other topics at <contact@lucasaguiar.xyz>
