import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { fullName } from '@golfapp/shared';
import type { Membership } from '@/lib/session';
import { formatDate, formatHandicap } from '@/lib/format';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Contours, LogoMark } from './brand';

/** De digitale lidmaatschapskaart: bankpasformaat, laat zich tonen bij de caddiemaster. */
export function MemberCard({ member }: { member: Membership }) {
  const year = new Date().getFullYear();
  return (
    <View style={styles.shadow}>
      <LinearGradient colors={[colors.pine700, colors.pine900, colors.pine950]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Contours seed={member.member_number.length + 4} opacity={0.09} />
        <LinearGradient
          colors={['transparent', 'rgba(217,188,130,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.top}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.eyebrow}>Lidmaatschap {year}</Text>
            <Text numberOfLines={1} style={styles.club}>{member.club.name}</Text>
          </View>
          <LogoMark size={36} />
        </View>

        <View style={{ gap: 4 }}>
          <Text numberOfLines={1} style={styles.name}>{fullName(member)}</Text>
          <View style={styles.fields}>
            <Field label="Lidnummer" value={member.member_number} />
            <Field label="NGF" value={member.ngf_number ?? '—'} />
            <Field label="Hcp" value={formatHandicap(member.handicap_index)} />
            <Field label="Lid sinds" value={formatDate(member.join_date, { year: 'numeric' })} />
          </View>
        </View>
        <View style={styles.foil} />
      </LinearGradient>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.lg, backgroundColor: colors.pine900,
    shadowColor: colors.pine950, shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  card: { aspectRatio: 1.586, borderRadius: radius.lg, padding: space.xl, justifyContent: 'space-between', overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  eyebrow: { fontFamily: fonts.bodyHeavy, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.brassLight },
  club: { fontFamily: fonts.displayItalic, fontSize: 17, color: colors.onDark },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.onDark, letterSpacing: -0.4 },
  fields: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  fieldLabel: { fontFamily: fonts.bodyHeavy, fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.onDarkMuted },
  fieldValue: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.onDark, fontVariant: ['tabular-nums'], letterSpacing: 0.4 },
  foil: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, backgroundColor: colors.brass },
});
