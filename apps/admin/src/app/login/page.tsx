import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TRUST_COOKIE, TRUST_SECONDS } from '@/lib/supabase/trust';
import { Contours, Wordmark } from '@/components/brand';
import { Button, Field, Notice } from '@/components/ui';

export const metadata = { title: 'Inloggen' };

/**
 * Inloggen gaat alleen met een code per e-mail, voor beheerders net als voor leden: geen wachtwoorden
 * die uitlekken of hergebruikt worden. Stap 1: code versturen. Een nieuw adres krijgt een account;
 * rechten komen pas via een uitnodiging van de club.
 */
async function sendCode(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) redirect(`/login?error=versturen&email=${encodeURIComponent(email)}`);
  redirect(`/login?stap=code&email=${encodeURIComponent(email)}`);
}

/** Stap 2: code controleren en uitnodigingen omzetten in beheerdersrechten. */
async function verifyCode(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const trusted = formData.get('vertrouwd') === '1';
  const supabase = await createClient({ trusted });
  const { error } = await supabase.auth.verifyOtp({ email, token: String(formData.get('code') ?? '').trim(), type: 'email' });
  if (error) redirect(`/login?stap=code&error=code&email=${encodeURIComponent(email)}`);
  const store = await cookies();
  if (trusted) {
    store.set(TRUST_COOKIE, '1', { maxAge: TRUST_SECONDS, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  } else {
    store.delete(TRUST_COOKIE);
  }
  await supabase.rpc('claim_my_accounts');
  redirect('/');
}

const errors: Record<string, string> = {
  'geen-toegang': 'Dit account heeft (nog) geen beheerrechten bij een club. Gebruik het e-mailadres waarop je bent uitgenodigd.',
  versturen: 'De code kon niet worden verstuurd. Controleer het e-mailadres en probeer het over een minuut opnieuw.',
  code: 'Deze code klopt niet of is verlopen. Vraag een nieuwe aan.',
};

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string; stap?: string; email?: string }>;
}) {
  const { error, stap, email = '' } = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-pine-900 p-12 text-chalk lg:flex lg:flex-col lg:justify-between">
        <Contours seed={7} opacity={0.08} className="text-chalk" />
        <Wordmark className="relative" />
        <div className="relative max-w-md">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brass-light">Clubbeheer</div>
          <h1 className="mt-3 font-display text-[56px] leading-[1.02] font-semibold tracking-tight">
            De club, <span className="italic text-brass-light">op orde.</span>
          </h1>
          <p className="mt-4 text-lg text-chalk/65">Leden, starttijden, wedstrijden en de complete financiële administratie. Voor bestuur, secretariaat en penningmeester.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          <div className="lg:hidden"><span className="text-pine-900"><Wordmark /></span></div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Inloggen</h2>
            <p className="mt-1 text-sm text-stone-500">
              {stap === 'code' ? `We hebben een code van 6 cijfers gestuurd naar ${email}.`
                : 'Met je e-mailadres. We sturen je een code; een wachtwoord is niet nodig.'}
            </p>
          </div>
          {error && <Notice tone="error">{errors[error] ?? 'Inloggen mislukt.'}</Notice>}
          {stap === 'code' ? (
            <form action={verifyCode} className="space-y-5">
              <input type="hidden" name="email" value={email} />
              <Field label="Inlogcode">
                <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus
                  className="py-3 text-center font-display text-2xl tracking-[0.5em] tabular-nums" />
              </Field>
              <label className="flex items-start gap-3 text-sm text-stone-700">
                <input type="checkbox" name="vertrouwd" value="1" className="mt-0.5 h-5 w-5 shrink-0" />
                <span>Dit apparaat 30 dagen vertrouwen<span className="block text-stone-500">Alleen op je eigen computer. Anders log je uit zodra je de browser sluit.</span></span>
              </label>
              <Button type="submit" className="w-full py-3">Inloggen</Button>
            </form>
          ) : (
            <form action={sendCode} className="space-y-5">
              <Field label="E-mailadres">
                <input name="email" type="email" autoComplete="username" defaultValue={email} required className="py-3" />
              </Field>
              <Button type="submit" className="w-full py-3">Stuur inlogcode</Button>
            </form>
          )}
          {stap === 'code' && (
            <p className="text-sm text-stone-500">
              <a href="/login" className="font-bold text-brand-700 underline">Ander e-mailadres of nieuwe code</a>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
