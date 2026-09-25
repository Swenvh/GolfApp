/**
 * Greenside — merkthema.
 *
 * Eén vast thema: diep dennengroen van de baan, warm messing van de vlaggenstok,
 * krijtwit papier van de scorekaart. Kleuren, typografie en maten komen alleen
 * hiervandaan; schermen gebruiken nooit losse hexwaarden.
 */
import { Platform } from 'react-native';

export const colors = {
  // Dennengroen
  pine950: '#07201A',
  pine900: '#0B2A21',
  pine800: '#10392D',
  pine700: '#174A3A',
  pine600: '#23604B',
  pine400: '#5E8F7B',
  pine100: '#DCE8E0',
  pine50: '#EEF4EF',
  // Messing
  brass: '#B8924A',
  brassLight: '#D9BC82',
  brassSoft: '#F4ECDB',
  // Papier en inkt
  chalk: '#F4F5F0',
  paper: '#FFFFFF',
  ink: '#12201A',
  slate: '#56655D',
  mist: '#8C9A92',
  line: '#E3E7E0',
  lineStrong: '#CBD3CC',
  // Signaal
  flag: '#B8412E',
  flagSoft: '#F7E4DF',
  // Op donkere ondergrond
  onDark: '#F4F5F0',
  onDarkMuted: 'rgba(244,245,240,0.62)',
  onDarkLine: 'rgba(244,245,240,0.12)',
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
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.bodyHeavy, fontSize: 11, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  number: { fontFamily: fonts.display, fontVariant: ['tabular-nums' as const] },
} as const;

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(11,42,33,0.05), 0 8px 24px -12px rgba(11,42,33,0.18)' } as object,
  default: {
    shadowColor: colors.pine900,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});
