const tz = 'Europe/Amsterdam';

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  const date = typeof d === 'string' && d.length === 10 ? new Date(`${d}T12:00:00Z`) : new Date(d);
  return new Intl.DateTimeFormat('nl-NL', { ...opts, timeZone: tz }).format(date);
}

/** Eerste letter hoofdletter: 'zaterdag 26 september' → 'Zaterdag 26 september'. */
export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDateTime(d: string | Date) {
  return formatDate(d, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatHandicap(h: number | null | undefined) {
  if (h == null) return '—';
  return h < 0 ? `+${Math.abs(h).toFixed(1).replace('.', ',')}` : Number(h).toFixed(1).replace('.', ',');
}

/** Leeftijd op basis van geboortedatum (onbekend = volwassen). */
export function age(dob: string | null): number {
  if (!dob) return 30;
  const d = new Date(dob);
  const now = new Date();
  return now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}
