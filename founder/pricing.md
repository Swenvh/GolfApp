# Pricing: Greenside

Amounts in euros per month, excl. 21% VAT. Buyer answers are simulated (`founder/pricing-curve.md`):
they pick what to test, they are not proof. Margins come from `unit_economics.py` on
`founder/numbers.json` (founders unpaid) and `founder/numbers-met-salaris.json` (2 × € 2,500).
**Changed on 8 October 2026 from a price per course size to a price per member** (founders' question:
why cost less than a few green fees a month?), and the same day extended with a pioneer tier, a
maximum, the NGF count and the guarantees from the breakthrough plan (`founder/nl/doorbraakplan.md`). The full reasoning, with the club's value
in green fees, is in `founder/nl/casus-prijs.md`.

## 1. The price

Three tiers, all **per member per month**, set once a year as a **fixed yearly amount**:

| tier | who | price per member | per member per year | minimum / maximum a month | fixed for |
| --- | --- | ---: | ---: | --- | --- |
| **Pioneer** | the first 3 clubs that sign **before Zwolle's pilot results (before 1 June 2027)** | € 0.39 | € 4.68 | € 169 / € 539 | 3 years |
| **Founding** | clubs 4 to 10, pilot starting before 1 July 2027 | € 0.49 | € 5.88 | € 189 / € 679 | 2 years |
| **List** | everyone after that | € 0.65 | € 7.80 | € 249 / € 899 | — |

- **Who counts:** the members registered with the NGF through the club on 1 January. The club already
  knows that number (it pays the NGF levy on it), so there is no discussion about family members,
  juniors or donors.
- **Fixed for the year:** members × price × 12, invoiced yearly in advance or monthly. It does not move
  during the year, so it fits the budget the members' meeting sets.
- **The maximum** applies from about 1,380 members, so only the very largest clubs, and keeps Greenside
  defensible next to a full club system.

| club | members | list | founding | pioneer |
| --- | ---: | ---: | ---: | ---: |
| 9 holes | ~550 | € 358 | € 270 | € 215 |
| 18 holes | ~950 | € 618 | € 466 | € 371 |
| 27+ holes | ~1,350 | € 878 | € 662 | € 527 |
| small club | 300 | € 249 (min.) | € 189 (min.) | € 169 (min.) |

Averages for the market mix (25% / 55% / 20%): pioneer **€ 362.70**, founding **€ 455.70**, list
**€ 604.50** a club-month.

**Why a pioneer tier.** Panel round 3 showed that the founding deadline (July 2027) rewards waiting: "the
founding places are open until July 2027, so I can wait for Zwolle and still get € 0.49" (P020). The
pioneer price rewards the clubs that go *before* the proof, for three years. It is real scarcity: three
places, and it ends when Zwolle's results are in.

Why per member:
- **It follows the value.** What Greenside earns a club (members who stay, guest rounds, extras, desk
  hours) grows with the number of members.
- **It is small next to golf money.** For an 18-hole club with 950 members, € 618 a month is € 7,410 a
  year: **100 green fees of 18 holes (€ 74.23)**, about **2 guest rounds a week**, or **5.5 members** who
  don't leave (€ 1,337 a year each). That is 0.6% of the club's membership income.
- **It is easy to say in a board meeting:** "€ 7.80 per member per year", or "per 100 members, less than
  one 18-hole green fee a month".
- **Panel round 3 accepted it.** Converted to per member: median "bargain" € 0.40, "getting expensive"
  € 0.75, "too expensive" € 1.05. Only 9-hole clubs find € 0.65 "getting expensive" (their point € 0.55).

**The guarantees that come with every tier** (they cost money; see the margin below):
- **No double bill:** the licence starts only when the club cancels its old system, at most 6 months
  after the pilot, and the first invoice falls in the club's next budget year.
- **No double work:** during the pilot we copy the member list from the old system every week (a plain
  CSV export is enough).
- **Safety net for clubs that must leave E-Golf4U:** Greenside replaces E-Golf4U directly. If the pilot
  does not meet its criteria, we move the club's data free of charge to Nexxchange or IntoGolf, in their
  import format.
- **Continuity:** monthly automatic export to the club's own storage, source code in escrow and an
  IT partner on standby (in place before the third club starts), 12 months' notice.
- **Stop after the pilot, pay nothing.** No commission on what members buy. Migration fee only for
  clubs after the first ten (€ 750 under 700 members, € 1,500 from 700).

**Against competitors.** Nexxchange GolfSuite lists **€ 200 a month plus € 50 per simultaneous user**
([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/),
[GetApp](https://www.getapp.com/recreation-wellness-software/a/nexxchange-golfsuite/pricing/),
[G2](https://www.g2.com/products/nexxchange-golfsuite/pricing); aggregator sites, confirm with a quote):
about **€ 350–450** for an 18-hole club (estimate). € 618 is more than a whole club system, so it only
holds if Greenside **replaces** the current system and the app comes on top, shown with the club's own
invoice in every conversation.

**The margin** (tool output, per club-month, including the cost of the guarantees):

| tier | average price | contribution |
| --- | ---: | ---: |
| Pioneer € 0.39 | € 362.70 | € 250.20 (69%) |
| Founding € 0.49 | € 455.70 | € 343.20 (75%) |
| List € 0.65 | € 604.50 | € 492 (81%) |

The guarantees cost ~€ 67 per club-month (later start, spread over 24 months) plus ~€ 135 a month fixed
(escrow, IT partner). To pay both founders € 2,500 (fixed costs € 5,533): **3 pioneers + 7 founding +
5 list = 15 clubs** (5,533 − 3 × 250.20 − 7 × 343.20 = 2,380; ÷ 492 = 4.8 → 5). That is 6% of the
263 NGF clubs. All 263 clubs at list price would be ~€ 1.9 million a year.

## 2. The ladder

Clubs don't choose a size; they have one. The price per member is the ladder: it rises with the club.
On top of that, later and only when built and wanted: **add-ons** (NGF handicap link, direct debit, a
link to the bar's cash register (unTill), the ball machine (Xafax)). Each one lets the club drop another
system, so price them per add-on, not in the base. Do not sell them before they exist.

## 3. The opening offer

**Greenside Pioneer and Founding Club.**
- **Pioneer (3 places):** € 0.39 per member, fixed three years, for clubs that sign before Zwolle's pilot
  results are published (**before 1 June 2027**). They take the most risk and get the most in return.
- **Founding (clubs 4–10):** € 0.49 per member, fixed two years, pilot starting before 1 July 2027.
- Both: no migration fee, the free three-month pilot with written success criteria, and all the
  guarantees above.
- **After the fixed period** the club moves to the list price at that time. Write this in the contract.
- Say how many places are left only as an exact number, and only while it is true.

## 4. What to test with real buyers

1. **Does the pioneer price make clubs go first?** Offer it in every conversation before 1 June 2027 and
   count signatures. If no club takes it, the problem is not price but proof.
2. **Show the sum with the club's own invoice**: what the club pays its current vendor today next to
   Greenside's yearly amount, and what the app brings in. Note which part convinces.
3. **Founding price € 0.49 vs. € 0.59** for clubs 4–10, alternating price sheets.

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
