import Link from 'next/link';
import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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
    <section className={`overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="font-semibold">{title}</h2>
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
  const toneClass = tone === 'warn' ? 'text-amber-700' : tone === 'good' ? 'text-brand-600' : 'text-stone-900';
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
    </div>
  );
}

const badgeTones = {
  gray: 'bg-stone-100 text-stone-700',
  green: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-800',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-sky-50 text-sky-800',
} as const;

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>{children}</span>;
}

const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50';
const buttonVariants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50',
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
    : 'border-sky-200 bg-sky-50 text-sky-900';
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
