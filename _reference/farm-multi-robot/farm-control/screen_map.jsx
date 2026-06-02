/* ============================================================
   C01-05 멀티로봇 실시간 관제 맵
   온실 top-down · 로봇 핀 · 경로 진행 · 구역 잠금 · 이벤트 팝오버
   · 로봇 리스트 사이드바
   mapStyle (Tweak): "schematic" | "tinted"
   ============================================================ */

function RealtimeMapScreen({ selectedRobot, onSelectRobot, onOpenSession, onNavWorkspace, mapStyle = "schematic", density }) {
  const M = window.MOCK;
  const [gh, setGh] = useState("GH-A");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [tick, setTick] = useState(0);
  const [lockZone, setLockZone] = useState(null);

  // gentle live motion for working robots
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 1400); return () => clearInterval(t); }, []);

  const ghObj = M.greenhouses.find(g => g.id === gh);
  const robotsAll = M.robots.filter(r => r.gh === gh);
  const robots = robotsAll.filter(r => typeFilter === "ALL" || r.type === typeFilter);
  const emergencyRobot = robotsAll.find(r => r.state === "emergency_stop");

  const tinted = mapStyle === "tinted";
  const rows = ghObj.rows;
  const bedCount = ghObj.beds;

  const jitter = (r, axis) => {
    if (r.state !== "working") return 0;
    const base = Math.sin((tick + r.id.charCodeAt(8)) * 0.6) * (axis === "y" ? 2.4 : 0.6);
    return base;
  };

  return (
    <div className="screen-enter" style={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* MAP AREA */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "var(--gap)", gap: 12 }}>
        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {M.greenhouses.map(g => <Chip key={g.id} active={gh === g.id} onClick={() => setGh(g.id)}>{g.name}</Chip>)}
          </div>
          <div style={{ width: 1, height: 22, background: "var(--line)" }} />
          <div style={{ display: "flex", gap: 6 }}>
            <Chip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>All</Chip>
            <Chip active={typeFilter === "thin"} onClick={() => setTypeFilter("thin")}>Thin</Chip>
            <Chip active={typeFilter === "pinch"} onClick={() => setTypeFilter("pinch")}>Pinch</Chip>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-normal)" }} />
            live · 1.4s refresh
          </span>
        </div>

        {/* the map */}
        <div className="card" style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
          background: tinted ? "linear-gradient(150deg,#eef4ee,#e7eef0)" : "var(--surface)" }}>
          {/* greenhouse frame */}
          <div style={{ position: "absolute", inset: 20, borderRadius: 10, border: "2px solid var(--line-strong)",
            background: tinted ? "rgba(255,255,255,.35)" : "var(--surface-2)", overflow: "hidden" }}>
            {/* beds (vertical bands) + rows */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {Array.from({ length: bedCount }).map((_, b) => {
                const bw = 100 / bedCount;
                return (
                  <g key={b}>
                    <rect x={b * bw + 1} y="4" width={bw - 2} height="92" rx="1.2"
                      fill={tinted ? "#dce7dc" : "#eef1f3"} stroke="var(--line)" strokeWidth="0.25" />
                    {Array.from({ length: 6 }).map((__, rr) => (
                      <line key={rr} x1={b * bw + 1} x2={b * bw + bw - 1} y1={10 + rr * 14} y2={10 + rr * 14}
                        stroke={tinted ? "#c4d6c4" : "#dfe3e7"} strokeWidth="0.3" />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* docking station */}
            <div style={{ position: "absolute", left: 8, bottom: 8, padding: "3px 7px", borderRadius: 5, background: "var(--surface)",
              border: "1px solid var(--line-strong)", fontSize: 9.5, fontWeight: 700, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="battery" size={12} /> charge dock
            </div>

            {/* zone lock overlay */}
            {lockZone && (
              <div style={{ position: "absolute", left: `${lockZone.x}%`, top: `${lockZone.y}%`, width: 130, height: 90, transform: "translate(-50%,-50%)",
                background: "repeating-linear-gradient(45deg,rgba(230,81,0,.10),rgba(230,81,0,.10) 8px,rgba(230,81,0,.18) 8px,rgba(230,81,0,.18) 16px)",
                border: "2px dashed var(--st-critical)", borderRadius: 8, display: "grid", placeItems: "center" }}>
                <span className="badge critical">zone locked</span>
              </div>
            )}

            {/* route line for selected robot */}
            {robots.filter(r => r.id === selectedRobot && r.route).map(r => (
              <svg key={r.id} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <polyline points={routeFor(r)} fill="none" stroke="var(--brand)" strokeWidth="0.8" strokeDasharray="2 1.5"
                  strokeLinecap="round" opacity="0.8" />
              </svg>
            ))}

            {/* robot pins */}
            {robots.map(r => {
              const sm = M.robotStateMeta[r.state];
              const sel = r.id === selectedRobot;
              return (
                <button key={r.id} onClick={() => onSelectRobot(r.id)}
                  style={{
                    position: "absolute", left: `${r.x + jitter(r, "x")}%`, top: `${r.y + jitter(r, "y")}%`,
                    transform: "translate(-50%,-50%)", border: "none", background: "transparent",
                    transition: "left 1.2s linear, top 1.2s linear", zIndex: sel ? 20 : 10, padding: 0,
                  }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    {sel && <div style={{ position: "absolute", width: 38, height: 38, borderRadius: "50%", border: "2px solid var(--brand)", top: -4, opacity: .6 }} />}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
                      background: `var(--st-${sm.sev})`, color: "#fff", boxShadow: "var(--shadow-2)",
                      border: "2.5px solid #fff", position: "relative",
                    }}>
                      <Icon name="robot" size={15} stroke={2.2} />
                      {(r.state === "emergency_stop" || r.state === "fault") && (
                        <span className="live-pulse" style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `2px solid var(--st-${sm.sev})` }} />
                      )}
                      {r.type === "pinch" && <span style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--ink-2)" }} />}
                    </div>
                    <span className="mono" style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 4,
                      background: "var(--surface)", border: "1px solid var(--line)", whiteSpace: "nowrap", boxShadow: "var(--shadow-1)" }}>
                      {r.id.replace("RBT-", "")}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* event popover near emergency robot */}
            {emergencyRobot && (typeFilter === "ALL" || typeFilter === emergencyRobot.type) && (
              <div style={{ position: "absolute", left: `${emergencyRobot.x}%`, top: `${emergencyRobot.y - 4}%`,
                transform: "translate(-50%,-100%)", zIndex: 25, width: 220 }}>
                <div className="card" style={{ padding: 10, boxShadow: "var(--shadow-3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <StatusBadge sev="emergency" label="e-stop" />
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>08:51</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Safety interlock — work halted</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn danger sm" style={{ flex: 1 }} onClick={() => onSelectRobot(emergencyRobot.id)}>Act</button>
                    <button className="btn sm" onClick={() => onNavWorkspace("incident")}>Incidents</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* legend */}
          <div style={{ position: "absolute", right: 14, bottom: 14, display: "flex", gap: 12, padding: "7px 12px",
            background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, boxShadow: "var(--shadow-1)", fontSize: 10.5, color: "var(--ink-2)" }}>
            {[["normal", "work/ok"], ["warning", "warning"], ["critical", "fault"], ["emergency", "e-stop"], ["disabled", "offline"]].map(([s, l]) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: `var(--st-${s})` }} />{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ROBOT LIST SIDEBAR */}
      <aside style={{ width: 308, flex: "none", borderLeft: "1px solid var(--line)", background: "var(--surface)",
        display: "flex", flexDirection: "column" }}>
        <PanelHead title={`${ghObj.name} robots`} sub={`${robots.length} robots · ${robotsAll.filter(r => r.state === "working").length} working`} dense />
        <div style={{ flex: 1, overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {robots.map(r => {
            const sm = M.robotStateMeta[r.state];
            const sel = r.id === selectedRobot;
            const s = M.sessions.find(x => x.id === r.sessionId);
            return (
              <button key={r.id} onClick={() => onSelectRobot(r.id)} style={{
                textAlign: "left", border: "1px solid " + (sel ? "var(--ink)" : "var(--line)"),
                background: sel ? "var(--surface-2)" : "var(--surface)", borderRadius: "var(--r-md)", padding: 11, display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <RobotTypeTag type={r.type} size="sm" />
                    <span className="mono" style={{ fontSize: 12, fontWeight: 800 }}>{r.id.replace("RBT-", "")}</span>
                  </span>
                  <StatusBadge sev={sm.sev} label={sm.label} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Battery pct={r.battery} />
                  {s ? <span className="tnum" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>{s.progress}%</span>
                     : <span style={{ fontSize: 11, color: "var(--ink-3)" }}>no work</span>}
                </div>
                {s && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: s.progress + "%", height: "100%", background: s.status === "blocked" ? "var(--st-critical)" : "var(--brand)" }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedRobot && robotsAll.some(r => r.id === selectedRobot) && (
          <div style={{ padding: 10, borderTop: "1px solid var(--line)", display: "flex", gap: 7 }}>
            <button className="btn sm" style={{ flex: 1 }}
              onClick={() => { const r = M.robots.find(x => x.id === selectedRobot); setLockZone(lockZone ? null : { x: r.x, y: r.y }); }}>
              <Icon name="lock" size={14} /> {lockZone ? "Unlock" : "Lock zone"}
            </button>
            {(() => { const r = M.robots.find(x => x.id === selectedRobot); return r?.sessionId
              ? <button className="btn sm primary" style={{ flex: 1 }} onClick={() => onOpenSession(r.sessionId)}>Track session</button>
              : <button className="btn sm" style={{ flex: 1 }} disabled>Track session</button>; })()}
          </div>
        )}
      </aside>
    </div>
  );
}

function routeFor(r) {
  // simple zig-zag route around the robot
  const x = r.x, y = r.y;
  return `${x - 20},${y + 18} ${x - 20},${y - 14} ${x},${y - 14} ${x},${y + 14} ${x + 18},${y + 14} ${x + 18},${y - 12}`;
}

Object.assign(window, { RealtimeMapScreen });
