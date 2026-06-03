/* ============================================================
   ID 문법 검증기 (ADR-004 비준판 + 노드/매니페스트 신규)
   ============================================================ */

export const ID_PATTERNS = {
  robot: /^RBT-(THIN|PINCH)-\d{4}$/,
  module: /^MOD-[A-Z0-9-]+$/,
  workSession: /^WKS-\d{8}-\d{5}$/,
  command: /^CMD-[A-Z0-9-]+$/,
  calibration: /^CAL-[A-Z0-9-]+$/,
  audit: /^AUD-[A-Z0-9-]+$/,
  firmware: /^FW-[A-Z0-9.-]+$/,
  org: /^ORG-[A-Z]+$/,
  node: /^NODE-[A-Z]+-[A-Z]+$/,
  channel: /^[a-z]+(\.[a-z0-9_]+)+$/,
  manifest: /^[a-z]+\.(module|node)\.[a-z0-9_]+\.v[0-9]+$/,
} as const;

export type IdKind = keyof typeof ID_PATTERNS;

export function isId(kind: IdKind, value: string): boolean {
  return ID_PATTERNS[kind].test(value);
}
