/* ============================================================
   C01-07 공통 로봇 상세 드로어 (424px)
   탭: 개요 / 모듈 / 작업 / 장애 / 펌웨어 / HMI / Telemetry
   variant: "tabs" | "accordion"  (Tweak 변형)
   ============================================================ */

function RobotDrawer({ robotId, variant = "tabs", onClose, onOpenSession, onNavWorkspace }) {
  const M = window.MOCK;
  const robot = M.robots.find(r => r.id === robotId);
  const [tab, setTab] = useState("Overview");
  const [confirm, setConfirm] = useState(null);
  useEffect(() => { setTab("Overview"); }, [robotId]);
  if (!robot) return null;

  const sm = M.robotStateMeta[robot.state];
  const session = M.sessions.find(s => s.id === robot.sessionId);
  const mods = M.modules[robot.id] || M.modules["RBT-THIN-0001"];
  const incs = M.incidents.filter(i => i.robot === robot.id);
  const gh = M.greenhouses.find(g => g.id === robot.gh);

  const TABS = ["Overview", "Modules", "Work", "Incidents", "Firmware", "HMI", "Telemetry"];

  const sections = {
    "Overview": (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <KV pairs={[
          ["Robot ID", <span className="mono">{robot.id}</span>],
          ["Type", <RobotTypeTag type={robot.type} size="sm" />],
          ["Model", robot.model],
          ["Site / GH", `${M.SITE.name.split(" ")[0]} · ${gh?.name || robot.gh}`],
          ["Battery", <Battery pct={robot.battery} />],
        ]} />
        {session && (
          <MiniCard title="Current work session" onClick={() => onOpenSession && onOpenSession(session.id)} icon="ext">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{session.id}</span>
              <StatusBadge sev={M.workMeta[session.status].sev} label={M.workMeta[session.status].label} />
            </div>
            <ProgressBar pct={session.progress} sub={`${session.done}/${session.total} plants · ${session.zone}`} />
          </MiniCard>
        )}
      </div>
    ),
    "Modules": (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {mods.map(m => {
          const mm = M.moduleMeta[m.health];
          return (
            <div key={m.id} className="card" style={{ padding: 12, boxShadow: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.type}</span>
                <StatusBadge sev={mm.sev} label={mm.label} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-3)" }}>
                <span className="mono">{m.id}</span>
                <span>{m.vendor} · fw {m.fw}</span>
              </div>
            </div>
          );
        })}
      </div>
    ),
    "Work": session ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ProgressBar pct={session.progress} sub={`${session.done}/${session.total} plants`} big />
        <KV pairs={[
          ["Session", <span className="mono">{session.id}</span>],
          ["Work type", session.type === "thin" ? "Thinning" : "Pinching"],
          ["Zone", session.zone],
          ["Route", <span className="mono">{session.route}</span>],
          ["Started", session.started], ["ETA", session.eta],
        ]} />
        <button className="btn" style={{ width: "100%" }} onClick={() => onOpenSession && onOpenSession(session.id)}>
          작업 세션 상세 열기 <Icon name="ext" size={15} />
        </button>
      </div>
    ) : <EmptyNote icon="board" title="No assigned work" sub="This robot is currently idle." />,
    "Incidents": incs.length ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {incs.map(i => (
          <div key={i.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
              <StatusBadge sev={M.sevMeta[i.sev].sev} label={M.sevMeta[i.sev].label} />
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{i.status}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{i.title}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{i.id} · {i.code}</div>
          </div>
        ))}
        <button className="btn" style={{ width: "100%" }} onClick={() => onNavWorkspace && onNavWorkspace("incident")}>
          장애 콘솔에서 보기 (C03) <Icon name="ext" size={15} />
        </button>
      </div>
    ) : <EmptyNote icon="check" title="No incidents" sub="No open incidents linked." />,
    "Firmware": (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {mods.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.type}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</div>
            </div>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: m.id === "MOD-CAM-V01-0019" ? "var(--st-warning)" : "var(--ink)" }}>
              v{m.fw}{m.id.startsWith("MOD-CAM") ? " → 2.4.2" : ""}
            </span>
          </div>
        ))}
        <button className="btn" style={{ width: "100%" }} onClick={() => onNavWorkspace && onNavWorkspace("firmware")}>
          펌웨어/배포 워크스페이스 (C04) <Icon name="ext" size={15} />
        </button>
      </div>
    ),
    "HMI": (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <KV pairs={[
          ["HMI device", <span className="mono">{robot.hmi}</span>],
          ["Connection", <StatusBadge sev={robot.state === "offline" ? "disabled" : "normal"} label={robot.state === "offline" ? "disconnected" : "connected"} />],
          ["Resolution", "1024 × 600"],
        ]} />
        <button className="btn" style={{ width: "100%" }} onClick={() => onNavWorkspace && onNavWorkspace("hmi")}>
          HMI 현장 화면 열기 (H01) <Icon name="ext" size={15} />
        </button>
      </div>
    ),
    "Telemetry": (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <KV pairs={[
          ["Telemetry device", <span className="mono">{robot.tel}</span>],
          ["Signal quality", <StatusBadge sev={robot.state === "offline" ? "disabled" : "normal"} label={robot.state === "offline" ? "offline" : "good"} />],
          ["Sync", robot.state === "fault" ? "lag 1.2s" : "realtime"],
        ]} />
        <button className="btn" style={{ width: "100%" }} onClick={() => onNavWorkspace && onNavWorkspace("telemetry")}>
          Telemetry 설정 열기 (T01) <Icon name="ext" size={15} />
        </button>
      </div>
    ),
  };

  const canPause = robot.state === "working";
  const canResume = robot.state === "paused";
  const isEmergency = robot.state === "emergency_stop";

  return (
    <>
      <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,25,35,.18)", zIndex: 90 }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "var(--drawer-w)", background: "var(--surface)",
        borderLeft: "1px solid var(--line)", boxShadow: "var(--shadow-3)", zIndex: 100,
        display: "flex", flexDirection: "column", animation: "drawerIn .2s ease both",
      }}>
        {/* header */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <RobotTypeTag type={robot.type} />
                <span className="mono" style={{ fontSize: 15, fontWeight: 800 }}>{robot.id}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusBadge sev={sm.sev} label={sm.label} />
                <Battery pct={robot.battery} />
              </div>
            </div>
            <button className="icon-btn" onClick={onClose}><Icon name="close" size={18} /></button>
          </div>
        </div>

        {/* quick actions */}
        <div style={{ display: "flex", gap: 7, padding: "12px 18px", borderBottom: "1px solid var(--line)" }}>
          {isEmergency ? (
            <button className="btn danger" style={{ flex: 1 }} onClick={() => setConfirm("release")}>
              <Icon name="lock" size={15} /> 긴급정지 해제
            </button>
          ) : (
            <>
              {canResume
                ? <button className="btn primary" style={{ flex: 1 }} onClick={() => setConfirm("resume")}><Icon name="play" size={14} /> Resume</button>
                : <button className="btn" style={{ flex: 1 }} disabled={!canPause} onClick={() => setConfirm("pause")}><Icon name="pause" size={14} /> Pause</button>}
              <button className="btn" style={{ flex: 1 }} onClick={() => setConfirm("return")}><Icon name="home2" size={14} /> Return</button>
            </>
          )}
        </div>

        {/* body */}
        {variant === "tabs" ? (
          <>
            <div style={{ display: "flex", gap: 2, padding: "8px 12px 0", overflowX: "auto", borderBottom: "1px solid var(--line)" }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "8px 11px", border: "none", background: "transparent", whiteSpace: "nowrap",
                  fontSize: 12.5, fontWeight: tab === t ? 700 : 600, color: tab === t ? "var(--ink)" : "var(--ink-3)",
                  borderBottom: "2px solid " + (tab === t ? "var(--ink)" : "transparent"), marginBottom: -1 }}>
                  {t}{t === "Incidents" && incs.length ? ` ${incs.length}` : ""}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 18 }}>{sections[tab]}</div>
          </>
        ) : (
          <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
            {TABS.map(t => (
              <details key={t} open={t === "Overview"} style={{ borderBottom: "1px solid var(--line)" }}>
                <summary style={{ padding: "12px 8px", fontSize: 13, fontWeight: 700, cursor: "pointer", listStyle: "none",
                  display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="chevR" size={14} style={{ color: "var(--ink-3)" }} /> {t}
                </summary>
                <div style={{ padding: "4px 8px 16px" }}>{sections[t]}</div>
              </details>
            ))}
          </div>
        )}

        {/* footer audit link */}
        <div style={{ padding: "10px 18px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8,
          fontSize: 11.5, color: "var(--ink-3)", background: "var(--surface-2)" }}>
          <Icon name="audit" size={15} />
          All commands <span className="mono" style={{ color: "var(--ink-2)" }}>audit_log</span> logged ·
          <button style={{ border: "none", background: "transparent", color: "var(--brand)", fontWeight: 700, fontSize: 11.5, padding: 0, marginLeft: 2 }}>history</button>
        </div>
      </aside>

      <ConfirmModal
        open={confirm === "pause"} danger={false} title="Pause work request" requireHold
        body={<>Pause the running work on <b>{robot.id}</b>. The robot will stop at a safe position.</>}
        onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal
        open={confirm === "resume"} title="Resume work request"
        body={<>Resume work on <b>{robot.id}</b> after confirming safety state and route occupancy.</>}
        confirmLabel="Resume" onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal
        open={confirm === "return"} title="Return-to-dock request"
        body={<>Return <b>{robot.id}</b> to its charge / dock position.</>}
        confirmLabel="Return" onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal
        open={confirm === "release"} danger requireHold title="Release e-stop"
        body={<>Releasing the e-stop requires all safety conditions to be met. Have you confirmed on-site safety yourself?</>}
        auditNote="Releasing an e-stop requires admin rights, audit logging and on-site safety confirmation."
        onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
    </>
  );
}

/* ---- 드로어 보조 컴포넌트 ---- */
function KV({ pairs }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0",
          borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p[0]}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{p[1]}</span>
        </div>
      ))}
    </div>
  );
}
function MiniCard({ title, children, onClick, icon }) {
  return (
    <div className="card" onClick={onClick} style={{ padding: 13, boxShadow: "none", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>{title}</span>
        {icon && <Icon name={icon} size={14} style={{ color: "var(--ink-3)" }} />}
      </div>
      {children}
    </div>
  );
}
function ProgressBar({ pct, sub, big }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span className="tnum" style={{ fontSize: big ? 20 : 13, fontWeight: 800 }}>{pct}%</span>
        {sub && <span style={{ fontSize: 11.5, color: "var(--ink-3)", alignSelf: "flex-end" }}>{sub}</span>}
      </div>
      <div style={{ height: big ? 8 : 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width .4s" }} />
      </div>
    </div>
  );
}

Object.assign(window, { RobotDrawer, KV, MiniCard, ProgressBar });
