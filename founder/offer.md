# Offer: Greenside Founding Club

Method: the Offers lens (`.claude/skills/founder-board/lenses.md`), a summary of a
published framework, applied to what the board, the competitor map and the buyer panel
found. No CFO numbers exist yet (`founder/numbers.json` is missing), so every cost
score below is an **estimate** and every money promise is marked for `/founder-cfo`.

## 1. The problem list (in the buyer's words)

Sources: panel v1 (`founder/panel/results.md`, 20 of 20 passed), board (`founder/board.md`),
competitors (`founder/competitors.md`).

Before buying
1. "No club is live yet, not even Zwolle: where are the references?" (panel, 15 × trust)
2. "Two founders: what happens to our members, invoices and tee sheet if they stop?" (panel, almost all)
3. "I can't take an unproven vendor to the members' meeting (ALV)." (panel)
4. "We just migrated off E-Golf4U; the volunteers can't take another switch." (panel, 3 × timing)
5. "Our current system works well enough and the vendor knows us." (panel, 2 × habit)
6. "Will we pay twice: the old system and Greenside side by side?" (panel)
7. "€ 249 a month is a lot for a 9-hole volunteer club." (panel price answers: 9 holes find € 225 expensive)
8. "Plus a migration fee of € 750–1,500 on top." (panel)
9. "Does it work with the NGF handicap and our direct debit?" (panel)
10. "GOLF.NL is free and already books tee times and takes payment." (panel, competitors)
11. "Nothing in the offer says it brings in more revenue." (panel P012, P020)
12. "The budget for next year is decided at the spring meeting." (panel)

During the switch
13. "Migrating 550–1,350 members, our invoices and tee sheet is a project, not less work." (panel)
14. "Members over 60 won't install a new app or log in with e-mail codes." (panel)
15. "If half the members phone the secretary to book, we're worse off." (panel P017)
16. "Who helps a member when a login code doesn't arrive on Saturday morning?" (board)
17. "A failed import or iDEAL problem puts the whole membership at my desk." (panel P020)
18. "Members lose their friend groups for booking" (competitor complaint, De Kroonprins).

After
19. "Does it last, or is this a hobby project?" (panel, board)
20. "Can we leave, with our data, without a penalty?" (panel)
21. "How do we know it pays for itself?" (board: value is an unmeasured estimate)
22. "What do we tell the members' meeting after a year?" (panel)

## 2. Solutions, scored

Value to the buyer 1–5 (from how often the panel raised it). Cost to deliver 1–5
(estimate, mostly founder time; to be priced by `/founder-cfo`).

| # | Solution | Answers | Value | Cost | Keep? |
| --- | --- | --- | ---: | ---: | --- |
| A | **Pilot next to the current system**: 3 months for the board and a group of members; nothing is cancelled until it works | 4, 6, 13, 3 | 5 | 2 | ✔ core |
| B | **Success agreed in writing before the pilot** (e.g. 40% of members active); not reached = walk away | 1, 21, 22, 3 | 5 | 1 | ✔ guarantee |
| C | **Stop after the pilot and pay nothing** (no licence, no migration fee) | 1, 8, 20 | 5 | 3 (unpaid founder time if a club stops) | ✔ guarantee |
| D | **Data guarantee in the contract**: export of all members, invoices, bookings at any time; 12 months' notice and full handover if Greenside stops | 2, 19, 20 | 5 | 2 (full export still to build) | ✔ bonus |
| E | **We do the migration and member launch**: import, invitations, printed guide for older members | 13, 14, 17 | 4 | 2 | ✔ bonus |
| F | **Helpline in the first four weeks, Saturday mornings included** | 15, 16, 17 | 4 | 3 (founder time on weekends) | ✔ bonus |
| G | **Reference call with Zwolle's board** before deciding, once Zwolle is live | 1, 3 | 5 | 1 | ✔ (true only after Zwolle is live) |
| H | **9-hole founding price € 179** (was € 249) | 7 | 4 | 2 (lower revenue) | ✔ test; `/founder-pricing` decides |
| I | **No migration fee for founding clubs** | 8 | 3 | 2 | ✔ |
| J | Source-code escrow with a third party | 2, 19 | 4 | 4 (yearly fee, unknown) | ✘ for now: D covers most of it; revisit with CFO |
| K | NGF handicap link and direct debit in the product | 9 | 4 | 5 (not built; direct debit removed from the pilot) | ✘ not promised; product decision |
| L | Revenue guarantee ("earns back the licence or we refund") | 11, 21 | 4 | 4 (claim rate unknown) | ✘ until CFO models it; B is the safe version |
| M | Run as member app only on top of the old system | 6, 13 | 4 | 5 (needs integrations) | ✘ not deliverable now |

**Must exist before the first sale:** full data export (members exists; invoices and
bookings still to build), a contract with clauses B, C and D, the printed member guide,
and a helpline arrangement.

## 3. The stack

- **Name:** *Greenside Founding Club*
- **The core:** your club's own app in the stores, run from one place, tried for three
  months next to your current system before anything changes (A).
- **The guarantee:** success criteria agreed in writing before the pilot; miss them, or
  simply want to stop, and you pay nothing (B + C).
- **Bonuses:**
  1. *Your data stays yours*: export anytime; 12 months' notice and full handover if
     Greenside stops (D). Kills objection 2.
  2. *We do the work*: import, invitations, a printed guide for older members (E). Kills
     13 and 14.
  3. *Saturday-morning helpline* for the first four weeks (F). Kills 15–17.
- **Urgency and scarcity (real):** ten founding clubs at € 179 (9 holes) or € 399 (18+),
  fixed for two years, no migration fee (H, I). The other real urgency is external:
  E-Golf4U is being retired, so many clubs must choose now.
- **Proof:** a call with Zwolle's board once Zwolle is live (G). Not before; the pitch
  says so.

## 4. Value equation (1–10, before → after)

| | Before (pitch v1) | After (Founding Club) | What moves it |
| --- | ---: | ---: | --- |
| Dream outcome | 5 | 6 | Success defined with the club; still no revenue proof |
| Perceived likelihood | 2 | 4 | Written success criteria, data guarantee, Zwolle reference *later*. Stays low until Zwolle is live |
| Time to result | 4 | 5 | Pilot next to the old system, no big-bang switch |
| Effort and sacrifice (lower = better, scored as relief) | 3 | 6 | We do the migration, printed guide, helpline, stop for free |

The weakest score stays **likelihood**: no offer replaces a live reference club.

## 5. Re-test

Same 20 simulated decision-makers (seed 682799), new pitch (`founder/pitch.md`; the old
one is `founder/pitch-v1.md`). Results in `founder/panel-v2/`.

**Result: 0 buy · 20 pass, before and after.** The new offer did not move the buy rate.
Language models lean agreeable, so a 0 here is a strong signal, not noise.

| | Pitch v1 | Founding Club (v2) |
| --- | ---: | ---: |
| Buy | 0 / 20 | 0 / 20 |
| Reason: trust | 15 | 11 |
| Reason: timing | 3 | 6 |
| Reason: habit | 2 | 3 |

What moved (counted across the 20 answers)
- **Data and continuity fear dropped:** export or escrow demanded in 10 answers before,
  3 after. Bonus D works on paper; buyers now call it "paper safeguards" but stop asking for it.
- **Trust became timing:** four buyers moved from "I don't trust it" to "not now / next
  budget round / next contract renewal". The offer made Greenside plausible later, not now.
- **Zwolle is the whole case:** 10 answers named Zwolle before, **19 of 20** after. Almost
  every "what would change my mind" is: *Zwolle live for a season, its board on the phone,
  older members actually using it.*

What did not move, or got worse
- **Double work during the pilot:** 2 answers before, 9 after. "Pilot next to the current
  system" reads as two systems and extra volunteer work, not as safety.
- **Cost on top of the current vendor:** 7 both times. Treasurers want to see that
  Greenside *replaces* a bill, not adds one.
- **NGF handicap and direct debit:** still named as a must (5 and 3 answers). Not promised (K).
- **Two founders:** still in almost every answer; no offer element can fix it.
- **9-hole price:** median "getting expensive" fell from € 225 to € 200, "too expensive"
  € 300; the € 179 founding price sits just under it. 18 holes: € 399 is inside the range
  (median bargain € 250, expensive € 550). 27+ holes: unchanged (expensive € 650).

Conclusion: the problem is not the offer but **proof**. No stack replaces a live
reference club. What to change:
1. Get Zwolle live and measured first (the board's condition); every other sale waits on it.
2. Reword the pilot as "we run it, your volunteers don't" and show which current costs it
   replaces (a side-by-side of the club's software bill), instead of "next to your system".
3. Decide on NGF handicap and direct debit (product), because they block "replace".
4. Price questions go to `/founder-pricing`; the guarantee and support cost to `/founder-cfo`.

These are simulated buyers: use the objections, not the numbers, and confirm with real
club boards.
