import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import {
  endOfMembershipYear, formatEuro, membershipChangeKindLabel, membershipChangeStatusLabel,
  type MembershipChange, type MembershipChangeKind, type MembershipType,
} from '@golfapp/shared';
import { Button, Card, ErrorText, Eyebrow, Group, ListRow, Loading, Pill, Row, Screen, T } from '@/components/ui';
import { age, formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Step = 'overview' | 'reason' | 'options' | 'done';

const reasons = [
  { key: 'blessure', label: 'Blessure of gezondheid', icon: 'bandage-outline' },
  { key: 'tijd', label: 'Tijdelijk te weinig tijd', icon: 'time-outline' },
  { key: 'kosten', label: 'Het is me te duur', icon: 'wallet-outline' },
  { key: 'weekend', label: 'Ik speel vooral doordeweeks', icon: 'calendar-outline' },
  { key: 'verhuizing', label: 'Ik ga verhuizen', icon: 'home-outline' },
  { key: 'anders', label: 'Een andere reden', icon: 'chatbubble-ellipses-outline' },
] as const;
type Reason = (typeof reasons)[number]['key'];

interface Choice { kind: MembershipChangeKind; target?: MembershipType; effective: string }

/**
 * Lidmaatschap pauzeren, omzetten of opzeggen. Wie wil opzeggen krijgt eerst passende alternatieven:
 * een rustend lidmaatschap of een goedkopere vorm. Het secretariaat keurt het verzoek goed in de beheeromgeving.
 */
export default function Lidmaatschap() {
  const member = useMember();
  const [step, setStep] = useState<Step>('overview');
  const [cancelFlow, setCancelFlow] = useState(false);
  const [reason, setReason] = useState<Reason>();
  const [sent, setSent] = useState<Choice>();
  const [busy, setBusy] = useState(false);
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
  const fits = (t: MembershipType) => (t.min_age == null || age(member.date_of_birth) >= t.min_age) && (t.max_age == null || age(member.date_of_birth) <= t.max_age);
  const pauseType = data.types.find((t) => !t.can_play && t.id !== current?.id);
  // Gezinsvormen horen bij een ander lid en zijn dus geen alternatief voor jezelf
  const cheaper = data.types.filter((t) => t.can_play && t.id !== current?.id && t.annual_fee_cents < fee && fits(t) && !/gezin|partner/i.test(t.name));
  const pending = data.changes.find((c) => c.status === 'requested');
  const typeName = (id: string | null) => data.types.find((t) => t.id === id)?.name ?? '';

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = (() => { const d = new Date(); return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1)).toISOString().slice(0, 10); })();
  const nextYear = `${Number(today.slice(0, 4)) + 1}-01-01`;

  // Welke alternatieven passen bij de reden
  const showPause = !!pauseType && (!cancelFlow || reason !== 'kosten');
  const cheaperShown = cancelFlow && (reason === 'blessure' || reason === 'tijd') ? cheaper.slice(0, 1) : cheaper;

  const submit = async (choice: Choice) => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.from('membership_changes').insert({
      club_id: member.club_id, member_id: member.id, kind: choice.kind, target_membership_type_id: choice.target?.id ?? null,
      effective_date: choice.effective, reason: reason ? reasons.find((r) => r.key === reason)?.label : null, from_cancel_flow: cancelFlow,
    });
    setBusy(false);
    if (error) { haptic.warn(); return setError(error.message); }
    haptic.success();
    setSent(choice);
    setStep('done');
  };

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

  if (step === 'done' && sent) {
    const text = sent.kind === 'pause'
      ? `Je lidmaatschap gaat per ${formatDate(sent.effective)} op rust. Je blijft lid, houdt je handicap en betaalt ${formatEuro(sent.target!.annual_fee_cents)} per jaar.`
      : sent.kind === 'switch'
        ? `Je stapt per ${formatDate(sent.effective, { day: 'numeric', month: 'long', year: 'numeric' })} over naar ${sent.target!.name}.`
        : `Je opzegging per ${formatDate(sent.effective, { day: 'numeric', month: 'long', year: 'numeric' })} is doorgegeven.`;
    return (
      <Screen footer={<Button title="Klaar" onPress={() => router.back()} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxxl }}>
          <Ionicons name={sent.kind === 'cancel' ? 'mail-open-outline' : 'leaf'} size={42} color={sent.kind === 'cancel' ? colors.slate : colors.pine700} />
          <T variant="heading">{sent.kind === 'cancel' ? 'Jammer dat je gaat' : 'Fijn dat je blijft!'}</T>
          <T color={colors.slate} style={{ textAlign: 'center' }}>{text} Het secretariaat bevestigt dit per e-mail.</T>
        </View>
      </Screen>
    );
  }

  if (step === 'reason') {
    return (
      <Screen footer={<Button title="Verder" onPress={() => setStep('options')} disabled={!reason} />}>
        <View style={{ gap: 4, marginTop: space.md }}>
          <Eyebrow>Opzeggen</Eyebrow>
          <T variant="title">Waarom wil je stoppen?</T>
          <T color={colors.slate}>Dan kijken we of er iets is dat beter bij je past.</T>
        </View>
        <Group>
          {reasons.map((r, i) => (
            <ListRow key={r.key} icon={r.icon} title={r.label} last={i === reasons.length - 1} onPress={() => setReason(r.key)}
              right={<Ionicons name={reason === r.key ? 'radio-button-on' : 'radio-button-off'} size={20} color={reason === r.key ? colors.pine700 : colors.mist} />} />
          ))}
        </Group>
      </Screen>
    );
  }

  if (step === 'options') {
    return (
      <Screen>
        <View style={{ gap: 4, marginTop: space.md }}>
          <Eyebrow>{cancelFlow ? 'Voordat je gaat' : 'Pauzeren of omzetten'}</Eyebrow>
          <T variant="title">{cancelFlow ? 'Misschien past dit beter' : 'Wat past bij je?'}</T>
          <T color={colors.slate}>Je huidige lidmaatschap: {current?.name} · {formatEuro(fee)} per jaar</T>
        </View>

        {showPause && pauseType && (
          <Card style={{ gap: space.sm, borderColor: colors.pine600, borderWidth: 2 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Pill label={reason === 'blessure' || reason === 'tijd' ? 'Past bij jouw situatie' : 'Tijdelijk'} tone="pine" icon="leaf-outline" style={{ alignSelf: 'flex-start' }} />
                <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 20, marginTop: 6 }}>Lidmaatschap op rust</T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="heading">{formatEuro(pauseType.annual_fee_cents).replace(',00', '')}</T>
                <T variant="small" color={colors.slate}>per jaar</T>
              </View>
            </Row>
            <Benefit text="Je blijft lid en houdt je plek, zonder wachtlijst of entreegeld bij terugkeer" />
            <Benefit text="Je handicap en clubhistorie blijven bewaard" />
            <Benefit text={`Je bespaart ${formatEuro(fee - pauseType.annual_fee_cents).replace(',00', '')} per jaar`} />
            <Button title={`Op rust per ${formatDate(nextMonth)}`} icon="pause-circle-outline" onPress={() => submit({ kind: 'pause', target: pauseType, effective: nextMonth })} loading={busy}
              style={{ marginTop: space.xs }} />
          </Card>
        )}

        {cheaperShown.map((t) => (
          <Card key={t.id} style={{ gap: space.sm }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 20 }}>{t.name}</T>
                <T variant="small" color={colors.slate}>{t.can_book_weekend ? 'Ook in het weekend spelen' : 'Doordeweeks spelen, weekend los bij te kopen'}</T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="heading" color={colors.pine700}>−{formatEuro(Math.round((fee - t.annual_fee_cents) / 12)).replace(',00', '')}</T>
                <T variant="small" color={colors.slate}>per maand</T>
              </View>
            </Row>
            <Button title={`Omzetten naar ${t.name}`} variant="secondary" icon="swap-horizontal-outline" loading={busy}
              onPress={() => submit({ kind: 'switch', target: t, effective: nextYear })} />
          </Card>
        ))}

        {!showPause && cheaperShown.length === 0 && !cancelFlow && (
          <T color={colors.slate}>Er is geen lidmaatschap dat goedkoper is dan je huidige. Het secretariaat denkt graag met je mee.</T>
        )}

        {cancelFlow && (
          <View style={{ gap: space.sm, marginTop: space.md }}>
            <T variant="small" color={colors.slate} style={{ textAlign: 'center' }}>
              Opzeggen gaat in per {formatDate(endOfMembershipYear(today), { day: 'numeric', month: 'long', year: 'numeric' })}, het einde van het verenigingsjaar.
            </T>
            <Button title="Toch opzeggen" variant="danger" onPress={() => submit({ kind: 'cancel', effective: endOfMembershipYear(today) })} loading={busy} />
          </View>
        )}
        <ErrorText message={error} />
      </Screen>
    );
  }

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
          <ListRow icon="pause-circle-outline" title="Pauzeren of omzetten" subtitle="Op rust bij blessure, of een lidmaatschap dat beter past"
            onPress={() => { setCancelFlow(false); setReason(undefined); setStep('options'); }} />
          <ListRow icon="people-outline" title="Gezinslid toevoegen" subtitle="Partner of kinderen met gezinskorting" onPress={() => router.push('/gezin')} />
          <ListRow icon="exit-outline" title="Opzeggen" destructive last onPress={() => { setCancelFlow(true); setReason(undefined); setStep('reason'); }} />
        </Group>
      )}

      {data.changes.filter((c) => c.status !== 'requested').length > 0 && (
        <>
          <T variant="heading" style={{ marginTop: space.md }}>Eerder</T>
          <Group>
            {data.changes.filter((c) => c.status !== 'requested').map((c, i, a) => (
              <ListRow key={c.id} title={`${membershipChangeKindLabel[c.kind]}${c.target_membership_type_id ? ` → ${typeName(c.target_membership_type_id)}` : ''}`}
                subtitle={`${membershipChangeStatusLabel[c.status]} · per ${formatDate(c.effective_date)}`} last={i === a.length - 1} />
            ))}
          </Group>
        </>
      )}
      <ErrorText message={error} />
    </Screen>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <Row gap={6} style={{ alignItems: 'flex-start' }}>
      <Ionicons name="checkmark-circle" size={16} color={colors.pine600} style={{ marginTop: 1 }} />
      <T variant="small" style={{ flex: 1 }}>{text}</T>
    </Row>
  );
}
