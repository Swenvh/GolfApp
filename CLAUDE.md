# Greenside

Ledenapp (Expo, `apps/mobile`) en clubbeheer (Next.js, `apps/admin`) voor Nederlandse golfclubs, met Supabase (`supabase/`) en gedeelde logica in `packages/shared`. Teksten in de app en commitberichten zijn Nederlands.

## Merk

Standaard is het Greenside-thema: dennengroen, messing en krijtwit, met Fraunces (koppen) en Manrope (tekst). Een club met een eigen app krijgt een eigen merk: kleuren in `packages/shared/src/brand.ts`, naam, app-ID en iconen in `clubs/<club>/` (zie `clubs/README.md`). De tokennamen zijn rollen (`pine*` = hoofdkleur, `brass*` = accent). Kleuren komen alleen uit `brand.ts`, `apps/mobile/src/lib/theme.ts` en `apps/admin/src/app/globals.css`; schermen gebruiken geen losse hexwaarden. Accent als tekst op licht papier is `brassText` (admin: `brass-text`), op een accentvlak `brassInk`/`brass-ink`. Elk merk moet de contrasttest in `brand.test.ts` halen. De basis van de pilot staat vast als `pilot-v1`; clubwerk verandert de code voor alle clubs, dus Greenside moet er precies hetzelfde uit blijven zien.

## UI/UX-skill

`.claude/skills/ui-ux-pro-max` gebruiken we voor controles op toegankelijkheid, interactie en lay-out (contrast ≥ 4,5:1, tikdoelen ≥ 44 pt, labels, tekstgrootte). Stijl, kleuren en lettertypes uit de skill (`--design-system`) nemen we niet over: het merk hierboven gaat voor.

## Controleren

```bash
pnpm typecheck && pnpm lint && pnpm test
PGHOST=... PGUSER=postgres ./supabase/tests/run-local.sh   # migraties, RLS, boekhouding, demodata
pnpm demo                                                  # volledige demo lokaal (zie DEMO.md)
```

Bedragen staan in centen; btw wordt per regel afgerond. Nieuwe databasewijzigingen komen in een nieuwe migratie, met tests in `supabase/tests/database.test.sql`.
