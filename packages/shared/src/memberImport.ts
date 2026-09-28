// Leden importeren uit een CSV-bestand van het vorige systeem (E-Golf4U, Nexxchange, IntoGolf, Excel).
// Herkent kolommen op naam, zet waarden om naar wat de database verwacht en controleert elke regel.
import { isValidIban, normalizeIban } from './iban';

export type ImportField =
  | 'member_number' | 'ngf_number' | 'first_name' | 'initials' | 'infix' | 'last_name' | 'gender'
  | 'date_of_birth' | 'email' | 'phone' | 'street' | 'house_number' | 'postal_code' | 'city'
  | 'membership_type' | 'status' | 'join_date' | 'end_date' | 'handicap_index'
  | 'iban' | 'bic' | 'mandate_reference' | 'mandate_signed_on' | 'account_holder';

/** Kolommen die we herkennen, met de namen die andere systemen en Excel-lijsten gebruiken. */
export const importFields: { key: ImportField; label: string; aliases: string[] }[] = [
  { key: 'member_number', label: 'Lidnummer', aliases: ['lidnummer', 'lidnr', 'relatienummer', 'relatienr', 'nummer', 'membernumber', 'memberid'] },
  { key: 'ngf_number', label: 'NGF-nummer', aliases: ['ngfnummer', 'ngf', 'gsnnummer', 'gsn', 'federatienummer', 'ngfpasnummer', 'golfpasnummer'] },
  { key: 'first_name', label: 'Voornaam', aliases: ['voornaam', 'roepnaam', 'firstname', 'givenname'] },
  { key: 'initials', label: 'Voorletters', aliases: ['voorletters', 'initialen', 'initials'] },
  { key: 'infix', label: 'Tussenvoegsel', aliases: ['tussenvoegsel', 'tussenvoegsels', 'voorvoegsel', 'prefix', 'infix'] },
  { key: 'last_name', label: 'Achternaam', aliases: ['achternaam', 'naam', 'lastname', 'surname', 'familienaam'] },
  { key: 'gender', label: 'Geslacht', aliases: ['geslacht', 'gender', 'sekse'] },
  { key: 'date_of_birth', label: 'Geboortedatum', aliases: ['geboortedatum', 'geboren', 'dateofbirth', 'birthdate', 'gebdatum'] },
  { key: 'email', label: 'E-mail', aliases: ['email', 'emailadres', 'mail', 'emailaddress'] },
  { key: 'phone', label: 'Telefoon', aliases: ['telefoon', 'telefoonnummer', 'mobiel', 'mobielnummer', 'telefoonmobiel', 'gsm', 'phone', 'mobile'] },
  { key: 'street', label: 'Straat', aliases: ['straat', 'straatnaam', 'adres', 'street', 'address'] },
  { key: 'house_number', label: 'Huisnummer', aliases: ['huisnummer', 'huisnr', 'nr', 'housenumber'] },
  { key: 'postal_code', label: 'Postcode', aliases: ['postcode', 'zipcode', 'postalcode', 'zip'] },
  { key: 'city', label: 'Plaats', aliases: ['plaats', 'woonplaats', 'city', 'stad'] },
  { key: 'membership_type', label: 'Lidmaatschap', aliases: ['lidmaatschap', 'soortlidmaatschap', 'lidmaatschapsvorm', 'lidsoort', 'soortlid', 'categorie', 'membershiptype', 'membership'] },
  { key: 'status', label: 'Status', aliases: ['status', 'lidstatus'] },
  { key: 'join_date', label: 'Lid sinds', aliases: ['lidsinds', 'lidvanaf', 'ingangsdatum', 'datumlidmaatschap', 'startdatum', 'joindate', 'datumlidworden'] },
  { key: 'end_date', label: 'Einddatum', aliases: ['einddatum', 'opzegdatum', 'afmelddatum', 'uitschrijfdatum', 'enddate'] },
  { key: 'handicap_index', label: 'Handicap', aliases: ['handicap', 'hcp', 'handicapindex', 'exacthandicap', 'hcpindex'] },
  { key: 'iban', label: 'IBAN', aliases: ['iban', 'rekeningnummer', 'bankrekening', 'bankrekeningnummer'] },
  { key: 'bic', label: 'BIC', aliases: ['bic', 'swift'] },
  { key: 'mandate_reference', label: 'Machtigingskenmerk', aliases: ['machtigingskenmerk', 'mandaatkenmerk', 'kenmerkmachtiging', 'mandaatreferentie', 'mandaatid', 'mandatereference', 'mandateid'] },
  { key: 'mandate_signed_on', label: 'Datum machtiging', aliases: ['datummachtiging', 'machtigingsdatum', 'datumondertekening', 'mandaatdatum', 'ondertekendop', 'mandatesignedon'] },
  { key: 'account_holder', label: 'Rekeninghouder', aliases: ['rekeninghouder', 'tenaamstelling', 'tnv', 'accountholder'] },
];

/** Kopregel van het voorbeeldbestand (gelijk aan de export, plus machtiging). */
export const importTemplateHeader = [
  'Lidnummer', 'NGF-nummer', 'Voornaam', 'Tussenvoegsel', 'Achternaam', 'Geslacht', 'Geboortedatum', 'E-mail', 'Telefoon',
  'Straat', 'Huisnummer', 'Postcode', 'Plaats', 'Lidmaatschap', 'Status', 'Lid sinds', 'Handicap',
  'IBAN', 'BIC', 'Machtigingskenmerk', 'Datum machtiging', 'Rekeninghouder',
];

export interface ImportRow {
  line: number;                                        // regelnummer in het bestand
  values: Partial<Record<ImportField, string>>;        // omgezet, klaar voor de database
  errors: string[];                                    // regel wordt niet geïmporteerd zolang dit er is
  warnings: string[];                                  // wordt wel geïmporteerd
}

export interface ImportParseResult {
  columns: { header: string; field: ImportField }[];  // herkende kolommen
  ignored: string[];                                  // kolommen die we niet gebruiken
  rows: ImportRow[];
  error?: string;                                     // het hele bestand is onbruikbaar
}

const key = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** CSV lezen: puntkomma, komma of tab; aanhalingstekens; BOM van Excel. Geeft regels met regelnummer. */
export function parseCsv(text: string): { line: number; cells: string[] }[] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const count = (ch: string) => firstLine.split(ch).length - 1;
  const delim = [';', '\t', ','].reduce((best, d) => (count(d) > count(best) ? d : best), ';');

  const out: { line: number; cells: string[] }[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let startLine = 1;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else { if (ch === '\n') line++; cell += ch; }
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delim) { cells.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      cells.push(cell);
      if (cells.some((c) => c.trim() !== '')) out.push({ line: startLine, cells });
      cells = []; cell = ''; line++; startLine = line;
    } else cell += ch;
  }
  cells.push(cell);
  if (cells.some((c) => c.trim() !== '')) out.push({ line: startLine, cells });
  return out;
}

/** 31-12-1980, 31/12/1980, 31.12.1980, 1980-12-31 → 1980-12-31. Null als het geen echte datum is. */
export function parseDutchDate(input: string): string | null {
  const s = input.trim();
  let y: number, m: number, d: number;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (match) { y = +match[1]!; m = +match[2]!; d = +match[3]!; }
  else {
    match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s);
    if (!match) return null;
    d = +match[1]!; m = +match[2]!; y = +match[3]!;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  if (y < 1900 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const genders: Record<string, 'male' | 'female' | 'other'> = {
  m: 'male', man: 'male', male: 'male', heer: 'male', dhr: 'male', mannelijk: 'male',
  v: 'female', vrouw: 'female', f: 'female', female: 'female', mevr: 'female', mevrouw: 'female', vrouwelijk: 'female',
  x: 'other', anders: 'other', other: 'other', o: 'other',
};
const statuses: Record<string, 'active' | 'suspended' | 'resigned' | 'prospect'> = {
  actief: 'active', active: 'active', lid: 'active', ja: 'active',
  geschorst: 'suspended', suspended: 'suspended', opgeschort: 'suspended',
  opgezegd: 'resigned', beeindigd: 'resigned', uitgeschreven: 'resigned', afgemeld: 'resigned', oudlid: 'resigned',
  resigned: 'resigned', inactief: 'resigned', nee: 'resigned',
  aspirant: 'prospect', aspirantlid: 'prospect', prospect: 'prospect', nieuw: 'prospect', proeflid: 'prospect',
};

/** Handicap: "14,2" → 14.2; plushandicap "+2,1" → -2.1 (zo staat die in de database). */
export function parseHandicap(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (!/^[+-]?\d{1,2}(\.\d)?$/.test(s)) return null;
  const n = s.startsWith('+') ? -Number(s.slice(1)) : Number(s);
  return n >= -10 && n <= 54 ? n : null;
}

/** Lees een ledenbestand en controleer elke regel. */
export function parseMemberImport(text: string): ImportParseResult {
  const lines = parseCsv(text);
  if (lines.length < 2) return { columns: [], ignored: [], rows: [], error: 'Het bestand bevat geen leden. Is de eerste regel een kopregel met kolomnamen?' };

  const header = lines[0]!.cells.map((h) => h.trim());
  const byAlias = new Map<string, ImportField>();
  for (const f of importFields) for (const a of f.aliases) byAlias.set(a, f.key);
  const mapping: (ImportField | null)[] = [];
  const columns: ImportParseResult['columns'] = [];
  const ignored: string[] = [];
  const used = new Set<ImportField>();
  header.forEach((h) => {
    const field = byAlias.get(key(h));
    if (field && !used.has(field)) { used.add(field); mapping.push(field); columns.push({ header: h, field }); }
    else { mapping.push(null); if (h) ignored.push(h); }
  });
  if (!used.has('last_name') || !(used.has('first_name') || used.has('initials'))) {
    return { columns, ignored, rows: [], error: 'Kolommen voor voornaam en achternaam niet gevonden. Gebruik de kopregel van het voorbeeldbestand.' };
  }

  const rows: ImportRow[] = lines.slice(1).map(({ line, cells }) => {
    const raw: Partial<Record<ImportField, string>> = {};
    mapping.forEach((field, i) => {
      const v = (cells[i] ?? '').trim();
      if (field && v) raw[field] = v;
    });
    return checkRow(line, raw);
  });

  // Controles over regels heen
  const numbers = new Map<string, number>();
  const emails = new Map<string, number[]>();
  for (const r of rows) {
    const n = r.values.member_number;
    if (n) {
      const first = numbers.get(n);
      if (first) r.errors.push(`Lidnummer ${n} staat ook op regel ${first}`);
      else numbers.set(n, r.line);
    }
    const e = r.values.email;
    if (e) emails.set(e, [...(emails.get(e) ?? []), r.line]);
  }
  for (const r of rows) {
    const same = r.values.email ? emails.get(r.values.email)! : [];
    if (same.length > 1) {
      r.warnings.push(`Zelfde e-mailadres als regel ${same.filter((l) => l !== r.line).join(', ')}. Met een gedeeld adres kan geen van beiden inloggen in de app; geef ieder een eigen adres.`);
    }
  }
  return { columns, ignored, rows };
}

function checkRow(line: number, raw: Partial<Record<ImportField, string>>): ImportRow {
  const errors: string[] = [];
  const warnings: string[] = [];
  const v: Partial<Record<ImportField, string>> = { ...raw };

  if (!v.first_name && v.initials) v.first_name = v.initials;
  delete v.initials;
  if (!v.first_name || !v.last_name) errors.push('Voornaam en achternaam zijn verplicht');

  // "Duinweg 12a" in één kolom: huisnummer apart zetten
  if (v.street && !v.house_number) {
    const m = /^(.*\S)\s+(\d+\s*[a-zA-Z]?(?:[-\s]?\d+)?)$/.exec(v.street);
    if (m) { v.street = m[1]!; v.house_number = m[2]!.replace(/\s+/g, ''); }
  }
  if (v.postal_code && /^\d{4}\s?[a-zA-Z]{2}$/.test(v.postal_code)) {
    v.postal_code = `${v.postal_code.slice(0, 4)} ${v.postal_code.slice(-2).toUpperCase()}`;
  }

  if (v.email) {
    v.email = v.email.toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errors.push(`E-mailadres "${raw.email}" is ongeldig`);
  } else warnings.push('Geen e-mailadres: dit lid kan nog niet inloggen in de app');

  if (v.gender) {
    const g = genders[key(v.gender)];
    if (g) v.gender = g; else { warnings.push(`Geslacht "${raw.gender}" niet herkend, leeg gelaten`); delete v.gender; }
  }
  if (v.status) {
    const s = statuses[key(v.status)];
    if (s) v.status = s; else errors.push(`Status "${raw.status}" niet herkend (gebruik actief, opgezegd, geschorst of aspirant)`);
  }
  for (const f of ['date_of_birth', 'join_date', 'end_date', 'mandate_signed_on'] as const) {
    if (!v[f]) continue;
    const d = parseDutchDate(v[f]!);
    if (d) v[f] = d; else errors.push(`${importFields.find((x) => x.key === f)!.label} "${raw[f]}" is geen geldige datum`);
  }
  if (v.handicap_index) {
    const h = parseHandicap(v.handicap_index);
    if (h === null) errors.push(`Handicap "${raw.handicap_index}" is ongeldig`);
    else v.handicap_index = String(h);
  }
  if (v.iban) {
    if (isValidIban(v.iban)) v.iban = normalizeIban(v.iban);
    else errors.push(`IBAN "${raw.iban}" klopt niet`);
  }
  if (v.bic) v.bic = v.bic.replace(/\s+/g, '').toUpperCase();
  const mandateParts = [v.mandate_reference, v.mandate_signed_on].filter(Boolean).length;
  if (mandateParts > 0 && (mandateParts < 2 || !v.iban)) {
    warnings.push('Machtiging onvolledig (IBAN, kenmerk en datum nodig): het lid wordt geïmporteerd, de machtiging niet');
  }
  return { line, values: v, errors, warnings };
}

/** Wat naar de database gaat: alleen regels zonder fouten, met regelnummer voor foutmeldingen. */
export function importPayload(rows: ImportRow[]): Record<string, string>[] {
  return rows.filter((r) => r.errors.length === 0).map((r) => ({ _line: String(r.line), ...r.values } as Record<string, string>));
}
