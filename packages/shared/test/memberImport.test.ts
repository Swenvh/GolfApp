import { describe, expect, it } from 'vitest';
import { importPayload, parseCsv, parseDutchDate, parseHandicap, parseMemberImport } from '../src';

describe('ledenimport', () => {
  it('leest CSV met puntkomma, aanhalingstekens en BOM', () => {
    const rows = parseCsv('﻿a;b;c\r\n1;"twee; met ""quote""";3\n\n4;5;6');
    expect(rows).toEqual([
      { line: 1, cells: ['a', 'b', 'c'] },
      { line: 2, cells: ['1', 'twee; met "quote"', '3'] },
      { line: 4, cells: ['4', '5', '6'] },
    ]);
    expect(parseCsv('a,b\n1,2')[1]!.cells).toEqual(['1', '2']);
  });

  it('zet Nederlandse datums en handicaps om', () => {
    expect(parseDutchDate('31-12-1980')).toBe('1980-12-31');
    expect(parseDutchDate('1/2/2001')).toBe('2001-02-01');
    expect(parseDutchDate('1980-12-31')).toBe('1980-12-31');
    expect(parseDutchDate('31-02-1970')).toBeNull();
    expect(parseHandicap('14,2')).toBe(14.2);
    expect(parseHandicap('+2,1')).toBe(-2.1);
    expect(parseHandicap('60')).toBeNull();
  });

  it('herkent kolommen van een export uit een ander systeem en controleert elke regel', () => {
    const csv = [
      'Relatienummer;Roepnaam;Tussenvoegsel;Achternaam;Geslacht;Geboortedatum;E-mailadres;Adres;Postcode;Woonplaats;Soort lidmaatschap;Hcp;Rekeningnummer;Mandaatkenmerk;Datum machtiging;Opmerking',
      '1001;Jan;de;Vries;M;12-04-1968;Jan@Example.test;Zeestraat 12a;2202bb;Noordwijk;A-lid;14,2;NL91 ABNA 0417 1643 00;DD-1001;01-03-2015;x',
      '1002;Sanne;;Jansen;V;30-09-1985;jan@example.test;Kerkstraat 4;2201 CC;Noordwijk;A-lid;+1,0;NL00BANK0000000000;;;',
      '1001;Piet;;Klaas;;31-02-1970;geen-mail;;;;;;;;;',
    ].join('\n');
    const r = parseMemberImport(csv);
    expect(r.error).toBeUndefined();
    expect(r.ignored).toEqual(['Opmerking']);
    const [jan, sanne, piet] = r.rows;
    expect(jan!.errors).toEqual([]);
    expect(jan!.values).toMatchObject({
      member_number: '1001', first_name: 'Jan', infix: 'de', last_name: 'Vries', gender: 'male',
      date_of_birth: '1968-04-12', email: 'jan@example.test', street: 'Zeestraat', house_number: '12a',
      postal_code: '2202 BB', membership_type: 'A-lid', handicap_index: '14.2', iban: 'NL91ABNA0417164300',
      mandate_reference: 'DD-1001', mandate_signed_on: '2015-03-01',
    });
    expect(jan!.warnings[0]).toMatch(/Zelfde e-mailadres als regel 3/);
    expect(sanne!.values.handicap_index).toBe('-1');
    expect(sanne!.errors).toEqual(['IBAN "NL00BANK0000000000" klopt niet']);
    expect(piet!.errors).toEqual([
      'E-mailadres "geen-mail" is ongeldig',
      'Geboortedatum "31-02-1970" is geen geldige datum',
      'Lidnummer 1001 staat ook op regel 2',
    ]);
    expect(importPayload(r.rows)).toHaveLength(1);
    expect(importPayload(r.rows)[0]).toMatchObject({ _line: '2', last_name: 'Vries' });
  });

  it('meldt een bestand zonder naamkolommen', () => {
    expect(parseMemberImport('Nummer;Plaats\n1;Ede').error).toMatch(/voornaam en achternaam/);
    expect(parseMemberImport('Voornaam;Achternaam').error).toMatch(/geen leden/);
  });
});

describe('clubpasnummer', () => {
  it('herkent de kolom, maakt het netjes en weigert dubbele passen', async () => {
    const { parseMemberImport } = await import('../src');
    const csv = 'Lidnummer;Voornaam;Achternaam;Clubpas\n1;An;Bos;ab 123\n2;Bo;Kok;AB123\n3;Cor;Dam;12 34!';
    const res = parseMemberImport(csv);
    expect(res.rows[0]!.values.club_pass_number).toBe('AB123');
    expect(res.rows[1]!.errors.join()).toContain('staat ook op regel 2');
    expect(res.rows[2]!.errors.join()).toContain('mag alleen letters');
  });
});
