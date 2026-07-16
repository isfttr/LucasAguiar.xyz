---
date: 2026-07-16T14:00:00.000Z
draft: true
title: 'International Patent Classification (IPC): Practical Guide to Understanding and Using Patent Codes in Brazil [2026]'
description: 'Complete guide to the International Patent Classification (IPC): structure of sections A to H, subclasses and groups, difference between IPC and CPC, how to consult patent classifications at INPI and practical examples.'
featured_image: ''
categories:
  - article
tags:
  - patentes
  - inpi
  - propriedade-intelectual
  - wipo
  - guia
  - classificacao
slug: international-patent-classification-guide-brazil
translation_source_hash: c6caf959aabc56dbd792ab834f1712227ca1156f7e9eb16e2ee53063c433203e
---
The International Patent Classification (IPC) is the global system for categorizing patent documents. Established by the 1971 Strasbourg Agreement and administered by the World Intellectual Property Organization (WIPO), the IPC allows examiners, inventors, and IP professionals to identify relevant technical documents in over 100 countries.

In Brazil, the INPI uses the IPC as the primary classification system for patent applications. When the Institute announced in July 2026 the resumption of the priority processing track for the symbol **H04** (Electrical Communication Technique), it was referring exactly to an IPC section. Similarly, the global generative artificial intelligence patent data released by WIPO in 2026 — which shows that the number of GenAI patent families jumped from 14,000 (2023) to 37,800 (2025) — uses the IPC and CPC classification to define what constitutes an "AI patent."

This guide explains the IPC structure, how codes are built, how to look up patent classifications in Brazil, and how to use this knowledge for prior art searches.

## What is the International Patent Classification

The IPC is a taxonomic hierarchy that organizes all technology into approximately 70,000 subdivisions. Each patent document receives one or more IPC codes that describe the technical field to which the invention belongs.

The system has two main functions:

1. **Information retrieval** — allows finding patents on a specific technical topic without relying solely on keywords
2. **Examination organization** — INPI examiners use the IPC to route each application to the competent technical area

Unlike textual keywords (which vary by language, synonyms, and translations), the IPC is a globally standardized hierarchical numeric code. A patent classified as **H04L 9/40** will be found regardless of whether the applicant uses the terms "segurança de rede," "network security," or "sécurité réseau."

## Hierarchical Structure of the IPC

The IPC has five hierarchical levels, from the most general to the most specific:

```
Section (1 letter)    →  H
Class (2 numbers)     →  H04
Subclass (1 letter)   →  H04L
Main group            →  H04L 9/00
Subgroup              →  H04L 9/40
```

### 1. Sections (A to H)

The eight sections cover the entire technological spectrum:

| Section | Description | Examples of classification |
|---------|-------------|----------------------------|
| **A** | Human Necessities | Agriculture, health, food |
| **B** | Performing Operations; Transporting | Separation, mixing, printing |
| **C** | Chemistry; Metallurgy | Organic compounds, polymers, pharmaceuticals |
| **D** | Textiles; Paper | Spinning, weaving, paper treatment |
| **E** | Fixed Constructions | Buildings, roads, doors |
| **F** | Mechanical Engineering; Lighting; Heating; Weapons; Blasting | Engines, pumps, turbines |
| **G** | Physics | Computing (G06), measuring instruments, cryptography |
| **H** | Electricity | Communication (H04), circuits, electrical power |

### 2. Class (2 digits)

Within each section, classes are identified by two digits:

- **A01** — Agriculture; forestry; animal husbandry
- **C07** — Organic chemistry
- **G06** — Computing; data processing
- **H04** — Electrical communication technique

### 3. Subclass (1 letter)

The subclass adds an uppercase letter:

- **H04L** — Transmission of digital information
- **G06N** — Computer systems based on specific computational models (includes AI and machine learning)
- **A01H** — New plants or processes for obtaining them

### 4. Group (numbers, slash)

The group is identified by a 1-to-3-digit number, followed by a slash and a subgroup number:

- **H04L 9/00** — Arrangements for secret or secure communication
- **G06N 20/00** — Machine learning
- **H04L 9/40** — Network security

## IPC vs. CPC: Understand the Difference

The **CPC (Cooperative Patent Classification)** is a more detailed system, developed in partnership by the USPTO and EPO, and used by over 40 offices, including the INPI in some contexts. The CPC expands the IPC with additional subdivisions.

| Feature | IPC | CPC |
|---|---|---|
| Administration | WIPO | USPTO + EPO |
| Number of entries | ~70,000 | ~250,000 |
| Revision | Annual (official version) | Continuous |
| Use in Brazil | Primary (INPI) | Secondary (PCT applications) |
| Coverage | 100+ countries | USPTO, EPO, INPI, others |

In practice, the CPC is a **superset** of the IPC: every IPC code has a CPC equivalent, but the CPC adds more granular subdivisions.

For searches at the INPI, the IPC is sufficient in most cases. For international searches (USPTO, Espacenet), the CPC offers more precise results.

## How to Query IPC Classifications at the INPI

The INPI provides access to patent classifications through its search system, available on the [INPI website](https://www.gov.br/inpi/pt-br/servicos/patentes/guia-basico-de-classificacao-de-patentes). The basic steps:

1. Access the **INPI patent search system**
2. In the search field, use the format `IC=(H04L 9/40)` to search by IPC code
   - `IC=` indicates IPC classification
   - Use single or double quotes when the code contains spaces
3. To search for all patents in a subclass, use `IC=(H04L)` without the group
4. Combine with other strategies: `IC=(G06N) AND PA=(UNIVERSIDADE)` to search for AI patents from universities

The INPI also publishes the Portuguese version of the IPC, called **Classificação Internacional de Patentes (CIP)**, based on the official WIPO translation.

To consult the full official IPC (in English), use the [WIPO IPCR Master Classification File](https://www.wipo.int/classifications/ipc/en/).

## Practical Examples with Today's News

### H04 — Electrical Communication Technique

In July 2026, the INPI resumed acceptance of requests for priority processing for the symbol **H04**, under new per-applicant quota rules. This means that patent applications classified in section H04 — which covers telecommunications, digital transmission, networks, wireless communication, and coding — can once again request prioritization.

Some relevant subclasses of H04:

| Code | Description |
|------|-------------|
| H04B | Transmission |
| H04L | Transmission of digital information |
| H04W | Wireless communication networks |
| H04N | Image transmission; television |
| H04M | Telephonic communication |

If you file patents in the telecommunications field, check whether your application is classified in H04 and consider requesting priority processing. See the [complete guide to priority patent processing at the INPI]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}}) for details on costs, modalities, and documents.

### G06 — Computing and Artificial Intelligence

The **G06** classification (Computing; Data Processing) is where most artificial intelligence patents are concentrated. Within it, the following stand out:

| Code | Description |
|------|-------------|
| G06N | Computer systems based on specific models (AI, machine learning) |
| G06N 3/00 | Neural networks |
| G06N 20/00 | Machine learning |
| G06V | Image and video recognition |
| G06F 40/00 | Natural language processing |

WIPO data released in July 2026 shows that generative AI patent families more than doubled in two years. Most of these patents are classified in G06, with significant growth in G06N (neural models) and G06F 40 (language processing). For a complete guide on AI patents in Brazil, see the [guide to generative artificial intelligence patents]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}}).

### A01 — Agriculture

Patents related to agriculture, plant biotechnology, and cultivars are in section **A01**:

| Code | Description |
|------|-------------|
| A01H | New plants or processes for obtaining them |
| A01N | Preservation of human, animal, or plant bodies or products (biocides) |
| A01G | Horticulture; cultivation |

The plant variety protection system in Brazil, regulated by Law 9,456/97, is distinct from the patent system and administered by the Ministry of Agriculture, not the INPI.

## How the INPI Assigns IPC Classifications

The INPI follows WIPO guidelines for patent classification. Each patent application receives:

1. **Main classification (invention information)** — the classification that best describes the claimed invention
2. **Additional classifications (additional information)** — classifications for secondary technical features or search content

At the time of filing, the applicant may suggest classifications, but the INPI may reclassify the application during technical examination based on analysis of the claims.

For those performing [prior art searches]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}}) as accredited professionals, understanding the IPC structure is essential: a poorly directed search due to classification errors may fail to find relevant prior art and compromise the examination.

## IPC Search Strategies

### 1. Expand upward in the hierarchy

If a search in subgroup H04L 9/40 returns few results, expand to group H04L 9/00 (arrangements for secure communication) or to subclass H04L (transmission of digital information).

### 2. Combine IPC with keywords

Use `IC=(H04L 9/00) AND TI=(criptografia OR "blockchain" OR "segurança")` to refine results within a broad classification.

### 3. Use truncation operators

The INPI accepts truncation: `IC=(G06N 3/)` returns all subgroups of G06N 3 (neural networks).

### 4. Consider multiple classifications

A patent may receive multiple IPC classifications. Do not limit your search to a single code — an autonomous vehicle invention, for example, may be classified in **G05D 1/00** (vehicle control), **G06V 20/00** (scene recognition), **H04W 4/00** (mobile communication), and **B60W 60/00** (autonomous driving systems).

## IPC Updates and Versions

The IPC is revised annually by WIPO. The current version as of July 2026 is **IPC 2026.01**, which came into effect on January 1, 2026. Major changes introduced recently include:

- New subclasses in **G06** for emerging AI technologies (neural networks, transformers, foundation models)
- Expansion of **H04W** to cover new generations of wireless networks (6G, NTN — non-terrestrial networks)
- Subdivisions in **A61** for advanced therapies and personalized medicine

To keep up with changes, consult the [WIPO revision calendar](https://www.wipo.int/classifications/ipc/en/preface.html).

## Conclusion

The International Patent Classification is the backbone of searching and organizing technological information in patents. Knowing how to read and use IPC codes is not just a technical skill — it is a strategic tool for:

- **Identifying competitors** — see who is filing in your technical area
- **Mapping trends** — the growth of filings in a specific IPC class reveals the direction of innovation
- **Avoiding infringement** — well-executed searches reduce the risk of violating existing patents
- **Speeding up examination** — correct classifications accelerate processing at the INPI

With the resumption of priority processing for H04 and the explosion of generative AI patents classified in G06, mastering the IPC system has never been more relevant for those working with industrial property in Brazil.

Read also:

- [Complete Guide to Priority Patent Processing at INPI: Modalities, Costs, and How to Apply [2026]]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}})
- [Generative AI Patents in Brazil: Complete Guide to Patenting AI Inventions [2026]]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}})
- [INPI will pay R$ 1.025 for patent search: accreditation guide [2026]]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}})

---

Feel free to get in touch to discuss this and other topics at <contact@lucasaguiar.xyz>
