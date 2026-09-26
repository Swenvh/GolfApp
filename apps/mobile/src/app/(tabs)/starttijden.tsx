import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { addDays, generateTeeSlots, localDate, localTime, type Course, type TeeSheetRow } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { Avatar, Button, Card, Empty, ErrorText, Eyebrow, Loading, Row, Screen, Segmented, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

const weekday = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('nl-NL', { month: 'long', timeZone: 'UTC' });

export default function Starttijden() {
  const member = useMember();
  const today = localDate();
  const [day, setDay] = useState(today);
  const [courseId, setCourseId] = useState<string>();

  const courses = useQuery(async () =>
    unwrap(await supabase.from('courses').select('*').eq('club_id', member.club_id).eq('active', true).order('name')) as Course[],
  [member.club_id]);
  const membership = useQuery(async () => {
    if (!member.membership_type_id) return null;
    const { data } = await supabase.from('membership_types').select('name, can_book_weekend').eq('id', member.membership_type_id).maybeSingle();
    return data as { name: string; can_book_weekend: boolean } | null;
  }, [member.membership_type_id]);
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
  if (!course) return <Screen title="Starttijden"><Empty icon="map-outline" title="Nog geen banen">De club heeft nog geen baan opengesteld voor boekingen.</Empty></Screen>;

  const now = Date.now();
  const isWeekend = [0, 6].includes(new Date(`${day}T12:00:00Z`).getUTCDay());
  const weekendLocked = isWeekend && membership.data?.can_book_weekend === false;
  const slots = weekendLocked ? [] : generateTeeSlots(day, course).filter((s) => new Date(s.startsAt).getTime() > now);
  const parts = [
    { label: 'Ochtend', slots: slots.filter((s) => s.time < '12:00') },
    { label: 'Middag', slots: slots.filter((s) => s.time >= '12:00' && s.time < '17:00') },
    { label: 'Avond', slots: slots.filter((s) => s.time >= '17:00') },
  ].filter((p) => p.slots.length);

  const leave = (row: TeeSheetRow) => {
    const doLeave = async () => {
      const { error } = await supabase.from('tee_booking_players').delete().eq('id', row.player_id!);
      if (error) Alert.alert('Afmelden mislukt', error.message);
      else haptic.success();
      sheet.reload();
    };
    if (Platform.OS === 'web') return doLeave();
    Alert.alert('Afmelden', `Wil je je afmelden voor ${localTime(row.starts_at)}? Bestelde extra's worden ook geannuleerd.`, [
      { text: 'Blijven', style: 'cancel' },
      { text: 'Afmelden', style: 'destructive', onPress: doLeave },
    ]);
  };

  return (
    <Screen
      title="Starttijden"
      eyebrow={monthFmt.format(new Date(`${day}T12:00:00Z`))}
      refreshing={sheet.refreshing}
      onRefresh={sheet.refresh}
      padded={false}
    >
      <View style={{ gap: space.md }}>
        {(courses.data?.length ?? 0) > 1 && (
          <View style={{ paddingHorizontal: space.lg }}>
            <Segmented
              options={courses.data!.map((c) => ({ key: c.id, label: c.name.replace(/\s*\(.*\)/, '') }))}
              value={course.id}
              onChange={setCourseId}
            />
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {days.map((d) => {
            const active = d === day;
            const date = new Date(`${d}T12:00:00Z`);
            return (
              <Pressable key={d} onPress={() => { haptic.tap(); setDay(d); }} style={[styles.date, active && styles.dateActive]}>
                <Text style={[styles.dateDay, active && { color: colors.brassLight }]}>{d === today ? 'Vandaag' : weekday.format(date).replace('.', '')}</Text>
                <Text style={[styles.dateNum, active && { color: colors.onDark }]}>{date.getUTCDate()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: space.lg, gap: space.sm, marginTop: space.md }}>
        <ErrorText message={sheet.error} />
        {weekendLocked ? (
          <Card tone="pine" style={{ padding: space.xl, gap: space.md, marginTop: space.sm }}>
            <Contours seed={12} opacity={0.06} />
            <Eyebrow color={colors.brassLight}>{membership.data?.name}</Eyebrow>
            <T variant="heading" color={colors.onDark} style={{ fontSize: 24, lineHeight: 29 }}>Ook in het weekend de baan op?</T>
            <T color={colors.onDarkMuted}>Met je huidige lidmaatschap speel je doordeweeks. Bekijk wat een upgrade per maand kost.</T>
            <Button title="Bekijk upgrade" variant="accent" icon="arrow-up-circle-outline" onPress={() => router.push('/upgrade')} />
          </Card>
        ) : slots.length === 0 && <Empty icon="moon-outline" title="Geen starttijden meer vandaag">Kies een andere dag in de strip hierboven.</Empty>}
        {parts.map((part) => (
          <View key={part.label} style={{ gap: space.sm }}>
            <Row style={{ marginTop: space.md, justifyContent: 'space-between' }}>
              <Eyebrow color={colors.slate}>{part.label}</Eyebrow>
              <T variant="small" color={colors.mist}>{part.slots[0]!.time} – {part.slots[part.slots.length - 1]!.time}</T>
            </Row>
            {part.slots.map((slot) => {
              const players = flights.get(slot.time) ?? [];
              const mine = players.find((p) => p.member_id === member.id);
              const free = course.max_players - players.length;
              const full = free <= 0;
              const onPress = mine ? () => leave(mine) : !full
                ? () => router.push({ pathname: '/boeken', params: { course: course.id, courseName: course.name, startsAt: slot.startsAt, bookingId: bookingIds.get(slot.time) ?? '' } })
                : undefined;
              return (
                <Pressable
                  key={slot.time}
                  disabled={!onPress}
                  onPress={() => { haptic.tap(); onPress?.(); }}
                  style={({ pressed }) => [styles.slot, mine && styles.slotMine, full && !mine && styles.slotFull, pressed && { transform: [{ scale: 0.985 }] }]}
                >
                  <Text style={[styles.time, mine && { color: colors.onDark }, full && !mine && { color: colors.mist }]}>{slot.time}</Text>
                  <View style={{ flex: 1, gap: 6 }}>
                    {players.length === 0 ? (
                      <T variant="bodyStrong" color={colors.pine600}>Vrij</T>
                    ) : (
                      <Row gap={6} style={{ flexWrap: 'wrap' }}>
                        {players.map((p) => (
                          <Row key={p.player_id} gap={5} style={[styles.player, mine && { backgroundColor: colors.onDarkLine }]}>
                            <Avatar name={p.player_name ?? ''} size={20} tone={p.member_id === member.id ? 'brass' : p.member_id ? 'pine' : 'brass'} />
                            <Text numberOfLines={1} style={[styles.playerName, mine && { color: colors.onDark }]}>
                              {p.member_id === member.id ? 'Jij' : (p.player_name ?? '').replace(' (gast)', '').split(' ')[0]}
                            </Text>
                          </Row>
                        ))}
                      </Row>
                    )}
                    {mine && <T variant="small" color={colors.onDarkMuted}>Tik om je af te melden</T>}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Pegs taken={players.length} max={course.max_players} dark={!!mine} />
                    {!mine && !full && <View style={styles.add}><Ionicons name="add" size={16} color={colors.pine700} /></View>}
                    {full && !mine && <T variant="small" color={colors.mist}>Vol</T>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}

/** Bezetting als vier tee-pegs: gevuld = bezet. */
function Pegs({ taken, max, dark }: { taken: number; max: number; dark: boolean }) {
  return (
    <Row gap={3}>
      {Array.from({ length: max }, (_, i) => (
        <View key={i} style={{ alignItems: 'center' }}>
          <View style={{ width: 8, height: 3, borderRadius: 2, backgroundColor: i < taken ? (dark ? colors.brassLight : colors.pine700) : (dark ? colors.onDarkLine : colors.lineStrong) }} />
          <View style={{ width: 2, height: 7, backgroundColor: i < taken ? (dark ? colors.brassLight : colors.pine700) : (dark ? colors.onDarkLine : colors.lineStrong) }} />
        </View>
      ))}
    </Row>
  );
}

const styles = StyleSheet.create({
  dates: { gap: space.sm, paddingHorizontal: space.lg },
  date: {
    width: 62, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', gap: 2,
    backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line,
  },
  dateActive: { backgroundColor: colors.pine800, borderColor: colors.pine800 },
  dateDay: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.slate },
  dateNum: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  slot: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14,
    backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line,
  },
  slotMine: { backgroundColor: colors.pine800, borderColor: colors.pine800 },
  slotFull: { backgroundColor: 'transparent' },
  time: { fontFamily: fonts.display, fontSize: 21, color: colors.ink, width: 62, fontVariant: ['tabular-nums'] },
  add: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.pine50, alignItems: 'center', justifyContent: 'center' },
  player: { backgroundColor: colors.chalk, borderRadius: radius.pill, paddingRight: 9, paddingLeft: 2, paddingVertical: 2 },
  playerName: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.ink, maxWidth: 90 },
});
