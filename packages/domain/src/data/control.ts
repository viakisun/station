/* ============================================================
   Mock SSOT 데이터 — Jinju Smart-Farm Testbed (C01 관제)
   적과로봇(RBT-THIN) / 적심로봇(RBT-PINCH), 온실 A·B·C동
   (원본: farm-control/data.js · window.MOCK — 값 1:1 보존)
   ============================================================ */
import type {
  Site,
  Greenhouse,
  Robot,
  WorkSession,
  RobotModule,
  MapDef,
  WorkPlanItem,
  EventItem,
  TelemetryMini,
  CommandItem,
  MetaMap,
} from "../types";

const SITE: Site = { id: "SITE-JINJU-01", name: "Jinju Smart-Farm Testbed" };

const greenhouses: Greenhouse[] = [
  { id: "GH-A", name: "Greenhouse A", crop: "cherry tomato", beds: 8, rows: 32, area: "1,240㎡", temp: 24.6, humidity: 68, co2: 612, state: "normal" },
  { id: "GH-B", name: "Greenhouse B", crop: "paprika", beds: 6, rows: 24, area: "980㎡", temp: 26.1, humidity: 74, co2: 548, state: "warning" },
  { id: "GH-C", name: "Greenhouse C", crop: "cucumber", beds: 5, rows: 20, area: "760㎡", temp: 23.2, humidity: 61, co2: 590, state: "normal" },
];

// robot_type: thin(적과) / pinch(적심)
const robots: Robot[] = [
  { id: "RBT-THIN-0001", type: "thin", model: "HV-Thinner X1", gh: "GH-A", state: "working", battery: 78, sessionId: "WKS-20260601-00045", hmi: "HMI-A-01", tel: "TEL-A-01", x: 26, y: 34, route: "RT-A-THIN-03", progress: 62 },
  { id: "RBT-THIN-0002", type: "thin", model: "HV-Thinner X1", gh: "GH-A", state: "ready", battery: 95, sessionId: null, hmi: "HMI-A-02", tel: "TEL-A-02", x: 70, y: 18, route: null, progress: 0 },
  { id: "RBT-PINCH-0003", type: "pinch", model: "GR-Pincher P2", gh: "GH-A", state: "paused", battery: 41, sessionId: "WKS-20260601-00047", hmi: "HMI-A-03", tel: "TEL-A-03", x: 48, y: 70, route: "RT-A-PINCH-01", progress: 38 },
  { id: "RBT-PINCH-0004", type: "pinch", model: "GR-Pincher P2", gh: "GH-B", state: "fault", battery: 33, sessionId: "WKS-20260601-00049", hmi: "HMI-B-01", tel: "TEL-B-01", x: 35, y: 40, route: "RT-B-PINCH-02", progress: 21 },
  { id: "RBT-THIN-0005", type: "thin", model: "HV-Thinner X2", gh: "GH-B", state: "working", battery: 64, sessionId: "WKS-20260601-00050", hmi: "HMI-B-02", tel: "TEL-B-02", x: 62, y: 58, route: "RT-B-THIN-01", progress: 45 },
  { id: "RBT-THIN-0006", type: "thin", model: "HV-Thinner X2", gh: "GH-C", state: "returning", battery: 52, sessionId: "WKS-20260601-00051", hmi: "HMI-C-01", tel: "TEL-C-01", x: 80, y: 80, route: "RT-C-THIN-02", progress: 88 },
  { id: "RBT-PINCH-0007", type: "pinch", model: "GR-Pincher P3", gh: "GH-C", state: "maintenance", battery: 100, sessionId: null, hmi: "HMI-C-02", tel: "TEL-C-02", x: 18, y: 84, route: null, progress: 0 },
  { id: "RBT-THIN-0008", type: "thin", model: "HV-Thinner X1", gh: "GH-A", state: "emergency_stop", battery: 70, sessionId: "WKS-20260601-00052", hmi: "HMI-A-04", tel: "TEL-A-04", x: 54, y: 26, route: "RT-A-THIN-05", progress: 12 },
  { id: "RBT-PINCH-0009", type: "pinch", model: "GR-Pincher P2", gh: "GH-B", state: "offline", battery: 0, sessionId: null, hmi: "HMI-B-03", tel: "TEL-B-03", x: 88, y: 30, route: null, progress: 0 },
  { id: "RBT-THIN-0010", type: "thin", model: "HV-Thinner X2", gh: "GH-C", state: "idle", battery: 88, sessionId: null, hmi: "HMI-C-03", tel: "TEL-C-03", x: 44, y: 50, route: null, progress: 0 },
];

const robotStateMeta: MetaMap = {
  offline: { label: "offline", sev: "disabled" },
  online: { label: "online", sev: "normal" },
  idle: { label: "idle", sev: "disabled" },
  ready: { label: "ready", sev: "normal" },
  working: { label: "working", sev: "normal" },
  paused: { label: "paused", sev: "warning" },
  returning: { label: "returning", sev: "notice" },
  maintenance: { label: "maintenance", sev: "notice" },
  fault: { label: "fault", sev: "critical" },
  emergency_stop: { label: "e-stop", sev: "emergency" },
};

const workMeta: MetaMap = {
  planned: { label: "planned", sev: "disabled" },
  assigned: { label: "assigned", sev: "notice" },
  ready: { label: "ready", sev: "normal" },
  running: { label: "running", sev: "normal" },
  paused: { label: "paused", sev: "warning" },
  blocked: { label: "blocked", sev: "critical" },
  completed: { label: "completed", sev: "normal" },
  failed: { label: "failed", sev: "critical" },
  cancelled: { label: "cancelled", sev: "disabled" },
};

const sessions: WorkSession[] = [
  { id: "WKS-20260601-00045", type: "thin", robot: "RBT-THIN-0001", gh: "GH-A", zone: "A-3", route: "RT-A-THIN-03", status: "running", progress: 62, started: "08:12", eta: "09:40", done: 198, total: 320 },
  { id: "WKS-20260601-00047", type: "pinch", robot: "RBT-PINCH-0003", gh: "GH-A", zone: "A-6", route: "RT-A-PINCH-01", status: "paused", progress: 38, started: "08:40", eta: "10:20", done: 76, total: 200 },
  { id: "WKS-20260601-00049", type: "pinch", robot: "RBT-PINCH-0004", gh: "GH-B", zone: "B-2", route: "RT-B-PINCH-02", status: "blocked", progress: 21, started: "07:55", eta: "—", done: 42, total: 200 },
  { id: "WKS-20260601-00050", type: "thin", robot: "RBT-THIN-0005", gh: "GH-B", zone: "B-4", route: "RT-B-THIN-01", status: "running", progress: 45, started: "08:25", eta: "10:05", done: 135, total: 300 },
  { id: "WKS-20260601-00051", type: "thin", robot: "RBT-THIN-0006", gh: "GH-C", zone: "C-1", route: "RT-C-THIN-02", status: "running", progress: 88, started: "07:30", eta: "08:50", done: 246, total: 280 },
  { id: "WKS-20260601-00052", type: "thin", robot: "RBT-THIN-0008", gh: "GH-A", zone: "A-5", route: "RT-A-THIN-05", status: "blocked", progress: 12, started: "08:50", eta: "—", done: 18, total: 150 },
];

const modules: Record<string, RobotModule[]> = {
  "RBT-THIN-0001": [
    { id: "MOD-CAM-V01-0008", type: "Vision camera", vendor: "OptiVision", fw: "2.4.1", health: "normal" },
    { id: "MOD-ARM-A2-0011", type: "Manipulator", vendor: "ArmTech", fw: "1.9.0", health: "normal" },
    { id: "MOD-EE-THIN-0004", type: "Thinning end-effector", vendor: "GreenEdge", fw: "3.1.2", health: "warning" },
    { id: "MOD-NAV-N1-0002", type: "Navigation", vendor: "NaviCore", fw: "4.0.5", health: "normal" },
  ],
  "RBT-PINCH-0004": [
    { id: "MOD-CAM-V01-0019", type: "Vision camera", vendor: "OptiVision", fw: "2.4.1", health: "fault" },
    { id: "MOD-ARM-A2-0023", type: "Manipulator", vendor: "ArmTech", fw: "1.8.7", health: "degraded" },
    { id: "MOD-EE-PINCH-0007", type: "Pinching end-effector", vendor: "GreenEdge", fw: "3.0.9", health: "normal" },
    { id: "MOD-NAV-N1-0014", type: "Navigation", vendor: "NaviCore", fw: "4.0.5", health: "normal" },
  ],
};

const moduleMeta: MetaMap = {
  unknown: { label: "unknown", sev: "disabled" },
  disconnected: { label: "disconnected", sev: "disabled" },
  initializing: { label: "initializing", sev: "notice" },
  normal: { label: "normal", sev: "normal" },
  warning: { label: "warning", sev: "warning" },
  degraded: { label: "degraded", sev: "warning" },
  fault: { label: "fault", sev: "critical" },
  maintenance: { label: "maintenance", sev: "notice" },
  disabled: { label: "disabled", sev: "disabled" },
};

const sevMeta: MetaMap = {
  info: { label: "info", sev: "disabled" },
  notice: { label: "notice", sev: "notice" },
  warning: { label: "warning", sev: "warning" },
  critical: { label: "critical", sev: "critical" },
  emergency: { label: "emergency", sev: "emergency" },
};

const incidents = [
  { id: "INC-20260601-0231", sev: "emergency", status: "open", robot: "RBT-THIN-0008", module: "MOD-NAV-N1-0002", code: "NAV-SAFETY-INTERLOCK", title: "Safety interlock tripped — e-stop", cause: "safety-zone breach detected", owner: "unassigned", at: "08:51", session: "WKS-20260601-00052", sla: "00:09" },
  { id: "INC-20260601-0229", sev: "critical", status: "in progress", robot: "RBT-PINCH-0004", module: "MOD-CAM-V01-0019", code: "CAM-FRAME-DROP", title: "Vision frame-drop over threshold", cause: "camera module comms lag", owner: "Kim H.", at: "08:33", session: "WKS-20260601-00049", sla: "00:42" },
  { id: "INC-20260601-0224", sev: "warning", status: "in progress", robot: "RBT-THIN-0001", module: "MOD-EE-THIN-0004", code: "EE-FORCE-DRIFT", title: "End-effector grip-force drift", cause: "calibration likely expired", owner: "Lee J.", at: "08:05", session: "WKS-20260601-00045", sla: "01:55" },
  { id: "INC-20260601-0218", sev: "warning", status: "open", robot: "RBT-PINCH-0003", module: "MOD-ARM-A2-0023", code: "ARM-TEMP-HIGH", title: "Joint motor temp rising", cause: "overheating from continuous run", owner: "unassigned", at: "07:48", session: "WKS-20260601-00047", sla: "02:12" },
  { id: "INC-20260601-0205", sev: "notice", status: "resolved", robot: "RBT-THIN-0005", module: "MOD-NAV-N1-0014", code: "NAV-RELOCALIZE", title: "Navigation relocalization occurred", cause: "marker briefly unrecognized", owner: "Lee J.", at: "07:20", session: "WKS-20260601-00050", sla: "—" },
];

// realtime event stream (bottom strip + dashboard)
const events: EventItem[] = [
  { t: "08:51:22", sev: "emergency", src: "RBT-THIN-0008", msg: "E-stop — safety interlock tripped (NAV-SAFETY-INTERLOCK)" },
  { t: "08:50:47", sev: "warning", src: "TEL-B-01", msg: "Greenhouse B humidity nearing threshold 74% (TCH-greenhouse-humidity-02)" },
  { t: "08:48:10", sev: "critical", src: "RBT-PINCH-0004", msg: "vision frame-drop 18% — work blocked" },
  { t: "08:45:33", sev: "notice", src: "DEPLOY", msg: "OTA rollout — MOD-CAM-V01 firmware 2.4.2 (canary 2/6)" },
  { t: "08:44:02", sev: "info", src: "RBT-THIN-0001", msg: "command received: resume work (work_session WKS-...00045)" },
  { t: "08:42:51", sev: "warning", src: "RBT-THIN-0001", msg: "end-effector grip-force drift detected" },
  { t: "08:40:18", sev: "info", src: "RBT-PINCH-0003", msg: "work pause request handled" },
  { t: "08:38:44", sev: "notice", src: "TEL-A-03", msg: "Telemetry sync lag 1.4s recovered" },
];

const maps: MapDef[] = [
  { id: "MAP-GH-A-v7", gh: "GH-A", name: "Greenhouse A base map", version: "v7", state: "active", routes: 6, updated: "2026-05-28", by: "Mapper Park S.", valid: "passed" },
  { id: "MAP-GH-A-v8", gh: "GH-A", name: "Greenhouse A base map", version: "v8", state: "draft", routes: 6, updated: "2026-05-31", by: "Mapper Park S.", valid: "running" },
  { id: "MAP-GH-B-v4", gh: "GH-B", name: "Greenhouse B base map", version: "v4", state: "active", routes: 4, updated: "2026-05-22", by: "Mapper Park S.", valid: "passed" },
  { id: "MAP-GH-B-v5", gh: "GH-B", name: "Greenhouse B base map", version: "v5", state: "validation failed", routes: 4, updated: "2026-05-30", by: "Mapper Jung W.", valid: "failed" },
  { id: "MAP-GH-C-v3", gh: "GH-C", name: "Greenhouse C base map", version: "v3", state: "active", routes: 5, updated: "2026-05-19", by: "Mapper Park S.", valid: "passed" },
  { id: "MAP-GH-C-v2", gh: "GH-C", name: "Greenhouse C base map", version: "v2", state: "archived", routes: 5, updated: "2026-04-30", by: "Mapper Park S.", valid: "passed" },
];

// work plan board cards (kanban)
const workplan: WorkPlanItem[] = [
  { id: "WP-3401", type: "thin", gh: "GH-A", zone: "A-1", status: "planned", robot: null, route: "RT-A-THIN-01", prio: "normal", win: "06/01 13:00", warn: null },
  { id: "WP-3402", type: "thin", gh: "GH-A", zone: "A-7", status: "planned", robot: null, route: "RT-A-THIN-07", prio: "high", win: "06/01 14:30", warn: "recommended robot needs charge" },
  { id: "WP-3398", type: "pinch", gh: "GH-B", zone: "B-5", status: "assigned", robot: "RBT-PINCH-0009", route: "RT-B-PINCH-05", prio: "normal", win: "06/01 11:00", warn: "robot offline — cannot assign" },
  { id: "WP-3399", type: "thin", gh: "GH-C", zone: "C-3", status: "assigned", robot: "RBT-THIN-0010", route: "RT-C-THIN-03", prio: "low", win: "06/01 11:30", warn: null },
  { id: "WP-3395", type: "thin", gh: "GH-A", zone: "A-3", status: "running", robot: "RBT-THIN-0001", route: "RT-A-THIN-03", prio: "high", win: "running", warn: null },
  { id: "WP-3396", type: "thin", gh: "GH-B", zone: "B-4", status: "running", robot: "RBT-THIN-0005", route: "RT-B-THIN-01", prio: "normal", win: "running", warn: null },
  { id: "WP-3390", type: "pinch", gh: "GH-A", zone: "A-2", status: "completed", robot: "RBT-PINCH-0003", route: "RT-A-PINCH-02", prio: "normal", win: "07:00–07:48", warn: null },
  { id: "WP-3388", type: "thin", gh: "GH-C", zone: "C-1", status: "completed", robot: "RBT-THIN-0006", route: "RT-C-THIN-02", prio: "low", win: "07:30 ongoing", warn: null },
];

// telemetry mini channels for session detail
const telemetry: Record<string, TelemetryMini[]> = {
  "WKS-20260601-00045": [
    { ch: "TCH-arm-joint-temp", label: "Joint motor temp", unit: "°C", val: 58.2, q: "normal", series: [52, 53, 55, 54, 56, 57, 58, 58] },
    { ch: "TCH-ee-grip-force", label: "Grip force", unit: "N", val: 12.4, q: "warning", series: [14, 14, 13, 13, 12, 12, 12, 12] },
    { ch: "TCH-cam-framerate", label: "Vision FPS", unit: "fps", val: 29.6, q: "normal", series: [30, 30, 29, 30, 30, 29, 30, 30] },
    { ch: "TCH-nav-deviation", label: "Path deviation", unit: "mm", val: 8, q: "normal", series: [6, 7, 9, 8, 7, 8, 9, 8] },
  ],
};

// command timeline for session detail
const commands: CommandItem[] = [
  { t: "08:12:04", cmd: "START_WORK", state: "success", by: "Control operator" },
  { t: "08:33:18", cmd: "PAUSE_REQUEST", state: "success", by: "Lee J." },
  { t: "08:33:41", cmd: "RESUME_REQUEST", state: "success", by: "Lee J." },
  { t: "08:44:02", cmd: "PARAM_SYNC", state: "success", by: "system" },
  { t: "08:52:10", cmd: "CALIBRATE_EE", state: "executing", by: "Lee J." },
];

export const CONTROL = {
  SITE,
  greenhouses,
  robots,
  robotStateMeta,
  workMeta,
  sessions,
  modules,
  moduleMeta,
  sevMeta,
  incidents,
  events,
  maps,
  workplan,
  telemetry,
  commands,
  kpi: {
    robotsOnline: 7,
    robotsTotal: 10,
    working: 3,
    incidentsOpen: 4,
    incidentsCritical: 2,
    deploys: 1,
    telemetryQuality: 96.4,
    sessionsActive: 6,
  },
};

export type ControlData = typeof CONTROL;
