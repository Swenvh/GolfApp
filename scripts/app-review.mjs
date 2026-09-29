#!/usr/bin/env node
// Reviewaccount voor Apple en Google aanmaken of terugzetten.
//
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... pnpm app-review
//
// Maakt (of herstelt) het account REVIEW_EMAIL met een nieuw, sterk wachtwoord en bouwt de
// democlub "Golfclub De Proefbaan" opnieuw op met nepleden. Draai dit vóór elke indiening:
// keurders boeken, bestellen en verwijderen soms het account. Het wachtwoord komt alleen
// in App Store Connect / Play Console (notities voor de keurder), nergens anders.
import { randomBytes } from 'node:crypto';

const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.REVIEW_EMAIL ?? 'appreview@greenside.test').toLowerCase();
if (!url || !key) {
  console.error('Zet SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY (alleen op je eigen computer, nooit in de app of in git).');
  process.exit(1);
}

// Voldoet aan de wachtwoordeisen: minimaal 10 tekens met hoofdletters, kleine letters en cijfers
const password = process.env.REVIEW_PASSWORD ?? `Review-${randomBytes(9).toString('base64url')}-7a`;

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function call(method, path, body) {
  const res = await fetch(url + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

async function findUser() {
  for (let page = 1; page < 50; page++) {
    const { ok, data } = await call('GET', `/auth/v1/admin/users?page=${page}&per_page=200`);
    if (!ok) throw new Error(`Gebruikers ophalen mislukt: ${JSON.stringify(data)}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const existing = await findUser();
const account = existing
  ? await call('PUT', `/auth/v1/admin/users/${existing.id}`, { password, email_confirm: true })
  : await call('POST', '/auth/v1/admin/users', { email, password, email_confirm: true });
if (!account.ok) {
  console.error('Account aanmaken mislukt:', account.data?.msg ?? account.data);
  process.exit(1);
}

const reset = await call('POST', '/rest/v1/rpc/review_club_reset', { p_email: email });
if (!reset.ok) {
  console.error('Democlub opbouwen mislukt:', reset.data?.message ?? reset.data);
  process.exit(1);
}

console.log(`
✔ Reviewaccount klaar, democlub opnieuw opgebouwd.

Plak dit in App Store Connect → App Review Information (en Play Console → App access):

  Username: ${email}
  Password: ${password}

  Notes:
  On the login screen, enter the email address above and tap "Stuur inlogcode".
  Because this is the review account, the app asks for a password instead of an
  emailed code. The account is a member of a demo club with fictional members, so
  no real personal data is shown. You can book a tee time, enter a competition,
  order a buggy or lesson from the "Clubhuis" tab, view invoices and delete the account under
  Profiel → Account verwijderen. Payments are on account (no real money).
`);
