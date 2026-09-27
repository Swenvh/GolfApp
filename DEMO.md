# Greenside — demo en pitch

Greenside is een ledenapp (iOS en Android) plus clubbeheer (web) voor Nederlandse golfclubs: starttijden, ledenadministratie, de volledige financiële administratie met SEPA-incasso, en aanbod in de app waarmee de app zichzelf terugverdient.

De demo draait op **Golfclub De Duinen**, een verzonnen club met zes weken gebruik: boekingen, bestellingen, leads, sponsors en verzoeken om te pauzeren.

## Drie manieren om het te laten zien

| | Wat | Nodig |
|---|---|---|
| **1. Rondleiding** | Webpagina met alle schermen, het rekenvoorbeeld en sponsoring. Werkt op elke laptop of telefoon. | Alleen de link |
| **2. Volledige demo op je laptop** | De echte app en het echte clubbeheer, waarin je zelf boekt, bestelt en goedkeurt. | Node 22, pnpm, Docker Desktop |
| **3. Online demo** (volgt) | Hetzelfde als 2, maar via een webadres dat je kunt doorsturen. | Supabase- en Vercel-account |

## Volledige demo starten (optie 2)

Eenmalig installeren:
- [Node.js 22](https://nodejs.org) en daarna in een terminal: `corepack enable` (dat installeert pnpm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), opstarten en laten draaien. Minimaal 4 GB geheugen voor Docker.
- Windows: gebruik WSL2 (Ubuntu) en voer de commando's daar uit.

Daarna, in de map van het project:

```bash
pnpm demo          # start alles; de eerste keer duurt dit 5 à 10 minuten
```

| | Adres | Inloggen |
|---|---|---|
| Clubbeheer | http://localhost:3000 | `beheer@deduinen.test` / `golfapp123` |
| Ledenapp | http://localhost:8081 | `jan@example.test` (A-lid) of `pieter@example.test` (weekdaglid met Handicart-pas) |
| Testmail | http://localhost:54324 | Hier staat de 6-cijferige inlogcode voor de ledenapp |

In de demo werkt alles behalve online betalen met iDEAL: daarvoor is een Mollie-account van de club nodig. De knop geeft dan netjes aan dat de factuur onder Facturen klaarstaat.

Zet de ledenapp in telefoonweergave: in Chrome F12 → het telefoon-icoontje → iPhone 14.

```bash
pnpm demo:reset    # na elke demo: alles terug naar de beginstand
pnpm demo:stop     # alles stoppen
```

## Draaiboek (15 minuten)

**1. Het probleem (1 min)**
Clubs werken met verouderde software, de receptie is druk met telefoontjes en afrekenen, en tweederde van de inkomsten is contributie. Elke opzegging is dus direct omzetverlies.

**2. De ledenapp als lid Jan (5 min)** — `jan@example.test`
- Clubhuis: je volgende ronde als ticket, en onder *Voor jou* aanbod dat past bij het moment.
- *Wordt Lotte ook lid?*: Lotte speelde vier keer mee als introducé, de club krijgt een lead.
- Starttijden → een dag → 08:10. Voeg de gasten *Lotte de Graaf* en *Wim Nieuw* toe: de app telt hoe vaak elke introducé dit jaar al speelde. Voeg een buggy toe en bevestig. Geen telefoontje en geen balie; de factuur staat direct in de administratie.
- Profiel → Lidmaatschap wijzigen → Opzeggen → *Blessure of gezondheid*. De app biedt eerst *lidmaatschap op rust* aan. Kies dat: **lid behouden**.
- Scorekaart: scores met live Stableford, en hole 7 *aangeboden door* een sponsor.

**3. Als weekdaglid Pieter (2 min)** — `pieter@example.test`
- Starttijden → zaterdag: in plaats van "mag niet" krijgt hij een weekendronde van € 35, een weekendpas of een upgrade aangeboden.
- Pieter heeft een Handicart-pas en betaalt automatisch € 8 in plaats van € 40 voor een buggy.

**4. Clubbeheer (5 min)** — `beheer@deduinen.test`
- Mission control: één zin zegt of alles in orde is; daaronder wat er vandaag moet gebeuren, met per punt één knop. Verderop de baan van vandaag als strook, geld en leden.
- Leden → een lid: alles op één plek, inclusief machtiging en facturen.
- Leden → *Wijzigingen*: Jans verzoek goedkeuren met één klik. Het gaat vanzelf in op de ingangsdatum; bovenaan staat hoeveel leden en contributie de app heeft behouden.
- App-omzet: omzet via de app, *hoe vaak de licentie is terugverdiend*, buggy's voor de receptie en leads.
- Financiën → Incasso: SEPA-bestand voor de bank. Grootboek: alles automatisch dubbel geboekt.

**5. Het verdienmodel (2 min)**
Laat in de rondleiding het rekenvoorbeeld en het onderdeel sponsoring zien. Schuif met de aannames van de club aan tafel.

## Wat er staat en wat nog moet

**Klaar en getest**
- Ledenapp: inloggen met code, starttijden per 8 minuten zonder dubbele boekingen, wedstrijden, scorekaart, facturen en iDEAL.
- Clubbeheer: leden, starttijden, wedstrijden, nieuws, facturen, betalingen, SEPA-incasso en grootboek.
- De app verdient zichzelf terug:
  - buggy met Handicart-tarief;
  - greenfees, lessen, stalling en wedstrijddiner;
  - upgrades en introducties;
  - behoud: pauzeren of omzetten;
  - introducé-limiet en introductiekaart;
  - gezinsleden, weekendrondes en sponsorplekken.
- Automatische tests op rekenregels, toegangsregels en boekhouding.

**Nodig om live te gaan**
- Supabase-project (EU) en hosting van het clubbeheer (bijv. Vercel).
- Apple- en Google-ontwikkelaarsaccount om de app in de stores te zetten.
- Per club: een Mollie-account (iDEAL) en een incassant-ID van de bank.
- Verwerkersovereenkomst en privacyverklaring (AVG).

**Nog te bouwen**
- Branding per club: eigen hoogtelijnen uit het terrein, clubwapen en clubkleur, en de ledenkaart in Wallet.
- Landelijke sponsors, gedeeld met clubs.
- Leden overzetten uit e-golf4u of Golfmanager, pushberichten, en een koppeling met de NGF voor officiële handicaps.

Technische details staan in [README.md](README.md).
