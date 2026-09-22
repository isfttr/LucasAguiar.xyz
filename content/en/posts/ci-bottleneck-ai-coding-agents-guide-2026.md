---
date: 2026-09-22T15:04:05-03:00
draft: true
title: "AI Coding Agents Are Flooding Your CI — How to Rework the Pipeline to Keep Up [2026]"
description: "Practical guide to fixing the CI bottleneck caused by AI coding agents: faster runners, test sharding, lean checkouts, and setup cost reduction — with concrete numbers from Linear's engineering team."
url: ""
featured_image:
categories:
  - article
  - tutorial
tags:
  - ci-cd
  - devops
  - ai-coding-agents
  - testing
  - github-actions
---

AI coding agents can now generate and submit pull requests orders of magnitude faster than a human can review them — and for many teams, the bottleneck has quietly moved from the editor to the continuous integration (CI) pipeline. If your test suite is taking 10+ minutes per PR while agents churn out dozens of branches a day, the queue, the runner bill, and the developer frustration all point to the same problem: CI can't keep up. This guide walks through how to rework a CI system that is being overwhelmed by AI-generated code, using the concrete playbook Linear's engineering team published in September 2026.

## Why AI agents made CI the bottleneck

The fundamental shift is volume. A human developer opens one or two pull requests per day. An agentic workflow — or several agents assigned to separate tickets — can produce many more, and it produces them around the clock. Every PR, agent-written or not, has to pass the same gates: typecheck, lint, unit tests, integration tests, merge checks. As the rate of code generation accelerates, the validation layer stops being a side activity and becomes the critical path that gates everything.

Linear quantified this precisely. Their test suite nearly quadrupled in the first nine months of 2026, yet they still cut pull request wait time from just over six minutes to just over five, while roughly halving runner time per test. The interesting part: most of their wins were not exotic. They were disciplined infrastructure and workflow changes that apply to any codebase, in any language.

## Four levers to unblock CI

Linear's rework maps neatly to four levers. Pick the ones that match the bottleneck you actually have.

### 1. Upgrade infrastructure and tooling first

Before optimizing the pipeline itself, check whether you are running it on hardware that is fast enough. Linear moved off GitHub-hosted runners to third-party runners with faster CPUs, higher-performance storage, and better cache infrastructure. In a like-for-like comparison, jobs ran 34% faster on average after the switch, with some workloads dropping 52%.

Toolchain modernization paid even more. Switching to the native TypeScript compiler (tsgo) cut the median time of their typecheck by 73% — enough to move the bottleneck off typechecking entirely. AI agents write a lot of code, so code that agents generate often triggers expensive static analysis; making that analysis faster is one of the highest-leverage single changes you can make.

### 2. Optimize the jobs that gate everything else

Every pipeline has a few jobs on the critical path — the change-detection job, the checkout, the merge gate — that nothing else can start before they finish. A small delay here multiplies across all parallel work.

Linear's change-detection job was checking out the full working tree just to decide what should run next (for example, whether a diff touches a database migration). Capping fetch depth cut the slowest of these gates from 94 seconds to 20; removing checkout entirely from jobs that never needed it saved more. The median duration of the change-detection job fell from 26 to 8 seconds. If a job only inspects a diff, don't give it the whole repository — a sparse, blobless checkout with limited history is usually enough.

When they moved to third-party runners outside GitHub's network, checkout began to hang intermittently over the direct IP link. They replaced `actions/checkout` with a composite action that retries with backoff and sets `GIT_HTTP_LOW_SPEED_LIMIT` and `GIT_HTTP_LOW_SPEED_TIME`, so a stalled connection aborts in about 30 seconds instead of hanging the whole run. Networking resilience on the critical path is underrated: a checkout that hangs is CI downtime no one budgets for.

### 3. Cut repeated setup cost

A job that does seconds of real work but spends minutes installing dependencies is consuming infrastructure without shipping value. Three habits remove most of this waste:

- **Preinstall shared dependencies in the CI image.** Linear moved the Postgres client into a small base image so every test shard started from an environment already ready to run, removing 7–8 seconds of `apt` install per shard.
- **Install only what each job needs.** In their pnpm monorepo, the API test workflow was installing the entire workspace. Restricting the install to the API package cut `pnpm install` from 44–73 seconds to 16–18 seconds.
- **Don't cache when rebuilding is faster.** Some CI teams cache aggressively out of instinct. Linear measured that a cache hit took ~28 seconds to restore, while a filtered install took ~7.5 — so they dropped the `node_modules` cache entirely. Measure this yourself; the cache key change frequency decides whether your cache is helping or hurting.

They also avoided replaying unchanged setup: API containers were replaying the full database migration history on every run even when a PR hadn't changed the schema. Loading a generated schema snapshot instead cut database setup from ~12 seconds to 1–2 seconds. And they batched seven tiny independent checks into two jobs, saving roughly 87,000 runner-minutes per month (11.8% of total CI usage).

### 4. Parallelize test execution — but respect setup overhead

Once fixed cost per shard is low, sharding pays off. Linear went from three to four test shards, then to eight, making the critical job ~19% faster and ~19% cheaper in an initial benchmark.

The biggest single win was sharing module state with strict isolation rules. Vitest, their test runner, normally isolates every test file — which meant rebuilding the entity, GraphQL, and decorator graphs in each shard. They introduced an opt-in project with `isolate: false`, letting safe files share a module registry within each worker. This was worth roughly 17% in monthly savings, and it was also the highest-risk change: eligibility had to be explicit per file, with proper teardown for shared state. Notably, since agents now write most of their tests, they updated their agent skill files so generated tests follow the same performance constraints by default.

There's a ceiling, though: sharding is only worth it when the per-shard setup is low. Doubling the shard count doubles setup time. With setup at 110–140 seconds per shard, eight shards would have burned 15–19 minutes of runner time on setup alone — more than the tests. After reducing setup to ~40 seconds, eight shards spent *less* total setup time than four did before, while parallelizing twice as far.

## Building the pipeline for an agent-driven codebase

The deeper lesson is organizational. When agents write the majority of tests, your CI constraints become part of your prompt engineering. Linear updated its agent skills so generated code follows the same performance rules by default — the same way you'd document a lint config for a human reviewer, you encode the CI contract for the agent.

Second, expect the effort to be continuous. A team adding roughly 2,000 tests a week will always be chasing the next bottleneck. The discipline that scales is not a single rewrite but a repeatable process: measure what a PR waits on, measure runner time, attack the jobs on the critical path, and re-run the loop.

## Where to start

If your CI feels slow under a load of agent-generated PRs, begin by measuring two numbers: how long a PR waits on CI, and how much runner time each test consumes. Then attack in this order: faster infrastructure and tooling, the gating jobs on the critical path, repeated setup cost, and finally aggressive sharding once setup is cheap. You don't need to adopt everything here at once — the first two levers alone returned most of Linear's gains.

Also read:

- [Stacked pull requests: a practical guide for AI-driven review workflows]({{< relref "posts/stacked-pull-requests-guide-2026/" >}})
- [Architecture of AI coding agents: how the pipeline handles generated code]({{< relref "posts/ai-coding-agents-architectural-guide-2026/" >}})
- [How to split a Git commit cleanly]({{< relref "posts/how-to-split-git-commit-guide-2026/" >}})

---

You can reach out to contact me about this and other topics by email at <contact@lucasaguiar.xyz>