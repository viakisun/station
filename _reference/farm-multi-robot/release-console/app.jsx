/* ============================================================
   검증·배포 콘솔 — App 루트 (독립 앱)
   ============================================================ */

const RC_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "accent": "#14151a",
  "eventStripDefault": false
}/*EDITMODE-END*/;

const SCREEN_MAP = {
  "c02-home":  { C: () => "AuditHome",       fill: false },
  "c02-conf":  { fill: true },
  "c02-audit": { fill: true },
  "c04-dash":  { fill: false },
  "c04-static":{ fill: true },
  "c04-compat":{ fill: true },
  "c04-ota":   { fill: true },
};

function RcApp() {
  const [t, setTweak] = useTweaks(RC_DEFAULTS);
  const [active, setActive] = useState("c02-home");
  const [vendorScope, setVendorScope] = useState("ALL");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [stripOpen, setStripOpen] = useState(t.eventStripDefault);
  const R = window.RC;

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-strong", rcShade(t.accent, -18));
  }, [t.accent]);

  const density = t.density === "compact" ? "compact" : "regular";
  const item = RC_ALL_ITEMS.find(i => i.id === active);
  const onNav = setActive;

  const render = () => {
    const p = { density, onNav };
    switch (active) {
      case "c02-home":   return <AuditHome {...p} />;
      case "c02-conf":   return <ConformanceRunner density={density} />;
      case "c02-audit":  return <AuditBuilder density={density} />;
      case "c04-dash":   return <FirmwareDash {...p} />;
      case "c04-static": return <StaticAnalysis density={density} />;
      case "c04-compat": return <CompatMatrix density={density} />;
      case "c04-ota":    return <OtaMonitor density={density} />;
      default:           return <RcPlaceholder item={item} onBack={() => setActive(item.id.startsWith("c02") ? "c02-home" : "c04-dash")} />;
    }
  };

  const fill = SCREEN_MAP[active]?.fill;

  return (
    <div className={"density-" + density} style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <RcTopBar kpi={R.kpi} vendors={R.vendors} vendorScope={vendorScope} onVendorScope={setVendorScope} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <RcNav active={active} onNav={onNav} collapsed={navCollapsed} onToggle={() => setNavCollapsed(v => !v)} />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--canvas)", overflow: "hidden" }}>
          <div style={{ flex: "none", padding: "12px 16px", background: "var(--canvas)", borderBottom: "1px solid var(--line)",
            display: "flex", alignItems: "center", gap: 9 }}>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", padding: "3px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{item?.code}</span>
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-.3px" }}>{item?.label}</h1>
            {!item?.ready && <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>· coming soon</span>}
            <div style={{ flex: 1 }} />
            {vendorScope !== "ALL" && (
              <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="grip" size={13} /> {R.vendors.find(v => v.id === vendorScope)?.name} 범위
              </span>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: fill ? "hidden" : "auto" }}>{render()}</div>
        </main>
      </div>
      <RcEventStrip events={R.events} expanded={stripOpen} onToggle={() => setStripOpen(v => !v)} />

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={v => setTweak("density", v)} />
        <TweakToggle label="Expand event strip" value={stripOpen} onChange={v => { setStripOpen(v); setTweak("eventStripDefault", v); }} />
        <TweakSection label="Accent" />
        <TweakColor label="Point color" value={t.accent} options={["#14151a", "#1f5d3a", "#2d4f74", "#6a6a62"]} onChange={v => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

function RcPlaceholder({ item, onBack }) {
  const desc = {
    "c02-cap": "Define module capabilities, commands, telemetry, parameters and calibration needs as a standard profile.",
    "c02-proto": "Define transport, topic, endpoint, payload and ack rules as a standard comms contract.",
    "c02-sdk": "Standard SDK, sample code, OpenAPI schema and integration guides.",
    "c02-key": "Manage per-vendor sandboxes, API keys, scopes, rate limits and webhooks.",
    "c04-rollback": "Safely roll back to the last stable version on deploy failure or rising incidents.",
    "c04-policy": "Configure static-analysis gates, deploy windows, canary ratios and auto-incident conditions.",
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
        <button className="btn primary" onClick={onBack}><Icon name="chevL" size={15} /> Back to main</button>
      </div>
    </div>
  );
}

function rcShade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<RcApp />);
