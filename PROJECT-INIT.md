# aka CLAUDE.md at July, 9th

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (English/Portuguese) personal blog built with **Hugo** (extended, v0.160.1 in CI) using the `gohugo-theme-ananke` theme, which is a **git submodule** under `themes/`. Deployed to GitHub Pages. The interesting part of this repo is not the Hugo site itself but the Node.js automation layer (`scripts/`) that AI-translates, cross-links, and instruments content, wired together as a chain of GitHub Actions.

## Commands

```bash
# Local preview (drafts + future-dated posts render because buildFuture=true)
hugo server -D
# ...or `npm run dev` to fetch fresh PostHog view counts first, then serve — needed to
# see the popularity ranking / "Mais lidos" rail locally (data/post_views.json is
# gitignored and `hugo server` alone never generates it).

# Production build (what CI runs)
hugo --gc --minify

# Clone/update the theme submodule (required after fresh clone)
git submodule update --init --recursive

# Content automation (run from repo root; needs DEEPSEEK_API_KEY/GEMINI_API_KEY in .env)
npm run translate            # sync EN<->PT translations
npm run suggest-backlinks    # regenerate "Read also"/"Leia também" sections
npm run backfill-en-slugs -- --dry-run   # one-off slug migration; ALWAYS dry-run first
npm run fix-links            # rewrite [text](/posts/slug/) -> {{< ref "posts/slug.md" >}}
npm run annotate             # create PostHog annotation for newly-published posts
npm run fetch-post-views     # query PostHog pageviews -> data/post_views.json (home ranking)
npm run release              # release-it: version bump + changelog + GitHub release
```

There is no test suite, linter, or local dev server script — scripts are run directly with `node`/`npm run` and validated in CI.

## Content model & i18n (read before touching `content/` or `scripts/translate.js`)

- Content lives in `content/en/` and `content/pt/`, selected by `contentDir` in `config.toml`. `DefaultContentLanguage = "en"`. `content/draft/` holds unpublished scratch drafts that Hugo does not build.
- **The filename is the cross-language translation key.** `content/en/posts/foo.md` and `content/pt/posts/foo.md` are the same post in two languages. This shared filename is what Hugo's `.Translations` and the backlink `relref`s rely on — do **not** rename one side without the other.
- **Slugs are per-language and translated** (the URL differs between EN/PT), while the filename stays constant. Slug generation is LLM-based with a deterministic slugify fallback (`scripts/slug.js`).
- **`translation_source_hash`** in a post's front matter is machine-managed by `translate.js` (sha256 of the source file) for update detection. Don't hand-edit it. Editing a source post causes its translation to be regenerated on the next run.
- **`draft` is a language-neutral field**: publishing one side (`draft: false`) propagates to the other even for posts too old to re-translate. When both sides lack a `translation_source_hash` (a hand-authored pair), **PT is treated as canonical**.
- Only **recent** posts (≤2 days old by `date`) are (re)translated; older posts only get `draft` synced. Each run is capped (`MAX_TRANSLATIONS = 5`, backlinks `MAX_AI_CALLS = 10`) to bound API cost.
- Internal links between posts must use the Hugo ref shortcode `{{< ref "posts/slug.md" >}}` (not raw paths) so they survive slug changes; `fix-links.js` migrates old-style links.

## Backlinks system

`scripts/suggest-backlinks.js` maintains `scripts/posts-index.json` as persistent state (titles, hashes, chosen backlinks per slug). It asks the LLM for the 3 most-related posts, then writes a "Read also:" (EN) / "Leia também:" (PT) section into each post. The block-writer is **idempotent**: it strips *all* existing backlink blocks (matching EN/PT header variants, including the "Also read:" the translator sometimes emits) and inserts exactly one, self-healing any duplicated sections.

## Homepage popularity ranking

`scripts/fetch-post-views.js` queries PostHog (**HogQL via the Query API**, `Bearer`
auth with a **dedicated read-only key `POSTHOG_QUERY_API_KEY`** — scope `query:read`,
separate from the annotation key — same host/project pattern as `posthog-annotate.js`)
and writes `data/post_views.json` — a `posts` map (`RelPermalink` → all-time views, bot-filtered)
plus `trending_7d` (top-10 per language, last 7 days). The file is **ephemeral**:
generated in the deploy job before `hugo` and **gitignored**, never committed. The
deploy workflow (`hugo.yaml`) also runs on a **daily `schedule`** so rankings refresh
without a content push.

`layouts/index.html` ranks posts by a Hacker-News-style score
`(views+1)/(age_days+2)^gravity` (gravity = `params.rankingGravity`, default 1.2) —
combining popularity with recency so old high-view posts decay and new posts can
surface. Per-post front-matter overrides: **`pinned: true`** (force to the top) and
**`boost: <number>`** (multiply the score). `layouts/partials/most-read.html` renders
the "Mais lidos / Most read" side rail from `trending_7d` on the `/posts/` archive
(`_default/list.html`) only — deliberately **not** on the home, whose list is already
popularity-ranked (it would be redundant). `layouts/partials/func/post-views.html` is a
value-returning partial (`{{ $v := partial "func/post-views.html" . }}`) that sums a
page's views across its URL union — reused by the home score loop and by `single.html`,
which prints the count at the end of each article. **Local caveat:** `hugo server` does
not run the fetch script, so run `npm run fetch-post-views` first or the counts/rail
stay hidden (empty data → chronological fallback).

**Pathname matching gotchas (both handled):** (1) English `$pathname` values appear
both as `/posts/<slug>/` and legacy `/en/posts/<slug>/`; the **script** folds `/en/`
into `/` and sums. (2) **Slug drift** — the LLM re-slug system (`backfill-en-slugs`,
slug regeneration) changes a post's slug over time, often *without* writing an alias,
so most of a post's views sit on its old URL (typically `/posts/<filename>/`, since the
original slug was filename-derived) while `.RelPermalink` now uses the new slug. So the
**template** sums views across the *union* of each post's URLs — `.RelPermalink` +
`/<section>/<.File.ContentBaseName>/` + `.Aliases` — in both `index.html` (score) and
`most-read.html` (reverse lookup). Without this, the top posts don't match and the rail
empties. Missing/empty data → template falls back to ~chronological and the rail hides
itself (build never breaks).

## AI provider layer

`scripts/ai.js` is the shared LLM abstraction. **DeepSeek is primary** (via the OpenAI SDK pointed at `api.deepseek.com`), **Gemini is the automatic fallback**. When adding AI features, follow this primary+fallback pattern rather than replacing the provider. Both `translate.js` and `suggest-backlinks.js` handle 429s with backoff and emit PostHog telemetry/exceptions on failure.

## CI pipeline (`.github/workflows/`) — the non-obvious part

Bot commits made with the default `GITHUB_TOKEN` **do not trigger `push` events**, so the workflows are deliberately chained with `workflow_run` instead of each reacting to `push`:

```
human push to master (content/**)
   → Auto Suggest Backlinks (commits backlinks + posts-index.json)
   → Auto Translate Content (commits translations)   [runs on backlinks completion]
   → Deploy Hugo site to Pages                        [runs on translate completion]
```

`hugo.yaml` also explicitly checks out `ref: master` (not the triggering SHA) so the deploy includes the just-committed bot content. If you add a workflow that produces bot commits and expect a rebuild, you must extend this chain — a naive `on: push` will silently never deploy. `posthog-annotate.yaml` runs only on **human** pushes (`github.actor != 'github-actions[bot]'`) to avoid double-annotating when the translation bot recreates a published post in the other language.

## Analytics

PostHog is used both for site analytics and for script/workflow telemetry. **Project ID is 404499 (US region).** The site loads PostHog through a reverse proxy at `t.lucasaguiar.xyz` (`params.posthogHost` in `config.toml`) to dodge ad-blockers. Publish events are recorded as PostHog annotations by `posthog-annotate.js`, which diffs a post's `draft` state across the push range to detect only the false-transition.

## Secrets

Local scripts read `.env` (gitignored) for `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_QUERY_API_KEY`, `HUGO_POSTHOG_TOKEN`. CI reads the same from repo secrets. The PostHog *personal* API key (annotations, write) is distinct from `POSTHOG_QUERY_API_KEY` (a dedicated read-only key, scope `query:read`, used only by `fetch-post-views.js`) and from the public project key (`phc_...`, ingestion) baked into `config.toml`.

## Conventions

Commits follow Conventional Commits (enforced by commitlint + husky; consumed by release-it for the changelog). Observed prefixes include `feat`, `chore(i18n)`, `chore(seo)`, `content:`, `draft:`, `Publish:`.
