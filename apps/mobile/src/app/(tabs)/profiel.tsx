import { router } from 'expo-router';
import { Linking } from 'react-native';
import { formatIban, localDate } from '@golfapp/shared';
import { MemberCard } from '@/components/member-card';
import { Group, ListRow, Screen, T } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fetchEntitlements } from '@/lib/offers';
import { useMember, useSession } from '@/lib/session';
import { useQuery } from '@/lib/useQuery';
import { colors, space } from '@/lib/theme';

export default function Lidmaatschap() {
  const member = useMember();
  const { memberships, signOut } = useSession();
  const club = member.club;
  const { data: rights } = useQuery(() => fetchEntitlements(member.id, localDate()), [member.id]);

  return (
    <Screen title="Lidmaatschap" eyebrow={club.name}>
      <MemberCard member={member} />
      <T variant="small" color={colors.mist} style={{ textAlign: 'center', marginBottom: space.sm }}>Laat deze kaart zien bij de caddiemaster of in het clubhuis.</T>

      {!!rights?.length && (
        <Group>
          {rights.map((r, i) => (
            <ListRow key={r.id} icon={r.kind === 'intro' ? 'ticket-outline' : 'sunny-outline'}
              title={r.kind === 'intro' ? `Introductiekaart · nog ${r.uses_left} ${r.uses_left === 1 ? 'introducé' : 'introducés'}`
                : r.uses_left == null ? 'Weekendpas' : `${r.uses_left} ${r.uses_left === 1 ? 'weekendronde' : 'weekendrondes'}`}
              subtitle={`Geldig t/m ${formatDate(r.valid_until, { day: 'numeric', month: 'long', year: 'numeric' })}`} last={i === rights.length - 1} />
          ))}
        </Group>
      )}

      <Group>
        <ListRow icon="ribbon-outline" title="Lidmaatschap wijzigen" subtitle="Upgraden, pauzeren, gezinslid toevoegen" onPress={() => router.push('/lidmaatschap')} />
        <ListRow icon="receipt-outline" title="Facturen & betalingen" subtitle="Contributie, lessen en greenfees" onPress={() => router.push('/facturen')} />
        <ListRow icon="person-outline" title="Mijn gegevens" subtitle="Adres, telefoon en privacy" onPress={() => router.push('/gegevens')} />
        <ListRow icon="car-sport-outline" title="Handicart-pas"
          subtitle={member.handicart_pass_number ? `Pas ${member.handicart_pass_number} · Handicart-tarief voor je buggy` : 'Buggy tegen Handicart-tarief'}
          onPress={() => router.push('/handicart')} />
        <ListRow icon="people-outline" title="Ledenlijst" subtitle="Zoek een clubgenoot" onPress={() => router.push('/ledenlijst')} />
        <ListRow icon="gift-outline" title="Introduceer een vriend" subtitle="Gratis introductieronde, samen met jou" onPress={() => router.push('/introduceren')} last={memberships.length < 2} />
        {memberships.length > 1 && <ListRow icon="swap-horizontal-outline" title="Andere club" subtitle={`${memberships.length} lidmaatschappen`} onPress={() => router.push('/kies-club')} last />}
      </Group>

      <T variant="heading" style={{ marginTop: space.md }}>De club</T>
      <Group>
        {club.street && <ListRow icon="location-outline" title={`${club.street} ${club.house_number ?? ''}`} subtitle={`${club.postal_code ?? ''} ${club.city ?? ''}`} />}
        {club.phone && <ListRow icon="call-outline" title={club.phone} subtitle="Bellen" onPress={() => Linking.openURL(`tel:${club.phone}`)} />}
        {club.email && <ListRow icon="mail-outline" title={club.email} subtitle="E-mailen" onPress={() => Linking.openURL(`mailto:${club.email}`)} />}
        {club.website && <ListRow icon="globe-outline" title={club.website.replace(/^https?:\/\//, '')} subtitle="Website" onPress={() => Linking.openURL(club.website!)} />}
        {club.iban && <ListRow icon="card-outline" title={formatIban(club.iban)} subtitle={`t.n.v. ${club.name}`} last />}
      </Group>

      <Group style={{ marginTop: space.md }}>
        <ListRow icon="log-out-outline" title="Uitloggen" destructive onPress={signOut} last />
      </Group>
      <T variant="small" color={colors.mist} style={{ textAlign: 'center', marginTop: space.md }}>Greenside · versie 1.0</T>
    </Screen>
  );
}
