import type { Order, Product, ProductCategory } from '@golfapp/shared';
import { supabase } from './supabase';
import { unwrap } from './useQuery';

export async function fetchProducts(clubId: string, categories?: ProductCategory[]): Promise<Product[]> {
  let q = supabase.from('products').select('*').eq('club_id', clubId).eq('active', true).order('sort');
  if (categories) q = q.in('category', categories);
  return unwrap(await q) as Product[];
}

/** Wat er nog vrij is: buggy's rond een starttijd, lessen per dag, kluisjes per seizoen. */
export async function fetchAvailability(clubId: string, day: string, startsAt?: string): Promise<Map<string, number>> {
  const rows = unwrap(await supabase.rpc('product_availability', { p_club: clubId, p_day: day, p_starts_at: startsAt ?? null })) as { product_id: string; remaining: number }[];
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

/** Wat het lid na bestellen moet weten. De club vult dit per product in; anders een neutrale tekst. */
export function fulfilmentHint(p: Pick<Product, 'category' | 'pickup_note'>): string {
  if (p.pickup_note) return p.pickup_note;
  switch (p.category) {
    case 'rental': return 'Sleutel ophalen bij de receptie';
    case 'greenfee': return 'Je gast hoeft niet langs de balie';
    case 'lesson': return 'De pro neemt contact met je op om een tijd af te spreken';
    case 'storage': return 'De ledenadministratie mailt je je nummer';
    case 'event': return 'Na afloop van de wedstrijd';
    default: return 'Staat op je rekening';
  }
}
