'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { importFields, importPayload, parseMemberImport, type ImportParseResult } from '@golfapp/shared';
import { Badge, Button, ButtonLink, Card, Notice, Stat } from '@/components/ui';
import { importMembers, type ImportResult } from './actions';
import { InviteRunner } from '../uitnodigen/invite-runner';

/** Bestanden uit oudere systemen zijn vaak Windows-1252 in plaats van UTF-8 (é, ë, ï). */
async function readText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('windows-1252').decode(buf);
  }
}

const fieldLabel = Object.fromEntries(importFields.map((f) => [f.key, f.label]));
type Filter = 'alle' | 'fouten' | 'waarschuwingen';

export function ImportWizard({ types }: { types: string[] }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ImportParseResult | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [createTypes, setCreateTypes] = useState(false);
  const [filter, setFilter] = useState<Filter>('alle');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const known = useMemo(() => new Set(types.map((t) => t.toLowerCase())), [types]);
  const rows = parsed?.rows ?? [];
  const withErrors = rows.filter((r) => r.errors.length > 0);
  const withWarnings = rows.filter((r) => r.errors.length === 0 && r.warnings.length > 0);
  const ready = rows.length - withErrors.length;
  const unknownTypes = [...new Set(rows.filter((r) => r.errors.length === 0).map((r) => r.values.membership_type).filter((t): t is string => !!t && !known.has(t.toLowerCase())))];
  const blockedByTypes = unknownTypes.length > 0 && !createTypes;
  const shown = (filter === 'fouten' ? withErrors : filter === 'waarschuwingen' ? withWarnings : rows).slice(0, 300);

  async function onFile(file: File | undefined) {
    setResult(null); setError(null); setFilter('alle');
    if (!file) return;
    setFileName(file.name);
    setParsed(parseMemberImport(await readText(file)));
  }

  function onImport() {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      const res = await importMembers(importPayload(parsed.rows), { updateExisting, createTypes });
      if (res.ok) { setResult(res.result); setParsed(null); setFileName(null); }
      else setError(res.error);
    });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Notice tone="success">
          Klaar. {result.inserted} nieuwe {result.inserted === 1 ? 'lid' : 'leden'}
          {result.updated > 0 && `, ${result.updated} bijgewerkt`}
          {result.skipped > 0 && `, ${result.skipped} overgeslagen (lidnummer bestond al)`}
          {result.mandates > 0 && `, ${result.mandates} ${result.mandates === 1 ? 'machtiging' : 'machtigingen'} voor incasso`}.
        </Notice>
        {result.types_created.length > 0 && (
          <Notice>
            Nieuwe lidmaatschappen aangemaakt: <strong>{result.types_created.join(', ')}</strong>. De contributie staat nog op € 0;
            vul die in bij <Link href="/instellingen" className="font-bold underline">Instellingen</Link> voordat je contributiefacturen maakt.
          </Notice>
        )}
        <Card title="Leden uitnodigen voor de app">
          <div className="p-5">
            <InviteRunner intro="Stuur de leden nu een e-mail namens de club: download de app, log in met dit e-mailadres en vul de code in. Liever eerst controleren? Dat kan later via Leden → Uitnodigen voor de app." />
          </div>
        </Card>
        <Card title="Wat nu?">
          <ol className="list-decimal space-y-2 p-5 pl-10 text-[15px] text-stone-700">
            <li>Controleer een paar leden in de <Link href="/leden" className="font-bold text-brand-700 underline">ledenlijst</Link>.</li>
            <li>Leden zonder e-mailadres kunnen nog niet inloggen. Vul hun adres aan bij het lid en stuur daarna een uitnodiging.</li>
          </ol>
        </Card>
        <div className="flex gap-2">
          <ButtonLink href="/leden">Naar de ledenlijst</ButtonLink>
          <Button variant="secondary" onClick={() => setResult(null)}>Nog een bestand importeren</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="1. Kies het bestand">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_1fr]">
          <div className="space-y-3 text-[15px] text-stone-700">
            <p>Exporteer de leden uit je huidige systeem (E-Golf4U, Nexxchange, IntoGolf of Excel) als <strong>CSV-bestand</strong>. De kolommen worden op naam herkend.</p>
            <p>Een lid met een lidnummer dat al bestaat, wordt bijgewerkt. Er wordt niets gewist.</p>
            <p><a href="/leden/importeren/voorbeeld" className="font-bold text-brand-700 underline">Download het voorbeeldbestand</a> als je zelf een lijst maakt.</p>
          </div>
          <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
            className="flex min-h-40 cursor-pointer flex-col normal-case tracking-normal items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center hover:border-brand-600 hover:bg-brand-50 focus-within:border-brand-600">
            <span className="font-display text-lg font-semibold text-stone-900">{fileName ?? 'Kies een CSV-bestand'}</span>
            <span className="text-sm text-stone-500">{fileName ? 'Klik om een ander bestand te kiezen' : 'Of sleep het bestand hierheen'}</span>
            <input type="file" accept=".csv,.txt,text/csv" className="sr-only" aria-label="CSV-bestand met leden"
              onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
      </Card>

      {parsed?.error && <Notice tone="error">{parsed.error}</Notice>}

      {parsed && !parsed.error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Klaar om te importeren" value={String(ready)} tone="good" hint={`van ${rows.length} regels`} />
            <Stat label="Met een fout" value={String(withErrors.length)} tone={withErrors.length ? 'warn' : 'default'}
              hint={withErrors.length ? 'Deze regels worden overgeslagen' : 'Geen fouten gevonden'} />
            <Stat label="Met een opmerking" value={String(withWarnings.length)} hint="Worden wel geïmporteerd" />
          </div>

          <Card title="2. Controleer">
            <div className="space-y-4 p-5">
              <div>
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-stone-500">Herkende kolommen</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {parsed.columns.map((c) => <Badge key={c.header} tone="green">{c.header} → {fieldLabel[c.field]}</Badge>)}
                </div>
                {parsed.ignored.length > 0 && (
                  <p className="mt-2 text-sm text-stone-500">Niet gebruikt: {parsed.ignored.join(', ')}</p>
                )}
              </div>

              {unknownTypes.length > 0 && (
                <div className="rounded-xl border border-brass/40 bg-brass-soft/60 p-4 text-sm text-brass-deep">
                  <p>
                    Deze lidmaatschappen bestaan nog niet bij de club: <strong>{unknownTypes.join(', ')}</strong>.
                    Maak ze aan, of pas de namen in het bestand aan zodat ze overeenkomen met{' '}
                    {types.length ? types.join(', ') : 'de lidmaatschappen in Instellingen'}.
                  </p>
                  <label className="mt-3 flex min-h-11 items-center gap-2 font-bold">
                    <input type="checkbox" checked={createTypes} onChange={(e) => setCreateTypes(e.target.checked)} />
                    Maak ontbrekende lidmaatschappen aan (contributie vul je daarna in)
                  </label>
                </div>
              )}

              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />
                Bestaande leden bijwerken als het lidnummer al bestaat
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-stone-100 px-5 py-3" role="group" aria-label="Toon regels">
              {([['alle', `Alle regels (${rows.length})`], ['fouten', `Fouten (${withErrors.length})`], ['waarschuwingen', `Opmerkingen (${withWarnings.length})`]] as [Filter, string][]).map(([f, label]) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                  className={`min-h-11 rounded-full px-4 text-sm font-bold ${filter === f ? 'bg-brand-600 text-white' : 'border border-stone-300 text-brand-700 hover:bg-brand-50'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Regels uit het bestand">
              <table>
                <thead>
                  <tr><th>Regel</th><th>Lidnr.</th><th>Naam</th><th>E-mail</th><th>Lidmaatschap</th><th>Controle</th></tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.line} className={r.errors.length ? 'bg-red-50/60' : ''}>
                      <td className="tabular-nums text-stone-500">{r.line}</td>
                      <td className="tabular-nums">{r.values.member_number ?? <span className="text-stone-500">nieuw</span>}</td>
                      <td>{[r.values.first_name, r.values.infix, r.values.last_name].filter(Boolean).join(' ')}</td>
                      <td>{r.values.email ?? '—'}</td>
                      <td>{r.values.membership_type ?? '—'}</td>
                      <td className="text-sm">
                        {r.errors.length === 0 && r.warnings.length === 0 && <Badge tone="green">In orde</Badge>}
                        {r.errors.map((e) => <div key={e} className="text-red-700">✕ {e}</div>)}
                        {r.warnings.map((w) => <div key={w} className="text-brass-ink">! {w}</div>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(filter === 'alle' ? rows.length : filter === 'fouten' ? withErrors.length : withWarnings.length) > shown.length && (
                <p className="px-5 py-3 text-sm text-stone-500">De eerste {shown.length} regels worden getoond.</p>
              )}
            </div>
          </Card>

          <Card title="3. Importeer">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <p className="max-w-xl text-[15px] text-stone-700">
                {ready === 0 ? 'Er zijn geen regels zonder fouten. Pas het bestand aan en kies het opnieuw.'
                  : blockedByTypes ? 'Maak eerst de ontbrekende lidmaatschappen aan (vinkje hierboven) of pas het bestand aan.'
                  : `${ready} ${ready === 1 ? 'lid wordt' : 'leden worden'} in één keer geïmporteerd.${withErrors.length ? ` De ${withErrors.length} regels met een fout worden overgeslagen.` : ''} Gaat er iets mis, dan wordt niets opgeslagen.`}
              </p>
              <Button onClick={onImport} disabled={pending || ready === 0 || blockedByTypes} className="min-h-11">
                {pending ? 'Bezig met importeren…' : `Importeer ${ready} ${ready === 1 ? 'lid' : 'leden'}`}
              </Button>
            </div>
            {error && <div className="px-5 pb-5"><Notice tone="error">Er is niets geïmporteerd. {error}</Notice></div>}
          </Card>
        </>
      )}
    </div>
  );
}
