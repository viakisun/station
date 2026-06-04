"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Icon, PanelHead, StatusBadge } from "@station/design-system";
import { RELEASE } from "@station/domain";

type Target = { id: string; gh: string; group: string; stage: number; fail?: boolean; cur: number; status: string };
type LogLine = { t: string; msg: string; sev: string };

/* ---------------- C04-06 OTA 배포 진행 모니터 (실시간) ---------------- */
export function OtaMonitor({ density }: { density: string }) {
  const R = RELEASE;
  const stages = R.deployStages; // 6 stages
  const [targets, setTargets] = useState<Target[]>(() => R.deployTargets.map(t => ({ ...t, cur: t.stage, status: t.stage >= 5 ? "success" : t.fail && t.stage === 0 ? "wait" : "active" })));
  const [running, setRunning] = useState(true);
  const [log, setLog] = useState<LogLine[]>([{ t: nowStr(), msg: "rollout started — FW-CAM-2.4.2 · canary group", sev: "info" }]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTargets(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!running) return t;
          if (t.fail && t.cur === 1) { // fails during download
            if (t.status !== "failed") { changed = true; setLog(l => [...l, { t: nowStr(), msg: `✕ ${t.id} download failed — retry pending`, sev: "fail" }]); }
            return { ...t, status: "failed" };
          }
          if (t.status === "success" || t.status === "failed" || t.status === "wait") return t;
          if (t.cur < 5 && Math.random() > 0.4) {
            const nc = t.cur + 1; changed = true;
            const done = nc >= 5;
            setLog(l => [...l, { t: nowStr(), msg: `${done ? "✓" : "▸"} ${t.id} → ${stages[nc]}`, sev: done ? "pass" : "info" }]);
            return { ...t, cur: nc, status: done ? "success" : (t.fail ? "active" : "active") };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 900);
    return () => clearInterval(iv);
  }, [running]);

  // start the failing target's download after a beat
  useEffect(() => {
    const to = setTimeout(() => setTargets(prev => prev.map(t => t.fail && t.status === "wait" ? { ...t, cur: 1, status: "active" } : t)), 1500);
    return () => clearTimeout(to);
  }, []);

  const total = targets.length;
  const succ = targets.filter(t => t.status === "success").length;
  const fail = targets.filter(t => t.status === "failed").length;
  const overall = Math.round(targets.reduce((a, t) => a + t.cur, 0) / (total * 5) * 100);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>OTA rollout monitor</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>FW-CAM-2.4.2</span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>staged rollout · canary → wave-1 → wave-2 · auto-incident on failure</div>
        </div>
        <Stat3 label="ok" value={succ} sev="normal" />
        <Stat3 label="fail" value={fail} sev={fail ? "critical" : "disabled"} />
        <Stat3 label="targets" value={total} />
        <button className="btn sm" onClick={() => setRunning(r => !r)}><Icon name={running ? "pause" : "play"} size={14} /> {running ? "Pause" : "Resume"}</button>
        <button className="btn danger sm"><Icon name="rollback" size={14} /> Rollback</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: overall + "%", height: "100%", background: fail ? "var(--st-warning)" : "var(--brand)", transition: "width .5s" }} />
        </div>
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", width: 38 }}>{overall}%</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)" }}>
        {/* targets */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Target robots" sub={`${total} · staged`} dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            {targets.map(t => (
              <div key={t.id} style={{ padding: "11px 14px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <Icon name="robot" size={15} style={{ color: "var(--ink-3)" }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{t.id}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", padding: "1px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 3 }}>{t.group}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.gh}</span>
                  <div style={{ flex: 1 }} />
                  {t.status === "success" && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-normal)" }}>done</span>}
                  {t.status === "failed" && <StatusBadge sev="critical" label="fail" />}
                  {t.status === "active" && <span className="live-pulse mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-notice)" }}>{stages[t.cur]}…</span>}
                  {t.status === "wait" && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>wait</span>}
                  {t.status === "failed" && <button className="btn ghost sm" style={{ marginLeft: 6 }}><Icon name="refresh" size={13} /></button>}
                </div>
                {/* stage stepper */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {stages.map((s, si) => {
                    const reached = t.cur >= si;
                    const failedHere = t.status === "failed" && si === 1;
                    return (
                      <Fragment key={si}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: si === 0 ? "none" : 1 }}>
                          {si > 0 && <div style={{ position: "absolute" }} />}
                        </div>
                        {si > 0 && <div style={{ flex: 1, height: 3, borderRadius: 2, background: reached ? (failedHere ? "var(--st-critical)" : "var(--brand)") : "var(--surface-3)" }} />}
                        <span title={s} style={{ width: 9, height: 9, borderRadius: "50%", flex: "none",
                          background: failedHere ? "var(--st-critical)" : reached ? "var(--brand)" : "var(--surface-3)",
                          border: reached ? "none" : "1.5px solid var(--line-strong)" }} />
                      </Fragment>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {stages.map((s, si) => <span key={si} style={{ fontSize: 8.5, color: t.cur >= si ? "var(--ink-2)" : "var(--ink-3)", fontWeight: t.cur === si ? 700 : 500 }}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* event log */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1c1c1a" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}><Icon name="terminal" size={15} /> Deploy log</span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11.5, lineHeight: 1.7 }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                <span style={{ color: "#555" }}>{l.t} </span>{l.msg}
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
function nowStr() { const d = new Date(); return d.toTimeString().slice(0, 8); }
