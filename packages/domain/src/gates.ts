/* ============================================================
   UX 게이트 평가 (클라이언트 표시용 — 서버 재검증 아님)
   00 §5 Gate 4단계 · ADR-006. 화면은 결과를 GateNotice로 렌더.
   ============================================================ */
import { releaseApprovals, deploymentPlans, workPackage, calibrationRequirements } from "./data/mockups";

export type GateSeverity = "pass" | "warn" | "confirm_required" | "blocked";
export interface GateEval {
  gate: string;
  severity: GateSeverity;
  reason?: string;
  actions?: { label: string; href?: string }[];
}

/** G2 펌웨어 릴리즈 — 분석·호환·audit 모두 통과해야 승인 가능 */
export function gateFirmwareRelease(firmwareId: string): GateEval {
  const steps = releaseApprovals[firmwareId] || [];
  const fail = steps.filter((s) => s.status === "failed" || s.status === "pending");
  const blockers = steps.filter((s) => s.status === "failed");
  if (blockers.length) {
    return {
      gate: "G2 Firmware-release",
      severity: "blocked",
      reason: blockers.map((b) => `${b.label}: ${b.detail || "미충족"}`).join(" · "),
      actions: [
        { label: "정적분석 상세", href: "../static-analysis" },
        { label: "Audit Package 승인 요청", href: "../../audit/package" },
      ],
    };
  }
  if (fail.length)
    return { gate: "G2 Firmware-release", severity: "confirm_required", reason: `대기 단계 ${fail.length}건 — 운영 승인 확인 필요` };
  return { gate: "G2 Firmware-release", severity: "pass" };
}

/** G6 배포 preflight + G7 incident freeze — 대상별 차단 사유 집계 */
export function gateDeployPreflight(firmwareId: string): GateEval {
  const plan = deploymentPlans[firmwareId];
  if (!plan) return { gate: "G6 Deploy-preflight", severity: "pass" };
  const bad = plan.targets.filter((t) => !t.online || t.battery < 25 || t.openCritical);
  if (bad.length) {
    return {
      gate: "G6/G7 Deploy-preflight",
      severity: "blocked",
      reason: bad
        .map((t) =>
          `${t.id}: ${!t.online ? "오프라인" : t.openCritical ? "open critical incident(G7)" : `배터리 ${t.battery}%`}`,
        )
        .join(" · "),
      actions: [{ label: "대상에서 제외" }, { label: "윈도우 재예약" }],
    };
  }
  return { gate: "G6 Deploy-preflight", severity: "pass" };
}

/** G5 Audit → 운영 전환 */
export function gateAuditOperational(approvalStatus: string): GateEval {
  if (approvalStatus === "approved") return { gate: "G5 Audit→operational", severity: "pass" };
  return {
    gate: "G5 Audit→operational",
    severity: "blocked",
    reason: `AuditPackage 미승인 (현재: ${approvalStatus}) — 운영 전환 불가`,
    actions: [{ label: "실패 테스트 재실행", href: "conformance" }, { label: "이슈 보드" }],
  };
}

/** Field 작업 시작 게이트 묶음 — G1 route · G3 version · G4 calibration · G7 freeze */
export function gateWorkStart(): GateEval[] {
  const out: GateEval[] = [];
  // G1
  out.push(
    workPackage.route_validation === "passed"
      ? { gate: "G1 Route-validation", severity: "pass" }
      : { gate: "G1 Route-validation", severity: "blocked", reason: "경로 검증 미통과 — 시작 불가", actions: [{ label: "경로 재검증 요청" }] },
  );
  // G3
  if (workPackage.map_version !== workPackage.robot_map_version)
    out.push({ gate: "G3 Version (map)", severity: "blocked", reason: `map ${workPackage.robot_map_version} ≠ 요구 ${workPackage.map_version}`, actions: [{ label: "맵 동기화" }] });
  else if (workPackage.parameter_version !== workPackage.robot_parameter_version)
    out.push({ gate: "G3 Version (parameter)", severity: "confirm_required", reason: `parameter ${workPackage.robot_parameter_version} ≠ 요구 ${workPackage.parameter_version} — 확인 후 진행`, actions: [{ label: "파라미터 동기화", href: "calibrate" }] });
  else out.push({ gate: "G3 Version", severity: "pass" });
  // G4
  const calibBad = calibrationRequirements.filter((c) => c.state === "due" || c.state === "overdue" || c.state === "failed");
  out.push(
    calibBad.length
      ? { gate: "G4 Calibration", severity: "blocked", reason: `필수 캘리브 미완 ${calibBad.length}건: ${calibBad.map((c) => c.label).join(", ")}`, actions: [{ label: "캘리브레이션 허브", href: "calibrate" }] }
      : { gate: "G4 Calibration", severity: "pass" },
  );
  return out;
}

export function worstSeverity(evals: GateEval[]): GateSeverity {
  const order: GateSeverity[] = ["pass", "warn", "confirm_required", "blocked"];
  return evals.reduce<GateSeverity>((w, e) => (order.indexOf(e.severity) > order.indexOf(w) ? e.severity : w), "pass");
}
