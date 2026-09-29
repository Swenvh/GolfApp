import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  formatEuro, membershipChangeKindLabel, membershipChangeStatusLabel,
  type MembershipChange, type MembershipType,
} from '@golfapp/shared';
import { Button, Card, ErrorText, Eyebrow, Group, ListRow, Loading, Pill, Row, Screen, T } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

/**
 * Het lidmaatschap van het lid: upgraden of een gezinslid aanmelden. Pauzeren, omzetten en opzeggen
 * regelt de club zelf (in de pilot niet via de app).
 */
export default function Lidmaatschap() {
  const member = useMember();
  const [error, setError] = useState<string>();

  const { data, loading, reload } = useQuery(async () => {
    const [types, changes] = await Promise.all([
      supabase.from('membership_types').select('*').eq('club_id', member.club_id).eq('active', true).order('annual_fee_cents', { ascending: false }),
      supabase.from('membership_changes').select('*').eq('member_id', member.id).order('created_at', { ascending: false }).limit(5),
    ]);
    return { types: unwrap(types) as MembershipType[], changes: unwrap(changes) as MembershipChange[] };
  }, [member.id]);

  if (loading || !data) return <Loading />;
  const current = data.types.find((t) => t.id === member.membership_type_id);
  const fee = current?.annual_fee_cents ?? 0;
  const pending = data.changes.find((c) => c.status === 'requested');
  const earlier = data.changes.filter((c) => c.status !== 'requested');
  const typeName = (id: string | null) => data.types.find((t) => t.id === id)?.name ?? '';

  const withdraw = (c: MembershipChange) => {
    const go = async () => {
      const { error } = await supabase.from('membership_changes').delete().eq('id', c.id);
      if (error) return setError(error.message);
      haptic.success();
      reload();
    };
    if (Platform.OS === 'web') return void go();
    Alert.alert('Verzoek intrekken?', undefined, [{ text: 'Nee', style: 'cancel' }, { text: 'Intrekken', style: 'destructive', onPress: go }]);
  };

  return (
    <Screen>
      <Card tone="pine" style={{ padding: space.xl, gap: space.xs, marginTop: space.md }}>
        <Eyebrow color={colors.brassLight}>Jouw lidmaatschap</Eyebrow>
        <T variant="title" color={colors.onDark}>{current?.name ?? 'Lidmaatschap'}</T>
        <T color={colors.onDarkMuted}>{formatEuro(fee)} per jaar{current && !current.can_play ? ' · op rust' : current && !current.can_book_weekend ? ' · doordeweeks' : ''}</T>
      </Card>

      {pending && (
        <Card style={{ gap: space.sm, borderColor: colors.brass, borderWidth: 1.5 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="subheading">{membershipChangeKindLabel[pending.kind]}{pending.target_membership_type_id ? ` → ${typeName(pending.target_membership_type_id)}` : ''}</T>
            <Pill label={membershipChangeStatusLabel[pending.status]} tone="brass" />
          </Row>
          <T variant="small" color={colors.slate}>Per {formatDate(pending.effective_date, { day: 'numeric', month: 'long', year: 'numeric' })} · het secretariaat verwerkt je verzoek</T>
          <Button title="Verzoek intrekken" variant="ghost" compact onPress={() => withdraw(pending)} />
        </Card>
      )}

      {!pending && (
        <Group>
          <ListRow icon="arrow-up-circle-outline" title="Upgraden" subtitle="Meer speelrecht, bijvoorbeeld in het weekend" onPress={() => router.push('/upgrade')} />
          <ListRow icon="people-outline" title="Gezinslid toevoegen" subtitle="Partner of kinderen met gezinskorting" onPress={() => router.push('/gezin')} last />
        </Group>
      )}
      <T variant="small" color={colors.mist}>Pauzeren, omzetten of opzeggen? Neem contact op met de ledenadministratie van de club.</T>

      {earlier.length > 0 && (
        <>
          <T variant="heading" style={{ marginTop: space.md }}>Eerder</T>
          <Group>
            {earlier.map((c, i) => (
              <ListRow key={c.id} title={`${membershipChangeKindLabel[c.kind]}${c.target_membership_type_id ? ` → ${typeName(c.target_membership_type_id)}` : ''}`}
                subtitle={`${membershipChangeStatusLabel[c.status]} · per ${formatDate(c.effective_date)}`} last={i === earlier.length - 1} />
            ))}
          </Group>
        </>
      )}
      <ErrorText message={error} />
    </Screen>
  );
}
