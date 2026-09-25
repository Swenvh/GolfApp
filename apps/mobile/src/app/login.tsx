import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Body, Button, ErrorText, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

/**
 * Inloggen met een eenmalige code per e-mail: geen wachtwoorden om te vergeten,
 * en geen deep links nodig. Het e-mailadres moet bij de club bekend zijn.
 */
export default function Login() {
  const t = useTheme();
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
    if (error) setError('Dit e-mailadres is niet bekend. Vraag je club om een uitnodiging.');
    else setStep('code');
  };

  const verify = async () => {
    setBusy(true);
    setError(undefined);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setError('Onjuiste of verlopen code.');
    else router.replace('/');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.box}>
        <Text style={styles.logo}>⛳</Text>
        <Text style={[styles.title, { color: t.text }]}>Welkom bij je golfclub</Text>
        {step === 'email' ? (
          <>
            <Body muted>Log in met het e-mailadres dat bekend is bij je club. Je ontvangt een inlogcode.</Body>
            <Input
              label="E-mailadres"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              onSubmitEditing={sendCode}
            />
            <ErrorText message={error} />
            <Button title="Stuur inlogcode" onPress={sendCode} loading={busy} disabled={!email.includes('@')} />
          </>
        ) : (
          <>
            <Body muted>We hebben een code gestuurd naar {email}.</Body>
            <Input
              label="Inlogcode"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              onSubmitEditing={verify}
            />
            <ErrorText message={error} />
            <Button title="Inloggen" onPress={verify} loading={busy} disabled={code.length < 6} />
            <Button title="Ander e-mailadres" variant="secondary" onPress={() => setStep('email')} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  box: { padding: 24, gap: 14 },
  logo: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '800' },
});
