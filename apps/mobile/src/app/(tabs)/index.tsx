import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatEuro, localDate, localTime, priceInclVat, type MembershipType, type NewsPost, type Product, type TeeSheetRow } from '@golfapp/shared';
import { OfferCard, productIcon } from '@/components/offer';
import { Contours, LogoMark } from '@/components/brand';
import { TeeTicket } from '@/components/ticket';
import { Card, Empty, ErrorText, Eyebrow, Row, Section, T, type IconName } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

function greeting() {
  const h = Number(new Intl.DateTimeFormat('nl-NL', { hour: 'numeric', hour12: false, timeZone: 'Europe/Amsterdam' }).format(new Date()));
  return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
}

export default function Clubhuis() {
  const member = useMember();
  const insets = useSafeAreaInsets();

  const { data, error, refreshing, refresh } = useQuery(async () => {
    const [news, bookings, invoices] = await Promise.all([
      supabase.from('news_posts').select('*').eq('club_id', member.club_id)
        .order('pinned', { ascending: false }).order('published_at', { ascending: false }).limit(20),
      supabase.from('tee_booking_players').select('booking:tee_bookings!inner(id, starts_at, course:courses(id, name, max_players))')
        .eq('member_id', member.id).gte('booking.starts_at', new Date().toISOString()),
      supabase.from('invoices').select('total_cents, paid_cents').eq('member_id', member.id).eq('status', 'open'),
    ]);
    type B = { booking: { id: string; starts_at: string; course: { id: string; name: string; max_players: number } } };
    const upcoming = (unwrap(bookings) as unknown as B[]).map((b) => b.booking).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const next = upcoming[0];
    let flight: TeeSheetRow[] = [];
    let extras: string[] = [];
    if (next) {
      const [sheet, orders] = await Promise.all([
        supabase.rpc('tee_sheet', { p_course: next.course.id, p_day: localDate(new Date(next.starts_at)) }),
        supabase.from('orders').select('order_lines(description, quantity, product:products(category))').eq('booking_id', next.id)
          .eq('member_id', member.id).eq('status', 'placed'),
      ]);
      flight = ((sheet.data ?? []) as TeeSheetRow[]).filter((r) => r.booking_id === next.id && r.player_id);
      // Alleen wat fysiek klaarstaat (niet de greenfee van introducés)
      extras = ((orders.data ?? []) as unknown as { order_lines: { description: string; quantity: number; product: { category: string } | null }[] }[])
        .flatMap((o) => o.order_lines).filter((l) => l.product?.category !== 'greenfee')
        .map((l) => (l.quantity > 1 ? `${l.quantity}× ${l.description}` : l.description));
    }
    const [products, types] = await Promise.all([
      supabase.from('products').select('*').eq('club_id', member.club_id).eq('active', true).order('sort'),
      supabase.from('membership_types').select('*').eq('club_id', member.club_id),
    ]);
    return {
      news: unwrap(news) as NewsPost[],
      next, flight, extras, upcomingCount: upcoming.length,
      products: (products.data ?? []) as Product[],
      myType: ((types.data ?? []) as MembershipType[]).find((t) => t.id === member.membership_type_id),
      outstanding: (unwrap(invoices) ?? []).reduce((s, i) => s + i.total_cents - i.paid_cents, 0),
    };
  }, [member.id]);

  const [featured, ...rest] = data?.news ?? [];

  // Aanbod dat past bij het moment: rond je volgende ronde, of algemeen
  const find = (cat: Product['category']) => data?.products.find((p) => p.category === cat);
  const price = (p: Product) => formatEuro(priceInclVat(p.price_cents, Number(p.vat_rate)));
  const has = (name: string) => data?.extras.some((e) => e.includes(name));
  const offers: (Parameters<typeof OfferCard>[0] & { key: string })[] = [];
  const next = data?.next;
  if (next) {
    const range = find('range');
    const lunch = find('food');
    const when = `Voor je ronde van ${localTime(next.starts_at)}`;
    if (range && !has(range.name)) offers.push({ key: 'range', eyebrow: when, title: 'Warm je op op de range', subtitle: range.name, price: price(range), icon: productIcon(range),
      onPress: () => router.push({ pathname: '/aanbod/[id]', params: { id: range.id, booking: next.id, context: when } }) });
    if (lunch && !has(lunch.name)) offers.push({ key: 'lunch', eyebrow: 'Na je ronde', title: lunch.name, subtitle: 'Je tafel staat klaar als je binnenkomt', price: price(lunch), icon: productIcon(lunch),
      onPress: () => router.push({ pathname: '/aanbod/[id]', params: { id: lunch.id, booking: next.id, context: 'Na je ronde' } }) });
  }
  if (data?.myType && !data.myType.can_book_weekend) {
    offers.push({ key: 'upgrade', eyebrow: 'Lidmaatschap', title: 'Ook in het weekend spelen?', subtitle: 'Bekijk wat een upgrade kost', icon: 'ribbon-outline', tone: 'pine',
      onPress: () => router.push('/upgrade') });
  }
  offers.push({ key: 'referral', eyebrow: 'Samen golfen', title: 'Introduceer een vriend', subtitle: 'Gratis introductieronde, samen met jou', icon: 'people-outline', tone: 'pine',
    onPress: () => router.push('/introduceren') });
  const shop = find('proshop');
  if (shop) offers.push({ key: 'shop', eyebrow: 'Proshop', title: shop.name, subtitle: 'Ligt voor je klaar bij de caddiemaster', price: price(shop), icon: productIcon(shop),
    onPress: () => router.push({ pathname: '/aanbod/[id]', params: { id: shop.id, context: 'Proshop' } }) });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.chalk }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.onDark} />}
    >
      {/* Header */}
      <View style={[styles.hero, { paddingTop: insets.top + space.lg }]}>
        <Contours seed={member.club.name.length} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={10}>
            <LogoMark size={30} />
            <Eyebrow color={colors.brassLight}>{member.club.name}</Eyebrow>
          </Row>
          <Pressable hitSlop={12} onPress={() => { haptic.tap(); router.push('/(tabs)/profiel'); }} style={styles.memberChip}>
            <Text style={styles.memberChipText}>#{member.member_number}</Text>
          </Pressable>
        </Row>
        <View style={{ gap: 2, marginTop: space.xxl }}>
          <T color={colors.onDarkMuted}>{greeting()},</T>
          <Text style={styles.name}>{member.first_name}</Text>
        </View>
        <Row style={styles.stats} gap={0}>
          <HeroStat label="Handicap" value={formatHandicap(member.handicap_index)} onPress={() => router.push('/(tabs)/scores')} />
          <View style={styles.statDivider} />
          <HeroStat label="Gepland" value={String(data?.upcomingCount ?? 0)} onPress={() => router.push('/(tabs)/starttijden')} />
          <View style={styles.statDivider} />
          <HeroStat label="Openstaand" value={formatEuro(data?.outstanding ?? 0).replace(',00', '')}
            highlight={!!data?.outstanding} onPress={() => router.push('/facturen')} />
        </Row>
      </View>

      <View style={{ paddingHorizontal: space.lg, gap: space.md, marginTop: -space.xxl }}>
        <ErrorText message={error} />
        {data?.next ? (
          <TeeTicket
            startsAt={data.next.starts_at}
            courseName={data.next.course.name}
            maxPlayers={data.next.course.max_players}
            players={data.flight.map((f) => ({ name: f.player_name ?? '', guest: !f.member_id, me: f.member_id === member.id }))}
            extras={data.extras}
            onPress={() => router.push('/(tabs)/starttijden')}
          />
        ) : (
          <Card elevated onPress={() => router.push('/(tabs)/starttijden')}>
            <Row gap={space.md}>
              <View style={styles.bigIcon}><Ionicons name="flag" size={22} color={colors.brass} /></View>
              <View style={{ flex: 1 }}>
                <T variant="subheading">Nog geen ronde gepland</T>
                <T variant="small" color={colors.slate}>Kies een starttijd en nodig je flight uit.</T>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.pine700} />
            </Row>
          </Card>
        )}

        <Row gap={space.sm} style={{ marginTop: space.xs }}>
          <Quick icon="add-circle-outline" label="Boeken" onPress={() => router.push('/(tabs)/starttijden')} />
          <Quick icon="create-outline" label="Scorekaart" onPress={() => router.push('/scorekaart')} />
          <Quick icon="trophy-outline" label="Wedstrijden" onPress={() => router.push('/(tabs)/wedstrijden')} />
          <Quick icon="people-outline" label="Leden" onPress={() => router.push('/ledenlijst')} />
        </Row>

        {offers.length > 0 && (
          <Section title="Voor jou">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.lg }}
              contentContainerStyle={{ gap: space.md, paddingHorizontal: space.lg, paddingBottom: 4 }}>
              {offers.map(({ key, ...o }) => <OfferCard key={key} {...o} />)}
            </ScrollView>
          </Section>
        )}

        <Section title="Van de club">
          {!data?.news.length && <Empty icon="newspaper-outline" title="Nog geen nieuws">Berichten van de club verschijnen hier.</Empty>}
          {featured && (
            <Card tone="pine" style={{ padding: space.xl, gap: space.md }}>
              <Contours seed={2} opacity={0.06} />
              <Row style={{ justifyContent: 'space-between' }}>
                <Eyebrow color={colors.brassLight}>{featured.pinned ? 'Uitgelicht' : 'Laatste nieuws'}</Eyebrow>
                <T variant="small" color={colors.onDarkMuted}>{featured.published_at ? formatDate(featured.published_at) : ''}</T>
              </Row>
              <T variant="heading" color={colors.onDark} style={{ fontSize: 24, lineHeight: 29 }}>{featured.title}</T>
              <T color={colors.onDarkMuted}>{featured.body}</T>
            </Card>
          )}
          {rest.map((n) => (
            <Card key={n.id} style={{ gap: 6 }}>
              <T variant="small" color={colors.mist}>{n.published_at ? formatDate(n.published_at, { day: 'numeric', month: 'long' }) : ''}</T>
              <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 18 }}>{n.title}</T>
              <T color={colors.slate} numberOfLines={3}>{n.body}</T>
            </Card>
          ))}
        </Section>
      </View>
    </ScrollView>
  );
}

function HeroStat({ label, value, onPress, highlight }: { label: string; value: string; onPress: () => void; highlight?: boolean }) {
  return (
    <Pressable style={{ flex: 1, gap: 4 }} onPress={() => { haptic.tap(); onPress(); }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.brassLight }]}>{value}</Text>
    </Pressable>
  );
}

function Quick({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={() => { haptic.tap(); onPress(); }} style={({ pressed }) => [styles.quick, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={22} color={colors.pine700} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.pine900, paddingHorizontal: space.xl, paddingBottom: space.xxxl + space.xxl },
  memberChip: { borderWidth: 1, borderColor: colors.onDarkLine, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  memberChipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onDarkMuted, letterSpacing: 0.5 },
  name: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, color: colors.onDark, letterSpacing: -1 },
  stats: { marginTop: space.xl, paddingTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.onDarkLine },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.onDarkLine, marginHorizontal: space.md },
  statLabel: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.onDarkMuted },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.onDark, fontVariant: ['tabular-nums'] },
  bigIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brassSoft, alignItems: 'center', justifyContent: 'center' },
  quick: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: radius.lg,
    backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line,
  },
  quickLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.ink },
});
