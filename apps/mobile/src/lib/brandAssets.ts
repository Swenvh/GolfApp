import type { ImageSourcePropType } from 'react-native';
import { brand } from './theme';

/**
 * Logo's van branded clubs. Metro bundelt alleen bestanden die hier letterlijk met require() staan;
 * voeg bij een nieuwe club met een eigen logo één regel toe (zie clubs/README.md).
 */
const logos: Record<string, ImageSourcePropType> = {
  // zwolle: require('../../../../clubs/zwolle/logo.png'),
};

/** Logo van de club van deze app, of null (dan toont de app het monogram) */
export const clubLogo: ImageSourcePropType | null = logos[brand.key] ?? null;
