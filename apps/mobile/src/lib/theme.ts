import { useColorScheme } from 'react-native';
import { useSession } from './session';

export interface Theme {
  primary: string;
  primarySoft: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  warn: string;
  onPrimary: string;
}

/** Thema op basis van de huisstijlkleur van de club, met dark mode. */
export function useTheme(): Theme {
  const dark = useColorScheme() === 'dark';
  const { member } = useSession();
  const primary = member?.club.primary_color ?? '#1B5E20';
  return dark
    ? { primary: lighten(primary, 0.35), primarySoft: withAlpha(primary, 0.25), bg: '#0f1110', card: '#1a1d1b',
        text: '#f2f4f2', muted: '#9aa39c', border: '#2a2f2c', danger: '#f87171', warn: '#fbbf24', onPrimary: '#0f1110' }
    : { primary, primarySoft: withAlpha(primary, 0.1), bg: '#f5f6f4', card: '#ffffff',
        text: '#1a1c1a', muted: '#6b736d', border: '#e4e7e3', danger: '#b91c1c', warn: '#b45309', onPrimary: '#ffffff' };
}

function withAlpha(hex: string, alpha: number): string {
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
}

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * amount);
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
}
