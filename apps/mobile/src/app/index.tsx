import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { useSession } from '@/lib/session';

/** Startpunt: stuurt door naar login, clubkeuze of de app zelf. */
export default function Index() {
  const { loading, session, member } = useSession();
  if (loading) return <Loading />;
  if (!session) return <Redirect href="/login" />;
  if (!member) return <Redirect href="/kies-club" />;
  return <Redirect href="/(tabs)" />;
}
