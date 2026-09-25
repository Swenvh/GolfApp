import Link from 'next/link';
import { formatEuro, fullName, invoiceStatusLabel, localDate, type Invoice, type InvoiceStatus } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, ButtonLink, Card, Empty, PageHeader } from '@/components/ui';
import { formatDate, invoiceStatusTone } from '@/lib/format';

export const metadata = { title: 'Facturen' };


export default async function FacturenPage({ searchParams }: {
  searchParams: Promise<{ status?: string; q?: string; overdue?: string }>;
}) {
  const { status = '', q = '', overdue } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const today = localDate();

  let query = supabase.from('invoices')
    .select('*, member:members!inner(id, first_name, infix, last_name, member_number)')
    .eq('club_id', ctx.club.id)
    .order('created_at', { ascending: false })
    .limit(300);
  if (status) query = query.eq('status', status);
  if (overdue) query = query.eq('status', 'open').lt('due_date', today);
  if (q) {
    const term = q.replace(/[%,()]/g, ' ').trim();
    query = query.or(`invoice_number.ilike.%${term}%,description.ilike.%${term}%`);
  }
  const { data } = await query;
  const invoices = (data ?? []) as (Invoice & { member: { id: string; first_name: string; infix: string | null; last_name: string; member_number: string } })[];
  const total = invoices.reduce((s, i) => s + i.total_cents, 0);
  const due = invoices.filter((i) => i.status === 'open').reduce((s, i) => s + i.total_cents - i.paid_cents, 0);

  return (
    <>
      <PageHeader
        title="Facturen"
        subtitle={`${invoices.length} facturen · totaal ${formatEuro(total)} · openstaand ${formatEuro(due)}`}
        actions={<ButtonLink href="/financien/facturen/nieuw">+ Nieuwe factuur</ButtonLink>}
      />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Zoek op factuurnummer of omschrijving" className="min-w-64 flex-1" />
        <select name="status" defaultValue={status}>
          <option value="">Alle statussen</option>
          {(Object.keys(invoiceStatusLabel) as InvoiceStatus[]).map((s) => <option key={s} value={s}>{invoiceStatusLabel[s]}</option>)}
        </select>
        <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="overdue" value="1" defaultChecked={!!overdue} /> Alleen vervallen</label>
        <button className="rounded-md bg-stone-800 px-4 text-sm text-white">Filter</button>
      </form>
      <Card>
        {invoices.length === 0 ? <Empty>Geen facturen gevonden.</Empty> : (
          <div className="overflow-x-auto">
            <table>
              <thead className="bg-stone-50">
                <tr><th>Nummer</th><th>Lid</th><th>Omschrijving</th><th>Datum</th><th>Vervalt</th><th className="text-right">Totaal</th><th className="text-right">Open</th><th>Status</th></tr>
              </thead>
              <tbody>
                {invoices.map((i) => {
                  const isOverdue = i.status === 'open' && i.due_date < today;
                  return (
                    <tr key={i.id} className="hover:bg-stone-50">
                      <td><Link href={`/financien/facturen/${i.id}`} className="font-medium text-brand-700 hover:underline">{i.invoice_number ?? 'Concept'}</Link></td>
                      <td><Link href={`/leden/${i.member.id}`} className="hover:underline">{fullName(i.member)}</Link></td>
                      <td className="max-w-64 truncate">{i.description}</td>
                      <td>{formatDate(i.issue_date)}</td>
                      <td className={isOverdue ? 'font-medium text-red-700' : ''}>{formatDate(i.due_date)}</td>
                      <td className="text-right tabular-nums">{formatEuro(i.total_cents)}</td>
                      <td className="text-right tabular-nums">{i.status === 'open' ? formatEuro(i.total_cents - i.paid_cents) : '—'}</td>
                      <td>
                        <Badge tone={isOverdue ? 'red' : invoiceStatusTone[i.status]}>{isOverdue ? 'Vervallen' : invoiceStatusLabel[i.status]}</Badge>
                        {i.collect_by_direct_debit && i.status === 'open' && <span className="ml-1 text-xs text-stone-500">incasso</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
