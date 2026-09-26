import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatEuro, priceInclVat, type Product } from '@golfapp/shared';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/lib/theme';
import type { IconName } from './ui';

export function productIcon(p: Pick<Product, 'icon'>): IconName {
  return (p.icon ?? 'pricetag-outline') as IconName;
}

/** Aanbodkaart voor een horizontale rij (Clubhuis). */
export function OfferCard({ eyebrow, title, subtitle, price, icon, onPress, tone = 'paper' }: {
  eyebrow: string; title: string; subtitle?: string; price?: string; icon: IconName; onPress: () => void; tone?: 'paper' | 'pine';
}) {
  const dark = tone === 'pine';
  return (
    <Pressable
      onPress={() => { haptic.tap(); onPress(); }}
      style={({ pressed }) => [styles.card, dark && styles.cardDark, pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]}
    >
      <View style={[styles.iconWrap, dark && { backgroundColor: colors.onDarkLine }]}>
        <Ionicons name={icon} size={22} color={dark ? colors.brassLight : colors.pine700} />
      </View>
      <View style={{ gap: 3, flex: 1 }}>
        <Text style={[styles.eyebrow, dark && { color: colors.brassLight }]}>{eyebrow}</Text>
        <Text style={[styles.title, dark && { color: colors.onDark }]} numberOfLines={2}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, dark && { color: colors.onDarkMuted }]} numberOfLines={2}>{subtitle}</Text>}
      </View>
      <View style={styles.footer}>
        {price ? <Text style={[styles.price, dark && { color: colors.onDark }]}>{price}</Text> : <View />}
        <View style={[styles.go, dark && { backgroundColor: colors.brass }]}>
          <Ionicons name="arrow-forward" size={16} color={dark ? colors.pine950 : colors.onDark} />
        </View>
      </View>
    </Pressable>
  );
}

/** Regel met − / + om een extra aan een boeking toe te voegen. */
export function AddOnRow({ product, quantity, onChange, remaining, max = 4, locked, handicart }: {
  product: Product; quantity: number; onChange: (q: number) => void; remaining?: number; max?: number; locked?: string;
  /** Lid heeft een geldige Handicart-pas: toon het Handicart-tarief */
  handicart?: boolean;
}) {
  const regular = priceInclVat(product.price_cents, Number(product.vat_rate));
  const special = handicart && product.handicart_price_cents != null
    ? priceInclVat(product.handicart_price_cents, Number(product.vat_rate)) : null;
  const soldOut = remaining !== undefined && remaining <= 0 && quantity === 0;
  const limit = Math.min(max, remaining ?? max);
  const active = quantity > 0;
  return (
    <View style={[styles.addOn, active && styles.addOnActive]}>
      <View style={[styles.addOnIcon, active && { backgroundColor: colors.pine700 }]}>
        <Ionicons name={productIcon(product)} size={20} color={active ? colors.onDark : colors.pine700} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.addOnTitle}>{product.name}</Text>
        <Text style={[styles.addOnMeta, soldOut && { color: colors.flag }]}>
          {special != null ? (
            <>
              <Text style={styles.strike}>{formatEuro(regular)}</Text>{' '}
              <Text style={styles.special}>{formatEuro(special)} met je Handicart-pas</Text>
            </>
          ) : formatEuro(regular)}
          {locked ? ` · ${locked}` : soldOut ? ' · alles vergeven rond deze tijd' : remaining !== undefined && remaining <= 3 ? ` · nog ${remaining} vrij` : ''}
        </Text>
      </View>
      {locked ? (
        <Text style={styles.qty}>{quantity}×</Text>
      ) : (
        <View style={styles.stepper}>
          {active && (
            <Pressable accessibilityRole="button" accessibilityLabel={`${product.name} minder`} hitSlop={6}
              onPress={() => { haptic.tap(); onChange(quantity - 1); }} style={styles.step}>
              <Ionicons name="remove" size={16} color={colors.pine800} />
            </Pressable>
          )}
          {active && <Text style={styles.qty}>{quantity}</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel={`${product.name} toevoegen`} hitSlop={6}
            disabled={soldOut || quantity >= limit}
            onPress={() => { haptic.tap(); onChange(quantity + 1); }}
            style={[styles.step, !active && styles.stepAdd, (soldOut || quantity >= limit) && { opacity: 0.35 }]}>
            <Ionicons name="add" size={16} color={active ? colors.pine800 : colors.onDark} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 212, minHeight: 196, padding: space.lg, gap: space.md, borderRadius: radius.lg,
    backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line,
  },
  cardDark: { backgroundColor: colors.pine800, borderColor: colors.pine800 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.pine50, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.brass },
  title: { fontFamily: fonts.display, fontSize: 17, lineHeight: 21, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.slate },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  go: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.pine700, alignItems: 'center', justifyContent: 'center' },
  addOn: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md,
    backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line,
  },
  addOnActive: { borderColor: colors.pine600, backgroundColor: colors.pine50 },
  addOnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.pine50, alignItems: 'center', justifyContent: 'center' },
  addOnTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink },
  addOnMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.slate },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  stepAdd: { backgroundColor: colors.pine700, borderColor: colors.pine700 },
  qty: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, minWidth: 14, textAlign: 'center' },
  strike: { textDecorationLine: 'line-through', color: colors.mist },
  special: { fontFamily: fonts.bodyBold, color: colors.pine700 },
});
