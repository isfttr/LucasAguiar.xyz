---
date: 2026-08-22T15:39:36.000Z
draft: true
title: What Happens When You Leverage a 166-Year-Old Thesis? The Collapse of the Situational Awareness Fund [2026]
description: 'Rose 439% with 4x leverage and was liquidated in weeks: what the collapse of the Situational Awareness fund teaches about expected return and duration.'
featured_image: ''
categories:
  - opinion
tags:
  - ai
  - valuation
  - investing
  - ai-bubble
  - markets
  - alavancagem
slug: situational-awareness-fund-collapse
translation_source_hash: a91b5053cfee2f74775d127acf0f1be6c81742dfdfeebe3c594f91e12636784d
---
On June 24, 2026, Leopold Aschenbrenner, 24, was being treated as the next Warren Buffett. His fund, Situational Awareness, had just delivered what looked like the best return of a large fund in the world: +439% net in less than two years. Five weeks later, the fund no longer existed — the entire public book, including both long and short positions, was sold in a single block to Citadel, at a discount, after a cascade of margin calls.

This text is the direct continuation of the post about [how many years of cash flow a stock price represents]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}}). There, the argument was about the expected return embedded in highly valued companies: the smaller the difference between the discount rate and perpetual growth, the further in the future the value resides — and the more fragile the bet becomes in the face of survival risk. Aschenbrenner's fund took exactly that bet, the longest and most fragile on the table, and multiplied it by four with debt. What the collapse shows is what happens when the mathematics of duration meets the arithmetic of leverage: time, the only thing the thesis needed, is the first thing margin takes from you.

## The case in numbers

Aschenbrenner is a product of the AI ecosystem he bet would win: born in Germany in 2001, entered Columbia at 15, worked at Sam Bankman-Fried's FTX fund, was an AI safety researcher at OpenAI and left (fired, according to OpenAI; disputed by him) in 2024, shortly after publishing the viral 165-page essay *Situational Awareness: The Decade Ahead* — the thesis that superintelligent artificial intelligence would arrive "soon" and transform the world. Months later, he founded the eponymous fund with about US$5 million from investors such as the Collison brothers (Stripe), Nat Friedman and Daniel Gross — and, unusually, Jane Street ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/)).

The investment thesis was simple and direct: AI will win, and it will win fast. Buy the "picks and shovels" of infrastructure construction — energy, computing, storage — and short the software and companies that AI would destroy. It is not a rare view; Damodaran notes that much of Big Tech's AI capex is driven by the same belief. What distinguished the fund was the intensity with which the belief was converted into positions:

| Metric | Value |
|---|---|
| Net return through 06/30/2026 (H1 letter, via FT) | +439% |
| High-water mark return (Damodaran, Aug/25 → Jun/26) | +367% |
| Nasdaq in the same period | +24% |
| Peak assets | ~US$45 billion |
| Launch (end of 2024) | ~US$5 million |
| Reported leverage | up to 4x (400%) |
| Concentration (13F Q1/26) | US$1.86 billion in 26 positions; top 5 = 76% |
| July outcome | -2/3 of public value; fund liquidated |

The concentration of the first-quarter 2026 13F tells the story by itself: Bloom Energy (22.8%), SanDisk (18.8%), CoreWeave (14.4%), IREN (10.4%) and Core Scientific (10.1%) added up to 76% of the disclosed book — energy, memory and GPU cloud companies, many of them young, cyclical and with a valuation entirely built on the distant future ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/), [CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)).

In July, the sector the fund bought turned against it all at once: Nebius, SanDisk, Micron and CoreWeave fell between 27% and 54% in the month, the Nasdaq 100 retreated more than 10% and the Kospi — home to SK Hynix, another fund position — lost about a third. With 4x leverage, a 25% decline in collateral is not a drawdown: it is the end. On July 29, Citadel started trading; on July 30, the fund sold the entire public book in a single block before the open, and was liquidated. Assets fell from US$45 billion to about US$10 billion — the hole was not bigger only because the private position in Anthropic was not marked to market ([CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)). On August 21, Ken Griffin confirmed that Citadel had already unwound more than 80% of the purchased risk, in more than 100 block trades totaling US$4 billion ([CNBC](https://www.cnbc.com/2026/08/21/citadel-situational-awareness-ken-griffin.html)).

## Back to the previous post: expected return lives out there

In the previous post, the table showed when 90% of a stock's value is delivered, given the spread between the discount rate and perpetual growth. The extreme case — growth with a 1.5% spread — pushed 90% of the value to ~166 years in the future. The conclusion was twofold: cash flows that distant tend to disappoint (duration research shows that "long-duration" stocks do not deliver higher growth), and most companies do not survive even 30 years, let alone 166.

Notice what the fund actually bought: it was not the megacaps with robust cash flow, but the second derivative of infrastructure — young, cyclical energy, memory and GPU cloud companies, the type of asset where price uncertainty is maximal. In Damodaran's framework, a young company is exactly where conviction should be *lower*: valuation uncertainty is enormous, correction catalysts are few (young companies' balance sheets carry no information), and the timing of any correction is unpredictable. Less conviction should mean more diversification and almost no leverage.

The fund did the exact opposite: 4x debt, 76% in five names, all in the same macro thesis. Damodaran sums up the error in one sentence: he treated an extremely high-risk macro bet — "AI wins soon" — as if it were a mispriced bond, with finite maturity and guaranteed correction. "Why are you acting as if it were a mispriced bond, borrowing 400%?" ([Damodaran, *Lessons from Leo: The Dark Side of Investment Conviction*](https://youtu.be/dNEWqinHrW8)).

## The arithmetic of leverage: expected return becomes ruin

Here is the direct bridge to the previous post. There, survival risk was a silent discount on present value: companies die before paying the distant cash flows, so the expected realized value falls below what the perpetuity "promises". Aschenbrenner's fund is that same risk, but applied to the investment vehicle rather than the company.

Leverage does not change the expected return of the thesis — it changes the *distribution* of outcomes. It multiplies both sides: +20% from the thesis becomes +80% on equity with 4x; -20% becomes -80%. And it adds a point of no return that the pure thesis did not have: the margin call. With 4x, a ~25% drop in collateral triggers a capital call; if you cannot or will not put up more capital, the book is sold *at the worst moment*, turning a mark-to-market loss — which a long horizon could hope to reverse — into a realized, permanent loss. The forced liquidation on July 30 is that in its purest form.

That is why the reported return is not the expected return. +439% is the realization of *one* path drawn from a fat-tailed, leveraged distribution — not the average of possible outcomes. Damodaran also points out that much of the "alpha" was momentum: the longs had positive momentum and the shorts had negative momentum, exactly where the market already was. When momentum turned, the entire book turned with it. The AI thesis may even be right; it was the investment structure that did not survive to find out.

## What this means

Three lessons, all continuations of the previous post:

1. **Reported return ≠ expected return.** A 439% return in a 4x-leveraged fund is not evidence that the thesis was right — it is evidence that leverage amplified a favorable path. The previous post showed that the market pays more for distant cash flows and they disappoint; here the multiplier converted disappointment into extinction.

2. **Survival risk applies to the vehicle, not only to the company.** The lesson from the S&P longevity data was: owning the broad basket and staying put beats trying to pick the thirty-year winners. A fund with 4x debt does not survive even a bad month. Leverage is the antithesis of "don't die".

3. **Structure matters as much as the thesis.** The same US$45 billion bet without debt, diversified, would have taken an ugly hit in July — and the investor would still be in the game. The combination of concentration, leverage and a 2-and-20 fee (Damodaran calls the structure an "abomination") makes the investor pay the worst of both worlds: high fees in both directions and ruin risk. When he asks "who should manage your money — smart money or humble money?", the collapse of this fund is the visual argument.

None of this proves that AI is a bubble — Damodaran himself says the macro story may be right, and the previous post argued that the technology will probably win. What Situational Awareness proves is the narrower and more useful point: in a bet whose value resides decades in the future, the only thing you cannot leverage is time. The mathematics of duration has not changed. The multiplier is what does not forgive.

*This is a personal analysis for a general audience, not investment advice. I am not a financial advisor; do your own research and consider your own situation.*

Read also:

- [How Many Years of Cash Flow Is a Stock Price? Duration, Survivorship, and the AI Capex Boom]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [How Many Years of Cash Flow Is a Stock Price? Duration, Survivorship, and the AI Capex Boom]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [How Many Years of Cash Flow Is a Stock Price? Duration, Survivorship, and the AI Capex Boom]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})

---

You can get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
