"use client";
/* ============================================================
   현장 HMI 커미셔닝 콘솔 — App 루트 (독립 앱)
   (원본: hmi-console/app.jsx HmApp — density=regular / accent=#14151a 고정)
   ============================================================ */
import { useState } from "react";
import { Icon } from "@station/design-system";
import { HMI } from "@station/domain";
import { HmiFrame, HmiStatusBar, TouchBtn } from "./_components/HmiShell";
import { CommissionHub } from "./_components/CommissionHub";
import { HmiHome } from "./_components/HmiHome";
import { StepConnect } from "./_components/steps/StepConnect";
import { StepDiscover, type Assigns } from "./_components/steps/StepDiscover";
import { StepCompat } from "./_components/steps/StepCompat";
import { StepProtocol } from "./_components/steps/StepProtocol";
import { StepControl } from "./_components/steps/StepControl";

const STEP_ORDER = ["connect", "discover", "compat", "protocol", "control"];

export default function HmiApp() {
  const H = HMI;
  const [view, setView] = useState<"hub" | "step" | "home">("hub"); // hub | step | home
  const [stepId, setStepId] = useState("discover");
  const [assigns, setAssigns] = useState<Assigns>({});
  const [states, setStates] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {}; H.steps.forEach(x => s[x.id] = x.state); return s;
  });

  const steps = H.steps.map(s => ({ ...s, state: states[s.id] }));
  const registered = states.control === "done";
  const idx = STEP_ORDER.indexOf(stepId);
  const curStep = steps.find(s => s.id === stepId);

  const markCurrent = (id: string) => setStates(s => (s[id] === "todo" ? { ...s, [id]: "current" } : s));
  const enterStep = (id: string) => { setStepId(id); setView("step"); if (states[id] === "todo") markCurrent(id); };

  const guide = () => {
    if (registered) { setView("home"); return; }
    const next = STEP_ORDER.find(id => states[id] !== "done") || "connect";
    enterStep(next);
  };

  const next = () => {
    setStates(s => ({ ...s, [stepId]: "done" }));
    if (idx < STEP_ORDER.length - 1) {
      const n = STEP_ORDER[idx + 1];
      setStepId(n); setStates(s => ({ ...s, [stepId]: "done", [n]: s[n] === "todo" ? "current" : s[n] }));
    } else {
      setView("home");
    }
  };
  const prev = () => { if (idx > 0) setStepId(STEP_ORDER[idx - 1]); else setView("hub"); };

  const title = view === "hub" ? "Commissioning" : view === "home" ? "Field operation" : curStep?.title;

  const renderStep = () => {
    if (!curStep) return null;
    switch (stepId) {
      case "connect":  return <StepConnect step={curStep} />;
      case "discover": return <StepDiscover step={curStep} assigns={assigns} setAssigns={setAssigns} />;
      case "compat":   return <StepCompat step={curStep} />;
      case "protocol": return <StepProtocol step={curStep} />;
      case "control":  return <StepControl step={curStep} assigns={assigns} />;
      default: return null;
    }
  };

  return (
    <HmiFrame>
      <div className="density-regular" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <HmiStatusBar robot={H.robot} title={title} connected registered={registered} safety="safe" />

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
          {view === "hub" && <CommissionHub steps={steps} onStep={enterStep} onGuide={guide} />}
          {view === "home" && <HmiHome onReconfigure={() => setView("hub")} />}
          {view === "step" && renderStep()}
        </div>

        {/* bottom bar */}
        {view === "step" && (
          <div style={{ height: 68, flex: "none", borderTop: "1px solid var(--line)", background: "var(--surface)",
            display: "flex", alignItems: "center", gap: 14, padding: "0 18px", zIndex: 20 }}>
            <TouchBtn ghost icon="chevL" onClick={prev} style={{ height: 48 }}>{idx === 0 ? "Hub" : "Back"}</TouchBtn>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {STEP_ORDER.map((id, i) => (
                <span key={id} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 999,
                  background: states[id] === "done" ? "var(--brand)" : i === idx ? "var(--ink)" : "var(--line-strong)", transition: "all .2s" }} />
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }} className="mono">{idx + 1}/5</span>
            </div>
            <TouchBtn primary icon={idx === STEP_ORDER.length - 1 ? "check" : "chevR"} onClick={next} style={{ height: 48 }}>
              {idx === STEP_ORDER.length - 1 ? "Finish commissioning" : "Next step"}
            </TouchBtn>
          </div>
        )}

        {view === "home" && (
          <div style={{ height: 68, flex: "none", borderTop: "1px solid var(--line)", background: "var(--surface)",
            display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
              <Icon name="check" size={16} style={{ color: "var(--st-normal)" }} /> Commissioned · registered to control · ready
            </span>
            <div style={{ flex: 1 }} />
            <TouchBtn ghost icon="sliders" onClick={() => setView("hub")} style={{ height: 48 }}>Commissioning hub</TouchBtn>
          </div>
        )}
      </div>
    </HmiFrame>
  );
}
