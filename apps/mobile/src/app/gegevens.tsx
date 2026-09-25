import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch } from 'react-native';
import { Body, Button, Card, Input, Row, Screen, SectionHeader } from '@/components/ui';
import { useMember, useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

export default function Gegevens() {
  const member = useMember();
  const { refresh } = useSession();
  const t = useTheme();
  const [form, setForm] = useState({
    phone: member.phone ?? '', email: member.email ?? '', street: member.street ?? '',
    house_number: member.house_number ?? '', postal_code: member.postal_code ?? '', city: member.city ?? '',
    show_in_directory: member.show_in_directory,
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('member_self_update', {
      p_member: member.id, p_phone: form.phone || null, p_email: form.email || null, p_street: form.street || null,
      p_house_number: form.house_number || null, p_postal_code: form.postal_code.toUpperCase() || null,
      p_city: form.city || null, p_show_in_directory: form.show_in_directory,
    });
    setBusy(false);
    if (error) return Alert.alert('Opslaan mislukt', error.message);
    await refresh();
    router.back();
  };

  return (
    <Screen>
      <SectionHeader>Contact</SectionHeader>
      <Input label="E-mailadres" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Telefoon" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <SectionHeader>Adres</SectionHeader>
      <Row>
        <Card style={{ flex: 3, padding: 0, borderWidth: 0 }}><Input label="Straat" value={form.street} onChangeText={set('street')} /></Card>
        <Card style={{ flex: 1, padding: 0, borderWidth: 0 }}><Input label="Nr." value={form.house_number} onChangeText={set('house_number')} /></Card>
      </Row>
      <Row>
        <Card style={{ flex: 1, padding: 0, borderWidth: 0 }}><Input label="Postcode" value={form.postal_code} onChangeText={set('postal_code')} autoCapitalize="characters" /></Card>
        <Card style={{ flex: 2, padding: 0, borderWidth: 0 }}><Input label="Plaats" value={form.city} onChangeText={set('city')} /></Card>
      </Row>
      <SectionHeader>Privacy</SectionHeader>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body style={{ flex: 1 }}>Toon mij in de ledenlijst (naam en handicap)</Body>
          <Switch value={form.show_in_directory} onValueChange={(v) => setForm({ ...form, show_in_directory: v })} trackColor={{ true: t.primary }} />
        </Row>
      </Card>
      <Body muted style={{ fontSize: 12 }}>Naam, geboortedatum, lidmaatschap of IBAN wijzigen? Neem contact op met de ledenadministratie.</Body>
      <Button title="Opslaan" onPress={save} loading={busy} />
    </Screen>
  );
}
