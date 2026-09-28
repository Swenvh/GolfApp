import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { secureStorage } from './secureStorage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Sessie in de Keychain/Keystore van de telefoon; op het web de standaardopslag van de browser
      storage: Platform.OS === 'web' ? undefined : secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Alleen tokens verversen terwijl de app op de voorgrond is
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
