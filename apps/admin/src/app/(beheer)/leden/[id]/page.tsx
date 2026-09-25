import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  formatEuro, formatIban, fullName, invoiceStatusLabel, memberStatusLabel,
  type Invoice, type Member, type Round, type SepaMandate,
} from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { MemberForm } from '@/components/member-form';
import { Badge, Button, ButtonLink, Card, Empty, Field, Notice, PageHeader, Stat } from '@/components/ui';
import { formatDate, formatHandicap } from '@/lib/format';
import { revokeMandate, saveMandate } from '../actions';
import { inviteMember } from './invite';

const errors: Record<string, string> = {
  iban: 'Het IBAN is ongeldig.',
  dubbel: 'Dit lidnummer bestaat al.',
  'mandaat-dubbel': 'Deze mandaatreferentie bestaat al.',
  opslaan: 'Opslaan mislukt.',
  uitnodiging: 'Uitnodigen mislukt. Controleer het e-mailadres.',
};

export default async function LidDetail({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; invited?: string }>;
}) {
  const { id } = await params;
  const { error, saved, invited } = await searchParams;
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const isFinance = hasRole(ctx, 'finance');
  const canEdit = hasRole(ctx, 'secretariat');

  const { data: member } = await supabase.from('members')
    .select('*, membership_type:membership_types(name, annual_fee_cents)')
    .eq('id', id).eq('club_id', ctx.club.id).maybeSingle();
  if (!member) notFound();
  const m = member as Member & { membership_type: { name: string; annual_fee_cents: number } | null };

  const [types, invoices, mandates, rounds] = await Promise.all([
    supabase.from('membership_types').select('id, name').eq('club_id', ctx.club.id).order('name'),
    isFinance ? supabase.from('invoices').select('*').eq('member_id', id).order('issue_date', { ascending: false })
      : Promise.resolve({ data: [] }),
    isFinance ? supabase.from('sepa_mandates').select('*').eq('member_id', id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('rounds').select('*').eq('member_id', id).order('played_on', { ascending: false }).limit(10),
  ]);
  const inv = (invoices.data ?? []) as Invoice[];
  const outstanding = inv.filter((i) => i.status === 'open').reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  const activeMandate = ((mandates.data ?? []) as SepaMandate[]).find((x) => x.status === 'active');

  return (
    <>
      <PageHeader
        title={fullName(m)}
        subtitle={`Lidnummer ${m.member_number}${m.ngf_number ? ` · NGF ${m.ngf_number}` : ''} · lid sinds ${formatDate(m.join_date)}`}
        actions={isFinance && <ButtonLink href={`/financien/facturen/nieuw?member=${m.id}`}>+ Factuur</ButtonLink>}
      />
      {error && <Notice tone="error">{errors[error] ?? 'Er ging iets mis.'}</Notice>}
      {saved && <Notice tone="success">Opgeslagen.</Notice>}
      {invited && <Notice tone="success">Uitnodiging verstuurd naar {m.email}.</Notice>}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Status" value={memberStatusLabel[m.status]} hint={m.membership_type?.name} />
        <Stat label="Handicap" value={formatHandicap(m.handicap_index)} hint={m.handicap_updated_at ? `bijgewerkt ${formatDate(m.handicap_updated_at)}` : undefined} />
        {isFinance && <Stat label="Openstaand" value={formatEuro(outstanding)} tone={outstanding > 0 ? 'warn' : 'good'} />}
        <Stat label="App-account" value={m.user_id ? 'Gekoppeld' : 'Niet actief'} hint={m.user_id ? undefined : 'Nodig het lid uit voor de app'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Gegevens">
            {canEdit ? <MemberForm member={m} types={types.data ?? []} /> : (
              <dl className="grid gap-3 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-stone-500">E-mail</dt><dd>{m.email ?? '—'}</dd></div>
                <div><dt className="text-stone-500">Telefoon</dt><dd>{m.phone ?? '—'}</dd></div>
                <div><dt className="text-stone-500">Adres</dt><dd>{[m.street, m.house_number].filter(Boolean).join(' ')}<br />{m.postal_code} {m.city}</dd></div>
                <div><dt className="text-stone-500">Geboortedatum</dt><dd>{formatDate(m.date_of_birth)}</dd></div>
              </dl>
            )}
          </Card>

          {isFinance && (
            <Card title="Facturen">
              {inv.length === 0 ? <Empty>Nog geen facturen.</Empty> : (
                <table>
                  <thead className="bg-stone-50"><tr><th>Nummer</th><th>Omschrijving</th><th>Datum</th><th className="text-right">Bedrag</th><th>Status</th></tr></thead>
                  <tbody>
                    {inv.map((i) => (
                      <tr key={i.id}>
                        <td><Link href={`/financien/facturen/${i.id}`} className="text-brand-700 hover:underline">{i.invoice_number ?? 'Concept'}</Link></td>
                        <td>{i.description}</td>
                        <td>{formatDate(i.issue_date)}</td>
                        <td className="text-right tabular-nums">{formatEuro(i.total_cents)}</td>
                        <td><Badge tone={i.status === 'paid' ? 'green' : i.status === 'open' ? 'amber' : 'gray'}>{invoiceStatusLabel[i.status]}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          <Card title="Laatste rondes">
            {(rounds.data ?? []).length === 0 ? <Empty>Nog geen rondes ingevoerd.</Empty> : (
              <table>
                <thead className="bg-stone-50"><tr><th>Datum</th><th>Bruto</th><th>Stableford</th><th>Qualifying</th></tr></thead>
                <tbody>
                  {((rounds.data ?? []) as Round[]).map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.played_on)}</td>
                      <td className="tabular-nums">{r.gross_score}</td>
                      <td className="tabular-nums">{r.stableford_points ?? '—'}</td>
                      <td>{r.qualifying ? 'Ja' : 'Nee'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {!m.user_id && canEdit && (
            <Card title="Toegang tot de app">
              <form action={inviteMember} className="space-y-3 p-4 text-sm">
                <input type="hidden" name="member_id" value={m.id} />
                <p className="text-stone-600">Stuur {m.first_name} een uitnodiging om met {m.email ?? 'een e-mailadres'} in te loggen in de ledenapp.</p>
                <Button type="submit" disabled={!m.email}>Uitnodiging versturen</Button>
              </form>
            </Card>
          )}

          {isFinance && (
            <Card title="SEPA-machtiging">
              {activeMandate ? (
                <div className="space-y-2 p-4 text-sm">
                  <div><span className="text-stone-500">Kenmerk:</span> {activeMandate.mandate_reference}</div>
                  <div><span className="text-stone-500">Rekeninghouder:</span> {activeMandate.account_holder}</div>
                  <div><span className="text-stone-500">IBAN:</span> <span className="font-mono">{formatIban(activeMandate.iban)}</span></div>
                  <div><span className="text-stone-500">Getekend:</span> {formatDate(activeMandate.signed_on)}</div>
                  <div><span className="text-stone-500">Volgende incasso:</span> {activeMandate.first_collected ? 'RCUR (herhaald)' : 'FRST (eerste)'}</div>
                  <form action={revokeMandate}>
                    <input type="hidden" name="member_id" value={m.id} />
                    <input type="hidden" name="mandate_id" value={activeMandate.id} />
                    <Button variant="danger" className="mt-2">Machtiging intrekken</Button>
                  </form>
                </div>
              ) : (
                <form action={saveMandate} className="space-y-3 p-4">
                  <input type="hidden" name="member_id" value={m.id} />
                  <p className="text-sm text-stone-500">Geen actieve machtiging. Leg een nieuwe vast:</p>
                  <Field label="Mandaatkenmerk"><input name="mandate_reference" defaultValue={`DD-${m.member_number}`} required /></Field>
                  <Field label="Rekeninghouder"><input name="account_holder" defaultValue={fullName(m)} required /></Field>
                  <Field label="IBAN"><input name="iban" defaultValue={m.iban ?? ''} required /></Field>
                  <Field label="BIC (optioneel)"><input name="bic" /></Field>
                  <Field label="Datum ondertekening"><input type="date" name="signed_on" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
                  <Button type="submit">Machtiging opslaan</Button>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
