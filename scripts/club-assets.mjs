#!/usr/bin/env node
/**
 * Maakt de app-iconen en het opstartscherm van een branded club.
 *
 *   pnpm club:assets zwolle
 *
 * Bron: clubs/<club>/logo.svg of clubs/<club>/logo.png (vierkant, liefst ≥ 1024 px, transparante achtergrond).
 * Zonder logo maakt het script een monogram in de clubkleuren uit clubs/<club>/club.json.
 * Uitvoer (in clubs/<club>/): icon.png, android-icon-foreground.png, android-icon-background.png,
 * android-icon-monochrome.png, splash-icon.png, favicon.png.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2];
if (!name || !/^[a-z0-9-]+$/.test(name)) {
  console.error('Gebruik: pnpm club:assets <club>   (bijv. zwolle)');
  process.exit(1);
}
const dir = path.join(root, 'clubs', name);
const club = JSON.parse(fs.readFileSync(path.join(dir, 'club.json'), 'utf8'));
for (const key of ['splashBackground', 'accentColor', 'monogram']) {
  if (!club[key]) throw new Error(`club.json mist "${key}"`);
}

// Het monogram gebruikt Fraunces, net als de app; librsvg vindt het lettertype via fontconfig
const requireMobile = createRequire(path.join(root, 'apps/mobile/package.json'));
const fontFile = path.join(path.dirname(requireMobile.resolve('@expo-google-fonts/fraunces/package.json')), '600SemiBold/Fraunces_600SemiBold.ttf');
const fontDir = fs.mkdtempSync(path.join(os.tmpdir(), 'club-fonts-'));
fs.copyFileSync(fontFile, path.join(fontDir, 'Fraunces.ttf'));
fs.writeFileSync(path.join(fontDir, 'fonts.conf'),
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><include ignore_missing="yes">/etc/fonts/fonts.conf</include></fontconfig>`);
process.env.FONTCONFIG_FILE = path.join(fontDir, 'fonts.conf');
const { default: sharp } = await import('sharp');

const svgLogo = path.join(dir, 'logo.svg');
const pngLogo = path.join(dir, 'logo.png');
const hasLogo = fs.existsSync(svgLogo) || fs.existsSync(pngLogo);

/** Beeldmerk als PNG van `size` px: het logo, of het monogram (ring + letters) */
async function mark(size, { color = club.accentColor, mono = false } = {}) {
  if (hasLogo) {
    const img = sharp(fs.existsSync(svgLogo) ? svgLogo : pngLogo, { density: 600 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    // Monochroom Android-icoon: alleen de vorm, in wit
    return mono ? img.ensureAlpha().extractChannel('alpha').toColourspace('b-w').joinChannel(
      await sharp(fs.existsSync(svgLogo) ? svgLogo : pngLogo, { density: 600 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().extractChannel('alpha').toBuffer(),
    ).png().toBuffer() : img.png().toBuffer();
  }
  const fill = mono ? '#FFFFFF' : color;
  const letters = club.monogram;
  const fontSize = letters.length > 1 ? 330 : 470;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <circle cx="512" cy="512" r="440" fill="none" stroke="${fill}" stroke-width="22"/>
    <text x="512" y="512" dy="0.35em" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${fontSize}" letter-spacing="-8" fill="${fill}">${letters}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

const bg = club.splashBackground;
const square = (size) => sharp({ create: { width: size, height: size, channels: 4, background: bg } });

// iOS-icoon: beeldmerk op de hoofdkleur, zonder transparantie
const iconBuf = await square(1024).composite([{ input: await mark(700), gravity: 'center' }]).png().toBuffer();
await sharp(iconBuf).flatten({ background: bg }).removeAlpha().png().toFile(path.join(dir, 'icon.png'));
// Android adaptive icon: voorgrond binnen de veilige zone (66%), achtergrond effen
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await mark(560), gravity: 'center' }]).png().toFile(path.join(dir, 'android-icon-foreground.png'));
await square(1024).removeAlpha().png().toFile(path.join(dir, 'android-icon-background.png'));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await mark(560, { mono: true }), gravity: 'center' }]).png().toFile(path.join(dir, 'android-icon-monochrome.png'));
// Opstartscherm: beeldmerk op transparant (de achtergrondkleur zet app.config)
await sharp(await mark(1024)).png().toFile(path.join(dir, 'splash-icon.png'));
await square(96).composite([{ input: await mark(80), gravity: 'center' }]).png().toFile(path.join(dir, 'favicon.png'));

fs.rmSync(fontDir, { recursive: true, force: true });
console.log(`Iconen voor ${club.appName} staan in clubs/${name}/ (${hasLogo ? 'uit het logo' : 'monogram, nog geen logo'})`);
