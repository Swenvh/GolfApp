#!/usr/bin/env node
/**
 * Maakt de beeldbestanden van een branded club: app-iconen, opstartscherm en de logo's voor in de app
 * en het clubbeheer.
 *
 *   pnpm club:assets zwolle
 *
 * Bronnen in clubs/<club>/ (transparante achtergrond, zo groot mogelijk; liefst SVG):
 *  - logo.svg / logo.png  het volledige logo (mag breed zijn), voor het inlogscherm en het clubbeheer
 *  - mark.svg / mark.png  optioneel: een compact beeldmerk voor het app-icoon en kleine plekken
 *                         (zonder mark wordt het logo gebruikt)
 * Zonder logo maakt het script een monogram in de clubkleuren uit club.json.
 *
 * Uitvoer in clubs/<club>/: icon.png, android-icon-*.png, splash-icon.png, favicon.png en, met een logo,
 * mark-color.png (beeldmerk in de clubkleuren, voor licht papier) en logo-light.png en mark-light.png
 * (donkere delen licht gemaakt, voor donkere achtergronden).
 * Het clubbeheer krijgt logo-light.png in apps/admin/public/brands/<merk>/.
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
for (const key of ['brand', 'splashBackground', 'backgroundColor', 'accentColor', 'monogram']) {
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

const source = (base) => ['svg', 'png'].map((ext) => path.join(dir, `${base}.${ext}`)).find((f) => fs.existsSync(f)) ?? null;
const logoFile = source('logo');
const markFile = source('mark') ?? logoFile;
const out = (file) => path.join(dir, file);
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const luminance = (h) => { const [r, g, b] = hex(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

/** Bron als PNG-buffer, passend in w × h (verhouding blijft) */
// SVG's van het logo hebben al een grote viewBox; kleine SVG's krijgen een hogere dichtheid
const load = (file, w, h) => sharp(file, { density: file.endsWith('.svg') && fs.statSync(file).size < 4000 ? 600 : 72 }).resize(w, h, { fit: 'contain', background: clear }).ensureAlpha().png().toBuffer();

/** Lichte versie voor een donkere ondergrond: donkere pixels krijgen de papierkleur, kleur blijft */
async function lighten(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const [lr, lg, lb] = hex(club.backgroundColor);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat < 40 && (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5) { data[i] = lr; data[i + 1] = lg; data[i + 2] = lb; }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** Alleen de vorm, in wit (monochroom Android-icoon) */
async function silhouette(buf) {
  const alpha = await sharp(buf).ensureAlpha().extractChannel(3).png().toBuffer();
  const { width, height } = await sharp(buf).metadata();
  return sharp({ create: { width, height, channels: 3, background: '#FFFFFF' } }).joinChannel(alpha).png().toBuffer();
}

/** Monogram (ring + letters) als er geen logo is */
async function monogram(size, fill) {
  const letters = club.monogram;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <circle cx="512" cy="512" r="440" fill="none" stroke="${fill}" stroke-width="22"/>
    <text x="512" y="512" dy="0.35em" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="${letters.length > 1 ? 330 : 470}" letter-spacing="-8" fill="${fill}">${letters}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

const iconBg = club.iconBackground ?? club.splashBackground;
const darkIcon = luminance(iconBg) < 0.5;
/** Beeldmerk passend in een vierkant van `size`, in de juiste variant voor de achtergrond */
async function mark(size, onDark) {
  if (!markFile) return monogram(size, onDark ? club.accentColor : club.splashBackground);
  const buf = await load(markFile, size, size);
  return onDark ? lighten(buf) : buf;
}
const canvas = (size, background) => sharp({ create: { width: size, height: size, channels: 4, background } });

// iOS-icoon: beeldmerk op de icoonkleur, zonder transparantie
const iconBuf = await canvas(1024, iconBg).composite([{ input: await mark(club.iconMarkSize ?? 760, darkIcon), gravity: 'center' }]).png().toBuffer();
await sharp(iconBuf).flatten({ background: iconBg }).removeAlpha().png().toFile(out('icon.png'));
// Android adaptive icon: voorgrond binnen de veilige zone (66%), achtergrond effen
await canvas(1024, clear).composite([{ input: await mark(620, darkIcon), gravity: 'center' }]).png().toFile(out('android-icon-foreground.png'));
await canvas(1024, iconBg).removeAlpha().png().toFile(out('android-icon-background.png'));
await canvas(1024, clear).composite([{ input: await silhouette(await mark(620, false)), gravity: 'center' }]).png().toFile(out('android-icon-monochrome.png'));
await canvas(96, iconBg).composite([{ input: await mark(84, darkIcon), gravity: 'center' }]).png().toFile(out('favicon.png'));

// Opstartscherm (donkere achtergrond uit app.config) en logo's voor in de app en het clubbeheer
if (logoFile) {
  const logo = await load(logoFile, 1600, 1600);
  const logoLight = await lighten(logo);
  await sharp(logoLight).trim().png().toFile(out('logo-light.png'));
  const markBuf = await load(markFile, 1024, 1024);
  await sharp(markBuf).trim().png().toFile(out('mark-color.png'));
  await sharp(await lighten(markBuf)).trim().png().toFile(out('mark-light.png'));
  await sharp(logoLight).trim().resize(1024, 1024, { fit: 'contain', background: clear }).png().toFile(out('splash-icon.png'));
  const pub = path.join(root, 'apps/admin/public/brands', club.brand);
  fs.mkdirSync(pub, { recursive: true });
  fs.copyFileSync(out('logo-light.png'), path.join(pub, 'logo-light.png'));
} else {
  await sharp(await mark(1024, true)).png().toFile(out('splash-icon.png'));
}

fs.rmSync(fontDir, { recursive: true, force: true });
console.log(`Beelden voor ${club.appName} staan in clubs/${name}/ (${logoFile ? 'uit het logo' : 'monogram, nog geen logo'})`);
