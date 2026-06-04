"use client";
/* ============================================================
   C03-05 조치 가이드
   ============================================================ */
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon, PanelHead, StatusBadge } from "@station/design-system";
import { INCIDENT } from "@station/domain";
import { sevOf } from "./IncidentDash";

function KV3({ pairs }: { pairs: [ReactNode, ReactNode][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p[0]}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p[1]}</span>
        </div>
      ))}
    </div>
  );
}

export function ActionGuideScreen({ incidentId, density }: { incidentId?: string; density?: "compact" | "regular" }) {
  void density;
  const router = useRouter();
  const onBack = () => router.push(`/incident/${incidentId ?? INCIDENT.actionGuide.incident}`);
  // cross-app links are no-ops in the prototype
  const onNav = (_id: string) => {};

  const IC = INCIDENT;
  const g = IC.actionGuide;
  const inc = IC.incidents.find((i) => i.id === incidentId) || IC.incidents.find((i) => i.id === g.incident)!;
  const [done, setDone] = useState<boolean[]>(() => g.steps.map((s) => s.done));
  const doneN = done.filter(Boolean).length;

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={onBack}>
          <Icon name="chevL" size={15} /> Incident detail
        </button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
          {inc.id}
        </span>
        <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title={g.title} sub={`${doneN}/${g.steps.length} steps done`} dense />
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--line)",
              background: "var(--tint-warning)",
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
            }}
          >
            <Icon name="shield" size={16} style={{ color: "var(--st-warning)", flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#7a5a06", fontWeight: 600, lineHeight: 1.5 }}>{g.safety}</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
            {g.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderBottom: "1px solid var(--line)" }}>
                <button
                  onClick={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    flex: "none",
                    display: "grid",
                    placeItems: "center",
                    border: done[i] ? "none" : "1.5px solid var(--line-strong)",
                    background: done[i] ? "var(--brand)" : "var(--surface)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {done[i] && <Icon name="check" size={14} stroke={3} />}
                </button>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: done[i] ? 500 : 600,
                    color: done[i] ? "var(--ink-3)" : "var(--ink)",
                    textDecoration: done[i] ? "line-through" : "none",
                  }}
                >
                  {s.s}
                </span>
                {s.hmi && (
                  <button className="btn ghost sm" onClick={() => onNav("hmi")}>
                    <Icon name="hmi" size={13} /> HMI
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1 }}>
              <Icon name="dot" size={15} /> Attach photo · note
            </button>
            <button className="btn primary" style={{ flex: 1 }} disabled={doneN < g.steps.length}>
              <Icon name="check" size={15} /> Submit remediation
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Linked info</div>
          <KV3
            pairs={[
              ["Incident", <span className="mono">{inc.id}</span>],
              ["robot", <span className="mono">{inc.robot}</span>],
              ["Module", <span className="mono">{inc.module}</span>],
              ["Cause class", inc.cause],
              ["Work session", inc.session ? <span className="mono">{inc.session}</span> : "—"],
            ]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button className="btn" style={{ width: "100%" }} onClick={() => onNav("telemetry")}>
              <Icon name="telemetry" size={15} /> Test Telemetry channel
            </button>
            <button className="btn" style={{ width: "100%" }} onClick={() => onNav("hmi")}>
              <Icon name="hmi" size={15} /> Open HMI calibration
            </button>
          </div>
          <div
            style={{
              marginTop: "auto",
              padding: "10px 12px",
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
            <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} /> Owner, time & rationale recorded to audit_log.
          </div>
        </div>
      </div>
    </div>
  );
}
