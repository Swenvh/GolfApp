import { formatDate } from '@/lib/format';

/** Eén reeks per week als staafjes; de laatste week is donker. Tooltip per staaf en een tekstversie voor schermlezers. */
export function WeekBars({ title, weeks, format }: {
  title: string;
  weeks: { start: string; value: number }[];
  format: (v: number) => string;
}) {
  const max = Math.max(1, ...weeks.map((w) => w.value));
  const last = weeks.length - 1;
  return (
    <figure className="rounded-2xl border border-stone-200 bg-white p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-lg font-bold text-stone-900">{title}</span>
        <span className="text-[15px] text-stone-600">Deze week: <strong className="tabular-nums text-stone-900">{format(weeks[last]?.value ?? 0)}</strong></span>
      </figcaption>
      <div className="mt-4 flex h-40 items-end gap-[2px]" aria-hidden>
        {weeks.map((w, i) => (
          <div key={w.start} className="group relative flex h-full flex-1 items-end">
            <div
              title={`Week van ${formatDate(w.start)}: ${format(w.value)}`}
              className={`w-full rounded-t-[4px] ${i === last ? 'bg-brand-700' : 'bg-brand-500/55 group-hover:bg-brand-600'}`}
              style={{ height: `${Math.max(2, (w.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-xs tabular-nums text-stone-600" aria-hidden>
        <span>{formatDate(weeks[0]?.start).replace(/ \d{4}$/, '')}</span>
        <span>deze week</span>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>{weeks.map((w) => <tr key={w.start}><th scope="row">Week van {formatDate(w.start)}</th><td>{format(w.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
