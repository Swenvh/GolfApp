import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { fullName, localTime } from '@golfapp/shared';
import { Body, Button, Card, Input, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type DirectoryEntry = { id: string; first_name: string; infix: string | null; last_name: string; handicap_index: number | null };
type Player = { memberId?: string; guestName?: string; label: string };

export default function Boeken() {
  const { course, startsAt, bookingId } = useLocalSearchParams<{ course: string; startsAt: string; bookingId?: string }>();
  const member = useMember();
  const t = useTheme();
  const [players, setPlayers] = useState<Player[]>([{ memberId: member.id, label: `${fullName(member)} (jij)` }]);
  const [search, setSearch] = useState('');
  const [guest, setGuest] = useState('');
  const [busy, setBusy] = useState(false);

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
    try {
      let id = bookingId || null;
      if (!id) {
        const res = await supabase.from('tee_bookings')
          .insert({ club_id: member.club_id, course_id: course, starts_at: startsAt, created_by: member.user_id })
          .select('id').single();
        if (res.error?.code === '23505') {
          // Iemand anders was net eerder: sluit aan bij die flight
          const found = await supabase.from('tee_bookings').select('id').eq('course_id', course).eq('starts_at', startsAt).single();
          id = unwrap(found).id;
        } else {
          id = unwrap(res).id;
        }
      }
      unwrap(await supabase.from('tee_booking_players').insert(
        players.map((p) => ({ booking_id: id, member_id: p.memberId ?? null, guest_name: p.guestName ?? null })),
      ).select());
      router.back();
    } catch (e) {
      Alert.alert('Boeken mislukt', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Body muted>{formatDate(startsAt, { weekday: 'long', day: 'numeric', month: 'long' })}</Body>
        <Title style={{ fontSize: 32, color: t.primary }}>{localTime(startsAt)}</Title>
        {!!existing.data && <Body muted>Er staan al {existing.data} speler(s) in deze flight.</Body>}
      </Card>

      <SectionHeader>Spelers ({players.length}/{maxPlayers})</SectionHeader>
      {players.map((p, i) => (
        <Card key={i}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body>{p.label}</Body>
            {i > 0 && (
              <Pressable onPress={() => setPlayers(players.filter((_, j) => j !== i))}>
                <Body style={{ color: t.danger }}>Verwijder</Body>
              </Pressable>
            )}
          </Row>
        </Card>
      ))}

      {canAdd && (
        <>
          <SectionHeader>Medespeler toevoegen</SectionHeader>
          <Input placeholder="Zoek clubgenoot…" value={search} onChangeText={setSearch} />
          {matches.map((d) => (
            <Card key={d.id} onPress={() => { setPlayers([...players, { memberId: d.id, label: fullName(d) }]); setSearch(''); }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body>{fullName(d)}</Body>
                <Body muted>hcp {formatHandicap(d.handicap_index)}</Body>
              </Row>
            </Card>
          ))}
          <Row>
            <View style={{ flex: 1 }}><Input placeholder="Naam gast (greenfee)" value={guest} onChangeText={setGuest} /></View>
            <Button title="+ Gast" variant="secondary" disabled={!guest.trim()}
              onPress={() => { setPlayers([...players, { guestName: guest.trim(), label: `${guest.trim()} (gast)` }]); setGuest(''); }} />
          </Row>
        </>
      )}

      <Button title="Bevestig boeking" onPress={book} loading={busy} style={{ marginTop: 12 }} />
    </Screen>
  );
}
