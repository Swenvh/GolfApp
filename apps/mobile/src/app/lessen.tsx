import { router } from 'expo-router';
import { formatEuro, priceInclVat, type Product } from '@golfapp/shared';
import { Card, Empty, ErrorText, Icon, Loading, Row, Screen, T } from '@/components/ui';
import { productIcon } from '@/components/offer';
import { haptic } from '@/lib/haptics';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

/** Lessen bij de pro, zoals de club ze onder Aanbod heeft gezet. */
export default function Lessen() {
  const member = useMember();
  const { data, loading, error } = useQuery(async () =>
    unwrap(await supabase.from('products').select('*').eq('club_id', member.club_id).eq('category', 'lesson').eq('active', true).order('sort')) as Product[],
  [member.club_id]);

  if (loading) return <Loading />;
  return (
    <Screen>
      <ErrorText message={error} />
      {data?.length === 0 && <Empty icon="school-outline" title="Nog geen lessen">De club biedt nog geen lessen aan in de app. Vraag de pro of de receptie naar de mogelijkheden.</Empty>}
      {data?.map((p) => (
        <Card key={p.id} elevated style={{ gap: space.sm, marginTop: space.sm }}
          onPress={() => { haptic.tap(); router.push({ pathname: '/aanbod/[id]', params: { id: p.id, context: 'Golfles' } }); }}>
          <Row gap={space.md} style={{ alignItems: 'flex-start' }}>
            <Icon name={productIcon(p)} size={22} color={colors.pine700} />
            <T variant="subheading" style={{ flex: 1 }}>{p.name}</T>
            <T variant="subheading" color={colors.pine700}>{formatEuro(priceInclVat(p.price_cents, Number(p.vat_rate)))}</T>
          </Row>
          {p.description && <T color={colors.slate}>{p.description}</T>}
          {p.pickup_note && <T variant="small" color={colors.mist}>{p.pickup_note}</T>}
        </Card>
      ))}
    </Screen>
  );
}
