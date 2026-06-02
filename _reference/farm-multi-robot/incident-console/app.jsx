/* ============================================================
   장애·오류 콘솔 — App 루트 (데스크톱, 독립 앱)
   ============================================================ */

const IC_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "accent": "#14151a"
}/*EDITMODE-END*/;

function IcApp() {
  const [t, setTweak] = useTweaks(IC_DEFAULTS);
  const IC = window.IC;
  const [nav, setNav] = useState("dashboard");
  const [view, setView] = useState("dashboard");   // dashboard|list|stream|report|detail|action|<placeholder id>
  const [incidentId, setIncidentId] = useState(null);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [stripOpen, setStripOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-strong", icShade(t.accent, -18));
  }, [t.accent]);

  const density = t.density === "compact" ? "compact" : "regular";
  const navItem = IC_NAV.find(n => n.id === nav);

  const openIncident = (id) => { setIncidentId(id); setView("detail"); };
  const goNav = (id) => { setNav(id); setView(id); };
  // cross-app links are simulated (no real other app) → just route within or no-op label
  const crossNav = (id) => { /* would deep-link to other consoles */ };

  const titleFor = () => {
    if (view === "detail") return "Incident detail · timeline";
    if (view === "action") return "Action guide · checklist";
    return navItem?.label;
  };
  const codeFor = () => {
    if (view === "detail") return "C03-03";
    if (view === "action") return "C03-05";
    return navItem?.code;
  };

  const fill = view === "list" || view === "stream" || view === "action";

  const render = () => {
    const common = { density, onOpen: openIncident, onNav: goNav };
    switch (view) {
      case "dashboard": return <IncidentDash {...common} />;
      case "list":      return <IncidentList density={density} onOpen={openIncident} />;
      case "stream":    return <EventStream density={density} onOpen={openIncident} />;
      case "report":    return <ReportScreen density={density} />;
      case "detail":    return <IncidentDetail incidentId={incidentId} density={density}
                          onBack={() => goNav("list")} onAction={(id) => { setIncidentId(id); setView("action"); }} onNav={crossNav} />;
      case "action":    return <ActionGuideScreen incidentId={incidentId} density={density}
                          onBack={() => setView("detail")} onNav={crossNav} />;
      default:          return <IcPlaceholder item={navItem} onBack={() => goNav("dashboard")} />;
    }
  };

  return (
    <div className={"density-" + density} style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <IcTopBar kpi={IC.kpi} site={IC.SITE} onNav={goNav} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <IcNav active={nav} onNav={goNav} collapsed={navCollapsed} onToggle={() => setNavCollapsed(v => !v)} />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)", overflow: "hidden" }}>
          <div style={{ flex: "none", padding: "12px 16px", background: "var(--canvas)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 9 }}>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", padding: "3px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{codeFor()}</span>
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-.3px" }}>{titleFor()}</h1>
            {navItem && !navItem.ready && view === nav && <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>· coming soon</span>}
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: fill ? "hidden" : "auto" }}>{render()}</div>
        </main>
      </div>
      <IcEventStrip events={IC.streamSeed} expanded={stripOpen} onToggle={() => setStripOpen(v => !v)} />

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={v => setTweak("density", v)} />
        <TweakSection label="Accent" />
        <TweakColor label="Point color" value={t.accent} options={["#14151a", "#1f5d3a", "#2d4f74", "#6a6a62"]} onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

function IcPlaceholder({ item, onBack }) {
  const desc = {
    errcode: "Map vendor error codes to platform-standard codes & user messages, with versioning.",
    policy: "Configure alert conditions and channels by severity, role, robot type and greenhouse zone.",
    recur: "Group recurring incidents and link them to causes, fixes and Audit/firmware improvements.",
    maint: "Manage owners, dispatch status, remediation SLAs and required parts per incident.",
  }[item.id] || "";
  return (
    <div style={{ padding: "var(--gap)", height: "100%" }}>
      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
          <Icon name={item.icon} size={26} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", padding: "3px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{item.code}</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{item.label}</span>
          </div>
          <p style={{ maxWidth: 440, color: "var(--ink-2)", fontSize: 13, lineHeight: 1.6, margin: "0 auto" }}>{desc}</p>
        </div>
        <button className="btn primary" onClick={onBack}><Icon name="chevL" size={15} /> Back to dashboard</button>
      </div>
    </div>
  );
}

function icShade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<IcApp />);
