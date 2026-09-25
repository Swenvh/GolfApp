/** Alle bedragen worden als gehele centen opgeslagen en doorgegeven. */
export type Cents = number;

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

export function formatEuro(cents: Cents): string {
  return eur.format(cents / 100);
}

/** Parse "1.234,56", "1234.56" of "€ 12,50" naar centen. Geeft null bij ongeldige invoer. */
export function parseEuro(input: string): Cents | null {
  let s = input.replace(/[€\s]/g, '');
  if (s === '') return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

export type VatRate = 0 | 9 | 21;
export const VAT_RATES: readonly VatRate[] = [0, 9, 21];

export interface InvoiceLineInput {
  quantity: number;
  unitPriceCents: Cents;
  vatRate: VatRate;
}

/** Rekent exact zoals de database (per regel afronden). */
export function lineTotals(line: InvoiceLineInput): { net: Cents; vat: Cents } {
  const net = Math.round(line.quantity * line.unitPriceCents);
  return { net, vat: roundHalfAwayFromZero((net * line.vatRate) / 100) };
}

export function invoiceTotals(lines: InvoiceLineInput[]) {
  let subtotal = 0;
  let vat = 0;
  const vatByRate = new Map<VatRate, Cents>();
  for (const line of lines) {
    const t = lineTotals(line);
    subtotal += t.net;
    vat += t.vat;
    vatByRate.set(line.vatRate, (vatByRate.get(line.vatRate) ?? 0) + t.vat);
  }
  return { subtotal, vat, total: subtotal + vat, vatByRate };
}

/** PostgreSQL round() rondt .5 van nul af; Math.round niet voor negatieve getallen. */
function roundHalfAwayFromZero(n: number): number {
  return Math.sign(n) * Math.round(Math.abs(n));
}
