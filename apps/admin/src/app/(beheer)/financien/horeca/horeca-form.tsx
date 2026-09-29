'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { formatEuro, parseEuro } from '@golfapp/shared';
import { Button, Field, Notice } from '@/components/ui';
import { putOnAccount, type HorecaLine } from './actions';

const empty = (): HorecaLine => ({ description: '', amount: '', vatRate: 9 });

export function HorecaForm({ members }: { members: { id: string; label: string }[] }) {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [lines, setLines] = useState<HorecaLine[]>([empty()]);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<string>();
  const [pending, start] = useTransition();
  const total = lines.reduce((s, l) => s + (parseEuro(l.amount) ?? 0), 0);
  const set = (i: number, patch: Partial<HorecaLine>) => setLines(lines.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setDone(undefined);
    start(async () => {
      const res = await putOnAccount(memberId, lines);
      if ('error' in res) return setError(res.error);
      setDone(`${formatEuro(total)} staat op rekening van ${members.find((m) => m.id === memberId)?.label ?? 'het lid'}.`);
      setLines([empty()]);
      setMemberId('');
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice tone="success">{done}</Notice>}
      <Field label="Lid" hint="Typ een paar letters van de naam om te zoeken">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          <option value="">Kies een lid</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </Field>
      <div className="space-y-3">
        {lines.map((l, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_8rem_7rem_auto] sm:items-end">
            <Field label={`Omschrijving${lines.length > 1 ? ` ${i + 1}` : ''}`}>
              <input value={l.description} onChange={(e) => set(i, { description: e.target.value })} placeholder="Bijvoorbeeld: 2× koffie, appeltaart" maxLength={120} required />
            </Field>
            <Field label="Bedrag incl. btw">
              <input value={l.amount} onChange={(e) => set(i, { amount: e.target.value })} inputMode="decimal" placeholder="0,00" required />
            </Field>
            <Field label="Btw">
              <select value={l.vatRate} onChange={(e) => set(i, { vatRate: Number(e.target.value) === 21 ? 21 : 9 })}>
                <option value={9}>9% (eten, frisdrank)</option>
                <option value={21}>21% (alcohol)</option>
              </select>
            </Field>
            {lines.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => setLines(lines.filter((_, k) => k !== i))} aria-label={`Regel ${i + 1} verwijderen`}>Verwijderen</Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setLines([...lines, empty()])}>+ Regel</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <span className="text-lg font-bold tabular-nums">Totaal {formatEuro(total)}</span>
        <Button type="submit" disabled={pending || !memberId || total <= 0}>{pending ? 'Bezig…' : 'Op rekening zetten'}</Button>
      </div>
    </form>
  );
}
