import { NextResponse } from 'next/server';
import { importTemplateHeader } from '@golfapp/shared';
import { requireRole } from '@/lib/club';

/** Voorbeeldbestand voor de ledenimport: kopregel plus twee voorbeeldleden. */
export async function GET() {
  await requireRole('secretariat');
  const rows = [
    importTemplateHeader,
    ['1001', '12345678', 'Jan', 'de', 'Vries', 'M', '12-04-1968', 'jan@voorbeeld.nl', '06-12345678', 'Zeestraat', '12', '2202 BB', 'Noordwijk',
     'A-lid (volledig)', 'actief', '01-03-2015', '14,2', 'NL91ABNA0417164300', 'ABNANL2A', 'DD-1001', '01-03-2015', 'J. de Vries'],
    ['1002', '', 'Sanne', '', 'Jansen', 'V', '30-09-1985', 'sanne@voorbeeld.nl', '', 'Kerkstraat', '4', '2201 CC', 'Noordwijk',
     'Weekdaglid', 'actief', '15-01-2019', '+1,0', '', '', '', '', ''],
  ];
  return new NextResponse('﻿' + rows.map((r) => r.join(';')).join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leden-importeren-voorbeeld.csv"',
    },
  });
}
