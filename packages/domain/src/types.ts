/* ============================================================
   STATION 도메인 타입 — SSOT 객체/상태값 정의
   (근거: 00_six_uxui_integrated_application_guide.md §5 ID 규칙, §1 공유 객체)
   ============================================================ */

/** 표준 심각도/상태 색상 토큰 키 */
export type Sev =
  | "normal"
  | "notice"
  | "warning"
  | "critical"
  | "emergency"
  | "disabled";

/** 상태값 → 표시 라벨/심각도 메타 (배지 색상 통일용) */
export interface StateMeta {
  label: string;
  sev: Sev;
}
export type MetaMap = Record<string, StateMeta>;

export interface Site {
  id: string;
  name: string;
}

export interface Greenhouse {
  id: string;
  name: string;
  crop: string;
  beds: number;
  rows: number;
  area: string;
  temp: number;
  humidity: number;
  co2: number;
  state: string;
}

/** robot_type: thin(적과) / pinch(적심) */
export interface Robot {
  id: string;
  type: "thin" | "pinch";
  model: string;
  gh: string;
  state: string;
  battery: number;
  sessionId: string | null;
  hmi: string;
  tel: string;
  x: number;
  y: number;
  route: string | null;
  progress: number;
}

export interface WorkSession {
  id: string;
  type: "thin" | "pinch";
  robot: string;
  gh: string;
  zone: string;
  route: string;
  status: string;
  progress: number;
  started: string;
  eta: string;
  done: number;
  total: number;
}

export interface RobotModule {
  id: string;
  type: string;
  vendor: string;
  fw: string;
  health: string;
}

export interface MapDef {
  id: string;
  gh: string;
  name: string;
  version: string;
  state: string;
  routes: number;
  updated: string;
  by: string;
  valid: string;
}

export interface WorkPlanItem {
  id: string;
  type: "thin" | "pinch";
  gh: string;
  zone: string;
  status: string;
  robot: string | null;
  route: string;
  prio: string;
  win: string;
  warn: string | null;
}

export interface EventItem {
  t: string;
  sev: string;
  src: string;
  msg: string;
}

export interface TelemetryMini {
  ch: string;
  label: string;
  unit: string;
  val: number;
  q: string;
  series: number[];
}

export interface CommandItem {
  t: string;
  cmd: string;
  state: string;
  by: string;
}
