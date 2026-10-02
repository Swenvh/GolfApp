// Draait alleen in Node (vitest): leest de clubmappen van de repo. Staat daarom buiten de typecheck
// van dit pakket, dat ook in de app (zonder Node) wordt gebruikt.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { brands } from './brand';

describe('clubmappen (clubs/<club>/club.json)', () => {
  const dir = path.resolve(import.meta.dirname, '../../../clubs');
  const clubs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'club.json'))) : [];

  for (const name of clubs) {
    it(`${name}: past bij het merk in brand.ts`, () => {
      const club = JSON.parse(fs.readFileSync(path.join(dir, name, 'club.json'), 'utf8'));
      const brand = brands[club.brand];
      expect(brand, `merk "${club.brand}" bestaat niet in brand.ts`).toBeDefined();
      expect(club.appName).toBe(brand!.name);
      expect(club.monogram).toBe(brand!.monogram);
      expect(club.splashBackground).toBe(brand!.colors.pine900);
      expect(club.primaryColor).toBe(brand!.colors.pine700);
      expect(club.backgroundColor).toBe(brand!.colors.chalk);
      expect(club.accentColor).toBe(brand!.colors.brassLight);
      expect(club.clubSlug).toMatch(/^[a-z0-9-]+$/);
      expect(club.bundleId).toMatch(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/);
      for (const f of ['icon.png', 'android-icon-foreground.png', 'android-icon-background.png', 'android-icon-monochrome.png', 'splash-icon.png', 'favicon.png']) {
        expect(fs.existsSync(path.join(dir, name, f)), `${f} ontbreekt: draai pnpm club:assets ${name}`).toBe(true);
      }
    });
  }
});
