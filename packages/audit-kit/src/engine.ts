/* ============================================================
   [SWC-AUDIT-KIT] 감사 엔진 — runAudit(target) 가 7단계를 실제로 실행한다.
   정적분석(실 소스)·인터페이스(checkUplink)·프로토콜(IF-P 바인딩)·
   conformance(runConformance 실 FSM)·정책(PolicyEngine)·패키지(스코어/게이트).
   결과(state)는 하드코딩이 아니라 실행 결과에서 도출.
   ============================================================ */
import { ifpFor } from "@station/contracts";
import type { CommandEnvelope, PolicyRule } from "@station/contracts";
import { runConformance, checkUplink, isDeclared, PolicyEngine } from "@station/local-agent/browser";
import type { AuditReport, AuditState, AuditTarget, Check, StageResult } from "./types";
import { analyzeFiles, scoreFindings } from "./static";
import { AUDIT_TARGETS, NODE_FACTORY, SUITES } from "./targets";

const clock = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());
const statusFromChecks = (checks: Check[]) => (checks.length === 0 ? "na" : checks.every((c) => c.pass) ? "pass" : "fail");

// 인라인 안전 정책(profiles/policy 와 동형) — 명령 발행 게이트.
const POLICIES: PolicyRule[] = [
  { id: "POL-WORKER-SAFETY", applies: ["autonomy.mission.start", "autonomy.slow_down"], when: { signal: "machine.vision.worker_detected", op: "==", value: true }, effect: "blocked", gate: "G-Safety", reason: "작업자 근접 감지 — 자율주행 차단" } as PolicyRule,
  { id: "POL-ESTOP-MOTION", applies: ["motion.set_speed_limit"], when: { signal: "machine.safety.estop", op: "==", value: true }, effect: "blocked", gate: "G-Safety", reason: "E-stop 래치 — 모션 차단" } as PolicyRule,
];

/** 한 대상을 7단계로 감사 — 각 단계 완료 시 yield(라이브 진행). */
export async function* runAudit(target: AuditTarget): AsyncGenerator<StageResult> {
  // 1) manifest --------------------------------------------------
  {
    const t0 = clock();
    const arts: { name: string; ok: boolean; note?: string }[] = [];
    if (target.node && NODE_FACTORY[target.node]) {
      const m = NODE_FACTORY[target.node]().manifest as { manifestId?: string; ownerOrg?: string; signals?: string[]; commands?: string[] };
      arts.push({ name: "manifestId", ok: !!m.manifestId, note: m.manifestId });
      arts.push({ name: "ownerOrg", ok: !!m.ownerOrg, note: m.ownerOrg });
      arts.push({ name: "signals[]", ok: !!m.signals?.length, note: `${m.signals?.length ?? 0} 채널` });
      arts.push({ name: "commands[]", ok: !!m.commands?.length, note: `${m.commands?.length ?? 0} verb` });
    } else {
      arts.push({ name: "source files", ok: target.files.length > 0, note: `${target.files.length} 파일` });
    }
    const ok = arts.every((a) => a.ok);
    yield { stage: "manifest", status: ok ? "pass" : "fail", score: ok ? 100 : 50, summary: `필수 필드 ${arts.filter((a) => a.ok).length}/${arts.length}`, evidence: { artifacts: arts }, ms: clock() - t0 };
  }

  // 2) static analysis (실 소스) --------------------------------
  let staticCritical = 0;
  let staticWarn = 0;
  {
    const t0 = clock();
    const findings = analyzeFiles(target.files);
    staticCritical = findings.filter((f) => f.severity === "critical").length;
    staticWarn = findings.filter((f) => f.severity === "warning").length;
    const score = scoreFindings(findings);
    const status = staticCritical > 0 ? "fail" : staticWarn > 0 ? "warn" : "pass";
    yield { stage: "static", status, score, summary: `findings ${findings.length} · critical ${staticCritical} · warning ${staticWarn}`, evidence: { findings }, ms: clock() - t0 };
  }

  // 3) interface (IF-P notCarried / carries) --------------------
  {
    const t0 = clock();
    const checks: Check[] = [];
    const spec = target.wireInterfaceId ? ifpFor(target.node ?? "") : undefined;
    if (target.declaredSignals.length === 0 || !spec) {
      yield { stage: "interface", status: "na", score: 0, summary: "IF-P 대상 아님(모듈)", evidence: { note: "노드 IF-P 없음 — 모듈은 매니퓰레이터 경유" }, ms: clock() - t0 };
    } else {
      for (const ch of target.declaredSignals) {
        const v = checkUplink(target.node!, ch);
        checks.push({ name: ch, pass: v.ok, detail: v.ok ? (isDeclared(target.node!, ch) ? "carried" : "lint: 미선언") : v.reason });
      }
      const hb = spec.heartbeat?.channel;
      if (hb) checks.push({ name: hb, pass: true, detail: `heartbeat ${spec.heartbeat?.periodMs}ms` });
      const status = statusFromChecks(checks);
      yield { stage: "interface", status, score: status === "pass" ? 100 : 60, summary: `${checks.filter((c) => c.pass).length}/${checks.length} 채널 적합 · transport ${spec.transport}`, evidence: { checks }, ms: clock() - t0 };
    }
  }

  // 4) protocol/wire (IF-P 바인딩 완전성) ------------------------
  {
    const t0 = clock();
    const spec = target.wireInterfaceId ? ifpFor(target.node ?? "") : undefined;
    if (!spec) {
      yield { stage: "protocol", status: "na", score: 0, summary: "와이어 바인딩 대상 아님", evidence: {}, ms: clock() - t0 };
    } else {
      const carried = new Set(spec.carries?.signals ?? []);
      const checks: Check[] = target.declaredSignals.map((ch) => ({ name: ch, pass: carried.has(ch), expected: spec.transport, actual: carried.has(ch) ? "bound" : "unbound" }));
      checks.push({ name: "transport", pass: !!spec.transport, detail: spec.transport });
      const status = statusFromChecks(checks);
      yield { stage: "protocol", status, score: status === "pass" ? 100 : 60, summary: `${spec.transport} 바인딩 ${checks.filter((c) => c.pass).length}/${checks.length}`, evidence: { checks }, ms: clock() - t0 };
    }
  }

  // 5) conformance (runConformance — 실 FSM 부팅·검사) ----------
  {
    const t0 = clock();
    if (target.node && NODE_FACTORY[target.node] && SUITES[target.node]) {
      const report = await runConformance(NODE_FACTORY[target.node](), SUITES[target.node]);
      const checks: Check[] = report.checks.map((c) => ({ name: `${c.kind}:${c.name}`, pass: c.pass, detail: c.detail }));
      yield { stage: "conformance", status: report.pass ? "pass" : "fail", score: Math.round((checks.filter((c) => c.pass).length / Math.max(1, checks.length)) * 100), summary: `${SUITES[target.node].id} — ${checks.filter((c) => c.pass).length}/${checks.length} pass`, evidence: { checks }, ms: clock() - t0 };
    } else {
      yield { stage: "conformance", status: "na", score: 0, summary: "FSM/스위트 없음(모듈·게이트웨이)", evidence: { note: "노드 FSM 부재 — conformance 비대상" }, ms: clock() - t0 };
    }
  }

  // 6) policy (PolicyEngine — 안전규칙 평가) --------------------
  {
    const t0 = clock();
    const cmds = target.node === "ACU" ? ["autonomy.mission.start"] : target.node === "MCU" ? ["motion.set_speed_limit"] : [];
    if (cmds.length === 0) {
      yield { stage: "policy", status: "na", score: 0, summary: "정책 적용 명령 없음", evidence: {}, ms: clock() - t0 };
    } else {
      // 위험 시나리오: 작업자 감지 / E-stop 래치 → 명령이 차단되어야 안전(=정책 적용됨).
      const signals = (ch: string) => (ch === "machine.vision.worker_detected" || ch === "machine.safety.estop" ? true : 0);
      const engine = new PolicyEngine(POLICIES, signals);
      const checks: Check[] = cmds.map((verb) => {
        const cmd = { commandId: `AUDIT-${verb}`, verb, target: { node: target.node! }, issuedBy: { role: "operator" }, issuedAt: new Date().toISOString() } as CommandEnvelope;
        const r = engine.evaluate(cmd);
        const blocked = r?.severity === "blocked";
        return { name: verb, pass: blocked, detail: blocked ? `차단됨(${r?.gate}) — 안전 정책 적용 확인` : "위험 시나리오에서 미차단(정책 누락)" };
      });
      const status = statusFromChecks(checks);
      yield { stage: "policy", status, score: status === "pass" ? 100 : 40, summary: `안전 시나리오 ${checks.filter((c) => c.pass).length}/${checks.length} 차단 확인`, evidence: { checks }, ms: clock() - t0 };
    }
  }

  // 7) package (스코어·게이트·상태 도출) -----------------------
  {
    const t0 = clock();
    const gateBlocked = staticCritical > 0;
    const artifacts = [
      { name: "static analysis", ok: staticCritical === 0, note: `critical ${staticCritical}` },
      { name: "conformance results", ok: true, note: "포함" },
      { name: "interface spec", ok: !!target.wireInterfaceId, note: target.wireInterfaceId ?? "—" },
      { name: "manifest", ok: true },
    ];
    yield {
      stage: "package",
      status: gateBlocked ? "fail" : staticWarn > 0 ? "warn" : "pass",
      score: gateBlocked ? 30 : staticWarn > 0 ? 80 : 100,
      summary: gateBlocked ? `G2 차단 — critical ${staticCritical}건 미해결` : "패키지 조립 가능",
      evidence: { artifacts },
      ms: clock() - t0,
    };
  }
}

/** 수집한 단계 결과로 최종 리포트(가중 스코어·게이트·상태) 산출. */
export function finalizeReport(target: AuditTarget, stages: StageResult[]): AuditReport {
  const scored = stages.filter((s) => s.status !== "na");
  const score = scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : 0;
  const hasFail = stages.some((s) => s.status === "fail");
  const staticStage = stages.find((s) => s.stage === "static");
  const critical = (staticStage?.evidence.findings ?? []).filter((f) => f.severity === "critical").length;

  let state: AuditState;
  let gate: AuditReport["gate"];
  if (critical > 0) {
    state = "waiver_required";
    gate = { gate: "G2 Firmware-release", severity: "blocked", reason: `정적분석 critical ${critical}건 — 배포 차단` };
  } else if (hasFail) {
    state = "failed";
    gate = { gate: "G2 Firmware-release", severity: "blocked", reason: "검증 단계 실패" };
  } else if (stages.some((s) => s.status === "warn")) {
    state = "passed";
    gate = { gate: "G2 Firmware-release", severity: "confirm_required", reason: "경고 존재 — 운영 승인 확인 필요" };
  } else {
    state = "approved";
    gate = { gate: "G2 Firmware-release", severity: "pass" };
  }
  return { targetId: target.id, stages, score, state, gate };
}

export { AUDIT_TARGETS };
