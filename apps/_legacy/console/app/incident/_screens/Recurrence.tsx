"use client";
/* ============================================================
   OPS-08 재발 분석 · 포스트모템 (C03-10)
   incidentClusters 목록 · 포스트모템 에디터(mock) · 예방 액션
   ============================================================ */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, PanelHead, StatusBadge, EmptyNote } from "@station/design-system";
import { INCIDENT, incidentClusters, type IncidentClusterMock } from "@station/domain";

function sevBadge(sev: string) {
  const m = INCIDENT.sevMeta[sev];
  return <StatusBadge sev={m ? m.sev : "notice"} label={m ? m.label : sev} />;
}

export function Recurrence() {
  const router = useRouter();
  const [sel, setSel] = useState<IncidentClusterMock>(incidentClusters[0]);
  const [postmortem, setPostmortem] = useState(
    "## 요약\n반복 발생 클러스터에 대한 근본 원인 및 예방책을 기록합니다.\n\n## 타임라인\n- \n\n## 근본 원인\n- \n\n## 예방 액션\n- ",
  );

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={() => router.push("/incident/list")}>
          <Icon name="chevL" size={15} /> 장애 목록
        </button>
        <span style={{ fontSize: 15, fontWeight: 800 }}>재발 분석 · 포스트모템</span>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{incidentClusters.length}개 클러스터</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--gap)", alignItems: "stretch" }}>
        {/* 좌: 재발 클러스터 목록 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="재발 클러스터" sub="코드별 반복 발생 · window" dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "var(--surface-2)", zIndex: 1 }}>
                  {["클러스터", "코드 / 모듈", "재발", "window", "심각도"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: i === 2 ? "right" : "left",
                        padding: "8px 12px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "var(--ink-3)",
                        borderBottom: "1px solid var(--line)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidentClusters.map((c) => {
                  const active = c.id === sel.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSel(c)}
                      style={{
                        cursor: "pointer",
                        background: active ? "var(--surface-2)" : "transparent",
                        borderLeft: active ? "3px solid var(--brand)" : "3px solid transparent",
                      }}
                    >
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)" }}>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{c.id}</span>
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)" }}>
                        <div className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{c.code}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{c.module}</div>
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)", textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: c.count >= 6 ? "var(--st-critical)" : "var(--st-warning)" }}>
                          x{c.count}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)", color: "var(--ink-2)", whiteSpace: "nowrap" }}>
                        {c.window}
                      </td>
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)" }}>{sevBadge(c.sev)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 선택 클러스터 예방 액션 */}
          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>
              예방 액션 · <span className="mono">{sel.id}</span>
            </div>
            {sel.preventive ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "10px 12px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--tint-warning)",
                  border: "1px solid var(--line)",
                }}
              >
                <Icon name="shield" size={15} style={{ color: "var(--st-warning)", flex: "none", marginTop: 1 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.5 }}>{sel.preventive}</span>
              </div>
            ) : (
              <EmptyNote title="예방책 미정의" sub="포스트모템에서 예방 액션을 정의하세요" />
            )}
            {sel.linkedFirmware && (
              <button className="btn primary" onClick={() => router.push(`/firmware/${sel.linkedFirmware}/approve`)}>
                <Icon name="rocket" size={14} /> 연계 펌웨어 승인 — <span className="mono">{sel.linkedFirmware}</span>
              </button>
            )}
          </div>
        </div>

        {/* 우: 포스트모템 에디터 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="포스트모템 (mock)" sub={`${sel.id} · ${sel.code}`} dense />
          <div style={{ flex: 1, padding: 12, minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              value={postmortem}
              onChange={(e) => setPostmortem(e.target.value)}
              style={{
                flex: 1,
                minHeight: 0,
                resize: "none",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)",
                background: "var(--surface)",
                padding: "11px 13px",
                fontSize: 12.5,
                lineHeight: 1.6,
                fontFamily: "var(--mono, monospace)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1 }}>
                <Icon name="doc" size={14} /> 초안 저장
              </button>
              <button className="btn primary" style={{ flex: 1 }}>
                <Icon name="check" size={14} /> 포스트모템 게시
              </button>
            </div>
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--line)",
              fontSize: 11.5,
              color: "var(--ink-2)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} /> 게시 시 actor · action(postmortem.publish) · target {sel.id} 가 audit_log에 기록됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
