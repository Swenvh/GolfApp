import { revalidatePath } from 'next/cache';
import type { NewsPost } from '@golfapp/shared';
import { getStaffContext, hasRole, requireRole } from '@/lib/club';
import { createClient } from '@/lib/supabase/server';
import { Badge, Button, Card, Empty, Field, PageHeader } from '@/components/ui';
import { formatDateTime, str } from '@/lib/format';

export const metadata = { title: 'Nieuws' };

async function publishNews(formData: FormData) {
  'use server';
  const ctx = await requireRole('secretariat');
  const supabase = await createClient();
  await supabase.from('news_posts').insert({
    club_id: ctx.club.id,
    title: str(formData.get('title')),
    body: str(formData.get('body')),
    pinned: formData.get('pinned') === 'on',
    published_at: formData.get('draft') === 'on' ? null : new Date().toISOString(),
    author_id: ctx.userId,
  });
  revalidatePath('/nieuws');
}

async function deleteNews(formData: FormData) {
  'use server';
  await requireRole('secretariat');
  const supabase = await createClient();
  await supabase.from('news_posts').delete().eq('id', String(formData.get('id')));
  revalidatePath('/nieuws');
}

export default async function NieuwsPage() {
  const ctx = await getStaffContext();
  const supabase = await createClient();
  const { data } = await supabase.from('news_posts').select('*').eq('club_id', ctx.club.id)
    .order('pinned', { ascending: false }).order('created_at', { ascending: false });
  const posts = (data ?? []) as NewsPost[];
  const canEdit = hasRole(ctx, 'secretariat');

  return (
    <>
      <PageHeader title="Nieuws" subtitle="Berichten verschijnen direct in de ledenapp" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {posts.length === 0 && <Card><Empty>Nog geen berichten.</Empty></Card>}
          {posts.map((p) => (
            <Card key={p.id}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <div className="mt-0.5 flex gap-2 text-xs text-stone-500">
                      {p.published_at ? formatDateTime(p.published_at) : <Badge>Concept</Badge>}
                      {p.pinned && <Badge tone="green">Vastgepind</Badge>}
                    </div>
                  </div>
                  {canEdit && (
                    <form action={deleteNews}><input type="hidden" name="id" value={p.id} /><button className="text-xs text-red-600 hover:underline">Verwijder</button></form>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-stone-700">{p.body}</p>
              </div>
            </Card>
          ))}
        </div>
        {canEdit && (
          <Card title="Nieuw bericht">
            <form action={publishNews} className="space-y-3 p-4">
              <Field label="Titel"><input name="title" required /></Field>
              <Field label="Bericht"><textarea name="body" rows={8} required /></Field>
              <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="pinned" /> Vastpinnen bovenaan</label>
              <label className="flex items-center gap-2 font-normal"><input type="checkbox" name="draft" /> Opslaan als concept</label>
              <Button type="submit">Plaatsen</Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
