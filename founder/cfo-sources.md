# CFO sources

Every input in `founder/numbers.json`, where it comes from. Checked 8 October 2026.
USD prices converted at about € 0.90 per USD (an estimate; check the rate on the day).
All amounts excl. VAT.

## Price
- **€ 364 per club-month**: blended founding price from `founder/pricing.md` (€ 179 for 9 holes,
  € 399 for 18 holes, € 499 for 27+ holes) weighted by the segment shares in
  `founder/customer.json` (25% / 55% / 20%). Was € 344 before `/founder-pricing`.
- List-price what-if **€ 416.50**: 0.25 × 199 + 0.55 × 449 + 0.20 × 599 (was € 429 with € 249 for 9 holes).

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
- **Onboarding, pilot and walk-away guarantee, € 55 per club-month.** Cash per new club: printed
  guide for ~950 members ~€ 600, travel ~€ 200, three free months of running costs ~€ 56
  → ~€ 856. Assumes 1 in 3 pilots walks away (guarantee C), so per paying club ~€ 1,284,
  spread over the 24-month founding term → € 53.50, rounded to € 55. Founder hours (~40 per club:
  import, invites, Saturday helpline) are not in cash; they are the real limit.
- **Hosting share € 10 per club-month**: database growth, e-mail above the Resend bundle
  (950 members × ~2 login codes a month ≈ 1,900 e-mails), extra app builds.
- **Apple account € 8.25 per club-month**: € 99 / 12, if Greenside pays the club's developer
  account. € 0 if the club enrols itself (it must anyway: Apple lists the app under the
  owner's legal entity).
- **SEPA collection € 0.50 per club-month**.
- **Accountant € 100, insurance € 75, e-mail accounts € 14, helpline number € 15 a month.**
- **Lawyer € 2,500 once**: processing agreement (AVG), privacy statement, terms, and the contract
  with the pilot, walk-away and data clauses (`founder/offer.md`).
- **Security test € 5,000 once**: an external pentest before the first real member data, in line
  with the founders' rule that clubs must be 100% safe.
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
