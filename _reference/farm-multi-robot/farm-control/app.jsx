/* ============================================================
   App 루트 — 셸 + 라우팅 + 상태 + Tweaks
   통합관제(C01)를 Live(실시간 모니터링) / Console(관리·설정)로 분리
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "accent": "#14151a",
  "drawerVariant": "tabs",
  "mapStyle": "schematic",
  "dashboardLayout": "balanced",
  "eventStripDefault": false
}/*EDITMODE-END*/;

const LIVE_SCREENS = [
  { key: "map",     code: "C01-05", label: "Live control map" },
  { key: "session", code: "C01-06", label: "Work session" },
];
const CONSOLE_SCREENS = [
  { key: "dashboard", code: "C01-00", label: "Ops dashboard" },
  { key: "maplist",   code: "C01-01", label: "Maps · versions" },
  { key: "workplan",  code: "C01-04", label: "Work plan" },
];
const SCREEN_OF = {}; LIVE_SCREENS.concat(CONSOLE_SCREENS).forEach(s => SCREEN_OF[s.key] = s);

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [workspace, setWorkspace] = useState("control");
  const [mode, setMode] = useState("live");          // live | console
  const [screen, setScreen] = useState("map");
  const [sessionId, setSessionId] = useState(null);
  const [robotId, setRobotId] = useState(null);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [stripOpen, setStripOpen] = useState(t.eventStripDefault);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-strong", shade(t.accent, -18));
  }, [t.accent]);

  const M = window.MOCK;
  const openSession = (id) => { setSessionId(id); setWorkspace("control"); setMode("live"); setScreen("session"); };
  const navWorkspace = (id) => { setWorkspace(id); if (id === "control") { setMode("live"); setScreen("map"); } };
  const switchMode = (m) => { setMode(m); setScreen(m === "live" ? "map" : "dashboard"); };
  const density = t.density === "compact" ? "compact" : "regular";
  const tabs = mode === "live" ? LIVE_SCREENS : CONSOLE_SCREENS;

  const renderControl = () => {
    const common = { density, onSelectRobot: setRobotId, onOpenSession: openSession,
      onNavScreen: setScreen, onNavWorkspace: navWorkspace };
    switch (screen) {
      case "dashboard": return <DashboardScreen {...common} layout={t.dashboardLayout} />;
      case "maplist":   return <MapListScreen density={density} />;
      case "workplan":  return <WorkPlanScreen {...common} />;
      case "map":       return <RealtimeMapScreen {...common} selectedRobot={robotId} mapStyle={t.mapStyle} />;
      case "session":   return <SessionScreen sessionId={sessionId} density={density}
                          onBack={() => setScreen("map")} onSelectRobot={setRobotId} onNavWorkspace={navWorkspace} />;
      default: return null;
    }
  };

  const fillScreen = workspace === "control" && (screen === "map" || screen === "workplan" || screen === "maplist");
  const cur = SCREEN_OF[screen];

  return (
    <div className={"density-" + density} style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar kpi={M.kpi} site={M.SITE} onNavWorkspace={navWorkspace} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <LeftNav active={workspace} onNav={navWorkspace} collapsed={navCollapsed} onToggle={() => setNavCollapsed(v => !v)} />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)", overflow: "hidden" }}>
          {/* content header */}
          <div style={{ flex: "none", padding: "12px 16px 0", background: "var(--canvas)", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: workspace === "control" ? 11 : 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", padding: "3px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>
                  {workspace === "control" ? (cur ? cur.code : "C01") : (NAV_ITEMS.find(n => n.id === workspace)?.code || "—")}
                </span>
                <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-.3px" }}>
                  {workspace === "control" ? (cur ? cur.label : "Control") : (NAV_ITEMS.find(n => n.id === workspace)?.label)}
                </h1>
              </div>
              {workspace === "control" && <ModeSwitch mode={mode} onSwitch={switchMode} />}
            </div>
            {workspace === "control" && (
              <div style={{ display: "flex", gap: 4 }}>
                {tabs.map(s => {
                  const on = screen === s.key || (screen === "session" && s.key === "session");
                  return (
                    <button key={s.key} onClick={() => setScreen(s.key)} style={{
                      padding: "8px 13px", border: "none", background: "transparent", fontSize: 13,
                      fontWeight: on ? 700 : 600, color: on ? "var(--ink)" : "var(--ink-3)",
                      borderBottom: "2px solid " + (on ? "var(--ink)" : "transparent"), marginBottom: -1 }}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* screen body */}
          <div style={{ flex: 1, minHeight: 0, overflow: fillScreen ? "hidden" : "auto" }}>
            {workspace === "control" ? renderControl() : <WorkspacePlaceholder id={workspace} onBack={() => navWorkspace("control")} />}
          </div>
        </main>
      </div>
      <EventStrip events={M.events} expanded={stripOpen} onToggle={() => setStripOpen(v => !v)} onSelectRobot={setRobotId} />

      {robotId && <RobotDrawer robotId={robotId} variant={t.drawerVariant}
        onClose={() => setRobotId(null)} onOpenSession={(id) => { setRobotId(null); openSession(id); }} onNavWorkspace={(id) => { setRobotId(null); navWorkspace(id); }} />}

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={v => setTweak("density", v)} />
        <TweakToggle label="Expand event strip" value={stripOpen} onChange={v => { setStripOpen(v); setTweak("eventStripDefault", v); }} />
        <TweakSection label="Ops dashboard (C01-00)" />
        <TweakRadio label="Layout" value={t.dashboardLayout} options={["balanced", "ops-first"]} onChange={v => setTweak("dashboardLayout", v)} />
        <TweakSection label="Live control map (C01-05)" />
        <TweakRadio label="Map style" value={t.mapStyle} options={["schematic", "tinted"]} onChange={v => setTweak("mapStyle", v)} />
        <TweakSection label="Robot drawer (C01-07)" />
        <TweakRadio label="Layout" value={t.drawerVariant} options={["tabs", "accordion"]} onChange={v => setTweak("drawerVariant", v)} />
        <TweakSection label="Accent" />
        <TweakColor label="Point color" value={t.accent} options={["#14151a", "#1f5d3a", "#2d4f74", "#6a6a62"]} onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

function ModeSwitch({ mode, onSwitch }) {
  const Btn = ({ id, children }) => {
    const on = mode === id;
    return (
      <button onClick={() => onSwitch(id)} style={{
        display: "flex", alignItems: "center", gap: 7, height: 28, padding: "0 13px", border: "none",
        borderRadius: 5, fontSize: 12.5, fontWeight: 700,
        background: on ? "var(--surface)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)",
        boxShadow: on ? "var(--shadow-2)" : "none" }}>
        {id === "live" && <span className={on ? "live-pulse" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: on ? "var(--brand-live)" : "var(--ink-3)" }} />}
        {children}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
      <Btn id="live">Live</Btn>
      <Btn id="console">Console</Btn>
    </div>
  );
}

function WorkspacePlaceholder({ id, onBack }) {
  const item = NAV_ITEMS.find(n => n.id === id);
  const desc = {
    home: "Site-wide summary home.",
    audit: "Onboard vendor modules via a standard process and manage Capability/Protocol Profiles, Conformance Tests and Audit Packages.",
    incident: "Promote events to incidents and manage cause, impact, action guides and recurrence analysis.",
    firmware: "Manage firmware static analysis, compatibility, approval, OTA rollout and rollback.",
    hmi: "Run work control, parameters, calibration and e-stop recovery on field HMI devices.",
    telemetry: "Configure Telemetry devices, channel mapping, environment parameters and data quality.",
    settings: "Manage users, permissions, policies and equipment.",
  }[id];
  return (
    <div style={{ padding: "var(--gap)", height: "100%" }}>
      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
          <Icon name={item.icon} size={26} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            {item.code && <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", padding: "3px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{item.code}</span>}
            <span style={{ fontSize: 18, fontWeight: 800 }}>{item.label}</span>
          </div>
          <p style={{ maxWidth: 460, color: "var(--ink-2)", fontSize: 13, lineHeight: 1.6, margin: "0 auto" }}>{desc}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>
          Extends from here on a shared shell and design system.
        </div>
        <button className="btn primary" onClick={onBack}><Icon name="map" size={15} /> Back to C01 Control</button>
      </div>
    </div>
  );
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
