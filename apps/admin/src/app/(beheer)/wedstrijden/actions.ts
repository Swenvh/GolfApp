'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseEuro, zonedToUtc } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { str } from '@/lib/format';

export async function createCompetition(formData: FormData) {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const date = String(formData.get('date'));
  const deadline = str(formData.get('deadline'));
  const { data, error } = await supabase.from('competitions').insert({
    club_id: ctx.club.id,
    course_id: str(formData.get('course_id')),
    name: str(formData.get('name')),
    description: str(formData.get('description')),
    starts_at: zonedToUtc(date, String(formData.get('time') || '09:00')).toISOString(),
    registration_deadline: deadline ? zonedToUtc(deadline, '23:59').toISOString() : null,
    format: String(formData.get('format')),
    max_participants: Number(formData.get('max_participants')) || null,
    entry_fee_cents: parseEuro(String(formData.get('entry_fee') || '0')) ?? 0,
    qualifying: formData.get('qualifying') === 'on',
    status: formData.get('publish') === 'on' ? 'open' : 'draft',
  }).select('id').single();
  if (error) redirect(`/wedstrijden?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/wedstrijden');
  redirect(`/wedstrijden/${data.id}`);
}

export async function setCompetitionStatus(formData: FormData) {
  await requireRole('secretariat');
  const supabase = await createClient();
  const id = String(formData.get('id'));
  await supabase.from('competitions').update({ status: String(formData.get('status')) }).eq('id', id);
  revalidatePath(`/wedstrijden/${id}`);
}

export async function saveResults(formData: FormData) {
  await requireRole('secretariat');
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const memberIds = formData.getAll('member_id').map(String);
  const num = (v: FormDataEntryValue | null) => (v && String(v).trim() !== '' ? Number(v) : null);
  for (const [i, memberId] of memberIds.entries()) {
    await supabase.from('competition_entries').update({
      gross_score: num(formData.getAll('gross_score')[i] ?? null),
      net_score: num(formData.getAll('net_score')[i] ?? null),
      stableford_points: num(formData.getAll('stableford_points')[i] ?? null),
      position: num(formData.getAll('position')[i] ?? null),
    }).eq('competition_id', id).eq('member_id', memberId);
  }
  revalidatePath(`/wedstrijden/${id}`);
  redirect(`/wedstrijden/${id}?saved=1`);
}
