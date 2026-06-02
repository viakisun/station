/* ============================================================
   현장 HMI 커미셔닝 콘솔 — App 루트 (독립 앱)
   ============================================================ */

const HMI_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#14151a",
  "density": "regular"
}/*EDITMODE-END*/;

const STEP_ORDER = ["connect", "discover", "compat", "protocol", "control"];

function HmiApp() {
  const [t, setTweak] = useTweaks(HMI_DEFAULTS);
  const H = window.HM;
  const [view, setView] = useState("hub");           // hub | step | home
  const [stepId, setStepId] = useState("discover");
  const [assigns, setAssigns] = useState({});
  const [states, setStates] = useState(() => {
    const s = {}; H.steps.forEach(x => s[x.id] = x.state); return s;
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-strong", hmiShade(t.accent, -18));
  }, [t.accent]);

  const steps = H.steps.map(s => ({ ...s, state: states[s.id] }));
  const registered = states.control === "done";
  const idx = STEP_ORDER.indexOf(stepId);
  const curStep = steps.find(s => s.id === stepId);

  const enterStep = (id) => { setStepId(id); setView("step"); if (states[id] === "todo") markCurrent(id); };
  const markCurrent = (id) => setStates(s => (s[id] === "todo" ? { ...s, [id]: "current" } : s));

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
    <>
    <HmiFrame>
      <div className={"density-" + (t.density === "compact" ? "compact" : "regular")} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={v => setTweak("density", v)} />
        <TweakSection label="Accent" />
        <TweakColor label="Point color" value={t.accent} options={["#14151a", "#1f5d3a", "#2d4f74", "#6a6a62"]} onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </>
  );
}

function hmiShade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<HmiApp />);
