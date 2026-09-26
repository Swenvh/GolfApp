import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { formatEuro, fullName, type MembershipType } from '@golfapp/shared';
import { Button, Card, Empty, ErrorText, Eyebrow, Loading, Row, Screen, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

/** Upgrade van het lidmaatschap aanvragen, met het verschil in contributie erbij. */
export default function Upgrade() {
  const member = useMember();
  const [choice, setChoice] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const { data, loading } = useQuery(async () =>
    unwrap(await supabase.from('membership_types').select('*').eq('club_id', member.club_id).eq('active', true)
      .order('annual_fee_cents', { ascending: false })) as MembershipType[], [member.club_id]);

  if (loading || !data) return <Loading />;
  const current = data.find((t) => t.id === member.membership_type_id);
  const options = data.filter((t) => t.id !== current?.id && t.annual_fee_cents > (current?.annual_fee_cents ?? 0)
    && (t.min_age == null || age(member.date_of_birth) >= t.min_age) && (t.max_age == null || age(member.date_of_birth) <= t.max_age));
  const selected = options.find((o) => o.id === choice) ?? options[0];
  const monthsLeft = 12 - new Date().getMonth();

  const request = async () => {
    if (!selected) return;
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.from('leads').insert({
      club_id: member.club_id, member_id: member.id, type: 'upgrade', name: fullName(member),
      email: member.email, membership_type_id: selected.id,
      value_cents: selected.annual_fee_cents - (current?.annual_fee_cents ?? 0),
      note: `Van ${current?.name ?? 'onbekend'} naar ${selected.name}`,
    });
    setBusy(false);
    if (error) { haptic.warn(); return setError(error.message); }
    haptic.success();
    setSent(true);
  };

  if (sent) {
    return (
      <Screen footer={<Button title="Klaar" onPress={() => router.back()} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxxl }}>
          <Ionicons name="ribbon" size={42} color={colors.brass} />
          <T variant="heading">Aanvraag verstuurd</T>
          <T color={colors.slate} style={{ textAlign: 'center' }}>De ledenadministratie zet je upgrade naar {selected?.name} klaar en stuurt je een bevestiging.</T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={selected ? <Button title="Upgrade aanvragen" icon="arrow-up-circle-outline" onPress={request} loading={busy} /> : undefined}>
      <View style={{ gap: 4, marginTop: space.md }}>
        <Eyebrow>Jouw lidmaatschap</Eyebrow>
        <T variant="title">{current?.name ?? 'Lidmaatschap'}</T>
        {current && !current.can_book_weekend && <T color={colors.slate}>Met je huidige lidmaatschap speel je doordeweeks.</T>}
      </View>
      {options.length === 0 && <Empty icon="ribbon-outline" title="Je hebt al het meest complete lidmaatschap" />}
      {options.map((o) => {
        const diff = o.annual_fee_cents - (current?.annual_fee_cents ?? 0);
        const active = o.id === selected?.id;
        return (
          <Card key={o.id} onPress={() => setChoice(o.id)} style={active ? { borderColor: colors.pine700, borderWidth: 2 } : undefined}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 20 }}>{o.name}</T>
                {o.can_book_weekend && <Row gap={6}><Ionicons name="checkmark-circle" size={16} color={colors.pine600} /><T variant="small">Ook in het weekend spelen</T></Row>}
                <Row gap={6}><Ionicons name="checkmark-circle" size={16} color={colors.pine600} /><T variant="small">Alle wedstrijden en clubactiviteiten</T></Row>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="heading">+{formatEuro(Math.round(diff / 12)).replace(',00', '')}</T>
                <T variant="small" color={colors.slate}>per maand</T>
              </View>
            </Row>
            <T variant="small" color={colors.mist}>
              Dit jaar nog {monthsLeft} {monthsLeft === 1 ? 'maand' : 'maanden'}: ca. {formatEuro(Math.round((diff * monthsLeft) / 12))} bijbetalen
            </T>
          </Card>
        );
      })}
      <ErrorText message={error} />
    </Screen>
  );
}

function age(dob: string | null): number {
  if (!dob) return 30;
  const d = new Date(dob);
  const now = new Date();
  return now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}
