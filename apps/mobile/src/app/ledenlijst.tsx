import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { fullName } from '@golfapp/shared';
import { Avatar, Empty, Input, Loading, Row, T } from '@/components/ui';
import { formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Entry = { id: string; first_name: string; infix: string | null; last_name: string; handicap_index: number | null };

export default function Ledenlijst() {
  const member = useMember();
  const [q, setQ] = useState('');
  const { data, loading } = useQuery(async () =>
    unwrap(await supabase.rpc('club_directory', { p_club: member.club_id })) as Entry[], [member.club_id]);

  const sections = useMemo(() => {
    const list = (data ?? []).filter((d) => fullName(d).toLowerCase().includes(q.toLowerCase()));
    const map = new Map<string, Entry[]>();
    for (const e of list) {
      const letter = e.last_name[0]!.toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), e]);
    }
    return [...map].map(([title, data]) => ({ title, data }));
  }, [data, q]);

  if (loading) return <Loading />;
  const total = sections.reduce((s, x) => s + x.data.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.chalk }}>
      <View style={{ padding: space.lg, paddingBottom: space.sm }}>
        <Input placeholder={`Zoek in ${data?.length ?? 0} leden`} value={q} onChangeText={setQ} />
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(d) => d.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}><T variant="eyebrow" color={colors.brass}>{section.title}</T></View>
        )}
        renderItem={({ item }) => (
          <Row gap={space.md} style={styles.row}>
            <Avatar name={fullName(item)} size={38} tone={item.id === member.id ? 'dark' : 'pine'} />
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong">{item.first_name} {item.infix ? `${item.infix} ` : ''}<T variant="bodyStrong" style={{ fontFamily: fonts.bodyHeavy }}>{item.last_name}</T></T>
            </View>
            <View style={styles.hcp}><T variant="small" color={colors.pine800} style={{ fontFamily: fonts.bodyBold }}>{formatHandicap(item.handicap_index)}</T></View>
          </Row>
        )}
        ListEmptyComponent={<Empty icon="search-outline" title="Niemand gevonden">Probeer een andere naam.</Empty>}
        ListFooterComponent={<T variant="small" color={colors.mist} style={{ textAlign: 'center', padding: space.xl }}>{total} leden · wie zich afmeldt voor de ledenlijst staat er niet in</T>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { backgroundColor: colors.chalk, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 6 },
  row: { backgroundColor: colors.paper, paddingHorizontal: space.lg, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  hcp: { backgroundColor: colors.pine50, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, minWidth: 48, alignItems: 'center' },
});
