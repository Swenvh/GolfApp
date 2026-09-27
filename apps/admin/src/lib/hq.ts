import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export interface HqContext { userId: string; email: string | undefined; name: string | null; isClubStaff: boolean }

/** Alleen medewerkers van Greenside; anderen gaan terug naar het clubbeheer of het inlogscherm. */
export const requirePlatformStaff = cache(async (): Promise<HqContext> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect('/login');
  const [{ data: staff }, { count }] = await Promise.all([
    supabase.from('platform_staff').select('name').eq('user_id', userId).maybeSingle(),
    supabase.from('club_staff').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  if (!staff) redirect('/?error=geen-rechten');
  return { userId, email: claims?.claims.email as string | undefined, name: staff.name, isClubStaff: (count ?? 0) > 0 };
});
