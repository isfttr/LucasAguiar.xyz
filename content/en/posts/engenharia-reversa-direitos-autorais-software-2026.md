---
date: 2026-10-14T12:27:11.000Z
draft: false
title: 'Reverse engineering and software copyright: the line between copying the function and copying the code [2026]'
description: Video game emulators and open alternatives to Adobe, like ArtCraft, reimplement protected functions? Understand the legal boundary between idea, functionality, and expression in software copyright law.
featured_image: ''
categories:
  - article
tags:
  - engenharia-reversa
  - direito-autoral
  - software
  - emuladores
  - propriedade-intelectual
slug: reverse-engineering-software-copyright-function-code
translation_source_hash: edcd7b804de7784492c811289de7dceab3e80e6a7ec1b26062e60c1aacf0d1e3
---
Software is protected by copyright, but this protection applies to the **expression** of the code — not to the idea, method, or function that the program performs. Video game emulators and open projects that reimplement Adobe Creative Cloud, such as **ArtCraft**, live exactly on this frontier: they copy what the software *does*, without copying the code that makes it do it. This article explains where that line is, why it has stood for decades in courts, and where the real risks appear — from PlayStation to recent cases involving emulators and jailbreaking.

## What copyright protects (and doesn't protect) in software

In Brazil, the starting point is [Law 9.609/98](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm) (Software Law), which treats computer programs as protected literary works. But the law itself, as well as [Law 9.610/98](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) (Copyright Law), limits the scope:

- **Ideas, procedures, methods, and mathematical concepts are not protected** — protection does not extend to the "expression of ideas, operational procedures, methods, and mathematical concepts."
- **Art. 6, III** is the key provision: it does not constitute an offense to the rights holder "the occurrence of similarity of a program to another, pre-existing one, when this occurs due to the **functional characteristics** of its application, the observance of normative and technical precepts, or the limitation of an alternative form for its expression."
- **Art. 6, IV** also exempts the integration of a program into an application or operating system when technically indispensable for the use of the person who promoted it.

In practical terms: two programs can do **exactly the same thing** without this constituting copyright infringement, as long as they have not copied each other's source code. The "similarity" that arises from function is free.

This same distinction is at the heart of American jurisprudence, which influences the global debate. In the case [*Sega v. Accolade*](https://en.wikipedia.org/wiki/Sega_v._Accolade) (1992), the 9th Circuit Court of Appeals ruled that **reverse engineering to achieve interoperability** is *fair use* — Accolade could disassemble the Mega Drive's code to create unlicensed, compatible games. It was the foundational precedent: decoding a system so that other software can work with it is legitimate.

## PlayStation: emulator precedents

This is where the historical PlayStation cases, which still guide the topic, come in:

- [*Sony Computer Entertainment v. Connectix*](https://en.wikipedia.org/wiki/Sony_Computer_Entertainment,_Inc._v._Connectix_Corp.) (2000, 9th Circuit): Sony sued Connectix over the Virtual Game Station emulator (which ran PS1 games on Mac). The court stated that the *intermediate* copy of the BIOS during reverse engineering is *fair use*, because the goal was **interoperability** — to create a product that would run the same discs on another platform. The emulator, by itself, did not infringe copyright.
- In the *Sony v. Bleem* case (also from 2000), involving the Bleem! emulator, the court rejected Sony's arguments; the case ended in favor of the emulator's legal viability ([context](https://en.wikipedia.org/wiki/Bleem!)).

The logic is robust and simple: the emulator does not copy the games or the system — it **reimplements the hardware's behavior in software**, writing original code. It is reverse engineering for interoperability, protected by *fair use* in the USA and supported by Art. 6, III in Brazil.

## What changed: the DMCA and the shift in risk

If the emulator itself is legal, why do developers still shut down for fear of lawsuits? Because copyright is **no longer the only** weapon. The [Digital Millennium Copyright Act (DMCA)](https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act), from 1998, created a separate layer in §1201: **anti-circumvention**. It prohibits bypassing *protection mechanisms* (DRM, encryption, signatures) to access protected works — regardless of whether the access itself constitutes copyright infringement.

Practical consequence: by circumventing a technical control, even for a purpose that would be legitimate (interoperability, preservation, jailbreak), the risk becomes statutory, and no longer protected by fair use. This is why console "jailbreaking" is treated with such care: the discussion is not about the idea of running one's own software, it's about the **circumvention** of anti-piracy protection.

The most emblematic case in recent years was not from Sony, but from Nintendo, and it shows the shift. In February 2024, Nintendo sued **Tropic Haze**, the company behind the Yuzu emulator (for Nintendo Switch); the company ceased Yuzu and Citra's activities in March 2024 and reached a **US$2.4 million settlement** ([report](https://en.wikipedia.org/wiki/Yuzu_(emulator))). The lawsuit was not based on "emulator is piracy," but on circumvention of DRM and facilitation of game piracy. The industry's message is clear: the battlefield has shifted from the legality of reverse engineering to the **use** of reverse-engineered software and the circumvention of technical mechanisms.

## ArtCraft: the open alternative that reimplements Adobe and Office

[ArtCraft](https://github.com/storytold/artcraft) (open-source project, ~27k stars, written in Rust) takes this discussion to the world of creative applications. The proposal is a suite of **13 native and open applications** that mirror, one by one, the names and functions of market leaders ([catalog](https://www.getartcraft.com/apps)):

- **PhotoCraft** (Photoshop), **VectorCraft** (Illustrator), **FilmCraft** (Premiere), **LightCraft** (Lightroom), **EffectCraft** (After Effects), **DesignCraft** (InDesign), **PdfCraft** (Acrobat), **FigCraft** (Figma), **WordCraft** (Word), **SoundCraft** (Audition), **DeckCraft** (PowerPoint), **CADCraft** (CAD), and **GridCraft** (Excel).

At first glance, it looks like an "Adobe copy." Legally, it's not — and that's precisely the point. Each app is a **clean-room reimplementation** of the *functionality*, not a copy of the code, icons, or registered trademarks. It occupies the same niche as GIMP, Inkscape, LibreOffice, and Penpot: open competition by **function**, without subscription or lock-in.

This falls under the same principle as emulators: the **idea** of editing an image, creating a layout, or drawing a vector is not protectable; the **expression** (Photoshop's code) is. As long as ArtCraft writes original code, does not copy protected assets (asset packs, proprietary filters), and does not use brand names/logos, it is on the safe ground of Brazilian Art. 6, III and American *fair use* doctrine.

Where the real risk appears:

1. **Trade dress and visual identity** — copying the *distinctive appearance* (recognizable interface layout, icons) can lead to actions for unfair competition or trademark infringement, even if the code is original.
2. **Proprietary assets** — importing brushes, presets, fonts, or plugins with restricted licenses shifts the infringement outside of "mere function."
3. **Protection mechanisms** — if a product needs to bypass DRM or cryptographic signatures to achieve interoperability, it enters the realm of anti-circumvention (DMCA §1201), outside of fair use.
4. **Trademarks and trade names** — naming the clone with a similar name or in direct parody of a registered trademark is the quickest shortcut to legal action.

## Conclusion: what to observe

The golden rule has remained stable for 30 years: **copy the function, not the expression.** Copying what software does, by writing original code, is lawful — in Brazil expressly (Art. 6, III of Law 9.609/98) and in the USA by *fair use* (Sega v. Accolade, Sony v. Connectix). PlayStation emulators and open platforms like ArtCraft prove that it is possible to compete with giants without touching their code.

What has changed in recent decades is where litigation is concentrated: it shifted from the originality of the code to **anti-circumvention** (DMCA §1201), the **piracy that reverse-engineered software enables**, and the **confusion of trademarks/trade dress**. The recent Yuzu case (2024) illustrates the first and second; ArtCraft's design warns of the third. For those who build or defend such a product, the checklist is short: clean and original code, zero copied licensed assets, no third-party names/logos, and — above all — no bypassing protection mechanisms without knowing your country's specific anti-circumvention rules.

To delve deeper into the registration and formal protection of software, see our guide on [how to register a computer program with the INPI]({{< relref "posts/guia-registro-programa-computador-inpi/" >}}) and the comparison between [software patent and computer program registration in Brazil]({{< relref "posts/patente-software-vs-registro-programa-computador-brasil/" >}}). And, for the broader debate on copyright in the digital age, read the post on [copyright in the AI era]({{< relref "posts/pi-em-questao-direito-autoral-inteligencia-artificial-inpi/" >}}).

Read also:

- [How to Register a Computer Program at the INPI: Complete Step-by-Step Guide [2026]]({{< relref "posts/guia-registro-programa-computador-inpi/" >}})
- [Software Patent vs Computer Program Registration in Brazil: What's the Difference? [2026]]({{< relref "posts/patente-software-vs-registro-programa-computador-brasil/" >}})
- [Copyright in the AI era: INPI brings together international experts to debate the challenges of artificial intelligence]({{< relref "posts/pi-em-questao-direito-autoral-inteligencia-artificial-inpi/" >}})

---

You can get in touch to discuss this and other topics at <contact@lucasaguiar.xyz>
