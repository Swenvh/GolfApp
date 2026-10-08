# Samenvatting

**Wat het is.** Greenside geeft een Nederlandse golfclub een eigen ledenapp in de App Store en Google
Play, plus de clubbeheersoftware erachter, en doet de overstap voor de club. Het is voor de besturen
van de 263 NGF-clubs, eerst de clubs die van E-Golf4U af moeten.

**Oordeel: Nog niet** (berekend door `compile.py` uit `founder/numbers.json` en het kooppanel). Twee van
de vier toetsen slagen, twee niet:
- ✓ **Marge**: elke betalende club laat **€ 250,20 per maand (69%)** over bij de pioniersprijs van
  € 0,39 per lid (gemiddeld € 362,70), na de kosten van de nieuwe garanties.
- ✓ **Break-even**: **2 betalende clubs** zonder salaris, ruim binnen de ~25 clubs die twee mensen
  kunnen bedienen.
- ✗ **Jaar 1**: een verlies van maar **€ 159**, met de drie knoppen in de cijfers (Zwolle betaalt vanaf
  maand 1, Expo Starter, escrow en IT-partner vanaf de derde club). Zonder was het € -3.394.
- ✗ **Kopers**: **0 van de 20** gesimuleerde kopers kopen (de lat ligt op 25%), met de oude pitch én
  met het verbeterde Founding Club-aanbod.

Met € 2.500 salaris per oprichter ligt de break-even op **15 clubs** (3 pioniers + 7 oprichters + 5
normaal) en zou het verlies in jaar 1 met salaris vanaf maand 1 **€ 62.643** zijn.

**Wat er moet veranderen, en welke stap dat doet.**
1. **Bewijs, geen betere pitch.** 19 van de 20 kopers zeggen wat ze over de streep trekt: Zwolle een
   seizoen live en een gesprek met het bestuur daar. Geen enkele aanpassing van het aanbod veranderde
   de koopbereidheid (`/founder-offer` is twee keer gedraaid). Alleen echte cijfers van Zwolle kunnen
   dat; draai daarna `/founder-consumer` opnieuw met die cijfers, en vertrouw echte besturen meer dan
   het panel.
2. **Het salaris van de oprichters** is de geldvraag: ~15 clubs. Het doorbraakaanbod (bijlage) nam in
   panelronde 3 elk bezwaar weg behalve bewijs, voor ~€ 3.500 in jaar 1.

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

**Wat er nodig is om te starten.** Ongeveer **€ 11.200** zonder salaris (pentest € 7.500, jurist
€ 2.500, vaste kosten), en **test 1**: Zwolle tekent vóór 13 november een pilotcontract met betaald
vervolg, plus 2 intentieverklaringen van andere besturen vóór 18 december (`founder/launch.md`).

**Deze week:** ga om tafel met het bestuur van Zwolle. Leg de livedatum, de succescriteria en de
pioniersprijs (€ 0,39 per lid) **vanaf maand 1** vast in een pilotcontract, en vraag toestemming om hun naam later te
gebruiken.

_Het panel bestaat uit gesimuleerde kopers en de cijfers zijn prognoses; echte besturen en echte
offertes moeten ze bevestigen. Geen financieel, juridisch of fiscaal advies._
