import type { ImageSourcePropType } from 'react-native';
import { brand } from './theme';

/** Logo's van een club met een eigen merk (gemaakt door pnpm club:assets, zie clubs/README.md) */
export interface ClubLogos {
  /** Volledig logo, licht gemaakt voor een donkere ondergrond (inlogscherm) */
  logoLight: ImageSourcePropType;
  /** Compact beeldmerk voor een donkere ondergrond (clubhuis, lidmaatschapskaart) */
  markLight: ImageSourcePropType;
  /** Compact beeldmerk in de originele kleuren, voor licht papier */
  mark: ImageSourcePropType;
  /** Breedte/hoogte van het volledige logo */
  logoAspect: number;
}

/**
 * Metro bundelt alleen bestanden die hier letterlijk met require() staan; voeg bij een nieuwe club
 * met een eigen logo één blok toe.
 */
const logos: Record<string, ClubLogos> = {
  zwolle: {
    logoLight: require('../../../../clubs/zwolle/logo-light.png'),
    markLight: require('../../../../clubs/zwolle/mark-light.png'),
    mark: require('../../../../clubs/zwolle/mark.png'),
    logoAspect: 4.0,
  },
};

/** Logo's van de club van deze app, of null (dan toont de app het monogram of het Greenside-merk) */
export const clubLogos: ClubLogos | null = brand.hasLogo ? logos[brand.key] ?? null : null;
