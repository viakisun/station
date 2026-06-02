"use client";
/* ============================================================
   OPS-08 Close 뷰 (C03-10 · ADR-009)
   Close GateNotice — 재발 확인 또는 waiver 필요.
   미충족 = blocked(사유 + 해결행동). waiver 입력 = confirm_required → HoldButton close.
   ============================================================ */
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  PanelHead,
  StatusBadge,
  GateNotice,
  HoldButton,
  KVStack,
  type GateSeverity,
} from "@station/design-system";
import { INCIDENT, getIncident } from "@station/domain";
import { sevOf } from "./IncidentDash";

export function IncidentClose({ incidentId }: { incidentId?: string }) {
  const router = useRouter();
  const IC = INCIDENT;
  const inc = (incidentId ? getIncident(incidentId) : null) || IC.incidents[1];

  const [recurChecked, setRecurChecked] = useState(false);
  const [waiver, setWaiver] = useState("");
  const [closed, setClosed] = useState(false);

  const waiverProvided = waiver.trim().length > 0;
  // 폐루프 게이트: 재발 확인 또는 waiver 사유 필요
  const met = recurChecked || waiverProvided;

  let severity: GateSeverity;
  let reason: ReactNode;
  if (closed) {
    severity = "pass";
    reason = "Close 게이트 통과 — 장애가 종료되었습니다.";
  } else if (!met) {
    severity = "blocked";
    reason = "재발 확인 미완 / waiver 필요";
  } else {
    severity = "confirm_required";
    reason = recurChecked
      ? "재발 분석이 확인되었습니다. hold 하여 장애를 종료하세요."
      : `waiver 사유 제출됨: "${waiver.trim()}". hold 하여 장애를 종료하세요.`;
  }

  const gateActions =
    !closed && !met
      ? [
          { label: "재발 분석 보기", onClick: () => router.push("/incident/recurrence") },
          { label: "waiver 사유 입력", onClick: () => document.getElementById("waiver-input")?.focus() },
        ]
      : [];

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={() => router.push(`/incident/${inc.id}`)}>
          <Icon name="chevL" size={15} /> 장애 상세
        </button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
          {inc.id}
        </span>
        <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
        {closed ? (
          <StatusBadge sev="normal" label="closed" />
        ) : (
          <StatusBadge sev={IC.statusMeta[inc.status].sev} label={IC.statusMeta[inc.status].label} dot={false} />
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* 좌: Close 게이트 + 폐루프 조건 */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <PanelHead title="장애 종료 (Close)" sub="폐루프 게이트 · ADR-009" dense />
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <GateNotice severity={severity} title="Close Gate" gateId="GATE-INC-CLOSE" reason={reason} actions={gateActions} />

            {/* 재발 확인 체크 */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                padding: "11px 13px",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)",
                background: recurChecked ? "var(--surface-2)" : "var(--surface)",
                cursor: closed ? "default" : "pointer",
                opacity: closed ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={recurChecked}
                disabled={closed}
                onChange={(e) => setRecurChecked(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flex: "none" }}
              />
              <span>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>재발 분석 확인 완료</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                  재발 클러스터 검토 및 예방 액션 정의를 확인했습니다.{" "}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/incident/recurrence");
                    }}
                    style={{ border: "none", background: "transparent", color: "var(--brand)", fontWeight: 700, padding: 0, cursor: "pointer" }}
                  >
                    재발 분석 →
                  </button>
                </div>
              </span>
            </label>

            {/* waiver 사유 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: closed ? 0.6 : 1 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" }}>
                또는 waiver 사유 (재발 확인 생략 시)
              </span>
              <textarea
                id="waiver-input"
                value={waiver}
                disabled={closed}
                onChange={(e) => setWaiver(e.target.value)}
                placeholder="예: 단발성 환경 요인으로 재발 가능성 낮음 — 운영 책임자 승인"
                style={{
                  minHeight: 64,
                  resize: "vertical",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  background: "var(--surface)",
                  padding: "9px 11px",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>

            {/* close action */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <HoldButton
                label={<><Icon name="lock" size={14} /> 장애 종료 (hold)</>}
                holdLabel="종료 중…"
                danger
                disabled={!met || closed}
                onConfirm={() => setClosed(true)}
              />
              {closed && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--st-normal)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="check" size={15} stroke={3} /> 상태: closed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 우: 대상 요약 + Audit 고지 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="대상 장애" dense />
            <div style={{ padding: "10px 14px" }}>
              <KVStack
                pairs={[
                  ["제목", inc.title],
                  ["로봇", <span className="mono" key="r">{inc.robot}</span>],
                  ["모듈", <span className="mono" key="m">{inc.module}</span>],
                  ["코드", <span className="mono" key="c">{inc.code}</span>],
                  ["재발", `x${inc.recur}`],
                  ["담당", inc.owner],
                ]}
              />
            </div>
          </div>

          <div className="card">
            <PanelHead title="Audit 고지" sub="종료 시 기록" dense />
            <div style={{ padding: "10px 14px" }}>
              <KVStack
                pairs={[
                  ["actor", inc.owner === "unassigned" ? "ops-operator" : inc.owner],
                  ["action", <span className="mono" key="a">incident.close</span>],
                  ["target", <span className="mono" key="t">{inc.id}</span>],
                  ["reason", recurChecked ? "재발 확인 완료" : waiverProvided ? "waiver" : "—"],
                ]}
              />
              <div
                style={{
                  marginTop: 10,
                  padding: "9px 11px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  fontSize: 11.5,
                  color: "var(--ink-2)",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} /> ADR-009 — close는 폐루프 게이트 통과 후에만 audit_log에 기록됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
