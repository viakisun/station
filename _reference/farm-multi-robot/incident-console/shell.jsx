/* ============================================================
   Incident & Quality — 셸 (데스크톱 1440×900, 독립 앱)
   IcTopBar / IcNav / IcEventStrip
   ============================================================ */

const IC_NAV = [
  { id: "dashboard", icon: "alert",     label: "Incident dashboard", code: "C03-00", ready: true },
  { id: "list",      icon: "board",     label: "Incidents · filter",   code: "C03-01", ready: true },
  { id: "stream",    icon: "activity",  label: "Live event stream", code: "C03-02", ready: true },
  { id: "report",    icon: "trending",  label: "Reports · analytics", code: "C03-08", ready: true },
  { id: "errcode",   icon: "fileCode",  label: "Error-code dictionary",     code: "C03-06", ready: false },
  { id: "policy",    icon: "bell",      label: "Alert policy",          code: "C03-09", ready: false },
  { id: "recur",     icon: "refresh",   label: "Recurrence · postmortem", code: "C03-10", ready: false },
  { id: "maint",     icon: "wrench",    label: "Maintenance dispatch",      code: "C03-07", ready: false },
];

function IcTopBar({ kpi, site, onNav }) {
  return (
    <header style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", gap: 16, padding: "0 16px",
      background: "var(--surface)", borderBottom: "1px solid var(--line)", flex: "none", zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 13, borderRight: "1px solid var(--line)", height: 30 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon name="alert" size={15} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-.2px" }}>Incident & Quality</div>
          <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600 }}>Incident & Quality Console</div>
        </div>
      </div>
      <button className="chip" style={{ height: 32 }}>
        <Icon name="map" size={14} style={{ color: "var(--ink-2)" }} /> {site.name} <Icon name="chevD" size={13} style={{ color: "var(--ink-3)" }} />
      </button>
      <div style={{ flex: 1, maxWidth: 340, display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 11px",
        borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-3)" }}>
        <Icon name="search" size={14} />
        <input placeholder="Search incidents · events · robots · codes" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 12.5, color: "var(--ink)", fontFamily: "inherit" }} />
        <span className="kbd">⌘K</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <IcStat icon="alert" label="open critical" value={kpi.critical} alert />
        <IcStat icon="clock" label="SLA breach" value={kpi.slaBreach} alert={kpi.slaBreach > 0} />
        <IcStat icon="trending" label="today" value={kpi.today} />
      </div>
      <div style={{ width: 1, height: 24, background: "var(--line)" }} />
      <button className="icon-btn" style={{ position: "relative" }}>
        <Icon name="bell" size={17} />
        <span style={{ position: "absolute", top: 7, right: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--st-emergency)", border: "1.5px solid var(--surface)" }} />
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)", border: "1px solid var(--line)" }}>QA</div>
        <div style={{ textAlign: "left", lineHeight: 1.15 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Kim H.</div>
          <div style={{ fontSize: 10, color: "var(--ink-3)" }}>Maintenance · QA</div>
        </div>
        <Icon name="chevD" size={13} style={{ color: "var(--ink-3)" }} />
      </button>
    </header>
  );
}
function IcStat({ icon, label, value, alert }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)" }}>
      <span style={{ color: "var(--ink-3)" }}><Icon name={icon} size={14} stroke={1.8} /></span>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</span>
      <span className="tnum" style={{ fontSize: 13, fontWeight: 800, color: alert ? "var(--st-critical)" : "var(--ink)" }}>{value}</span>
    </div>
  );
}

function IcNav({ active, onNav, collapsed, onToggle }) {
  return (
    <nav style={{ width: collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)", flex: "none", background: "var(--surface)",
      borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", transition: "width .16s" }}>
      <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {IC_NAV.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} title={it.label} style={{
              display: "flex", alignItems: "center", gap: 11, height: 40, padding: collapsed ? 0 : "0 11px",
              justifyContent: collapsed ? "center" : "flex-start", borderRadius: "var(--r-sm)", border: "none",
              background: on ? "var(--surface-2)" : "transparent", color: on ? "var(--ink)" : "var(--ink-2)", fontWeight: on ? 700 : 600, fontSize: 12.5 }}>
              <Icon name={it.icon} size={18} stroke={on ? 2.1 : 1.8} />
              {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>}
              {!collapsed && it.code && <span className="mono" style={{ fontSize: 9, color: "var(--ink-3)", fontWeight: 700 }}>{it.code}</span>}
              {!collapsed && !it.ready && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--line-strong)" }} />}
            </button>
          );
        })}
      </div>
      <div style={{ padding: 8, borderTop: "1px solid var(--line)" }}>
        <button className="icon-btn" onClick={onToggle} style={{ width: "100%" }}><Icon name={collapsed ? "chevR" : "chevL"} size={17} /></button>
      </div>
    </nav>
  );
}

function IcEventStrip({ events, expanded, onToggle, onOpen }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (expanded) return; const t = setInterval(() => setIdx(i => (i + 1) % events.length), 3200); return () => clearInterval(t); }, [expanded, events.length]);
  const cur = events[idx], meta = window.IC.sevMeta[cur.sev];
  return (
    <div style={{ flex: "none", background: "var(--surface)", borderTop: "1px solid var(--line)", zIndex: 35 }}>
      <div style={{ height: "var(--eventstrip-h)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", flex: "none" }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-live)" }} /> event engine
        </span>
        <div style={{ width: 1, height: 18, background: "var(--line)" }} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, overflow: "hidden" }}>
          <StatusBadge sev={meta.sev} label={meta.label} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }}>{cur.t}</span>
          <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.msg}</span>
        </div>
        <button className="btn ghost sm" onClick={onToggle}>{expanded ? "collapse" : "stream"} <Icon name={expanded ? "chevD" : "chevR"} size={13} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { IcTopBar, IcNav, IcEventStrip, IC_NAV });
