"use client";
/* ============================================================
   C03-03 장애 상세 + Unified root-cause timeline (시그니처)
   ============================================================ */
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName, PanelHead, StatusBadge } from "@station/design-system";
import { INCIDENT } from "@station/domain";
import { SrcTag, sevOf } from "./IncidentDash";

function RelCard({ icon, k, v, onNav }: { icon: IconName; k: ReactNode; v: ReactNode; onNav?: () => void }) {
  return (
    <button
      onClick={onNav}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: 11,
        border: "1px solid var(--line)",
        borderRadius: "var(--r-sm)",
        background: "var(--surface)",
        textAlign: "left",
        width: "100%",
      }}
    >
      <Icon name={icon} size={17} style={{ color: "var(--ink-3)", flex: "none" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{k}</div>
        <div className="mono" style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {v}
        </div>
      </div>
      <Icon name="ext" size={14} style={{ color: "var(--ink-3)", flex: "none" }} />
    </button>
  );
}

export function IncidentDetail({ incidentId, density }: { incidentId?: string; density?: "compact" | "regular" }) {
  void density;
  const router = useRouter();
  const onBack = () => router.push("/incident/list");
  const onAction = (id: string) => router.push(`/incident/${id}/action`);
  // cross-app links are no-ops in the prototype
  const onNav = (_id: string) => {};

  const IC = INCIDENT;
  const inc = IC.incidents.find((i) => i.id === incidentId) || IC.incidents[1];
  const [cause, setCause] = useState(inc.cause);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={onBack}>
          <Icon name="chevL" size={15} /> Incidents
        </button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
          {inc.id}
        </span>
      </div>

      {/* summary header */}
      <div className="card" style={{ padding: "var(--pad-card)", display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
            <StatusBadge sev={IC.statusMeta[inc.status].sev} label={IC.statusMeta[inc.status].label} dot={false} />
            <SrcTag src={inc.src} />
            <span style={{ fontSize: 16, fontWeight: 800 }}>{inc.title}</span>
            {inc.recur > 1 && <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--st-warning)" }}>recurs x{inc.recur}</span>}
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 12, color: "var(--ink-2)" }}>
            <span>
              robot <b className="mono">{inc.robot}</b>
            </span>
            <span>
              Module <b className="mono">{inc.module}</b>
            </span>
            <span>
              Code <b className="mono">{inc.code}</b>
            </span>
            <span>
              Impact <b>{inc.impact}</b>
            </span>
            <span>
              Owner <b style={{ color: inc.owner === "unassigned" ? "var(--st-critical)" : "var(--ink)" }}>{inc.owner}</b>
            </span>
          </div>
        </div>
        <button className="btn" onClick={() => onNav("telemetry")}>
          <Icon name="dl" size={15} /> Logs
        </button>
        <button className="btn primary" onClick={() => onAction(inc.id)}>
          <Icon name="wrench" size={15} /> Start remediation
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* unified timeline */}
        <div className="card">
          <PanelHead title="Unified root-cause timeline" sub="work · command · telemetry · HMI · firmware unified" dense />
          <div style={{ padding: "16px 18px" }}>
            {IC.timeline.map((ev, i) => {
              const lm = IC.laneMeta[ev.lane],
                m = IC.sevMeta[ev.sev];
              const last = i === IC.timeline.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 13 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        flex: "none",
                        display: "grid",
                        placeItems: "center",
                        background: m.sev === "critical" || m.sev === "emergency" ? `var(--st-${m.sev})` : "var(--surface-2)",
                        border: m.sev === "critical" || m.sev === "emergency" ? "none" : "1px solid var(--line)",
                        color: m.sev === "critical" || m.sev === "emergency" ? "#fff" : "var(--ink-2)",
                      }}
                    >
                      <Icon name={lm.icon as IconName} size={15} />
                    </span>
                    {!last && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 3, minHeight: 22 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {ev.t}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--ink-3)",
                          padding: "1px 6px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--line)",
                          borderRadius: 3,
                        }}
                      >
                        {lm.label}
                      </span>
                      {(m.sev === "critical" || m.sev === "warning" || m.sev === "emergency") && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--st-${m.sev})` }} />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 3,
                        color: m.sev === "critical" || m.sev === "emergency" ? "var(--st-critical)" : "var(--ink)",
                      }}
                    >
                      {ev.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{ev.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* cause + related */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="Cause classification" sub="root cause taxonomy" dense />
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {IC.causeTax.map((c) => (
                  <button key={c} onClick={() => setCause(c)} className={"chip" + (cause === c ? " active" : "")} style={{ height: 30 }}>
                    {c}
                  </button>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: "9px 11px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  fontSize: 11.5,
                  color: "var(--ink-2)",
                }}
              >
                selected cause <b style={{ color: "var(--ink)" }}>{cause}</b> · linked to {inc.recur} similar incidents
              </div>
            </div>
          </div>
          <div className="card">
            <PanelHead title="Linked objects" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <RelCard icon="robot" k="robot" v={inc.robot} onNav={() => onNav("control")} />
              <RelCard icon="chip" k="Module / firmware" v={inc.module} onNav={() => onNav("firmware")} />
              {inc.session && <RelCard icon="board" k="Work session" v={inc.session} onNav={() => onNav("control")} />}
              <RelCard icon="telemetry" k="Telemetry" v="Open quality diag" onNav={() => onNav("telemetry")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
