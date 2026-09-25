export const CLUB_TIME_ZONE = 'Europe/Amsterdam';

export interface CourseSchedule {
  first_tee_time: string; // "07:30" of "07:30:00"
  last_tee_time: string;
  interval_minutes: number;
}

export interface TeeSlot {
  /** Lokale tijd "HH:MM" */
  time: string;
  /** Tijdstip in UTC (ISO) — zo opgeslagen in tee_bookings.starts_at */
  startsAt: string;
}

/** Alle starttijden van een dag (datum "YYYY-MM-DD", in clubtijd). */
export function generateTeeSlots(day: string, schedule: CourseSchedule, timeZone = CLUB_TIME_ZONE): TeeSlot[] {
  const start = toMinutes(schedule.first_tee_time);
  const end = toMinutes(schedule.last_tee_time);
  const slots: TeeSlot[] = [];
  for (let m = start; m <= end; m += schedule.interval_minutes) {
    const time = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    slots.push({ time, startsAt: zonedToUtc(day, time, timeZone).toISOString() });
  }
  return slots;
}

/** Zet een lokale datum + tijd in een tijdzone om naar een UTC Date (DST-veilig). */
export function zonedToUtc(day: string, time: string, timeZone = CLUB_TIME_ZONE): Date {
  const [y, mo, d] = day.split('-').map(Number) as [number, number, number];
  const [h, mi] = time.split(':').map(Number) as [number, number];
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // Twee iteraties vangen ook dagen met zomer-/wintertijdwissel af
  let utc = guess - offsetMinutes(new Date(guess), timeZone) * 60_000;
  utc = guess - offsetMinutes(new Date(utc), timeZone) * 60_000;
  return new Date(utc);
}

/** Lokale tijd "HH:MM" van een UTC-tijdstip in clubtijd. */
export function localTime(iso: string | Date, timeZone = CLUB_TIME_ZONE): string {
  return new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
    .format(new Date(iso));
}

/** Datum "YYYY-MM-DD" in clubtijd. */
export function localDate(at: Date = new Date(), timeZone = CLUB_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(at);
  return parts;
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function offsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return Math.round((asUtc - at.getTime()) / 60_000);
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
