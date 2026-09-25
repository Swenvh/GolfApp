import { router } from 'expo-router';
import { formatEuro, invoiceStatusLabel, localDate, type Invoice } from '@golfapp/shared';
import { Body, Card, Empty, ErrorText, Pill, Row, Screen, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { unwrap, useQuery } from '@/lib/useQuery';

export default function Facturen() {
  const member = useMember();
  const { data, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('invoices').select('*').eq('member_id', member.id)
      .order('issue_date', { ascending: false })) as Invoice[], [member.id]);
  const today = localDate();

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorText message={error} />
      {data?.length === 0 && <Empty>Je hebt nog geen facturen.</Empty>}
      {data?.map((i) => {
        const overdue = i.status === 'open' && i.due_date < today;
        return (
          <Card key={i.id} onPress={() => router.push({ pathname: '/factuur/[id]', params: { id: i.id } })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body muted>{i.invoice_number} · {formatDate(i.issue_date)}</Body>
              <Pill label={overdue ? 'Vervallen' : invoiceStatusLabel[i.status]} tone={overdue ? 'danger' : i.status === 'open' ? 'warn' : i.status === 'paid' ? 'primary' : 'default'} />
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body style={{ flex: 1 }}>{i.description}</Body>
              <Title>{formatEuro(i.total_cents)}</Title>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
