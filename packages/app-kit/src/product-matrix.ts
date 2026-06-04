/* ============================================================
   [SWC-APP-KIT / WR-MVP-1] Product Matrix — 상업 SaaS 제품군 단일 기준표.
   hub 카드·ProductShell·SurfaceHeader 가 전부 이 표를 참조한다(일관성의 단일 출처).
   마스터 Part H H2(Product IA & Surface Registry) 정합.
   TODO(SWT-WBS-001): 핵심 코드 [SWC/SWS] 헤더 주석 패스(진행 중).
   TODO(SWT-WBS-002): 핵심 코드 TODO(SWT-*) 부착 — grep SWT- = Part H H4 backlog.
   TODO(SWT-DOC-001): 레지스트리(Part H H3/H4) ↔ 코드 주석 1:1 동기 검증 룰.
   ============================================================ */

export type ProductId = "ops" | "build" | "field" | "agent";
export type Locus = "cloud" | "cloud/desktop" | "on-robot" | "on-robot daemon";
/** 권한 위계 ① 물리 > ② Agent > ③ field HMI > ④ cloud. non-op = Build(운영 권한 밖). */
export type Authority = "②" | "③" | "④" | "non-op";
export type ControlMode =
  | "navigate"
  | "observe"
  | "observe / assist"
  | "request"
  | "inspect-only"
  | "configure"
  | "operate"
  | "none";
export type ScopeDepth = "project" | "site" | "robot" | "none";

export interface ProductDef {
  id: ProductId;
  label: string;
  locus: Locus;
  authority: Authority;
  authorityLabel: string;
  user: string;
  purpose: string;
  theme?: "ops" | "build" | "field";
  href: string; // dev URL
}

export interface SurfaceDef {
  sws: string; // SWS-OPS-FLEET
  product: ProductId;
  label: string;
  route: string; // /fleet
  locus: Locus;
  authority: Authority;
  scopeDepth: ScopeDepth;
  mirrorOf?: string; // 미러 표면만
  controlMode: ControlMode;
}

const URL = {
  hub: process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:7330",
  ops: process.env.NEXT_PUBLIC_OPS_URL ?? "http://localhost:7331",
  build: process.env.NEXT_PUBLIC_BUILD_URL ?? "http://localhost:7333",
  field: process.env.NEXT_PUBLIC_FIELD_URL ?? "http://localhost:7332",
};

export const PRODUCTS: ProductDef[] = [
  {
    id: "ops",
    label: "Ops · 관제",
    locus: "cloud",
    authority: "④",
    authorityLabel: "Remote Mirror",
    user: "운영자 · 관제자",
    purpose: "원격 관제 + 제한 명령 요청 (직접 제어 아님)",
    theme: "ops",
    href: URL.ops,
  },
  {
    id: "build",
    label: "Build · 통합/SDK",
    locus: "cloud/desktop",
    authority: "non-op",
    authorityLabel: "Non-operational",
    user: "통합자 · 개발자 · 제조사",
    purpose: "모듈/앱/계약·런타임 인스펙션·conformance",
    theme: "build",
    href: URL.build,
  },
  {
    id: "field",
    label: "Field · 현장",
    locus: "on-robot",
    authority: "③",
    authorityLabel: "Field Operator (local-first)",
    user: "현장 작업자",
    purpose: "현장 조작·안전·보정 (cloud mirror보다 상위)",
    theme: "field",
    href: URL.field,
  },
  {
    id: "agent",
    label: "Agent · 런타임",
    locus: "on-robot daemon",
    authority: "②",
    authorityLabel: "Runtime product (not a user app)",
    user: "system / integrator-via-Build",
    purpose: "command routing·policy·node registry — Build Inspector 경유",
    href: `${URL.build}/agent`,
  },
];

export const productById = (id: ProductId): ProductDef =>
  PRODUCTS.find((p) => p.id === id)!;

export const SURFACES: SurfaceDef[] = [
  // Ops (cloud · ④)
  { sws: "SWS-OPS-FLEET", product: "ops", label: "Fleet", route: "/fleet", locus: "cloud", authority: "④", scopeDepth: "robot", controlMode: "navigate" },
  { sws: "SWS-OPS-ROBOT", product: "ops", label: "Robot", route: "/robot", locus: "cloud", authority: "④", scopeDepth: "robot", controlMode: "observe" },
  { sws: "SWS-OPS-COMMAND", product: "ops", label: "Command", route: "/command", locus: "cloud", authority: "④", scopeDepth: "robot", mirrorOf: "CommandRouter", controlMode: "request" },
  { sws: "SWS-OPS-HMI-MIRROR", product: "ops", label: "HMI Mirror", route: "/hmi-mirror", locus: "cloud", authority: "④", scopeDepth: "robot", mirrorOf: "Field HMI", controlMode: "observe / assist" },
  { sws: "SWS-OPS-TELE-MON", product: "ops", label: "Telemetry Monitor", route: "/telemetry", locus: "cloud", authority: "④", scopeDepth: "robot", mirrorOf: "Telemetry Gateway", controlMode: "none" },
  // Build (cloud · non-op)
  { sws: "SWS-BUILD-INSPECTOR", product: "build", label: "Runtime Inspector", route: "/agent", locus: "cloud/desktop", authority: "non-op", scopeDepth: "robot", mirrorOf: "Local Agent runtime", controlMode: "inspect-only" },
  { sws: "SWS-BUILD-MANIFESTS", product: "build", label: "Manifests", route: "/manifests", locus: "cloud/desktop", authority: "non-op", scopeDepth: "project", controlMode: "inspect-only" },
  { sws: "SWS-BUILD-CONFORMANCE", product: "build", label: "Conformance", route: "/conformance", locus: "cloud/desktop", authority: "non-op", scopeDepth: "project", controlMode: "inspect-only" },
  { sws: "SWS-BUILD-FIRMWARE", product: "build", label: "Firmware", route: "/firmware", locus: "cloud/desktop", authority: "non-op", scopeDepth: "project", controlMode: "inspect-only" },
  { sws: "SWS-AGENT-STATUS", product: "agent", label: "Agent Status", route: "/agent-status", locus: "on-robot daemon", authority: "②", scopeDepth: "robot", mirrorOf: "Agent self", controlMode: "none" },
  // Field (on-robot · ③)
  { sws: "SWS-FIELD-HMI", product: "field", label: "HMI", route: "/hmi", locus: "on-robot", authority: "③", scopeDepth: "robot", controlMode: "operate" },
  { sws: "SWS-FIELD-SAFETY", product: "field", label: "Safety", route: "/safety", locus: "on-robot", authority: "③", scopeDepth: "robot", controlMode: "operate" },
  { sws: "SWS-FIELD-TELEMETRY", product: "field", label: "Telemetry", route: "/telemetry", locus: "on-robot", authority: "③", scopeDepth: "robot", controlMode: "configure" },
];

export const surfaceBySws = (sws: string): SurfaceDef | undefined =>
  SURFACES.find((s) => s.sws === sws);
export const surfacesOf = (product: ProductId): SurfaceDef[] =>
  SURFACES.filter((s) => s.product === product);
