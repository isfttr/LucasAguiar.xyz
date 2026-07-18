---
date: 2026-07-18T14:09:25.000Z
draft: true
title: 'Software Patent vs Computer Program Registration in Brazil: What''s the Difference? [2026]'
description: Complete guide comparing computer-implemented invention patent and computer program registration at INPI. When to use each, costs, deadlines, legal requirements, and practical decision for startups and developers.
featured_image: ''
categories:
  - article
tags:
  - patentes
  - programa-de-computador
  - inpi
  - propriedade-intelectual
  - software
slug: software-patent-vs-program-registration-brazil-difference
translation_source_hash: 6b58afefb12e5cee484ec9dad8cc1ccccf5ffe048e0feffd696a7fbfd5858335
---
Brazilian developers and startups face a recurring question when protecting their software: should I register the computer program with INPI or try to patent my invention? The confusion is understandable — the two forms of protection coexist in the Brazilian legal system, but operate under completely different regimes.

Computer program registration (Law 9.609/98) protects software as a copyright work, while the patent for a computer-implemented invention (Law 9.279/96 — LPI) protects the technical solution that the software executes. Choosing the wrong path can mean wasting time and resources — or, worse, losing the right to protect your creation.

This guide compares the two alternatives based on current legislation, INPI examination guidelines, and 2026 costs.

## Understanding the fundamental difference

In Brazil, **computer program** (software) is protected by copyright, under Law 9.609/98 (Software Law) and Law 9.610/98 (Copyright Law). Registration with INPI is declaratory — there is no merit examination, only the deposit of a code hash that establishes a time stamp of authorship.

**Computer-implemented inventions** (CII), on the other hand, are a patent category. INPI examines whether the invention meets the requirements of novelty, inventive step, and industrial application (art. 8 of the LPI). The focus is not on the code, but on the **technical effect** that the software produces.

| Aspect | Computer Program Registration | Computer-Implemented Invention Patent |
|---------|-----------------------------------|------------------------------------------------|
| **Legal basis** | Law 9.609/98 + Law 9.610/98 | Law 9.279/96 (LPI) |
| **Nature** | Copyright (declaratory) | Industrial property (granting) |
| **What it protects** | The source code as a literary work | The technical solution executed by the software |
| **Merit examination** | No (only hash registration) | Yes (novelty, inventive step, industrial application) |
| **Protection term** | 50 years from creation date or Jan. 1 of the following year | 20 years from filing date |
| **Cost (INPI fees 2026)** | R$ 85 to R$ 1,400 (code 730) | R$ 130 to R$ 2,500 (filing + examination) |
| **Average time** | 30 to 60 days | 5 to 10 years (depending on backlog) |
| **Examination by INPI** | Automatic | Technical (patent examiner) |

> The values above are the official INPI fees for 2026, varying according to the applicant’s size (individual/MEI = lowest value; large legal entity = highest value). Check the [INPI fee table](https://www.gov.br/inpi/pt-br/servicos/tabela-de-retribuicoes) for exact amounts.

## What Brazilian law says about software patents

Art. 10 of the LPI (Law 9.279/96) lists what is **not considered an invention** nor a utility model:

> Art. 10. The following are not considered inventions or utility models:
> I — discoveries, scientific theories, and mathematical methods;
> II — purely abstract conceptions;
> III — schemes, plans, principles, or commercial, accounting, financial, educational, advertising, lottery, and inspection methods;
> **IV — computer programs per se;**
> (emphasis added)

Item IV is the reason why "pure software" is not patentable in Brazil. However, INPI case law and international practice have consolidated the understanding that **computer-implemented inventions** (CII) are patentable when they produce an **additional technical effect** beyond the mere execution of a program.

### What makes a software invention patentable?

For a computer-implemented invention to be patentable at INPI, three conditions must be met:

1. **Technical effect** — the software must produce a technical result that goes beyond normal data processing. Example: a video compression algorithm that reduces bandwidth usage by 40% is technical; a program that generates financial reports is not.

2. **Concrete technical application** — the invention must be anchored to a specific application. Example: "pattern recognition method in medical images" is concrete; "generic AI system" is not.

3. **Do not claim the program per se** — the claims must be directed to the method, system, or use, never to the source code.

The [generative AI patents blog guide]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}}) details how these criteria apply specifically to artificial intelligence inventions.

## When to use each type of protection

The choice between computer program registration and patent depends on what you want to protect.

### Choose computer program registration when:

- Your goal is to prove **authorship and ownership** of the code in potential disputes
- The software is a **commercial product** (ERP, app, platform) without significant technical innovation
- You need **fast and low-cost protection**
- The software **does not solve a technical problem** — it only automates business processes

### Consider the computer-implemented invention patent when:

- Your software implements an **innovative technical solution** to a technical problem
- You want to **prevent competitors** from using the same solution, even if implemented in different code
- The innovation is in the **algorithm, method, or architecture**, not in the interface or commercial functionality
- You plan to **license the technology** to third parties

A common strategy is to **combine both protections**: register the computer program to protect the authorship of the code and file the patent application to protect the innovative technical solution. The two protections are independent and cumulative.

## The process of each modality

### Computer Program Registration (step by step)

The process is relatively simple and does not require technical examination. See the [complete guide to computer program registration at INPI]({{< relref "posts/guia-registro-programa-computador-inpi/" >}}) for details.

1. **Generate the hash** of the source code (using a refer or SHA-512 hash of the ZIP file)
2. **Issue the GRU** (code 730) in the e-INPI system
3. **Fill out the e-Software form**, attach the code, and pay the fee
4. **Wait for publication** in the RPI (30 to 60 days)
5. **Obtain the digital certificate** of registration

In July 2026, the INPI computer program filing system experienced instability and [resumed operation on July 1st](https://www.gov.br/inpi/pt-br/central-de-conteudo/noticias/sistema-de-peticionamento-de-programa-de-computador-volta-a-funcionar). Users who tried to file between June 20 and 30 and did not receive the final protocol should access the filing area with the GRU number to download it.

### Patent Invention Filing (step by step)

1. **Prior art search** — essential to verify whether the invention already exists. The [patent search accreditation guide]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}}) explains how to do it.

2. **Drafting the application** — descriptive report, claims set, abstract, and drawings (if applicable). For computer-implemented inventions, claims must focus on method, system, or use, never on the code.

3. **Filing** — via the e-Patentes system, with payment of GRU code 200 (filing) or 201 (for individual/MEI with discount)

4. **Formal examination** — INPI checks if the documentation is complete

5. **Publication** — after 18 months from filing (unless a secrecy request is made)

6. **Technical examination** — request for examination (code 203, up to 36 months from filing). INPI analyzes novelty, inventive step, and industrial application

7. **Decision** — grant or rejection

The average grant time at INPI is **5 to 10 years**, although the [priority procedure]({{< relref "posts/guia-tramite-prioritario-patentes-inpi-2026/" >}}) can speed up the process in some situations.

## Comparative costs (INPI fees 2026)

| Service | GRU Code | Individual/MEI | Small legal entity | Large legal entity |
|---------|-----------|--------|-----------------|----------------|
| Computer program registration | 730 | R$ 85 | R$ 340 | R$ 1,400 |
| PI filing | 200/201 | R$ 130 | R$ 510 | R$ 2,500 |
| PI examination (request) | 203 | R$ 140 | R$ 565 | R$ 2,780 |
| PI annuity (first) | Various | ~R$ 170 | ~R$ 685 | ~R$ 3,390 |

The total cost of a patent is significantly higher than computer program registration, considering filing + examination + annual annuities for 20 years. For startups and individuals, INPI offers substantial discounts — the [trademark registration cost guide]({{< relref "posts/quanto-custa-registrar-marca-inpi-2026/" >}}) explains the logic of discounts by size, which applies similarly to patents.

## Trends and global context

The debate on software patents is far from being exclusively Brazilian. In July 2026, WIPO published data showing that [generative AI innovation is accelerating](https://www.wipo.int/pressroom/en/articles/2026/article_0012.html), with patent activity nearly tripling in two years — from 14,000 patent families in 2023 to over 37,800 in 2025. Generative AI already accounts for 8.7% of all AI-related patent publications.

This global movement pressures patent offices — including INPI — to improve their examination guidelines for computer-implemented inventions. In the United States, the USPTO updated its AI patentability guidelines in 2025. In Europe, the EPO maintains consolidated case law on "additional technical effect" as a criterion for patenting software. Brazil, aligned with this trend, has been refining the application of art. 10 of the LPI through resolutions and internal INPI guidelines.

### The case of section H04: priority for telecommunications

In June 2026, INPI [resumed priority processing for patent applications classified under symbol H04](https://www.gov.br/inpi/pt-br/central-de-conteudo/noticias/retoramado-tramite-prioritario-de-patentes-de-tecnica-de-comunicacao-eletrica-h04) (Electrical Communication Technique), which includes computer-implemented inventions in telecommunications, 5G/6G networks, and communication protocols. Each applicant can request one priority application per month for this classification, with an exceptional limit of 2 requests in July 2026. This is an important signal for telecom and connectivity startups that develop innovative software in the area.

## Practical decision framework

| Your situation | Recommendation |
|-------------|-------------|
| Commercial app without technical innovation | Computer program registration |
| Innovative algorithm with industrial application | Patent + computer program registration |
| Business method automated by software | Computer program registration (not patentable) |
| Generative AI architecture with new technical effect | Patent (CII) + computer program registration |
| Early-stage prototype | Computer program registration first; evaluate patent later |
| Software for industrial process (IoT, manufacturing) | Patent (CII) strongly recommended |

## Conclusion

The main difference between a software patent and a computer program registration in Brazil lies in the **object of protection**: registration protects the code as a copyright work; the patent protects the technical solution that the software executes. One does not replace the other — they are complementary.

For most developers and startups, computer program registration is the first step, fast and low-cost. When there is substantial technical innovation — a new compression algorithm, an industrial optimization method, an AI architecture with demonstrable technical effect — the computer-implemented invention patent offers much stronger protection with 20 years of exclusivity.

The decision depends on what you created: if it's a **product**, register the code; if it's a **technical solution**, seek the patent.

For more details on each type of intellectual property protection in Brazil, see the [complete comparative guide to intellectual property types]({{< relref "posts/tipos-protecao-intelectual-brasil-guia-completo/" >}}).

Read also:

- [Generative AI Patents in Brazil: Complete Guide to Patenting AI Inventions [2026]]({{< relref "posts/patentes-inteligencia-artificial-generativa-brasil-guia-2026/" >}})
- [How to Register a Computer Program at the INPI: Complete Step-by-Step Guide [2026]]({{< relref "posts/guia-registro-programa-computador-inpi/" >}})
- [INPI will pay R$ 1.025 for patent search: accreditation guide [2026]]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}})

---

You can contact me to discuss this and other topics at <contact@lucasaguiar.xyz>
