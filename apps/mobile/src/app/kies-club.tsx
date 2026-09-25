import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Contours, Wordmark } from '@/components/brand';
import { Avatar, Button, Card, Empty, Eyebrow, Loading, Row, T } from '@/components/ui';
import { useSession } from '@/lib/session';
import { colors, space } from '@/lib/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function KiesClub() {
  const insets = useSafeAreaInsets();
  const { loading, session, memberships, selectMember, signOut } = useSession();
  if (loading) return <Loading />;
  if (!session) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.chalk }}>
      <View style={{ backgroundColor: colors.pine900, paddingTop: insets.top + space.xl, paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.xl }}>
        <Contours seed={11} />
        <Wordmark size={18} />
        <View style={{ gap: 6 }}>
          <Eyebrow color={colors.brassLight}>Jouw clubs</Eyebrow>
          <T variant="title" color={colors.onDark}>Waar speel je vandaag?</T>
        </View>
      </View>
      <View style={{ padding: space.lg, gap: space.md }}>
        {memberships.length === 0 ? (
          <>
            <Empty icon="flag-outline" title="Nog geen lidmaatschap gekoppeld">
              Je account is nog niet aan een club gekoppeld. Neem contact op met de ledenadministratie van je club.
            </Empty>
            <Button title="Uitloggen" variant="secondary" onPress={signOut} />
          </>
        ) : memberships.map((m) => (
          <Card key={m.id} elevated onPress={async () => { await selectMember(m.id); router.replace('/(tabs)'); }}>
            <Row gap={space.md}>
              <Avatar name={m.club.name.replace(/^Golfclub\s+/i, '')} size={48} tone="dark" />
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="subheading">{m.club.name}</T>
                <T variant="small" color={colors.slate}>Lidnummer {m.member_number}{m.club.city ? ` · ${m.club.city}` : ''}</T>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mist} />
            </Row>
          </Card>
        ))}
      </View>
    </View>
  );
}
