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

const scopeLabel = { slot: 'Per starttijd', day: 'Per dag', season: 'Per seizoen' } as const;

function ProductFields({ p }: { p?: Product }) {
  const incl = (c: number | null | undefined) => (c == null || !p ? '' : euro(priceInclVat(c, Number(p.vat_rate))));
  return (
    <>
      <div className="md:col-span-3"><Field label="Naam"><input name="name" defaultValue={p?.name} required /></Field></div>
      <div className="md:col-span-2"><Field label="Soort"><CategorySelect value={p?.category} /></Field></div>
      <div className="md:col-span-2"><Field label="Prijs incl. btw"><input name="price" defaultValue={incl(p?.price_cents)} placeholder="0,00" required /></Field></div>
      <div className="md:col-span-2"><Field label="Handicart-tarief" hint="Alleen bij buggy's"><input name="handicart_price" defaultValue={incl(p?.handicart_price_cents)} placeholder="—" /></Field></div>
      <div className="md:col-span-1">
        <Field label="Btw">
          <select name="vat_rate" defaultValue={String(Number(p?.vat_rate ?? 21))}><option value="0">0%</option><option value="9">9%</option><option value="21">21%</option></select>
        </Field>
      </div>
      <div className="md:col-span-1"><Field label="Aantal"><input name="capacity" type="number" min={1} defaultValue={p?.capacity ?? ''} placeholder="∞" /></Field></div>
      <div className="md:col-span-1">
        <Field label="Geteld">
          <select name="capacity_scope" defaultValue={p?.capacity_scope ?? 'day'}>
            {(Object.keys(scopeLabel) as (keyof typeof scopeLabel)[]).map((k) => <option key={k} value={k}>{scopeLabel[k]}</option>)}
          </select>
        </Field>
      </div>
      <div className="md:col-span-8"><Field label="Omschrijving in de app"><input name="description" defaultValue={p?.description ?? ''} /></Field></div>
      <div className="md:col-span-2">
        <Field label="Geeft speelrecht" hint="Introductiekaart of weekend">
          <select name="grants_kind" defaultValue={p?.grants_kind ?? ''}>
            <option value="">Nee</option><option value="intro">Introducés</option><option value="weekend">Weekend spelen</option>
          </select>
        </Field>
      </div>
      <div className="md:col-span-1"><Field label="Keer"><input name="grants_uses" type="number" min={1} defaultValue={p?.grants_uses ?? ''} placeholder="∞" /></Field></div>
      <div className="md:col-span-1"><Field label="Dagen geldig"><input name="grants_days" type="number" min={1} defaultValue={p?.grants_days ?? 365} /></Field></div>
      <div className="md:col-span-12"><Field label="Na bestellen tonen" hint="Bv. waar de sleutel ligt"><input name="pickup_note" defaultValue={p?.pickup_note ?? ''} /></Field></div>
    </>
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
      <PageHeader title="Aanbod in de app" subtitle="Wat leden zelf in de app regelen: reserveren en afrekenen, zonder extra werk aan de balie. Prijzen incl. btw." />
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Opgeslagen. Leden zien het direct in de app.</Notice>}
      <div className="space-y-4">
        {products.map((p) => (
          <Card key={p.id}>
            <form action={saveProduct} className="grid items-end gap-3 p-5 md:grid-cols-12">
              <input type="hidden" name="id" value={p.id} />
              <ProductFields p={p} />
              <label className="flex items-center gap-2 md:col-span-2"><input type="checkbox" name="active" defaultChecked={p.active} /> Zichtbaar in de app</label>
              <p className="text-xs text-stone-500 md:col-span-8">
                Excl. btw {formatEuro(p.price_cents)} · omzetrekening {productCategoryLabel[p.category].toLowerCase()}
                {p.capacity ? ` · ${p.capacity} ${scopeLabel[p.capacity_scope].toLowerCase()}` : ''}
              </p>
              <div className="md:col-span-2"><Button variant="secondary" className="w-full">Opslaan</Button></div>
            </form>
          </Card>
        ))}
        <Card title="Nieuw aanbod">
          <form action={saveProduct} className="grid items-end gap-3 p-5 md:grid-cols-12">
            <ProductFields />
            <div className="md:col-span-10" />
            <div className="md:col-span-2"><Button className="w-full">Toevoegen</Button></div>
          </form>
        </Card>
      </div>
    </>
  );
}
