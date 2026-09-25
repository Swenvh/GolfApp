import { router } from 'expo-router';
import { competitionFormatLabel, competitionStatusLabel, type Competition } from '@golfapp/shared';
import { Body, Card, Empty, ErrorText, Pill, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { unwrap, useQuery } from '@/lib/useQuery';

type Row_ = Competition & { competition_entries: { member_id: string }[] };

export default function Wedstrijden() {
  const member = useMember();
  const { data, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('competitions').select('*, competition_entries(member_id)')
      .eq('club_id', member.club_id).order('starts_at')) as Row_[], [member.club_id]);

  const now = new Date().toISOString();
  const upcoming = (data ?? []).filter((c) => c.starts_at >= now);
  const past = (data ?? []).filter((c) => c.starts_at < now).reverse().slice(0, 10);

  const item = (c: Row_) => {
    const joined = c.competition_entries.some((e) => e.member_id === member.id);
    return (
      <Card key={c.id} onPress={() => router.push({ pathname: '/wedstrijd/[id]', params: { id: c.id } })}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body muted>{formatDateTime(c.starts_at)}</Body>
          {joined ? <Pill label="Ingeschreven" tone="primary" /> : <Pill label={competitionStatusLabel[c.status]} />}
        </Row>
        <Title>{c.name}</Title>
        <Body muted>{competitionFormatLabel[c.format]} · {c.competition_entries.length}{c.max_participants ? `/${c.max_participants}` : ''} deelnemers</Body>
      </Card>
    );
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorText message={error} />
      <SectionHeader>Komend</SectionHeader>
      {upcoming.length === 0 ? <Empty>Geen komende wedstrijden.</Empty> : upcoming.map(item)}
      {past.length > 0 && <SectionHeader>Uitslagen</SectionHeader>}
      {past.map(item)}
    </Screen>
  );
}
