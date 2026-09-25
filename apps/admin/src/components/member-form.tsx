import { memberStatusLabel, type Member, type MemberStatus, type MembershipType } from '@golfapp/shared';
import { saveMember } from '@/app/(beheer)/leden/actions';
import { Button, Field } from './ui';

export function MemberForm({ member, types, nextNumber }: {
  member?: Member;
  types: Pick<MembershipType, 'id' | 'name'>[];
  nextNumber?: string;
}) {
  const m = member;
  return (
    <form action={saveMember} className="space-y-6 p-4">
      {m && <input type="hidden" name="id" value={m.id} />}
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <Field label="Voornaam"><input name="first_name" defaultValue={m?.first_name} required /></Field>
        <Field label="Tussenvoegsel"><input name="infix" defaultValue={m?.infix ?? ''} /></Field>
        <Field label="Achternaam"><input name="last_name" defaultValue={m?.last_name} required /></Field>
        <Field label="Geslacht">
          <select name="gender" defaultValue={m?.gender ?? ''}>
            <option value="">—</option><option value="male">Man</option><option value="female">Vrouw</option><option value="other">Anders</option>
          </select>
        </Field>
        <Field label="Geboortedatum"><input type="date" name="date_of_birth" defaultValue={m?.date_of_birth ?? ''} /></Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <Field label="E-mailadres"><input type="email" name="email" defaultValue={m?.email ?? ''} /></Field>
        <Field label="Telefoon"><input name="phone" defaultValue={m?.phone ?? ''} /></Field>
        <div />
        <Field label="Straat"><input name="street" defaultValue={m?.street ?? ''} /></Field>
        <Field label="Huisnummer"><input name="house_number" defaultValue={m?.house_number ?? ''} /></Field>
        <div />
        <Field label="Postcode"><input name="postal_code" defaultValue={m?.postal_code ?? ''} pattern="[1-9][0-9]{3} ?[A-Za-z]{2}" /></Field>
        <Field label="Plaats"><input name="city" defaultValue={m?.city ?? ''} /></Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <Field label="Lidnummer"><input name="member_number" defaultValue={m?.member_number ?? nextNumber} required /></Field>
        <Field label="NGF-nummer (GSN)"><input name="ngf_number" defaultValue={m?.ngf_number ?? ''} /></Field>
        <Field label="Handicap-index" hint="Plus-handicap als +1,2">
          <input name="handicap_index" defaultValue={m?.handicap_index != null ? String(m.handicap_index).replace('.', ',').replace(/^-/, '+') : ''} />
        </Field>
        <Field label="Lidmaatschap">
          <select name="membership_type_id" defaultValue={m?.membership_type_id ?? ''}>
            <option value="">—</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={m?.status ?? 'active'}>
            {(Object.keys(memberStatusLabel) as MemberStatus[]).map((s) => <option key={s} value={s}>{memberStatusLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="IBAN"><input name="iban" defaultValue={m?.iban ?? ''} /></Field>
        <Field label="Lid sinds"><input type="date" name="join_date" defaultValue={m?.join_date ?? new Date().toISOString().slice(0, 10)} /></Field>
        <Field label="Einddatum lidmaatschap"><input type="date" name="end_date" defaultValue={m?.end_date ?? ''} /></Field>
      </fieldset>

      <Field label="Interne notities (niet zichtbaar voor het lid)">
        <textarea name="notes" rows={3} defaultValue={m?.notes ?? ''} />
      </Field>

      <Button type="submit">{m ? 'Wijzigingen opslaan' : 'Lid toevoegen'}</Button>
    </form>
  );
}
