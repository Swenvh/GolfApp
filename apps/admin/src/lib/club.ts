import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Club, StaffRole } from '@golfapp/shared';
import { createClient } from './supabase/server';

export const CLUB_COOKIE = 'golfapp_club';

export interface StaffContext {
  userId: string;
  email: string | undefined;
  club: Club;
  roles: StaffRole[];
  clubs: Pick<Club, 'id' | 'name'>[];
}

/** Ingelogde medewerker + geselecteerde club. Stuurt door naar /login als dat ontbreekt. */
export const getStaffContext = cache(async (): Promise<StaffContext> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect('/login');

  const { data: staff } = await supabase
    .from('club_staff')
    .select('role, club:clubs(*)')
    .eq('user_id', userId);

  const rows = (staff ?? []) as unknown as { role: StaffRole; club: Club }[];
  if (rows.length === 0) redirect('/login?error=geen-toegang');

  const clubs = [...new Map(rows.map((r) => [r.club.id, { id: r.club.id, name: r.club.name }])).values()];
  const selected = (await cookies()).get(CLUB_COOKIE)?.value;
  const clubId = clubs.some((c) => c.id === selected) ? selected! : clubs[0]!.id;

  return {
    userId,
    email: claims?.claims.email as string | undefined,
    club: rows.find((r) => r.club.id === clubId)!.club,
    roles: rows.filter((r) => r.club.id === clubId).map((r) => r.role),
    clubs,
  };
});

export function hasRole(ctx: StaffContext, ...roles: StaffRole[]): boolean {
  return ctx.roles.includes('admin') || roles.some((r) => ctx.roles.includes(r));
}

/** Gebruik bovenaan pagina's/acties die een bepaalde rol vereisen. */
export async function requireRole(...roles: StaffRole[]): Promise<StaffContext> {
  const ctx = await getStaffContext();
  if (!hasRole(ctx, ...roles)) redirect('/?error=geen-rechten');
  return ctx;
}
