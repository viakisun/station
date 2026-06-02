/* ============================================================
   목업 라운드(단계 3) 추가 mock — 폐루프 화면용
   값은 mock. 게이트 fail 케이스를 포함해 blocked/confirm을 시연.
   ============================================================ */

// ---- Build: 릴리즈 승인 단계 (per firmware) ----
export interface ApprovalStep {
  key: string;
  label: string;
  status: "passed" | "pending" | "failed" | "waived";
  detail?: string;
}
export const releaseApprovals: Record<string, ApprovalStep[]> = {
  "FW-CAM-2.4.2": [
    { key: "analysis", label: "정적분석", status: "passed", detail: "findings 2 · critical 0" },
    { key: "compat", label: "호환성", status: "passed", detail: "5/5 대상 compatible" },
    { key: "audit", label: "Audit Package", status: "passed", detail: "AUD-MOD-CAM 승인" },
    { key: "qa", label: "QA 승인", status: "passed", detail: "Kim H." },
    { key: "ops", label: "운영 승인", status: "pending", detail: "배포관리자 대기" },
  ],
  // 게이트 G2 fail 케이스 — 배포 차단
  "FW-EEP-3.1.0": [
    { key: "analysis", label: "정적분석", status: "failed", detail: "critical 2건 미해결" },
    { key: "compat", label: "호환성", status: "failed", detail: "Pinch 로봇 incompatible" },
    { key: "audit", label: "Audit Package", status: "pending", detail: "waiver 요청 대기" },
    { key: "qa", label: "QA 승인", status: "pending" },
    { key: "ops", label: "운영 승인", status: "pending" },
  ],
};

// ---- Build: OTA 배포 계획 ----
export interface DeployTargetRow {
  id: string;
  gh: string;
  group: "canary" | "wave-1" | "wave-2";
  battery: number;
  online: boolean;
  openCritical?: boolean;
}
export interface DeploymentPlanMock {
  firmware: string;
  groups: string[];
  rollbackPolicy: { trigger: string; prevStable: string };
  targets: DeployTargetRow[];
}
export const deploymentPlans: Record<string, DeploymentPlanMock> = {
  "FW-CAM-2.4.2": {
    firmware: "FW-CAM-2.4.2",
    groups: ["canary", "wave-1", "wave-2"],
    rollbackPolicy: { trigger: "error_rate > 5% · critical incident", prevStable: "FW-CAM-2.4.1" },
    targets: [
      { id: "RBT-THIN-0001", gh: "GH-A", group: "canary", battery: 78, online: true },
      { id: "RBT-THIN-0002", gh: "GH-A", group: "canary", battery: 95, online: true },
      { id: "RBT-THIN-0005", gh: "GH-B", group: "wave-1", battery: 64, online: true },
      // 게이트 G6 fail — 오프라인/저배터리, G7 — open critical
      { id: "RBT-THIN-0008", gh: "GH-A", group: "wave-1", battery: 18, online: true, openCritical: true },
      { id: "RBT-PINCH-0009", gh: "GH-B", group: "wave-2", battery: 0, online: false },
    ],
  },
};

// ---- Ops: 원인 분류 taxonomy (C03-04) ----
export interface CauseNode {
  id: string;
  label: string;
  children?: CauseNode[];
}
export const rootCauseTaxonomy: CauseNode[] = [
  { id: "comms", label: "통신 (comms)", children: [
    { id: "comms-lag", label: "모듈 통신 지연" },
    { id: "comms-drop", label: "프레임 드롭" },
  ] },
  { id: "sensor", label: "센서", children: [
    { id: "sensor-drift", label: "캘리브레이션 만료/drift" },
  ] },
  { id: "actuation", label: "구동부", children: [
    { id: "act-temp", label: "관절 모터 과열" },
    { id: "act-interlock", label: "안전 인터록" },
  ] },
  { id: "work-params", label: "작업 파라미터" },
  { id: "firmware", label: "펌웨어" },
  { id: "hmi-op", label: "HMI 조작" },
  { id: "environment", label: "환경 조건" },
];

// ---- Ops: 재발 클러스터 (C03-10) ----
export interface IncidentClusterMock {
  id: string;
  code: string;
  module: string;
  count: number;
  sev: string;
  window: string;
  preventive?: string;
  linkedFirmware?: string;
}
export const incidentClusters: IncidentClusterMock[] = [
  { id: "CL-001", code: "CAM-FRAME-DROP", module: "MOD-CAM-V01", count: 9, sev: "critical", window: "최근 7일", preventive: "FW-CAM-2.4.2 배포 (frame-drop fix)", linkedFirmware: "FW-CAM-2.4.2" },
  { id: "CL-002", code: "EE-FORCE-DRIFT", module: "MOD-EE-THIN", count: 6, sev: "warning", window: "최근 14일", preventive: "캘리브레이션 주기 단축" },
  { id: "CL-003", code: "ARM-TEMP-HIGH", module: "MOD-ARM-A2", count: 4, sev: "warning", window: "최근 14일", preventive: "연속 가동 제한 정책" },
];

// ---- Field: 수신 작업 패키지 (H01-02) ----
export const workPackage = {
  work_session_id: "WKS-20260601-00045",
  robot_id: "RBT-THIN-0001",
  work_type: "thin" as const,
  gh: "GH-A",
  zone: "A-3",
  route_id: "RT-A-THIN-03",
  route_validation: "passed" as "passed" | "failed",
  map_version: "v7",
  robot_map_version: "v7",
  parameter_version: "p12",
  robot_parameter_version: "p11", // G3 fail — parameter 불일치
  total: 320,
  eta: "09:40",
};

// ---- Field: 캘리브레이션 요구·단계 (H01-06/07) ----
export interface CalibReq {
  id: string;
  label: string;
  module: string;
  state: "due" | "overdue" | "completed" | "failed";
  last?: string;
}
export const calibrationRequirements: CalibReq[] = [
  { id: "CAL-CAM", label: "카메라-작업부 좌표", module: "MOD-CAM-V01", state: "due", last: "2026-05-28" },
  { id: "CAL-EE", label: "엔드이펙터 grip force", module: "MOD-EE-THIN", state: "overdue", last: "2026-05-20" },
  { id: "CAL-ARM", label: "관절 원점", module: "MOD-ARM-A2", state: "completed", last: "2026-06-01" },
];
export const calibrationSteps = [
  { n: 1, label: "마커 인식", hint: "기준 마커를 카메라 중앙에 위치" },
  { n: 2, label: "기준점 선택", hint: "작업부 기준 좌표 3점 지정" },
  { n: 3, label: "테스트 동작", hint: "제한 속도로 보정 동작 실행 (hold)" },
  { n: 4, label: "검증·저장", hint: "오차 ≤ 허용치 확인 후 저장" },
];

// ---- Field: 안전 상태 ----
export const fieldSafetyState = {
  state: "safe" as "safe" | "estop" | "fault",
  network: "online" as "online" | "delayed" | "offline",
  estop_cause: "NAV-SAFETY-INTERLOCK · 안전 구역 침범 감지",
};
