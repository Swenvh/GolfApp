import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';
import type { IconName } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useSession } from '@/lib/session';
import { colors, fonts } from '@/lib/theme';

export default function TabsLayout() {
  const { member, loading } = useSession();
  if (!loading && !member) return <Redirect href="/" />;

  const icon = (name: IconName, active: IconName) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Ionicons name={focused ? active : name} size={23} color={color} />
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? colors.brass : 'transparent' }} />
      </View>
    );

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pine800,
        tabBarInactiveTintColor: colors.mist,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Clubhuis', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="starttijden" options={{ title: 'Starttijden', tabBarIcon: icon('time-outline', 'time') }} />
      <Tabs.Screen name="wedstrijden" options={{ title: 'Wedstrijden', tabBarIcon: icon('trophy-outline', 'trophy') }} />
      <Tabs.Screen name="scores" options={{ title: 'Scores', tabBarIcon: icon('golf-outline', 'golf') }} />
      <Tabs.Screen name="profiel" options={{ title: 'Profiel', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
