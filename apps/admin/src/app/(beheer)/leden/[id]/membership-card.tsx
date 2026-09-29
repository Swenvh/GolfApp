import { endOfMembershipYear, formatEuro, localDate, membershipChangeKindLabel, type MembershipChange } from '@golfapp/shared';
import { Badge, Button, Card, Field } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { changeMembership, decideChange } from '../actions';

type Type = { id: string; name: string; annual_fee_cents: number };

/** Lidmaatschap wijzigen of opzeggen namens het lid, en verzoeken uit de app afhandelen. */
export function MembershipCard({ memberId, currentTypeId, endDate, types, changes }: {
  memberId: string; currentTypeId: string | null; endDate: string | null; types: Type[]; changes: MembershipChange[];
}) {
  const today = localDate();
  const nextMonth = (() => { const [y, m] = today.split('-').map(Number) as [number, number]; return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10); })();
  const typeName = (id: string | null) => types.find((t) => t.id === id)?.name ?? '';
  const requested = changes.filter((c) => c.status === 'requested');
  const scheduled = changes.filter((c) => c.status === 'approved' && !c.applied_at);
  const back = `/leden/${memberId}#lidmaatschap`;

  return (
    <div id="lidmaatschap">
      <Card title="Lidmaatschap">
        <div className="space-y-5 p-4 text-sm">
          {requested.map((c) => (
            <div key={c.id} className="space-y-2 rounded-xl border border-brass/40 bg-brass-soft p-3">
              <div className="font-semibold">Verzoek uit de app: {membershipChangeKindLabel[c.kind].toLowerCase()}{c.target_membership_type_id ? ` naar ${typeName(c.target_membership_type_id)}` : ''}</div>
              <div className="text-stone-600">Per {formatDate(c.effective_date)}{c.reason ? ` · ${c.reason}` : ''}</div>
              <form action={decideChange} className="flex gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="back" value={back} />
                <Button type="submit" name="approve" value="1">Goedkeuren</Button>
                <Button type="submit" name="approve" value="0" variant="secondary">Afwijzen</Button>
              </form>
            </div>
          ))}
          {scheduled.map((c) => (
            <p key={c.id} className="flex flex-wrap items-center gap-2">
              <Badge tone="green">Gepland</Badge>
              {membershipChangeKindLabel[c.kind]}{c.target_membership_type_id ? ` naar ${typeName(c.target_membership_type_id)}` : ''} per {formatDate(c.effective_date)}
            </p>
          ))}
          {endDate && <p className="text-stone-600">Lidmaatschap eindigt op {formatDate(endDate)}.</p>}

          <form action={changeMembership} className="space-y-3">
            <input type="hidden" name="member_id" value={memberId} />
            <input type="hidden" name="kind" value="switch" />
            <Field label="Wijzigen naar">
              <select name="target" defaultValue="" required>
                <option value="" disabled>Kies een lidmaatschap</option>
                {types.filter((t) => t.id !== currentTypeId).map((t) => <option key={t.id} value={t.id}>{t.name} · {formatEuro(t.annual_fee_cents)} per jaar</option>)}
              </select>
            </Field>
            <Field label="Per"><input type="date" name="effective_date" defaultValue={nextMonth} min={today} required /></Field>
            <Button type="submit" variant="secondary">Lidmaatschap wijzigen</Button>
          </form>

          {!endDate && (
            <form action={changeMembership} className="space-y-3 border-t border-stone-100 pt-4">
              <input type="hidden" name="member_id" value={memberId} />
              <input type="hidden" name="kind" value="cancel" />
              <Field label="Opzeggen per" hint="Standaard het einde van het verenigingsjaar"><input type="date" name="effective_date" defaultValue={endOfMembershipYear(today)} min={today} required /></Field>
              <Field label="Reden (optioneel)"><input name="reason" maxLength={200} placeholder="Bijvoorbeeld: verhuisd" /></Field>
              <Button type="submit" variant="danger">Lidmaatschap opzeggen</Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
