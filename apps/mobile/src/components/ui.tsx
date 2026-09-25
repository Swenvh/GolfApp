import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme';

export function Screen({ children, refreshing, onRefresh, padded = true }: {
  children: ReactNode; refreshing?: boolean; onRefresh?: () => void; padded?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[padded && { padding: 16, gap: 12 }, { paddingBottom: insets.bottom + 24 }]}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.primary} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const t = useTheme();
  const cardStyle = [styles.card, { backgroundColor: t.card, borderColor: t.border }, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.7 }]}>
      {children}
    </Pressable>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.title, { color: t.text }, style]}>{children}</Text>;
}

export function Body({ children, muted, style, numberOfLines, onPress }: {
  children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle>; numberOfLines?: number; onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Text numberOfLines={numberOfLines} onPress={onPress} style={[styles.body, { color: muted ? t.muted : t.text }, style]}>
      {children}
    </Text>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.section, { color: t.muted }]}>{children}</Text>;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : 'transparent';
  const fg = variant === 'primary' ? t.onPrimary : variant === 'danger' ? t.danger : t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: variant === 'primary' ? bg : variant === 'danger' ? t.danger : t.primary },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Input(props: TextInputProps & { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {props.label && <Text style={[styles.label, { color: t.muted }]}>{props.label}</Text>}
      <TextInput
        placeholderTextColor={t.muted}
        {...props}
        style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }, props.style]}
      />
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: active ? t.primary : t.border, backgroundColor: active ? t.primary : t.card }]}
    >
      <Text style={{ color: active ? t.onPrimary : t.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = 'default' }: { label: string; tone?: 'default' | 'primary' | 'warn' | 'danger' }) {
  const t = useTheme();
  const color = tone === 'primary' ? t.primary : tone === 'warn' ? t.warn : tone === 'danger' ? t.danger : t.muted;
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>{children}</View>;
}

export function Loading() {
  const t = useTheme();
  return <View style={{ flex: 1, justifyContent: 'center', padding: 32, backgroundColor: t.bg }}><ActivityIndicator color={t.primary} /></View>;
}

export function ErrorText({ message }: { message?: string }) {
  const t = useTheme();
  if (!message) return null;
  return <Text style={{ color: t.danger }}>{message}</Text>;
}

export function Empty({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, textAlign: 'center', padding: 24 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 6 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21 },
  section: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
  button: { borderRadius: 10, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
});
