/* ============================================================
   [SWC-AUDIT-KIT] 감사 엔진 공용 타입.
   감사 = 실 소스/계약에 러너를 돌려 단계별 증거를 산출하는 실행.
   ============================================================ */

export type Stage = "manifest" | "static" | "interface" | "protocol" | "conformance" | "policy" | "package";
export type StageStatus = "pass" | "warn" | "fail" | "na" | "running" | "pending";
export type Severity = "critical" | "warning" | "low" | "info";

export const STAGE_ORDER: Stage[] = ["manifest", "static", "interface", "protocol", "conformance", "policy", "package"];
export const STAGE_LABEL: Record<Stage, string> = {
  manifest: "매니페스트",
  static: "정적분석",
  interface: "인터페이스 적합성",
  protocol: "프로토콜/와이어",
  conformance: "Conformance (F7)",
  policy: "정책/안전",
  package: "패키지 조립·게이트",
};

/** 정적분석 1건. file:line 은 실 소스에서 산출. */
export interface Finding {
  rule: string; // MEM-001 …
  severity: Severity;
  title: string;
  file: string;
  line: number;
  fn?: string;
  snippet?: string;
}

/** conformance/interface/protocol 의 개별 체크. */
export interface Check {
  name: string;
  pass: boolean;
  detail?: string;
  expected?: string;
  actual?: string;
}

export interface Evidence {
  findings?: Finding[]; // static
  checks?: Check[]; // interface · protocol · conformance · policy
  artifacts?: { name: string; ok: boolean; note?: string }[]; // package · manifest
  note?: string;
}

export interface StageResult {
  stage: Stage;
  status: StageStatus;
  score: number; // 0..100 (단계 가중 전 원점수)
  summary: string;
  evidence: Evidence;
  ms: number; // 실행 소요(ms)
}

export type AuditState = "draft" | "running" | "passed" | "failed" | "waiver_required" | "approved";

export interface AuditReport {
  targetId: string;
  stages: StageResult[];
  score: number; // 0..100 가중 합
  state: AuditState; // 결과에서 도출(하드코딩 아님)
  gate: { gate: string; severity: "pass" | "warn" | "confirm_required" | "blocked"; reason?: string };
}

export type NodeKind = "MCU" | "VPU" | "LPU" | "ACU" | "Telemetry";
export type Lang = "c" | "cpp" | "python";

/** 감사 대상 1건 — 노드/모듈. 파일·계약·러너 연결점. */
export interface AuditTarget {
  id: string; // AUD-* (domain audit-packages 와 동일)
  label: string;
  kind: "node" | "module";
  node?: NodeKind; // 노드면 FSM/suite 연결
  lang: Lang;
  files: string[]; // samples 키(실 소스 경로)
  declaredSignals: string[]; // manifest signals — interface 검사 입력
  wireInterfaceId?: string; // IF-P-* — protocol 검사
}
