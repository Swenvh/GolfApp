'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseEuro, type VatRate } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { str } from '@/lib/format';

export async function generateContributions(formData: FormData) {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const year = Number(formData.get('year'));
  const finalize = formData.get('finalize') === 'on';

  const { data: count, error } = await supabase.rpc('generate_contribution_invoices', {
    p_club: ctx.club.id,
    p_year: year,
    p_issue_date: str(formData.get('issue_date')) ?? undefined,
    p_direct_debit: formData.get('direct_debit') === 'on',
  });
  if (error) redirect(`/financien?error=${encodeURIComponent(error.message)}`);

  if (finalize) {
    const { data: drafts } = await supabase.from('invoices').select('id')
      .eq('club_id', ctx.club.id).eq('status', 'draft').eq('description', `Contributie ${year}`);
    for (const d of drafts ?? []) await supabase.rpc('finalize_invoice', { p_invoice: d.id });
  }
  revalidatePath('/financien');
  redirect(`/financien?generated=${count ?? 0}`);
}

export interface NewInvoiceLine {
  description: string;
  quantity: number;
  unitPrice: string;
  vatRate: VatRate;
  ledgerAccountId: string | null;
}

export async function createInvoice(input: {
  memberId: string;
  description: string;
  issueDate: string;
  dueDate: string;
  directDebit: boolean;
  lines: NewInvoiceLine[];
  finalize: boolean;
}): Promise<{ error?: string; id?: string }> {
  const ctx = await requireRole('finance');
  const supabase = await createClient();

  const lines = input.lines.filter((l) => l.description.trim());
  if (!input.memberId) return { error: 'Kies een lid.' };
  if (lines.length === 0) return { error: 'Voeg minimaal één factuurregel toe.' };
  const parsed = lines.map((l) => ({ ...l, cents: parseEuro(l.unitPrice) }));
  if (parsed.some((l) => l.cents === null)) return { error: 'Ongeldig bedrag in een van de regels.' };

  const { data: invoice, error } = await supabase.from('invoices').insert({
    club_id: ctx.club.id,
    member_id: input.memberId,
    description: input.description || null,
    issue_date: input.issueDate,
    due_date: input.dueDate,
    collect_by_direct_debit: input.directDebit,
    created_by: ctx.userId,
  }).select('id').single();
  if (error) return { error: error.message };

  const { error: lineError } = await supabase.from('invoice_lines').insert(parsed.map((l, i) => ({
    invoice_id: invoice.id,
    position: i,
    description: l.description.trim(),
    quantity: l.quantity,
    unit_price_cents: l.cents!,
    vat_rate: l.vatRate,
    ledger_account_id: l.ledgerAccountId || null,
  })));
  if (lineError) return { error: lineError.message };

  if (input.finalize) {
    const { error: finError } = await supabase.rpc('finalize_invoice', { p_invoice: invoice.id });
    if (finError) return { error: finError.message, id: invoice.id };
  }
  revalidatePath('/financien/facturen');
  return { id: invoice.id };
}

export async function finalizeInvoice(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  const id = String(formData.get('invoice_id'));
  const { error } = await supabase.rpc('finalize_invoice', { p_invoice: id });
  if (error) redirect(`/financien/facturen/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/financien/facturen/${id}`);
}

export async function cancelInvoice(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  const id = String(formData.get('invoice_id'));
  const { error } = await supabase.rpc('cancel_invoice', { p_invoice: id, p_reason: str(formData.get('reason')) });
  if (error) redirect(`/financien/facturen/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/financien/facturen/${id}`);
}

export async function deleteDraft(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  await supabase.from('invoices').delete().eq('id', String(formData.get('invoice_id'))).eq('status', 'draft');
  redirect('/financien/facturen');
}

export async function registerPayment(formData: FormData) {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const id = String(formData.get('invoice_id'));
  const amount = parseEuro(String(formData.get('amount') ?? ''));
  if (!amount) redirect(`/financien/facturen/${id}?error=${encodeURIComponent('Ongeldig bedrag')}`);

  const { error } = await supabase.from('payments').insert({
    club_id: ctx.club.id,
    invoice_id: id,
    amount_cents: amount,
    method: String(formData.get('method')),
    paid_on: str(formData.get('paid_on')) ?? undefined,
    reference: str(formData.get('reference')),
    created_by: ctx.userId,
  });
  if (error) redirect(`/financien/facturen/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/financien/facturen/${id}`);
  redirect(`/financien/facturen/${id}?paid=1`);
}

export async function createDebitBatch(formData: FormData) {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_direct_debit_batch', {
    p_club: ctx.club.id,
    p_collection_date: String(formData.get('collection_date')),
  });
  if (error) redirect(`/financien/incasso?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/financien/incasso');
  redirect(`/financien/incasso?created=${(data as { item_count: number }).item_count}`);
}

export async function processDebitBatch(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  const { error } = await supabase.rpc('process_direct_debit_batch', { p_batch: String(formData.get('batch_id')) });
  if (error) redirect(`/financien/incasso?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/financien/incasso');
  redirect('/financien/incasso?processed=1');
}

export async function deleteDebitBatch(formData: FormData) {
  await requireRole('finance');
  const supabase = await createClient();
  await supabase.from('direct_debit_batches').delete().eq('id', String(formData.get('batch_id'))).neq('status', 'processed');
  revalidatePath('/financien/incasso');
}
