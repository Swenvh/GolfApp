import { formatIban } from './iban';
import { formatEuro } from './money';
import { fullName, type PersonName } from './names';
import type { Club, Invoice, InvoiceLine } from './types';

type Party = PersonName & { street: string | null; house_number: string | null; postal_code: string | null; city: string | null };

const esc = (s: string | number | null | undefined) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const dateNl = (iso: string) =>
  new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));

/** Btw per tarief, zoals die op een factuur hoort (regels zijn al per regel afgerond). */
export function vatBreakdown(lines: Pick<InvoiceLine, 'vat_rate' | 'line_total_cents' | 'vat_cents'>[]): { rate: number; base: number; vat: number }[] {
  const byRate = new Map<number, { base: number; vat: number }>();
  for (const l of lines) {
    const rate = Number(l.vat_rate);
    const cur = byRate.get(rate) ?? { base: 0, vat: 0 };
    byRate.set(rate, { base: cur.base + l.line_total_cents, vat: cur.vat + l.vat_cents });
  }
  return [...byRate.entries()].sort((a, b) => b[0] - a[0]).map(([rate, v]) => ({ rate, ...v }));
}

/**
 * Factuur als HTML-pagina (A4), voor een PDF op de telefoon, bijvoorbeeld voor zakelijke leden.
 * Bevat wat op een Nederlandse factuur moet: gegevens van de club (KvK, btw-nummer), factuurnummer,
 * datum, de klant, regels met btw-tarief, btw per tarief en het totaal.
 */
export function invoiceHtml(p: {
  club: Pick<Club, 'name' | 'street' | 'house_number' | 'postal_code' | 'city' | 'email' | 'kvk_number' | 'vat_number' | 'iban'>;
  member: Party & { member_number: string };
  invoice: Pick<Invoice, 'invoice_number' | 'description' | 'issue_date' | 'due_date' | 'total_cents' | 'paid_cents' | 'vat_cents' | 'subtotal_cents' | 'status'>;
  lines: Pick<InvoiceLine, 'description' | 'quantity' | 'vat_rate' | 'line_total_cents' | 'vat_cents'>[];
}): string {
  const { club, member, invoice, lines } = p;
  const addr = (x: { street: string | null; house_number: string | null; postal_code: string | null; city: string | null }) =>
    [[x.street, x.house_number].filter(Boolean).join(' '), [x.postal_code, x.city].filter(Boolean).join('  ')].filter(Boolean).map(esc).join('<br>');
  const rows = lines.map((l) => `<tr><td>${Number(l.quantity) !== 1 ? `${esc(Number(l.quantity).toLocaleString('nl-NL'))} × ` : ''}${esc(l.description)}</td>`
    + `<td class="r">${esc(Number(l.vat_rate))}%</td><td class="r">${esc(formatEuro(l.line_total_cents))}</td></tr>`).join('');
  const vat = vatBreakdown(lines).map((v) => `<tr><td>Btw ${esc(v.rate)}% over ${esc(formatEuro(v.base))}</td><td></td><td class="r">${esc(formatEuro(v.vat))}</td></tr>`).join('');
  const open = invoice.total_cents - invoice.paid_cents;
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Factuur ${esc(invoice.invoice_number)}</title><style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Helvetica, Arial, sans-serif; color: #12201A; font-size: 11pt; }
  h1 { font-family: Georgia, serif; font-size: 22pt; margin: 0 0 4mm; }
  .top { display: flex; justify-content: space-between; gap: 10mm; margin-bottom: 10mm; }
  .muted { color: #56655D; }
  table { width: 100%; border-collapse: collapse; margin-top: 6mm; }
  th { text-align: left; font-size: 9pt; text-transform: uppercase; letter-spacing: .08em; color: #56655D; border-bottom: 1px solid #C9D2C8; padding: 2mm 0; }
  td { padding: 2mm 0; border-bottom: 1px solid #E3E7E0; vertical-align: top; }
  .r { text-align: right; white-space: nowrap; padding-left: 4mm; }
  .total td { font-weight: bold; font-size: 13pt; border-bottom: 0; padding-top: 4mm; }
  .foot { margin-top: 12mm; font-size: 9.5pt; }
  </style></head><body>
  <div class="top">
    <div><h1>Factuur</h1><div class="muted">Nummer ${esc(invoice.invoice_number ?? '—')}<br>Datum ${esc(dateNl(invoice.issue_date))}<br>Vervaldatum ${esc(dateNl(invoice.due_date))}</div></div>
    <div style="text-align:right"><strong>${esc(club.name)}</strong><br>${addr(club)}${club.email ? `<br>${esc(club.email)}` : ''}
      ${club.kvk_number ? `<br>KvK ${esc(club.kvk_number)}` : ''}${club.vat_number ? `<br>Btw ${esc(club.vat_number)}` : ''}</div>
  </div>
  <div><span class="muted">Aan</span><br><strong>${esc(fullName(member))}</strong><br>${addr(member)}<br><span class="muted">Lidnummer ${esc(member.member_number)}</span></div>
  ${invoice.description ? `<p style="margin-top:8mm"><strong>${esc(invoice.description)}</strong></p>` : ''}
  <table><thead><tr><th>Omschrijving</th><th class="r">Btw</th><th class="r">Bedrag excl. btw</th></tr></thead><tbody>
  ${rows}
  <tr><td>Subtotaal</td><td></td><td class="r">${esc(formatEuro(invoice.subtotal_cents))}</td></tr>
  ${vat}
  <tr class="total"><td>Totaal</td><td></td><td class="r">${esc(formatEuro(invoice.total_cents))}</td></tr>
  </tbody></table>
  <div class="foot muted">${invoice.status === 'paid' ? 'Deze factuur is betaald. Dank je wel!'
    : open > 0 ? `Graag ${esc(formatEuro(open))} voor ${esc(dateNl(invoice.due_date))} overmaken${club.iban ? ` naar ${esc(formatIban(club.iban))} t.n.v. ${esc(club.name)}` : ''}, onder vermelding van ${esc(invoice.invoice_number ?? '')}.` : ''}</div>
  </body></html>`;
}
