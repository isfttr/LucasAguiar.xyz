---
date: 2026-07-18T15:04:17-03:00
draft: true
title: "SQLite Performance and Best Practices: A Practical Guide for Developers and Homelab Users [2026]"
description: "Comprehensive guide to running SQLite in production-like environments: WAL mode, ANALYZE, VACUUM, concurrency strategies, backup, and performance tuning for self-hosted projects."
featured_image: ""
categories:
  - article
tags:
  - sqlite
  - database
  - homelab
  - performance
  - linux
---

SQLite is everywhere. Every mobile app, every browser, every embedded system, and an increasing number of self-hosted services rely on it. It ships as a single file, needs no server process, and requires zero configuration to start.

But "zero configuration" doesn't mean zero maintenance. When you push SQLite beyond a development scratchpad — running it behind a Django/Flask app, using it in a Docker container, or embedding it in a homelab service — you quickly discover that databases are still databases, and they need attention.

This guide covers what I've learned running SQLite in real self-hosted projects: the pragmas that matter, the maintenance routines you shouldn't skip, and the concurrency patterns that keep your data safe.

## When to Use SQLite vs a Client-Server Database

The first question is not "how" but "when." SQLite is the right choice when:

- **Your workload is read-heavy** — SQLite handles concurrent reads extremely well (multiple readers can access the database simultaneously even without WAL mode).
- **You have a single writer** — SQLite serializes writes. If your app has one process writing and many readers, SQLite works great.
- **Your data fits on a single machine** — SQLite is not a distributed database. If you need replication or sharding, look at PostgreSQL.
- **You want zero ops** — No server to install, no connection pools to tune, no users to create. The file *is* the database.

A good rule of thumb: if your app fits on a single $5 VPS and you don't need concurrent writers, SQLite is probably the right choice. The [SQLite documentation has an entire page on when to use it](https://sqlite.org/whentouse.html), and the short version is: SQLite handles **up to a few hundred writes per second** comfortably on modern hardware, which covers the vast majority of self-hosted apps.

## Essential Pragmas: The Minimum Viable Setup

SQLite has over 100 PRAGMA statements. These five are the ones you should set on every new database:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

### WAL Mode

Write-Ahead Logging (`WAL`) is the single biggest performance improvement for most workloads. Instead of writing directly to the main database file, changes go to a separate WAL file. This means readers don't block writers and writers don't block readers — a dramatic improvement over the default rollback journal mode.

```sql
-- Check current mode
PRAGMA journal_mode;
-- Switch to WAL (one-time, persists in the database file)
PRAGMA journal_mode = WAL;
```

The trade-off: the WAL file exists alongside your database and needs checkpoints to reclaim space. SQLite handles this automatically, but you'll see a `-wal` and `-shm` file in your data directory.

### Synchronous Mode

`PRAGMA synchronous = NORMAL` is the sweet spot. It guarantees that writes are flushed to disk at the most critical moments but is significantly faster than `FULL`. In `NORMAL` mode, SQLite syncs after each transaction commit but not after every page write. The difference between `NORMAL` and `FULL` is roughly a 20-30% speed improvement on most SSDs, with no measurable safety difference for typical use.

Only use `OFF` if you're willing to lose the last transaction on power loss — useful for an ephemeral cache database, dangerous for anything that holds real data.

### Cache Size

```sql
PRAGMA cache_size = -64000; -- 64 MB
```

Negative values mean kilobytes. 64 MB is a good starting point for a general-purpose database. If your database is larger than memory, increase this to 200-400 MB. The cache stores pages in memory, reducing disk I/O significantly for repeated queries.

Foreign keys are off by default for backward compatibility. Always enable them if your schema uses references.

## ANALYZE and Query Planning

This is the most underrated SQLite maintenance command. Running `ANALYZE` generates query planner statistics — row counts, distribution of values, index selectivity — that let the query planner make drastically better decisions.

Without `ANALYZE`, SQLite makes worst-case assumptions. A query on a table with 4,000 rows and a full-text search index might take 5 seconds without statistics and 50 milliseconds with them.

```sql
-- Generate statistics for all tables
ANALYZE;

-- Or for a specific table
ANALYZE my_table;

-- Check when statistics were last updated (stored in sqlite_stat1)
SELECT * FROM sqlite_stat1;
```

**When to run ANALYZE:**
- After bulk inserts or imports
- After adding or rebuilding indexes
- Periodically in a cron job (weekly is plenty for most apps)
- Whenever a previously fast query suddenly becomes slow

## VACUUM and Database Maintenance

SQLite does not automatically reclaim disk space when you delete rows. The database file grows and grows, even if most of the data has been removed. This happens because SQLite marks pages as free but keeps them allocated for future inserts.

```sql
-- Reclaim empty pages (requires exclusive lock, can be slow)
VACUUM;

-- Check fragmentation
PRAGMA freelist_count;
```

`VACUUM` rebuilds the entire database file, reclaiming all free space and defragmenting pages. It requires an exclusive lock and essentially doubles the disk space temporarily (it creates a new file while keeping the old one).

**Alternatives for large databases:**
- `PRAGMA auto_vacuum = INCREMENTAL;` enables incremental vacuuming, which reclaims pages on each transaction commit instead of all at once.
- Auto-vacuum can cause fragmentation. For most workloads, running `VACUUM` during a maintenance window (weekly or monthly) is simpler and more effective.

## Concurrency and Busy Handling

SQLite's main limitation is that only one writer can be active at a time. WAL mode helps — readers continue even during writes — but the writer lock is still exclusive.

The `busy_timeout` pragma tells SQLite how long to wait (in milliseconds) when it can't acquire a lock before returning `SQLITE_BUSY`:

```sql
PRAGMA busy_timeout = 5000; -- 5 seconds
```

With this set, most applications never see a `database is locked` error — they simply wait. But if a write takes longer than 5 seconds (cleaning up thousands of rows, for example), all other writes will time out and fail.

**Strategies for avoiding write contention:**

1. **Batch deletes** — never `DELETE` 100,000 rows in one transaction. Delete in batches of 100-500 with short pauses between batches.
2. **Keep transactions short** — a transaction that holds the write lock for seconds will cause every other writer to queue up. If you're running Python code inside a transaction, move the slow logic outside.
3. **Use a dedicated queue** — if you have multiple processes writing, route writes through a single worker. SQLite works best with one writer process.
4. **Consider a connection pool that serializes writes** — libraries like `psycopg2`'s pool aren't available, but a simple Python `queue.Queue` consumer works well.

## Backup Strategies

SQLite files are just files, which makes backup simple — and also dangerous. A naive `cp` while a write is in progress can corrupt the database.

### Safe backup with the Backup API

```python
import sqlite3
import contextlib

def backup_sqlite(source_path, dest_path):
    """Create a consistent backup of a SQLite database."""
    source = sqlite3.connect(source_path)
    dest = sqlite3.connect(dest_path)
    with dest:
        source.backup(dest, pages=1000)  # 1000 pages at a time
    source.close()
    dest.close()
```

The Backup API copies the database page by page while both databases are open, ensuring consistency. It works even while the source is being read.

### Using VACUUM INTO (SQLite 3.27+)

```sql
VACUUM INTO '/path/to/backup.sqlite';
```

This creates a fully vacuumed, consistent copy in one command. It's the simplest option and is atomic — the temporary files are cleaned up automatically.

### rsync + WAL checkpoint

For filesystem-level backups, issue a WAL checkpoint first, then copy:

```sql
PRAGMA wal_checkpoint(TRUNCATE);
```

```bash
cp mydb.sqlite backup/mydb.sqlite
```

But this only works if no other process writes during the copy. For safety, use the Backup API or `VACUUM INTO`.

## Performance Tuning by Workload

### Read-heavy (reporting, analytics)

```sql
PRAGMA mmap_size = 268435456;  -- 256 MB memory-mapped I/O
PRAGMA cache_size = -200000;   -- 200 MB cache
PRAGMA temp_store = MEMORY;    -- Temp tables in memory
```

Memory-mapped I/O (`mmap`) can dramatically speed up read-heavy workloads by letting the OS manage page loading. Set `mmap_size` to roughly the size of your working dataset.

### Write-heavy (logs, metrics)

```sql
PRAGMA synchronous = OFF;       -- Risk data loss but much faster
PRAGMA journal_mode = WAL;
PRAGMA cache_size = -64000;
```

If you're writing time-series data or logs where losing a few seconds is acceptable, turning off synchronous mode gives a 10-50x write speedup. Combine with WAL mode to keep reads fast.

### Mixed workload (web app)

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

This is the general-purpose setup for web applications. If you're using Django, add `'OPTIONS': {'transaction_mode': 'IMMEDIATE'}` to your database settings — it acquires the write lock at the start of the transaction instead of at the first write, avoiding deadlocks in concurrent requests.

## Common Pitfalls

### 1. Forgetting to run ANALYZE

The most common performance issue. A single `ANALYZE` call can turn a 5-second query into a 50ms query. Run it after any significant data change, and set up a weekly cron job.

### 2. Opening and closing connections too fast

SQLite file operations have overhead. Use a connection pool or keep a persistent connection open. Opening and closing a connection per request is fine for low traffic but becomes expensive at scale.

### 3. Writing from multiple processes without coordination

Multiple processes (not threads, but separate processes) writing to the same SQLite database will cause `SQLITE_BUSY` errors even with WAL mode. Each process gets its own lock. The solution: route all writes through one process, or use PostgreSQL.

### 4. Not backing up the WAL file

When you back up the `.sqlite` file, don't forget the `.sqlite-wal` and `.sqlite-shm` files. If you copy only the main file while a transaction is in the WAL, you'll lose that transaction. Use the Backup API or `VACUUM INTO` to avoid this.

### 5. Ignoring page size

```sql
PRAGMA page_size = 4096;  -- 4 KB (default, good for most)
PRAGMA page_size = 8192;  -- 8 KB (better for larger databases)
```

The page size can only be set when the database is first created. Larger pages (8-16 KB) improve performance for bulk operations and large databases. The default 4 KB is fine for most self-hosted apps.

## SQLite in Docker: Best Practices

Running SQLite inside a Docker container is common for self-hosted apps. A few rules:

- **Mount the database directory as a volume** — never keep the database inside the container's ephemeral filesystem.
- **Use a bind mount, not a Docker volume, for NFS-backed storage** — SQLite needs proper file locking, which some Docker volume drivers don't support correctly.
- **Don't run the WAL checkpoint on shutdown** — Let SQLite handle this naturally. Forcing a checkpoint at container shutdown can cause unnecessary I/O and potential corruption if the container is killed.
- **Use `init: true` in Docker Compose for the database container** — this runs the container as PID 1 with proper signal handling.

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    volumes:
      - ./data:/data
    environment:
      - DATABASE_PATH=/data/app.sqlite
```

## Summary Cheat Sheet

| Task | Command / Action |
|------|-----------------|
| Enable WAL mode | `PRAGMA journal_mode = WAL;` |
| Optimize query planner | `ANALYZE;` |
| Reclaim disk space | `VACUUM;` or `VACUUM INTO '/backup.sqlite';` |
| Set busy timeout | `PRAGMA busy_timeout = 5000;` |
| Safe backup | `VACUUM INTO '/tmp/backup.sqlite';` |
| Debug slow query | `EXPLAIN QUERY PLAN SELECT ...;` |
| Check free pages | `PRAGMA freelist_count;` |
| Set cache size | `PRAGMA cache_size = -64000;` (64 MB) |
| Weekly maintenance | `ANALYZE; PRAGMA wal_checkpoint(TRUNCATE);` |

SQLite is an extraordinary piece of engineering — reliable, fast, and remarkably capable for a file-based database. With the right pragmas and a basic understanding of its internals, it can serve as the backbone of self-hosted applications for years without issues.

Read also:

- [Proxmox Backup Server: installation via community-scripts and backup configuration [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [How to install Proxmox VE on Mac Mini 2018 (T2 chip): the step-by-step guide that worked]({{< relref "posts/proxmox-mac-mini-2018-t2/" >}})
- [How to migrate from Proxmox VE 8 to 9: step-by-step guide [2026]]({{< relref "posts/migracao-proxmox-8-9-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
