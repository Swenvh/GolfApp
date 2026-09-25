import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  courseHandicap, localDate, playingHandicap, scoreDifferential, scoreRound,
  type Course, type CourseHole, type CourseTee,
} from '@golfapp/shared';
import { Body, Button, Card, Chip, Loading, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

export default function Scorekaart() {
  const member = useMember();
  const t = useTheme();
  const [courseId, setCourseId] = useState<string>();
  const [teeId, setTeeId] = useState<string>();
  const [scores, setScores] = useState<(number | null)[]>([]);
  const [qualifying, setQualifying] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const tees = (data?.tees ?? []).filter((x) => x.course_id === course?.id && (!member.gender || x.gender === member.gender || member.gender === 'other'));
  const tee = tees.find((x) => x.id === teeId) ?? tees[0];
  const holes = (data?.holes ?? []).filter((h) => h.course_id === course?.id)
    .map((h) => ({ number: h.number, par: h.par, strokeIndex: h.stroke_index }));

  const ch = tee && member.handicap_index != null
    ? courseHandicap(Number(member.handicap_index), { courseRating: Number(tee.course_rating), slopeRating: tee.slope_rating, par: tee.par })
    : 0;
  const ph = playingHandicap(ch, 95);
  const result = useMemo(() => scoreRound(holes.map((_, i) => scores[i] ?? null), holes, ph), [holes, scores, ph]);

  const setScore = (i: number, delta: number) => setScores((prev) => {
    const next = [...prev];
    const current = next[i] ?? holes[i]!.par;
    next[i] = Math.max(1, Math.min(15, (prev[i] == null ? current : current + delta)));
    return next;
  });

  if (loading) return <Loading />;
  if (!course || !tee) return <Screen><Body muted>Voor deze club zijn nog geen baangegevens (holes/tees) ingevoerd.</Body></Screen>;

  const complete = holes.every((_, i) => scores[i] != null);
  const save = async () => {
    setSaving(true);
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
    if (error) Alert.alert('Opslaan mislukt', error.message);
    else router.back();
  };

  return (
    <Screen>
      {withHoles.length > 1 && (
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {withHoles.map((c) => <Chip key={c.id} label={c.name} active={c.id === course.id} onPress={() => { setCourseId(c.id); setScores([]); }} />)}
        </ScrollView>
      )}
      <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
        {tees.map((x) => <Chip key={x.id} label={x.name} active={x.id === tee.id} onPress={() => setTeeId(x.id)} />)}
      </ScrollView>

      <Card>
        <Row style={{ justifyContent: 'space-around' }}>
          <Stat label="Playing hcp" value={String(ph)} />
          <Stat label="Bruto" value={String(result.gross)} />
          <Stat label="Stableford" value={String(result.stableford)} highlight={t.primary} />
        </Row>
      </Card>

      <SectionHeader>Per hole: eerste tik = par, daarna − / +</SectionHeader>
      {result.perHole.map((h, i) => (
        <View key={h.hole} style={[styles.hole, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={{ width: 70 }}>
            <Text style={[styles.holeNo, { color: t.text }]}>Hole {h.hole}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>Par {holes[i]!.par} · SI {holes[i]!.strokeIndex}{h.strokes !== 0 ? ` · ${h.strokes > 0 ? '+' : ''}${h.strokes}` : ''}</Text>
          </View>
          <Pressable style={[styles.step, { borderColor: t.border }]} onPress={() => setScore(i, -1)}><Text style={[styles.stepText, { color: t.text }]}>−</Text></Pressable>
          <Text style={[styles.score, { color: h.gross == null ? t.muted : t.text }]}>{h.gross ?? holes[i]!.par}</Text>
          <Pressable style={[styles.step, { borderColor: t.border }]} onPress={() => setScore(i, +1)}><Text style={[styles.stepText, { color: t.text }]}>+</Text></Pressable>
          <Text style={[styles.points, { color: h.gross == null ? t.muted : t.primary }]}>{h.gross == null ? '' : `${h.points} p`}</Text>
        </View>
      ))}

      <Row style={{ justifyContent: 'space-between', paddingVertical: 8 }}>
        <Body>Qualifying kaart (met marker)</Body>
        <Switch value={qualifying} onValueChange={setQualifying} trackColor={{ true: t.primary }} />
      </Row>
      <Button title={complete ? 'Scorekaart opslaan' : 'Vul alle holes in'} onPress={save} loading={saving} disabled={!complete} />
    </Screen>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Body muted style={{ fontSize: 12 }}>{label}</Body>
      <Title style={{ fontSize: 26, color: highlight }}>{value}</Title>
    </View>
  );
}

const styles = StyleSheet.create({
  hole: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  holeNo: { fontWeight: '700', fontSize: 15 },
  step: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 22, fontWeight: '600' },
  score: { fontSize: 24, fontWeight: '800', width: 36, textAlign: 'center', fontVariant: ['tabular-nums'] },
  points: { marginLeft: 'auto', fontWeight: '700', fontSize: 15 },
});
