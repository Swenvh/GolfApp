import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[34px] leading-tight font-semibold tracking-tight text-stone-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = '' }: {
  title?: string; actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(11,42,33,0.04),0_12px_32px_-20px_rgba(11,42,33,0.25)] ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone = 'default' }: {
  label: string; value: string; hint?: string; tone?: 'default' | 'warn' | 'good';
}) {
  const toneClass = tone === 'warn' ? 'text-[#9a6b12]' : tone === 'good' ? 'text-brand-600' : 'text-stone-900';
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(11,42,33,0.04)]">
      <div className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-stone-500">{label}</div>
      <div className={`mt-2 font-display text-[30px] leading-none font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
    </div>
  );
}

const badgeTones = {
  gray: 'bg-stone-100 text-stone-700',
  green: 'bg-brand-50 text-brand-700',
  amber: 'bg-brass-soft text-[#7a5c22]',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-stone-100 text-brand-700',
} as const;

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>{children}</span>;
}

const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';
const buttonVariants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-stone-300 bg-white text-brand-700 hover:bg-brand-50',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
} as const;

export function Button({ variant = 'primary', className = '', ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return <button className={`${buttonBase} ${buttonVariants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ href, variant = 'primary', children }: {
  href: string; variant?: keyof typeof buttonVariants; children: ReactNode;
}) {
  return <Link href={href} className={`${buttonBase} ${buttonVariants[variant]}`}>{children}</Link>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label>{label}</label>
      {children}
      {hint && <span className="text-xs text-stone-500">{hint}</span>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-stone-500">{children}</div>;
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const cls = tone === 'error' ? 'border-red-200 bg-red-50 text-red-800'
    : tone === 'success' ? 'border-brand-100 bg-brand-50 text-brand-700'
    : 'border-brass/30 bg-brass-soft text-[#5f4818]';
  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
