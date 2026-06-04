/* ============================================================
   ID 문법 검증기 (ADR-004 비준판 + 노드/매니페스트 신규)
   ============================================================ */

export const ID_PATTERNS = {
  // robot class는 개방형 SDV — 작업 종류를 enum으로 가두지 않는다(과거 THIN|PINCH 하드코딩 일반화).
  robot: /^RBT-[A-Z0-9]+-\d{4}$/,
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
  // 작업 앱 식별자 (Part G) — platform 네임스페이스
  appId: /^station\.app\.[a-z0-9-]+$/,
  // 상업 SaaS 스코핑 (Part H · ORG→PRJ→SITE→RBT, SWT-ID-001)
  project: /^PRJ-[A-Z0-9-]+-\d{4}$/,
  site: /^SITE-[A-Z0-9]+-\d{2}$/,
  // 런타임 인스턴스 식별자 — 설계 baseline에서 normative (Part B5)
  scanSession: /^SCN-\d{8}-\d{4}$/,
  observation: /^OBS-\d{8}-\d{4}$/,
  route: /^RT-[A-Z0-9]+-[A-Z0-9]+-\d{2}$/,
  map: /^MAP-[A-Z0-9-]+-v\d+$/,
  incident: /^INC-\d{8}-\d{4}$/,
} as const;

export type IdKind = keyof typeof ID_PATTERNS;

export function isId(kind: IdKind, value: string): boolean {
  return ID_PATTERNS[kind].test(value);
}
