---
date: 2026-07-20T14:00:00.000Z
draft: true
title: 'Patent Search at INPI: Practical Step-by-Step Guide [2026]'
description: 'Complete guide to conducting patent searches in the INPI database: system access, basic and advanced search, IPC classification, interpreting results, and tips for finding prior art.'
featured_image: ''
categories:
  - article
tags:
  - patentes
  - inpi
  - guia
  - busca-de-anterioridade
  - propriedade-intelectual
  - classificacao-ipc
slug: patent-search-inpi-step-by-step-guide
translation_source_hash: fdf898b415d8b0f899fff0042e7c3ca89ecd35cb490abfb52d9fbd9fbec90b2f
---
With over 37,000 new generative artificial intelligence patent families published in 2024 and 2025 — according to the latest WIPO data — knowing how to **search patents** is no longer a skill exclusive to IP specialists. It is a strategic competency for innovation professionals, researchers, startups, and industries across all sectors.

The INPI patent database is the largest public repository of technological information in Brazil. It is estimated that **70% of the technical information contained in patents is not published in any other medium** — journals, books, or conference proceedings. Knowing how to navigate this database can prevent your company from reinvesting resources in something already patented, reveal competitors' technological trends, and locate public domain technologies that can be freely used.

This guide covers **everything you need to know to search patents at INPI**: from accessing the system to interpreting results, including basic and advanced search fields, IPC classification, and practical tips.

## When to Conduct a Patent Search

Patent search is not only useful for verifying if your invention is new. It is helpful in several situations:

| Scenario | Search Type | Objective |
|----------|-------------|-----------|
| Before filing a patent application | Prior art search (state of the art) | Check if the invention has already been disclosed |
| Before launching a product on the market | Freedom to operate (FTO) | Check if the product infringes third-party patents |
| During strategic R&D planning | Technology mapping | Identify trends, competitors, and gaps |
| To use already available technology | Search for expired or public domain patents | Identify technologies free of encumbrances |
| In judicial or administrative proceedings | Invalidity search or examination subsidies | Find prior art to challenge patents |

## Accessing the INPI Patent Database

The INPI patent query platform is available at:

**[https://busca.inpi.gov.br/pePI](https://busca.inpi.gov.br/pePI)**

No login is required for basic searches. Click **"Continuar"** on the login screen to access as a guest. Registration is only mandatory for those who need to download full documents or use specific functionalities.

On the homepage, click the **"Patente"** icon (blue light bulb, upper right side of the panel) to enter the patent database.

> ⚠️ The INPI database contains documents published **from the year 2000 onwards**. For earlier searches, use international databases such as [WIPO Patentscope](https://patentscope.wipo.int) or [Google Patents](https://patents.google.com).

## Basic Search

The basic search page ("Pesquisa Básica") is the first screen after selecting the patent database. It offers straightforward fields for quick searches:

### Search by Number

| Field | Description |
|-------|-------------|
| **Application No. (21)** | Patent application number (e.g., BR 10 2020 123456 7) |
| **GRU No.** | Union collection number for fee payment |
| **Protocol No.** | Electronic petitioning protocol number |

These fields are useful when you already know the process number — for example, to check the status of your own or a competitor's application.

### Text Search

Text search allows you to search by keywords with four combination modes:

1. **all words** — returns results containing all terms (logical AND)
2. **the exact phrase** — searches the entire phrase in quotation marks, in exact order
3. **any of the words** — returns results with at least one of the terms (logical OR)
4. **the approximate word** — searches for similar terms (roots, plurals, spelling variations)

The fields where the search can be applied:

- **Title** — field (54) of the patent application
- **Abstract** — field (57), contains the technical summary of the invention
- **Applicant Name** — who files the application (individual or legal entity)
- **Inventor Name** — the creator(s) of the invention
- **Applicant CPF/CNPJ** — for precise searches by legal entity

> 💡 **Tip:** for prior art searches, prefer **"all words"** in the **Title** or **Abstract** field. Start with broad terms and refine. Use **"the approximate word"** to capture variations — for example, searching for "biotecnologi" will find "biotecnologia" and "biotecnológico".

## Advanced Search

The advanced search offers much more control. Access it via the **"Pesquisa Avançada"** link at the top of the page. It is organized into expandable sections:

### Numbers

In addition to the application number (21) already available in basic search, the advanced search offers:

- **Calendar of expired/expiring patents** — select this option to locate patents that have already fallen or are about to fall into the public domain
- **Granted Patent** — filter only applications that have already been granted
- **Country/Priority No. (33/31)** — search by the country and number of the unionist priority (Paris Convention)
- **PCT Filing No. (86)** — for international applications that entered the national phase in Brazil

### IPC Classification

The International Patent Classification (IPC) is a hierarchical system that organizes technologies into letters and numbers:

- **IPC Classification (51)** — enter the IPC code directly (e.g., "H04L 9/00" for cryptography, "G06N 20/00" for machine learning)
- **Keyword in IPC classifier** — search by keywords within the IPC classification description (e.g., "inteligência artificial" to find related IPC classes)

> 📚 **See also:** [Guide to International Patent Classification (IPC) in Brazil]({{< relref "posts/classificacao-internacional-patentes-ipc-guia-brasil/" >}}) — complete explanation of the IPC system and how to navigate the classes.

### Keyword

- **Title (54)** — same field as basic search, but with additional operators
- **Abstract (57)** — search in the patent abstract

### Applicant / Owner / Inventor

- **Applicant/Owner Name (71/73)** — search by individual or legal entity that filed or owns the application
- **Applicant CPF/CNPJ** — exact search by document
- **Inventor Name (72)** — search by inventor name

> 💡 **Tip:** to monitor competitors, search by the company's **CNPJ** in the Applicant field and save the query. Use the **Inventor Name** search to identify the main researchers in a technological area.

## Interpreting Results

After clicking **"pesquisar"**, the system displays a list of results. Each line contains:

- **Application No.** — the unique identifier
- **Title** — the invention title
- **Applicant** — application owner
- **Filing Date** — when the application was filed
- **Status** — whether under examination, granted, archived, etc.

To see full details, click on the application number. The detail page displays:

1. **Bibliographic data** — all information from the filing form
2. **Descriptive report** — the complete description of the invention
3. **Claims** — the scope of intended protection
4. **Drawings** — technical figures (if any)
5. **Progress history** — all dispatches published in the RPI

> ⚠️ To download PDF documents, you need to **log in** to the system (free account creation).

## Tips for Effective Searches

### 1. Use Field Combinations

Advanced search allows filling multiple fields simultaneously. For example, to find generative AI patents in healthcare filed by Brazilian universities:

- **Title:** "inteligência artificial" (exact phrase)
- **IPC Classification:** "G06N" (neural network category)
- **Applicant:** "universidade" or "UF" (to filter by ICTs)
- **Status:** check "Granted Patent"

### 2. Know Relevant IPC Codes

| Technology | Main IPC Code |
|------------|---------------|
| Artificial Intelligence / Machine Learning | G06N |
| Electrical Communication / Networks | H04L |
| Pharmaceuticals | A61K |
| Biotechnology | C12N |
| Semiconductors | H01L |
| Image Processing | G06T |
| Electric Vehicles | B60L |

### 3. Use International Databases in Parallel

INPI does not cover the entire global prior art. For complete prior art searches, also consult:

- **[WIPO Patentscope](https://patentscope.wipo.int)** — international database with over 100 million documents, including PCT applications and national databases from various countries. Offers full-text search and IPC code search.
- **[Google Patents](https://patents.google.com)** — modern interface, multilingual search, and integration with machine translation. Ideal for quick scans.
- **[Espacenet](https://worldwide.espacenet.com)** — European Patent Office (EPO) database, with over 140 million documents and complementary CPC classification alongside IPC.

### 4. Search in Both English and Portuguese

Many patents filed in Brazil have titles and abstracts only in Portuguese, but the priority documents (original applications) may be in English, Japanese, or Chinese. For INPI searches, use Portuguese terms. For Patentscope or Google Patents searches, use English.

### 5. Take Advantage of the Public Domain

The **"Calendar of expired/expiring patents"** option in advanced search is an underutilized tool. It allows identifying technologies that can already be freely used — excellent for startups seeking technological foundations for new products.

## Limitations of the INPI Database

It is important to be aware of the limitations:

- **Coverage from 2000 onwards** — earlier documents must be consulted in other databases
- **No full-text search** — INPI does not index the full descriptive report, only title and abstract
- **Outdated interface** — the pePI system uses legacy technology (Apache Tomcat 6, JSP), which may cause instability during peak hours
- **Data may be outdated** — there is a delay between publication in the RPI and update in the search database

The **new Patent Services Module** (under implementation since 2025) promises to modernize the experience, including exclusive electronic filing and integration with the GRU system. The new version (August 2026) should bring gradual improvements to the search.

> 📚 **See also:** [INPI launches new version of the Patent Module: what changes in 2026]({{< relref "posts/inpi-modulo-servicos-patentes-novas-funcionalidades-2026/" >}}) — details about the new patent services system.

## Practical Roadmap: Prior Art Search in 5 Steps

If you are about to file a patent and want to conduct a **prior art search** (state of the art), follow this roadmap:

1. **Define key terms** — List synonyms and variations of your invention's central concept, in Portuguese and English
2. **Search INPI** — Start with the national database (basic search, "all words" in the title)
3. **Search Patentscope** — Expand to the international database with the same terms in English
4. **Search by IPC classification** — Identify the closest IPC code and search by it
5. **Document the results** — Note the most relevant application numbers and check each one's status (granted, archived, under examination)

> 💡 If the result volume is too large (> 200 documents), refine with field combinations or restrict by date. If it is too small (< 5), broaden the terms or use synonyms.

## Conclusion

Patent searching at INPI — combined with international databases — is an indispensable tool for data-driven innovation. With the rapid growth of patent filings in areas like generative artificial intelligence (nearly 40,000 new families in 2025, according to WIPO), knowing how to navigate these repositories is no longer optional.

The INPI system, despite its technical limitations, offers free access to decades of technological information that can guide R&D decisions, avoid litigation, and reveal innovation opportunities. Mastering basic and advanced search — especially the use of IPC classification and Applicant/Inventor filters — transforms the patent database into a true competitive radar.

To go deeper, also check the guide on [accreditation for prior art patent searches at INPI]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}}), which details the opportunity for professionals who wish to act as outsourced search service providers.

Read also:

- [International Patent Classification (IPC): Practical Guide to Understanding and Using Patent Codes in Brazil [2026]]({{< relref "posts/classificacao-internacional-patentes-ipc-guia-brasil/" >}})
- [INPI launches new version of the Patents Module: what changes in 2026]({{< relref "posts/inpi-modulo-servicos-patentes-novas-funcionalidades-2026/" >}})
- [INPI will pay R$ 1.025 for patent search: accreditation guide [2026]]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}})

---

Feel free to get in touch to discuss this and other topics via email <contact@lucasaguiar.xyz>
