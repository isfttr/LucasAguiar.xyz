---
date: 2026-10-01T15:03:51-03:00
draft: true
title: "Vector Databases in 2026: Why Vector Search Is Becoming a Feature, Not a Product"
description: "Vector databases in 2026: the specialized vector-first engine is being replaced by generalized databases. When to use pgvector, SQLite, DuckDB or a dedicated engine."
featured_image: ""
categories:
  - article
tags:
  - vector-databases
  - postgresql
  - sqlite
  - machine-learning
  - rag
---

One of the clearest signals that a technology has peaked is when the companies that built their entire product around it start saying it out loud. In September 2026, [turbopuffer](https://turbopuffer.com/blog/rip-vector-database) — a serverless vector database that counts Cursor and Notion among its earliest customers — titled a post "RIP, vector database". The title is provocative, but the engineering underneath is worth understanding, because it tells you where the industry is heading and, more practically, what you should reach for the next time you need vector search.

The short version: dedicated vector databases are not dead, but the *specialized vector-first engine* is. Vector search is rapidly becoming a default capability baked into general-purpose databases — PostgreSQL, SQLite, DuckDB and their peers. For most self-hosted and homelab use cases in 2026, that is exactly where you should be looking first.

## What "RIP, vector database" actually means

Turbopuffer's post is not a hit piece on the category. It is an honest account of why the company is changing its own storage architecture. The key claim is subtle but important: they are moving away from a **vector-primary index** to an engine where the approximate nearest neighbor (ANN) index is "just another" secondary index.

To understand why, it helps to see the evolution:

- **v1 — an ID and a vector.** The original engine stored nothing but an ID and a vector, laid out so the ANN index was the primary index. It was built on object storage for cheap economics, using a hierarchical clustering index (SPANN, then SPFresh) rather than a graph-based index.
- **v2 — attribute filtering and full-text search.** Customers wanted to filter vector searches by attributes and run BM25 full-text search, so the engine added inverted indexes and attributes — all still keyed by the ANN address of each document's vector.

That is the crux of the problem. Because *everything* is keyed by the ANN address, three costs start to bite once you add non-vector query plans:

1. **Storage amplification.** For multi-vector documents (nesting, late-interaction models), the full document content has to be duplicated once per vector.
2. **Write amplification.** Every insert, update or delete can trigger SPFresh rebalancing of vectors to preserve recall, and that rebalancing cascades into moving the full document contents and every inverted index that references them.
3. **Limited vectorization.** Modern query engines want to run tight loops over large blocks of values (DuckDB batches of 2,048 rows, ClickHouse up to ~65k, Lucene posting blocks of 256 docs) to keep the CPU pipeline full and unlock SIMD. But the ANN index works best with clusters of 100–200 documents, and when the ANN address is the primary key, *every* query plan is constrained to that block size. Turbopuffer's own full-text search v2 broke free of the constraint by storing postings separately in fixed blocks of ~256 — the index got 10x smaller and queries up to 20x faster.

The fix, which turbopuffer calls **v3**, is conceptually simple: stop keying on the ANN address, and treat ANN as one secondary index among several. The engineering is hard — at the time of writing their v3 was passing 100% of CI but was still slower than production — but the direction is unambiguous.

## Why this matters beyond one company

The architectural logic generalizes well beyond turbopuffer. The mature, boring end-state is that vector search is becoming **table stakes** — a feature every capable database ships, not a reason to stand up a separate system.

- **PostgreSQL**: the [pgvector](https://github.com/pgvector/pgvector) extension gives you HNSW and IVFFlat indexes alongside your relational data, transactions and the rest of your query language. If you already run Postgres, the marginal cost of adding vector search is close to zero. See our [PostgreSQL performance best practices for homelab and self-hosted]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}}) to keep it fast.
- **SQLite**: [sqlite-vec](https://github.com/asg017/sqlite-vec) brings vector search to the embedded database, which pairs naturally with local, file-based applications. We've covered [SQLite WAL corruption: detect, fix and prevent]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}}) for the storage layer that typically sits underneath.
- **DuckDB**: as an analytics engine, DuckDB handles embeddings in bulk — querying, filtering and joining vectors over Parquet/CSV/JSON directly. Our [guide to DuckDB for self-hosted analytics]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}}) shows how approachable it is.

The practical consequence of this convergence is the rise of **hybrid search in one engine**: combine vector similarity with BM25 full-text and structured filters in a single query, in a single system you already operate. That is the workflow most real RAG and retrieval applications need, and maintaining it inside a general-purpose database removes an entire class of operational complexity.

## When a dedicated engine still makes sense

The honest counterpoint: the specialized vendors are not wrong that there is a scale and cost bracket where they win. If your problem is truly enormous and latency-obsessed — think single indexes of 100B+ vectors serving 200 ms p99 reads at 1k+ QPS, or the 10M+ writes/s / 25k+ queries/s class of workload turbopuffer describes — a purpose-built engine remains the right tool. Running that workload on a homelab Postgres instance would be the wrong choice.

The decision framework for 2026 is roughly:

| Your situation | Reasonable default |
|---|---|
| Already run Postgres, modest vector workload | **[pgvector](https://github.com/pgvector/pgvector)** in the existing database |
| Local / embedded / file-based app | **[sqlite-vec](https://github.com/asg017/sqlite-vec)** |
| Bulk analytics over embeddings (Parquet/CSV) | **DuckDB** |
| Massive scale, low-latency, hyperspecialized | A dedicated engine (turbopuffer, Qdrant, Milvus, Weaviate) |

## The takeaway

The "RIP, vector database" moment is best read as a sign of maturity, not of decline. The specialized vector-first architecture that defined the 2023–2024 boom is being retired in favor of engines where ANN is just one index among many. For the overwhelming majority of self-hosted, homelab and production-adjacent workloads, that means vector search is now a feature you get almost free from the database you already run.

Before you stand up a separate vector database, ask whether your Postgres, SQLite or DuckDB instance already covers the 99% case. In most projects, the answer in 2026 is yes.

Also read:

- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [SQLite WAL Corruption: How to Detect, Fix and Prevent It [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})
- [DuckDB for Self-Hosted Analytics: Query CSV, Parquet, and JSON in Seconds [2026]]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
