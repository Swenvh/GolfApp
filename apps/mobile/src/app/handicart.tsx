import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { formatEuro, hasValidHandicart, localDate, priceInclVat, type HandicartPassType, type Product } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { Button, Card, ErrorText, Eyebrow, Input, Row, Screen, Segmented, T } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember, useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { useQuery } from '@/lib/useQuery';

/** dd-mm-jjjj → jjjj-mm-dd, of null als het geen geldige datum is */
function parseDate(input: string): string | null {
  const m = input.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

/** Handicart-pas van Stichting Handicart vastleggen: daarna krijgt het lid automatisch het Handicart-tarief. */
export default function Handicart() {
  const member = useMember();
  const { refresh } = useSession();
  const [number, setNumber] = useState(member.handicart_pass_number ?? '');
  const [type, setType] = useState<HandicartPassType>(member.handicart_pass_type ?? 'permanent');
  const [until, setUntil] = useState(member.handicart_valid_until ? formatDate(member.handicart_valid_until, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const buggy = useQuery(async () => {
    const { data } = await supabase.from('products').select('*').eq('club_id', member.club_id).eq('active', true)
      .not('handicart_price_cents', 'is', null).limit(1);
    return ((data ?? []) as Product[])[0] ?? null;
  }, [member.club_id]);
  const valid = hasValidHandicart(member, localDate());

  const save = async (remove = false) => {
    setBusy(true);
    setError(undefined);
    const validUntil = until ? parseDate(until) : null;
    if (!remove && until && !validUntil) { setBusy(false); return setError('Vul de datum in als dd-mm-jjjj.'); }
    const { error } = await supabase.rpc('member_set_handicart', {
      p_member: member.id, p_number: remove ? null : number.trim(), p_type: type, p_valid_until: remove ? null : validUntil,
    });
    setBusy(false);
    if (error) { haptic.warn(); return setError(error.message.includes('check') ? 'Controleer je pasnummer.' : error.message); }
    haptic.success();
    await refresh();
    router.back();
  };

  return (
    <Screen footer={<Button title={member.handicart_pass_number ? 'Pas bijwerken' : 'Pas opslaan'} onPress={() => save()} loading={busy} disabled={number.trim().length < 3} />}>
      <Card tone="pine" style={{ padding: space.xl, gap: space.sm, marginTop: space.md }}>
        <Contours seed={21} opacity={0.06} />
        <Eyebrow color={colors.brassLight}>Stichting Handicart</Eyebrow>
        <T variant="heading" color={colors.onDark} style={{ fontSize: 24, lineHeight: 29 }}>Blijven golfen met een buggy</T>
        <T color={colors.onDarkMuted}>
          Met een Handicart-pas rijd je tegen een gereduceerd tarief in een buggy. Leg je pas hier vast: bij het boeken van een
          starttijd reserveer je de buggy meteen, zonder te bellen.
        </T>
        {buggy.data?.handicart_price_cents != null && (
          <Row gap={space.sm} style={{ marginTop: space.xs }}>
            <Ionicons name="car-sport-outline" size={18} color={colors.brassLight} />
            <T color={colors.onDark}>
              Bij {member.club.name}: {formatEuro(priceInclVat(buggy.data.handicart_price_cents, Number(buggy.data.vat_rate)))} in plaats van {formatEuro(priceInclVat(buggy.data.price_cents, Number(buggy.data.vat_rate)))}
            </T>
          </Row>
        )}
      </Card>

      {member.handicart_pass_number && (
        <Row gap={space.sm}>
          <Ionicons name={valid ? 'checkmark-circle' : 'alert-circle'} size={18} color={valid ? colors.pine600 : colors.flag} />
          <T variant="small" color={valid ? colors.pine700 : colors.flag}>
            {valid ? `Pas ${member.handicart_pass_number} is geldig${member.handicart_valid_until ? ` tot ${formatDate(member.handicart_valid_until, { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`
              : 'Je pas is verlopen. Verleng hem bij Stichting Handicart en werk de datum hier bij.'}
          </T>
        </Row>
      )}

      <Input label="Pasnummer" value={number} onChangeText={setNumber} autoCapitalize="characters" placeholder="Staat op je Handicart-pas" />
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.slate}>Soort pas</Eyebrow>
        <Segmented options={[{ key: 'permanent', label: 'Doorlopend' }, { key: 'temporary', label: 'Tijdelijk (100 dagen)' }]} value={type} onChange={setType} />
      </View>
      <Input label={type === 'temporary' ? 'Geldig tot' : 'Geldig tot (optioneel)'} value={until} onChangeText={setUntil}
        placeholder="dd-mm-jjjj" keyboardType="numbers-and-punctuation" />
      <ErrorText message={error} />

      <Card onPress={() => Linking.openURL('https://www.handicart.nl/')}>
        <Row gap={space.md}>
          <Ionicons name="open-outline" size={20} color={colors.pine700} />
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong">Nog geen pas?</T>
            <T variant="small" color={colors.slate}>Vraag hem aan bij Stichting Handicart (handicart.nl), ook tijdelijk na een blessure.</T>
          </View>
        </Row>
      </Card>
      {member.handicart_pass_number && <Button title="Pas verwijderen" variant="danger" onPress={() => save(true)} />}
    </Screen>
  );
}
