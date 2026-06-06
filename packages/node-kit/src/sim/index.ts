/* ============================================================
   결정적 시뮬 헬퍼 — 노드 FSM 이 재현 가능한 거동을 갖도록.
   물리모델 아님. 시드 rng + ramp + clamp 로 읽기 쉬운 결정적 신호.
   ============================================================ */

/** mulberry32 — 시드 PRNG. 같은 시드 → 같은 수열(재현성). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** cur 를 target 으로 최대 step 만큼 추종(ramp). 도달하면 target. */
export function ramp(cur: number, target: number, step: number): number {
  if (cur < target) return Math.min(target, cur + step);
  if (cur > target) return Math.max(target, cur - step);
  return target;
}

export const round = (v: number, p = 3): number => {
  const m = 10 ** p;
  return Math.round(v * m) / m;
};
