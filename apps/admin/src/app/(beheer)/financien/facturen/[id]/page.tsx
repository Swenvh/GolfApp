import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  formatEuro, formatIban, fullName, invoiceStatusLabel, localDate, paymentMethodLabel,
  type Invoice, type InvoiceLine, type Member, type Payment, type PaymentMethod,
} from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, Card, Field, Notice, PageHeader } from '@/components/ui';
import { formatDate, invoiceStatusTone } from '@/lib/format';
import { PrintButton } from './print-button';
import { cancelInvoice, deleteDraft, finalizeInvoice, registerPayment } from '../../actions';

export const metadata = { title: 'Factuur' };

export default async function FactuurDetail({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; paid?: string }>;
}) {
  const { id } = await params;
  const { error, paid } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();

  const { data } = await supabase.from('invoices').select('*, member:members(*)').eq('id', id).eq('club_id', ctx.club.id).maybeSingle();
  if (!data) notFound();
  const invoice = data as Invoice & { member: Member };
  const [{ data: lines }, { data: payments }] = await Promise.all([
    supabase.from('invoice_lines').select('*').eq('invoice_id', id).order('position'),
    supabase.from('payments').select('*').eq('invoice_id', id).order('paid_on'),
  ]);
  const club = ctx.club;
  const m = invoice.member;
  const open = invoice.total_cents - invoice.paid_cents;
  const vatByRate = new Map<number, number>();
  for (const l of (lines ?? []) as InvoiceLine[]) vatByRate.set(Number(l.vat_rate), (vatByRate.get(Number(l.vat_rate)) ?? 0) + l.vat_cents);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={invoice.invoice_number ? `Factuur ${invoice.invoice_number}` : 'Conceptfactuur'}
          subtitle={`${fullName(m)} · ${invoice.description ?? ''}`}
          actions={<>
            <Badge tone={invoiceStatusTone[invoice.status]}>{invoiceStatusLabel[invoice.status]}</Badge>
            {invoice.status !== 'draft' && <PrintButton />}
          </>}
        />
        {error && <Notice tone="error">{error}</Notice>}
        {paid && <Notice tone="success">Betaling geboekt.</Notice>}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Factuurweergave (ook printbaar) */}
        <Card className="xl:col-span-2 print:border-0 print:shadow-none">
          <article className="space-y-8 p-8 text-sm">
            <header className="flex justify-between gap-6">
              <div>
                <div className="text-xl font-semibold" style={{ color: club.primary_color }}>{club.name}</div>
                <div className="text-stone-600">
                  {club.street} {club.house_number}<br />{club.postal_code} {club.city}<br />
                  {club.email}{club.phone && ` · ${club.phone}`}
                </div>
              </div>
              <div className="text-right text-stone-600">
                {club.kvk_number && <div>KvK {club.kvk_number}</div>}
                {club.vat_number && <div>BTW {club.vat_number}</div>}
                {club.iban && <div>IBAN {formatIban(club.iban)}</div>}
              </div>
            </header>
            <div className="flex justify-between gap-6">
              <div>
                <div className="font-medium">{fullName(m)}</div>
                <div className="text-stone-600">{m.street} {m.house_number}<br />{m.postal_code} {m.city}</div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 text-right">
                <dt className="text-stone-500">Factuurnummer</dt><dd>{invoice.invoice_number ?? 'CONCEPT'}</dd>
                <dt className="text-stone-500">Factuurdatum</dt><dd>{formatDate(invoice.issue_date)}</dd>
                <dt className="text-stone-500">Vervaldatum</dt><dd>{formatDate(invoice.due_date)}</dd>
                <dt className="text-stone-500">Lidnummer</dt><dd>{m.member_number}</dd>
              </dl>
            </div>
            <table>
              <thead><tr className="border-b"><th className="px-0">Omschrijving</th><th className="text-right">Aantal</th><th className="text-right">Prijs</th><th className="text-right">BTW</th><th className="px-0 text-right">Bedrag</th></tr></thead>
              <tbody>
                {((lines ?? []) as InvoiceLine[]).map((l) => (
                  <tr key={l.id}>
                    <td className="px-0">{l.description}</td>
                    <td className="text-right">{Number(l.quantity).toLocaleString('nl-NL')}</td>
                    <td className="text-right tabular-nums">{formatEuro(l.unit_price_cents)}</td>
                    <td className="text-right">{Number(l.vat_rate)}%</td>
                    <td className="px-0 text-right tabular-nums">{formatEuro(l.line_total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto max-w-xs space-y-1">
              <div className="flex justify-between"><span>Subtotaal</span><span className="tabular-nums">{formatEuro(invoice.subtotal_cents)}</span></div>
              {[...vatByRate].filter(([r]) => r > 0).map(([r, c]) => (
                <div key={r} className="flex justify-between text-stone-600"><span>BTW {r}%</span><span className="tabular-nums">{formatEuro(c)}</span></div>
              ))}
              {vatByRate.size > 0 && [...vatByRate.keys()].every((r) => r === 0) && (
                <div className="text-xs text-stone-500">Vrijgesteld van BTW (art. 11 lid 1 sub e Wet OB)</div>
              )}
              <div className="flex justify-between border-t pt-1 text-base font-semibold"><span>Totaal</span><span className="tabular-nums">{formatEuro(invoice.total_cents)}</span></div>
            </div>
            <footer className="text-stone-600">
              {invoice.collect_by_direct_debit
                ? 'Dit bedrag wordt automatisch van uw rekening afgeschreven op basis van de door u afgegeven machtiging.'
                : `Wij verzoeken u het bedrag vóór ${formatDate(invoice.due_date)} over te maken op ${club.iban ? formatIban(club.iban) : 'onze rekening'} t.n.v. ${club.name} onder vermelding van ${invoice.invoice_number ?? 'het factuurnummer'}. U kunt ook betalen met iDEAL in de ledenapp.`}
            </footer>
          </article>
        </Card>

        <div className="space-y-6 print:hidden">
          {invoice.status === 'draft' && (
            <Card title="Concept">
              <div className="flex flex-wrap gap-2 p-4">
                <form action={finalizeInvoice}><input type="hidden" name="invoice_id" value={id} /><Button>Definitief maken</Button></form>
                <form action={deleteDraft}><input type="hidden" name="invoice_id" value={id} /><Button variant="danger">Verwijderen</Button></form>
              </div>
            </Card>
          )}

          {invoice.status === 'open' && (
            <Card title={`Betaling registreren · open ${formatEuro(open)}`}>
              <form action={registerPayment} className="space-y-3 p-4">
                <input type="hidden" name="invoice_id" value={id} />
                <Field label="Bedrag"><input name="amount" defaultValue={(open / 100).toFixed(2).replace('.', ',')} required /></Field>
                <Field label="Methode">
                  <select name="method" defaultValue="bank_transfer">
                    {(Object.keys(paymentMethodLabel) as PaymentMethod[]).map((k) => <option key={k} value={k}>{paymentMethodLabel[k]}</option>)}
                  </select>
                </Field>
                <Field label="Datum"><input type="date" name="paid_on" defaultValue={localDate()} /></Field>
                <Field label="Referentie"><input name="reference" placeholder="bv. bankafschrift 2026-09" /></Field>
                <Button type="submit">Betaling boeken</Button>
              </form>
            </Card>
          )}

          <Card title="Betalingen">
            {(payments ?? []).length === 0 ? <div className="p-4 text-sm text-stone-500">Nog geen betalingen.</div> : (
              <table>
                <tbody>
                  {((payments ?? []) as Payment[]).map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.paid_on)}</td>
                      <td className="text-stone-500">{paymentMethodLabel[p.method]}</td>
                      <td className="text-right tabular-nums">{formatEuro(p.amount_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {invoice.status === 'open' && invoice.paid_cents === 0 && (
            <Card title="Crediteren">
              <form action={cancelInvoice} className="space-y-3 p-4">
                <input type="hidden" name="invoice_id" value={id} />
                <p className="text-sm text-stone-600">De factuur wordt gecrediteerd en in het grootboek tegengeboekt.</p>
                <Field label="Reden"><input name="reason" /></Field>
                <Button variant="danger">Factuur crediteren</Button>
              </form>
            </Card>
          )}

          <Link href={`/leden/${m.id}`} className="block text-sm text-brand-600 hover:underline">→ Naar {fullName(m)}</Link>
        </div>
      </div>
    </>
  );
}
