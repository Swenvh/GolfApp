# CFO: Greenside

**Read this first.** The tool prints `€ ` and "a day"; here every amount is in **euros, excl.
21% VAT**, and "at once" means **clubs paying at the same time**. One unit = one paying club for
one month. Inputs: `founder/numbers.json` (founders unpaid, today's reality) and
`founder/numbers-met-salaris.json` (same, plus € 2,500 a month for each founder). Prices from
`founder/pricing.md` (price per member, three tiers); guarantees from `founder/offer.md` section 6;
costs checked by `/founder-ops`. Sources and estimates: `founder/cfo-sources.md`. Not financial, tax or
legal advice: have an accountant check the structure, payroll costs and VAT before money moves.

## The CFO's note

**What year 1 is.** The first three clubs (Zwolle and two more) are **pioneers at € 0.39 per member**,
on average **€ 362.70** a club-month. That is the price in the model below. Each pioneer club leaves
**€ 250.20 a month** (69%) after onboarding and pilot (€ 35), the overlap and budget-year guarantee
(€ 67, an estimate: on average ~4 months later start, spread over 24 months) and hosting (€ 10).
Founding clubs (€ 0.49) leave € 343.20, list clubs (€ 0.65) € 492. Running costs without pay are
**€ 533 a month** (now including escrow ~€ 85 and an IT partner on standby ~€ 50), so **3 pioneer
clubs cover them**.

**What the guarantees cost.** Year 1 goes from € +146 (per-member price without the new guarantees and
without the pioneer tier) to **€ -3,394**: ~€ 1,100 from the pioneer discount, ~€ 1,600 from escrow and
the IT partner, ~€ 800 from the overlap guarantee (each over the 12 paying club-months of year 1). That is the price of taking the risk off the clubs.

**The line to watch: founder pay.** € 2,500 each makes fixed costs € 5,533 a month. The real path is
**3 pioneers + 7 founding + 5 list = 15 clubs** (6% of the 263 NGF clubs, within the ~25 two people can
serve). At 3 clubs you still lose about € 4,800 a month with pay.

**The ramp.** Zwolle runs a free pilot in months 1–3 and pays from month 4; the next clubs sign once
Zwolle has proof (month 11: 2, month 12: 3). The panel backs this: 0 of 20 buy now, 20 of 20 wait for
Zwolle. Year 1 brings in **€ 4,352**. The overlap guarantee can push real first payments later than
this ramp; the € 67 a month above is the estimate for that.

**Cash.**
- Founders unpaid: you need **€ 14,034** before it pays for itself (start-up € 10,423: security test
  € 7,500, lawyer € 2,500). Year 1 operating result: **€ -3,394**.
- Founders paid € 2,500 each from month 1: **€ 73,817** in year 1.
- The middle way: **pay grows with the clubs.** At 3 pioneer clubs there is about € 220 a month above
  costs; full pay comes at ~15 clubs, on this ramp in year 2 to 3.

**Ways to improve it** (what-ifs; unpaid):
1. **Escrow and IT partner from club 3 instead of day one** (Zwolle knows you): year 1 € -3,394 →
   **€ -1,774**.
2. **Zwolle pays from month 1** (it is the reference club, not a prospect) **and Expo Starter** while there
   are few apps: year 1 → **€ -1,779**. Each on its own: € -2,643 and € -2,530.
   **All of 1 and 2 together: year 1 € -159.**
3. **No overlap guarantee for E-Golf4U clubs** (they have no old contract to overlap): saves part of the
   € 67; without it entirely, year 1 → € -2,590.
Giving the first clubs the founding price (€ 0.49) instead of the pioneer price would give € -2,278; the
pioneer discount costs ~€ 1,100 in year 1 and is the one lever aimed straight at "nobody wants to be
first".

**The board's money conditions** (`founder/board.md`):
- *Cost to win one club, cost to run one club, clubs to break even:* **answered, as estimates.** Winning a
  club costs ~€ 560 cash plus ~40 founder hours (~€ 830 per paying club with 1 in 3 pilots walking away),
  plus ~€ 1,600 of later start from the overlap guarantee. Running one costs ~€ 11 a month in cash.
  Break-even: 3 pioneer clubs unpaid, 15 clubs with € 2,500 each.
- *A guarantee the business can afford:* **met**, with the costs above in the numbers. The revenue
  guarantee from the breakthrough plan stays off until Zwolle's numbers exist.
- *At least 3 founding clubs signed before building further:* **not met**; month 12 at the earliest.

**Verdict.** Every tier is profitable per club, but the guarantees and the pioneer discount put year 1 at
**€ -3,394** and push full pay to ~15 clubs. That is a deliberate trade: money now for removing every
objection except proof. Decide which levers above to pull before signing the first contract.

---

## Scenario A: founders unpaid (today)


### One club-month

| line | per club-month |
| --- | ---: |
| Price | € 362.70 |
| Onboarding, free pilot and walk-away guarantee, spread over the 24-month founding term (estimate, updated by /founder-ops: printed guide ~EUR 300) | € -35.00 |
| Overlap and budget-year guarantee: on average ~4 months later start of the licence after the pilot, spread over 24 months (estimate) | € -67.00 |
| Hosting share per club: database growth, e-mail above the bundle, app builds (estimate) | € -10.00 |
| Apple developer account: EUR 0 for Greenside, the club enrols itself (Apple guideline 4.2.6; see ops.md) | € -0.00 |
| Collecting the licence by SEPA direct debit (estimate) | € -0.50 |
| **Contribution** (what each club-month leaves to pay the fixed costs) | **€ 250.20** (69%) |

### The margin that matters

Fixed costs: € 533 a month (Founder pay (none today: founders unpaid; see the second scenario) € 0, Expo EAS Production, USD 99 (public price) € 89, Supabase Pro + Small compute + staging project, ~USD 40 (public price) € 36, Vercel Pro, 1 seat, USD 20 (public price) € 18, Resend Pro, 50,000 e-mails, USD 20 (public price) € 18, Accountant and bookkeeping (estimate) € 100, Liability (BAV, ~EUR 61 indication) and cyber insurance (estimate) € 100, E-mail accounts for 2 founders (estimate) € 14, Helpline phone number (estimate) € 15, Greenside's own Apple developer account, EUR 99 a year (public price) € 8, Source-code escrow, ~EUR 1,000 a year (estimate, quote needed) € 85, IT partner on standby for continuity (estimate, quote needed) € 50).

- **Break-even: 3 club-months at once.** Below that you lose money every month.
- **Profit margin at your plan** (10 at once): **54%** of every sale, after every cost.
- Capacity: 25 at once.

### Year 1, month by month

| month | club-months at once | revenue | profit | cumulative (after € 10,423 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | € 0 | € -533 | € -10,956 |
| 2 | 0 | € 0 | € -533 | € -11,489 |
| 3 | 0 | € 0 | € -533 | € -12,022 |
| 4 | 1 | € 363 | € -283 | € -12,305 |
| 5 | 1 | € 363 | € -283 | € -12,588 |
| 6 | 1 | € 363 | € -283 | € -12,870 |
| 7 | 1 | € 363 | € -283 | € -13,153 |
| 8 | 1 | € 363 | € -283 | € -13,436 |
| 9 | 1 | € 363 | € -283 | € -13,719 |
| 10 | 1 | € 363 | € -283 | € -14,002 |
| 11 | 2 | € 725 | € -33 | € -14,034 |
| 12 | 3 | € 1,088 | € 218 | € -13,817 |

- **Year 1 operating profit: € -3,394** on € 4,352 of revenue.
- After the € 10,423 startup spend: € -13,817.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **€ 14,034**.

### What if

| scenario | margin at plan | break-even at once | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 54% | 3 | € -3,394 |
| Price -10% | 49% | 3 | € -3,829 |
| Volume -20% | 51% | 3 | € -3,994 |
| Unit costs +15% | 50% | 3 | € -3,596 |

### Red flags

- Year 1 loses money on operations (€ -3,394).
- The startup spend is not earned back within year 1.

---

## Scenario B: founders paid € 2,500 a month each


### One club-month

| line | per club-month |
| --- | ---: |
| Price | € 362.70 |
| Onboarding, free pilot and walk-away guarantee, spread over the 24-month founding term (estimate, updated by /founder-ops: printed guide ~EUR 300) | € -35.00 |
| Overlap and budget-year guarantee: on average ~4 months later start of the licence after the pilot, spread over 24 months (estimate) | € -67.00 |
| Hosting share per club: database growth, e-mail above the bundle, app builds (estimate) | € -10.00 |
| Apple developer account: EUR 0 for Greenside, the club enrols itself (Apple guideline 4.2.6; see ops.md) | € -0.00 |
| Collecting the licence by SEPA direct debit (estimate) | € -0.50 |
| **Contribution** (what each club-month leaves to pay the fixed costs) | **€ 250.20** (69%) |

### The margin that matters

Fixed costs: € 5,533 a month (Founder pay: 2 founders x EUR 2,500 a month (the founders' target; what it costs the company depends on the legal form, check with an accountant) € 5,000, Expo EAS Production, USD 99 (public price) € 89, Supabase Pro + Small compute + staging project, ~USD 40 (public price) € 36, Vercel Pro, 1 seat, USD 20 (public price) € 18, Resend Pro, 50,000 e-mails, USD 20 (public price) € 18, Accountant and bookkeeping (estimate) € 100, Liability (BAV, ~EUR 61 indication) and cyber insurance (estimate) € 100, E-mail accounts for 2 founders (estimate) € 14, Helpline phone number (estimate) € 15, Greenside's own Apple developer account, EUR 99 a year (public price) € 8, Source-code escrow, ~EUR 1,000 a year (estimate, quote needed) € 85, IT partner on standby for continuity (estimate, quote needed) € 50).

- **Break-even: 23 club-months at once.** Below that you lose money every month.
- **Profit margin at your plan** (10 at once): **-84%** of every sale, after every cost.
- Capacity: 25 at once.

### Year 1, month by month

| month | club-months at once | revenue | profit | cumulative (after € 10,423 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | € 0 | € -5,533 | € -15,956 |
| 2 | 0 | € 0 | € -5,533 | € -21,489 |
| 3 | 0 | € 0 | € -5,533 | € -27,022 |
| 4 | 1 | € 363 | € -5,283 | € -32,305 |
| 5 | 1 | € 363 | € -5,283 | € -37,588 |
| 6 | 1 | € 363 | € -5,283 | € -42,870 |
| 7 | 1 | € 363 | € -5,283 | € -48,153 |
| 8 | 1 | € 363 | € -5,283 | € -53,436 |
| 9 | 1 | € 363 | € -5,283 | € -58,719 |
| 10 | 1 | € 363 | € -5,283 | € -64,002 |
| 11 | 2 | € 725 | € -5,033 | € -69,034 |
| 12 | 3 | € 1,088 | € -4,782 | € -73,817 |

- **Year 1 operating profit: € -63,394** on € 4,352 of revenue.
- After the € 10,423 startup spend: € -73,817.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **€ 73,817**.

### What if

| scenario | margin at plan | break-even at once | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | -84% | 23 | € -63,394 |
| Price -10% | -104% | 26 | € -63,829 |
| Volume -20% | -122% | 23 | € -63,994 |
| Unit costs +15% | -88% | 24 | € -63,596 |

### Red flags

- Year 1 loses money on operations (€ -63,394).
- The startup spend is not earned back within year 1.
