import { contourPaths } from '@/lib/contours';

export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
      <path d="M11 33.5c4.5-2.2 9.2-3.3 13-3.3s8.5 1.1 13 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <line x1="22" y1="31" x2="22" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22.6 11.2 34 15.4l-11.4 4.3z" fill="var(--color-brass)" />
      <circle cx="27.5" cy="31.2" r="1.9" fill="currentColor" />
    </svg>
  );
}

/** Monogram van een club met een eigen merk, zolang er geen logo is */
export function Monogram({ letters, size = 36 }: { letters: string; size?: number }) {
  return (
    <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-brass-light font-display"
      style={{ width: size, height: size, fontSize: size * (letters.length > 1 ? 0.36 : 0.5) }}>
      {letters}
    </span>
  );
}

/** Merknaam met beeldmerk: Greenside, of de club bij een eigen merk */
export function Wordmark({ className = '', brand }: { className?: string; brand?: { key: string; name: string; monogram: string; hasLogo: boolean } }) {
  const club = brand && brand.key !== 'greenside' ? brand : null;
  if (club?.hasLogo) {
    // Logo van de club, licht gemaakt voor de donkere zijbalk (pnpm club:assets zet het in public/brands)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/brands/${club.key}/logo-light.png`} alt={club.name} className={`h-12 w-auto ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {club ? <Monogram letters={club.monogram} size={36} /> : <LogoMark size={34} />}
      <span className="font-display text-[22px] italic tracking-tight">{club ? club.name : 'Greenside'}</span>
    </span>
  );
}

export function Contours({ seed = 3, opacity = 0.06, className = '' }: { seed?: number; opacity?: number; className?: string }) {
  const w = 420, h = 360;
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {contourPaths(w, h, seed).map((d, i) => <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity={opacity} />)}
    </svg>
  );
}
