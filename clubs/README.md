# Clubs met een eigen (branded) app

Elke map hier is één club die een eigen app krijgt in de App Store en Play Store. De code is voor
alle clubs dezelfde (de basis is `pilot-v1`); een club toevoegen raakt dus nooit de app of een andere club.

## Wat staat er in een clubmap

| Bestand | Wat |
| --- | --- |
| `club.json` | Naam in de store, app-ID, gekoppelde club (slug in de database), kleuren voor icoon en opstartscherm |
| `logo.svg` of `logo.png` | Logo van de club (vierkant, transparante achtergrond). Optioneel: zonder logo wordt het een monogram |
| `icon.png`, `android-icon-*.png`, `splash-icon.png`, `favicon.png` | Gemaakt door `pnpm club:assets <club>`; niet met de hand aanpassen |

De kleuren zelf staan in `packages/shared/src/brand.ts` (één merk per club). Een test controleert dat
`club.json` en `brand.ts` hetzelfde zeggen en dat alle tekst leesbaar is (contrast ≥ 4,5:1).

## Nieuwe club

1. Voeg een merk toe in `packages/shared/src/brand.ts` (kopieer `zwolle`, pas naam, monogram en kleuren aan) en zet het in `brands`.
2. Maak `clubs/<club>/club.json` (kopieer die van Zwolle).
3. Logo erbij als `clubs/<club>/logo.svg` (of `.png`) en draai `pnpm club:assets <club>`.
4. Heeft de club een logo, voeg dan in `apps/mobile/src/lib/brandAssets.ts` één `require`-regel toe.
5. Zet in Greenside HQ bij de klant het merk op `<club>`, zodat ook het clubbeheer de clubkleuren krijgt.
6. `pnpm test` moet groen zijn.

## Bouwen

```bash
CLUB=zwolle npx expo start                      # lokaal bekijken (in apps/mobile)
cd apps/mobile && eas build --profile zwolle    # build voor de stores (Expo-account nodig)
```
