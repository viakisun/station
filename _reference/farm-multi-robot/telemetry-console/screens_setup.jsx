/* ============================================================
   Telemetry 설정 — 허브 / 온보딩 / 채널 맵 빌더(시그니처)
   ============================================================ */

/* ---------------- 설정 허브 ---------------- */
function SetupHub({ steps, onStep, onGuide }) {
  const T = window.TM;
  const doneN = steps.filter(s => s.state === "done").length;
  const pct = Math.round(doneN / steps.length * 100);
  const next = steps.find(s => s.state !== "done");
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
            <Icon name="telemetry" size={28} />
          </div>
          <div style={{ flex: 1, whiteSpace: "nowrap" }}>
            <span className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{T.device.id}</span>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4 }}>{T.device.model} · {T.device.robot} · fw {T.device.fw} · {T.device.uplink}</div>
          </div>
          <span className="badge normal" style={{ height: 26, fontSize: 12 }}><Icon name="check" size={13} /> gateway connected</span>
        </div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>Setup progress</span>
            <span className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{pct}<span style={{ fontSize: 14 }}>%</span></span>
          </div>
          <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{doneN}/{steps.length} steps · {T.kpi.channelsMapped}/{T.kpi.channelsTotal} channels mapped</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, flex: 1 }}>
        {steps.map(s => {
          const done = s.state === "done", current = s.state === "current";
          return (
            <button key={s.id} onClick={() => onStep(s.id)} style={{ textAlign: "left", border: "1px solid " + (current ? "var(--ink)" : "var(--line)"),
              borderRadius: "var(--r-md)", background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                  background: done ? "var(--brand)" : "var(--surface-2)", border: current ? "1px solid var(--line-strong)" : "none", color: done ? "#fff" : "var(--ink-2)" }}>
                  <Icon name={done ? "check" : s.icon} size={20} stroke={done ? 2.6 : 1.9} />
                </span>
                <span className="mono tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-3)" }}>0{s.n}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              {done && <StatusBadge sev="normal" label="done" />}
              {current && <StatusBadge sev="notice" label="action needed" />}
              {s.state === "todo" && <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>queued</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>
          {next ? <>Next: <b>{next.title}</b></> : <>Setup complete — switch to Monitor.</>}
        </div>
        <TouchBtn primary icon={next ? "arrowRight2" : "activity"} onClick={onGuide}>
          {doneN === 0 ? "Start setup" : next ? "Continue" : "To Monitor"}
        </TouchBtn>
      </div>
    </div>
  );
}

/* ---------------- 공통 스텝 헤더 ---------------- */
function TStepHead({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 22px", borderBottom: "1px solid var(--line)", flex: "none" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={step.icon} size={20} />
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-3)", whiteSpace: "nowrap" }}>STEP 0{step.n}/4</span>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{step.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{step.desc}</div>
      </div>
    </div>
  );
}

/* ---------------- Step 1: 장치 온보딩 ---------------- */
function StepOnboard({ step }) {
  const T = window.TM;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Gateway pairing</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)", flex: "none" }}>
              <Icon name="telemetry" size={48} stroke={1.4} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{T.device.id}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{T.device.model} · {T.device.power}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "var(--st-normal)", fontWeight: 700 }}>
                <Icon name="check" size={15} /> 발견됨 · 연결 완료
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Connection targets</div>
          {[["Robot", T.device.robot, "robot"], ["Site / GH", T.device.site, "node"], ["Uplink", T.device.uplink, "wifi"], ["Platform", "registered in device registry", "link"]].map(([k, v, ic], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
              <Icon name={ic} size={17} style={{ color: "var(--ink-3)" }} />
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", flex: "none", width: 90 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{v}</span>
              <Icon name="check" size={16} style={{ color: "var(--st-normal)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 2: 채널 맵 빌더 (시그니처) ---------------- */
function ChannelMapBuilder({ step }) {
  const T = window.TM;
  const ROWH = 50;
  const [mappings, setMappings] = useState(() => { const m = {}; T.rawSignals.forEach(r => { if (r.mapped) m[r.id] = r.mapped; }); return m; });
  const [selRaw, setSelRaw] = useState(null);
  const [svgW, setSvgW] = useState(180);
  const svgRef = useRef(null);
  useEffect(() => {
    const fit = () => { if (svgRef.current) setSvgW(svgRef.current.clientWidth); };
    fit(); window.addEventListener("resize", fit); const t = setTimeout(fit, 60);
    return () => { window.removeEventListener("resize", fit); clearTimeout(t); };
  }, []);

  const chIndex = (id) => T.channels.findIndex(c => c.id === id);
  const mappedCount = Object.keys(mappings).length;

  const clickRaw = (r) => setSelRaw(selRaw === r.id ? null : r.id);
  const clickCh = (c) => {
    if (!selRaw) return;
    setMappings(m => ({ ...m, [selRaw]: c.id }));
    setSelRaw(null);
  };
  const unmap = (rid, e) => { e.stopPropagation(); setMappings(m => { const n = { ...m }; delete n[rid]; return n; }); };

  const y = (i) => i * ROWH + ROWH / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: "none", padding: "10px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          {selRaw ? <b style={{ color: "var(--ink)" }}>Raw signal selected — tap a standard channel on the right to map</b> : "Tap a raw signal on the left, then a standard channel on the right to map"}
        </span>
        <div style={{ flex: 1 }} />
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap", flex: "none" }}>{mappedCount}/{T.rawSignals.length} 매핑</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 22px" }}>
        <div style={{ display: "flex", gap: 0, position: "relative" }}>
          {/* left: raw signals */}
          <div style={{ width: 300, flex: "none" }}>
            <ColLabel icon="database" label="Raw signals" sub="raw message fields" />
            {T.rawSignals.map((r, i) => {
              const on = selRaw === r.id, mapped = !!mappings[r.id];
              return (
                <div key={r.id} onClick={() => clickRaw(r)} style={{ height: ROWH, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", cursor: "pointer",
                  border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)", marginBottom: 4,
                  background: on ? "var(--surface-2)" : "var(--surface)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: mapped ? "var(--brand)" : "var(--st-warning)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{r.key}</div>
                    <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{r.hex} · {r.hint}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{r.sample}</span>
                </div>
              );
            })}
          </div>

          {/* center: connection lines */}
          <div ref={svgRef} style={{ flex: 1, position: "relative", minWidth: 80 }}>
            <div style={{ height: 44 }} />
            <svg width={svgW} height={T.rawSignals.length * ROWH} style={{ display: "block" }}>
              {T.rawSignals.map((r, i) => {
                const cid = mappings[r.id]; if (!cid) return null;
                const ci = chIndex(cid); if (ci < 0) return null;
                const y1 = y(i), y2 = y(ci);
                const d = `M0 ${y1} C ${svgW * 0.45} ${y1}, ${svgW * 0.55} ${y2}, ${svgW} ${y2}`;
                const hot = selRaw === r.id;
                return <path key={r.id} d={d} fill="none" stroke={hot ? "var(--ink)" : "var(--brand)"} strokeWidth={hot ? 2.4 : 1.8} opacity={hot ? 1 : .7} />;
              })}
            </svg>
          </div>

          {/* right: standard channels */}
          <div style={{ width: 300, flex: "none" }}>
            <ColLabel icon="layers" label="Standard channels" sub="platform TelemetryChannel" right />
            {T.channels.map((c, i) => {
              const mappedFrom = Object.entries(mappings).find(([, v]) => v === c.id);
              const armed = !!selRaw;
              return (
                <div key={c.id} onClick={() => clickCh(c)} style={{ height: ROWH, display: "flex", alignItems: "center", gap: 10, padding: "0 12px",
                  cursor: armed ? "pointer" : "default", border: "1px solid " + (mappedFrom ? "var(--line)" : armed ? "var(--brand)" : "var(--line)"),
                  borderRadius: "var(--r-sm)", marginBottom: 4, background: mappedFrom ? "var(--surface)" : armed ? "var(--surface-2)" : "var(--surface)",
                  borderStyle: mappedFrom ? "solid" : armed ? "dashed" : "solid" }}>
                  <Icon name={c.icon} size={16} style={{ color: "var(--ink-3)", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.label} <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{c.unit}</span></div>
                    <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{c.id}</div>
                  </div>
                  {mappedFrom && <button onClick={(e) => unmap(mappedFrom[0], e)} className="icon-btn" style={{ width: 24, height: 24, flex: "none" }}><Icon name="close" size={13} /></button>}
                  {!mappedFrom && <span style={{ fontSize: 9.5, color: "var(--st-warning)", fontWeight: 700, flex: "none" }}>unmapped</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: "none", padding: "11px 22px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10,
        background: mappedCount >= 6 ? "var(--surface-2)" : "var(--tint-warning)" }}>
        <Icon name={mappedCount >= 6 ? "check" : "alert"} size={17} style={{ color: mappedCount >= 6 ? "var(--st-normal)" : "var(--st-warning)" }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: mappedCount >= 6 ? "var(--st-normal)" : "var(--st-warning)" }}>
          {mappedCount >= 6 ? `${mappedCount} channels mapped · unit & type checks passed` : "Required channels unmapped — map Env & Robot channels"}
        </span>
      </div>
    </div>
  );
}
function ColLabel({ icon, label, sub, right }) {
  return (
    <div style={{ height: 44, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", paddingBottom: 6 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800 }}><Icon name={icon} size={15} style={{ color: "var(--ink-3)" }} /> {label}</span>
      <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{sub}</span>
    </div>
  );
}

Object.assign(window, { SetupHub, TStepHead, StepOnboard, ChannelMapBuilder });
