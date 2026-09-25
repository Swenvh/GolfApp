import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { formatEuro, invoiceStatusLabel, localDate, type Invoice } from '@golfapp/shared';
import { Card, Empty, ErrorText, Eyebrow, Group, Pill, Row, Screen, T } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';
import { Pressable } from 'react-native';

export default function Facturen() {
  const member = useMember();
  const { data, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('invoices').select('*').eq('member_id', member.id)
      .order('issue_date', { ascending: false })) as Invoice[], [member.id]);
  const today = localDate();
  const open = (data ?? []).filter((i) => i.status === 'open');
  const due = open.reduce((s, i) => s + i.total_cents - i.paid_cents, 0);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Card tone="pine" style={{ padding: space.xl }}>
        <Eyebrow color={colors.brassLight}>Openstaand</Eyebrow>
        <Text style={styles.amount}>{formatEuro(due)}</Text>
        <T variant="small" color={colors.onDarkMuted}>
          {open.length === 0 ? 'Je bent helemaal bij. Dank je wel!' : `${open.length} ${open.length === 1 ? 'factuur' : 'facturen'} · ${open.some((i) => i.collect_by_direct_debit) ? 'deels via automatische incasso' : 'te betalen met iDEAL'}`}
        </T>
      </Card>
      <ErrorText message={error} />
      {data?.length === 0 && <Empty icon="receipt-outline" title="Nog geen facturen" />}
      {!!data?.length && (
        <Group>
          {data.map((i, k) => {
            const overdue = i.status === 'open' && i.due_date < today;
            return (
              <Pressable key={i.id} onPress={() => router.push({ pathname: '/factuur/[id]', params: { id: i.id } })}
                style={({ pressed }) => [styles.row, k < data.length - 1 && styles.divider, pressed && { backgroundColor: colors.pine50 }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <T variant="bodyStrong" numberOfLines={1}>{i.description}</T>
                  <Row gap={6}>
                    <T variant="small" color={colors.slate}>{i.invoice_number} · {formatDate(i.issue_date, { day: 'numeric', month: 'short', year: 'numeric' })}</T>
                  </Row>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.rowAmount}>{formatEuro(i.total_cents)}</Text>
                  <Pill label={overdue ? 'Vervallen' : invoiceStatusLabel[i.status]}
                    tone={overdue ? 'flag' : i.status === 'open' ? 'brass' : i.status === 'paid' ? 'pine' : 'neutral'} />
                </View>
              </Pressable>
            );
          })}
        </Group>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amount: { fontFamily: fonts.display, fontSize: 44, color: colors.onDark, letterSpacing: -1, marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowAmount: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
});
