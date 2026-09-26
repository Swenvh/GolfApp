import {
  addDays, formatEuro, fullName, leadStatusLabel, leadTypeLabel, localDate, localTime, productCategoryLabel,
  type Lead, type LeadStatus, type ProductCategory,
} from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, ButtonLink, Card, Empty, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { cancelOrderAction, markFulfilled, setLeadStatus } from './actions';

export const metadata = { title: 'App-omzet' };

type Row = { fulfil_on: string; category: ProductCategory; orders: number; items: number; revenue_incl_cents: number };
type OpenOrder = {
  id: string; fulfil_on: string; total_cents: number;
  member: { first_name: string; infix: string | null; last_name: string };
  booking: { starts_at: string } | null;
  order_lines: { description: string; quantity: number }[];
};

export default async function AppOmzet({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await requireRole('secretariat', 'finance');
  const supabase = await createClient();
  const today = localDate();
  const from30 = addDays(today, -29);
  const from42 = addDays(today, -41);

  const [revenue, bookings, open, leads] = await Promise.all([
    supabase.from('app_revenue').select('*').eq('club_id', ctx.club.id).gte('fulfil_on', from42).lte('fulfil_on', addDays(today, 14)),
    supabase.from('tee_bookings').select('id', { count: 'exact', head: true }).eq('club_id', ctx.club.id)
      .gte('starts_at', `${from30}T00:00:00Z`).lte('starts_at', `${today}T23:59:59Z`),
    supabase.from('orders')
      .select('id, fulfil_on, total_cents, member:members(first_name, infix, last_name), booking:tee_bookings(starts_at), order_lines(description, quantity)')
      .eq('club_id', ctx.club.id).eq('status', 'placed').gte('fulfil_on', today).lte('fulfil_on', addDays(today, 1))
      .order('fulfil_on'),
    supabase.from('leads').select('*, member:members(first_name, infix, last_name)').eq('club_id', ctx.club.id)
      .order('created_at', { ascending: false }).limit(20),
  ]);

  const rows = (revenue.data ?? []) as Row[];
  const last30 = rows.filter((r) => r.fulfil_on >= from30 && r.fulfil_on <= today);
  const total30 = last30.reduce((s, r) => s + Number(r.revenue_incl_cents), 0);
  const orders30 = last30.reduce((s, r) => s + Number(r.orders), 0);
  const perRound = bookings.count ? Math.round(total30 / bookings.count) : 0;
  const fee = Number(ctx.club.greenside_fee_cents ?? 0);
  const multiple = fee ? total30 / fee : null;

  // Per categorie (30 dagen), gesorteerd op omzet
  const byCat = new Map<ProductCategory, number>();
  for (const r of last30) byCat.set(r.category, (byCat.get(r.category) ?? 0) + Number(r.revenue_incl_cents));
  const cats = [...byCat].sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...cats.map(([, v]) => v));

  // Per week (6 weken)
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const start = addDays(today, -7 * (6 - i) + 1);
    const end = addDays(start, 6);
    const value = rows.filter((r) => r.fulfil_on >= start && r.fulfil_on <= end).reduce((s, r) => s + Number(r.revenue_incl_cents), 0);
    return { start, end, value };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.value));

  const openOrders = (open.data ?? []) as unknown as OpenOrder[];
  const leadRows = (leads.data ?? []) as (Lead & { member: { first_name: string; infix: string | null; last_name: string } | null })[];
  const pipeline = leadRows.filter((l) => l.status === 'new' || l.status === 'contacted').reduce((s, l) => s + Number(l.value_cents ?? 0), 0);

  return (
    <>
      <PageHeader
        title="App-omzet"
        subtitle="Wat leden via Greenside bestellen. Alles is direct gefactureerd en geboekt."
        actions={<ButtonLink href="/app-omzet/aanbod" variant="secondary">Aanbod beheren</ButtonLink>}
      />
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Omzet via de app (30 dagen)" value={formatEuro(total30)} hint={`${orders30} bestellingen`} tone="good" />
        <Stat label="Extra per geboekte flight" value={formatEuro(perRound)} hint={`${bookings.count ?? 0} flights in 30 dagen`} />
        <Stat label="Terugverdiend" value={multiple ? `${multiple.toFixed(1).replace('.', ',')}×` : '—'}
          hint={fee ? `de Greenside-licentie van ${formatEuro(fee)} p/m` : 'Vul het abonnementsbedrag in bij Instellingen'} tone={multiple && multiple >= 1 ? 'good' : 'default'} />
        <Stat label="Leads in behandeling" value={formatEuro(pipeline)} hint="Verwachte jaarwaarde van upgrades en nieuwe leden" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card title="Omzet per week" className="xl:col-span-3">
          <figure className="p-5">
            <div className="flex h-56 items-end gap-3" role="img" aria-label="Omzet via de app per week, laatste zes weken">
              {weeks.map((w, i) => (
                <div key={w.start} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className={`text-xs tabular ${i === weeks.length - 1 ? 'font-bold text-stone-900' : 'text-stone-500 opacity-0 group-hover:opacity-100'}`}>
                    {formatEuro(w.value).replace(/,\d\d$/, '')}
                  </span>
                  <div
                    title={`${formatDate(w.start)} – ${formatDate(w.end)}: ${formatEuro(w.value)}`}
                    className={`w-full max-w-16 rounded-t-[4px] transition ${i === weeks.length - 1 ? 'bg-brand-600' : 'bg-brand-500/70 group-hover:bg-brand-600'}`}
                    style={{ height: `${Math.max(2, (w.value / maxWeek) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3 border-t border-stone-200 pt-2">
              {weeks.map((w) => <span key={w.start} className="flex-1 text-center text-[11px] text-stone-500">{formatDate(w.start).replace(/ \d{4}$/, '')}</span>)}
            </div>
            <figcaption className="sr-only">
              {weeks.map((w) => `${formatDate(w.start)}: ${formatEuro(w.value)}`).join('; ')}
            </figcaption>
          </figure>
        </Card>

        <Card title="Waar leden aan besteden" className="xl:col-span-2">
          {cats.length === 0 ? <Empty>Nog geen bestellingen.</Empty> : (
            <ul className="space-y-3.5 p-5">
              {cats.map(([cat, value]) => (
                <li key={cat} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm" title={`${productCategoryLabel[cat]}: ${formatEuro(value)}`}>
                  <span className="text-stone-700">{productCategoryLabel[cat]}</span>
                  <span className="h-3 rounded-r-[4px] bg-brand-600" style={{ width: `${Math.max(2, (value / maxCat) * 100)}%` }} />
                  <span className="tabular font-semibold">{formatEuro(value).replace(/,\d\d$/, '')}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Klaarzetten vandaag en morgen" className="xl:col-span-3">
          {openOrders.length === 0 ? <Empty>Niets klaar te zetten.</Empty> : (
            <table>
              <thead className="bg-stone-50"><tr><th>Wanneer</th><th>Lid</th><th>Wat</th><th className="text-right">Bedrag</th><th /></tr></thead>
              <tbody>
                {openOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap">
                      {o.fulfil_on === today ? 'Vandaag' : 'Morgen'}
                      {o.booking && <span className="ml-1 font-semibold tabular">{localTime(o.booking.starts_at)}</span>}
                    </td>
                    <td>{fullName(o.member)}</td>
                    <td className="text-stone-700">{o.order_lines.map((l) => `${l.quantity > 1 ? `${l.quantity}× ` : ''}${l.description}`).join(', ')}</td>
                    <td className="text-right tabular">{formatEuro(o.total_cents)}</td>
                    <td className="whitespace-nowrap text-right">
                      <form action={markFulfilled} className="inline"><input type="hidden" name="order_id" value={o.id} /><Button variant="secondary" className="px-3 py-1 text-xs">Afgerond</Button></form>
                      <form action={cancelOrderAction} className="ml-1 inline"><input type="hidden" name="order_id" value={o.id} /><button className="text-xs text-red-700 hover:underline">Annuleer</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Leads uit de app" className="xl:col-span-2">
          {leadRows.length === 0 ? <Empty>Nog geen leads.</Empty> : (
            <ul className="divide-y divide-stone-200/70">
              {leadRows.map((l) => (
                <li key={l.id} className="space-y-2 px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-xs text-stone-500">
                        {leadTypeLabel[l.type]}{l.member && l.type === 'referral' ? ` · via ${fullName(l.member)}` : ''}
                      </div>
                    </div>
                    {l.value_cents ? <span className="shrink-0 font-display text-lg tabular">{formatEuro(Number(l.value_cents)).replace(/,\d\d$/, '')}</span> : null}
                  </div>
                  {l.note && <p className="text-xs text-stone-600">{l.note}</p>}
                  <form action={setLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="lead_id" value={l.id} />
                    <select name="status" defaultValue={l.status} className="py-1 text-xs" aria-label={`Status van ${l.name}`}>
                      {(Object.keys(leadStatusLabel) as LeadStatus[]).map((st) => <option key={st} value={st}>{leadStatusLabel[st]}</option>)}
                    </select>
                    <button className="text-xs font-bold text-brand-600 hover:underline">Opslaan</button>
                    {l.email && <span className="ml-auto truncate text-xs text-stone-500">{l.email}</span>}
                  </form>
                </li>
              ))}
            </ul>
          )}
          <p className="border-t border-stone-200/70 px-5 py-3 text-xs text-stone-500">
            Waarde = verwacht extra bedrag per jaar: contributie + entree bij nieuwe leden, het verschil bij upgrades.
          </p>
        </Card>
      </div>
      <p className="mt-4 text-xs text-stone-500">
        <Badge tone="green">Tip</Badge> Bestellingen zijn definitieve facturen: leden met een machtiging betalen via de eerstvolgende incasso, anderen via iDEAL.
      </p>
    </>
  );
}
