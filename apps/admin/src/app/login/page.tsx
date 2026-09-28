import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Contours, Wordmark } from '@/components/brand';
import { Button, Field, Notice } from '@/components/ui';

export const metadata = { title: 'Inloggen' };

async function login(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
  if (error) redirect('/login?methode=wachtwoord&error=ongeldig');
  await supabase.rpc('claim_my_accounts');
  redirect('/');
}

/** Stap 1: code per e-mail. Een nieuw adres krijgt een account; rechten komen pas via een uitnodiging. */
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
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: String(formData.get('code') ?? '').trim(), type: 'email' });
  if (error) redirect(`/login?stap=code&error=code&email=${encodeURIComponent(email)}`);
  await supabase.rpc('claim_my_accounts');
  redirect('/');
}

const errors: Record<string, string> = {
  ongeldig: 'E-mailadres of wachtwoord klopt niet.',
  'geen-toegang': 'Dit account heeft (nog) geen beheerrechten bij een club. Gebruik het e-mailadres waarop je bent uitgenodigd.',
  versturen: 'De code kon niet worden verstuurd. Controleer het e-mailadres en probeer het over een minuut opnieuw.',
  code: 'Deze code klopt niet of is verlopen. Vraag een nieuwe aan.',
};

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string; methode?: string; stap?: string; email?: string }>;
}) {
  const { error, methode, stap, email = '' } = await searchParams;
  const withPassword = methode === 'wachtwoord';
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
        <div className="relative flex gap-8 text-sm text-chalk/55">
          <span>SEPA-incasso</span><span>Dubbel boekhouden</span><span>AVG-proof</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          <div className="lg:hidden"><span className="text-pine-900"><Wordmark /></span></div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Inloggen</h2>
            <p className="mt-1 text-sm text-stone-500">
              {withPassword ? 'Met je e-mailadres en wachtwoord.'
                : stap === 'code' ? `We hebben een code van 6 cijfers gestuurd naar ${email}.`
                : 'Met je e-mailadres. We sturen je een code; een wachtwoord is niet nodig.'}
            </p>
          </div>
          {error && <Notice tone="error">{errors[error] ?? 'Inloggen mislukt.'}</Notice>}
          {withPassword ? (
            <form action={login} className="space-y-5">
              <Field label="E-mailadres">
                <input name="email" type="email" autoComplete="username" required className="py-3" />
              </Field>
              <Field label="Wachtwoord">
                <input name="password" type="password" autoComplete="current-password" required className="py-3" />
              </Field>
              <Button type="submit" className="w-full py-3">Inloggen</Button>
            </form>
          ) : stap === 'code' ? (
            <form action={verifyCode} className="space-y-5">
              <input type="hidden" name="email" value={email} />
              <Field label="Inlogcode">
                <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus
                  className="py-3 text-center font-display text-2xl tracking-[0.5em] tabular-nums" />
              </Field>
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
          <p className="text-sm text-stone-500">
            {withPassword || stap === 'code'
              ? <a href="/login" className="font-bold text-brand-700 underline">{stap === 'code' ? 'Ander e-mailadres of nieuwe code' : 'Inloggen met een code'}</a>
              : <a href="/login?methode=wachtwoord" className="font-bold text-brand-700 underline">Inloggen met een wachtwoord</a>}
          </p>
        </div>
      </section>
    </main>
  );
}
