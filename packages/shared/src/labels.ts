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
