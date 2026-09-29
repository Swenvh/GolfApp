import QRCode from 'qrcode';
import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '@/lib/theme';

/**
 * Wat de ballenautomaat van de driving range leest: het clubpasnummer, zoals de club het in de
 * automaat heeft gezet (vaak het nummer van de fysieke pas). Zonder clubpasnummer het lidnummer.
 */
export function rangeCode(member: { member_number: string; club_pass_number: string | null }): string {
  return member.club_pass_number ?? member.member_number;
}

/** QR-code als vector, scherp op elk scherm. Donker op licht met een rustzone van 4 modules. */
export function QrCode({ value, size }: { value: string; size: number }) {
  const { d, n } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    let path = '';
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (qr.modules.data[y * count + x]) path += `M${x + 4} ${y + 4}h1v1h-1z`;
      }
    }
    return { d: path, n: count + 8 };
  }, [value]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} accessibilityLabel={`QR-code ${value}`}>
      <Rect x={0} y={0} width={n} height={n} fill={colors.paper} />
      <Path d={d} fill={colors.pine950} />
    </Svg>
  );
}
