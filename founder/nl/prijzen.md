# Prijzen: Greenside

Bedragen in euro per maand, excl. 21% btw. De antwoorden van kopers zijn gesimuleerd (prijscurves
onderaan): ze bepalen wat we testen, ze zijn geen bewijs. Marges komen uit de CFO-berekening
(`founder/numbers.json`, oprichters onbetaald; `founder/numbers-met-salaris.json`, 2 × € 2.500).
**Op 8 oktober 2026 omgezet van een prijs per baangrootte naar een prijs per lid** (vraag van de
oprichters: waarom minder dan een paar greenfees per maand?), en dezelfde dag uitgebreid met een
pionierslaag, een maximum, de telling via de NGF en de garanties uit het doorbraakplan. De volledige afweging, met de
waarde voor de club in greenfees, staat in de bijlage Casus: is Greenside te goedkoop geprijsd?

## 1. De prijs

Drie lagen, allemaal **per lid per maand**, één keer per jaar vastgesteld als **vast jaarbedrag**:

| laag | voor wie | prijs per lid | per lid per jaar | minimum / maximum per maand | vast voor |
| --- | --- | ---: | ---: | --- | --- |
| **Pionier** | de eerste 3 clubs die tekenen **vóór de pilotresultaten van Zwolle (vóór 1 juni 2027)** | € 0,39 | € 4,68 | € 169 / € 539 | 3 jaar |
| **Oprichter** | club 4 tot en met 10, pilot start vóór 1 juli 2027 | € 0,49 | € 5,88 | € 189 / € 679 | 2 jaar |
| **Normaal** | alle clubs daarna | € 0,65 | € 7,80 | € 249 / € 899 | — |

- **Wie telt mee:** de leden die op 1 januari via de club bij de NGF geregistreerd zijn. Dat aantal kent
  de club al (ze betaalt er de NGF-afdracht over), dus geen discussie over gezinsleden, jeugd of
  donateurs.
- **Vast voor het jaar:** leden × prijs × 12, jaarlijks vooraf of per maand gefactureerd. Het beweegt niet
  mee in de loop van het jaar, dus het past in de begroting die de ALV vaststelt.
- **Het maximum** geldt vanaf ongeveer 1.380 leden, dus alleen voor de allergrootste clubs, en houdt
  Greenside verdedigbaar naast een volledig clubsysteem.

| club | leden | normaal | oprichter | pionier |
| --- | ---: | ---: | ---: | ---: |
| 9 holes | ~550 | € 358 | € 270 | € 215 |
| 18 holes | ~950 | € 618 | € 466 | € 371 |
| 27+ holes | ~1.350 | € 878 | € 662 | € 527 |
| kleine club | 300 | € 249 (min.) | € 189 (min.) | € 169 (min.) |

Gemiddeld over de markt (25% / 55% / 20%): pionier **€ 362,70**, oprichter **€ 455,70**, normaal
**€ 604,50** per club per maand.

**Waarom een pionierslaag.** Ronde 3 van het panel liet zien dat de deadline voor oprichters (juli 2027)
wachten beloont: "de oprichtersplaatsen zijn open tot juli 2027, dus ik kan op Zwolle wachten en toch
€ 0,49 krijgen" (P020). De pioniersprijs beloont de clubs die *vóór* het bewijs instappen, drie jaar lang.
Het is echte schaarste: drie plaatsen, en hij stopt als de resultaten van Zwolle er zijn.

Waarom per lid:
- **Het volgt de waarde.** Wat Greenside een club oplevert (leden die blijven, gastrondes, extra's, uren
  aan de balie) groeit met het aantal leden.
- **Het is klein naast golfgeld.** Voor een 18-holesclub met 950 leden is € 618 per maand € 7.410 per
  jaar: **100 greenfees van 18 holes (€ 74,23)**, ongeveer **2 gastrondes per week**, of **5,5 leden** die
  niet opzeggen (€ 1.337 per jaar elk). Dat is 0,6% van de contributie-inkomsten van de club.
- **Het is makkelijk te zeggen in een bestuursvergadering:** "€ 7,80 per lid per jaar", of "per 100
  leden minder dan één greenfee van 18 holes per maand".
- **Ronde 3 van het panel accepteerde het.** Omgerekend naar per lid: mediaan "koopje" € 0,40, "wordt
  duur" € 0,75, "te duur" € 1,05. Alleen 9-holesclubs vinden € 0,65 "duur" (hun punt ligt op € 0,55).

**De garanties die bij elke laag horen** (ze kosten geld; zie de marge hieronder):
- **Geen dubbele rekening:** de licentie start pas als de club het oude systeem opzegt, uiterlijk 6
  maanden na de pilot, en de eerste factuur valt in het volgende begrotingsjaar van de club.
- **Geen dubbel werk:** tijdens de pilot zetten wij elke week de ledenlijst uit het oude systeem over (een
  gewone CSV-export is genoeg).
- **Vangnet voor clubs die van E-Golf4U af moeten:** Greenside vervangt E-Golf4U direct. Haalt de pilot
  de criteria niet, dan zetten wij de gegevens van de club kosteloos over naar Nexxchange of IntoGolf, in
  hun importformaat.
- **Continuïteit:** maandelijks automatisch een export naar opslag van de club zelf, broncode in escrow,
  een IT-partner als vangnet, 12 maanden opzegtermijn.
- **Stoppen na de pilot = niets betalen.** Geen commissie op wat leden kopen. Migratiekosten alleen voor
  clubs na de eerste tien (€ 750 onder 700 leden, € 1.500 vanaf 700).

**Tegenover concurrenten.** Nexxchange GolfSuite vermeldt **€ 200 per maand plus € 50 per gelijktijdige
gebruiker** ([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/),
[GetApp](https://www.getapp.com/recreation-wellness-software/a/nexxchange-golfsuite/pricing/),
[G2](https://www.g2.com/products/nexxchange-golfsuite/pricing); vergelijkingssites, bevestig met een
offerte): ongeveer **€ 350–450** voor een 18-holesclub (schatting). € 618 is meer dan een volledig
clubsysteem, dus het houdt alleen stand als Greenside het huidige systeem **vervangt** en de app erbovenop
komt, in elk gesprek getoond met de eigen factuur van de club.

**De marge** (uitkomst van de rekentool, per club per maand, inclusief de kosten van de garanties):

| laag | gemiddelde prijs | bijdrage |
| --- | ---: | ---: |
| Pionier € 0,39 | € 362,70 | € 250,20 (69%) |
| Oprichter € 0,49 | € 455,70 | € 343,20 (75%) |
| Normaal € 0,65 | € 604,50 | € 492 (81%) |

De garanties kosten ~€ 67 per club per maand (later starten, verdeeld over 24 maanden) plus ~€ 135 per
maand vast (escrow, IT-partner). Om beide oprichters € 2.500 te betalen (vaste kosten € 5.533): **3
pioniers + 7 oprichters + 5 normaal = 15 clubs** (5.533 − 3 × 250,20 − 7 × 343,20 = 2.380; ÷ 492 = 4,8 →
5). Dat is 6% van de 263 NGF-clubs. Alle 263 clubs tegen de normale prijs zou ~€ 1,9 miljoen per jaar
zijn.

## 2. De prijsladder

Clubs kiezen hun grootte niet; ze hebben er één. De prijs per lid is de ladder: hij stijgt mee met de
club. Daarbovenop, later en alleen als ze gebouwd zijn en gevraagd worden: **uitbreidingen**
(NGF-handicapkoppeling, automatische incasso, een koppeling met de kassa van de horeca (unTill), de
ballenautomaat (Xafax)). Elk daarvan laat de club een ander systeem opzeggen, dus prijs ze per
uitbreiding, niet in de basis. Verkoop ze niet voordat ze bestaan.

## 3. Het openingsaanbod

**Greenside Pionier en Founding Club.**
- **Pionier (3 plaatsen):** € 0,39 per lid, drie jaar vast, voor clubs die tekenen voordat de
  pilotresultaten van Zwolle gepubliceerd zijn (**vóór 1 juni 2027**). Zij nemen het meeste risico en
  krijgen er het meeste voor terug.
- **Oprichter (club 4–10):** € 0,49 per lid, twee jaar vast, pilot start vóór 1 juli 2027.
- Allebei: geen migratiekosten, de gratis pilot van drie maanden met schriftelijke succescriteria, en
  alle garanties hierboven.
- **Na de vaste periode** gaat de club naar de dan geldende normale prijs. Zet dat in het contract.
- Noem het aantal plaatsen dat nog over is alleen als exact getal, en alleen zolang het klopt.

## 4. Wat te testen met echte kopers

1. **Laat de pioniersprijs clubs als eerste instappen?** Bied hem in elk gesprek vóór 1 juni 2027 aan en
   tel handtekeningen. Neemt geen enkele club hem, dan is het probleem niet de prijs maar het bewijs.
2. **Laat de rekensom zien met de eigen factuur van de club**: wat de club nu aan de huidige leverancier
   betaalt naast het jaarbedrag van Greenside, en wat de app oplevert. Noteer welk deel overtuigt.
3. **Oprichtersprijs € 0,49 tegenover € 0,59** voor club 4–10, met wisselende prijsbladen.

## 5. De prijsbezwaren uit het panel (letterlijk, voor marketing; vertaald)

1. **"Het komt bovenop wat we al betalen."**
   "Een gratis pilot klinkt onschuldig, maar daarna zouden we bijna 5.000 euro per jaar bovenop onze
   huidige leverancier betalen, en dat moet door de volgende begrotingsronde met een duidelijk
   rendement." (P005, 18 holes, tweede ronde)
2. **"We betalen dubbel als het ons systeem niet vervangt."**
   "Werkt het met het NGF-handicapsysteem en onze automatische incasso? Zo niet, dan draaien we twee
   systemen en betalen we dubbel." (P013, 9 holes, eerste ronde)
3. **"Kleine clubs moeten elke euro verantwoorden, en GOLF.NL is gratis."**
   "Met zo'n 3.000 euro per jaar moet dit naar de ledenvergadering, waar de halve zaal zegt dat GOLF.NL
   gratis is en al starttijden doet." (P014, 9 holes, tweede ronde)

Dit zijn woorden van gesimuleerde kopers: gebruik ze om antwoorden te schrijven, nooit als citaten van
klanten.

## Bijlage: prijscurves (Van Westendorp) per baangrootte

Bron: de vier prijsantwoorden van het gesimuleerde kooppanel, eerste en tweede ronde samen (dezelfde 20
personen, twee pitches: 40 antwoorden). Per segment, omdat een 9-holes vrijwilligersclub en een
commerciële 27-holesbaan andere kopers zijn.

| | 9 holes (n=10) | 18 holes (n=22) | 27+ holes (n=8) |
| --- | ---: | ---: | ---: |
| PMC (daaronder: te goedkoop om te vertrouwen) | € 75 | € 151 | € 152 |
| OPP (minste weerstand) | € 75 | € 151 | € 152 |
| IPP (koopje = duur) | € 151 | € 300 | € 352 |
| PME (daarboven: te duur) | € 251 | € 600 | € 752 |
| Mediaan "te goedkoop" | € 50 | € 150 | € 150 |
| Mediaan "koopje" | € 120 | € 300 | € 350 |
| Mediaan "wordt duur" | € 220 | € 550 | € 650 |
| Mediaan "te duur" | € 300 | € 800 | € 900 |
| Oude normale prijs (per grootte) | € 249 (op de grens) | € 449 (binnen) | € 599 (binnen) |
| Nieuwe normale prijs (€ 0,65 per lid) | € 358 (erboven) | € 618 (op de grens) | € 878 (erboven) |
| Nieuwe oprichtersprijs (€ 0,49 per lid) | € 270 (net erboven) | € 466 (binnen) | € 662 (binnen) |
| Pioniersprijs (€ 0,39 per lid) | € 215 (binnen) | € 371 (binnen) | € 527 (binnen) |
