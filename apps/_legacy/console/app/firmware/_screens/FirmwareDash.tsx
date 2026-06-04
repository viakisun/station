"use client";
import { Icon, KpiCard, PanelHead, StatusBadge } from "@station/design-system";
import { RELEASE } from "@station/domain";

/* ---------------- C04-00 펌웨어 운영 대시보드 ---------------- */
export function FirmwareDash({ onNav, density }: { onNav: (id: string) => void; density: string }) {
  const R = RELEASE,
    k = R.kpi;
  const blocked = R.firmwares.filter(f => f.deploy === "blocked" || f.analysis === "failed");
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="Registered firmware" value={R.firmwares.length} icon="fileCode" />
        <KpiCard label="Analyzing" value={k.fwAnalyzing} icon="refresh" />
        <KpiCard label="Deploy blocked" value={k.fwBlocked} sev={k.fwBlocked ? "critical" : undefined} icon="lock" />
        <KpiCard label="Deploying" value={k.deploysActive} sub="Canary 2/6" icon="rocket" onClick={() => onNav("c04-ota")} />
        <KpiCard label="Pending approval" value={1} sev="warning" icon="flag" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card">
          <PanelHead title="Firmware versions" sub="per-module lifecycle · deploy state" dense={density === "compact"}
            right={<button className="btn primary sm"><Icon name="upload" size={14} /> Register firmware</button>} />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Firmware / version", "Module", "Static analysis", "Deploy", "findings", ""].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {R.firmwares.map(f => {
                  const am = R.fwAnalysisMeta[f.analysis], dm = R.fwMeta[f.deploy];
                  return (
                    <tr key={f.id} className="hov-row" style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}
                      onClick={() => onNav(f.deploy === "blocked" || f.analysis === "failed" ? "c04-static" : "c04-ota")}>
                      <td style={{ padding: "9px 12px" }}>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{f.id}</span>
                        <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{f.note}</div>
                      </td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{f.module}</span></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={am.sev} label={am.label} dot={f.analysis !== "analyzing"} /></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={dm.sev} label={dm.label} /></td>
                      <td style={{ padding: "9px 12px" }}>
                        <span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>{f.findings}</span>
                        {f.critical > 0 && <span style={{ fontSize: 11, color: "var(--st-critical)", fontWeight: 700 }}> · {f.critical} critical</span>}
                      </td>
                      <td style={{ padding: "9px 12px" }}><Icon name="chevR" size={14} style={{ color: "var(--ink-3)" }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <PanelHead title="Blocked items" sub="failed release gate" dense
            right={<StatusBadge sev="critical" label={`${blocked.length}`} />} />
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {blocked.map(f => (
              <button key={f.id} onClick={() => onNav("c04-static")} style={{ textAlign: "left", border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)", padding: 11, background: "var(--surface)", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{f.id}</span>
                  <StatusBadge sev="critical" label={f.critical ? `${f.critical} critical` : "analysis failed"} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{f.module} · {f.note}</div>
              </button>
            ))}
            <div style={{ padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--tint-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, color: "var(--st-critical)", fontWeight: 600 }}>
              If analysis fails, compatibility is incompatible, or Audit is unapproved, deployment planning is blocked.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
