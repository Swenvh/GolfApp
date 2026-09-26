import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  formatEuro, fullName, membershipChangeKindLabel, membershipChangeStatusLabel,
  type MembershipChange, type MembershipType,
} from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Card, Empty, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Wijzigingen lidmaatschap' };

async function decide(formData: FormData) {
  'use server';
  await requireRole('secretariat');
  const supabase = await createClient();
  const { error } = await supabase.rpc('decide_membership_change', {
    p_change: String(formData.get('id')), p_approve: formData.get('approve') === '1',
  });
  if (error) redirect(`/leden/wijzigingen?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/leden/wijzigingen');
}

type Row = MembershipChange & {
  member: { id: string; first_name: string; infix: string | null; last_name: string; membership_type_id: string | null };
};

const statusTone = { requested: 'amber', approved: 'green', rejected: 'gray' } as const;

export default async function Wijzigingen({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const [{ data }, { data: types }] = await Promise.all([
    supabase.from('membership_changes').select('*, member:members(id, first_name, infix, last_name, membership_type_id)')
      .eq('club_id', ctx.club.id).gte('created_at', `${year}-01-01`).order('created_at', { ascending: false }),
    supabase.from('membership_types').select('*').eq('club_id', ctx.club.id),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const typeById = new Map(((types ?? []) as MembershipType[]).map((t) => [t.id, t]));
  const typeName = (id: string | null) => (id ? typeById.get(id)?.name ?? '' : '');

  const open = rows.filter((r) => r.status === 'requested');
  // Wie wilde opzeggen maar koos voor pauzeren of omzetten: behouden lid, met de contributie die blijft binnenkomen
  const fromCancel = rows.filter((r) => r.from_cancel_flow && r.status !== 'rejected');
  const kept = fromCancel.filter((r) => r.kind !== 'cancel');
  const keptValue = kept.reduce((s, r) => s + (typeById.get(r.target_membership_type_id ?? '')?.annual_fee_cents ?? 0), 0);
  const cancelled = fromCancel.filter((r) => r.kind === 'cancel');
  const keepRate = fromCancel.length ? Math.round((kept.length / fromCancel.length) * 100) : null;

  return (
    <>
      <PageHeader title="Wijzigingen lidmaatschap" subtitle={`Verzoeken van leden uit de app in ${year}: pauzeren, omzetten en opzeggen.`} />
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open verzoeken" value={String(open.length)} tone={open.length ? 'warn' : 'default'} />
        <Stat label="Behouden via de app" value={String(kept.length)} hint="Wilden opzeggen, kozen voor pauzeren of omzetten" tone="good" />
        <Stat label="Contributie behouden" value={formatEuro(keptValue).replace(/,\d\d$/, '')} hint="Per jaar, tegen het nieuwe tarief" tone="good" />
        <Stat label="Behoudpercentage" value={keepRate == null ? '—' : `${keepRate}%`} hint={`${cancelled.length} toch opgezegd`} />
      </div>

      <Card title="Verzoeken" className="mt-6">
        {rows.length === 0 ? <Empty>Nog geen verzoeken dit jaar.</Empty> : (
          <table>
            <thead className="bg-stone-50">
              <tr><th>Lid</th><th>Verzoek</th><th>Per</th><th>Reden</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/leden/${r.member.id}`} className="font-semibold hover:underline">{fullName(r.member)}</Link>
                    <div className="text-xs text-stone-500">nu {typeName(r.member.membership_type_id)}</div>
                  </td>
                  <td>
                    {membershipChangeKindLabel[r.kind]}{r.target_membership_type_id ? ` → ${typeName(r.target_membership_type_id)}` : ''}
                    {r.from_cancel_flow && r.kind !== 'cancel' && <span className="ml-2"><Badge tone="green">Behouden</Badge></span>}
                  </td>
                  <td className="whitespace-nowrap tabular">{formatDate(r.effective_date)}</td>
                  <td className="text-sm text-stone-600">{r.reason ?? '—'}</td>
                  <td><Badge tone={statusTone[r.status]}>{membershipChangeStatusLabel[r.status]}</Badge></td>
                  <td className="whitespace-nowrap text-right">
                    {r.status === 'requested' && (
                      <form action={decide} className="inline-flex gap-3">
                        <input type="hidden" name="id" value={r.id} />
                        <button name="approve" value="1" className="text-xs font-bold text-brand-600 hover:underline">Goedkeuren</button>
                        <button name="approve" value="0" className="text-xs text-stone-500 hover:underline">Afwijzen</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="border-t border-stone-200/70 px-5 py-3 text-xs text-stone-500">
          Goedkeuren past het lidmaatschap direct aan (pauzeren en omzetten) of zet de einddatum (opzeggen). Stuur het lid daarna de gebruikelijke bevestiging.
        </p>
      </Card>
    </>
  );
}
