import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { fullName } from '@golfapp/shared';
import { Body, Input, Loading, Row } from '@/components/ui';
import { formatHandicap } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Entry = { id: string; first_name: string; infix: string | null; last_name: string; handicap_index: number | null };

export default function Ledenlijst() {
  const member = useMember();
  const t = useTheme();
  const [q, setQ] = useState('');
  const { data, loading } = useQuery(async () =>
    unwrap(await supabase.rpc('club_directory', { p_club: member.club_id })) as Entry[], [member.club_id]);
  if (loading) return <Loading />;
  const list = (data ?? []).filter((d) => fullName(d).toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ padding: 16 }}><Input placeholder="Zoek lid…" value={q} onChangeText={setQ} /></View>
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: t.border, backgroundColor: t.card }}>
            <Body>{item.last_name}, {item.first_name}{item.infix ? ` ${item.infix}` : ''}</Body>
            <Body muted>{formatHandicap(item.handicap_index)}</Body>
          </Row>
        )}
        ListFooterComponent={<Body muted style={{ textAlign: 'center', padding: 16, fontSize: 12 }}>{list.length} leden · leden die zich hebben afgemeld voor de ledenlijst worden niet getoond</Body>}
      />
    </View>
  );
}
