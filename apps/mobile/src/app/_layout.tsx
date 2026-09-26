import {
  Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '@/lib/session';
import { colors, fonts } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_600SemiBold_Italic,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.chalk },
            headerShadowVisible: false,
            headerTintColor: colors.pine700,
            headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
            headerBackTitle: 'Terug',
            contentStyle: { backgroundColor: colors.chalk },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="kies-club" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="boeken" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="scorekaart" options={{ title: 'Scorekaart' }} />
          <Stack.Screen name="wedstrijd/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="factuur/[id]" options={{ title: 'Factuur' }} />
          <Stack.Screen name="facturen" options={{ title: 'Facturen' }} />
          <Stack.Screen name="ledenlijst" options={{ title: 'Ledenlijst' }} />
          <Stack.Screen name="gegevens" options={{ title: 'Mijn gegevens' }} />
          <Stack.Screen name="aanbod/[id]" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="introduceren" options={{ title: 'Introduceer een vriend' }} />
          <Stack.Screen name="upgrade" options={{ title: 'Upgrade' }} />
          <Stack.Screen name="handicart" options={{ title: 'Handicart-pas' }} />
          <Stack.Screen name="lidmaatschap" options={{ title: 'Lidmaatschap' }} />
          <Stack.Screen name="gezin" options={{ title: 'Gezinslid toevoegen' }} />
        </Stack>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
