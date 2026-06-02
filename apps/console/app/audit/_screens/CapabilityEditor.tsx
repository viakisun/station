"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  GateNotice,
  EmptyNote,
} from "@station/design-system";
import { capabilityProfiles } from "@station/domain";

/* ---------------- C02-02 Capability Profile 편집기 ---------------- */
export function CapabilityEditor({ density }: { density: string }) {
  const moduleIds = Object.keys(capabilityProfiles);
  const [moduleId, setModuleId] = useState("MOD-CAM-V01");
  const profile = capabilityProfiles[moduleId];
  const [selVerb, setSelVerb] = useState(profile.commands[0]?.verb ?? "");

  const cmd = profile.commands.find((c) => c.verb === selVerb) ?? profile.commands[0];
  const hasBreaking = !!profile.diff && profile.diff.length > 0;
  const dense = density === "compact";

  // 모듈 전환 시 첫 명령 선택
  const switchModule = (id: string) => {
    setModuleId(id);
    setSelVerb(capabilityProfiles[id].commands[0]?.verb ?? "");
  };

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Capability Profile 편집기</span>
            <StatusBadge sev="notice" label="C02-02" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            <span className="mono">{profile.id}</span> · {profile.version} · 명령 스키마 · 파라미터 · 캘리브 · 버전 diff
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {moduleIds.map((id) => (
            <button key={id} className={"btn sm" + (id === moduleId ? " primary" : "")} onClick={() => switchModule(id)}>
              <span className="mono" style={{ fontSize: 11 }}>{id}</span>
            </button>
          ))}
        </div>
      </div>

      {hasBreaking && (
        <GateNotice
          severity="warn"
          gateId={profile.id}
          title="Breaking change 가능성"
          reason={`이전 버전 대비 ${profile.diff!.length}건의 스키마 변경이 감지되었습니다. 운영 중 모듈은 호환성 검토 후 배포하세요.`}
        />
      )}

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "0.9fr 1.6fr", gap: "var(--gap)" }}>
        {/* 좌: 명령 트리 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="기능 / 명령" sub={`${profile.commands.length} commands`} dense />
          <div style={{ flex: 1, overflow: "auto", padding: 6 }}>
            {profile.commands.map((c) => {
              const on = c.verb === selVerb;
              return (
                <button key={c.verb} onClick={() => setSelVerb(c.verb)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "none", borderRadius: "var(--r-sm)", background: on ? "var(--surface-2)" : "transparent", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer", textAlign: "left" }}>
                  <Icon name="terminal" size={14} style={{ color: "var(--ink-3)", flex: "none" }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{c.verb}</span>
                  {c.safety && <StatusBadge sev="warning" label="safety" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 우: 상세 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
          {/* 명령 스키마 */}
          <div className="card">
            <PanelHead title="명령 스키마" sub={cmd?.verb} dense
              right={cmd?.safety ? <StatusBadge sev="warning" label="safety-critical" /> : undefined} />
            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              <SchemaCell label="verb" value={cmd?.verb ?? "—"} mono />
              <SchemaCell label="ack" value={cmd?.ack ?? "—"} mono />
              <SchemaCell label="timeout" value={cmd?.timeout ?? "—"} mono />
            </div>
          </div>

          {/* 파라미터 테이블 */}
          <div className="card">
            <PanelHead title="파라미터" sub={`${profile.parameters.length} params`} dense />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["key", "type", "range"].map((h, i) =>
                  <th key={i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {profile.parameters.map((p) => (
                  <tr key={p.key} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{p.key}</span></td>
                    <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{p.type}</span></td>
                    <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 11.5 }}>{p.range}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
            {/* 캘리브레이션 요구 */}
            <div className="card">
              <PanelHead title="캘리브레이션 요구" dense />
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {profile.calibration.length === 0 ? (
                  <EmptyNote icon="check" title="요구 없음" sub="캘리브레이션 요구 사항이 없습니다." />
                ) : profile.calibration.map((c, i) => {
                  const overdue = c.due === "overdue";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
                      <Icon name="wrench" size={15} style={{ color: overdue ? "var(--st-critical)" : "var(--ink-3)", flex: "none" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.req}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.due}</div>
                      </div>
                      {overdue && <StatusBadge sev="critical" label="overdue" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 버전 diff */}
            <div className="card">
              <PanelHead title="버전 diff" sub={hasBreaking ? `${profile.diff!.length} change(s)` : "변경 없음"} dense />
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {!hasBreaking ? (
                  <EmptyNote icon="check" title="diff 없음" sub="이전 버전과 동일합니다." />
                ) : profile.diff!.map((d, i) => (
                  <div key={i} style={{ padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}><span className="mono">{d.field}</span></div>
                    <div className="mono" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--st-critical)", textDecoration: "line-through" }}>{d.from}</span>
                      <Icon name="arrowRight2" size={13} style={{ color: "var(--ink-3)" }} />
                      <span style={{ color: "var(--st-normal)", fontWeight: 700 }}>{d.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemaCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>{label}</div>
      <div className={mono ? "mono" : undefined} style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
