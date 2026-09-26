import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { localTime } from '@golfapp/shared';
import { Perforation } from './brand';
import { Avatar, Card, Eyebrow, Row, T } from './ui';
import { capitalize, formatDate } from '@/lib/format';
import { colors, fonts, space } from '@/lib/theme';

export interface TicketProps {
  startsAt: string;
  courseName: string;
  players: { name: string; guest?: boolean; me?: boolean }[];
  maxPlayers?: number;
  onPress?: () => void;
  background?: string;
  /** Bestelde extra's die klaarstaan, bv. ['E-buggy', 'Range-emmer'] */
  extras?: string[];
}

/** Een starttijd als ticket: groot tijdstip, perforatie, en de flight eronder. */
export function TeeTicket({ startsAt, courseName, players, maxPlayers = 4, onPress, background = colors.chalk, extras = [] }: TicketProps) {
  return (
    <Card elevated onPress={onPress} style={{ padding: 0, gap: 0 }}>
      <Row style={{ padding: space.lg, paddingBottom: space.md, alignItems: 'flex-end' }} gap={space.lg}>
        <View style={{ gap: 2 }}>
          <Eyebrow>Tee-off</Eyebrow>
          <T variant="hero" style={{ fontVariant: ['tabular-nums'], fontSize: 44, lineHeight: 46 }}>{localTime(startsAt)}</T>
        </View>
        <View style={{ flex: 1, gap: 2, paddingBottom: 4 }}>
          <T variant="bodyStrong">{capitalize(formatDate(startsAt, { weekday: 'long', day: 'numeric', month: 'long' }))}</T>
          <T variant="small" color={colors.slate}>{courseName}</T>
        </View>
      </Row>
      <Perforation background={background} />
      <Row style={{ padding: space.lg, paddingTop: space.md, justifyContent: 'space-between' }}>
        <Row gap={-8}>
          {players.map((p, i) => (
            <View key={i} style={{ borderRadius: 20, borderWidth: 2, borderColor: colors.paper }}>
              <Avatar name={p.name} size={32} tone={p.me ? 'dark' : p.guest ? 'brass' : 'pine'} />
            </View>
          ))}
        </Row>
        <T variant="small" color={colors.slate} style={{ fontFamily: fonts.bodySemibold }}>
          {players.length === 1 ? 'Alleen jij' : `Flight van ${players.length}`} · {maxPlayers - players.length} vrij
        </T>
      </Row>
      {extras.length > 0 && (
        <Row gap={8} style={{ paddingHorizontal: space.lg, paddingBottom: space.lg, marginTop: -4, flexWrap: 'wrap' }}>
          <Ionicons name="checkmark-circle" size={16} color={colors.pine600} />
          <T variant="small" color={colors.pine700} style={{ fontFamily: fonts.bodySemibold, flex: 1 }}>Geregeld: {extras.join(' · ')}</T>
        </Row>
      )}
    </Card>
  );
}
