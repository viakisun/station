"use client";
import { useState } from "react";
import { CONTROL } from "@station/domain";
import {
  Icon,
  StatusBadge,
  PanelHead,
  type Sev,
} from "@station/design-system";

interface MapListScreenProps {
  density?: "regular" | "compact";
}

export function MapListScreen({ density }: MapListScreenProps) {
  const M = CONTROL;
  const validMeta: Record<string, { sev: Sev; label: string }> = { passed: { sev: "normal", label: "passed" }, running: { sev: "notice", label: "validating" }, failed: { sev: "critical", label: "failed" } };
  const stateMeta: Record<string, Sev> = { "active": "normal", "draft": "disabled", "validation failed": "critical", "archived": "disabled" };
  const [sel, setSel] = useState(M.maps[0].id);
  const selMap = M.maps.find((m) => m.id === sel)!;

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <PanelHead title="Greenhouse maps" sub={`${M.maps.length} versions · 3 active / 1 draft`} dense={density === "compact"}
          right={<button className="btn primary"><Icon name="plus" size={15} /> New map</button>} />
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Map / version", "Greenhouse", "State", "Routes", "Validation", "Updated", "Author"].map((h, i) =>
                  <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {M.maps.map((m) => (
                <tr key={m.id} onClick={() => setSel(m.id)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer",
                  background: sel === m.id ? "var(--surface-2)" : "transparent" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-2)" }}>{M.greenhouses.find((g) => g.id === m.gh)?.name}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge sev={stateMeta[m.state]} label={m.state} /></td>
                  <td style={{ padding: "10px 14px" }} className="tnum">{m.routes}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge sev={validMeta[m.valid].sev} label={validMeta[m.valid].label} /></td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-3)" }} className="mono">{m.updated}</td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-2)" }}>{m.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* validation summary panel */}
      <div className="card" style={{ width: 320, flex: "none", display: "flex", flexDirection: "column" }}>
        <PanelHead title="Validation summary" sub={selMap.id} dense />
        <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 7, border: "1px solid var(--line)",
            background: selMap.valid === "failed" ? "var(--tint-critical)" : selMap.valid === "running" ? "var(--tint-notice)" : "var(--surface-2)" }}>
            <Icon name={selMap.valid === "failed" ? "alert" : selMap.valid === "running" ? "refresh" : "check"} size={22}
              style={{ color: `var(--st-${validMeta[selMap.valid].sev})` }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{validMeta[selMap.valid].label}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{selMap.name} · {selMap.version}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["Coordinate / scale", "passed"],
              ["Row spacing", selMap.valid === "failed" ? "failed" : "passed"],
              ["Safety-zone overlap", selMap.valid === "failed" ? "failed" : "passed"],
              ["Path turn radius", "passed"],
              ["Thin/Pinch compatibility", selMap.valid === "running" ? "running" : "passed"],
            ].map(([l, st], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5 }}>{l}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700,
                  color: st === "failed" ? "var(--st-critical)" : st === "running" ? "var(--st-notice)" : "var(--st-normal)" }}>
                  <Icon name={st === "failed" ? "close" : st === "running" ? "refresh" : "check"} size={13} />
                  {st === "failed" ? "failed" : st === "running" ? "validating" : "passed"}
                </span>
              </div>
            ))}
          </div>
          {selMap.valid === "failed" && (
            <div style={{ padding: 11, borderRadius: 7, background: "var(--tint-critical)", color: "var(--st-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, fontWeight: 600 }}>
              검증 실패 버전은 작업 계획·HMI 전송에 사용할 수 없습니다.
            </div>
          )}
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn" style={{ flex: 1 }}><Icon name="route" size={15} /> Edit routes</button>
            <button className="btn" style={{ flex: 1 }} disabled={selMap.valid !== "passed"}>Set active</button>
          </div>
        </div>
      </div>
    </div>
  );
}
