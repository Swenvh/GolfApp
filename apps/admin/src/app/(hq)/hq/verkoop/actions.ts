'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseEuro } from '@golfapp/shared';
import { requirePlatformStaff } from '@/lib/hq';
import { str } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export async function saveProspect(formData: FormData) {
  await requirePlatformStaff();
  const supabase = await createClient();
  const id = str(formData.get('id'));
  const members = str(formData.get('members_estimate'));
  const row = {
    club_name: str(formData.get('club_name')),
    city: str(formData.get('city')),
    members_estimate: members ? Number(members) : null,
    stage: String(formData.get('stage') ?? 'lead'),
    monthly_value_cents: parseEuro(String(formData.get('monthly_value') || '0')) ?? 0,
    contact_name: str(formData.get('contact_name')),
    contact_email: str(formData.get('contact_email')),
    next_step: str(formData.get('next_step')),
    next_date: str(formData.get('next_date')),
    notes: str(formData.get('notes')),
  };
  const { error } = id
    ? await supabase.from('hq_prospects').update(row).eq('id', id)
    : await supabase.from('hq_prospects').insert(row);
  if (error) redirect(`/hq/verkoop?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/hq');
  revalidatePath('/hq/verkoop');
  redirect(`/hq/verkoop?saved=1#${row.stage}`);
}
