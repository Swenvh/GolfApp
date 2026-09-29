import Link from 'next/link';
import { formatEuro, invoiceStatusLabel, sortName, type Invoice } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Card, Empty, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { HorecaForm } from './horeca-form';

export const metadata = { title: 'Horeca op rekening' };

export default async function HorecaPage() {
  const ctx = await requireRole('finance', 'secretariat');
  const supabase = await createClient();
  const [{ data: members }, { data: recent }] = await Promise.all([
    supabase.from('members').select('id, first_name, infix, last_name, member_number').eq('club_id', ctx.club.id)
      .in('status', ['active', 'suspended']).order('last_name').order('first_name').limit(5000),
    supabase.from('invoices').select('*, member:members(id, first_name, infix, last_name)').eq('club_id', ctx.club.id)
      .eq('category', 'horeca').order('created_at', { ascending: false }).limit(20),
  ]);
  type Row = Invoice & { member: { id: string; first_name: string; infix: string | null; last_name: string } };
  const rows = (recent ?? []) as unknown as Row[];

  return (
    <>
      <PageHeader title="Horeca op rekening" subtitle="Een bestelling aan de bar op naam van een lid. Het lid ziet de rekening in de app onder Facturen." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title="Nieuwe bestelling">
          <HorecaForm members={(members ?? []).map((m) => ({ id: m.id as string, label: `${sortName(m as never)} (${m.member_number})` }))} />
        </Card>
        <Card title="Laatst op rekening gezet">
          {rows.length === 0 ? <Empty>Nog niets op rekening gezet.</Empty> : (
            <ul className="divide-y divide-stone-100">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span>
                    <Link href={`/financien/facturen/${r.id}`} className="font-semibold text-brand-700 hover:underline">{sortName(r.member)}</Link>
                    <span className="block text-stone-500">{formatDate(r.issue_date)} · {r.invoice_number}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-bold tabular-nums">{formatEuro(r.total_cents)}</span>
                    <Badge tone={r.status === 'paid' ? 'green' : 'amber'}>{invoiceStatusLabel[r.status]}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
