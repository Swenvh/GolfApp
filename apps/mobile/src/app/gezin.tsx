import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { formatEuro, fullName, type MembershipType } from '@golfapp/shared';
import { Button, Card, ErrorText, Eyebrow, Input, Loading, Row, Screen, Segmented, T } from '@/components/ui';
import { age } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Relation = 'partner' | 'kind';

/** Lid meldt een partner of kind aan; de app stelt het passende lidmaatschap voor en het secretariaat krijgt een lead. */
export default function Gezin() {
  const member = useMember();
  const [relation, setRelation] = useState<Relation>('partner');
  const [form, setForm] = useState({ name: '', dob: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState<MembershipType>();

  const { data: types, loading } = useQuery(async () =>
    unwrap(await supabase.from('membership_types').select('*').eq('club_id', member.club_id).eq('active', true).eq('can_play', true)
      .order('annual_fee_cents')) as MembershipType[], [member.club_id]);

  if (loading || !types) return <Loading />;

  const dob = parseDob(form.dob);
  const years = dob ? age(dob) : null;
  const fits = (t: MembershipType) => years != null && (t.min_age == null || years >= t.min_age) && (t.max_age == null || years <= t.max_age);
  const family = types.find((t) => /gezin|partner/i.test(t.name));
  // Partner: gezinslidmaatschap als de club dat heeft; kinderen: de goedkoopste vorm die bij de leeftijd past (jeugd, student)
  const suggestion = years == null ? undefined
    : relation === 'partner' && family && fits(family) ? family
      : types.find((t) => fits(t) && t.id !== family?.id && (t.min_age != null || t.max_age != null)) ?? types.find((t) => fits(t) && t.id !== family?.id && t.can_book_weekend);
  const full = types.filter((t) => t.can_book_weekend).at(-1);

  const send = async () => {
    if (!suggestion) return;
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.from('leads').insert({
      club_id: member.club_id, member_id: member.id, type: 'family', name: form.name.trim(), email: form.email.trim() || null,
      membership_type_id: suggestion.id, value_cents: suggestion.annual_fee_cents + suggestion.entrance_fee_cents,
      note: `${relation === 'partner' ? 'Partner' : 'Kind'} van ${fullName(member)}, geboren ${form.dob.trim()} (${years} jaar)`,
    });
    setBusy(false);
    if (error) { haptic.warn(); return setError(error.message); }
    haptic.success();
    setSent(suggestion);
  };

  if (sent) {
    return (
      <Screen footer={<Button title="Klaar" onPress={() => router.back()} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxxl }}>
          <Ionicons name="people" size={42} color={colors.pine700} />
          <T variant="heading">Aanmelding verstuurd</T>
          <T color={colors.slate} style={{ textAlign: 'center' }}>
            De ledenadministratie meldt {form.name.split(' ')[0]} aan als {sent.name.toLowerCase()} en stuurt jullie een bevestiging. De contributie komt op jouw rekening.
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Aanmelden" icon="person-add-outline" onPress={send} loading={busy} disabled={!suggestion || form.name.trim().length < 2} />}>
      <Card tone="pine" style={{ padding: space.xl, gap: space.sm, marginTop: space.md }}>
        <Eyebrow color={colors.brassLight}>Samen lid</Eyebrow>
        <T variant="heading" color={colors.onDark} style={{ fontSize: 24, lineHeight: 29 }}>Golf met je gezin</T>
        <T color={colors.onDarkMuted}>Meld je partner of kinderen aan. Wij kiezen het lidmaatschap dat bij hun leeftijd past, en alles komt op één rekening.</T>
      </Card>

      <Segmented options={[{ key: 'partner', label: 'Partner' }, { key: 'kind', label: 'Kind' }]} value={relation} onChange={setRelation} />
      <Input label="Naam" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Voor- en achternaam" />
      <Input label="Geboortedatum" value={form.dob} onChangeText={(v) => setForm({ ...form, dob: v })} placeholder="dd-mm-jjjj" keyboardType="numbers-and-punctuation" />
      <Input label="E-mailadres (optioneel)" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />

      {suggestion && (
        <Card style={{ gap: space.xs, borderColor: colors.pine600, borderWidth: 2 }}>
          <Eyebrow>Past bij {years} jaar</Eyebrow>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 20, flex: 1 }}>{suggestion.name}</T>
            <View style={{ alignItems: 'flex-end' }}>
              <T variant="heading">{formatEuro(Math.round(suggestion.annual_fee_cents / 12)).replace(',00', '')}</T>
              <T variant="small" color={colors.slate}>per maand</T>
            </View>
          </Row>
          {full && full.annual_fee_cents > suggestion.annual_fee_cents && (
            <T variant="small" color={colors.pine700}>
              {formatEuro(full.annual_fee_cents - suggestion.annual_fee_cents).replace(',00', '')} per jaar voordeliger dan {full.name}
            </T>
          )}
        </Card>
      )}
      {form.dob.length >= 8 && years == null && <T variant="small" color={colors.flag}>Vul de geboortedatum in als dd-mm-jjjj.</T>}
      <ErrorText message={error} />
    </Screen>
  );
}

/** '14-03-2012' → '2012-03-14' */
function parseDob(v: string): string | null {
  const m = v.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date > new Date() || Number(y) < 1900 ? null : iso;
}
