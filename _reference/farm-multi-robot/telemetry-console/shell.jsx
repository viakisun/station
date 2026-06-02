/* ============================================================
   Telemetry 콘솔 — 디바이스 셸 (태블릿 1024×768)
   ============================================================ */
const TM_W = 1024, TM_H = 768, TM_BEZEL = 26;

function TmFrame({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const fit = () => {
      const totalW = TM_W + TM_BEZEL * 2, totalH = TM_H + TM_BEZEL * 2;
      const s = Math.min((window.innerWidth - 48) / totalW, (window.innerHeight - 48) / totalH);
      if (ref.current) ref.current.style.transform = `scale(${Math.min(s, 1.4)})`;
    };
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0d0f", display: "grid", placeItems: "center", overflow: "hidden" }}>
      <div ref={ref} style={{ transformOrigin: "center", flex: "none" }}>
        <div style={{ width: TM_W + TM_BEZEL * 2, height: TM_H + TM_BEZEL * 2, background: "linear-gradient(155deg,#26262a,#161618)",
          borderRadius: 30, padding: TM_BEZEL, boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)", position: "relative" }}>
          <div style={{ position: "absolute", top: TM_BEZEL / 2 - 3, left: "50%", transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: "#0b0b0c", border: "1px solid #333" }} />
          <div style={{ width: TM_W, height: TM_H, background: "var(--canvas)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function TmStatusBar({ device, mode, onMode, synced }) {
  const [now, setNow] = useState(tmTime());
  useEffect(() => { const t = setInterval(() => setNow(tmTime()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 18px",
      background: "var(--surface)", borderBottom: "1px solid var(--line)", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
          <Icon name="telemetry" size={17} />
        </div>
        <div style={{ lineHeight: 1.15, whiteSpace: "nowrap" }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{device.id}</span>
          <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600 }}>{device.model} · {device.robot} · {device.site}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
          {[["setup", "Setup", "sliders"], ["monitor", "Monitor", "activity"]].map(([id, label, ic]) => {
            const on = mode === id;
            return (
              <button key={id} onClick={() => onMode(id)} style={{ display: "flex", alignItems: "center", gap: 7, height: 30, padding: "0 16px", border: "none",
                borderRadius: 5, fontSize: 13, fontWeight: 700, background: on ? "var(--surface)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)", boxShadow: on ? "var(--shadow-2)" : "none" }}>
                <Icon name={ic} size={15} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: synced ? "var(--st-normal)" : "var(--st-warning)" }}>
          <span className={synced ? "live-pulse" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "var(--brand-live)" : "var(--st-warning)" }} />
          {synced ? "sync live" : "sync lag"}
        </span>
        <Icon name="wifi" size={17} style={{ color: "var(--ink-2)" }} />
        <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{now}</span>
      </div>
    </div>
  );
}
function tmTime() { return new Date().toTimeString().slice(0, 5); }

function TouchBtn({ children, onClick, primary, danger, ghost, disabled, full, icon, style }) {
  const cls = "btn" + (primary ? " primary" : danger ? " danger" : ghost ? " ghost" : "");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={{ height: 52, fontSize: 14.5, fontWeight: 700, padding: "0 20px", borderRadius: 9, width: full ? "100%" : "auto", gap: 9, ...style }}>
      {icon && <Icon name={icon} size={18} />} {children}
    </button>
  );
}

Object.assign(window, { TmFrame, TmStatusBar, TouchBtn });
