---
date: 2026-08-27T15:04:56-03:00
draft: false
title: "How to Verify Your PostgreSQL Backups Actually Restore [2026]"
description: "Step-by-step guide to testing PostgreSQL backups: validate pg_dump files, restore into scratch databases, automate restore drills with cron, and track RPO/RTO. Includes pgBackRest and restoredrill."
url: ""
featured_image: ""
categories:
  - article
tags:
  - postgresql
  - backups
  - homelab
  - self-hosted
  - devops
---

A backup you have never restored is a guess, not a guarantee. Every PostgreSQL admin knows the drill: `pg_dump` runs every night, the log says success, and the first real restore happens during an outage — which is exactly when you discover the dump has been corrupted for three weeks, the WAL archive stopped shipping, or the restore fails on a missing tablespace. This guide shows you how to verify PostgreSQL backups actually restore, with concrete commands for logical and physical backups, and how to automate the check so it runs without you.

## Why backups fail silently

Most backup pipelines fail in ways that exit 0. The classic failure modes:

- **Stale files**: the backup cron died quietly months ago, but the directory still shows an old file, so monitoring never fires.
- **Corrupted dumps**: disk errors or interrupted writes produce a `.dump` that looks fine but fails mid-restore.
- **Missing WAL segments**: physical backups with continuous archiving are useless if the archive stopped shipping or a segment is lost.
- **Version mismatch**: `pg_restore` into a different major version than the dump, or restoring a newer dump into an older server.
- **Environment drift**: the restore path expects tablespaces, users, or extensions that no longer exist on the target.

The only way to catch these is to actually perform a restore — on a schedule, into a scratch environment, with checks that read the data back.

## Tier 1: Verify logical backups (pg_dump)

For logical backups made with `pg_dump -Fc`, start with a cheap structural validation — it reads the archive TOC without restoring data:

```bash
pg_restore --list backup.dump > /dev/null && echo "TOC OK"
```

A TOC that parses does not mean the data is intact. The real test is a full restore into a throwaway database:

```bash
createdb restore_test
pg_restore -d restore_test --no-owner --no-privileges backup.dump
```

Then assert the data actually came back — row counts and freshness on a few key tables:

```bash
psql -d restore_test -c "SELECT count(*) FROM users;"
psql -d restore_test -c "SELECT max(updated_at) FROM orders;"
```

A restore can exit 0 and still be lying. One documented incident behind the [restoredrill](https://github.com/ahmadpiran/restoredrill) project: a restore process exited clean while the database behind it was silently corrupted. That is why read-path checks matter, not just exit codes.

## Tier 2: Verify physical backups (pg_basebackup and WAL)

Physical backups capture the entire cluster, which is what you need for point-in-time recovery. To verify one, restore the base backup into a temporary data directory and let PostgreSQL replay the WAL:

```bash
tar xzf /backups/base_$(date +%F).tar.gz -C /tmp/pgtest
# if you archived WAL, put the needed segments where recovery expects them
pg_ctl -D /tmp/pgtest -o "-p 5433" start
```

Then check that recovery reached the expected point:

```bash
psql -p 5433 -c "SELECT pg_is_in_recovery();"  # must return false after recovery completes
psql -p 5433 -c "SELECT now() - pg_last_xact_replay_timestamp();"  # small = WAL is fresh
```

If you use `pg_basebackup` with a replication slot, verify the slot is not stuck and that WAL archiving is actually producing files (`pg_wal` and archive destination sizes growing). The official docs on [continuous archiving](https://www.postgresql.org/docs/current/continuous-archiving.html) cover the requirements.

## Tier 3: Dedicated tools — pgBackRest and Barman

If you run [pgBackRest](https://pgbackrest.org/), verification is built in: `pgbackrest info` shows the backup set, and you can restore to an alternate path without touching production:

```bash
pgbackrest --stanza=main --type=full --target=/tmp/pgtest restore
pgbackrest --stanza=main check   # validates configuration, repo, and archive connectivity
```

Run `pgbackrest check` on a schedule — it verifies that archiving works end to end, which is the failure mode people discover last.

## Automate the drill: a weekly restore test

Manual verification happens once, then stops. The fix is a cron job that restores into a staging database, runs assertions, and alerts on failure. Minimal example:

```bash
#!/bin/bash
set -euo pipefail
STAGING=restore_drill
dropdb --if-exists $STAGING
createdb $STAGING
pg_restore -d $STAGING --no-owner --no-privileges /backups/latest.dump
psql -d $STAGING -tAc "SELECT count(*) FROM users" | grep -qE '^[1-9]' || exit 1
psql -d $STAGING -c "SELECT max(updated_at) FROM orders" | grep -q 2026 || exit 1
echo "RESTORE DRILL PASSED at $(date -Is)" >> /var/log/restore-drill.log
```

The cron entry runs it weekly; a failed drill should page you like any other outage. Track two numbers in the log: **RPO** (how fresh the backup is) and **RTO** (how long the restore took). If your restore takes six hours and your SLA says four, the drill is doing its job by proving it.

## Tooling in 2026

The Show HN project [restoredrill](https://github.com/ahmadpiran/restoredrill) (30 points on Hacker News in August 2026) is a CI-native check: it fetches the latest backup, restores it into a throwaway Postgres container, runs your SQL assertions, and writes a timestamped JSON report — the shape of evidence auditors ask for in SOC 2, ISO 27001, or AWS Foundational Technical Review. For a dashboard managing multiple database engines, [Databasus](https://github.com/databasus/databasus) includes restore verification with a web UI, and [BackupDrill](https://backupdrill.com) covers Supabase specifically.

For homelab setups, combine this with a proper backup server: see our guide on [Proxmox Backup Server installation and configuration]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}) for the infrastructure layer.

## Checklist

- [ ] `pg_restore --list` passes on every logical dump
- [ ] Full restore into a scratch database runs at least weekly
- [ ] Row-count and freshness assertions read data back, not just exit codes
- [ ] `pgbackrest check` (or `barman check`) runs on a schedule
- [ ] One restore drill restores the latest WAL point, not a stale file
- [ ] RTO measured and compared against your target
- [ ] Failed drills page you — silent failures are the real risk

A restore you tested yesterday is a backup. A restore you tested last year is a hope. Automate the drill, log the evidence, and make the failure loud.

Also read:

- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [SQLite WAL Corruption: How to Detect, Fix and Prevent It in Your Homelab [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
