---
date: 2026-07-30T11:00:00-03:00
draft: true
title: "Artificial Intelligence Patents in Brazil: Complete Guide to Protecting AI Inventions [2026]"
description: "Complete guide to patenting artificial intelligence in Brazil: what is patentable, INPI requirements, IPC classifications, how to draft the application, and differences between software, algorithms, and AI inventions. Includes WIPO 2026 data."
featured_image: ""
categories:
  - article
tags:
  - patents
  - inpi
  - artificial-intelligence
  - wipo
  - innovation
  - guide
  - technology
---

AI-based inventions represent the most dynamic frontier of industrial property today. According to WIPO data published in July 2026, the number of generative AI (GenAI) patent families jumped from approximately 14,000 in 2023 to over 37,800 in 2025 — a compound annual growth rate of 64%. Over 56,000 new GenAI patent families were published in 2024 and 2025 alone, surpassing the entire prior decade (2014-2023) combined.

This growth raises a practical question for inventors, startups, and companies in Brazil: **how do you legally protect an artificial intelligence invention?** The answer is not trivial, because patent law was designed for tangible inventions, and AI presents unique classification challenges.

This guide covers the legal requirements, INPI's positions, relevant international classifications, the step-by-step filing process, and the key differences between protecting an algorithm, an AI model, and a concrete technical application.

---

## What Brazilian IP Law Says About AI Patents

Brazil's Industrial Property Law (Law No. 9,279/96 — LPI) does not explicitly mention artificial intelligence. However, Article 10 defines what is **not** considered an invention:

> Art. 10. The following are not considered inventions or utility models:
> I — discoveries, scientific theories, and mathematical methods;
> II — purely abstract conceptions;
> III — commercial, accounting, financial, educational, advertising, lottery, and inspection schemes, plans, principles, or methods;
> IV — literary, architectural, artistic, and scientific works, or any aesthetic creation;
> V — computer programs per se;
> VI — presentation of information;
> VII — rules of games;
> VIII — surgical or therapeutic techniques, as well as diagnostic methods, for application on the human or animal body;

The two most relevant provisions for AI are:

- **Item I (mathematical methods):** AI models are fundamentally mathematical constructs. A classifier, neural network, or transformer is a mathematical function mapping inputs to outputs. On their own, they are not patentable.
- **Item V (computer programs per se):** An AI model implemented purely as software, without a concrete technical application, is treated as a computer program and protected under the Software Law (Law No. 9,609/98), not patent law.

**The key lies in how the invention is presented.** If the application claims only the mathematical method or abstract algorithm, INPI considers it unpatentable. If the invention solves a **concrete technical problem** through an AI application — and that application produces a technical effect, not merely a mathematical one — patent protection is possible.

| Claim Type | Patentable? | Example |
|-----------|-------------|---------|
| Pure mathematical method | No | A new optimization algorithm described mathematically |
| AI algorithm as isolated software | No | A trained language model with no specific application |
| AI method applied to technical problem | Yes, if requirements met | Computer vision system for industrial inspection |
| Physical device implementing AI | Yes | Specialized chip for neural network inference |
| Training method with technical effect | Yes, in some cases | Training technique that reduces GPU memory usage |
| AI + specific hardware system | Yes | Autonomous robot with reinforcement learning control |

---

## What INPI Considers Patentable in AI

INPI does not have specific, consolidated guidelines for AI patents (unlike the EPO and USPTO, which have published examination guidance). However, examination follows the general LPI criteria and the current Patent Examination Guidelines:

### 1. Concrete Technical Application

The most important requirement is demonstrating that the invention solves a **technical problem** by technical means. A neural network that classifies X-ray images for medical diagnosis is a technical application? It depends — if the application describes the classification method as an auxiliary tool for physicians, without claiming a diagnostic method, it may be patentable, but beware of Article 10, VIII restrictions.

Examples of technical applications that INPI tends to accept:

- **Industrial computer vision:** Quality inspection system in a production line using deep learning
- **Signal processing:** Audio compression method based on neural networks
- **Process control:** Predictive control algorithm for chemical reactors using reinforcement learning
- **Communications:** AI-based channel coding/decoding (H04 classification — Electrical Communication Technique)
- **Hardware optimization:** Processor power management method using AI inference

### 2. Inventive Step

INPI requires that the invention not be obvious to a person skilled in the art. In AI, this is particularly challenging because:

- Using neural networks for classification problems is widely known
- Standard architectures (CNN, Transformer, LSTM) are prior art
- Simply replacing a classical algorithm with a trained AI model, without substantial adaptation, may be considered obvious

To overcome this hurdle, the application should highlight:

- Specific architecture adaptations to the technical problem
- Non-trivial training techniques
- Measurable performance gains (accuracy, latency, resource consumption)
- Technical limitations overcome (e.g., computational complexity reduction)

### 3. Sufficiency of Disclosure

INPI requires the application to describe the invention clearly and completely enough for a person skilled in the art to reproduce it. For AI inventions, this means:

- Describing the model architecture (layers, parameters, activation functions)
- Explaining the training method (data, hyperparameters, loss function)
- Presenting experimental results proving effectiveness
- Describing the computational implementation (hardware, software, platform)
- Including block diagrams of the system

> Insufficient training details or lack of experimental data are the most common causes of technical office actions (code 6.23) in AI patent applications at INPI.

---

## IPC Classification of AI Patents

The International Patent Classification (IPC) is the system used by INPI to categorize applications. AI inventions typically fall under these sections:

| IPC Code | Description | Application Example |
|---------|-----------|-------------------|
| **G06N** 3/00–20/00 | Systems based on computational models | Neural networks, machine learning, deep learning |
| **G06N** 5/00–7/00 | Knowledge-based systems | Expert systems, probabilistic reasoning |
| **G06V** 10/00–40/00 | Image and video recognition | Computer vision, object detection |
| **G10L** 15/00–25/00 | Speech processing | Speech recognition, voice synthesis |
| **G06F** 40/00–40/58 | Natural language processing | Text analysis, machine translation |
| **H04L** 9/00–67/00 | Digital communication | Network security, AI-based traffic optimization |
| **B25J** 9/16 | Computer-controlled robotics | Robot control with machine learning |

WIPO uses combined IPC and CPC classifications to define what counts as an "AI patent" in its Technology Trends reports. When conducting prior art searches, using these codes in INPI's patent search system is more precise than keywords alone.

---

## Step by Step: Filing an AI Patent Application in Brazil

### 1. Prior Art Search

Before drafting the application, search patent databases to verify the invention is not already known. Use the IPC codes from the previous section combined with keywords.

Recommended sources:

- [INPI — Patent Search](https://www.gov.br/inpi/pt-br/servicos/patentes/busca)
- [PATENTSCOPE (WIPO)](https://patentscope.wipo.int/)
- [Espacenet (EPO)](https://worldwide.espacenet.com/)
- [Google Patents](https://patents.google.com/)

### 2. Drafting the Application

The application structure follows INPI's standard format, with special attention to:

**Specification:**
- Field of the invention (e.g., "The present invention relates to an industrial inspection method based on computer vision...")
- Prior art (existing solutions and their limitations)
- Detailed description of the AI architecture (with diagrams)
- Training description (dataset, hyperparameters, metrics)
- Implementation examples (code, hardware, results)
- Figures (block diagrams, performance graphs, model architecture)

**Claims:**

| Type | Description | Strategy |
|------|-----------|----------|
| Independent system | Device or system implementing AI | Strongest, includes hardware + software |
| Independent method | Computer-implemented method | Good for processes, requires technical character |
| Dependent | Additional features | Details specific aspects (training data, architecture) |
| Product | Storage medium with instructions | Supporting claim, subject to restrictions |

**Example of a well-drafted method claim:**

> "A quality inspection method for a production line, characterized by comprising: (a) capturing images of products on a conveyor belt using an industrial camera; (b) applying a trained convolutional neural network to classify each image into one of N defect classes; (c) generating a rejection signal when the predicted class is different from 'no defect'; and (d) actuating a pneumatic actuator to remove the classified defective product from the conveyor belt."

Note the claim ties the method to specific hardware (camera, actuator) and a concrete technical problem (industrial inspection).

### 3. Filing

Filing is done exclusively through INPI's [e-Patentes system](https://www.gov.br/inpi/pt-br/servicos/patentes/patentes-eletronico). Costs follow the Fee Schedule (INPI/PR Ordinance No. 10/2025):

| Service | Fee (BRL) |
|---------|----------|
| Patent application filing (individual/SME/startup) | R$ 130.00 |
| Patent application filing (corporation) | R$ 255.00 |
| Patent application filing (large company) | R$ 2,500.00 |
| Patent examination | R$ 490.00 (individual) to R$ 3,200.00 (large company) |

### 4. Monitoring

INPI's average patent examination time has improved significantly — the backlog dropped from over 80,000 applications in 2023 to approximately 15,000 in 2026 — but AI applications may face greater scrutiny due to technical complexity.

Track progress through the RPI (Industrial Property Gazette) and the e-Patentes system.

---

## Priority Examination for AI Patents

INPI offers several priority examination modalities that can benefit AI patent applications:

| Modality | Target audience | Cost |
|---------|---------------|------|
| Elderly applicant | Individual ≥ 60 years | Free |
| Person with disability | Individual with disability | Free |
| Serious illness | Individual with serious illness | Free |
| Startup | Company qualifying as startup | Free |
| PPH (Patent Prosecution Highway) | Applications with favorable foreign examination | Free |
| H04 (Electrical Communication) | Applications classified as H04 | Free |

In July 2026, INPI resumed priority examination for **H04** (Electrical Communication Technique), which covers many AI inventions applied to telecommunications and networks. Each applicant may request 1 priority examination per month.

---

## International Perspective

Different patent offices adopt different approaches to AI:

| Office | Position on AI | Specific Guidelines |
|-------|---------------|-------------------|
| **EPO** | Requires "technical character" — AI must contribute to solving a technical problem | Guidelines G-II, 3.3 (2024) |
| **USPTO** | More permissive — accepts computer-implemented methods if not "abstract ideas" | 2019 Revised Subject Matter Eligibility Guidance |
| **INPI (Brazil)** | Follows LPI — requires concrete technical application; no specific AI guidelines | General Examination Guidelines |
| **JPO (Japan)** | Accepts AI as invention with hardware interaction | Examination Guidelines for AI-related Inventions (rev. 2023) |
| **CNIPA (China)** | Broadly accepts — China is the largest AI patent filer globally | Examination Guidelines Part II, Chapter 9 (2024) |

WIPO launched in June 2026 the [Artificial Intelligence Infrastructure Interchange (AIII)]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}}), a global forum to discuss technical interoperability standards between AI and intellectual property.

---

## Common Pitfalls in AI Patenting

| Situation | Problem | Solution |
|----------|---------|----------|
| "Classification method using neural network" with no specific application | Pure mathematical method (Art. 10, I) | Specify the concrete technical application |
| "Computer program implementing AI" without hardware | Computer program per se (Art. 10, V) | Describe system with hardware + technical interaction |
| "Content recommendation method" for users | Commercial/educational method (Art. 10, III) | Reframe as a system optimization technical problem |
| "AI-based medical diagnosis system" | Diagnostic method (Art. 10, VIII) | Limit to auxiliary method, don't claim diagnosis |
| "Trained AI model" without training details | Insufficient disclosure | Include training data, hyperparameters, results |

---

## Conclusion

Patenting artificial intelligence in Brazil is perfectly feasible, provided the application is structured to demonstrate concrete technical application, inventive step, and sufficiency of disclosure. INPI examines AI applications using the same general LPI criteria — there is no special rule, but also no insurmountable barrier.

With the explosive growth of global GenAI patents (37,800 families in 2025, per WIPO), protecting AI inventions in Brazil is not just a business strategy — it is a necessity for anyone competing in the most dynamic technology market in history.

The most important advice: **Don't try to patent the abstract algorithm.** Patent the technical application that solves a real problem. The hardware, the industrial context, and the measurable technical effect are what transform a mathematical idea into a protectable invention.

Read also:

- [WIPO launches AI Infrastructure Interchange: the new global forum for AI and IP]({{< relref "posts/wipo-lanca-artificial-intelligence-infrastructure-interchange/" >}})
- [Copyright in the AI era: INPI brings together international experts to debate the challenges]({{< relref "posts/pi-em-questao-direito-autoral-inteligencia-artificial-inpi/" >}})
- [INPI to pay BRL 1,025 for patent searches: accreditation guide [2026]]({{< relref "posts/inpi-credenciamento-busca-anterioridade-patentes/" >}})

---

Feel free to reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
