import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sessionCookieOptions, TRUST_COOKIE } from './trust';

/** `trusted` overschrijft de cookie, voor het moment van inloggen zelf. */
export async function createClient(opts: { trusted?: boolean } = {}) {
  const cookieStore = await cookies();
  const trusted = opts.trusted ?? cookieStore.get(TRUST_COOKIE)?.value === '1';
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, sessionCookieOptions(options, value, trusted)));
        } catch {
          // Aangeroepen vanuit een Server Component: proxy.ts ververst de sessie.
        }
      },
    },
  });
}
