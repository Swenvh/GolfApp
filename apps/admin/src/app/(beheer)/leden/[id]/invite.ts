'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

/** Laat de edge function `invite-member` een account aanmaken en koppelen (vereist service role). */
export async function inviteMember(formData: FormData) {
  await requireRole('secretariat');
  const supabase = await createClient();
  const memberId = String(formData.get('member_id'));
  const { error } = await supabase.functions.invoke('invite-member', { body: { member_id: memberId } });
  redirect(`/leden/${memberId}?${error ? 'error=uitnodiging' : 'invited=1'}`);
}
