"use client";
/* ============================================================
   FIELD-07/08 캘리브레이션 — 허브 → 단계 위저드 → hold 저장
   Field 8원칙: ①한 화면 한 판단 ②위험액션 hold ③상태/다음행동 고정 ⑤아이콘+라벨 ⑧64px
   ============================================================ */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  StatusBadge,
  ProgressBar,
  HoldButton,
  ContextChip,
  SafetyBanner,
  KVStack,
  type Sev,
} from "@station/design-system";
import { calibrationRequirements, calibrationSteps, workPackage, fieldSafetyState, type CalibReq } from "@station/domain";
import { HmiFrame, HmiStatusBar } from "./HmiShell";

const robot = { type: "thin", id: workPackage.robot_id, model: "HV-Thinner X2", hmi: "HMI-FIELD-07" };

const STATE_META: Record<CalibReq["state"], { label: string; sev: Sev; icon: "alert" | "close" | "check" | "clock" }> = {
  due: { label: "예정", sev: "warning", icon: "clock" },
  overdue: { label: "기한 초과", sev: "critical", icon: "alert" },
  failed: { label: "실패", sev: "critical", icon: "close" },
  completed: { label: "완료", sev: "normal", icon: "check" },
};

export default function Calibrate() {
  const router = useRouter();
  const [active, setActive] = useState<CalibReq | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const online = fieldSafetyState.network === "online";
  const estop = fieldSafetyState.state === "estop";

  return (
    <HmiFrame>
      <HmiStatusBar robot={robot} title="캘리브레이션" connected={online} registered safety={estop ? "estop" : "safe"} />

      {estop ? (
        <SafetyBanner sev="emergency" icon="power">긴급정지 활성 — 보정 동작 잠금.</SafetyBanner>
      ) : !online ? (
        <SafetyBanner sev="warning" icon="wifi">네트워크 불안정 — 저장 결과 동기화 지연 가능.</SafetyBanner>
      ) : null}

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div><ContextChip origin="ops" ids={workPackage.robot_id} onReturn={() => router.push("/hmi")} /></div>

        {profileId ? (
          <SavedView profileId={profileId} active={active} onBack={() => { setProfileId(null); setActive(null); }} />
        ) : active ? (
          <Wizard req={active} estop={estop} onCancel={() => setActive(null)}
            onSaved={(pid) => setProfileId(pid)} />
        ) : (
          <Hub onSelect={setActive} />
        )}
      </div>
    </HmiFrame>
  );
}

/* ---- 허브: 요구 카드 ---- */
function Hub({ onSelect }: { onSelect: (r: CalibReq) => void }) {
  return (
    <>
      <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>보정 항목을 선택하세요. 기한 초과 항목이 작업 시작을 차단합니다.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {calibrationRequirements.map((r) => {
          const m = STATE_META[r.state];
          const urgent = r.state === "overdue" || r.state === "failed";
          const completed = r.state === "completed";
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r)}
              style={{
                minHeight: 80, textAlign: "left", padding: 16, borderRadius: "var(--r-md)", cursor: "pointer",
                background: "var(--surface)",
                border: urgent ? "2px solid var(--st-critical)" : "1px solid var(--line)",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <span style={{ width: 42, height: 42, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
                background: "var(--surface-2)", color: "var(--ink-2)" }}>
                <Icon name="node" size={22} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  <span className="mono">{r.module}</span> · 최근 {r.last ?? "—"}
                </div>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
                <Icon name={m.icon} size={16} style={{ color: `var(--st-${m.sev === "normal" ? "normal" : m.sev === "warning" ? "warning" : "critical"})` }} />
                <StatusBadge sev={m.sev} label={m.label} />
                {!completed && <Icon name="chevR" size={18} style={{ color: "var(--ink-3)" }} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---- 단계형 위저드 ---- */
function Wizard({ req, estop, onCancel, onSaved }: { req: CalibReq; estop: boolean; onCancel: () => void; onSaved: (pid: string) => void }) {
  const [idx, setIdx] = useState(0);
  const last = idx === calibrationSteps.length - 1;
  const step = calibrationSteps[idx];
  const pct = Math.round(((idx + 1) / calibrationSteps.length) * 100);

  function save() {
    const pid = `CAL-PROF-${req.id}-${Date.now().toString(36).toUpperCase()}`;
    onSaved(pid);
  }

  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="node" size={18} style={{ color: "var(--ink-2)" }} /> {req.label}
        </span>
        <StatusBadge sev="notice" label={`단계 ${step.n}/${calibrationSteps.length}`} />
      </div>

      <ProgressBar pct={pct} sub={`${req.module}`} />

      {/* 단계 인디케이터 (⑤ 아이콘+라벨) */}
      <div style={{ display: "flex", gap: 8 }}>
        {calibrationSteps.map((s, i) => (
          <div key={s.n} style={{ flex: 1, padding: "8px 6px", borderRadius: "var(--r-sm)", textAlign: "center",
            background: i === idx ? "var(--brand)" : i < idx ? "var(--surface-2)" : "var(--surface)",
            border: "1px solid var(--line)", color: i === idx ? "#fff" : "var(--ink-2)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              {i < idx ? <Icon name="check" size={13} /> : s.n} {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 현재 단계 상세 */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{step.label}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="arrowRight2" size={16} style={{ color: "var(--brand)", flex: "none" }} /> {step.hint}
        </div>
      </div>

      {/* ③ 다음 행동 고정 */}
      <div style={{ display: "flex", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <button className="btn ghost" onClick={idx === 0 ? onCancel : () => setIdx(idx - 1)} style={{ minWidth: 120 }}>
          <Icon name="chevL" size={16} /> {idx === 0 ? "취소" : "이전"}
        </button>
        {last ? (
          <HoldButton label="보정 저장 (hold)" holdLabel="저장 중…" onConfirm={save} disabled={estop} style={{ flex: 1 }} />
        ) : (
          <button className="btn primary" onClick={() => setIdx(idx + 1)} style={{ flex: 1 }} disabled={estop}>
            다음 단계 <Icon name="chevR" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- 저장 완료 ---- */
function SavedView({ profileId, active, onBack }: { profileId: string; active: CalibReq | null; onBack: () => void }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 11, background: "var(--st-normal)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
          <Icon name="check" size={24} />
        </span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>보정 저장 완료</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{active?.label ?? "캘리브레이션"} · {active?.module}</div>
        </div>
      </div>

      <KVStack big pairs={[
        ["프로파일 ID", <span key="p" className="mono">{profileId}</span>],
        ["상태", <StatusBadge key="s" sev="normal" label="완료" />],
        ["연결", "Ops · Incident 보드"],
      ]} />

      {/* ③ Audit 스냅샷 고지 */}
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 14,
        fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 8, lineHeight: 1.5 }}>
        <Icon name="audit" size={16} style={{ flex: "none", marginTop: 1 }} />
        <span>Audit 스냅샷이 기록되어 <strong>Ops/Incident</strong>에 연결되었습니다. 보정 결과는 다음 작업 시작 게이트(G4)에 자동 반영됩니다.</span>
      </div>

      <button className="btn primary" onClick={onBack} style={{ minWidth: 160, alignSelf: "flex-start" }}>
        <Icon name="chevL" size={16} /> 캘리브레이션 허브
      </button>
    </div>
  );
}
