"use client";
/* ============================================================
   커미셔닝 허브
   ============================================================ */
import { Icon, StatusBadge, RobotTypeTag, type IconName } from "@station/design-system";
import { HMI } from "@station/domain";
import { TouchBtn } from "./HmiShell";
import type { Step } from "./helpers";

export function CommissionHub({ steps, onStep, onGuide }: { steps: Step[]; onStep: (id: string) => void; onGuide: () => void }) {
  const H = HMI;
  const doneN = steps.filter(s => s.state === "done").length;
  const pct = Math.round(doneN / steps.length * 100);
  const next = steps.find(s => s.state !== "done");
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* identity + progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
            <Icon name="robot" size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <RobotTypeTag type={H.robot.type} />
              <span className="mono" style={{ fontSize: 17, fontWeight: 800, whiteSpace: "nowrap" }}>{H.robot.id}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4, whiteSpace: "nowrap" }}>{H.robot.model} · S/N {H.robot.serial} · {H.robot.controller}</div>
          </div>
          <span className="badge normal" style={{ height: 26, fontSize: 12 }}><Icon name="key" size={13} /> key {H.devKey.id}</span>
        </div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>Commissioning progress</span>
            <span className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{pct}<span style={{ fontSize: 14 }}>%</span></span>
          </div>
          <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{doneN}/{steps.length} steps complete</span>
        </div>
      </div>

      {/* step cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, flex: 1 }}>
        {steps.map((s) => {
          const done = s.state === "done", current = s.state === "current";
          return (
            <button key={s.id} onClick={() => onStep(s.id)} style={{
              textAlign: "left", border: "1px solid " + (current ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-md)",
              background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                  background: done ? "var(--brand)" : current ? "var(--surface-2)" : "var(--surface-2)",
                  border: current ? "1px solid var(--line-strong)" : "none", color: done ? "#fff" : "var(--ink-2)" }}>
                  <Icon name={(done ? "check" : s.icon) as IconName} size={20} stroke={done ? 2.6 : 1.9} />
                </span>
                <span className="mono tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-3)" }}>0{s.n}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <div>
                {done && <StatusBadge sev="normal" label="done" />}
                {current && <StatusBadge sev="notice" label="action needed" />}
                {s.state === "todo" && <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>queued</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>
          {next ? <>Next: <b>{next.title}</b></> : <>All steps complete — ready to operate.</>}
        </div>
        <TouchBtn primary icon={next ? "power" : "home2"} onClick={onGuide}>
          {doneN === 0 ? "Start guide" : next ? "Continue" : "HMI home"}
        </TouchBtn>
      </div>
    </div>
  );
}
