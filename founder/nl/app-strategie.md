# Greenside · App-strategie, prijsmodellen en SLA's

_Casus, 10 oktober 2026. Eén algemene app, prijs realistisch gehouden zodat een bestuur niet na een
paar jaar tienduizenden euro's kwijt is._

## Kern

Apple weigert bijna-identieke "white-label" apps, dus **geen eigen app per club in de store**. In plaats
daarvan **één algemene app**: een golfer downloadt 'm, kiest of volgt zijn club(s), en zodra hij in zijn
club zit is alles volledig in de huisstijl van die club. De code kan dit al (`brand.ts`). Dat maakt onze
kostprijs per club laag — en laat toe wat jij wilt: een **eenmalig bedrag + kleine maandlasten**, geen
maandabonnement dat oploopt tot tienduizenden euro's.

## 1. Het product: één app, per club een eigen omgeving

- Eén app in de store (Apple + Google), neutrale naam (bijv. "Golfen" of "Clubhuis").
- Lid selecteert/volgt zijn club; de hele omgeving — kleuren, logo, naam, nieuws, starttijden — is
  dan die van de club.
- Clubbeheer (leden, starttijden, facturen, incasso) blijft het systeem erachter. Het is dus méér dan
  een ledenapp: het kan het clubsysteem vervangen, maar de verkoop hoeft niet zwaar op dat verhaal te
  leunen.
- **App Store-voordeel:** één inzending, één review, triviale updates, geen spamrisico (richtlijn
  4.2.6 / 4.3). Wil een club tóch een eigen icoon in de store, dan kan dat als betaalde premium onder
  háár eigen Apple-account.

## 2. Wat mag het kosten — eenmalig

Verkoop het als een bureau een website verkoopt: een eenmalig bedrag voor bouw/inrichting, daarna
kleine vaste lasten. Onze echte kost per club is laag (import + branding + livegang + training ≈ 1–2
dagen werk, ~€ 500–1.000), dus hier zit marge die meteen de krappe cashflow dicht.

| clubgrootte | eenmalig | dekt |
| --- | ---: | --- |
| 9 holes (~550 leden) | € 1.750 | inrichting in clubstijl, import ledenlijst, livegang, training, eerste support |
| 18 holes (~950 leden) | € 2.500 | idem |
| 27+ holes (~1.350 leden) | € 3.500 | idem |

Richtprijs **€ 2.500**. Vijf clubs vooraf = € 12.500 — dat dekt bijna de hele benodigde € 11.181 uit
de CFO. Een bestuur keurt een eenmalig projectbedrag makkelijker goed (één ALV-besluit) dan een
doorlopende rekening.

## 3. Recurring — klein gehouden

### Basis (hosting/platform)

| clubgrootte | per maand | per jaar | dekt |
| --- | ---: | ---: | --- |
| 9 holes | € 59 | € 708 | hosting, onderhoud, updates, store-review, basissupport, back-ups, maandexport |
| 18 holes | € 99 | € 1.188 | idem |
| 27+ holes | € 149 | € 1.788 | idem |

### Upsells (opt-in, per maand) — hier zit de terugkerende winst

De club bepaalt zelf wat het erbij neemt, dus de rekening loopt nooit ongemerkt op.

| upsell | per maand | waarvoor |
| --- | ---: | --- |
| Incasso / SEPA (contributie automatisch innen) | € 39 | bespaart de penningmeester handwerk |
| Wedstrijdmodule (inschrijven, flights, uitslagen) | € 29 | voor clubs met veel wedstrijden |
| Horeca op rekening / barintegratie | € 29 | bar en keuken op de ledenpas |
| Betalen in de app (iDEAL) | ~1,2% of € 0,25/transactie | doorbelast + kleine marge |
| Sponsors/advertenties in de clubomgeving | € 19 of omzetdeling | levert de club zelf geld op |
| Pushcampagnes / nieuwsbrief-plus | € 19 | ledenbinding |
| Premium SLA (99,9%, snellere reactie) | € 49 | zie SLA |
| Eigen app in de store (onder club-account) | € 79 | prestige, extra werk voor ons |

Een typische 18-holesclub landt op **€ 99 basis + 2–3 upsells (~€ 100) = ~€ 200/mnd**.

## 4. Wat voelt een bestuur — totale kosten over de jaren

Dit is de kern van je punt: een maandabonnement tikt hard aan.

| model | jaar 1 | 3 jaar | 5 jaar |
| --- | ---: | ---: | ---: |
| **Koop + basis** (€ 2.500 + € 99/mnd) | € 3.688 | € 6.064 | € 8.440 |
| **Koop + basis + 2–3 upsells** (€ 2.500 + € 200/mnd) | € 4.900 | € 9.700 | € 14.500 |
| Per lid/maand (18-holes oprichter, € 466/mnd) | € 5.592 | € 16.776 | € 27.960 |

De koopvariant houdt de 5-jaarskosten op € 8–15k in plaats van ~€ 28k — en de club stuurt zelf op de
upsells. Precies de "niet onrealistisch"-prijs die je zoekt.

## 5. Eerlijke keerzijde (voor ons)

Lage maandlasten = minder terugkerende omzet. De eenmalige € 2.500 dicht de cash, maar betaalt geen
salaris. Doorgerekend op de vaste kosten mét salaris (€ 5.533/mnd voor twee oprichters):

- Marge per club ≈ € 99 basis + ~€ 100 upsells − ~€ 20 serve-kosten = **~€ 180/mnd**.
- Voor vol salaris: € 5.533 / € 180 ≈ **31 clubs** — tegenover 15 in het per-lid-model. Ongeveer dubbel.
- Zonder salaris (jaar 1) is elke club al vanaf de eerste maand winstgevend; het salaris vraagt alleen
  meer clubs.

**Keuzes om dat te verzachten:** upsell-attach omhoog (meer €/club), basis iets hoger (€ 149), of
**per-lid als optie aanbieden aan grote clubs** die de kosten liever spreiden en het kunnen dragen —
prijsdifferentiatie: klein koopt, groot abonneert.

## 6. SLA's (gekoppeld aan de prijslagen)

| afspraak | basis | premium (+€ 49/mnd) |
| --- | --- | --- |
| Beschikbaarheid | 99,5% | 99,9% |
| Reactie P1 (boeken/inloggen plat) | < 1 u, 7 dgn | < 30 min |
| Reactie P2 / P3 | < 4 werkuren / < 1 werkdag | < 2 werkuren / < 4 werkuren |
| Zaterdaghulplijn 7–12 u (boekingspiek) | ✓ | ✓ prioriteit |
| Datalek-melding (AVG) | < 72 u | < 24 u |
| Back-up herstel (RPO / RTO) | 24 u / 8 u | 1 u / 2 u |
| Export + opzeg (12 mnd, gratis export) | ✓ | ✓ |

Controleerbare statuspagina; milde boete bij gemiste beschikbaarheid (99,0–99,5% = 10%, < 99,0% = 25%
van die maand, lager dan de maandprijs). Releases ma–do ná 17:00, nooit in een lanceerweek.

## 7. Aanbeveling

- **Product:** één algemene app, club selecteren/volgen, per club volledig branded. Eigen store-app
  alleen als premium.
- **Prijs:** **€ 2.500 eenmalig** (staffel € 1.750–3.500) + **€ 99/mnd basis** + opt-in upsells.
  Houdt de 5-jaarskosten rond € 8–15k. Per-lid blijft een optie voor grote clubs.
- **Besef:** dit vraagt ~2× zoveel clubs voor vol salaris als het per-lid-model; stuur daarom op
  upsell-attach en op een paar grote clubs.

_Grenzen: Apple-regels wisselen — verifieer vóór livegang. Alle bedragen zijn voorstellen om tegen
echte offertes en een echt bestuur te toetsen (het kooppanel accepteerde tot ~€ 0,75/lid/mnd). Geen
juridisch of fiscaal advies._
