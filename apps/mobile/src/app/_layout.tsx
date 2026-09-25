import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '@/lib/session';
import { useTheme } from '@/lib/theme';

function RootStack() {
  const t = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.card },
          headerTintColor: t.primary,
          headerTitleStyle: { color: t.text },
          contentStyle: { backgroundColor: t.bg },
          headerBackTitle: 'Terug',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="kies-club" options={{ title: 'Kies je club' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="boeken" options={{ title: 'Starttijd boeken', presentation: 'modal' }} />
        <Stack.Screen name="scorekaart" options={{ title: 'Scorekaart' }} />
        <Stack.Screen name="wedstrijd/[id]" options={{ title: 'Wedstrijd' }} />
        <Stack.Screen name="factuur/[id]" options={{ title: 'Factuur' }} />
        <Stack.Screen name="facturen" options={{ title: 'Facturen' }} />
        <Stack.Screen name="ledenlijst" options={{ title: 'Ledenlijst' }} />
        <Stack.Screen name="gegevens" options={{ title: 'Mijn gegevens' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <RootStack />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
