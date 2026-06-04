"use client";
import { Icon, KpiCard, PanelHead, StatusBadge, type IconName } from "@station/design-system";
import { RELEASE } from "@station/domain";

/* ---------------- C02-00 개발자 킷 홈 ---------------- */
export function AuditHome({ onNav, density }: { onNav: (id: string) => void; density: string }) {
  const R = RELEASE,
    k = R.kpi;
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="Active vendors" value={k.vendorsActive} icon="grip" />
        <KpiCard label="Registered modules" value={k.modulesTotal} sub={`approved ${k.modulesApproved}`} icon="pkg" />
        <KpiCard label="Audit pass rate" value={k.auditPassRate} unit="%" icon="check" />
        <KpiCard label="Open issues" value={k.openIssues} sev={k.openIssues > 0 ? "warning" : undefined} icon="flag" />
        <KpiCard label="Conformance runs" value={k.conformanceRuns} icon="beaker" />
        <KpiCard label="SDK" value={"v" + k.sdkVersion} icon="code" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* onboarding / module table */}
        <div className="card">
          <PanelHead title="Module onboarding" sub={`${R.modules.length} modules · multi-vendor`} dense={density === "compact"}
            right={<button className="btn primary sm"><Icon name="plus" size={14} /> New module</button>} />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Module", "Vendor", "Robots", "Firmware", "Audit", ""].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {R.modules.map(m => {
                  const am = R.auditMeta[m.auditState];
                  const v = R.vendors.find(x => x.id === m.vendor);
                  return (
                    <tr key={m.id} className="hov-row" style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ fontWeight: 700 }}>{m.type}</div>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{v?.name}</td>
                      <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{m.robots}</td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5 }}>v{m.fw}</span></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={am.sev} label={am.label} /></td>
                      <td style={{ padding: "9px 12px" }}><button className="btn ghost sm" onClick={() => onNav("c02-audit")}><Icon name="chevR" size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* quick start checklist */}
          <div className="card">
            <PanelHead title="Quick start" sub="vendor onboarding · 5 steps" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
              {([["Download SDK · schema", true], ["Write Capability / Protocol Profile", true], ["Validate messages in simulator", true], ["Run Conformance tests", false], ["Approve Audit Package", false]] as [string, boolean][]).map(([l, done], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                    background: done ? "var(--brand)" : "var(--surface-2)", border: done ? "none" : "1.5px solid var(--line-strong)", color: "#fff" }}>
                    {done ? <Icon name="check" size={12} stroke={2.5} /> : <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 700 }}>{i + 1}</span>}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: done ? 500 : 700, color: done ? "var(--ink-3)" : "var(--ink)", textDecoration: done ? "line-through" : "none" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* recent failed tests */}
          <div className="card">
            <PanelHead title="Needs action" sub="failed / blocked / waiver" dense />
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <AlertRow icon="beaker" sev="critical" title="MOD-NAV-N2 conformance failed" sub="4 error-map · 2 schema" onClick={() => onNav("c02-conf")} />
              <AlertRow icon="fileCode" sev="critical" title="FW-EEP-3.1.0 static analysis blocked" sub="2 critical findings" onClick={() => onNav("c04-static")} />
              <AlertRow icon="flag" sev="warning" title="AUD-MOD-EEP waiver pending" sub="GreenEdge · pending approval" onClick={() => onNav("c02-audit")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ icon, sev, title, sub, onClick }: { icon: IconName; sev: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, padding: 10, border: "1px solid var(--line)",
      borderRadius: "var(--r-sm)", background: "var(--surface)", textAlign: "left", width: "100%" }}>
      <span style={{ color: `var(--st-${sev})`, flex: "none" }}><Icon name={icon} size={17} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</div>
      </div>
      <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}
