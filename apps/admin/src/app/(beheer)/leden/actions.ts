'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isValidIban, normalizeIban } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { str } from '@/lib/format';

export async function saveMember(formData: FormData) {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const id = str(formData.get('id'));
  const iban = str(formData.get('iban'));
  const back = id ? `/leden/${id}` : '/leden/nieuw';

  if (iban && !isValidIban(iban)) redirect(`${back}?error=iban`);

  const handicap = str(formData.get('handicap_index'));
  const row = {
    club_id: ctx.club.id,
    member_number: str(formData.get('member_number')),
    ngf_number: str(formData.get('ngf_number')),
    first_name: str(formData.get('first_name')),
    infix: str(formData.get('infix')),
    last_name: str(formData.get('last_name')),
    gender: str(formData.get('gender')),
    date_of_birth: str(formData.get('date_of_birth')),
    email: str(formData.get('email')),
    phone: str(formData.get('phone')),
    street: str(formData.get('street')),
    house_number: str(formData.get('house_number')),
    postal_code: str(formData.get('postal_code'))?.toUpperCase() ?? null,
    city: str(formData.get('city')),
    membership_type_id: str(formData.get('membership_type_id')),
    status: str(formData.get('status')) ?? 'active',
    join_date: str(formData.get('join_date')) ?? undefined,
    end_date: str(formData.get('end_date')),
    handicap_index: handicap ? Number(handicap.replace(',', '.').replace(/^\+/, '-')) : null,
    iban: iban ? normalizeIban(iban) : null,
    notes: str(formData.get('notes')),
  };

  const { data, error } = id
    ? await supabase.from('members').update(row).eq('id', id).eq('club_id', ctx.club.id).select('id').single()
    : await supabase.from('members').insert(row).select('id').single();

  if (error) {
    const code = error.code === '23505' ? 'dubbel' : 'opslaan';
    redirect(`${back}?error=${code}`);
  }
  revalidatePath('/leden');
  redirect(`/leden/${data.id}?saved=1`);
}

export async function saveMandate(formData: FormData) {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const memberId = String(formData.get('member_id'));
  const iban = String(formData.get('iban') ?? '');
  if (!isValidIban(iban)) redirect(`/leden/${memberId}?error=iban`);

  // Bestaand actief mandaat intrekken; er mag er maar één actief zijn
  await supabase.from('sepa_mandates').update({ status: 'revoked' })
    .eq('member_id', memberId).eq('status', 'active');

  const { error } = await supabase.from('sepa_mandates').insert({
    club_id: ctx.club.id,
    member_id: memberId,
    mandate_reference: str(formData.get('mandate_reference')),
    account_holder: str(formData.get('account_holder')),
    iban: normalizeIban(iban),
    bic: str(formData.get('bic'))?.toUpperCase() ?? null,
    signed_on: str(formData.get('signed_on')),
  });
  if (error) redirect(`/leden/${memberId}?error=${error.code === '23505' ? 'mandaat-dubbel' : 'opslaan'}`);
  revalidatePath(`/leden/${memberId}`);
  redirect(`/leden/${memberId}?saved=1`);
}

export async function revokeMandate(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  const memberId = String(formData.get('member_id'));
  await supabase.from('sepa_mandates').update({ status: 'revoked' }).eq('id', String(formData.get('mandate_id')));
  revalidatePath(`/leden/${memberId}`);
}
