---
date: 2026-07-30T14:00:00.000Z
draft: true
title: 'Artificial Intelligence Patents in Brazil: Complete Guide on Protection of AI Inventions [2026]'
description: 'Complete guide to patenting artificial intelligence in Brazil: what is patentable, INPI requirements, IPC classifications, how to draft the application, and differences between software, algorithm, and AI invention. Includes WIPO 2026 data.'
featured_image: ''
categories:
  - article
tags:
  - patentes
  - inpi
  - inteligencia-artificial
  - wipo
  - inovacao
  - guia
  - tecnologia
slug: artificial-intelligence-patents-brazil-guide
translation_source_hash: ae46019decfe31cbb2d61f4b4c9da42e28aaa81de22cf33ec1ceab60f2f13977
---
Artificial intelligence-based inventions represent the most dynamic frontier of industrial property today. According to WIPO data published in July 2026, the number of generative AI (GenAI) patent families jumped from approximately 14,000 in 2023 to more than 37,800 in 2025 — an average growth of 64% per year. More than 56,000 new GenAI patent families were published in 2024 and 2025 alone, surpassing the total for the entire previous decade (2014-2023).

This growth raises a practical question for inventors, startups, and companies in Brazil: **how to legally protect an artificial intelligence invention?** The answer is not trivial, because patent law was designed for tangible inventions, and AI presents specific classification challenges.

This guide covers the legal requirements, INPI's positions, the relevant international classifications, the step-by-step filing process, and the differences between protecting an algorithm, an AI model, and a concrete application.

---

## What the LPI says about AI patents

The Industrial Property Law (Law No. 9.279/96) does not explicitly mention artificial intelligence — which is expected, given that the law is from 1996. But it defines in Art. 10 what **is not** considered an invention:

> Art. 10. The following shall not be considered an invention or utility model:
> I — discoveries, scientific theories, and mathematical methods;
> II — purely abstract concepts;
> III — schemes, plans, principles, or commercial, accounting, financial, educational, advertising, lottery, and inspection methods;
> IV — literary, architectural, artistic, and scientific works or any aesthetic creation;
> V — computer programs per se;
> VI — presentation of information;
> VII — rules of games;
> VIII — operative or surgical techniques and methods, as well as therapeutic or diagnostic methods, for application to the human or animal body;
> IX — all or part of natural living beings and biological materials found in nature, or even isolated therefrom, including the genome or germplasm of any natural living being and natural biological processes.

The two items most relevant to AI are:

- **Item I (mathematical methods):** AI models are, in essence, mathematical constructs. A classifier, a neural network, a transformer — they are mathematical functions that map inputs to outputs. On their own, they are not patentable.
- **Item V (computer programs per se):** An AI model implemented as software, without a concrete technical application, is treated as a computer program and protected by the Software Law (Law No. 9.609/98), not by patent.

**The key lies in how the invention is presented.** If the application claims only the mathematical method or the abstract algorithm, INPI considers it unpatentable. If the invention solves a **concrete technical problem** through an AI application — and that application has a technical effect, not merely a mathematical one — there is a possibility of patent protection.

| Claim type | Patentable? | Example |
|----------------------|-------------|---------|
| Pure mathematical method (equation, abstract function) | No | A new optimization algorithm described mathematically |
| AI algorithm as a standalone computer program | No | A trained language model with no specific application |
| AI method applied to a technical problem | Yes, if it meets the requirements | Computer vision system for industrial inspection |
| Physical device implementing AI | Yes | Specialized chip for neural network inference |
| Training method with technical effect | Yes, in some cases | Training technique that reduces GPU memory usage |
| AI system + specific hardware | Yes | Autonomous robot with reinforcement learning-based control |

---

## What INPI considers patentable in AI

INPI does not have a specific and consolidated guideline for artificial intelligence patents (unlike the EPO and USPTO, which have already published guidance). However, examination follows the general criteria of the LPI and the precedents of the current Patent Examination Guidelines:

### 1. Concrete technical application

The most important requirement is to demonstrate that the invention solves a **technical problem** by technical means. Is a neural network that classifies X-ray images for medical diagnosis a technical application? It depends — if the application describes the classification method as an auxiliary tool for the physician, without claiming a diagnostic method, it may be patentable from a technical standpoint, but beware of the restriction in Art. 10, VIII (therapeutic and diagnostic methods).

Examples of technical applications INPI tends to accept:

- **Industrial computer vision:** Quality inspection system on a production line using deep learning
- **Signal processing:** Audio compression method based on neural networks
- **Process control:** Predictive control algorithm for a chemical reactor using reinforcement learning
- **Communication:** Channel coding/decoding technique using AI (H04 classification — Electric Communication Technique)
- **Hardware optimization:** Power management method in a processor using AI inference

### 2. Inventive step

INPI requires that the invention not be obvious to a person skilled in the art. In AI, this is particularly challenging because:

- The use of neural networks for classification problems is widely known
- Standard architectures (CNN, Transformer, LSTM) are prior art
- The mere substitution of a classic algorithm with a trained AI model, without substantial adaptation, may be considered obvious

To overcome this obstacle, the application should highlight:

- Specific adaptations of the architecture to the technical problem
- Non-trivial training techniques
- Measurable performance gains (accuracy, latency, resource consumption)
- Technical limitations overcome (e.g., reduced computational complexity)

### 3. Sufficiency of disclosure

INPI requires that the application describe the invention in a sufficiently clear and complete manner for a person skilled in the art to carry it out. In AI inventions, this means:

- Describing the model architecture (layers, parameters, activation function)
- Explaining the training method (data, hyperparameters, loss function)
- Presenting experimental results proving effectiveness
- Describing the computational implementation (hardware, software, platform)
- Including block diagrams of the system

> The lack of training details or the absence of experimental data are the most common causes of technical requirements (code 6.23) in AI patent applications at INPI.

---

## IPC classification of AI patents

The International Patent Classification (IPC) is the system used by INPI to categorize applications. AI inventions generally fall into the following sections:

| IPC code | Description | Application example |
|-----------|-----------|---------------------|
| **G06N** 3/00–20/00 | Systems based on computational models | Neural networks, machine learning, deep learning |
| **G06N** 5/00–7/00 | Knowledge-based systems | Expert systems, probabilistic reasoning |
| **G06V** 10/00–40/00 | Image and video recognition | Computer vision, object detection |
| **G10L** 15/00–25/00 | Speech processing | Voice recognition, speech synthesis |
| **G06F** 40/00–40/58 | Natural language processing | Text analysis, machine translation |
| **H04L** 9/00–67/00 | Digital communication | Network security, AI-based traffic optimization |
| **B25J** 9/16 | Computer-controlled robotics | Robot control with learning |

WIPO uses combined IPC and CPC classifications to define what counts as an "AI patent" in its Technology Trends reports. If you are conducting a prior art search, using these codes in the [INPI patent search system](https://www.gov.br/inpi/pt-br/servicos/patentes/busca) is more precise than keywords.

---

## Step by step: how to file an AI patent application

### 1. Prior art search

Before drafting the application, perform a search in patent databases to verify whether the invention is already known. Preferably use the IPC codes from the previous section combined with keywords.

Recommended sources:

- [INPI — Patent Search](https://www.gov.br/inpi/pt-br/servicos/patentes/busca)
- [PATENTSCOPE (WIPO)](https://patentscope.wipo.int/)
- [Espacenet (EPO)](https://worldwide.espacenet.com/)
- [Google Patents](https://patents.google.com/)

Also consult the [INPI patents page](https://www.gov.br/inpi/pt-br/servicos/patentes) for official information about the search systems.

### 2. Drafting the application

The application structure follows INPI's standard format, but with special attention to the following points:

**Descriptive report:**
- Field of the invention (e.g., "The present invention relates to a computer vision-based industrial inspection method...")
- Prior art (describe existing solutions and their limitations)
- Detailed description of the AI architecture (with diagrams)
- Description of training (dataset, hyperparameters, metrics)
- Implementation examples (code, hardware, results)
- Figures (block diagrams, performance charts, model architecture)

**Claims:**

| Type | Description | Strategy |
|------|-----------|-----------|
| Independent system claim | Device or system that implements the AI | Strongest, includes hardware + software |
| Independent method claim | Computer-implemented method | Good for processes, but requires technical character |
| Dependent claim | Additional features | Details specific aspects (training data, architecture) |
| Product claim | Storage medium with instructions | Additional support, but subject to restrictions |

**Example of a well-drafted method claim:**

> "Method of quality inspection on a production line, characterized by comprising: (a) capturing images of products on a conveyor belt by means of an industrial camera; (b) applying a trained convolutional neural network to classify each image into one of N defect classes; (c) generating a rejection signal when the predicted class is different from 'no defect'; and (d) activating a pneumatic actuator to remove the product classified as defective from the conveyor belt."

Note that the claim ties the method to specific hardware (camera, actuator) and to a concrete technical problem (industrial inspection).

### 3. Filing

Filing is done exclusively through the [INPI e-Patentes system](https://www.gov.br/inpi/pt-br/servicos/patentes/patentes-eletronico). Costs follow the Fee Schedule (INPI/PR Ordinance No. 10/2025):

| Service | Value (R$) |
|---------|-----------|
| Patent application filing (individual/ME/MEI/startup) | R$ 130.00 |
| Patent application filing (legal entity) | R$ 255.00 |
| Patent application filing (large company) | R$ 2,500.00 |
| Patent examination | R$ 490.00 (individual/ME) to R$ 3,200.00 (large company) |

See the [official INPI patents page](https://www.gov.br/inpi/pt-br/servicos/patentes) for updated instructions on electronic filing.

### 4. Monitoring

The average patent examination time at INPI has improved significantly — the backlog dropped from more than 80,000 applications in 2023 to around 15,000 in 2026 — but AI applications may face greater scrutiny due to technical complexity.

Track the status through the RPI (Industrial Property Journal) and the e-Patentes system. See the guide [How to Check the Status of a Process at INPI]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}}) for detailed instructions.

---

## Prioritized examination for AI patents

INPI offers several prioritized examination modalities that can benefit AI patent applications:

| Modality | Target audience | Cost |
|-----------|-------------|-------|
| Elderly applicant | Individual aged 60 or over | Free |
| Person with disability | Individual with disability | Free |
| Serious illness | Individual with serious illness | Free |
| Startup | Company classified as a startup | Free |
| PPH (Patent Prosecution Highway) | Applications with a favorable opinion abroad | Free |
| H04 (Electric Communication Technique) | Applications in H04 classification | Free |

In July 2026, INPI resumed prioritized examination for the **H04** classification (Electric Communication Technique), which covers several AI inventions applied to telecommunications and networks. Each applicant may request 1 prioritized application per month under this modality. See the [INPI prioritized examination page](https://www.gov.br/inpi/pt-br/servicos/patentes/tramite-prioritario) for complete details of the 17 available modalities.

---

## International perspective

Different patent offices adopt different approaches to AI:

| Office | Position on AI | Specific guidelines |
|-----------|-----------------|----------------------|
| **EPO (European)** | Requires "technical character" — AI must contribute to solving a technical problem | Guidelines G-II, 3.3 (2024) — excludes mathematical methods and computer programs as such |
| **USPTO (USA)** | More permissive — accepts computer-implemented methods if they are not "abstract ideas" | 2019 Revised Patent Subject Matter Eligibility Guidance + AI examples |
| **INPI (Brazil)** | Follows the LPI — requires concrete technical application; no specific AI guideline | General Examination Guidelines + precedents of the Patent Manual |
| **JPO (Japan)** | Accepts AI as an invention if there is interaction with hardware | Examination Guidelines for AI-related Inventions (rev. 2023) |
| **CIPO (China)** | Broadly accepts — China is the largest filer of AI patents in the world | Examination Guidelines Part II, Chapter 9 (2024) |

In June 2026, WIPO launched the [Artificial Intelligence Infrastructure Interchange (AIII)]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}}), a global forum to discuss technical standards for interoperability between AI and intellectual property. The AIII brings together more than 90 experts from dozens of countries and signals that the harmonization of AI patent rules is on the international agenda.

---

## What is NOT patentable in AI (common pitfalls)

| Situation | Problem | Solution |
|----------|----------|---------|
| "Classification method using a neural network" without a specific application | Pure mathematical method (Art. 10, I) | Specify the concrete technical application |
| "Computer program that implements AI" without hardware | Computer program per se (Art. 10, V) | Describe a system with hardware + technical interaction |
| "Content recommendation method" for users | Commercial/educational method (Art. 10, III) | Reframe as a technical system optimization problem |
| "Medical diagnosis system with AI" | Diagnostic method (Art. 10, VIII) | Limit to an auxiliary method, without claiming diagnosis |
| "Trained AI model" without training details | Insufficient disclosure | Include training data, hyperparameters, results |

---

## Conclusion

Patenting artificial intelligence in Brazil is perfectly possible, provided the application is structured to demonstrate concrete technical application, inventive step, and sufficiency of disclosure. INPI examines AI applications under the same general criteria of the LPI — there is no special rule, but there is also no insurmountable barrier.

With the explosive growth of global GenAI patents (37,800 families in 2025, according to WIPO), protecting AI inventions in Brazil is not just a matter of business strategy — it is a necessity for anyone who wants to compete in the most dynamic technology market in history.

The most important tip: **do not try to patent the abstract algorithm.** Patent the technical application that solves a real problem. The hardware, the industrial context, and the measurable technical effect are what turn a mathematical idea into a protectable invention.

Also read:

- [How to Check the Status of a Process at INPI: Step-by-Step Guide [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})
- [WIPO launches Artificial Intelligence Infrastructure Interchange: the new global forum for AI and Intellectual Property]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}})
- [How to Check the Status of a Process at INPI: Step-by-Step Guide [2026]]({{< relref "posts/como-consultar-andamento-processo-inpi/" >}})

---

You can get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
