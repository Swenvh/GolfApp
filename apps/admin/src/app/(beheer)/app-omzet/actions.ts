'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseEuro, priceExclFromIncl } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { str } from '@/lib/format';

export async function cancelOrderAction(formData: FormData) {
  await requireRole('secretariat', 'finance', 'marshal');
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_order', { p_order: String(formData.get('order_id')) });
  if (error) redirect(`/app-omzet?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/app-omzet');
}

export async function setLeadStatus(formData: FormData) {
  await requireRole('secretariat');
  const supabase = await createClient();
  await supabase.from('leads').update({ status: String(formData.get('status')) }).eq('id', String(formData.get('lead_id')));
  revalidatePath('/app-omzet');
}

export async function saveProduct(formData: FormData) {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const id = str(formData.get('id'));
  const capacity = str(formData.get('capacity'));
  const vat = Number(formData.get('vat_rate'));
  const handicart = str(formData.get('handicart_price'));
  const row = {
    club_id: ctx.club.id,
    category: String(formData.get('category')),
    name: str(formData.get('name')),
    description: str(formData.get('description')),
    // De club voert de consumentenprijs in (incl. btw); we slaan excl. btw op
    price_cents: priceExclFromIncl(parseEuro(String(formData.get('price') ?? '')) ?? 0, vat),
    handicart_price_cents: handicart ? priceExclFromIncl(parseEuro(handicart) ?? 0, vat) : null,
    vat_rate: vat,
    capacity: capacity ? Number(capacity) : null,
    capacity_scope: String(formData.get('capacity_scope') ?? 'day'),
    pickup_note: str(formData.get('pickup_note')),
    grants_kind: str(formData.get('grants_kind')),
    grants_uses: str(formData.get('grants_uses')) ? Number(formData.get('grants_uses')) : null,
    grants_days: Number(formData.get('grants_days')) || 365,
    icon: str(formData.get('icon')),
    active: formData.get('active') === 'on',
  };
  const { error } = id
    ? await supabase.from('products').update(row).eq('id', id).eq('club_id', ctx.club.id)
    : await supabase.from('products').insert({ ...row, active: true });
  if (error) redirect(`/app-omzet/aanbod?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/app-omzet/aanbod');
  redirect('/app-omzet/aanbod?saved=1');
}
