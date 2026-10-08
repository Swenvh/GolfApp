# CFO sources

Every input in `founder/numbers.json`, where it comes from. Checked 8 October 2026.
USD prices converted at about € 0.90 per USD (an estimate; check the rate on the day).
All amounts excl. VAT.

## Price
- **€ 455.70 per club-month** (since 8 October 2026): founding price **€ 0.49 per member per month**
  (minimum € 189) for a typical club per segment (`founder/customer.json`: 25% 9 holes with ~550 members,
  55% 18 holes with ~950, 20% 27+ holes with ~1,350): 0.25 × 269.50 + 0.55 × 465.50 + 0.20 × 661.50.
  Before: € 344 (first price per size) and € 364 (after `/founder-pricing`).
- List-price what-if **€ 604.50**: € 0.65 per member (minimum € 249), same mix.
- Member counts per segment are the panel's segment descriptions, not measured; a club's real count
  sets its real price.

## Public prices (check before paying)
| item | price | source |
| --- | --- | --- |
| Expo EAS Production | USD 99 / month + usage | [expo.dev/pricing](https://expo.dev:443/pricing), [docs.expo.dev/billing/plans](https://docs.expo.dev/billing/plans/) (third parties list USD 199: [toolradar](https://toolradar.com/tools/expo/pricing); confirm) |
| Supabase Pro | USD 25 / month, incl. USD 10 compute credit; Small compute ~USD 15 | [makerkit.dev](https://makerkit.dev/blog/saas/supabase-pricing), [jetadmin.io](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/); official: supabase.com/pricing |
| Vercel Pro | USD 20 / month, 1 deploying seat included | [Vercel docs](https://docs.vercel.com/docs/plans/pro-plan) |
| Resend Pro | USD 20 / month, 50,000 e-mails | [Resend docs](https://resend.com/docs/knowledge-base/what-is-resend-pricing.md) |
| Apple Developer Program | USD 99 (local price ~€ 99) per year, per organisation | [developer.apple.com](https://developer.apple.com/support/compare-memberships) |
| Google Play registration | USD 25 once | [Google Play Console help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |

Payment costs of members (iDEAL etc.) are **not** Greenside's: each club uses its own Mollie
account (`club_payment_settings`, README "Naar productie"), so those fees land with the club.

## Estimates (not facts; replace with quotes)
- **Onboarding, pilot and walk-away guarantee, € 35 per club-month** (updated by `/founder-ops`).
  Cash per new club: printed guide ~€ 300 (an 8-page A5 booklet costs about £ 0.24 a copy at 1,000
  copies, [UK price list](https://ep.dev.shout-loud.co.uk/promo-print/brochure-printing/a5-brochures);
  get a Dutch quote), travel ~€ 200, three free months of running costs ~€ 33 → ~€ 533; with 1 in 3
  pilots walking away (guarantee C) ~€ 800 per paying club, spread over 24 months → € 33, rounded
  to € 35. Was € 55 with a € 600 guess for printing. Founder hours (~40 per club) are not in cash.
- **Hosting share € 10 per club-month**: database growth, e-mail above the Resend bundle
  (950 members × ~2 login codes a month ≈ 1,900 e-mails), extra app builds.
- **Apple account € 0 for Greenside.** Apple guideline 4.2.6: apps built from a template must be
  submitted by the content owner, so each club enrols in the Apple Developer Program itself
  (€ 99 a year; non-profits can ask for a fee waiver). Was € 8.25 when Greenside paid it.
- **SEPA collection € 0.50 per club-month**.
- **Accountant € 100** (Moneybird € 15–29 a month plus a year-end accountant), **insurance € 100**
  (professional liability ~€ 61 a month as an indication from Univé, plus cyber cover by quote;
  was € 75), **e-mail accounts € 14, helpline number € 15 a month.**
- **Lawyer € 2,500 once**: processing agreement (AVG), privacy statement, terms, and the contract
  with the pilot, walk-away and data clauses (`founder/offer.md`).
- **Security test € 7,500 once** (was € 5,000): SMB web-app pentests run € 5,000–14,000 for 5–10
  test days ([Kolonell](https://kolonell.com/en/blog/web-application-penetration-test-price-smb-dublin-2026)),
  plus fixing and a retest. Before the first real member data, in line with the founders' rule that
  clubs must be 100% safe.
- **Printed guide design € 300, Chamber of Commerce and set-up € 100.**
- **Founder pay € 2,500 per founder per month** (scenario B only): the founders' own target
  (€ 2,000–2,500 each). Modelled as € 5,000 a month cost to the company. If € 2,500 is meant as
  take-home pay, the cost to the company is higher (income tax, and in a BV the rules on a
  director's salary): ask an accountant.
- **Capacity 25 clubs**: what two founders can onboard and support next to sales. A guess.

## The ramp, and how it was checked
`ramp_per_day` = paying clubs at once in each month of year 1: `0,0,0,1,1,1,1,1,1,1,2,3`.
- Month 1 = Zwolle goes live. Months 1–3 are Zwolle's free pilot; Zwolle pays from month 4
  (assumes Zwolle takes the founding offer; not agreed).
- Panel check: v1 and v2 both 0 of 20 buy today (`founder/panel/results.md`,
  `founder/panel-v2/results.md`), and 19 of 20 v2 buyers say they would look again after Zwolle
  is live "for a full season". So no second club before month ~10; the 2nd and 3rd clubs are
  E-Golf4U clubs that must switch anyway, starting a pilot around month 8.
- `plan_per_day` = 10: the ten founding clubs in the pitch, not reached in year 1.
