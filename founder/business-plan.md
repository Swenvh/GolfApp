# Greenside · Business plan

**Verdict: Not yet**

- ✓ Each club-month earns € 250.20 before fixed costs (69% contribution).
- ✗ Year 1 operating LOSS: € 159.
- ✓ Break-even is 2 clubs paying at once against a capacity of 25.
- ✗ 0 of 20 simulated buyers buy (0%, the bar is 25%).

| key number | |
| --- | ---: |
| Price | € 362.70 a club-month |
| Profit margin at plan | 60% per club-month |
| Break-even | 2 clubs paying at once |
| Year 1 operating profit | € -159 |
| Startup spend | € 10,423 |
| Cash needed before it pays for itself | € 11,181 |
| Startup money earned back | not in year 1 |
| Buyer panel | 0 buy · 20 pass |

## The idea

- What it is: a white-label member app plus club management software ("clubbeheer") for Dutch golf clubs; every club gets its own branded app in the App Store and Google Play, run on one shared platform.
- Who it is for: Dutch golf clubs with their own course (263 clubs are NGF members, 275 courses), bought by the board and run day to day by the secretariat, the finance volunteer and the marshal. The members (golfers) use the app.
- What it sells, at what price (the original idea; current prices are in `founder/pricing.md`: € 0.65 per member per month (min. € 249, max. € 899), pioneers € 0.39, founding € 0.49 per member, no "two months free"): a monthly licence by club size: € 249 (9 holes, up to ±700 members), € 449 (18 holes, ±700–1,100 members, the standard), € 599 (27+ holes). Founding-club price € 399 a month, fixed for two years, for the first ten clubs. One-off migration fee € 750 (9 holes) to € 1,500 (18+ holes). A three-month pilot, then a yearly contract; two months free when paid a year up front. No commission on what members buy in the app.
- Where and how: the Netherlands. Sold directly to clubs by the founders (demo, pilot, contract). Delivered as a branded iOS/Android app per club (built from one codebase) and a web-based club management system; members are imported from the club's current system and invited by e-mail with a login code.
- Budget and constraints: pre-revenue. Two founders; the software is built with Claude Code. A working pilot ("pilot-v1") is finished and frozen; the first pilot club (Golfclub Zwolle) has a branded version in its own colours and logo, not yet live. Production accounts (database in the EU, e-mail, hosting, Apple/Google developer accounts) still have to be set up. No outside funding mentioned.

## Summary

**What it is.** Greenside gives a Dutch golf club its own member app in the App Store and Google
Play, plus the club management software behind it, and does the switch for the club. It is for the
boards of the 263 NGF clubs, first those that must leave E-Golf4U.

**Verdict: Not yet** (computed by `compile.py` from `founder/numbers.json` and the buyer panel).
Two of four checks pass, two fail:
- ✓ **Margin**: each paying club leaves **€ 250.20 a month (69%)** at the pioneer price of € 0.39 per
  member (€ 362.70 on average), after the cost of the new guarantees.
- ✓ **Break-even**: **2 paying clubs** with the founders unpaid, within the ~25 clubs two people can serve.
- ✗ **Year 1**: an operating loss of only **€ 159**, with the three levers in the numbers (Zwolle pays from
  month 1, Expo Starter, escrow and IT partner from the third club). Without them it was € -3,394.
- ✗ **Buyers**: **0 of 20** simulated buyers buy (bar 25%), with the old pitch and with the improved
  Founding Club offer.

With the founders paid € 2,500 each, break-even is **15 clubs** (3 pioneers + 7 founding + 5 list) and
year 1 would lose **€ 62,643** with pay from month 1.

**What has to change, and which skill changes it.**
1. **Proof, not a better pitch.** 19 of 20 buyers say what would change their mind: Zwolle live for a
   season and a call with its board. No offer change moved the buy rate (`/founder-offer` ran twice).
   Only Zwolle's real numbers can; then re-run `/founder-consumer` with them, and trust real boards
   over the panel.
2. **Pay for the founders** is the money question: ~15 clubs. The breakthrough offer (`founder/nl/doorbraakplan.md`)
   removed every objection in panel round 3 except proof, at a cost of ~€ 3,500 in year 1.

**Where the board and the panel agreed, and where not.** Both put proof at Zwolle first, and both see
switching effort and "two founders" as the doubts. The board voted "fund, if" (5.0 / 10) and saw a
sellable offer; the panel bought nothing. The board's biggest fear (members won't use a club app next
to GOLF.NL) came up less in the panel than trust and timing did. Price was not the blocker. After a second look at the
value for a club (a green fee costs € 50–74; € 0.65 per member is less than one 18-hole green fee per
100 members a month) the price went up to € 0.65 per member (`founder/nl/casus-prijs.md`).

**The biggest risk** is that Zwolle's members don't use the app: without that, nothing else sells.
Plan: launch kit (import done for them, printed guide, invitations in groups, Saturday helpline),
a weekly count of active members, and a hard stop on outreach if fewer than 20% are active by week 4.

**What it takes to start.** About **€ 11,200** cash with the founders unpaid (pentest € 7,500,
lawyer € 2,500, running costs), and **Test 1**: Zwolle signs a pilot contract with a paid follow-on
by 13 November, plus 2 letters of intent from other boards by 18 December (`founder/launch.md`).

**This week:** meet Zwolle's board. Fix the go-live date, the success criteria and the founding
price (pioneer, € 0.39 per member) **from month 1** in a pilot contract, and ask permission to use their name later.

_The panel is simulated buyers and the numbers are projections; real boards and real quotes confirm
them. Not financial, legal or tax advice._

## What the board said

**Vote: 3 × FUND IF · average score 5.0 / 10** (Offers 5, Monopoly 4, Product 6)

The board does not pass, but it does not fund on the pitch either. All three want
measured proof from Golfclub Zwolle before more clubs are signed or more is built.

### Risks raised by more than one member (most dangerous first)

1. **Members may not use a club's own app next to GOLF.NL** (all three). GOLF.NL is
   free, books tee times and has 325,300 active users. If members don't adopt the club
   app, the extras, guest fees and sponsor revenue never show up, and the club's value
   case falls apart.
2. **No proof yet** (Offers, Product). No club has paid, the pilot is not live, and the
   € 19,000–45,000 value per club is an unmeasured estimate. One of its levers ("pause
   instead of cancel") has already been removed from the product.
3. **Switching from the incumbents is hard** (all three). Clubs run E-Golf4U,
   Nexxchange or IntoGolf. Moving member data, finance and volunteers is effort and risk
   for the club, and IntoGolf already publishes club-branded apps.
4. **The difference is easy to copy** (Offers, Monopoly). "No commission" is a price
   argument an incumbent can match. Nothing compounds across clubs (no network effect),
   and the code itself is no barrier.
5. **A small, flat market** (Offers, Monopoly). About 263 clubs. All of them on the
   standard tier would be about € 1.4M a year: a business to own, not one that grows
   big.

### Where the members disagree

- **What the business is.** The Product lens sees a well-made product whose problem is
  focus: too many things, no one thing. The Monopoly lens sees an incremental
  improvement with no moat, whatever the focus. The Offers lens sees a sellable offer
  that only lacks proof.
- **Score spread: 4 to 6.** The Product lens is the most positive, because the working
  pilot and the volunteer-first design are real. The Monopoly lens is the most critical,
  because nothing stops a copy.

### Conditions: the checklist for the rest of the pack

Proof at the pilot club
- [ ] Name the one thing Greenside does for members, in one sentence, that GOLF.NL does
      not (Product). → `/founder-offer`, `/founder-marketing`
- [ ] Agree success metrics with Zwolle **before** go-live: weekly active members,
      in-app revenue the club would not otherwise have had, hours saved at the desk
      (Offers, Product).
- [ ] Zwolle goes live, and after the 3-month pilot reports real member adoption and
      volunteer use (all three).
- [ ] Zwolle converts to a paid yearly contract (Monopoly).

Market and competition
- [ ] Competitor map with what clubs pay the incumbents today, contract terms and
      switching costs, showing a gap the incumbents cannot close quickly (Monopoly,
      Offers). → `/founder-competitors`
- [ ] Will members open a club app next to GOLF.NL, and will a board pay € 449?
      (Offers, Monopoly). → `/founder-consumer`, then `/founder-pricing`
- [ ] A named beachhead of at most about 20 clubs (for example 9-hole clubs, one
      region, or clubs on one incumbent) with a plan to sign at least 5 founding clubs
      (Monopoly); at least 3 signed before the platform is built further (Offers).

Money
- [ ] Cost to win one club, cost to run one club, and the number of clubs to break
      even (Offers, Monopoly). → `/founder-cfo`
- [ ] A guarantee the business can afford, tied to the "licence earned back" statistic
      already in the product (Offers). → `/founder-cfo`, `/founder-offer`

Product before go-live
- [ ] Finish the seams: production e-mail for login codes, legal documents, the
      bar-staff role, the ball-machine decision, and a written answer to who owns the
      member record when Greenside and the old system disagree (Product).
- [ ] Support: who helps a club or a member when a login code doesn't arrive on a
      Saturday morning (Product).
- [ ] Durability: what Greenside builds that a copycat cannot have in month six
      (data across clubs, integrations, a brand with club boards) (Monopoly).

### The strongest version the board can see

Not "a club app with everything", which the pitch comes close to, but **the member
platform that earns the club money, proven at Zwolle**. One promise: the app pays for
itself, with the "licence earned back" figure the product already tracks as the proof,
backed by a guarantee. The member experience is focused on what GOLF.NL cannot do
because it is not the club's: the club's own account (bar tab, extras, guests, invoices),
the club pass and club news. The club gets migration, volunteer training and a
member-launch kit, so switching costs it almost no effort. It starts with a narrow
beachhead of clubs (the founding-club offer, with a deadline), and builds what a copycat
cannot quickly have: integrations with the systems clubs already run and a track record
with club boards. This is narrower than the pitch: less "everything for the club", more
"proven extra income for the club, with members who actually use it".

## The competition

Research date: 8 October 2026. Public sources only, every fact linked.

**Limits of this research, read first.** The sites of the vendors themselves
(intogolf.nl, e-golf4u.nl, ngf.nl, compupartner.nl, apps.apple.com) could not be opened
from the research environment (blocked by its network policy), so facts come from search
results that quote those pages and from club websites. **No vendor publishes a price**:
the price comparison below is therefore open, not guessed. Ask clubs during sales
conversations what they pay today.

### 1. Who is there, most direct first

| # | Name | Type | What they sell | Member app | Rating |
| --- | --- | --- | --- | --- | --- |
| 1 | **IntoGolf** (incl. Proware, IkGaGolfen) | direct | All-in-one: member admin, tee sheet, POS, invoicing, competitions ([intogolf.nl](https://intogolf.nl/), [unTill](https://untill.nl/koppelingen/intogolf/)) | **Native branded app per club** in the stores, e.g. Sallandsche, Golfpark Wilnis, De Kroonprins, De Batouwe, Lochemse ([App Store developer page](https://apps.apple.com/nl/developer/intogolf-b-v/id1202167984?l=en)), Amelisweerd ([Google Play](https://play.google.com/store/apps/details?id=nl.intogolf.amelisweerd&hl=en_US)) | IkGaGolfen v3: **1.9** on Google Play (21 reviews), ~2.0 on the App Store ([Google Play](https://play.google.com/store/apps/details?id=nl.ikgagolfen.v3&amp;hl=en&amp;gl=US), [App Store reviews](https://apps.apple.com/nl/app/ikgagolfen-v3/id1631802402?see-all=reviews&platform=iphone)) |
| 2 | **Nexxchange** (GolfSuite, took over E-Golf4U) | direct | Cloud club management; >400 courses in the EU (2023) ([IAGTO release](https://iagto.com/pressrelease/details/12b3c479-dd60-4af4-927a-2804fad7a6d3)); member portal ([handleiding](https://zeegersloot.nl/wp-content/uploads/2024/11/Handleiding_NexxChange_portaal_1.pdf)) | Web portal | not found |
| 3 | **E-Golf4U** (being retired) | direct, legacy | Scores, competitions, tee times, NGF card ([Veldzijde](https://gcveldzijde.nl/faq-items/is-er-ook-een-mobiele-app-van-e-golf4u/), [Welderen](https://golfclubwelderen.nl/e-golf4u-instructie/)) | **Web app** (m.eg4u.nl), "niet via de App Store of Play Store" ([Veldzijde](https://gcveldzijde.nl/faq-items/is-er-ook-een-mobiele-app-van-e-golf4u/)) | not found |
| 4 | **Golfspot + TeeControl + Parrow** ("Golfdashboard") | direct | Golfspot: "the Customer Data Platform for the golf market" ([golfspot.io](https://golfspot.io/)); TeeControl: cloud tee sheet ([teecontrol.com](https://www.teecontrol.com/en)); Parrow: Dutch competition module ([Prise d'Eau](https://prisedeau-golf.nl/nieuws-vereniging/vervanging-wedstrijdmodule-golf-genius/)) | **Web app**, "niet te downloaden" from the stores ([De Hooge Rotterdamsche](https://www.dehoogerotterdamsche.nl/golfdashboard/)) | not found |
| 5 | **GolfBox** | direct (international) | Member/handicap admin, tee times, kiosk, member app; vendor claims >1,000 clubs ([golfbox.net](https://golfbox.net/golfbox-golf-management)) | App | Dutch customers not confirmed |
| 6 | **Compu Partner** (CompuGolf) | direct | Club software with a mobile app ([compupartner.nl](https://compupartner.nl/compugolf/mobiele-app/)) | App | details not readable |
| 7 | **Golf Genius** (Club App) | indirect | Competitions + fully white-labelled club app ([Golf Business News](https://golfbusinessnews.com/news/management-topics/golf-genius-launches-enhanced-club-app/)); replaced by Parrow at Prise d'Eau ([source](https://prisedeau-golf.nl/nieuws-vereniging/vervanging-wedstrijdmodule-golf-genius/)) | Branded app | not found |
| 8 | **GOLF.NL app + GOLFGO** (NGF) | indirect | Free: NGF card, scorecards, handicap, tee times at ±65 courses via GOLFGO ([NVG](https://www.nvg-golf.nl/initiatieven/golfgo)), **pay at booking** since late 2025 ([NGF, March 2026](https://www.ngf.nl/over-de-ngf/nieuws/2026/mrt/golfbanen-zien-direct-resultaat-van-betaalfunctie-in-app-golfnl)), "Zoek en boek" from July 2026 | National app, "Dé app voor golfend Nederland!" ([golf.nl/app](https://www.golf.nl/app)) | 4.2 on Google Play (~1,900), 4.5 on the App Store (~3,200) ([App Store](https://apps.apple.com/nl/app/golf-nl-app/id1140989195), [Google Play](https://play.google.com/store/apps/details?id=com.ngf.mijngolf)); "more than 130,000 monthly users" ([iO](https://press.iodigital.com/golfnl-app-20-makes-golf-accessible-to-everyone)) |
| 9 | **CPS, Lightspeed Golf, Teecontrol** | indirect | Tee-sheet systems read by GOLFGO ([NGF](https://www.ngf.nl/caddie/baanmanagement/golfgo)) | via GOLF.NL | not found |
| 10 | **Golf@** | indirect, minor | Meeting platform for golfers, clubs and pros; last update listed 2016 ([App Store](https://apps.apple.com/nl/app/golf-at-voor-golfers-golfclubs-en-de-golfpro/id933973704)) | App | 3.0 (2 reviews) |
| – | **Website + e-mail + phone at the desk** | substitute | What clubs do without an app | none | – |

### 2. Price

**Not published by any vendor** (IntoGolf, Nexxchange, E-Golf4U, Golfspot, TeeControl,
GolfBox). The only public number: one E-Golf4U POS link module "vanaf € 11,00" a month
([leza.nl](https://www.leza.nl/mpluskassa-apps/reserverings-koppelingen/e-golf4u/)), which
says nothing about a full licence. IntoGolf sells modules "die passen bij uw organisatie"
([intogolf.nl](https://intogolf.nl/)), so prices are quote-based. Lowest / median /
highest for a comparable licence: **unknown**. One switching story mentions price:
Golfclub Brunssummerheide moved from E-Golf4U to Proware in 2020 citing "een flinke
kostenbesparing" ([readkong](https://de.readkong.com/page/belangrijk-nieuws-2407001)).

### 3. Positioning map

Axis 1: how much of the club's back office it runs (tee sheet only → everything incl.
finance). Axis 2: what the member gets on the phone (nothing / web app → national app →
the club's own native app in the stores).

```
                    member gets the CLUB'S OWN native app
                                   ▲
           Golf Genius (club app)  │            IntoGolf (branded apps, rated ~2/5)
                                   │                          ◆ Greenside (aim)
   ────────────────────────────────┼───────────────────────────────────────►
   tee sheet / one module          │                        everything incl. finance
           GOLF.NL app (free, national; tee times, pay, NGF card)
           TeeControl · CPS        │  Golfspot+TeeControl+Parrow   Nexxchange   GolfBox?
                                   │  (web app)                    (web portal)
                                   │  E-Golf4U (web app, being retired)
                                   ▼
                       member gets a web app / portal or nothing
```

### 4. What customers complain about

Few public reviews exist for B2B club software; most evidence is from club notices and
app-store reviews. Themes with fewer than three sources are marked **thin**.

1. **Forced migration, with friction** (5+ sources). E-Golf4U is disappearing: "e-Golf4U
   gaat per 26 maart 2024 verdwijnen" ([Uithoorn](https://www.golfvereniginguithoorn.nl/2024/03/16/e-golf4u-gaat-per-26-maart-2024-verdwijnen/));
   clubs move to Nexxchange ([Putten](https://www.golfclubputten.com/nieuws/2242159_nexxchange-vervangt-e-golf4u),
   [Bilthoven](https://www.golfclubbiltseduinen.nl/algemeen/migratie-van-e-golf4u-naar-nexxchange-per-20-februari-2025/),
   [Vught](https://www.golfclubvught.nl/resources/media/Migratie/Nexxchange-nieuws-GCV-v1.pdf)),
   to IntoGolf ([Veldzijde](https://gcveldzijde.nl/overgang-naar-een-nieuw-computer-systeem-intogolf/),
   [Hildenberg](https://golfparkdehildenberg.nl/index.php/golfbaannieuws/e-golf4u-wordt-intogolf))
   or to Golfspot/TeeControl/Parrow ([De Hooge Rotterdamsche](https://www.dehoogerotterdamsche.nl/van-e-golf4u-naar-golfdashboard/),
   [Landgoed Nieuwkerk](https://golfclublandgoednieuwkerk.nl/golfdashboard-2/)). One club
   says about half the E-Golf4U clubs had moved to Nexxchange by November 2025
   ([Overbrug](https://hgc-overbrug.nl/2025/11/de-migratie-van-e-golf4u-naar-nexxchange/));
   the Veluwse Golf Club postponed its migration after a test migration showed
   imperfections ([Veluwse](https://veluwsegolfclub.nl/nexxchange-informatie/)). Nieuwkerk's
   board: not unhappy, but "het systeem houdt op te bestaan".
2. **The member app is a web page, not an app** (5+ sources). Clubs publish step-by-step
   guides to put a shortcut on the home screen for E-Golf4U
   ([Semslanden](https://semslanden.nl/webapp-egolf4u-installeren/),
   [Holthuizen](https://golfclubholthuizen.nl/e-golf-app-installeren-op-uw-smartphone/),
   [Havelte](https://www.golfclubhavelte.nl/het-installeren-van-de-web-app-egolf4u/),
   [Ter Specke](https://golfbaanterspecke.nl/wp-content/uploads/2023/01/Instructie-voor-het-installeren-van-de-E-Golf4U.pdf)),
   Proware ("U vindt deze app niet in de appstore", [readkong](https://de.readkong.com/page/belangrijk-nieuws-2407001))
   and Golfdashboard ([Tespelduyn](https://golfbaantespelduyn.nl/web-app/)). The
   Hollandsche Golfclub's web app cannot be used by green-fee players
   ([HGC](https://www.hollandschegolfclub.nl/hgc-web-app-gewoon-handig/)).
3. **The one native branded app rates poorly** (3 sources). IkGaGolfen v3 (IntoGolf):
   1.9 on Google Play; App Store reviewers (2022–2024) report failed logins, not finding
   their club, and a white screen after picking a tee time so players can't be added
   ([App Store reviews](https://apps.apple.com/nl/app/ikgagolfen-v3/id1631802402?see-all=reviews&platform=iphone),
   [Google Play](https://play.google.com/store/apps/details?id=nl.ikgagolfen.v3&amp;hl=en&amp;gl=US)).
   At De Kroonprins's IntoGolf go-live, members' familiar friend groups for booking were
   replaced by "bekende spelers" ([Kroonprins](https://golfbaandekroonprins.nl/livegang-intogolf-27-maart-2024-1200-uur/)).
4. **Several systems for one club** (thin, 2 sources). Golfdashboard members still need a
   separate Parrow app for competitions ([Golfmiddenbrabant](https://www.golfmiddenbrabant.nl/golfdashboard3),
   [Amelisweerd](https://amelisweerd.nl/welkom-bij-het-golfdashboard/)).
5. **GOLF.NL got slower and shows ads after an update** (thin, 1 review on
   [Google Play](https://play.google.com/store/apps/details?id=com.ngf.mijngolf)).
6. **No-shows on reserved tee times** (thin, 2 sources), now being solved by paying at
   booking in GOLF.NL: "vrijwel geen no-shows meer" at De Compagnie and Harderwold
   ([NGF](https://www.ngf.nl/over-de-ngf/nieuws/2026/mrt/golfbanen-zien-direct-resultaat-van-betaalfunctie-in-app-golfnl)).

### 5. The gap

**A real, polished app in the club's own name, in the app stores, on top of an
administration that is moving anyway.**

- Most Dutch members get a **web app** (E-Golf4U, Proware, Golfdashboard, Nexxchange
  portal). The only vendor with native branded apps per club (IntoGolf) is rated about
  **2 out of 5** with login and booking failures. Nobody combines "the club's own app"
  with a good experience. Greenside's branded app (own name, logo and colours, code login
  without passwords) aims straight at this.
- **A switching window is open now, and closing.** E-Golf4U is being retired and every
  E-Golf4U club has to choose. About half had moved to Nexxchange by November 2025; others
  chose IntoGolf or the Golfspot stack. The clubs still on E-Golf4U, and clubs unhappy
  after a hurried migration, are the most reachable buyers. Greenside already imports
  CSV from E-Golf4U, Nexxchange and IntoGolf.
- **Not every club wants to replace everything.** The Golfspot stack is explicitly
  "best-of-breed" with a data platform that syncs "your member app"
  ([golfspot.io](https://golfspot.io/)). That suggests a second route: Greenside as the
  member app on top of an existing administration, instead of (or before) replacing it.
- **Unverified:** whether competitors also sell extras, bar tab on account and guest
  fees in their apps. No source confirms or denies it; check in demos before claiming it
  as a difference.

### 6. The threat

1. **GOLF.NL (NGF)**: free, national, already booking tee times with **payment** and
   expanding ("Zoek en boek", July 2026). It owns the golfer's NGF card and handicap.
   If the NGF adds club news or a member account, the reason for a club app shrinks.
   Greenside should sit *next to* it (club account, extras, club life), not compete on
   booking.
2. **IntoGolf**: the only one with native branded club apps already. Fixing its app
   quality would close Greenside's clearest gap fastest.
3. **Golfspot/TeeControl/Parrow**: modern, Dutch, growing among well-known clubs
   (Bernardus, Kennemer). Adding a native member app to Golfdashboard would be a short
   step.
4. **Nexxchange**: large, acquisitive (E-Golf4U, Sysgolf ([source](https://thegolfbusiness.co.uk/2024/08/nexxchange-acquires-sysgolf-srl/)),
   UGOLF partnership) and inheriting many Dutch clubs.

### Open questions for the next skills

- What do clubs pay today, per year, for their system? (ask in every sales call;
  `/founder-pricing`)
- Will members install a club app next to GOLF.NL? (`/founder-consumer`)
- Replace the administration, or be the member app on top of it? (`/founder-offer`,
  `/founder-cfo`)

## The buyer panel

**0 buy · 20 pass** (0% buy) out of 20 simulated buyers. Seed 682799, so the same cards can be dealt again.

These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend.

### By segment

| group | buyers | buy rate |
| --- | ---: | ---: |
| Board member or paid club manager of an 18-hole club (±950 members, turnover around 1.8 million euro) | 11 | 0% |
| Club manager or commercial manager of a 27+ hole club or a commercially run course (±1,350 members) | 4 | 0%  (thin) |
| Volunteer board member of a 9-hole club (±550 members, mostly volunteers) | 5 | 0%  (thin) |

### By buying behaviour

| group | buyers | buy rate |
| --- | ---: | ---: |
| Still on E-Golf4U, must choose a new system now | 4 | 0%  (thin) |
| Just migrated, tired of switching | 3 | 0%  (thin) |
| Loyal to the current vendor | 3 | 0%  (thin) |
| Treasurer, every euro counts | 3 | 0%  (thin) |
| Overloaded secretary / volunteer | 3 | 0%  (thin) |
| Commercially minded manager | 2 | 0%  (thin) |
| Cautious chair, goes through the members' meeting | 2 | 0%  (thin) |

### By income

| group | buyers | buy rate |
| --- | ---: | ---: |
| $62,000 to $79,000 | 8 | 0% |
| $79,000 and up | 7 | 0%  (thin) |
| under $62,000 | 5 | 0%  (thin) |

### Why they pass

| reason | buyers | in their words |
| --- | ---: | --- |
| trust | 15 | "We have 950 members, most over 60, and E-Golf4U is going away, so this migration has to work the first time. I can't take a two-founder product with zero live clubs to my board when Nexxchange and IntoGolf run hundreds of clubs already." (P001) · "We have run our current system for years and it works well enough; I'm not moving 950 members, our tee sheet and our invoicing to two founders whose first pilot club isn't even live yet. A nice app in our own colours doesn't outweigh the risk of a messy season." (P003) |
| timing | 3 | "We just dragged 950 members and a worn-out volunteer team through a migration off E-Golf4U; I'm not putting them through another one within a year for a product whose first pilot club isn't even live yet." (P002) · "We just finished moving off E-Golf4U, the volunteers are exhausted and the members have only just learned the new system. I'm not putting the club through another migration within a year, least of all onto something that isn't even live at its first pilot club." (P004) |
| habit | 2 | "We've run on our current system for years, it works well enough and the vendor knows us. Switching 550 members to a new app from two founders whose first club isn't even live yet is a headache our volunteer board doesn't need for €249 a month." (P008) · "We've run on our current system for years, the vendor knows us and it works well enough. Switching means migrating 550 members, retraining volunteers and getting a lot of people over 60 to install yet another app, and that's a lot of grief for a small volunteer board to take on for software that isn't live anywhere yet, built by two founders." (P017) |

### Why they buy

| reason | buyers | in their words |
| --- | ---: | --- |

### What would flip a no

- Seeing Golfclub Zwolle or another 18-hole club actually live for a full season, with a manager I can call, plus a written guarantee that we can export all our data if Greenside stops.
- A comparable 18-hole club running it live for a full season with a working NGF/handicap link and direct debit, and a contract that lets us exit after the pilot with our data exported at no cost.
- Seeing a comparable 18-hole club running it live for a full season without problems, and a clear way to get our data out if they go under.
- A few clubs our size running on it for a full season without trouble, plus a contractual escrow or full data-export guarantee if they stop, and then talk to me again when our current contract comes up for renewal.
- Seeing Golfclub Zwolle actually live for a full season, with their treasurer telling me invoicing and iDEAL work and that it replaced their old package instead of adding to it.
- Two or three comparable clubs running it live for a full season, that I can phone and visit, plus a contract that guarantees our data and support if the company stops.
- Seeing Golfclub Zwolle live for a full season, plus a call with their secretary about how the older members and the migration went, and an escrow or data-export guarantee in the contract.
- Seeing a comparable 9-hole volunteer club running on it for a full season without trouble, and our current vendor raising prices or dropping support.
- Our current system failing badly in the next year or two, plus seeing Golfclub Zwolle running live for a full season with older members actually using the app, and you doing the whole migration for free.
- Golfclub Zwolle running live for a full season with a treasurer I can call, plus a pilot we can walk away from at no cost and a written guarantee we get our data back if they stop.
- Seeing it live at a club our size for a full season, with the NGF handicap link and direct debit working, and a reference call with their manager before the spring budget meeting.
- A comparable 18-hole club that has run a full season on it live, plus a written guarantee that we get a full export of all our data and a transition period if they stop.

20 buyers gave all four price answers. Run founder-pricing's van_westendorp.py on the answers folder.

## Pricing

Amounts in euros per month, excl. 21% VAT. Buyer answers are simulated (`founder/pricing-curve.md`):
they pick what to test, they are not proof. Margins come from `unit_economics.py` on
`founder/numbers.json` (founders unpaid) and `founder/numbers-met-salaris.json` (2 × € 2,500).
**Changed on 8 October 2026 from a price per course size to a price per member** (founders' question:
why cost less than a few green fees a month?), and the same day extended with a pioneer tier, a
maximum, the NGF count and the guarantees from the breakthrough plan (`founder/nl/doorbraakplan.md`). The full reasoning, with the club's value
in green fees, is in `founder/nl/casus-prijs.md`.

### 1. The price

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

### 2. The ladder

Clubs don't choose a size; they have one. The price per member is the ladder: it rises with the club.
On top of that, later and only when built and wanted: **add-ons** (NGF handicap link, direct debit, a
link to the bar's cash register (unTill), the ball machine (Xafax)). Each one lets the club drop another
system, so price them per add-on, not in the base. Do not sell them before they exist.

### 3. The opening offer

**Greenside Pioneer and Founding Club.**
- **Pioneer (3 places):** € 0.39 per member, fixed three years, for clubs that sign before Zwolle's pilot
  results are published (**before 1 June 2027**). They take the most risk and get the most in return.
- **Founding (clubs 4–10):** € 0.49 per member, fixed two years, pilot starting before 1 July 2027.
- Both: no migration fee, the free three-month pilot with written success criteria, and all the
  guarantees above.
- **After the fixed period** the club moves to the list price at that time. Write this in the contract.
- Say how many places are left only as an exact number, and only while it is true.

### 4. What to test with real buyers

1. **Does the pioneer price make clubs go first?** Offer it in every conversation before 1 June 2027 and
   count signatures. If no club takes it, the problem is not price but proof.
2. **Show the sum with the club's own invoice**: what the club pays its current vendor today next to
   Greenside's yearly amount, and what the app brings in. Note which part convinces.
3. **Founding price € 0.49 vs. € 0.59** for clubs 4–10, alternating price sheets.

### 5. The panel's price objections (verbatim, for marketing)

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

## The offer

Method: the Offers lens (`.claude/skills/founder-board/lenses.md`), a summary of a
published framework, applied to what the board, the competitor map and the buyer panel
found. No CFO numbers exist yet (`founder/numbers.json` is missing), so every cost
score below is an **estimate** and every money promise is marked for `/founder-cfo`.

### 1. The problem list (in the buyer's words)

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

### 2. Solutions, scored

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
| H | **9-hole founding price € 179** (was € 249; since 8 Oct 2026 replaced by the price per member, see `founder/pricing.md`) | 7 | 4 | 2 (lower revenue) | ✔ test; `/founder-pricing` decides |
| I | **No migration fee for founding clubs** | 8 | 3 | 2 | ✔ |
| J | Source-code escrow with a third party | 2, 19 | 4 | 4 (yearly fee, unknown) | ✘ for now: D covers most of it; revisit with CFO |
| K | NGF handicap link and direct debit in the product | 9 | 4 | 5 (not built; direct debit removed from the pilot) | ✘ not promised; product decision |
| L | Revenue guarantee ("earns back the licence or we refund") | 11, 21 | 4 | 4 (claim rate unknown) | ✘ until CFO models it; B is the safe version |
| M | Run as member app only on top of the old system | 6, 13 | 4 | 5 (needs integrations) | ✘ not deliverable now |

**Must exist before the first sale:** full data export (members exists; invoices and
bookings still to build), a contract with clauses B, C and D, the printed member guide,
and a helpline arrangement.

### 3. The stack

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
- **Urgency and scarcity (real):** ten founding clubs at € 0.49 per member (minimum € 189; was € 179 / € 399 per course size),
  fixed for two years, no migration fee (H, I). The other real urgency is external:
  E-Golf4U is being retired, so many clubs must choose now.
- **Proof:** a call with Zwolle's board once Zwolle is live (G). Not before; the pitch
  says so.

### 4. Value equation (1–10, before → after)

| | Before (pitch v1) | After (Founding Club) | What moves it |
| --- | ---: | ---: | --- |
| Dream outcome | 5 | 6 | Success defined with the club; still no revenue proof |
| Perceived likelihood | 2 | 4 | Written success criteria, data guarantee, Zwolle reference *later*. Stays low until Zwolle is live |
| Time to result | 4 | 5 | Pilot next to the old system, no big-bang switch |
| Effort and sacrifice (lower = better, scored as relief) | 3 | 6 | We do the migration, printed guide, helpline, stop for free |

The weakest score stays **likelihood**: no offer replaces a live reference club.

### 5. Re-test

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

### 6. The current offer (after the breakthrough plan, 8 October 2026)

The stack above was extended after panel round 2 (`founder/nl/doorbraakplan.md`) and re-tested in panel
round 3 (`founder/panel-v3/`, 0 of 20 buy; the targeted objections largely disappeared, proof remains).

**Greenside Pioneer and Founding Club**
- **Core:** the club's own app in the stores, with club management behind it.
- **We do the work:** import, a weekly copy of the old system's member list during the pilot,
  invitations, printed guide, two Saturday app clinics, a helpline, and the desk can do anything for a
  member without the app.
- **No double bill:** the licence starts when the club cancels its old system (at most 6 months after the
  pilot); the first invoice falls in the club's next budget year.
- **Safety net for E-Golf4U clubs:** Greenside replaces E-Golf4U directly; if the pilot fails, we move the
  data free of charge to Nexxchange or IntoGolf.
- **Continuity:** monthly export to the club's own storage, source code in escrow and an IT partner
  on standby (in place before the third club starts), 12 months' notice.
- **Members' meeting pack:** proposal, presentation, cost comparison with the club's own invoice, answers,
  and a founder comes along.
- **Product:** SEPA direct debit file for the club's own bank; handicaps stay in GOLF.NL with a button in
  the app.
- **Price:** € 0.65 per member per month (NGF-registered members on 1 January, fixed yearly amount,
  minimum € 249, maximum € 899); **pioneers** (first 3 clubs, before 1 June 2027) € 0.39 for three years;
  **founding** (clubs 4–10) € 0.49 for two years.
- **Guarantee:** stop after the pilot and pay nothing.

**Must exist before the first signature:** the contract clauses
for overlap, budget year and safety net, the SEPA file, the members' meeting pack, the weekly-copy
routine. Escrow and the IT partner must be in place before the third club starts (quotes first). Costs
are in `founder/cfo.md`.

## The numbers

**Read this first.** The tool prints `€ ` and "a day"; here every amount is in **euros, excl.
21% VAT**, and "at once" means **clubs paying at the same time**. One unit = one paying club for
one month. Inputs: `founder/numbers.json` (year 1, founders unpaid, with the three levers below) and
`founder/numbers-met-salaris.json` (the business at ~15 clubs: € 2,500 a month for each founder, escrow,
IT partner and Expo Production included). Prices from `founder/pricing.md` (price per member, three
tiers); guarantees from `founder/offer.md` section 6; costs checked by `/founder-ops`. Sources and
estimates: `founder/cfo-sources.md`. Not financial, tax or legal advice: have an accountant check the
structure, payroll costs and VAT before money moves.

### The CFO's note

**The three levers, now in the numbers (decided 8 October 2026):**
1. **Zwolle pays from month 1** at the pioneer price, instead of after a free three-month pilot. Zwolle is
   the reference club, not a prospect; agree it in the pilot contract (`founder/launch.md`, Test 1).
2. **Expo Starter (USD 19) instead of Production (USD 99)** while there are fewer than ~5 apps.
3. **Escrow and IT partner from the third club**, not from day one. On this ramp that is month 12; from
   then on ~€ 135 a month is added (year 1 € -294 instead of € -159 if you count that last month).

**The margin.** The first three clubs (Zwolle and two more) are **pioneers at € 0.39 per member**, on
average **€ 362.70** a club-month. Each leaves **€ 250.20 a month** (69%) after onboarding and pilot
(€ 35), the overlap and budget-year guarantee (€ 67, estimate) and hosting (€ 10). Founding clubs (€ 0.49)
leave € 343.20, list clubs (€ 0.65) € 492. Running costs without pay in year 1 are **€ 326 a month**, so
**2 pioneer clubs cover them**.

**Year 1.** Zwolle pays from month 1; the next clubs sign once Zwolle has proof (month 11: 2, month 12:
3). Year 1 brings in **€ 5,440** and ends at **€ -159**, almost break-even. Without the levers it was
€ -3,394.

**The line to watch: founder pay.** At scale, with € 2,500 each, escrow, IT partner and Expo Production,
fixed costs are € 5,533 a month. The real path is **3 pioneers + 7 founding + 5 list = 15 clubs** (6% of
the 263 NGF clubs, within the ~25 two people can serve). With pay from month 1, year 1 would cost
**€ 73,066**.

**Cash.**
- Founders unpaid: you need **€ 11,181** before it pays for itself, almost all of it the start-up spend
  of € 10,423 (security test € 7,500, lawyer € 2,500).
- The middle way: **pay grows with the clubs.** At 3 pioneer clubs there is about € 425 a month above
  costs (month 12); full pay comes at ~15 clubs, on this ramp in year 2 to 3.

**What is left to pull.** No overlap guarantee for E-Golf4U clubs (they have no old contract to overlap)
saves part of the € 67 per club-month. The pioneer discount costs ~€ 1,100 in year 1 and stays: it is the
one lever aimed straight at "nobody wants to be first".

**The board's money conditions** (`founder/board.md`):
- *Cost to win one club, cost to run one club, clubs to break even:* **answered, as estimates.** Winning a
  club costs ~€ 560 cash plus ~40 founder hours (~€ 830 per paying club with 1 in 3 pilots walking away),
  plus ~€ 1,600 of later start from the overlap guarantee. Running one costs ~€ 11 a month in cash.
  Break-even: 2 pioneer clubs unpaid, 15 clubs with € 2,500 each.
- *A guarantee the business can afford:* **met**, with its costs in the numbers.
- *At least 3 founding clubs signed before building further:* **not met**; month 12 at the earliest.

**Verdict.** With the three levers, year 1 is almost break-even (€ -159) with every guarantee in place.
The money question is founder pay (~15 clubs); the business question is still proof.

---

### Scenario A: year 1, founders unpaid, three levers


#### One club-month

| line | per club-month |
| --- | ---: |
| Price | € 362.70 |
| Onboarding, free pilot and walk-away guarantee, spread over the 24-month founding term (estimate, updated by /founder-ops: printed guide ~EUR 300) | € -35.00 |
| Overlap and budget-year guarantee: on average ~4 months later start of the licence after the pilot, spread over 24 months (estimate) | € -67.00 |
| Hosting share per club: database growth, e-mail above the bundle, app builds (estimate) | € -10.00 |
| Apple developer account: EUR 0 for Greenside, the club enrols itself (Apple guideline 4.2.6; see ops.md) | € -0.00 |
| Collecting the licence by SEPA direct debit (estimate) | € -0.50 |
| **Contribution** (what each club-month leaves to pay the fixed costs) | **€ 250.20** (69%) |

#### The margin that matters

Fixed costs: € 326 a month (Founder pay (none today: founders unpaid; see the second scenario) € 0, Expo EAS Starter, USD 19 (public price; Production USD 99 from ~5 apps) € 17, Supabase Pro + Small compute + staging project, ~USD 40 (public price) € 36, Vercel Pro, 1 seat, USD 20 (public price) € 18, Resend Pro, 50,000 e-mails, USD 20 (public price) € 18, Accountant and bookkeeping (estimate) € 100, Liability (BAV, ~EUR 61 indication) and cyber insurance (estimate) € 100, E-mail accounts for 2 founders (estimate) € 14, Helpline phone number (estimate) € 15, Greenside's own Apple developer account, EUR 99 a year (public price) € 8).

- **Break-even: 2 club-months at once.** Below that you lose money every month.
- **Profit margin at your plan** (10 at once): **60%** of every sale, after every cost.
- Capacity: 25 at once.

#### Year 1, month by month

| month | club-months at once | revenue | profit | cumulative (after € 10,423 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | € 363 | € -76 | € -10,499 |
| 2 | 1 | € 363 | € -76 | € -10,575 |
| 3 | 1 | € 363 | € -76 | € -10,650 |
| 4 | 1 | € 363 | € -76 | € -10,726 |
| 5 | 1 | € 363 | € -76 | € -10,802 |
| 6 | 1 | € 363 | € -76 | € -10,878 |
| 7 | 1 | € 363 | € -76 | € -10,954 |
| 8 | 1 | € 363 | € -76 | € -11,029 |
| 9 | 1 | € 363 | € -76 | € -11,105 |
| 10 | 1 | € 363 | € -76 | € -11,181 |
| 11 | 2 | € 725 | € 174 | € -11,007 |
| 12 | 3 | € 1,088 | € 425 | € -10,582 |

- **Year 1 operating profit: € -159** on € 5,440 of revenue.
- After the € 10,423 startup spend: € -10,582.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **€ 11,181**.

#### What if

| scenario | margin at plan | break-even at once | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 60% | 2 | € -159 |
| Price -10% | 56% | 2 | € -703 |
| Volume -20% | 58% | 2 | € -910 |
| Unit costs +15% | 55% | 2 | € -412 |

#### Red flags

- Year 1 loses money on operations (€ -159).
- The startup spend is not earned back within year 1.

---

### Scenario B: at scale, founders paid € 2,500 a month each


#### One club-month

| line | per club-month |
| --- | ---: |
| Price | € 362.70 |
| Onboarding, free pilot and walk-away guarantee, spread over the 24-month founding term (estimate, updated by /founder-ops: printed guide ~EUR 300) | € -35.00 |
| Overlap and budget-year guarantee: on average ~4 months later start of the licence after the pilot, spread over 24 months (estimate) | € -67.00 |
| Hosting share per club: database growth, e-mail above the bundle, app builds (estimate) | € -10.00 |
| Apple developer account: EUR 0 for Greenside, the club enrols itself (Apple guideline 4.2.6; see ops.md) | € -0.00 |
| Collecting the licence by SEPA direct debit (estimate) | € -0.50 |
| **Contribution** (what each club-month leaves to pay the fixed costs) | **€ 250.20** (69%) |

#### The margin that matters

Fixed costs: € 5,533 a month (Founder pay: 2 founders x EUR 2,500 a month (the founders' target; what it costs the company depends on the legal form, check with an accountant) € 5,000, Expo EAS Production, USD 99 (public price) € 89, Supabase Pro + Small compute + staging project, ~USD 40 (public price) € 36, Vercel Pro, 1 seat, USD 20 (public price) € 18, Resend Pro, 50,000 e-mails, USD 20 (public price) € 18, Accountant and bookkeeping (estimate) € 100, Liability (BAV, ~EUR 61 indication) and cyber insurance (estimate) € 100, E-mail accounts for 2 founders (estimate) € 14, Helpline phone number (estimate) € 15, Greenside's own Apple developer account, EUR 99 a year (public price) € 8, Source-code escrow, ~EUR 1,000 a year (estimate, quote needed) € 85, IT partner on standby for continuity (estimate, quote needed) € 50).

- **Break-even: 23 club-months at once.** Below that you lose money every month.
- **Profit margin at your plan** (10 at once): **-84%** of every sale, after every cost.
- Capacity: 25 at once.

#### Year 1, month by month

| month | club-months at once | revenue | profit | cumulative (after € 10,423 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | € 363 | € -5,283 | € -15,706 |
| 2 | 1 | € 363 | € -5,283 | € -20,989 |
| 3 | 1 | € 363 | € -5,283 | € -26,271 |
| 4 | 1 | € 363 | € -5,283 | € -31,554 |
| 5 | 1 | € 363 | € -5,283 | € -36,837 |
| 6 | 1 | € 363 | € -5,283 | € -42,120 |
| 7 | 1 | € 363 | € -5,283 | € -47,403 |
| 8 | 1 | € 363 | € -5,283 | € -52,685 |
| 9 | 1 | € 363 | € -5,283 | € -57,968 |
| 10 | 1 | € 363 | € -5,283 | € -63,251 |
| 11 | 2 | € 725 | € -5,033 | € -68,284 |
| 12 | 3 | € 1,088 | € -4,782 | € -73,066 |

- **Year 1 operating profit: € -62,643** on € 5,440 of revenue.
- After the € 10,423 startup spend: € -73,066.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **€ 73,066**.

#### What if

| scenario | margin at plan | break-even at once | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | -84% | 23 | € -62,643 |
| Price -10% | -104% | 26 | € -63,187 |
| Volume -20% | -122% | 23 | € -63,394 |
| Unit costs +15% | -88% | 24 | € -62,896 |

#### Red flags

- Year 1 loses money on operations (€ -62,643).
- The startup spend is not earned back within year 1.

## Marketing

Evidence used: `founder/panel/results.md` and `founder/panel-v2/results.md` (simulated buyers),
`founder/competitors.md`, `founder/offer.md`, `founder/pricing.md`, `founder/numbers.json`.
Panel quotes below are **research**, never customer quotes: they do not go in ads.

### 0. What the evidence says first

- **No segment buys yet: 0 of 20, twice.** There is no "segment with the highest buy rate". The
  closest thing is the group whose *timing* is right: clubs **still on E-Golf4U that must choose a
  new system now** (4 of 20). One of them: "the timing is right and the price is not the problem.
  But I am not putting 950 members ... on a two-person company whose first pilot club is not even
  live yet" (P018).
- **19 of 20 say what would change their mind: Zwolle live, and a call with its board.** So
  marketing before Zwolle is live can only open doors and book conversations. It cannot close.
  The campaign below starts when Zwolle's members get the app.
- **The audience is small and known**: 263 NGF clubs, each with a board of 5–7 people and often a
  club manager. This is account-by-account selling, not mass marketing. Every club has a name, an
  address and a members' meeting date.
- **What the marketing must answer** (most named objections, v2):
  1. two founders, no live club (almost every answer) → *proof*: Zwolle, data guarantee, contract
  2. double work during the pilot (9 of 20) → *"we do the work"*
  3. it comes on top of what we pay (7 of 20) → *"replaces, not adds"*
  4. older members won't use an app (several) → *printed guide, Saturday helpline, Zwolle's numbers*
  5. NGF handicap and direct debit (5 and 3) → *answer honestly: not yet; say what it does instead*

### 1. Positioning

Three versions:

**A. The E-Golf4U switch (recommended)**
> For club boards that must leave E-Golf4U and "have to pick something the board can defend for
> years", Greenside is the club system with your own app in the App Store that we move you onto
> ourselves, for about what a club system costs today, unlike the web portals most clubs get.

Why: these clubs have to buy *something* now, so the question is not "why switch" but "why you".
The gap in `competitors.md` is exactly this: most Dutch members get a web app with home-screen
instructions; the one native branded app (IkGaGolfen) rates 1.9. Supported by P001, P007, P018,
P019 (all "must choose now"; all pass on trust, none on price).

**B. Volunteers first**
> For volunteer boards of 9-hole clubs, who "can't take another round of explaining", Greenside is
> the club software where we do the import, the invitations and the Saturday helpline, unlike a
> system you have to roll out yourselves.

Supported by the 9 "double work" answers and the 9-hole volunteers (P008, P009, P013, P014, P017).
But 9-hole clubs bring the least money (~€ 270–358 at ~550 members) and are the most tired of switching (timing).

**C. Earns money for the club**
> For commercially run clubs, Greenside is the member app that sells guest rounds, buggies and
> extras with no commission, unlike GOLF.NL, which books but isn't yours.

Supported by P012 and P020 ("nothing here earns me more per member"). But there is **no proof of
revenue** yet: don't lead with it until Zwolle's numbers exist.

**Pick A.** Use B's promise ("we do the work") as its main proof point, and keep C for after
Zwolle has a season of numbers.

### 2. Channels

| channel | why it fits these buyers | rough cost (estimate) | how you know it worked |
| --- | --- | ---: | --- |
| **1. Direct, named outreach** (letter + e-mail + phone call to the chair or club manager, then a visit) | 263 clubs, decisions by a board; boards read post and take calls. Start with clubs still on E-Golf4U (findable: many publish E-Golf4U web-app instructions, e.g. Semslanden, Holthuizen, Havelte, Ter Specke) and clubs within ~1 hour of Zwolle | € 1,000 for 3 months (printing, post, travel) | conversations booked per week; pilots requested |
| **2. The Zwolle reference** (a club visit, a short case with measured numbers, a call with its board) | the one thing 19 of 20 ask for | € 300 (coffee, a printed one-pager) + Zwolle's goodwill | prospects who call Zwolle; Zwolle's board still willing after month 3 |
| **3. LinkedIn, founders' own profiles** (no ads at first) | club managers, treasurers and board members are there; good for "behind the scenes" and proof posts | € 0 (time); optional € 300 to boost 2–3 proof posts at club managers in NL | replies and connection requests from club people; meetings from LinkedIn |
| *Check, then maybe:* **NVG** (the trade association of golf courses, ~138 members in 2019) and regional club-manager meetings | where paid club managers meet | unknown: ask NVG for membership and event costs | a speaking slot or table at one event |

**Not doing now, and why**
- **Paid search and paid social**: almost nobody searches "golfclub software" in a month; the
  263 buyers are reachable by name, so ads waste money.
- **Consumer marketing to golfers** (Instagram, TikTok, influencers): golfers don't buy; boards do.
- **A booth at a trade fair**: expensive, and without a live club there is nothing to show.
- **Leading with revenue claims** ("earns back the licence"): no data yet; an earnings claim
  without proof is misleading advertising.
- **Naming or rating competitors in ads** ("unlike IntoGolf's 1.9"): comparative advertising must
  be accurate and fair; keep it for one-to-one conversations, with the source, and only facts.

### 3. The 30-day campaign

**Launch day L = the day Zwolle's members get the app.** No date is fixed yet; the calendar below
assumes **Monday 1 March 2027** (start of the season, and boards prepare the spring members'
meeting). Move all dates if L moves. **Ask Zwolle's board in writing** before using their name,
logo or numbers anywhere: they are a real club, not a prop.

The offer throughout: **Greenside Founding Club** (`founder/pricing.md`): ten clubs, founding price
pioneers (first 3 clubs, before 1 June 2027) € 0.39 per member fixed for three years, founding clubs € 0.49 fixed
for two years, no migration fee, free three-month pilot with written
success criteria; **for pilots starting before 1 July 2027**. Say "ten places" only while it's true,
and publish how many are left only as an exact number.

| date | channel | what goes out | message |
| --- | --- | --- | --- |
| **Mon 15 Feb** (L−14) | — | Build the list: 40 clubs (all reachable E-Golf4U clubs + 9/18-hole clubs within an hour of Zwolle). Name, chair, club manager, system, members' meeting date | — |
| Tue 16 Feb | — | Write the letter and the one-pager (offer, contract clauses, "we do the work") | hook 1 |
| Wed 17 Feb | LinkedIn | Post: why we build an app in the club's own name (behind the scenes, screenshots of the Greenside base, not Zwolle) | hook 6 |
| Thu 18 Feb | Zwolle | Agree with Zwolle's board: reference calls allowed? which numbers can be shared after 4 and 12 weeks? | — |
| Fri 19 Feb | — | Print the member guide; prepare the Saturday helpline | — |
| Mon 22 Feb (L−7) | Post | Letters to the first 20 clubs: "Your E-Golf4U switch, done for you" + one-pager | hook 1 |
| Tue 23 Feb | LinkedIn | Post: the contract clauses in plain words (export anytime, 12 months' notice) | hook 3 |
| Wed 24 Feb | E-mail | Same letter as e-mail to the same 20, addressed to the chair or manager by name | hook 1 |
| Thu 25 Feb | LinkedIn | Post: "what a member over 70 sees": the printed guide, page by page | hook 5 |
| Fri 26 Feb | — | Zwolle: invitations ready, helpline staffed | — |
| **Mon 1 Mar (L)** | Zwolle | **Zwolle's members get the app.** No outward campaign today: all hands on Zwolle | — |
| Tue 2 Mar | LinkedIn | Post: launch day, what we did (import, invitations, helpline), no numbers yet | hook 7 |
| Wed 3 Mar | Phone | Call the 20 clubs that got the letter: "May I show you in 20 minutes?" | hook 2 |
| Thu 4 Mar | Phone | Calls continued; book visits | hook 4 |
| Fri 5 Mar | Post | Letters to the next 20 clubs | hook 1 |
| Sat 6 Mar | Zwolle | Saturday helpline; note every question (content for later) | — |
| Mon 8 Mar (L+7) | LinkedIn | Post: week 1 at Zwolle, *only* numbers Zwolle approved (e.g. members invited, members active) | hook 8 |
| Tue 9 Mar | Visit | First club visits: 20-minute demo on the club's own data (a CSV export they send) | hook 2 |
| Wed 10 Mar | E-mail | Next 20 clubs by e-mail | hook 1 |
| Thu 11 Mar | Phone | Calls to the second 20 | hook 9 |
| Fri 12 Mar | LinkedIn | Post: the five questions members asked most in week 1, and our answers | hook 5 |
| Sat 13 Mar | Zwolle | Saturday helpline | — |
| Mon 15 Mar (L+14) | LinkedIn | Post: "we do the work": what the volunteers at Zwolle did *not* have to do | hook 2 |
| Tue 16 Mar | Visit | Club visits; offer a call with Zwolle's board (only if Zwolle agreed) | hook 10 |
| Wed 17 Mar (L+16) | — | Review: conversations, pilot requests, Zwolle activation. Decide what to change (section 5) | — |

**Ten hooks** (Dutch, the market's language; each answers one objection)

1. Letter headline: **"Weg van E-Golf4U? Wij verhuizen uw club. U hoeft niets over te typen."** (switch effort)
2. Phone opener: **"Uw vrijwilligers doen niets: wij importeren, nodigen uit en nemen de telefoon op."** (double work)
3. LinkedIn headline: **"Uw ledenlijst is van u. Dat staat in ons contract, niet in een folder."** (data, two founders)
4. One-pager line: **"Stop na drie maanden, betaal niets."** (risk)
5. Post opening: **"Zo ziet een lid van 74 de app: papieren handleiding, één code per mail, klaar."** (older members)
6. Post opening: **"Uw club in de App Store, met uw eigen naam. Geen snelkoppeling op het startscherm."** (gap vs web apps)
7. Post opening: **"Vandaag kregen de leden hun eigen clubapp. Wat er vooraf gebeurde, zie je niet."** (behind the scenes)
8. Post headline (only with Zwolle's approval and real numbers): **"Week 1: [x] leden actief. Zonder één extra uur van het secretariaat."** (proof)
9. Phone opener for treasurers: **"Vervangt uw systeem, komt er niet bij. Wat betaalt u nu per maand?"** (cost on top)
10. Visit close: **"Bel het bestuur van Zwolle voordat u beslist."** (no live club) — only once Zwolle agrees.

**When there is nothing new to say:** a member question from the Saturday helpline and its answer;
a screen of the club management ("mission control") explained in one sentence; how the import
works, step by step; what the contract says, clause by clause; why there is no commission.

### 4. Budget

First three months, estimates (no quotes yet):

| item | € |
| --- | ---: |
| Letters and one-pagers, 60 clubs, printed and posted | 300 |
| Travel for ~15 club visits | 700 |
| Zwolle reference: printed case one-pager, coffee at a club visit | 300 |
| LinkedIn boost of 2–3 proof posts (optional, after week 2) | 300 |
| NVG: to be checked | ? |
| **Total** | **€ 1,600** + NVG |

**The most you can pay to win one club.** From the CFO (`founder/numbers.json`): a founding club
leaves **€ 343.20 a month** (pioneers € 250.20 for 36 months → € 9,007), fixed for 24 months →
**€ 8,237** over the founding term, after its own
running, onboarding and pilot costs. The panel's buy rate is 0%, so it cannot give a conversion
rate; the cap comes from cash instead. Two rules:
- **Spend at most 3 months of contribution, about € 1,030 cash per club won (€ 750 for a pioneer)**, so a club pays back
  its own acquisition in its first quarter after the pilot.
- **Never spend more than you have**: with the founders unpaid, total cash need is about € 11,200
  (`founder/cfo.md`); this campaign adds € 1,600.
The real cost is founder time: ~40 hours of onboarding per club, plus selling.

### 5. Three numbers to watch, weekly

| number | target | change something when |
| --- | --- | --- |
| **Conversations booked** (20-minute demo or visit with a board member or manager) | 3 a week | below 2 a week for two weeks → rewrite the letter, switch to phone first, ask Zwolle for an intro |
| **Zwolle members active in the app** (logged in that week ÷ members) | 40% by week 12 (the success criterion in the offer) | below 20% at week 4 → stop outreach, fix adoption at Zwolle first; nothing else sells without it |
| **Pilot requests / letters of intent** | 3 by L+90 (the board's "3 founding clubs" condition) | 0 after 10 conversations → the offer or the timing is wrong: ask every "no" why, in their words, and go back to `/founder-offer` |

### Rules for everything above

- No fake reviews, testimonials, follower counts or "as seen on". No numbers about Zwolle that
  Zwolle did not approve.
- Panel quotes are research, never customer quotes.
- Disclose any paid partnership. Claims about savings or revenue only with real data behind them.
  Not legal advice.

## Brand

Brief used: `founder/marketing.md` (positioning A: the E-Golf4U switch, "we do the work"),
`founder/competitors.md`, `founder/offer.md`, panel v1 and v2. Copy for the market is in Dutch.

**Starting point.** Greenside already has a name and a look in the product: the Greenside theme
(pine green, brass and chalk white, Fraunces and Manrope) in `packages/shared/src/brand.ts`, frozen
as `pilot-v1`. This skill does not change those values; a test guards them. What is new here: is
the name safe to keep, what does the company sound like, and the brief for the parts that don't
exist yet (a logo, the letter, the website).

**Who sees the Greenside brand.** Not the members: they see their club's own app, name and colours.
Greenside's brand is for **club boards, club managers and treasurers**, who meet it on a letter, a
one-pager, a contract, LinkedIn and the club management screens. It has to say *dependable*, not
*startup*. The panel's biggest doubt is "two founders, will they still be there?"; the brand must
not make that worse.

### 1. Name

#### Ten candidates

| # | name | style | what it says | out loud / on an icon | risk |
| --- | --- | --- | --- | --- | --- |
| 1 | **Greenside** (current) | evocative golf term | "next to the green": close to the game, at the club | easy in Dutch and English; "G" monogram works at 32 px | a common golf word, so **weak as a trademark**; a US swing-analysis app called **Greenside AI** exists (below) |
| 2 | Clubhuis | descriptive, Dutch | the club's home | warm, very Dutch | generic word: can't be registered; it is also a tab name in the app |
| 3 | Vlaggestok | evocative, Dutch | the flag on the green: where every round ends | memorable, a bit long; flag icon is easy | hard for non-Dutch; flag icons are a golf cliché |
| 4 | Marker | golf term | the person who checks your scorecard: trust | short, strong | common word; many "Marker" brands |
| 5 | Golvo | invented | nothing yet, so it can mean what you make it | short, sounds like a product | means nothing to a board; needs explaining |
| 6 | Baanboek | descriptive, Dutch | the club's book: tee sheet, members, invoices | clear | generic; sounds like a paper diary |
| 7 | Ledenhuis | descriptive, Dutch | home for members | clear | generic; sounds like a housing association |
| 8 | *[founders' surname] & Co* | founder's name | people you can call: answers the "who are they?" doubt | depends on the name | ties the company to two people, which is exactly the doubt |
| 9 | Veldzicht | place-like | a view over the course, like a Dutch estate name | sounds like a golf club | many places and companies are called that; confusion with clubs |
| 10 | Teeline | invented golf blend | tee + line: the tee sheet | easy | close to "TeeControl" and "TeeQuest" (competitors): confusion |

#### Shortlist: Greenside, Vlaggestok, Golvo

**Recommendation: keep Greenside, after the checks below.** The product, the code, the demo, the
review account and the pilot materials already carry it; members never see it; and it sounds
established, which is what boards need. Change it only if the trademark check finds a blocking
mark in the EU or Benelux for software (classes 9 and 42).

#### What I could check (public searches only)

- **Greenside AI** ([App Store](https://apps.apple.com/us/app/id6469555833)): a US golf
  swing-analysis app for golfers (publisher Greenside AI, Inc., site greenside.ai), 4.9 stars. Same
  word, same sport, App Store software. Different buyer (golfers, not clubs) and different market,
  but it is the main confusion risk, and a reason to always say **"Greenside Clubsoftware"** or
  pair the name with the logo, not the bare word.
- Other uses found: a golf restaurant "Greenside" in Bad Saarow, Germany; a golf simulator venue
  "Greenside Golf" in Cannock, UK; a 9-hole course "Greenside Colliery" in South Africa
  ([1golf.eu](https://www.1golf.eu/club/greenside-colliery-golf-club/)). No Dutch company or club
  software named Greenside turned up.
- **Competitor names** (`competitors.md`): IntoGolf, Nexxchange, E-Golf4U, Golfspot, TeeControl,
  Parrow, GolfBox, CompuGolf, Golf Genius, GOLF.NL, Golf@. None close to "Greenside".
- **Domains and handles: I could not check them.** This environment has no access to DNS or the
  registries. Check them yourselves (below).

#### Checks you must finish yourselves

I can only run public web searches. A trademark lawyer confirms, and **nothing is yours until you
register it**. Not legal advice.

| check | where | what to look for |
| --- | --- | --- |
| Benelux trademark | [BOIP register](https://www.boip.int/nl/merken) | "Greenside" in **class 9** (downloadable software, apps), **class 42** (software as a service), and **class 35** (member and business administration) |
| EU trademark | [EUIPO eSearch plus](https://euipo.europa.eu/eSearch/) and [TMview](https://www.tmdn.org/tmview/) (all EU offices at once) | same classes; also "Greenside AI" and figurative marks with the word |
| Company names | [KVK](https://www.kvk.nl/zoeken/) | an existing Dutch "Greenside" in software |
| .nl domain | [SIDN whois](https://www.sidn.nl/whois) | greenside.nl; alternatives: greensideclubs.nl, greenside-golf.nl, greenside.golf |
| .com | any registrar | greenside.com (likely taken; not needed for a Dutch business) |
| Handles | LinkedIn (company page, most important for this buyer), Instagram, YouTube (demo videos), X | "greenside" or "greensideclubs"; TikTok is not needed for this buyer |

A lawyer will probably say: as a plain word "Greenside" is **weak for golf software**, because it
describes a place on the course. A **word-and-logo mark** ("Greenside" with the logo) in the Benelux,
classes 9 and 42, is the cheaper and safer first step. Ask about it once the logo exists.

### 2. Promise, tagline, voice

**The promise** (what a club can count on, every time):
> **Uw club krijgt een eigen app, en wij doen het werk: de overstap, de uitnodigingen en de
> telefoon op zaterdagochtend.**

**Tagline, three options**
1. **"Uw club. Uw app. Wij doen het werk."** (recommended: promise and positioning in one line)
2. "De clubapp die van de club is."
3. "Overstappen zonder dat uw vrijwilligers het merken."

**Voice: three adjectives**

| | do | don't |
| --- | --- | --- |
| **Rustig** (calm) | short sentences; say what happens next and when | exclamation marks, "revolutionair", "game-changer", urgency that isn't real |
| **Concreet** | numbers, names, steps: "wij importeren uw leden uit E-Golf4U" | vague benefits: "optimaliseer uw clubbeleving" |
| **Eerlijk** | say what it doesn't do yet (NGF handicap link, direct debit) and what it does instead | promise revenue, or imply other clubs use it before they do |

Address boards formally (**u**); in the member app the club's own voice applies (the app already
uses short, friendly Dutch).

**Before / after** (pitch line from `founder/pitch.md`):
- Before: "We do the work: we import your members from E-Golf4U, Nexxchange, IntoGolf or Excel,
  invite them, give you a printed guide for older members and run a helpline in the first four
  weeks, Saturday mornings included."
- After: "**Wij doen het werk.** Wij zetten uw leden over uit E-Golf4U, Nexxchange, IntoGolf of Excel
  en nodigen ze uit. Leden boven de zeventig krijgen een papieren handleiding. De eerste vier weken
  nemen wij de telefoon op, ook op zaterdagochtend."

### 3. The look, as a brief

#### Colour (existing Greenside values, unchanged)

| colour | hex | job |
| --- | --- | --- |
| Dennengroen (pine 800) | `#10392D` | main colour: headers, buttons, dark surfaces, the logo |
| Messing (brass) | `#B8924A` | accent: the flag, a line, a highlight. **Not for text on light backgrounds** |
| Krijtwit (chalk) | `#F4F5F0` | paper: backgrounds, letters, one-pagers |
| Inkt (ink) | `#12201A` | body text |
| Messing tekst (brassText) | `#86652A` | accent as text on light paper |
| Licht messing (brassLight) | `#D9BC82` | accent as text on dark green |

Contrast (WCAG AA needs 4.5:1 for normal text, 3:1 for large text):

| text on background | ratio | verdict |
| --- | ---: | --- |
| ink on chalk | 15.4 | AA, AAA |
| chalk on pine 800 | 11.7 | AA, AAA |
| brassText on chalk | 4.9 | AA |
| brassLight on pine 800 | 7.0 | AA |
| brass on pine 800 | 4.4 | **large text and icons only** (fails AA for small text) |
| brass on chalk | 2.6 | **never for text**; decoration only |

#### Type

- **Fraunces** for headings, **Manrope** for text. Both are free under the SIL Open Font License,
  from [Google Fonts](https://fonts.google.com/specimen/Fraunces) and
  [Google Fonts](https://fonts.google.com/specimen/Manrope); use in print, web and the app is allowed.
  They are already in the product. In Word or Google Docs (letters, contracts), use the same fonts;
  if they aren't installed, fall back to Georgia for headings and Arial for text.

#### Logo brief

Greenside has **no logo yet**; the product shows a "G" monogram.
- **It must say**: dependable, Dutch, close to the club. Calm enough for a contract, recognisable
  next to a club's own logo ("met Greenside" in a footer).
- **It must work**: as a 32 px app/browser icon and LinkedIn avatar; one colour (pine on chalk,
  chalk on pine); in a letterhead; as a small "met Greenside" line under a club's app or guide,
  where it must never compete with the club's own logo.
- **Direction to try**: a "G" whose inner curve reads as the edge of a green, or a G with a small
  brass flag. A word mark set in Fraunces.
- **Avoid**: golf ball with a swoosh, crossed clubs, a plain flag on a circle (clichés, and close to
  many club logos), anything resembling the NGF or GOLF.NL logos, gradients.
- Concepts: I have no image-generation tool here, but I can draw 3–4 **SVG concepts** in code; those
  are concepts, not a finished logo. A designer finishes the one you pick, and you own the files.

#### The first five touchpoints

1. **The website homepage** (greenside.nl, if free). Top line: "Uw club. Uw app. Wij doen het werk."
   Below: three blocks (eigen app in de stores · wij verhuizen uw club · uw gegevens blijven van u),
   the Founding Club offer with its real end date, and *"Bel het bestuur van Golfclub Zwolle"* only
   once Zwolle has agreed. Chalk background, pine headings, one brass line.
2. **The letter and one-pager** (the "packaging" for this buyer). Chalk paper, logo top left, Fraunces
   heading, the board member's name in the salutation, signed by a founder with a mobile number.
   One page: what it is, what it costs, the contract clauses, "wij doen het werk".
3. **The pilot confirmation** (the "receipt"). An e-mail and a PDF: the success criteria agreed,
   the start and end date, who does what, the helpline number, and "u kunt na de pilot stoppen
   zonder te betalen".
4. **The first LinkedIn post**: a founder, a real screenshot of the Greenside base, two sentences on
   why a club deserves its own app. No stock photos, no claims about clubs that don't exist yet.
5. **The reply to the first complaint** (a member's login code didn't arrive on a Saturday):
   "Vervelend dat de code niet aankwam. Ik heb een nieuwe gestuurd en gecontroleerd dat hij is
   afgeleverd. Kijkt u ook even in de map 'Ongewenst'? Lukt het niet, bel mij dan op [nummer];
   ik neem vandaag op." Same day, a name, a phone number: the answer to "two founders".

### Rules kept

- No competitor names, logos, colours or taglines copied.
- Fonts: SIL Open Font License only. No images or icons without rights.
- Zwolle's name and logo only with Zwolle's written consent.
- Not legal advice on trademarks.

## Operations

How Greenside runs from the day Zwolle goes live. Inputs: `founder/offer.md` (what was promised),
`founder/numbers.json` (costs), `README.md` "Naar productie" (the technical go-live steps),
`founder/marketing.md` (the sales rhythm). Amounts excl. VAT. Prices checked 8 October 2026; where
only a quote will tell, it says so and it is on the open-questions list at the end.

**Costs that changed** (fed back to the CFO; `founder/numbers.json` updated and `founder/cfo.md`
re-run):
- **Apple developer account: € 8.25 → € 0 per club-month for Greenside.** Apple's guideline 4.2.6
  says apps built from a template are rejected unless the content owner submits them, so **each club
  enrols itself** and pays its own € 99 a year (sources in section 2).
- **Onboarding per club: € 55 → € 35 per club-month.** A printed 8-page A5 guide costs about € 0.30 a
  copy at 1,000 copies, so ~€ 300 per club instead of the € 600 guess.
- **Insurance: € 75 → € 100 a month.** Professional liability alone is about € 61 a month for a
  software developer (Univé indication), and cyber cover comes on top.
- **Security test: € 5,000 → € 7,500 once.** Pentests of a small web app cost € 5,000–14,000.

Result: contribution € 318.50 per club-month (was € 290), fixed costs € 398 (was € 373),
break-even with € 2,500 pay for each founder **16 clubs** (10 founding + 6 list; was 18). After the
switch to a price per member with pioneer tier and guarantees (8 October 2026): break-even with pay
**15 clubs** (3 pioneers + 7 founding + 5 list), fixed costs € 533 incl. escrow and IT partner. Year 1
runs on Expo Starter (USD 19) and starts escrow and the IT partner at the third club: € 326 a month.

### 1. The daily cycle

Greenside sells software and service, so the "day" is mostly invisible to the customer. Steps a
**club sees** are marked 👁, steps a **member sees** are marked 📱.

| when | step | who sees it |
| --- | --- | --- |
| 08:00 | Check overnight: errors, failed e-mails (login codes, invitations), failed payments, database health | — |
| 08:15 | Support inbox and voicemail: answer every club the same morning | 👁 |
| 08:30 | Today's onboarding work: imports, checks, invitations for clubs in their launch weeks | 👁 📱 |
| during the day | Sales: calls, visits, follow-ups (marketing calendar) | 👁 |
| during the day | Product work on the work branch only; `pilot-v1` stays frozen | — |
| 17:00 | Release window (at most twice a week, never Friday or Saturday): tests, base check, deploy | 📱 |
| 17:30 | Check the day: open tickets, anything promised to a club today | — |
| Saturday 08:00–12:00 | **Helpline** for clubs in their first four weeks (the promise in the offer) | 👁 📱 |
| monthly | Invoice the licences (SEPA direct debit), bookkeeping, check backups by restoring one | 👁 |

**The core service is the onboarding of a club**, not the day: it runs from six weeks before go-live
to four weeks after (routine 4.2). That is where most founder hours go (~40 per club).

### 2. Suppliers

| what | supplier | public price | alternatives | terms and notes |
| --- | --- | --- | --- | --- |
| Database, login, files, edge functions (EU, Frankfurt) | **Supabase** Pro | USD 25 a month incl. USD 10 compute credit; Small compute ~USD 15 ([Makerkit](https://makerkit.dev/blog/saas/supabase-pricing), [Jetadmin](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/)) | self-hosted Supabase on an EU server (cheaper, much more work); no drop-in alternative for the current code | monthly, card; spend cap on by default. Confirm on supabase.com/pricing |
| E-mail for login codes and invitations | **Resend** Pro | USD 20 a month, 50,000 e-mails ([Resend docs](https://resend.com/docs/knowledge-base/what-is-resend-pricing.md)) | **Postmark** USD 15 a month, 10,000 e-mails, overage USD 1.80 per 1,000 ([Automation Atlas](https://automationatlas.io/answers/postmark-pricing-explained-2026/)) | a club launch sends ~950 invitations at once; set Supabase's e-mail limit to ≥ 1,000 an hour (README) |
| App builds and store submission | **Expo EAS** | Production USD 99 a month ([expo.dev/pricing](https://expo.dev:443/pricing)); Starter USD 19 | build locally with Xcode and Android Studio (free, needs a Mac, slower) | start on Starter; move up at ~5 apps |
| Club management hosting | **Vercel** Pro | USD 20 a month, 1 seat ([Vercel docs](https://docs.vercel.com/docs/plans/pro-plan)) | any Node host in the EU | security headers already in `next.config.ts` |
| App Store, per club | **Apple Developer Program**, the club's own account | USD 99 (~€ 99) a year; organisations need a free D-U-N-S number; non-profits can ask for a fee waiver ([Apple](https://developer.apple.com/support/compare-memberships), [fee waiver](https://developer.apple.com/support/fee-waiver)) | none: Apple requires the content owner to submit template apps (guideline 4.2.6, [TechCrunch](https://techcrunch.com/?p=1580390), [GoodBarber](https://goodbarber.com/blog/apple-app-store-guideline-4-2-6-a862)) | **lead time 2–4 weeks** (D-U-N-S, Apple's checks): start it six weeks before go-live. The club gives Greenside access as App Manager |
| Google Play, per club | **Google Play Console**, the club's own account | USD 25 once ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)) | Greenside's own account (allowed by Google, but keep it the same as Apple) | identity checks take days; start with the Apple enrolment |
| Members' payments (iDEAL, invoices) | **Mollie**, the club's own account | per transaction, paid by the club | — | not Greenside's cost; the club does Mollie's checks (KYC) before go-live |
| Collecting Greenside's licence | **Mollie** SEPA direct debit, or the bank | Mollie ~€ 0.25 per collection (unverified, [PayRequest](https://payrequest.io/nl/blog/transactiekosten-verlagen-factuurconsolidatie)); ABN AMRO € 0.13 + € 2.10 per batch ([tariffs 2026](https://assets.abnamro.com/api/public/content/Tarieven_Zakelijk_Betalingsverkeer_ABN_AMRO_Januari_2026.pdf)) | invoice with bank transfer | one collection a month (or a year) per club; within the € 0.50 in the CFO |
| Printed member guide | **Helloprint** or **Drukwerkdeal** | quote online; UK reference: 8-page A5, 1,000 copies £ 243 ([price list](https://ep.dev.shout-loud.co.uk/promo-print/brochure-printing/a5-brochures)) | a local printer near the club | lead time ~1 week; order two weeks before invitations go out |
| Bookkeeping | **Moneybird** | from € 3 a month (5 bank transactions) to € 15–29 with a bank link ([nieuws.nl](https://nieuws.nl/economie/gratis-boekhouden-wordt-zeldzaam-moneybird-stopte-ermee-rompslomp-gaat-per-factuur-rekenen), [Moneybird](https://www.moneybird.com/blog/changed-prices-for-moneybird-2025/)) | e-Boekhouden, Jortt, Rompslomp | plus an accountant for the year-end and VAT advice |
| Insurance | **Univé**, **Hiscox** (via ZZP Nederland), others | professional liability ~€ 61 a month for a software developer, an indication ([Univé](https://www.unive.nl/zakelijk/bedrijfsaansprakelijkheidsverzekering/beroepsaansprakelijkheidsverzekering/software-consultant)); cyber by quote ([ZZP Nederland](https://www.zzp-nederland.nl/verzekeringen-en-advies/cyberverzekering)) | an independent broker | get two quotes; ask about cover for a data breach at a club |
| Security test (pentest) | a Dutch pentest firm | € 5,000–14,000 for an SMB web app, 5–10 days ([Kolonell](https://kolonell.com/en/blog/web-application-penetration-test-price-smb-dublin-2026)); beware a cheap "pentest" that is only a scan ([RedFox](https://www.redfoxsec.com/blog/how-much-does-web-application-penetration-testing-cost-2026-pricing-guide)) | three quotes | include the member app, club management, the importer, the edge functions and club separation; plus a retest |
| Business phone for the helpline | **Voys** or a mobile provider | by quote (no public price found) | a second SIM | one number that rings both founders |
| Lawyer (contract, AVG documents) | an IT/privacy lawyer | by quote (CFO estimate € 2,500) | standard IT terms plus a privacy specialist | needed before the first club signs |

### 3. People

Two founders, no staff. Pay: **€ 2,000–2,500 each a month** is the target (the founders' own
number); until ~15 clubs pay, pay grows with revenue (`founder/cfo.md`). What that costs the company
depends on the legal form: in a BV a director-shareholder must take a minimum "customary" salary,
in a VOF or sole proprietorship there is no payroll and you pay income tax on the profit. **Ask an
accountant before choosing**; payroll costs, pension and VAT are not in these numbers.

**Roles**
- **Founder A — product and safety**: releases, security, monitoring, imports, the base check,
  answering technical tickets.
- **Founder B — clubs and sales**: outreach, visits, the onboarding meetings, the printed guide, the
  helpline lead, invoicing.
Both can do the morning check and the Saturday helpline, so one can be ill or on holiday.

**Rota, slow first month (Zwolle live, no other clubs)**

| | Mon | Tue | Wed | Thu | Fri | Sat |
| --- | --- | --- | --- | --- | --- | --- |
| A | morning check, product | product, release 17:00 | product | product, release 17:00 | product, week review | helpline (alternate weeks) |
| B | Zwolle check-in, calls | visits | calls, letters | visits | admin, week review | helpline (alternate weeks) |

About 45 hours a week each; most of it is selling (B) and finishing the product seams (A).

**Rota at plan (10 clubs live, 1–2 onboarding at once)**

| | Mon | Tue | Wed | Thu | Fri | Sat |
| --- | --- | --- | --- | --- | --- | --- |
| A | morning check, support | imports for new clubs, release | product | support, release | product, backups test | helpline if a club is in its first 4 weeks |
| B | support, calls | onboarding meetings | visits | onboarding meetings | invoicing, week review | helpline if a club is in its first 4 weeks |

**Support load is the limit to watch.** Assume ~2 hours a week per live club after its first month
(an estimate; measure it at Zwolle). At 10 clubs that is ~20 hours a week; at 15 clubs ~30 hours,
most of one founder. So the "~25 clubs" capacity in the CFO only holds if support per club stays
low; Zwolle's first three months tell you.

### 4. Routines

#### 4.1 Morning check (15 minutes, every working day)
1. Open the error overview of Supabase and Vercel: any errors since yesterday? Note them.
2. E-mail provider: any bounced or delayed login codes or invitations? If a club has more than a few,
   call the club before its members do.
3. Mollie (per club, via the club's dashboard if shared): failed payments or webhooks?
4. Support inbox and voicemail: reply to every club before 10:00, even if only "we're on it, you'll
   hear from us before 14:00".
5. Anything promised to a club for today? Put it at the top.

#### 4.2 Onboarding a club (the core service, six weeks)
1. **Week −6**: contract signed with success criteria (offer B). Club starts its Apple Developer
   enrolment (D-U-N-S) and Google Play account; Mollie account if it has none. One contact person.
2. **Week −5**: club sends the export from its current system (E-Golf4U, Nexxchange, IntoGolf or
   Excel). Import into a test club first; check the counts with the club (members, families,
   membership types).
3. **Week −4**: logo and colours → `clubs/<club>/`, `brand.ts`, `pnpm club:assets <club>`, contrast
   test green. Base check: Greenside unchanged.
4. **Week −3**: build the app; submit to Apple and Google from the club's accounts. Order the printed
   guide (club's colours).
5. **Week −2**: board and 10–20 members test the app (the pilot group). Fix what they find.
6. **Week −1**: real import; check counts again; secretariat training (one hour, at the club).
7. **Go-live (day 0)**: invitations in batches (not all at once on a Saturday); founder on site or
   on the phone all day.
8. **Weeks 1–4**: Saturday helpline; weekly call with the contact person; count active members
   against the success criterion.
9. **Week 12**: end of pilot: success criteria met? Club continues (licence starts) or stops and pays
   nothing, and gets its data export.

#### 4.3 Release (protects the base)
1. Work only on the work branch; `pilot-v1` is never changed.
2. `pnpm typecheck && pnpm lint && pnpm test` and the database tests (`supabase/tests/run-local.sh`).
3. For changes in shared code: compare Greenside screen by screen with `pilot-v1` (base check).
4. New database change = new migration, tested; never edit an old one.
5. Release Monday to Thursday after 17:00; never on Friday, Saturday or in a club's launch week.
6. Check the morning after (routine 4.1).

#### 4.4 A complaint or an incident
1. **Answer the same day**, by name, with a phone number (`founder/brand.md`, touchpoint 5).
2. A member problem (code doesn't arrive, can't book): fix it for that member first, then look for
   the cause. Note it.
3. A club-wide problem (no codes, booking down): call the club's contact person **before** they call
   you; say what is wrong, what you're doing, when you'll call back.
4. **A possible data leak** (member data seen by someone who shouldn't, a lost key): stop it, write
   down what happened, inform the club (the club is responsible for its members' data, Greenside
   processes it), and help it decide on reporting to the Autoriteit Persoonsgegevens, which must be
   **within 72 hours** of discovery ([Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl)).
5. Afterwards: one page, what happened and what changed, sent to the club.

#### 4.5 Weekly and monthly
1. **Friday**: week review: the three marketing numbers, open tickets, support hours per club,
   anything promised.
2. **Friday**: restore one backup to a test environment and check it opens (monthly at least).
3. **Monthly, 1st working day**: licence invoices and SEPA collection; check payments a week later.
4. **Monthly**: printed guides for clubs onboarding in the next six weeks; reorder.
5. **Quarterly**: costs against `founder/numbers.json`; re-run the CFO if they moved.

### 5. Tools (the smallest stack)

| job | tool | price | why |
| --- | --- | --- | --- |
| Product hosting | Supabase, Vercel, Expo, Resend | ~€ 160 a month (CFO fixed costs) | already built on them |
| Bookkeeping, invoices, VAT | Moneybird | € 15–29 a month | Dutch, bank link, invoices and SEPA |
| Licence collection | Mollie or the bank | ~€ 0.13–0.25 per collection | clubs pay by direct debit |
| Support | a shared mailbox (Google Workspace or similar) + the helpline number | ~€ 14 + € 15 a month | one inbox, one number, both founders |
| Sales pipeline | Greenside HQ (already built) | € 0 | prospects, clubs, setup checklist in one place |
| Planning | a shared calendar | € 0 | release days, launch weeks, Saturday rota |
| Passwords and keys | a password manager with sharing | ~€ 5 a month (estimate) | service keys never in chat or e-mail |

### 6. Licences, registration and rules

Rules differ by situation and change; confirm each with the authority or a professional. Not legal
advice.

- [ ] **Chamber of Commerce (KVK) registration** ~€ 85 once (sources differ: € 80–85;
  [Ondernemersplein](https://ondernemersplein.overheid.nl/inschrijven-bij-kvk/), [KVK](https://www.kvk.nl)).
  The VAT number comes with it.
- [ ] **Legal form**: VOF or BV. A BV needs a notary (~€ 400–800 extra, [Onderneming.nl](https://www.onderneming.nl/bedrijf-starten/inschrijving-kvk/)) but
  limits personal liability, which matters when you hold the data of thousands of members. Decide
  with the accountant.
- [ ] **AVG (GDPR)**: Greenside processes members' data for the clubs, so you need a **data
  processing agreement** (verwerkersovereenkomst) with every club, a **privacy statement**, a
  **record of processing**, and a list of **sub-processors** (Supabase in Frankfurt; Vercel, Resend
  and Expo are US companies, so mention the transfer basis). A data protection impact assessment is
  advisable for member data at this scale. The lawyer in the CFO's start-up costs covers this.
- [ ] **Data breach procedure**: report within 72 hours (routine 4.4).
- [ ] **Terms and conditions** and the **contract** with the clauses from the offer: pilot, success
  criteria, walk-away, data export, 12 months' notice and handover.
- [ ] **Apple and Google**: each club accepts the Apple Developer Program and Google Play terms itself.
- [ ] **Accessibility (European Accessibility Act)**: service providers that are microenterprises
  (fewer than 10 people and at most € 2 million turnover) are exempt
  ([CCPC guidance](https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/),
  [iubenda](https://www.iubenda.com/nl/help/181743-eaa-compliance-5/)). The app already aims for
  contrast ≥ 4.5:1 and 44 pt touch targets; keep it that way, older members need it anyway.
- [ ] **Website**: cookie consent if you use anything beyond strictly necessary cookies.
- [ ] **Insurance**: professional liability and cyber (section 2).
- [ ] **Each club**: Mollie account checks, D-U-N-S number, its own privacy statement mentioning the app.

### 7. Risk register

| # | risk | likely | how bad | plan |
| --- | --- | --- | --- | --- |
| 1 | **Members don't use the app at Zwolle** (below 20% active by week 4) | medium | very high: no proof, no sales | stop outreach; fix adoption first (guide, invitations in groups, help at the clubhouse); measure weekly |
| 2 | **Login codes don't arrive** (spam filter, e-mail limit, provider outage) | medium | high on a Saturday | own domain with SPF/DKIM/DMARC; e-mail limit ≥ 1,000 an hour; a second provider ready (Postmark); helpline script |
| 3 | **Apple rejects or delays a club's app** (4.2.6, 4.3, review) | medium | high: go-live slips | submit from the club's account, three weeks early; review account ready (`pnpm app-review`); ask App Review about per-club builds before the first submission |
| 4 | **A founder is ill or leaves** | medium over 2 years | very high: "two founders" is the top objection | both can run the morning check and the helpline; written routines (this file); passwords in a shared manager; a founders' agreement on what happens if one leaves |
| 5 | **Data leak between clubs or of members** | low (RLS and tests) | very high | pentest before go-live; club separation tested in `database.test.sql`; incident routine 4.4; cyber insurance |
| 6 | **A release breaks the base or a club's app** | medium | high | release routine 4.3; never Friday or Saturday; base check; quick rollback by redeploying the previous version |
| 7 | **The import goes wrong** (wrong counts, families split) | medium | high: the board's first impression | import into a test club first; counts checked with the club twice (weeks −5 and −1) |
| 8 | **Support swamps the founders** as clubs grow | high after ~10 clubs | medium | measure hours per club from Zwolle; improve the guide and the app where questions repeat; hire part-time support before 15 clubs |
| 9 | **A supplier raises prices or changes terms** (Expo, Supabase, Apple) | medium | low to medium (costs are small) | costs are ~€ 160 a month; review quarterly; local builds as a fallback for Expo |
| 10 | **A slow sales year** (clubs wait for a full season) | high | high: no pay for the founders | plan pay to grow with clubs; keep costs at ~€ 400 a month; decide the bridge (savings, part-time, a loan) before go-live |

### Open questions (need a quote or a decision)

1. Pentest: three quotes from Dutch firms, scope as in section 2.
2. Insurance: two quotes for professional liability plus cyber.
3. Lawyer: quote for the data processing agreement, privacy statement, terms and the club contract.
4. Printing: a Dutch quote for 1,000 A5 guides (8 or 12 pages).
5. Helpline number: Voys or a mobile provider, price.
6. Legal form (VOF or BV) and how the founders are paid: accountant.
7. Ask Apple App Review how they treat per-club builds of the same app (4.2.6 and 4.3) before the
   first submission ([Apple developer forum thread](https://developer.apple.com/forums/thread/840982)).
8. Mollie's actual SEPA direct debit rate for the licence.

### 8. Added with the breakthrough offer (8 October 2026)

**New suppliers** (quotes needed; estimates in `founder/cfo.md`):
- **Source-code escrow** (in place before the third club starts): a Dutch escrow agent or a notary holds the code and releases it to the clubs if
  Greenside stops. Estimate ~€ 1,000 a year.
- **IT partner on standby**: a small Dutch software firm that knows the stack (Supabase, Expo, Next.js),
  with a written agreement to keep the platform running for 12 months if the founders stop. Estimate
  ~€ 50 a month retainer.

**New routines**
1. **Weekly copy during the pilot** (owner A, every Monday, ~1 hour per club): the club sends the CSV
   export from its old system → import in Greenside with "update existing members" on → check counts →
   short note to the contact person. Nothing is deleted; members who left are flagged by hand.
2. **Monthly export to the club's own storage** (automatic, first working day): full export of members,
   invoices and bookings to the club's chosen storage; check it arrived.
3. **E-Golf4U safety net** (only if a pilot fails its criteria): within four weeks, deliver the club's
   members, invoices and bookings in the import format of Nexxchange or IntoGolf, and help their
   implementation team once. Ask both vendors for their import format before the first E-Golf4U pilot.
4. **Contract start date** (owner B): the licence starts on the day the club cancels its old system, at
   most 6 months after the pilot; the first invoice falls in the club's next budget year. Record both
   dates in Greenside HQ.
5. **Yearly member count** (owner B, January): ask each club for its number of NGF-registered members on
   1 January; set the yearly amount (minimum and maximum per tier); invoice.

**More open questions:** escrow quote; IT partner agreement; import formats of Nexxchange and IntoGolf;
the SEPA direct debit file (pain.008) to build before the first club goes live.

## Launch plan

**Launch day L = Monday 1 March 2027: Golfclub Zwolle's members get their app.** No date was agreed
yet; this is the date the marketing calendar assumes, before the season and before boards prepare
the spring members' meeting. With the lead times in `founder/ops.md` (lawyer, pentest, Apple
enrolment) the earliest realistic date is mid-January 2027, but members play little in January and
a launch then wastes the reference. **Agree the date with Zwolle's board in week 1**; every date
below moves with it.

Owners: **A** = founder for product and safety, **B** = founder for clubs and sales
(`founder/ops.md`). Today is Thursday 8 October 2026.

### 1. Test before you spend

The big money in this plan is not the hosting (€ 400 a month) but **paying yourselves**
(€ 5,000 a month, `founder/cfo.md`) and any outside money. The pentest (€ 7,500) and the lawyer
(€ 2,500) are needed for Zwolle anyway: real member data never goes live without them. So the test
decides **whether to start paying yourselves or raise money**, not whether to go live at Zwolle.

The fitting test for a subscription sold to boards: **real boards, the real price, a signature.**

**Test 1 — before the pentest is booked (12 October – 18 December 2026)**
- Zwolle signs the pilot contract: success criteria in writing, and as a **pioneer** (€ 0.39 per member a month, fixed three years)
  **paying from month 1** (go-live). In return Zwolle is the reference club and keeps the pioneer price;
  if the success criteria are not met at week 12, Zwolle can still stop. Negotiate this; it is worth
  ~€ 1,100 in year 1 (`founder/cfo.md`).
- 15 letters to clubs still on E-Golf4U or near Zwolle (marketing hook 1). No claims about Zwolle.
- **Success line: Zwolle signed by 13 November, and by 18 December at least 5 board conversations and
  2 signed letters of intent** ("if Zwolle meets its criteria, we start a pilot in 2027 at the pioneer price of € 0.39 per member").
- Panel comparison: the panel says 0 of 20 buy now and 19 of 20 wait for Zwolle. So **zero firm
  orders is expected**; conditional letters are the honest measure. Fewer than 5 conversations from
  15 letters means the message or the channel is wrong, not the market: rewrite and try 15 more.
  If Zwolle won't sign the paid follow-on, stop and go back to `/founder-offer` before spending more.

**Test 2 — Zwolle's pilot (1 March – 24 May 2027)**
- **Success line: 40% of Zwolle's members active in week 12** (the success criterion in the offer),
  Zwolle continues and pays from June, and **3 pilot requests from other clubs by L+90 (30 May)**.
- If real adoption falls well short of 40%, trust Zwolle's members, not the panel: fix the product
  and the launch kit before selling to anyone else.
- Only when Test 2 passes: start paying yourselves step by step, or talk to lenders or investors
  with Zwolle's numbers.

### 2. The countdown

Weekly blocks, Monday dates. **Critical path** (moves L if it slips) marked ⚠.

| week of | task | owner | done by |
| --- | --- | --- | --- |
| **12 Oct** | ⚠ Meet Zwolle's board: go-live date, pilot contract terms, success criteria, contact person, permission to use their name later | B | Fri 16 Oct |
| | Accountant: VOF or BV, how founders are paid | A+B | Fri 16 Oct |
| | Ask 3 pentest quotes, 2 insurance quotes, 1 lawyer quote (`ops.md` open questions) | A | Fri 16 Oct |
| | Protect `main` and `pilot-v1` on GitHub (rulesets, still open) | A | Fri 16 Oct |
| **19 Oct** | ⚠ Zwolle starts Apple Developer enrolment (D-U-N-S number: 2–4 weeks), Google Play account, Mollie account checks | B (with Zwolle) | Fri 23 Oct |
| | KVK registration, business bank account, Moneybird | A | Fri 23 Oct |
| | ⚠ Lawyer starts: data processing agreement, privacy statement, terms, pilot contract | B | Fri 23 Oct |
| | Zwolle sends a test export from its current system | B | Fri 23 Oct |
| **26 Oct** | Test 1: list of 15 clubs, letters out | B | Fri 30 Oct |
| | Production accounts: Supabase EU (Frankfurt), Resend with own domain (SPF/DKIM/DMARC), Vercel, Expo, Greenside's own Apple account, password manager | A | Fri 30 Oct |
| | Book the pentest (3–4 weeks lead time), insurance in place | A | Fri 30 Oct |
| **2 Nov** | Product decisions the board asked for: bar-staff role, ball machine (Xafax) in or out of the pilot, who owns the member record when systems disagree | A+B | Fri 6 Nov |
| | Test import of Zwolle's export into a test club; check counts with Zwolle | A | Fri 6 Nov |
| | Calls to the 15 letters | B | Fri 6 Nov |
| **9 Nov** | ⚠ **Zwolle signs** the pilot contract and the data processing agreement | B | **Fri 13 Nov** |
| | Production go-live steps from the README on the real accounts (settings, e-mail limits, MFA for admins) | A | Fri 13 Nov |
| **16 Nov – 4 Dec** | ⚠ Pentest runs (1–2 weeks) on the production setup with test data | A | Fri 4 Dec |
| | Board conversations from Test 1; letters of intent | B | ongoing |
| | Printed member guide: text and design (Greenside layout, Zwolle colours) | B | Fri 4 Dec |
| **7 Dec** | ⚠ Pentest report; fix every high and medium finding | A | Fri 18 Dec |
| **14 Dec** | **Test 1 review** against the success line | A+B | **Fri 18 Dec** |
| **21 Dec – 1 Jan** | Holiday buffer. Nothing planned on purpose | — | — |
| **4 Jan** | ⚠ Pentest retest | A | Fri 8 Jan |
| | Website live (greenside.nl or alternative), LinkedIn company page, one-pager and letter template (`brand.md`) | B | Fri 8 Jan |
| **11 Jan** | ⚠ Zwolle's app built from `clubs/zwolle`; base check against `pilot-v1`; review account ready (`pnpm app-review`) | A | Fri 15 Jan |
| **18 Jan** | ⚠ **Submit to Apple and Google** from Zwolle's accounts (6 weeks before L: room for one rejection) | A | Mon 18 Jan |
| | Saturday helpline: number, rota for the first four weeks, script for "my code didn't arrive" | B | Fri 22 Jan |
| **25 Jan** | Apps approved, kept unreleased; fix and resubmit if rejected | A | Fri 29 Jan |
| **1 Feb – 12 Feb** | **Soft open**: Zwolle's board and 10–20 members use the real app on test data; daily fixes | A+B | Fri 12 Feb |
| **8 Feb** | Order printed guides (~1 week delivery) | B | Mon 8 Feb |
| **15 Feb (L−14)** | Marketing calendar starts (`marketing.md`): list of 40 clubs, letter, first posts | B | per calendar |
| **22 Feb** | ⚠ Real import of Zwolle's members; counts checked with Zwolle; secretariat training (1 hour, at the club) | A+B | Wed 24 Feb |
| | **Go / no-go** with Zwolle's contact person (checklist below) | A+B | **Fri 26 Feb** |
| **1 Mar** | **L: launch day** | A+B | — |

**Go / no-go checklist (Friday 26 February)**: apps live in both stores under Zwolle's name ·
import counts signed off by Zwolle · test login codes arrive within 1 minute at Gmail, Outlook and
KPN addresses · pentest retest clean · data processing agreement signed · printed guides at the club ·
helpline rota and number working · rollback tested. Any "no" → move L by a week, tell Zwolle the
same day.

### 3. Launch day: Monday 1 March 2027

B is at Zwolle's clubhouse all day; A works from a screen with the monitoring open. No outward
campaign today (`marketing.md`): all attention on Zwolle.

| time | who | what |
| --- | --- | --- |
| 07:30 | A | Morning check (`ops.md` 4.1): errors, e-mail provider, database. All green or stop |
| 08:00 | A+B | 10-minute call: go. Agree the stop rule (below) |
| 08:30 | B | At the clubhouse: help table with printed guides, a sign "Hulp bij de nieuwe app" |
| 09:00 | A | **Batch 1**: invitations to the board, committees and volunteers (~100). Watch delivery |
| 10:00 | A | Batch 1 check: ≥ 90% delivered, first logins work → go on |
| 10:30 | A | **Batch 2**: ~300 members (first part of the list) |
| 12:00 | A+B | Midday check: delivery rate, logins, questions at the table and on the phone |
| 13:30 | A | **Batch 3**: ~300 members |
| 15:30 | A | **Batch 4**: the rest |
| 16:00 | B | Short news item in the app for Zwolle's members (text agreed with Zwolle) |
| 17:00 | A | Count: invited, delivered, logged in. Note every question asked today |
| 18:00 | A+B | Short report to Zwolle's contact person: numbers, problems, what happens tomorrow |
| 18:30 | B | LinkedIn: nothing yet. The launch post goes out tomorrow (marketing calendar) |

**Stop rule and what to do when something breaks** (from the risk register in `ops.md`):
- **Codes or invitations not arriving** (delivery below 90% for a batch): pause the next batch, check
  the e-mail limit and the provider; switch to the second provider (Postmark) if needed. Tell the
  help table what to say.
- **Login or booking errors for many members**: pause invitations; if it's a release problem,
  redeploy the previous version (rollback tested on 26 Feb). Call Zwolle's contact person before
  members do.
- **Wrong member data** (wrong name, family, membership): stop invitations at once, fix the import,
  apologise to the affected members by e-mail from the club.
- **Anything that looks like members seeing another person's data**: stop, follow the data-breach
  routine (`ops.md` 4.4, 72 hours).

### 4. The first 30 days

**Weekly numbers** (every Friday, in the week review):

| number | source | target | change something when |
| --- | --- | --- | --- |
| Zwolle members active this week (÷ all members) | app | 20% in week 4, 40% in week 12 | below 10% at day 14 or 20% at day 28 → stop outreach, fix adoption first |
| Invitations delivered / accepted | e-mail provider, app | ≥ 95% delivered | more than 2% bounced → clean addresses with Zwolle, check the domain setup |
| Support hours for Zwolle | own log | falls each week | above 10 hours a week after week 2 → the guide or the app is unclear; fix what repeats |
| Board conversations booked | marketing log | 3 a week | below 2 a week for two weeks → rewrite the letter, phone first, ask Zwolle for an intro |
| Pilot requests / letters of intent | marketing log | 3 by 30 May | 0 after 10 conversations → back to `/founder-offer` |
| Paying clubs vs break-even | CFO | 1 (Zwolle pays from month 1); break-even 2 pioneer clubs unpaid, 15 clubs with pay | — the money test is Test 2, not the first month |

**Reviews** (A+B, one hour, written notes):

- **Day 7 (Mon 8 March)**: Did every member who wanted to log in manage it? What were the five most
  asked questions, and which ones can the app or the guide answer instead of us? Is Zwolle's contact
  person happy, in their own words? Anything we promised that we haven't done?
- **Day 14 (Mon 15 March)**: Are we at 10% active or more? Which groups are missing (age, membership
  type)? Is the Saturday helpline still needed after week 4? How many board conversations, and what
  objection came up most? Does it match the panel?
- **Day 30 (Wed 31 March)**: 20% active? Support hours falling? Is Zwolle willing to take reference
  calls, and which numbers may we share? Do we need to change the offer, the price or the launch kit
  before the next club? Re-run the CFO with the real support hours.

Next: `/founder-plan` compiles everything into the business plan.

_The panel is simulated buyers and the numbers are projections from your inputs. Confirm demand with real customers and costs with real quotes before you spend. Not financial, legal or tax advice._
