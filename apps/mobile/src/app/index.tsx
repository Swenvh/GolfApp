import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { LogoMark } from '@/components/brand';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

/** Startpunt: stuurt door naar login, clubkeuze of de app zelf. */
export default function Index() {
  const { loading, session, member } = useSession();
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.pine900, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={72} /></View>;
  if (!session) return <Redirect href="/login" />;
  if (!member) return <Redirect href="/kies-club" />;
  return <Redirect href="/(tabs)" />;
}
