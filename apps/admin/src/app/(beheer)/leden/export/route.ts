import { NextResponse, type NextRequest } from 'next/server';
import { memberStatusLabel, type Member } from '@golfapp/shared';
import { getStaffContext } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';

const columns: [string, (m: Member & { membership_type: { name: string } | null }) => unknown][] = [
  ['Lidnummer', (m) => m.member_number],
  ['NGF-nummer', (m) => m.ngf_number],
  ['Voornaam', (m) => m.first_name],
  ['Tussenvoegsel', (m) => m.infix],
  ['Achternaam', (m) => m.last_name],
  ['Geboortedatum', (m) => m.date_of_birth],
  ['E-mail', (m) => m.email],
  ['Telefoon', (m) => m.phone],
  ['Straat', (m) => m.street],
  ['Huisnummer', (m) => m.house_number],
  ['Postcode', (m) => m.postal_code],
  ['Plaats', (m) => m.city],
  ['Lidmaatschap', (m) => m.membership_type?.name],
  ['Status', (m) => memberStatusLabel[m.status]],
  ['Lid sinds', (m) => m.join_date],
  ['Handicap', (m) => m.handicap_index],
];

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  // Voorkom formule-injectie in Excel
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[;"\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(request: NextRequest) {
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const status = request.nextUrl.searchParams.get('status') ?? 'active';
  const type = request.nextUrl.searchParams.get('type');

  let query = supabase.from('members').select('*, membership_type:membership_types(name)')
    .eq('club_id', ctx.club.id).order('last_name');
  if (status !== 'all') query = query.eq('status', status);
  if (type) query = query.eq('membership_type_id', type);
  const { data } = await query;

  // Excel (NL) verwacht puntkomma's; BOM voor juiste weergave van é, ë, ...
  const lines = [
    columns.map(([h]) => h).join(';'),
    ...((data ?? []) as Parameters<(typeof columns)[number][1]>[0][]).map((m) =>
      columns.map(([, get]) => csvCell(get(m))).join(';')),
  ];
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leden-${ctx.club.slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
