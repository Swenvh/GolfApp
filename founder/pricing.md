# Pricing: Greenside

Amounts in euros per month, excl. 21% VAT. Buyer answers are simulated (`founder/pricing-curve.md`):
they pick what to test, they are not proof. Margins come from `unit_economics.py` on
`founder/numbers.json` (founders unpaid) and `founder/numbers-met-salaris.json` (2 × € 2,500).
**Changed on 8 October 2026 from a price per course size to a price per member**, after the founders
asked why Greenside costs less than a few green fees a month. The full reasoning, with the club's value
in green fees, is in `founder/nl/casus-prijs.md`.

## 1. The price

**€ 0.65 per member per month, minimum € 249.**

**Founding clubs (the first ten, fixed two years): € 0.49 per member per month, minimum € 189.**

Members = the members in the club's administration on 1 January, set once a year.

| club | members | list price | founding price | list price per year |
| --- | ---: | ---: | ---: | ---: |
| 9 holes | ~550 | € 358 | € 270 | € 4,290 |
| 18 holes | ~950 | € 618 | € 466 | € 7,410 |
| 27+ holes | ~1,350 | € 878 | € 662 | € 10,530 |
| small club | 300 | € 249 (minimum) | € 189 (minimum) | € 2,988 |

Averages for the market mix (25% / 55% / 20%): **founding € 455.70, list € 604.50** a club-month (was
€ 364 and € 416.50 with the price per course size).

Why per member:
- **It follows the value.** What Greenside earns a club (members who stay, guest rounds, extras, desk
  hours) grows with the number of members. A 1,350-member club gets more out of it than a 550-member one.
- **It is small next to golf money.** For an 18-hole club with 950 members, € 618 a month is € 7,410 a
  year: **100 green fees of 18 holes (€ 74.23)**, about **2 guest rounds a week**, or **5.5 members** who
  don't leave (€ 1,337 a year each). That is 0.6% of the club's membership income.
- **It is easy to say in a board meeting:** "per 100 members, less than one 18-hole green fee a month".
- **It is fair to small clubs** (the minimum keeps very small clubs viable for Greenside) and does not
  punish big ones with a jump between size classes.

What changed against the old prices, and what the panel said:
- **18 holes: € 449 → € 618 list, € 399 → € 466 founding.** The panel's "too expensive" point for 18
  holes was € 600 (median "too expensive" € 800), so € 618 sits right at the edge of what simulated
  buyers accept. That is deliberate: the panel thought in software budgets, not in green fees.
- **27+ holes: € 599 → € 878 list, € 499 → € 662 founding.** Above the panel's "too expensive" point
  (€ 752). Test this one first with real boards.
- **9 holes: € 199 → € 358 list, € 179 → € 270 founding.** Above the panel's point (€ 251) for list;
  the founding price is just above it. Volunteer clubs decide via the members' meeting, so the
  founding price matters most here.
- **Keep**: no "two months free" (invoice yearly in advance at the normal price, or monthly); migration
  fee for clubs after the first ten (€ 750 under 700 members, € 1,500 from 700); no commission.

**Against competitors.** No one publishes Dutch prices, except one data point: Nexxchange GolfSuite
lists **€ 200 a month plus € 50 per simultaneous user**, plus a one-off installation fee
([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/),
[GetApp](https://www.getapp.com/recreation-wellness-software/a/nexxchange-golfsuite/pricing/),
[G2](https://www.g2.com/products/nexxchange-golfsuite/pricing); aggregator sites, confirm with a
quote). An 18-hole club pays about **€ 350–450** for that (estimate). So € 618 is **more than a whole
club system**. That only holds if:
- Greenside **replaces** the current system (its bill disappears), and the app is the extra on top; or
- the value is **measured** (Zwolle) and shown in every conversation.
Without the NGF handicap link and direct debit, many clubs cannot fully replace their system
(`founder/offer.md`, K). That is now the most important product question for the price.

**The margin** (tool output, per club-month; costs as updated by `/founder-ops`):

| price | contribution | break-even, unpaid | break-even, 2 × € 2,500 |
| --- | ---: | ---: | ---: |
| Founding, € 0.49 per member (avg € 455.70) | € 410.20 (90%) | 1 club | 14 clubs |
| List, € 0.65 per member (avg € 604.50) | € 559 (92%) | 1 club | 10 clubs |
| Old founding per size (avg € 364) | € 318.50 (88%) | 2 clubs | 17 clubs |

Only ten clubs get the founding price, so the real path is **10 founding clubs + 3 at list price =
13 clubs** to pay both founders € 2,500 (5,398 − 10 × 410.20 = 1,296; ÷ 559 = 2.3 → 3). That is 5% of
the 263 NGF clubs. All 263 clubs at list price would be ~€ 1.9 million a year (was ~€ 1.3 million).

## 2. The ladder

Clubs don't choose a size; they have one. The price per member is the ladder: it rises with the club.
On top of that, later and only when built and wanted: **add-ons** (NGF handicap link, direct debit, a
link to the bar's cash register (unTill), the ball machine (Xafax)). Each one lets the club drop another
system, so price them per add-on, not in the base. Do not sell them before they exist.

## 3. The opening offer

**Greenside Founding Club**: the first ten clubs pay **€ 0.49 per member** (minimum € 189), fixed for two
years, no migration fee, and get the free three-month pilot with written success criteria.
- **End date:** for clubs whose pilot starts **before 1 July 2027**, or until ten clubs have signed,
  whichever comes first. Put a real date in writing and keep it.
- **After two years** the club moves to the list price at that time. Write this in the contract.
- The list price is what club 11 onward actually pays, so the comparison is honest.

## 4. What to test with real buyers

1. **Founding price € 0.49 vs. € 0.59 per member.** Half the board conversations get one price sheet,
   half the other (alternate, don't choose). Measure: how many ask for a pilot or sign a letter of
   intent. If € 0.59 converts as well, raise the founding price.
2. **Show the sum in every conversation**: what the club pays its current vendor today + what the app
   brings in (guest rounds, members kept) next to Greenside's price. Note which part of the sum convinces.
3. Ask every board **what they pay their current vendor today**. That number decides "replace, not add".

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
