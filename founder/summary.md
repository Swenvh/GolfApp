# Summary

**What it is.** Greenside gives a Dutch golf club its own member app in the App Store and Google
Play, plus the club management software behind it, and does the switch for the club. It is for the
boards of the 263 NGF clubs, first those that must leave E-Golf4U.

**Verdict: Not yet** (computed by `compile.py` from `founder/numbers.json` and the buyer panel).
Three of four checks pass, one fails:
- ✓ **Margin**: each paying club leaves **€ 410.20 a month (90%)** at the founding price of € 0.49 per
  member (€ 455.70 on average; the price changed to per member on 8 October 2026).
- ✓ **Break-even**: **1 paying club** with the founders unpaid, within the ~25 clubs two people can serve.
- ✓ **Year 1**: an operating profit of **€ 146**, even though only Zwolle pays from month 4 and the next
  clubs wait for Zwolle's proof (3 paying clubs by month 12).
- ✗ **Buyers**: **0 of 20** simulated buyers buy (bar 25%), with the old pitch and with the improved
  Founding Club offer.

With the founders paid € 2,500 each, break-even is **13 clubs** (10 founding + 3 at list price) and
year 1 loses **€ 59,854**.

**What has to change, and which skill changes it.**
1. **Proof, not a better pitch.** 19 of 20 buyers say what would change their mind: Zwolle live for a
   season and a call with its board. No offer change moved the buy rate (`/founder-offer` ran twice).
   Only Zwolle's real numbers can; then re-run `/founder-consumer` with them, and trust real boards
   over the panel.
2. **Pay for the founders** is the money question. The price per member brought it from 16 clubs to
   13; Zwolle paying from month 1 (year 1 € +1,377) or the list price after club 10 (break-even 10)
   help further (`/founder-cfo` what-ifs).

**Where the board and the panel agreed, and where not.** Both put proof at Zwolle first, and both see
switching effort and "two founders" as the doubts. The board voted "fund, if" (5.0 / 10) and saw a
sellable offer; the panel bought nothing. The board's biggest fear (members won't use a club app next
to GOLF.NL) came up less in the panel than trust and timing did. Price was not the blocker. After a second look at the
value for a club (a green fee costs € 50–74; € 0.65 per member is less than one 18-hole green fee per
100 members a month) the price went up to € 0.65 per member (`founder/nl/casus-prijs.md`).

**The biggest risk** is that Zwolle's members don't use the app: without that, nothing else sells.
Plan: launch kit (import done for them, printed guide, invitations in groups, Saturday helpline),
a weekly count of active members, and a hard stop on outreach if fewer than 20% are active by week 4.

**What it takes to start.** About **€ 11,600** cash with the founders unpaid (pentest € 7,500,
lawyer € 2,500, running costs), and **Test 1**: Zwolle signs a pilot contract with a paid follow-on
by 13 November, plus 2 letters of intent from other boards by 18 December (`founder/launch.md`).

**This week:** meet Zwolle's board. Fix the go-live date, the success criteria and the founding
price (€ 0.49 per member) from month 4 in a pilot contract, and ask permission to use their name later.

_The panel is simulated buyers and the numbers are projections; real boards and real quotes confirm
them. Not financial, legal or tax advice._
