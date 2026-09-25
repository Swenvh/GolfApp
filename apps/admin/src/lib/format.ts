const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Amsterdam' });
const dateTimeFmt = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
});

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  return dateFmt.format(typeof d === 'string' && d.length === 10 ? new Date(`${d}T12:00:00Z`) : new Date(d));
}

export function formatDateTime(d: string | Date): string {
  return dateTimeFmt.format(new Date(d));
}

export function formatHandicap(h: number | null | undefined): string {
  if (h == null) return '—';
  return h < 0 ? `+${Math.abs(h).toFixed(1)}` : Number(h).toFixed(1).replace('.', ',');
}

export function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '' ? null : s;
}

export const invoiceStatusTone = { draft: 'gray', open: 'amber', paid: 'green', cancelled: 'gray' } as const;
