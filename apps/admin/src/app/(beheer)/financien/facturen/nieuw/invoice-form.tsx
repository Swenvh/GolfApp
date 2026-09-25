'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { formatEuro, invoiceTotals, parseEuro, VAT_RATES, type VatRate } from '@golfapp/shared';
import { Button, Field, Notice } from '@/components/ui';
import { createInvoice, type NewInvoiceLine } from '../../actions';

interface Option { id: string; label: string }

const emptyLine = (): NewInvoiceLine => ({ description: '', quantity: 1, unitPrice: '', vatRate: 0, ledgerAccountId: null });

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function InvoiceForm({ members, accounts, membersWithMandate, defaultMember, paymentTermDays }: {
  members: Option[];
  accounts: Option[];
  membersWithMandate: string[];
  defaultMember?: string;
  paymentTermDays: number;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [memberId, setMemberId] = useState(defaultMember ?? '');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(addDays(today, paymentTermDays));
  const [directDebit, setDirectDebit] = useState(false);
  const [lines, setLines] = useState<NewInvoiceLine[]>([emptyLine()]);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const hasMandate = membersWithMandate.includes(memberId);

  const totals = useMemo(() => invoiceTotals(lines.map((l) => ({
    quantity: Number(l.quantity) || 0, unitPriceCents: parseEuro(l.unitPrice) ?? 0, vatRate: l.vatRate,
  }))), [lines]);

  const update = (i: number, patch: Partial<NewInvoiceLine>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const submit = (finalize: boolean) => startTransition(async () => {
    setError(undefined);
    const res = await createInvoice({ memberId, description, issueDate, dueDate, directDebit: directDebit && hasMandate, lines, finalize });
    if (res.error) setError(res.error);
    if (res.id) router.push(`/financien/facturen/${res.id}`);
  });

  return (
    <div className="space-y-6 p-4">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Lid">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Kies een lid…</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Omschrijving"><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="bv. Lessenpakket voorjaar" /></Field>
        <Field label="Factuurdatum">
          <input type="date" value={issueDate} onChange={(e) => { setIssueDate(e.target.value); setDueDate(addDays(e.target.value, paymentTermDays)); }} />
        </Field>
        <Field label="Vervaldatum"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      </div>
      <label className="flex items-center gap-2 font-normal">
        <input type="checkbox" checked={directDebit && hasMandate} disabled={!hasMandate} onChange={(e) => setDirectDebit(e.target.checked)} />
        Automatisch incasseren {memberId && !hasMandate && <span className="text-stone-500">(lid heeft geen actieve machtiging)</span>}
      </label>

      <div className="overflow-x-auto">
        <table>
          <thead className="bg-stone-50">
            <tr><th className="w-2/5">Omschrijving</th><th>Aantal</th><th>Prijs (excl.)</th><th>BTW</th><th>Grootboek</th><th className="text-right">Bedrag</th><th /></tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const net = Math.round((Number(l.quantity) || 0) * (parseEuro(l.unitPrice) ?? 0));
              return (
                <tr key={i}>
                  <td><input className="w-full" value={l.description} onChange={(e) => update(i, { description: e.target.value })} /></td>
                  <td><input className="w-20" type="number" step="0.01" value={l.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value) })} /></td>
                  <td><input className="w-28" inputMode="decimal" placeholder="0,00" value={l.unitPrice} onChange={(e) => update(i, { unitPrice: e.target.value })} /></td>
                  <td>
                    <select value={l.vatRate} onChange={(e) => update(i, { vatRate: Number(e.target.value) as VatRate })}>
                      {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={l.ledgerAccountId ?? ''} onChange={(e) => update(i, { ledgerAccountId: e.target.value || null })}>
                      <option value="">Standaard</option>
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                  </td>
                  <td className="text-right tabular-nums">{formatEuro(net)}</td>
                  <td>{lines.length > 1 && <button className="text-stone-400 hover:text-red-600" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>✕</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button className="mt-2 text-sm text-brand-600 hover:underline" onClick={() => setLines((ls) => [...ls, emptyLine()])}>+ Regel toevoegen</button>
      </div>

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotaal</span><span className="tabular-nums">{formatEuro(totals.subtotal)}</span></div>
        {[...totals.vatByRate].filter(([r]) => r > 0).map(([rate, cents]) => (
          <div key={rate} className="flex justify-between text-stone-600"><span>BTW {rate}%</span><span className="tabular-nums">{formatEuro(cents)}</span></div>
        ))}
        <div className="flex justify-between border-t pt-1 text-base font-semibold"><span>Totaal</span><span className="tabular-nums">{formatEuro(totals.total)}</span></div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={pending} onClick={() => submit(false)}>Opslaan als concept</Button>
        <Button disabled={pending} onClick={() => submit(true)}>Definitief maken</Button>
      </div>
    </div>
  );
}
