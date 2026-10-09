import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';
import type { ComponentProps } from 'react';
import { haptic } from '@/lib/haptics';
import { useSession } from '@/lib/session';
import { colors, fonts } from '@/lib/theme';

export default function TabsLayout() {
  const { member, loading } = useSession();
  if (!loading && !member) return <Redirect href="/" />;

  type TabIcon = ComponentProps<typeof Ionicons>['name'];
  const icon = (name: TabIcon, active: TabIcon) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Ionicons name={focused ? active : name} size={26} color={color} />
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
        // Uitzondering op 'niets onder 13 pt': zo past 'Wedstrijden' in vijf tabs op een smalle telefoon (iOS zelf: 10 pt)
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0 },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarAllowFontScaling: false,
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
