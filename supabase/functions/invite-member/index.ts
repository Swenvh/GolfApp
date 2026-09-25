// Nodigt een lid uit voor de app: maakt (indien nodig) een account aan en koppelt het aan het ledenrecord.
import { adminClient, corsHeaders, json, userClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const { member_id } = await req.json().catch(() => ({}));
  if (!member_id) return json({ error: 'member_id ontbreekt' }, 400);

  // Autorisatie via RLS: alleen staf van de club ziet het volledige ledenrecord
  const user = userClient(req);
  const { data: member } = await user.from('members').select('id, club_id, email, user_id').eq('id', member_id).maybeSingle();
  if (!member) return json({ error: 'Lid niet gevonden' }, 404);
  const { data: allowed } = await user.rpc('is_club_staff', { p_club: member.club_id, p_roles: ['secretariat'] });
  if (!allowed) return json({ error: 'Geen rechten' }, 403);
  if (!member.email) return json({ error: 'Lid heeft geen e-mailadres' }, 400);
  if (member.user_id) return json({ ok: true, alreadyLinked: true });

  const admin = adminClient();
  let userId: string | undefined;
  const invited = await admin.auth.admin.inviteUserByEmail(member.email);
  if (invited.data.user) {
    userId = invited.data.user.id;
  } else {
    // Bestaat al (bv. lid van een andere club): zoek het bestaande account op
    const { data } = await admin.rpc('auth_user_id_by_email', { p_email: member.email });
    userId = data ?? undefined;
  }
  if (!userId) return json({ error: invited.error?.message ?? 'Uitnodigen mislukt' }, 500);

  const { error } = await admin.from('members').update({ user_id: userId }).eq('id', member.id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
