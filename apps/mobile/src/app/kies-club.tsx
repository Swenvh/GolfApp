import { Redirect, router } from 'expo-router';
import { Body, Button, Card, Empty, Loading, Screen, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function KiesClub() {
  const { loading, session, memberships, selectMember, signOut } = useSession();
  if (loading) return <Loading />;
  if (!session) return <Redirect href="/login" />;

  return (
    <Screen>
      {memberships.length === 0 ? (
        <>
          <Empty>Er is (nog) geen actief lidmaatschap aan dit account gekoppeld. Neem contact op met je club.</Empty>
          <Button title="Uitloggen" variant="secondary" onPress={signOut} />
        </>
      ) : memberships.map((m) => (
        <Card key={m.id} onPress={async () => { await selectMember(m.id); router.replace('/(tabs)'); }}>
          <Title style={{ color: m.club.primary_color }}>{m.club.name}</Title>
          <Body muted>Lidnummer {m.member_number}{m.club.city ? ` · ${m.club.city}` : ''}</Body>
        </Card>
      ))}
    </Screen>
  );
}
