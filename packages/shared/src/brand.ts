/**
 * Merken per club. Elke club die een eigen (branded) app krijgt, heeft hier één definitie;
 * de ledenapp kiest het merk bij het bouwen, het clubbeheer per ingelogde club.
 *
 * De namen van de tokens beschrijven een rol, niet letterlijk een kleur:
 *  - pine*  = hoofdkleur (donker vlak, knoppen, koppen)
 *  - brass* = accentkleur (vlaggetje, eyebrows, nadruk)
 *  - ink/slate/mist/line/chalk = neutrale tinten met een zweem van de hoofdkleur
 * Signaalkleuren (rood voor fout, oranje voor waarschuwing) zijn voor elk merk gelijk.
 */

export interface BrandColors {
  pine950: string;
  pine900: string;
  pine800: string;
  pine700: string;
  pine600: string;
  pine400: string;
  pine100: string;
  pine50: string;
  brass: string;
  brassLight: string;
  brassSoft: string;
  /** Accent als tekst op licht papier (contrast ≥ 4,5:1) */
  brassText: string;
  /** Accent als tekst op brassSoft (labels, pillen) */
  brassInk: string;
  /** Donkerste accenttint, voor tekst in een accentvlak */
  brassDeep: string;
  chalk: string;
  ink: string;
  slate: string;
  mist: string;
  line: string;
  lineStrong: string;
  /** Neutrale tinten voor het clubbeheer (stone-100/400/700/800) */
  stone100: string;
  stone400: string;
  stone700: string;
  stone800: string;
}

export interface Brand {
  key: string;
  /** Naam zoals leden hem zien: in de app, de App Store en het clubbeheer */
  name: string;
  /** Korte naam voor kleine plekken (icoon, tabblad) */
  shortName: string;
  /** Letters voor het monogram zolang er geen eigen logo is */
  monogram: string;
  /** true = kleuren nog niet door de club bevestigd */
  provisional: boolean;
  colors: BrandColors;
}

export const greenside: Brand = {
  key: 'greenside',
  name: 'Greenside',
  shortName: 'Greenside',
  monogram: 'G',
  provisional: false,
  colors: {
    pine950: '#07201A',
    pine900: '#0B2A21',
    pine800: '#10392D',
    pine700: '#174A3A',
    pine600: '#23604B',
    pine400: '#5E8F7B',
    pine100: '#DCE8E0',
    pine50: '#EEF4EF',
    brass: '#B8924A',
    brassLight: '#D9BC82',
    brassSoft: '#F4ECDB',
    brassText: '#86652A',
    brassInk: '#7A5C22',
    brassDeep: '#5F4818',
    chalk: '#F4F5F0',
    ink: '#12201A',
    slate: '#56655D',
    mist: '#5F6E66',
    line: '#E3E7E0',
    lineStrong: '#CBD3CC',
    stone100: '#ECEEE8',
    stone400: '#8C9A92',
    stone700: '#3D4A43',
    stone800: '#26322B',
  },
};

/**
 * Golfclub Zwolle — VOORLOPIG: marineblauw met goud als werkpalet.
 * Vervangen door de officiële clubkleuren zodra de club die aanlevert (hexcodes of huisstijlgids).
 */
export const zwolle: Brand = {
  key: 'zwolle',
  name: 'Golfclub Zwolle',
  shortName: 'GC Zwolle',
  monogram: 'GZ',
  provisional: true,
  colors: {
    pine950: '#071628',
    pine900: '#0B2140',
    pine800: '#10305A',
    pine700: '#173F73',
    pine600: '#23558F',
    pine400: '#5F86B5',
    pine100: '#DCE6F2',
    pine50: '#EEF3F9',
    brass: '#C2A04A',
    brassLight: '#E2C77E',
    brassSoft: '#F6EDD6',
    brassText: '#7E6220',
    brassInk: '#715716',
    brassDeep: '#574313',
    chalk: '#F4F6F8',
    ink: '#111B26',
    slate: '#525F6C',
    mist: '#5A6774',
    line: '#E1E5EA',
    lineStrong: '#C8D0D9',
    stone100: '#EBEEF2',
    stone400: '#8A96A3',
    stone700: '#3B4652',
    stone800: '#252F3A',
  },
};

export const brands: Record<string, Brand> = { greenside, zwolle };

/** Merk bij een sleutel; onbekend of leeg = Greenside */
export function getBrand(key?: string | null): Brand {
  return (key && brands[key]) || greenside;
}

// ── Contrast (WCAG 2.x)
function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Combinaties tekst/achtergrond die in de app en het clubbeheer voorkomen; elk moet ≥ 4,5:1 halen */
export function brandContrastPairs(c: BrandColors): [string, string, string][] {
  const white = '#FFFFFF';
  return [
    ['ink op papier', c.ink, white],
    ['ink op chalk', c.ink, c.chalk],
    ['slate op chalk', c.slate, c.chalk],
    ['mist op papier', c.mist, white],
    ['mist op chalk', c.mist, c.chalk],
    ['brassText op papier', c.brassText, white],
    ['brassText op chalk', c.brassText, c.chalk],
    ['brassInk op brassSoft', c.brassInk, c.brassSoft],
    ['brassDeep op brassSoft', c.brassDeep, c.brassSoft],
    ['wit op pine700 (knop)', white, c.pine700],
    ['wit op pine600', white, c.pine600],
    ['pine700 op papier', c.pine700, white],
    ['pine600 op chalk', c.pine600, c.chalk],
    ['chalk op pine900', c.chalk, c.pine900],
    ['brassLight op pine900 (eyebrow)', c.brassLight, c.pine900],
    ['brassLight op pine800', c.brassLight, c.pine800],
    ['pine800 op pine50', c.pine800, c.pine50],
    ['stone700 op stone100', c.stone700, c.stone100],
  ];
}

/** CSS-variabelen voor het clubbeheer (Tailwind-thema), zodat dezelfde klassen de kleuren van de club krijgen */
export function brandCssVars(brand: Brand): Record<string, string> {
  const c = brand.colors;
  return {
    '--color-brand-50': c.pine50,
    '--color-brand-100': c.pine100,
    '--color-brand-500': c.pine600,
    '--color-brand-600': c.pine700,
    '--color-brand-700': c.pine800,
    '--color-pine-800': c.pine800,
    '--color-pine-900': c.pine900,
    '--color-pine-950': c.pine950,
    '--color-brass': c.brass,
    '--color-brass-light': c.brassLight,
    '--color-brass-soft': c.brassSoft,
    '--color-brass-text': c.brassText,
    '--color-brass-ink': c.brassInk,
    '--color-brass-deep': c.brassDeep,
    '--color-chalk': c.chalk,
    '--color-stone-50': c.chalk,
    '--color-stone-100': c.stone100,
    '--color-stone-200': c.line,
    '--color-stone-300': c.lineStrong,
    '--color-stone-400': c.stone400,
    '--color-stone-500': c.mist,
    '--color-stone-600': c.slate,
    '--color-stone-700': c.stone700,
    '--color-stone-800': c.stone800,
    '--color-stone-900': c.ink,
  };
}
