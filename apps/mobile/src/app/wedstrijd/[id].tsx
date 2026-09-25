import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { competitionFormatLabel, competitionStatusLabel, formatEuro, localTime, type Competition } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { Avatar, Button, Empty, ErrorText, Eyebrow, Group, Loading, Pill, Row, Screen, T } from '@/components/ui';
import { formatDate, formatDateTime, formatHandicap } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Participant = { member_id: string; name: string; handicap_index: number | null; position: number | null;
  gross_score: number | null; net_score: number | null; stableford_points: number | null };

const medal = [colors.brass, '#A7B0AA', '#B07A4F'];

export default function WedstrijdDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const { data, loading, reload } = useQuery(async () => {
    const [comp, participants] = await Promise.all([
      supabase.from('competitions').select('*, course:courses(name)').eq('id', id).single(),
      supabase.rpc('competition_participants', { p_competition: id }),
    ]);
    return { comp: unwrap(comp) as Competition & { course: { name: string } | null }, participants: unwrap(participants) as Participant[] };
  }, [id]);

  if (loading || !data) return <Loading />;
  const { comp, participants } = data;
  const joined = participants.some((p) => p.member_id === member.id);
  const deadlinePassed = !!comp.registration_deadline && new Date(comp.registration_deadline) < new Date();
  const full = !!comp.max_participants && participants.length >= comp.max_participants;
  const tooHigh = comp.max_handicap != null && member.handicap_index != null && member.handicap_index > comp.max_handicap;
  const canJoin = comp.status === 'open' && !deadlinePassed && !full && !tooHigh;
  const hasResults = participants.some((p) => p.position != null);

  const toggle = async () => {
    setBusy(true);
    setError(undefined);
    const res = joined
      ? await supabase.from('competition_entries').delete().eq('competition_id', id).eq('member_id', member.id)
      : await supabase.from('competition_entries').insert({ competition_id: id, member_id: member.id });
    setBusy(false);
    if (res.error) { haptic.warn(); setError(res.error.message); } else haptic.success();
    reload();
  };

  const header = (
    <View style={[styles.hero, { paddingTop: insets.top + space.md }]}>
      <Contours seed={comp.name.length} />
      <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={20} color={colors.onDark} />
      </Pressable>
      <Eyebrow color={colors.brassLight} style={{ marginTop: space.xl }}>{competitionFormatLabel[comp.format]}{comp.qualifying ? ' · Qualifying' : ''}</Eyebrow>
      <Text style={styles.title}>{comp.name}</Text>
      <View style={styles.facts}>
        <Fact label="Datum" value={formatDate(comp.starts_at, { weekday: 'short', day: 'numeric', month: 'short' })} />
        <Fact label="Eerste start" value={localTime(comp.starts_at)} />
        <Fact label="Inschrijfgeld" value={comp.entry_fee_cents ? formatEuro(comp.entry_fee_cents) : 'Gratis'} />
        <Fact label="Deelnemers" value={`${participants.length}${comp.max_participants ? `/${comp.max_participants}` : ''}`} />
      </View>
    </View>
  );

  const cta = comp.status === 'open'
    ? joined
      ? <Button title="Uitschrijven" variant="danger" onPress={toggle} loading={busy} style={{ backgroundColor: colors.paper }} />
      : <Button title={full ? 'Vol' : deadlinePassed ? 'Inschrijving gesloten' : tooHigh ? `Max. handicap ${comp.max_handicap}` : 'Schrijf me in'}
          icon={canJoin ? 'checkmark' : undefined} onPress={toggle} loading={busy} disabled={!canJoin} />
    : undefined;

  return (
    <Screen header={header} footer={cta}>
      <View style={{ height: space.lg }} />
      <ErrorText message={error} />
      {joined && comp.status === 'open' && (
        <Row style={styles.joined} gap={space.md}>
          <Ionicons name="checkmark-circle" size={22} color={colors.pine700} />
          <T variant="bodyStrong" color={colors.pine800} style={{ flex: 1 }}>Je staat op de deelnemerslijst</T>
        </Row>
      )}
      {comp.description && <T color={colors.slate}>{comp.description}</T>}
      {comp.registration_deadline && comp.status === 'open' && (
        <T variant="small" color={colors.mist}>Inschrijven kan tot {formatDateTime(comp.registration_deadline)}{comp.course ? ` · ${comp.course.name}` : ''}</T>
      )}
      {comp.status !== 'open' && <Pill label={competitionStatusLabel[comp.status]} />}

      <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
        <T variant="heading">{hasResults ? 'Klassement' : 'Deelnemers'}</T>
        <T variant="small" color={colors.slate}>{participants.length}</T>
      </Row>
      {participants.length === 0 ? <Empty icon="people-outline" title="Nog niemand ingeschreven">Wees de eerste.</Empty> : (
        <Group>
          {participants.map((p, i) => {
            const me = p.member_id === member.id;
            return (
              <Row key={p.member_id} gap={space.md} style={[styles.row, i < participants.length - 1 && styles.rowDivider, me && { backgroundColor: colors.pine50 }]}>
                {hasResults ? (
                  <View style={[styles.pos, p.position != null && p.position <= 3 && { backgroundColor: medal[p.position - 1] }]}>
                    <Text style={[styles.posText, p.position != null && p.position <= 3 && { color: colors.paper }]}>{p.position ?? '–'}</Text>
                  </View>
                ) : <Avatar name={p.name} size={34} tone={me ? 'dark' : 'pine'} />}
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong">{p.name}{me ? ' (jij)' : ''}</T>
                  <T variant="small" color={colors.slate}>Handicap {formatHandicap(p.handicap_index)}</T>
                </View>
                {hasResults && (
                  <Text style={styles.score}>
                    {comp.format === 'stableford' ? `${p.stableford_points ?? '–'}` : `${p.net_score ?? '–'}`}
                    <Text style={styles.scoreUnit}>{comp.format === 'stableford' ? ' pnt' : ' netto'}</Text>
                  </Text>
                )}
              </Row>
            );
          })}
        </Group>
      )}
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', paddingVertical: space.sm, gap: 2 }}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.pine900, paddingHorizontal: space.xl, paddingBottom: space.xl },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.onDarkLine, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.onDark, letterSpacing: -0.6, marginTop: 6 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.lg, paddingTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.onDarkLine },
  factLabel: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.onDarkMuted },
  factValue: { fontFamily: fonts.display, fontSize: 19, color: colors.onDark },
  joined: { backgroundColor: colors.pine50, borderRadius: 14, padding: space.md },
  row: { paddingHorizontal: space.lg, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  pos: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.chalk, alignItems: 'center', justifyContent: 'center' },
  posText: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  score: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  scoreUnit: { fontFamily: fonts.body, fontSize: 12, color: colors.slate },
});
