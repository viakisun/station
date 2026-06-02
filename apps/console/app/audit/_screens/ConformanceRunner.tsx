"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, PanelHead, StatusBadge } from "@station/design-system";
import { RELEASE } from "@station/domain";

type CaseState = "pending" | "running" | "pass" | "fail";
type CaseResult = { state: CaseState; exp?: string; act?: string };
type LogLine = { line: string; sev: string; t: string };

/* ---------------- C02-06 Conformance Test Runner (실시간) ---------------- */
export function ConformanceRunner({ density }: { density: string }) {
  const R = RELEASE;
  const [results, setResults] = useState<Record<string, CaseResult>>({}); // id -> {state, exp, act}
  const [log, setLog] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cases = R.testCases;
  const total = cases.length;
  const done = Object.values(results).filter(r => r.state === "pass" || r.state === "fail").length;
  const passed = Object.values(results).filter(r => r.state === "pass").length;
  const failed = Object.values(results).filter(r => r.state === "fail").length;
  const progress = Math.round(done / total * 100);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (line: string, sev = "info") => setLog(l => [...l, { line, sev, t: nowStr() }]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setResults({}); setLog([]); setRunning(true); setActiveId(null);
    addLog("conformance run started — MOD-CAM-V01 / PRT-MQTT-v2", "info");
    let acc = 300;
    cases.forEach((c) => {
      timers.current.push(setTimeout(() => {
        setActiveId(c.id); setResults(r => ({ ...r, [c.id]: { state: "running" } }));
        addLog(`▶ ${c.id} ${c.name}`, "info");
      }, acc));
      acc += c.ms;
      timers.current.push(setTimeout(() => {
        const pass = !c.fail;
        setResults(r => ({ ...r, [c.id]: { state: pass ? "pass" : "fail", exp: c.exp, act: c.act } }));
        addLog(pass ? `  ✓ pass (${c.ms}ms)` : `  ✕ FAIL — expected ${c.exp}, got ${c.act}`, pass ? "pass" : "fail");
      }, acc - 40));
    });
    timers.current.push(setTimeout(() => {
      setRunning(false); setActiveId(null);
      addLog(`run 완료 — ${cases.filter(c => !c.fail).length} pass / ${cases.filter(c => c.fail).length} fail`, "info");
    }, acc + 80));
  };

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* header bar */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Conformance Test Runner</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>MOD-CAM-V01</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>schema · heartbeat · command ack · telemetry · error map · safety interlock conformance</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Stat3 label="pass" value={passed} sev="normal" />
          <Stat3 label="fail" value={failed} sev={failed ? "critical" : "disabled"} />
          <Stat3 label="total" value={`${done}/${total}`} />
        </div>
        {failed > 0 && !running && <button className="btn sm"><Icon name="refresh" size={14} /> Re-run failed</button>}
        <button className="btn primary" onClick={run} disabled={running}>
          {running ? <><Icon name="refresh" size={15} className="live-pulse" /> running…</> : <><Icon name="play" size={15} /> Run all</>}
        </button>
      </div>

      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: progress + "%", height: "100%", background: failed ? "var(--st-warning)" : "var(--brand)", transition: "width .3s" }} />
        </div>
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", width: 38 }}>{progress}%</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--gap)" }}>
        {/* results table */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Test cases" sub={`${cases.length}`} dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            {cases.map(c => {
              const r = results[c.id] || { state: "pending" };
              const suite = R.testSuites.find(s => s.id === c.suite);
              return (
                <div key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 14px",
                    background: c.id === activeId ? "var(--surface-2)" : "transparent" }}>
                    <CaseDot state={r.state} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}><span className="mono">{c.id}</span> · {suite?.name}</div>
                    </div>
                    {r.state === "pass" && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-normal)" }}>pass</span>}
                    {r.state === "fail" && <StatusBadge sev="critical" label="fail" />}
                    {r.state === "running" && <span className="live-pulse" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-notice)" }}>running</span>}
                    {r.state === "pending" && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>queued</span>}
                  </div>
                  {r.state === "fail" && (
                    <div style={{ padding: "0 14px 11px 39px", display: "flex", flexDirection: "column", gap: 4 }}>
                      <DiffLine label="expected" val={r.exp} ok />
                      <DiffLine label="actual" val={r.act} />
                      <button className="btn ghost sm" style={{ alignSelf: "flex-start", marginTop: 2, color: "var(--st-warning)" }}><Icon name="flag" size={13} /> Request waiver</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* live log */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1c1c1a" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}>
              <Icon name="terminal" size={15} /> Live log
            </span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11.5, lineHeight: 1.7 }}>
            {log.length === 0 && <span style={{ color: "#666" }}>$ idle — press &apos;Run all&apos;</span>}
            {log.map((l, i) => (
              <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                <span style={{ color: "#555" }}>{l.t} </span>{l.line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Stat3({ label, value, sev }: { label: string; value: React.ReactNode; sev?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: sev ? `var(--st-${sev})` : "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}
function CaseDot({ state }: { state: CaseState }) {
  if (state === "pass") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-normal)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="check" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "fail") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-critical)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="close" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "running") return <span className="live-pulse" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--st-notice)", flex: "none" }} />;
  return <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--line-strong)", flex: "none" }} />;
}
function DiffLine({ label, val, ok }: { label: string; val?: string; ok?: boolean }) {
  return (
    <div className="mono" style={{ fontSize: 11, display: "flex", gap: 8 }}>
      <span style={{ width: 60, color: "var(--ink-3)", flex: "none" }}>{label}</span>
      <span style={{ color: ok ? "var(--st-normal)" : "var(--st-critical)" }}>{val}</span>
    </div>
  );
}

function nowStr() { const d = new Date(); return d.toTimeString().slice(0, 8); }
