"use client";
/* ============================================================
   FIELD-02~05 작업 제어 — 단일 판단 흐름
   WorkPackage 수신 → Gate Check(GateNotice) → 진행(진행률·다음행동 고정)
   Field 8원칙: ①한 화면 한 판단 ②위험액션 hold ③상태/다음행동/차단사유 고정 ⑤아이콘+라벨
   ============================================================ */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  StatusBadge,
  ProgressBar,
  GateNotice,
  HoldButton,
  ContextChip,
  SafetyBanner,
  KVStack,
  type GateSeverity,
} from "@station/design-system";
import { workPackage, gateWorkStart, worstSeverity, fieldSafetyState, parseCtx, ctxSummary, type ContextEnvelope } from "@station/domain";
import { HmiFrame, HmiStatusBar } from "./HmiShell";

const robot = { type: "thin", id: workPackage.robot_id, model: "HV-Thinner X2", hmi: "HMI-FIELD-07" };

const SEV_TO_DS: Record<string, "pass" | "warn" | "confirm_required" | "blocked"> = {
  pass: "pass", warn: "warn", confirm_required: "confirm_required", blocked: "blocked",
};

type Phase = "gate" | "running" | "paused";

export default function Operate() {
  const router = useRouter();
  const evals = gateWorkStart();
  const worst: GateSeverity = worstSeverity(evals);
  const [phase, setPhase] = useState<Phase>("gate");
  const [done, setDone] = useState(0); // 처리 주 수
  const [audit, setAudit] = useState<string | null>(null);
  const [ctx, setCtx] = useState<ContextEnvelope | null>(null);
  useEffect(() => {
    setCtx(parseCtx(new URLSearchParams(window.location.search).get("ctx")));
  }, []);

  const online = fieldSafetyState.network === "online";
  const estop = fieldSafetyState.state === "estop";
  const progress = Math.round((done / workPackage.total) * 100);

  function logAudit(msg: string) {
    setAudit(`[Audit] ${new Date().toLocaleTimeString("ko-KR")} · ${msg} · session ${workPackage.work_session_id}`);
  }
  function start() {
    setPhase("running");
    setDone(Math.round(workPackage.total * 0.04));
    logAudit("작업 시작 — 상태 전이 idle→running 기록됨");
  }
  function pause() { setPhase("paused"); logAudit("작업 정지 — running→paused, 안전정지 기록됨"); }
  function resume() { setPhase("running"); logAudit("작업 재개 — paused→running 기록됨"); }

  return (
    <HmiFrame>
      <HmiStatusBar robot={robot} title="작업 제어" connected={online} registered safety={estop ? "estop" : "safe"} />

      {/* ⑦ 상단 고정 */}
      {estop ? (
        <SafetyBanner sev="emergency" icon="power">긴급정지 활성 — 작업 시작/재개 불가.</SafetyBanner>
      ) : !online ? (
        <SafetyBanner sev={fieldSafetyState.network === "offline" ? "critical" : "warning"} icon="wifi">
          네트워크 {fieldSafetyState.network === "offline" ? "오프라인" : "지연"} — 원격 명령 신뢰 저하.
        </SafetyBanner>
      ) : null}

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div><ContextChip origin={ctx?.origin || "ops"} ids={ctxSummary(ctx) || workPackage.work_session_id} onReturn={() => router.push("/hmi")} /></div>

        {/* WorkPackage 수신 요약 (④ KV) */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="pkg" size={18} style={{ color: "var(--ink-2)" }} /> 수신 작업 패키지
            </span>
            <StatusBadge sev="notice" label="수신됨" />
          </div>
          <KVStack pairs={[
            ["세션", <span key="s" className="mono">{workPackage.work_session_id}</span>],
            ["유형 · 구역", `적과 · ${workPackage.gh} / ${workPackage.zone}`],
            ["경로", <span key="r" className="mono">{workPackage.route_id}</span>],
            ["대상 · ETA", `${workPackage.total}주 · ${workPackage.eta}`],
          ]} />
        </div>

        {phase === "gate" ? (
          <GateSection evals={evals} worst={worst} estop={estop} onStart={start} onCalibrate={() => router.push("/hmi/calibrate")} />
        ) : (
          <RunSection phase={phase} progress={progress} done={done} onPause={pause} onResume={resume} estop={estop}
            onEstop={() => router.push("/hmi/estop")} />
        )}

        {/* ③ 위험 전이 Audit 고지 (고정 위치) */}
        <div style={{ minHeight: 38, fontSize: 11.5, color: "var(--ink-3)", borderTop: "1px solid var(--line)", paddingTop: 10,
          display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="audit" size={14} style={{ flex: "none" }} />
          <span className="mono" style={{ lineHeight: 1.4 }}>{audit ?? "위험 전이 시 Audit 스냅샷이 기록되어 Ops/Incident에 연결됩니다."}</span>
        </div>
      </div>
    </HmiFrame>
  );
}

/* ---- Gate Check 섹션 ---- */
function GateSection({ evals, worst, estop, onStart, onCalibrate }:
  { evals: ReturnType<typeof gateWorkStart>; worst: GateSeverity; estop: boolean; onStart: () => void; onCalibrate: () => void }) {
  const blocked = worst === "blocked" || estop;
  const needConfirm = worst === "confirm_required";

  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="shield" size={18} style={{ color: "var(--ink-2)" }} /> 시작 게이트 검사
        </span>
        <StatusBadge
          sev={blocked ? "critical" : needConfirm ? "notice" : "normal"}
          label={blocked ? "진행 불가" : needConfirm ? "확인 필요" : "통과"}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {evals.map((e, i) => (
          <GateNotice
            key={i}
            gateId={e.gate}
            severity={SEV_TO_DS[e.severity]}
            reason={e.reason}
            actions={e.actions?.map((a) => ({ label: a.label, onClick: a.href === "calibrate" ? onCalibrate : undefined }))}
          />
        ))}
      </div>

      {/* ③ 다음 행동 / 차단 사유 고정 */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
          {blocked
            ? "차단됨 — 위 사유 해결 전 시작 불가"
            : needConfirm
              ? "확인 필요 — hold 하여 책임 확인 후 시작"
              : "모든 게이트 통과 — 시작 가능"}
        </div>
        {blocked ? (
          <button className="btn" disabled style={{ minWidth: 160 }}>
            <Icon name="lock" size={16} /> 시작 불가
          </button>
        ) : needConfirm ? (
          <HoldButton label="확인 후 시작 (hold)" holdLabel="확인 중…" onConfirm={onStart} style={{ minWidth: 200 }} />
        ) : (
          <HoldButton label="작업 시작 (hold)" holdLabel="시작 중…" onConfirm={onStart} style={{ minWidth: 200 }} />
        )}
      </div>
    </div>
  );
}

/* ---- 진행 섹션 ---- */
function RunSection({ phase, progress, done, onPause, onResume, estop, onEstop }:
  { phase: Phase; progress: number; done: number; onPause: () => void; onResume: () => void; estop: boolean; onEstop: () => void }) {
  const running = phase === "running";
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={running ? "play" : "pause"} size={18} style={{ color: "var(--ink-2)" }} /> 작업 진행
        </span>
        <StatusBadge sev={running ? "normal" : "warning"} label={running ? "진행 중" : "정지됨"} />
      </div>

      <ProgressBar pct={progress} big sub={`${done} / ${workPackage.total}주 · ETA ${workPackage.eta}`} />

      {/* ③ 다음 행동 고정 */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 12,
        display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
        <Icon name="arrowRight2" size={16} style={{ color: "var(--brand)", flex: "none" }} />
        다음 행동: {running ? `${workPackage.zone} 다음 베드로 자율 이동 후 작업 계속` : "정지 상태 — 재개하거나 긴급정지로 전환"}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {running ? (
          <HoldButton label="작업 정지 (hold)" holdLabel="정지 중…" onConfirm={onPause} danger style={{ flex: 1 }} />
        ) : (
          <HoldButton label="작업 재개 (hold)" holdLabel="재개 중…" onConfirm={onResume} disabled={estop} style={{ flex: 1 }} />
        )}
        <button className="btn danger" onClick={onEstop} style={{ minWidth: 150 }}>
          <Icon name="power" size={17} /> 긴급정지
        </button>
      </div>
    </div>
  );
}
