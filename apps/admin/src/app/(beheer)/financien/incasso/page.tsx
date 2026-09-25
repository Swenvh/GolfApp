import { addDays, formatEuro, localDate, type DirectDebitBatch } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, ButtonLink, Card, Empty, Field, Notice, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { createDebitBatch, deleteDebitBatch, processDebitBatch } from '../actions';

export const metadata = { title: 'Incasso' };

const statusLabel = { draft: 'Concept', exported: 'Geëxporteerd', processed: 'Verwerkt' } as const;

export default async function IncassoPage({ searchParams }: {
  searchParams: Promise<{ error?: string; created?: string; processed?: string }>;
}) {
  const { error, created, processed } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const [{ data }, { data: pending }] = await Promise.all([
    supabase.from('direct_debit_batches').select('*').eq('club_id', ctx.club.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('total_cents, paid_cents').eq('club_id', ctx.club.id)
      .eq('status', 'open').eq('collect_by_direct_debit', true),
  ]);
  const batches = (data ?? []) as DirectDebitBatch[];
  const pendingTotal = (pending ?? []).reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  const missingSetup = !ctx.club.iban || !ctx.club.sepa_creditor_id;

  return (
    <>
      <PageHeader title="SEPA-incasso" subtitle="Maak incassobestanden (pain.008) voor upload bij de bank" />
      {missingSetup && (
        <Notice tone="error">
          Vul eerst het IBAN en het incassant-ID van de club in bij <a className="underline" href="/instellingen">Instellingen</a>.
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {created && <Notice tone="success">Incassobatch aangemaakt met {created} posten.</Notice>}
      {processed && <Notice tone="success">Batch verwerkt: betalingen zijn geboekt.</Notice>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Nieuwe incassobatch">
          <form action={createDebitBatch} className="space-y-3 p-4 text-sm">
            <p className="text-stone-600">
              {pending?.length ?? 0} openstaande facturen met incasso ({formatEuro(pendingTotal)}). Facturen die al in een
              lopende batch zitten worden overgeslagen.
            </p>
            <Field label="Incassodatum" hint="Minimaal 1 werkdag na aanlevering bij de bank (CORE)">
              <input type="date" name="collection_date" defaultValue={addDays(localDate(), 7)} min={addDays(localDate(), 1)} required />
            </Field>
            <Button type="submit" disabled={missingSetup}>Batch aanmaken</Button>
          </form>
        </Card>

        <Card title="Batches" className="lg:col-span-2">
          {batches.length === 0 ? <Empty>Nog geen incassobatches.</Empty> : (
            <table>
              <thead className="bg-stone-50"><tr><th>Incassodatum</th><th>Posten</th><th className="text-right">Bedrag</th><th>Status</th><th /></tr></thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td>{formatDate(b.collection_date)}</td>
                    <td>{b.item_count}</td>
                    <td className="text-right tabular-nums">{formatEuro(b.total_cents)}</td>
                    <td><Badge tone={b.status === 'processed' ? 'green' : b.status === 'exported' ? 'blue' : 'gray'}>{statusLabel[b.status]}</Badge></td>
                    <td className="space-x-2 whitespace-nowrap text-right">
                      {b.item_count > 0 && <ButtonLink variant="secondary" href={`/financien/incasso/${b.id}/xml`}>Download XML</ButtonLink>}
                      {b.status === 'exported' && (
                        <form action={processDebitBatch} className="inline">
                          <input type="hidden" name="batch_id" value={b.id} />
                          <Button title="Na bevestiging door de bank: betalingen boeken">Markeer verwerkt</Button>
                        </form>
                      )}
                      {b.status !== 'processed' && (
                        <form action={deleteDebitBatch} className="inline">
                          <input type="hidden" name="batch_id" value={b.id} />
                          <Button variant="danger">Verwijder</Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="border-t border-stone-100 p-4 text-xs text-stone-500">
            Werkwijze: download het XML-bestand → upload in internetbankieren (ABN AMRO, ING, Rabobank) → na uitvoering
            &ldquo;Markeer verwerkt&rdquo; om de betalingen in de administratie te boeken. Stornering? Registreer een
            negatieve betaling op de betreffende factuur.
          </p>
        </Card>
      </div>
    </>
  );
}
