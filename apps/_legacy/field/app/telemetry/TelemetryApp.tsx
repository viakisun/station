"use client";
/* ============================================================
   Telemetry 설정 콘솔 — App 루트 (독립 앱)
   (원본: telemetry-console/app.jsx TmApp — 상태/뷰 라우팅/셸/스크린 렌더)
   density 고정 "regular" · accent 고정 "#14151a" (동적 CSS var side-effect 제거, tweaks-panel 제거)
   ============================================================ */
import { useState } from "react";
import { TELEMETRY } from "@station/domain";
import { TelemetryShell } from "./_components/TelemetryShell";
import { MonitorView } from "./_components/MonitorView";
import { SetupHub } from "./_components/SetupHub";
import { StepOnboard } from "./_components/StepOnboard";
import { ChannelMapBuilder } from "./_components/ChannelMapBuilder";
import { SensorCalib } from "./_components/SensorCalib";
import { SamplingPolicy } from "./_components/SamplingPolicy";

const TM_STEP_ORDER = ["onboard", "channel", "calib", "policy"];

export function TelemetryApp() {
  const T = TELEMETRY;
  const [mode, setMode] = useState("setup"); // setup | monitor
  const [setupView, setSetupView] = useState("hub"); // hub | step
  const [stepId, setStepId] = useState("channel");
  const [states, setStates] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    T.steps.forEach((x) => (s[x.id] = x.state));
    return s;
  });

  const steps = T.steps.map((s) => ({ ...s, state: states[s.id] }));
  const idx = TM_STEP_ORDER.indexOf(stepId);
  const curStep = steps.find((s) => s.id === stepId)!;

  const enterStep = (id: string) => {
    setStepId(id);
    setSetupView("step");
    if (states[id] === "todo") setStates((s) => ({ ...s, [id]: "current" }));
  };
  const guide = () => {
    const next = TM_STEP_ORDER.find((id) => states[id] !== "done");
    if (next) enterStep(next);
    else setMode("monitor");
  };
  const next = () => {
    if (idx < TM_STEP_ORDER.length - 1) {
      const n = TM_STEP_ORDER[idx + 1];
      setStates((s) => ({ ...s, [stepId]: "done", [n]: s[n] === "todo" ? "current" : s[n] }));
      setStepId(n);
    } else {
      setStates((s) => ({ ...s, [stepId]: "done" }));
      setSetupView("hub");
    }
  };
  const prev = () => {
    if (idx > 0) setStepId(TM_STEP_ORDER[idx - 1]);
    else setSetupView("hub");
  };

  const renderStep = () => {
    switch (stepId) {
      case "onboard":
        return <StepOnboard step={curStep} />;
      case "channel":
        return <ChannelMapBuilder step={curStep} />;
      case "calib":
        return <SensorCalib step={curStep} />;
      case "policy":
        return <SamplingPolicy step={curStep} />;
      default:
        return null;
    }
  };

  const showWizardBar = mode === "setup" && setupView === "step";

  return (
    <TelemetryShell mode={mode} onMode={setMode} showWizardBar={showWizardBar} idx={idx} states={states} onPrev={prev} onNext={next}>
      {mode === "monitor" && <MonitorView />}
      {mode === "setup" && setupView === "hub" && <SetupHub steps={steps} onStep={enterStep} onGuide={guide} />}
      {mode === "setup" && setupView === "step" && renderStep()}
    </TelemetryShell>
  );
}
