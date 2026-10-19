---
date: 2026-10-18T10:15:14-03:00
draft: false
title: "Muse by Meta Terms of Use: What a Regular User Needs to Know"
description: "Guide to the problems in the Muse (Meta AI agent) terms of service and privacy policy: default training, the $250 liability cap, arbitration, and what to do in practice."
featured_image: ""
categories:
  - article
tags:
  - ai
  - privacy
  - digital-rights
  - terms-of-service
  - meta
---
Muse, Meta's personal AI agent, arrived with a promise of privacy and security, but the documents governing the service — supplementary terms and privacy policy — hide points that deserve attention before you connect it to your email inbox, calendar or bank account. This guide summarizes the main problems found in those contracts, explains Meta's liability limits in case of failure and offers practical recommendations for a regular user to follow.

The analysis below is based on the service's official documents: the [Muse supplementary terms](https://muse.ai/terms), the [privacy policy](https://muse.ai/privacy), Meta's [AI terms](https://www.facebook.com/legal/ai-terms) and the [security technical documentation](https://research.meta.ai/blog/security-and-safety-for-ai-agents-our-approach-with-muse). Not all terms could be checked in full during the review — some excerpts come from public reproductions — so treat the exact clauses as subject to confirmation against the applicable version.

## Meta can read what you share with Muse

The short answer is: yes, Meta can access messages and other data made available to Muse, under the conditions described by the company itself. Today there is no guarantee that your conversations are technically inaccessible to Meta.

Meta states that employee access is restricted by operational policies, but the current architecture does not prevent the company's own access when necessary. That does not mean any employee can freely read everything — protection also depends on internal controls. The promised **Confidential VM**, which would encrypt the virtual machine with a key held only by the user, still appears as a future feature.

## The main privacy problems

| Problem | Consequence for you |
|---|---|
| **Training enabled by default** | Conversations, tool calls and interactions can feed model training after identifiers are removed. You need to turn this option off in the settings menu. |
| **Removing identifiers does not remove confidential content** | Stripping the name or email does not remove a formula, a business strategy, medical information or a description of a not-yet-published invention. |
| **Disabling training does not block all access** | The option covers a specific purpose. It does not stop operational processing, support or security checks. |
| **Advertising promise has limited scope** | Meta states that conversations and virtual machine data are not shared with its advertising systems, but acknowledges that browsing, purchases and bookings made by the agent may indirectly influence ads. |

There are also three additional problems: deleting content may not erase derived memory (the agent may keep remembering information learned from deleted items, requiring an additional forgetting action); record retention is loosely defined in the terms; and there is an account consolidation mechanism when Muse takes part in the same Account Center as other products. A deletion option in the interface does not, by itself, prove the elimination of all copies, including backups and inferences.

## The most unfavorable contractual clauses

| Reported clause | Objection from the user's perspective |
|---|---|
| **User liability for Muse's actions** | Attempts to place on the consumer the risk of a tool whose implementation they do not control. Its application to failures of the service itself is questionable. |
| **Assumption of financial risks** | Transfers losses, limits, monitoring and contesting of transactions to the user. It is especially unfavorable when the agent misinterprets an instruction. |
| **No guarantee that instructions are carried out** | The company offers task execution but seeks to limit contractual consequences when execution fails. |
| **Liability cap** | Reproductions indicate the greater of **US$ 250 and the payments of the previous 12 months**, including for certain wrongful or unauthorized actions. |

There are reported exceptions to the cap, such as willful misconduct, fraud and gross negligence — so the cap is not absolute. Other clauses deserve attention:

- **Broad waiver of claims**: there is a provision that seeks to bar claims related to the agents' content and actions. Any interpretation that covered security defects or breach of the service would be questionable.
- **Individual arbitration and restriction on class actions**: the regime applies to residents of the United States and Canada, with a 30-day option to decline arbitration. It is a relevant restriction on how to seek redress, depending on the jurisdiction.
- **Broad license over content, including from connected services**: the clause grants a worldwide, royalty-free, transferable and sublicensable license, limited to providing, maintaining, securing and improving Muse. This is not a transfer of ownership, but it demands caution with third-party documents, NDA material and institutional content.
- **Attribution to the user of transfers to third parties**: the contract treats sending to connected services as initiated by the user, which can be contested when the agent chooses data or recipients beyond what was clearly authorized.

## Meta's liability limit in case of failure

The key point for understanding the service's real risk lies in the liability cap: **US$ 250 or the amount paid in the previous 12 months, whichever is greater**, including for "unintended transactions" executed by the agent. This means that if Muse makes a wrong purchase, sends an undue email or causes a larger financial loss, Meta's exposure is limited — and the user assumes "all risk of financial loss arising from such actions" and is declared "solely responsible" for supervision.

In practice: the possible loss from an autonomous agent connected to bank accounts or a business email can easily exceed that cap. That is the technical and legal reason why the caution recommendation is not mere theory.

## How these clauses behave in Brazil

Being written into the contract does not make a clause automatically valid. If the **Brazilian Consumer Protection Code (CDC / Código de Defesa do Consumidor)** applies, there are strong grounds to challenge the exemption of liability for defects, the waiver of rights, the exaggerated disadvantage and mandatory arbitration — especially under article 51, which declares null any clause placing the consumer at an exaggerated disadvantage.

Under **LGPD**, when data processing depends on consent, that consent must have specific purposes; generic authorizations are void. There are rights of access, information about sharing, revocation and deletion, subject to legal exceptions. Granting technical access to an email inbox does not, by itself, resolve the lawfulness of all subsequent uses of the data, including those of correspondents.

## Practical recommendations for the regular user

Based on the problems found, these are the recommendations for anyone who wants to use Muse without unnecessary exposure:

- **Do not connect corporate email, not-yet-published patent applications, internal opinions or confidential information** without a specific contractual review.
- **Disable training** (Settings → Data Controls → "Help improve our AI models"). It is a useful measure but does not turn Muse into an environment with a guarantee of professional confidentiality.
- **Use a separate account** with non-confidential data to try the service.
- **Enable individual approval for sends and transactions** instead of allowing automatic actions.
- **Periodically review the agent's activity logs** (the available "audit trail") and revoke access to any connected service no longer in use.
- **Before any professional use, check the current version of the terms**, since not all excerpts could be verified in full and clauses change.

## Meta's legal troubles with teens and children in the US

The analysis of Muse's terms connects to a broader history: Meta has faced for years, in the United States, a judicial and regulatory front over the impact of its products on minors. The pattern provides context for understanding how the company handles (and limits) its liability.

**States' lawsuit (N.D. of California).** In October 2023, more than 30 states and the District of Columbia sued Meta, accusing it of designing Facebook and Instagram to drive compulsive use by children and teenagers, misleading about safety and unlawfully collecting minors' data (COPPA). [1][2] The trial began in August 2026, presided over by Judge Yvonne Gonzalez Rogers; Meta's defense was a denial of responsibility. [3]

**August 2026 settlement.** The trial ended with a settlement involving 51 state attorneys general, subject to court approval. Meta committed to pay up to ~US$ 17 billion over ten years (Reuters cited ~US$ 18 billion) and to adopt structural changes to products for users under 18: a default usage cap of 2 hours a day, a night-time lock removable only by parents or guardians, restrictions on notifications, age verification, parental controls and an independent auditor. [4][2] Meta denied wrongdoing even while signing the settlement.

**Other fronts.** In May 2026, Meta asked a California judge to throw out a "landmark" personal injury verdict over social media addiction; in July 2026, it faced trials in Tennessee over claims that Instagram was "designed to be addictive" and that the company ignored its own research on harm to teenagers (Reuters, blocked to curl — canonical URLs confirmed). [5][6] The New Mexico attorney general also sued Meta over insufficient protection of minors against predators and abuse content, and Meta contested a ~US$ 37 billion state plan. [7]

**How Meta reacts.** The recurring pattern is: deny responsibility in courts and in public communications, seek to overturn verdicts or reduce damages, and at the same time announce product changes under pressure — expanding content controls for teenagers, strengthening parental control and new AI safeguards for minors. [8] There is also an inverse move: through the trade association NetChoice, Meta has litigated against state laws that protect minors, such as California's law on "addictive" feeds (SB 976). [9]

The connection to Muse is direct: both in the terms of service and in its legal defense, Meta structures its exposure to shift to the user — including the teenage user — the risk of the product's decisions, while limiting its own liability cap.

**Sources:**
1. [The Guardian — States sue Meta over harm to young users](https://www.theguardian.com/technology/2023/nov/27/meta-instagram-facebook-kids-addicted-lawsuit)
2. [Wikipedia — People of the State of California v. Meta Platforms, Inc.](https://en.wikipedia.org/wiki/People_of_the_State_of_California_v._Meta_Platforms,_Inc.)
3. [The Guardian — Meta trial over children's privacy](https://www.theguardian.com/technology/2026/aug/22/meta-trial-children-privacy)
4. [California Attorney General — US$ 17B settlement](https://oag.ca.gov/news/press-releases/attorney-general-bonta-secures-transformative-17-billion-settlement-meta)
5. [Reuters — Meta asks to throw out addiction verdict (blocked to curl)](https://www.reuters.com/legal/litigation/meta-asks-california-judge-throw-out-landmark-social-media-addiction-verdict-2026-05-06)
6. [Reuters — Tennessee trial (blocked to curl)](https://www.reuters.com/legal/litigation/meta-faces-tennessee-trial-over-allegations-instagram-was-designed-be-addictive-2026-07-20)
7. [Wikipedia — Raúl Torrez](https://en.wikipedia.org/wiki/Raúl_Torrez)
8. [Reuters — Meta expands teen controls (blocked to curl)](https://www.reuters.com/legal/litigation/meta-expands-teen-content-controls-globally-tests-new-instagram-tool-diversify-2026-06-02)
9. [Wikipedia — NetChoice v. Bonta](https://en.wikipedia.org/wiki/NetChoice_v._Bonta)

## Conclusion

Muse is a technically interesting product, but its contracts shift to the user a good share of the risk of an autonomous agent — including a liability cap that can be far below the real loss, especially in professional use. The stated privacy ("we do not share conversations with the advertising system") does not amount to a general guarantee of confidentiality. Before giving an AI agent access to your inbox or bank account, it is worth reading what the contract says — and realizing that what the interface offers may not cover what the contract excludes.

Read also:

- [AI Session Portability: Why Your AI Conversations Are Becoming Lock-In [2026]]({{< relref "posts/ai-session-portability-guide-2026/" >}})
- [Claude Tag and the Risk to Corporate Intellectual Property]({{< relref "posts/claude-tag-propriedade-intelectual-empresarial/" >}})

---

Get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>