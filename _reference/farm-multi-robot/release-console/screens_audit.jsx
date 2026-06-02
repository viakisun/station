/* ============================================================
   AUDIT 섹션 — C02-00 홈 / C02-06 Conformance Runner / C02-07 Audit 빌더
   ============================================================ */

/* ---------------- C02-00 개발자 킷 홈 ---------------- */
function AuditHome({ onNav, density }) {
  const R = window.RC, k = R.kpi;
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="Active vendors" value={k.vendorsActive} icon="grip" />
        <KpiCard label="Registered modules" value={k.modulesTotal} sub={`approved ${k.modulesApproved}`} icon="pkg" />
        <KpiCard label="Audit pass rate" value={k.auditPassRate} unit="%" icon="check" />
        <KpiCard label="Open issues" value={k.openIssues} sev={k.openIssues > 0 ? "warning" : null} icon="flag" />
        <KpiCard label="Conformance runs" value={k.conformanceRuns} icon="beaker" />
        <KpiCard label="SDK" value={"v" + k.sdkVersion} icon="code" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* onboarding / module table */}
        <div className="card">
          <PanelHead title="Module onboarding" sub={`${R.modules.length} modules · multi-vendor`} dense={density === "compact"}
            right={<button className="btn primary sm"><Icon name="plus" size={14} /> New module</button>} />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Module", "Vendor", "Robots", "Firmware", "Audit", ""].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {R.modules.map(m => {
                  const am = R.auditMeta[m.auditState];
                  const v = R.vendors.find(x => x.id === m.vendor);
                  return (
                    <tr key={m.id} className="hov-row" style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ fontWeight: 700 }}>{m.type}</div>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{v?.name}</td>
                      <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{m.robots}</td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5 }}>v{m.fw}</span></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={am.sev} label={am.label} /></td>
                      <td style={{ padding: "9px 12px" }}><button className="btn ghost sm" onClick={() => onNav("c02-audit")}><Icon name="chevR" size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* quick start checklist */}
          <div className="card">
            <PanelHead title="Quick start" sub="vendor onboarding · 5 steps" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
              {[["Download SDK · schema", true], ["Write Capability / Protocol Profile", true], ["Validate messages in simulator", true], ["Run Conformance tests", false], ["Approve Audit Package", false]].map(([l, done], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                    background: done ? "var(--brand)" : "var(--surface-2)", border: done ? "none" : "1.5px solid var(--line-strong)", color: "#fff" }}>
                    {done ? <Icon name="check" size={12} stroke={2.5} /> : <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 700 }}>{i + 1}</span>}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: done ? 500 : 700, color: done ? "var(--ink-3)" : "var(--ink)", textDecoration: done ? "line-through" : "none" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {/* recent failed tests */}
          <div className="card">
            <PanelHead title="Needs action" sub="failed / blocked / waiver" dense />
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <AlertRow icon="beaker" sev="critical" title="MOD-NAV-N2 conformance failed" sub="4 error-map · 2 schema" onClick={() => onNav("c02-conf")} />
              <AlertRow icon="fileCode" sev="critical" title="FW-EEP-3.1.0 static analysis blocked" sub="2 critical findings" onClick={() => onNav("c04-static")} />
              <AlertRow icon="flag" sev="warning" title="AUD-MOD-EEP waiver pending" sub="GreenEdge · pending approval" onClick={() => onNav("c02-audit")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ icon, sev, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, padding: 10, border: "1px solid var(--line)",
      borderRadius: "var(--r-sm)", background: "var(--surface)", textAlign: "left", width: "100%" }}>
      <span style={{ color: `var(--st-${sev})`, flex: "none" }}><Icon name={icon} size={17} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</div>
      </div>
      <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />
    </button>
  );
}

/* ---------------- C02-06 Conformance Test Runner (실시간) ---------------- */
function ConformanceRunner({ density }) {
  const R = window.RC;
  const [results, setResults] = useState({});   // id -> {state, exp, act}
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const logRef = useRef(null);
  const timers = useRef([]);

  const cases = R.testCases;
  const total = cases.length;
  const done = Object.values(results).filter(r => r.state === "pass" || r.state === "fail").length;
  const passed = Object.values(results).filter(r => r.state === "pass").length;
  const failed = Object.values(results).filter(r => r.state === "fail").length;
  const progress = Math.round(done / total * 100);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (line, sev = "info") => setLog(l => [...l, { line, sev, t: nowStr() }]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setResults({}); setLog([]); setRunning(true); setActiveId(null);
    addLog("conformance run started — MOD-CAM-V01 / PRT-MQTT-v2", "info");
    let acc = 300;
    cases.forEach((c) => {
      timers.current.push(setTimeout(() => {
        setActiveId(c.id); setResults(r => ({ ...r, [c.id]: { state: "running" } }));
        addLog(`▶ ${c.id} ${c.name}`, "info");
      }, acc));
      acc += c.ms;
      timers.current.push(setTimeout(() => {
        const pass = !c.fail;
        setResults(r => ({ ...r, [c.id]: { state: pass ? "pass" : "fail", exp: c.exp, act: c.act } }));
        addLog(pass ? `  ✓ pass (${c.ms}ms)` : `  ✕ FAIL — expected ${c.exp}, got ${c.act}`, pass ? "pass" : "fail");
      }, acc - 40));
    });
    timers.current.push(setTimeout(() => {
      setRunning(false); setActiveId(null);
      addLog(`run 완료 — ${cases.filter(c => !c.fail).length} pass / ${cases.filter(c => c.fail).length} fail`, "info");
    }, acc + 80));
  };

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* header bar */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Conformance Test Runner</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>MOD-CAM-V01</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>schema · heartbeat · command ack · telemetry · error map · safety interlock conformance</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Stat3 label="pass" value={passed} sev="normal" />
          <Stat3 label="fail" value={failed} sev={failed ? "critical" : "disabled"} />
          <Stat3 label="total" value={`${done}/${total}`} />
        </div>
        {failed > 0 && !running && <button className="btn sm"><Icon name="refresh" size={14} /> Re-run failed</button>}
        <button className="btn primary" onClick={run} disabled={running}>
          {running ? <><Icon name="refresh" size={15} className="live-pulse" /> running…</> : <><Icon name="play" size={15} /> Run all</>}
        </button>
      </div>

      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: progress + "%", height: "100%", background: failed ? "var(--st-warning)" : "var(--brand)", transition: "width .3s" }} />
        </div>
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", width: 38 }}>{progress}%</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--gap)" }}>
        {/* results table */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Test cases" sub={`${cases.length}`} dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            {cases.map(c => {
              const r = results[c.id] || { state: "pending" };
              const suite = R.testSuites.find(s => s.id === c.suite);
              return (
                <div key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 14px",
                    background: c.id === activeId ? "var(--surface-2)" : "transparent" }}>
                    <CaseDot state={r.state} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}><span className="mono">{c.id}</span> · {suite?.name}</div>
                    </div>
                    {r.state === "pass" && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-normal)" }}>pass</span>}
                    {r.state === "fail" && <StatusBadge sev="critical" label="fail" />}
                    {r.state === "running" && <span className="live-pulse" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-notice)" }}>running</span>}
                    {r.state === "pending" && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>queued</span>}
                  </div>
                  {r.state === "fail" && (
                    <div style={{ padding: "0 14px 11px 39px", display: "flex", flexDirection: "column", gap: 4 }}>
                      <DiffLine label="expected" val={r.exp} ok />
                      <DiffLine label="actual" val={r.act} />
                      <button className="btn ghost sm" style={{ alignSelf: "flex-start", marginTop: 2, color: "var(--st-warning)" }}><Icon name="flag" size={13} /> Request waiver</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* live log */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1c1c1a" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}>
              <Icon name="terminal" size={15} /> Live log
            </span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11.5, lineHeight: 1.7 }}>
            {log.length === 0 && <span style={{ color: "#666" }}>$ idle — press 'Run all'</span>}
            {log.map((l, i) => (
              <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                <span style={{ color: "#555" }}>{l.t} </span>{l.line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Stat3({ label, value, sev }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: sev ? `var(--st-${sev})` : "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}
function CaseDot({ state }) {
  if (state === "pass") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-normal)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="check" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "fail") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-critical)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="close" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "running") return <span className="live-pulse" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--st-notice)", flex: "none" }} />;
  return <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--line-strong)", flex: "none" }} />;
}
function DiffLine({ label, val, ok }) {
  return (
    <div className="mono" style={{ fontSize: 11, display: "flex", gap: 8 }}>
      <span style={{ width: 60, color: "var(--ink-3)", flex: "none" }}>{label}</span>
      <span style={{ color: ok ? "var(--st-normal)" : "var(--st-critical)" }}>{val}</span>
    </div>
  );
}

/* ---------------- C02-07 Audit Package 빌더 ---------------- */
function AuditBuilder({ density }) {
  const R = window.RC;
  const arts = R.auditArtifacts;
  const present = arts.filter(a => a.ok).length;
  const score = 91;
  const missing = arts.filter(a => !a.ok);
  const steps = [
    { label: "Collect artifacts", state: "done" },
    { label: "Attach conformance results", state: "done" },
    { label: "Score ≥ 90", state: "done" },
    { label: "QA review", state: "current" },
    { label: "Approve for production", state: "todo" },
  ];

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* package contents */}
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <PanelHead title="Audit Package contents" sub="AUD-MOD-CAM-20260531-01 · audit_package.zip" dense={density === "compact"}
          right={<span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{present}/{arts.length} included</span>} />
        <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
          {arts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", borderRadius: "var(--r-sm)" }} className="hov-row">
              <span style={{ width: 16, height: 16, borderRadius: 4, flex: "none", display: "grid", placeItems: "center",
                background: a.ok ? "var(--brand)" : "var(--surface-2)", border: a.ok ? "none" : "1.5px dashed var(--line-strong)", color: "#fff" }}>
                {a.ok && <Icon name="check" size={11} stroke={3} />}
              </span>
              <Icon name={a.f.endsWith(".pdf") ? "doc" : a.f.endsWith(".md") ? "doc" : "fileCode"} size={15} style={{ color: "var(--ink-3)", flex: "none" }} />
              <span className="mono" style={{ fontSize: 12, flex: 1, color: a.ok ? "var(--ink)" : "var(--ink-3)" }}>{a.f}</span>
              {a.note && <span style={{ fontSize: 11, color: a.ok ? "var(--ink-3)" : "var(--st-warning)", fontWeight: a.ok ? 500 : 700 }}>{a.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* score + approval */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
        <div className="card" style={{ padding: "var(--pad-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ScoreRing score={score} />
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>Conformance score</div>
              <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>98 / 102 cases passed</div>
              <div style={{ fontSize: 11.5, color: "var(--st-warning)", fontWeight: 600, marginTop: 4 }}>≥ 90 threshold — approvable</div>
            </div>
          </div>
        </div>

        {missing.length > 0 && (
          <div className="card" style={{ padding: "12px 14px", background: "var(--tint-warning)", border: "1px solid #efe3c6" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--st-warning)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="alert" size={15} /> {missing.length} missing artifacts
            </div>
            {missing.map((m, i) => <div key={i} className="mono" style={{ fontSize: 11.5, color: "#7a5a06" }}>· {m.f}</div>)}
          </div>
        )}

        <div className="card">
          <PanelHead title="Approval workflow" dense />
          <div style={{ padding: "14px 16px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 11, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                    background: s.state === "done" ? "var(--brand)" : s.state === "current" ? "var(--surface)" : "var(--surface-2)",
                    border: s.state === "current" ? "2px solid var(--st-notice)" : s.state === "todo" ? "1.5px solid var(--line-strong)" : "none", color: "#fff" }}>
                    {s.state === "done" && <Icon name="check" size={11} stroke={3} />}
                    {s.state === "current" && <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--st-notice)" }} />}
                  </span>
                  {i < steps.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 3, minHeight: 14 }} />}
                </div>
                <div style={{ paddingTop: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: s.state === "current" ? 700 : 600, color: s.state === "todo" ? "var(--ink-3)" : "var(--ink)" }}>{s.label}</div>
                  {s.state === "current" && <div style={{ fontSize: 11, color: "var(--st-notice)", fontWeight: 600 }}>in progress · Jung W.</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1 }}><Icon name="dl" size={15} /> zip Export</button>
            <button className="btn primary" style={{ flex: 1 }} disabled={missing.length > 0}><Icon name="check" size={15} /> Request approval</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ScoreRing({ score }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: 68, height: 68, flex: "none" }}>
      <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span className="tnum" style={{ fontSize: 19, fontWeight: 800 }}>{score}</span>
      </div>
    </div>
  );
}

function nowStr() { const d = new Date(); return d.toTimeString().slice(0, 8); }

Object.assign(window, { AuditHome, ConformanceRunner, AuditBuilder });
