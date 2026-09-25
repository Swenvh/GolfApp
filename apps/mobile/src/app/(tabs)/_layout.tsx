import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { useSession } from '@/lib/session';
import { useTheme } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const t = useTheme();
  const { member, loading } = useSession();
  if (!loading && !member) return <Redirect href="/" />;

  const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) =>
    <Ionicons name={name} color={color} size={size} />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        headerStyle: { backgroundColor: t.card },
        headerTitleStyle: { color: t.text },
      }}
    >
      <Tabs.Screen name="index" options={{ title: member?.club.name ?? 'Home', tabBarLabel: 'Home', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="starttijden" options={{ title: 'Starttijden', tabBarIcon: icon('time-outline') }} />
      <Tabs.Screen name="wedstrijden" options={{ title: 'Wedstrijden', tabBarIcon: icon('trophy-outline') }} />
      <Tabs.Screen name="scores" options={{ title: 'Scores', tabBarIcon: icon('golf-outline') }} />
      <Tabs.Screen name="profiel" options={{ title: 'Profiel', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
