import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Contours, Wordmark } from '@/components/brand';
import { Button, ErrorText, Eyebrow, Input, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';

/**
 * Inloggen met een eenmalige code per e-mail: geen wachtwoorden om te vergeten,
 * en geen deep links nodig. Het e-mailadres moet bij de club bekend zijn.
 */
export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const sendCode = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setBusy(false);
    if (error) { haptic.warn(); setError('Dit e-mailadres kennen we niet. Vraag je club om een uitnodiging.'); }
    else setStep('code');
  };

  const verify = async (token = code) => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
    setBusy(false);
    if (error) { haptic.warn(); setError('Deze code klopt niet of is verlopen.'); }
    else { haptic.success(); router.replace('/'); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + space.xxl }]}>
        <Contours seed={7} opacity={0.09} />
        <Wordmark />
        <View style={{ gap: space.md }}>
          <Eyebrow color={colors.brassLight}>Ledenapp voor golfclubs</Eyebrow>
          <Text style={styles.headline}>
            Welkom op{'\n'}de <Text style={styles.headlineAccent}>club.</Text>
          </Text>
          <T color={colors.onDarkMuted} style={{ maxWidth: 300 }}>
            Starttijden, wedstrijden, je scorekaart en je lidmaatschap. Alles op één plek.
          </T>
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
        {step === 'email' ? (
          <>
            <View style={{ gap: 4 }}>
              <T variant="heading">Inloggen</T>
              <T variant="small" color={colors.slate}>Gebruik het e-mailadres dat bij je club bekend is. We sturen je een code.</T>
            </View>
            <Input
              label="E-mailadres"
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              onSubmitEditing={sendCode}
            />
            <ErrorText message={error} />
            <Button title="Stuur inlogcode" icon="arrow-forward" onPress={sendCode} loading={busy} disabled={!email.includes('@')} />
          </>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <T variant="heading">Check je mail</T>
              <T variant="small" color={colors.slate}>We hebben een code van 6 cijfers gestuurd naar {email}.</T>
            </View>
            <CodeInput value={code} onChange={(v) => { setCode(v); if (v.length === 6) verify(v); }} />
            <ErrorText message={error} />
            <Button title="Inloggen" onPress={() => verify()} loading={busy} disabled={code.length < 6} />
            <Button title="Ander e-mailadres" variant="ghost" onPress={() => { setStep('email'); setCode(''); }} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/** Zes losse vakjes, met één echt (onzichtbaar) invoerveld eronder voor toetsenbord en autofill. */
function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.codeRow}>
      {Array.from({ length: 6 }, (_, i) => {
        const active = i === Math.min(value.length, 5);
        return (
          <View key={i} style={[styles.codeCell, active && styles.codeCellActive, !!value[i] && styles.codeCellFilled]}>
            <Text style={styles.codeDigit}>{value[i] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        accessibilityLabel="Inlogcode"
        style={styles.codeHidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pine900 },
  hero: { flex: 1, paddingHorizontal: space.xl, paddingBottom: space.xxl, justifyContent: 'space-between', gap: space.xxl },
  headline: { fontFamily: fonts.display, fontSize: 46, lineHeight: 50, letterSpacing: -1, color: colors.onDark },
  headlineAccent: { fontFamily: fonts.displayItalic, color: colors.brassLight },
  sheet: {
    backgroundColor: colors.chalk, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl, paddingTop: space.xxl, gap: space.lg,
  },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  codeCell: {
    flex: 1, aspectRatio: 0.82, maxWidth: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line,
    backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center',
  },
  codeCellActive: { borderColor: colors.pine700 },
  codeCellFilled: { borderColor: colors.pine400 },
  codeDigit: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  codeHidden: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
});
