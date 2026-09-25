import { fullName } from '@golfapp/shared';
import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Card, PageHeader } from '@/components/ui';
import { InvoiceForm } from './invoice-form';

export const metadata = { title: 'Nieuwe factuur' };

export default async function NieuweFactuur({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const { member } = await searchParams;
  const ctx = await requireRole('finance');
  const supabase = await createClient();
  const [{ data: members }, { data: accounts }, { data: mandates }] = await Promise.all([
    supabase.from('members').select('id, first_name, infix, last_name, member_number')
      .eq('club_id', ctx.club.id).neq('status', 'resigned').order('last_name'),
    supabase.from('ledger_accounts').select('id, code, name').eq('club_id', ctx.club.id).eq('type', 'revenue').order('code'),
    supabase.from('sepa_mandates').select('member_id').eq('club_id', ctx.club.id).eq('status', 'active'),
  ]);

  return (
    <>
      <PageHeader title="Nieuwe factuur" />
      <Card>
        <InvoiceForm
          members={(members ?? []).map((m) => ({ id: m.id, label: `${fullName(m)} (${m.member_number})` }))}
          accounts={(accounts ?? []).map((a) => ({ id: a.id, label: `${a.code} ${a.name}` }))}
          membersWithMandate={(mandates ?? []).map((m) => m.member_id)}
          defaultMember={member}
          paymentTermDays={ctx.club.payment_term_days}
        />
      </Card>
    </>
  );
}
