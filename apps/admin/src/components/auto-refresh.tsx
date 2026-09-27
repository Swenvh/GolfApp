'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

const fmt = new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });

/** Ververst Mission control elke minuut, zodat het ook op een scherm in het secretariaat kan staan. */
export function AutoRefresh({ everySeconds = 60 }: { everySeconds?: number }) {
  const router = useRouter();
  const [at, setAt] = useState(() => fmt.format(new Date()));
  const [pending, start] = useTransition();

  const refresh = () => start(() => { router.refresh(); setAt(fmt.format(new Date())); });

  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, everySeconds * 1000);
    return () => clearInterval(id);
  }, [everySeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center gap-3 text-sm text-stone-600">
      <span aria-live="polite">Bijgewerkt om {at}</span>
      <button type="button" onClick={refresh} disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-60">
        <RefreshCw size={15} className={pending ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden /> Nu bijwerken
      </button>
    </div>
  );
}
