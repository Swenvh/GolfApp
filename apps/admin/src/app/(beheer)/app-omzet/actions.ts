'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseEuro, priceExclFromIncl } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { str } from '@/lib/format';

export async function markFulfilled(formData: FormData) {
  await requireRole('secretariat', 'finance', 'marshal');
  const supabase = await createClient();
  await supabase.from('orders').update({ status: 'fulfilled', fulfilled_at: new Date().toISOString() })
    .eq('id', String(formData.get('order_id'))).eq('status', 'placed');
  revalidatePath('/app-omzet');
}

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
  const capacity = str(formData.get('daily_capacity'));
  const row = {
    club_id: ctx.club.id,
    category: String(formData.get('category')),
    name: str(formData.get('name')),
    description: str(formData.get('description')),
    // De club voert de consumentenprijs in (incl. btw); we slaan excl. btw op
    price_cents: priceExclFromIncl(parseEuro(String(formData.get('price') ?? '')) ?? 0, Number(formData.get('vat_rate'))),
    vat_rate: Number(formData.get('vat_rate')),
    daily_capacity: capacity ? Number(capacity) : null,
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
