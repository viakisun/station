/* ============================================================
   Step 4~5 + HMI 홈
   StepProtocol / StepControl / HmiHome
   ============================================================ */

/* ---------------- Step 4: 프로토콜 설정 ---------------- */
function StepProtocol({ step }) {
  const H = window.HM, d = H.protocolDefaults;
  const [transport, setTransport] = useState(d.transport);
  const [qos, setQos] = useState(d.qos);
  const [ack, setAck] = useState(d.ack);
  const [test, setTest] = useState(null); // null | testing | ok

  const runTest = () => { setTest("testing"); setTimeout(() => setTest("ok"), 1400); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* transport + fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 12 }}>Transport</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {H.transports.map(tr => {
                const on = transport === tr.id;
                return (
                  <button key={tr.id} onClick={() => setTransport(tr.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 13,
                    border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)", background: on ? "var(--surface-2)" : "var(--surface)", textAlign: "left", width: "100%" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", border: "2px solid " + (on ? "var(--brand)" : "var(--line-strong)"), display: "grid", placeItems: "center" }}>
                      {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{tr.label}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>{tr.desc}</span>
                    </div>
                    {tr.reco && <StatusBadge sev="normal" label="recommended" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* config */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <PanelHead title="Contract setup" sub={transport + " · standard protocol profile"} dense />
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <PField label="Broker / Endpoint" value={d.broker} mono />
            <PField label="command topic" value={d.topicCmd} mono />
            <PField label="telemetry topic" value={d.topicTel} mono />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <FLabel>QoS</FLabel>
                <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
                  {[0, 1, 2].map(q => <button key={q} onClick={() => setQos(q)} style={{ flex: 1, height: 36, border: "none", borderRadius: 5, fontWeight: 700, fontSize: 13,
                    background: qos === q ? "var(--surface)" : "transparent", color: qos === q ? "var(--ink)" : "var(--ink-3)", boxShadow: qos === q ? "var(--shadow-2)" : "none" }}>{q}</button>)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <FLabel>ack 정책</FLabel>
                <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
                  {[["at_least_once", "≥1"], ["exactly_once", "=1"]].map(([a, l]) => <button key={a} onClick={() => setAck(a)} style={{ flex: 1, height: 36, border: "none", borderRadius: 5, fontWeight: 700, fontSize: 12.5,
                    background: ack === a ? "var(--surface)" : "transparent", color: ack === a ? "var(--ink)" : "var(--ink-3)", boxShadow: ack === a ? "var(--shadow-2)" : "none" }}>{l}</button>)}
                </div>
              </div>
            </div>
            <PField label="timeout / security" value={`${d.timeout}ms · ${d.security}`} />
          </div>
          <div style={{ marginTop: "auto", padding: 14, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
            <TouchBtn icon="terminal" onClick={runTest} disabled={test === "testing"} style={{ height: 48, fontSize: 13.5 }}>
              {test === "testing" ? "sending…" : "Test message"}
            </TouchBtn>
            {test === "ok" && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--st-normal)" }}><Icon name="check" size={16} /> ack received · 142ms</span>}
            {test === "testing" && <span className="live-pulse" style={{ fontSize: 12.5, color: "var(--st-notice)", fontWeight: 700 }}>round-trip 측정 중…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
function FLabel({ children }) { return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>{children}</div>; }
function PField({ label, value, mono }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className={mono ? "mono" : ""} style={{ height: 40, display: "flex", alignItems: "center", padding: "0 12px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface-2)", fontSize: 12.5, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

/* ---------------- Step 5: 관제 연결 · 등록 ---------------- */
function StepControl({ step, assigns }) {
  const H = window.HM;
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [site, setSite] = useState("GH-A");
  const [pi, setPi] = useState(0);
  const phases = ["Connect to control plane", "Dev key auth", "device registry", "Profile sync", "Registered"];

  const connect = () => {
    setPhase("running"); setPi(0);
    let i = 0;
    const iv = setInterval(() => { i++; setPi(i); if (i >= phases.length) { clearInterval(iv); setPhase("done"); } }, 600);
  };

  const mods = Object.values(assigns).length || 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* registration summary */}
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Registration summary</div>
          <SumRow k="Robot" v={<span className="mono">{H.robot.id}</span>} />
          <SumRow k="Modules" v={`${mods} identified · mapped`} />
          <SumRow k="Versions" v="CAP-CAM-v3 · fw 2.4.2 · MQTT-v2" />
          <SumRow k="Dev key" v={<span className="mono">{H.devKey.id}</span>} />
          <div>
            <FLabel>Greenhouse / zone</FLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {H.sites.map(s => (
                <button key={s.id} onClick={() => setSite(s.id)} className={"chip" + (site === s.id ? " active" : "")} style={{ height: 40, fontSize: 13 }}>{s.name}</button>
              ))}
            </div>
          </div>
        </div>

        {/* connect action */}
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Connect to control plane</div>
          {phase === "idle" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--ink-3)", textAlign: "center" }}>
              <Icon name="link" size={40} stroke={1.4} />
              <div style={{ fontSize: 12.5, maxWidth: 240, lineHeight: 1.6 }}>Register this robot in the control plane device registry using the dev key scope.</div>
              <TouchBtn primary icon="link" onClick={connect}>Connect · register</TouchBtn>
            </div>
          )}
          {phase !== "idle" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
              {phases.map((p, i) => {
                const done = pi > i, active = pi === i && phase === "running";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 4px" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                      background: done ? "var(--brand)" : "var(--surface-2)", border: active ? "2px solid var(--st-notice)" : done ? "none" : "1.5px solid var(--line-strong)", color: "#fff" }}>
                      {done && <Icon name="check" size={13} stroke={3} />}
                      {active && <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-notice)" }} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: done || active ? 700 : 600, color: done ? "var(--ink)" : active ? "var(--st-notice)" : "var(--ink-3)" }}>{p}</span>
                  </div>
                );
              })}
              {phase === "done" && (
                <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="check" size={18} style={{ color: "var(--st-normal)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--st-normal)" }}>{H.robot.id} 등록 완료 — 관제에서 모니터링 가능</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function SumRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

/* ---------------- HMI 홈 상태판 (운용) ---------------- */
function HmiHome({ onReconfigure }) {
  const H = window.HM;
  const mods = [
    { t: "Vision camera", id: "MOD-CAM-V01", h: "normal" },
    { t: "Manipulator", id: "MOD-ARM-A2", h: "normal" },
    { t: "Thinning end-effector", id: "MOD-EE-THIN", h: "warning" },
    { t: "Navigation", id: "MOD-NAV-N1", h: "normal" },
  ];
  const mh = { normal: { label: "normal", sev: "normal" }, warning: { label: "warning", sev: "warning" } };
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* work status hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-2)" }}>Current work</span>
            <StatusBadge sev="normal" label="ready" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Thinning · Greenhouse A zone 3</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Route RT-A-THIN-03 · 320 plants · idle after commissioning</div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <TouchBtn primary icon="play" full>Start work</TouchBtn>
            <TouchBtn icon="sliders" style={{ flex: "none" }}>Parameters</TouchBtn>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, alignItems: "center" }}>
          <Icon name="shield" size={36} style={{ color: "var(--st-normal)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Safety nominal</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>e-stop inactive · safety zone ok</div>
          </div>
          <TouchBtn danger icon="power" full>E-STOP</TouchBtn>
        </div>
      </div>

      {/* module health */}
      <div className="card">
        <PanelHead title="Module status" sub="4 modules · live" dense
          right={<button className="btn ghost sm" onClick={onReconfigure}><Icon name="sliders" size={14} /> Re-commission</button>} />
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {mods.map(m => (
            <div key={m.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Icon name="node" size={16} style={{ color: "var(--ink-3)" }} />
                <StatusBadge sev={mh[m.h].sev} label={mh[m.h].label} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.t}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{m.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[["Calibration", "target"], ["Manual jog", "sliders"], ["Incident", "alert"], ["Checklist", "check"]].map(([l, ic]) => (
          <button key={l} style={{ height: 72, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            <Icon name={ic === "target" ? "node" : ic} size={22} style={{ color: "var(--ink-2)" }} /> {l}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { StepProtocol, StepControl, HmiHome });
