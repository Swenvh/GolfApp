/**
 * World Handicap System (WHS) berekeningen.
 *
 * Let op: in Nederland beheert de NGF de officiële handicap (via het GSN).
 * Deze functies zijn bedoeld voor scorekaarten, wedstrijduitslagen en een
 * *indicatie* van de handicap in de app — niet als vervanging van de NGF.
 */

export interface TeeRating {
  courseRating: number;
  slopeRating: number;
  par: number;
}

export interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
}

/** Course handicap = HI × (Slope / 113) + (CR − Par), afgerond. */
export function courseHandicap(handicapIndex: number, tee: TeeRating): number {
  return Math.round(handicapIndex * (tee.slopeRating / 113) + (tee.courseRating - tee.par));
}

/** Playing handicap: course handicap × handicap allowance (bv. 95% individuele stableford). */
export function playingHandicap(courseHcp: number, allowancePct = 100): number {
  return Math.round((courseHcp * allowancePct) / 100);
}

/** Aantal extra slagen op een hole op basis van playing handicap en stroke index. */
export function strokesReceived(playingHcp: number, strokeIndex: number, holesInRound = 18): number {
  const abs = Math.abs(playingHcp);
  const base = Math.floor(abs / holesInRound);
  const rest = abs % holesInRound;
  if (playingHcp >= 0) return base + (strokeIndex <= rest ? 1 : 0);
  // Plus-handicap: slagen teruggeven, te beginnen bij de makkelijkste hole (hoogste SI)
  const giveBack = base + (strokeIndex > holesInRound - rest ? 1 : 0);
  return giveBack === 0 ? 0 : -giveBack;
}

/** Stablefordpunten per hole. `gross` null/0 = hole niet uitgespeeld (0 punten). */
export function stablefordPoints(gross: number | null | undefined, par: number, strokes: number): number {
  if (!gross) return 0;
  return Math.max(0, 2 + par + strokes - gross);
}

/** Net double bogey: maximale score per hole voor de adjusted gross score. */
export function netDoubleBogey(par: number, strokes: number): number {
  return par + 2 + strokes;
}

export interface RoundResult {
  gross: number;
  net: number;
  stableford: number;
  adjustedGross: number;
  perHole: { hole: number; gross: number | null; strokes: number; points: number }[];
}

export function scoreRound(scores: (number | null)[], holes: Hole[], playingHcp: number): RoundResult {
  const perHole = holes.map((h, i) => {
    const gross = scores[i] ?? null;
    const strokes = strokesReceived(playingHcp, h.strokeIndex, holes.length === 9 ? 9 : 18);
    return { hole: h.number, gross, strokes, points: stablefordPoints(gross, h.par, strokes) };
  });
  const gross = perHole.reduce((s, h) => s + (h.gross ?? 0), 0);
  const adjustedGross = perHole.reduce((s, h, i) => {
    const ndb = netDoubleBogey(holes[i]!.par, h.strokes);
    return s + (h.gross ? Math.min(h.gross, ndb) : ndb);
  }, 0);
  return {
    gross,
    net: gross - playingHcp,
    stableford: perHole.reduce((s, h) => s + h.points, 0),
    adjustedGross,
    perHole,
  };
}

/** Score differential = (113 / Slope) × (AGS − CR − PCC), afgerond op 1 decimaal. */
export function scoreDifferential(adjustedGross: number, tee: Pick<TeeRating, 'courseRating' | 'slopeRating'>, pcc = 0): number {
  return round1((113 / tee.slopeRating) * (adjustedGross - tee.courseRating - pcc));
}

// WHS tabel: aantal differentials -> [aantal laagste, correctie]
const WHS_TABLE: Record<number, [number, number]> = {
  3: [1, -2], 4: [1, -1], 5: [1, 0], 6: [2, -1], 7: [2, 0], 8: [2, 0],
  9: [3, 0], 10: [3, 0], 11: [3, 0], 12: [4, 0], 13: [4, 0], 14: [4, 0],
  15: [5, 0], 16: [5, 0], 17: [6, 0], 18: [6, 0], 19: [7, 0], 20: [8, 0],
};

/** Handicapindicatie op basis van de meest recente (max. 20) score differentials, nieuwste eerst. */
export function handicapIndexFromDifferentials(differentials: number[]): number | null {
  const recent = differentials.slice(0, 20);
  const rule = WHS_TABLE[recent.length];
  if (!rule) return null;
  const [count, adjustment] = rule;
  const lowest = [...recent].sort((a, b) => a - b).slice(0, count);
  const avg = lowest.reduce((s, d) => s + d, 0) / count;
  return Math.min(54, round1(avg + adjustment));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
