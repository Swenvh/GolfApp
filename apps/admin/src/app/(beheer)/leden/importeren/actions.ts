'use server';

import { revalidatePath } from 'next/cache';
import { importFields } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

export interface ImportResult {
  inserted: number; updated: number; skipped: number; mandates: number; types_created: string[];
}

const allowed = importFields.map((f) => f.key).filter((k) => k !== 'initials');

/** Importeert de goedgekeurde regels in één keer; bij één fout wordt niets opgeslagen. */
export async function importMembers(
  rows: Record<string, string>[], options: { updateExisting: boolean; createTypes: boolean },
): Promise<{ ok: true; result: ImportResult } | { ok: false; error: string }> {
  const ctx = await requireRole('secretariat');
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'Er zijn geen regels om te importeren.' };
  if (rows.length > 5000) return { ok: false, error: 'Maximaal 5000 leden per keer.' };
  // Alleen bekende velden, alleen tekst: wat de browser ook stuurt, er gaat niets anders naar de database
  const clean = rows.map((row) => {
    const out: Record<string, string> = {};
    for (const key of [...allowed, '_line']) {
      const v = (row as Record<string, unknown>)?.[key];
      if (typeof v === 'string' && v.length <= 200) out[key] = v;
    }
    return out;
  });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('import_members', {
    p_club: ctx.club.id,   // altijd de club van de ingelogde beheerder, nooit uit het verzoek
    p_rows: clean,
    p_update_existing: options?.updateExisting === true,
    p_create_types: options?.createTypes === true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/leden');
  revalidatePath('/');
  return { ok: true, result: data as ImportResult };
}
