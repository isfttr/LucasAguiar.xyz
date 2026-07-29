---
date: 2026-07-29T14:10:00.000Z
draft: true
title: 'International Patent Search: Complete Guide to PATENTSCOPE, Espacenet and Google Patents [2026]'
description: 'Complete guide to international patent search: PATENTSCOPE from WIPO, Espacenet from EPO, and Google Patents. Comparison of tools, search strategies, and practical tips.'
featured_image: ''
categories:
  - article
tags:
  - patentes
  - busca-de-anterioridade
  - wipo
  - propriedade-intelectual
  - guia
  - inovacao
slug: patentscope-espacenet-google-patents-guide-2026
translation_source_hash: fcfb604539470c7d2c9af475caa767c2cf891e0cbd2e5a0e3d6393c959dfcc79
---
You already know how to search patents in the INPI database. But did you know that international databases contain more than **120 million patent documents** — including applications filed in the United States, Europe, China, Japan, South Korea, and through the PCT system — and that most of them can be accessed for free?

It is estimated that **70% of the technical information contained in patents is not published anywhere else**. Ignoring international databases means losing access to a significant portion of the global state of the art — and, depending on the technological field, risking filing a patent application that was already anticipated by a document published on the other side of the world.

This guide covers the **three main free international patent search tools**: PATENTSCOPE (WIPO), Espacenet (EPO), and Google Patents. You will understand when to use each one, how to perform advanced searches, and which strategies to adopt to find what really matters.

## Why search beyond INPI?

The INPI database contains applications filed in Brazil — essential for prior art analysis in the Brazilian market. However, for a **robust prior art search**, you need to cover:

| Scenario | Why search internationally |
|---------|-----------------------------------|
| Filing a patent in Brazil | The state of the art is global — a Chinese or American document may anticipate your invention |
| Competitor analysis | Competitors file in the largest markets (USPTO, EPO, CNIPA, JPO) |
| Public domain technology | Expired patents or those not filed in Brazil can be freely used |
| Technological trends | Global data shows where innovation is heading (see {{< relref "posts/mapa-global-patentes-pct-2025-brasil/" >}}) |
| Product clearance (FTO) | Before launching, it is necessary to check patents in force in the markets of interest |

Each international tool has different strengths. The choice depends on what you need to find.

## PATENTSCOPE (WIPO) — The Global PCT Database

[PATENTSCOPE](https://patentscope.wipo.int/) is the database maintained by the World Intellectual Property Organization (WIPO). Originally focused on international applications filed under the Patent Cooperation Treaty (PCT), it now also incorporates documents from more than **70 countries and regional offices**.

### What PATENTSCOPE offers best

- **Central collection:** all published PCT applications (~4 million) — the largest source of unified international applications
- **National collections:** data from INPI (Brazil), USPTO (USA), CNIPA (China), EPO, JPO (Japan), KIPO (South Korea), and dozens of other offices
- **Biological sequence search:** specialized tool for searching nucleotide and amino acid sequences in biotechnological patents
- **Portuguese interface:** WIPO maintains a complete interface translation into Brazilian Portuguese
- **CLIR (Cross-Lingual Information Retrieval):** allows searching in one language and finding documents in others — useful for finding Chinese and Japanese patents without translation
- **Batch download:** you can download up to 10,000 documents at once

### How to perform an effective search

PATENTSCOPE offers three search modes:

| Mode | Description | When to use |
|------|-----------|-------------|
| **Basic** | Single free-text field | First contact, exploratory searches |
| **Advanced** | Combined fields (title, abstract, applicant, inventor, IPC, date) | Structured search with boolean operators |
| **Field combination** | Visual interface with separate fields | Users who prefer forms over commands |

**Supported boolean operators:** `AND`, `OR`, `NOT`, `near`, `adj`, phrases in quotes `"exact"`.

Advanced search example:
```
EN_TI:("solar cell" OR "photovoltaic") AND EN_AB:(silicon) AND IC_H:(H01L)
```

This returns patents with "solar cell" or "photovoltaic" in the title, "silicon" in the abstract, and classification H01L (semiconductor devices).

### Limitations

- The search parser has peculiarities — operators must be in UPPERCASE
- The quality of national field searches varies by originating office
- No citation index as robust as Espacenet

## Espacenet (EPO) — The Largest Global Patent Collection

[Espacenet](https://worldwide.espacenet.com/) is maintained by the European Patent Office (EPO) and contains **more than 150 million patent documents** from 100+ countries. It is the most complete database available for free.

### What Espacenet offers best

- **Global coverage:** the largest database, with documents from over 100 countries
- **CPC classification (Cooperative Patent Classification):** more granular classification system than IPC, used jointly by USPTO and EPO
- **Legal information:** status of each document (in force, expired, rejected, abandoned) when available
- **Citation tree:** shows which documents cite and are cited by each patent — essential for product clearance (FTO)
- **Patent families:** automatically groups all equivalent documents (filed in different countries for the same invention)
- **Machine translation:** integration with translation systems for documents in Chinese, Japanese, Korean, Russian

### How to use Espacenet

The search has two main modes:

1. **Smart search:** single field accepting free text, document numbers, classifiers, applicants
2. **Advanced search:** form with separate fields (title, abstract, applicant, inventor, publication number, priority date, CPC/IPC classification)

**Practical tip:** use **CPC classification** for more precise searches. While IPC is a standardized international classification, CPC is more detailed and updated more frequently. To find the CPC code for your technology, use the [CPC Scheme](https://worldwide.espacenet.com/classification) integrated into Espacenet itself.

**Patent family search:** enter the priority number (e.g., BR102022000000) and Espacenet returns all patents in the same family — applications in Brazil, USA, Europe, China, etc. This is especially useful for:

- Checking in which markets an invention was filed
- Finding the English version of a document originally in Chinese
- Evaluating a competitor's international strategy

### Limitations

- The web interface can be slow for complex searches
- Data coverage for countries outside the PCT and Paris Convention is less consistent
- No dedicated biological sequence search tool (use PATENTSCOPE)

## Google Patents — The Simplest Tool

[Google Patents](https://patents.google.com/) is the newest and, in many ways, the most user-friendly of the three. It indexes over **120 million documents** and uses Google's search engine.

### What Google Patents offers best

- **Familiar interface:** the search field works like traditional Google — you type what you're looking for and it understands
- **Relevance ranking:** unlike PATENTSCOPE and Espacenet, which sort by date, Google sorts by relevance (like web search)
- **Machine translation:** excellent integration with Google Translate for patents in any language
- **Bulk download:** you can download results as CSV for offline analysis
- **Automatic stemming and synonyms:** Google expands your search to related terms, increasing recall (but may reduce precision)
- **Prior art finder:** experimental tool that identifies the most relevant prior art for a patent text

### When to use Google Patents

- **Quick exploratory searches:** "quantum computing error correction" — Google understands the intent
- **Finding the original patent of a product or technology:** Google understands natural language
- **Citation analysis:** Google Patents also shows citations and what cites it
- **Translation:** the translation feature is superior to Espacenet's

### Limitations

- **Few advanced filters:** advanced search is limited compared to Espacenet
- **No navigable CPC classification:** classification search exists, but the interface is less robust
- **Inaccurate legal data:** legal status may be outdated for some countries
- **Inconsistent coverage for smaller countries:** offices in developing countries may have incomplete data

## Comparative Table

| Feature | PATENTSCOPE (WIPO) | Espacenet (EPO) | Google Patents |
|---------------|-------------------|-----------------|-----------------|
| Indexed documents | ~80 million | ~150 million | ~120 million |
| Geographic coverage | 70+ countries | 100+ countries | 100+ countries |
| Classification | IPC | IPC + CPC | IPC + CPC |
| Portuguese interface | Yes | No (EN/FR/DE) | Yes (translated) |
| Biological sequence search | Yes | No | No |
| Patent families | Yes | Yes | Yes |
| Legal information | Basic | Detailed | Limited |
| Sorting | Date (default) | Date (default) | Relevance (default) |
| Batch download | Yes (up to 10K) | Limited | Yes (CSV) |
| Public API | Yes (REST) | Yes (OPS) | Yes |
| Ideal for | PCT search, biotech | FTO, families, citations | Quick exploration, translation |

## Recommended Strategy: The Three-Layer Flow

For a complete prior art search, follow this flow:

### First layer: Google Patents (exploration)

Start with Google Patents to understand the landscape. Type keywords related to your technology, see the most relevant results, identify the main applicants and classifications. This step serves to **map the vocabulary** and find the first reference documents.

### Second layer: Espacenet (deep dive)

Take the document numbers and classifications found on Google to Espacenet. Use the **citation tree** to find prior and subsequent documents. Explore **patent families** to see where the same invention was filed. Check the **legal status** of each document.

### Third layer: PATENTSCOPE (PCT validation)

Supplement the search on PATENTSCOPE, especially if your technology has potential for international filing via PCT. Use **advanced search** with a combination of IPC classifier + keywords to ensure no relevant PCT application has been missed.

### Search checklist

- [ ] Identified keywords in Portuguese and English
- [ ] Found relevant IPC/CPC classifications
- [ ] Searched Google Patents (exploration)
- [ ] Searched Espacenet (citations + families + status)
- [ ] Searched PATENTSCOPE (PCT validation)
- [ ] Checked equivalent patent families
- [ ] Cross-referenced results across the three databases
- [ ] Documented the results found (including what was not found)

## When to Use Each Tool (Quick Summary)

| Situation | Tool | Reason |
|----------|------------|--------|
| First exploratory search | Google Patents | Simple interface, relevance ranking |
| Complete prior art search | Espacenet + PATENTSCOPE | Global coverage + legal data |
| Product clearance (FTO) | Espacenet | Best legal and citation information |
| Biotech patent search | PATENTSCOPE | Only one with biological sequence search |
| International competitor patents | Espacenet | Grouped patent families |
| Chinese/Japanese technology | Google Patents | Best machine translation |
| PCT application | PATENTSCOPE | Official PCT database |
| Data for trend report | PATENTSCOPE | Batch download of metadata |

## Conclusion

Patent search is not a single-tool activity. Each database has its strengths, and the best strategy is to **combine them complementarily**. Google Patents is the fastest starting point, Espacenet is the most complete database for technical and legal deep dives, and PATENTSCOPE is indispensable for those in the PCT system and for areas like biotechnology.

After mastering international tools, you can return to INPI to check the local situation — see the {{< relref "posts/busca-patentes-inpi-guia-pratico/" >}} for the complete step-by-step guide in the Brazilian database.

Also read:

- [The Global Innovation Map in 2025: Who Is Patenting What?]({{< relref "posts/mapa-global-patentes-pct-2025-brasil/" >}})
- [Patent Search at INPI: Step-by-Step Practical Guide [2026]]({{< relref "posts/busca-patentes-inpi-guia-pratico/" >}})
- [The Global Innovation Map in 2025: Who Is Patenting What?]({{< relref "posts/mapa-global-patentes-pct-2025-brasil/" >}})

---

Feel free to get in touch to discuss this and other topics via email at <contact@lucasaguiar.xyz>
