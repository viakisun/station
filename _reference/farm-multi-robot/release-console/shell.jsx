/* ============================================================
   검증·배포 콘솔 — 셸 (독립 앱)
   RcTopBar / RcNav / RcEventStrip
   ============================================================ */

const RC_NAV = [
  { section: "AUDIT · DEV KIT", items: [
    { id: "c02-home",  icon: "home2",    label: "Dev kit home",      code: "C02-00", ready: true },
    { id: "c02-conf",  icon: "beaker",   label: "Conformance tests", code: "C02-06", ready: true },
    { id: "c02-audit", icon: "pkg",      label: "Audit Package",     code: "C02-07", ready: true },
    { id: "c02-cap",   icon: "layers",   label: "Capability Profile",code: "C02-02", ready: false },
    { id: "c02-proto", icon: "branch",   label: "Protocol builder",      code: "C02-03", ready: false },
    { id: "c02-sdk",   icon: "code",     label: "SDK · docs",         code: "C02-08", ready: false },
    { id: "c02-key",   icon: "key",      label: "Sandbox · API keys",  code: "C02-09", ready: false },
  ]},
  { section: "FIRMWARE · DEPLOY", items: [
    { id: "c04-dash",  icon: "gauge",    label: "Firmware dashboard",    code: "C04-00", ready: true },
    { id: "c04-static",icon: "fileCode", label: "Static analysis",      code: "C04-02", ready: true },
    { id: "c04-compat",icon: "server",   label: "Compatibility matrix",    code: "C04-03", ready: true },
    { id: "c04-ota",   icon: "rocket",   label: "OTA rollout monitor",    code: "C04-06", ready: true },
    { id: "c04-rollback",icon: "rollback",label: "Rollback · recovery",       code: "C04-07", ready: false },
    { id: "c04-policy",icon: "settings", label: "Firmware policy",        code: "C04-10", ready: false },
  ]},
];
const RC_ALL_ITEMS = RC_NAV.flatMap(s => s.items);

function RcTopBar({ kpi, vendors, vendorScope, onVendorScope }) {
  const [open, setOpen] = useState(false);
  const scopeName = vendorScope === "ALL" ? "All vendors" : vendors.find(v => v.id === vendorScope)?.name;
  return (
    <header style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", gap: 14,
      padding: "0 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flex: "none", zIndex: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 13, borderRight: "1px solid var(--line)", height: 30 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff" }}>
          <Icon name="pkg" size={15} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-.2px" }}>Release Console</div>
          <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600 }}>Integration · Release Console</div>
        </div>
      </div>

      {/* vendor scope switcher (Supabase project-switcher 느낌) */}
      <div style={{ position: "relative" }}>
        <button className="chip" style={{ height: 32 }} onClick={() => setOpen(v => !v)}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: "var(--surface-3)", border: "1px solid var(--line-strong)",
            display: "grid", placeItems: "center", fontSize: 8, fontWeight: 800, color: "var(--ink-2)" }}>
            {vendorScope === "ALL" ? "∗" : vendors.find(v => v.id === vendorScope)?.short}
          </span>
          {scopeName}
          <Icon name="chevD" size={13} style={{ color: "var(--ink-3)" }} />
        </button>
        {open && (
          <div className="card" style={{ position: "absolute", top: 38, left: 0, width: 240, padding: 6, zIndex: 60, boxShadow: "var(--shadow-3)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", padding: "4px 8px" }}>Vendor scope</div>
            {[{ id: "ALL", name: "All vendors", short: "∗" }, ...vendors].map(v => (
              <button key={v.id} onClick={() => { onVendorScope(v.id); setOpen(false); }} style={{
                width: "100%", textAlign: "left", padding: "7px 8px", borderRadius: 5, border: "none",
                background: vendorScope === v.id ? "var(--surface-2)" : "transparent", color: "var(--ink)",
                fontSize: 12.5, fontWeight: vendorScope === v.id ? 700 : 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: "var(--surface-3)", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800, color: "var(--ink-2)" }}>{v.short}</span>
                <span style={{ flex: 1 }}>{v.name}</span>
                {vendorScope === v.id && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: 320, display: "flex", alignItems: "center", gap: 8,
        height: 32, padding: "0 11px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-3)" }}>
        <Icon name="search" size={14} />
        <input placeholder="Search modules · firmware · audit · tests" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 12.5, color: "var(--ink)", fontFamily: "inherit" }} />
        <span className="kbd">⌘K</span>
      </div>
      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <RcStat icon="pkg" label="Approved modules" value={`${kpi.modulesApproved}/${kpi.modulesTotal}`} />
        <RcStat icon="fileCode" label="Analysis blocked" value={kpi.fwBlocked} alert={kpi.fwBlocked > 0} />
        <RcStat icon="rocket" label="Deploys" value={kpi.deploysActive} />
      </div>
      <div style={{ width: 1, height: 24, background: "var(--line)" }} />
      <button className="icon-btn" style={{ position: "relative" }}>
        <Icon name="bell" size={17} />
        <span style={{ position: "absolute", top: 7, right: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--st-critical)", border: "1.5px solid var(--surface)" }} />
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)", border: "1px solid var(--line)" }}>OP</div>
        <div style={{ textAlign: "left", lineHeight: 1.15 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Jung W.</div>
          <div style={{ fontSize: 10, color: "var(--ink-3)" }}>Release manager</div>
        </div>
        <Icon name="chevD" size={13} style={{ color: "var(--ink-3)" }} />
      </button>
    </header>
  );
}

function RcStat({ icon, label, value, alert }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 11px",
      borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)" }}>
      <span style={{ color: "var(--ink-3)" }}><Icon name={icon} size={14} stroke={1.8} /></span>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</span>
      <span className="tnum" style={{ fontSize: 13, fontWeight: 800, color: alert ? "var(--st-critical)" : "var(--ink)" }}>{value}</span>
    </div>
  );
}

function RcNav({ active, onNav, collapsed, onToggle }) {
  return (
    <nav style={{ width: collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)", flex: "none",
      background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", transition: "width .16s" }}>
      <div style={{ flex: 1, padding: "8px 8px", overflow: "auto" }}>
        {RC_NAV.map((sec, si) => (
          <div key={si} style={{ marginBottom: 10 }}>
            {!collapsed && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".4px", padding: "8px 10px 5px" }}>{sec.section}</div>}
            {collapsed && si > 0 && <div style={{ height: 1, background: "var(--line)", margin: "8px 6px" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {sec.items.map(it => {
                const on = active === it.id;
                return (
                  <button key={it.id} onClick={() => onNav(it.id)} title={it.label} style={{
                    display: "flex", alignItems: "center", gap: 10, height: 36, padding: collapsed ? 0 : "0 10px",
                    justifyContent: collapsed ? "center" : "flex-start", borderRadius: "var(--r-sm)", border: "none",
                    background: on ? "var(--surface-2)" : "transparent",
                    color: on ? "var(--ink)" : "var(--ink-2)", fontWeight: on ? 700 : 600, fontSize: 12.5 }}>
                    <Icon name={it.icon} size={17} stroke={on ? 2.1 : 1.8} />
                    {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>}
                    {!collapsed && !it.ready && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--line-strong)" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 8, borderTop: "1px solid var(--line)" }}>
        <button className="icon-btn" onClick={onToggle} style={{ width: "100%" }}>
          <Icon name={collapsed ? "chevR" : "chevL"} size={17} />
        </button>
      </div>
    </nav>
  );
}

function RcEventStrip({ events, expanded, onToggle }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (expanded) return;
    const t = setInterval(() => setIdx(i => (i + 1) % events.length), 3400);
    return () => clearInterval(t);
  }, [expanded, events.length]);
  const cur = events[idx];
  const meta = window.RC.sevMeta[cur.sev] || { sev: "disabled", label: cur.sev };
  return (
    <div style={{ flex: "none", background: "var(--surface)", borderTop: "1px solid var(--line)", zIndex: 35 }}>
      <div style={{ height: "var(--eventstrip-h)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)", flex: "none" }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-live)" }} />
          Pipeline events
        </span>
        <div style={{ width: 1, height: 18, background: "var(--line)" }} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, overflow: "hidden" }}>
          <StatusBadge sev={meta.sev} label={meta.label} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }}>{cur.t}</span>
          <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.msg}</span>
        </div>
        <span className="tnum" style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }}>{idx + 1}/{events.length}</span>
        <button className="btn ghost sm" onClick={onToggle}>{expanded ? "collapse" : "all"} <Icon name={expanded ? "chevD" : "chevR"} size={13} /></button>
      </div>
      {expanded && (
        <div style={{ maxHeight: 200, overflow: "auto", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
          {events.map((e, i) => {
            const m = window.RC.sevMeta[e.sev] || { sev: "disabled", label: e.sev };
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 64, flex: "none" }}>{e.t}</span>
                <StatusBadge sev={m.sev} label={m.label} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 110, flex: "none" }}>{e.src}</span>
                <span style={{ fontSize: 12.5, flex: 1 }}>{e.msg}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { RcTopBar, RcNav, RcEventStrip, RC_NAV, RC_ALL_ITEMS });
