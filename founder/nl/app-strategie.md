# Greenside · App-strategie, prijsmodellen en SLA's

_Casus, 10 oktober 2026. Hoe presenteren we de app het slimst, gegeven dat goedkeuring in de
App Store het grootste operationele risico is — en welk prijsmodel en welke SLA's horen daarbij._

---

## Kern in één alinea

Apple weigert bijna-identieke "white-label" apps. Het plan "elke club een eigen app in de store,
door ons ingediend" botst frontaal op twee regels (4.2.6 en 4.3) en is op schaal onhoudbaar. De
slimste strategie is daarom **één Greenside-app die bij het inloggen de huisstijl van de club laadt**
(de code kan dit al: `brand.ts` + `CLUB=`), met een **eigen-app-in-de-store als premium bijverkoop**
alléén voor clubs die onder hun eigen Apple-account willen publiceren. Het prijsmodel volgt die keuze:
een vaste prijs per lid per jaar als basis, de eigen app als betaalde meerprijs, en harde SLA's die de
zaterdagochtend (het boekingsmoment) beschermen.

---

## 1. De App Store-realiteit (de harde grens)

Twee Apple-richtlijnen bepalen alles. Controleer de exacte tekst vóór je erop bouwt op
[developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines) —
de handhaving wisselt en de bewoording verandert.

- **Richtlijn 4.2.6 (template-/generator-apps):** apps die uit een commerciële sjabloon of
  app-generator komen, worden geweigerd **tenzij de leverancier van de inhoud ze zelf indient**.
  Vertaald: niet Greenside dient 30 clubapps in, maar **elke club dient onder haar eigen
  Apple Developer-account in** ([appinstitute](https://appinstitute.com/apple-app-store-guidelines/),
  [apptooltester](https://apptooltester.com/app-store-rejecting-app-maker-apps-guideline-4-2-6/)).
- **Richtlijn 4.3(a) (spam):** zelfs vanuit aparte club-accounts worden apps die alleen in logo,
  naam en wat instellingen verschillen, geweigerd als "dezelfde app, meerdere keren"
  ([Apple-forum 712614](https://developer.apple.com/forums/thread/712614),
  [develak](https://develak.com/blog/app-store-guideline-4-2-4-3-rejection/)). Handhaving is
  wisselvallig, maar het risico is reëel en onvoorspelbaar — en één strenge reviewer kan een
  livegang blokkeren.
- **Wat Apple wél accepteert voor een platform als het onze:** één "picker"-app die alle clubs
  als aparte ingangen host — precies het één-app-model hieronder
  ([apptooltester](https://apptooltester.com/app-store-rejecting-app-maker-apps-guideline-4-2-6/)).
- **Google Play:** soepeler, maar kent een vergelijkbaar "repetitive content / spam"-beleid en een
  minimale-functionaliteit-eis. Eén app is ook hier het veiligst; Play is zelden de bottleneck.

**Gevolg:** het aantal store-inzendingen is geen detail maar de belangrijkste kostenpost en het
grootste tijdrisico. Elke eigen clubapp = een eigen Apple-account (€ 99/jaar), een eigen review bij
élke update, en een eigen kans op afwijzing op een slecht moment. Met 15 clubs zijn dat 15 reviews
per update — onbeheersbaar voor twee oprichters.

---

## 2. Vijf distributiemodellen

| # | Model | Store-inzendingen | Goedkeuringsrisico | Werklast bij updates | "Eigen app"-gevoel | Oordeel |
|---|---|---|---|---|---|---|
| A | Eigen app per club, **door ons** ingediend | 1 per club | **Hoog** — botst op 4.2.6 | Zeer hoog | Maximaal | ✗ Niet doen |
| A′ | Eigen app per club, **door de club zelf** ingediend | 1 per club | Midden — 4.3-spam blijft | Hoog (per club) | Maximaal | △ Alleen premium |
| B | **Eén Greenside-app**, club bij inloggen | 1 totaal | **Laag** | Laag (één review) | Beperkt | ✓ Basis |
| C | **PWA / webapp** (toevoegen aan beginscherm) | 0 | Geen review | Direct live | Zwak | △ Vangnet |
| D | **Hybride**: B als basis, A′ als premium | 1 + enkele | Laag, beheersbaar | Laag | Schaalbaar | ✓✓ Aanbevolen |

**A — eigen app per club, door ons ingediend.** De oorspronkelijke belofte ("uw eigen app, wij doen
het werk"), maar precies wat 4.2.6 verbiedt. Eén afwijzing in een lanceerweek en de pilot ligt stil.
Niet doen.

**A′ — eigen app per club, door de club zelf ingediend.** Wél regelconform op 4.2.6, maar: de club
moet een Apple Developer-account openen en beheren (€ 99/jaar, betaling, belastinggegevens,
twee-factor), wij hebben toegang nodig om in te dienen, en 4.3-spam blijft boven de markt hangen.
Hoge supportlast en een fragiele afhankelijkheid van reviewers. Alleen zinvol als premium, voor een
enkele club die het echt wil.

**B — één Greenside-app, club bij inloggen.** Eén binary, één review, triviale updates, geen
spamrisico. Een lid downloadt "Greenside" (of een neutralere naam, zie Merk) en ziet na het inloggen
volledig de huisstijl van zijn club: kleuren, logo, naam. De code ondersteunt dit al. Nadeel: de club
heeft geen eigen icoon op het beginscherm van het lid. Dat is een verkoopargument minder, maar
operationeel verreweg het veiligst.

**C — PWA / webapp.** Geen store, geen review, direct live, werkt op elk toestel. Sinds iOS 16.4
kunnen aan het beginscherm toegevoegde PWA's ook pushmeldingen tonen. Maar: minder "echt app"-gevoel,
geen vindbaarheid in de store (wat besturen juist als bewijs van professionaliteit zien), en
Apple Pay/− sommige native functies zijn beperkter. Prima als **vangnet** (een lid zonder store-app
kan altijd via de webversie) en voor een snelle demo, niet als hoofdroute.

**D — hybride (aanbevolen).** Lanceer met B: één app, club bij inloggen, in volle clubhuisstijl. Bied
A′ (eigen app in de store onder het account van de club) aan als **betaalde premium-optie** voor clubs
die er prestige aan hechten en bereid zijn hun eigen Apple-account te voeren. Zo haal je de veiligheid
en snelheid van één app, zonder de belofte "uw eigen app" helemaal op te geven — je verplaatst hem naar
een bovenlaag die zichzelf betaalt.

---

## 3. Aanbevolen strategie

1. **Basis = één Greenside-app (model B).** Zwolle gaat hiermee live. Eén review, snel, veilig. De
   clubbeleving zit volledig in de huisstijl na het inloggen.
2. **Vangnet = PWA (model C).** Elk lid kan ook zonder store-app via de webversie; handig voor de
   oudste leden en voor de balie.
3. **Premium = eigen app in de store (model A′).** Voor wie het wil, onder het eigen Apple-account van
   de club, als betaalde meerprijs met extra werk van ons (zie prijsmodel).
4. **Naam en positionering:** verkoop niet langer "uw eigen app in de store" als kernbelofte, maar
   **"uw club, in één app, in uw huisstijl — en een eigen app in de store wanneer u dat wilt."** Dat is
   eerlijk, haalbaar, en houdt de upsell open.

Dit verandert de kernbelofte uit het plan licht, maar maakt hem wél waarmaakbaar. De oude belofte was
een goedkeuringsrisico dat we niet in de hand hebben.

---

## 4. Elk mogelijk prijsmodel

Context van de klant: Nederlandse golfclubs zijn verenigingen of stichtingen met een jaarbegroting,
een ALV die de contributie vaststelt, en een sterke voorkeur voor voorspelbare, vaste jaarbedragen.
Bedragen zijn exclusief btw tenzij anders vermeld.

| # | Model | Hoe het werkt | Past bij golfclub? | Risico/nadeel |
|---|---|---|---|---|
| 1 | **Per lid per maand, vast jaarbedrag** (huidig) | Prijs × NGF-leden op 1 jan, als vast jaarbedrag | ✓✓ Voorspelbaar, schaalt met clubgrootte | Groeit niet mee binnen het jaar; telmoment vastleggen |
| 2 | **Vaste prijs per club** | Eén bedrag, ongeacht ledenaantal | ✓ Simpel | Oneerlijk voor kleine clubs; laat geld liggen bij grote |
| 3 | **Staffel naar clubgrootte (S/M/L)** | Prijsbanden per ledenschijf | ✓✓ Simpel én eerlijk | Grof; randgevallen op de grens |
| 4 | **Freemium** | Gratis basis-app, betaalde modules | △ | Clubs verwachten "alles inbegrepen"; lage conversie |
| 5 | **Transactie-/gebruik** | % of vast bedrag per boeking/betaling | △ | Onvoorspelbaar voor de club; voelt als "tol" |
| 6 | **Per module / à la carte** | Basis + betaalde opties (wedstrijden, horeca, incasso) | △ | Verkoopt lastig; versnippert de belofte |
| 7 | **Eenmalige bouw + jaarlicentie** | Setup-fee + lager jaarbedrag | △ | Setup-fee remt de pilot; wij beloofden geen migratiekosten |
| 8 | **Setup + per lid** | Combinatie van 7 en 1 | △ | Zelfde drempel als 7 |
| 9 | **Per actief lid (MAU)** | Alleen leden die de app gebruiken | ✗ | Onvoorspelbaar; straft ons voor trage adoptie |
| 10 | **"Vervang uw systeem"** | Prijs ≈ huidig clubsysteem, app erbovenop | ✓✓ Sterkste verkoopverhaal | Vereist zicht op hun huidige factuur |
| 11 | **Omzetdeling / commissie** | % van greenfees, bar, extra's | ✗ | Clubs haten variabele kosten; boekhoudkundig zwaar |
| 12 | **Eigen-app-premium** | Meerprijs voor model A′ | ✓ Past bij hybride | Alleen voor wie Apple-account wil voeren |
| 13 | **Platform + betaalmarge** | Basisprijs + kleine marge op iDEAL/incasso | △ | Transparantie vereist; marges zijn dun |
| 14 | **Jaarlijks vooruit, met korting** | Prepay = korting | ✓ Verbetert cashflow | Lager jaarbedrag |
| 15 | **Pionier-/oprichterskorting** (huidig) | Vroege clubs goedkoper, vast voor 2–3 jaar | ✓✓ Werft de eerste clubs | Drukt omzet jaar 1 |

### Wat het slimst is

**Basismodel: per lid per maand, als vast jaarbedrag (model 1), gestaffeld (model 3), verkocht als
"vervang uw systeem" (model 10).** Dat combineert voorspelbaarheid (de club weet precies wat het kost),
eerlijkheid (groot betaalt meer dan klein), en het sterkste verhaal (het vervangt een kostenpost die er
al is, de app komt er gratis bovenop). De bestaande staffel blijft:

| laag | voor wie | per lid | min / max per maand | vast |
| --- | --- | ---: | --- | --- |
| **Pionier** | eerste 3 clubs | € 0,39 | € 169 / € 539 | 3 jaar |
| **Oprichter** | club 4–10 | € 0,49 | € 189 / € 679 | 2 jaar |
| **Normaal** | daarna | € 0,65 | € 249 / € 899 | — |

**Daarbovenop twee opties:**

- **Eigen app in de store (model 12):** + € 49–99 per maand, want het kost ons terugkerend werk
  (indienen onder hun account, bij elke update opnieuw door review, apart afwijzingsrisico). Dit dekt
  precies de extra last die model A′ meebrengt en maakt de keuze voor de club bewust.
- **Jaarlijks vooruitbetalen (model 14):** 10% korting. Verbetert onze cashflow (die krap is, zie
  CFO) en bindt de club voor een jaar.

**Niet doen:** commissie/omzetdeling (11) en per-actief-lid (9) — clubs willen geen variabele rekening,
en MAU straft ons voor trage adoptie bij juist de 50-plusser die we willen bedienen.

---

## 5. SLA's (serviceniveau-afspraken)

Een bestuur dat zijn ledenadministratie en boekingen aan ons toevertrouwt, wil garanties op papier. De
zaterdagochtend — als iedereen tegelijk een starttijd boekt — is het moment dat niet mag haperen. Bind
de SLA-niveaus aan de prijslagen.

### Wat we garanderen

| Afspraak | Basis | Premium (eigen app) |
| --- | --- | --- |
| **Beschikbaarheid** (per maand, zakelijke meting) | 99,5% | 99,9% |
| **Reactietijd P1** (boeken/inloggen plat) | < 1 uur, 7 dagen | < 30 min |
| **Reactietijd P2** (functie kapot, workaround bestaat) | < 4 werkuren | < 2 werkuren |
| **Reactietijd P3** (vraag, klein ongemak) | < 1 werkdag | < 4 werkuren |
| **Zaterdaghulplijn** (tee-time-piek, 7–12 uur) | ✓ | ✓ prioriteit |
| **Store-indiening / update-doorlooptijd** | binnen 5 werkdagen na akkoord | idem, wij regelen de review |
| **Datalek-melding** (AVG) | binnen 72 uur | binnen 24 uur |
| **Back-up / herstel** | dagelijkse back-up, RPO 24 u, RTO 8 u | RPO 1 u, RTO 2 u |
| **Maandelijkse export** naar eigen opslag van de club | ✓ | ✓ |
| **Opzegtermijn + data meenemen** | 12 maanden, gratis export | idem |
| **Broncode in escrow + IT-partner** (continuïteit) | vanaf de 3e club | ✓ |

### Hoe we het waarmaken en afrekenen

- **Meten en tonen:** een statuspagina met de werkelijke beschikbaarheid, zodat de SLA controleerbaar
  is en niet alleen een belofte.
- **Boeteclausule:** halen we de beschikbaarheid in een maand niet, dan krijgt de club die maand
  (deels) terug — een staffel, bijv. 99,0–99,5% = 10% krediet, < 99,0% = 25%. Houd de boete lager dan
  de maandprijs; het gaat om vertrouwen, niet om een verzekeringsproduct.
- **Onderhoudsvensters:** releases alleen ma–do ná 17:00, nooit in een lanceerweek, `pilot-v1` blijft
  onaangeroerd (staat al zo in de operatie). Gepland onderhoud telt niet mee in de beschikbaarheid, mits
  vooraf aangekondigd.
- **Realiteitscheck:** 99,9% is ~43 min downtime per maand. Dat is haalbaar op moderne hosting, maar
  beloof het alleen in premium en meet het eerlijk. Overbeloven is erger dan een nette 99,5%.

---

## 6. Samengevat: de slimste combinatie

1. **Distributie:** hybride (D) — één Greenside-app in volle clubhuisstijl als basis, PWA als vangnet,
   eigen app in de store als betaalde premium onder het account van de club.
2. **Prijs:** per lid per maand, vast jaarbedrag, gestaffeld, verkocht als "vervang uw systeem";
   eigen app + € 49–99/mnd; 10% korting bij jaarlijks vooruitbetalen; pionier-/oprichterskortingen voor
   de eerste tien clubs.
3. **SLA:** twee niveaus gekoppeld aan de prijslagen, met de zaterdagochtend en de AVG-meldplicht als
   harde punten, een controleerbare statuspagina en een milde boeteclausule.
4. **Positionering:** niet meer "uw eigen app in de store" als kernbelofte, maar "uw club in uw
   huisstijl, in één veilige app — en een eigen store-app wanneer u dat wilt."

### Grenzen van deze casus

- De Apple-regels wisselen en worden wisselvallig gehandhaafd; verifieer de actuele tekst vóór
  livegang en laat een jurist meekijken naar de SLA- en boeteclausules.
- De prijzen sluiten aan op de bestaande CFO-cijfers (pionier € 0,39/lid); de premium-meerprijs en de
  boetestaffel zijn voorstellen die je tegen echte offertes en een echt bestuur moet toetsen.
- Geen juridisch of fiscaal advies.
