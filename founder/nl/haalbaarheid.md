# Haalbaarheid: hoe realistisch is het plan?

Datum: 9 oktober 2026. Getoetst tegen de code in deze repository en openbare bronnen over GOLF.NL.
Uitgangspunt van de oprichters: **Greenside wordt echt de ledenapp voor elk lid van de club, en moet
gekoppeld zijn aan GOLF.NL vanwege Zoek & boek.**

## Kort oordeel

| onderdeel | haalbaarheid | waarom |
| --- | --- | --- |
| De app en het clubbeheer | **hoog** | grotendeels af en getest; wat nog moet is weken werk, geen maanden |
| Livegang Zwolle op 1 maart 2027 | **haalbaar, mits** | alleen als vóór half november duidelijk is hoe de starttijden van Zwolle in GOLF.NL blijven |
| Koppeling met GOLF.NL (Zoek & boek) | **onzeker, nu het kritieke punt** | loopt via de channel manager van IntoGolf, een concurrent; aansluiten kan "in principe", tijdpad onbekend |
| Koppeling met de NGF (leden, handicap) | **onzeker** | andere leveranciers hebben hem; aanvraagproces en voorwaarden onbekend |
| Geld | **haalbaar** | ~€ 11.200 zonder salaris; vaste kosten ~€ 326 per maand |
| 15 clubs voor salaris in 2–3 jaar | **onzeker** | 0 van 20 in het panel; hangt af van de resultaten van Zwolle |
| Twee oprichters | **krap** | bouwen, koppelen, verkopen en support tegelijk; vanaf ~10 clubs is hulp nodig |

**Samengevat:** de app is het makkelijke deel en is er al. Het plan staat of valt met drie dingen buiten
jullie code: **de GOLF.NL-koppeling, het gebruik bij Zwolle en het vertrouwen van besturen.**

## 1. Wat er al staat (uit de code)

- **Ledenapp** (Expo, iOS en Android): inloggen met code, starttijden boeken met gasten en extra's,
  scorekaart met Stableford, wedstrijden, facturen met pdf en iDEAL, clubpas, ledenlijst, gezinsleden,
  introducés, lessen, lidmaatschap wijzigen, account verwijderen.
- **Clubbeheer** (Next.js): mission control, leden, import uit E-Golf4U/Nexxchange/IntoGolf/Excel (werkt
  bestaande leden bij zonder iets te wissen), uitnodigingen in bulk, starttijden, wedstrijden, nieuws,
  financiën met facturen en horeca, app-omzet, export van leden.
- **Greenside HQ**: verkoop, club aanmaken, inrichtingschecklist, huisstijl per club.
- **Database**: 20 migraties, strikte scheiding tussen clubs (RLS), testsuite van ~1.300 regels (scheiding,
  boekhouding, demodata).
- **Huisstijl per club** en een **build-profiel voor Zwolle**; de basis staat vast als `pilot-v1`.
- **SEPA-incasso**: de opbouw van het bankbestand (pain.008) bestaat al in de gedeelde code; het scherm
  in het clubbeheer is bij de pilotreview weggehaald en kan terug.

## 2. Wat het plan nog aan bouwwerk vraagt

Schattingen, met hulp van AI-codering:

| onderdeel | stand | werk |
| --- | --- | --- |
| Productieaccounts, e-mail met eigen domein, livegangstappen uit de README | beschreven, niet uitgevoerd | ~1 week |
| SEPA-incasso weer in het clubbeheer (batch, bestand, verwerken) | code bestaat | ~3–5 dagen |
| Maandelijkse export van leden, facturen en boekingen naar opslag van de club | ledenexport bestaat | ~1 week |
| Knop naar GOLF.NL in de app (handicap, scores) | ontbreekt | uren |
| Contractdata en jaarlijkse ledentelling in HQ | ontbreekt | ~2–3 dagen |
| Bevindingen uit de pentest oplossen | onbekend | 1–2 weken gereserveerd |
| **Koppeling met GOLF.NL / starttijdenplatform** | ontbreekt | **onbekend: hangt af van NGF en IntoGolf** |
| **Koppeling met de NGF (leden, handicap)** | ontbreekt | **onbekend: hangt af van de NGF** |

Het eigen bouwwerk is samen **~4–6 weken**. Dat past ruim in de planning tot 1 maart 2027. De twee
koppelingen niet, want die hangen af van anderen.

## 3. Het nieuwe kritieke punt: GOLF.NL Zoek & boek

Wat de openbare bronnen zeggen:
- Het starttijdenplatform in de app GOLF.NL (voorheen GOLFGO) leest de starttijden van banen uit via de
  **IntoGolf Channel Manager (ICM)**, een centraal systeem waarop reserveringssystemen worden aangesloten
  ([NVG](https://www.nvg-golf.nl/initiatieven/golfgo), [NGF](https://www.ngf.nl/caddie/baanmanagement/golfgo)).
- Aangesloten zijn nu IntoGolf (Proware), CPS, eGolf4u/Nexxchange, Lightspeed Golf en Teecontrol. Een
  leverancier die niet op de lijst staat, kan **in principe** worden toegevoegd; dat vraag je bij de NGF
  ([NGF](https://www.ngf.nl/caddie/baanmanagement/golfgo)).
- Betalen in de app GOLF.NL kon eerst alleen bij banen op Teecontrol; andere aanbieders zouden volgen
  ([NVG](https://nvg-golf.nl/nieuws/het-starttijdenplatform-van-golf-nl-vernieuwd-meer-gemak-voor-greenfeespelers-meer-grip-voor-golfbanen/),
  [NGF](https://www.ngf.nl/over-de-ngf/nieuws/2025/apr/betaal-en-beheermodule-starttijden-in-app-golfnl)).
- IntoGolf heeft een officiële NGF-koppeling voor handicaps, lidmaatschap en wedstrijdresultaten
  ([IntoGolf](https://intogolf.nl/partners/ngf)). Hoe een nieuwe leverancier die aanvraagt, vond ik niet.

**Waarom dit telt:** greenfees zijn ~14% van de inkomsten van een club. Als Zwolle zijn starttijden in
Greenside beheert en Greenside niet aan het platform van GOLF.NL hangt, verdwijnt Zwolle uit Zoek & boek
en mist het gasten. Geen bestuur accepteert dat. Dus:

**Twee routes, kies er één vóór half november:**

| | Route A: Greenside is het starttijdensysteem | Route B: Greenside is de ledenapp bovenop het huidige systeem |
| --- | --- | --- |
| Wie beheert de starttijden | Greenside | het huidige systeem van de club (dat al aan GOLF.NL hangt) |
| Nodig | aansluiting op de ICM via de NGF | koppeling met de API van het huidige systeem (Nexxchange, IntoGolf, Teecontrol…) |
| Afhankelijk van | NGF en IntoGolf (concurrent) | de leverancier van de club (concurrent) |
| Past bij "vervangt uw systeem" en de prijs van € 0,65 | ja | minder: dan komt Greenside er wél bovenop |
| Past bij "ledenapp voor elk lid" | ja | ja |
| Risico | aansluiting duurt lang of komt er niet | leverancier werkt niet mee of vraagt geld |

Allebei hangen ze af van een partij die niet van jullie is. Route A past het best bij het plan en de
prijs; route B kan sneller zijn als het systeem van Zwolle een open koppeling heeft.

**Voor de pilot bij Zwolle** is er een derde, tijdelijke optie: Zwolle houdt zijn huidige systeem als bron
voor de starttijden van gasten via GOLF.NL, en leden boeken in Greenside op tijden die voor leden zijn
gereserveerd. Dat werkt alleen als beide systemen niet dezelfde tijden kunnen verkopen; zonder koppeling is
dat handwerk en foutgevoelig. Gebruik het alleen als brug, niet als product.

## 4. Wat dit doet met het plan

- **Lanceerplan:** de vraag aan de NGF hoort deze week op de kritieke lijn, naast de afspraak met Zwolle.
  Zonder antwoord vóór half november schuift 1 maart.
- **Aanbod en prijs:** "Greenside vervangt uw systeem" is pas waar als route A rond is. Tot die tijd: niet
  beloven, en de pioniersclubs vertellen welke route er geldt.
- **Concurrentie:** IntoGolf bezit de channel manager waar GOLF.NL op draait. Dat is een strategisch
  risico: een concurrent zit op de weg naar Zoek & boek. Vraag de NGF ook hoe zij leveranciers gelijk
  behandelen.
- **Cijfers:** de koppelingen kunnen geld kosten (aansluiting, per transactie). Dat zit nog niet in de
  cijfers; vraag het en reken het daarna door.

## 5. Deze week (concreet)

1. **Zwolle:** welk systeem gebruikt de club nu voor starttijden en leden? Hoeveel greenfee-gasten komen via
   GOLF.NL Zoek & boek? Welke route (A of B) wil het bestuur?
2. **NGF** (via [ngf.nl/golfgo](https://www.ngf.nl/caddie/baanmanagement/golfgo) of de contactpersoon
   golfbanen): kan Greenside als starttijdensysteem aansluiten op het platform van GOLF.NL, via welke weg
   (ICM), met welke voorwaarden, kosten en doorlooptijd? En: hoe sluit een leverancier aan op de
   NGF-koppeling voor leden en handicaps?
3. **Leverancier van Zwolle:** heeft het systeem een API voor starttijden en leden, en wat kost toegang?
4. **Besluit vóór 13 november** (samen met de handtekening van Zwolle): route A, B of de tijdelijke brug.

## Eindoordeel

**Technisch is dit plan goed haalbaar: de app is er, en wat nog moet is overzichtelijk.** De haalbaarheid van
het bedrijf hangt af van één nieuwe, harde afhankelijkheid (de GOLF.NL-koppeling via de NGF en de channel
manager van IntoGolf) en van twee dingen die geen code oplost: echt gebruik bij Zwolle en vertrouwen van
besturen. Zet de vraag aan de NGF deze week uit; het antwoord bepaalt of 1 maart 2027 en de belofte
"vervangt uw systeem" kloppen.

_Schattingen van bouwtijd zijn indicaties; de koppelingen hangen af van derden. Geen juridisch advies._
