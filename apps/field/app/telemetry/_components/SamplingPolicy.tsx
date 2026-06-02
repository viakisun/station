"use client";
/* ============================================================
   Telemetry 설정 — Step 4: 샘플링 · 임계값 정책
   (원본: telemetry-console/screens_setup2.jsx SamplingPolicy)
   ============================================================ */
import { useState } from "react";
import { Icon, type IconName } from "@station/design-system";
import { TELEMETRY } from "@station/domain";
import { TStepHead, type Step } from "./helpers";

export function SamplingPolicy({ step }: { step: Step }) {
  const T = TELEMETRY;
  const [promote, setPromote] = useState<Record<string, boolean>>(() => {
    const p: Record<string, boolean> = {};
    T.policies.forEach((x) => (p[x.ch] = x.promote));
    return p;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 18 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Channel", "Rate", "warning", "critical", "Smoothing", "Promote"].map((h, i) => (
                  <th key={i} style={{ padding: "11px 14px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {T.policies.map((p) => {
                const ch = T.channels.find((c) => c.id === p.ch);
                return (
                  <tr key={p.ch} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Icon name={(ch?.icon || "activity") as IconName} size={16} style={{ color: "var(--ink-3)" }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{ch?.label}</div>
                          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.ch}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: 12.5, padding: "3px 9px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 5, fontWeight: 700 }}>{p.rate}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-warning)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-warning)" }} />{p.warn}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-critical)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-critical)" }} />{p.crit}</span></td>
                    <td style={{ padding: "12px 14px", color: "var(--ink-2)" }}>{p.smooth}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => setPromote((s) => ({ ...s, [p.ch]: !s[p.ch] }))} style={{ width: 46, height: 26, borderRadius: 999, border: "none", padding: 3, cursor: "pointer", background: promote[p.ch] ? "var(--brand)" : "var(--surface-3)", display: "flex", justifyContent: promote[p.ch] ? "flex-end" : "flex-start", transition: "all .15s" }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-2)" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--ink-2)" }}>
          <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} />
          When a threshold is exceeded, channels with promotion on are forwarded to the incident console (C03) with their event_code.
        </div>
      </div>
    </div>
  );
}
