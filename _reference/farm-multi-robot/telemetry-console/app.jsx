/* ============================================================
   Telemetry 설정 콘솔 — App 루트 (독립 앱)
   ============================================================ */

const TM_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#14151a",
  "density": "regular"
}/*EDITMODE-END*/;

const TM_STEP_ORDER = ["onboard", "channel", "calib", "policy"];

function TmApp() {
  const [t, setTweak] = useTweaks(TM_DEFAULTS);
  const T = window.TM;
  const [mode, setMode] = useState("setup");        // setup | monitor
  const [setupView, setSetupView] = useState("hub"); // hub | step
  const [stepId, setStepId] = useState("channel");
  const [states, setStates] = useState(() => { const s = {}; T.steps.forEach(x => s[x.id] = x.state); return s; });

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-strong", tmShade(t.accent, -18));
  }, [t.accent]);

  const steps = T.steps.map(s => ({ ...s, state: states[s.id] }));
  const idx = TM_STEP_ORDER.indexOf(stepId);
  const curStep = steps.find(s => s.id === stepId);

  const enterStep = (id) => { setStepId(id); setSetupView("step"); if (states[id] === "todo") setStates(s => ({ ...s, [id]: "current" })); };
  const guide = () => {
    const next = TM_STEP_ORDER.find(id => states[id] !== "done");
    if (next) enterStep(next); else setMode("monitor");
  };
  const next = () => {
    if (idx < TM_STEP_ORDER.length - 1) {
      const n = TM_STEP_ORDER[idx + 1];
      setStates(s => ({ ...s, [stepId]: "done", [n]: s[n] === "todo" ? "current" : s[n] }));
      setStepId(n);
    } else {
      setStates(s => ({ ...s, [stepId]: "done" }));
      setSetupView("hub");
    }
  };
  const prev = () => { if (idx > 0) setStepId(TM_STEP_ORDER[idx - 1]); else setSetupView("hub"); };

  const renderStep = () => {
    switch (stepId) {
      case "onboard": return <StepOnboard step={curStep} />;
      case "channel": return <ChannelMapBuilder step={curStep} />;
      case "calib":   return <SensorCalib step={curStep} />;
      case "policy":  return <SamplingPolicy step={curStep} />;
      default: return null;
    }
  };

  const showWizardBar = mode === "setup" && setupView === "step";

  return (
    <>
    <TmFrame>
      <div className={"density-" + (t.density === "compact" ? "compact" : "regular")} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <TmStatusBar device={T.device} mode={mode} onMode={setMode} synced />

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
          {mode === "monitor" && <MonitorView />}
          {mode === "setup" && setupView === "hub" && <SetupHub steps={steps} onStep={enterStep} onGuide={guide} />}
          {mode === "setup" && setupView === "step" && renderStep()}
        </div>

        {showWizardBar && (
          <div style={{ height: 66, flex: "none", borderTop: "1px solid var(--line)", background: "var(--surface)",
            display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
            <TouchBtn ghost icon="chevL" onClick={prev} style={{ height: 46 }}>{idx === 0 ? "Hub" : "Back"}</TouchBtn>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {TM_STEP_ORDER.map((id, i) => (
                <span key={id} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 999,
                  background: states[id] === "done" ? "var(--brand)" : i === idx ? "var(--ink)" : "var(--line-strong)", transition: "all .2s" }} />
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }} className="mono">{idx + 1}/4</span>
            </div>
            <TouchBtn primary icon={idx === TM_STEP_ORDER.length - 1 ? "check" : "chevR"} onClick={next} style={{ height: 46 }}>
              {idx === TM_STEP_ORDER.length - 1 ? "Finish setup" : "Next"}
            </TouchBtn>
          </div>
        )}
      </div>
    </TmFrame>

    <TweaksPanel>
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={v => setTweak("density", v)} />
      <TweakSection label="Accent" />
      <TweakColor label="Point color" value={t.accent} options={["#14151a", "#1f5d3a", "#2d4f74", "#6a6a62"]} onChange={v => setTweak("accent", v)} />
    </TweaksPanel>
    </>
  );
}

function tmShade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<TmApp />);
