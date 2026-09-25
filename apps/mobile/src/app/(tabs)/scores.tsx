import { router } from 'expo-router';
import { handicapIndexFromDifferentials, type Round } from '@golfapp/shared';
import { Body, Button, Card, Empty, ErrorText, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type RoundRow = Round & { tee: { name: string; course: { name: string } } | null };

export default function Scores() {
  const member = useMember();
  const t = useTheme();
  const { data, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('rounds').select('*, tee:course_tees(name, course:courses(name))')
      .eq('member_id', member.id).order('played_on', { ascending: false }).limit(40)) as RoundRow[], [member.id]);

  const differentials = (data ?? []).filter((r) => r.qualifying && r.score_differential != null).map((r) => Number(r.score_differential));
  const indication = handicapIndexFromDifferentials(differentials);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Row style={{ gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Body muted>Handicap (NGF)</Body>
          <Title style={{ fontSize: 30, color: t.primary }}>{formatHandicap(member.handicap_index)}</Title>
        </Card>
        <Card style={{ flex: 1 }}>
          <Body muted>Indicatie o.b.v. app</Body>
          <Title style={{ fontSize: 30 }}>{indication == null ? '—' : formatHandicap(indication)}</Title>
          <Body muted style={{ fontSize: 12 }}>{differentials.length} qualifying kaarten</Body>
        </Card>
      </Row>
      <Button title="+ Nieuwe scorekaart" onPress={() => router.push('/scorekaart')} />
      <ErrorText message={error} />

      <SectionHeader>Mijn rondes</SectionHeader>
      {data?.length === 0 && <Empty>Nog geen rondes. Voer je eerste scorekaart in!</Empty>}
      {data?.map((r) => (
        <Card key={r.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body muted>{formatDate(r.played_on, { day: 'numeric', month: 'short', year: 'numeric' })}</Body>
            {r.qualifying && <Body style={{ color: t.primary, fontWeight: '600' }}>Qualifying</Body>}
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body>{r.tee ? `${r.tee.course.name} · ${r.tee.name}` : 'Onbekende baan'}</Body>
            <Title>{r.stableford_points ?? '—'} pnt · {r.gross_score}</Title>
          </Row>
        </Card>
      ))}
      <Body muted style={{ fontSize: 12, textAlign: 'center' }}>
        Je officiële handicap wordt beheerd door de NGF. Qualifying kaarten worden door de club doorgezet naar de NGF.
      </Body>
    </Screen>
  );
}
