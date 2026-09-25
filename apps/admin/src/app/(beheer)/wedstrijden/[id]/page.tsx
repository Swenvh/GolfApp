import { notFound } from 'next/navigation';
import { competitionFormatLabel, competitionStatusLabel, formatEuro, type Competition, type CompetitionStatus } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, Card, Empty, Notice, PageHeader } from '@/components/ui';
import { formatDateTime, formatHandicap } from '@/lib/format';
import { saveResults, setCompetitionStatus } from '../actions';

export default async function WedstrijdDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const { data } = await supabase.from('competitions').select('*').eq('id', id).eq('club_id', ctx.club.id).maybeSingle();
  if (!data) notFound();
  const c = data as Competition;
  const { data: participants } = await supabase.rpc('competition_participants', { p_competition: id });
  type P = { member_id: string; name: string; handicap_index: number | null; gross_score: number | null; net_score: number | null; stableford_points: number | null; position: number | null };
  const list = (participants ?? []) as P[];
  const canEdit = hasRole(ctx, 'secretariat');
  const next: Partial<Record<CompetitionStatus, CompetitionStatus>> = { draft: 'open', open: 'closed', closed: 'finished' };

  return (
    <>
      <PageHeader
        title={c.name}
        subtitle={`${formatDateTime(c.starts_at)} · ${competitionFormatLabel[c.format]} · ${c.qualifying ? 'qualifying' : 'niet-qualifying'} · inschrijfgeld ${formatEuro(c.entry_fee_cents)}`}
        actions={<>
          <Badge tone={c.status === 'open' ? 'green' : 'gray'}>{competitionStatusLabel[c.status]}</Badge>
          {canEdit && next[c.status] && (
            <form action={setCompetitionStatus}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value={next[c.status]} />
              <Button variant="secondary">→ {competitionStatusLabel[next[c.status]!]}</Button>
            </form>
          )}
        </>}
      />
      {saved && <Notice tone="success">Uitslagen opgeslagen.</Notice>}
      {c.description && <p className="mb-4 max-w-2xl text-sm text-stone-600">{c.description}</p>}
      <Card title={`Deelnemers (${list.length}${c.max_participants ? ` / ${c.max_participants}` : ''})`}>
        {list.length === 0 ? <Empty>Nog geen inschrijvingen.</Empty> : (
          <form action={saveResults}>
            <input type="hidden" name="id" value={id} />
            <table>
              <thead className="bg-stone-50"><tr><th>Naam</th><th>Hcp</th><th>Bruto</th><th>Netto</th><th>Stableford</th><th>Positie</th></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.member_id}>
                    <td>{p.name}<input type="hidden" name="member_id" value={p.member_id} /></td>
                    <td>{formatHandicap(p.handicap_index)}</td>
                    <td><input name="gross_score" type="number" className="w-20" defaultValue={p.gross_score ?? ''} disabled={!canEdit} /></td>
                    <td><input name="net_score" type="number" className="w-20" defaultValue={p.net_score ?? ''} disabled={!canEdit} /></td>
                    <td><input name="stableford_points" type="number" className="w-20" defaultValue={p.stableford_points ?? ''} disabled={!canEdit} /></td>
                    <td><input name="position" type="number" className="w-16" defaultValue={p.position ?? ''} disabled={!canEdit} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {canEdit && <div className="border-t border-stone-100 p-4"><Button type="submit">Uitslagen opslaan</Button></div>}
          </form>
        )}
      </Card>
    </>
  );
}
