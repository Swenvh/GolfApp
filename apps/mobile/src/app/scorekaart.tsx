import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  courseHandicap, localDate, playingHandicap, scoreDifferential, scoreRound,
  type Course, type CourseHole, type CourseTee,
} from '@golfapp/shared';
import { Button, Empty, ErrorText, Eyebrow, Loading, Row, Screen, Segmented, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

/** Kleur van de teemarker, zodat 'Geel' er ook geel uitziet. */
const teeColor: Record<string, string> = {
  wit: '#FFFFFF', geel: '#E8C33A', blauw: '#2F6FB5', rood: '#C2412D', oranje: '#E07B2E', zwart: '#1D1D1D', groen: '#2E7D32',
};

export default function Scorekaart() {
  const member = useMember();
  const [courseId, setCourseId] = useState<string>();
  const [teeId, setTeeId] = useState<string>();
  const [scores, setScores] = useState<(number | null)[]>([]);
  const [qualifying, setQualifying] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const { data, loading } = useQuery(async () => {
    const courses = unwrap(await supabase.from('courses').select('*').eq('club_id', member.club_id).eq('active', true)) as Course[];
    const ids = courses.map((c) => c.id);
    const [tees, holes] = await Promise.all([
      supabase.from('course_tees').select('*').in('course_id', ids).order('course_rating', { ascending: false }),
      supabase.from('course_holes').select('*').in('course_id', ids).order('number'),
    ]);
    return { courses, tees: unwrap(tees) as CourseTee[], holes: unwrap(holes) as CourseHole[] };
  }, [member.club_id]);

  const withHoles = (data?.courses ?? []).filter((c) => data?.holes.some((h) => h.course_id === c.id));
  const course = withHoles.find((c) => c.id === courseId) ?? withHoles[0];
  const tees = (data?.tees ?? []).filter((x) => x.course_id === course?.id && (!member.gender || member.gender === 'other' || x.gender === member.gender));
  const tee = tees.find((x) => x.id === teeId) ?? tees[0];
  const holes = useMemo(() => (data?.holes ?? []).filter((h) => h.course_id === course?.id)
    .map((h) => ({ number: h.number, par: h.par, strokeIndex: h.stroke_index })), [data?.holes, course?.id]);

  const ch = tee && member.handicap_index != null
    ? courseHandicap(Number(member.handicap_index), { courseRating: Number(tee.course_rating), slopeRating: tee.slope_rating, par: tee.par })
    : 0;
  const ph = playingHandicap(ch, 95);
  const result = useMemo(() => scoreRound(holes.map((_, i) => scores[i] ?? null), holes, ph), [holes, scores, ph]);

  const setScore = (i: number, delta: number) => {
    haptic.tap();
    setScores((prev) => {
      const next = [...prev];
      next[i] = prev[i] == null ? holes[i]!.par : Math.max(1, Math.min(15, prev[i]! + delta));
      return next;
    });
  };

  if (loading) return <Loading />;
  if (!course || !tee) return <Screen><Empty icon="map-outline" title="Geen baangegevens">De club heeft voor deze baan nog geen holes en tees ingevoerd.</Empty></Screen>;

  const done = holes.filter((_, i) => scores[i] != null).length;
  const complete = done === holes.length;
  const save = async () => {
    setSaving(true);
    setError(undefined);
    const { error } = await supabase.from('rounds').insert({
      club_id: member.club_id,
      member_id: member.id,
      course_tee_id: tee.id,
      played_on: localDate(),
      hole_scores: holes.map((_, i) => scores[i] ?? 0),
      course_handicap: ch,
      stableford_points: result.stableford,
      score_differential: holes.length === 18
        ? scoreDifferential(result.adjustedGross, { courseRating: Number(tee.course_rating), slopeRating: tee.slope_rating })
        : null,
      qualifying,
    });
    setSaving(false);
    if (error) { haptic.warn(); setError(error.message); }
    else { haptic.success(); router.back(); }
  };

  const nines = holes.length > 9 ? [{ label: 'Uit', from: 0, to: 9 }, { label: 'In', from: 9, to: 18 }] : [{ label: 'Totaal', from: 0, to: holes.length }];

  return (
    <Screen footer={
      <View style={{ gap: space.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="bodyStrong">Qualifying kaart (met marker)</T>
          <Switch value={qualifying} onValueChange={setQualifying} trackColor={{ true: colors.pine700, false: colors.lineStrong }} thumbColor={colors.paper} />
        </Row>
        <Button title={complete ? `Kaart opslaan · ${result.stableford} punten` : `Nog ${holes.length - done} holes invullen`} onPress={save} loading={saving} disabled={!complete} />
      </View>
    }>
      {withHoles.length > 1 && (
        <Segmented options={withHoles.map((c) => ({ key: c.id, label: c.name.replace(/\s*\(.*\)/, '') }))} value={course.id} onChange={(k) => { setCourseId(k); setScores([]); }} />
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {tees.map((x) => {
          const active = x.id === tee.id;
          return (
            <Pressable key={x.id} onPress={() => { haptic.tap(); setTeeId(x.id); }} style={[styles.tee, active && styles.teeActive]}>
              <View style={[styles.teeDot, { backgroundColor: teeColor[x.name.toLowerCase()] ?? colors.mist }]} />
              <Text style={[styles.teeText, active && { color: colors.onDark }]}>{x.name}</Text>
              <Text style={[styles.teeMeta, active && { color: colors.onDarkMuted }]}>{Number(x.course_rating).toFixed(1)}/{x.slope_rating}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.summary}>
        <Summary label="Playing hcp" value={String(ph)} />
        <View style={styles.summaryDivider} />
        <Summary label="Slagen" value={done ? String(result.gross) : '–'} />
        <View style={styles.summaryDivider} />
        <Summary label="Punten" value={String(result.stableford)} accent />
      </View>

      <Row gap={space.lg} style={{ justifyContent: 'center', marginTop: -4 }}>
        <Legend shape="circle" label="Birdie" />
        <Legend shape="plain" label="Par" />
        <Legend shape="square" label="Bogey" />
        <Row gap={4}><View style={styles.strokeDot} /><T variant="small" color={colors.slate}>Extra slag</T></Row>
      </Row>

      {nines.map((nine) => {
        const part = result.perHole.slice(nine.from, nine.to);
        return (
          <View key={nine.label} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={[styles.colHole, styles.headText]}>Hole</Text>
              <Text style={[styles.colPar, styles.headText]}>Par</Text>
              <Text style={[styles.colSi, styles.headText]}>SI</Text>
              <Text style={[{ flex: 1, textAlign: 'center' }, styles.headText]}>Slagen</Text>
              <Text style={[styles.colPts, styles.headText]}>Pnt</Text>
            </View>
            {part.map((h, k) => {
              const i = nine.from + k;
              const hole = holes[i]!;
              return (
                <View key={h.hole} style={[styles.hole, k < part.length - 1 && styles.holeDivider]}>
                  <View style={styles.colHole}><View style={styles.holeNo}><Text style={styles.holeNoText}>{h.hole}</Text></View></View>
                  <Text style={[styles.colPar, styles.cell]}>{hole.par}</Text>
                  <View style={styles.colSi}>
                    <Text style={styles.cellMuted}>{hole.strokeIndex}</Text>
                    <Row gap={2}>{Array.from({ length: Math.max(0, h.strokes) }, (_, d) => <View key={d} style={styles.strokeDot} />)}</Row>
                  </View>
                  <Row style={{ flex: 1, justifyContent: 'center' }} gap={space.sm}>
                    <Step icon="remove" label={`Hole ${h.hole} een slag minder`} onPress={() => setScore(i, -1)} />
                    <ScoreMark gross={h.gross} par={hole.par} />
                    <Step icon="add" label={`Hole ${h.hole} een slag meer`} onPress={() => setScore(i, +1)} />
                  </Row>
                  <Text style={[styles.colPts, styles.points, h.gross == null && { color: colors.lineStrong }]}>{h.gross == null ? '·' : h.points}</Text>
                </View>
              );
            })}
            <View style={styles.subtotal}>
              <Text style={[styles.colHole, styles.subLabel]}>{nine.label}</Text>
              <Text style={[styles.colPar, styles.subValue]}>{holes.slice(nine.from, nine.to).reduce((s, x) => s + x.par, 0)}</Text>
              <View style={styles.colSi} />
              <Text style={[{ flex: 1, textAlign: 'center' }, styles.subValue]}>{part.reduce((s, x) => s + (x.gross ?? 0), 0) || '–'}</Text>
              <Text style={[styles.colPts, styles.subValue, { color: colors.brassLight }]}>{part.reduce((s, x) => s + x.points, 0)}</Text>
            </View>
          </View>
        );
      })}
      <ErrorText message={error} />
      <T variant="small" color={colors.mist} style={{ textAlign: 'center' }}>Eerste tik zet de hole op par · handicapallowance 95%</T>
    </Screen>
  );
}

/** Klassieke scorekaart-notatie: cirkel(s) onder par, vierkant(en) boven par. */
function ScoreMark({ gross, par }: { gross: number | null; par: number }) {
  if (gross == null) return <View style={styles.mark}><Text style={[styles.markText, { color: colors.lineStrong }]}>{par}</Text></View>;
  const diff = gross - par;
  const shape = diff <= -1 ? 'circle' : diff >= 1 ? 'square' : 'plain';
  const double = Math.abs(diff) >= 2;
  const color = diff < 0 ? colors.brass : diff > 0 ? colors.ink : colors.pine700;
  const outer = shape === 'plain' ? undefined : { borderWidth: 1.5, borderColor: color, borderRadius: shape === 'circle' ? 22 : 5 };
  const inner = double ? { borderWidth: 1.5, borderColor: color, borderRadius: shape === 'circle' ? 16 : 3 } : undefined;
  return (
    <View style={[styles.mark, outer]}>
      <View style={[styles.markInner, inner]}>
        <Text style={[styles.markText, { color }]}>{gross}</Text>
      </View>
    </View>
  );
}

function Legend({ shape, label }: { shape: 'circle' | 'square' | 'plain'; label: string }) {
  return (
    <Row gap={5}>
      <View style={{ width: 12, height: 12, borderWidth: shape === 'plain' ? 0 : 1.5, borderColor: shape === 'circle' ? colors.brass : colors.ink, borderRadius: shape === 'circle' ? 6 : 2, backgroundColor: shape === 'plain' ? colors.pine100 : 'transparent' }} />
      <T variant="small" color={colors.slate}>{label}</T>
    </Row>
  );
}

function Step({ icon, label, onPress }: { icon: 'add' | 'remove'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.step, pressed && { backgroundColor: colors.pine100 }]}>
      <Ionicons name={icon} size={18} color={colors.pine800} />
    </Pressable>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Eyebrow color={accent ? colors.brassLight : colors.onDarkMuted}>{label}</Eyebrow>
      <Text style={[styles.summaryValue, accent && { color: colors.brassLight }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tee: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.pill, backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line,
  },
  teeActive: { backgroundColor: colors.pine800, borderColor: colors.pine800 },
  teeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  teeText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  teeMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.slate },
  summary: { flexDirection: 'row', backgroundColor: colors.pine900, borderRadius: radius.lg, paddingVertical: space.lg },
  summaryDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.onDarkLine },
  summaryValue: { fontFamily: fonts.display, fontSize: 30, color: colors.onDark, fontVariant: ['tabular-nums'] },
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: 10, backgroundColor: colors.pine50 },
  headText: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.pine600 },
  colHole: { width: 44 },
  colPar: { width: 30, textAlign: 'center' },
  colSi: { width: 34, alignItems: 'center', gap: 3 },
  colPts: { width: 34, textAlign: 'right' },
  hole: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: 9 },
  holeDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  holeNo: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.pine800, alignItems: 'center', justifyContent: 'center' },
  holeNoText: { fontFamily: fonts.bodyHeavy, fontSize: 13, color: colors.onDark },
  cell: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  cellMuted: { fontFamily: fonts.body, fontSize: 13, color: colors.slate, textAlign: 'center' },
  strokeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.brass },
  step: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  markInner: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: fonts.display, fontSize: 21, fontVariant: ['tabular-nums'] },
  points: { fontFamily: fonts.display, fontSize: 18, color: colors.pine700 },
  subtotal: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: 12, backgroundColor: colors.pine800 },
  subLabel: { fontFamily: fonts.bodyHeavy, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.brassLight },
  subValue: { fontFamily: fonts.display, fontSize: 17, color: colors.onDark },
});
