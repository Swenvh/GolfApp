# Greenside · Ondernemingsplan

**Oordeel: Nog niet**

- ✓ Elke club levert per maand € 318,50 op vóór vaste kosten (88% bijdrage).
- ✗ Bedrijfsresultaat jaar 1: VERLIES van € 954.
- ✓ Break-even ligt bij 2 betalende clubs tegelijk, tegenover een capaciteit van 25.
- ✗ 0 van de 20 gesimuleerde kopers kopen (0%, de lat ligt op 25%).

| kerncijfer | |
| --- | ---: |
| Prijs | € 364,00 per club per maand |
| Winstmarge bij het plan | 77% per club per maand |
| Break-even | 2 betalende clubs tegelijk |
| Bedrijfsresultaat jaar 1 | € -954 |
| Startkosten | € 10.423 |
| Benodigd geld tot het zichzelf betaalt | € 12.174 |
| Startkosten terugverdiend | niet in jaar 1 |
| Kooppanel | 0 kopen · 20 niet |

## Het idee

- **Wat het is:** een white-label ledenapp plus clubbeheersoftware voor Nederlandse golfclubs; elke club
  krijgt een eigen app in eigen huisstijl in de App Store en Google Play, op één gedeeld platform.
- **Voor wie:** Nederlandse golfclubs met een eigen baan (263 clubs zijn lid van de NGF, 275 banen).
  Het bestuur koopt; het secretariaat, de financiële vrijwilliger en de marshal werken er dagelijks mee.
  De leden (golfers) gebruiken de app.
- **Wat het verkoopt, tegen welke prijs** (het oorspronkelijke idee; de huidige prijzen staan in het
  hoofdstuk Prijzen: € 199 / € 449 / € 599, oprichters € 179 / € 399 / € 499, geen "twee maanden
  gratis"): een maandlicentie naar clubgrootte: € 249 (9 holes, tot ±700 leden), € 449 (18 holes,
  ±700–1.100 leden, de standaard), € 599 (27+ holes). Oprichtersprijs € 399 per maand, twee jaar vast,
  voor de eerste tien clubs. Eenmalige migratie € 750 (9 holes) tot € 1.500 (18+ holes). Drie maanden
  pilot, daarna een jaarcontract; twee maanden gratis bij vooruitbetaling per jaar. Geen commissie op
  wat leden in de app kopen.
- **Waar en hoe:** Nederland. De oprichters verkopen direct aan clubs (demo, pilot, contract). Geleverd
  als eigen iOS/Android-app per club (uit één codebase) en een webapplicatie voor clubbeheer; leden
  worden geïmporteerd uit het huidige systeem van de club en per e-mail uitgenodigd met een inlogcode.
- **Budget en randvoorwaarden:** nog geen omzet. Twee oprichters; de software is gebouwd met Claude Code.
  Een werkende pilot ("pilot-v1") is af en staat vast; de eerste pilotclub (Golfclub Zwolle) heeft een
  versie in eigen kleuren en logo, nog niet live. Productieaccounts (database in de EU, e-mail,
  hosting, Apple- en Google-ontwikkelaarsaccounts) moeten nog worden ingericht. Geen externe
  financiering genoemd.

## Samenvatting

**Wat het is.** Greenside geeft een Nederlandse golfclub een eigen ledenapp in de App Store en Google
Play, plus de clubbeheersoftware erachter, en doet de overstap voor de club. Het is voor de besturen
van de 263 NGF-clubs, eerst de clubs die van E-Golf4U af moeten.

**Oordeel: Nog niet** (berekend door `compile.py` uit `founder/numbers.json` en het kooppanel). Twee van
de vier toetsen slagen, twee niet:
- ✓ **Marge**: elke betalende club laat **€ 318,50 per maand (88%)** over bij de gemiddelde
  oprichtersprijs van € 364.
- ✓ **Break-even**: **2 betalende clubs** zonder salaris, ruim binnen de ~25 clubs die twee mensen
  kunnen bedienen.
- ✗ **Jaar 1**: een verlies van **€ 954**, omdat alleen Zwolle vanaf maand 4 betaalt en de volgende
  clubs wachten op het bewijs van Zwolle (3 betalende clubs in maand 12).
- ✗ **Kopers**: **0 van de 20** gesimuleerde kopers kopen (de lat ligt op 25%), met de oude pitch én
  met het verbeterde Founding Club-aanbod.

Met € 2.500 salaris per oprichter ligt de break-even op **16 clubs** en is het verlies in jaar 1
**€ 60.954**.

**Wat er moet veranderen, en welke stap dat doet.**
1. **Bewijs, geen betere pitch.** 19 van de 20 kopers zeggen wat ze over de streep trekt: Zwolle een
   seizoen live en een gesprek met het bestuur daar. Geen enkele aanpassing van het aanbod veranderde
   de koopbereidheid (`/founder-offer` is twee keer gedraaid). Alleen echte cijfers van Zwolle kunnen
   dat; draai daarna `/founder-consumer` opnieuw met die cijfers, en vertrouw echte besturen meer dan
   het panel.
2. **Jaar 1 in de plus** is een kleine stap: als Zwolle vanaf maand 1 betaalt in plaats van na een
   gratis pilot, wordt het € +2; het Starter-abonnement van Expo geeft € -90 (`/founder-cfo`). Geen van
   beide lost het echte vraagstuk op: het salaris van de oprichters.

**Waar de board en het panel het over eens waren, en waar niet.** Beide zetten bewijs bij Zwolle
voorop, en beide zien de moeite van overstappen en "maar twee oprichters" als de twijfels. De board
stemde "investeren, mits" (5,0 / 10) en zag een verkoopbaar aanbod; het panel kocht niets. De grootste
angst van de board (leden gebruiken geen clubapp naast GOLF.NL) kwam in het panel minder vaak terug dan
vertrouwen en timing. Voor 18 en 27+ holes is de prijs niet het probleem; voor 9 holes wel, en daar is
de normale prijs nu € 199.

**Het grootste risico** is dat de leden van Zwolle de app niet gebruiken: zonder dat verkoopt niets
anders. Aanpak: een lanceerpakket (import voor ze gedaan, papieren handleiding, uitnodigingen in
groepjes, hulplijn op zaterdag), wekelijks tellen hoeveel leden actief zijn, en direct stoppen met
verkopen als in week 4 minder dan 20% actief is.

**Wat er nodig is om te starten.** Ongeveer **€ 12.200** zonder salaris (pentest € 7.500, jurist
€ 2.500, vaste kosten), en **test 1**: Zwolle tekent vóór 13 november een pilotcontract met betaald
vervolg, plus 2 intentieverklaringen van andere besturen vóór 18 december (`founder/launch.md`).

**Deze week:** ga om tafel met het bestuur van Zwolle. Leg de livedatum, de succescriteria en de
oprichtersprijs vanaf maand 4 vast in een pilotcontract, en vraag toestemming om hun naam later te
gebruiken.

_Het panel bestaat uit gesimuleerde kopers en de cijfers zijn prognoses; echte besturen en echte
offertes moeten ze bevestigen. Geen financieel, juridisch of fiscaal advies._

## Wat de board zei

**Stemming: 3 × INVESTEREN, MITS · gemiddelde score 5,0 / 10** (Aanbod 5, Monopolie 4, Product 6)

De board wijst het niet af, maar investeert ook niet op basis van de pitch. Alle drie de leden willen
gemeten bewijs van Golfclub Zwolle voordat er meer clubs getekend of meer gebouwd wordt.

### Risico's die door meer dan één lid genoemd werden (gevaarlijkste eerst)

1. **Leden gebruiken misschien geen eigen clubapp naast GOLF.NL** (alle drie). GOLF.NL is gratis, boekt
   starttijden en heeft 325.300 actieve gebruikers. Als leden de clubapp niet gebruiken, komen de
   extra's, greenfees van gasten en sponsorinkomsten nooit, en valt het verhaal voor de club om.
2. **Nog geen bewijs** (Aanbod, Product). Er heeft nog geen club betaald, de pilot is niet live en de
   waarde van € 19.000–45.000 per club is een ongemeten schatting. Eén van de onderdelen daarvan
   ("pauzeren in plaats van opzeggen") is al uit het product gehaald.
3. **Overstappen van de gevestigde leveranciers is lastig** (alle drie). Clubs werken met E-Golf4U,
   Nexxchange of IntoGolf. Ledengegevens, financiën en vrijwilligers overzetten kost de club moeite en
   brengt risico mee, en IntoGolf publiceert al apps in de huisstijl van clubs.
4. **Het verschil is makkelijk te kopiëren** (Aanbod, Monopolie). "Geen commissie" is een prijsargument
   dat een gevestigde partij kan evenaren. Niets wordt sterker naarmate er meer clubs bijkomen (geen
   netwerkeffect), en de code zelf is geen drempel.
5. **Een kleine, vlakke markt** (Aanbod, Monopolie). Ongeveer 263 clubs. Allemaal op het standaardtarief
   is ongeveer € 1,4 miljoen per jaar: een bedrijf om te bezitten, niet een dat groot wordt.

### Waar de leden het niet eens zijn

- **Wat het bedrijf is.** Het Productperspectief ziet een goed gemaakt product met een focusprobleem:
  te veel dingen, niet één ding. Het Monopolieperspectief ziet een stapsgewijze verbetering zonder
  verdedigbare positie, wat de focus ook is. Het Aanbodperspectief ziet een verkoopbaar aanbod dat
  alleen bewijs mist.
- **Spreiding van scores: 4 tot 6.** Het Productperspectief is het positiefst, omdat de werkende pilot
  en het ontwerp voor vrijwilligers echt zijn. Het Monopolieperspectief is het kritischst, omdat niets
  een kopie tegenhoudt.

### Voorwaarden: de checklist voor de rest van het pakket

Bewijs bij de pilotclub
- [ ] Benoem in één zin het ene ding dat Greenside voor leden doet en GOLF.NL niet (Product).
      → `/founder-offer`, `/founder-marketing`
- [ ] Spreek vóór de livegang met Zwolle succescriteria af: wekelijks actieve leden, omzet via de app
      die de club anders niet had gehad, uren die het secretariaat bespaart (Aanbod, Product).
- [ ] Zwolle gaat live en meldt na de pilot van 3 maanden echt gebruik door leden en vrijwilligers
      (alle drie).
- [ ] Zwolle stapt over op een betaald jaarcontract (Monopolie).

Markt en concurrentie
- [ ] Een overzicht van concurrenten met wat clubs nu betalen, contractvoorwaarden en overstapkosten,
      dat een gat laat zien dat de gevestigde partijen niet snel kunnen dichten (Monopolie, Aanbod).
      → `/founder-competitors`
- [ ] Openen leden een clubapp naast GOLF.NL, en betaalt een bestuur € 449? (Aanbod, Monopolie).
      → `/founder-consumer`, daarna `/founder-pricing`
- [ ] Een benoemd startgebied van hooguit ongeveer 20 clubs (bijvoorbeeld 9-holesclubs, één regio of
      clubs op één systeem) met een plan om minstens 5 oprichtersclubs te tekenen (Monopolie); minstens
      3 getekend voordat het platform verder wordt gebouwd (Aanbod).

Geld
- [ ] Wat het kost om één club te winnen, wat het kost om één club te bedienen, en hoeveel clubs nodig
      zijn om quitte te spelen (Aanbod, Monopolie). → `/founder-cfo`
- [ ] Een garantie die het bedrijf kan betalen, gekoppeld aan het cijfer "licentie terugverdiend" dat
      al in het product zit (Aanbod). → `/founder-cfo`, `/founder-offer`

Product vóór de livegang
- [ ] De naden dichtmaken: productie-e-mail voor inlogcodes, juridische documenten, de rol voor
      horecapersoneel, het besluit over de ballenautomaat, en een schriftelijk antwoord op de vraag wie
      eigenaar is van het ledenrecord als Greenside en het oude systeem het oneens zijn (Product).
- [ ] Support: wie helpt een club of een lid als een inlogcode op zaterdagochtend niet aankomt
      (Product).
- [ ] Duurzaamheid: wat bouwt Greenside dat een kopie in maand zes niet heeft (data over clubs heen,
      koppelingen, een naam bij clubbesturen) (Monopolie).

### De sterkste versie die de board ziet

Niet "een clubapp met alles", waar de pitch dicht bij zit, maar **het ledenplatform dat de club geld
oplevert, bewezen bij Zwolle**. Eén belofte: de app verdient zichzelf terug, met het cijfer "licentie
terugverdiend" dat het product al bijhoudt als bewijs, en een garantie erachter. De ledenervaring
richt zich op wat GOLF.NL niet kan omdat het niet van de club is: de eigen rekening bij de club
(bartab, extra's, gasten, facturen), de clubpas en het clubnieuws. De club krijgt migratie, training
van vrijwilligers en een lanceerpakket voor leden, zodat overstappen bijna geen moeite kost. Het begint
met een smal startgebied van clubs (het oprichtersaanbod, met een deadline) en bouwt wat een kopie niet
snel heeft: koppelingen met de systemen die clubs al gebruiken en een staat van dienst bij
clubbesturen. Dit is smaller dan de pitch: minder "alles voor de club", meer "aantoonbaar extra
inkomsten voor de club, met leden die het echt gebruiken".

## De concurrentie

Onderzoeksdatum: 8 oktober 2026. Alleen openbare bronnen, elk feit met een link.

**Beperkingen van dit onderzoek, lees eerst.** De websites van de leveranciers zelf (intogolf.nl,
e-golf4u.nl, ngf.nl, compupartner.nl, apps.apple.com) konden vanuit de onderzoeksomgeving niet worden
geopend (geblokkeerd door het netwerkbeleid), dus feiten komen uit zoekresultaten die die pagina's
citeren en uit websites van clubs. **Geen enkele leverancier publiceert een prijs**: de
prijsvergelijking hieronder blijft daarom open, niet gegokt. Vraag clubs in verkoopgesprekken wat ze nu
betalen.

### 1. Wie er zijn, meest directe eerst

| # | Naam | Soort | Wat ze verkopen | Ledenapp | Waardering |
| --- | --- | --- | --- | --- | --- |
| 1 | **IntoGolf** (incl. Proware, IkGaGolfen) | direct | Alles-in-één: ledenadministratie, starttijden, kassa, facturatie, wedstrijden ([intogolf.nl](https://intogolf.nl/), [unTill](https://untill.nl/koppelingen/intogolf/)) | **Eigen app per club** in de stores, bv. Sallandsche, Golfpark Wilnis, De Kroonprins, De Batouwe, Lochemse ([App Store-ontwikkelaarspagina](https://apps.apple.com/nl/developer/intogolf-b-v/id1202167984?l=en)), Amelisweerd ([Google Play](https://play.google.com/store/apps/details?id=nl.intogolf.amelisweerd&hl=en_US)) | IkGaGolfen v3: **1,9** op Google Play (21 reviews), ~2,0 in de App Store ([Google Play](https://play.google.com/store/apps/details?id=nl.ikgagolfen.v3&amp;hl=en&amp;gl=US), [App Store-reviews](https://apps.apple.com/nl/app/ikgagolfen-v3/id1631802402?see-all=reviews&platform=iphone)) |
| 2 | **Nexxchange** (GolfSuite, nam E-Golf4U over) | direct | Clubbeheer in de cloud; >400 banen in de EU (2023) ([IAGTO](https://iagto.com/pressrelease/details/12b3c479-dd60-4af4-927a-2804fad7a6d3)); ledenportaal ([handleiding](https://zeegersloot.nl/wp-content/uploads/2024/11/Handleiding_NexxChange_portaal_1.pdf)) | Webportaal | niet gevonden |
| 3 | **E-Golf4U** (stopt) | direct, verouderd | Scores, wedstrijden, starttijden, NGF-pas ([Veldzijde](https://gcveldzijde.nl/faq-items/is-er-ook-een-mobiele-app-van-e-golf4u/), [Welderen](https://golfclubwelderen.nl/e-golf4u-instructie/)) | **Webapp** (m.eg4u.nl), "niet via de App Store of Play Store" ([Veldzijde](https://gcveldzijde.nl/faq-items/is-er-ook-een-mobiele-app-van-e-golf4u/)) | niet gevonden |
| 4 | **Golfspot + TeeControl + Parrow** ("Golfdashboard") | direct | Golfspot: "the Customer Data Platform for the golf market" ([golfspot.io](https://golfspot.io/)); TeeControl: starttijden in de cloud ([teecontrol.com](https://www.teecontrol.com/en)); Parrow: Nederlandse wedstrijdmodule ([Prise d'Eau](https://prisedeau-golf.nl/nieuws-vereniging/vervanging-wedstrijdmodule-golf-genius/)) | **Webapp**, "niet te downloaden" uit de stores ([De Hooge Rotterdamsche](https://www.dehoogerotterdamsche.nl/golfdashboard/)) | niet gevonden |
| 5 | **GolfBox** | direct (internationaal) | Leden- en handicapadministratie, starttijden, kiosk, ledenapp; leverancier claimt >1.000 clubs ([golfbox.net](https://golfbox.net/golfbox-golf-management)) | App | Nederlandse klanten niet bevestigd |
| 6 | **Compu Partner** (CompuGolf) | direct | Clubsoftware met een mobiele app ([compupartner.nl](https://compupartner.nl/compugolf/mobiele-app/)) | App | details niet leesbaar |
| 7 | **Golf Genius** (Club App) | indirect | Wedstrijden + volledig white-label clubapp ([Golf Business News](https://golfbusinessnews.com/news/management-topics/golf-genius-launches-enhanced-club-app/)); bij Prise d'Eau vervangen door Parrow ([bron](https://prisedeau-golf.nl/nieuws-vereniging/vervanging-wedstrijdmodule-golf-genius/)) | Eigen clubapp | niet gevonden |
| 8 | **GOLF.NL-app + GOLFGO** (NGF) | indirect | Gratis: NGF-pas, scorekaarten, handicap, starttijden bij ±65 banen via GOLFGO ([NVG](https://www.nvg-golf.nl/initiatieven/golfgo)), **betalen bij boeken** sinds eind 2025 ([NGF, maart 2026](https://www.ngf.nl/over-de-ngf/nieuws/2026/mrt/golfbanen-zien-direct-resultaat-van-betaalfunctie-in-app-golfnl)), "Zoek en boek" vanaf juli 2026 | Landelijke app, "Dé app voor golfend Nederland!" ([golf.nl/app](https://www.golf.nl/app)) | 4,2 op Google Play (~1.900), 4,5 in de App Store (~3.200) ([App Store](https://apps.apple.com/nl/app/golf-nl-app/id1140989195), [Google Play](https://play.google.com/store/apps/details?id=com.ngf.mijngolf)); "meer dan 130.000 maandelijkse gebruikers" ([iO](https://press.iodigital.com/golfnl-app-20-makes-golf-accessible-to-everyone)) |
| 9 | **CPS, Lightspeed Golf, Teecontrol** | indirect | Starttijdensystemen die GOLFGO uitleest ([NGF](https://www.ngf.nl/caddie/baanmanagement/golfgo)) | via GOLF.NL | niet gevonden |
| 10 | **Golf@** | indirect, klein | Ontmoetingsplatform voor golfers, clubs en pro's; laatste update 2016 ([App Store](https://apps.apple.com/nl/app/golf-at-voor-golfers-golfclubs-en-de-golfpro/id933973704)) | App | 3,0 (2 reviews) |
| – | **Website + e-mail + telefoon aan de balie** | vervanger | Wat clubs zonder app doen | geen | – |

### 2. Prijs

**Door geen enkele leverancier gepubliceerd** (IntoGolf, Nexxchange, E-Golf4U, Golfspot, TeeControl,
GolfBox). Het enige openbare bedrag: een kassakoppeling voor E-Golf4U "vanaf € 11,00" per maand
([leza.nl](https://www.leza.nl/mpluskassa-apps/reserverings-koppelingen/e-golf4u/)), wat niets zegt over
een volledige licentie. IntoGolf verkoopt modules "die passen bij uw organisatie"
([intogolf.nl](https://intogolf.nl/)), dus prijzen gaan op offerte. Laagste / middelste / hoogste prijs
voor een vergelijkbare licentie: **onbekend**. Eén overstapverhaal noemt prijs: Golfclub
Brunssummerheide stapte in 2020 over van E-Golf4U naar Proware vanwege "een flinke kostenbesparing"
([readkong](https://de.readkong.com/page/belangrijk-nieuws-2407001)). Later gevonden bij `/founder-pricing`:
Nexxchange GolfSuite vermeldt € 200 per maand plus € 50 per gelijktijdige gebruiker (zie Prijzen).

### 3. Positiekaart

As 1: hoeveel van de backoffice van de club het regelt (alleen starttijden → alles inclusief
financiën). As 2: wat het lid op de telefoon krijgt (niets / webapp → landelijke app → de eigen app van
de club in de stores).

```
                    lid krijgt de EIGEN app van de club
                                   ▲
           Golf Genius (clubapp)   │            IntoGolf (eigen apps, ~2/5)
                                   │                          ◆ Greenside (doel)
   ────────────────────────────────┼───────────────────────────────────────►
   starttijden / één module        │                    alles inclusief financiën
           GOLF.NL-app (gratis, landelijk; starttijden, betalen, NGF-pas)
           TeeControl · CPS        │  Golfspot+TeeControl+Parrow   Nexxchange   GolfBox?
                                   │  (webapp)                     (webportaal)
                                   │  E-Golf4U (webapp, stopt)
                                   ▼
                       lid krijgt een webapp / portaal of niets
```

### 4. Waar klanten over klagen

Er zijn weinig openbare reviews van zakelijke clubsoftware; het meeste bewijs komt uit mededelingen van
clubs en reviews in de appstores. Thema's met minder dan drie bronnen zijn gemarkeerd als **dun**.

1. **Gedwongen migratie, met wrijving** (5+ bronnen). E-Golf4U verdwijnt: "e-Golf4U gaat per 26 maart
   2024 verdwijnen" ([Uithoorn](https://www.golfvereniginguithoorn.nl/2024/03/16/e-golf4u-gaat-per-26-maart-2024-verdwijnen/));
   clubs stappen over naar Nexxchange ([Putten](https://www.golfclubputten.com/nieuws/2242159_nexxchange-vervangt-e-golf4u),
   [Bilthoven](https://www.golfclubbiltseduinen.nl/algemeen/migratie-van-e-golf4u-naar-nexxchange-per-20-februari-2025/),
   [Vught](https://www.golfclubvught.nl/resources/media/Migratie/Nexxchange-nieuws-GCV-v1.pdf)),
   naar IntoGolf ([Veldzijde](https://gcveldzijde.nl/overgang-naar-een-nieuw-computer-systeem-intogolf/),
   [Hildenberg](https://golfparkdehildenberg.nl/index.php/golfbaannieuws/e-golf4u-wordt-intogolf))
   of naar Golfspot/TeeControl/Parrow ([De Hooge Rotterdamsche](https://www.dehoogerotterdamsche.nl/van-e-golf4u-naar-golfdashboard/),
   [Landgoed Nieuwkerk](https://golfclublandgoednieuwkerk.nl/golfdashboard-2/)). Eén club zegt dat in
   november 2025 ongeveer de helft van de E-Golf4U-clubs naar Nexxchange was overgestapt
   ([Overbrug](https://hgc-overbrug.nl/2025/11/de-migratie-van-e-golf4u-naar-nexxchange/)); de Veluwse
   Golf Club stelde de migratie uit nadat een testmigratie onvolkomenheden liet zien
   ([Veluwse](https://veluwsegolfclub.nl/nexxchange-informatie/)). Het bestuur van Nieuwkerk: niet
   ontevreden, maar "het systeem houdt op te bestaan".
2. **De ledenapp is een webpagina, geen app** (5+ bronnen). Clubs publiceren stappenplannen om een
   snelkoppeling op het beginscherm te zetten voor E-Golf4U
   ([Semslanden](https://semslanden.nl/webapp-egolf4u-installeren/),
   [Holthuizen](https://golfclubholthuizen.nl/e-golf-app-installeren-op-uw-smartphone/),
   [Havelte](https://www.golfclubhavelte.nl/het-installeren-van-de-web-app-egolf4u/),
   [Ter Specke](https://golfbaanterspecke.nl/wp-content/uploads/2023/01/Instructie-voor-het-installeren-van-de-E-Golf4U.pdf)),
   Proware ("U vindt deze app niet in de appstore", [readkong](https://de.readkong.com/page/belangrijk-nieuws-2407001))
   en Golfdashboard ([Tespelduyn](https://golfbaantespelduyn.nl/web-app/)). De webapp van de
   Hollandsche Golfclub is niet te gebruiken door greenfeespelers
   ([HGC](https://www.hollandschegolfclub.nl/hgc-web-app-gewoon-handig/)).
3. **De enige eigen clubapp scoort slecht** (3 bronnen). IkGaGolfen v3 (IntoGolf): 1,9 op Google Play;
   reviewers in de App Store (2022–2024) melden mislukte logins, hun club niet kunnen vinden en een wit
   scherm na het kiezen van een starttijd, waardoor geen medespelers toegevoegd kunnen worden
   ([App Store-reviews](https://apps.apple.com/nl/app/ikgagolfen-v3/id1631802402?see-all=reviews&platform=iphone),
   [Google Play](https://play.google.com/store/apps/details?id=nl.ikgagolfen.v3&amp;hl=en&amp;gl=US)).
   Bij de livegang van IntoGolf bij De Kroonprins werden de vertrouwde vriendengroepen voor boeken
   vervangen door "bekende spelers" ([Kroonprins](https://golfbaandekroonprins.nl/livegang-intogolf-27-maart-2024-1200-uur/)).
4. **Meerdere systemen voor één club** (dun, 2 bronnen). Leden van Golfdashboard hebben nog een aparte
   Parrow-app nodig voor wedstrijden ([Golfmiddenbrabant](https://www.golfmiddenbrabant.nl/golfdashboard3),
   [Amelisweerd](https://amelisweerd.nl/welkom-bij-het-golfdashboard/)).
5. **GOLF.NL werd trager en toont advertenties na een update** (dun, 1 review op
   [Google Play](https://play.google.com/store/apps/details?id=com.ngf.mijngolf)).
6. **No-shows bij gereserveerde starttijden** (dun, 2 bronnen), nu opgelost door betalen bij boeken in
   GOLF.NL: "vrijwel geen no-shows meer" bij De Compagnie en Harderwold
   ([NGF](https://www.ngf.nl/over-de-ngf/nieuws/2026/mrt/golfbanen-zien-direct-resultaat-van-betaalfunctie-in-app-golfnl)).

### 5. Het gat

**Een echte, verzorgde app op naam van de club, in de appstores, bovenop een administratie die toch al
verhuist.**

- De meeste Nederlandse leden krijgen een **webapp** (E-Golf4U, Proware, Golfdashboard,
  Nexxchange-portaal). De enige leverancier met eigen clubapps (IntoGolf) scoort ongeveer **2 uit 5**,
  met problemen bij inloggen en boeken. Niemand combineert "de eigen app van de club" met een goede
  ervaring. De app van Greenside (eigen naam, logo en kleuren, inloggen met een code zonder
  wachtwoord) richt zich precies hierop.
- **Er staat nu een overstapvenster open, en het gaat dicht.** E-Golf4U stopt en elke E-Golf4U-club
  moet kiezen. In november 2025 was ongeveer de helft naar Nexxchange; anderen kozen IntoGolf of
  Golfspot. De clubs die nog op E-Golf4U zitten, en clubs die ontevreden zijn na een overhaaste
  migratie, zijn de best bereikbare kopers. Greenside importeert al CSV uit E-Golf4U, Nexxchange en
  IntoGolf.
- **Niet elke club wil alles vervangen.** Golfspot noemt zich uitdrukkelijk "best-of-breed", met een
  dataplatform dat "your member app" bijwerkt ([golfspot.io](https://golfspot.io/)). Dat wijst op een
  tweede route: Greenside als ledenapp bovenop een bestaande administratie, in plaats van (of vóór)
  het vervangen ervan.
- **Niet bevestigd:** of concurrenten ook extra's, de bartab op rekening en greenfees van gasten in hun
  apps verkopen. Geen bron bevestigt of ontkent het; controleer het in demo's voordat je het als
  verschil noemt.

### 6. De dreiging

1. **GOLF.NL (NGF)**: gratis, landelijk, boekt al starttijden met **betaling** en breidt uit ("Zoek en
   boek", juli 2026). Het beheert de NGF-pas en handicap van de golfer. Als de NGF clubnieuws of een
   ledenrekening toevoegt, wordt de reden voor een clubapp kleiner. Greenside hoort er *naast* te staan
   (clubrekening, extra's, clubleven), niet op boeken te concurreren.
2. **IntoGolf**: de enige met eigen clubapps. Als het de kwaliteit van die app verbetert, sluit het het
   duidelijkste gat van Greenside het snelst.
3. **Golfspot/TeeControl/Parrow**: modern, Nederlands, groeit bij bekende clubs (Bernardus, Kennemer).
   Een eigen ledenapp toevoegen aan Golfdashboard zou een kleine stap zijn.
4. **Nexxchange**: groot, koopt bedrijven op (E-Golf4U, Sysgolf ([bron](https://thegolfbusiness.co.uk/2024/08/nexxchange-acquires-sysgolf-srl/)),
   samenwerking met UGOLF) en erft veel Nederlandse clubs.

### Open vragen voor de volgende stappen

- Wat betalen clubs nu per jaar voor hun systeem? (vraag het in elk verkoopgesprek; `/founder-pricing`)
- Installeren leden een clubapp naast GOLF.NL? (`/founder-consumer`)
- De administratie vervangen, of de ledenapp erbovenop zijn? (`/founder-offer`, `/founder-cfo`)

## Het kooppanel

**0 kopen · 20 niet** (0% koopt) van 20 gesimuleerde kopers. Seed 682799, zodat dezelfde kaarten opnieuw
gedeeld kunnen worden. Dit is de eerste ronde (oude pitch); de tweede ronde met het Founding
Club-aanbod gaf hetzelfde resultaat (zie Het aanbod, hoofdstuk 5).

Dit zijn gesimuleerde kopers, geen klanten. Gebruik dit om bezwaren en zwakke plekken te vinden, en
toets de grote punten bij echte mensen voordat je geld uitgeeft. De citaten zijn vertaald uit het
Engels.

### Per segment

| groep | kopers | koopt |
| --- | ---: | ---: |
| Bestuurslid of betaalde clubmanager van een 18-holesclub (±950 leden, omzet ongeveer 1,8 miljoen euro) | 11 | 0% |
| Clubmanager of commercieel manager van een 27+-holesclub of commercieel geëxploiteerde baan (±1.350 leden) | 4 | 0% (dun) |
| Vrijwillig bestuurslid van een 9-holesclub (±550 leden, vooral vrijwilligers) | 5 | 0% (dun) |

### Per koopgedrag

| groep | kopers | koopt |
| --- | ---: | ---: |
| Zit nog op E-Golf4U, moet nu een nieuw systeem kiezen | 4 | 0% (dun) |
| Net overgestapt, moe van overstappen | 3 | 0% (dun) |
| Trouw aan de huidige leverancier | 3 | 0% (dun) |
| Penningmeester, elke euro telt | 3 | 0% (dun) |
| Overbelaste secretaris / vrijwilliger | 3 | 0% (dun) |
| Commercieel ingestelde manager | 2 | 0% (dun) |
| Voorzichtige voorzitter, gaat via de ALV | 2 | 0% (dun) |

### Per inkomen (van de gesimuleerde persoon)

| groep | kopers | koopt |
| --- | ---: | ---: |
| $ 62.000 tot $ 79.000 | 8 | 0% |
| $ 79.000 en hoger | 7 | 0% (dun) |
| onder $ 62.000 | 5 | 0% (dun) |

### Waarom ze niet kopen

| reden | kopers | in hun woorden |
| --- | ---: | --- |
| vertrouwen | 15 | "We hebben 950 leden, de meesten boven de 60, en E-Golf4U verdwijnt, dus deze migratie moet in één keer goed gaan. Ik kan geen product van twee oprichters zonder één live club aan mijn bestuur voorleggen terwijl Nexxchange en IntoGolf al honderden clubs draaien." (P001) · "We draaien al jaren op ons huidige systeem en dat werkt goed genoeg; ik ga geen 950 leden, onze starttijden en onze facturatie verhuizen naar twee oprichters van wie de eerste pilotclub nog niet eens live is. Een mooie app in onze eigen kleuren weegt niet op tegen het risico van een rommelig seizoen." (P003) |
| timing | 3 | "We hebben net 950 leden en een uitgeput vrijwilligersteam door een migratie van E-Golf4U gesleept; ik zet ze niet binnen een jaar door nog een overstap voor een product waarvan de eerste pilotclub nog niet live is." (P002) · "We zijn net klaar met de overstap van E-Golf4U, de vrijwilligers zijn uitgeput en de leden hebben het nieuwe systeem net onder de knie. Ik zet de club niet binnen een jaar door nog een migratie, en zeker niet naar iets dat bij de eerste pilotclub nog niet eens live is." (P004) |
| gewoonte | 2 | "We draaien al jaren op ons huidige systeem, het werkt goed genoeg en de leverancier kent ons. 550 leden overzetten naar een nieuwe app van twee oprichters van wie de eerste club nog niet live is, is hoofdpijn die ons vrijwilligersbestuur niet nodig heeft voor € 249 per maand." (P008) · "We draaien al jaren op ons huidige systeem, de leverancier kent ons en het werkt goed genoeg. Overstappen betekent 550 leden migreren, vrijwilligers opnieuw opleiden en veel mensen boven de 60 nog een app laten installeren. Dat is veel gedoe voor een klein vrijwilligersbestuur, voor software die nergens live is, gebouwd door twee oprichters." (P017) |

### Waarom ze kopen

Niemand kocht.

### Wat een nee kan omdraaien

- Golfclub Zwolle of een andere 18-holesclub echt een volledig seizoen live zien, met een manager die ik
  kan bellen, plus een schriftelijke garantie dat we al onze gegevens kunnen exporteren als Greenside
  stopt.
- Een vergelijkbare 18-holesclub die het een volledig seizoen live draait met een werkende
  NGF-handicapkoppeling en automatische incasso, en een contract waarmee we na de pilot kunnen stoppen
  en onze gegevens kosteloos meekrijgen.
- Een vergelijkbare 18-holesclub die het een volledig seizoen zonder problemen live draait, en een
  duidelijke manier om onze gegevens terug te krijgen als ze failliet gaan.
- Een paar clubs van onze grootte die er een volledig seizoen zonder problemen op draaien, plus
  contractuele escrow of een garantie op volledige data-export als ze stoppen, en spreek me dan weer als
  ons huidige contract afloopt.
- Golfclub Zwolle echt een volledig seizoen live zien, met hun penningmeester die vertelt dat facturatie
  en iDEAL werken en dat het hun oude pakket vervangt in plaats van erbij komt.
- Twee of drie vergelijkbare clubs die het een volledig seizoen live draaien, die ik kan bellen en
  bezoeken, plus een contract dat onze gegevens en support garandeert als het bedrijf stopt.
- Golfclub Zwolle een volledig seizoen live zien, plus een gesprek met hun secretaris over hoe het ging
  met de oudere leden en de migratie, en escrow of een data-exportgarantie in het contract.
- Een vergelijkbare 9-holes vrijwilligersclub die er een volledig seizoen zonder problemen op draait, en
  onze huidige leverancier die de prijs verhoogt of de support afbouwt.
- Ons huidige systeem dat de komende een à twee jaar flink faalt, plus Golfclub Zwolle een volledig
  seizoen live zien met oudere leden die de app echt gebruiken, en jullie die de hele migratie gratis
  doen.
- Golfclub Zwolle een volledig seizoen live met een penningmeester die ik kan bellen, plus een pilot
  waar we kosteloos uit kunnen stappen en een schriftelijke garantie dat we onze gegevens terugkrijgen
  als ze stoppen.
- Het een volledig seizoen live zien bij een club van onze grootte, met de NGF-handicapkoppeling en
  automatische incasso werkend, en een referentiegesprek met hun manager vóór de begrotingsvergadering
  in het voorjaar.
- Een vergelijkbare 18-holesclub die er een volledig seizoen live op heeft gedraaid, plus een
  schriftelijke garantie dat we een volledige export van al onze gegevens en een overgangsperiode
  krijgen als ze stoppen.

Alle 20 kopers gaven de vier prijsantwoorden; zie het hoofdstuk Prijzen.

## Prijzen

Bedragen in euro per maand, excl. 21% btw. De antwoorden van kopers zijn gesimuleerd (prijscurves
hieronder): ze bepalen wat we testen, ze zijn geen bewijs. Marges komen uit de CFO-berekening
(`founder/numbers.json`, oprichters onbetaald; `founder/numbers-met-salaris.json`, 2 × € 2.500).

### 1. De prijs

| | 9 holes | 18 holes | 27+ holes |
| --- | ---: | ---: | ---: |
| **Normale prijs** | **€ 199** (was € 249) | **€ 449** (gelijk) | **€ 599** (gelijk) |
| **Oprichtersprijs** (eerste tien clubs, twee jaar vast) | **€ 179** (gelijk) | **€ 399** (gelijk) | **€ 499** (was € 399) |
| Acceptabele bandbreedte volgens kopers | € 75 – 251 | € 151 – 600 | € 152 – 752 |
| Punt waar "koopje" = "duur" (IPP) | € 151 | € 300 | € 352 |

Waarom:
- **9 holes: normale prijs € 249 → € 199.** € 249 lag precies op de grens van wat vrijwilligersbesturen
  accepteren (PME € 251); hun mediaan voor "wordt duur" is € 220. € 199 valt binnen de bandbreedte, en
  het verschil met de oprichtersprijs van € 179 blijft echt. 9-holesclubs zijn 25% van de markt, dus
  dit kost weinig: gemiddelde normale prijs € 429 → € 416,50.
- **18 holes: ongewijzigd.** € 449 en € 399 liggen ruim binnen de bandbreedte; 3 van de 22 antwoorden
  zeggen letterlijk dat de prijs "niet het probleem" of "klein geld" is. De twijfel is vertrouwen, niet
  prijs.
- **27+ holes oprichtersprijs € 399 → € 499.** € 399 voor een club met 1.350 leden was 33% korting,
  meer dan nodig: € 499 ligt nog onder hun mediaan van € 650 voor "wordt duur". Het verhoogt de
  gemiddelde oprichtersprijs met € 20 (€ 344 → € 364).
- **Schrap "twee maanden gratis bij jaarbetaling".** Dat is 17% korting waar clubs niet om vroegen.
  Clubs begroten toch per jaar: factureer jaarlijks vooraf tegen de normale prijs, of per maand.
- **Houd de migratiekosten voor clubs na de eerste tien** (€ 750 voor 9 holes, € 1.500 voor 18+): die
  betalen het werk van "wij doen het werk". Oprichtersclubs betalen niets.

**Tegenover concurrenten.** Niemand publiceert Nederlandse prijzen, op één datapunt na: Nexxchange
GolfSuite vermeldt **€ 200 per maand plus € 50 per gelijktijdige gebruiker**, plus eenmalige
installatiekosten ([Capterra](https://www.capterra.com/p/201943/Nexxchange-GolfSuite/),
[GetApp](https://www.getapp.com/recreation-wellness-software/a/nexxchange-golfsuite/pricing/),
[G2](https://www.g2.com/products/nexxchange-golfsuite/pricing); vergelijkingssites, bevestig met een
offerte). Een 18-holesclub met 3–5 mensen aan de balie, op het secretariaat en bij de financiën betaalt
dan ongeveer **€ 350–450** (schatting). € 449 is dus de prijs van een *volledig* clubsysteem. Dat is de
verkooplijn, en ook het risico:
- Als Greenside het huidige systeem **vervangt**, is € 449 ongeveer dezelfde rekening met een clubapp
  erbij. Dat is het antwoord op "het komt bovenop wat we betalen" (7 van de 20 antwoorden).
- Als het **naast** het huidige systeem draait, verdubbelt de softwarerekening, en dan zeggen
  penningmeesters nee. Zonder NGF-handicapkoppeling en automatische incasso kunnen veel clubs het niet
  volledig vervangen (Het aanbod, K).

**De marge** (uitkomst van de rekentool, per club per maand; kosten zoals bijgewerkt bij Operatie):

| prijs | bijdrage | break-even, onbetaald | break-even, 2 × € 2.500 |
| --- | ---: | ---: | ---: |
| Gemiddelde oprichtersprijs € 364 | € 318,50 (88%) | 2 clubs | 17 clubs |
| Gemiddelde normale prijs € 416,50 | € 371 (89%) | 2 clubs | 15 clubs |
| Oude normale prijs € 429 | € 383,50 (89%) | 2 clubs | 15 clubs |

Alleen tien clubs krijgen de oprichtersprijs, dus de echte route is **10 oprichtersclubs + 6 tegen de
normale prijs = 16 clubs** om beide oprichters € 2.500 te betalen (5.398 − 10 × 318,50 = 2.213;
÷ 371 = 6,0 → 6). Dat is 6% van de 263 NGF-clubs, en minder dan de 25 clubs die twee mensen kunnen
bedienen.

### 2. De prijsladder

Clubs kiezen hun grootte niet; ze hebben er één. Dus de ladder is niet "goed / beter / best" maar:
1. **Naar baangrootte** (9 / 18 / 27+), zie hierboven. De stap omhoog volgt het aantal leden en
   baliemedewerkers, wat clubs al kennen van de prijs per gebruiker bij Nexxchange.
2. **Uitbreidingen later, alleen als ze gebouwd zijn en gevraagd worden**: NGF-handicapkoppeling,
   automatische incasso, een koppeling met de kassa van de horeca (unTill), de ballenautomaat (Xafax).
   Elk daarvan is een reden voor de club om een ander systeem op te zeggen, dus prijs ze per
   uitbreiding, niet in de basis. Verkoop ze niet voordat ze bestaan.

### 3. Het openingsaanbod

**Greenside Founding Club**: de eerste tien clubs betalen de oprichtersprijs, twee jaar vast, zonder
migratiekosten, en krijgen de gratis pilot van drie maanden met schriftelijke succescriteria.
- **Einddatum:** de oprichtersprijs geldt voor clubs waarvan de pilot **vóór 1 juli 2027** start, of tot
  er tien clubs getekend hebben, wat het eerst komt. Kies de datum zelf, maar zet een echte datum op
  papier en houd je eraan.
- **Na twee jaar** gaat de club naar de dan geldende normale prijs. Zet dat in het contract, zodat de
  oprichtersprijs een echte, gedateerde afspraak is en geen "van-voor"-prijs.
- De normale prijzen hierboven zijn wat club 11 en verder echt betaalt, dus de vergelijking is eerlijk.

### 4. Wat te testen met echte kopers

Gesimuleerde antwoorden zijn niet genoeg. Test bij echte clubbesturen, te beginnen met de contacten van
Zwolle en de E-Golf4U-clubs die toch moeten overstappen:
1. **18 holes: € 399 tegenover € 449 oprichtersprijs.** De helft van de gesprekken krijgt het ene
   prijsblad, de andere helft het andere (om en om, niet zelf kiezen). Meet hoeveel om een pilot vragen
   of een intentieverklaring tekenen. Als € 449 even goed werkt, is de oprichterskorting niet nodig.
2. **9 holes: € 149 tegenover € 179 oprichtersprijs**, op dezelfde manier. € 149 ligt op hun punt waar
   "koopje" = "duur" (€ 151); test of het de vrijwilligersclubs opent.
3. Vraag elk bestuur **wat het nu aan de huidige leverancier betaalt** (licentie, per gebruiker,
   uitbreidingen). Dat getal bepaalt "vervangt, komt er niet bij", en niemand publiceert het.

### 5. De prijsbezwaren uit het panel (letterlijk, voor marketing; vertaald)

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

### Bijlage: prijscurves (Van Westendorp) per baangrootte

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
| Oude normale prijs | € 249 (op de grens) | € 449 (binnen) | € 599 (binnen) |

## Het aanbod

Methode: het Aanbodperspectief van de board, een samenvatting van een gepubliceerd raamwerk, toegepast
op wat de board, het concurrentieoverzicht en het kooppanel vonden. Toen dit aanbod werd gemaakt waren
er nog geen CFO-cijfers, dus elke kostenscore hieronder is een **schatting**; de kosten zijn later
doorgerekend in De cijfers.

### 1. De lijst met problemen (in de woorden van de koper)

Bronnen: kooppanel ronde 1 (20 van de 20 kochten niet), board, concurrentieoverzicht.

Vóór het kopen
1. "Er is nog geen club live, zelfs Zwolle niet: waar zijn de referenties?" (panel, 15 × vertrouwen)
2. "Twee oprichters: wat gebeurt er met onze leden, facturen en starttijden als zij stoppen?" (panel,
   bijna allemaal)
3. "Ik kan geen onbewezen leverancier aan de ledenvergadering (ALV) voorleggen." (panel)
4. "We zijn net van E-Golf4U af; de vrijwilligers kunnen niet nog een overstap aan." (panel, 3 × timing)
5. "Ons huidige systeem werkt goed genoeg en de leverancier kent ons." (panel, 2 × gewoonte)
6. "Betalen we dubbel: het oude systeem en Greenside naast elkaar?" (panel)
7. "€ 249 per maand is veel voor een 9-holes vrijwilligersclub." (prijsantwoorden: 9 holes vindt € 225
   duur)
8. "Plus migratiekosten van € 750–1.500 erbovenop." (panel)
9. "Werkt het met de NGF-handicap en onze automatische incasso?" (panel)
10. "GOLF.NL is gratis en boekt al starttijden en neemt betalingen aan." (panel, concurrenten)
11. "Niets in het aanbod zegt dat het meer omzet oplevert." (panel P012, P020)
12. "De begroting voor volgend jaar wordt in de voorjaarsvergadering vastgesteld." (panel)

Tijdens de overstap
13. "550–1.350 leden, onze facturen en starttijden overzetten is een project, niet minder werk." (panel)
14. "Leden boven de 60 installeren geen nieuwe app en loggen niet in met codes per e-mail." (panel)
15. "Als de helft van de leden de secretaris belt om te boeken, zijn we slechter af." (panel P017)
16. "Wie helpt een lid als een inlogcode op zaterdagochtend niet aankomt?" (board)
17. "Een mislukte import of een iDEAL-probleem zet de hele vereniging aan mijn bureau." (panel P020)
18. "Leden raken hun vriendengroepen voor het boeken kwijt" (klacht bij een concurrent, De Kroonprins).

Daarna
19. "Blijft het bestaan, of is dit een hobbyproject?" (panel, board)
20. "Kunnen we weg, met onze gegevens, zonder boete?" (panel)
21. "Hoe weten we dat het zichzelf terugverdient?" (board: de waarde is een ongemeten schatting)
22. "Wat vertellen we de ledenvergadering na een jaar?" (panel)

### 2. Oplossingen, gescoord

Waarde voor de koper 1–5 (naar hoe vaak het panel het noemde). Kosten om te leveren 1–5 (schatting,
vooral tijd van de oprichters).

| # | Oplossing | Lost op | Waarde | Kosten | Houden? |
| --- | --- | --- | ---: | ---: | --- |
| A | **Pilot naast het huidige systeem**: 3 maanden voor het bestuur en een groep leden; er wordt niets opgezegd tot het werkt | 4, 6, 13, 3 | 5 | 2 | ✔ kern |
| B | **Succes vooraf op papier** (bv. 40% van de leden actief); niet gehaald = stoppen | 1, 21, 22, 3 | 5 | 1 | ✔ garantie |
| C | **Stoppen na de pilot en niets betalen** (geen licentie, geen migratiekosten) | 1, 8, 20 | 5 | 3 (onbetaalde tijd als een club stopt) | ✔ garantie |
| D | **Datagarantie in het contract**: export van alle leden, facturen en boekingen op elk moment; 12 maanden opzegtermijn en volledige overdracht als Greenside stopt | 2, 19, 20 | 5 | 2 (volledige export nog te bouwen) | ✔ bonus |
| E | **Wij doen de migratie en de lancering bij de leden**: import, uitnodigingen, papieren handleiding voor oudere leden | 13, 14, 17 | 4 | 2 | ✔ bonus |
| F | **Hulplijn in de eerste vier weken, ook op zaterdagochtend** | 15, 16, 17 | 4 | 3 (tijd van de oprichters in het weekend) | ✔ bonus |
| G | **Referentiegesprek met het bestuur van Zwolle** vóór de beslissing, zodra Zwolle live is | 1, 3 | 5 | 1 | ✔ (pas waar als Zwolle live is) |
| H | **Oprichtersprijs 9 holes € 179** (was € 249) | 7 | 4 | 2 (minder omzet) | ✔ testen; Prijzen beslist |
| I | **Geen migratiekosten voor oprichtersclubs** | 8 | 3 | 2 | ✔ |
| J | Broncode-escrow bij een derde partij | 2, 19 | 4 | 4 (jaarlijkse kosten, onbekend) | ✘ voorlopig: D dekt het meeste; later met de CFO bekijken |
| K | NGF-handicapkoppeling en automatische incasso in het product | 9 | 4 | 5 (niet gebouwd; incasso is uit de pilot gehaald) | ✘ niet beloven; productbesluit |
| L | Omzetgarantie ("verdient de licentie terug of we betalen terug") | 11, 21 | 4 | 4 (hoe vaak er een beroep op wordt gedaan is onbekend) | ✘ tot de CFO het doorrekent; B is de veilige versie |
| M | Alleen als ledenapp bovenop het oude systeem | 6, 13 | 4 | 5 (koppelingen nodig) | ✘ nu niet te leveren |

**Moet bestaan vóór de eerste verkoop:** volledige data-export (leden bestaat; facturen en boekingen nog
te bouwen), een contract met de clausules B, C en D, de papieren ledenhandleiding en een afspraak voor
de hulplijn.

### 3. Het pakket

- **Naam:** *Greenside Founding Club*
- **De kern:** de eigen app van uw club in de stores, beheerd vanuit één plek, drie maanden uitgeprobeerd
  naast uw huidige systeem voordat er iets verandert (A).
- **De garantie:** succescriteria vooraf op papier; worden ze niet gehaald, of wilt u gewoon stoppen, dan
  betaalt u niets (B + C).
- **Bonussen:**
  1. *Uw gegevens blijven van u*: altijd te exporteren; 12 maanden opzegtermijn en volledige overdracht
     als Greenside stopt (D). Neemt bezwaar 2 weg.
  2. *Wij doen het werk*: import, uitnodigingen, een papieren handleiding voor oudere leden (E). Neemt
     13 en 14 weg.
  3. *Hulplijn op zaterdagochtend* in de eerste vier weken (F). Neemt 15–17 weg.
- **Urgentie en schaarste (echt):** tien oprichtersclubs tegen de oprichtersprijs, twee jaar vast, geen
  migratiekosten (H, I). De andere echte urgentie komt van buiten: E-Golf4U stopt, dus veel clubs moeten
  nu kiezen.
- **Bewijs:** een gesprek met het bestuur van Zwolle zodra Zwolle live is (G). Niet eerder; de pitch zegt
  dat ook.

### 4. Waardevergelijking (1–10, voor → na)

| | Voor (pitch v1) | Na (Founding Club) | Wat het verschuift |
| --- | ---: | ---: | --- |
| Gewenste uitkomst | 5 | 6 | Succes samen met de club bepaald; nog geen bewijs van omzet |
| Ervaren kans dat het lukt | 2 | 4 | Succescriteria op papier, datagarantie, Zwolle als referentie *later*. Blijft laag tot Zwolle live is |
| Tijd tot resultaat | 4 | 5 | Pilot naast het oude systeem, geen alles-in-één-keer-overstap |
| Moeite en opoffering (lager = beter, gescoord als verlichting) | 3 | 6 | Wij doen de migratie, papieren handleiding, hulplijn, gratis stoppen |

De zwakste score blijft **de kans dat het lukt**: geen aanbod vervangt een club die al live draait.

### 5. Hertest

Dezelfde 20 gesimuleerde beslissers (seed 682799), nieuwe pitch (Founding Club; de oude pitch is
bewaard). Resultaten in `founder/panel-v2/`.

**Uitkomst: 0 kopen · 20 niet, voor en na.** Het nieuwe aanbod veranderde de koopbereidheid niet.
Taalmodellen zijn eerder te meegaand dan te streng, dus een 0 is hier een sterk signaal, geen ruis.

| | Pitch v1 | Founding Club (v2) |
| --- | ---: | ---: |
| Kopen | 0 / 20 | 0 / 20 |
| Reden: vertrouwen | 15 | 11 |
| Reden: timing | 3 | 6 |
| Reden: gewoonte | 2 | 3 |

Wat verschoof (geteld over de 20 antwoorden)
- **Zorgen over data en continuïteit namen af:** export of escrow gevraagd in 10 antwoorden ervoor, 3
  erna. Bonus D werkt op papier; kopers noemen het nu "papieren zekerheden" maar vragen er niet meer om.
- **Vertrouwen werd timing:** vier kopers gingen van "ik vertrouw het niet" naar "niet nu / volgende
  begrotingsronde / als ons contract afloopt". Het aanbod maakte Greenside geloofwaardig voor later, niet
  voor nu.
- **Zwolle is het hele verhaal:** 10 antwoorden noemden Zwolle ervoor, **19 van de 20** erna. Bijna
  elk "wat zou u overtuigen" is: *Zwolle een seizoen live, hun bestuur aan de telefoon, oudere leden die
  het echt gebruiken.*

Wat niet verschoof, of slechter werd
- **Dubbel werk tijdens de pilot:** 2 antwoorden ervoor, 9 erna. "Pilot naast het huidige systeem" leest
  als twee systemen en extra werk voor vrijwilligers, niet als veiligheid.
- **Kosten bovenop de huidige leverancier:** beide keren 7. Penningmeesters willen zien dat Greenside
  een rekening *vervangt*, niet toevoegt.
- **NGF-handicap en automatische incasso:** nog steeds een eis (5 en 3 antwoorden). Niet beloofd (K).
- **Twee oprichters:** nog steeds in bijna elk antwoord; geen onderdeel van het aanbod lost dat op.
- **Prijs 9 holes:** de mediaan voor "wordt duur" daalde van € 225 naar € 200, "te duur" € 300; de
  oprichtersprijs van € 179 zit er net onder. 18 holes: € 399 valt binnen de bandbreedte (mediaan koopje
  € 250, duur € 550). 27+ holes: ongewijzigd (duur € 650).

Conclusie: het probleem is niet het aanbod maar **bewijs**. Geen pakket vervangt een club die al live
draait. Wat te veranderen:
1. Eerst Zwolle live en gemeten krijgen (de voorwaarde van de board); alle andere verkoop wacht daarop.
2. De pilot anders brengen als "wij doen het, uw vrijwilligers niet" en laten zien welke huidige kosten
   het vervangt (een vergelijking van de softwarerekening van de club), in plaats van "naast uw systeem".
3. Een besluit nemen over NGF-handicap en automatische incasso (product), want die blokkeren "vervangen".
4. Prijsvragen gaan naar Prijzen; de kosten van de garantie en de support naar De cijfers.

Dit zijn gesimuleerde kopers: gebruik de bezwaren, niet de aantallen, en toets het bij echte
clubbesturen.

## De cijfers

**Lees dit eerst.** Alle bedragen zijn in **euro, excl. 21% btw**. Eén eenheid = één betalende club
gedurende één maand; "tegelijk" betekent **clubs die op hetzelfde moment betalen**. Invoer:
`founder/numbers.json` (oprichters onbetaald, de situatie nu) en `founder/numbers-met-salaris.json`
(hetzelfde, plus € 2.500 per maand voor elke oprichter, hun eigen doel). Prijzen uit Prijzen; kosten
gecontroleerd bij Operatie. Bronnen en schattingen: `founder/cfo-sources.md`. Geen financieel, fiscaal
of juridisch advies: laat een boekhouder de rechtsvorm, loonkosten en btw controleren voordat er geld
uitgaat.

### De toelichting van de CFO

**De marge.** Elke betalende club laat **€ 318,50 per maand** (88%) over bij de gemiddelde
oprichtersprijs van € 364 (€ 179 / € 399 / € 499 naar baangrootte), na overstap, gratis pilot en
stopgarantie (€ 35) en hosting (€ 10). De club betaalt zelf zijn Apple-ontwikkelaarsaccount (Apple wil
de app op naam van de club). De vaste kosten zonder salaris zijn **€ 398 per maand**, dus **2 betalende
clubs dekken ze**. De software is goedkoop in gebruik; daar zit het probleem niet.

**De regel om in de gaten te houden: salaris voor de oprichters.** Met € 2.500 elk worden de vaste
kosten € 5.398 per maand. De break-even wordt dan **17 clubs tegen de oprichtersprijs, 15 tegen de
normale prijs**. Alleen tien clubs krijgen de oprichtersprijs, dus het echte aantal is **10
oprichtersclubs + 6 normale = 16 clubs** (6% van de 263 NGF-clubs, en binnen de ~25 die twee mensen
kunnen bedienen). Elke andere wat-als verschuift jaar 1 met een paar honderd euro; het salaris met
€ 60.000.

**De groei is de tweede regel.** Jaar 1 gaat ervan uit dat Zwolle in maand 1–3 een gratis pilot draait
en vanaf maand 4 betaalt, en dat de volgende clubs pas tekenen als Zwolle bewijs heeft (maand 11: 2,
maand 12: 3). Het panel ondersteunt dat: 0 van de 20 kopen nu en 19 van de 20 wachten op Zwolle. Bij die
groei levert jaar 1 **€ 4.368** op. Zelfs snellere groei (5 clubs in maand 12) geeft maar € 7.280.

**Geld.**
- Oprichters onbetaald: je hebt **€ 12.174** nodig tot het zichzelf betaalt, vooral de startkosten van
  € 10.423 (beveiligingstest € 7.500, jurist € 2.500). Bedrijfsresultaat jaar 1: **€ -954**.
- Oprichters vanaf maand 1 € 2.500 elk: je hebt in jaar 1 **€ 71.377** nodig, en bij 3 clubs verlies je
  nog steeds ongeveer € 4.400 per maand.
- De middenweg: **het salaris groeit mee met de clubs.** Alles boven € 398 per maand gaat naar de
  oprichters. Bij 3 clubs is dat ongeveer € 560 per maand voor jullie samen; het volle salaris van
  € 2.500 elk komt bij ongeveer 16 clubs. Bij deze groei is dat jaar 2 à 3, en daarvoor zijn
  spaargeld, parttime werk of extern geld nodig als overbrugging.

**Drie manieren om de marge te verbeteren** (wat-als-berekeningen; onbetaald / € 2.500 elk):
1. **Zwolle betaalt vanaf maand 1** in plaats van na een gratis pilot (het is de referentieclub, geen
   prospect): jaar 1 € -954 → **€ +2**.
2. **Expo Starter (USD 19) in plaats van Production (USD 99) zolang er weinig apps zijn**: vaste kosten
   –€ 72; jaar 1 € -954 → **€ -90**.
3. **Normale prijs voor elke club na de eerste tien** (gemiddeld € 416,50): break-even met salaris
   17 → **15 clubs**; jaar 1 € -954 → € -324 als het vanaf het begin gold.
Minder clubs die na de gratis pilot stoppen (1 op 10 in plaats van 1 op 3) maakt minder uit nu de
overstap goedkoper is: jaar 1 € -954 → € -846.

**De geldvoorwaarden van de board:**
- *Kosten om één club te winnen, kosten om één club te bedienen, clubs voor de break-even:* **beantwoord,
  als schatting.** Een club winnen kost ongeveer € 560 contant (papieren handleiding ~€ 300, reiskosten
  ~€ 200, drie maanden gratis draaien) plus ~40 uur van de oprichters; als 1 op de 3 pilots stopt is
  dat ~€ 830 per betalende club. Eén club bedienen kost ~€ 11 per maand contant. Break-even: 2 clubs
  onbetaald, 16 met € 2.500 elk.
- *Een garantie die het bedrijf kan betalen:* **gehaald voor de stopgarantie** (zit in de € 35). De
  omzetgarantie (L in Het aanbod) blijft uit: er zijn geen gegevens over hoe vaak er een beroep op
  gedaan wordt.
- *Minstens 3 oprichtersclubs getekend voordat er verder gebouwd wordt:* **niet gehaald**; bij deze groei
  op zijn vroegst in maand 12.

**Oordeel.** Elke club is winstgevend en de vaste kosten zijn klein, maar **€ 2.500 elk vraagt ~16
clubs**, en clubs wachten eerst op Zwolle. Reken op 1,5 tot 3 jaar voordat het volle salaris er is, en
beslis nu hoe je dat overbrugt (spaargeld, parttime, een lening of extern geld na het seizoen van
Zwolle).

---

### Scenario A: oprichters onbetaald (nu)


#### Eén club per maand

| regel | per club per maand |
| --- | ---: |
| Prijs | € 364,00 |
| Overstap, gratis pilot en stopgarantie, verdeeld over de oprichtersperiode van 24 maanden (schatting, bijgewerkt bij Operatie: papieren handleiding ~€ 300) | € -35,00 |
| Hostingaandeel per club: groei database, e-mail boven de bundel, app-builds (schatting) | € -10,00 |
| Apple-ontwikkelaarsaccount: € 0 voor Greenside, de club meldt zich zelf aan (Apple-richtlijn 4.2.6; zie Operatie) | € -0,00 |
| Licentie innen via SEPA-incasso (schatting) | € -0,50 |
| **Bijdrage** (wat elke club per maand overlaat voor de vaste kosten) | **€ 318,50** (88%) |

#### De marge die telt

Vaste kosten: **€ 398 per maand**:

- Salaris oprichters (nu geen: onbetaald; zie scenario B): € 0
- Expo EAS Production, USD 99 (openbare prijs): € 89
- Supabase Pro + Small compute + testproject, ~USD 40 (openbare prijs): € 36
- Vercel Pro, 1 gebruiker, USD 20 (openbare prijs): € 18
- Resend Pro, 50.000 e-mails, USD 20 (openbare prijs): € 18
- Boekhouder en boekhouding (schatting): € 100
- Beroepsaansprakelijkheid (~€ 61 indicatie) en cyberverzekering (schatting): € 100
- E-mailaccounts voor 2 oprichters (schatting): € 14
- Telefoonnummer hulplijn (schatting): € 15
- Eigen Apple-ontwikkelaarsaccount van Greenside, € 99 per jaar (openbare prijs): € 8

- **Break-even: 2 betalende clubs tegelijk.** Daaronder verlies je elke maand geld.
- **Winstmarge bij het plan** (10 clubs tegelijk): **77%** van elke verkoop, na alle kosten.
- Capaciteit: 25 clubs tegelijk.

#### Jaar 1, per maand

| maand | betalende clubs | omzet | resultaat | cumulatief (na € 10.423 startkosten) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | € 0 | € -398 | € -10.821 |
| 2 | 0 | € 0 | € -398 | € -11.219 |
| 3 | 0 | € 0 | € -398 | € -11.617 |
| 4 | 1 | € 364 | € -80 | € -11.696 |
| 5 | 1 | € 364 | € -80 | € -11.776 |
| 6 | 1 | € 364 | € -80 | € -11.856 |
| 7 | 1 | € 364 | € -80 | € -11.935 |
| 8 | 1 | € 364 | € -80 | € -12.014 |
| 9 | 1 | € 364 | € -80 | € -12.094 |
| 10 | 1 | € 364 | € -80 | € -12.174 |
| 11 | 2 | € 728 | € 239 | € -11.934 |
| 12 | 3 | € 1.092 | € 558 | € -11.377 |

- **Bedrijfsresultaat jaar 1: € -954** op € 4.368 omzet.
- Na de startkosten van € 10.423: € -11.377.
- Startkosten terugverdiend: niet binnen jaar 1.
- Geld dat je nodig hebt tot het zichzelf betaalt: **€ 12.174**.

#### Wat als

| scenario | marge bij het plan | break-even (clubs) | resultaat jaar 1 |
| --- | ---: | ---: | ---: |
| Basisplan | 77% | 2 | € -954 |
| Prijs -10% | 74% | 2 | € -1.391 |
| Volume -20% | 74% | 2 | € -1.718 |
| Kosten per club +15% | 75% | 2 | € -1.036 |

#### Waarschuwingen

- Jaar 1 maakt verlies op de bedrijfsvoering (€ -954).
- De startkosten worden niet binnen jaar 1 terugverdiend.

---

### Scenario B: oprichters krijgen elk € 2.500 per maand


#### Eén club per maand

| regel | per club per maand |
| --- | ---: |
| Prijs | € 364,00 |
| Overstap, gratis pilot en stopgarantie, verdeeld over de oprichtersperiode van 24 maanden (schatting, bijgewerkt bij Operatie: papieren handleiding ~€ 300) | € -35,00 |
| Hostingaandeel per club: groei database, e-mail boven de bundel, app-builds (schatting) | € -10,00 |
| Apple-ontwikkelaarsaccount: € 0 voor Greenside, de club meldt zich zelf aan (Apple-richtlijn 4.2.6; zie Operatie) | € -0,00 |
| Licentie innen via SEPA-incasso (schatting) | € -0,50 |
| **Bijdrage** (wat elke club per maand overlaat voor de vaste kosten) | **€ 318,50** (88%) |

#### De marge die telt

Vaste kosten: **€ 5.398 per maand**:

- Salaris oprichters: 2 × € 2.500 per maand (doel van de oprichters; wat het het bedrijf kost hangt af van de rechtsvorm, vraag de boekhouder): € 5.000
- Expo EAS Production, USD 99 (openbare prijs): € 89
- Supabase Pro + Small compute + testproject, ~USD 40 (openbare prijs): € 36
- Vercel Pro, 1 gebruiker, USD 20 (openbare prijs): € 18
- Resend Pro, 50.000 e-mails, USD 20 (openbare prijs): € 18
- Boekhouder en boekhouding (schatting): € 100
- Beroepsaansprakelijkheid (~€ 61 indicatie) en cyberverzekering (schatting): € 100
- E-mailaccounts voor 2 oprichters (schatting): € 14
- Telefoonnummer hulplijn (schatting): € 15
- Eigen Apple-ontwikkelaarsaccount van Greenside, € 99 per jaar (openbare prijs): € 8

- **Break-even: 17 betalende clubs tegelijk.** Daaronder verlies je elke maand geld.
- **Winstmarge bij het plan** (10 clubs tegelijk): **-61%** van elke verkoop, na alle kosten.
- Capaciteit: 25 clubs tegelijk.

#### Jaar 1, per maand

| maand | betalende clubs | omzet | resultaat | cumulatief (na € 10.423 startkosten) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | € 0 | € -5.398 | € -15.821 |
| 2 | 0 | € 0 | € -5.398 | € -21.219 |
| 3 | 0 | € 0 | € -5.398 | € -26.617 |
| 4 | 1 | € 364 | € -5.080 | € -31.696 |
| 5 | 1 | € 364 | € -5.080 | € -36.776 |
| 6 | 1 | € 364 | € -5.080 | € -41.856 |
| 7 | 1 | € 364 | € -5.080 | € -46.935 |
| 8 | 1 | € 364 | € -5.080 | € -52.014 |
| 9 | 1 | € 364 | € -5.080 | € -57.094 |
| 10 | 1 | € 364 | € -5.080 | € -62.174 |
| 11 | 2 | € 728 | € -4.761 | € -66.934 |
| 12 | 3 | € 1.092 | € -4.442 | € -71.377 |

- **Bedrijfsresultaat jaar 1: € -60.954** op € 4.368 omzet.
- Na de startkosten van € 10.423: € -71.377.
- Startkosten terugverdiend: niet binnen jaar 1.
- Geld dat je nodig hebt tot het zichzelf betaalt: **€ 71.377**.

#### Wat als

| scenario | marge bij het plan | break-even (clubs) | resultaat jaar 1 |
| --- | ---: | ---: | ---: |
| Basisplan | -61% | 17 | € -60.954 |
| Prijs -10% | -79% | 20 | € -61.391 |
| Volume -20% | -98% | 17 | € -61.718 |
| Kosten per club +15% | -63% | 18 | € -61.036 |

#### Waarschuwingen

- Jaar 1 maakt verlies op de bedrijfsvoering (€ -60.954).
- De startkosten worden niet binnen jaar 1 terugverdiend.

## Marketing

Gebruikt bewijs: kooppanel ronde 1 en 2 (gesimuleerde kopers), concurrentieoverzicht, aanbod, prijzen en
de CFO-cijfers. Citaten uit het panel zijn **onderzoek**, nooit citaten van klanten: ze komen niet in
advertenties.

### 0. Wat het bewijs eerst zegt

- **Geen enkel segment koopt nog: 0 van 20, twee keer.** Er is dus geen "segment dat het meest koopt".
  Het dichtst daarbij komt de groep waarvoor de *timing* klopt: clubs die **nog op E-Golf4U zitten en nu
  een nieuw systeem moeten kiezen** (4 van 20). Eén van hen: "de timing klopt en de prijs is niet het
  probleem. Maar ik zet geen 950 leden ... op een tweemansbedrijf waarvan de eerste pilotclub nog niet
  eens live is" (P018).
- **19 van de 20 zeggen wat ze zou overtuigen: Zwolle live, en een gesprek met het bestuur daar.**
  Marketing vóór Zwolle live is kan dus alleen deuren openen en gesprekken opleveren. Het kan niet
  sluiten. De campagne hieronder begint als de leden van Zwolle de app krijgen.
- **Het publiek is klein en bekend**: 263 NGF-clubs, elk met een bestuur van 5–7 mensen en vaak een
  clubmanager. Dit is verkopen club voor club, geen massamarketing. Elke club heeft een naam, een adres
  en een datum voor de ledenvergadering.
- **Waar de marketing antwoord op moet geven** (meest genoemde bezwaren, ronde 2):
  1. twee oprichters, geen live club (bijna elk antwoord) → *bewijs*: Zwolle, datagarantie, contract
  2. dubbel werk tijdens de pilot (9 van 20) → *"wij doen het werk"*
  3. het komt bovenop wat we betalen (7 van 20) → *"vervangt, komt er niet bij"*
  4. oudere leden gebruiken geen app (meerdere) → *papieren handleiding, hulplijn op zaterdag, de cijfers
     van Zwolle*
  5. NGF-handicap en automatische incasso (5 en 3) → *eerlijk antwoorden: nog niet; zeg wat het in de
     plaats daarvan doet*

### 1. Positionering

Drie versies:

**A. De overstap van E-Golf4U (aanbevolen)**
> Voor clubbesturen die van E-Golf4U af moeten en "iets moeten kiezen dat het bestuur jarenlang kan
> verdedigen", is Greenside het clubsysteem met uw eigen app in de App Store waar wij u zelf naartoe
> verhuizen, voor ongeveer wat een clubsysteem nu kost, anders dan de webportalen die de meeste clubs
> krijgen.

Waarom: deze clubs moeten nu *iets* kopen, dus de vraag is niet "waarom overstappen" maar "waarom
jullie". Het gat in het concurrentieoverzicht is precies dit: de meeste Nederlandse leden krijgen een
webapp met instructies voor het beginscherm; de enige eigen clubapp (IkGaGolfen) scoort 1,9. Gesteund
door P001, P007, P018, P019 (allemaal "moet nu kiezen"; allemaal nee om vertrouwen, geen om prijs).

**B. Vrijwilligers voorop**
> Voor vrijwilligersbesturen van 9-holesclubs, die "niet nog een ronde uitleggen" aankunnen, is
> Greenside de clubsoftware waarbij wij de import, de uitnodigingen en de hulplijn op zaterdag doen,
> anders dan een systeem dat u zelf moet uitrollen.

Gesteund door de 9 antwoorden over "dubbel werk" en de 9-holesvrijwilligers (P008, P009, P013, P014,
P017). Maar 9-holesclubs leveren het minste op (€ 179–199) en zijn het meest overstapmoe (timing).

**C. Verdient geld voor de club**
> Voor commercieel geëxploiteerde clubs is Greenside de ledenapp die gastrondes, buggy's en extra's
> verkoopt zonder commissie, anders dan GOLF.NL, dat boekt maar niet van u is.

Gesteund door P012 en P020 ("niets hier levert mij meer op per lid"). Maar er is **nog geen bewijs van
omzet**: begin er niet mee voordat de cijfers van Zwolle er zijn.

**Kies A.** Gebruik de belofte van B ("wij doen het werk") als belangrijkste bewijspunt, en bewaar C tot
Zwolle een seizoen aan cijfers heeft.

### 2. Kanalen

| kanaal | waarom het bij deze kopers past | grove kosten (schatting) | hoe je weet dat het werkt |
| --- | --- | ---: | --- |
| **1. Persoonlijk benaderen** (brief + e-mail + telefoontje naar de voorzitter of clubmanager, daarna een bezoek) | 263 clubs, besluiten door een bestuur; besturen lezen post en nemen de telefoon op. Begin met clubs die nog op E-Golf4U zitten (vindbaar: veel publiceren instructies voor de E-Golf4U-webapp, bv. Semslanden, Holthuizen, Havelte, Ter Specke) en clubs binnen ~1 uur van Zwolle | € 1.000 voor 3 maanden (drukwerk, porto, reiskosten) | gesprekken per week; aanvragen voor een pilot |
| **2. De referentie Zwolle** (een clubbezoek, een kort verhaal met gemeten cijfers, een gesprek met het bestuur) | het enige waar 19 van de 20 om vragen | € 300 (koffie, een gedrukte one-pager) + de goodwill van Zwolle | prospects die Zwolle bellen; het bestuur van Zwolle na maand 3 nog steeds bereid |
| **3. LinkedIn, de eigen profielen van de oprichters** (eerst geen advertenties) | clubmanagers, penningmeesters en bestuursleden zitten er; goed voor "achter de schermen" en bewijs | € 0 (tijd); optioneel € 300 om 2–3 bewijsberichten te promoten bij clubmanagers in NL | reacties en connectieverzoeken van mensen uit clubs; afspraken via LinkedIn |
| *Eerst nagaan, dan misschien:* **NVG** (de brancheorganisatie van golfbanen, ~138 leden in 2019) en regionale bijeenkomsten van clubmanagers | waar betaalde clubmanagers elkaar zien | onbekend: vraag de NVG naar lidmaatschap en kosten van bijeenkomsten | een spreekbeurt of tafel op één bijeenkomst |

**Wat we nu niet doen, en waarom**
- **Betaald zoeken en betaalde social media**: bijna niemand zoekt in een maand op "golfclub software";
  de 263 kopers zijn bij naam te bereiken, dus advertenties verspillen geld.
- **Consumentenmarketing voor golfers** (Instagram, TikTok, influencers): golfers kopen niet; besturen
  wel.
- **Een stand op een beurs**: duur, en zonder live club is er niets te laten zien.
- **Beginnen met omzetclaims** ("verdient de licentie terug"): nog geen gegevens; een omzetclaim zonder
  bewijs is misleidende reclame.
- **Concurrenten noemen of beoordelen in advertenties** ("anders dan IntoGolf met 1,9"): vergelijkende
  reclame moet juist en eerlijk zijn; houd het voor persoonlijke gesprekken, met de bron, en alleen
  feiten.

### 3. De campagne van 30 dagen

**Lanceerdag L = de dag dat de leden van Zwolle de app krijgen.** Er staat nog geen datum vast; de
kalender gaat uit van **maandag 1 maart 2027** (begin van het seizoen, en besturen bereiden de
voorjaarsvergadering voor). Schuif alle data mee als L verschuift. **Vraag het bestuur van Zwolle
schriftelijk om toestemming** voordat je hun naam, logo of cijfers ergens gebruikt: het is een echte
club, geen decor.

Het aanbod de hele periode: **Greenside Founding Club** (Prijzen): tien clubs, oprichtersprijs € 179 /
€ 399 / € 499 twee jaar vast, geen migratiekosten, gratis pilot van drie maanden met schriftelijke
succescriteria; **voor pilots die vóór 1 juli 2027 starten**. Zeg alleen "tien plaatsen" zolang het
waar is, en noem het aantal dat nog over is alleen als exact getal.

| datum | kanaal | wat er uitgaat | boodschap |
| --- | --- | --- | --- |
| **ma 15 feb** (L−14) | — | Lijst maken: 40 clubs (alle bereikbare E-Golf4U-clubs + 9/18-holesclubs binnen een uur van Zwolle). Naam, voorzitter, clubmanager, systeem, datum ledenvergadering | — |
| di 16 feb | — | Brief en one-pager schrijven (aanbod, contractclausules, "wij doen het werk") | haak 1 |
| wo 17 feb | LinkedIn | Bericht: waarom we een app op naam van de club bouwen (achter de schermen, schermen van de Greenside-basis, niet van Zwolle) | haak 6 |
| do 18 feb | Zwolle | Met het bestuur van Zwolle afspreken: referentiegesprekken toegestaan? welke cijfers mogen na 4 en 12 weken gedeeld worden? | — |
| vr 19 feb | — | Ledenhandleiding drukken; hulplijn op zaterdag voorbereiden | — |
| ma 22 feb (L−7) | Post | Brieven naar de eerste 20 clubs: "Uw overstap van E-Golf4U, voor u gedaan" + one-pager | haak 1 |
| di 23 feb | LinkedIn | Bericht: de contractclausules in gewone woorden (altijd exporteren, 12 maanden opzegtermijn) | haak 3 |
| wo 24 feb | E-mail | Dezelfde brief per e-mail naar dezelfde 20, op naam van voorzitter of manager | haak 1 |
| do 25 feb | LinkedIn | Bericht: "wat een lid van boven de 70 ziet": de papieren handleiding, pagina voor pagina | haak 5 |
| vr 26 feb | — | Zwolle: uitnodigingen klaar, hulplijn bemand | — |
| **ma 1 mrt (L)** | Zwolle | **De leden van Zwolle krijgen de app.** Vandaag geen campagne naar buiten: alle aandacht naar Zwolle | — |
| di 2 mrt | LinkedIn | Bericht: lanceerdag, wat we deden (import, uitnodigingen, hulplijn), nog geen cijfers | haak 7 |
| wo 3 mrt | Telefoon | De 20 clubs bellen die de brief kregen: "Mag ik het u in 20 minuten laten zien?" | haak 2 |
| do 4 mrt | Telefoon | Verder bellen; bezoeken inplannen | haak 4 |
| vr 5 mrt | Post | Brieven naar de volgende 20 clubs | haak 1 |
| za 6 mrt | Zwolle | Hulplijn op zaterdag; elke vraag noteren (inhoud voor later) | — |
| ma 8 mrt (L+7) | LinkedIn | Bericht: week 1 bij Zwolle, *alleen* cijfers die Zwolle goedkeurde (bv. uitgenodigde leden, actieve leden) | haak 8 |
| di 9 mrt | Bezoek | Eerste clubbezoeken: demo van 20 minuten met de eigen gegevens van de club (een CSV-export die ze sturen) | haak 2 |
| wo 10 mrt | E-mail | Volgende 20 clubs per e-mail | haak 1 |
| do 11 mrt | Telefoon | De tweede 20 bellen | haak 9 |
| vr 12 mrt | LinkedIn | Bericht: de vijf vragen die leden in week 1 het vaakst stelden, en onze antwoorden | haak 5 |
| za 13 mrt | Zwolle | Hulplijn op zaterdag | — |
| ma 15 mrt (L+14) | LinkedIn | Bericht: "wij doen het werk": wat de vrijwilligers bij Zwolle *niet* hoefden te doen | haak 2 |
| di 16 mrt | Bezoek | Clubbezoeken; een gesprek met het bestuur van Zwolle aanbieden (alleen als Zwolle akkoord gaf) | haak 10 |
| wo 17 mrt (L+16) | — | Evaluatie: gesprekken, pilotaanvragen, gebruik bij Zwolle. Besluiten wat er moet veranderen (hoofdstuk 5) | — |

**Tien haken** (elk beantwoordt één bezwaar)

1. Kop van de brief: **"Weg van E-Golf4U? Wij verhuizen uw club. U hoeft niets over te typen."** (moeite
   van de overstap)
2. Openingszin aan de telefoon: **"Uw vrijwilligers doen niets: wij importeren, nodigen uit en nemen de
   telefoon op."** (dubbel werk)
3. Kop op LinkedIn: **"Uw ledenlijst is van u. Dat staat in ons contract, niet in een folder."** (data,
   twee oprichters)
4. Regel op de one-pager: **"Stop na drie maanden, betaal niets."** (risico)
5. Opening van een bericht: **"Zo ziet een lid van 74 de app: papieren handleiding, één code per mail,
   klaar."** (oudere leden)
6. Opening van een bericht: **"Uw club in de App Store, met uw eigen naam. Geen snelkoppeling op het
   startscherm."** (gat tegenover webapps)
7. Opening van een bericht: **"Vandaag kregen de leden hun eigen clubapp. Wat er vooraf gebeurde, zie je
   niet."** (achter de schermen)
8. Kop van een bericht (alleen met goedkeuring van Zwolle en echte cijfers): **"Week 1: [x] leden
   actief. Zonder één extra uur van het secretariaat."** (bewijs)
9. Openingszin voor penningmeesters: **"Vervangt uw systeem, komt er niet bij. Wat betaalt u nu per
   maand?"** (kosten erbovenop)
10. Afsluiting van een bezoek: **"Bel het bestuur van Zwolle voordat u beslist."** (geen live club) —
    alleen als Zwolle akkoord is.

**Als er niets nieuws te melden is:** een vraag van een lid aan de zaterdaghulplijn en het antwoord; een
scherm van het clubbeheer ("mission control") in één zin uitgelegd; hoe de import werkt, stap voor
stap; wat het contract zegt, clausule voor clausule; waarom er geen commissie is.

### 4. Budget

Eerste drie maanden, schattingen (nog geen offertes):

| post | € |
| --- | ---: |
| Brieven en one-pagers, 60 clubs, gedrukt en verstuurd | 300 |
| Reiskosten voor ~15 clubbezoeken | 700 |
| Referentie Zwolle: gedrukt verhaal op één pagina, koffie bij een clubbezoek | 300 |
| LinkedIn-promotie van 2–3 bewijsberichten (optioneel, na week 2) | 300 |
| NVG: nog na te gaan | ? |
| **Totaal** | **€ 1.600** + NVG |

**Het meeste dat je mag uitgeven om één club te winnen.** Volgens de CFO laat een oprichtersclub
**€ 318,50 per maand** over, 24 maanden vast → **€ 7.644** over de oprichtersperiode, na zijn eigen
kosten voor draaien, overstap en pilot. De koopbereidheid in het panel is 0%, dus het geeft geen
conversie; de grens komt daarom uit de kas. Twee regels:
- **Geef maximaal 3 maanden bijdrage uit, ongeveer € 955 contant per gewonnen club**, zodat een club
  zijn eigen werving in het eerste kwartaal na de pilot terugbetaalt.
- **Geef nooit meer uit dan je hebt**: met onbetaalde oprichters is de totale geldbehoefte ongeveer
  € 12.200 (De cijfers); deze campagne voegt € 1.600 toe.
De echte kosten zitten in de tijd van de oprichters: ~40 uur overstapwerk per club, plus verkopen.

### 5. Drie cijfers om wekelijks te volgen

| cijfer | doel | iets veranderen als |
| --- | --- | --- |
| **Geboekte gesprekken** (demo of bezoek van 20 minuten met een bestuurslid of manager) | 3 per week | twee weken lang onder 2 per week → brief herschrijven, eerst bellen, Zwolle om een introductie vragen |
| **Actieve leden bij Zwolle** (die week ingelogd ÷ leden) | 40% in week 12 (het succescriterium uit het aanbod) | onder 20% in week 4 → stoppen met benaderen, eerst het gebruik bij Zwolle oplossen; zonder dat verkoopt niets |
| **Pilotaanvragen / intentieverklaringen** | 3 vóór L+90 (de voorwaarde "3 oprichtersclubs" van de board) | 0 na 10 gesprekken → het aanbod of de timing klopt niet: vraag elke "nee" waarom, in hun woorden, en ga terug naar Het aanbod |

### Regels voor alles hierboven

- Geen nepreviews, testimonials, volgersaantallen of "bekend van". Geen cijfers over Zwolle die Zwolle
  niet goedkeurde.
- Citaten uit het panel zijn onderzoek, nooit citaten van klanten.
- Maak elke betaalde samenwerking bekend. Claims over besparing of omzet alleen met echte gegevens
  erachter. Geen juridisch advies.

## Merk

Gebruikte brief: Marketing (positionering A: de overstap van E-Golf4U, "wij doen het werk"),
concurrentieoverzicht, aanbod, kooppanel ronde 1 en 2.

**Vertrekpunt.** Greenside heeft al een naam en een uitstraling in het product: het Greenside-thema
(dennengroen, messing en krijtwit, Fraunces en Manrope) in `packages/shared/src/brand.ts`, vastgelegd als
`pilot-v1`. Deze stap verandert die waarden niet; een test bewaakt ze. Nieuw is: kan de naam veilig
blijven, hoe klinkt het bedrijf, en de brief voor wat nog niet bestaat (een logo, de brief, de website).

**Wie het merk Greenside ziet.** Niet de leden: zij zien de eigen app, naam en kleuren van hun club. Het
merk van Greenside is voor **clubbesturen, clubmanagers en penningmeesters**, die het tegenkomen op een
brief, een one-pager, een contract, LinkedIn en de schermen van het clubbeheer. Het moet
*betrouwbaar* uitstralen, niet *startup*. De grootste twijfel in het panel is "twee oprichters, zijn ze
er straks nog?"; het merk mag dat niet erger maken.

### 1. Naam

#### Tien kandidaten

| # | naam | stijl | wat het zegt | hardop / op een icoon | risico |
| --- | --- | --- | --- | --- | --- |
| 1 | **Greenside** (huidig) | beeldend golfwoord | "naast de green": dicht bij het spel, bij de club | makkelijk in Nederlands en Engels; "G"-monogram werkt op 32 px | een gewoon golfwoord, dus **zwak als merk**; er bestaat een Amerikaanse swing-app **Greenside AI** (zie onder) |
| 2 | Clubhuis | beschrijvend, Nederlands | het thuis van de club | warm, heel Nederlands | algemeen woord: niet te registreren; ook een tabblad in de app |
| 3 | Vlaggestok | beeldend, Nederlands | de vlag op de green: waar elke ronde eindigt | goed te onthouden, wat lang; vlagicoon is makkelijk | lastig voor niet-Nederlanders; vlaggen zijn een golfcliché |
| 4 | Marker | golfterm | degene die je scorekaart controleert: vertrouwen | kort, sterk | gewoon woord; veel "Marker"-merken |
| 5 | Golvo | verzonnen | nog niets, dus het kan betekenen wat jij ervan maakt | kort, klinkt als een product | zegt een bestuur niets; moet uitgelegd worden |
| 6 | Baanboek | beschrijvend, Nederlands | het boek van de club: starttijden, leden, facturen | duidelijk | algemeen; klinkt als een papieren agenda |
| 7 | Ledenhuis | beschrijvend, Nederlands | thuis voor leden | duidelijk | algemeen; klinkt als een woningcorporatie |
| 8 | *[achternaam oprichters] & Co* | naam van de oprichters | mensen die je kunt bellen: antwoord op "wie zijn ze?" | hangt af van de naam | bindt het bedrijf aan twee mensen, en dat is precies de twijfel |
| 9 | Veldzicht | plaatsachtig | uitzicht over de baan, als een Nederlandse landgoednaam | klinkt als een golfclub | veel plaatsen en bedrijven heten zo; verwarring met clubs |
| 10 | Teeline | verzonnen golfmix | tee + line: de startlijst | makkelijk | lijkt op "TeeControl" en "TeeQuest" (concurrenten): verwarring |

#### Korte lijst: Greenside, Vlaggestok, Golvo

**Advies: houd Greenside, na de controles hieronder.** Het product, de code, de demo, het reviewaccount en
het pilotmateriaal dragen de naam al; leden zien hem nooit; en hij klinkt gevestigd, wat besturen nodig
hebben. Verander hem alleen als de merkcontrole een blokkerend merk vindt in de EU of de Benelux voor
software (klassen 9 en 42).

#### Wat ik kon nagaan (alleen openbare zoekopdrachten)

- **Greenside AI** ([App Store](https://apps.apple.com/us/app/id6469555833)): een Amerikaanse
  swinganalyse-app voor golfers (uitgever Greenside AI, Inc., site greenside.ai), 4,9 sterren. Zelfde
  woord, zelfde sport, software in de App Store. Andere koper (golfers, geen clubs) en een andere markt,
  maar het is het grootste verwarringsrisico, en een reden om altijd **"Greenside Clubsoftware"** te
  zeggen of de naam met het logo te combineren, niet het losse woord.
- Ander gebruik gevonden: een golfrestaurant "Greenside" in Bad Saarow (Duitsland); een
  golfsimulatorlocatie "Greenside Golf" in Cannock (VK); een 9-holesbaan "Greenside Colliery" in
  Zuid-Afrika ([1golf.eu](https://www.1golf.eu/club/greenside-colliery-golf-club/)). Geen Nederlands
  bedrijf of clubsoftware met de naam Greenside gevonden.
- **Namen van concurrenten**: IntoGolf, Nexxchange, E-Golf4U, Golfspot, TeeControl, Parrow, GolfBox,
  CompuGolf, Golf Genius, GOLF.NL, Golf@. Geen enkele lijkt op "Greenside".
- **Domeinen en accounts: kon ik niet controleren.** Deze omgeving heeft geen toegang tot DNS of de
  registers. Controleer ze zelf (hieronder).

#### Controles die jullie zelf moeten doen

Ik kan alleen openbaar zoeken. Een merkenjurist bevestigt het, en **niets is van jullie tot je het
registreert**. Geen juridisch advies.

| controle | waar | waar op te letten |
| --- | --- | --- |
| Benelux-merk | [BOIP-register](https://www.boip.int/nl/merken) | "Greenside" in **klasse 9** (downloadbare software, apps), **klasse 42** (software als dienst) en **klasse 35** (leden- en bedrijfsadministratie) |
| EU-merk | [EUIPO eSearch plus](https://euipo.europa.eu/eSearch/) en [TMview](https://www.tmdn.org/tmview/) (alle EU-bureaus tegelijk) | dezelfde klassen; ook "Greenside AI" en beeldmerken met het woord |
| Bedrijfsnamen | [KVK](https://www.kvk.nl/zoeken/) | een bestaand Nederlands "Greenside" in software |
| .nl-domein | [SIDN whois](https://www.sidn.nl/whois) | greenside.nl; alternatieven: greensideclubs.nl, greenside-golf.nl, greenside.golf |
| .com | elke registrar | greenside.com (waarschijnlijk bezet; niet nodig voor een Nederlands bedrijf) |
| Accounts | LinkedIn (bedrijfspagina, het belangrijkst voor deze koper), Instagram, YouTube (demovideo's), X | "greenside" of "greensideclubs"; TikTok is niet nodig voor deze koper |

Een jurist zal waarschijnlijk zeggen: als los woord is "Greenside" **zwak voor golfsoftware**, omdat het
een plek op de baan beschrijft. Een **woord- en beeldmerk** ("Greenside" met het logo) in de Benelux,
klassen 9 en 42, is de goedkopere en veiligere eerste stap. Vraag ernaar zodra het logo er is.

### 2. Belofte, tagline, stem

**De belofte** (waar een club altijd op kan rekenen):
> **Uw club krijgt een eigen app, en wij doen het werk: de overstap, de uitnodigingen en de telefoon op
> zaterdagochtend.**

**Tagline, drie opties**
1. **"Uw club. Uw app. Wij doen het werk."** (aanbevolen: belofte en positionering in één regel)
2. "De clubapp die van de club is."
3. "Overstappen zonder dat uw vrijwilligers het merken."

**Stem: drie bijvoeglijke naamwoorden**

| | wel | niet |
| --- | --- | --- |
| **Rustig** | korte zinnen; zeg wat er daarna gebeurt en wanneer | uitroeptekens, "revolutionair", "game-changer", urgentie die niet echt is |
| **Concreet** | getallen, namen, stappen: "wij importeren uw leden uit E-Golf4U" | vage voordelen: "optimaliseer uw clubbeleving" |
| **Eerlijk** | zeg wat het nog niet doet (NGF-handicapkoppeling, incasso) en wat het in plaats daarvan doet | omzet beloven, of suggereren dat andere clubs het al gebruiken voordat dat zo is |

Spreek besturen formeel aan (**u**); in de ledenapp geldt de eigen stem van de club (de app gebruikt al
kort, vriendelijk Nederlands).

**Voor / na** (een regel uit de pitch):
- Voor: "We doen het werk: we importeren uw leden uit E-Golf4U, Nexxchange, IntoGolf of Excel, nodigen
  ze uit, geven u een papieren handleiding voor oudere leden en draaien een hulplijn in de eerste vier
  weken, ook op zaterdagochtend."
- Na: "**Wij doen het werk.** Wij zetten uw leden over uit E-Golf4U, Nexxchange, IntoGolf of Excel en
  nodigen ze uit. Leden boven de zeventig krijgen een papieren handleiding. De eerste vier weken nemen
  wij de telefoon op, ook op zaterdagochtend."

### 3. De uitstraling, als brief

#### Kleur (bestaande Greenside-waarden, ongewijzigd)

| kleur | hex | taak |
| --- | --- | --- |
| Dennengroen (pine 800) | `#10392D` | hoofdkleur: koppen, knoppen, donkere vlakken, het logo |
| Messing (brass) | `#B8924A` | accent: de vlag, een lijn, een markering. **Niet voor tekst op een lichte achtergrond** |
| Krijtwit (chalk) | `#F4F5F0` | papier: achtergronden, brieven, one-pagers |
| Inkt (ink) | `#12201A` | lopende tekst |
| Messing tekst (brassText) | `#86652A` | accent als tekst op licht papier |
| Licht messing (brassLight) | `#D9BC82` | accent als tekst op donkergroen |

Contrast (WCAG AA vraagt 4,5:1 voor gewone tekst, 3:1 voor grote tekst):

| tekst op achtergrond | verhouding | oordeel |
| --- | ---: | --- |
| inkt op krijtwit | 15,4 | AA, AAA |
| krijtwit op dennengroen | 11,7 | AA, AAA |
| messing tekst op krijtwit | 4,9 | AA |
| licht messing op dennengroen | 7,0 | AA |
| messing op dennengroen | 4,4 | **alleen grote tekst en iconen** (haalt AA niet voor kleine tekst) |
| messing op krijtwit | 2,6 | **nooit voor tekst**; alleen decoratie |

#### Letters

- **Fraunces** voor koppen, **Manrope** voor tekst. Beide gratis onder de SIL Open Font License, via
  [Google Fonts](https://fonts.google.com/specimen/Fraunces) en
  [Google Fonts](https://fonts.google.com/specimen/Manrope); gebruik in drukwerk, web en de app is
  toegestaan. Ze zitten al in het product. Gebruik in Word of Google Docs (brieven, contracten) dezelfde
  letters; zijn ze niet geïnstalleerd, gebruik dan Georgia voor koppen en Arial voor tekst.

#### Brief voor het logo

Greenside heeft **nog geen logo**; het product toont een "G"-monogram.
- **Het moet zeggen**: betrouwbaar, Nederlands, dicht bij de club. Rustig genoeg voor een contract,
  herkenbaar naast het eigen logo van een club ("met Greenside" in een voettekst).
- **Het moet werken**: als app- of browsericoon van 32 px en LinkedIn-profielfoto; in één kleur
  (dennengroen op krijtwit, krijtwit op dennengroen); in een briefhoofd; als kleine regel "met Greenside"
  onder de app of handleiding van een club, waar het nooit mag concurreren met het eigen logo van de club.
- **Richting om te proberen**: een "G" waarvan de binnenbocht leest als de rand van een green, of een G
  met een klein messing vlaggetje. Een woordmerk in Fraunces.
- **Vermijden**: golfbal met een swoosh, gekruiste clubs, een losse vlag in een cirkel (clichés, en lijkt
  op veel clublogo's), alles wat op het logo van de NGF of GOLF.NL lijkt, kleurverlopen.
- Schetsen: ik heb hier geen beeldgenerator, maar ik kan 3–4 **SVG-schetsen** in code tekenen; dat zijn
  schetsen, geen definitief logo. Een ontwerper maakt de gekozen versie af, en jullie bezitten de
  bestanden.

#### De eerste vijf contactmomenten

1. **De homepage** (greenside.nl, als die vrij is). Bovenste regel: "Uw club. Uw app. Wij doen het werk."
   Daaronder drie blokken (eigen app in de stores · wij verhuizen uw club · uw gegevens blijven van u),
   het Founding Club-aanbod met de echte einddatum, en *"Bel het bestuur van Golfclub Zwolle"* pas als
   Zwolle akkoord is. Krijtwitte achtergrond, dennengroene koppen, één messing lijn.
2. **De brief en de one-pager** (de "verpakking" voor deze koper). Krijtwit papier, logo linksboven,
   kop in Fraunces, de naam van het bestuurslid in de aanhef, ondertekend door een oprichter met een
   mobiel nummer. Eén pagina: wat het is, wat het kost, de contractclausules, "wij doen het werk".
3. **De bevestiging van de pilot** (de "bon"). Een e-mail en een pdf: de afgesproken succescriteria, de
   begin- en einddatum, wie wat doet, het nummer van de hulplijn, en "u kunt na de pilot stoppen zonder
   te betalen".
4. **Het eerste LinkedIn-bericht**: een oprichter, een echt scherm van de Greenside-basis, twee zinnen
   over waarom een club een eigen app verdient. Geen stockfoto's, geen claims over clubs die er nog niet
   zijn.
5. **Het antwoord op de eerste klacht** (de inlogcode van een lid kwam op zaterdag niet aan):
   "Vervelend dat de code niet aankwam. Ik heb een nieuwe gestuurd en gecontroleerd dat hij is
   afgeleverd. Kijkt u ook even in de map 'Ongewenst'? Lukt het niet, bel mij dan op [nummer]; ik neem
   vandaag op." Dezelfde dag, een naam, een telefoonnummer: het antwoord op "twee oprichters".

### Regels die gevolgd zijn

- Geen namen, logo's, kleuren of taglines van concurrenten gekopieerd.
- Letters: alleen SIL Open Font License. Geen beelden of iconen zonder rechten.
- Naam en logo van Zwolle alleen met schriftelijke toestemming van Zwolle.
- Geen juridisch advies over merken.

## Operatie

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

### 1. De dagelijkse cyclus

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

### 2. Leveranciers

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

### 3. Mensen

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

### 4. Routines

#### 4.1 Ochtendcontrole (15 minuten, elke werkdag)
1. Open het foutenoverzicht van Supabase en Vercel: fouten sinds gisteren? Noteer ze.
2. E-mailaanbieder: teruggekomen of vertraagde inlogcodes of uitnodigingen? Heeft een club er meer dan
   een paar, bel de club voordat de leden dat doen.
3. Mollie (per club, via het dashboard van de club als dat gedeeld is): mislukte betalingen of webhooks?
4. Support-inbox en voicemail: antwoord elke club vóór 10:00, al is het alleen "we zijn ermee bezig, u
   hoort vóór 14:00 van ons".
5. Iets aan een club beloofd voor vandaag? Zet het bovenaan.

#### 4.2 De overstap van een club (de kerndienst, zes weken)
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

#### 4.3 Release (beschermt de basis)
1. Alleen op de werkbranch werken; `pilot-v1` wordt nooit veranderd.
2. `pnpm typecheck && pnpm lint && pnpm test` en de databasetests (`supabase/tests/run-local.sh`).
3. Bij wijzigingen in gedeelde code: Greenside scherm voor scherm vergelijken met `pilot-v1`
   (basiscontrole).
4. Nieuwe databasewijziging = nieuwe migratie, getest; nooit een oude aanpassen.
5. Releasen van maandag tot donderdag na 17:00; nooit op vrijdag, zaterdag of in de lanceerweek van een
   club.
6. De ochtend erna controleren (routine 4.1).

#### 4.4 Een klacht of incident
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

#### 4.5 Wekelijks en maandelijks
1. **Vrijdag**: weekevaluatie: de drie marketingcijfers, open tickets, supporturen per club, wat er
   beloofd is.
2. **Vrijdag**: één back-up terugzetten in een testomgeving en controleren dat hij opent (minstens
   maandelijks).
3. **Maandelijks, eerste werkdag**: licentiefacturen en SEPA-incasso; een week later betalingen
   controleren.
4. **Maandelijks**: papieren handleidingen voor clubs die in de komende zes weken overstappen; bijbestellen.
5. **Per kwartaal**: kosten naast `founder/numbers.json` leggen; de CFO-berekening opnieuw draaien als ze
   verschoven zijn.

### 5. Gereedschap (de kleinste set)

| taak | middel | prijs | waarom |
| --- | --- | --- | --- |
| Hosting van het product | Supabase, Vercel, Expo, Resend | ~€ 160 per maand (vaste kosten CFO) | er al op gebouwd |
| Boekhouding, facturen, btw | Moneybird | € 15–29 per maand | Nederlands, bankkoppeling, facturen en SEPA |
| Licentie innen | Mollie of de bank | ~€ 0,13–0,25 per incasso | clubs betalen via automatische incasso |
| Support | een gedeelde mailbox (Google Workspace of vergelijkbaar) + het hulplijnnummer | ~€ 14 + € 15 per maand | één inbox, één nummer, beide oprichters |
| Verkooppijplijn | Greenside HQ (al gebouwd) | € 0 | prospects, clubs en de inrichtingschecklist op één plek |
| Planning | een gedeelde agenda | € 0 | releasedagen, lanceerweken, zaterdagrooster |
| Wachtwoorden en sleutels | een wachtwoordbeheerder met delen | ~€ 5 per maand (schatting) | sleutels van diensten nooit in chat of e-mail |

### 6. Inschrijving, vergunningen en regels

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

### 7. Risicoregister

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

### Open vragen (offerte of besluit nodig)

1. Pentest: drie offertes van Nederlandse bedrijven, reikwijdte zoals in hoofdstuk 2.
2. Verzekering: twee offertes voor beroepsaansprakelijkheid plus cyber.
3. Jurist: offerte voor verwerkersovereenkomst, privacyverklaring, voorwaarden en het clubcontract.
4. Drukwerk: een Nederlandse offerte voor 1.000 A5-handleidingen (8 of 12 pagina's).
5. Hulplijnnummer: Voys of een mobiele aanbieder, prijs.
6. Rechtsvorm (vof of bv) en hoe de oprichters betaald worden: boekhouder.
7. Apple App Review vragen hoe ze apps per club van dezelfde app behandelen (4.2.6 en 4.3) vóór de eerste
   indiening ([Apple-forum](https://developer.apple.com/forums/thread/840982)).
8. Het werkelijke tarief van Mollie voor SEPA-incasso van de licentie.

## Lanceerplan

**Lanceerdag L = maandag 1 maart 2027: de leden van Golfclub Zwolle krijgen hun app.** Er is nog geen
datum afgesproken; dit is de datum waar de marketingkalender van uitgaat, vóór het seizoen en voordat
besturen de voorjaarsvergadering voorbereiden. Met de doorlooptijden uit Operatie (jurist, pentest,
aanmelding bij Apple) is de vroegst haalbare datum half januari 2027, maar in januari spelen leden weinig
en verspil je dan de referentie. **Spreek de datum in week 1 af met het bestuur van Zwolle**; alle data
hieronder schuiven mee.

Eigenaren: **A** = oprichter voor product en veiligheid, **B** = oprichter voor clubs en verkoop
(Operatie). Vandaag is donderdag 8 oktober 2026.

### 1. Eerst testen, dan uitgeven

Het grote geld in dit plan is niet de hosting (€ 400 per maand) maar **jezelf betalen** (€ 5.000 per
maand, De cijfers) en eventueel extern geld. De pentest (€ 7.500) en de jurist (€ 2.500) zijn sowieso
nodig voor Zwolle: echte ledengegevens gaan nooit live zonder. De test beslist dus **of jullie jezelf
gaan betalen of geld ophalen**, niet of Zwolle live gaat.

De passende test voor een abonnement dat aan besturen verkocht wordt: **echte besturen, de echte prijs,
een handtekening.**

**Test 1 — vóór de pentest geboekt wordt (12 oktober – 18 december 2026)**
- Zwolle tekent het pilotcontract: succescriteria op papier, en de oprichtersprijs (€ 399 per maand)
  **vanaf maand 4 als de criteria gehaald zijn**.
- 15 brieven naar clubs die nog op E-Golf4U zitten of in de buurt van Zwolle liggen (marketinghaak 1).
  Geen beweringen over Zwolle.
- **Succeslijn: Zwolle getekend vóór 13 november, en vóór 18 december minstens 5 gesprekken met besturen
  en 2 getekende intentieverklaringen** ("als Zwolle zijn criteria haalt, starten wij in 2027 een pilot
  tegen € 399").
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

### 2. De aftelplanning

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

### 3. Lanceerdag: maandag 1 maart 2027

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

### 4. De eerste 30 dagen

**Wekelijkse cijfers** (elke vrijdag, in de weekevaluatie):

| cijfer | bron | doel | iets veranderen als |
| --- | --- | --- | --- |
| Leden van Zwolle die deze week actief zijn (÷ alle leden) | app | 20% in week 4, 40% in week 12 | onder 10% op dag 14 of 20% op dag 28 → stoppen met benaderen, eerst het gebruik oplossen |
| Uitnodigingen afgeleverd / geaccepteerd | e-mailaanbieder, app | ≥ 95% afgeleverd | meer dan 2% teruggekomen → adressen opschonen met Zwolle, domeininstellingen controleren |
| Supporturen voor Zwolle | eigen logboek | daalt elke week | boven 10 uur per week na week 2 → handleiding of app is onduidelijk; oplossen wat terugkomt |
| Geboekte gesprekken met besturen | marketinglogboek | 3 per week | twee weken onder 2 per week → brief herschrijven, eerst bellen, Zwolle om een introductie vragen |
| Pilotaanvragen / intentieverklaringen | marketinglogboek | 3 vóór 30 mei | 0 na 10 gesprekken → terug naar het aanbod |
| Betalende clubs tegenover break-even | CFO | 0 in de eerste 30 dagen (Zwolle zit in de gratis pilot); break-even 2 clubs onbetaald, 16 met salaris | — de geldtest is test 2, niet de eerste maand |

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

_Het panel bestaat uit gesimuleerde kopers en de cijfers zijn prognoses op basis van de invoer. Toets de vraag bij echte klanten en de kosten met echte offertes voordat je geld uitgeeft. Geen financieel, juridisch of fiscaal advies._
