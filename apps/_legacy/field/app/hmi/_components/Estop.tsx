"use client";
/* ============================================================
   FIELD-11/12 긴급정지 — 일반 흐름과 시각 분리(emergency 프레임)
   Field 8원칙: ⑥e-stop 시각 분리 ②위험액션 hold ③원인 고정 ⑤아이콘+라벨 ⑧64px
   해제 권한: 오퍼레이터 하드 거부([00 §8]) · 관리자+체크리스트 완료시에만 hold 해제
   ============================================================ */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, HoldButton, KVStack } from "@station/design-system";
import { fieldSafetyState, workPackage } from "@station/domain";
import { HmiFrame } from "./HmiShell";

const EMERGENCY = "#B71C1C";

const CHECKLIST = [
  { id: "area", label: "작업 구역 내 인원 · 장애물 없음 육안 확인" },
  { id: "cause", label: "정지 원인(안전 인터록) 물리적 해소 확인" },
  { id: "module", label: "엔드이펙터 · 매니퓰레이터 안전 위치 복귀" },
  { id: "comm", label: "현장 관리자에게 복구 의사 통보" },
];

type Role = "operator" | "manager";

export default function Estop() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("operator");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [released, setReleased] = useState(false);
  const [audit, setAudit] = useState<string | null>(null);

  const allChecked = CHECKLIST.every((c) => checked[c.id]);
  const isManager = role === "manager";
  const canRelease = isManager && allChecked && !released;

  function release() {
    setReleased(true);
    setAudit(`[Audit] ${new Date().toLocaleTimeString("ko-KR")} · e-stop 해제 — 관리자 권한 · 체크리스트 4/4 · session ${workPackage.work_session_id}`);
  }

  return (
    <HmiFrame>
      {/* ⑥ emergency 전체 프레임 (일반 흐름과 시각 분리) */}
      <div style={{ position: "absolute", inset: 0, border: `8px solid ${EMERGENCY}`, pointerEvents: "none", zIndex: 30, borderRadius: 8 }} />

      {/* emergency 헤더 */}
      <div style={{ flex: "none", background: EMERGENCY, color: "#fff", padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="power" size={30} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.3px" }}>긴급정지 — 화면 잠금</div>
          <div style={{ fontSize: 12.5, opacity: 0.9 }}>모든 자동 작업이 중단되었습니다. 복구 전 안전 확인 필수.</div>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800,
          border: "1.5px solid rgba(255,255,255,.6)", borderRadius: 999, padding: "5px 12px" }}>
          <Icon name="alert" size={15} /> {released ? "해제됨" : "활성"}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16,
        background: "rgba(183,28,28,.04)" }}>
        {/* ③ 원인 고정 위치 */}
        <div style={{ background: "var(--surface)", border: `2px solid ${EMERGENCY}`, borderRadius: "var(--r-md)", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="alert" size={18} style={{ color: EMERGENCY }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: EMERGENCY }}>정지 원인</span>
          </div>
          <KVStack pairs={[
            ["원인", fieldSafetyState.estop_cause],
            ["로봇", <span key="r" className="mono">{workPackage.robot_id}</span>],
            ["구역", `${workPackage.gh} / ${workPackage.zone}`],
          ]} />
        </div>

        {released ? (
          <ReleasedView audit={audit} onHome={() => router.push("/hmi")} />
        ) : (
          <>
            {/* 복구 체크리스트 */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" size={18} style={{ color: "var(--ink-2)" }} /> 복구 체크리스트 ({CHECKLIST.filter((c) => checked[c.id]).length}/{CHECKLIST.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CHECKLIST.map((c) => {
                  const on = !!checked[c.id];
                  return (
                    <button key={c.id} onClick={() => setChecked((p) => ({ ...p, [c.id]: !on }))}
                      style={{ minHeight: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", textAlign: "left",
                        borderRadius: "var(--r-sm)", cursor: "pointer", background: on ? "rgba(46,125,50,.08)" : "var(--surface)",
                        border: on ? "1px solid var(--st-normal)" : "1px solid var(--line)" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, flex: "none", display: "grid", placeItems: "center",
                        background: on ? "var(--st-normal)" : "var(--surface-2)", color: on ? "#fff" : "var(--ink-3)",
                        border: on ? "none" : "1px solid var(--line)" }}>
                        {on ? <Icon name="check" size={18} /> : null}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 역할 토글 + 해제 권한 차단 */}
            <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="user" size={17} style={{ color: "var(--ink-2)" }} /> 해제 권한 (역할)
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["operator", "manager"] as Role[]).map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className={"btn sm" + (role === r ? " primary" : " ghost")}>
                      <Icon name="user" size={14} /> {r === "operator" ? "오퍼레이터" : "현장 관리자"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ③ 다음 행동 / 차단 사유 고정 */}
              {!isManager ? (
                <div title="e-stop 해제 권한 없음 — 현장 관리자 필요"
                  style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <button className="btn danger" disabled style={{ flex: 1, minHeight: 56, opacity: 0.5, cursor: "not-allowed" }}>
                    <Icon name="lock" size={18} /> 긴급정지 해제 (권한 없음)
                  </button>
                  <span style={{ flex: 1, fontSize: 12.5, color: EMERGENCY, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon name="lock" size={15} style={{ flex: "none" }} /> e-stop 해제 권한 없음 — 현장 관리자 필요 (하드 거부)
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <HoldButton label="긴급정지 해제 (hold)" holdLabel="해제 중…" danger onConfirm={release}
                    disabled={!canRelease} style={{ flex: 1, minHeight: 56 }} />
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: allChecked ? "var(--st-normal)" : "var(--st-warning)",
                    display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon name={allChecked ? "check" : "alert"} size={15} style={{ flex: "none" }} />
                    {allChecked ? "관리자 권한 + 체크리스트 완료 — 해제 가능" : "체크리스트 미완 — 모두 확인 후 해제 가능"}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </HmiFrame>
  );
}

function ReleasedView({ audit, onHome }: { audit: string | null; onHome: () => void }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 11, background: "var(--st-normal)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
          <Icon name="shield" size={24} />
        </span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>긴급정지 해제됨</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>안전 상태 복구 · 작업 재개 가능</div>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 14,
        fontSize: 11.5, color: "var(--ink-2)", display: "flex", gap: 8, lineHeight: 1.5 }}>
        <Icon name="audit" size={16} style={{ flex: "none", marginTop: 1 }} />
        <span className="mono">{audit}</span>
      </div>

      <button className="btn primary" onClick={onHome} style={{ minHeight: 56, minWidth: 160, alignSelf: "flex-start" }}>
        <Icon name="home" size={17} /> 홈으로
      </button>
    </div>
  );
}
