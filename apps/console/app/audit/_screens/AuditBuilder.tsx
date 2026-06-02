"use client";
import { Icon, PanelHead } from "@station/design-system";
import { RELEASE } from "@station/domain";
import type { IconName } from "@station/design-system";

/* ---------------- C02-07 Audit Package 빌더 ---------------- */
export function AuditBuilder({ density }: { density: string }) {
  const R = RELEASE;
  const arts = R.auditArtifacts;
  const present = arts.filter(a => a.ok).length;
  const score = 91;
  const missing = arts.filter(a => !a.ok);
  const steps: { label: string; state: "done" | "current" | "todo" }[] = [
    { label: "Collect artifacts", state: "done" },
    { label: "Attach conformance results", state: "done" },
    { label: "Score ≥ 90", state: "done" },
    { label: "QA review", state: "current" },
    { label: "Approve for production", state: "todo" },
  ];

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* package contents */}
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <PanelHead title="Audit Package contents" sub="AUD-MOD-CAM-20260531-01 · audit_package.zip" dense={density === "compact"}
          right={<span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{present}/{arts.length} included</span>} />
        <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
          {arts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", borderRadius: "var(--r-sm)" }} className="hov-row">
              <span style={{ width: 16, height: 16, borderRadius: 4, flex: "none", display: "grid", placeItems: "center",
                background: a.ok ? "var(--brand)" : "var(--surface-2)", border: a.ok ? "none" : "1.5px dashed var(--line-strong)", color: "#fff" }}>
                {a.ok && <Icon name="check" size={11} stroke={3} />}
              </span>
              <Icon name={(a.f.endsWith(".pdf") ? "doc" : a.f.endsWith(".md") ? "doc" : "fileCode") as IconName} size={15} style={{ color: "var(--ink-3)", flex: "none" }} />
              <span className="mono" style={{ fontSize: 12, flex: 1, color: a.ok ? "var(--ink)" : "var(--ink-3)" }}>{a.f}</span>
              {a.note && <span style={{ fontSize: 11, color: a.ok ? "var(--ink-3)" : "var(--st-warning)", fontWeight: a.ok ? 500 : 700 }}>{a.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* score + approval */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
        <div className="card" style={{ padding: "var(--pad-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ScoreRing score={score} />
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>Conformance score</div>
              <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>98 / 102 cases passed</div>
              <div style={{ fontSize: 11.5, color: "var(--st-warning)", fontWeight: 600, marginTop: 4 }}>≥ 90 threshold — approvable</div>
            </div>
          </div>
        </div>

        {missing.length > 0 && (
          <div className="card" style={{ padding: "12px 14px", background: "var(--tint-warning)", border: "1px solid #efe3c6" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--st-warning)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="alert" size={15} /> {missing.length} missing artifacts
            </div>
            {missing.map((m, i) => <div key={i} className="mono" style={{ fontSize: 11.5, color: "#7a5a06" }}>· {m.f}</div>)}
          </div>
        )}

        <div className="card">
          <PanelHead title="Approval workflow" dense />
          <div style={{ padding: "14px 16px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 11, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                    background: s.state === "done" ? "var(--brand)" : s.state === "current" ? "var(--surface)" : "var(--surface-2)",
                    border: s.state === "current" ? "2px solid var(--st-notice)" : s.state === "todo" ? "1.5px solid var(--line-strong)" : "none", color: "#fff" }}>
                    {s.state === "done" && <Icon name="check" size={11} stroke={3} />}
                    {s.state === "current" && <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--st-notice)" }} />}
                  </span>
                  {i < steps.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 3, minHeight: 14 }} />}
                </div>
                <div style={{ paddingTop: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: s.state === "current" ? 700 : 600, color: s.state === "todo" ? "var(--ink-3)" : "var(--ink)" }}>{s.label}</div>
                  {s.state === "current" && <div style={{ fontSize: 11, color: "var(--st-notice)", fontWeight: 600 }}>in progress · Jung W.</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1 }}><Icon name="dl" size={15} /> zip Export</button>
            <button className="btn primary" style={{ flex: 1 }} disabled={missing.length > 0}><Icon name="check" size={15} /> Request approval</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ScoreRing({ score }: { score: number }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: 68, height: 68, flex: "none" }}>
      <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span className="tnum" style={{ fontSize: 19, fontWeight: 800 }}>{score}</span>
      </div>
    </div>
  );
}
