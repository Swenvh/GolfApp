# Greenside — ledenapp & clubbeheer voor Nederlandse golfclubs

Eén platform voor alle golfclubs in Nederland:

- **Ledenapp (iOS & Android)** — `apps/mobile`, Expo / React Native
- **Clubbeheer (web)** — `apps/admin`, Next.js: leden, starttijden, wedstrijden, nieuws en de volledige financiële administratie
- **Backend** — `supabase/`: PostgreSQL met Row Level Security, Auth, Edge Functions
- **Gedeelde logica** — `packages/shared`: WHS-handicap, Stableford, BTW, IBAN, SEPA-incasso, starttijden

```
apps/mobile      Expo Router-app voor leden
apps/admin       Next.js-beheeromgeving voor de club
apps/web         Website van Greenside (statisch: index.html + img/)
packages/shared  TypeScript-domeinlogica + types (met unit tests)
supabase/        migraties, seed, RLS-tests, edge functions, e-mailtemplates
```

## Merk: Greenside

Eén vast thema voor app, beheeromgeving en e-mails.

| Rol | Kleur | Gebruik |
|---|---|---|
| Dennengroen | `#0B2A21` / `#174A3A` | Headers, knoppen, lidmaatschapskaart |
| Messing | `#B8924A` / `#D9BC82` | Accenten, vlag in het logo, birdies op de scorekaart |
| Krijtwit | `#F4F5F0` | Achtergrond |
| Inkt | `#12201A` | Tekst |

- **Typografie:** Fraunces (koppen, cijfers) en Manrope (tekst), via Google Fonts.
- **Beeldtaal:** hoogtelijnen zoals op een baankaart, procedureel getekend (`apps/mobile/src/components/brand.tsx`).
- **Details uit de golfwereld:** starttijd als ticket, bezetting als tee-pegs, scorekaart met cirkel voor birdie en vierkant voor bogey, digitale lidmaatschapskaart.
- Tokens: `apps/mobile/src/lib/theme.ts` en `apps/admin/src/app/globals.css`. De merknaam staat in `app.config.ts`.

## Functionaliteit

### Ledenapp
| Onderdeel | Wat kan het lid |
|---|---|
| Inloggen | E-mailadres + 6-cijferige code (geen wachtwoord); alleen door de club uitgenodigde leden |
| Home | Handicap, openstaand bedrag, eigen starttijden, clubnieuws |
| Starttijden | Starttijden per 8 minuten (instelbaar per baan). Tee sheet per baan/dag, boeken, aansluiten bij flight, clubgenoten en gasten toevoegen, afmelden. Een lid kan niet in twee flights staan waarvan de rondes overlappen (rondeduur per baan) |
| Wedstrijden | Kalender, in-/uitschrijven, deelnemerslijst, uitslagen |
| Scores | Scorekaart invoeren met live Stableford (WHS: course/playing handicap, net double bogey), handicapindicatie |
| Profiel | Facturen bekijken en betalen met iDEAL, contactgegevens wijzigen, privacy (ledenlijst opt-out), ledenlijst, tegoed (introductiekaart, weekendrondes) |
| Lidmaatschap | Upgraden, pauzeren (rustend lid), omzetten, gezinslid aanmelden, opzeggen: verzoek naar het secretariaat |
| Meerdere clubs | Eén account kan lid zijn van meerdere clubs; app neemt de huisstijlkleur van de club over |

### Upsells: de app verdient zichzelf terug

Uitgangspunt: **geen extra werk voor personeel**. De app neemt reserveren en afrekenen over; uitgifte loopt via wat de club al doet (sleutel bij de receptie). Alles wat een lid bestelt wordt direct een definitieve factuur (incasso of iDEAL) en een journaalpost.

| Moment in de app | Aanbod | Opbrengst voor de club |
|---|---|---|
| Starttijd boeken | Buggy reserveren, **met Handicart-tarief** voor pashouders; greenfee introducé automatisch | Geen telefoontjes meer, greenfee niet meer aan de balie |
| Profiel | **Handicart-pas** vastleggen (Stichting Handicart); pashouders krijgen de buggy standaard bij elke boeking | Betere bezetting buggyvloot, service voor een grote groep leden |
| Clubhuis | Buggy bij je volgende ronde; kluisje of stalling voor het seizoen | Verhuur, seizoensinkomsten zonder werk per ronde |
| Scores | Les bij de pro, gericht als je vorm terugloopt | Lessen |
| Wedstrijd | Inschrijfgeld + wedstrijddiner in één keer | Wedstrijdgelden; de keuken weet vooraf hoeveel gasten |
| Weekend kiezen als weekdaglid | Upgrade naar volledig lidmaatschap | Hogere contributie (lead voor secretariaat) |
| Profiel / Clubhuis | Introduceer een vriend (gratis introductieronde) | Nieuwe leden (lead) |
| Clubhuis | **Vaste introducé** (≥ 3 rondes met jou in 12 maanden): "Wordt Lotte ook lid?" | Nieuwe leden uit de eigen gastenstroom (lead) |
| Boeken met gasten | **Introducé-limiet** per gast per jaar (instelbaar, standaard 5×); daarna automatisch de gewone greenfee. **Introductiekaart** (5 introducés) wordt bij het boeken vanzelf gebruikt | Handhaving zonder balie, voordeelkaart voor vaste gastheren |
| Opzeggen | Eerst passende alternatieven: **lidmaatschap op rust** of een goedkopere vorm, afhankelijk van de reden | Behouden contributie in plaats van een opzegging |
| Lidmaatschap / Clubhuis | **Gezinslid aanmelden**: app kiest gezinspartner, jeugd- of studentlid op leeftijd | Nieuwe leden (lead met jaarwaarde) |
| Weekenddag als weekdaglid | **Weekendronde** of **weekendpas (30 dagen)** los kopen, of upgraden | Extra omzet van weekdagleden, opstap naar upgrade |
| Clubhuis / Scorekaart | **Sponsorplekken**: partner in het clubhuis en holesponsors op de digitale scorekaart, met kliks | Sponsorinkomsten met meetbaar bereik |

Buggy's worden per tijdvak geteld (een buggy kan 's ochtends én 's middags rijden), kluisjes en stalling per seizoen. Afmelden voor een starttijd annuleert de buggy automatisch. In de beheeromgeving toont **App-omzet** de omzet via de app, de buggy-reserveringen voor de receptie (met Handicart-pasnummer) en de leads; onder **Aanbod beheren** stelt de club prijzen (incl. btw), het Handicart-tarief, aantallen, speelrecht (introducés/weekend) en de tekst na bestellen in. **Sponsors** beheert de sponsorplekken met kliks; **Leden → Wijzigingen** toont verzoeken om te pauzeren, om te zetten of op te zeggen (goedkeuren past het lidmaatschap aan) en hoeveel leden en contributie via de app behouden zijn.

### Clubbeheer (web)
- **Mission control** — in gewone taal: één zin of alles in orde is, een takenlijst met per punt één knop (verzoeken, aanmeldingen, te late en conceptfacturen, incasso klaarzetten of verwerken, verlopende Handicart-passen en sponsorcontracten, leden zonder app, ontbrekende bankgegevens), de bezetting van vandaag per baan, geld, leden, de komende twee weken, recente activiteit en wat de app oplevert. Ververst elke minuut.
- **Leden** — zoeken/filteren, detail + bewerken, NGF-nummer, handicap, SEPA-machtiging, app-uitnodiging, CSV-export (Excel-NL)
- **Leden importeren** — CSV uit het vorige systeem (E-Golf4U, Nexxchange, IntoGolf, Excel): kolommen worden op naam herkend, elke regel wordt vooraf gecontroleerd (datums, e-mail, IBAN, handicap, dubbele lidnummers, gedeelde e-mailadressen), ontbrekende lidmaatschappen kunnen worden aangemaakt, machtigingen gaan mee. Alles of niets: bij één fout wordt niets opgeslagen. Bestaande leden (zelfde lidnummer) worden aangevuld, niet gewist.
- **Financiën**
  - Facturen met regels, BTW 0/9/21%, grootboekrekening per regel, concept → definitief (doorlopende nummering per jaar), crediteren, printbare factuur/PDF
  - Contributie in bulk factureren op basis van lidmaatschapsvorm
  - Betalingen registreren (overboeking, pin, contant, iDEAL, incasso), deelbetalingen, storno's
  - **SEPA-incasso**: batch aanmaken → `pain.008.001.08` XML downloaden → na verwerking automatisch boeken (FRST/RCUR)
  - **Grootboek**: dubbel boekhouden, automatische journaalposten voor facturen en betalingen, proefbalans, standaard rekeningschema
  - Ouderdomsanalyse debiteuren en grootste achterstanden
- **Starttijden** — tee sheet per dag met check-in en annuleren
- **Wedstrijden** — aanmaken, status, uitslagen invoeren
- **Nieuws** — berichten (vastpinnen, concept) die direct in de app verschijnen
- **Instellingen** — clubgegevens, IBAN/incassant-ID, introducé-limiet, lidmaatschapsvormen & tarieven (incl. rustend lidmaatschap), collega's uitnodigen per rol
- **Inloggen met een code** — beheerders loggen in met een code per e-mail (wachtwoord blijft mogelijk). Een uitnodiging wordt een rol zodra iemand met dat adres inlogt.

### Greenside HQ (voor Greenside zelf)
Op `/hq`, alleen voor medewerkers van Greenside (`platform_staff`). Mission control met omzet per maand en jaar, klanten, pijplijn, golfers op Greenside, hoeveel leden de app echt gebruiken, omzet via de app bij klanten en hoe vaak de licentie is terugverdiend. Een takenlijst signaleert clubs zonder activiteit, aflopende proefperiodes, lage app-adoptie, ontbrekende incasso of iDEAL en afspraken in de verkoop. Per klant een gezondheidsscore (goed / let op / risico, met reden), een trend van twaalf weken en een verkooppijplijn (lead → demo → proefperiode → gewonnen / verloren) om bij te houden. Clubs zien elkaars gegevens nooit; HQ ziet alleen totalen per club.

**Club aanmaken** (`/hq/klanten/nieuw`, ook vanuit een verkoopkans): één formulier en de club staat klaar met zes gangbare lidmaatschappen, de baan (9, 18, 18 + par-3 of 27 holes, met standaard par en stroke index), het rekeningschema, het aanbod in de app (klaargezet, nog uit) en een uitnodiging voor de beheerder. Per klant een inrichtingspagina met de stappen van aanmelding tot gebruik en een kant-en-klaar bericht voor de beheerder.

**Accounts koppelen** — leden en beheerders hoeven niet één voor één uitgenodigd te worden: na inloggen met een code koppelt `claim_my_accounts()` het account aan het lid (of de beheerdersuitnodiging) met hetzelfde bevestigde e-mailadres. Delen meerdere leden van één club een adres, dan wordt niets gekoppeld; de import waarschuwt daarvoor.

### Rollen
`admin` (alles) · `finance` (penningmeester) · `secretariat` (ledenadministratie, wedstrijden, nieuws) · `marshal` (starttijden). Leden zien alleen hun eigen gegevens; de ledenlijst toont alleen naam + handicap van leden die daarmee instemmen. Alle wijzigingen aan leden, facturen, betalingen en machtigingen komen in een audit-log (AVG).

## Demo

Eén commando voor de volledige demo (database met demodata, clubbeheer en ledenapp): `pnpm demo`. Draaiboek voor de pitch en inloggegevens staan in [DEMO.md](DEMO.md).

## Lokaal starten

Vereist: Node 22, pnpm 10, Docker, [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
pnpm install
npx supabase start          # database + auth + mail (http://127.0.0.1:54324)
# kopieer de ANON_KEY uit de output naar:
cp apps/admin/.env.example apps/admin/.env.local     # NEXT_PUBLIC_SUPABASE_*
cp apps/mobile/.env.example apps/mobile/.env.local   # EXPO_PUBLIC_SUPABASE_*

pnpm admin                  # http://localhost:3000
pnpm mobile                 # Expo: scan QR met Expo Go, of druk 'w' voor web
```

Demo-accounts (uit `supabase/seed.sql`):
- Beheer: `beheer@deduinen.test` / `golfapp123`
- Leden (app): `jan@example.test` (A-lid) en `pieter@example.test` (weekdaglid) → inlogcode staat in Mailpit (http://127.0.0.1:54324)
- `supabase/seed_demo.sql` voegt zes weken gebruik toe (boekingen, bestellingen, leads) voor demo's

## Testen

```bash
pnpm test                   # unit tests gedeelde logica (handicap, BTW, SEPA, IBAN, tijdzones)
pnpm typecheck              # alle apps
PGHOST=... PGUSER=postgres ./supabase/tests/run-local.sh   # migraties + RLS + boekhouding op PostgreSQL
```
CI (`.github/workflows/ci.yml`) draait dit allemaal bij elke push.

## Naar productie

1. **Supabase-project** aanmaken in regio EU (Frankfurt) → `supabase link` en `supabase db push`.
   Stel de e-mailtemplates uit `supabase/templates/` in (Authentication → Email Templates) en een eigen SMTP-server.
2. **Edge functions** deployen: `supabase functions deploy invite-member create-payment mollie-webhook`.
   Per club een Mollie API-key in `club_payment_settings` zetten (alleen service role).
3. **Clubbeheer** op Vercel (of vergelijkbaar) met `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`.
4. **App** bouwen en indienen met EAS: `npx eas-cli build` / `eas submit`.
   White-label per club: zet `CLUB_SLUG`, `APP_NAME`, `BUNDLE_ID` in een EAS-profiel (zie `apps/mobile/app.config.ts`).

## Roadmap / nog te doen

- **NGF-koppeling** (officiële handicaps en qualifying kaarten via de NGF/GSN-API — vereist aansluiting bij de NGF)
- Importsjablonen per oud systeem (E-Golf4U, Nexxchange, IntoGolf) met echte exportbestanden van een pilotclub
- Pushnotificaties (nieuws, herinnering starttijd), marker-bevestiging van scorekaarten
- Greenfee-boekingen voor gasten, baanstatus/weer, horeca/kassa
- Bankafschriften importeren (CAMT.053) voor automatisch afletteren, export naar boekhoudpakket (Exact/Twinfield)
- Clubbeheer: baangegevens (tees/holes, course rating en slope) beheren
- Verwerkersovereenkomst, privacyverklaring en DPIA (AVG) per club
