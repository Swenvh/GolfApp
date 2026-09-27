import Link from 'next/link';
import {
  CalendarClock, ClipboardList, CreditCard, FileText, Handshake, Landmark, Mail, Newspaper, Receipt,
  Settings, Trophy, UserPlus, Users,
} from 'lucide-react';
import {
  addDays, formatEuro, fullName, generateTeeSlots, localDate, localTime, membershipChangeKindLabel, zonedToUtc,
  type Course,
} from '@golfapp/shared';
import { AutoRefresh } from '@/components/auto-refresh';
import { Figure, Section, StatusBanner, TaskList, TeeStrip, type SlotCell, type Task } from '@/components/mission';
import { Notice } from '@/components/ui';
import { getStaffContext, hasRole } from '@/lib/club';
import { formatDate } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Mission control' };

const euro = (c: number) => formatEuro(c).replace(/,00$/, '');
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function greeting() {
  const h = Number(new Intl.DateTimeFormat('nl-NL', { hour: 'numeric', hour12: false, timeZone: 'Europe/Amsterdam' }).format(new Date()));
  return h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
}

type Player = { member_id: string | null; guest_name: string | null; checked_in: boolean };
type Booking = { id: string; course_id: string; starts_at: string; tee_booking_players: Player[] };
type OpenInvoice = { id: string; due_date: string; total_cents: number; paid_cents: number; collect_by_direct_debit: boolean };
type Activity = { at: string; text: string; href: string };

export default async function MissionControl({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const club = ctx.club;
  const clubId = club.id;
  const today = localDate();
  const now = new Date();
  const dayStart = zonedToUtc(today, '00:00').toISOString();
  const dayEnd = zonedToUtc(addDays(today, 1), '00:00').toISOString();
  const monthStart = `${today.slice(0, 7)}-01`;
  const yearStart = `${today.slice(0, 4)}-01-01`;
  const in30 = addDays(today, 30);
  const finance = hasRole(ctx, 'finance');
  const secretariat = hasRole(ctx, 'secretariat');
  const none = Promise.resolve({ data: null, count: null });

  const [
    courses, bookings, buggies, members, newMembers, leaving, notInvited, handicart, mandates,
    requests, upcomingChanges, newLeads, competitions, sponsors, lastNews,
    openInvoices, drafts, inBatch, batches, paidThisMonth, appRevenue,
    recentOrders, recentLeads, recentChanges, recentPayments,
  ] = await Promise.all([
    supabase.from('courses').select('*').eq('club_id', clubId).eq('active', true).order('name'),
    supabase.from('tee_bookings').select('id, course_id, starts_at, tee_booking_players(member_id, guest_name, checked_in)')
      .eq('club_id', clubId).gte('starts_at', dayStart).lt('starts_at', dayEnd),
    supabase.from('orders').select('order_lines(quantity, product:products(category))')
      .eq('club_id', clubId).eq('fulfil_on', today).neq('status', 'cancelled'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'active'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId).gte('join_date', yearStart),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId)
      .gte('end_date', today).lte('end_date', `${today.slice(0, 4)}-12-31`),
    secretariat ? supabase.from('members').select('id', { count: 'exact', head: true }).eq('club_id', clubId)
      .eq('status', 'active').is('user_id', null).not('email', 'is', null) : none,
    supabase.from('members').select('id, first_name, infix, last_name, handicart_valid_until').eq('club_id', clubId)
      .not('handicart_pass_number', 'is', null).gte('handicart_valid_until', today).lte('handicart_valid_until', in30),
    finance ? supabase.from('sepa_mandates').select('member_id').eq('club_id', clubId).eq('status', 'active') : none,
    secretariat ? supabase.from('membership_changes').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'requested') : none,
    secretariat ? supabase.from('membership_changes').select('kind, effective_date, member:members(first_name, infix, last_name)')
      .eq('club_id', clubId).eq('status', 'approved').is('applied_at', null).order('effective_date').limit(5) : none,
    secretariat ? supabase.from('leads').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'new') : none,
    supabase.from('competitions').select('id, name, starts_at, status, registration_deadline, max_participants, competition_entries(count)')
      .eq('club_id', clubId).gte('starts_at', now.toISOString()).lte('starts_at', zonedToUtc(addDays(today, 14), '23:59').toISOString())
      .order('starts_at'),
    finance ? supabase.from('sponsors').select('name, valid_until').eq('club_id', clubId).eq('active', true)
      .gte('valid_until', today).lte('valid_until', in30) : none,
    supabase.from('news_posts').select('published_at').eq('club_id', clubId).not('published_at', 'is', null)
      .order('published_at', { ascending: false }).limit(1),
    finance ? supabase.from('invoices').select('id, due_date, total_cents, paid_cents, collect_by_direct_debit')
      .eq('club_id', clubId).eq('status', 'open') : none,
    finance ? supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'draft') : none,
    finance ? supabase.from('direct_debit_items').select('invoice_id, batch:direct_debit_batches!inner(status, club_id)')
      .eq('batch.club_id', clubId).in('batch.status', ['draft', 'exported']) : none,
    finance ? supabase.from('direct_debit_batches').select('id, collection_date, status, total_cents, item_count')
      .eq('club_id', clubId).in('status', ['draft', 'exported']).order('collection_date') : none,
    finance ? supabase.from('payments').select('amount_cents').eq('club_id', clubId).gte('paid_on', monthStart) : none,
    finance || secretariat ? supabase.from('app_revenue').select('revenue_incl_cents').eq('club_id', clubId)
      .gte('fulfil_on', monthStart).lte('fulfil_on', today) : none,
    supabase.from('orders').select('id, created_at, total_cents, member:members(first_name, infix, last_name), order_lines(description)')
      .eq('club_id', clubId).order('created_at', { ascending: false }).limit(5),
    secretariat ? supabase.from('leads').select('created_at, name, type').eq('club_id', clubId).order('created_at', { ascending: false }).limit(3) : none,
    secretariat ? supabase.from('membership_changes').select('created_at, kind, member:members(first_name, infix, last_name)')
      .eq('club_id', clubId).order('created_at', { ascending: false }).limit(3) : none,
    finance ? supabase.from('payments').select('created_at, amount_cents, method, invoice:invoices(member:members(first_name, infix, last_name))')
      .eq('club_id', clubId).order('created_at', { ascending: false }).limit(3) : none,
  ]);

  // ── Vandaag op de baan
  const todays = (bookings.data ?? []) as unknown as Booking[];
  const allPlayers = todays.flatMap((b) => b.tee_booking_players);
  const guests = allPlayers.filter((p) => p.guest_name).length;
  const checkedIn = allPlayers.filter((p) => p.checked_in).length;
  const buggyCount = ((buggies.data ?? []) as unknown as { order_lines: { quantity: number; product: { category: string } | null }[] }[])
    .flatMap((o) => o.order_lines).filter((l) => l.product?.category === 'rental').reduce((s, l) => s + Number(l.quantity), 0);
  const strips = ((courses.data ?? []) as Course[]).map((c) => {
    const byTime = new Map(todays.filter((b) => b.course_id === c.id).map((b) => [new Date(b.starts_at).getTime(), b.tee_booking_players.length]));
    const slots: SlotCell[] = generateTeeSlots(today, c).map((s) => {
      const t = new Date(s.startsAt).getTime();
      return { time: s.time, players: byTime.get(t) ?? 0, past: t < now.getTime() };
    });
    return { course: c, slots };
  });

  // ── Geld
  const open = (openInvoices.data ?? []) as OpenInvoice[];
  const outstanding = open.reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  const overdueList = open.filter((i) => i.due_date < today);
  const overdue = overdueList.reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  const inBatchIds = new Set(((inBatch.data ?? []) as { invoice_id: string }[]).map((x) => x.invoice_id));
  const readyForDebit = open.filter((i) => i.collect_by_direct_debit && !inBatchIds.has(i.id));
  const readyAmount = readyForDebit.reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  type Batch = { id: string; collection_date: string; status: 'draft' | 'exported'; total_cents: number; item_count: number };
  const openBatches = (batches.data ?? []) as Batch[];
  const toProcess = openBatches.filter((b) => b.status === 'exported' && b.collection_date < today);
  const draftBatches = openBatches.filter((b) => b.status === 'draft');
  const nextBatch = openBatches.find((b) => b.collection_date >= today);
  const received = ((paidThisMonth.data ?? []) as { amount_cents: number }[]).reduce((s, p) => s + Number(p.amount_cents), 0);
  const appMonth = ((appRevenue.data ?? []) as { revenue_incl_cents: number }[]).reduce((s, r) => s + Number(r.revenue_incl_cents), 0);
  const fee = Number(club.greenside_fee_cents ?? 0);

  // ── Leden
  const mandateIds = new Set(((mandates.data ?? []) as { member_id: string }[]).map((m) => m.member_id));
  const expiringPasses = (handicart.data ?? []) as { id: string; first_name: string; infix: string | null; last_name: string; handicart_valid_until: string }[];
  type Change = { kind: 'pause' | 'switch' | 'cancel'; effective_date: string; member: { first_name: string; infix: string | null; last_name: string } };
  const upcoming = (upcomingChanges.data ?? []) as unknown as Change[];

  // ── Wedstrijden deze twee weken
  type Comp = { id: string; name: string; starts_at: string; status: string; registration_deadline: string | null; max_participants: number | null; competition_entries: { count: number }[] };
  const comps = (competitions.data ?? []) as unknown as Comp[];
  const entries = (c: Comp) => c.competition_entries[0]?.count ?? 0;

  // ── Takenlijst: wat moet er gebeuren, in gewone taal
  const tasks: Task[] = [];
  if (hasRole(ctx) && (!club.iban || !club.sepa_creditor_id)) {
    tasks.push({ key: 'setup', tone: 'urgent', icon: Settings, title: 'Bankgegevens van de club ontbreken',
      explain: 'Zonder IBAN en incassant-ID kan de club geen contributie automatisch laten afschrijven. Je vindt het incassant-ID in de internetbankieromgeving van de club.',
      href: '/instellingen', cta: 'Invullen' });
  }
  if (toProcess.length) {
    tasks.push({ key: 'process', tone: 'urgent', icon: Landmark, title: `Incasso van ${formatDate(toProcess[0]!.collection_date)} verwerken`,
      explain: `De bank heeft het geld (${euro(toProcess.reduce((s, b) => s + b.total_cents, 0))}) inmiddels afgeschreven. Zet de incasso op verwerkt, dan staan de facturen als betaald.`,
      href: '/financien/incasso', cta: 'Verwerken' });
  }
  if ((requests.count ?? 0) > 0) {
    tasks.push({ key: 'requests', tone: 'urgent', icon: ClipboardList,
      title: `${plural(requests.count!, 'lid wil', 'leden willen')} het lidmaatschap wijzigen`,
      explain: 'Pauzeren, omzetten of opzeggen, aangevraagd in de app. Keur goed of wijs af; de app regelt de rest op de ingangsdatum.',
      href: '/leden/wijzigingen', cta: 'Bekijken' });
  }
  if (overdueList.length) {
    tasks.push({ key: 'overdue', tone: 'urgent', icon: Receipt,
      title: `${plural(overdueList.length, 'factuur is', 'facturen zijn')} te laat betaald`,
      explain: `Samen ${euro(overdue)}. Stuur een herinnering of bel even; vaak is een machtiging vergeten.`,
      href: '/financien/facturen?overdue=1', cta: 'Bekijken' });
  }
  if ((newLeads.count ?? 0) > 0) {
    tasks.push({ key: 'leads', tone: 'todo', icon: UserPlus,
      title: `${plural(newLeads.count!, 'nieuwe aanmelding', 'nieuwe aanmeldingen')} uit de app`,
      explain: 'Vrienden van leden, gezinsleden en leden die willen upgraden. Neem binnen een paar dagen contact op; dan is de kans het grootst dat ze lid worden.',
      href: '/app-omzet#leads', cta: 'Contact opnemen' });
  }
  if (readyForDebit.length) {
    tasks.push({ key: 'debit', tone: 'todo', icon: Landmark,
      title: `${euro(readyAmount)} staat klaar voor automatische incasso`,
      explain: `${plural(readyForDebit.length, 'factuur', 'facturen')} van leden met een machtiging. Maak een incassobestand en lees het in bij de bank.`,
      href: '/financien/incasso', cta: 'Incasso klaarmaken' });
  }
  if (draftBatches.length) {
    tasks.push({ key: 'draftbatch', tone: 'todo', icon: Landmark, title: 'Incassobestand nog niet naar de bank',
      explain: `De incasso van ${formatDate(draftBatches[0]!.collection_date)} is aangemaakt maar nog niet gedownload en ingelezen bij de bank.`,
      href: '/financien/incasso', cta: 'Downloaden' });
  }
  if ((drafts.count ?? 0) > 0) {
    tasks.push({ key: 'drafts', tone: 'todo', icon: FileText,
      title: `${plural(drafts.count!, 'factuur staat', 'facturen staan')} nog in concept`,
      explain: 'Een conceptfactuur is nog niet verstuurd en telt nog niet mee. Maak hem definitief als hij klopt.',
      href: '/financien/facturen?status=draft', cta: 'Afmaken' });
  }
  const openComps = comps.filter((c) => c.registration_deadline && c.registration_deadline > now.toISOString()
    && new Date(c.registration_deadline).getTime() - now.getTime() < 3 * 86400000);
  for (const c of openComps) {
    tasks.push({ key: `deadline-${c.id}`, tone: 'todo', icon: Trophy, title: `Inschrijving "${c.name}" sluit ${formatDate(c.registration_deadline!)}`,
      explain: `${plural(entries(c), 'deelnemer', 'deelnemers')}${c.max_participants ? ` van de ${c.max_participants} plekken` : ''}. Zet eventueel een herinnering in het nieuws.`,
      href: `/wedstrijden/${c.id}`, cta: 'Bekijken' });
  }
  for (const c of comps.filter((x) => x.status === 'draft')) {
    tasks.push({ key: `draft-${c.id}`, tone: 'todo', icon: Trophy, title: `"${c.name}" staat nog niet open`,
      explain: `De wedstrijd is ${formatDate(c.starts_at)}, maar leden kunnen zich nog niet inschrijven in de app.`,
      href: `/wedstrijden/${c.id}`, cta: 'Openzetten' });
  }
  if ((notInvited.count ?? 0) > 0) {
    tasks.push({ key: 'invite', tone: 'info', icon: Mail,
      title: `${plural(notInvited.count!, 'lid gebruikt', 'leden gebruiken')} de app nog niet`,
      explain: 'Ze hebben wel een e-mailadres, maar zijn nog niet uitgenodigd. Open het lid en klik op "Uitnodiging versturen".',
      href: '/leden', cta: 'Naar leden' });
  }
  if (expiringPasses.length) {
    tasks.push({ key: 'handicart', tone: 'info', icon: CreditCard,
      title: `${plural(expiringPasses.length, 'Handicart-pas verloopt', 'Handicart-passen verlopen')} binnen 30 dagen`,
      explain: `${expiringPasses.slice(0, 3).map((m) => fullName(m)).join(', ')}${expiringPasses.length > 3 ? ' en anderen' : ''}. Na afloop betalen ze het gewone buggytarief; attendeer ze op verlengen bij Stichting Handicart.`,
      href: `/leden/${expiringPasses[0]!.id}`, cta: 'Bekijken' });
  }
  for (const s of (sponsors.data ?? []) as { name: string; valid_until: string }[]) {
    tasks.push({ key: `sponsor-${s.name}`, tone: 'info', icon: Handshake, title: `Sponsorcontract ${s.name} loopt af`,
      explain: `Op ${formatDate(s.valid_until)}. Een goed moment om het aantal kliks uit de app te laten zien en te verlengen.`,
      href: '/app-omzet/sponsors', cta: 'Bekijken' });
  }
  const lastPublished = (lastNews.data ?? [])[0]?.published_at as string | undefined;
  if (secretariat && (!lastPublished || lastPublished < zonedToUtc(addDays(today, -21), '00:00').toISOString())) {
    tasks.push({ key: 'news', tone: 'info', icon: Newspaper, title: 'Al drie weken geen clubnieuws',
      explain: 'Een kort bericht (uitslag, baanstatus, activiteit) houdt leden betrokken. Het staat direct in de app.',
      href: '/nieuws', cta: 'Bericht schrijven' });
  }
  const rank = { urgent: 0, todo: 1, info: 2 } as const;
  tasks.sort((a, b) => rank[a.tone] - rank[b.tone]);
  const urgentCount = tasks.filter((t) => t.tone === 'urgent').length;
  const todoCount = tasks.filter((t) => t.tone === 'todo').length;

  // ── Wat er net gebeurde
  const who = (m: { first_name: string; infix: string | null; last_name: string } | null | undefined) => (m ? fullName(m) : 'Iemand');
  const activity: Activity[] = [
    ...((recentOrders.data ?? []) as unknown as { id: string; created_at: string; total_cents: number; member: never; order_lines: { description: string }[] }[])
      .map((o) => ({ at: o.created_at, text: `${who(o.member)} bestelde ${o.order_lines.map((l) => l.description).join(', ').toLowerCase()} (${euro(o.total_cents)})`, href: '/app-omzet' })),
    ...((recentLeads.data ?? []) as { created_at: string; name: string | null; type: string }[])
      .map((l) => ({ at: l.created_at, text: `Nieuwe aanmelding: ${l.name ?? 'onbekend'}`, href: '/app-omzet#leads' })),
    ...((recentChanges.data ?? []) as unknown as { created_at: string; kind: Change['kind']; member: never }[])
      .map((c) => ({ at: c.created_at, text: `${who(c.member)} vroeg: ${membershipChangeKindLabel[c.kind].toLowerCase()}`, href: '/leden/wijzigingen' })),
    ...((recentPayments.data ?? []) as unknown as { created_at: string; amount_cents: number; invoice: { member: never } | null }[])
      .map((p) => ({ at: p.created_at, text: `Betaling ontvangen van ${who(p.invoice?.member)}: ${euro(Number(p.amount_cents))}`, href: '/financien/facturen' })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  const dateLine = now.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' });

  return (
    <div className="mx-auto max-w-6xl space-y-10 text-base">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#7a5c22]">Mission control · {club.name}</div>
          <h1 className="mt-1 font-display text-[40px] font-semibold leading-tight tracking-tight text-stone-900">{greeting()}</h1>
          <p className="mt-1 text-lg text-stone-600">Het is {dateLine}. Hier zie je in één keer hoe het met de club gaat.</p>
        </div>
        <AutoRefresh />
      </header>

      {error === 'geen-rechten' && <Notice tone="error">Je hebt geen rechten voor die pagina.</Notice>}

      <StatusBanner urgent={urgentCount} todo={todoCount} name={club.name} />

      <Section title="Wat moet ik doen?" explain="Van belangrijk naar minder belangrijk. Elke regel zegt wat er is en welke knop je nodig hebt.">
        <TaskList tasks={tasks} />
      </Section>

      <Section title="Vandaag op de baan" explain="Elk blokje is een starttijd. Hoe donkerder, hoe voller. Wat al geweest is, is lichter."
        href="/starttijden" linkLabel="Naar de starttijden">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Figure label="Spelers vandaag" value={String(allPlayers.length)} explain={`${plural(todays.length, 'flight', 'flights')} op de baan`} href="/starttijden" />
          <Figure label="Gasten" value={String(guests)} explain="Introducés en greenfeespelers" />
          <Figure label="Buggy's" value={String(buggyCount)} explain="Via de app gereserveerd, sleutel bij de receptie" href="/app-omzet" />
          <Figure label="Ingecheckt" value={`${checkedIn} / ${allPlayers.length}`} explain="Spelers die zich al gemeld hebben" href="/starttijden" />
        </div>
        <div className="space-y-4">
          {strips.map(({ course, slots }) => <TeeStrip key={course.id} name={course.name} slots={slots} max={course.max_players} />)}
        </div>
      </Section>

      {finance && (
        <Section title="Geld" explain="Wat leden nog moeten betalen en wat er binnenkwam. Bedragen inclusief btw." href="/financien" linkLabel="Naar financiën">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Figure label="Nog te ontvangen" value={euro(outstanding)} explain={`${plural(open.length, 'openstaande factuur', 'openstaande facturen')}`} href="/financien/facturen?status=open" />
            <Figure label="Te laat" value={euro(overdue)} tone={overdue ? 'warn' : 'good'}
              explain={overdue ? `${plural(overdueList.length, 'factuur', 'facturen')} over de betaaltermijn` : 'Niemand loopt achter met betalen'} href="/financien/facturen?overdue=1" />
            <Figure label="Binnen deze maand" value={euro(received)} tone="good" explain="Alle betalingen: incasso, iDEAL, overboeking en pin" />
            <Figure label="Volgende incasso" value={nextBatch ? formatDate(nextBatch.collection_date).replace(/ \d{4}$/, '') : '—'}
              explain={nextBatch ? `${euro(nextBatch.total_cents)} bij ${plural(nextBatch.item_count, 'lid', 'leden')}` : readyForDebit.length ? `${euro(readyAmount)} staat klaar` : 'Er staat niets klaar'} href="/financien/incasso" />
          </div>
        </Section>
      )}

      <Section title="Leden" explain="Hoe het ledenbestand zich ontwikkelt." href="/leden" linkLabel="Naar de ledenlijst">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Figure label="Actieve leden" value={String(members.count ?? 0)} explain={`${newMembers.count ?? 0} nieuw sinds 1 januari`} href="/leden" />
          <Figure label="Stoppen dit jaar" value={String(leaving.count ?? 0)} tone={(leaving.count ?? 0) ? 'warn' : 'default'} explain="Leden met een einddatum voor 31 december" />
          {finance && (
            <Figure label="Zonder machtiging" value={String(Math.max(0, (members.count ?? 0) - mandateIds.size))}
              explain="Betalen zelf, niet via automatische incasso" href="/leden" />
          )}
          {secretariat && (
            <Figure label="Nog zonder app" value={String(notInvited.count ?? 0)} explain="Actieve leden die nog geen uitnodiging hebben" href="/leden" />
          )}
        </div>
        {upcoming.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-lg font-bold text-stone-900">Wijzigingen die eraan komen</h3>
            <ul className="mt-3 divide-y divide-stone-100">
              {upcoming.map((c, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-2.5 text-[15px]">
                  <span>{fullName(c.member)}: {membershipChangeKindLabel[c.kind].toLowerCase()}</span>
                  <span className="text-stone-600">gaat in op {formatDate(c.effective_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="De komende twee weken" explain="Wedstrijden en hoeveel leden zich al hebben ingeschreven." href="/wedstrijden" linkLabel="Alle wedstrijden">
          {comps.length === 0 ? (
            <p className="rounded-2xl border border-stone-200 bg-white p-5 text-[15px] text-stone-600">Geen wedstrijden in de komende twee weken.</p>
          ) : (
            <ul className="space-y-3">
              {comps.map((c) => {
                const pct = c.max_participants ? Math.min(100, Math.round((entries(c) / c.max_participants) * 100)) : null;
                return (
                  <li key={c.id}>
                    <Link href={`/wedstrijden/${c.id}`} className="block rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500/40">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-lg font-bold text-stone-900">{c.name}</span>
                        <span className="text-[15px] text-stone-600">{formatDate(c.starts_at)} · {localTime(c.starts_at)}</span>
                      </div>
                      <div className="mt-2 text-[15px] text-stone-700">
                        {plural(entries(c), 'deelnemer', 'deelnemers')}{c.max_participants ? ` van de ${c.max_participants}` : ''}
                        {c.status === 'draft' && <span className="ml-2 rounded-full bg-brass-soft px-2 py-0.5 text-xs font-bold text-[#6b4f1b]">Nog niet open</span>}
                      </div>
                      {pct != null && (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden>
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Wat er net gebeurde" explain="De laatste bestellingen, aanmeldingen, verzoeken en betalingen.">
          {activity.length === 0 ? (
            <p className="rounded-2xl border border-stone-200 bg-white p-5 text-[15px] text-stone-600">Nog niets gebeurd vandaag.</p>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
              {activity.map((a, i) => (
                <li key={i}>
                  <Link href={a.href} className="flex gap-4 px-5 py-3 text-[15px] hover:bg-brand-50/60">
                    <span className="w-24 shrink-0 tabular-nums text-stone-600">{relative(a.at, now)}</span>
                    <span className="text-stone-800">{a.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {(finance || secretariat) && (
        <Section title="Wat de app oplevert" explain="Omzet die leden deze maand zelf in de app regelden, zonder werk aan de balie." href="/app-omzet" linkLabel="Details">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Figure label="Via de app deze maand" value={euro(appMonth)} tone="good" explain="Buggy's, greenfees, lessen, stalling en meer" href="/app-omzet" />
            <Figure label="Kosten Greenside" value={fee ? euro(fee) : '—'} explain="Per maand" />
            <Figure label="Terugverdiend" value={fee ? `${(appMonth / fee).toFixed(1).replace('.', ',')}×` : '—'} tone={fee && appMonth >= fee ? 'good' : 'default'}
              explain={fee ? (appMonth >= fee ? 'De app heeft zichzelf deze maand al terugverdiend' : 'Nog niet terugverdiend deze maand') : 'Vul het abonnement in bij Instellingen'} />
          </div>
        </Section>
      )}

      <p className="flex items-center gap-2 border-t border-stone-200 pt-5 text-sm text-stone-600">
        <Users size={16} aria-hidden /> Je ziet wat bij jouw rol hoort. Mis je iets, vraag dan de beheerder om een extra rol.
        <CalendarClock size={16} className="ml-auto" aria-hidden /> Ververst elke minuut vanzelf.
      </p>
    </div>
  );
}

function relative(iso: string, now: Date): string {
  const min = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'zojuist';
  if (min < 60) return `${min} min geleden`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} uur geleden`;
  const d = Math.round(h / 24);
  return d === 1 ? 'gisteren' : `${d} dagen geleden`;
}
