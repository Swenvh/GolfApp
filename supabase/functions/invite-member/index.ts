// Nodigt leden uit voor de app: maakt (indien nodig) een account aan, koppelt het aan het ledenrecord
// en stuurt de uitnodiging (templates/invite.html) met de naam van de club en de downloadlinks.
// Het lid logt daarna in de app in met dit e-mailadres en een code; een link in de mail is niet nodig.
import { adminClient, corsHeaders, json, userClient } from '../_shared/supabase.ts';

const MAX_PER_CALL = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Club = { name: string; app_ios_url: string | null; app_android_url: string | null };
type Member = { id: string; club_id: string; email: string | null; user_id: string | null; first_name: string; club: Club };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const ids: unknown[] = Array.isArray(body.member_ids) ? body.member_ids : body.member_id ? [body.member_id] : [];
  if (ids.length === 0) return json({ error: 'Geen leden opgegeven' }, 400);
  if (ids.length > MAX_PER_CALL) return json({ error: `Maximaal ${MAX_PER_CALL} leden per keer` }, 400);
  if (!ids.every((id) => typeof id === 'string' && UUID.test(id))) return json({ error: 'Ongeldig lid' }, 400);

  // Autorisatie via RLS: de aanroeper ziet alleen leden die hij mag zien, en moet staf van die club zijn
  const user = userClient(req);
  const { data, error: readError } = await user.from('members')
    .select('id, club_id, email, user_id, first_name, club:clubs(name, app_ios_url, app_android_url)')
    .in('id', ids as string[]);
  if (readError) return json({ error: 'Leden ophalen mislukt' }, 500);
  const members = (data ?? []) as unknown as Member[];
  if (members.length !== ids.length) return json({ error: 'Lid niet gevonden' }, 404);
  const clubIds = new Set(members.map((m) => m.club_id));
  if (clubIds.size !== 1) return json({ error: 'Nodig leden van één club tegelijk uit' }, 400);
  const clubId = members[0]!.club_id;
  const { data: allowed } = await user.rpc('is_club_staff', { p_club: clubId, p_roles: ['secretariat'] });
  if (!allowed) return json({ error: 'Geen rechten' }, 403);

  const admin = adminClient();
  const result = { sent: 0, existing: 0, no_email: 0, already: 0, failed: 0, error: null as string | null };

  for (const m of members) {
    if (!m.email) { result.no_email++; continue; }
    if (m.user_id) { result.already++; continue; }

    let userId: string | undefined;
    let sent = false;
    const invited = await admin.auth.admin.inviteUserByEmail(m.email, {
      data: {
        club_name: m.club.name,
        first_name: m.first_name,
        ios_url: m.club.app_ios_url ?? '',
        android_url: m.club.app_android_url ?? '',
      },
    });
    if (invited.data.user) {
      userId = invited.data.user.id;
      sent = true;
    } else if (invited.error && /already|registered|exists/i.test(invited.error.message)) {
      // Heeft al een account (bijvoorbeeld lid van een andere club): koppelen, inloggen kan meteen
      const { data: existingId } = await admin.rpc('auth_user_id_by_email', { p_email: m.email });
      userId = existingId ?? undefined;
    } else {
      // Bijvoorbeeld de limiet van de mailserver: stoppen, de rest kan later opnieuw
      result.failed++;
      result.error = invited.error?.message ?? 'Uitnodigen mislukt';
      break;
    }
    if (!userId) { result.failed++; continue; }

    const { error } = await admin.from('members')
      .update({ user_id: userId, ...(sent ? { app_invited_at: new Date().toISOString() } : {}) })
      .eq('id', m.id).eq('club_id', clubId);
    if (error) { result.failed++; continue; }
    if (sent) result.sent++; else result.existing++;
  }

  return json(result, result.failed > 0 && result.sent + result.existing === 0 ? 502 : 200);
});
