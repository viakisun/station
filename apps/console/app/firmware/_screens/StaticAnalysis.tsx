"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Icon, PanelHead, StatusBadge } from "@station/design-system";
import { RELEASE } from "@station/domain";

type Finding = (typeof RELEASE.findings)[number];

/* ---------------- C04-02 정적분석 결과 상세 ---------------- */
export function StaticAnalysis({ density }: { density: string }) {
  const R = RELEASE;
  const all = R.findings;
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState<Finding>(all[0]);
  const counts = { critical: all.filter(f => f.sev === "critical").length, warning: all.filter(f => f.sev === "warning").length,
    low: all.filter(f => f.sev === "low").length, info: all.filter(f => f.sev === "info").length };
  const list = filter === "all" ? all : all.filter(f => f.sev === filter);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Static analysis</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>FW-EEP-3.1.0</span>
            <StatusBadge sev="critical" label="deploy blocked" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>MOD-EE-PINCH · GreenEdge · ruleset v12 · blocks deploy on critical findings</div>
        </div>
        <button className="btn sm"><Icon name="refresh" size={14} /> Re-analyze</button>
        <button className="btn sm" style={{ color: "var(--st-warning)" }}><Icon name="flag" size={14} /> Request unblock</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--gap)" }}>
        {/* findings list */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <FBtn active={filter === "all"} onClick={() => setFilter("all")}>all {all.length}</FBtn>
            <FBtn active={filter === "critical"} onClick={() => setFilter("critical")} sev="critical">critical {counts.critical}</FBtn>
            <FBtn active={filter === "warning"} onClick={() => setFilter("warning")} sev="warning">warning {counts.warning}</FBtn>
            <FBtn active={filter === "low"} onClick={() => setFilter("low")}>low {counts.low}</FBtn>
            <FBtn active={filter === "info"} onClick={() => setFilter("info")}>info {counts.info}</FBtn>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {list.map(f => {
              const sm = R.sevMeta[f.sev];
              const on = sel.id === f.id;
              return (
                <button key={f.id} onClick={() => setSel(f)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                  background: on ? "var(--surface-2)" : "transparent" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${sm.sev})`, flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{f.rule} · {f.file}</div>
                  </div>
                  {f.waiver && <StatusBadge sev="warning" label="waiver" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* finding detail */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Finding detail" sub={sel.rule} dense />
          <div style={{ flex: 1, overflow: "auto", padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StatusBadge sev={R.sevMeta[sel.sev].sev} label={R.sevMeta[sel.sev].label} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{sel.title}</span>
            </div>
            <KV2 pairs={[["Rule", <span className="mono" key="r">{sel.rule}</span>], ["File", <span className="mono" key="f">{sel.file}</span>], ["Function", <span className="mono" key="fn">{sel.fn}</span>], ["Blocks deploy", sel.sev === "critical" ? <span style={{ color: "var(--st-critical)", fontWeight: 700 }} key="b">yes</span> : "no"]]} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>Code location</div>
              <div style={{ background: "#1c1c1a", borderRadius: "var(--r-sm)", padding: "11px 13px", overflow: "auto" }}>
                <pre className="mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7, color: "#ddd" }}>{codeSnippet(sel)}</pre>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn sm" style={{ flex: 1 }}><Icon name="check" size={14} /> Mark fixed</button>
              <button className="btn sm" style={{ flex: 1, color: "var(--st-warning)" }} disabled={sel.waiver === "requested"}><Icon name="flag" size={14} /> {sel.waiver === "requested" ? "waiver requested" : "Request waiver"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FBtn({ active, onClick, children, sev }: { active: boolean; onClick: () => void; children: ReactNode; sev?: string }) {
  return <button onClick={onClick} className={"chip" + (active ? " active" : "")} style={{ height: 26, ...(sev && !active ? { color: `var(--st-${sev})` } : {}) }}>{children}</button>;
}
function KV2({ pairs }: { pairs: [ReactNode, ReactNode][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p[0]}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p[1]}</span>
        </div>
      ))}
    </div>
  );
}
function codeSnippet(f: Finding) {
  if (f.rule === "MEM-001") return "216 |   uint8_t buf[64];\n217 |   size_t n = read_payload(buf);\n218 | > memcpy(buf, src, n);   // n unchecked → overflow\n219 |   apply(buf);";
  if (f.rule === "CON-014") return " 89 |   if (force > LIMIT)\n 90 |     lock();\n 91 | > release_lock();        // unconditional release\n 92 |   move(axis);";
  return ` ${f.file.split(":")[1]} | > ${f.fn}  // ${f.rule}\n      |   // 규칙 위반 위치`;
}
