# Operations: Greenside

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
break-even with € 2,500 pay for each founder **16 clubs** (10 founding + 6 list; was 18).

## 1. The daily cycle

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

## 2. Suppliers

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

## 3. People

Two founders, no staff. Pay: **€ 2,000–2,500 each a month** is the target (the founders' own
number); until ~16 clubs pay, pay grows with revenue (`founder/cfo.md`). What that costs the company
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
(an estimate; measure it at Zwolle). At 10 clubs that is ~20 hours a week; at 16 clubs ~32 hours,
most of one founder. So the "~25 clubs" capacity in the CFO only holds if support per club stays
low; Zwolle's first three months tell you.

## 4. Routines

### 4.1 Morning check (15 minutes, every working day)
1. Open the error overview of Supabase and Vercel: any errors since yesterday? Note them.
2. E-mail provider: any bounced or delayed login codes or invitations? If a club has more than a few,
   call the club before its members do.
3. Mollie (per club, via the club's dashboard if shared): failed payments or webhooks?
4. Support inbox and voicemail: reply to every club before 10:00, even if only "we're on it, you'll
   hear from us before 14:00".
5. Anything promised to a club for today? Put it at the top.

### 4.2 Onboarding a club (the core service, six weeks)
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

### 4.3 Release (protects the base)
1. Work only on the work branch; `pilot-v1` is never changed.
2. `pnpm typecheck && pnpm lint && pnpm test` and the database tests (`supabase/tests/run-local.sh`).
3. For changes in shared code: compare Greenside screen by screen with `pilot-v1` (base check).
4. New database change = new migration, tested; never edit an old one.
5. Release Monday to Thursday after 17:00; never on Friday, Saturday or in a club's launch week.
6. Check the morning after (routine 4.1).

### 4.4 A complaint or an incident
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

### 4.5 Weekly and monthly
1. **Friday**: week review: the three marketing numbers, open tickets, support hours per club,
   anything promised.
2. **Friday**: restore one backup to a test environment and check it opens (monthly at least).
3. **Monthly, 1st working day**: licence invoices and SEPA collection; check payments a week later.
4. **Monthly**: printed guides for clubs onboarding in the next six weeks; reorder.
5. **Quarterly**: costs against `founder/numbers.json`; re-run the CFO if they moved.

## 5. Tools (the smallest stack)

| job | tool | price | why |
| --- | --- | --- | --- |
| Product hosting | Supabase, Vercel, Expo, Resend | ~€ 160 a month (CFO fixed costs) | already built on them |
| Bookkeeping, invoices, VAT | Moneybird | € 15–29 a month | Dutch, bank link, invoices and SEPA |
| Licence collection | Mollie or the bank | ~€ 0.13–0.25 per collection | clubs pay by direct debit |
| Support | a shared mailbox (Google Workspace or similar) + the helpline number | ~€ 14 + € 15 a month | one inbox, one number, both founders |
| Sales pipeline | Greenside HQ (already built) | € 0 | prospects, clubs, setup checklist in one place |
| Planning | a shared calendar | € 0 | release days, launch weeks, Saturday rota |
| Passwords and keys | a password manager with sharing | ~€ 5 a month (estimate) | service keys never in chat or e-mail |

## 6. Licences, registration and rules

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

## 7. Risk register

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

## Open questions (need a quote or a decision)

1. Pentest: three quotes from Dutch firms, scope as in section 2.
2. Insurance: two quotes for professional liability plus cyber.
3. Lawyer: quote for the data processing agreement, privacy statement, terms and the club contract.
4. Printing: a Dutch quote for 1,000 A5 guides (8 or 12 pages).
5. Helpline number: Voys or a mobile provider, price.
6. Legal form (VOF or BV) and how the founders are paid: accountant.
7. Ask Apple App Review how they treat per-club builds of the same app (4.2.6 and 4.3) before the
   first submission ([Apple developer forum thread](https://developer.apple.com/forums/thread/840982)).
8. Mollie's actual SEPA direct debit rate for the licence.
