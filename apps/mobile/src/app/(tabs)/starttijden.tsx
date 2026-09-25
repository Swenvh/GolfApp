import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { addDays, generateTeeSlots, localDate, localTime, type Course, type TeeSheetRow } from '@golfapp/shared';
import { Body, Card, Chip, ErrorText, Loading, Row, Screen, SectionHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

export default function Starttijden() {
  const member = useMember();
  const t = useTheme();
  const today = localDate();
  const [day, setDay] = useState(today);
  const [courseId, setCourseId] = useState<string>();

  const courses = useQuery(async () =>
    unwrap(await supabase.from('courses').select('*').eq('club_id', member.club_id).eq('active', true).order('name')) as Course[],
  [member.club_id]);
  const course = courses.data?.find((c) => c.id === courseId) ?? courses.data?.[0];

  const sheet = useQuery(async () => {
    if (!course) return [] as TeeSheetRow[];
    return unwrap(await supabase.rpc('tee_sheet', { p_course: course.id, p_day: day })) as TeeSheetRow[];
  }, [course?.id, day]);

  const days = useMemo(
    () => Array.from({ length: (course?.booking_days_ahead ?? 7) + 1 }, (_, i) => addDays(today, i)),
    [today, course?.booking_days_ahead],
  );

  const { flights, bookingIds } = useMemo(() => {
    const flights = new Map<string, TeeSheetRow[]>();
    const bookingIds = new Map<string, string>();
    for (const r of sheet.data ?? []) {
      const time = localTime(r.starts_at);
      bookingIds.set(time, r.booking_id);
      if (r.player_id) flights.set(time, [...(flights.get(time) ?? []), r]);
    }
    return { flights, bookingIds };
  }, [sheet.data]);

  if (courses.loading) return <Loading />;
  if (!course) return <Screen><Body muted>Er zijn nog geen banen beschikbaar.</Body></Screen>;

  const now = Date.now();
  const slots = generateTeeSlots(day, course).filter((s) => new Date(s.startsAt).getTime() > now);

  const leave = (row: TeeSheetRow) =>
    Alert.alert('Afmelden', `Wil je je afmelden voor ${localTime(row.starts_at)}?`, [
      { text: 'Nee', style: 'cancel' },
      {
        text: 'Afmelden', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('tee_booking_players').delete().eq('id', row.player_id!);
          if (error) Alert.alert('Mislukt', error.message);
          sheet.reload();
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.card, borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10, gap: 8 }}>
        {(courses.data?.length ?? 0) > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {courses.data!.map((c) => <Chip key={c.id} label={c.name} active={c.id === course.id} onPress={() => setCourseId(c.id)} />)}
          </ScrollView>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {days.map((d) => (
            <Chip key={d} active={d === day} onPress={() => setDay(d)}
              label={d === today ? 'Vandaag' : formatDate(d, { weekday: 'short', day: 'numeric', month: 'short' })} />
          ))}
        </ScrollView>
      </View>

      <Screen refreshing={sheet.refreshing} onRefresh={sheet.refresh}>
        <ErrorText message={sheet.error} />
        <SectionHeader>{formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}</SectionHeader>
        {slots.length === 0 && <Body muted>Geen starttijden meer beschikbaar op deze dag.</Body>}
        {slots.map((slot) => {
          const players = flights.get(slot.time) ?? [];
          const mine = players.find((p) => p.member_id === member.id);
          const free = course.max_players - players.length;
          return (
            <Card
              key={slot.time}
              style={[styles.slot, mine && { borderColor: t.primary, borderWidth: 1.5 }]}
              onPress={mine ? () => leave(mine) : free > 0
                ? () => router.push({ pathname: '/boeken', params: { course: course.id, startsAt: slot.startsAt, bookingId: bookingIds.get(slot.time) ?? '' } })
                : undefined}
            >
              <Row style={{ alignItems: 'flex-start' }}>
                <Text style={[styles.time, { color: free > 0 || mine ? t.text : t.muted }]}>{slot.time}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  {players.map((p) => (
                    <Body key={p.player_id} style={p.member_id === member.id ? { fontWeight: '700', color: t.primary } : undefined}>
                      {p.player_name}
                    </Body>
                  ))}
                  {free > 0 && !mine && (
                    <Text style={{ color: t.primary, fontWeight: '600' }}>{free === course.max_players ? 'Vrij — boek' : `${free} plek${free > 1 ? 'ken' : ''} vrij — aansluiten`}</Text>
                  )}
                  {mine && <Text style={{ color: t.muted, fontSize: 12 }}>Tik om je af te melden</Text>}
                  {free === 0 && !mine && <Text style={{ color: t.muted }}>Vol</Text>}
                </View>
                <View style={styles.dots}>
                  {Array.from({ length: course.max_players }, (_, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: i < players.length ? t.primary : t.border }]} />
                  ))}
                </View>
              </Row>
            </Card>
          );
        })}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { paddingVertical: 12 },
  time: { fontSize: 18, fontWeight: '700', width: 64, fontVariant: ['tabular-nums'] },
  dots: { flexDirection: 'row', gap: 4, paddingTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
