import { requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui';
import { ImportWizard } from './import-wizard';

export const metadata = { title: 'Leden importeren' };

export default async function ImporterenPage() {
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  const { data: types } = await supabase.from('membership_types').select('name').eq('club_id', ctx.club.id).order('name');
  return (
    <>
      <PageHeader title="Leden importeren" subtitle="Overstappen vanuit je huidige systeem, in één keer" />
      <ImportWizard types={(types ?? []).map((t) => t.name as string)} />
    </>
  );
}
