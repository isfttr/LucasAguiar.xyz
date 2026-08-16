---
date: 2026-08-16T15:07:52-03:00
draft: true
title: "DuckDB for Self-Hosted Analytics: Query CSV, Parquet, and JSON in Seconds [2026]"
description: "Practical guide to DuckDB for homelab and self-hosted users: install the single binary, query CSV/Parquet/JSON directly, analyze logs and exports without spinning up a database server. Real examples."
featured_image: ""
categories:
  - article
tags:
  - duckdb
  - database
  - analytics
  - selfhosted
  - homelab
---

It's Friday afternoon. Your homelab has been running for months, and you finally need an answer: how many failed SSH logins happened across all your services last quarter? You have the logs — CSVs exported from Proxmox, JSON dumps from your dashboards, a few Parquet files from a backup job. The data is sitting right there. But to answer one question, you'd have to load everything into a spreadsheet that chokes at 200k rows, or spin up a whole database server, create tables, import files, and write INSERT statements like it's 2010.

There's a better way, and it's a single ~60 MB file with no server, no daemon, and no config file. Meet [DuckDB](https://duckdb.org/).

## What DuckDB Actually Is

DuckDB is an in-process analytical (OLAP) database engine, often described as "SQLite for analytics." Like SQLite, it runs inside your application or CLI process — there is no server to install, no ports to open, no daemon to babysit. But instead of being optimized for transactional workloads (lots of small reads and writes), DuckDB is columnar and built for analytical queries: aggregations, joins, and scans over large amounts of data.

That distinction matters for self-hosters. Your Proxmox host, your media stack, your monitoring dashboards — they generate mountains of event data that you rarely need to *write* but constantly want to *aggregate*. DuckDB is the tool for that second job.

The current release is [v1.5.5](https://github.com/duckdb/duckdb/releases) (July 2026), with v2.0 scheduled for fall 2026 — a release that, among other things, brings [asynchronous I/O for remote Parquet and CSV reads](https://duckdb.org/2026/07/31/asynchronous-io), making it even faster at querying data that lives in object storage rather than on a local SSD.

## Installing It: One Line

Because there's no server, "installation" means downloading a binary:

```bash
curl https://install.duckdb.org | sh
```

Or, if you're already in a Python environment:

```bash
pip install duckdb
```

You now have a `duckdb` CLI. Run `duckdb :memory:` for a throwaway session or `duckdb mydata.duckdb` for a persistent database file. That file is self-contained — you can copy it, back it up, or send it to a friend and it just works.

## Querying a CSV Without Importing Anything

Here's the moment that wins people over. You don't create a table, you don't define column types, you don't run an import. You just point SQL at the file:

```sql
SELECT * FROM 'visits.csv';
```

```
┌─────────┬─────────┬────────┐
│  name   │ country │ visits │
│ varchar │ varchar │ int64  │
├─────────┼─────────┼────────┤
│ Alice   │ BR      │     12 │
│ Bob     │ US      │      7 │
│ Carol   │ DE      │      9 │
└─────────┴─────────┴────────┘
```

DuckDB sniffs the file, infers the schema, and lets you run the full SQL you already know — `WHERE`, `GROUP BY`, `JOIN`, window functions, the works:

```sql
SELECT country, sum(visits) AS total
FROM read_csv_auto('visits.csv')
GROUP BY country
ORDER BY total DESC;
```

`read_csv_auto()` is the more explicit form, and it handles the messy real-world cases: custom delimiters, missing headers, wrong column types. Need to scan a whole directory of exports? Globs work:

```sql
SELECT * FROM read_csv_auto('logs/*.csv');
```

No import step. The file *is* the table.

## Parquet: The Format You Should Be Converting To

If you're going to query the same dataset more than once, convert it to Parquet once and never look back. Parquet is a columnar storage format: queries only read the columns they need, and each column's row groups carry min/max statistics that let DuckDB skip entire chunks of data with a simple `WHERE` clause. On real log datasets, this is often the difference between a scan that takes seconds and one that takes milliseconds.

Converting is a one-liner:

```sql
COPY (SELECT * FROM 'visits.csv') TO 'visits.parquet' (FORMAT PARQUET);
```

And querying is the same no-import pattern:

```sql
SELECT * FROM read_parquet('visits.parquet');
```

Parquet files are also smaller than their CSV equivalents (columnar compression), which matters when your homelab disk is a 256 GB SSD with three Proxmox backups already on it. The `parquet` and `json` extensions are bundled with the CLI — they show up as installed and loaded by default, so you don't need to do anything for local files. For [S3 and other remote storage](https://duckdb.org/docs/stable/extensions/httpfs/overview), you add the `httpfs` extension:

```sql
INSTALL httpfs;
LOAD httpfs;
```

## JSON: Because Your Dashboards Don't Speak CSV

Most self-hosted services export JSON, not tidy CSVs. DuckDB reads nested JSON directly, including arrays of objects and nested fields, without flattening anything by hand:

```sql
SELECT * FROM read_json_auto('visits.json');
```

```
┌─────────┬────────┐
│  name   │ visits │
│ varchar │ int64  │
├─────────┼────────┤
│ Alice   │     12 │
│ Bob     │      7 │
└─────────┴────────┘
```

`read_json_auto()` infers the schema from the data, and you can reach into nested structures with dot notation. For API dumps, Prometheus exports, or the raw output of a scraping script, this removes an entire category of "I'll clean it up later" preprocessing.

## Going Remote: Object Storage and the Future

The homelab pattern is evolving: instead of keeping every log forever on local disk, people are pushing archives to S3-compatible object storage (MinIO is a popular self-hosted choice). DuckDB can query those files directly, too:

```sql
CREATE SECRET (TYPE S3, KEY_ID 'your-key', SECRET 'your-secret', REGION 'us-east-1');
SELECT * FROM read_parquet('s3://my-bucket/logs/*.parquet');
```

The [httpfs extension docs](https://duckdb.org/docs/stable/extensions/httpfs/overview) cover S3, GCS, Azure, and even HTTP endpoints. And this is exactly where the upcoming v2.0 gets interesting: DuckDB's [async I/O work](https://duckdb.org/2026/07/31/asynchronous-io) is aimed at the case where your data lives remotely — instead of a thread sitting idle waiting for a byte-range request to come back from the network, DuckDB issues many concurrent reads and keeps working while data is in flight. For anyone who has tried to query a multi-GB Parquet file over a home uplink, that's a genuinely useful upgrade.

There's also [Quack](https://duckdb.org/2026/05/12/quack-remote-protocol), the client-server protocol introduced in May 2026, for when you do want to run DuckDB as a shared service on one machine and query it from others on your LAN.

## Real Homelab Use Cases

- **Log analysis without a pipeline**: point `read_csv_auto()` at your exported logs and answer "which IPs hit my reverse proxy the most last month?" in one query. No Logstash, no Elasticsearch, no RAM budget.
- **Ad-hoc answers from exports**: your dashboard exports JSON; your backup tool writes Parquet; your router spits out CSVs. They're all queryable with the same SQL, no ETL.
- **Replacing spreadsheet torture**: instead of opening a 500 MB CSV in a spreadsheet app that freezes, run the aggregation in DuckDB and export the *result*: `COPY (SELECT ...) TO 'summary.csv' (HEADER, DELIMITER ',');`
- **A poor man's data warehouse**: keep a persistent `analytics.duckdb` file, define views over your files with `CREATE VIEW`, and let cron jobs refresh the underlying files. The view layer stays stable even when the files rotate.
- **Interactive exploration**: `duckdb -ui` launches a [local web interface](https://duckdb.org/2025/03/12/duckdb-ui.html) for exploring a database file in the browser — handy when you want to poke at data without typing SQL into a terminal.

## DuckDB vs SQLite vs PostgreSQL

The three tools are complements, not competitors:

- **SQLite** is the embedded transactional engine — perfect for your app's structured state. If you've hit its [WAL corruption issues in a homelab context]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}}), you already know where it shines and where it hurts.
- **PostgreSQL** is the full-featured server database — the backbone of Nextcloud, GitLab, and friends. Tuning it for constrained hardware is a whole discipline of its own (see our [PostgreSQL performance guide]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})).
- **DuckDB** is the analytical engine you point at files — the "ask a question about data that already exists" tool. It's not a replacement for Postgres as a service backend, and it's not a replacement for SQLite as an embedded OLTP store. It's the third chair at the table, and it's the one that's been missing.

Run them side by side: Postgres stores your services' data, SQLite stores your app's state, and DuckDB answers the questions you didn't know you could ask about everything else.

## The Takeaway

If you self-host anything, you already have the data — you just lacked a low-friction way to ask questions of it. DuckDB removes the last excuse: no server, no schema, no import pipeline. Download one file, point it at your CSVs and Parquet, and the answer to that Friday-afternoon question is one SQL statement away.

Also read:

- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [SQLite WAL Corruption: How to Detect, Fix and Prevent It in Your Homelab [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
