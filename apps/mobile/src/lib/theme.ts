/**
 * Thema van de ledenapp.
 *
 * Standaard het Greenside-merk: diep dennengroen, warm messing, krijtwit. Een branded clubapp
 * (CLUB=<map> bij het bouwen, zie clubs/) krijgt de kleuren van de club uit packages/shared/src/brand.ts.
 * De tokennamen zijn rollen: pine* = hoofdkleur, brass* = accent. Schermen gebruiken nooit losse hexwaarden.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getBrand } from '@golfapp/shared';

const brandSetting: unknown = Constants.expoConfig?.extra?.brand;
/** Het merk van deze app (Greenside, of de club bij een branded app) */
export const brand = getBrand(typeof brandSetting === 'string' ? brandSetting : null);
const b = brand.colors;

/** Hexkleur met doorzichtigheid, voor tinten van de merkkleuren */
export function withAlpha(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${alpha})`;
}

export const colors = {
  // Hoofdkleur
  pine950: b.pine950,
  pine900: b.pine900,
  pine800: b.pine800,
  pine700: b.pine700,
  pine600: b.pine600,
  pine400: b.pine400,
  pine100: b.pine100,
  pine50: b.pine50,
  // Accent
  brass: b.brass,
  brassLight: b.brassLight,
  brassSoft: b.brassSoft,
  /** Accent als tekst op licht papier (contrast ≥ 4,5:1) */
  brassText: b.brassText,
  /** Accent als tekst op brassSoft */
  brassInk: b.brassInk,
  // Papier en inkt
  chalk: b.chalk,
  paper: '#FFFFFF',
  ink: b.ink,
  slate: b.slate,
  /** Bijschriften en placeholders; donker genoeg voor 4,5:1 op wit en krijtwit */
  mist: b.mist,
  line: b.line,
  lineStrong: b.lineStrong,
  // Signaal (voor elk merk gelijk)
  flag: '#B8412E',
  flagSoft: '#F7E4DF',
  // Op donkere ondergrond
  onDark: b.chalk,
  onDarkMuted: withAlpha(b.chalk, 0.62),
  onDarkLine: withAlpha(b.chalk, 0.12),
  /** Achtergrond achter een venster dat over het scherm ligt */
  scrim: withAlpha(b.pine950, 0.86),
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  displayLight: 'Fraunces_400Regular',
  body: 'Manrope_500Medium',
  bodyRegular: 'Manrope_400Regular',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const type = {
  // Leesbaar voor elke golfer: lopende tekst 17 pt, niets kleiner dan 13 pt (zie ook maxScale in ui.tsx)
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.8 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.display, fontSize: 23, lineHeight: 29, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 25 },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  eyebrow: { fontFamily: fonts.bodyHeavy, fontSize: 13, lineHeight: 17, letterSpacing: 1, textTransform: 'uppercase' as const },
  number: { fontFamily: fonts.display, fontVariant: ['tabular-nums' as const] },
} as const;

export const shadow = Platform.select({
  web: { boxShadow: `0 1px 2px ${withAlpha(b.pine900, 0.05)}, 0 8px 24px -12px ${withAlpha(b.pine900, 0.18)}` } as object,
  default: {
    shadowColor: colors.pine900,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});
