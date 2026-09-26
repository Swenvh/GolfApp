import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formatEuro, isValidIban, normalizeIban, parseEuro, staffRoleLabel, type MembershipType, type StaffRole } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, Field, Notice, PageHeader } from '@/components/ui';
import { str } from '@/lib/format';

export const metadata = { title: 'Instellingen' };

async function saveClub(formData: FormData) {
  'use server';
  const ctx = await requireRole('admin');
  const supabase = await createClient();
  const iban = str(formData.get('iban'));
  if (iban && !isValidIban(iban)) redirect('/instellingen?error=iban');
  const { error } = await supabase.from('clubs').update({
    name: str(formData.get('name')),
    ngf_club_code: str(formData.get('ngf_club_code')),
    email: str(formData.get('email')),
    phone: str(formData.get('phone')),
    website: str(formData.get('website')),
    street: str(formData.get('street')),
    house_number: str(formData.get('house_number')),
    postal_code: str(formData.get('postal_code')),
    city: str(formData.get('city')),
    kvk_number: str(formData.get('kvk_number')),
    vat_number: str(formData.get('vat_number')),
    iban: iban ? normalizeIban(iban) : null,
    bic: str(formData.get('bic')),
    sepa_creditor_id: str(formData.get('sepa_creditor_id')),
    payment_term_days: Number(formData.get('payment_term_days')) || 14,
  }).eq('id', ctx.club.id);
  if (error) redirect(`/instellingen?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/instellingen?saved=1');
}

async function saveMembershipType(formData: FormData) {
  'use server';
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const id = str(formData.get('id'));
  const row = {
    club_id: ctx.club.id,
    name: str(formData.get('name')),
    annual_fee_cents: parseEuro(String(formData.get('annual_fee') ?? '0')) ?? 0,
    entrance_fee_cents: parseEuro(String(formData.get('entrance_fee') ?? '0')) ?? 0,
    can_book_weekend: formData.get('can_book_weekend') === 'on',
    active: formData.get('active') !== null ? formData.get('active') === 'on' : true,
  };
  const { error } = id
    ? await supabase.from('membership_types').update(row).eq('id', id)
    : await supabase.from('membership_types').insert(row);
  if (error) redirect(`/instellingen?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/instellingen');
  redirect('/instellingen?saved=1');
}

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export default async function InstellingenPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const ctx = await requireRole('admin');
  const supabase = await createClient();
  const [{ data: types }, { data: staff }] = await Promise.all([
    supabase.from('membership_types').select('*').eq('club_id', ctx.club.id).order('name'),
    supabase.from('club_staff').select('user_id, role').eq('club_id', ctx.club.id),
  ]);
  const c = ctx.club;

  return (
    <>
      <PageHeader title="Instellingen" subtitle={c.name} />
      {error && <Notice tone="error">{error === 'iban' ? 'Het IBAN is ongeldig.' : error}</Notice>}
      {saved && <Notice tone="success">Opgeslagen.</Notice>}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Clubgegevens">
          <form action={saveClub} className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="Naam"><input name="name" defaultValue={c.name} required /></Field>
            <Field label="NGF-verenigingscode"><input name="ngf_club_code" defaultValue={c.ngf_club_code ?? ''} /></Field>
            <Field label="E-mail"><input name="email" type="email" defaultValue={c.email ?? ''} /></Field>
            <Field label="Telefoon"><input name="phone" defaultValue={c.phone ?? ''} /></Field>
            <Field label="Straat"><input name="street" defaultValue={c.street ?? ''} /></Field>
            <Field label="Huisnummer"><input name="house_number" defaultValue={c.house_number ?? ''} /></Field>
            <Field label="Postcode"><input name="postal_code" defaultValue={c.postal_code ?? ''} /></Field>
            <Field label="Plaats"><input name="city" defaultValue={c.city ?? ''} /></Field>
            <Field label="Website"><input name="website" defaultValue={c.website ?? ''} /></Field>
            <Field label="KvK-nummer"><input name="kvk_number" defaultValue={c.kvk_number ?? ''} /></Field>
            <Field label="BTW-nummer"><input name="vat_number" defaultValue={c.vat_number ?? ''} /></Field>
            <Field label="IBAN"><input name="iban" defaultValue={c.iban ?? ''} /></Field>
            <Field label="BIC"><input name="bic" defaultValue={c.bic ?? ''} /></Field>
            <Field label="Incassant-ID" hint="Aan te vragen bij uw bank"><input name="sepa_creditor_id" defaultValue={c.sepa_creditor_id ?? ''} /></Field>
            <Field label="Betaaltermijn (dagen)"><input name="payment_term_days" type="number" defaultValue={c.payment_term_days} /></Field>
            <div className="sm:col-span-2"><Button type="submit">Opslaan</Button></div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Lidmaatschapsvormen & contributie">
            <div className="divide-y divide-stone-100">
              {((types ?? []) as MembershipType[]).map((t) => (
                <form key={t.id} action={saveMembershipType} className="grid grid-cols-2 items-end gap-3 p-4 sm:grid-cols-5">
                  <input type="hidden" name="id" value={t.id} />
                  <Field label="Naam"><input name="name" defaultValue={t.name} /></Field>
                  <Field label="Contributie/jaar"><input name="annual_fee" defaultValue={euro(t.annual_fee_cents)} /></Field>
                  <Field label="Entreegeld"><input name="entrance_fee" defaultValue={euro(t.entrance_fee_cents)} /></Field>
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="can_book_weekend" defaultChecked={t.can_book_weekend} /> Weekend</label>
                    <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="active" defaultChecked={t.active} /> Actief</label>
                  </div>
                  <Button variant="secondary">Opslaan</Button>
                </form>
              ))}
              <form action={saveMembershipType} className="grid grid-cols-2 items-end gap-3 bg-stone-50/50 p-4 sm:grid-cols-5">
                <Field label="Nieuwe vorm"><input name="name" required placeholder="bv. Gezinslid" /></Field>
                <Field label="Contributie/jaar"><input name="annual_fee" placeholder={formatEuro(0)} /></Field>
                <Field label="Entreegeld"><input name="entrance_fee" placeholder={formatEuro(0)} /></Field>
                <label className="flex items-center gap-2 text-sm font-normal"><input type="checkbox" name="can_book_weekend" defaultChecked /> Weekend</label>
                <Button>Toevoegen</Button>
              </form>
            </div>
          </Card>

          <Card title="Beheerders">
            <table>
              <tbody>
                {(staff ?? []).map((s) => (
                  <tr key={`${s.user_id}-${s.role}`}>
                    <td className="font-mono text-xs">{s.user_id === ctx.userId ? 'jij' : s.user_id.slice(0, 8)}</td>
                    <td>{staffRoleLabel[s.role as StaffRole]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-stone-100 p-4 text-xs text-stone-500">
              Rollen: Beheerder (alles), Penningmeester (financiën), Secretariaat (leden, wedstrijden, nieuws), Marshal (starttijden).
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
