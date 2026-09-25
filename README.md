# Greenside — ledenapp & clubbeheer voor Nederlandse golfclubs

Eén platform voor alle golfclubs in Nederland:

- **Ledenapp (iOS & Android)** — `apps/mobile`, Expo / React Native
- **Clubbeheer (web)** — `apps/admin`, Next.js: leden, starttijden, wedstrijden, nieuws en de volledige financiële administratie
- **Backend** — `supabase/`: PostgreSQL met Row Level Security, Auth, Edge Functions
- **Gedeelde logica** — `packages/shared`: WHS-handicap, Stableford, BTW, IBAN, SEPA-incasso, starttijden

```
apps/mobile      Expo Router-app voor leden
apps/admin       Next.js-beheeromgeving voor de club
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
| Starttijden | Tee sheet per baan/dag, boeken, aansluiten bij flight, clubgenoten en gasten toevoegen, afmelden |
| Wedstrijden | Kalender, in-/uitschrijven, deelnemerslijst, uitslagen |
| Scores | Scorekaart invoeren met live Stableford (WHS: course/playing handicap, net double bogey), handicapindicatie |
| Profiel | Facturen bekijken en betalen met iDEAL, contactgegevens wijzigen, privacy (ledenlijst opt-out), ledenlijst |
| Meerdere clubs | Eén account kan lid zijn van meerdere clubs; app neemt de huisstijlkleur van de club over |

### Clubbeheer (web)
- **Dashboard** — actieve leden, spelers vandaag, openstaand/achterstallig, komende wedstrijden
- **Leden** — zoeken/filteren, detail + bewerken, NGF-nummer, handicap, SEPA-machtiging, app-uitnodiging, CSV-export (Excel-NL)
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
- **Instellingen** — clubgegevens, IBAN/incassant-ID, huisstijl, lidmaatschapsvormen & tarieven

### Rollen
`admin` (alles) · `finance` (penningmeester) · `secretariat` (ledenadministratie, wedstrijden, nieuws) · `marshal` (starttijden). Leden zien alleen hun eigen gegevens; de ledenlijst toont alleen naam + handicap van leden die daarmee instemmen. Alle wijzigingen aan leden, facturen, betalingen en machtigingen komen in een audit-log (AVG).

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
- Lid (app): `jan@example.test` → inlogcode staat in Mailpit (http://127.0.0.1:54324)

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
- Koppeling met bestaande clubsystemen (e-golf4u, Golfmanager) voor migratie van leden
- Pushnotificaties (nieuws, herinnering starttijd), marker-bevestiging van scorekaarten
- Greenfee-boekingen voor gasten, baanstatus/weer, horeca/kassa
- Bankafschriften importeren (CAMT.053) voor automatisch afletteren, export naar boekhoudpakket (Exact/Twinfield)
- Clubbeheer: beheerders uitnodigen via UI, baangegevens (tees/holes) beheren, onboarding van nieuwe clubs
- Verwerkersovereenkomst, privacyverklaring en DPIA (AVG) per club
