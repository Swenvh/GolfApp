# Pricing: Greenside

Amounts in euros per month, excl. 21% VAT. Buyer answers are simulated (`founder/pricing-curve.md`):
they pick what to test, they are not proof. Margins come from `unit_economics.py` on
`founder/numbers.json` (founders unpaid) and `founder/numbers-met-salaris.json` (2 × € 2,500).

## 1. The price

| | 9 holes | 18 holes | 27+ holes |
| --- | ---: | ---: | ---: |
| **List price** | **€ 199** (was € 249) | **€ 449** (same) | **€ 599** (same) |
| **Founding price** (first ten clubs, fixed two years) | **€ 179** (same) | **€ 399** (same) | **€ 499** (was € 399) |
| Buyers' acceptable range | € 75 – 251 | € 151 – 600 | € 152 – 752 |
| Buyers' "bargain = expensive" point (IPP) | € 151 | € 300 | € 352 |

Why:
- **9 holes: list € 249 → € 199.** € 249 sat right on the edge of what volunteer boards accept
  (PME € 251); their median "getting expensive" is € 220. € 199 is inside the range, and the step
  to the € 179 founding price stays real. 9-hole clubs are 25% of the market, so this costs little:
  blended list price € 429 → € 416.50.
- **18 holes: unchanged.** € 449 and € 399 are well inside the range; 3 of 22 answers say outright
  that price is "not the problem" or "small money". The doubt is trust, not price.
- **27+ holes founding € 399 → € 499.** € 399 for a 1,350-member club was a 33% discount, more
  than needed: € 499 is still below their "getting expensive" median of € 650. It adds € 20 to the
  blended founding price (€ 344 → € 364).
- **Drop "two months free when paying a year up front".** That is a 17% discount clubs did not ask
  for. Clubs budget per year anyway: invoice yearly in advance at the normal price, or monthly.
- **Keep the migration fee for clubs after the first ten** (€ 750 for 9 holes, € 1,500 for 18+): it
  pays for the work in "We do the work". Founding clubs pay none.

**Against competitors.** No one publishes Dutch prices, except one data point: Nexxchange GolfSuite
lists **€ 200 a month plus € 50 per simultaneous user**, plus a one-off installation fee
([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/),
[GetApp](https://www.getapp.com/recreation-wellness-software/a/nexxchange-golfsuite/pricing/),
[G2](https://www.g2.com/products/nexxchange-golfsuite/pricing); aggregator sites, confirm with a
quote). An 18-hole club with 3–5 people at the desk, secretariat and finance would pay about
**€ 350–450** (estimate). So € 449 is the price of a *whole* club system. That is the sales line,
and also the risk:
- If Greenside **replaces** the current system, € 449 is roughly the same bill with a club app on
  top. That is the answer to "it comes on top of what we pay" (7 of 20 answers).
- If it runs **next to** the current system, it doubles the software bill, and treasurers say no.
  Without the NGF handicap link and direct debit, many clubs cannot fully replace it (`founder/offer.md`, K).

**The margin** (tool output, per club-month; costs as updated by `/founder-ops`):

| price | contribution | break-even, unpaid | break-even, 2 × € 2,500 |
| --- | ---: | ---: | ---: |
| Founding mix € 364 | € 318.50 (88%) | 2 clubs | 17 clubs |
| List mix € 416.50 | € 371 (89%) | 2 clubs | 15 clubs |
| Old list mix € 429 | € 383.50 (89%) | 2 clubs | 15 clubs |

Only ten clubs get the founding price, so the real path is **10 founding clubs + 6 at list price =
16 clubs** to pay both founders € 2,500 (5,398 − 10 × 318.50 = 2,213; ÷ 371 = 6.0 → 6).
That is 6% of the 263 NGF clubs, and below the 25 clubs two people can serve.

## 2. The ladder

Clubs don't choose a size; they have one. So the ladder is not "good / better / best" but:
1. **By course size** (9 / 18 / 27+), above. The step up follows the number of members and
   desk staff, which is what clubs already expect from Nexxchange's per-user pricing.
2. **Add-ons later, only when built and wanted**: NGF handicap link, direct debit, a link to the
   bar's cash register (unTill), the ball machine (Xafax). Each one is a reason the club can drop
   another system, so price them per add-on, not in the base. Do not sell them before they exist.

## 3. The opening offer

**Greenside Founding Club**: the first ten clubs pay the founding price, fixed for two years, no
migration fee, and get the free three-month pilot with written success criteria.
- **End date:** the founding price applies to clubs whose pilot starts **before 1 July 2027**, or
  until ten clubs have signed, whichever comes first. Pick the date yourselves, but put a real one
  in writing and keep it.
- **After two years** the club moves to the list price at that time. Write this in the contract,
  so the founding price is a real, dated deal and not a "was" price.
- The list prices above are what club 11 onward actually pays, so the comparison is honest.

## 4. What to test with real buyers

Simulated answers are not enough. Test with real club boards, starting with Zwolle's contacts and
the E-Golf4U clubs that have to switch anyway:
1. **18 holes: € 399 vs. € 449 founding price.** Half the board conversations get one price sheet,
   half the other (alternate, don't choose). Measure: how many ask for a pilot or sign a letter of
   intent. If € 449 converts as well, the founding discount is not needed.
2. **9 holes: € 149 vs. € 179 founding price**, same method. € 149 sits at their "bargain =
   expensive" point (€ 151); test whether it opens the volunteer clubs.
3. Ask every board **what they pay their current vendor today** (licence, per user, add-ons). That
   is the number that decides "replace, not add", and nobody publishes it.

## 5. The panel's price objections (verbatim, for marketing)

1. **"It comes on top of what we already pay."**
   "A free pilot sounds harmless, but after it we would be paying close to 5,000 euros a year on
   top of our current vendor, and that has to go through the next budget round with a clear
   return." (P005, 18 holes, v2)
2. **"We'll pay twice if it doesn't replace our system."**
   "Does it work with the NGF handicap system and our direct debit? If not, we'd run two systems
   and pay twice." (P013, 9 holes, v1)
3. **"Small clubs have to defend every euro, and GOLF.NL is free."**
   "At roughly 3,000 euros a year this has to go to the members' meeting, where half the room will
   say GOLF.NL is free and already does tee times." (P014, 9 holes, v2)

These are simulated buyers' words: use them to write answers, never as quotes from customers.
