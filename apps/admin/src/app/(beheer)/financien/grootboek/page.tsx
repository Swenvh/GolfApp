import { formatEuro, ledgerTypeLabel, type LedgerAccountType, type LedgerBalance } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Card, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Grootboek' };

const order: LedgerAccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

export default async function GrootboekPage() {
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const [{ data: balances }, { data: entries }] = await Promise.all([
    supabase.from('ledger_balances').select('*').eq('club_id', ctx.club.id).order('code'),
    supabase.from('journal_entries')
      .select('id, entry_date, description, source_type, journal_lines(debit_cents, credit_cents, account:ledger_accounts(code, name))')
      .eq('club_id', ctx.club.id).order('created_at', { ascending: false }).limit(25),
  ]);
  const rows = (balances ?? []) as LedgerBalance[];
  const totalDebit = rows.reduce((s, r) => s + r.debit_cents, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit_cents, 0);
  const revenue = -rows.filter((r) => r.type === 'revenue').reduce((s, r) => s + r.balance_cents, 0);
  const expense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.balance_cents, 0);

  type Entry = { id: string; entry_date: string; description: string; source_type: string;
    journal_lines: { debit_cents: number; credit_cents: number; account: { code: string; name: string } }[] };

  return (
    <>
      <PageHeader title="Grootboek" subtitle={`Proefbalans · resultaat ${formatEuro(revenue - expense)}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Proefbalans">
          <table>
            <thead className="bg-stone-50"><tr><th>Rekening</th><th className="text-right">Debet</th><th className="text-right">Credit</th><th className="text-right">Saldo</th></tr></thead>
            {order.map((type) => {
              const group = rows.filter((r) => r.type === type);
              if (group.length === 0) return null;
              return (
                <tbody key={type}>
                  <tr><td colSpan={4} className="bg-stone-50/60 text-xs font-semibold uppercase tracking-wide text-stone-500">{ledgerTypeLabel[type]}</td></tr>
                  {group.map((r) => (
                    <tr key={r.ledger_account_id} className={r.debit_cents + r.credit_cents === 0 ? 'text-stone-400' : ''}>
                      <td><span className="mr-2 font-mono text-stone-500">{r.code}</span>{r.name}</td>
                      <td className="text-right tabular-nums">{formatEuro(r.debit_cents)}</td>
                      <td className="text-right tabular-nums">{formatEuro(r.credit_cents)}</td>
                      <td className="text-right tabular-nums font-medium">{formatEuro(r.balance_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              );
            })}
            <tfoot>
              <tr className="font-semibold">
                <td>Totaal</td>
                <td className="text-right tabular-nums">{formatEuro(totalDebit)}</td>
                <td className="text-right tabular-nums">{formatEuro(totalCredit)}</td>
                <td className={`text-right ${totalDebit === totalCredit ? 'text-brand-600' : 'text-red-700'}`}>{totalDebit === totalCredit ? '✓ in balans' : 'niet in balans'}</td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <Card title="Laatste journaalposten">
          <div className="divide-y divide-stone-100">
            {((entries ?? []) as unknown as Entry[]).map((e) => (
              <div key={e.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between"><span className="font-medium">{e.description}</span><span className="text-stone-500">{formatDate(e.entry_date)}</span></div>
                <table className="mt-1 text-xs">
                  <tbody>
                    {e.journal_lines.map((l, i) => (
                      <tr key={i}>
                        <td className="border-0 px-0 py-0.5"><span className={l.credit_cents ? 'pl-6' : ''}>{l.account.code} {l.account.name}</span></td>
                        <td className="border-0 py-0.5 text-right tabular-nums">{l.debit_cents ? formatEuro(l.debit_cents) : ''}</td>
                        <td className="border-0 py-0.5 text-right tabular-nums">{l.credit_cents ? formatEuro(l.credit_cents) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
