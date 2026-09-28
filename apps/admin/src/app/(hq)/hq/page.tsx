import Link from 'next/link';
import { AlertTriangle, Building2, CalendarClock, CheckCircle2, CreditCard, Handshake, Landmark, PhoneCall, Rocket, Users } from 'lucide-react';
import { addDays, formatEuro, localDate } from '@golfapp/shared';
import { AutoRefresh } from '@/components/auto-refresh';
import { Figure, Section, StatusBanner, TaskList, type Task } from '@/components/mission';
import { WeekBars } from '@/components/week-bars';
import { formatDate } from '@/lib/format';
import { requirePlatformStaff } from '@/lib/hq';
import { stageLabel, stages, type Stage } from '@/lib/pipeline';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Greenside HQ' };

type Club = {
  club_id: string; name: string; city: string | null; status: 'pilot' | 'actief' | 'opgezegd'; since: string; pilot_until: string | null;
  fee_cents: number; members: number; active_30d: number; flights_30d: number; app_revenue_30d_cents: number; orders_30d: number;
  last_activity: string | null; bank_ready: boolean; payments_ready: boolean; open_leads: number; retained: number;
};
type Prospect = {
  id: string; club_name: string; city: string | null; members_estimate: number | null; stage: Stage; monthly_value_cents: number;
  contact_name: string | null; next_step: string | null; next_date: string | null;
};

const euro = (c: number) => formatEuro(c).replace(/,00$/, '');
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const days = (from: string, to: string) => Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000);


/** Hoe gaat het met een klant, in één woord plus de reden. */
function health(c: Club, today: string): { level: 'goed' | 'let-op' | 'risico'; reason: string } {
  const adoption = pct(c.active_30d, c.members);
  const quiet = c.last_activity ? days(localDate(new Date(c.last_activity)), today) : 999;
  if (c.status === 'opgezegd') return { level: 'risico', reason: 'Opgezegd' };
  if (c.members === 0) return { level: 'let-op', reason: 'Nog in te richten: leden importeren' };
  if (quiet >= 7) return { level: 'risico', reason: `${quiet} dagen geen activiteit` };
  if (adoption < 15) return { level: 'risico', reason: `Maar ${adoption}% gebruikt de app` };
  if (c.pilot_until && days(today, c.pilot_until) <= 14) return { level: 'let-op', reason: `Proef loopt af over ${days(today, c.pilot_until)} dagen` };
  if (adoption < 35) return { level: 'let-op', reason: `${adoption}% gebruikt de app` };
  if (!c.bank_ready) return { level: 'let-op', reason: 'Incasso nog niet ingesteld' };
  return { level: 'goed', reason: `${adoption}% gebruikt de app` };
}
const levelRank = { risico: 0, 'let-op': 1, goed: 2 } as const;
const healthStyle = {
  goed: { cls: 'bg-brand-50 text-brand-700', label: 'Goed', Icon: CheckCircle2 },
  'let-op': { cls: 'bg-brass-soft text-[#6b4f1b]', label: 'Let op', Icon: AlertTriangle },
  risico: { cls: 'bg-red-50 text-red-800', label: 'Risico', Icon: AlertTriangle },
} as const;

export default async function HqMissionControl() {
  await requirePlatformStaff();
  const supabase = await createClient();
  const today = localDate();

  const [overview, weekly, prospects] = await Promise.all([
    supabase.rpc('hq_club_overview'),
    supabase.rpc('hq_weekly', { p_weeks: 12 }),
    supabase.from('hq_prospects').select('*').order('next_date', { nullsFirst: false }),
  ]);
  const clubs = (overview.data ?? []) as Club[];
  const weeks = (weekly.data ?? []) as { week_start: string; app_revenue_cents: number; flights: number }[];
  const pipeline = (prospects.data ?? []) as Prospect[];

  // ── Kerncijfers
  const paying = clubs.filter((c) => c.status === 'actief');
  const pilots = clubs.filter((c) => c.status === 'pilot');
  const mrr = paying.reduce((s, c) => s + Number(c.fee_cents), 0);
  const pilotMrr = pilots.reduce((s, c) => s + Number(c.fee_cents), 0);
  const members = clubs.reduce((s, c) => s + c.members, 0);
  const active = clubs.reduce((s, c) => s + c.active_30d, 0);
  const clubRevenue = clubs.reduce((s, c) => s + Number(c.app_revenue_30d_cents), 0);
  const payingRevenue = paying.reduce((s, c) => s + Number(c.app_revenue_30d_cents), 0);
  const openDeals = pipeline.filter((p) => ['lead', 'demo', 'proefperiode'].includes(p.stage));
  const pipelineValue = openDeals.reduce((s, p) => s + Number(p.monthly_value_cents), 0);

  // ── Takenlijst
  const tasks: Task[] = [];
  for (const c of clubs) {
    // Net aangemaakt: eerst inrichten, de andere signalen zeggen dan nog niets
    if (c.status !== 'opgezegd' && c.members === 0) {
      tasks.push({ key: `setup-${c.club_id}`, tone: 'todo', icon: Building2, title: `${c.name}: inrichting afmaken`,
        explain: 'De club staat klaar, maar er zijn nog geen leden. De beheerder logt in met een code en importeert het ledenbestand.',
        href: `/hq/klanten/${c.club_id}`, cta: 'Inrichting bekijken' });
      continue;
    }
    const quiet = c.last_activity ? days(localDate(new Date(c.last_activity)), today) : 999;
    if (c.status !== 'opgezegd' && quiet >= 7) {
      tasks.push({ key: `quiet-${c.club_id}`, tone: 'urgent', icon: PhoneCall, title: `${c.name}: ${quiet} dagen geen activiteit`,
        explain: 'Geen boekingen en geen bestellingen meer. Bel de club: is er iets mis met de app, of is de baan dicht? Dit is het eerste teken dat een klant wegloopt.',
        href: `/hq/klanten/${c.club_id}`, cta: 'Bekijken' });
    }
    if (c.pilot_until && c.pilot_until >= today && days(today, c.pilot_until) <= 30) {
      const left = days(today, c.pilot_until);
      tasks.push({ key: `pilot-${c.club_id}`, tone: left <= 14 ? 'urgent' : 'todo', icon: Rocket,
        title: `Proefperiode ${c.name} loopt af op ${formatDate(c.pilot_until)}`,
        explain: `Nog ${plural(left, 'dag', 'dagen')}. Plan een evaluatie met het bestuur en laat zien wat de app opleverde: ${euro(Number(c.app_revenue_30d_cents))} via de app in 30 dagen.`,
        href: `/hq/klanten/${c.club_id}`, cta: 'Evaluatie plannen' });
    }
    const adoption = pct(c.active_30d, c.members);
    if (c.status !== 'opgezegd' && quiet < 7 && adoption < 25) {
      tasks.push({ key: `adopt-${c.club_id}`, tone: 'todo', icon: Users, title: `${c.name}: ${adoption}% van de leden gebruikt de app`,
        explain: 'Help de club met uitnodigen: een mail aan alle leden vanuit het clubbeheer en een affiche in het clubhuis. Onder de 25% blijft de omzet via de app achter.',
        href: `/hq/klanten/${c.club_id}`, cta: 'Bekijken' });
    }
    if (c.status !== 'opgezegd' && !c.bank_ready) {
      tasks.push({ key: `bank-${c.club_id}`, tone: 'todo', icon: Landmark, title: `${c.name}: automatische incasso nog niet ingesteld`,
        explain: 'Zonder IBAN en incassant-ID betalen leden alles zelf. Help de penningmeester het incassant-ID bij de bank op te vragen.',
        href: `/hq/klanten/${c.club_id}`, cta: 'Bekijken' });
    }
  }
  const noIdeal = clubs.filter((c) => c.status !== 'opgezegd' && !c.payments_ready);
  if (noIdeal.length) {
    tasks.push({ key: 'ideal', tone: 'info', icon: CreditCard, title: `${plural(noIdeal.length, 'klant heeft', 'klanten hebben')} nog geen iDEAL`,
      explain: `${noIdeal.map((c) => c.name).join(', ')}. Leden zonder machtiging betalen dan per factuur. Een Mollie-account per club lost dat op.`,
      href: '#klanten', cta: 'Bekijken' });
  }
  for (const p of openDeals.filter((x) => x.next_date && x.next_date <= addDays(today, 7))) {
    const late = p.next_date! < today;
    tasks.push({ key: `deal-${p.id}`, tone: late || p.next_date === today ? 'urgent' : 'todo', icon: Handshake,
      title: `${p.next_step ?? 'Opvolgen'}: ${p.club_name}`,
      explain: `${stageLabel[p.stage]}${p.contact_name ? ` · ${p.contact_name}` : ''} · ${late ? `${plural(days(p.next_date!, today), 'dag', 'dagen')} te laat` : p.next_date === today ? 'vandaag' : `gepland op ${formatDate(p.next_date)}`}. Waarde ${euro(Number(p.monthly_value_cents))} per maand.`,
      href: '/hq/verkoop', cta: 'Naar verkoop' });
  }
  for (const p of pipeline.filter((x) => x.stage === 'gewonnen' && x.next_step)) {
    tasks.push({ key: `won-${p.id}`, tone: 'todo', icon: Building2, title: `${p.club_name}: ${p.next_step!.toLowerCase()}`,
      explain: `Gewonnen klant${p.next_date ? `, gepland op ${formatDate(p.next_date)}` : ''}. Maak de club aan, zet leden over en stuur de uitnodigingen.`,
      href: '/hq/verkoop', cta: 'Bekijken' });
  }
  const rank = { urgent: 0, todo: 1, info: 2 } as const;
  tasks.sort((a, b) => rank[a.tone] - rank[b.tone]);

  const now = new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-10 text-base">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#7a5c22]">Mission control · Greenside HQ</div>
          <h1 className="mt-1 font-display text-[40px] font-semibold leading-tight tracking-tight text-stone-900">Hoe gaat het met Greenside?</h1>
          <p className="mt-1 text-lg text-stone-600">
            {now.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' })}.
            Alle klanten, de verkoop en wat de app oplevert, op één plek.
          </p>
        </div>
        <AutoRefresh />
      </header>

      <StatusBanner urgent={tasks.filter((t) => t.tone === 'urgent').length} todo={tasks.filter((t) => t.tone === 'todo').length} name="Greenside" />

      <Section title="Kerncijfers" explain="Wat Greenside verdient en hoeveel golfers de app gebruiken. Omzet via de app is geld van de clubs, niet van ons: het is ons belangrijkste verkoopargument.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Figure label="Omzet per maand" value={euro(mrr)} tone="good" explain={`Van ${plural(paying.length, 'betalende klant', 'betalende klanten')}${pilotMrr ? `; ${euro(pilotMrr)} extra als de proef slaagt` : ''}`} />
          <Figure label="Omzet per jaar" value={euro(mrr * 12)} explain="Maandomzet × 12, als niemand opzegt" />
          <Figure label="Klanten" value={String(paying.length + pilots.length)} explain={`${paying.length} betalend, ${plural(pilots.length, 'in proefperiode', 'in proefperiode')}`} href="#klanten" />
          <Figure label="In de pijplijn" value={euro(pipelineValue)} explain={`Per maand, ${plural(openDeals.length, 'club', 'clubs')} in gesprek`} href="/hq/verkoop" />
          <Figure label="Golfers op Greenside" value={members.toLocaleString('nl-NL')} explain="Actieve leden bij alle klanten samen" />
          <Figure label="Actief in de app" value={`${pct(active, members)}%`} tone={pct(active, members) >= 35 ? 'good' : 'warn'} explain={`${active.toLocaleString('nl-NL')} leden boekten of bestelden in 30 dagen`} />
          <Figure label="Via de app bij klanten" value={euro(clubRevenue)} tone="good" explain="Omzet die leden in 30 dagen zelf regelden" />
          <Figure label="Terugverdiend" value={mrr ? `${(payingRevenue / mrr).toFixed(1).replace('.', ',')}×` : '—'} tone={mrr && payingRevenue >= mrr ? 'good' : 'default'} explain="Omzet via de app ÷ licentie, bij betalende klanten" />
        </div>
      </Section>

      <Section title="Wat moet er gebeuren?" explain="Klanten die aandacht nodig hebben en afspraken in de verkoop, van belangrijk naar minder belangrijk.">
        <TaskList tasks={tasks} />
      </Section>

      <Section title="Klanten" explain="Per club: hoe het gaat, hoeveel leden de app gebruiken en wat de app de club opleverde in de laatste 30 dagen. Clubs met een risico staan bovenaan.">
        <div id="klanten" className="scroll-mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white" tabIndex={0} role="region" aria-label="Klanten">
          <table className="min-w-[900px] text-[15px]">
            <thead className="bg-stone-50">
              <tr><th>Club</th><th>Gezondheid</th><th className="text-right">Leden</th><th>Actief in de app</th>
                <th className="text-right">Flights</th><th className="text-right">Via de app</th><th className="text-right">Terugverdiend</th><th className="text-right">Licentie</th><th>Klant sinds</th></tr>
            </thead>
            <tbody>
              {[...clubs].sort((x, y) => levelRank[health(x, today).level] - levelRank[health(y, today).level] || x.name.localeCompare(y.name)).map((c) => {
                const h = health(c, today);
                const s = healthStyle[h.level];
                const a = pct(c.active_30d, c.members);
                return (
                  <tr key={c.club_id}>
                    <td>
                      <Link href={`/hq/klanten/${c.club_id}`} className="font-bold text-stone-900 underline-offset-2 hover:underline">{c.name}</Link>
                      <div className="text-sm text-stone-600">{c.city}{c.status === 'pilot' ? ' · proefperiode' : c.status === 'opgezegd' ? ' · opgezegd' : ''}</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${s.cls}`}><s.Icon size={13} aria-hidden /> {s.label}</span>
                      <div className="mt-1 text-sm text-stone-600">{h.reason}</div>
                    </td>
                    <td className="text-right tabular-nums">{c.members}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200" aria-hidden><div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, a)}%` }} /></div>
                        <span className="tabular-nums">{a}%</span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{c.flights_30d}</td>
                    <td className="text-right tabular-nums">{euro(Number(c.app_revenue_30d_cents))}</td>
                    <td className="text-right tabular-nums">{Number(c.fee_cents) ? `${(Number(c.app_revenue_30d_cents) / Number(c.fee_cents)).toFixed(1).replace('.', ',')}×` : '—'}</td>
                    <td className="text-right tabular-nums">{euro(Number(c.fee_cents))}</td>
                    <td className="whitespace-nowrap text-stone-700">{formatDate(c.since)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Trend, alle klanten samen" explain="Twaalf weken. Links wat leden via de app regelden, rechts hoeveel flights er gespeeld werden.">
        <div className="grid gap-4 lg:grid-cols-2">
          <WeekBars title="Via de app per week" weeks={weeks.map((w) => ({ start: w.week_start, value: Number(w.app_revenue_cents) }))} format={euro} />
          <WeekBars title="Flights per week" weeks={weeks.map((w) => ({ start: w.week_start, value: w.flights }))} format={(v) => v.toLocaleString('nl-NL')} />
        </div>
      </Section>

      <Section title="Verkoop" explain="Clubs waarmee we in gesprek zijn, per fase, met de waarde per maand als ze klant worden." href="/hq/verkoop" linkLabel="Pijplijn beheren">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stages.map((st) => {
            const list = pipeline.filter((p) => p.stage === st);
            return (
              <Link key={st} href={`/hq/verkoop#${st}`} className={`rounded-2xl border p-4 hover:border-brand-500/40 ${st === 'verloren' ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-white'}`}>
                <div className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-stone-600">{stageLabel[st]}</div>
                <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{list.length}</div>
                <div className="text-sm text-stone-600">{euro(list.reduce((s, p) => s + Number(p.monthly_value_cents), 0))} p/m</div>
              </Link>
            );
          })}
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white">
          <h3 className="flex items-center gap-2 border-b border-stone-200 px-5 py-3 text-lg font-bold"><CalendarClock size={18} aria-hidden /> Volgende afspraken</h3>
          <ul className="divide-y divide-stone-100">
            {openDeals.concat(pipeline.filter((p) => p.stage === 'gewonnen')).filter((p) => p.next_date).slice(0, 6).map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 text-[15px]">
                <span><strong>{p.club_name}</strong> · {p.next_step}</span>
                <span className={p.next_date! < today ? 'font-bold text-red-700' : 'text-stone-600'}>
                  {p.next_date! < today ? `${plural(days(p.next_date!, today), 'dag', 'dagen')} te laat` : p.next_date === today ? 'vandaag' : formatDate(p.next_date)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
