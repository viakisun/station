"use client";
/* ============================================================
   C03-08 장애 리포트 · 분석
   ============================================================ */
import { Icon, KpiCard, PanelHead } from "@station/design-system";
import { INCIDENT } from "@station/domain";

export function ReportScreen({ density }: { density?: "compact" | "regular" }) {
  void density;
  const IC = INCIDENT,
    r = IC.report;
  const maxP = Math.max(...r.pareto.map((p) => p.n));
  const maxT = Math.max(...r.trend);
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {["Last 7d", "30d", "Quarter"].map((p, i) => (
          <button key={p} className={"chip" + (i === 0 ? " active" : "")} style={{ height: 30 }}>
            {p}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn sm">
          <Icon name="dl" size={14} /> PDF report
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="avg MTTR" value={r.mttr} icon="wrench" />
        <KpiCard label="avg MTBF" value={r.mtbf} icon="clock" />
        <KpiCard label="total" value={r.total} unit="" icon="alert" />
        <KpiCard label="resolved" value={r.resolved} unit="" icon="check" />
        <KpiCard label="recur rate" value={r.recurRate} unit="%" sev="warning" icon="refresh" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}>
        <div className="card">
          <PanelHead title="Incident trend" sub="daily count" dense />
          <div style={{ padding: "20px 18px", display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {r.trend.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span className="tnum" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>
                  {v}
                </span>
                <div style={{ width: "100%", height: (v / maxT) * 130, background: "var(--ink)", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                <span style={{ fontSize: 10, color: "var(--ink-3)" }}>D-{r.trend.length - 1 - i}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <PanelHead title="Incidents by module (Pareto)" sub="top sources" dense />
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
            {r.pareto.map((p) => (
              <div key={p.m} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span className="mono" style={{ width: 120, fontSize: 11.5, fontWeight: 700, flex: "none" }}>
                  {p.m}
                </span>
                <div style={{ flex: 1, height: 18, background: "var(--surface-3)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: (p.n / maxP) * 100 + "%", height: "100%", background: `var(--st-${p.sev})`, borderRadius: 5, opacity: 0.85 }} />
                </div>
                <span className="tnum" style={{ width: 24, textAlign: "right", fontSize: 12.5, fontWeight: 800 }}>
                  {p.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
