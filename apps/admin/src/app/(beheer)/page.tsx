import Link from 'next/link';
import { formatEuro, fullName, localDate, localTime, addDays, zonedToUtc } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Card, Empty, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDateTime } from '@/lib/format';

function greeting() {
  const h = Number(new Intl.DateTimeFormat('nl-NL', { hour: 'numeric', hour12: false, timeZone: 'Europe/Amsterdam' }).format(new Date()));
  return h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const clubId = ctx.club.id;
  const today = localDate();
  const dayStart = zonedToUtc(today, '00:00').toISOString();
  const dayEnd = zonedToUtc(addDays(today, 1), '00:00').toISOString();
  const isFinance = hasRole(ctx, 'finance');

  const [members, newMembers, bookings, competitions, balances, recent] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'active'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId)
      .gte('join_date', `${today.slice(0, 4)}-01-01`),
    supabase.from('tee_bookings').select('id, starts_at, tee_booking_players(count)')
      .eq('club_id', clubId).gte('starts_at', dayStart).lt('starts_at', dayEnd).order('starts_at'),
    supabase.from('competitions').select('id, name, starts_at, competition_entries(count)')
      .eq('club_id', clubId).gte('starts_at', new Date().toISOString()).order('starts_at').limit(5),
    isFinance
      ? supabase.from('member_balances').select('outstanding_cents, overdue_cents').eq('club_id', clubId)
      : Promise.resolve({ data: [] as { outstanding_cents: number | null; overdue_cents: number | null }[] }),
    supabase.from('members').select('id, first_name, infix, last_name, join_date, member_number')
      .eq('club_id', clubId).order('created_at', { ascending: false }).limit(5),
  ]);

  const outstanding = (balances.data ?? []).reduce((s, b) => s + (b.outstanding_cents ?? 0), 0);
  const overdue = (balances.data ?? []).reduce((s, b) => s + (b.overdue_cents ?? 0), 0);
  const players = (bookings.data ?? []).reduce(
    (s, b) => s + ((b.tee_booking_players as unknown as { count: number }[])[0]?.count ?? 0), 0);

  return (
    <>
      <PageHeader title={greeting()} subtitle={`${ctx.club.name} · ${new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' })}`} />
      {error === 'geen-rechten' && <Notice tone="error">Je hebt geen rechten voor die pagina.</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Actieve leden" value={String(members.count ?? 0)} hint={`${newMembers.count ?? 0} nieuw dit jaar`} />
        <Stat label="Spelers vandaag" value={String(players)} hint={`${bookings.data?.length ?? 0} flights`} />
        {isFinance && <Stat label="Openstaand" value={formatEuro(outstanding)} />}
        {isFinance && <Stat label="Achterstallig" value={formatEuro(overdue)} tone={overdue > 0 ? 'warn' : 'good'} />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Starttijden vandaag" actions={<Link href="/starttijden" className="text-sm text-brand-600">Tee sheet →</Link>}>
          {bookings.data?.length ? (
            <table>
              <tbody>
                {bookings.data.slice(0, 10).map((b) => (
                  <tr key={b.id}>
                    <td className="w-20 font-mono">{localTime(b.starts_at)}</td>
                    <td>{(b.tee_booking_players as unknown as { count: number }[])[0]?.count ?? 0} spelers</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>Nog geen boekingen vandaag.</Empty>}
        </Card>

        <Card title="Komende wedstrijden" actions={<Link href="/wedstrijden" className="text-sm text-brand-600">Alle →</Link>}>
          {competitions.data?.length ? (
            <table>
              <tbody>
                {competitions.data.map((c) => (
                  <tr key={c.id}>
                    <td><Link href={`/wedstrijden/${c.id}`} className="font-medium hover:underline">{c.name}</Link></td>
                    <td className="text-stone-500">{formatDateTime(c.starts_at)}</td>
                    <td className="text-right">{(c.competition_entries as unknown as { count: number }[])[0]?.count ?? 0} deeln.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>Geen geplande wedstrijden.</Empty>}
        </Card>

        <Card title="Recent toegevoegde leden" actions={<Link href="/leden" className="text-sm text-brand-600">Ledenlijst →</Link>}>
          <table>
            <tbody>
              {(recent.data ?? []).map((m) => (
                <tr key={m.id}>
                  <td className="w-16 text-stone-500">{m.member_number}</td>
                  <td><Link href={`/leden/${m.id}`} className="hover:underline">{fullName(m)}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
