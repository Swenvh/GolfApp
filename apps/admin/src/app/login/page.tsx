import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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
  ongeldig: 'E-mailadres of wachtwoord onjuist.',
  'geen-toegang': 'Dit account heeft geen beheerrechten bij een club.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div>
          <div className="text-3xl">⛳</div>
          <h1 className="mt-2 text-xl font-semibold">Clubbeheer</h1>
          <p className="text-sm text-stone-500">Log in met je beheerdersaccount</p>
        </div>
        {error && <Notice tone="error">{errors[error] ?? 'Inloggen mislukt.'}</Notice>}
        <Field label="E-mailadres">
          <input name="email" type="email" autoComplete="username" required />
        </Field>
        <Field label="Wachtwoord">
          <input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" className="w-full">Inloggen</Button>
      </form>
    </main>
  );
}
