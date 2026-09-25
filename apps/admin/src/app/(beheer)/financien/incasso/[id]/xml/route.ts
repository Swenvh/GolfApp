import { NextResponse } from 'next/server';
import { buildSepaDirectDebitXml, fullName } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

type Item = {
  amount_cents: number;
  sequence_type: 'FRST' | 'RCUR';
  invoice: { invoice_number: string; description: string | null; member: { first_name: string; infix: string | null; last_name: string } };
  mandate: { mandate_reference: string; signed_on: string; account_holder: string; iban: string; bic: string | null };
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireRole('finance');
  const supabase = await createClient();

  const { data: batch } = await supabase.from('direct_debit_batches').select('*').eq('id', id).eq('club_id', ctx.club.id).single();
  if (!batch) return new NextResponse('Niet gevonden', { status: 404 });
  const { data: items } = await supabase.from('direct_debit_items')
    .select('amount_cents, sequence_type, invoice:invoices(invoice_number, description, member:members(first_name, infix, last_name)), mandate:sepa_mandates(mandate_reference, signed_on, account_holder, iban, bic)')
    .eq('batch_id', id);

  const club = ctx.club;
  if (!club.iban || !club.sepa_creditor_id) return new NextResponse('IBAN/incassant-ID van de club ontbreekt', { status: 400 });

  const xml = buildSepaDirectDebitXml({
    messageId: batch.message_id,
    collectionDate: batch.collection_date,
    creditor: { name: club.name, iban: club.iban, bic: club.bic, creditorId: club.sepa_creditor_id },
    transactions: ((items ?? []) as unknown as Item[]).map((it) => ({
      endToEndId: it.invoice.invoice_number,
      amountCents: it.amount_cents,
      mandateId: it.mandate.mandate_reference,
      mandateSignedOn: it.mandate.signed_on,
      sequenceType: it.sequence_type,
      debtorName: it.mandate.account_holder || fullName(it.invoice.member),
      debtorIban: it.mandate.iban,
      debtorBic: it.mandate.bic,
      description: `${club.name} ${it.invoice.invoice_number} ${it.invoice.description ?? ''}`,
    })),
  });

  if (batch.status === 'draft') {
    await supabase.from('direct_debit_batches').update({ status: 'exported', exported_at: new Date().toISOString() }).eq('id', id);
  }

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="incasso-${batch.collection_date}.xml"`,
    },
  });
}
