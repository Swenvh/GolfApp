import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { competitionFormatLabel, type Competition } from '@golfapp/shared';
import { Card, Empty, ErrorText, Pill, Row, Screen, Segmented, T } from '@/components/ui';
import { localTime } from '@golfapp/shared';
import { capitalize } from '@/lib/format';
import { useMember } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, space } from '@/lib/theme';
import { unwrap, useQuery } from '@/lib/useQuery';

type Item = Competition & { competition_entries: { member_id: string }[] };
const dayFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', timeZone: 'Europe/Amsterdam' });
const monFmt = new Intl.DateTimeFormat('nl-NL', { month: 'short', timeZone: 'Europe/Amsterdam' });
const wdFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', timeZone: 'Europe/Amsterdam' });

export default function Wedstrijden() {
  const member = useMember();
  const [tab, setTab] = useState<'komend' | 'uitslagen'>('komend');
  const { data, error, refreshing, refresh } = useQuery(async () =>
    unwrap(await supabase.from('competitions').select('*, competition_entries(member_id)')
      .eq('club_id', member.club_id).order('starts_at')) as Item[], [member.club_id]);

  const now = new Date().toISOString();
  const list = tab === 'komend'
    ? (data ?? []).filter((c) => c.starts_at >= now)
    : (data ?? []).filter((c) => c.starts_at < now).reverse();

  return (
    <Screen title="Wedstrijden" eyebrow="Clubkalender" refreshing={refreshing} onRefresh={refresh}>
      <Segmented options={[{ key: 'komend', label: 'Komend' }, { key: 'uitslagen', label: 'Uitslagen' }]} value={tab} onChange={setTab} />
      <ErrorText message={error} />
      {list.length === 0 && (
        <Empty icon="trophy-outline" title={tab === 'komend' ? 'Geen wedstrijden gepland' : 'Nog geen uitslagen'}>
          {tab === 'komend' ? 'Nieuwe wedstrijden verschijnen hier zodra de wedstrijdcommissie ze openzet.' : 'Na afloop van een wedstrijd vind je hier het klassement.'}
        </Empty>
      )}
      {list.map((c) => {
        const joined = c.competition_entries.some((e) => e.member_id === member.id);
        const d = new Date(c.starts_at);
        const spots = c.max_participants ? c.max_participants - c.competition_entries.length : null;
        return (
          <Card key={c.id} onPress={() => router.push({ pathname: '/wedstrijd/[id]', params: { id: c.id } })}>
            <Row gap={space.lg} style={{ alignItems: 'flex-start' }}>
              <View style={[styles.date, joined && { backgroundColor: colors.pine800 }]}>
                <Text style={[styles.dateMon, joined && { color: colors.brassLight }]}>{monFmt.format(d).replace('.', '')}</Text>
                <Text style={[styles.dateDay, joined && { color: colors.onDark }]}>{dayFmt.format(d)}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="small" color={colors.slate}>{capitalize(wdFmt.format(d))} · {localTime(c.starts_at)}</T>
                <T variant="subheading" style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 23 }}>{c.name}</T>
                <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 4 }}>
                  <Pill label={competitionFormatLabel[c.format]} tone="pine" />
                  {c.qualifying && <Pill label="Qualifying" tone="neutral" />}
                  {joined ? <Pill label="Ingeschreven" tone="brass" icon="checkmark" />
                    : spots !== null && spots <= 5 && spots > 0 ? <Pill label={`Nog ${spots} plekken`} tone="flag" /> : null}
                </Row>
              </View>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: { width: 58, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.pine50, alignItems: 'center' },
  dateMon: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.pine600 },
  dateDay: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.pine900 },
});
