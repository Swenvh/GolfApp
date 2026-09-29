import { describe, expect, it } from 'vitest';
import {
  buildSepaDirectDebitXml, courseHandicap, formatEuro, generateTeeSlots, handicapIndexFromDifferentials,
  invoiceTotals, isValidIban, parseEuro, playingHandicap, scoreDifferential, scoreRound, sepaText,
  strokesReceived, fullName, localTime, frontNine,
} from '../src';

describe('money', () => {
  it('formats and parses euros', () => {
    expect(formatEuro(185000).replace(/\s/g, ' ')).toBe('€ 1.850,00');
    expect(parseEuro('1.234,56')).toBe(123456);
    expect(parseEuro('€ 12,5')).toBe(1250);
    expect(parseEuro('12.50')).toBe(1250);
    expect(parseEuro('abc')).toBeNull();
  });

  it('matches database invoice totals (incl. rounding and discount)', () => {
    const t = invoiceTotals([
      { quantity: 3, unitPriceCents: 3250, vatRate: 21 },
      { quantity: 1, unitPriceCents: 7500, vatRate: 9 },
      { quantity: 1, unitPriceCents: -1000, vatRate: 21 },
    ]);
    // zelfde verwachting als supabase/tests/database.test.sql
    expect([t.subtotal, t.vat, t.total]).toEqual([16250, 2513, 18763]);
  });
});

describe('iban', () => {
  it('validates', () => {
    expect(isValidIban('NL91 ABNA 0417 1643 00')).toBe(true);
    expect(isValidIban('NL91ABNA0417164301')).toBe(false);
    expect(isValidIban('DE89370400440532013000')).toBe(true);
  });
});

describe('handicap (WHS)', () => {
  const tee = { courseRating: 71.4, slopeRating: 129, par: 72 };
  it('course and playing handicap', () => {
    expect(courseHandicap(14.2, tee)).toBe(16); // 14.2 × 129/113 − 0.6 = 15.6
  });
  it('strokes received per hole', () => {
    expect(strokesReceived(20, 1)).toBe(2);
    expect(strokesReceived(20, 2)).toBe(2);
    expect(strokesReceived(20, 3)).toBe(1);
    expect(strokesReceived(-2, 18)).toBe(-1);
    expect(strokesReceived(-2, 17)).toBe(-1);
    expect(strokesReceived(-2, 16)).toBe(0);
  });
  it('scores a stableford round', () => {
    const holes = Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4, strokeIndex: i + 1 }));
    const scores = Array(18).fill(5);
    const r = scoreRound(scores, holes, 18); // bogey golf met 18 slagen = 36 punten
    expect(r.stableford).toBe(36);
    expect(r.gross).toBe(90);
    expect(r.net).toBe(72);
    const blob = scoreRound([null, ...Array(17).fill(5)], holes, 18);
    expect(blob.stableford).toBe(34);
    expect(blob.adjustedGross).toBe(85 + 7); // NDB op hole 1 = 4+2+1
  });
  it('differentials and index', () => {
    expect(scoreDifferential(85, tee)).toBe(11.9); // 113/129 × (85 − 71.4)
    expect(handicapIndexFromDifferentials([10, 12, 14])).toBe(8);
    expect(handicapIndexFromDifferentials([1, 2])).toBeNull();
    const twenty = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(handicapIndexFromDifferentials(twenty)).toBe(4.5); // gem. van 1..8
    expect(playingHandicap(16, 95)).toBe(15);
  });
});

describe('tee times', () => {
  it('generates slots in Amsterdam time, DST-safe', () => {
    const summer = generateTeeSlots('2026-07-01', { first_tee_time: '07:30', last_tee_time: '08:00', interval_minutes: 10 });
    expect(summer.map((s) => s.time)).toEqual(['07:30', '07:40', '07:50', '08:00']);
    expect(summer[0]!.startsAt).toBe('2026-07-01T05:30:00.000Z');
    const winter = generateTeeSlots('2026-12-01', { first_tee_time: '09:00:00', last_tee_time: '09:00:00', interval_minutes: 10 });
    expect(winter[0]!.startsAt).toBe('2026-12-01T08:00:00.000Z');
    expect(localTime('2026-12-01T08:00:00.000Z')).toBe('09:00');
  });
});

describe('sepa', () => {
  it('builds a pain.008 file grouped by sequence type', () => {
    const xml = buildSepaDirectDebitXml({
      messageId: 'abc123',
      createdAt: new Date('2026-09-25T10:00:00Z'),
      collectionDate: '2026-10-01',
      creditor: { name: 'Golfclub De Duinen', iban: 'NL91ABNA0417164300', bic: 'ABNANL2A', creditorId: 'NL00ZZZ401234560000' },
      transactions: [
        { endToEndId: '2026-00001', amountCents: 185000, mandateId: 'DD-1001', mandateSignedOn: '2015-03-01', sequenceType: 'RCUR', debtorName: 'J. de Vries', debtorIban: 'NL02RABO0123456789', description: 'Contributie 2026' },
        { endToEndId: '2026-00002', amountCents: 12550, mandateId: 'DD-1002', mandateSignedOn: '2019-01-15', sequenceType: 'FRST', debtorName: 'Zoë & Søren', debtorIban: 'NL44RABO0123456788', description: 'Les' },
      ],
    });
    expect(xml).toContain('<NbOfTxs>2</NbOfTxs>');
    expect(xml).toContain('<CtrlSum>1975.50</CtrlSum>');
    expect(xml).toContain('<SeqTp>FRST</SeqTp>');
    expect(xml).toContain('<SeqTp>RCUR</SeqTp>');
    expect(xml).toContain('<Nm>Zoe Soren</Nm>');
    expect(xml).toContain('<Othr><Id>NOTPROVIDED</Id></Othr>');
  });
  it('sanitizes text', () => {
    expect(sepaText('Café <test> & co', 70)).toBe('Cafe test co');
  });
});

describe('names', () => {
  it('handles tussenvoegsels', () => {
    expect(fullName({ first_name: 'Pieter', infix: 'van den', last_name: 'Berg' })).toBe('Pieter van den Berg');
  });
});

describe('consumentenprijzen', () => {
  it('rekent een ronde prijs incl. btw terug naar excl.', async () => {
    const { priceExclFromIncl, priceInclVat } = await import('../src');
    expect(priceExclFromIncl(4000, 21)).toBe(3306);
    expect(priceInclVat(3306, 21)).toBe(4000);
    expect(priceInclVat(priceExclFromIncl(6000, 9), 9)).toBe(6000);
    expect(priceInclVat(priceExclFromIncl(5000, 21), 21)).toBe(5000);
    // Twee greenfees van € 60,00 zijn € 120,00, niet € 120,01
    expect(priceInclVat(priceExclFromIncl(6000, 9), 9, 2)).toBe(12000);
  });
});

describe('9 holes op een 18-holesbaan', () => {
  it('nummert de stroke indexes van de voorste negen 1-9 en halveert de handicap', () => {
    const holes = [7, 11, 17, 1, 5, 13, 15, 3, 9, 8, 18, 12, 2, 6, 10, 16, 4, 14].map((si, i) => ({ number: i + 1, par: 4, strokeIndex: si }));
    const nine = frontNine(holes, 17);
    expect(nine.holes.map((h) => h.strokeIndex)).toEqual([4, 6, 9, 1, 3, 7, 8, 2, 5]);
    expect(nine.playingHcp).toBe(9);
    // Met 9 slagen krijgt elke hole er één
    expect(scoreRound(Array(9).fill(5), nine.holes, nine.playingHcp).stableford).toBe(18);
  });
});

describe('factuur als PDF', () => {
  it('toont btw per tarief en escapet tekst', async () => {
    const { invoiceHtml, vatBreakdown } = await import('../src');
    const lines = [
      { description: 'Koffie <en> taart', quantity: 1, vat_rate: 9, line_total_cents: 413, vat_cents: 37 },
      { description: 'Clubsandwich', quantity: 1, vat_rate: 21, line_total_cents: 1000, vat_cents: 210 },
    ];
    expect(vatBreakdown(lines)).toEqual([{ rate: 21, base: 1000, vat: 210 }, { rate: 9, base: 413, vat: 37 }]);
    const html = invoiceHtml({
      club: { name: 'Golfclub De Duinen', street: 'Duinweg', house_number: '1', postal_code: '2201 AA', city: 'Noordwijk', email: null, kvk_number: '40123456', vat_number: 'NL001234567B01', iban: 'NL91ABNA0417164300' },
      member: { first_name: 'Jan', infix: 'de', last_name: 'Vries', street: 'Zeestraat', house_number: '12', postal_code: '2202 BB', city: 'Noordwijk', member_number: '1001' },
      invoice: { invoice_number: '2026-00200', description: 'Horeca', issue_date: '2026-09-29', due_date: '2026-10-13', total_cents: 1660, paid_cents: 0, vat_cents: 247, subtotal_cents: 1413, status: 'open' },
      lines,
    });
    expect(html).toContain('Koffie &lt;en&gt; taart');
    expect(html).toContain('KvK 40123456');
    expect(html).toContain('Jan de Vries');
    expect(html.replace(/\s/g, ' ')).toContain('€ 16,60');
  });
});
