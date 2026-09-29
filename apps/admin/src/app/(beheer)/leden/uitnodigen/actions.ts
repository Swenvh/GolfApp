'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

const BATCH = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type InviteResult = { sent: number; existing: number; no_email: number; already: number; failed: number; error: string | null };

/** Leden van de eigen club die nog een uitnodiging kunnen krijgen: met e-mail, zonder account, nog niet uitgenodigd. */
export async function pendingInvites(): Promise<string[]> {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const { data } = await supabase.from('members').select('id')
    .eq('club_id', ctx.club.id).in('status', ['active', 'suspended'])
    .not('email', 'is', null).is('user_id', null).is('app_invited_at', null)
    .order('member_number').limit(10000);
  return (data ?? []).map((m) => m.id as string);
}

/** Eén portie uitnodigingen versturen; de edge function controleert zelf nog of het leden van deze club zijn. */
export async function sendInvites(ids: string[]): Promise<InviteResult | { error: string }> {
  await requireRole('secretariat');
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > BATCH || !ids.every((id) => typeof id === 'string' && UUID.test(id))) {
    return { error: 'Ongeldige selectie' };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke('invite-member', { body: { member_ids: ids } });
  if (error && !data) return { error: 'Versturen mislukt. Probeer het over een paar minuten opnieuw.' };
  revalidatePath('/leden/uitnodigen');
  return data as InviteResult;
}
