import Link from 'next/link';
import { formatEuro, fullName, localDate, paymentMethodLabel, type LedgerBalance, type PaymentMethod } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Button, ButtonLink, Card, Empty, Field, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { generateContributions } from './actions';

export const metadata = { title: 'Financiën' };

const DAY = 86_400_000;

export default async function FinancienPage({ searchParams }: {
  searchParams: Promise<{ error?: string; generated?: string }>;
}) {
  const { error, generated } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const [balances, openInvoices, payments, drafts] = await Promise.all([
    supabase.from('ledger_balances').select('*').eq('club_id', ctx.club.id),
    supabase.from('invoices').select('id, invoice_number, due_date, total_cents, paid_cents, member:members(id, first_name, infix, last_name)')
      .eq('club_id', ctx.club.id).eq('status', 'open'),
    supabase.from('payments').select('id, amount_cents, method, paid_on, invoice:invoices(id, invoice_number)')
      .eq('club_id', ctx.club.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('club_id', ctx.club.id).eq('status', 'draft'),
  ]);

  const ledger = (balances.data ?? []) as LedgerBalance[];
  const revenue = -ledger.filter((l) => l.type === 'revenue').reduce((s, l) => s + l.balance_cents, 0);
  const expenses = ledger.filter((l) => l.type === 'expense').reduce((s, l) => s + l.balance_cents, 0);
  const bank = ledger.filter((l) => ['1100', '1150', '1000'].includes(l.code)).reduce((s, l) => s + l.balance_cents, 0);

  type OpenInvoice = { id: string; invoice_number: string; due_date: string; total_cents: number; paid_cents: number;
    member: { id: string; first_name: string; infix: string | null; last_name: string } };
  const open = (openInvoices.data ?? []) as unknown as OpenInvoice[];
  const today = localDate();
  const buckets = [
    { label: 'Nog niet vervallen', min: -Infinity, max: 0 },
    { label: '1–30 dagen', min: 1, max: 30 },
    { label: '31–60 dagen', min: 31, max: 60 },
    { label: '61–90 dagen', min: 61, max: 90 },
    { label: '> 90 dagen', min: 91, max: Infinity },
  ].map((b) => ({ ...b, cents: 0, count: 0 }));
  const perMember = new Map<string, { name: string; id: string; cents: number; overdue: number }>();
  for (const i of open) {
    const due = i.total_cents - i.paid_cents;
    const days = Math.round((Date.parse(today) - Date.parse(i.due_date)) / DAY); // dagen over vervaldatum
    const bucket = buckets.find((b) => days >= b.min && days <= b.max)!;
    bucket.cents += due;
    bucket.count += 1;
    const pm = perMember.get(i.member.id) ?? { id: i.member.id, name: fullName(i.member), cents: 0, overdue: 0 };
    pm.cents += due;
    if (days > 0) pm.overdue += due;
    perMember.set(i.member.id, pm);
  }
  const outstanding = buckets.reduce((s, b) => s + b.cents, 0);
  const topDebtors = [...perMember.values()].filter((d) => d.overdue > 0).sort((a, b) => b.overdue - a.overdue).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Financiën"
        subtitle={`Boekjaar ${year}`}
        actions={<>
          <ButtonLink href="/financien/grootboek" variant="secondary">Grootboek</ButtonLink>
          <ButtonLink href="/financien/facturen/nieuw">+ Factuur</ButtonLink>
        </>}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {generated && <Notice tone="success">{generated} contributiefacturen aangemaakt.</Notice>}
      {!!drafts.count && (
        <Notice>Er {drafts.count === 1 ? 'staat 1 conceptfactuur' : `staan ${drafts.count} conceptfacturen`} klaar. <Link className="underline" href="/financien/facturen?status=draft">Bekijken</Link></Notice>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Opbrengsten (geboekt)" value={formatEuro(revenue)} />
        <Stat label="Kosten (geboekt)" value={formatEuro(expenses)} />
        <Stat label="Liquide middelen" value={formatEuro(bank)} hint="Bank, kas en iDEAL-tussenrekening" />
        <Stat label="Debiteuren" value={formatEuro(outstanding)} hint={`${open.length} openstaande facturen`} tone={outstanding > 0 ? 'warn' : 'good'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Ouderdomsanalyse debiteuren">
          <table>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.label}>
                  <td>{b.label}</td>
                  <td className="text-right text-stone-500">{b.count} fact.</td>
                  <td className={`text-right tabular-nums ${b.min > 30 && b.cents > 0 ? 'font-semibold text-red-700' : ''}`}>{formatEuro(b.cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Grootste achterstanden">
          {topDebtors.length === 0 ? <Empty>Geen achterstallige betalingen. Alles is bij.</Empty> : (
            <table>
              <tbody>
                {topDebtors.map((d) => (
                  <tr key={d.id}>
                    <td><Link href={`/leden/${d.id}`} className="hover:underline">{d.name}</Link></td>
                    <td className="text-right tabular-nums text-red-700">{formatEuro(d.overdue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title={`Contributie ${year} factureren`}>
          <form action={generateContributions} className="space-y-3 p-4 text-sm">
            <p className="text-stone-600">
              Maakt voor elk actief lid een contributiefactuur aan op basis van het lidmaatschapstarief.
              Leden die al een factuur voor dit jaar hebben worden overgeslagen.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jaar"><input name="year" type="number" defaultValue={year} /></Field>
              <Field label="Factuurdatum"><input name="issue_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
            </div>
            <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="direct_debit" defaultChecked /> Incasseren bij leden met machtiging</label>
            <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="finalize" /> Direct definitief maken (nummeren en boeken)</label>
            <Button type="submit">Facturen genereren</Button>
          </form>
        </Card>

        <Card title="Recente betalingen">
          {(payments.data ?? []).length === 0 ? <Empty>Nog geen betalingen.</Empty> : (
            <table>
              <tbody>
                {((payments.data ?? []) as unknown as { id: string; amount_cents: number; method: PaymentMethod; paid_on: string; invoice: { id: string; invoice_number: string } }[]).map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.paid_on)}</td>
                    <td><Link href={`/financien/facturen/${p.invoice.id}`} className="hover:underline">{p.invoice.invoice_number}</Link></td>
                    <td className="text-stone-500">{paymentMethodLabel[p.method]}</td>
                    <td className="text-right tabular-nums">{formatEuro(p.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
