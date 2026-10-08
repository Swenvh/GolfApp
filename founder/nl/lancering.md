# Lancering: Greenside

**Lanceerdag L = maandag 1 maart 2027: de leden van Golfclub Zwolle krijgen hun app.** Er is nog geen
datum afgesproken; dit is de datum waar de marketingkalender van uitgaat, vóór het seizoen en voordat
besturen de voorjaarsvergadering voorbereiden. Met de doorlooptijden uit Operatie (jurist, pentest,
aanmelding bij Apple) is de vroegst haalbare datum half januari 2027, maar in januari spelen leden weinig
en verspil je dan de referentie. **Spreek de datum in week 1 af met het bestuur van Zwolle**; alle data
hieronder schuiven mee.

Eigenaren: **A** = oprichter voor product en veiligheid, **B** = oprichter voor clubs en verkoop
(Operatie). Vandaag is donderdag 8 oktober 2026.

## 1. Eerst testen, dan uitgeven

Het grote geld in dit plan is niet de hosting (€ 400 per maand) maar **jezelf betalen** (€ 5.000 per
maand, De cijfers) en eventueel extern geld. De pentest (€ 7.500) en de jurist (€ 2.500) zijn sowieso
nodig voor Zwolle: echte ledengegevens gaan nooit live zonder. De test beslist dus **of jullie jezelf
gaan betalen of geld ophalen**, niet of Zwolle live gaat.

De passende test voor een abonnement dat aan besturen verkocht wordt: **echte besturen, de echte prijs,
een handtekening.**

**Test 1 — vóór de pentest geboekt wordt (12 oktober – 18 december 2026)**
- Zwolle tekent het pilotcontract: succescriteria op papier, en als **pionier** (€ 0,39 per lid per maand, drie jaar vast)
  **betalend vanaf maand 1** (de livegang). In ruil daarvoor is Zwolle de referentieclub en houdt het de
  pioniersprijs; worden de succescriteria in week 12 niet gehaald, dan kan Zwolle alsnog stoppen.
  Onderhandel hierover; het is in jaar 1 ~€ 1.100 waard (De cijfers).
- 15 brieven naar clubs die nog op E-Golf4U zitten of in de buurt van Zwolle liggen (marketinghaak 1).
  Geen beweringen over Zwolle.
- **Succeslijn: Zwolle getekend vóór 13 november, en vóór 18 december minstens 5 gesprekken met besturen
  en 2 getekende intentieverklaringen** ("als Zwolle zijn criteria haalt, starten wij in 2027 een pilot
  tegen de pioniersprijs van € 0,39 per lid").
- Vergelijking met het panel: het panel zegt dat 0 van de 20 nu kopen en 19 van de 20 op Zwolle wachten.
  **Geen harde bestellingen is dus te verwachten**; voorwaardelijke verklaringen zijn de eerlijke maat.
  Minder dan 5 gesprekken uit 15 brieven betekent dat de boodschap of het kanaal niet klopt, niet de
  markt: herschrijf en probeer nog 15. Als Zwolle het betaalde vervolg niet wil tekenen, stop dan en ga
  terug naar het aanbod voordat er meer uitgegeven wordt.

**Test 2 — de pilot van Zwolle (1 maart – 24 mei 2027)**
- **Succeslijn: 40% van de leden van Zwolle actief in week 12** (het succescriterium uit het aanbod),
  Zwolle gaat door en betaalt vanaf juni, en **3 pilotaanvragen van andere clubs vóór L+90 (30 mei)**.
- Blijft het echte gebruik ver onder de 40%, vertrouw dan de leden van Zwolle, niet het panel: verbeter
  het product en het lanceerpakket voordat je aan iemand anders verkoopt.
- Pas als test 2 slaagt: stap voor stap jezelf betalen, of met de cijfers van Zwolle praten met
  geldverstrekkers of investeerders.

## 2. De aftelplanning

Blokken per week, data op maandag. **Kritiek pad** (verschuift L als het uitloopt) gemarkeerd met ⚠.

| week van | taak | eigenaar | klaar op |
| --- | --- | --- | --- |
| **12 okt** | ⚠ Afspraak met het bestuur van Zwolle: livedatum, voorwaarden pilotcontract, succescriteria, contactpersoon, toestemming om later hun naam te gebruiken | B | vr 16 okt |
| | Boekhouder: vof of bv, hoe de oprichters betaald worden | A+B | vr 16 okt |
| | 3 offertes voor de pentest, 2 voor verzekering, 1 van een jurist aanvragen (open vragen Operatie) | A | vr 16 okt |
| | `main` en `pilot-v1` beschermen op GitHub (rulesets, nog open) | A | vr 16 okt |
| **19 okt** | ⚠ Zwolle start de aanmelding bij het Apple Developer Program (D-U-N-S-nummer: 2–4 weken), Google Play-account, controles van Mollie | B (met Zwolle) | vr 23 okt |
| | Inschrijving KVK, zakelijke bankrekening, Moneybird | A | vr 23 okt |
| | ⚠ Jurist begint: verwerkersovereenkomst, privacyverklaring, voorwaarden, pilotcontract | B | vr 23 okt |
| | Zwolle stuurt een testexport uit zijn huidige systeem | B | vr 23 okt |
| **26 okt** | Test 1: lijst van 15 clubs, brieven de deur uit | B | vr 30 okt |
| | Productieaccounts: Supabase EU (Frankfurt), Resend met eigen domein (SPF/DKIM/DMARC), Vercel, Expo, eigen Apple-account van Greenside, wachtwoordbeheerder | A | vr 30 okt |
| | Pentest boeken (3–4 weken doorlooptijd), verzekering geregeld | A | vr 30 okt |
| **2 nov** | Productbesluiten die de board vroeg: rol voor horecapersoneel, ballenautomaat (Xafax) wel of niet in de pilot, wie eigenaar is van het ledenrecord als systemen het oneens zijn | A+B | vr 6 nov |
| | Testimport van de export van Zwolle in een testclub; aantallen controleren met Zwolle | A | vr 6 nov |
| | De 15 brieven nabellen | B | vr 6 nov |
| **9 nov** | ⚠ **Zwolle tekent** het pilotcontract en de verwerkersovereenkomst | B | **vr 13 nov** |
| | Stappen voor de livegang uit de README op de echte accounts (instellingen, e-maillimieten, MFA voor beheerders) | A | vr 13 nov |
| **16 nov – 4 dec** | ⚠ De pentest loopt (1–2 weken) op de productie-inrichting met testgegevens | A | vr 4 dec |
| | Gesprekken met besturen uit test 1; intentieverklaringen | B | doorlopend |
| | Papieren ledenhandleiding: tekst en ontwerp (opmaak Greenside, kleuren Zwolle) | B | vr 4 dec |
| **7 dec** | ⚠ Rapport pentest; elke bevinding met hoog en gemiddeld risico oplossen | A | vr 18 dec |
| **14 dec** | **Evaluatie test 1** tegen de succeslijn | A+B | **vr 18 dec** |
| **21 dec – 1 jan** | Buffer voor de feestdagen. Bewust niets gepland | — | — |
| **4 jan** | ⚠ Hertest pentest | A | vr 8 jan |
| | Website live (greenside.nl of alternatief), LinkedIn-bedrijfspagina, one-pager en briefsjabloon (Merk) | B | vr 8 jan |
| **11 jan** | ⚠ App van Zwolle gebouwd uit `clubs/zwolle`; basiscontrole tegen `pilot-v1`; reviewaccount klaar (`pnpm app-review`) | A | vr 15 jan |
| **18 jan** | ⚠ **Indienen bij Apple en Google** vanuit de accounts van Zwolle (6 weken vóór L: ruimte voor één afwijzing) | A | ma 18 jan |
| | Hulplijn op zaterdag: nummer, rooster voor de eerste vier weken, script voor "mijn code kwam niet aan" | B | vr 22 jan |
| **25 jan** | Apps goedgekeurd, nog niet vrijgegeven; bij afwijzing oplossen en opnieuw indienen | A | vr 29 jan |
| **1 feb – 12 feb** | **Zachte start**: het bestuur van Zwolle en 10–20 leden gebruiken de echte app met testgegevens; dagelijks oplossen | A+B | vr 12 feb |
| **8 feb** | Papieren handleidingen bestellen (~1 week levertijd) | B | ma 8 feb |
| **15 feb (L−14)** | Marketingkalender start (Marketing): lijst van 40 clubs, brief, eerste berichten | B | volgens kalender |
| **22 feb** | ⚠ Echte import van de leden van Zwolle; aantallen gecontroleerd met Zwolle; training secretariaat (1 uur, op de club) | A+B | wo 24 feb |
| | **Go / no-go** met de contactpersoon van Zwolle (checklist hieronder) | A+B | **vr 26 feb** |
| **1 mrt** | **L: lanceerdag** | A+B | — |

**Checklist go / no-go (vrijdag 26 februari)**: apps live in beide stores op naam van Zwolle ·
importaantallen akkoord van Zwolle · test-inlogcodes komen binnen 1 minuut aan bij Gmail-, Outlook- en
KPN-adressen · hertest pentest schoon · verwerkersovereenkomst getekend · papieren handleidingen op de
club · rooster en nummer van de hulplijn werken · terugdraaien getest. Eén "nee" → L een week verschuiven,
Zwolle dezelfde dag inlichten.

## 3. Lanceerdag: maandag 1 maart 2027

B is de hele dag in het clubhuis van Zwolle; A werkt vanaf een scherm met de monitoring open. Vandaag geen
campagne naar buiten (Marketing): alle aandacht naar Zwolle.

| tijd | wie | wat |
| --- | --- | --- |
| 07:30 | A | Ochtendcontrole (Operatie 4.1): fouten, e-mailaanbieder, database. Alles groen of stoppen |
| 08:00 | A+B | Belletje van 10 minuten: we gaan. Stopregel afspreken (hieronder) |
| 08:30 | B | In het clubhuis: hulptafel met papieren handleidingen, een bord "Hulp bij de nieuwe app" |
| 09:00 | A | **Groep 1**: uitnodigingen aan bestuur, commissies en vrijwilligers (~100). Aflevering volgen |
| 10:00 | A | Controle groep 1: ≥ 90% afgeleverd, eerste logins werken → door |
| 10:30 | A | **Groep 2**: ~300 leden (eerste deel van de lijst) |
| 12:00 | A+B | Controle om twaalf uur: afleverpercentage, logins, vragen aan de tafel en aan de telefoon |
| 13:30 | A | **Groep 3**: ~300 leden |
| 15:30 | A | **Groep 4**: de rest |
| 16:00 | B | Kort nieuwsbericht in de app voor de leden van Zwolle (tekst afgestemd met Zwolle) |
| 17:00 | A | Tellen: uitgenodigd, afgeleverd, ingelogd. Elke vraag van vandaag noteren |
| 18:00 | A+B | Kort verslag aan de contactpersoon van Zwolle: cijfers, problemen, wat er morgen gebeurt |
| 18:30 | B | LinkedIn: nog niets. Het lanceerbericht gaat morgen uit (marketingkalender) |

**Stopregel, en wat te doen als er iets misgaat** (uit het risicoregister in Operatie):
- **Codes of uitnodigingen komen niet aan** (minder dan 90% afgeleverd voor een groep): de volgende groep
  pauzeren, de e-maillimiet en de aanbieder controleren; zo nodig overschakelen op de tweede aanbieder
  (Postmark). De hulptafel vertellen wat ze moeten zeggen.
- **Fouten bij inloggen of boeken voor veel leden**: uitnodigingen pauzeren; ligt het aan een release,
  de vorige versie opnieuw uitrollen (terugdraaien getest op 26 februari). De contactpersoon van Zwolle
  bellen voordat leden dat doen.
- **Verkeerde ledengegevens** (verkeerde naam, gezin, lidmaatschap): uitnodigingen direct stoppen, de
  import herstellen, de betrokken leden per e-mail vanuit de club excuses aanbieden.
- **Alles wat lijkt op leden die gegevens van een ander zien**: stoppen, de datalekroutine volgen
  (Operatie 4.4, 72 uur).

## 4. De eerste 30 dagen

**Wekelijkse cijfers** (elke vrijdag, in de weekevaluatie):

| cijfer | bron | doel | iets veranderen als |
| --- | --- | --- | --- |
| Leden van Zwolle die deze week actief zijn (÷ alle leden) | app | 20% in week 4, 40% in week 12 | onder 10% op dag 14 of 20% op dag 28 → stoppen met benaderen, eerst het gebruik oplossen |
| Uitnodigingen afgeleverd / geaccepteerd | e-mailaanbieder, app | ≥ 95% afgeleverd | meer dan 2% teruggekomen → adressen opschonen met Zwolle, domeininstellingen controleren |
| Supporturen voor Zwolle | eigen logboek | daalt elke week | boven 10 uur per week na week 2 → handleiding of app is onduidelijk; oplossen wat terugkomt |
| Geboekte gesprekken met besturen | marketinglogboek | 3 per week | twee weken onder 2 per week → brief herschrijven, eerst bellen, Zwolle om een introductie vragen |
| Pilotaanvragen / intentieverklaringen | marketinglogboek | 3 vóór 30 mei | 0 na 10 gesprekken → terug naar het aanbod |
| Betalende clubs tegenover break-even | CFO | 1 (Zwolle betaalt vanaf maand 1); break-even 2 pioniersclubs onbetaald, 15 clubs met salaris | — de geldtest is test 2, niet de eerste maand |

**Evaluaties** (A+B, één uur, met notities):

- **Dag 7 (ma 8 maart)**: Is elk lid dat wilde inloggen dat gelukt? Wat waren de vijf meest gestelde
  vragen, en welke kan de app of de handleiding beantwoorden in plaats van wij? Is de contactpersoon van
  Zwolle tevreden, in zijn of haar eigen woorden? Iets beloofd dat we niet gedaan hebben?
- **Dag 14 (ma 15 maart)**: Zitten we op 10% actief of meer? Welke groepen ontbreken (leeftijd, soort
  lidmaatschap)? Is de zaterdaghulplijn na week 4 nog nodig? Hoeveel gesprekken met besturen, en welk
  bezwaar kwam het vaakst? Klopt dat met het panel?
- **Dag 30 (wo 31 maart)**: 20% actief? Dalen de supporturen? Wil Zwolle referentiegesprekken voeren, en
  welke cijfers mogen we delen? Moeten we het aanbod, de prijs of het lanceerpakket aanpassen vóór de
  volgende club? De CFO-berekening opnieuw draaien met de echte supporturen.
