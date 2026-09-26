import type { Order, Product, ProductCategory } from '@golfapp/shared';
import { supabase } from './supabase';
import { unwrap } from './useQuery';

export async function fetchProducts(clubId: string, categories?: ProductCategory[]): Promise<Product[]> {
  let q = supabase.from('products').select('*').eq('club_id', clubId).eq('active', true).order('sort');
  if (categories) q = q.in('category', categories);
  return unwrap(await q) as Product[];
}

/** Resterende voorraad per product op een dag (alleen producten met een dagcapaciteit). */
export async function fetchAvailability(clubId: string, day: string): Promise<Map<string, number>> {
  const rows = unwrap(await supabase.rpc('product_availability', { p_club: clubId, p_day: day })) as { product_id: string; remaining: number }[];
  return new Map(rows.map((r) => [r.product_id, r.remaining]));
}

export interface OrderInput {
  memberId: string;
  lines: { productId: string; quantity: number }[];
  bookingId?: string | null;
  competitionId?: string | null;
  note?: string;
}

/** Plaatst de bestelling; de club factureert direct (incasso of iDEAL). */
export async function placeOrder(input: OrderInput): Promise<Order> {
  return unwrap(await supabase.rpc('place_order', {
    p_member: input.memberId,
    p_lines: input.lines.filter((l) => l.quantity > 0).map((l) => ({ product_id: l.productId, quantity: l.quantity })),
    p_booking: input.bookingId ?? null,
    p_competition: input.competitionId ?? null,
    p_note: input.note ?? null,
  })) as Order;
}

export async function cancelOrder(orderId: string): Promise<void> {
  unwrap(await supabase.rpc('cancel_order', { p_order: orderId }));
}

/** Leesbare zin voor waar/wanneer iets klaarstaat. */
export const fulfilmentHint: Record<ProductCategory, string> = {
  rental: 'Staat klaar bij de caddiemaster',
  range: 'Staat klaar bij de driving range',
  greenfee: 'Wordt op jouw rekening gezet',
  lesson: 'De pro neemt contact met je op voor een tijd',
  food: 'Je tafel staat klaar na je ronde',
  proshop: 'Ophalen bij de caddiemaster of in de proshop',
  event: 'Na afloop van de wedstrijd',
};
