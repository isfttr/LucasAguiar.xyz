---
date: 2026-11-24T15:05:00-03:00
draft: true
title: "Git for Databases: Version Control and Schema Migrations for Postgres and SQLite [2026]"
description: "You version your code, so why not your database? A practical guide to tracking schema and data changes with git, managing migrations with Flyway and Liquibase, and the new generation of git-native databases like Dolt."
featured_image: ""
categories:
  - article
tags:
  - git
  - postgres
  - sqlite
  - database
  - dev
  - homelab
  - versioning
---

Your application code lives in git, with every change logged, diffed and reviewable. Your database, the piece of the system that holds the data you can't afford to lose, usually doesn't. Schema changes get applied ad hoc, nobody can answer "what exactly changed between this release and the last one", and a broken migration means restoring from a backup and hoping.

You don't need a heavyweight enterprise tool to fix this. Whether you run Postgres in a homelab or SQLite in a small project, you can give your database the same version control workflow you already use for code — and the ecosystem has quietly matured, from classic migration tools to databases that are literally built on git. This guide covers the practical options in 2026 and when to pick each one.

## Why version your database at all

The core problem is asymmetry. Code is declarative and diffable: you change a file, commit it, and the history is forever. Databases are mutable state. A `CREATE TABLE` or `ALTER TABLE` that runs today changes production permanently, and nothing records that it happened unless you do it yourself.

Concretely, version control solves three recurring problems:

- **Reproducibility.** If you can recreate the schema from scratch, a new developer or a fresh homelab machine gets the exact same structure instead of "just make it look like the prod instance".
- **Auditing changes.** When a query suddenly slows down or a feature breaks, being able to diff the schema between two dates tells you what the migration introduced.
- **Safe rollbacks.** With migrations recorded as discrete scripts, you always have the exact statements that ran — and can write a reverse migration to undo them.

The data itself is a separate question. Versioning the *schema* is cheap and universally worth it; versioning *data* is where the new git-native tools come in.

## The pragmatic baseline: commit your schema to git

The lowest-effort approach that already covers most homelab and small-project needs: export the schema as a file and commit it alongside your code.

For **SQLite**, the database is a single file — but committing the raw `.db` binary to git is wasteful and fragile (binary diffs, corruption risk from the WAL). Instead, generate a canonical schema snapshot. The built-in path is `sqlite3`'s `.schema` command — dump it to a file with `.output schema.sql` and commit the result. A plain committed `.sql` schema file is diffable text, and combined with a backup strategy (see our guide on [SQLite WAL corruption and backup hygiene]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})) it gives you a clean history of structure changes.

For **Postgres**, dump just the schema — not the data — with `pg_dump`:

```bash
pg_dump --schema-only -d yourdb > schema.sql
```

Commit that file on every migration. Add it to a CI step or a cron job if you want the committed snapshot to always match reality (the script that git-diffs the live schema against the committed file catches drift, which is how schemas quietly diverge after a few manual `ALTER TABLE` statements).

This pattern requires no new software and is a huge improvement over nothing. Its limit: you're versioning *snapshots of the result*, not the *migrations themselves* — which is exactly what migration tools formalize.

## Migration tools: Flyway and Liquibase

Migration frameworks (database "migration managers") turn schema changes into ordered, versioned scripts that are applied once each and tracked in the database. Two of the most battle-tested are [Flyway](https://www.flywaydb.org/) and [Liquibase](https://www.liquibase.org/).

The mental model is identical to git history. Every change is a numbered migration file (`V1__create_users.sql`, `V2__add_email_index.sql`). Flyway records in a metadata table which versions have been applied, so running the tool applies only the pending ones — no matter who runs it or in what order. This is the difference that makes migrations *safe*: the tool refuses to re-run an already-applied migration, which is precisely the failure mode that corrupts a schema when someone pastes a `CREATE TABLE` by hand.

For Postgres workflows, [Atlas](https://atlasgo.io/) is a newer alternative that inverts the model: instead of writing migration files, you declare the *desired schema* and Atlas generates a diff and the migration to reach it. That maps even more directly onto "schema as a reviewed artifact" — your desired state lives in git, and Atlas produces the migration steps.

None of these replace git; they complement it. The migration files *are* the code you commit, the whole migration history lives in the repo, and `git log` on the `migrations/` directory is your audit trail.

## Git-native databases: where version control lives inside the DB

The most interesting 2026 development is databases that treat git semantics as a core feature rather than an external tool. [Dolt](https://www.dolthub.com/) is the flagship: a MySQL-compatible SQL database with Git under the hood. Every table has a commit history, you can `diff` two revisions, branch the data, merge it, and even revert a bad change — not by restoring a backup, but with `git checkout`-style operations. For developers this is a genuine breakthrough: `SELECT * FROM table AS OF 'some-commit'` gives you point-in-time data without a snapshot dump.

Branching data is the killer workflow. Instead of a shared dev database where everyone clobbers each other, each feature branch gets its own fork of the data, like Neon does for Postgres with its branching-and-snapshot model. When the schema AND the data both need to change together (add a column *and* backfill it), versioning them in the same revision control defeats a whole class of "schema/data mismatch" bugs.

The tradeoff: git-native databases are younger and less proven than Postgres or SQLite at scale, and your team has to learn the git-flavored operations. For a homelab or a project where a small dataset matters more than raw performance, they're excellent. For high-concurrency production workloads, the classic dumps-plus-migrations approach is still the safe default — and it pairs cleanly with proper [Postgres backup and restore verification]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}}).

## Choosing the right approach

As a quick decision guide:

| Your situation | Recommended approach |
|---|---|
| Small project, SQLite | Commit a generated `.sql` schema file to git |
| Homelab Postgres, want auditability | `pg_dump --schema-only` + commit on every change |
| Postgres/SQL with several developers | Flyway or Liquibase for ordered, tracked migrations |
| Declarative "desired schema" mindset | Atlas: declare state, auto-generate migrations |
| Data itself needs versioning/branching | Git-native: Dolt (SQL), or Neon branching for Postgres |

There's no conflict between these layers. The migration tool manages *how* changes apply, git records *what* changed and why, and backups handle *disaster recovery* — verify that disaster-recovery layer actually works, not just that it exists ([how to verify Postgres backups]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}})). If you've been treating your database as the one unversioned thing in an otherwise git-disciplined workflow, closing that gap is one afternoon of work with tools that are all free and open source.

## What to watch next

The git-for-data space is moving fast: Dolt keeps maturing, Postgres branching (via Neon and similar) is reaching self-hosted setups, and the columnar/postgres read-replica tools surfacing on Hacker News this year point at data plumbing becoming as reviewed as application code. The practical takeaway for 2026 is that every tier — schema snapshots, migration managers, git-native stores — is now mature enough to adopt in an afternoon, and the gap between "data is versioned" and "data is a liability" is only ever a few committed `.sql` files wide.

Also read:

- [PostgreSQL Performance Best Practices for Your Homelab [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [SQLite WAL Corruption: How Backups and WAL Mode Really Work [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})
- [How to Verify PostgreSQL Backups Actually Restore [2026]]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}})

---

Get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>