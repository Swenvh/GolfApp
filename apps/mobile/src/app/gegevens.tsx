import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';
import { Button, ErrorText, Group, Input, ListRow, Row, Screen, T } from '@/components/ui';
import { useMember, useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { haptic } from '@/lib/haptics';

export default function Gegevens() {
  const member = useMember();
  const { refresh } = useSession();
  const [form, setForm] = useState({
    phone: member.phone ?? '', email: member.email ?? '', street: member.street ?? '',
    house_number: member.house_number ?? '', postal_code: member.postal_code ?? '', city: member.city ?? '',
    show_in_directory: member.show_in_directory,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.rpc('member_self_update', {
      p_member: member.id, p_phone: form.phone || null, p_email: form.email || null, p_street: form.street || null,
      p_house_number: form.house_number || null, p_postal_code: form.postal_code.toUpperCase() || null,
      p_city: form.city || null, p_show_in_directory: form.show_in_directory,
    });
    setBusy(false);
    if (error) { haptic.warn(); return setError(error.message); }
    haptic.success();
    await refresh();
    router.back();
  };

  return (
    <Screen footer={<Button title="Wijzigingen opslaan" onPress={save} loading={busy} />}>
      <T variant="heading" style={{ marginTop: space.sm }}>Contact</T>
      <Input label="E-mailadres" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Telefoon" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <T variant="heading" style={{ marginTop: space.md }}>Adres</T>
      <Row gap={space.md} style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 3 }}><Input label="Straat" value={form.street} onChangeText={set('street')} /></View>
        <View style={{ flex: 1 }}><Input label="Nr." value={form.house_number} onChangeText={set('house_number')} /></View>
      </Row>
      <Row gap={space.md} style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}><Input label="Postcode" value={form.postal_code} onChangeText={set('postal_code')} autoCapitalize="characters" /></View>
        <View style={{ flex: 2 }}><Input label="Plaats" value={form.city} onChangeText={set('city')} /></View>
      </Row>
      <T variant="heading" style={{ marginTop: space.md }}>Privacy</T>
      <Group>
        <ListRow icon="eye-outline" title="Zichtbaar in de ledenlijst" subtitle="Clubgenoten zien alleen je naam en handicap" last
          right={<Switch value={form.show_in_directory} onValueChange={(v) => setForm({ ...form, show_in_directory: v })} trackColor={{ true: colors.pine700, false: colors.lineStrong }} thumbColor={colors.paper} />} />
      </Group>
      <ErrorText message={error} />
      <T variant="small" color={colors.mist}>Naam, geboortedatum, lidmaatschap of IBAN wijzigen? Neem contact op met de ledenadministratie.</T>
    </Screen>
  );
}
