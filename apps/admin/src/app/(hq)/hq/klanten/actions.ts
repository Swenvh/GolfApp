'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { parseEuro } from '@golfapp/shared';
import { requirePlatformStaff } from '@/lib/hq';
import { str } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';

/** "Golfclub De Heide" → "golfclub-de-heide" */
function slugify(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' en ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

export async function createClub(formData: FormData) {
  await requirePlatformStaff();
  const supabase = await createClient();
  const name = str(formData.get('name')) ?? '';
  const prospect = str(formData.get('prospect_id'));
  const back = `/hq/klanten/nieuw${prospect ? `?prospect=${prospect}&` : '?'}`;
  const { data, error } = await supabase.rpc('hq_create_club', {
    p: {
      name,
      slug: str(formData.get('slug')) ?? slugify(name),
      email: str(formData.get('email')),
      phone: str(formData.get('phone')),
      website: str(formData.get('website')),
      city: str(formData.get('city')),
      layout: String(formData.get('layout') ?? '18'),
      status: String(formData.get('status') ?? 'pilot'),
      pilot_days: String(formData.get('pilot_days') ?? '90'),
      fee_cents: parseEuro(String(formData.get('fee') || '0')) ?? 0,
      manager_email: str(formData.get('manager_email')),
      prospect_id: prospect,
    },
  });
  if (error) redirect(`${back}error=${encodeURIComponent(error.message)}`);
  revalidatePath('/hq');
  revalidatePath('/hq/verkoop');
  redirect(`/hq/klanten/${data as string}?nieuw=1`);
}

/** Downloadlinks van de clubapp; komen in de uitnodiging die de club naar leden stuurt. */
export async function saveAppLinks(formData: FormData) {
  await requirePlatformStaff();
  const supabase = await createClient();
  const club = String(formData.get('club_id') ?? '');
  const { error } = await supabase.rpc('hq_set_app_links', {
    p_club: club,
    p_ios: str(formData.get('ios_url')) ?? '',
    p_android: str(formData.get('android_url')) ?? '',
  });
  redirect(`/hq/klanten/${club}?${error ? `links=${encodeURIComponent(error.message)}` : 'links=ok'}#app`);
}
