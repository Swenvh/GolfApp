import fs from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

/**
 * Eén codebase, twee manieren van uitrollen:
 *  1. Platform-app "Greenside": leden kiezen zelf hun club (standaard).
 *  2. Branded app per club: bouw met CLUB=<map> (bijv. CLUB=zwolle). Naam, app-ID, kleuren, icoon
 *     en opstartscherm komen dan uit clubs/<map>/club.json; de app is vast gekoppeld aan die club.
 *     Losse instellingen (CLUB_SLUG, APP_NAME, BUNDLE_ID, BRAND) gaan daar nog boven.
 */
interface ClubPackage {
  brand: string;
  clubSlug: string;
  appName: string;
  bundleId: string;
  scheme: string;
  /** Achtergrond van het opstartscherm en het Android-icoon (pine900 van het merk) */
  splashBackground: string;
  /** Hoofdkleur (pine700) en papierkleur (chalk) van het merk, voor de systeembalken */
  primaryColor: string;
  backgroundColor: string;
  /** Breedte van het logo op het opstartscherm (breed logo: groter) */
  splashImageWidth?: number;
}

const clubDir = process.env.CLUB ? path.resolve(__dirname, '../../clubs', process.env.CLUB) : null;
if (clubDir && !/^[a-z0-9-]+$/.test(process.env.CLUB!)) throw new Error('CLUB mag alleen kleine letters, cijfers en - bevatten');
const club: ClubPackage | null = clubDir ? JSON.parse(fs.readFileSync(path.join(clubDir, 'club.json'), 'utf8')) : null;
/** Bestand uit de clubmap als het bestaat, anders het Greenside-bestand */
const asset = (file: string) => (clubDir && fs.existsSync(path.join(clubDir, file)) ? path.join(clubDir, file) : `./assets/${file}`);

const clubSlug = process.env.CLUB_SLUG ?? club?.clubSlug ?? '';
const name = process.env.APP_NAME ?? club?.appName ?? 'Greenside';
const bundleId = process.env.BUNDLE_ID ?? club?.bundleId ?? 'nl.golfapp.leden';
const brand = process.env.BRAND ?? club?.brand ?? 'greenside';
const splashBackground = club?.splashBackground ?? '#0B2A21';
/** Het account waarmee Apple en Google de app keuren (zie scripts/app-review.mjs) */
const reviewEmail = process.env.REVIEW_EMAIL ?? 'appreview@greenside.test';

const config: ExpoConfig = {
  name,
  slug: 'greenside',
  scheme: club?.scheme ?? 'greenside',
  version: '1.0.0',
  orientation: 'portrait',
  icon: asset('icon.png'),
  userInterfaceStyle: 'light',
  primaryColor: club?.primaryColor ?? '#174A3A',
  backgroundColor: club?.backgroundColor ?? '#F4F5F0',
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: splashBackground,
      foregroundImage: asset('android-icon-foreground.png'),
      backgroundImage: asset('android-icon-background.png'),
      monochromeImage: asset('android-icon-monochrome.png'),
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: asset('favicon.png') },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-splash-screen', { image: asset('splash-icon.png'), backgroundColor: splashBackground, imageWidth: club?.splashImageWidth ?? 180 }],
  ],
  experiments: { typedRoutes: false },
  extra: { clubSlug, brand, reviewEmail },
};

export default config;
