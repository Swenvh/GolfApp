import Link from 'next/link';
import { memberStatusLabel, sortName, type Member, type MemberStatus } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, ButtonLink, Card, Empty, PageHeader } from '@/components/ui';
import { formatHandicap } from '@/lib/format';

export const metadata = { title: 'Leden' };

const statusTone = { active: 'green', prospect: 'blue', suspended: 'amber', resigned: 'gray' } as const;

export default async function LedenPage({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const { q = '', status = 'active', type = '' } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();

  let query = supabase
    .from('members')
    .select('*, membership_type:membership_types(name)')
    .eq('club_id', ctx.club.id)
    .order('last_name')
    .order('first_name')
    .limit(500);
  if (status !== 'all') query = query.eq('status', status);
  if (type) query = query.eq('membership_type_id', type);
  if (q) {
    const term = q.replace(/[%,()]/g, ' ').trim();
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,member_number.ilike.%${term}%,ngf_number.ilike.%${term}%,city.ilike.%${term}%`,
    );
  }

  const [{ data }, { data: types }] = await Promise.all([
    query,
    supabase.from('membership_types').select('id, name').eq('club_id', ctx.club.id).order('name'),
  ]);
  const members = (data ?? []) as (Member & { membership_type: { name: string } | null })[];
  const exportParams = new URLSearchParams({ q, status, type }).toString();

  return (
    <>
      <PageHeader
        title="Leden"
        subtitle={`${members.length} leden gevonden`}
        actions={
          <>
            <ButtonLink href={`/leden/export?${exportParams}`} variant="secondary">Exporteer CSV</ButtonLink>
            {hasRole(ctx, 'secretariat') && <ButtonLink href="/leden/nieuw">+ Nieuw lid</ButtonLink>}
          </>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Zoek op naam, lidnummer, NGF-nummer, e-mail, plaats…" className="min-w-64 flex-1" />
        <select name="status" defaultValue={status}>
          <option value="all">Alle statussen</option>
          {(Object.keys(memberStatusLabel) as MemberStatus[]).map((s) => (
            <option key={s} value={s}>{memberStatusLabel[s]}</option>
          ))}
        </select>
        <select name="type" defaultValue={type}>
          <option value="">Alle lidmaatschappen</option>
          {(types ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="rounded-md bg-stone-800 px-4 text-sm text-white">Filter</button>
      </form>

      <Card>
        {members.length === 0 ? <Empty>Geen leden gevonden.</Empty> : (
          <div className="overflow-x-auto">
            <table>
              <thead className="bg-stone-50">
                <tr>
                  <th>Nr.</th><th>Naam</th><th>Lidmaatschap</th><th>Hcp</th><th>NGF-nr.</th><th>Plaats</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50">
                    <td className="text-stone-500">{m.member_number}</td>
                    <td><Link href={`/leden/${m.id}`} className="font-medium text-brand-700 hover:underline">{sortName(m)}</Link></td>
                    <td>{m.membership_type?.name ?? '—'}</td>
                    <td className="tabular-nums">{formatHandicap(m.handicap_index)}</td>
                    <td className="text-stone-500">{m.ngf_number ?? '—'}</td>
                    <td>{m.city ?? '—'}</td>
                    <td><Badge tone={statusTone[m.status]}>{memberStatusLabel[m.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
