'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

export interface ImportResult {
  inserted: number; updated: number; skipped: number; mandates: number; types_created: string[];
}

/** Importeert de goedgekeurde regels in één keer; bij één fout wordt niets opgeslagen. */
export async function importMembers(
  rows: Record<string, string>[], options: { updateExisting: boolean; createTypes: boolean },
): Promise<{ ok: true; result: ImportResult } | { ok: false; error: string }> {
  const ctx = await requireRole('secretariat');
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'Er zijn geen regels om te importeren.' };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('import_members', {
    p_club: ctx.club.id,
    p_rows: rows,
    p_update_existing: options.updateExisting,
    p_create_types: options.createTypes,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/leden');
  revalidatePath('/');
  return { ok: true, result: data as ImportResult };
}
