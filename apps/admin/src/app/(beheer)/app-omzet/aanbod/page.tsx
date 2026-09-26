import { formatEuro, priceInclVat, productCategoryLabel, type Product, type ProductCategory } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Button, Card, Field, Notice, PageHeader } from '@/components/ui';
import { saveProduct } from '../actions';

export const metadata = { title: 'Aanbod in de app' };

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');

function CategorySelect({ value }: { value?: ProductCategory }) {
  return (
    <select name="category" defaultValue={value ?? 'rental'}>
      {(Object.keys(productCategoryLabel) as ProductCategory[]).map((c) => <option key={c} value={c}>{productCategoryLabel[c]}</option>)}
    </select>
  );
}

export default async function Aanbod({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').eq('club_id', ctx.club.id).order('sort');
  const products = (data ?? []) as Product[];

  return (
    <>
      <PageHeader title="Aanbod in de app" subtitle="Wat leden bij hun ronde, na afloop of in de proshop kunnen bestellen. Prijzen zoals het lid ze ziet, incl. btw." />
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Opgeslagen. Leden zien het direct in de app.</Notice>}
      <div className="space-y-4">
        {products.map((p) => (
          <Card key={p.id}>
            <form action={saveProduct} className="grid items-end gap-3 p-5 md:grid-cols-12">
              <input type="hidden" name="id" value={p.id} />
              <div className="md:col-span-3"><Field label="Naam"><input name="name" defaultValue={p.name} required /></Field></div>
              <div className="md:col-span-2"><Field label="Soort"><CategorySelect value={p.category} /></Field></div>
              <div className="md:col-span-1"><Field label="Prijs"><input name="price" defaultValue={euro(priceInclVat(p.price_cents, Number(p.vat_rate)))} /></Field></div>
              <div className="md:col-span-1">
                <Field label="Btw">
                  <select name="vat_rate" defaultValue={String(Number(p.vat_rate))}><option value="0">0%</option><option value="9">9%</option><option value="21">21%</option></select>
                </Field>
              </div>
              <div className="md:col-span-1"><Field label="Per dag" hint="Leeg = onbeperkt"><input name="daily_capacity" type="number" min={1} defaultValue={p.daily_capacity ?? ''} /></Field></div>
              <div className="md:col-span-2"><Field label="Icoon (app)"><input name="icon" defaultValue={p.icon ?? ''} /></Field></div>
              <label className="flex items-center gap-2 md:col-span-1"><input type="checkbox" name="active" defaultChecked={p.active} /> Actief</label>
              <div className="md:col-span-1"><Button variant="secondary" className="w-full">Opslaan</Button></div>
              <div className="md:col-span-12">
                <Field label="Omschrijving in de app"><input name="description" defaultValue={p.description ?? ''} /></Field>
              </div>
              <p className="text-xs text-stone-500 md:col-span-12">Excl. btw {formatEuro(p.price_cents)} · geboekt op de omzetrekening van {productCategoryLabel[p.category].toLowerCase()}.</p>
            </form>
          </Card>
        ))}
        <Card title="Nieuw aanbod">
          <form action={saveProduct} className="grid items-end gap-3 p-5 md:grid-cols-12">
            <div className="md:col-span-3"><Field label="Naam"><input name="name" required placeholder="bv. Pitch & putt-kaart" /></Field></div>
            <div className="md:col-span-2"><Field label="Soort"><CategorySelect /></Field></div>
            <div className="md:col-span-2"><Field label="Prijs incl. btw"><input name="price" placeholder="0,00" required /></Field></div>
            <div className="md:col-span-1">
              <Field label="Btw"><select name="vat_rate" defaultValue="21"><option value="0">0%</option><option value="9">9%</option><option value="21">21%</option></select></Field>
            </div>
            <div className="md:col-span-2"><Field label="Per dag"><input name="daily_capacity" type="number" min={1} /></Field></div>
            <div className="md:col-span-2"><Button className="w-full">Toevoegen</Button></div>
            <div className="md:col-span-12"><Field label="Omschrijving in de app"><input name="description" /></Field></div>
          </form>
        </Card>
      </div>
    </>
  );
}
