/* ============================================================
   커미셔닝 허브 + Step 1~3
   Hub / StepConnect / StepDiscover / StepCompat
   ============================================================ */

/* ---------------- 커미셔닝 허브 ---------------- */
function CommissionHub({ steps, onStep, onGuide }) {
  const H = window.HM;
  const doneN = steps.filter(s => s.state === "done").length;
  const pct = Math.round(doneN / steps.length * 100);
  const next = steps.find(s => s.state !== "done");
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* identity + progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
            <Icon name="robot" size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <RobotTypeTag type={H.robot.type} />
              <span className="mono" style={{ fontSize: 17, fontWeight: 800, whiteSpace: "nowrap" }}>{H.robot.id}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4, whiteSpace: "nowrap" }}>{H.robot.model} · S/N {H.robot.serial} · {H.robot.controller}</div>
          </div>
          <span className="badge normal" style={{ height: 26, fontSize: 12 }}><Icon name="key" size={13} /> key {H.devKey.id}</span>
        </div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>Commissioning progress</span>
            <span className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{pct}<span style={{ fontSize: 14 }}>%</span></span>
          </div>
          <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{doneN}/{steps.length} steps complete</span>
        </div>
      </div>

      {/* step cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, flex: 1 }}>
        {steps.map((s, i) => {
          const done = s.state === "done", current = s.state === "current";
          return (
            <button key={s.id} onClick={() => onStep(s.id)} style={{
              textAlign: "left", border: "1px solid " + (current ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-md)",
              background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                  background: done ? "var(--brand)" : current ? "var(--surface-2)" : "var(--surface-2)",
                  border: current ? "1px solid var(--line-strong)" : "none", color: done ? "#fff" : "var(--ink-2)" }}>
                  <Icon name={done ? "check" : s.icon} size={20} stroke={done ? 2.6 : 1.9} />
                </span>
                <span className="mono tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-3)" }}>0{s.n}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <div>
                {done && <StatusBadge sev="normal" label="done" />}
                {current && <StatusBadge sev="notice" label="action needed" />}
                {s.state === "todo" && <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>queued</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>
          {next ? <>Next: <b>{next.title}</b></> : <>All steps complete — ready to operate.</>}
        </div>
        <TouchBtn primary icon={next ? "power" : "home2"} onClick={onGuide}>
          {doneN === 0 ? "Start guide" : next ? "Continue" : "HMI home"}
        </TouchBtn>
      </div>
    </div>
  );
}

/* ---------------- 공통 스텝 헤더 ---------------- */
function StepHead({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 22px", borderBottom: "1px solid var(--line)", flex: "none" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={step.icon} size={20} />
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-3)" }}>STEP 0{step.n}/5</span>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{step.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{step.desc}</div>
      </div>
    </div>
  );
}

/* ---------------- Step 1: 연결 · 인증 ---------------- */
function StepConnect({ step }) {
  const H = window.HM;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* pairing */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Robot pairing</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 110, height: 110, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)", flex: "none" }}>
              <Icon name="qr" size={56} stroke={1.4} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>Pairing code</div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "3px" }}>74 12 9F</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "var(--st-normal)", fontWeight: 700 }}>
                <Icon name="check" size={15} /> {H.robot.id} 연결됨
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>Network</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-normal)" }}><Icon name="wifi" size={15} /> good · edge-gw.local</span>
          </div>
        </div>

        {/* dev key */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Dev key auth</div>
          <div style={{ padding: 14, borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 16, fontWeight: 800 }}>{H.devKey.id}</span>
              <StatusBadge sev="normal" label="valid" />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
              발급: {H.devKey.issuer} · {H.devKey.issued}<br />
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>scope: {H.devKey.scope}</span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6 }}>
            This key verifies access to the approved module registry and device registration on the control plane. Since this isn't plug & play, you then identify and select modules yourself.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <TouchBtn ghost icon="refresh" style={{ height: 48, fontSize: 13.5 }}>Re-verify key</TouchBtn>
            <TouchBtn ghost icon="key" style={{ height: 48, fontSize: 13.5 }}>Enter another key</TouchBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 2: 모듈 디스커버리 & 선택 ---------------- */
function StepDiscover({ step, assigns, setAssigns }) {
  const H = window.HM;
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [picking, setPicking] = useState(null); // node being assigned

  const scan = () => {
    setScanning(true); setRevealed(false);
    setTimeout(() => { setScanning(false); setRevealed(true); }, 1800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: "none", padding: "12px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <TouchBtn icon="scan" onClick={scan} disabled={scanning} style={{ height: 48, fontSize: 13.5 }}>
          {scanning ? "scanning…" : "Re-scan bus"}
        </TouchBtn>
        <div style={{ flex: 1, fontSize: 12, color: "var(--ink-3)" }}>
          CAN · Ethernet · USB bus node detection. <b>Since this isn't plug & play</b> identify and select each node yourself.
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
          {scanning ? <span className="live-pulse">detecting…</span> : `${H.nodes.length} nodes`}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {scanning && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 30, color: "var(--ink-3)" }}>
            <Icon name="scan" size={22} className="live-pulse" /> 버스 스캔 중…
          </div>
        )}
        {!scanning && revealed && H.nodes.map(n => {
          const dm = H.detectMeta[n.detect];
          const assigned = assigns[n.node];
          const cat = (assigned || n.suggest) ? H.catalog.find(c => c.id === (assigned || n.suggest)) : null;
          const resolved = n.detect === "identified" || assigned;
          return (
            <div key={n.node} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 14,
              display: "flex", alignItems: "center", gap: 14, background: "var(--surface)" }}>
              <span style={{ width: 44, height: 44, borderRadius: 9, flex: "none", display: "grid", placeItems: "center",
                background: "var(--surface-2)", border: "1px solid var(--line)", color: resolved ? "var(--ink)" : "var(--ink-3)" }}>
                <Icon name={n.detect === "unidentified" ? "search" : "node"} size={22} />
              </span>
              <div style={{ width: 130, flex: "none" }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{n.node}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{n.port} · {n.raw}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {cat ? (
                  <>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cat.type}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{cat.vendor} · <span className="mono">{cat.id}</span> · fw {n.fw}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--st-warning)" }}>Unidentified device — manual selection needed</div>
                )}
                {n.conflict && <div style={{ fontSize: 11, color: "var(--st-critical)", fontWeight: 700, marginTop: 3 }}><Icon name="alert" size={12} /> {n.conflict}</div>}
              </div>
              <StatusBadge sev={assigned ? "normal" : dm.sev} label={assigned ? "identified" : dm.label} />
              <TouchBtn ghost style={{ height: 44, fontSize: 13 }} onClick={() => setPicking(n.node)}>
                {resolved ? "Change" : "Identify"}
              </TouchBtn>
            </div>
          );
        })}
      </div>

      {/* catalog picker sheet */}
      {picking && (
        <div onMouseDown={() => setPicking(null)} style={{ position: "absolute", inset: 0, background: "rgba(20,20,18,.4)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div onMouseDown={e => e.stopPropagation()} className="card" style={{ width: 560, maxHeight: 520, boxShadow: "var(--shadow-3)", display: "flex", flexDirection: "column" }}>
            <PanelHead title="Select module" sub={`approved modules for ${picking}`} right={<button className="icon-btn" onClick={() => setPicking(null)}><Icon name="close" size={18} /></button>} />
            <div style={{ overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {H.catalog.map(c => (
                <button key={c.id} onClick={() => { setAssigns(a => ({ ...a, [picking]: c.id })); setPicking(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 13, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)", textAlign: "left", width: "100%" }}>
                  <Icon name="node" size={20} style={{ color: "var(--ink-3)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.type}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.vendor} · <span className="mono">{c.id}</span></div>
                  </div>
                  <Icon name="chevR" size={16} style={{ color: "var(--ink-3)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 3: 호환 버전 매칭 ---------------- */
function StepCompat({ step }) {
  const H = window.HM;
  const v = H.versions["MOD-CAM-V01"];
  const [pick, setPick] = useState({ capability: "CAP-CAM-v3", firmware: "2.4.2", protocol: "PRT-MQTT-v2" });
  const groups = [
    { key: "capability", label: "Capability Profile", icon: "layers", items: v.capability },
    { key: "firmware", label: "Firmware version", icon: "fileCode", items: v.firmware },
    { key: "protocol", label: "Protocol profile", icon: "branch", items: v.protocol },
  ];
  const allOk = groups.every(g => { const m = H.verMeta[g.items.find(x => x.v === pick[g.key])?.state]; return m && m.sev !== "critical"; });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: "none", padding: "12px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="node" size={17} style={{ color: "var(--ink-2)" }} />
        <span style={{ fontSize: 13.5, fontWeight: 800 }}>MOD-CAM-V01</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>OptiVision · Vision camera</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Approved versions from the registry (key scope)</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {groups.map(g => (
          <div key={g.key} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <Icon name={g.icon} size={16} style={{ color: "var(--ink-3)" }} />
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>{g.label}</span>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map(it => {
                const m = H.verMeta[it.state];
                const on = pick[g.key] === it.v;
                const dis = it.state === "incompatible";
                return (
                  <button key={it.v} disabled={dis} onClick={() => !dis && setPick(p => ({ ...p, [g.key]: it.v }))}
                    style={{ textAlign: "left", border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)",
                      padding: 12, background: on ? "var(--surface-2)" : "var(--surface)", opacity: dis ? .5 : 1, width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{it.v}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StatusBadge sev={m.sev} label={m.label} />
                        {on && <Icon name="check" size={16} style={{ color: "var(--brand)" }} />}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{it.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: "none", padding: "12px 22px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10,
        background: allOk ? "var(--surface-2)" : "var(--tint-critical)" }}>
        <Icon name={allOk ? "check" : "alert"} size={18} style={{ color: allOk ? "var(--st-normal)" : "var(--st-critical)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: allOk ? "var(--st-normal)" : "var(--st-critical)" }}>
          {allOk ? "Selected version combo is compatible — you can continue" : "An incompatible version is selected — pick another"}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { CommissionHub, StepHead, StepConnect, StepDiscover, StepCompat });
