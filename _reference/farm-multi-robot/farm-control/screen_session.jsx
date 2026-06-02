/* ============================================================
   C01-06 작업 세션 라이브 상세
   진행률 헤더 · 명령 타임라인 · 모듈 상태 · Telemetry 미니차트
   · 이벤트 로그 · 조치 버튼
   ============================================================ */

function SessionScreen({ sessionId, onBack, onSelectRobot, onNavWorkspace, density }) {
  const M = window.MOCK;
  const session = M.sessions.find(s => s.id === sessionId) || M.sessions[0];
  const robot = M.robots.find(r => r.id === session.robot);
  const sm = M.robotStateMeta[robot.state];
  const wm = M.workMeta[session.status];
  const mods = M.modules[robot.id] || M.modules["RBT-THIN-0001"];
  const tel = M.telemetry[session.id] || M.telemetry["WKS-20260601-00045"];
  const [confirm, setConfirm] = useState(null);
  const blocked = session.status === "blocked";

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* breadcrumb + back */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevL" size={15} /> Control map</button>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>/</span>
        <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{session.id}</span>
      </div>

      {/* progress header */}
      <div className="card" style={{ padding: "var(--pad-card)", display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <RobotTypeTag type={session.type} />
            <span style={{ fontSize: 17, fontWeight: 800 }}>{session.type === "thin" ? "Thinning" : "Pinching"} · {session.zone}</span>
            <StatusBadge sev={wm.sev} label={wm.label} />
            {blocked && <span style={{ fontSize: 11.5, color: "var(--st-critical)", fontWeight: 700 }}>blocked by vision module fault</span>}
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--ink-2)" }}>
            <span>Robot <button onClick={() => onSelectRobot(robot.id)} className="mono linkish" style={{ fontWeight: 700 }}>{robot.id}</button></span>
            <span>Route <span className="mono">{session.route}</span></span>
            <span>Started <b className="tnum">{session.started}</b></span>
            <span>ETA <b className="tnum">{session.eta}</b></span>
          </div>
        </div>
        <div style={{ width: 170 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px" }}>{session.progress}<span style={{ fontSize: 16 }}>%</span></span>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="tnum">{session.done}/{session.total} plants</span>
          </div>
          <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: session.progress + "%", height: "100%", background: blocked ? "var(--st-critical)" : "var(--brand)", borderRadius: 999 }} />
          </div>
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {session.status === "paused"
          ? <button className="btn primary" onClick={() => setConfirm("resume")}><Icon name="play" size={15} /> Resume</button>
          : <button className="btn" onClick={() => setConfirm("pause")} disabled={session.status !== "running"}><Icon name="pause" size={15} /> Pause</button>}
        <button className="btn" onClick={() => setConfirm("return")}><Icon name="home2" size={15} /> Return</button>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => onNavWorkspace("hmi")}><Icon name="hmi" size={15} /> HMI screen</button>
        <button className="btn danger" onClick={() => setConfirm("incident")}><Icon name="alert" size={15} /> Create incident</button>
      </div>

      {/* main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* command timeline */}
        <div className="card">
          <PanelHead title="Command timeline" sub="command lifecycle · audit log" dense />
          <div style={{ padding: "var(--pad-card)" }}>
            {M.commands.map((c, i) => {
              const exec = c.state === "executing";
              return (
                <div key={i} style={{ display: "flex", gap: 11, paddingBottom: i < M.commands.length - 1 ? 14 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", flex: "none",
                      background: exec ? "var(--st-notice)" : "var(--st-normal)",
                      boxShadow: exec ? "0 0 0 3px var(--tint-notice)" : "none" }} className={exec ? "live-pulse" : ""} />
                    {i < M.commands.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{c.cmd}</span>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{c.t}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {exec ? <span style={{ color: "var(--st-notice)", fontWeight: 700 }}>running…</span> : "done"} · {c.by}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* module status */}
        <div className="card">
          <PanelHead title="Module status" sub={`${mods.length} modules`} dense />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {mods.map(m => {
              const mm = M.moduleMeta[m.health];
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
                  <Icon name="chip" size={17} style={{ color: "var(--ink-3)", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.type}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{m.id}</div>
                  </div>
                  <StatusBadge sev={mm.sev} label={mm.label} />
                </div>
              );
            })}
          </div>
        </div>

        {/* telemetry mini charts */}
        <div className="card">
          <PanelHead title="Telemetry mini charts" sub="live channels" dense
            right={<button className="btn ghost sm" onClick={() => onNavWorkspace("telemetry")}><Icon name="ext" size={13} /></button>} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {tel.map(c => (
              <div key={c.ch} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{c.label}</span>
                    {c.q === "warning" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--st-warning)" }} />}
                  </div>
                  <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{c.ch}</span>
                </div>
                <Sparkline data={c.series} w={70} h={28} color={c.q === "warning" ? "var(--st-warning)" : "var(--brand)"} />
                <span className="tnum" style={{ width: 54, textAlign: "right", fontSize: 13, fontWeight: 800,
                  color: c.q === "warning" ? "#9a6a06" : "var(--ink)" }}>{c.val}<span style={{ fontSize: 9, color: "var(--ink-3)" }}> {c.unit}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* event log */}
      <div className="card">
        <PanelHead title="Work event log" sub={session.id} dense />
        <div>
          {M.events.filter(e => e.src === robot.id || e.sev === "warning" || e.sev === "critical").slice(0, 5).map((e, i) => {
            const meta = M.sevMeta[e.sev];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid var(--line)" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 64, flex: "none" }}>{e.t}</span>
                <StatusBadge sev={meta.sev} label={meta.label} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 120, flex: "none" }}>{e.src}</span>
                <span style={{ fontSize: 12.5, flex: 1 }}>{e.msg}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal open={confirm === "pause"} requireHold title="Pause work request"
        body={<>Pause work on <b>{robot.id}</b>. The robot stops at a safe position.</>}
        onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal open={confirm === "resume"} title="Resume work request"
        body={<>Resume work on <b>{robot.id}</b> after confirming safety state and route occupancy.</>}
        confirmLabel="Resume" onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal open={confirm === "return"} title="Return-to-dock request"
        body={<>Return <b>{robot.id}</b> to its charge / dock position.</>}
        confirmLabel="Return" onConfirm={() => setConfirm(null)} onClose={() => setConfirm(null)} />
      <ConfirmModal open={confirm === "incident"} danger title="Create incident ticket"
        body={<>Create an incident ticket for work session <span className="mono">{session.id}</span>. Events, commands and outcomes link by the same work_session_id.</>}
        confirmLabel="Create ticket" auditNote="The incident links to the C03 console and is recorded to audit_log."
        onConfirm={() => { setConfirm(null); onNavWorkspace("incident"); }} onClose={() => setConfirm(null)} />
    </div>
  );
}

Object.assign(window, { SessionScreen });
