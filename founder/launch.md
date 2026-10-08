# Launch: Greenside

**Launch day L = Monday 1 March 2027: Golfclub Zwolle's members get their app.** No date was agreed
yet; this is the date the marketing calendar assumes, before the season and before boards prepare
the spring members' meeting. With the lead times in `founder/ops.md` (lawyer, pentest, Apple
enrolment) the earliest realistic date is mid-January 2027, but members play little in January and
a launch then wastes the reference. **Agree the date with Zwolle's board in week 1**; every date
below moves with it.

Owners: **A** = founder for product and safety, **B** = founder for clubs and sales
(`founder/ops.md`). Today is Thursday 8 October 2026.

## 1. Test before you spend

The big money in this plan is not the hosting (€ 400 a month) but **paying yourselves**
(€ 5,000 a month, `founder/cfo.md`) and any outside money. The pentest (€ 7,500) and the lawyer
(€ 2,500) are needed for Zwolle anyway: real member data never goes live without them. So the test
decides **whether to start paying yourselves or raise money**, not whether to go live at Zwolle.

The fitting test for a subscription sold to boards: **real boards, the real price, a signature.**

**Test 1 — before the pentest is booked (12 October – 18 December 2026)**
- Zwolle signs the pilot contract: success criteria in writing, and as a **pioneer** (€ 0.39 per member a month, fixed three years) **from month 4 if the criteria
  are met**.
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

## 2. The countdown

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

## 3. Launch day: Monday 1 March 2027

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

## 4. The first 30 days

**Weekly numbers** (every Friday, in the week review):

| number | source | target | change something when |
| --- | --- | --- | --- |
| Zwolle members active this week (÷ all members) | app | 20% in week 4, 40% in week 12 | below 10% at day 14 or 20% at day 28 → stop outreach, fix adoption first |
| Invitations delivered / accepted | e-mail provider, app | ≥ 95% delivered | more than 2% bounced → clean addresses with Zwolle, check the domain setup |
| Support hours for Zwolle | own log | falls each week | above 10 hours a week after week 2 → the guide or the app is unclear; fix what repeats |
| Board conversations booked | marketing log | 3 a week | below 2 a week for two weeks → rewrite the letter, phone first, ask Zwolle for an intro |
| Pilot requests / letters of intent | marketing log | 3 by 30 May | 0 after 10 conversations → back to `/founder-offer` |
| Paying clubs vs break-even | CFO | 0 in the first 30 days (Zwolle is in its free pilot); break-even 3 pioneer clubs unpaid, 15 clubs with pay | — the money test is Test 2, not the first month |

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
