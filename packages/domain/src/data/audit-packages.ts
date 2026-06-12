/* ============================================================
   [SWC-AUDIT-PKG] Audit Package 레지스트리 — 프로젝트↔로봇↔모듈↔감사 단위.
   audit 실행(정적분석·conformance 등)은 @station/audit-kit(브라우저)가 targetId 로 수행.
   본 모듈은 *무엇을 감사하는가*(계층/소유)만 정의 — 결과는 런타임 runAudit 에서 도출.
   ============================================================ */

export type AuditPackageState = "draft" | "submitted" | "running" | "passed" | "failed" | "waiver_required" | "approved";

export interface AuditPackage {
  id: string; // AUD-*
  projectId: string; // PRJ-*
  robotId: string; // RBT-*
  targetId: string; // audit-kit target (MCU·LPU·VPU·ACU·TELEMETRY·EE-THIN·EE-PINCH)
  moduleId?: string; // MOD-*
  kind: "node" | "module";
  label: string;
  vendorName: string;
  /** 초기 상태(서사용). 워크벤치에서 runAudit 실행 시 실제 결과로 갱신. */
  state: AuditPackageState;
}

export const AUDIT_PACKAGES: AuditPackage[] = [
  // ── PRJ-GIMJE-TOMATO-2026 · RBT-THIN-0001 (적과 로봇) ──────────
  { id: "AUD-MCU-THIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "MCU", moduleId: "MOD-MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "approved" },
  { id: "AUD-LPU-THIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "LPU", moduleId: "MOD-NAV-N1", kind: "node", label: "LPU — 측위(DDS)", vendorName: "대동로보틱스", state: "passed" },
  { id: "AUD-VPU-THIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "VPU", moduleId: "MOD-CAM-V01", kind: "node", label: "VPU — 비전(ROS2)", vendorName: "메타파머스", state: "passed" },
  { id: "AUD-ACU-THIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "ACU", moduleId: "MOD-ARM-A2", kind: "node", label: "ACU — 자율(DDS)", vendorName: "메타파머스", state: "submitted" },
  { id: "AUD-TEL-THIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "TELEMETRY", kind: "node", label: "Telemetry — 업링크(MQTT)", vendorName: "비아", state: "approved" },
  { id: "AUD-EETHIN-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "EE-THIN", moduleId: "MOD-EE-THIN", kind: "module", label: "적과 EE — 모듈(CAN)", vendorName: "GreenEdge", state: "approved" },
  { id: "AUD-EEPINCH-01", projectId: "PRJ-GIMJE-TOMATO-2026", robotId: "RBT-THIN-0001", targetId: "EE-PINCH", moduleId: "MOD-EE-PINCH", kind: "module", label: "적심 EE — 모듈(CAN)", vendorName: "GreenEdge", state: "waiver_required" },

  // ── PRJ-NIAS-GROWTH-2026 · RBT-SCAN-0001 (생육분석) ───────────
  { id: "AUD-MCU-SCAN-01", projectId: "PRJ-NIAS-GROWTH-2026", robotId: "RBT-SCAN-0001", targetId: "MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "passed" },
  { id: "AUD-LPU-SCAN-01", projectId: "PRJ-NIAS-GROWTH-2026", robotId: "RBT-SCAN-0001", targetId: "LPU", kind: "node", label: "LPU — 측위(DDS)", vendorName: "대동로보틱스", state: "passed" },
  { id: "AUD-VPU-SCAN-01", projectId: "PRJ-NIAS-GROWTH-2026", robotId: "RBT-SCAN-0001", targetId: "VPU", kind: "node", label: "VPU — 비전·생육지표(ROS2)", vendorName: "메타파머스", state: "submitted" },
  { id: "AUD-TEL-SCAN-01", projectId: "PRJ-NIAS-GROWTH-2026", robotId: "RBT-SCAN-0001", targetId: "TELEMETRY", kind: "node", label: "Telemetry — 업링크(MQTT)", vendorName: "비아", state: "approved" },

  // ── PRJ-BUYEO-CARRY-2026 · RBT-CARRY-0001 (이송) ──────────────
  { id: "AUD-MCU-CARRY-01", projectId: "PRJ-BUYEO-CARRY-2026", robotId: "RBT-CARRY-0001", targetId: "MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "approved" },
  { id: "AUD-LPU-CARRY-01", projectId: "PRJ-BUYEO-CARRY-2026", robotId: "RBT-CARRY-0001", targetId: "LPU", kind: "node", label: "LPU — 측위(DDS)", vendorName: "대동로보틱스", state: "approved" },
  { id: "AUD-TEL-CARRY-01", projectId: "PRJ-BUYEO-CARRY-2026", robotId: "RBT-CARRY-0001", targetId: "TELEMETRY", kind: "node", label: "Telemetry — 업링크(MQTT)", vendorName: "비아", state: "approved" },

  // ── PRJ-SANGJU-SCOUT-2026 · RBT-SCOUT-0001 (예찰) ─────────────
  { id: "AUD-MCU-SCOUT-01", projectId: "PRJ-SANGJU-SCOUT-2026", robotId: "RBT-SCOUT-0001", targetId: "MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "passed" },
  { id: "AUD-LPU-SCOUT-01", projectId: "PRJ-SANGJU-SCOUT-2026", robotId: "RBT-SCOUT-0001", targetId: "LPU", kind: "node", label: "LPU — 측위(DDS)", vendorName: "대동로보틱스", state: "failed" },
  { id: "AUD-VPU-SCOUT-01", projectId: "PRJ-SANGJU-SCOUT-2026", robotId: "RBT-SCOUT-0001", targetId: "VPU", kind: "node", label: "VPU — 병해충 비전(ROS2)", vendorName: "메타파머스", state: "submitted" },

  // ── PRJ-YEONGJU-SPRAY-2026 · RBT-SPRAY-0001 (방제) ────────────
  { id: "AUD-MCU-SPRAY-01", projectId: "PRJ-YEONGJU-SPRAY-2026", robotId: "RBT-SPRAY-0001", targetId: "MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "approved" },
  { id: "AUD-ACU-SPRAY-01", projectId: "PRJ-YEONGJU-SPRAY-2026", robotId: "RBT-SPRAY-0001", targetId: "ACU", kind: "node", label: "ACU — 자율(DDS)", vendorName: "메타파머스", state: "passed" },
  { id: "AUD-TEL-SPRAY-01", projectId: "PRJ-YEONGJU-SPRAY-2026", robotId: "RBT-SPRAY-0001", targetId: "TELEMETRY", kind: "node", label: "Telemetry — 업링크(MQTT)", vendorName: "비아", state: "approved" },

  // ── PRJ-GIMJE-WEED-2026 · RBT-WEED-0001 (제초) ────────────────
  { id: "AUD-MCU-WEED-01", projectId: "PRJ-GIMJE-WEED-2026", robotId: "RBT-WEED-0001", targetId: "MCU", kind: "node", label: "MCU — 하위제어(CAN)", vendorName: "에이지로보틱스", state: "passed" },
  { id: "AUD-LPU-WEED-01", projectId: "PRJ-GIMJE-WEED-2026", robotId: "RBT-WEED-0001", targetId: "LPU", kind: "node", label: "LPU — 측위(DDS)", vendorName: "대동로보틱스", state: "submitted" },
];

export const getAuditPackages = (): AuditPackage[] => AUDIT_PACKAGES;
export const getAuditPackagesOfProject = (projectId: string): AuditPackage[] => AUDIT_PACKAGES.filter((a) => a.projectId === projectId);
export const getAuditPackage = (id: string): AuditPackage | null => AUDIT_PACKAGES.find((a) => a.id === id) ?? null;

export interface ProjectAuditSummary {
  total: number;
  approved: number;
  blocked: number; // failed + waiver_required
  inProgress: number; // draft/submitted/running/passed(미승인)
}
export function summarizeProjectAudits(projectId: string): ProjectAuditSummary {
  const pkgs = getAuditPackagesOfProject(projectId);
  const approved = pkgs.filter((p) => p.state === "approved").length;
  const blocked = pkgs.filter((p) => p.state === "failed" || p.state === "waiver_required").length;
  return { total: pkgs.length, approved, blocked, inProgress: pkgs.length - approved - blocked };
}
