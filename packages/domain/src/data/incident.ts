/* ============================================================
   장애·오류·품질 이벤트 콘솔 — Mock 데이터 (C03)
   robot·firmware deploy·HMI·Telemetry 이벤트가 모이는 장애 콘솔
   (원본: incident-console/data.js · window.IC — 값 1:1 보존)
   ============================================================ */
import type { MetaMap, Site } from "../types";

const SITE: Site = { id: "SITE-JINJU-01", name: "Jinju Smart-Farm Testbed" };

const sevMeta: MetaMap = {
  info: { label: "info", sev: "disabled" },
  notice: { label: "notice", sev: "notice" },
  warning: { label: "warning", sev: "warning" },
  critical: { label: "critical", sev: "critical" },
  emergency: { label: "emergency", sev: "emergency" },
};
const statusMeta: MetaMap = {
  open: { label: "open", sev: "critical" },
  ack: { label: "ack", sev: "warning" },
  progress: { label: "in progress", sev: "notice" },
  resolved: { label: "resolved", sev: "normal" },
  monitoring: { label: "monitoring", sev: "notice" },
};
const srcMeta: Record<string, { label: string; icon: string }> = {
  robot: { label: "robot", icon: "robot" },
  firmware: { label: "firmware", icon: "chip" },
  hmi: { label: "HMI", icon: "hmi" },
  telemetry: { label: "Telemetry", icon: "telemetry" },
  deploy: { label: "deploy", icon: "rocket" },
};
const causeTax = ["comms", "sensor", "actuation", "work params", "firmware", "HMI op", "environment"];

export interface Incident {
  id: string;
  sev: string;
  status: string;
  src: string;
  robot: string;
  module: string;
  code: string;
  title: string;
  cause: string;
  owner: string;
  at: string;
  sla: string;
  slaBreach: boolean;
  recur: number;
  impact: string;
  session: string | null;
}

const incidents: Incident[] = [
  { id: "INC-20260601-0231", sev: "emergency", status: "open", src: "robot", robot: "RBT-THIN-0008", module: "MOD-NAV-N1", code: "NAV-SAFETY-INTERLOCK", title: "Safety interlock tripped — e-stop", cause: "actuation", owner: "unassigned", at: "08:51", sla: "00:09", slaBreach: false, recur: 1, impact: "1 session halted", session: "WKS-20260601-00052" },
  { id: "INC-20260601-0229", sev: "critical", status: "progress", src: "robot", robot: "RBT-PINCH-0004", module: "MOD-CAM-V01", code: "CAM-FRAME-DROP", title: "Vision frame-drop over threshold", cause: "comms", owner: "Kim H.", at: "08:33", sla: "00:42", slaBreach: false, recur: 4, impact: "1 session blocked", session: "WKS-20260601-00049" },
  { id: "INC-20260601-0226", sev: "critical", status: "open", src: "firmware", robot: "RBT-PINCH-0004", module: "MOD-EE-PINCH", code: "FW-ANALYSIS-BLOCK", title: "Firmware static analysis critical — release blocked", cause: "firmware", owner: "unassigned", at: "08:20", sla: "-00:12", slaBreach: true, recur: 2, impact: "release blocked", session: null },
  { id: "INC-20260601-0224", sev: "warning", status: "progress", src: "telemetry", robot: "RBT-THIN-0001", module: "MOD-EE-THIN", code: "EE-FORCE-DRIFT", title: "End-effector grip-force drift", cause: "sensor", owner: "Lee J.", at: "08:05", sla: "01:55", slaBreach: false, recur: 3, impact: "possible quality drop", session: "WKS-20260601-00045" },
  { id: "INC-20260601-0218", sev: "warning", status: "ack", src: "robot", robot: "RBT-PINCH-0003", module: "MOD-ARM-A2", code: "ARM-TEMP-HIGH", title: "Joint motor temperature rising", cause: "actuation", owner: "unassigned", at: "07:48", sla: "02:12", slaBreach: false, recur: 1, impact: "—", session: "WKS-20260601-00047" },
  { id: "INC-20260601-0212", sev: "warning", status: "monitoring", src: "telemetry", robot: "RBT-THIN-0001", module: "MOD-CAM-V01", code: "TEL-DATA-GAP", title: "Vision FPS data gap 12%", cause: "comms", owner: "Lee J.", at: "07:32", sla: "—", slaBreach: false, recur: 5, impact: "quality metric gap", session: null },
  { id: "INC-20260601-0205", sev: "notice", status: "resolved", src: "hmi", robot: "RBT-THIN-0005", module: "MOD-NAV-N1", code: "NAV-RELOCALIZE", title: "Navigation relocalization occurred", cause: "environment", owner: "Lee J.", at: "07:20", sla: "—", slaBreach: false, recur: 1, impact: "—", session: "WKS-20260601-00050" },
  { id: "INC-20260531-0198", sev: "critical", status: "resolved", src: "hmi", robot: "RBT-PINCH-0003", module: "MOD-EE-PINCH", code: "HMI-CALIB-FAIL", title: "Calibration verification failed", cause: "HMI op", owner: "Kim H.", at: "yest 18:40", sla: "—", slaBreach: false, recur: 2, impact: "work delayed", session: null },
];

// 실시간 이벤트 스트림 (모든 소스). incidentRule: warning↑ 알림 / critical↑ 승격
const streamSeed = [
  { t: "08:51:22", sev: "emergency", src: "robot", code: "NAV-SAFETY-INTERLOCK", node: "RBT-THIN-0008", msg: "Safety interlock tripped — e-stop", promoted: "INC-...0231" },
  { t: "08:50:47", sev: "warning", src: "telemetry", code: "TEL-HUMID-HIGH", node: "TEL-GW-B-01", msg: "GH-B humidity nearing threshold 74%", promoted: null },
  { t: "08:48:10", sev: "critical", src: "robot", code: "CAM-FRAME-DROP", node: "RBT-PINCH-0004", msg: "Vision frame-drop 18% — work blocked", promoted: "INC-...0229" },
  { t: "08:45:33", sev: "notice", src: "deploy", code: "OTA-PROGRESS", node: "FW-CAM-2.4.2", msg: "OTA rollout — canary 2/6", promoted: null },
  { t: "08:44:02", sev: "info", src: "robot", code: "CMD-RESUME", node: "RBT-THIN-0001", msg: "command received: resume work", promoted: null },
  { t: "08:42:51", sev: "warning", src: "telemetry", code: "EE-FORCE-DRIFT", node: "RBT-THIN-0001", msg: "End-effector grip-force drift detected", promoted: "INC-...0224" },
  { t: "08:40:18", sev: "info", src: "hmi", code: "WORK-PAUSE", node: "HMI-A-03", msg: "work pause request handled", promoted: null },
  { t: "08:38:44", sev: "notice", src: "telemetry", code: "SYNC-RECOVER", node: "TEL-GW-A-03", msg: "Telemetry sync lag 1.4s recovered", promoted: null },
  { t: "08:36:09", sev: "critical", src: "firmware", code: "FW-ANALYSIS-BLOCK", node: "FW-EEP-3.1.0", msg: "static analysis: 2 critical — release blocked", promoted: "INC-...0226" },
  { t: "08:34:55", sev: "info", src: "hmi", code: "CALIB-APPLY", node: "HMI-A-01", msg: "calibration snapshot saved", promoted: null },
];

// 추가로 흘러들어올 이벤트(스트림 애니메이션용)
const streamIncoming = [
  { sev: "warning", src: "telemetry", code: "EE-FORCE-DRIFT", node: "RBT-THIN-0001", msg: "grip force 11.8N — nearing threshold" },
  { sev: "info", src: "robot", code: "ROUTE-PROGRESS", node: "RBT-THIN-0005", msg: "route progress 47%" },
  { sev: "notice", src: "deploy", code: "OTA-PROGRESS", node: "FW-CAM-2.4.2", msg: "canary 3/6 installed" },
  { sev: "critical", src: "robot", code: "ARM-TEMP-HIGH", node: "RBT-PINCH-0003", msg: "joint temp 71°C — over threshold" },
  { sev: "info", src: "telemetry", code: "SYNC-OK", node: "TEL-GW-C-01", msg: "sync nominal" },
  { sev: "warning", src: "hmi", code: "NET-WEAK", node: "HMI-B-02", msg: "HMI network signal weak" },
];

// C03-03 통합 원인 타임라인 (INC-...0229 비전 프레임 드롭 기준)
// lane: work | command | telemetry | hmi | firmware
const timeline = [
  { t: "08:25:00", lane: "command", label: "START_WORK command received", detail: "WKS-...00049 pinching work started", sev: "info" },
  { t: "08:28:12", lane: "firmware", label: "MOD-CAM firmware 2.4.1 running", detail: "previous version retained", sev: "info" },
  { t: "08:30:40", lane: "telemetry", label: "Vision FPS 29->24 drop", detail: "TCH-cam-fps nearing warn threshold", sev: "warning" },
  { t: "08:31:55", lane: "telemetry", label: "frame-drop rate up to 8%", detail: "accompanied by comms lag", sev: "warning" },
  { t: "08:32:30", lane: "hmi", label: "field reconnect attempt", detail: "HMI-B-01 comms retry x2", sev: "notice" },
  { t: "08:33:18", lane: "telemetry", label: "frame-drop 18% — over threshold", detail: "event_code CAM-FRAME-DROP", sev: "critical" },
  { t: "08:33:20", lane: "work", label: "work auto-blocked", detail: "work suspended by safety policy", sev: "critical" },
  { t: "08:33:41", lane: "command", label: "incident ticket created INC-...0229", detail: "owner Kim H. assigned", sev: "critical" },
];
const laneMeta: Record<string, { label: string; icon: string }> = {
  work: { label: "work", icon: "board" },
  command: { label: "command", icon: "terminal" },
  telemetry: { label: "Telemetry", icon: "telemetry" },
  hmi: { label: "HMI op", icon: "hmi" },
  firmware: { label: "firmware", icon: "chip" },
};

// C03-05 조치 가이드 체크리스트
const actionGuide = {
  incident: "INC-20260601-0229",
  title: "Vision frame-drop — standard remediation",
  safety: "Switch the robot to maintenance mode and confirm work-area safety before remediation.",
  steps: [
    { s: "Pause work and enter maintenance mode", done: true },
    { s: "Inspect MOD-CAM comms cable & connector", done: true },
    { s: "Run camera I/O test from HMI", done: false, hmi: true },
    { s: "Check Telemetry FPS channel live", done: false },
    { s: "Calibrate camera-tool if needed", done: false, hmi: true },
    { s: "Resume work after recurrence check", done: false },
  ] as { s: string; done: boolean; hmi?: boolean }[],
};

// C03-08 리포트 metrics
const report = {
  mttr: "42m",
  mtbf: "18.4h",
  total: 31,
  resolved: 24,
  recurRate: 22,
  trend: [4, 6, 3, 7, 5, 8, 6],
  pareto: [
    { m: "MOD-CAM-V01", n: 9, sev: "critical" },
    { m: "MOD-EE-PINCH", n: 6, sev: "warning" },
    { m: "MOD-NAV-N1", n: 5, sev: "warning" },
    { m: "MOD-ARM-A2", n: 4, sev: "warning" },
    { m: "MOD-EE-THIN", n: 3, sev: "notice" },
  ],
};

export const INCIDENT = {
  SITE,
  sevMeta,
  statusMeta,
  srcMeta,
  causeTax,
  incidents,
  streamSeed,
  streamIncoming,
  timeline,
  laneMeta,
  actionGuide,
  report,
  kpi: { open: 4, critical: 2, slaBreach: 1, today: 12, recurring: 3, mttr: "42m" },
};

export type IncidentData = typeof INCIDENT;
