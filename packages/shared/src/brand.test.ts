import { describe, expect, it } from 'vitest';
import { brandContrastPairs, brandCssVars, brands, contrastRatio, getBrand, greenside } from './brand';

describe('merken', () => {
  it('rekent contrast zoals WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  for (const brand of Object.values(brands)) {
    it(`${brand.name}: alle tekstcombinaties halen 4,5:1`, () => {
      const failing = brandContrastPairs(brand.colors)
        .map(([label, fg, bg]) => ({ label, ratio: contrastRatio(fg, bg) }))
        .filter((p) => p.ratio < 4.5)
        .map((p) => `${p.label}: ${p.ratio.toFixed(2)}`);
      expect(failing).toEqual([]);
    });

    it(`${brand.name}: alle kleuren zijn geldige hexcodes`, () => {
      for (const v of Object.values(brand.colors)) expect(v).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(brand.key).toMatch(/^[a-z0-9-]+$/);
    });
  }

  it('valt terug op Greenside bij een onbekend of leeg merk', () => {
    expect(getBrand(null)).toBe(greenside);
    expect(getBrand('bestaat-niet')).toBe(greenside);
    expect(getBrand('zwolle').name).toBe('Golfclub Zwolle');
  });

  it('Greenside behoudt exact de kleuren van pilot-v1 in het clubbeheer', () => {
    const v = brandCssVars(greenside);
    expect(v['--color-brand-600']).toBe('#174A3A');
    expect(v['--color-pine-900']).toBe('#0B2A21');
    expect(v['--color-brass-text']).toBe('#86652A');
    expect(v['--color-stone-900']).toBe('#12201A');
  });
});

describe('de basis (pilot-v1) blijft onveranderd', () => {
  it('Greenside heeft exact de kleuren van pilot-v1', () => {
    // Waarden uit pilot-v1 (apps/mobile/src/lib/theme.ts en apps/admin): nooit aanpassen voor een club
    expect(greenside.colors).toEqual({
      pine950: '#07201A', pine900: '#0B2A21', pine800: '#10392D', pine700: '#174A3A', pine600: '#23604B',
      pine400: '#5E8F7B', pine100: '#DCE8E0', pine50: '#EEF4EF',
      brass: '#B8924A', brassLight: '#D9BC82', brassSoft: '#F4ECDB', brassText: '#86652A',
      brassInk: '#7A5C22', brassDeep: '#5F4818', brassBadge: '#6B4F1B',
      chalk: '#F4F5F0', ink: '#12201A', slate: '#56655D', mist: '#5F6E66', line: '#E3E7E0', lineStrong: '#CBD3CC',
      stone100: '#ECEEE8', stone400: '#8C9A92', stone700: '#3D4A43', stone800: '#26322B',
    });
    expect(greenside.name).toBe('Greenside');
    expect(greenside.hasLogo).toBe(false);
  });
});
