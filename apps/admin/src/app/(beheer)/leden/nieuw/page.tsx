import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { MemberForm } from '@/components/member-form';
import { Card, Notice, PageHeader } from '@/components/ui';

export const metadata = { title: 'Nieuw lid' };

export default async function NieuwLid({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const [{ data: types }, { data: numbers }] = await Promise.all([
    supabase.from('membership_types').select('id, name').eq('club_id', ctx.club.id).eq('active', true).order('name'),
    supabase.from('members').select('member_number').eq('club_id', ctx.club.id),
  ]);
  const max = Math.max(1000, ...(numbers ?? []).map((n) => Number(n.member_number)).filter(Number.isFinite));

  return (
    <>
      <PageHeader title="Nieuw lid" />
      {error === 'dubbel' && <Notice tone="error">Dit lidnummer bestaat al.</Notice>}
      {error === 'iban' && <Notice tone="error">Het IBAN is ongeldig.</Notice>}
      {error === 'opslaan' && <Notice tone="error">Opslaan mislukt.</Notice>}
      <Card><MemberForm types={types ?? []} nextNumber={String(max + 1)} /></Card>
    </>
  );
}
