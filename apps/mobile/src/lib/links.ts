import { Linking } from 'react-native';

/** Alleen echte webadressen (https) openen; andere schema's (javascript:, intent:, file:) nooit. */
export function isSafeWebUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function openWebUrl(url: string | null | undefined): void {
  if (isSafeWebUrl(url)) void Linking.openURL(url);
}
