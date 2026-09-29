import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  // Voorkom formule-injectie in Excel
  const safe = /^[=+@]/.test(s) ? `'${s}` : s;
  return /[;"\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Lijst voor de software van de ballenautomaat: per actief lid het nummer dat de QR-code in de app
 * toont (clubpasnummer, anders lidnummer). In de automaat koppelt de club daar de ledenkorting aan.
 */
export async function GET() {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const { data } = await supabase.from('members')
    .select('member_number, club_pass_number, first_name, infix, last_name, membership_type:membership_types(name)')
    .eq('club_id', ctx.club.id).eq('status', 'active').order('last_name').limit(10000);
  type Row = { member_number: string; club_pass_number: string | null; first_name: string; infix: string | null; last_name: string; membership_type: { name: string } | null };
  const lines = [
    ['Pasnummer', 'Lidnummer', 'Voornaam', 'Tussenvoegsel', 'Achternaam', 'Lidmaatschap'].join(';'),
    ...((data ?? []) as unknown as Row[]).map((m) => [
      m.club_pass_number ?? m.member_number, m.member_number, m.first_name, m.infix, m.last_name, m.membership_type?.name,
    ].map(csvCell).join(';')),
  ];
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store, private',
      'Content-Disposition': `attachment; filename="clubpassen-${ctx.club.slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
