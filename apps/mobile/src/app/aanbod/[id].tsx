import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatEuro, localTime, priceInclVat, type Order, type Product } from '@golfapp/shared';
import { Contours } from '@/components/brand';
import { productIcon } from '@/components/offer';
import { Button, ErrorText, Eyebrow, Group, ListRow, Loading, Row, Screen, T } from '@/components/ui';
import { capitalize, formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { fetchAvailability, fulfilmentHint, placeOrder } from '@/lib/offers';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

/** Eén aanbod bestellen, eventueel gekoppeld aan een starttijd. */
export default function Aanbod() {
  const { id, booking, context } = useLocalSearchParams<{ id: string; booking?: string; context?: string }>();
  const member = useMember();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [placed, setPlaced] = useState<Order>();

  const { data, loading } = useQuery(async () => {
    const product = unwrap(await supabase.from('products').select('*').eq('id', id).single()) as Product;
    const bk = booking
      ? unwrap(await supabase.from('tee_bookings').select('starts_at, course:courses(name)').eq('id', booking).single()) as { starts_at: string; course: { name: string } }
      : null;
    const day = bk ? new Date(bk.starts_at) : new Date();
    const availability = product.daily_capacity ? await fetchAvailability(member.club_id, formatISO(day)) : new Map<string, number>();
    const mandate = await supabase.from('sepa_mandates').select('id').eq('member_id', member.id).eq('status', 'active').maybeSingle();
    return { product, booking: bk, remaining: availability.get(product.id), hasMandate: !!mandate.data };
  }, [id, booking]);

  if (loading || !data) return <Loading />;
  const { product } = data;
  const unit = priceInclVat(product.price_cents, Number(product.vat_rate));
  const max = Math.min(product.category === 'lesson' ? 4 : 8, data.remaining ?? 8);
  const soldOut = data.remaining !== undefined && data.remaining <= 0;

  const order = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setPlaced(await placeOrder({ memberId: member.id, bookingId: booking || null, lines: [{ productId: product.id, quantity: qty }] }));
      haptic.success();
    } catch (e) {
      haptic.warn();
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    if (!placed?.invoice_id) return;
    const { data: res, error } = await supabase.functions.invoke<{ checkoutUrl: string }>('create-payment', { body: { invoice_id: placed.invoice_id } });
    if (error || !res?.checkoutUrl) return setError('Online betalen lukt nu niet. De factuur staat klaar onder Facturen.');
    await WebBrowser.openBrowserAsync(res.checkoutUrl);
  };

  const header = (
    <View style={[styles.hero, { paddingTop: insets.top + space.md }]}>
      <Contours seed={product.name.length} />
      <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
        <Ionicons name="close" size={20} color={colors.onDark} />
      </Pressable>
      <View style={styles.bigIcon}><Ionicons name={productIcon(product)} size={34} color={colors.brassLight} /></View>
      {context && <Eyebrow color={colors.brassLight}>{context}</Eyebrow>}
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{formatEuro(unit)}</Text>
    </View>
  );

  if (placed) {
    return (
      <Screen header={header} footer={<Button title="Klaar" onPress={() => router.back()} />}>
        <View style={styles.done}>
          <View style={styles.check}><Ionicons name="checkmark" size={30} color={colors.onDark} /></View>
          <T variant="heading" style={{ textAlign: 'center' }}>Geregeld!</T>
          <T color={colors.slate} style={{ textAlign: 'center' }}>{fulfilmentHint[product.category]}.</T>
        </View>
        <Group>
          <ListRow icon="receipt-outline" title={formatEuro(placed.total_cents)} subtitle={data.hasMandate ? 'Wordt automatisch geïncasseerd' : 'Staat als factuur onder Facturen'} last />
        </Group>
        {!data.hasMandate && <Button title="Nu betalen met iDEAL" variant="secondary" icon="lock-closed" onPress={payNow} />}
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      footer={
        <Button
          title={soldOut ? 'Uitverkocht op deze dag' : `Bestellen · ${formatEuro(unit * qty)}`}
          icon={soldOut ? undefined : 'bag-check-outline'} onPress={order} loading={busy} disabled={soldOut}
        />
      }
    >
      <View style={{ height: space.lg }} />
      {product.description && <T color={colors.slate} style={{ fontSize: 16, lineHeight: 24 }}>{product.description}</T>}

      <Group>
        {data.booking && (
          <ListRow icon="time-outline" title={`Bij je ronde van ${localTime(data.booking.starts_at)}`}
            subtitle={`${capitalize(formatDate(data.booking.starts_at, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${data.booking.course.name}`} />
        )}
        <ListRow icon="location-outline" title={fulfilmentHint[product.category]} />
        <ListRow icon={data.hasMandate ? 'repeat-outline' : 'card-outline'} title="Op je rekening"
          subtitle={data.hasMandate ? 'Via je automatische incasso, geen gedoe bij de balie' : 'Je ontvangt een factuur en betaalt met iDEAL'} last />
      </Group>

      {max > 1 && !soldOut && (
        <Row style={styles.qtyRow}>
          <T variant="bodyStrong" style={{ flex: 1 }}>Aantal</T>
          <Pressable accessibilityLabel="Minder" style={styles.step} disabled={qty <= 1} onPress={() => { haptic.tap(); setQty(qty - 1); }}>
            <Ionicons name="remove" size={18} color={colors.pine800} />
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable accessibilityLabel="Meer" style={styles.step} disabled={qty >= max} onPress={() => { haptic.tap(); setQty(qty + 1); }}>
            <Ionicons name="add" size={18} color={colors.pine800} />
          </Pressable>
        </Row>
      )}
      {data.remaining !== undefined && data.remaining <= 3 && !soldOut && (
        <T variant="small" color={colors.flag}>Nog {data.remaining} beschikbaar op deze dag</T>
      )}
      <ErrorText message={error} />
    </Screen>
  );
}

function formatISO(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(d);
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.pine900, paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: 6 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.onDarkLine, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  bigIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.onDarkLine, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.onDark, letterSpacing: -0.5 },
  price: { fontFamily: fonts.display, fontSize: 22, color: colors.brassLight },
  qtyRow: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: space.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, gap: space.md },
  step: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: fonts.display, fontSize: 22, minWidth: 24, textAlign: 'center', color: colors.ink },
  done: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  check: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pine700, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
});
