import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fullName, localTime } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { Avatar, Button, ErrorText, Eyebrow, Group, Input, ListRow, Row, Screen, T } from '@/components/ui';
import { capitalize, formatDate, formatHandicap } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type DirectoryEntry = { id: string; first_name: string; infix: string | null; last_name: string; handicap_index: number | null };
type Player = { memberId?: string; guestName?: string; label: string; hcp?: number | null };

export default function Boeken() {
  const { course, courseName, startsAt, bookingId } = useLocalSearchParams<{ course: string; courseName?: string; startsAt: string; bookingId?: string }>();
  const member = useMember();
  const insets = useSafeAreaInsets();
  const [players, setPlayers] = useState<Player[]>([{ memberId: member.id, label: fullName(member), hcp: member.handicap_index }]);
  const [search, setSearch] = useState('');
  const [guest, setGuest] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const existing = useQuery(async () => {
    if (!bookingId) return 0;
    const { count } = await supabase.from('tee_booking_players').select('id', { count: 'exact', head: true }).eq('booking_id', bookingId);
    return count ?? 0;
  }, [bookingId]);
  const directory = useQuery(async () =>
    unwrap(await supabase.rpc('club_directory', { p_club: member.club_id })) as DirectoryEntry[], [member.club_id]);

  const maxPlayers = 4 - (existing.data ?? 0);
  const canAdd = players.length < maxPlayers;
  const matches = search.length >= 2
    ? (directory.data ?? []).filter((d) => d.id !== member.id && !players.some((p) => p.memberId === d.id)
        && fullName(d).toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  const book = async () => {
    setBusy(true);
    setError(undefined);
    try {
      // Eén transactie: lukt het voor één speler niet (vol, al elders ingeschreven), dan wordt er niets geboekt
      unwrap(await supabase.rpc('book_tee_time', {
        p_course: course,
        p_starts_at: startsAt,
        p_member_ids: players.flatMap((p) => (p.memberId ? [p.memberId] : [])),
        p_guest_names: players.flatMap((p) => (p.guestName ? [p.guestName] : [])),
      }));
      haptic.success();
      router.back();
    } catch (e) {
      haptic.warn();
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
      <Contours seed={5} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Eyebrow color={colors.brassLight}>Starttijd boeken</Eyebrow>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={20} color={colors.onDark} />
        </Pressable>
      </Row>
      <Text style={styles.time}>{localTime(startsAt)}</Text>
      <T color={colors.onDarkMuted}>
        {capitalize(formatDate(startsAt, { weekday: 'long', day: 'numeric', month: 'long' }))}{courseName ? ` · ${courseName}` : ''}
      </T>
    </View>
  );

  return (
    <Screen
      header={header}
      footer={<Button title={`Bevestig voor ${players.length} ${players.length === 1 ? 'speler' : 'spelers'}`} icon="checkmark" onPress={book} loading={busy} />}
    >
      <View style={{ height: space.lg }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="heading">Jouw flight</T>
        <T variant="small" color={colors.slate}>{players.length} van {maxPlayers}{existing.data ? ` · al ${existing.data} ingeschreven` : ''}</T>
      </Row>
      <Group>
        {players.map((p, i) => (
          <ListRow
            key={i}
            title={i === 0 ? `${p.label} (jij)` : p.label}
            subtitle={p.guestName ? 'Gast · greenfee via de club' : `Handicap ${formatHandicap(p.hcp)}`}
            last={i === players.length - 1}
            right={
              <Row gap={space.md}>
                {i > 0 && (
                  <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel={`Verwijder ${p.label}`}
                    onPress={() => { haptic.tap(); setError(undefined); setPlayers(players.filter((_, j) => j !== i)); }}>
                    <Ionicons name="remove-circle-outline" size={22} color={colors.flag} />
                  </Pressable>
                )}
              </Row>
            }
          />
        ))}
      </Group>

      {canAdd && (
        <>
          <T variant="heading" style={{ marginTop: space.lg }}>Medespeler toevoegen</T>
          <Input placeholder="Zoek een clubgenoot" value={search} onChangeText={setSearch} />
          {matches.length > 0 && (
            <Group>
              {matches.map((d, i) => (
                <Pressable key={d.id} onPress={() => { haptic.tap(); setPlayers([...players, { memberId: d.id, label: fullName(d), hcp: d.handicap_index }]); setSearch(''); }}>
                  <Row style={[styles.match, i < matches.length - 1 && styles.matchDivider]} gap={space.md}>
                    <Avatar name={fullName(d)} size={34} />
                    <View style={{ flex: 1 }}>
                      <T variant="bodyStrong">{fullName(d)}</T>
                      <T variant="small" color={colors.slate}>Handicap {formatHandicap(d.handicap_index)}</T>
                    </View>
                    <Ionicons name="add-circle" size={24} color={colors.pine700} />
                  </Row>
                </Pressable>
              ))}
            </Group>
          )}
          <Row>
            <View style={{ flex: 1 }}><Input placeholder="Of voeg een gast toe" value={guest} onChangeText={setGuest} /></View>
            <Button title="Gast" icon="person-add-outline" variant="secondary" compact disabled={!guest.trim()}
              onPress={() => { setPlayers([...players, { guestName: guest.trim(), label: guest.trim() }]); setGuest(''); }} />
          </Row>
        </>
      )}
      <ErrorText message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.pine900, paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: 4 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.onDarkLine, alignItems: 'center', justifyContent: 'center' },
  time: { fontFamily: fonts.display, fontSize: 64, lineHeight: 70, color: colors.onDark, letterSpacing: -2, marginTop: space.md, fontVariant: ['tabular-nums'] },
  match: { paddingHorizontal: space.lg, paddingVertical: 12 },
  matchDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});
