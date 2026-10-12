# Greenside · Het plan

_Herzien 12 oktober 2026: één algemene app (geen eigen app per club in de store) en een SaaS-prijsmodel —
flinke onboarding fee + maandabonnement, geen marge op het betaalverkeer. Zie `app-strategie.md`,
`prijs-realiteit.md` en `cijfers-saas.md` voor de onderbouwing._

## Oordeel en kerncijfers

**Oordeel: Nog niet.** De economie is met dit model sterk — elke club is winstgevend, jaar 1 draait
positief op de onboarding fees, en break-even voor salaris ligt op ~21 clubs. Wat ontbreekt is **bewijs**:
er is nog geen club live, en in het (gesimuleerde) kooppanel koopt nog niemand. De eerste stap is Golfclub
Zwolle live en meetbaar.

| toets | uitkomst |
| --- | --- |
| Verdient elke club geld vóór vaste kosten? | ✓ € 258 per maand |
| Winst in jaar 1? | ✓ € +49.424 (op de onboarding fees) |
| Break-even binnen de capaciteit? | ✓ 21 clubs (~8% van de markt) |
| Koopt minstens 25% van het panel? | ✗ 0 van 20 — nog geen bewijs |

| kerncijfer | |
| --- | ---: |
| Onboarding (eenmalig, blended) | € 3.550 per club |
| Abonnement (blended) | € 294 per club per maand |
| Omzet jaar 1 | € 55.786 |
| Resultaat jaar 1 (oprichters onbetaald) | € +49.424 |
| Benodigd geld (alleen startkosten) | € 10.423 |
| Clubs nodig voor € 2.500 salaris per oprichter | 21 |
| CLV per club | ~€ 27.000 (LTV:CAC 27:1) |
| Hele markt (263 clubs) | ~€ 1,9 miljoen per jaar tegen normale prijs |

## Het product

Greenside geeft Nederlandse golfclubs **één app** in de App Store en Google Play (neutrale naam). Een
golfer kiest of volgt zijn club; zodra hij erin zit is de hele omgeving — kleuren, logo, naam, nieuws,
starttijden — die van zijn club. Erachter zit het **clubbeheer**: leden, starttijden, wedstrijden,
facturen, incasso. Leden loggen in met een code per e-mail, boeken starttijden met gasten en extra's,
betalen met iDEAL en tonen een clubpas. Eén codebase voor alle clubs; de basis staat vast als `pilot-v1`.
De eerste club, Golfclub Zwolle, krijgt zijn eigen huisstijl in dezelfde app, nog niet live.

**Waarom één app:** Apple weigert bijna-identieke white-label apps (richtlijn 4.2.6/4.3). Eén app = één
review, triviale updates, geen afwijzingsrisico. Een club die tóch een eigen icoon in de store wil, kan dat
als betaalde premium onder haar eigen Apple-account.

## Wat de board zei

**3 × investeren, mits · 5,0 / 10.** Niemand wijst het af, niemand investeert op de pitch. Alle drie willen
**gemeten bewijs bij Zwolle** voordat er meer clubs getekend of meer gebouwd wordt. Grootste risico's:
leden gebruiken geen clubapp naast GOLF.NL, nog geen bewijs, overstappen is lastig, makkelijk te kopiëren,
kleine markt (263 clubs).

## Concurrentie

- **Gevestigd:** Nexxchange (nam E-Golf4U over), IntoGolf, Golfspot/TeeControl/Parrow, GolfBox. Prijzen op
  offerte; Nexxchange noemt € 200/mnd + € 50 per gebruiker. Openbaar elders: Lightspeed Golf € 89–289/mnd,
  Club Caddie ~€ 299.
- **Het gat:** de meeste leden krijgen een webapp of portaal; de enige leverancier met eigen clubapps
  (IntoGolf) scoort ~2 uit 5. Niemand combineert een goede app met de prijs eronder.
- **Het venster:** **E-Golf4U stopt**; die clubs moeten nu kiezen.
- **De dreiging:** GOLF.NL is gratis en boekt al starttijden met betaling. Greenside staat ernaast
  (clubrekening, extra's, clubleven), niet ertegenover.

## De klant en het kooppanel

**De klant:** het bestuur of de clubmanager van een Nederlandse golfclub met eigen baan; eerst de clubs die
van E-Golf4U af moeten. 9 holes (25%, ~550 leden), 18 holes (55%, ~950), 27+ holes (20%, ~1.350).

**Het panel** (20 gesimuleerde beslissers): **0 van 20 kopen** zonder bewijs. Wat overblijft: **20 van 20
willen eerst Zwolle live zien.** Gesimuleerde kopers zijn geen bewijs; echte besturen beslissen. De oude
prijscurves laten zien dat tot ~€ 550–650/mnd (18 holes) als "wordt duur" geldt — het nieuwe abonnement
(€ 199) zit daar ruim onder.

## Het aanbod: Greenside Pionier en Oprichter

- **Kern:** de club in zijn eigen huisstijl in één app, met clubbeheer erachter en de betalingen erin.
- **Wij doen het werk:** import, wekelijkse overzet tijdens de pilot, uitnodigingen, papieren handleiding,
  twee app-spreekuren, zaterdaghulplijn; de balie kan alles voor een lid zonder app.
- **Geen dubbele rekening:** het abonnement start als de club het oude systeem opzegt (uiterlijk 6 maanden
  na de pilot); de eerste factuur valt in het volgende begrotingsjaar.
- **Vangnet voor E-Golf4U-clubs:** mislukt de pilot, dan zetten wij de gegevens kosteloos over naar
  Nexxchange of IntoGolf.
- **Continuïteit:** maandelijkse export naar eigen opslag, 12 maanden opzegtermijn, broncode in escrow en
  een IT-partner, vóór de derde club.
- **ALV-pakket:** voorstel, presentatie, kostenvergelijking met de eigen factuur, antwoorden; een oprichter
  komt mee.
- **Garantie:** succescriteria vooraf op papier; stoppen na de pilot = niets betalen.

## Prijzen

| | klein (9 holes) | midden (18 holes) | groot (27+ holes) |
| --- | ---: | ---: | ---: |
| **Onboarding (eenmalig)** | € 2.500 | € 3.500 | € 5.000 |
| **Abonnement per maand** | € 199 | € 299 | € 399 |

- **Pionier (3 plaatsen, vóór 1 juni 2027):** onboarding gratis, eerste 3 maanden gratis, 3 jaar vast.
- **Oprichter (club 4–10, vóór 1 juli 2027):** onboarding −50%, eerste maand gratis, 2 jaar vast.
- **Geen cut op betaalverkeer:** leden boeken en betalen vrij in de app (een greenfee is voor een lid
  gratis). De waarde zit in de onboarding en het abonnement. € 299/mnd (18 holes, test € 249–299) zit rond
  Club Caddie (€ 299) en onder een volledig clubsysteem (~€ 350–450), met een complete eigen clubapp erbij.
  Verkooplijn: **"ongeveer wat u nu betaalt — met een echte app erbij"**, getoond met de eigen factuur.

## De cijfers

| per club per maand | bedrag |
| --- | ---: |
| Blended abonnement | € 294 |
| Variabele kosten | − € 35,50 |
| **Bijdrage** | **€ 258** |

**Jaar 1** (oprichters onbetaald): omzet € 55.786, resultaat **+€ 49.424**. Benodigd geld **€ 10.423** —
alleen startkosten (beveiligingstest € 7.500, jurist € 2.500); de onboarding fees dekken de operationele
verliezen, de cash is positief vanaf maand 5.

**Salaris:** € 2.500 per oprichter maakt de vaste kosten € 5.398/mnd. Daarvoor zijn **21 clubs** nodig
(~8% van de markt), en jaar 1 draait sowieso ruim positief op de onboarding.

## Marketing

- **Positionering:** *voor clubbesturen die van E-Golf4U af moeten: wij verhuizen uw club naar één app in
  uw huisstijl, voor minder dan u nu aan uw systeem betaalt.*
- **Kanalen:** (1) persoonlijk benaderen (brief + telefoon + bezoek), eerst 40 clubs (E-Golf4U en rond
  Zwolle); (2) Zwolle als referentie; (3) LinkedIn. Geen advertenties, geen beurs.
- **Drie cijfers per week:** gesprekken met besturen (doel 3/week), actieve leden bij Zwolle (40% in week
  12), pilotaanvragen en intentieverklaringen (3 binnen 90 dagen).

## Merk, operatie, lancering

Dennengroen, messing en krijtwit; Fraunces en Manrope. Rollen: oprichter A product en veiligheid, oprichter
B clubs en verkoop. Kerndienst: de overstap van een club in zes weken. Vaste routines: ochtendcontrole,
releases ma–do na 17:00 (nooit in een lanceerweek; `pilot-v1` onaangeroerd), wekelijkse kopie tijdens de
pilot, datalek binnen 72 uur melden. **Livegang Zwolle: maandag 1 maart 2027** (af te spreken met Zwolle).

## Deze week

Ga om tafel met het bestuur van Zwolle. Leg vast: de livedatum, de succescriteria, de pionierskorting
(onboarding gratis, eerste maanden gratis, abonnement 3 jaar vast) **vanaf maand 1**, dat Greenside de
betalingen verzorgt, en toestemming om hun naam en cijfers later te gebruiken.

_Gesimuleerde kopers en geprojecteerde cijfers; echte besturen en echte offertes moeten ze bevestigen. De
Apple-regels wisselen — verifieer vóór livegang. Geen financieel, juridisch of fiscaal advies._
