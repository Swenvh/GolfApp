// Mollie roept deze webhook aan bij statuswijzigingen. We vertrouwen de body niet:
// de status wordt altijd opnieuw bij Mollie opgehaald met de API-sleutel van de club.
import { adminClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  const form = await req.formData().catch(() => null);
  const id = form?.get('id')?.toString();
  if (!id) return new Response('missing id', { status: 400 });

  const admin = adminClient();
  const { data: intent } = await admin.from('payment_intents').select('*').eq('provider_payment_id', id).maybeSingle();
  if (!intent) return new Response('ok'); // onbekend: negeren (Mollie verwacht 200)

  const { data: settings } = await admin.from('club_payment_settings').select('mollie_api_key').eq('club_id', intent.club_id).single();
  const res = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
    headers: { Authorization: `Bearer ${settings!.mollie_api_key}` },
  });
  if (!res.ok) return new Response('mollie error', { status: 502 });
  const payment = await res.json();

  await admin.from('payment_intents').update({ status: payment.status, updated_at: new Date().toISOString() })
    .eq('provider_payment_id', id);

  if (payment.status === 'paid') {
    // provider_payment_id is uniek: dubbele webhooks boeken nooit twee keer
    const { error } = await admin.from('payments').insert({
      club_id: intent.club_id,
      invoice_id: intent.invoice_id,
      amount_cents: Math.round(Number(payment.amount.value) * 100),
      method: 'ideal',
      paid_on: (payment.paidAt ?? new Date().toISOString()).slice(0, 10),
      reference: `iDEAL ${id}`,
      provider_payment_id: id,
    });
    if (error && error.code !== '23505') return new Response(error.message, { status: 500 });
  }
  return new Response('ok');
});
