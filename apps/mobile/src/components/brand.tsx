import { useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

/** Beeldmerk: de hole met vlaggenstok, in een cirkel. */
export function LogoMark({ size = 40, tone = 'light' }: { size?: number; tone?: 'light' | 'dark' }) {
  const ring = tone === 'light' ? colors.onDark : colors.pine800;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={22.5} stroke={ring} strokeOpacity={0.35} strokeWidth={1.5} fill="none" />
      <Path d="M11 33.5c4.5-2.2 9.2-3.3 13-3.3s8.5 1.1 13 3.3" stroke={ring} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Line x1={22} y1={31} x2={22} y2={11} stroke={ring} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22.6 11.2 34 15.4l-11.4 4.3z" fill={colors.brass} />
      <Circle cx={27.5} cy={31.2} r={1.9} fill={ring} />
    </Svg>
  );
}

export function Wordmark({ tone = 'light', size = 22 }: { tone?: 'light' | 'dark'; size?: number }) {
  const color = tone === 'light' ? colors.onDark : colors.pine900;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size * 1.55} tone={tone} />
      <Text style={{ fontFamily: fonts.displayItalic, fontSize: size, color, letterSpacing: -0.3 }}>Greenside</Text>
    </View>
  );
}

/**
 * Hoogtelijnen zoals op een baankaart: een paar heuvels waaromheen
 * golvende ringen lopen. Deterministisch, dus elke render gelijk.
 */
export function Contours({ width = 420, height = 360, color = colors.onDark, opacity = 0.055, seed = 3, style }: {
  width?: number; height?: number; color?: string; opacity?: number; seed?: number; style?: StyleProp<ViewStyle>;
}) {
  const paths = useMemo(() => {
    const rand = mulberry(seed);
    // Twee heuvels in tegenover elkaar liggende hoeken, zodat de ringen elkaar nauwelijks kruisen
    const flip = rand() > 0.5;
    const hills = [
      { x: width * (flip ? 0.85 : 0.15), y: height * (0.1 + rand() * 0.2), phase: rand() * Math.PI * 2 },
      { x: width * (flip ? 0.1 : 0.9), y: height * (0.85 + rand() * 0.2), phase: rand() * Math.PI * 2 },
    ];
    const out: string[] = [];
    for (const h of hills) {
      for (let r = 14; r < Math.max(width, height) * 0.55; r += 15) {
        const pts: [number, number][] = [];
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const wobble = 1 + 0.12 * Math.sin(3 * a + h.phase + r / 70) + 0.05 * Math.sin(5 * a - h.phase + r / 110);
          pts.push([h.x + Math.cos(a) * r * 1.3 * wobble, h.y + Math.sin(a) * r * wobble]);
        }
        out.push(smoothClosed(pts));
      }
    }
    return out;
  }, [width, height, seed]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
        {paths.map((d, i) => (
          <Path key={i} d={d} stroke={color} strokeOpacity={opacity} strokeWidth={1} fill="none" />
        ))}
      </Svg>
    </View>
  );
}

/** Perforatielijn met halve cirkels aan de rand: de 'scheurstrook' van een ticket. */
export function Perforation({ background = colors.chalk }: { background?: string }) {
  return (
    <View style={{ height: 20, justifyContent: 'center', marginHorizontal: -1 }}>
      <View style={{ position: 'absolute', left: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: background }} />
      <View style={{ marginHorizontal: 18, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.lineStrong }} />
      <View style={{ position: 'absolute', right: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: background }} />
    </View>
  );
}

/** Gesloten Catmull-Rom-curve door de punten: vloeiende hoogtelijnen zonder hoeken. */
function smoothClosed(p: [number, number][]): string {
  const n = p.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(p[0]![0])} ${f(p[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n]!, p1 = p[i]!, p2 = p[(i + 1) % n]!, p3 = p[(i + 2) % n]!;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
