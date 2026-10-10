# Greenside · Beveiliging

_Interne beveiligingscheck, 10 oktober 2026. Gedaan met de databasetests (`supabase/tests`)
en een gerichte review van de beveiligingskritieke code. Dit is geen externe penetratietest:
een onafhankelijke pentest (begroot op € 7.500) blijft onderdeel van de lancering._

## Oordeel

Geen kwetsbaarheden gevonden in de paden die ertoe doen: clubscheiding, de importer, de
onboarding en het lekken van sleutels. Het systeem is met meerdere lagen verdediging opgezet
(RLS in de database, autorisatie in het clubbeheer, en een eigen controle vóór elke
service-role-actie in de edge functions).

## Wat is gecontroleerd

### Databasetests — geslaagd
`PGHOST=… PGUSER=postgres ./supabase/tests/run-local.sh` tegen een lokale PostgreSQL:

- Migraties, RLS-policies, `database.test.sql` en de demodata laden foutloos.
- Het grootboek is in balans na de demodata (zes weken gebruik).
- De test dwingt clubscheiding hard af, in vier richtingen: beheerder én lid van elke club
  zien en wijzigen **niets** van de andere club — geen starttijden, cijfers, facturen,
  horeca op rekening of pasnummers. Ook: een beheerder kan niet in een andere club
  importeren, en een lid kan niet importeren.

### 1. Geen gelekte sleutels of secrets
- `SERVICE_ROLE` komt nergens voor in `apps/` of `packages/`; de service-role-sleutel wordt
  alleen server-side gebruikt, in de edge functions (`supabase/functions`).
- Naar de browser gaan uitsluitend de **anon-sleutel** en de URL (`NEXT_PUBLIC_*`). De
  ledenapp (`apps/mobile`) gebruikt alleen de anon-sleutel met RLS.
- Geen hardcoded wachtwoorden of tokens in de code; alles komt uit `process.env` / `Deno.env`.

### 2. Clubscheiding (een club kan niet bij een andere club)
- Het clubbeheer draait op de **anon-sleutel met de sessie van de ingelogde gebruiker**, dus
  RLS geldt bij elke query. De geselecteerde club (cookie) wordt gevalideerd tegen de clubs
  waar de medewerker daadwerkelijk staf is (`lib/club.ts`) — een vreemde club kiezen kan niet.
- De service-role-client (`adminClient`) staat in `_shared/supabase.ts` met de expliciete
  regel: "omzeilt RLS — alleen gebruiken na eigen autorisatiecontrole".

### 3. De importer
- De club komt uit de **ingelogde context** (`ctx.club.id`), nooit uit het verzoek.
- Invoer wordt tot bekende tekstvelden gefilterd (allowlist), met limieten (5000 regels per
  keer, 200 tekens per veld). Wat de browser ook meestuurt, er gaat niets anders naar de
  database; de verwerking loopt via de RLS-gedekte functie `import_members`.

### 4. Onboarding en uitnodigen
- `invite-member` (edge function): leden eerst via RLS lezen → een mismatch geeft 404 vóór
  enige service-role-actie → expliciete `is_club_staff`-check → de service-role-update is
  dubbel begrensd op `club_id`.
- `claim_my_accounts` koppelt een account alleen aan een lid bij een **bevestigd**
  e-mailadres (`email_confirmed_at`), en alleen als er precies één lid met dat adres in de
  club is; `anon` mag de functie niet uitvoeren.

## Aandachtspunt (geen bug)

De koppeling lid ↔ account steunt erop dat de club het juiste e-mailadres bij een lid zet,
plus de e-mailbevestiging van Supabase. Dat is de juiste aanname, maar het betekent dat wie
een ledenmailadres in het beheer kan wijzigen, de koppeling beïnvloedt. Dat is terecht
beperkt tot clubstaf (secretariaat/beheerder).

## Grenzen van deze check

- Dit is een review van de code en de databasetests, geen volledige externe pentest. De
  onafhankelijke beveiligingstest vóór livegang (zie het plan) blijft nodig.
- Een geplande autonome scan met Strix kon in deze omgeving niet draaien: het netwerkbeleid
  blokkeert het ophalen van de sandbox-image. Dat zegt niets over de veiligheid van de app.
