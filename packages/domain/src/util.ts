/* 색상 음영 헬퍼 — accent 토큰에서 --brand-strong 파생 (원본: app.jsx shade) */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt,
    g = ((n >> 8) & 255) + amt,
    b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** 디자인 기본 적용값 — 레퍼런스 TWEAK_DEFAULTS 초기 렌더값 고정 반영 */
export const TWEAK_DEFAULTS = {
  density: "regular" as "regular" | "compact",
  accent: "#14151a",
};
