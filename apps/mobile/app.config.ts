import type { ExpoConfig } from 'expo/config';

/**
 * Eén codebase, twee manieren van uitrollen:
 *  1. Platform-app "GolfApp": leden kiezen zelf hun club (standaard).
 *  2. White-label per club: zet CLUB_SLUG, APP_NAME en BUNDLE_ID in het EAS-profiel;
 *     de app is dan vast gekoppeld aan die club en draagt de naam/icoon van de club.
 */
const clubSlug = process.env.CLUB_SLUG ?? '';
const name = process.env.APP_NAME ?? 'Greenside';
const bundleId = process.env.BUNDLE_ID ?? 'nl.golfapp.leden';

const config: ExpoConfig = {
  name,
  slug: 'greenside',
  scheme: 'greenside',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  primaryColor: '#174A3A',
  backgroundColor: '#F4F5F0',
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: '#0B2A21',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { image: './assets/splash-icon.png', backgroundColor: '#0B2A21', imageWidth: 180 }],
  ],
  experiments: { typedRoutes: false },
  extra: { clubSlug },
};

export default config;
