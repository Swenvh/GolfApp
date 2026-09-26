import type { LeadStatus, LeadType, OrderStatus, ProductCategory } from './types';
import type {
  CompetitionFormat, CompetitionStatus, InvoiceStatus, LedgerAccountType, MemberStatus, PaymentMethod, StaffRole,
} from './types';

export const memberStatusLabel: Record<MemberStatus, string> = {
  prospect: 'Aspirant', active: 'Actief', suspended: 'Geschorst', resigned: 'Opgezegd',
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: 'Concept', open: 'Openstaand', paid: 'Betaald', cancelled: 'Gecrediteerd',
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  sepa_direct_debit: 'Automatische incasso', ideal: 'iDEAL', bank_transfer: 'Overboeking',
  cash: 'Contant', pin: 'Pin', credit: 'Verrekening',
};

export const competitionFormatLabel: Record<CompetitionFormat, string> = {
  stableford: 'Stableford', strokeplay: 'Strokeplay', matchplay: 'Matchplay',
  greensome: 'Greensome', foursome: 'Foursome', texas_scramble: 'Texas scramble',
};

export const competitionStatusLabel: Record<CompetitionStatus, string> = {
  draft: 'Concept', open: 'Inschrijving open', closed: 'Inschrijving gesloten', finished: 'Afgelopen',
};

export const staffRoleLabel: Record<StaffRole, string> = {
  admin: 'Beheerder', finance: 'Penningmeester', secretariat: 'Secretariaat', marshal: 'Marshal',
};

export const ledgerTypeLabel: Record<LedgerAccountType, string> = {
  asset: 'Activa', liability: 'Passiva', equity: 'Eigen vermogen', revenue: 'Opbrengsten', expense: 'Kosten',
};


export const productCategoryLabel: Record<ProductCategory, string> = {
  rental: 'Verhuur', range: 'Driving range', greenfee: 'Greenfees', lesson: 'Lessen',
  food: 'Horeca', proshop: 'Proshop', event: 'Wedstrijden & events', storage: 'Stalling & kluisjes',
};

/** Heeft het lid op deze dag een geldige Handicart-pas? */
export function hasValidHandicart(
  m: { handicart_pass_number: string | null; handicart_valid_until: string | null }, day: string,
): boolean {
  return !!m.handicart_pass_number && (!m.handicart_valid_until || m.handicart_valid_until >= day);
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: 'Klaarzetten', fulfilled: 'Geleverd', cancelled: 'Geannuleerd',
};

export const leadTypeLabel: Record<LeadType, string> = {
  upgrade: 'Upgrade lidmaatschap', referral: 'Introductie vriend', lesson: 'Lesaanvraag',
};

export const leadStatusLabel: Record<LeadStatus, string> = {
  new: 'Nieuw', contacted: 'In gesprek', won: 'Gewonnen', lost: 'Afgevallen',
};

/** Prijs inclusief btw, zoals de database per regel afrondt. */
export function priceInclVat(priceCents: number, vatRate: number, quantity = 1): number {
  const net = quantity * priceCents;
  return net + Math.round((net * vatRate) / 100);
}

/**
 * Prijs excl. btw bij een gewenste consumentenprijs incl. btw. Zoekt een bedrag
 * waarbij de afgeronde btw precies op de gewenste prijs uitkomt; anders het dichtstbijzijnde.
 */
export function priceExclFromIncl(inclCents: number, vatRate: number): number {
  const base = Math.round(inclCents / (1 + vatRate / 100));
  let best = base;
  for (let e = base - 3; e <= base + 3; e++) {
    if (priceInclVat(e, vatRate) === inclCents) return e;
    if (Math.abs(priceInclVat(e, vatRate) - inclCents) < Math.abs(priceInclVat(best, vatRate) - inclCents)) best = e;
  }
  return best;
}
