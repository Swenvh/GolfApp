import { router } from 'expo-router';
import { Linking } from 'react-native';
import { formatIban, fullName } from '@golfapp/shared';
import { Body, Button, Card, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { useMember, useSession } from '@/lib/session';
import { useTheme } from '@/lib/theme';

export default function Profiel() {
  const member = useMember();
  const { memberships, signOut } = useSession();
  const t = useTheme();
  const club = member.club;

  const link = (label: string, onPress: () => void) => (
    <Card onPress={onPress}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Body>{label}</Body>
        <Body style={{ color: t.primary }}>›</Body>
      </Row>
    </Card>
  );

  return (
    <Screen>
      <Card>
        <Title style={{ fontSize: 22 }}>{fullName(member)}</Title>
        <Body muted>Lidnummer {member.member_number}{member.ngf_number ? ` · NGF ${member.ngf_number}` : ''}</Body>
        <Body muted>Lid sinds {formatDate(member.join_date, { month: 'long', year: 'numeric' })} · hcp {formatHandicap(member.handicap_index)}</Body>
      </Card>

      <SectionHeader>Mijn lidmaatschap</SectionHeader>
      {link('Facturen & betalingen', () => router.push('/facturen'))}
      {link('Mijn gegevens', () => router.push('/gegevens'))}
      {link('Ledenlijst', () => router.push('/ledenlijst'))}
      {memberships.length > 1 && link('Wissel van club', () => router.push('/kies-club'))}

      <SectionHeader>{club.name}</SectionHeader>
      <Card>
        {club.street && <Body>{club.street} {club.house_number}, {club.postal_code} {club.city}</Body>}
        {club.phone && <Body style={{ color: t.primary }} onPress={() => Linking.openURL(`tel:${club.phone}`)}>📞 {club.phone}</Body>}
        {club.email && <Body style={{ color: t.primary }} onPress={() => Linking.openURL(`mailto:${club.email}`)}>✉️ {club.email}</Body>}
        {club.website && <Body style={{ color: t.primary }} onPress={() => Linking.openURL(club.website!)}>🌐 {club.website.replace(/^https?:\/\//, '')}</Body>}
        {club.iban && <Body muted>IBAN {formatIban(club.iban)}</Body>}
      </Card>

      <Button title="Uitloggen" variant="danger" onPress={signOut} style={{ marginTop: 16 }} />
    </Screen>
  );
}
