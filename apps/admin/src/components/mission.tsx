import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Info, type LucideIcon } from 'lucide-react';

/** Onderdelen van Mission control: groot, rustig en in gewone taal. */

export type TaskTone = 'urgent' | 'todo' | 'info';

export interface Task {
  key: string;
  tone: TaskTone;
  icon: LucideIcon;
  title: string;
  explain: string;
  href: string;
  cta: string;
}

const toneStyle: Record<TaskTone, { ring: string; badge: string; label: string; Icon: LucideIcon }> = {
  urgent: { ring: 'border-red-200 bg-red-50/60', badge: 'bg-red-100 text-red-800', label: 'Vandaag doen', Icon: AlertTriangle },
  todo: { ring: 'border-brass/40 bg-brass-soft/50', badge: 'bg-brass-soft text-[#6b4f1b]', label: 'Deze week', Icon: Info },
  info: { ring: 'border-stone-200 bg-white', badge: 'bg-stone-100 text-stone-700', label: 'Ter info', Icon: Info },
};

export function StatusBanner({ urgent, todo, name }: { urgent: number; todo: number; name: string }) {
  const calm = urgent === 0 && todo === 0;
  const Icon = calm ? CheckCircle2 : urgent > 0 ? AlertTriangle : Info;
  const text = calm
    ? 'Alles is in orde. Er ligt niets op je te wachten.'
    : `${urgent + todo} ${urgent + todo === 1 ? 'ding vraagt' : 'dingen vragen'} je aandacht${urgent ? `, waarvan ${urgent} vandaag` : ''}.`;
  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-5 md:p-6 ${calm ? 'border-brand-100 bg-brand-50' : urgent ? 'border-red-200 bg-red-50' : 'border-brass/40 bg-brass-soft'}`} role="status">
      <Icon size={30} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${calm ? 'text-brand-600' : urgent ? 'text-red-700' : 'text-[#7a5c22]'}`} aria-hidden />
      <div className="space-y-1">
        <p className="font-display text-2xl font-semibold leading-tight text-stone-900 md:text-[28px]">{text}</p>
        <p className="text-base text-stone-600">
          {calm ? `Hieronder zie je hoe het vandaag gaat bij ${name}.` : 'Hieronder staat per punt wat er aan de hand is en met welke knop je het regelt.'}
        </p>
      </div>
    </div>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-6 text-base text-stone-700">
        <CheckCircle2 size={22} className="text-brand-600" aria-hidden /> Niets te doen. Alles is bijgewerkt.
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {tasks.map((t) => {
        const s = toneStyle[t.tone];
        return (
          <li key={t.key} className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${s.ring}`}>
            <div className="flex flex-1 items-start gap-4">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(11,42,33,0.08)]">
                <t.icon size={22} strokeWidth={1.75} className="text-brand-700" aria-hidden />
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge}`}>
                    <s.Icon size={12} aria-hidden /> {s.label}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">{t.title}</h3>
                </div>
                <p className="max-w-[62ch] text-[15px] leading-relaxed text-stone-700">{t.explain}</p>
              </div>
            </div>
            <Link href={t.href}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass">
              {t.cta} <ArrowRight size={16} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function Section({ title, explain, href, linkLabel, children }: {
  title: string; explain: string; href?: string; linkLabel?: string; children: ReactNode;
}) {
  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[26px] font-semibold leading-tight text-stone-900">{title}</h2>
          <p className="mt-1 max-w-[70ch] text-[15px] text-stone-600">{explain}</p>
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline">
            {linkLabel} <ArrowRight size={16} aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Groot getal met in één zin wat het betekent. */
export function Figure({ label, value, explain, tone = 'default', href }: {
  label: string; value: string; explain: string; tone?: 'default' | 'good' | 'warn'; href?: string;
}) {
  const color = tone === 'good' ? 'text-brand-600' : tone === 'warn' ? 'text-[#8a5a12]' : 'text-stone-900';
  const body = (
    <>
      <div className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-stone-600">{label}</div>
      <div className={`mt-2 font-display text-[36px] font-semibold leading-none tabular-nums ${color}`}>{value}</div>
      <p className="mt-2 text-[15px] leading-snug text-stone-600">{explain}</p>
    </>
  );
  const cls = 'block h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(11,42,33,0.04)]';
  return href
    ? <Link href={href} className={`${cls} transition hover:border-brand-500/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brass`}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

export interface SlotCell { time: string; players: number; past: boolean }

/** De dag van één baan als strook: elk blokje is een starttijd. */
export function TeeStrip({ name, slots, max }: { name: string; slots: SlotCell[]; max: number }) {
  const booked = slots.filter((s) => s.players > 0).length;
  const full = slots.filter((s) => s.players >= max).length;
  const players = slots.reduce((sum, s) => sum + s.players, 0);
  const next = slots.find((s) => !s.past && s.players > 0);
  // Hele uren op de juiste plek onder de strook
  const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const first = slots.length ? mins(slots[0]!.time) : 0;
  const span = slots.length > 1 ? mins(slots[slots.length - 1]!.time) - first : 1;
  const hours: { label: string; left: number }[] = [];
  for (let h = Math.ceil(first / 60); h * 60 <= first + span; h += 2) {
    hours.push({ label: `${String(h).padStart(2, '0')}:00`, left: ((h * 60 - first) / span) * 100 });
  }
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-stone-900">{name}</h3>
        <p className="text-[15px] text-stone-700">
          <strong className="tabular-nums">{booked}</strong> van {slots.length} starttijden geboekt · <strong className="tabular-nums">{players}</strong> spelers
          {full > 0 && <> · {full} vol</>}
        </p>
      </div>
      <div className="mt-4 overflow-x-auto rounded focus-visible:outline-2 focus-visible:outline-brass" tabIndex={0} role="region" aria-label={`Starttijden ${name} vandaag`}>
        <div className="flex min-w-[520px] gap-[3px]" role="img"
          aria-label={`${name}: ${booked} van ${slots.length} starttijden geboekt, ${players} spelers${next ? `, volgende flight om ${next.time}` : ''}`}>
          {slots.map((s) => (
            <div key={s.time} title={`${s.time}: ${s.players ? `${s.players} ${s.players === 1 ? 'speler' : 'spelers'}` : 'vrij'}`}
              className={`h-9 flex-1 rounded-[3px] ${s.players >= max ? 'bg-brand-700' : s.players > 0 ? 'bg-brand-500/60' : 'bg-stone-200'} ${s.past ? 'opacity-35' : ''}`} />
          ))}
        </div>
        <div className="relative mt-1.5 h-4 min-w-[520px] text-xs tabular-nums text-stone-600" aria-hidden>
          {hours.map((h) => (
            <span key={h.label} className="absolute -translate-x-1/2 first:translate-x-0" style={{ left: `${h.left}%` }}>{h.label}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-600">
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-[2px] bg-stone-200" /> Vrij</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-[2px] bg-brand-500/60" /> Deels bezet</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-[2px] bg-brand-700" /> Vol</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-[2px] bg-stone-200 opacity-35" /> Al geweest</span>
        {next && <span className="ml-auto font-semibold text-stone-800">Volgende flight: {next.time}</span>}
      </div>
    </div>
  );
}
