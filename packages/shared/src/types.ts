/** Rijtypen die overeenkomen met supabase/migrations. */
export type StaffRole = 'admin' | 'finance' | 'secretariat' | 'marshal';
export type MemberStatus = 'prospect' | 'active' | 'suspended' | 'resigned';
export type Gender = 'male' | 'female' | 'other';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'cancelled';
export type PaymentMethod = 'sepa_direct_debit' | 'ideal' | 'bank_transfer' | 'cash' | 'pin' | 'credit';
export type CompetitionFormat = 'stableford' | 'strokeplay' | 'matchplay' | 'greensome' | 'foursome' | 'texas_scramble';
export type CompetitionStatus = 'draft' | 'open' | 'closed' | 'finished';
export type LedgerAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Club {
  id: string;
  slug: string;
  name: string;
  ngf_club_code: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  kvk_number: string | null;
  vat_number: string | null;
  iban: string | null;
  bic: string | null;
  sepa_creditor_id: string | null;
  logo_url: string | null;
  payment_term_days: number;
  greenside_fee_cents: number;
  /** Hoe vaak dezelfde introducé per kalenderjaar mag spelen */
  guest_intro_limit: number;
}

export interface MembershipType {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  annual_fee_cents: number;
  entrance_fee_cents: number;
  vat_rate: number;
  min_age: number | null;
  max_age: number | null;
  can_book_weekend: boolean;
  /** false = rustend lidmaatschap: wel lid, niet spelen */
  can_play: boolean;
  active: boolean;
}

export interface Member {
  id: string;
  club_id: string;
  user_id: string | null;
  member_number: string;
  ngf_number: string | null;
  first_name: string;
  infix: string | null;
  last_name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  membership_type_id: string | null;
  status: MemberStatus;
  join_date: string;
  end_date: string | null;
  handicap_index: number | null;
  handicap_updated_at: string | null;
  iban: string | null;
  notes: string | null;
  photo_url: string | null;
  show_in_directory: boolean;
  handicart_pass_number: string | null;
  handicart_pass_type: HandicartPassType | null;
  handicart_valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  club_id: string;
  name: string;
  holes: 9 | 18;
  first_tee_time: string;
  last_tee_time: string;
  interval_minutes: number;
  max_players: number;
  booking_days_ahead: number;
  /** Duur van een ronde; twee boekingen van hetzelfde lid mogen niet overlappen */
  round_minutes: number;
  active: boolean;
}

export interface CourseTee {
  id: string;
  course_id: string;
  name: string;
  gender: Gender;
  course_rating: number;
  slope_rating: number;
  par: number;
}

export interface CourseHole {
  course_id: string;
  number: number;
  par: number;
  stroke_index: number;
}

export interface TeeSheetRow {
  booking_id: string;
  starts_at: string;
  created_by: string | null;
  player_id: string | null;
  member_id: string | null;
  player_name: string | null;
  handicap_index: number | null;
  checked_in: boolean | null;
}

export interface Competition {
  id: string;
  club_id: string;
  course_id: string | null;
  name: string;
  description: string | null;
  starts_at: string;
  registration_deadline: string | null;
  format: CompetitionFormat;
  max_participants: number | null;
  entry_fee_cents: number;
  max_handicap: number | null;
  qualifying: boolean;
  status: CompetitionStatus;
}

export interface Round {
  id: string;
  club_id: string;
  member_id: string;
  course_tee_id: string | null;
  competition_id: string | null;
  played_on: string;
  hole_scores: number[];
  course_handicap: number | null;
  gross_score: number;
  stableford_points: number | null;
  score_differential: number | null;
  qualifying: boolean;
}

export interface NewsPost {
  id: string;
  club_id: string;
  title: string;
  body: string;
  image_url: string | null;
  pinned: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  club_id: string;
  member_id: string;
  invoice_number: string | null;
  description: string | null;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  collect_by_direct_debit: boolean;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  paid_cents: number;
  created_at: string;
  finalized_at: string | null;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price_cents: number;
  vat_rate: number;
  ledger_account_id: string | null;
  line_total_cents: number;
  vat_cents: number;
}

export interface Payment {
  id: string;
  club_id: string;
  invoice_id: string;
  amount_cents: number;
  method: PaymentMethod;
  paid_on: string;
  reference: string | null;
  provider_payment_id: string | null;
  created_at: string;
}

export interface SepaMandate {
  id: string;
  club_id: string;
  member_id: string;
  mandate_reference: string;
  account_holder: string;
  iban: string;
  bic: string | null;
  signed_on: string;
  first_collected: boolean;
  status: 'active' | 'revoked';
}

export interface DirectDebitBatch {
  id: string;
  club_id: string;
  collection_date: string;
  status: 'draft' | 'exported' | 'processed';
  message_id: string;
  total_cents: number;
  item_count: number;
  created_at: string;
  exported_at: string | null;
}

export interface LedgerAccount {
  id: string;
  club_id: string;
  code: string;
  name: string;
  type: LedgerAccountType;
  active: boolean;
}

export interface LedgerBalance {
  club_id: string;
  ledger_account_id: string;
  code: string;
  name: string;
  type: LedgerAccountType;
  debit_cents: number;
  credit_cents: number;
  balance_cents: number;
}

export interface MemberBalance {
  club_id: string;
  member_id: string;
  outstanding_cents: number | null;
  overdue_cents: number | null;
  open_invoices: number;
}

export type ProductCategory = 'rental' | 'range' | 'greenfee' | 'lesson' | 'food' | 'proshop' | 'event' | 'storage' | 'playing_right';
export type CapacityScope = 'slot' | 'day' | 'season';
export type HandicartPassType = 'permanent' | 'temporary';
export type OrderStatus = 'placed' | 'fulfilled' | 'cancelled';
export type LeadType = 'upgrade' | 'referral' | 'lesson' | 'family';
export type EntitlementKind = 'intro' | 'weekend';
export type MembershipChangeKind = 'pause' | 'switch' | 'cancel';
export type MembershipChangeStatus = 'requested' | 'approved' | 'rejected';
export type SponsorPlacement = 'home' | 'scorecard';
export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

export interface Product {
  id: string;
  club_id: string;
  category: ProductCategory;
  name: string;
  description: string | null;
  price_cents: number;
  vat_rate: number;
  ledger_account_id: string | null;
  /** Aantal beschikbaar per starttijd (slot), per dag of per seizoen */
  capacity: number | null;
  capacity_scope: CapacityScope;
  /** Tarief voor Stichting Handicart-pashouders (excl. btw) */
  handicart_price_cents: number | null;
  /** Wat het lid na bestellen moet weten, bv. waar de sleutel ligt */
  pickup_note: string | null;
  /** Speelrecht dat bij aankoop wordt toegekend (introductiekaart, weekendronde) */
  grants_kind: EntitlementKind | null;
  /** Aantal keer te gebruiken; null = onbeperkt binnen de looptijd */
  grants_uses: number | null;
  grants_days: number;
  icon: string | null;
  sort: number;
  active: boolean;
}

export interface Order {
  id: string;
  club_id: string;
  member_id: string;
  booking_id: string | null;
  competition_id: string | null;
  status: OrderStatus;
  fulfil_on: string;
  total_cents: number;
  invoice_id: string | null;
  note: string | null;
  created_at: string;
  fulfilled_at: string | null;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price_cents: number;
  vat_rate: number;
  handicart: boolean;
}

export interface Lead {
  id: string;
  club_id: string;
  member_id: string | null;
  type: LeadType;
  name: string | null;
  email: string | null;
  phone: string | null;
  note: string | null;
  membership_type_id: string | null;
  value_cents: number | null;
  status: LeadStatus;
  created_at: string;
}

export interface MemberEntitlement {
  id: string;
  club_id: string;
  member_id: string;
  kind: EntitlementKind;
  uses_left: number | null;
  valid_from: string;
  valid_until: string;
  order_line_id: string | null;
}

export interface MembershipChange {
  id: string;
  club_id: string;
  member_id: string;
  kind: MembershipChangeKind;
  target_membership_type_id: string | null;
  effective_date: string;
  reason: string | null;
  from_cancel_flow: boolean;
  status: MembershipChangeStatus;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
}

export interface Sponsor {
  id: string;
  club_id: string;
  name: string;
  tagline: string | null;
  url: string | null;
  placement: SponsorPlacement;
  hole_number: number | null;
  fee_cents: number;
  valid_until: string | null;
  active: boolean;
  clicks: number;
}
