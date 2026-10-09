import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Contours, Wordmark } from '@/components/brand';
import { Button, ErrorText, Input, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';

/**
 * Inloggen met een eenmalige code per e-mail: geen wachtwoorden om te vergeten,
 * en geen deep links nodig. Na inloggen koppelt de app het account aan het lid met
 * hetzelfde e-mailadres (claim_my_accounts), dus leden hoeven niet eerst uitgenodigd te worden.
 *
 * Uitzondering: het reviewaccount van Apple en Google logt in met een wachtwoord, want de
 * keurder kan onze codemail niet lezen. Dat account ziet alleen de democlub met nepleden.
 */
const reviewSetting: unknown = Constants.expoConfig?.extra?.reviewEmail;
const REVIEW_EMAIL = typeof reviewSetting === 'string' ? reviewSetting.toLowerCase() : null;

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const sendCode = async () => {
    setError(undefined);
    if (REVIEW_EMAIL && email.trim().toLowerCase() === REVIEW_EMAIL) return setStep('password');
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) {
      haptic.warn();
      // Net een e-mail gehad (bijvoorbeeld de uitnodiging): even wachten voor een nieuwe code
      setError(error.status === 429
        ? 'Je hebt net een e-mail van ons gekregen. Wacht een halve minuut en probeer het dan opnieuw.'
        : 'Er ging iets mis bij het versturen. Controleer het e-mailadres en probeer het opnieuw.');
    }
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

  const signInWithPassword = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { haptic.warn(); setError('E-mailadres of wachtwoord klopt niet.'); }
    else { haptic.success(); router.replace('/'); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + space.xxl }]}>
        <Contours seed={7} opacity={0.09} />
        <Wordmark />
        <View style={{ gap: space.md }}>
          <Text maxFontSizeMultiplier={1.2} accessibilityRole="header" style={styles.headline}>
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
              <T color={colors.slate}>Gebruik het e-mailadres dat bij je club bekend is. We sturen je een code.</T>
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
        ) : step === 'password' ? (
          <>
            <View style={{ gap: 4 }}>
              <T variant="heading">Wachtwoord</T>
              <T color={colors.slate}>Vul het wachtwoord van dit account in.</T>
            </View>
            <Input label="Wachtwoord" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none"
              autoComplete="password" textContentType="password" onSubmitEditing={signInWithPassword} />
            <ErrorText message={error} />
            <Button title="Inloggen" onPress={signInWithPassword} loading={busy} disabled={!password} />
            <Button title="Ander e-mailadres" variant="ghost" onPress={() => { setStep('email'); setPassword(''); }} />
          </>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              <T variant="heading">Kijk in je e-mail</T>
              <T color={colors.slate}>We hebben een code van 6 cijfers gestuurd naar {email}.</T>
              {Platform.OS === 'ios' && <T variant="small" color={colors.slate}>Tip: de code verschijnt vaak boven je toetsenbord. Tik erop, dan vult hij zich vanzelf in.</T>}
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
    <Pressable onPress={() => ref.current?.focus()} style={styles.codeRow} accessibilityLabel={`Inlogcode, ${value.length} van 6 cijfers ingevuld`}>
      {Array.from({ length: 6 }, (_, i) => {
        const active = i === Math.min(value.length, 5);
        return (
          <View key={i} style={[styles.codeCell, active && styles.codeCellActive, !!value[i] && styles.codeCellFilled]}>
            <Text maxFontSizeMultiplier={1.2} style={styles.codeDigit}>{value[i] ?? ''}</Text>
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
  codeDigit: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  codeHidden: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
});
