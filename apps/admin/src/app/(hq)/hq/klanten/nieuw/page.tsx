import { Button, Field, Notice } from '@/components/ui';
import { requirePlatformStaff } from '@/lib/hq';
import { createClient } from '@/lib/supabase/server';
import { createClub } from '../actions';

export const metadata = { title: 'Club aanmaken' };

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export default async function NieuweKlant({ searchParams }: { searchParams: Promise<{ prospect?: string; error?: string }> }) {
  await requirePlatformStaff();
  const { prospect: prospectId, error } = await searchParams;
  const supabase = await createClient();
  const { data: p } = prospectId
    ? await supabase.from('hq_prospects').select('*').eq('id', prospectId).maybeSingle()
    : { data: null };
  const members = p?.members_estimate ?? 0;
  const suggestedFee = p?.monthly_value_cents || (members > 1100 ? 59900 : members > 0 && members < 700 ? 24900 : 44900);

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-base">
      <header>
        <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#7a5c22]">Greenside HQ · nieuwe klant</div>
        <h1 className="mt-1 font-display text-[40px] font-semibold leading-tight tracking-tight text-stone-900">Club aanmaken</h1>
        <p className="mt-1 text-lg text-stone-600">
          De club krijgt meteen een werkende inrichting: lidmaatschappen, de baan, het rekenschema en het aanbod in de app (nog uit).
          De beheerder logt daarna in met een code op zijn e-mailadres en importeert de leden.
        </p>
      </header>
      {error && <Notice tone="error">{error}</Notice>}

      <form action={createClub} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
        {p && <input type="hidden" name="prospect_id" value={p.id} />}
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-display text-xl font-semibold">De club</legend>
          <Field label="Naam van de club"><input name="name" required defaultValue={p?.club_name ?? ''} placeholder="Golfclub De Heide" /></Field>
          <Field label="Plaats"><input name="city" defaultValue={p?.city ?? ''} /></Field>
          <Field label="E-mailadres van de club" hint="Voor facturen en berichten aan leden"><input name="email" type="email" placeholder="info@club.nl" /></Field>
          <Field label="Telefoon"><input name="phone" type="tel" /></Field>
          <Field label="Website"><input name="website" type="url" placeholder="https://" /></Field>
          <Field label="Webadres in Greenside" hint="Leeg laten: wordt gemaakt van de naam"><input name="slug" pattern="[a-z0-9-]+" placeholder="golfclub-de-heide" /></Field>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-display text-xl font-semibold">De baan</legend>
          <Field label="Baanindeling" hint="Holes, par en baanwaarden past de club daarna aan">
            <select name="layout" defaultValue={members > 1100 ? '27' : members > 0 && members < 700 ? '9' : '18'}>
              <option value="9">9 holes</option>
              <option value="18">18 holes</option>
              <option value="18+9">18 holes en een par-3 baan</option>
              <option value="27">27 holes (drie lussen van 9)</option>
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 font-display text-xl font-semibold">De afspraak</legend>
          <Field label="Status">
            <select name="status" defaultValue="pilot"><option value="pilot">Proefperiode</option><option value="actief">Betalende klant</option></select>
          </Field>
          <Field label="Proefperiode (dagen)"><input name="pilot_days" type="number" min={14} max={365} defaultValue={90} /></Field>
          <Field label="Licentie per maand (€)" hint="Na de proefperiode"><input name="fee" inputMode="decimal" defaultValue={euro(suggestedFee)} /></Field>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-display text-xl font-semibold">De beheerder</legend>
          <Field label="E-mailadres van de beheerder" hint="Wordt beheerder zodra die inlogt met een code op dit adres">
            <input name="manager_email" type="email" required defaultValue={p?.contact_email ?? ''} />
          </Field>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
          <p className="text-sm text-stone-600">{p ? `De verkoopkans ${p.club_name} gaat naar Gewonnen.` : 'Je kunt de club ook aanmaken vanuit Verkoop.'}</p>
          <Button className="min-h-11">Club aanmaken</Button>
        </div>
      </form>
    </div>
  );
}
