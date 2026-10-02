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
