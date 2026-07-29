---
date: 2026-07-29T11:10:00-03:00
draft: true
title: "International Patent Search Guide: PATENTSCOPE, Espacenet, and Google Patents [2026]"
description: "Complete guide to free international patent search tools: WIPO PATENTSCOPE, EPO Espacenet, and Google Patents. Comparison, search strategies, and practical tips for prior art searches."
featured_image: ""
categories:
  - article
tags:
  - patents
  - patent-search
  - wipo
  - intellectual-property
  - guide
  - innovation
---

You already know how to search patents in the INPI database. But did you know that international databases contain over **120 million patent documents** — including applications filed in the United States, Europe, China, Japan, Korea, and through the PCT system — and that most of them are freely accessible?

An estimated **70% of technical information found in patents is never published anywhere else** — not in journals, books, or conference proceedings. Ignoring international databases means missing a significant portion of global prior art. Depending on your technology sector, you might file a patent application that was already anticipated by a document published on the other side of the world.

This guide covers the **three main free international patent search tools**: PATENTSCOPE (WIPO), Espacenet (EPO), and Google Patents. You'll learn when to use each one, how to run advanced searches, and which strategies get you the results you actually need.

## Why Search Beyond Your Local Office?

The INPI database contains applications filed in Brazil — essential for prior art analysis in the Brazilian market. But for a **robust prior art search**, you need to cover the global landscape:

| Scenario | Why Search Internationally |
|---------|---------------------------|
| Filing a patent in Brazil | Prior art is worldwide — a Chinese or US document can anticipate your invention |
| Competitor analysis | Competitors file in major markets (USPTO, EPO, CNIPA, JPO) |
| Technology in the public domain | Expired patents or applications never filed in Brazil can be freely used |
| Technology trends | Global data shows where innovation is heading |
| Freedom-to-operate (FTO) | Before launching, verify active patents in all target markets |

Each international tool has different strengths. The right choice depends on what you need to find.

## PATENTSCOPE (WIPO) — The PCT Global Database

[PATENTSCOPE](https://patentscope.wipo.int/) is maintained by the World Intellectual Property Organization (WIPO). Originally focused on international applications filed under the Patent Cooperation Treaty (PCT), it now also incorporates documents from over **70 countries and regional offices**.

### What PATENTSCOPE Does Best

- **Core collection:** all published PCT applications (~4 million) — the largest unified source of international filings
- **National collections:** data from INPI (Brazil), USPTO (US), CNIPA (China), EPO, JPO (Japan), KIPO (Korea), and dozens of other offices
- **Biological sequence search:** a dedicated tool for searching nucleotide and amino acid sequences in biotechnology patents
- **Portuguese interface:** WIPO maintains full Portuguese translation
- **CLIR (Cross-Lingual Information Retrieval):** search in one language and find documents in others — useful for Chinese and Japanese patents
- **Batch download:** download up to 10,000 documents at once

### How to Run an Effective Search

PATENTSCOPE offers three search modes:

| Mode | Description | When to Use |
|------|-----------|-------------|
| **Basic** | Single free-text field | First contact, exploratory searches |
| **Advanced** | Combined fields (title, abstract, applicant, inventor, IPC, date) | Structured search with boolean operators |
| **Field Combination** | Visual interface with separate fields | Users who prefer forms to commands |

**Supported operators:** `AND`, `OR`, `NOT`, `near`, `adj`, exact phrases in quotes `"exact"`.

Advanced search example:
```
EN_TI:("solar cell" OR "photovoltaic") AND EN_AB:(silicon) AND IC_H:(H01L)
```

This returns patents with "solar cell" or "photovoltaic" in the title, "silicon" in the abstract, and classification H01L (semiconductor devices).

### Limitations

- Search parser is picky — operators must be in UPPERCASE
- National field quality varies by originating office
- No citation index as robust as Espacenet

## Espacenet (EPO) — The World's Largest Patent Collection

[Espacenet](https://worldwide.espacenet.com/) is maintained by the European Patent Office (EPO) and contains **over 150 million patent documents** from 100+ countries. It's the most comprehensive freely available database.

### What Espacenet Does Best

- **Global coverage:** the largest database, with documents from 100+ countries
- **CPC (Cooperative Patent Classification):** a more granular classification system than IPC, used jointly by USPTO and EPO
- **Legal status:** status of each document (active, expired, rejected, abandoned) when available
- **Citation tree:** shows which documents cite and are cited by each patent — essential for FTO analysis
- **Patent families:** automatically groups all equivalent documents (filed in different countries for the same invention)
- **Machine translation:** integrated translation for Chinese, Japanese, Korean, Russian documents

### How to Use Espacenet

Two main search modes:

1. **Smart search:** single field accepting free text, document numbers, classifiers, applicants
2. **Advanced search:** separated fields (title, abstract, applicant, inventor, publication number, priority date, CPC/IPC classification)

**Practical tip:** use **CPC classification** for more precise searches. While IPC is the international standard, CPC is more detailed and updated more frequently. To find the right CPC code for your technology, use the [CPC Scheme](https://worldwide.espacenet.com/classification) integrated into Espacenet.

**Patent family search:** enter a priority number (e.g., BR102022000000) and Espacenet returns all patents in the same family — applications in Brazil, US, Europe, China, etc. This is especially useful for:

- Checking which markets an invention was filed in
- Finding the English version of an originally Chinese document
- Evaluating a competitor's international strategy

### Limitations

- Web interface can be slow for complex searches
- Data coverage for non-PCT/Paris Convention countries is less consistent
- No dedicated biological sequence search tool (use PATENTSCOPE)

## Google Patents — The Simplest Tool

[Google Patents](https://patents.google.com/) is the newest and, in many ways, the most user-friendly of the three. It indexes over **120 million documents** and uses Google's search engine.

### What Google Patents Does Best

- **Familiar interface:** the search box works like regular Google — type what you're looking for
- **Relevance ranking:** unlike PATENTSCOPE and Espacenet (which sort by date), Google sorts by relevance
- **Machine translation:** excellent integration with Google Translate for patents in any language
- **Bulk download:** results can be downloaded as CSV for offline analysis
- **Stemming and synonyms:** Google automatically expands your search to related terms — increases recall but may reduce precision
- **Prior art finder:** experimental tool that identifies the most relevant prior art for a patent text

### When to Use Google Patents

- **Quick exploratory searches:** "quantum computing error correction" — Google understands intent
- **Finding the original patent for a product:** Google understands natural language descriptions
- **Citation analysis:** also shows citations and cited-by
- **Translation:** translation feature is superior to Espacenet

### Limitations

- **Limited advanced filters:** advanced search is basic compared to Espacenet
- **No browsable CPC classification:** classification search exists but interface is less robust
- **Legal data may be outdated:** patent status can be stale for some countries
- **Inconsistent coverage for smaller countries:** data from developing-country offices may be incomplete

## Comparison Table

| Feature | PATENTSCOPE (WIPO) | Espacenet (EPO) | Google Patents |
|---------|-------------------|-----------------|----------------|
| Documents indexed | ~80 million | ~150 million | ~120 million |
| Geographic coverage | 70+ countries | 100+ countries | 100+ countries |
| Classification | IPC | IPC + CPC | IPC + CPC |
| Portuguese interface | Yes | No (EN/FR/DE) | Yes (translated) |
| Biological sequence search | Yes | No | No |
| Patent families | Yes | Yes | Yes |
| Legal information | Basic | Detailed | Limited |
| Default sorting | Date | Date | Relevance |
| Bulk download | Yes (up to 10K) | Limited | Yes (CSV) |
| Public API | Yes (REST) | Yes (OPS) | Yes |
| Best for | PCT search, biotech | FTO, families, citations | Quick exploration, translation |

## Recommended Strategy: The Three-Layer Workflow

For a complete prior art search, follow this workflow:

### Layer 1: Google Patents (exploration)

Start with Google Patents to understand the landscape. Enter keywords related to your technology, browse the most relevant results, identify the main applicants and classifications. This stage serves to **map the vocabulary** and find the first reference documents.

### Layer 2: Espacenet (deep dive)

Take the document numbers and classifications found in Google to Espacenet. Use the **citation tree** to find earlier and later documents. Explore **patent families** to see where the same invention was filed. Check the **legal status** of each document.

### Layer 3: PATENTSCOPE (PCT validation)

Complement with PATENTSCOPE, especially if your technology has potential for international filing via PCT. Use **advanced search** combining IPC classifiers + keywords to ensure no relevant PCT application escaped.

### Search Checklist

- [ ] Identified keywords in Portuguese and English
- [ ] Found relevant IPC/CPC classifications
- [ ] Searched Google Patents (exploration)
- [ ] Searched Espacenet (citations + families + status)
- [ ] Searched PATENTSCOPE (PCT validation)
- [ ] Verified equivalent patent families
- [ ] Cross-referenced results across all three databases
- [ ] Documented all findings (including what was not found)

## Quick Reference: When to Use Each Tool

| Situation | Tool | Reason |
|----------|------|--------|
| First exploratory search | Google Patents | Simple interface, relevance sorting |
| Complete prior art search | Espacenet + PATENTSCOPE | Global coverage + legal data |
| Freedom-to-operate (FTO) | Espacenet | Best legal and citation information |
| Biotech patent search | PATENTSCOPE | Only one with biological sequence search |
| International competitor's patents | Espacenet | Grouped patent families |
| Chinese/Japanese technology | Google Patents | Best machine translation |
| PCT application | PATENTSCOPE | Official PCT database |
| Trend report data | PATENTSCOPE | Bulk metadata download |

## Conclusion

Patent searching is not a single-tool activity. Each database has its strengths, and the best strategy is to **combine them complementarily**. Google Patents is the fastest starting point, Espacenet is the most complete for technical and legal deep dives, and PATENTSCOPE is essential for anyone in the PCT system and for fields like biotechnology.

Once you've mastered the international tools, you can return to the INPI database to check the local situation — see the complete step-by-step guide for the Brazilian database.

Read also:

- [International Patent Classification (IPC): Practical Guide]({{< relref "posts/classificacao-internacional-patentes-ipc-guia-brasil/" >}})
- [Types of Intellectual Property Protection in Brazil: Complete Comparative Guide]({{< relref "posts/tipos-protecao-intelectual-brasil-guia-completo/" >}})

---

Get in touch to discuss this and other topics at <contact@lucasaguiar.xyz>
