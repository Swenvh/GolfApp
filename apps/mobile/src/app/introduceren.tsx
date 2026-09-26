import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, ErrorText, Eyebrow, Input, Row, Screen, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';

/** Lid introduceert een vriend: de ledenadministratie krijgt een lead. */
export default function Introduceren() {
  const member = useMember();
  const params = useLocalSearchParams<{ name?: string; rounds?: string }>();
  const [form, setForm] = useState({ name: params.name ?? '', email: '', phone: '', note: params.rounds ? `Speelde het afgelopen jaar ${params.rounds}× met mij mee als introducé` : '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const send = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.from('leads').insert({
      club_id: member.club_id, member_id: member.id, type: 'referral',
      name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, note: form.note.trim() || null,
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
          <Ionicons name="paper-plane" size={40} color={colors.pine700} />
          <T variant="heading">Bedankt, {member.first_name}!</T>
          <T color={colors.slate} style={{ textAlign: 'center' }}>
            De ledenadministratie neemt contact op met {form.name.split(' ')[0]} voor een gratis introductieronde met jou.
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Uitnodiging versturen" icon="paper-plane-outline" onPress={send} loading={busy} disabled={form.name.trim().length < 2 || (!form.email.includes('@') && form.phone.length < 8)} />}>
      <Card tone="pine" style={{ padding: space.xl, gap: space.sm, marginTop: space.md }}>
        <Eyebrow color={colors.brassLight}>Introduceer een vriend</Eyebrow>
        <T variant="heading" color={colors.onDark} style={{ fontSize: 24, lineHeight: 29 }}>Neem iemand mee voor een gratis introductieronde</T>
        <T color={colors.onDarkMuted}>Jij speelt mee, de club regelt de rest. Samen golfen is de beste manier om lid te worden.</T>
      </Card>
      <Input label="Naam" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Voor- en achternaam" />
      <Input label="E-mailadres" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Telefoon (optioneel)" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
      <Input label="Iets wat de club moet weten?" value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} placeholder="Bijv. heeft al een GVB, speelt handicap 20" multiline />
      <Row gap={space.sm}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.mist} />
        <T variant="small" color={colors.mist} style={{ flex: 1 }}>We gebruiken deze gegevens alleen om je vriend één keer uit te nodigen.</T>
      </Row>
      <ErrorText message={error} />
    </Screen>
  );
}
