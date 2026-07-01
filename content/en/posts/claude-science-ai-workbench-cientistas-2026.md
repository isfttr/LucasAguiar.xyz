---
date: 2026-06-30T22:00:00.000Z
draft: true
title: 'Anthropic launches Claude Science: an AI workbench for scientists [2026]'
description: Anthropic introduced Claude Science, an integrated research environment with over 60 pre-configured scientific skills, reproducible artifacts, and HPC computing support — in public beta for Pro, Max, Team, and Enterprise users starting today.
featured_image: ''
categories:
  - article
tags:
  - ia
  - pesquisa-cientifica
  - anthropic
  - tecnologia
  - inovacao
  - genomica
  - proteinas
translation_source_hash: 24182845f662eee21229514e2471ad77beeb3257314f3bcdb7a1df42a6303e5e
---
Anthropic today launched **Claude Science**, an AI workbench designed specifically for scientists and researchers. The announcement came with the release of Claude Sonnet 5, solidifying the day as one of the company's biggest in 2026.

Available in public beta for Pro, Max, Team, and Enterprise plan subscribers, Claude Science promises to unify the fragmented ecosystem of scientific research tools into a single AI-controlled environment.

## The problem Claude Science solves

Scientific researchers deal with dozens of data sources — each with its own schema and query language —, file formats that require specific pipelines and viewers, and an arsenal of tools that includes PubMed, Jupyter, R, and cluster terminals. Moving between these systems consumes time and introduces error.

Claude Science consolidates these tools into a single environment where scientists can conduct all stages of their work: from literature analysis to multi-step research execution, through the production of artifacts, figures, and publication-ready manuscripts.

## How it works

The user interacts with a **generalist coordinating agent** that has access to more than 60 pre-configured skills and connectors for areas such as:

- Genomics
- Single-cell
- Proteomics
- Structural biology
- Computational chemistry

These agents can create specialized sub-agents and interact with agents created by the users themselves. A dedicated **reviewer agent** checks citations and calculations, automatically flagging and correcting errors.

### Rich and fully reproducible scientific artifacts

Claude Science generates figures and manuscripts along with the code that produced them. It natively renders complex scientific artifacts, including:

- 3D protein structures
- Genome browser tracks
- Chemical structures

Each generated figure comes with the exact code, the environment description, a natural language explanation of how it was created, and the full conversation history. The user can request changes in natural language — "remove grid lines" or "change axis to log scale" — and the agent edits its own code.

### Smart computation management

Large-scale analyses — such as protein folding or genomic pipelines on massive datasets — require cluster job setup, completion verification, and results collection. Claude Science automates this process:

1. Develops a plan
2. Requests authorization before accessing new resources
3. Allows reviewing or revoking any decision
4. Submits the job to the computing resources the lab already uses (HPC via SSH or Modal for on-demand computing)
5. Scales from a single GPU to hundreds as needed

Because agents work within an active session that maintains context in memory, massive datasets only need to be loaded once. And everything runs on the lab's own infrastructure — laptop, Linux server, or HPC login node — without sensitive data needing to leave the systems where it already resides.

### Connectivity with scientific ecosystems

Claude Science uses the skills of the **NVIDIA BioNeMo Agent Toolkit** to natively connect to models and libraries such as **Evo 2**, **Boltz-2**, and **OpenFold3**. Researchers can also connect their own models, datasets, and pipelines, saving any workflow as a reusable skill.

## Real-world use cases (closed beta)

During the closed beta months, Claude Science was tested by research institutions with significant results:

**Manifold Bio** — a startup that develops tissue-specific targeted drugs — used Claude Science to name targets for its latest experiments. For each tissue and target, the system evaluated surface expression, trafficking, and safety, ranking candidates against the criteria developed by the company. The differentiation, according to Manifold, was the ability to do this end-to-end.

**Jérôme Lecoq**, a neuroscientist at the Allen Institute, used Claude Science to build a "computational review template" with about 20 customized skills. The system reads thousands of articles, extracts central theses and quantitative findings, and produces reviews over 100 pages long. What once took up to two years to write is now done in a fraction of the time — Lecoq has already produced about 10 reviews.

**Stephen Francis**, associate professor and epidemiologist at the UCSF Brain Tumor Center, used Claude Science for studies on the molecular epidemiology of glioma. His lab was able to perform comprehensive germline analyses in approximately **one-tenth of the previous time**, with independently validated results.

## Availability and pricing

- **Plans:** Pro, Max, Team, and Enterprise (Teams and Enterprises require admin enablement)
- **Platforms:** macOS and Linux (local or remote via SSH/HPC)
- **Academic discount:** Team plans with special pricing for active labs at academic institutions and non-profit research organizations
- **Support program:** Up to 50 "AI for Science" projects with up to US$ 30,000 in credits (Modal offers up to US$ 2,000 in additional computing for selected projects)
- **Applications** open until July 15, 2026, with notification by July 31. Projects run from September 1 to December 1, 2026.

---

Read also:

- [Inside AI Brains: How Anthropic Deciphered Claude's Thought Process]({{< relref "posts/anthropic-thinking-process-paper/" >}})
- [Claude Tag and the risk to corporate intellectual property]({{< relref "posts/claude-tag-propriedade-intelectual-empresarial/" >}})
- [What Are Proteins and Why Is AI-Powered Protein Sequencing a Game Changer?]({{< relref "posts/ai-powered-protein-sequencing/" >}})

---

You can get in touch to discuss this and other topics via email <contact@lucasaguiar.xyz>
