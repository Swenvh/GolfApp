import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Opslag voor de inlogsessie in de beveiligde opslag van de telefoon (iOS Keychain,
 * Android Keystore) in plaats van onversleuteld in AsyncStorage. Alleen op dit toestel,
 * niet in back-ups. Een sessie is groter dan wat de beveiligde opslag per sleutel aankan,
 * dus wordt hij in stukken opgeslagen.
 */
const CHUNK = 1800;
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const countKey = (key: string) => `${key}.n`;
const partKey = (key: string, i: number) => `${key}.${i}`;

async function readCount(key: string): Promise<number | null> {
  const n = await SecureStore.getItemAsync(countKey(key), options);
  return n == null ? null : Number(n);
}

async function removeParts(key: string, from: number, to: number) {
  for (let i = from; i < to; i++) await SecureStore.deleteItemAsync(partKey(key, i), options);
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await readCount(key);
    if (count == null) {
      // Eenmalig overzetten van een sessie die nog in de oude, onversleutelde opslag staat
      const legacy = await AsyncStorage.getItem(key);
      if (legacy != null) {
        await secureStorage.setItem(key, legacy);
        await AsyncStorage.removeItem(key);
      }
      return legacy;
    }
    let value = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(partKey(key, i), options);
      if (part == null) return null;
      value += part;
    }
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    const previous = (await readCount(key)) ?? 0;
    const parts = value.match(new RegExp(`[\\s\\S]{1,${CHUNK}}`, 'g')) ?? [''];
    for (let i = 0; i < parts.length; i++) await SecureStore.setItemAsync(partKey(key, i), parts[i]!, options);
    await SecureStore.setItemAsync(countKey(key), String(parts.length), options);
    await removeParts(key, parts.length, previous);
  },

  async removeItem(key: string): Promise<void> {
    const count = (await readCount(key)) ?? 0;
    await removeParts(key, 0, count);
    await SecureStore.deleteItemAsync(countKey(key), options);
    await AsyncStorage.removeItem(key);
  },
};
