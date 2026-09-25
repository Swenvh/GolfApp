/** Hoogtelijnen (zelfde beeldtaal als de app), als SVG-paden voor achtergronden. */
export function contourPaths(width: number, height: number, seed = 3): string[] {
  let a = seed;
  const rand = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const flip = rand() > 0.5;
  const hills = [
    { x: width * (flip ? 0.85 : 0.15), y: height * (0.1 + rand() * 0.2), phase: rand() * Math.PI * 2 },
    { x: width * (flip ? 0.1 : 0.9), y: height * (0.85 + rand() * 0.2), phase: rand() * Math.PI * 2 },
  ];
  const f = (v: number) => v.toFixed(1);
  const out: string[] = [];
  for (const h of hills) {
    for (let r = 14; r < Math.max(width, height) * 0.55; r += 15) {
      const p: [number, number][] = [];
      for (let i = 0; i < 72; i++) {
        const ang = (i / 72) * Math.PI * 2;
        const w = 1 + 0.12 * Math.sin(3 * ang + h.phase + r / 70) + 0.05 * Math.sin(5 * ang - h.phase + r / 110);
        p.push([h.x + Math.cos(ang) * r * 1.3 * w, h.y + Math.sin(ang) * r * w]);
      }
      const n = p.length;
      let d = `M${f(p[0]![0])} ${f(p[0]![1])}`;
      for (let i = 0; i < n; i++) {
        const p0 = p[(i - 1 + n) % n]!, p1 = p[i]!, p2 = p[(i + 1) % n]!, p3 = p[(i + 2) % n]!;
        d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
      }
      out.push(d + 'Z');
    }
  }
  return out;
}
