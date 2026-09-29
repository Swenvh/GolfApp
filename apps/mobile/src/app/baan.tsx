import { courseStatusLabel, type Course, type CourseStatus } from '@golfapp/shared';
import { Card, Empty, ErrorText, Loading, Pill, Row, Screen, T } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

const tone: Record<CourseStatus, 'pine' | 'brass' | 'flag'> = { open: 'pine', beperkt: 'brass', gesloten: 'flag' };

/** Hoe de baan erbij ligt, zoals de marshal of het secretariaat het in clubbeheer zet. */
export default function Baan() {
  const member = useMember();
  const { data, loading, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('courses').select('*').eq('club_id', member.club_id).eq('active', true).order('holes', { ascending: false })) as Course[],
  [member.club_id]);

  if (loading) return <Loading />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorText message={error} />
      {data?.length === 0 && <Empty icon="map-outline" title="Geen baaninformatie">De club heeft nog geen baan ingesteld.</Empty>}
      {data?.map((c) => (
        <Card key={c.id} style={{ gap: space.sm, marginTop: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T variant="subheading" style={{ flex: 1 }}>{c.name}</T>
            <Pill label={courseStatusLabel[c.status]} tone={tone[c.status]} />
          </Row>
          <T color={c.status_note ? colors.ink : colors.slate}>{c.status_note ?? (c.status === 'open' ? 'Alle holes bespeelbaar.' : 'Vraag bij de receptie wat er aan de hand is.')}</T>
          {c.status_updated_at && <T variant="small" color={colors.mist}>Bijgewerkt {formatDateTime(c.status_updated_at)}</T>}
        </Card>
      ))}
    </Screen>
  );
}
