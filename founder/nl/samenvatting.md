# Samenvatting

**Wat het is.** Greenside geeft een Nederlandse golfclub een eigen ledenapp in de App Store en Google
Play, plus de clubbeheersoftware erachter, en doet de overstap voor de club. Het is voor de besturen
van de 263 NGF-clubs, eerst de clubs die van E-Golf4U af moeten.

**Oordeel: Nog niet** (berekend door `compile.py` uit `founder/numbers.json` en het kooppanel). Drie van
de vier toetsen slagen, één niet:
- ✓ **Marge**: elke betalende club laat **€ 410,20 per maand (90%)** over bij de oprichtersprijs van
  € 0,49 per lid (gemiddeld € 455,70; op 8 oktober 2026 omgezet naar een prijs per lid).
- ✓ **Break-even**: **1 betalende club** zonder salaris, ruim binnen de ~25 clubs die twee mensen
  kunnen bedienen.
- ✓ **Jaar 1**: een winst van **€ 146**, ook al betaalt alleen Zwolle vanaf maand 4 en wachten de
  volgende clubs op het bewijs van Zwolle (3 betalende clubs in maand 12).
- ✗ **Kopers**: **0 van de 20** gesimuleerde kopers kopen (de lat ligt op 25%), met de oude pitch én
  met het verbeterde Founding Club-aanbod.

Met € 2.500 salaris per oprichter ligt de break-even op **13 clubs** (10 oprichters + 3 tegen de
normale prijs) en is het verlies in jaar 1 **€ 59.854**.

**Wat er moet veranderen, en welke stap dat doet.**
1. **Bewijs, geen betere pitch.** 19 van de 20 kopers zeggen wat ze over de streep trekt: Zwolle een
   seizoen live en een gesprek met het bestuur daar. Geen enkele aanpassing van het aanbod veranderde
   de koopbereidheid (`/founder-offer` is twee keer gedraaid). Alleen echte cijfers van Zwolle kunnen
   dat; draai daarna `/founder-consumer` opnieuw met die cijfers, en vertrouw echte besturen meer dan
   het panel.
2. **Het salaris van de oprichters** is de geldvraag. De prijs per lid bracht de break-even van 16 naar
   13 clubs; als Zwolle vanaf maand 1 betaalt (jaar 1 € +1.377) of club 11 en verder de normale prijs
   betalen (break-even 10), helpt dat verder (`/founder-cfo`).

**Waar de board en het panel het over eens waren, en waar niet.** Beide zetten bewijs bij Zwolle
voorop, en beide zien de moeite van overstappen en "maar twee oprichters" als de twijfels. De board
stemde "investeren, mits" (5,0 / 10) en zag een verkoopbaar aanbod; het panel kocht niets. De grootste
angst van de board (leden gebruiken geen clubapp naast GOLF.NL) kwam in het panel minder vaak terug dan
vertrouwen en timing. De prijs was niet het probleem. Na een tweede blik op de waarde voor een
club (een greenfee kost € 50–74; € 0,65 per lid is per 100 leden minder dan één greenfee van 18 holes
per maand) ging de prijs omhoog naar € 0,65 per lid (bijlage Casus prijs).

**Het grootste risico** is dat de leden van Zwolle de app niet gebruiken: zonder dat verkoopt niets
anders. Aanpak: een lanceerpakket (import voor ze gedaan, papieren handleiding, uitnodigingen in
groepjes, hulplijn op zaterdag), wekelijks tellen hoeveel leden actief zijn, en direct stoppen met
verkopen als in week 4 minder dan 20% actief is.

**Wat er nodig is om te starten.** Ongeveer **€ 11.600** zonder salaris (pentest € 7.500, jurist
€ 2.500, vaste kosten), en **test 1**: Zwolle tekent vóór 13 november een pilotcontract met betaald
vervolg, plus 2 intentieverklaringen van andere besturen vóór 18 december (`founder/launch.md`).

**Deze week:** ga om tafel met het bestuur van Zwolle. Leg de livedatum, de succescriteria en de
oprichtersprijs (€ 0,49 per lid) vanaf maand 4 vast in een pilotcontract, en vraag toestemming om hun naam later te
gebruiken.

_Het panel bestaat uit gesimuleerde kopers en de cijfers zijn prognoses; echte besturen en echte
offertes moeten ze bevestigen. Geen financieel, juridisch of fiscaal advies._
