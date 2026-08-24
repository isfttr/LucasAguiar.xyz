---
date: 2026-08-22T15:39:36.000Z
draft: false
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
translation_source_hash: f8fe186516670fef5aa8a63de796513c49579b3543c9d889b079294252f06962
---
In late June 2026, Leopold Aschenbrenner, 24, was being treated as the next Warren Buffett. His fund, Situational Awareness, had just delivered +439% net in the first half—the best return of any large fund in the world. Five weeks later, the fund no longer existed: the entire public portfolio, long and short, was sold in a single block to Citadel, at a discount, after a cascade of margin calls.

This text is the direct continuation of [How Many Years of Cash Flow Does a Stock Price Represent? Duration, Survivorship, and the AI Capex Boom]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}}). That post asked how far into the future the value embedded in a stock price lives and concluded: the smaller the spread between the discount rate and perpetual growth (`r − g`), the further out the value resides, and the more fragile the bet becomes in the face of survivorship risk. In the table's most extreme row—growth with a 1.5% spread—90% of the value is delivered only after ~166 years; with historical mortality risk, the horizon shrinks to ~30 years. Aschenbrenner's fund took exactly that bet, the longest and most fragile in the table, and multiplied it by four with debt. This text is about what happens when the mathematics of duration meets the arithmetic of leverage: time, the only thing the thesis needed, is the first thing margin takes from you.

## The case in numbers

Aschenbrenner was an AI safety researcher at OpenAI and left in 2024—fired, according to OpenAI; disputed by him—shortly after publishing the 165-page viral essay *Situational Awareness: The Decade Ahead*, the thesis that superintelligence would arrive "soon." Months later, he founded the eponymous fund with about US$ 5 million from investors such as the Collison brothers (Stripe), Nat Friedman, and Daniel Gross—and, unusually, Jane Street ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/)).

The investment thesis was simple and direct: AI will win, and it will win fast. Buy the "picks and shovels" of the infrastructure buildout—energy, computing, storage—and sell short the software and companies that AI would destroy. It is not a rare view—much of Big Tech's AI capex is driven by the same belief. What distinguished the fund was the intensity with which the belief became a position:

The concentration of the Form 13-F for Q1/2026 tells the story on its own: Bloom Energy (22.8%), SanDisk (18.8%), CoreWeave (14.4%), IREN (10.4%), and Core Scientific (10.1%) amounted to 76% of the disclosed book—energy, memory, and GPU-cloud companies, many of them young, cyclical, and with an entire valuation built on the distant future ([SpotGamma](https://spotgamma.com/situational-awareness-unwind-margin-call-ai/), [CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)).

In July, the sector the fund had bought turned against him all at once: Nebius, SanDisk, Micron, and CoreWeave fell between 27% and 54% in the month, the Nasdaq 100 fell more than 10%, and the Kospi (home of SK Hynix, another position) lost about a third. With 4x leverage, a 25% pullback in collateral is not a drawdown: it is the end. On July 29, Citadel began trading; on July 30, the fund sold its entire public book in a single block before the open and was liquidated. Assets fell from US$ 45 billion to about US$ 10 billion ([CNBC](https://www.cnbc.com/2026/07/31/leopold-aschenbrenner-situational-awareness-fund-fire-sale.html)). On August 21, Ken Griffin confirmed that Citadel unwound more than 80% of the risk it had bought, in more than 100 block trades worth US$ 4 billion ([CNBC](https://www.cnbc.com/2026/08/21/citadel-situational-awareness-ken-griffin.html)).

One detail ties this case to the previous post: the private position in Anthropic, which "saved" the fund's numbers during the downturn, is the type of valuation that post called the most fragile. There, I cited Deutsche Bank valuing OpenAI at ~38x and Anthropic at ~44x future revenue: prices that depend on distant cash flows and are realized only through a liquidity event. Without an event, the reported return is a mark, not a return—and in the collapse, the mark simply did not happen.

## Back to the previous post: the expected return lives out ahead

The previous post supported the thesis on two legs. First, the arithmetic: in the perpetual-growth (Gordon) model, a stock's value is next year's cash flow divided by the spread `r − g`; the smaller the spread, the further out the value resides—the extreme-growth row (1.5% spread) pushes 90% of the value out to ~166 years. Second, the evidence that these distant forecasts disappoint: growth expectations overestimate the future precisely when multiples are already high, high-duration stocks deliver the *same* earnings growth as low-duration stocks (Weber), and survival is the exception—only 61% of listed companies survive 10 years, and the life expectancy of an S&P 500 company fell from ~67 years in the 1920s to ~15-18 years today.

Note what the fund actually bought: not the mega-caps with robust cash flow, but the second derivative of infrastructure—young, cyclical energy, memory, and GPU-cloud companies, the type of asset in which price uncertainty is greatest. According to Aswath Damodaran, a young company is exactly where conviction should be *lower*: valuation uncertainty is enormous, catalysts for correction are few (young balance sheets carry no information), and the timing of any correction is unpredictable. Less conviction should mean more diversification and almost no leverage.

The fund did the exact opposite: 4x debt, 76% in five names, all on the same macro thesis. Damodaran sums up the error: he treated an extremely high-risk macro bet—"AI wins soon"—as if it were a mispriced bond. "Why act as if it were a mispriced bond, borrowing 400%?" ([Damodaran, *Lessons from Leo: The Dark Side of Investment Conviction*](https://youtu.be/dNEWqinHrW8)).

## The arithmetic of leverage: expected return turns to ruin

Here is the direct bridge to the previous post. There, mortality risk was modeled as an increase in the discount rate: companies die before paying the distant cash flows, so the horizon compresses (166 → ~30 years), and the expected realized value falls below what the perpetuity "promises." For a leveraged fund, the relevant "death" event is not the portfolio company—it is the margin call. It behaves exactly like mortality: it truncates the return distribution at the worst moment. Aschenbrenner's fund is that same risk applied to the vehicle, accelerated to the extreme.

Leverage does not change the expected return of the thesis—it changes the *distribution* of outcomes. It multiplies both sides: +20% from the thesis becomes +80% in equity with 4x; -20% becomes -80%. And it adds a point of no return that the pure thesis did not have: the margin call. With 4x, a ~25% decline in collateral triggers the capital requirement; without an injection, the book is sold *at the worst moment*, turning a mark-to-market loss—which a long horizon might expect to reverse—into a realized and permanent loss. The forced liquidation of July 30 is that in pure form: the discounted sale to Citadel realized all at once the worst-case scenario that the previous post's simulation estimated.

That is why the reported return is not the expected return. +439% is the realization of *one* path drawn at random from a fat-tailed, leveraged distribution—not the average of possible outcomes. Damodaran lists the warnings that would have stopped him from entering the fund on June 19: two years of success are a millisecond in market time, 300-400% returns exist only with debt behind them, and the 2-and-20 structure drains the investor in both directions. And much of the "alpha" was momentum: buying positive momentum, shorting negative momentum, wherever the market already was. When momentum turned, the entire book turned with it. The AI thesis may even be right; it was the investment structure that did not survive to find out.

## What this means

The previous post ended by separating two bets: being right about the *technology* and capturing it as a *shareholder* are different problems, and history keeps separating them—railroads, fiber, and dot-com enriched the economy while destroying the capital that financed them. Situational Awareness is the cleanest case of that separation in 2026: Aschenbrenner may be entirely right about AI, and investors still lost. Four lessons, all continuations of the previous post:

1. **Reported return ≠ expected return.** A 439% return in a 4x-leveraged fund is not evidence that the thesis was right—it is evidence that leverage amplified a favorable path. The previous post showed that distant cash flows disappoint; here the multiplier turned disappointment into extinction.

2. **Survivorship risk applies to the vehicle, not just the company.** The previous post documented that four out of ten listed companies disappear within a decade—the fund did not last six days of drawdown. The lesson was: owning the broad basket and staying put beats trying to pick the thirty-year winners. A fund with 4x debt does not survive even a bad month. Leverage is the antithesis of "don't die."

3. **The expected return of a leveraged position depends on when you enter.** The earliest investors, who entered when the fund was small, probably came out with multiples even after the collapse. Those who entered near the peak saw the fund fall ~43% overall (and ~2/3 in the public book), with the discounted liquidation making the loss permanent. In a leveraged bet, arriving late is not just paying more; it is inheriting the tail.

4. **Structure matters as much as the thesis.** The same US$ 45 billion bet without debt, diversified, would have taken an ugly fall in July—and the investor would still be in the game. The combination of concentration, leverage, and the 2-and-20 fee (Damodaran calls the structure an "abomination") makes the investor pay the worst of both worlds: high fees in both directions and risk of ruin. When he asks "smart money or humble money?", the collapse of this fund is the visual argument.

None of this proves that AI is a bubble—Damodaran himself says the macro story may be right. What Situational Awareness proves is the narrower and more useful point: in a bet whose value lives decades in the future, the only thing you cannot leverage is time. The mathematics of duration has not changed. The multiplier is what does not forgive.

*This is a personal analysis for a general audience, not investment advice. I am not a financial advisor; do your own research and consider your own situation.*

]({{< relref "posts/dawkins-claude-consciencia-ia/" >}})
- [Linux vs Windows vs macOS 2026: Complete Comparison and Which to Choose]({{< relref "posts/linux-windows-macos-qual-usar-2026/" >}})

Read also:

- [How Many Years of Cash Flow Is a Stock Price? Duration, Survivorship, and the AI Capex Boom]({{< relref "posts/stock-price-duration-survivorship-ai-capex-2026/" >}})
- [Dawkins, Claude and the Myth of Consciousness in Artificial Intelligence]({{< relref "posts/dawkins-claude-consciencia-ia/" >}})
- [Windows vs Linux vs macOS [2026]: Comparison Table & Verdict]({{< relref "posts/linux-windows-macos-qual-usar-2026/" >}})

---

You can get in touch to talk about this and other topics at <contact@lucasaguiar.xyz>
