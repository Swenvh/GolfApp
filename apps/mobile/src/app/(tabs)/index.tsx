import { router } from 'expo-router';
import { View } from 'react-native';
import { formatEuro, localTime, type NewsPost } from '@golfapp/shared';
import { Body, Card, Empty, ErrorText, Pill, Row, Screen, SectionHeader, Title } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { unwrap, useQuery } from '@/lib/useQuery';
import { useTheme } from '@/lib/theme';

export default function Home() {
  const member = useMember();
  const t = useTheme();
  const { data, error, refreshing, refresh } = useQuery(async () => {
    const [news, bookings, invoices] = await Promise.all([
      supabase.from('news_posts').select('*').eq('club_id', member.club_id)
        .order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(20),
      supabase.from('tee_booking_players').select('booking:tee_bookings!inner(id, starts_at, course:courses(name))')
        .eq('member_id', member.id).gte('booking.starts_at', new Date().toISOString()),
      supabase.from('invoices').select('total_cents, paid_cents, due_date').eq('member_id', member.id).eq('status', 'open'),
    ]);
    type B = { booking: { id: string; starts_at: string; course: { name: string } } };
    return {
      news: unwrap(news) as NewsPost[],
      bookings: (unwrap(bookings) as unknown as B[]).map((b) => b.booking).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
      outstanding: (unwrap(invoices) ?? []).reduce((s, i) => s + i.total_cents - i.paid_cents, 0),
    };
  }, [member.id]);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title style={{ fontSize: 24 }}>Hallo {member.first_name} 👋</Title>
      <ErrorText message={error} />

      <Row style={{ gap: 12 }}>
        <Card style={{ flex: 1 }} onPress={() => router.push('/(tabs)/scores')}>
          <Body muted>Handicap</Body>
          <Title style={{ fontSize: 28, color: t.primary }}>{formatHandicap(member.handicap_index)}</Title>
        </Card>
        <Card style={{ flex: 1 }} onPress={() => router.push('/facturen')}>
          <Body muted>Openstaand</Body>
          <Title style={{ fontSize: 28, color: data?.outstanding ? t.warn : t.primary }}>{formatEuro(data?.outstanding ?? 0)}</Title>
        </Card>
      </Row>

      <SectionHeader>Mijn starttijden</SectionHeader>
      {data?.bookings.length ? data.bookings.slice(0, 3).map((b) => (
        <Card key={b.id} onPress={() => router.push('/(tabs)/starttijden')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Title>{formatDate(b.starts_at, { weekday: 'long', day: 'numeric', month: 'long' })}</Title>
              <Body muted>{b.course.name}</Body>
            </View>
            <Title style={{ fontSize: 22, color: t.primary }}>{localTime(b.starts_at)}</Title>
          </Row>
        </Card>
      )) : (
        <Card onPress={() => router.push('/(tabs)/starttijden')}>
          <Body muted>Geen geplande rondes. Tik om een starttijd te boeken.</Body>
        </Card>
      )}

      <SectionHeader>Clubnieuws</SectionHeader>
      {data?.news.length === 0 && <Empty>Nog geen nieuws.</Empty>}
      {data?.news.map((n) => (
        <Card key={n.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body muted>{n.published_at ? formatDate(n.published_at) : ''}</Body>
            {n.pinned && <Pill label="Belangrijk" tone="primary" />}
          </Row>
          <Title>{n.title}</Title>
          <Body>{n.body}</Body>
        </Card>
      ))}
    </Screen>
  );
}
