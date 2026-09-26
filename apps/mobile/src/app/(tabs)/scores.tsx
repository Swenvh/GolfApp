import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { formatEuro, handicapIndexFromDifferentials, priceInclVat, type Product, type Round } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { Button, Card, Empty, ErrorText, Eyebrow, Group, Row, Screen, T } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type RoundRow = Round & { tee: { name: string; course: { name: string } } | null };

export default function Scores() {
  const member = useMember();
  const { data: all, error, refreshing, refresh } = useQuery(async () => {
    const [rounds, lessons] = await Promise.all([
      supabase.from('rounds').select('*, tee:course_tees(name, course:courses(name))')
        .eq('member_id', member.id).order('played_on', { ascending: false }).limit(40),
      supabase.from('products').select('*').eq('club_id', member.club_id).eq('category', 'lesson').eq('active', true).order('sort'),
    ]);
    return { rounds: unwrap(rounds) as RoundRow[], lessons: (lessons.data ?? []) as Product[] };
  }, [member.id]);

  const rounds = all?.rounds ?? [];
  const lesson = all?.lessons[0];
  // Vorm: laatste 3 rondes tegenover de 3 daarvoor
  const pts = rounds.filter((r) => r.stableford_points != null).map((r) => r.stableford_points!);
  const recent = pts.length >= 3 ? avg(pts.slice(0, 3)) : null;
  const before = pts.length >= 6 ? avg(pts.slice(3, 6)) : null;
  const dip = recent != null && before != null && recent < before - 1;
  const differentials = rounds.filter((r) => r.qualifying && r.score_differential != null).map((r) => Number(r.score_differential));
  const indication = handicapIndexFromDifferentials(differentials);
  const points = rounds.filter((r) => r.stableford_points != null).slice(0, 10).map((r) => r.stableford_points!).reverse();
  const best = points.length ? Math.max(...points) : null;

  return (
    <Screen title="Scores" eyebrow="Handicap & rondes" refreshing={refreshing} onRefresh={refresh}
      action={<Button title="Nieuwe kaart" icon="add" compact onPress={() => router.push('/scorekaart')} />}>
      <Card tone="pine" style={{ padding: space.xl, gap: space.lg }}>
        <Contours seed={9} opacity={0.06} />
        <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Eyebrow color={colors.brassLight}>Handicap-index · NGF</Eyebrow>
            <Text style={styles.hcp}>{formatHandicap(member.handicap_index)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', paddingBottom: 10 }}>
            <Text style={styles.sideLabel}>Indicatie app</Text>
            <Text style={styles.sideValue}>{indication == null ? '—' : formatHandicap(indication)}</Text>
            <Text style={styles.sideSub}>{differentials.length} qualifying {differentials.length === 1 ? 'kaart' : 'kaarten'}</Text>
          </View>
        </Row>
        {points.length >= 2 && (
          <View style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={styles.sideLabel}>Stablefordpunten, laatste {points.length}</Text>
              <Text style={styles.sideLabel}>Beste {best}</Text>
            </Row>
            <Spark values={points} />
          </View>
        )}
      </Card>

      {lesson && rounds.length > 0 && (
        <Card elevated onPress={() => router.push({ pathname: '/aanbod/[id]', params: { id: lesson.id, context: dip ? 'Terug naar je beste vorm' : 'Haal meer uit je spel' } })}>
          <Row gap={space.md} style={{ alignItems: 'flex-start' }}>
            <View style={styles.proIcon}><Ionicons name="school-outline" size={22} color={colors.brass} /></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Eyebrow>{dip ? 'Je vorm' : 'Les bij de pro'}</Eyebrow>
              <T variant="subheading">
                {dip ? `Laatste 3 rondes gemiddeld ${Math.round(recent!)} punten, ${Math.round(before! - recent!)} minder dan daarvoor`
                  : 'Werk met de pro aan je swing'}
              </T>
              <T variant="small" color={colors.slate}>{lesson.name} · {formatEuro(priceInclVat(lesson.price_cents, Number(lesson.vat_rate)))}</T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mist} />
          </Row>
        </Card>
      )}

      <ErrorText message={error} />
      <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
        <T variant="heading">Mijn rondes</T>
        <T variant="small" color={colors.slate}>{rounds.length}</T>
      </Row>
      {rounds.length === 0 ? (
        <Empty icon="golf-outline" title="Nog geen rondes">Voer na je ronde je scorekaart in. De app rekent je Stableford-punten direct uit.</Empty>
      ) : (
        <Group>
          {rounds.map((r, i) => (
            <Row key={r.id} gap={space.md} style={[styles.round, i < rounds.length - 1 && styles.divider]}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{formatDate(r.played_on, { day: 'numeric' })}</Text>
                <Text style={styles.dateMon}>{formatDate(r.played_on, { month: 'short' }).replace('.', '')}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="bodyStrong">{r.tee?.course.name ?? 'Onbekende baan'}</T>
                <T variant="small" color={colors.slate}>
                  {r.tee ? `Tee ${r.tee.name} · ` : ''}{r.gross_score} slagen{r.qualifying ? ' · qualifying' : ''}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.pts}>{r.stableford_points ?? '–'}</Text>
                <Text style={styles.ptsUnit}>punten</Text>
              </View>
            </Row>
          ))}
        </Group>
      )}
      <Row gap={space.sm} style={{ marginTop: space.sm, paddingHorizontal: space.xs }}>
        <Ionicons name="information-circle-outline" size={16} color={colors.mist} />
        <T variant="small" color={colors.mist} style={{ flex: 1 }}>
          Je officiële handicap beheert de NGF. Qualifying kaarten stuurt de club door.
        </T>
      </Row>
    </Screen>
  );
}

function avg(v: number[]) {
  return v.reduce((s, x) => s + x, 0) / v.length;
}

function Spark({ values }: { values: number[] }) {
  const w = 300, h = 48, pad = 5;
  const min = Math.min(...values) - 2, max = Math.max(...values) + 2;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = values.length - 1;
  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <Polyline points={pts} fill="none" stroke={colors.brassLight} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={x(last)} cy={y(values[last]!)} r={4} fill={colors.brassLight} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  proIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brassSoft, alignItems: 'center', justifyContent: 'center' },
  hcp: { fontFamily: fonts.display, fontSize: 72, lineHeight: 76, color: colors.onDark, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  sideLabel: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.onDarkMuted },
  sideValue: { fontFamily: fonts.display, fontSize: 28, color: colors.brassLight },
  sideSub: { fontFamily: fonts.body, fontSize: 12, color: colors.onDarkMuted },
  round: { paddingHorizontal: space.lg, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  dateBox: { width: 46, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.chalk, alignItems: 'center' },
  dateDay: { fontFamily: fonts.display, fontSize: 18, lineHeight: 20, color: colors.ink },
  dateMon: { fontFamily: fonts.bodyHeavy, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colors.slate },
  pts: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, color: colors.pine700 },
  ptsUnit: { fontFamily: fonts.body, fontSize: 11, color: colors.slate },
});
