import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formatEuro, parseEuro, type Sponsor } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, Empty, Field, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDate, str } from '@/lib/format';

export const metadata = { title: 'Sponsors' };

async function saveSponsor(formData: FormData) {
  'use server';
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const id = str(formData.get('id'));
  const placement = String(formData.get('placement'));
  const row = {
    club_id: ctx.club.id,
    name: str(formData.get('name')),
    tagline: str(formData.get('tagline')),
    url: str(formData.get('url')),
    placement,
    hole_number: placement === 'scorecard' ? Number(formData.get('hole_number')) || null : null,
    fee_cents: parseEuro(String(formData.get('fee') || '0')) ?? 0,
    valid_until: str(formData.get('valid_until')),
    active: id ? formData.get('active') === 'on' : true,
  };
  const { error } = id
    ? await supabase.from('sponsors').update(row).eq('id', id).eq('club_id', ctx.club.id)
    : await supabase.from('sponsors').insert(row);
  if (error) redirect(`/app-omzet/sponsors?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/app-omzet/sponsors');
  redirect('/app-omzet/sponsors?saved=1');
}

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');

function SponsorFields({ s }: { s?: Sponsor }) {
  return (
    <>
      <div className="md:col-span-3"><Field label="Naam"><input name="name" defaultValue={s?.name} required /></Field></div>
      <div className="md:col-span-4"><Field label="Regel in de app"><input name="tagline" defaultValue={s?.tagline ?? ''} placeholder="bv. Uw makelaar aan de kust" /></Field></div>
      <div className="md:col-span-3"><Field label="Website"><input name="url" type="url" defaultValue={s?.url ?? ''} placeholder="https://" /></Field></div>
      <div className="md:col-span-2">
        <Field label="Plek">
          <select name="placement" defaultValue={s?.placement ?? 'scorecard'}>
            <option value="scorecard">Hole op scorekaart</option>
            <option value="home">Clubhuis (home)</option>
          </select>
        </Field>
      </div>
      <div className="md:col-span-2"><Field label="Hole" hint="Alleen scorekaart"><input name="hole_number" type="number" min={1} max={18} defaultValue={s?.hole_number ?? ''} /></Field></div>
      <div className="md:col-span-2"><Field label="Bedrag per jaar"><input name="fee" defaultValue={s ? euro(Number(s.fee_cents)) : ''} placeholder="0,00" /></Field></div>
      <div className="md:col-span-3"><Field label="Loopt tot"><input name="valid_until" type="date" defaultValue={s?.valid_until ?? ''} /></Field></div>
    </>
  );
}

export default async function Sponsors({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const { data } = await supabase.from('sponsors').select('*').eq('club_id', ctx.club.id)
    .order('placement').order('hole_number', { nullsFirst: true });
  const sponsors = (data ?? []) as Sponsor[];
  const active = sponsors.filter((s) => s.active);
  const yearly = active.reduce((sum, s) => sum + Number(s.fee_cents), 0);
  const clicks = sponsors.reduce((sum, s) => sum + s.clicks, 0);
  const taken = new Set(active.filter((s) => s.placement === 'scorecard').map((s) => s.hole_number));

  return (
    <>
      <PageHeader title="Sponsors" subtitle="Holesponsors op de digitale scorekaart en een partnerplek in het clubhuis van de app." />
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Opgeslagen. Leden zien het direct in de app.</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sponsorinkomsten per jaar" value={formatEuro(yearly).replace(/,\d\d$/, '')} tone="good" />
        <Stat label="Actieve sponsors" value={String(active.length)} />
        <Stat label="Holes nog vrij" value={String(18 - taken.size)} hint="Op de scorekaart van de 18-holesbaan" />
        <Stat label="Kliks uit de app" value={String(clicks)} hint="Laat sponsors zien wat hun plek oplevert" />
      </div>

      <div className="mt-6 space-y-4">
        {sponsors.length === 0 && <Card><Empty>Nog geen sponsors.</Empty></Card>}
        {sponsors.map((s) => (
          <Card key={s.id}>
            <form action={saveSponsor} className="grid items-end gap-3 p-5 md:grid-cols-12">
              <input type="hidden" name="id" value={s.id} />
              <SponsorFields s={s} />
              <label className="flex items-center gap-2 md:col-span-2"><input type="checkbox" name="active" defaultChecked={s.active} /> Actief</label>
              <p className="text-xs text-stone-500 md:col-span-3">
                {s.clicks} {s.clicks === 1 ? 'klik' : 'kliks'}{s.valid_until ? ` · loopt tot ${formatDate(s.valid_until)}` : ''}
              </p>
              <div className="md:col-span-2"><Button variant="secondary" className="w-full">Opslaan</Button></div>
            </form>
          </Card>
        ))}
        <Card title="Nieuwe sponsor">
          <form action={saveSponsor} className="grid items-end gap-3 p-5 md:grid-cols-12">
            <SponsorFields />
            <div className="md:col-span-5" />
            <div className="md:col-span-2"><Button className="w-full">Toevoegen</Button></div>
          </form>
        </Card>
      </div>
    </>
  );
}
