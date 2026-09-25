import Link from 'next/link';
import { addDays, generateTeeSlots, localDate, localTime, type Course, type TeeSheetRow } from '@golfapp/shared';
import { getStaffContext } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Card, Empty, PageHeader } from '@/components/ui';
import { formatHandicap } from '@/lib/format';
import { cancelBooking, toggleCheckIn } from './actions';

export const metadata = { title: 'Starttijden' };

export default async function StarttijdenPage({ searchParams }: { searchParams: Promise<{ dag?: string; baan?: string }> }) {
  const sp = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const day = sp.dag ?? localDate();

  const { data: courseData } = await supabase.from('courses').select('*').eq('club_id', ctx.club.id).eq('active', true).order('name');
  const courses = (courseData ?? []) as Course[];
  const course = courses.find((c) => c.id === sp.baan) ?? courses[0];
  if (!course) return <><PageHeader title="Starttijden" /><Card><Empty>Er zijn nog geen banen ingesteld.</Empty></Card></>;

  const { data } = await supabase.rpc('tee_sheet', { p_course: course.id, p_day: day });
  const rows = (data ?? []) as TeeSheetRow[];
  const byTime = new Map<string, TeeSheetRow[]>();
  for (const r of rows) byTime.set(localTime(r.starts_at), [...(byTime.get(localTime(r.starts_at)) ?? []), r]);
  const slots = generateTeeSlots(day, course);
  const players = rows.filter((r) => r.player_id).length;
  const link = (d: string) => `/starttijden?dag=${d}&baan=${course.id}`;

  return (
    <>
      <PageHeader
        title="Starttijden"
        subtitle={`${new Date(`${day}T12:00:00Z`).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} · ${players} spelers`}
        actions={
          <div className="flex items-center gap-2">
            <Link className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm" href={link(addDays(day, -1))}>←</Link>
            <form className="flex gap-2">
              <input type="date" name="dag" defaultValue={day} />
              <select name="baan" defaultValue={course.id}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button className="rounded-md bg-stone-800 px-3 text-sm text-white">Toon</button>
            </form>
            <Link className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm" href={link(addDays(day, 1))}>→</Link>
          </div>
        }
      />
      <Card>
        <table>
          <thead className="bg-stone-50"><tr><th className="w-20">Tijd</th><th>Spelers</th><th className="w-24" /></tr></thead>
          <tbody>
            {slots.map((slot) => {
              const flight = (byTime.get(slot.time) ?? []).filter((r) => r.player_id);
              const bookingId = byTime.get(slot.time)?.[0]?.booking_id;
              return (
                <tr key={slot.time} className={flight.length ? '' : 'text-stone-400'}>
                  <td className="font-mono">{slot.time}</td>
                  <td>
                    {flight.length === 0 ? 'vrij' : (
                      <div className="flex flex-wrap gap-2">
                        {flight.map((p) => (
                          <form key={p.player_id} action={toggleCheckIn}>
                            <input type="hidden" name="player_id" value={p.player_id!} />
                            <input type="hidden" name="checked_in" value={p.checked_in ? '0' : '1'} />
                            <button
                              title={p.checked_in ? 'Ingecheckt — klik om ongedaan te maken' : 'Klik om in te checken'}
                              className={`rounded-full border px-3 py-1 text-xs ${p.checked_in ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-stone-300 bg-white text-stone-800'}`}
                            >
                              {p.checked_in ? '✓ ' : ''}{p.player_name}{p.handicap_index != null && <span className="text-stone-500"> · {formatHandicap(p.handicap_index)}</span>}
                            </button>
                          </form>
                        ))}
                        <span className="self-center text-xs text-stone-400">{flight.length}/{course.max_players}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    {bookingId && (
                      <form action={cancelBooking}>
                        <input type="hidden" name="booking_id" value={bookingId} />
                        <button className="text-xs text-red-600 hover:underline">Annuleer</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
