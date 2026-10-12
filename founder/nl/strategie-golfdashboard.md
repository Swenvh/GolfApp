# Greenside · Strategie na Golf Dashboard

_12 oktober 2026. Golfclub Zwolle liet weten dat zij Golf Dashboard gebruiken, en dat veel andere clubs
dat ook doen. Dit stuk vat het onderzoek samen en herziet de strategie. Het heeft impact: ons oude verhaal
("wij verhuizen u van E-Golf4U") klopt niet voor een club die net Golf Dashboard koos._

## Wat Golf Dashboard is (en wie erachter zit)

Golf Dashboard is geen één product maar een **samengesteld systeem "powered by Golfspot"**:

- **Golfspot** — ledenadministratie / klantdataplatform (de "hub"). Rotterdam, opgericht 2021,
  **~7–10 medewerkers, geen externe financiering** (bootstrapped), oprichter Menno Liebregts
  ([Dealroom](https://app.dealroom.co/companies/golfspot_1),
  [Tracxn](https://tracxn.com/d/companies/golfspot/__TT8D8Wc_wYojHguqTGZMMMROAw8WpLTmirbA41LSzVs)).
- **TeeControl** — starttijden/baanbezetting (cloud, "volledig open om te koppelen",
  [teecontrol.com](https://www.teecontrol.com/en)).
- **Parrow** — wedstrijden (sinds 2017, [parrow-golf.com](https://parrow-golf.com/)).
- **unTill** (betalen/barsaldo), **Xafax CashlessGolf**, **NGF** (handicap) — gekoppeld.

**Hoeveel clubs?** Geen openbaar totaal. TeeControl noemt ~3 dozijn clubs op de site; Golfspot zegt
"steeds meer, ook internationaal". Het is dus **een klein, bootstrapped bedrijf dat hard groeit** — geen
reus, geen oorlogskas.

**Momentum:** het wint nú snel als E-Golf4U-opvolger. Overgestapt in late 2025 / begin 2026: De Hooge
Rotterdamsche (okt 2025), Amelisweerd, Golfmiddenbrabant (jan 2026), Golfhorst, Broekpolder (mrt 2026),
Nieuwkerk, Prise d'Eau, Heelsum, een club in Veendam (~1.500 leden), Olympus/De Hoge Dijk, De Lage Vuursche,
Het Woold.

## De twee feiten die alles bepalen

1. **Golf Dashboard is een web-app, geen echte app — en versnipperd.** Clubs schrijven het letterlijk: het
   staat *niet* in de stores; leden zetten een snelkoppeling op het beginscherm
   ([Het Woold](https://golfbaanhetwoold.nl/faq-golfdashboard/),
   [De Hooge Rotterdamsche](https://www.dehoogerotterdamsche.nl/golfdashboard/)). Er is een losse
   **TeeControl-app** (alleen starttijden, onvolledig) en een aparte **Parrow-app** voor wedstrijden. Een lid
   jongleert dus met een webdashboard + twee losse apps.
2. **Golfspot is een open koppel-hub, geen muur.** Golfspot noemt zich een platform dat "compatibel wordt
   met 100+ apps die clubs al gebruiken"; TeeControl is "volledig open om te koppelen". Dat is precies de
   deur waardoor wij naar binnen kunnen.

## De strategieswitch

Het oude plan ("vervang uw hele systeem") werkt niet meer voor clubs die net Golf Dashboard kozen — die
stappen jaren niet opnieuw over. Dus we splitsen de markt en veranderen bij de ene helft van rol:

**Route A — Volledig systeem (voor wie nog niet koos / ontevreden is).** Voor E-Golf4U-stragglers en clubs
die ontevreden zijn na een haastige migratie: Greenside als compleet systeem (app + clubbeheer), beter en
goedkoper dan de alternatieven. Prijs zoals in `prijzen.md`.

**Route B — De app-laag bovenop (voor wie al Golf Dashboard heeft, zoals Zwolle).** Niet vervangen, maar
aanvullen: **"Houd uw Golf Dashboard. Wij geven uw leden één echte app."** Greenside wordt de native app
die starttijden uit TeeControl leest en ledendata uit Golfspot, zodat het lid één gebrande app heeft in
plaats van een webpagina plus twee losse apps. De club gooit niets weg wat het net kocht; de winst is
direct zichtbaar voor de leden.

## Antwoord op jouw vragen

**Hoe komen wij hier nog tussen?** Via route B. Golf Dashboard heeft de back-office gewonnen, maar de
**ledenervaring open laten liggen**: web + drie losse apps. Dat is precies wat wij het best doen — één
echte, volledig gebrande native app. We vervangen hun keuze niet, we maken hem af.

**Waarom zou Zwolle nu nog een laag bovenop bouwen?** Omdat ze net in de back-office investeerden maar hun
leden opzadelen met een snelkoppeling en losse apps. Een laag bovenop vraagt géén nieuwe overstap, kost de
club weinig, en geeft de leden meteen de app-ervaring die Golf Dashboard niet levert. Voor een pilot-/
referentieclub is dat een veel makkelijker "ja" dan een volledige systeemwissel. Bovendien: Zwolle is
bevriend, dus de ideale eerste integratie-partner.

**Hoe verdienen we hier geld aan — met wat wij hebben en wat Golf Dashboard biedt?**
- **Onboarding fee** blijft (inrichting in clubstijl, import, livegang, training) — ook een laag bovenop
  moet gebouwd en ingericht worden. Houd die stevig.
- **Abonnement** als app-laag is lager dan als volledig systeem (het vervangt geen systeemkosten, het komt
  erbovenop) — reken op een lager maandbedrag voor route B, maar met veel lagere verkoopdrempel en dus meer
  clubs. Voor route A blijft het volledige abonnement staan.
- **Uitbreidingen** (eigen store-app als premium, pushcampagnes, sponsors) blijven.
- De CFO moet een **tweede prijspunt** krijgen voor route B (app-laag). Dat reken ik door zodra je de
  richting bevestigt.

**Waarom het hele bedrijf onderzoeken?** Omdat de omvang de strategie bepaalt. Golfspot is klein (~7–10
man) en bootstrapped. Ze kunnen snel integreren, maar hebben geen leger om een topklasse consumentenapp te
bouwen — hun ledenervaring is bewust web. Dat is onze marge: app-vakmanschap en snelheid. Tegelijk is het
een waarschuwing — ze zouden zelf een app kunnen bouwen, dus we moeten snel zijn en het goed doen.

## De koppeling is nu het kritieke punt (zoals GOLF.NL)

Route B staat of valt met een **koppeling naar TeeControl (starttijden) en Golfspot (ledendata)**. Beide
zeggen "open om te integreren", maar dat is marketing tot we de echte API-toegang en voorwaarden kennen.
Dit is hetzelfde type kritieke onzekerheid als de GOLF.NL/ICM-koppeling: zonder koppeling geen route B.

## Concurrentieanalyse: wat er verandert

- Golf Dashboard verschuift van "een van de opvolgers" naar **de snelst groeiende E-Golf4U-opvolger** en
  een directe concurrent voor route A — maar een **mogelijke partner/onderlaag** voor route B.
- Het venster "clubs moeten nu kiezen" sluit sneller dan het plan aannam; veel clubs kozen al. De
  direct-bereikbare "staat op het punt te kiezen"-groep krimpt; route B opent een veel grotere groep (alle
  clubs die al op Golf Dashboard zitten en wier leden met losse apps jongleren).

## Wat nu te doen

1. **Mail Zwolle terug met twee vragen:** zitten ze vast aan een contract bij Golf Dashboard, en wat missen
   hun leden eraan? Dat bepaalt of route A of B realistisch is.
2. **Technisch uitzoeken:** heeft TeeControl/Golfspot een open API, tegen welke voorwaarden? (Kritieke
   onzekerheid.)
3. **CFO:** een tweede prijspunt voor route B (app-laag) doorrekenen.
4. **Plan bijwerken:** positionering en aanbod splitsen in route A (vervangen) en route B (laag bovenop).

_Geen onafhankelijke ledenreviews van Golf Dashboard gevonden; clubaantallen zijn schattingen van
leveranciers- en clubpagina's. "Open om te integreren" is leveranciersmarketing tot bevestigd. Geen
financieel, juridisch of fiscaal advies._
