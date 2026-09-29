'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

export async function toggleCheckIn(formData: FormData) {
  await requireRole('secretariat', 'marshal');
  const supabase = await createClient();
  await supabase.from('tee_booking_players')
    .update({ checked_in: formData.get('checked_in') === '1' })
    .eq('id', String(formData.get('player_id')));
  revalidatePath('/starttijden');
}

export async function cancelBooking(formData: FormData) {
  await requireRole('secretariat', 'marshal');
  const supabase = await createClient();
  await supabase.from('tee_bookings').delete().eq('id', String(formData.get('booking_id')));
  revalidatePath('/starttijden');
}

/** Baaninformatie voor leden: open, beperkt of gesloten, met een korte toelichting. */
export async function saveCourseStatus(formData: FormData) {
  await requireRole('secretariat', 'marshal');
  const supabase = await createClient();
  await supabase.rpc('set_course_status', {
    p_course: String(formData.get('course_id')),
    p_status: String(formData.get('status')),
    p_note: String(formData.get('note') ?? '').slice(0, 200),
  });
  revalidatePath('/starttijden');
}
