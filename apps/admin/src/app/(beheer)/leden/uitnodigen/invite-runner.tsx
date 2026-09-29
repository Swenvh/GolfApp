'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Notice } from '@/components/ui';
import { pendingInvites, sendInvites, type InviteResult } from './actions';

const BATCH = 50;
type Totals = Omit<InviteResult, 'error'>;
const empty: Totals = { sent: 0, existing: 0, no_email: 0, already: 0, failed: 0 };

/** Verstuurt uitnodigingen in porties van 50, met voortgang. Opnieuw starten gaat verder waar het stopte. */
export function InviteRunner({ intro }: { intro?: string }) {
  const router = useRouter();
  const [ids, setIds] = useState<string[] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { pendingInvites().then(setIds).catch(() => setIds([])); }, []);

  async function run() {
    if (!ids?.length) return;
    setConfirming(false);
    setRunning(true);
    setError(null);
    const sum = { ...empty };
    for (let i = 0; i < ids.length; i += BATCH) {
      const res = await sendInvites(ids.slice(i, i + BATCH));
      if ('error' in res && !('sent' in res)) { setError(res.error); break; }
      const r = res as InviteResult;
      for (const k of Object.keys(empty) as (keyof Totals)[]) sum[k] += r[k];
      setDone(Math.min(i + BATCH, ids.length));
      setTotals({ ...sum });
      if (r.error) { setError('De mailserver neemt even geen berichten meer aan. Start later opnieuw; wie al een uitnodiging kreeg, krijgt er geen tweede.'); break; }
    }
    setRunning(false);
    setIds(await pendingInvites().catch(() => []));
    router.refresh();
  }

  if (ids === null) return <p className="text-sm text-stone-500">Leden tellen…</p>;
  const count = ids.length;

  return (
    <div className="space-y-4">
      {intro && <p className="text-[15px] text-stone-700">{intro}</p>}
      {error && <Notice tone="error">{error}</Notice>}
      {totals && !running && (
        <Notice tone="success">
          {totals.sent} {totals.sent === 1 ? 'uitnodiging' : 'uitnodigingen'} verstuurd.
          {totals.existing > 0 && ` ${totals.existing} ${totals.existing === 1 ? 'lid had' : 'leden hadden'} al een account en kunnen direct inloggen.`}
        </Notice>
      )}
      {running && (
        <div role="status" aria-live="polite" className="space-y-2">
          <div className="text-sm font-bold text-stone-700">Uitnodigingen versturen… {done} van {count}</div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${count ? (done / count) * 100 : 0}%` }} />
          </div>
        </div>
      )}
      {!running && count === 0 && !totals && (
        <p className="text-sm text-stone-600">Alle leden met een e-mailadres hebben een uitnodiging gehad of gebruiken de app al.</p>
      )}
      {!running && count > 0 && (confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-stone-700">{count} {count === 1 ? 'lid krijgt' : 'leden krijgen'} nu een e-mail namens de club.</span>
          <Button onClick={run}>Ja, versturen</Button>
          <Button variant="secondary" onClick={() => setConfirming(false)}>Annuleren</Button>
        </div>
      ) : (
        <Button onClick={() => setConfirming(true)}>Stuur uitnodiging naar {count} {count === 1 ? 'lid' : 'leden'}</Button>
      ))}
    </div>
  );
}
