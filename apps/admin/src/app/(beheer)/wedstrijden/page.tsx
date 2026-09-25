import Link from 'next/link';
import { competitionFormatLabel, competitionStatusLabel, formatEuro, type Competition, type CompetitionFormat } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, Card, Empty, Field, Notice, PageHeader } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { createCompetition } from './actions';

export const metadata = { title: 'Wedstrijden' };

export default async function WedstrijdenPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const [{ data }, { data: courses }] = await Promise.all([
    supabase.from('competitions').select('*, competition_entries(count)').eq('club_id', ctx.club.id).order('starts_at', { ascending: false }),
    supabase.from('courses').select('id, name').eq('club_id', ctx.club.id).order('name'),
  ]);
  const comps = (data ?? []) as (Competition & { competition_entries: { count: number }[] })[];

  return (
    <>
      <PageHeader title="Wedstrijden" />
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          {comps.length === 0 ? <Empty>Nog geen wedstrijden.</Empty> : (
            <table>
              <thead className="bg-stone-50"><tr><th>Wedstrijd</th><th>Datum</th><th>Vorm</th><th>Deelnemers</th><th>Status</th></tr></thead>
              <tbody>
                {comps.map((c) => (
                  <tr key={c.id}>
                    <td><Link href={`/wedstrijden/${c.id}`} className="font-medium text-brand-700 hover:underline">{c.name}</Link></td>
                    <td>{formatDateTime(c.starts_at)}</td>
                    <td>{competitionFormatLabel[c.format]}</td>
                    <td>{c.competition_entries[0]?.count ?? 0}{c.max_participants ? ` / ${c.max_participants}` : ''}</td>
                    <td><Badge tone={c.status === 'open' ? 'green' : c.status === 'draft' ? 'gray' : 'blue'}>{competitionStatusLabel[c.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {hasRole(ctx, 'secretariat') && (
          <Card title="Nieuwe wedstrijd">
            <form action={createCompetition} className="space-y-3 p-4">
              <Field label="Naam"><input name="name" required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Datum"><input type="date" name="date" required /></Field>
                <Field label="Eerste start"><input type="time" name="time" defaultValue="09:00" /></Field>
              </div>
              <Field label="Baan">
                <select name="course_id">{(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Spelvorm">
                  <select name="format">
                    {(Object.keys(competitionFormatLabel) as CompetitionFormat[]).map((f) => <option key={f} value={f}>{competitionFormatLabel[f]}</option>)}
                  </select>
                </Field>
                <Field label="Max. deelnemers"><input type="number" name="max_participants" min={1} /></Field>
                <Field label="Inschrijfgeld"><input name="entry_fee" placeholder={formatEuro(0)} /></Field>
                <Field label="Inschrijven t/m"><input type="date" name="deadline" /></Field>
              </div>
              <Field label="Omschrijving"><textarea name="description" rows={3} /></Field>
              <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="qualifying" defaultChecked /> Qualifying</label>
              <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="publish" defaultChecked /> Direct openstellen voor inschrijving</label>
              <Button type="submit">Aanmaken</Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
