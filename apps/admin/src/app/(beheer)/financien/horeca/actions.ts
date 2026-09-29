'use server';

import { revalidatePath } from 'next/cache';
import { parseEuro } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

export type HorecaLine = { description: string; amount: string; vatRate: 9 | 21 };

/** Bestelling aan de bar op naam van een lid: wordt een factuur 'Horeca' die het lid in de app ziet. */
export async function putOnAccount(memberId: string, lines: HorecaLine[]): Promise<{ ok: true } | { error: string }> {
  await requireRole('finance', 'secretariat');
  if (!memberId) return { error: 'Kies een lid.' };
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 30) return { error: 'Voeg 1 tot 30 regels toe.' };
  const payload = [];
  for (const [i, l] of lines.entries()) {
    const cents = parseEuro(String(l.amount ?? ''));
    if (!cents || cents <= 0) return { error: `Regel ${i + 1}: vul een bedrag in.` };
    payload.push({ description: String(l.description ?? '').slice(0, 120), amount_incl_cents: cents, vat_rate: l.vatRate === 9 ? 9 : 21 });
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc('horeca_invoice', { p_member: memberId, p_lines: payload });
  if (error) return { error: error.message };
  revalidatePath('/financien/horeca');
  return { ok: true };
}
