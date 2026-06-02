/* ============================================================
   앱 셸 — TopBar / LeftNav / EventStrip
   ============================================================ */

const NAV_ITEMS = [
  { id: "home",      icon: "home2",     label: "Home",            code: null,   ready: false },
  { id: "control",   icon: "map",       label: "Map / route / work",  code: "C01",  ready: true  },
  { id: "audit",     icon: "audit",     label: "Audit / Dev kit",code: "C02",  ready: false },
  { id: "incident",  icon: "alert",     label: "Incidents",     code: "C03",  ready: false },
  { id: "firmware",  icon: "chip",      label: "Firmware / deploy",   code: "C04",  ready: false },
  { id: "hmi",       icon: "hmi",       label: "HMI",           code: "H01",  ready: false },
  { id: "telemetry", icon: "telemetry", label: "Telemetry",     code: "T01",  ready: false },
  { id: "settings",  icon: "settings",  label: "System settings",   code: null,   ready: false },
];

function TopBar({ kpi, site, onNavWorkspace }) {
  const [siteOpen, setSiteOpen] = useState(false);
  return (
    <header style={{
      height: "var(--topbar-h)", display: "flex", alignItems: "center", gap: 16,
      padding: "0 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)",
      flex: "none", zIndex: 40, position: "relative",
    }}>
      {/* product */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 14, borderRight: "1px solid var(--line)", height: 32 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon name="robot" size={17} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-.2px" }}>STATION Control</div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>Multi-Robot Control Platform</div>
        </div>
      </div>

      {/* site selector */}
      <div style={{ position: "relative" }}>
        <button className="chip" style={{ height: 34 }} onClick={() => setSiteOpen(v => !v)}>
          <Icon name="map" size={15} style={{ color: "var(--brand)" }} />
          {site.name}
          <Icon name="chevD" size={14} style={{ color: "var(--ink-3)" }} />
        </button>
        {siteOpen && (
          <div className="card" style={{ position: "absolute", top: 40, left: 0, width: 240, padding: 6, zIndex: 60, boxShadow: "var(--shadow-2)" }}>
            {["Jinju Smart-Farm Testbed", "Sangju Hub Greenhouse", "All sites"].map((s, i) => (
              <button key={i} onClick={() => setSiteOpen(false)} style={{
                width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, border: "none",
                background: i === 0 ? "var(--surface-2)" : "transparent", color: "var(--ink)",
                fontSize: 13, fontWeight: i === 0 ? 700 : 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {s} {i === 0 && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* search */}
      <div style={{ flex: 1, maxWidth: 360, display: "flex", alignItems: "center", gap: 8,
        height: 34, padding: "0 11px", borderRadius: var_r(), background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-3)" }}>
        <Icon name="search" size={15} />
        <input placeholder="Search robots · work · incidents · modules" style={{
          border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13, color: "var(--ink)", fontFamily: "inherit" }} />
        <span className="kbd">⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* status pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <StatPill icon="robot" label="online" value={`${kpi.robotsOnline}/${kpi.robotsTotal}`} sev="normal" onClick={() => onNavWorkspace("control")} />
        <StatPill icon="alert" label="open incidents" value={kpi.incidentsOpen} sev={kpi.incidentsCritical ? "critical" : "disabled"} onClick={() => onNavWorkspace("incident")} />
        <StatPill icon="chip" label="deploys" value={kpi.deploys} sev="notice" onClick={() => onNavWorkspace("firmware")} />
      </div>

      <div style={{ width: 1, height: 26, background: "var(--line)" }} />
      <button className="icon-btn" style={{ position: "relative" }}>
        <Icon name="bell" size={18} />
        <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: "var(--st-critical)", border: "1.5px solid var(--surface)" }} />
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-3)", display: "grid", placeItems: "center",
          fontSize: 12, fontWeight: 800, color: "var(--ink-2)", border: "1px solid var(--line)" }}>OP</div>
        <div style={{ textAlign: "left", lineHeight: 1.15 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Lee J.</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>Operations admin</div>
        </div>
        <Icon name="chevD" size={14} style={{ color: "var(--ink-3)" }} />
      </button>
    </header>
  );
}
function var_r() { return "var(--r-sm)"; }

function StatPill({ icon, label, value, sev, onClick }) {
  const alert = sev === "critical" || sev === "emergency";
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 11px",
      borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)" }}>
      <span style={{ color: "var(--ink-3)" }}><Icon name={icon} size={14} stroke={1.8} /></span>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</span>
      <span className="tnum" style={{ fontSize: 13, fontWeight: 800, color: alert ? "var(--st-critical)" : "var(--ink)" }}>{value}</span>
    </button>
  );
}

function LeftNav({ active, onNav, collapsed, onToggle }) {
  return (
    <nav style={{
      width: collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)", flex: "none",
      background: "var(--surface)", borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column", transition: "width .16s", zIndex: 30,
    }}>
      <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} title={it.label}
              style={{
                display: "flex", alignItems: "center", gap: 11, height: 42, padding: collapsed ? 0 : "0 11px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: var_r(), border: "none", position: "relative",
                background: on ? "var(--surface-2)" : "transparent",
                color: on ? "var(--ink)" : "var(--ink-2)", fontWeight: on ? 700 : 600, fontSize: 13,
              }}>
              <Icon name={it.icon} size={18} stroke={on ? 2.1 : 1.8} />
              {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>}
              {!collapsed && it.code && <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 700 }}>{it.code}</span>}
              {!collapsed && !it.ready && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--line-strong)" }} />}
            </button>
          );
        })}
      </div>
      <div style={{ padding: 8, borderTop: "1px solid var(--line)" }}>
        <button className="icon-btn" onClick={onToggle} style={{ width: "100%" }}>
          <Icon name={collapsed ? "chevR" : "chevL"} size={18} />
        </button>
      </div>
    </nav>
  );
}

function EventStrip({ events, expanded, onToggle, onSelectRobot }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (expanded) return;
    const t = setInterval(() => setIdx(i => (i + 1) % events.length), 3200);
    return () => clearInterval(t);
  }, [expanded, events.length]);
  const cur = events[idx];
  const meta = window.MOCK.sevMeta[cur.sev];

  return (
    <div style={{ flex: "none", background: "var(--surface)", borderTop: "1px solid var(--line)", zIndex: 35 }}>
      {/* collapsed strip */}
      <div style={{ height: "var(--eventstrip-h)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", flex: "none" }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-normal)" }} />
          Live events
        </span>
        <div style={{ width: 1, height: 18, background: "var(--line)" }} />
        <button onClick={() => onSelectRobot && cur.src.startsWith("RBT") && onSelectRobot(cur.src)}
          style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, border: "none", background: "transparent", textAlign: "left", overflow: "hidden" }}>
          <StatusBadge sev={meta.sev} label={meta.label} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }}>{cur.t}</span>
          <span style={{ fontSize: 12.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.msg}</span>
        </button>
        <span style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }} className="tnum">{idx + 1}/{events.length}</span>
        <button className="btn ghost sm" onClick={onToggle}>
          {expanded ? "collapse" : "view all"} <Icon name={expanded ? "chevD" : "chevR"} size={14} />
        </button>
      </div>
      {/* expanded panel */}
      {expanded && (
        <div style={{ maxHeight: 220, overflow: "auto", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
          {events.map((e, i) => {
            const m = window.MOCK.sevMeta[e.sev];
            return (
              <div key={i} onClick={() => e.src.startsWith("RBT") && onSelectRobot && onSelectRobot(e.src)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--line)",
                  cursor: e.src.startsWith("RBT") ? "pointer" : "default", background: "var(--surface)" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 64, flex: "none" }}>{e.t}</span>
                <StatusBadge sev={m.sev} label={m.label} />
                <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)", width: 120, flex: "none" }}>{e.src}</span>
                <span style={{ fontSize: 12.5, flex: 1 }}>{e.msg}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TopBar, LeftNav, EventStrip, NAV_ITEMS });
