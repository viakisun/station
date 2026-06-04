"use client";
import { useState } from "react";
import { StatusBadge, type Sev } from "@station/design-system";
import { RELEASE } from "@station/domain";

type Cell = { fw: string; target: string; state: string; reason?: string };

/* ---------------- C04-03 호환성 매트릭스 ---------------- */
export function CompatMatrix({ density }: { density: string }) {
  const R = RELEASE;
  const [cell, setCell] = useState<Cell | null>(null);
  const reasons: Record<string, string> = {
    "FW-CAM-2.4.2|HMI-800": "HMI 800×480 firmware < v1.8 — UI render limits, update recommended",
    "FW-EEP-3.1.0|RBT-PINCH": "unresolved static-analysis critical — cannot deploy",
    "FW-EEP-3.1.0|TEL-GW2": "Telemetry schema mapping unverified",
    "FW-NAV-4.0.6|HMI-1024": "HMI firmware dependency warning — check matrix",
    "FW-NAV-4.0.6|HMI-800": "low-res HMI compatibility warning",
    "FW-NAV2-0.9.4|RBT-THIN": "Audit unapproved — cannot deploy",
    "FW-NAV2-0.9.4|TEL-GW2": "protocol contract mismatch",
  };
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Compatibility matrix</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>firmware × robot/HMI/Telemetry deployability</div>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "7px 12px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, fontSize: 11, color: "var(--ink-2)" }}>
          {Object.entries(R.compatMeta).map(([k, m]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
              <CompatCell state={k} mini /> {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "var(--surface-2)", padding: "12px 14px", textAlign: "left", fontSize: 11.5, fontWeight: 700, borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)", minWidth: 160, zIndex: 2 }}>Firmware</th>
              {R.compatTargets.map(t => (
                <th key={t.id} style={{ padding: "12px 10px", fontSize: 11.5, fontWeight: 700, borderBottom: "1px solid var(--line)", textAlign: "center", minWidth: 96 }}>
                  {t.label}<div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{t.id}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {R.compatRows.map((row) => (
              <tr key={row.fw}>
                <td style={{ position: "sticky", left: 0, background: "var(--surface)", padding: "10px 14px", borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)", zIndex: 1 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{row.fw}</span>
                </td>
                {row.vals.map((v, ci) => {
                  const key = `${row.fw}|${R.compatTargets[ci].id}`;
                  const selKey = cell && `${cell.fw}|${cell.target}`;
                  return (
                    <td key={ci} style={{ padding: 7, borderBottom: "1px solid var(--line)", textAlign: "center",
                      background: selKey === key ? "var(--surface-2)" : "transparent", cursor: v === "warn" || v === "incompat" || v === "unknown" ? "pointer" : "default" }}
                      onClick={() => (v !== "ok" && v !== "na") && setCell({ fw: row.fw, target: R.compatTargets[ci].id, state: v, reason: reasons[key] })}>
                      <CompatCell state={v} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cell && (
        <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <CompatCell state={cell.state} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              <span className="mono">{cell.fw}</span> → {R.compatTargets.find(t => t.id === cell.target)?.label}
              <span style={{ marginLeft: 8 }}><StatusBadge sev={R.compatMeta[cell.state].sev as Sev} label={R.compatMeta[cell.state].label} /></span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3 }}>{cell.reason || "no block reason"}</div>
          </div>
          <button className="btn sm" onClick={() => setCell(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
function CompatCell({ state, mini }: { state: string; mini?: boolean }) {
  const R = RELEASE, m = R.compatMeta[state];
  const sz = mini ? 16 : 26;
  const bg = ({ ok: "var(--st-normal)", warn: "var(--st-warning)", incompat: "var(--st-critical)", unknown: "var(--surface-3)", na: "transparent" } as Record<string, string>)[state];
  const fg = state === "unknown" ? "var(--ink-3)" : state === "na" ? "var(--line-strong)" : "#fff";
  return (
    <span style={{ display: "inline-grid", placeItems: "center", width: sz, height: sz, borderRadius: mini ? 4 : 6,
      background: state === "na" ? "transparent" : bg, color: fg, border: state === "na" ? "1px dashed var(--line-strong)" : "none",
      fontSize: mini ? 10 : 13, fontWeight: 800 }}>{m.mark}</span>
  );
}
