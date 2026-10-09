import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius, shadow, space, type } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'] | 'golf-cart';

/** Buggy's zijn golfkarren, geen auto's: ook iconen uit de database ('car-sport-outline') tonen een golfkar. */
const GOLF_CART = new Set<string>(['golf-cart', 'car-sport', 'car-sport-outline', 'car', 'car-outline']);

export function Icon({ name, size, color }: { name: IconName; size: number; color: string }) {
  if (GOLF_CART.has(name)) return <MaterialCommunityIcons name="golf-cart" size={Math.round(size * 1.1)} color={color} />;
  return <Ionicons name={name as ComponentProps<typeof Ionicons>['name']} size={size} color={color} />;
}

// ---------------------------------------------------------------------------
// Typografie
// ---------------------------------------------------------------------------
type Variant = keyof typeof type;

/** Hoe ver grote koppen en cijfers meegroeien met de systeemtekstgrootte; lopende tekst groeit vrij mee. */
const maxScale: Partial<Record<Variant, number>> = { hero: 1.3, title: 1.4, heading: 1.6 };

export function T({ variant = 'body', color = colors.ink, style, children, numberOfLines, onPress }: {
  variant?: Variant; color?: string; style?: StyleProp<TextStyle>; children: ReactNode; numberOfLines?: number; onPress?: () => void;
}) {
  return (
    <Text onPress={onPress} accessibilityRole={onPress ? 'link' : variant === 'title' || variant === 'hero' ? 'header' : undefined}
      numberOfLines={numberOfLines} maxFontSizeMultiplier={maxScale[variant]} style={[type[variant] as TextStyle, { color }, style]}>
      {children}
    </Text>
  );
}

export function Eyebrow({ children, color = colors.brassText, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <T variant="eyebrow" color={color} style={style}>{children}</T>;
}

// ---------------------------------------------------------------------------
// Schermopbouw
// ---------------------------------------------------------------------------
export function Screen({ children, title, eyebrow, action, header, footer, refreshing, onRefresh, padded = true, background = colors.chalk }: {
  children: ReactNode; title?: string; eyebrow?: string; action?: ReactNode; header?: ReactNode; footer?: ReactNode;
  refreshing?: boolean; onRefresh?: () => void; padded?: boolean; background?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: footer ? 120 : insets.bottom + 32 }}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.pine700} /> : undefined}
      >
        {header}
        {title && (
          <View style={[styles.largeHeader, { paddingTop: insets.top + space.xl }]}>
            <View style={{ flex: 1, gap: 4 }}>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <T variant="title">{title}</T>
            </View>
            {action}
          </View>
        )}
        <View style={padded ? { paddingHorizontal: space.lg, gap: space.md } : undefined}>{children}</View>
      </ScrollView>
      {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>{footer}</View>}
    </View>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: space.sm, marginTop: space.lg }}>
      <View style={styles.sectionHead}>
        <T variant="heading">{title}</T>
        {action}
      </View>
      {children}
    </View>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={14} accessibilityRole="button" accessibilityLabel={label}>
      <T variant="small" color={colors.pine600} style={{ fontFamily: fonts.bodyBold }}>{label}</T>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Kaarten en lijsten
// ---------------------------------------------------------------------------
export function Card({ children, style, onPress, tone = 'paper', elevated = false }: {
  children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void;
  tone?: 'paper' | 'pine' | 'brass'; elevated?: boolean;
}) {
  const bg = tone === 'pine' ? colors.pine800 : tone === 'brass' ? colors.brassSoft : colors.paper;
  const base = [styles.card, { backgroundColor: bg }, tone === 'paper' && styles.cardBorder, elevated && shadow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={() => { haptic.tap(); onPress(); }} style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

/** Gegroepeerde lijst in iOS-stijl: rijen met fijne scheidingslijnen. */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

export function ListRow({ icon, title, subtitle, right, onPress, last, destructive }: {
  icon?: IconName; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; last?: boolean; destructive?: boolean;
}) {
  const content = (
    <View style={[styles.row, !last && styles.rowDivider]}>
      {icon && (
        <View style={[styles.rowIcon, destructive && { backgroundColor: colors.flagSoft }]}>
          <Icon name={icon} size={20} color={destructive ? colors.flag : colors.pine700} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong" color={destructive ? colors.flag : colors.ink}>{title}</T>
        {subtitle && <T variant="small" color={colors.slate}>{subtitle}</T>}
      </View>
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={20} color={colors.mist} />}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={() => { haptic.tap(); onPress(); }} style={({ pressed }) => pressed && { backgroundColor: colors.pine50 }}>
      {content}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Knoppen en invoer
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'light';

const buttonColors: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.pine700, fg: colors.onDark, border: colors.pine700 },
  accent: { bg: colors.brass, fg: colors.pine950, border: colors.brass },
  secondary: { bg: 'transparent', fg: colors.pine700, border: colors.lineStrong },
  ghost: { bg: 'transparent', fg: colors.pine700, border: 'transparent' },
  danger: { bg: 'transparent', fg: colors.flag, border: colors.flagSoft },
  light: { bg: colors.onDark, fg: colors.pine900, border: colors.onDark },
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style, compact }: {
  title: string; onPress: () => void; variant?: ButtonVariant; icon?: IconName;
  disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; compact?: boolean;
}) {
  const c = buttonColors[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => { haptic.tap(); onPress(); }}
      style={({ pressed }) => [
        styles.button, compact && styles.buttonCompact,
        { backgroundColor: c.bg, borderColor: c.border },
        disabled && { opacity: 0.4 }, pressed && styles.pressed, style,
      ]}
    >
      {loading ? <ActivityIndicator color={c.fg} /> : (
        <>
          {icon && <Icon name={icon} size={compact ? 18 : 20} color={c.fg} />}
          <Text maxFontSizeMultiplier={1.5} style={[styles.buttonText, compact && { fontSize: 16 }, { color: c.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Input({ label, style, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Eyebrow color={colors.slate}>{label}</Eyebrow>}
      <TextInput placeholderTextColor={colors.mist} accessibilityLabel={label ?? props.placeholder} {...props} style={[styles.input, style]} />
    </View>
  );
}

export function Segmented<K extends string>({ options, value, onChange, dark }: {
  options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; dark?: boolean;
}) {
  return (
    <View accessibilityRole="tablist" style={[styles.segmented, dark && { backgroundColor: colors.onDarkLine }]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="tab" accessibilityLabel={o.label} accessibilityState={{ selected: active }}
            onPress={() => { haptic.tap(); onChange(o.key); }}
            style={[styles.segment, active && (dark ? { backgroundColor: colors.onDark } : styles.segmentActive)]}>
            <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={[styles.segmentText, { color: active ? colors.pine900 : dark ? colors.onDarkMuted : colors.slate }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Kleine elementen
// ---------------------------------------------------------------------------
const pillTones = {
  pine: { bg: colors.pine50, fg: colors.pine700 },
  brass: { bg: colors.brassSoft, fg: colors.brassText },
  flag: { bg: colors.flagSoft, fg: colors.flag },
  neutral: { bg: colors.chalk, fg: colors.slate },
  dark: { bg: colors.onDarkLine, fg: colors.onDark },
} as const;

export function Pill({ label, tone = 'neutral', icon, style }: { label: string; tone?: keyof typeof pillTones; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const c = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]}>
      {icon && <Icon name={icon} size={14} color={c.fg} />}
      <Text maxFontSizeMultiplier={1.5} style={[styles.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 36, tone = 'pine' }: { name: string; size?: number; tone?: 'pine' | 'brass' | 'dark' }) {
  const parts = name.replace(/\(.*\)/, '').trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase();
  const bg = tone === 'brass' ? colors.brassSoft : tone === 'dark' ? colors.pine700 : colors.pine100;
  const fg = tone === 'brass' ? '#7A5C22' : tone === 'dark' ? colors.onDark : colors.pine800;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text maxFontSizeMultiplier={1} style={{ fontFamily: fonts.bodyBold, fontSize: size * 0.36, color: fg, letterSpacing: 0.3 }}>{initials}</Text>
    </View>
  );
}

export function Stat({ label, value, sub, dark, align = 'left' }: {
  label: string; value: string; sub?: string; dark?: boolean; align?: 'left' | 'center';
}) {
  return (
    <View style={{ gap: 2, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <Eyebrow color={dark ? colors.brassLight : colors.slate}>{label}</Eyebrow>
      <T variant="title" color={dark ? colors.onDark : colors.ink} style={{ fontVariant: ['tabular-nums'] }}>{value}</T>
      {sub && <T variant="small" color={dark ? colors.onDarkMuted : colors.slate}>{sub}</T>}
    </View>
  );
}

export function Row({ children, style, gap = space.sm }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Divider({ dark }: { dark?: boolean }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: dark ? colors.onDarkLine : colors.line }} />;
}

export function Loading() {
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.chalk }}><ActivityIndicator color={colors.pine700} /></View>;
}

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.flagSoft, borderRadius: radius.md, padding: space.md }}>
      <Ionicons name="alert-circle" size={20} color={colors.flag} />
      <T variant="body" color={colors.flag} style={{ flex: 1 }}>{message}</T>
    </View>
  );
}

export function Empty({ icon = 'leaf-outline', title, children }: { icon?: IconName; title: string; children?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xl, gap: space.sm }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.pine50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={colors.pine600} />
      </View>
      <T variant="subheading" style={{ textAlign: 'center' }}>{title}</T>
      {children && <T variant="small" color={colors.slate} style={{ textAlign: 'center', maxWidth: 280 }}>{children}</T>}
    </View>
  );
}

const styles = StyleSheet.create({
  largeHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: space.md,
    backgroundColor: 'rgba(244,245,240,0.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line,
  },
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.sm, overflow: 'hidden' },
  cardBorder: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  group: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 16, minHeight: 60 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.pine50, alignItems: 'center', justifyContent: 'center' },
  button: {
    flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.pill, borderWidth: 1.5, paddingVertical: 17, paddingHorizontal: space.xl, minHeight: 56,
  },
  buttonCompact: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 48 },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 18, letterSpacing: 0.2 },
  input: {
    backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 56, fontSize: 18, fontFamily: fonts.body, color: colors.ink,
  },
  segmented: { flexDirection: 'row', backgroundColor: colors.pine50, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, minHeight: 48, justifyContent: 'center', borderRadius: radius.pill, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.paper, ...(shadow as object) },
  segmentText: { fontFamily: fonts.bodyBold, fontSize: 15.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 13.5, letterSpacing: 0.2 },
});
