'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CLUB_COOKIE } from '@/lib/club';

export async function selectClub(formData: FormData) {
  (await cookies()).set(CLUB_COOKIE, String(formData.get('club_id')), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/',
  });
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
