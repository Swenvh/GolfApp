# Clubs met een eigen (branded) app

Elke map hier is één club die een eigen app krijgt in de App Store en Play Store. De code is voor
alle clubs dezelfde (de basis is `pilot-v1`); een club toevoegen raakt dus nooit de app of een andere club.

## Wat staat er in een clubmap

| Bestand | Wat |
| --- | --- |
| `club.json` | Naam in de store, app-ID, gekoppelde club (slug in de database), kleuren voor icoon en opstartscherm |
| `logo.svg` of `logo.png` | Volledig logo van de club (mag breed zijn, transparante achtergrond). Zonder logo wordt het een monogram |
| `mark.svg` of `mark.png` | Optioneel: compact beeldmerk voor het app-icoon en kleine plekken (anders het logo) |
| `icon.png`, `android-icon-*.png`, `splash-icon.png`, `favicon.png`, `logo-light.png`, `mark-light.png`, `mark-color.png` | Gemaakt door `pnpm club:assets <club>`; niet met de hand aanpassen. De `-light`-versies zijn voor donkere achtergronden |

Het clubbeheer krijgt `logo-light.png` via `apps/admin/public/brands/<merk>/` (ook door het script).

De kleuren zelf staan in `packages/shared/src/brand.ts` (één merk per club). Een test controleert dat
`club.json` en `brand.ts` hetzelfde zeggen en dat alle tekst leesbaar is (contrast ≥ 4,5:1).

## Nieuwe club

1. Voeg een merk toe in `packages/shared/src/brand.ts` (kopieer `zwolle`, pas naam, monogram en kleuren aan) en zet het in `brands`.
2. Maak `clubs/<club>/club.json` (kopieer die van Zwolle).
3. Logo erbij als `clubs/<club>/logo.svg` (of `.png`) en draai `pnpm club:assets <club>`.
4. Heeft de club een logo: zet `hasLogo: true` in `brand.ts` en voeg in `apps/mobile/src/lib/brandAssets.ts` het blok met `require`-regels toe.
5. Zet in Greenside HQ bij de klant het merk op `<club>`, zodat ook het clubbeheer de clubkleuren krijgt.
6. `pnpm test` moet groen zijn.

## Bouwen

```bash
CLUB=zwolle npx expo start                      # lokaal bekijken (in apps/mobile)
cd apps/mobile && eas build --profile zwolle    # build voor de stores (Expo-account nodig)
```
