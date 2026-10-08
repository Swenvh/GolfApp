# Operatie: Greenside

Hoe Greenside draait vanaf de dag dat Zwolle live gaat. Invoer: Het aanbod (wat beloofd is), De cijfers
(kosten), `README.md` "Naar productie" (de technische stappen voor de livegang), Marketing (het ritme
van de verkoop). Bedragen excl. btw. Prijzen gecontroleerd op 8 oktober 2026; waar alleen een offerte
uitsluitsel geeft, staat dat erbij en staat het op de lijst met open vragen aan het eind.

**Kosten die veranderden** (teruggegeven aan de CFO; `founder/numbers.json` bijgewerkt en De cijfers
opnieuw berekend):
- **Apple-ontwikkelaarsaccount: € 8,25 → € 0 per club per maand voor Greenside.** Volgens Apple-richtlijn
  4.2.6 worden apps uit een sjabloon afgewezen tenzij de eigenaar van de inhoud ze indient, dus **elke
  club meldt zich zelf aan** en betaalt zijn eigen € 99 per jaar (bronnen in hoofdstuk 2).
- **Overstap per club: € 55 → € 35 per club per maand.** Een gedrukte A5-handleiding van 8 pagina's kost
  ongeveer € 0,30 per stuk bij 1.000 stuks, dus ~€ 300 per club in plaats van de geschatte € 600.
- **Verzekering: € 75 → € 100 per maand.** Alleen beroepsaansprakelijkheid is al ongeveer € 61 per maand
  voor een softwareontwikkelaar (indicatie van Univé), en een cyberverzekering komt erbij.
- **Beveiligingstest: € 5.000 → € 7.500 eenmalig.** Pentests van een kleine webapp kosten € 5.000–14.000.

Resultaat: bijdrage € 318,50 per club per maand (was € 290), vaste kosten € 398 (was € 373),
break-even met € 2.500 salaris per oprichter **16 clubs** (10 oprichters + 6 normaal; was 18).

## 1. De dagelijkse cyclus

Greenside verkoopt software en service, dus de "dag" is voor de klant grotendeels onzichtbaar. Stappen
die **een club ziet** zijn gemarkeerd met "club", stappen die **een lid ziet** met "lid".

| wanneer | stap | wie ziet het |
| --- | --- | --- |
| 08:00 | Nacht controleren: fouten, mislukte e-mails (inlogcodes, uitnodigingen), mislukte betalingen, gezondheid van de database | — |
| 08:15 | Support-inbox en voicemail: elke club dezelfde ochtend antwoorden | club |
| 08:30 | Overstapwerk van vandaag: imports, controles, uitnodigingen voor clubs in hun lanceerweken | club, lid |
| overdag | Verkoop: bellen, bezoeken, opvolgen (marketingkalender) | club |
| overdag | Productwerk alleen op de werkbranch; `pilot-v1` blijft vast | — |
| 17:00 | Releasemoment (hooguit twee keer per week, nooit op vrijdag of zaterdag): tests, basiscontrole, uitrollen | lid |
| 17:30 | De dag nalopen: open tickets, alles wat vandaag aan een club beloofd is | — |
| zaterdag 08:00–12:00 | **Hulplijn** voor clubs in hun eerste vier weken (de belofte uit het aanbod) | club, lid |
| maandelijks | Licenties factureren (SEPA-incasso), boekhouding, back-ups controleren door er één terug te zetten | club |

**De kerndienst is de overstap van een club**, niet de dag: die loopt van zes weken vóór de livegang
tot vier weken erna (routine 4.2). Daar gaan de meeste uren van de oprichters naartoe (~40 per club).

## 2. Leveranciers

| wat | leverancier | openbare prijs | alternatieven | voorwaarden en opmerkingen |
| --- | --- | --- | --- | --- |
| Database, inloggen, bestanden, edge functions (EU, Frankfurt) | **Supabase** Pro | USD 25 per maand incl. USD 10 rekentegoed; Small compute ~USD 15 ([Makerkit](https://makerkit.dev/blog/saas/supabase-pricing), [Jetadmin](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/)) | Supabase zelf hosten op een EU-server (goedkoper, veel meer werk); geen direct alternatief voor de huidige code | per maand, creditcard; uitgavenplafond standaard aan. Bevestig op supabase.com/pricing |
| E-mail voor inlogcodes en uitnodigingen | **Resend** Pro | USD 20 per maand, 50.000 e-mails ([Resend](https://resend.com/docs/knowledge-base/what-is-resend-pricing.md)) | **Postmark** USD 15 per maand, 10.000 e-mails, daarboven USD 1,80 per 1.000 ([Automation Atlas](https://automationatlas.io/answers/postmark-pricing-explained-2026/)) | een lancering van een club stuurt ~950 uitnodigingen tegelijk; zet de e-maillimiet van Supabase op ≥ 1.000 per uur (README) |
| App bouwen en indienen in de stores | **Expo EAS** | Production USD 99 per maand ([expo.dev/pricing](https://expo.dev:443/pricing)); Starter USD 19 | lokaal bouwen met Xcode en Android Studio (gratis, Mac nodig, trager) | begin op Starter; overstappen bij ~5 apps |
| Hosting clubbeheer | **Vercel** Pro | USD 20 per maand, 1 gebruiker ([Vercel](https://docs.vercel.com/docs/plans/pro-plan)) | elke Node-host in de EU | beveiligingsheaders staan al in `next.config.ts` |
| App Store, per club | **Apple Developer Program**, eigen account van de club | USD 99 (~€ 99) per jaar; organisaties hebben een gratis D-U-N-S-nummer nodig; non-profits kunnen vrijstelling vragen ([Apple](https://developer.apple.com/support/compare-memberships), [vrijstelling](https://developer.apple.com/support/fee-waiver)) | geen: Apple wil dat de eigenaar van de inhoud sjabloon-apps indient (richtlijn 4.2.6, [TechCrunch](https://techcrunch.com/?p=1580390), [GoodBarber](https://goodbarber.com/blog/apple-app-store-guideline-4-2-6-a862)) | **doorlooptijd 2–4 weken** (D-U-N-S, controles van Apple): zes weken vóór de livegang beginnen. De club geeft Greenside toegang als App Manager |
| Google Play, per club | **Google Play Console**, eigen account van de club | USD 25 eenmalig ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)) | het eigen account van Greenside (mag van Google, maar houd het gelijk aan Apple) | identiteitscontroles duren dagen; begin tegelijk met Apple |
| Betalingen van leden (iDEAL, facturen) | **Mollie**, eigen account van de club | per transactie, betaald door de club | — | niet de kosten van Greenside; de club doorloopt de controles van Mollie (KYC) vóór de livegang |
| Licentie van Greenside innen | **Mollie** SEPA-incasso, of de bank | Mollie ~€ 0,25 per incasso (niet bevestigd, [PayRequest](https://payrequest.io/nl/blog/transactiekosten-verlagen-factuurconsolidatie)); ABN AMRO € 0,13 + € 2,10 per batch ([tarieven 2026](https://assets.abnamro.com/api/public/content/Tarieven_Zakelijk_Betalingsverkeer_ABN_AMRO_Januari_2026.pdf)) | factuur met overboeking | één incasso per maand (of per jaar) per club; binnen de € 0,50 van de CFO |
| Gedrukte ledenhandleiding | **Helloprint** of **Drukwerkdeal** | offerte online; Britse referentie: A5 van 8 pagina's, 1.000 stuks £ 243 ([prijslijst](https://ep.dev.shout-loud.co.uk/promo-print/brochure-printing/a5-brochures)) | een lokale drukker bij de club | levertijd ~1 week; twee weken voordat de uitnodigingen uitgaan bestellen |
| Boekhouding | **Moneybird** | vanaf € 3 per maand (5 banktransacties) tot € 15–29 met bankkoppeling ([nieuws.nl](https://nieuws.nl/economie/gratis-boekhouden-wordt-zeldzaam-moneybird-stopte-ermee-rompslomp-gaat-per-factuur-rekenen), [Moneybird](https://www.moneybird.com/blog/changed-prices-for-moneybird-2025/)) | e-Boekhouden, Jortt, Rompslomp | plus een boekhouder voor de jaarafsluiting en btw-advies |
| Verzekering | **Univé**, **Hiscox** (via ZZP Nederland), anderen | beroepsaansprakelijkheid ~€ 61 per maand voor een softwareontwikkelaar, een indicatie ([Univé](https://www.unive.nl/zakelijk/bedrijfsaansprakelijkheidsverzekering/beroepsaansprakelijkheidsverzekering/software-consultant)); cyber op offerte ([ZZP Nederland](https://www.zzp-nederland.nl/verzekeringen-en-advies/cyberverzekering)) | een onafhankelijke adviseur | twee offertes; vraag naar dekking bij een datalek bij een club |
| Beveiligingstest (pentest) | een Nederlands pentestbedrijf | € 5.000–14.000 voor een webapp van een mkb, 5–10 dagen ([Kolonell](https://kolonell.com/en/blog/web-application-penetration-test-price-smb-dublin-2026)); pas op voor een goedkope "pentest" die alleen een scan is ([RedFox](https://www.redfoxsec.com/blog/how-much-does-web-application-penetration-testing-cost-2026-pricing-guide)) | drie offertes | inclusief de ledenapp, het clubbeheer, de importer, de edge functions en de scheiding tussen clubs; plus een hertest |
| Zakelijk telefoonnummer voor de hulplijn | **Voys** of een mobiele aanbieder | op offerte (geen openbare prijs gevonden) | een tweede simkaart | één nummer dat bij beide oprichters overgaat |
| Jurist (contract, AVG-documenten) | een IT- en privacyjurist | op offerte (CFO-schatting € 2.500) | standaard IT-voorwaarden plus een privacyspecialist | nodig voordat de eerste club tekent |

## 3. Mensen

Twee oprichters, geen personeel. Salaris: **€ 2.000–2.500 per persoon per maand** is het doel (het eigen
getal van de oprichters); tot ~16 clubs betalen, groeit het salaris mee met de omzet (De cijfers). Wat
dat het bedrijf kost hangt af van de rechtsvorm: in een bv moet een directeur-grootaandeelhouder een
minimaal "gebruikelijk loon" nemen; in een vof of eenmanszaak is er geen loonadministratie en betaal je
inkomstenbelasting over de winst. **Vraag een boekhouder voordat je kiest**; loonkosten, pensioen en btw
zitten niet in deze cijfers.

**Rollen**
- **Oprichter A — product en veiligheid**: releases, beveiliging, monitoring, imports, de basiscontrole,
  technische tickets beantwoorden.
- **Oprichter B — clubs en verkoop**: benaderen, bezoeken, de overstapgesprekken, de papieren
  handleiding, leiding over de hulplijn, facturatie.
Allebei kunnen ze de ochtendcontrole en de zaterdaghulplijn doen, zodat er één ziek of op vakantie kan
zijn.

**Rooster, rustige eerste maand (Zwolle live, nog geen andere clubs)**

| | ma | di | wo | do | vr | za |
| --- | --- | --- | --- | --- | --- | --- |
| A | ochtendcontrole, product | product, release 17:00 | product | product, release 17:00 | product, weekevaluatie | hulplijn (om de week) |
| B | Zwolle bijpraten, bellen | bezoeken | bellen, brieven | bezoeken | administratie, weekevaluatie | hulplijn (om de week) |

Ongeveer 45 uur per week elk; het meeste is verkopen (B) en de naden van het product dichtmaken (A).

**Rooster bij het plan (10 clubs live, 1–2 tegelijk in overstap)**

| | ma | di | wo | do | vr | za |
| --- | --- | --- | --- | --- | --- | --- |
| A | ochtendcontrole, support | imports voor nieuwe clubs, release | product | support, release | product, back-uptest | hulplijn als een club in zijn eerste 4 weken zit |
| B | support, bellen | overstapgesprekken | bezoeken | overstapgesprekken | facturatie, weekevaluatie | hulplijn als een club in zijn eerste 4 weken zit |

**De supportlast is de grens om te bewaken.** Ga uit van ~2 uur per week per live club na de eerste
maand (een schatting; meet het bij Zwolle). Bij 10 clubs is dat ~20 uur per week; bij 16 clubs ~32 uur,
het grootste deel van één oprichter. De capaciteit van "~25 clubs" in de CFO-berekening geldt dus alleen
als de support per club laag blijft; de eerste drie maanden van Zwolle wijzen het uit.

## 4. Routines

### 4.1 Ochtendcontrole (15 minuten, elke werkdag)
1. Open het foutenoverzicht van Supabase en Vercel: fouten sinds gisteren? Noteer ze.
2. E-mailaanbieder: teruggekomen of vertraagde inlogcodes of uitnodigingen? Heeft een club er meer dan
   een paar, bel de club voordat de leden dat doen.
3. Mollie (per club, via het dashboard van de club als dat gedeeld is): mislukte betalingen of webhooks?
4. Support-inbox en voicemail: antwoord elke club vóór 10:00, al is het alleen "we zijn ermee bezig, u
   hoort vóór 14:00 van ons".
5. Iets aan een club beloofd voor vandaag? Zet het bovenaan.

### 4.2 De overstap van een club (de kerndienst, zes weken)
1. **Week −6**: contract getekend met succescriteria (aanbod B). De club start zijn aanmelding bij het
   Apple Developer Program (D-U-N-S) en het Google Play-account; een Mollie-account als hij dat nog niet
   heeft. Eén contactpersoon.
2. **Week −5**: de club stuurt de export uit zijn huidige systeem (E-Golf4U, Nexxchange, IntoGolf of
   Excel). Eerst importeren in een testclub; de aantallen met de club controleren (leden, gezinnen,
   soorten lidmaatschap).
3. **Week −4**: logo en kleuren → `clubs/<club>/`, `brand.ts`, `pnpm club:assets <club>`, contrasttest
   groen. Basiscontrole: Greenside ongewijzigd.
4. **Week −3**: de app bouwen; indienen bij Apple en Google vanuit de accounts van de club. De papieren
   handleiding bestellen (in de kleuren van de club).
5. **Week −2**: bestuur en 10–20 leden testen de app (de pilotgroep). Oplossen wat zij vinden.
6. **Week −1**: echte import; aantallen nogmaals controleren; training van het secretariaat (één uur, op
   de club).
7. **Livegang (dag 0)**: uitnodigingen in groepjes (niet allemaal tegelijk op een zaterdag); een oprichter
   de hele dag ter plaatse of aan de telefoon.
8. **Week 1–4**: hulplijn op zaterdag; wekelijks gesprek met de contactpersoon; actieve leden tellen
   tegenover het succescriterium.
9. **Week 12**: einde van de pilot: succescriteria gehaald? De club gaat door (licentie start) of stopt,
   betaalt niets en krijgt zijn data-export.

### 4.3 Release (beschermt de basis)
1. Alleen op de werkbranch werken; `pilot-v1` wordt nooit veranderd.
2. `pnpm typecheck && pnpm lint && pnpm test` en de databasetests (`supabase/tests/run-local.sh`).
3. Bij wijzigingen in gedeelde code: Greenside scherm voor scherm vergelijken met `pilot-v1`
   (basiscontrole).
4. Nieuwe databasewijziging = nieuwe migratie, getest; nooit een oude aanpassen.
5. Releasen van maandag tot donderdag na 17:00; nooit op vrijdag, zaterdag of in de lanceerweek van een
   club.
6. De ochtend erna controleren (routine 4.1).

### 4.4 Een klacht of incident
1. **Dezelfde dag antwoorden**, met een naam en een telefoonnummer (Merk, contactmoment 5).
2. Een probleem van één lid (code komt niet aan, kan niet boeken): eerst voor dat lid oplossen, dan de
   oorzaak zoeken. Noteren.
3. Een probleem voor de hele club (geen codes, boeken werkt niet): bel de contactpersoon van de club
   **voordat** die jou belt; zeg wat er mis is, wat je doet, wanneer je terugbelt.
4. **Een mogelijk datalek** (ledengegevens gezien door iemand die ze niet mocht zien, een verloren
   sleutel): stoppen, opschrijven wat er gebeurde, de club informeren (de club is verantwoordelijk voor
   de gegevens van zijn leden, Greenside verwerkt ze), en de club helpen beslissen over een melding bij
   de Autoriteit Persoonsgegevens, die **binnen 72 uur** na ontdekking moet
   ([Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl)).
5. Daarna: één pagina, wat er gebeurde en wat er veranderd is, naar de club.

### 4.5 Wekelijks en maandelijks
1. **Vrijdag**: weekevaluatie: de drie marketingcijfers, open tickets, supporturen per club, wat er
   beloofd is.
2. **Vrijdag**: één back-up terugzetten in een testomgeving en controleren dat hij opent (minstens
   maandelijks).
3. **Maandelijks, eerste werkdag**: licentiefacturen en SEPA-incasso; een week later betalingen
   controleren.
4. **Maandelijks**: papieren handleidingen voor clubs die in de komende zes weken overstappen; bijbestellen.
5. **Per kwartaal**: kosten naast `founder/numbers.json` leggen; de CFO-berekening opnieuw draaien als ze
   verschoven zijn.

## 5. Gereedschap (de kleinste set)

| taak | middel | prijs | waarom |
| --- | --- | --- | --- |
| Hosting van het product | Supabase, Vercel, Expo, Resend | ~€ 160 per maand (vaste kosten CFO) | er al op gebouwd |
| Boekhouding, facturen, btw | Moneybird | € 15–29 per maand | Nederlands, bankkoppeling, facturen en SEPA |
| Licentie innen | Mollie of de bank | ~€ 0,13–0,25 per incasso | clubs betalen via automatische incasso |
| Support | een gedeelde mailbox (Google Workspace of vergelijkbaar) + het hulplijnnummer | ~€ 14 + € 15 per maand | één inbox, één nummer, beide oprichters |
| Verkooppijplijn | Greenside HQ (al gebouwd) | € 0 | prospects, clubs en de inrichtingschecklist op één plek |
| Planning | een gedeelde agenda | € 0 | releasedagen, lanceerweken, zaterdagrooster |
| Wachtwoorden en sleutels | een wachtwoordbeheerder met delen | ~€ 5 per maand (schatting) | sleutels van diensten nooit in chat of e-mail |

## 6. Inschrijving, vergunningen en regels

Regels verschillen per situatie en veranderen; bevestig elk punt bij de instantie of een professional.
Geen juridisch advies.

- [ ] **Inschrijving bij de KVK** ~€ 85 eenmalig (bronnen verschillen: € 80–85;
  [Ondernemersplein](https://ondernemersplein.overheid.nl/inschrijven-bij-kvk/), [KVK](https://www.kvk.nl)).
  Het btw-nummer komt erbij.
- [ ] **Rechtsvorm**: vof of bv. Een bv heeft een notaris nodig (~€ 400–800 extra,
  [Onderneming.nl](https://www.onderneming.nl/bedrijf-starten/inschrijving-kvk/)) maar beperkt de
  persoonlijke aansprakelijkheid, wat telt als je de gegevens van duizenden leden beheert. Beslis met de
  boekhouder.
- [ ] **AVG**: Greenside verwerkt ledengegevens voor de clubs, dus je hebt een
  **verwerkersovereenkomst** nodig met elke club, een **privacyverklaring**, een **register van
  verwerkingen**, en een lijst van **subverwerkers** (Supabase in Frankfurt; Vercel, Resend en Expo zijn
  Amerikaanse bedrijven, dus noem de grondslag voor de doorgifte). Een
  gegevensbeschermingseffectbeoordeling (DPIA) is aan te raden voor ledengegevens op deze schaal. De
  jurist in de startkosten van de CFO dekt dit.
- [ ] **Procedure bij een datalek**: melden binnen 72 uur (routine 4.4).
- [ ] **Algemene voorwaarden** en het **contract** met de clausules uit het aanbod: pilot,
  succescriteria, stoppen zonder kosten, data-export, 12 maanden opzegtermijn en overdracht.
- [ ] **Apple en Google**: elke club gaat zelf akkoord met de voorwaarden van het Apple Developer Program
  en Google Play.
- [ ] **Toegankelijkheid (Europese toegankelijkheidswet)**: dienstverleners die micro-onderneming zijn
  (minder dan 10 mensen en hooguit € 2 miljoen omzet) zijn vrijgesteld
  ([CCPC](https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/),
  [iubenda](https://www.iubenda.com/nl/help/181743-eaa-compliance-5/)). De app streeft al naar contrast
  ≥ 4,5:1 en tikvlakken van 44 pt; houd dat zo, oudere leden hebben het toch nodig.
- [ ] **Website**: toestemming voor cookies als je meer gebruikt dan strikt noodzakelijke cookies.
- [ ] **Verzekering**: beroepsaansprakelijkheid en cyber (hoofdstuk 2).
- [ ] **Elke club**: controles door Mollie, D-U-N-S-nummer, een eigen privacyverklaring die de app noemt.

## 7. Risicoregister

| # | risico | kans | hoe erg | aanpak |
| --- | --- | --- | --- | --- |
| 1 | **Leden gebruiken de app niet bij Zwolle** (onder 20% actief in week 4) | gemiddeld | heel hoog: geen bewijs, geen verkoop | stoppen met benaderen; eerst het gebruik oplossen (handleiding, uitnodigingen in groepen, hulp in het clubhuis); wekelijks meten |
| 2 | **Inlogcodes komen niet aan** (spamfilter, e-maillimiet, storing bij de aanbieder) | gemiddeld | hoog op een zaterdag | eigen domein met SPF/DKIM/DMARC; e-maillimiet ≥ 1.000 per uur; een tweede aanbieder klaar (Postmark); script voor de hulplijn |
| 3 | **Apple wijst de app van een club af of vertraagt hem** (4.2.6, 4.3, review) | gemiddeld | hoog: livegang schuift | indienen vanuit het account van de club, drie weken vooraf; reviewaccount klaar (`pnpm app-review`); App Review vóór de eerste indiening vragen hoe ze met een app per club omgaan |
| 4 | **Een oprichter wordt ziek of stopt** | gemiddeld over 2 jaar | heel hoog: "twee oprichters" is het grootste bezwaar | allebei kunnen de ochtendcontrole en de hulplijn doen; routines op papier (dit document); wachtwoorden in een gedeelde beheerder; een oprichtersovereenkomst over wat er gebeurt als één stopt |
| 5 | **Datalek tussen clubs of van leden** | laag (RLS en tests) | heel hoog | pentest vóór de livegang; scheiding tussen clubs getest in `database.test.sql`; incidentroutine 4.4; cyberverzekering |
| 6 | **Een release breekt de basis of de app van een club** | gemiddeld | hoog | releaseroutine 4.3; nooit op vrijdag of zaterdag; basiscontrole; snel terugdraaien door de vorige versie opnieuw uit te rollen |
| 7 | **De import gaat mis** (verkeerde aantallen, gezinnen uit elkaar) | gemiddeld | hoog: de eerste indruk van het bestuur | eerst importeren in een testclub; aantallen twee keer met de club controleren (week −5 en −1) |
| 8 | **Support overspoelt de oprichters** naarmate er clubs bijkomen | hoog na ~10 clubs | gemiddeld | uren per club meten vanaf Zwolle; handleiding en app verbeteren waar vragen terugkomen; parttime support aannemen vóór 15 clubs |
| 9 | **Een leverancier verhoogt prijzen of verandert voorwaarden** (Expo, Supabase, Apple) | gemiddeld | laag tot gemiddeld (kosten zijn klein) | kosten zijn ~€ 160 per maand; elk kwartaal nalopen; lokaal bouwen als terugval voor Expo |
| 10 | **Een traag verkoopjaar** (clubs wachten een volledig seizoen) | hoog | hoog: geen salaris voor de oprichters | salaris laten meegroeien met clubs; kosten houden op ~€ 400 per maand; vóór de livegang beslissen over de overbrugging (spaargeld, parttime, een lening) |

## Open vragen (offerte of besluit nodig)

1. Pentest: drie offertes van Nederlandse bedrijven, reikwijdte zoals in hoofdstuk 2.
2. Verzekering: twee offertes voor beroepsaansprakelijkheid plus cyber.
3. Jurist: offerte voor verwerkersovereenkomst, privacyverklaring, voorwaarden en het clubcontract.
4. Drukwerk: een Nederlandse offerte voor 1.000 A5-handleidingen (8 of 12 pagina's).
5. Hulplijnnummer: Voys of een mobiele aanbieder, prijs.
6. Rechtsvorm (vof of bv) en hoe de oprichters betaald worden: boekhouder.
7. Apple App Review vragen hoe ze apps per club van dezelfde app behandelen (4.2.6 en 4.3) vóór de eerste
   indiening ([Apple-forum](https://developer.apple.com/forums/thread/840982)).
8. Het werkelijke tarief van Mollie voor SEPA-incasso van de licentie.
