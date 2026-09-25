// Start een iDEAL-betaling (Mollie) voor een openstaande factuur van het ingelogde lid.
import { adminClient, corsHeaders, json, userClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const { invoice_id } = await req.json().catch(() => ({}));
  if (!invoice_id) return json({ error: 'invoice_id ontbreekt' }, 400);

  // RLS garandeert dat een lid alleen zijn eigen facturen ziet
  const { data: invoice } = await userClient(req).from('invoices')
    .select('id, club_id, member_id, invoice_number, status, total_cents, paid_cents, club:clubs(name)')
    .eq('id', invoice_id).maybeSingle();
  if (!invoice) return json({ error: 'Factuur niet gevonden' }, 404);
  if (invoice.status !== 'open') return json({ error: 'Factuur staat niet open' }, 400);
  const amount = invoice.total_cents - invoice.paid_cents;
  if (amount <= 0) return json({ error: 'Niets te betalen' }, 400);

  const admin = adminClient();
  const { data: settings } = await admin.from('club_payment_settings').select('mollie_api_key').eq('club_id', invoice.club_id).maybeSingle();
  if (!settings) return json({ error: 'Club heeft online betalen niet ingesteld' }, 400);

  const functionsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;
  const res = await fetch('https://api.mollie.com/v2/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.mollie_api_key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: { currency: 'EUR', value: (amount / 100).toFixed(2) },
      description: `${(invoice.club as unknown as { name: string }).name} factuur ${invoice.invoice_number}`,
      method: 'ideal',
      redirectUrl: Deno.env.get('PAYMENT_RETURN_URL') ?? 'greenside://facturen',
      webhookUrl: `${functionsUrl}/mollie-webhook`,
      metadata: { invoice_id: invoice.id, club_id: invoice.club_id },
    }),
  });
  const payment = await res.json();
  if (!res.ok) return json({ error: payment.detail ?? 'Mollie-fout' }, 502);

  await admin.from('payment_intents').insert({
    provider_payment_id: payment.id,
    club_id: invoice.club_id,
    invoice_id: invoice.id,
    member_id: invoice.member_id,
    amount_cents: amount,
  });
  return json({ checkoutUrl: payment._links.checkout.href });
});
