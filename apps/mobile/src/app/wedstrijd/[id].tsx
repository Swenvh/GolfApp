import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { competitionFormatLabel, competitionStatusLabel, formatEuro, type Competition } from '@golfapp/shared';
import { Body, Button, Card, Empty, Loading, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDateTime, formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Participant = { member_id: string; name: string; handicap_index: number | null; position: number | null;
  gross_score: number | null; net_score: number | null; stableford_points: number | null };

export default function WedstrijdDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = useMember();
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const { data, loading, reload } = useQuery(async () => {
    const [comp, participants] = await Promise.all([
      supabase.from('competitions').select('*').eq('id', id).single(),
      supabase.rpc('competition_participants', { p_competition: id }),
    ]);
    return { comp: unwrap(comp) as Competition, participants: unwrap(participants) as Participant[] };
  }, [id]);

  if (loading || !data) return <Loading />;
  const { comp, participants } = data;
  const joined = participants.some((p) => p.member_id === member.id);
  const deadlinePassed = !!comp.registration_deadline && new Date(comp.registration_deadline) < new Date();
  const full = !!comp.max_participants && participants.length >= comp.max_participants;
  const canJoin = comp.status === 'open' && !deadlinePassed && !full;
  const tooHigh = comp.max_handicap != null && member.handicap_index != null && member.handicap_index > comp.max_handicap;
  const hasResults = participants.some((p) => p.position != null);

  const toggle = async () => {
    setBusy(true);
    const res = joined
      ? await supabase.from('competition_entries').delete().eq('competition_id', id).eq('member_id', member.id)
      : await supabase.from('competition_entries').insert({ competition_id: id, member_id: member.id });
    setBusy(false);
    if (res.error) Alert.alert('Mislukt', res.error.message);
    reload();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: comp.name }} />
      <Card>
        <Title style={{ fontSize: 22 }}>{comp.name}</Title>
        <Body muted>{formatDateTime(comp.starts_at)}</Body>
        <Body>{competitionFormatLabel[comp.format]} · {comp.qualifying ? 'qualifying' : 'niet-qualifying'}</Body>
        {comp.entry_fee_cents > 0 && <Body>Inschrijfgeld {formatEuro(comp.entry_fee_cents)}</Body>}
        {comp.registration_deadline && <Body muted>Inschrijven t/m {formatDateTime(comp.registration_deadline)}</Body>}
        {comp.description && <Body style={{ marginTop: 6 }}>{comp.description}</Body>}
      </Card>

      {comp.status === 'open' && (joined
        ? <Button title="Uitschrijven" variant="danger" onPress={toggle} loading={busy} />
        : <Button title={full ? 'Vol' : deadlinePassed ? 'Inschrijving gesloten' : tooHigh ? `Max. handicap ${comp.max_handicap}` : 'Inschrijven'}
            onPress={toggle} loading={busy} disabled={!canJoin || tooHigh} />)}
      {comp.status !== 'open' && <Body muted>{competitionStatusLabel[comp.status]}</Body>}

      <SectionHeader>{hasResults ? 'Uitslag' : `Deelnemers (${participants.length})`}</SectionHeader>
      {participants.length === 0 && <Empty>Nog geen deelnemers.</Empty>}
      {participants.map((p) => (
        <Card key={p.member_id} style={p.member_id === member.id ? { borderColor: t.primary, borderWidth: 1.5 } : undefined}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row>
              {p.position != null && <Title style={{ width: 28, color: t.primary }}>{p.position}</Title>}
              <Body>{p.name}</Body>
            </Row>
            <Body muted>
              {hasResults
                ? (comp.format === 'stableford' ? `${p.stableford_points ?? '—'} pnt` : `${p.gross_score ?? '—'} / ${p.net_score ?? '—'}`)
                : `hcp ${formatHandicap(p.handicap_index)}`}
            </Body>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
