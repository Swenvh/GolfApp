import Link from 'next/link';
import { fullName, memberStatusLabel, membershipChangeKindLabel, sortName, type Member, type MemberStatus } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, ButtonLink, Card, Empty, Notice, PageHeader } from '@/components/ui';
import { decideChange } from './actions';
import { formatDate, formatHandicap } from '@/lib/format';

export const metadata = { title: 'Leden' };

const statusTone = { active: 'green', prospect: 'blue', suspended: 'amber', resigned: 'gray' } as const;

export default async function LedenPage({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; error?: string; saved?: string }>;
}) {
  const { q = '', status = 'active', type = '', error, saved } = await searchParams;
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

  const secretariat = hasRole(ctx, 'secretariat');
  const [{ data }, { data: types }, { data: requestRows }] = await Promise.all([
    query,
    supabase.from('membership_types').select('id, name').eq('club_id', ctx.club.id).order('name'),
    // Verzoeken uit de app (upgraden): direct hier afhandelen
    secretariat ? supabase.from('membership_changes').select('id, kind, effective_date, target_membership_type_id, member:members(id, first_name, infix, last_name)')
      .eq('club_id', ctx.club.id).eq('status', 'requested').order('created_at') : Promise.resolve({ data: [] }),
  ]);
  type Request = { id: string; kind: 'pause' | 'switch' | 'cancel'; effective_date: string; target_membership_type_id: string | null;
    member: { id: string; first_name: string; infix: string | null; last_name: string } };
  const requests = (requestRows ?? []) as unknown as Request[];
  const typeName = (id: string | null) => (types ?? []).find((t) => t.id === id)?.name ?? '';
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
            {secretariat && <ButtonLink href="/leden/importeren" variant="secondary">Importeren</ButtonLink>}
            {secretariat && <ButtonLink href="/leden/uitnodigen" variant="secondary">Uitnodigen voor de app</ButtonLink>}
            {secretariat && <ButtonLink href="/leden/nieuw">+ Nieuw lid</ButtonLink>}
          </>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Verwerkt.</Notice>}
      {requests.length > 0 && (
        <Card title={`Verzoeken uit de app (${requests.length})`} className="mb-6">
          <ul className="divide-y divide-stone-100">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <Link href={`/leden/${r.member.id}#lidmaatschap`} className="font-semibold text-brand-700 hover:underline">{fullName(r.member)}</Link>
                  {' '}wil {membershipChangeKindLabel[r.kind].toLowerCase()}{r.target_membership_type_id ? ` naar ${typeName(r.target_membership_type_id)}` : ''} per {formatDate(r.effective_date)}
                </span>
                <form action={decideChange} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="back" value="/leden" />
                  <Button type="submit" name="approve" value="1">Goedkeuren</Button>
                  <Button type="submit" name="approve" value="0" variant="secondary">Afwijzen</Button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Zoek op naam, lidnummer, NGF-nummer, e-mail, plaats…" className="min-w-64 flex-1" />
        <select name="status" defaultValue={status} aria-label="Status">
          <option value="all">Alle statussen</option>
          {(Object.keys(memberStatusLabel) as MemberStatus[]).map((s) => (
            <option key={s} value={s}>{memberStatusLabel[s]}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} aria-label="Lidmaatschap">
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
                  <th>Nr.</th><th>Naam</th><th>Lidmaatschap</th><th>Hcp</th><th>NGF-nr.</th><th>Plaats</th><th>Status</th>{secretariat && <th><span className="sr-only">Acties</span></th>}
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
                    {secretariat && <td><Link href={`/leden/${m.id}#lidmaatschap`} className="text-sm font-semibold text-brand-700 hover:underline">Lidmaatschap wijzigen</Link></td>}
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
