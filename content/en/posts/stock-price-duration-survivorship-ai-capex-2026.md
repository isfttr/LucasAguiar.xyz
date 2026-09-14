---
date: 2026-08-17T10:00:00-03:00
draft: false
title: "How Many Years of Cash Flow Is a Stock Price? Duration, Survivorship, and the AI Capex Boom"
description: "A stock price is the present value of decades of future cash flows — but most companies never survive that long. What that old finance math says about the AI investment boom and the growing skepticism around it."
featured_image: ""
categories:
  - opinion
tags:
  - ai
  - valuation
  - investing
  - ai-bubble
  - markets
---

A share price is the present value of every future cash flow a company will ever produce, discounted back to today. That is the textbook definition, and almost nobody disputes it. What gets far less attention is a simple follow-up question: **how far into the future does that value actually sit?** And once you have the answer, an uncomfortable second question follows — do companies even survive long enough to deliver those cash flows?

This isn't my usual territory. I write here mostly about patents, technology, and health regulation. But the skepticism now building around the AI capex boom — the sheer scale of the spending versus the returns anyone can actually point to — has sent a lot of people looking for a framework to make sense of it. This is the framework I keep coming back to, and it turns out to be older than the internet.

## The uncomfortable arithmetic of a share price

Take the standard perpetual-growth (Gordon) model. The value of a stock is next year's cash flow divided by the spread between the discount rate `r` and the perpetual growth rate `g`. Work out how much of that total value arrives by year *N*, and you get a clean formula for the fraction captured over any horizon.

Ask it to tell you when **90%** of the value has been delivered, and the numbers are much larger than intuition suggests:

| Profile | r | g | Spread (r − g) | Years to reach 90% |
|---|---|---|---|---|
| Mature / value | 10% | 2% | 8.0% | ~30 years |
| Blended / index-like | 9% | 4% | 5.0% | ~49 years |
| Growth | 10% | 7% | 3.0% | ~83 years |
| Extreme growth | 9% | 8% | 1.5% | ~166 years |

The pattern is the whole point: **the smaller the gap between `r` and `g`, the further into the future a stock's value lives.** A mature, slow-growing company has most of its value within a couple of decades. A high-growth company — the kind whose price is built on a small spread — depends on cash flows that are *many decades* out, well beyond the 5-to-10-year window that any honest analyst will actually forecast before waving their hands and calling the rest "terminal value."

And those distant forecasts tend to be too optimistic. Research on subjective expectations finds that growth expectations account for the overwhelming majority of movement in market price-to-earnings ratios — but that those expectations are systematically overstated exactly when multiples are already high ([De la O and Myers, research summary](https://www.ricardodelao.com/research)). Work on *cash-flow duration* shows the same thing at the firm level: high-duration ("long-dated") stocks grew faster in the past, yet delivered essentially the **same** earnings growth as low-duration stocks over the following five years ([Weber, *Cash Flow Duration and the Term Structure of Equity Returns*](https://www.sciencedirect.com/science/article/abs/pii/S0304405X18300667)). The market pays up for backloaded cash flows, and the backloaded cash flows disappoint.

## Most companies don't live that long

Here's where it gets worse for the long-dated bet. Those horizons of 30, 80, 160 years assume the company is still *there* to pay you. History says that's a heroic assumption.

- The 10-year survival rate for firms on the NYSE and AMEX between 1963 and 1995 was just **61%** ([Baker and Kennedy, *Survivorship and the Economic Grim Reaper*](https://academic.oup.com/jleo/article-abstract/18/2/324/2193956)). Four in ten were gone within a decade — a horizon far shorter than what a growth valuation needs.
- The average lifespan of an S&P 500 company has collapsed from around 67 years in the 1920s to roughly 15–18 years today, with projections that three-quarters of the current index will be gone or going by around 2027 ([Imperial Business School, *Why companies die*](https://www.imperial.ac.uk/business-school/blogs/executive-education/why-companies-die/)).
- Of the 500 original S&P constituents from March 1957, only about **17%** survived fifty years as independent companies ([*On Survivor Stocks in the S&P 500 Stock Index*](https://www.mdpi.com/1911-8074/15/2/95)) — fewer than 130 were still standing on their own by 2003.

I ran a quick simulation to see what happens to those 90%-horizon numbers once you fold in a constant annual "death" rate. Mathematically, a mortality hazard behaves like a bump to the discount rate — and it compresses the horizons dramatically. That absurd 166-year extreme-growth figure drops to roughly 30 years once you apply the historical hazard implied by Foster's lifespan data. In other words: **the market is either pricing in a survival probability far higher than the historical average, or it isn't pricing survival risk at all** — and instead treating `r` as pure systematic risk while ignoring the idiosyncratic risk of simply vanishing.

One crucial caveat, because it cuts the other way: *leaving the index* is not the same as *going to zero*. Most exits are mergers and acquisitions, not bankruptcies, and an acquisition usually pays fair value — sometimes a premium — for those future cash flows. So the "death" that actually destroys shareholder value (bankruptcy) is a subset of the disappearances. My simulation suggests that even in a generous scenario where only 15% of exits are genuine distress, the *expected* realized value still comes in nearly 20% below what the clean perpetuity "promised." In harsher scenarios it's a coin flip.

## The survivor's paradox — and why you can't just pick them

The most famous test of this is Siegel and Schwartz's study of the original 1957 S&P 500 ([CFA Institute / *Financial Analysts Journal*](https://rpc.cfainstitute.org/research/financial-analysts-journal/2006/long-term-returns-on-the-original-sp-500-companies)). They bought the original 500 and did *nothing* — let the failures fail, reinvested the proceeds of buyouts into the survivors, and never once consulted an analyst. That brain-dead portfolio beat the continuously updated index by about **one percentage point a year**, turning a 1957 dollar into roughly $124 versus $93 for the standard index ([The Motley Fool summary](https://www.fool.com/investing/general/2015/02/20/just-leave-it-alone.aspx)).

It's tempting to read that as "so just hold the winners." But that's precisely the trap, and it's worth being clear about why. The outperformance required **zero forecasting**. It did *not* come from identifying the ~125 companies that would survive fifty years — it came from refusing to trade at all, while the official index kept buying the expensive new entrants everyone was excited about and dumping the cheap, unglamorous names on the way out. Picking the eventual survivors *in advance* is very close to impossible; the survivors, it turns out, tend to be boring high-profitability value stocks, not the glamorous growth names of their day. Buying the broad basket and sitting still is the genuinely conservative move. Trying to hand-select tomorrow's winners is the speculative one, even when it feels like the smart one.

## Now point this lens at AI

Line up the current numbers against that backdrop and the reason for the skepticism becomes obvious.

The largest hyperscalers are on track to spend somewhere around **$805 billion** on capex in 2026, up from roughly $261 billion in 2024, with some projections reaching $1.1 trillion in 2027 ([Pinetree Macro / Morgan Stanley estimate](https://pinetreemacroresearch.substack.com/p/the-ai-capex-bubble-bigger-than-you)). Capex has been growing at 60–80% a year while revenue at those same firms grows around 15–16% ([Futuriom](https://www.futuriom.com/articles/news/ctp-is-hyperscaler-ai-spending-sustainable/2026/04)). The predictable result: aggregate free cash flow for the group has turned negative for what analysts describe as the first time in about 35 years ([Allianz Trade](https://www.allianz-trade.com/en_global/news-insights/economic-insights/AI-capex-cycle-war-proof-now.html)).

Two things make this harder than the optimists allow. First, the assets depreciate fast. Unlike the fiber-optic cable of the 1990s — which still carries traffic today — AI capex is largely chips and servers that obsolesce on a short cycle, creating a treadmill that demands constant reinvestment rather than a durable asset you grow into ([Project Syndicate via LinkedIn](https://www.linkedin.com/top-content/finance/financial-crisis-case-studies/impact-of-the-dot-com-bubble-burst/)). Second, the returns aren't showing up yet where it counts: an MIT NANDA study found that despite $30–40 billion in enterprise spending, roughly **95%** of corporate generative-AI pilots delivered no measurable impact on the bottom line ([Fortune coverage](https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html)).

Meanwhile private valuations lean hard on the distant end of the cash-flow curve — one Deutsche Bank analysis pegged OpenAI at around 38x and Anthropic at 44x forward revenue ([via iTiger](https://www.itiger.com/news/1171064290)). Go back to the first table: those are small-spread, long-duration bets, the most fragile kind to both survival risk *and* the documented tendency of long-dated growth to disappoint. (The publicly traded giants, funded largely from their own cash flow rather than debt, are a different and sturdier case — but even there the debate is entirely about *when* the return arrives.)

The treadmill also shows up on the software side: [AI is transforming code complexity]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}}) as fast as the hardware that runs it, so both the workloads and the tooling keep escalating rather than settling into a durable asset. The capex cycle isn't a one-time build-out; it's a commitment to keep running.

## History doesn't repeat, but it rhymes

None of this is new. Capital-cycle history is full of transformative technologies that made society rich and shareholders poor.

- **Railway Mania, 1840s Britain.** At its 1846 peak, Parliament authorized railway acts covering thousands of miles of track, with investment reaching around 7% of GDP. Britain got a national rail network that powered the Industrial Revolution — built largely with capital that never earned its original backers a return ([Market Histories](https://www.markethistories.com/en/the-railway-mania-britains-victorian-tech-bubble-1840s)).
- **Telecom / fiber, late 1990s.** Carriers spent over $500 billion laying fiber worldwide. By the mid-2000s roughly 85% of it sat unused, bandwidth prices had fallen more than 90%, and the telecom stock index dropped 92% from its peak — a level it still hasn't recovered a quarter-century later. That "wasted" fiber went on to carry Netflix, YouTube, and everything after ([Financial Advisor Magazine](https://www.fa-mag.com/news/what-history-tells-us-about-the-ai-investment-boom-87567.html)).
- **Dot-com, 1999–2000.** Amazon survived a 93% peak-to-trough collapse and reinvented retail; most of its contemporaries simply didn't ([Market Histories](https://www.markethistories.com/en/the-dot-com-bubble-irrational-exuberance-and-the-internet-gold-rush-1995-2000)). The survivors, in hindsight, weren't the best *ideas* — they were the best *operators*, obsessive about logistics, margins, and cash flow.

The recurring shape is unmistakable: an infrastructure build-out creates enormous, lasting value for the economy while destroying most of the shareholder capital that financed it, and the eventual winners are both rare and nearly impossible to identify in advance. That's the same conclusion the survivorship data reaches from the other direction.

## What this actually means

I want to be careful about the claim here, because it's easy to overshoot. This is **not** a prediction that AI fails as a technology — the base case is probably the opposite, just as the internet was never the thing that failed. It's a much narrower point about the gap between two very different bets:

1. The more a valuation leans on distant cash flows, the more fragile it is — to the risk the company doesn't survive to deliver them, *and* to the well-documented tendency of long-dated growth forecasts to come in short.
2. Even if you're certain a technology will reshape the world, capturing that as a *shareholder* is a completely separate and much harder problem than being right about the *technology*.

Society winning and shareholders winning are not the same event, and history keeps stapling them apart. That's not a claim that AI is useless — the individual-level gains are real, and I've written about how [AI has helped me]({{< relref "posts/ai-beats-procrastination/" >}}) in ways no corporate P&L will ever capture. But personal usefulness and shareholder returns are different questions. If there's a practical takeaway, it's the unglamorous one the S&P survivor data already handed us: owning the broad basket and sitting still beats trying to hand-pick which specific names will still be standing in thirty years. The math of duration and the history of survival both point the same way.

*This is a personal analysis for a general audience, not investment advice. I'm not a financial advisor; do your own research and consider your own situation.*

Read also:

- [From Developers to Scientists: How AI is Transforming Code Complexity]({{< relref "posts/ia-desenvolvimento-software-complexidade-codigo/" >}})
- [From Procrastination to Progress: How AI has helped me]({{< relref "posts/ai-beats-procrastination/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
