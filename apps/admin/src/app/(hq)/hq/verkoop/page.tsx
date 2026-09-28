import Link from 'next/link';
import { formatEuro, localDate } from '@golfapp/shared';
import { Button, Field, Notice } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { requirePlatformStaff } from '@/lib/hq';
import { stageExplain, stageLabel, stages, type Stage } from '@/lib/pipeline';
import { createClient } from '@/lib/supabase/server';
import { saveProspect } from './actions';

export const metadata = { title: 'Verkoop' };

type Prospect = {
  id: string; club_name: string; city: string | null; members_estimate: number | null; stage: Stage; monthly_value_cents: number;
  contact_name: string | null; contact_email: string | null; next_step: string | null; next_date: string | null; notes: string | null;
  club_id: string | null;
};

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');

function ProspectFields({ p }: { p?: Prospect }) {
  return (
    <>
      <div className="md:col-span-4"><Field label="Club"><input name="club_name" defaultValue={p?.club_name} required /></Field></div>
      <div className="md:col-span-3"><Field label="Plaats"><input name="city" defaultValue={p?.city ?? ''} /></Field></div>
      <div className="md:col-span-2"><Field label="Aantal leden"><input name="members_estimate" type="number" min={0} defaultValue={p?.members_estimate ?? ''} /></Field></div>
      <div className="md:col-span-3">
        <Field label="Fase">
          <select name="stage" defaultValue={p?.stage ?? 'lead'}>
            {stages.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
          </select>
        </Field>
      </div>
      <div className="md:col-span-3"><Field label="Contactpersoon"><input name="contact_name" defaultValue={p?.contact_name ?? ''} /></Field></div>
      <div className="md:col-span-3"><Field label="E-mail"><input name="contact_email" type="email" defaultValue={p?.contact_email ?? ''} /></Field></div>
      <div className="md:col-span-2"><Field label="Waarde per maand"><input name="monthly_value" defaultValue={p ? euro(Number(p.monthly_value_cents)) : '399,00'} /></Field></div>
      <div className="md:col-span-4"><Field label="Volgende stap"><input name="next_step" defaultValue={p?.next_step ?? ''} placeholder="bv. Demo aan bestuur geven" /></Field></div>
      <div className="md:col-span-3"><Field label="Wanneer"><input name="next_date" type="date" defaultValue={p?.next_date ?? ''} /></Field></div>
      <div className="md:col-span-9"><Field label="Aantekeningen"><input name="notes" defaultValue={p?.notes ?? ''} /></Field></div>
    </>
  );
}

export default async function Verkoop({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  await requirePlatformStaff();
  const supabase = await createClient();
  const { data } = await supabase.from('hq_prospects').select('*').order('next_date', { nullsFirst: false });
  const prospects = (data ?? []) as Prospect[];
  const today = localDate();

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-base">
      <header>
        <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#7a5c22]">Greenside HQ</div>
        <h1 className="mt-1 font-display text-[40px] font-semibold leading-tight tracking-tight text-stone-900">Verkoop</h1>
        <p className="mt-1 max-w-[70ch] text-lg text-stone-600">
          Alle clubs waarmee we in gesprek zijn. Zet bij elke club een volgende stap met een datum: die verschijnt dan vanzelf in Mission control.
        </p>
      </header>
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Opgeslagen.</Notice>}

      {stages.map((st) => {
        const list = prospects.filter((p) => p.stage === st);
        return (
          <section key={st} id={st} className="scroll-mt-6 space-y-3" aria-label={stageLabel[st]}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[26px] font-semibold">{stageLabel[st]} <span className="text-stone-500">({list.length})</span></h2>
              <span className="text-[15px] text-stone-600">{formatEuro(list.reduce((s, p) => s + Number(p.monthly_value_cents), 0))} per maand</span>
            </div>
            <p className="text-[15px] text-stone-600">{stageExplain[st]}</p>
            {list.length === 0 && <p className="rounded-2xl border border-dashed border-stone-300 p-4 text-[15px] text-stone-600">Geen clubs in deze fase.</p>}
            {list.map((p) => (
              <details key={p.id} className="group rounded-2xl border border-stone-200 bg-white">
                <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4">
                  <span>
                    <strong className="text-lg">{p.club_name}</strong>
                    <span className="text-stone-600">{p.city ? ` · ${p.city}` : ''}{p.members_estimate ? ` · ${p.members_estimate} leden` : ''}</span>
                  </span>
                  <span className="text-[15px]">
                    {p.next_step && <>{p.next_step} · </>}
                    {p.next_date && <span className={p.next_date < today ? 'font-bold text-red-700' : 'text-stone-600'}>{p.next_date < today ? 'te laat, ' : ''}{formatDate(p.next_date)}</span>}
                    <span className="ml-3 font-bold text-brand-600 group-open:hidden">Bewerken</span>
                  </span>
                </summary>
                {(p.club_id || p.stage === 'proefperiode' || p.stage === 'gewonnen') && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-brand-50/50 px-5 py-3 text-[15px]">
                    <span>{p.club_id ? 'Deze club staat in Greenside.' : 'Klaar om te starten? Maak de club aan; de beheerder kan dan meteen inloggen.'}</span>
                    <Link href={p.club_id ? `/hq/klanten/${p.club_id}` : `/hq/klanten/nieuw?prospect=${p.id}`}
                      className="inline-flex min-h-11 items-center rounded-full bg-brand-600 px-4 font-bold text-white hover:bg-brand-700">
                      {p.club_id ? 'Inrichting bekijken' : 'Club aanmaken'}
                    </Link>
                  </div>
                )}
                <form action={saveProspect} className="grid items-end gap-3 border-t border-stone-200 p-5 md:grid-cols-12">
                  <input type="hidden" name="id" value={p.id} />
                  <ProspectFields p={p} />
                  <div className="md:col-span-3"><Button className="min-h-11 w-full">Opslaan</Button></div>
                </form>
              </details>
            ))}
          </section>
        );
      })}

      <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5" aria-label="Nieuwe club">
        <h2 className="font-display text-[26px] font-semibold">Nieuwe club toevoegen</h2>
        <form action={saveProspect} className="grid items-end gap-3 md:grid-cols-12">
          <ProspectFields />
          <div className="md:col-span-3"><Button className="min-h-11 w-full">Toevoegen</Button></div>
        </form>
      </section>
    </div>
  );
}
