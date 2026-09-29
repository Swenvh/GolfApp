import Link from 'next/link';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Card, Notice, PageHeader, Stat } from '@/components/ui';
import { InviteRunner } from './invite-runner';

export const metadata = { title: 'Leden uitnodigen' };

type Status = { members: number; with_email: number; without_email: number; invited: number; logged_in: number; to_invite: number };

export default async function UitnodigenPage() {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const [{ data }, { data: club }] = await Promise.all([
    supabase.rpc('club_app_status', { p_club: ctx.club.id }).maybeSingle(),
    supabase.from('clubs').select('app_ios_url, app_android_url').eq('id', ctx.club.id).single(),
  ]);
  const s = (data ?? { members: 0, with_email: 0, without_email: 0, invited: 0, logged_in: 0, to_invite: 0 }) as Status;
  const live = !!(club?.app_ios_url || club?.app_android_url);
  const pct = s.members ? Math.round((s.logged_in / s.members) * 100) : 0;

  return (
    <>
      <PageHeader title="Leden uitnodigen" subtitle="Laat leden weten dat de app van de club er is" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Gebruiken de app" value={String(s.logged_in)} hint={`${pct}% van ${s.members} leden`} tone="good" />
        <Stat label="Uitgenodigd" value={String(s.invited)} />
        <Stat label="Nog uit te nodigen" value={String(s.to_invite)} />
        <Stat label="Zonder e-mailadres" value={String(s.without_email)} hint="Kunnen nog niet inloggen" tone={s.without_email ? 'warn' : 'default'} />
      </div>

      {!live && (
        <Notice>
          De app staat nog niet in de App Store en Google Play. Greenside zet de downloadlinks in de uitnodiging zodra de app live is;
          tot die tijd vraagt de e-mail leden om op de naam van de club te zoeken.
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Uitnodiging versturen">
          <div className="p-5">
            <InviteRunner intro="Elk lid met een e-mailadres krijgt één e-mail namens de club. Leden die de app al gebruiken of al een uitnodiging kregen, slaan we over." />
            {s.without_email > 0 && (
              <p className="mt-4 text-sm text-stone-600">
                {s.without_email} {s.without_email === 1 ? 'lid heeft' : 'leden hebben'} geen e-mailadres. Vul het aan in de{' '}
                <Link href="/leden" className="font-bold text-brand-700 underline">ledenlijst</Link> en stuur daarna opnieuw.
              </p>
            )}
          </div>
        </Card>

        <Card title="Zo ziet de e-mail eruit">
          <div className="space-y-3 p-5 text-sm text-stone-700">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brass-text">{ctx.club.name}</div>
            <div className="font-display text-xl font-semibold text-stone-900">Onze eigen app staat klaar.</div>
            <p>Hoi Jan,</p>
            <p>{ctx.club.name} heeft een eigen app. Boek je starttijd, schrijf je in voor wedstrijden, houd je scores bij en regel je lidmaatschap.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Download de app{live ? ' (knoppen naar App Store en Google Play)' : ''}</li>
              <li>Log in met het e-mailadres waarop deze mail binnenkomt</li>
              <li>Vul de code in die je daarna krijgt. Een wachtwoord is niet nodig.</li>
            </ol>
          </div>
        </Card>
      </div>
    </>
  );
}
