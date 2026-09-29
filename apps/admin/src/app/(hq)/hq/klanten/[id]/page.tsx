import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatEuro } from '@golfapp/shared';
import { Button, Field, Notice } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { requirePlatformStaff } from '@/lib/hq';
import { createClient } from '@/lib/supabase/server';
import { saveAppLinks } from '../actions';

export const metadata = { title: 'Klant inrichten' };

type Setup = {
  manager_email: string | null; manager_joined: boolean; members: number; courses: number;
  products_active: number; bank_ready: boolean; payments_ready: boolean;
};
type Overview = { club_id: string; name: string; city: string | null; status: string; pilot_until: string | null; fee_cents: number; active_30d: number };

export default async function KlantInrichten({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ nieuw?: string; links?: string }>;
}) {
  await requirePlatformStaff();
  const [{ id }, { nieuw, links }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [{ data: setupRows }, { data: overview }, { data: linkRows }] = await Promise.all([
    supabase.rpc('hq_club_setup', { p_club: id }),
    supabase.rpc('hq_club_overview'),
    supabase.rpc('hq_app_links', { p_club: id }),
  ]);
  const appLinks = (linkRows as { ios_url: string | null; android_url: string | null }[] | null)?.[0];
  const setup = (setupRows as Setup[] | null)?.[0];
  const club = (overview as Overview[] | null)?.find((c) => c.club_id === id);
  if (!setup || !club) notFound();

  const login = 'beheer.greenside.nl';
  const steps: { done: boolean; title: string; explain: string }[] = [
    { done: true, title: 'Club aangemaakt', explain: `Met ${setup.courses === 1 ? 'een baan' : `${setup.courses} banen`}, zes lidmaatschappen, het rekeningschema en het aanbod in de app (nog uit).` },
    { done: setup.manager_joined, title: 'De beheerder logt in',
      explain: setup.manager_joined ? 'De beheerder is ingelogd en heeft toegang tot het clubbeheer.'
        : `Nog niet gebeurd. Stuur ${setup.manager_email ?? 'de beheerder'} het bericht hieronder.` },
    { done: setup.members > 0, title: 'Leden importeren',
      explain: setup.members > 0 ? `${setup.members} leden staan in Greenside.` : 'De beheerder zet het ledenbestand uit het oude systeem over via Leden → Importeren.' },
    { done: setup.bank_ready, title: 'Bankgegevens voor incasso',
      explain: 'IBAN en incassant-ID van de club, in te vullen bij Instellingen. Het incassant-ID vraagt de club aan bij de eigen bank.' },
    { done: setup.payments_ready, title: 'iDEAL via Mollie',
      explain: 'De club opent een eigen Mollie-account; wij koppelen dat. Daarna betalen leden facturen en aankopen in de app.' },
    { done: setup.products_active > 0, title: 'Aanbod in de app aanzetten',
      explain: setup.products_active > 0 ? `${setup.products_active} producten staan aan.` : 'Buggy, greenfees, introductiekaart en weekendrondes staan klaar. De club kijkt de prijzen na en zet ze aan bij App-omzet → Aanbod.' },
    { done: club.active_30d > 0, title: 'Leden gebruiken de app',
      explain: club.active_30d > 0 ? `${club.active_30d} leden boekten of bestelden in de laatste 30 dagen.` : 'De club stuurt leden een uitnodiging via Leden → Uitnodigen voor de app. Ze loggen in met het e-mailadres dat de club van ze heeft.' },
  ];
  const done = steps.filter((s) => s.done).length;
  const message = `Beste beheerder,

${club.name} staat klaar in Greenside.

1. Ga naar ${login} en vul ${setup.manager_email ?? 'je e-mailadres'} in.
2. Je krijgt een code van 6 cijfers per e-mail. Daarmee log je in; een wachtwoord is niet nodig.
3. Ga naar Leden → Importeren en kies het ledenbestand uit jullie huidige systeem (CSV). Je ziet eerst per regel of alles klopt.
4. Vul bij Instellingen het IBAN en het incassant-ID van de club in, en kijk de lidmaatschappen en bedragen na.
5. Stuur leden een uitnodiging voor de app: direct na het importeren, of later via Leden → Uitnodigen voor de app.

Collega's nodig je zelf uit bij Instellingen → Beheerders.

Met vriendelijke groet,
Team Greenside`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-base">
      <header>
        <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#7a5c22]">Greenside HQ · klant inrichten</div>
        <h1 className="mt-1 font-display text-[40px] font-semibold leading-tight tracking-tight text-stone-900">{club.name}</h1>
        <p className="mt-1 text-lg text-stone-600">
          {club.city ? `${club.city} · ` : ''}
          {club.status === 'pilot' ? `Proefperiode${club.pilot_until ? ` tot ${formatDate(club.pilot_until)}` : ''}` : club.status === 'actief' ? 'Betalende klant' : 'Opgezegd'}
          {club.fee_cents ? ` · ${formatEuro(club.fee_cents)} per maand` : ''}
        </p>
      </header>
      {nieuw && <Notice tone="success">De club is aangemaakt. Stuur de beheerder het bericht hieronder; dan kan de overstap beginnen.</Notice>}

      <section className="rounded-2xl border border-stone-200 bg-white" aria-labelledby="stappen">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 px-6 py-4">
          <h2 id="stappen" className="font-display text-2xl font-semibold">Van aanmelding tot gebruik</h2>
          <span className="text-[15px] font-bold text-stone-700">{done} van {steps.length} klaar</span>
        </header>
        <ol>
          {steps.map((s) => (
            <li key={s.title} className="flex gap-4 border-b border-stone-100 px-6 py-4 last:border-0">
              {s.done
                ? <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-brand-600" aria-label="Klaar" />
                : <Circle size={24} className="mt-0.5 shrink-0 text-stone-400" aria-label="Nog te doen" />}
              <div>
                <div className="font-bold text-stone-900">{s.title}</div>
                <p className="text-[15px] text-stone-600">{s.explain}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {!setup.manager_joined && (
        <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6" aria-labelledby="bericht">
          <h2 id="bericht" className="font-display text-2xl font-semibold">Bericht voor de beheerder</h2>
          <p className="text-[15px] text-stone-600">Kopieer deze tekst naar een e-mail aan {setup.manager_email}.</p>
          <label htmlFor="welkom" className="sr-only">Welkomstbericht</label>
          <textarea id="welkom" readOnly rows={16} defaultValue={message} className="w-full font-mono text-sm" />
        </section>
      )}

      <section id="app" className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6" aria-labelledby="app-titel">
        <div>
          <h2 id="app-titel" className="font-display text-2xl font-semibold">App in de winkels</h2>
          <p className="text-[15px] text-stone-600">Zodra de app van de club live is: de links komen als knoppen in de uitnodiging die de club naar leden stuurt.</p>
        </div>
        {links === 'ok' && <Notice tone="success">Downloadlinks opgeslagen.</Notice>}
        {links && links !== 'ok' && <Notice tone="error">{links}</Notice>}
        <form action={saveAppLinks} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="club_id" value={id} />
          <Field label="App Store (iPhone)"><input name="ios_url" type="url" placeholder="https://apps.apple.com/nl/app/…" defaultValue={appLinks?.ios_url ?? ''} /></Field>
          <Field label="Google Play (Android)"><input name="android_url" type="url" placeholder="https://play.google.com/store/apps/details?id=…" defaultValue={appLinks?.android_url ?? ''} /></Field>
          <div className="sm:col-span-2"><Button type="submit">Links opslaan</Button></div>
        </form>
      </section>

      <p><Link href="/hq#klanten" className="font-bold text-brand-700 underline">Terug naar alle klanten</Link></p>
    </div>
  );
}
