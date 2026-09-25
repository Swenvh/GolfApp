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
  if (error) redirect('/login?error=ongeldig');
  redirect('/');
}

const errors: Record<string, string> = {
  ongeldig: 'E-mailadres of wachtwoord klopt niet.',
  'geen-toegang': 'Dit account heeft geen beheerrechten bij een club.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
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
        <form action={login} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden"><span className="text-pine-900"><Wordmark /></span></div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Inloggen</h2>
            <p className="mt-1 text-sm text-stone-500">Met je beheerdersaccount van de club.</p>
          </div>
          {error && <Notice tone="error">{errors[error] ?? 'Inloggen mislukt.'}</Notice>}
          <Field label="E-mailadres">
            <input name="email" type="email" autoComplete="username" required className="py-3" />
          </Field>
          <Field label="Wachtwoord">
            <input name="password" type="password" autoComplete="current-password" required className="py-3" />
          </Field>
          <Button type="submit" className="w-full py-3">Inloggen</Button>
        </form>
      </section>
    </main>
  );
}
