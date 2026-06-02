/* ============================================================
   FIRMWARE 섹션 — C04-00 대시보드 / C04-02 정적분석 / C04-03 호환성 / C04-06 OTA
   ============================================================ */

/* ---------------- C04-00 펌웨어 운영 대시보드 ---------------- */
function FirmwareDash({ onNav, density }) {
  const R = window.RC, k = R.kpi;
  const blocked = R.firmwares.filter(f => f.deploy === "blocked" || f.analysis === "failed");
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="Registered firmware" value={R.firmwares.length} icon="fileCode" />
        <KpiCard label="Analyzing" value={k.fwAnalyzing} icon="refresh" />
        <KpiCard label="Deploy blocked" value={k.fwBlocked} sev={k.fwBlocked ? "critical" : null} icon="lock" />
        <KpiCard label="Deploying" value={k.deploysActive} sub="Canary 2/6" icon="rocket" onClick={() => onNav("c04-ota")} />
        <KpiCard label="Pending approval" value={1} sev="warning" icon="flag" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card">
          <PanelHead title="Firmware versions" sub="per-module lifecycle · deploy state" dense={density === "compact"}
            right={<button className="btn primary sm"><Icon name="upload" size={14} /> Register firmware</button>} />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Firmware / version", "Module", "Static analysis", "Deploy", "findings", ""].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {R.firmwares.map(f => {
                  const am = R.fwAnalysisMeta[f.analysis], dm = R.fwMeta[f.deploy];
                  return (
                    <tr key={f.id} className="hov-row" style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}
                      onClick={() => onNav(f.deploy === "blocked" || f.analysis === "failed" ? "c04-static" : "c04-ota")}>
                      <td style={{ padding: "9px 12px" }}>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{f.id}</span>
                        <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{f.note}</div>
                      </td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{f.module}</span></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={am.sev} label={am.label} dot={f.analysis !== "analyzing"} /></td>
                      <td style={{ padding: "9px 12px" }}><StatusBadge sev={dm.sev} label={dm.label} /></td>
                      <td style={{ padding: "9px 12px" }}>
                        <span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>{f.findings}</span>
                        {f.critical > 0 && <span style={{ fontSize: 11, color: "var(--st-critical)", fontWeight: 700 }}> · {f.critical} critical</span>}
                      </td>
                      <td style={{ padding: "9px 12px" }}><Icon name="chevR" size={14} style={{ color: "var(--ink-3)" }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <PanelHead title="Blocked items" sub="failed release gate" dense
            right={<StatusBadge sev="critical" label={`${blocked.length}`} />} />
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {blocked.map(f => (
              <button key={f.id} onClick={() => onNav("c04-static")} style={{ textAlign: "left", border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)", padding: 11, background: "var(--surface)", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{f.id}</span>
                  <StatusBadge sev="critical" label={f.critical ? `${f.critical} critical` : "analysis failed"} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{f.module} · {f.note}</div>
              </button>
            ))}
            <div style={{ padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--tint-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, color: "var(--st-critical)", fontWeight: 600 }}>
              If analysis fails, compatibility is incompatible, or Audit is unapproved, deployment planning is blocked.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- C04-02 정적분석 결과 상세 ---------------- */
function StaticAnalysis({ density }) {
  const R = window.RC;
  const all = R.findings;
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(all[0]);
  const counts = { critical: all.filter(f => f.sev === "critical").length, warning: all.filter(f => f.sev === "warning").length,
    low: all.filter(f => f.sev === "low").length, info: all.filter(f => f.sev === "info").length };
  const list = filter === "all" ? all : all.filter(f => f.sev === filter);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Static analysis</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>FW-EEP-3.1.0</span>
            <StatusBadge sev="critical" label="deploy blocked" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>MOD-EE-PINCH · GreenEdge · ruleset v12 · blocks deploy on critical findings</div>
        </div>
        <button className="btn sm"><Icon name="refresh" size={14} /> Re-analyze</button>
        <button className="btn sm" style={{ color: "var(--st-warning)" }}><Icon name="flag" size={14} /> Request unblock</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--gap)" }}>
        {/* findings list */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <FBtn active={filter === "all"} onClick={() => setFilter("all")}>all {all.length}</FBtn>
            <FBtn active={filter === "critical"} onClick={() => setFilter("critical")} sev="critical">critical {counts.critical}</FBtn>
            <FBtn active={filter === "warning"} onClick={() => setFilter("warning")} sev="warning">warning {counts.warning}</FBtn>
            <FBtn active={filter === "low"} onClick={() => setFilter("low")}>low {counts.low}</FBtn>
            <FBtn active={filter === "info"} onClick={() => setFilter("info")}>info {counts.info}</FBtn>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {list.map(f => {
              const sm = R.sevMeta[f.sev];
              const on = sel.id === f.id;
              return (
                <button key={f.id} onClick={() => setSel(f)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                  background: on ? "var(--surface-2)" : "transparent" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${sm.sev})`, flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{f.rule} · {f.file}</div>
                  </div>
                  {f.waiver && <StatusBadge sev="warning" label="waiver" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* finding detail */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Finding detail" sub={sel.rule} dense />
          <div style={{ flex: 1, overflow: "auto", padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StatusBadge sev={R.sevMeta[sel.sev].sev} label={R.sevMeta[sel.sev].label} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{sel.title}</span>
            </div>
            <KV2 pairs={[["Rule", <span className="mono">{sel.rule}</span>], ["File", <span className="mono">{sel.file}</span>], ["Function", <span className="mono">{sel.fn}</span>], ["Blocks deploy", sel.sev === "critical" ? <span style={{ color: "var(--st-critical)", fontWeight: 700 }}>yes</span> : "no"]]} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>Code location</div>
              <div style={{ background: "#1c1c1a", borderRadius: "var(--r-sm)", padding: "11px 13px", overflow: "auto" }}>
                <pre className="mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.7, color: "#ddd" }}>{codeSnippet(sel)}</pre>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn sm" style={{ flex: 1 }}><Icon name="check" size={14} /> Mark fixed</button>
              <button className="btn sm" style={{ flex: 1, color: "var(--st-warning)" }} disabled={sel.waiver === "requested"}><Icon name="flag" size={14} /> {sel.waiver === "requested" ? "waiver requested" : "Request waiver"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FBtn({ active, onClick, children, sev }) {
  return <button onClick={onClick} className={"chip" + (active ? " active" : "")} style={{ height: 26, ...(sev && !active ? { color: `var(--st-${sev})` } : {}) }}>{children}</button>;
}
function KV2({ pairs }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p[0]}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p[1]}</span>
        </div>
      ))}
    </div>
  );
}
function codeSnippet(f) {
  if (f.rule === "MEM-001") return "216 |   uint8_t buf[64];\n217 |   size_t n = read_payload(buf);\n218 | > memcpy(buf, src, n);   // n unchecked → overflow\n219 |   apply(buf);";
  if (f.rule === "CON-014") return " 89 |   if (force > LIMIT)\n 90 |     lock();\n 91 | > release_lock();        // unconditional release\n 92 |   move(axis);";
  return ` ${f.file.split(":")[1]} | > ${f.fn}  // ${f.rule}\n      |   // 규칙 위반 위치`;
}

/* ---------------- C04-03 호환성 매트릭스 ---------------- */
function CompatMatrix({ density }) {
  const R = window.RC;
  const [cell, setCell] = useState(null);
  const reasons = {
    "FW-CAM-2.4.2|HMI-800": "HMI 800×480 firmware < v1.8 — UI render limits, update recommended",
    "FW-EEP-3.1.0|RBT-PINCH": "unresolved static-analysis critical — cannot deploy",
    "FW-EEP-3.1.0|TEL-GW2": "Telemetry schema mapping unverified",
    "FW-NAV-4.0.6|HMI-1024": "HMI firmware dependency warning — check matrix",
    "FW-NAV-4.0.6|HMI-800": "low-res HMI compatibility warning",
    "FW-NAV2-0.9.4|RBT-THIN": "Audit unapproved — cannot deploy",
    "FW-NAV2-0.9.4|TEL-GW2": "protocol contract mismatch",
  };
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Compatibility matrix</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>firmware × robot/HMI/Telemetry deployability</div>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "7px 12px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, fontSize: 11, color: "var(--ink-2)" }}>
          {Object.entries(R.compatMeta).map(([k, m]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
              <CompatCell state={k} mini /> {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "var(--surface-2)", padding: "12px 14px", textAlign: "left", fontSize: 11.5, fontWeight: 700, borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)", minWidth: 160, zIndex: 2 }}>Firmware</th>
              {R.compatTargets.map(t => (
                <th key={t.id} style={{ padding: "12px 10px", fontSize: 11.5, fontWeight: 700, borderBottom: "1px solid var(--line)", textAlign: "center", minWidth: 96 }}>
                  {t.label}<div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{t.id}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {R.compatRows.map((row, ri) => (
              <tr key={row.fw}>
                <td style={{ position: "sticky", left: 0, background: "var(--surface)", padding: "10px 14px", borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)", zIndex: 1 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{row.fw}</span>
                </td>
                {row.vals.map((v, ci) => {
                  const key = `${row.fw}|${R.compatTargets[ci].id}`;
                  const selKey = cell && `${cell.fw}|${cell.target}`;
                  return (
                    <td key={ci} style={{ padding: 7, borderBottom: "1px solid var(--line)", textAlign: "center",
                      background: selKey === key ? "var(--surface-2)" : "transparent", cursor: v === "warn" || v === "incompat" || v === "unknown" ? "pointer" : "default" }}
                      onClick={() => (v !== "ok" && v !== "na") && setCell({ fw: row.fw, target: R.compatTargets[ci].id, state: v, reason: reasons[key] })}>
                      <CompatCell state={v} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cell && (
        <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <CompatCell state={cell.state} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              <span className="mono">{cell.fw}</span> → {R.compatTargets.find(t => t.id === cell.target)?.label}
              <span style={{ marginLeft: 8 }}><StatusBadge sev={R.compatMeta[cell.state].sev} label={R.compatMeta[cell.state].label} /></span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3 }}>{cell.reason || "no block reason"}</div>
          </div>
          <button className="btn sm" onClick={() => setCell(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
function CompatCell({ state, mini }) {
  const R = window.RC, m = R.compatMeta[state];
  const sz = mini ? 16 : 26;
  const bg = { ok: "var(--st-normal)", warn: "var(--st-warning)", incompat: "var(--st-critical)", unknown: "var(--surface-3)", na: "transparent" }[state];
  const fg = state === "unknown" ? "var(--ink-3)" : state === "na" ? "var(--line-strong)" : "#fff";
  return (
    <span style={{ display: "inline-grid", placeItems: "center", width: sz, height: sz, borderRadius: mini ? 4 : 6,
      background: state === "na" ? "transparent" : bg, color: fg, border: state === "na" ? "1px dashed var(--line-strong)" : "none",
      fontSize: mini ? 10 : 13, fontWeight: 800 }}>{m.mark}</span>
  );
}

/* ---------------- C04-06 OTA 배포 진행 모니터 (실시간) ---------------- */
function OtaMonitor({ density }) {
  const R = window.RC;
  const stages = R.deployStages; // 6 stages
  const [targets, setTargets] = useState(() => R.deployTargets.map(t => ({ ...t, cur: t.stage, status: t.stage >= 5 ? "success" : t.fail && t.stage === 0 ? "wait" : "active" })));
  const [running, setRunning] = useState(true);
  const [log, setLog] = useState([{ t: nowStr(), msg: "rollout started — FW-CAM-2.4.2 · canary group", sev: "info" }]);
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTargets(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!running) return t;
          if (t.fail && t.cur === 1) { // fails during download
            if (t.status !== "failed") { changed = true; setLog(l => [...l, { t: nowStr(), msg: `✕ ${t.id} download failed — retry pending`, sev: "fail" }]); }
            return { ...t, status: "failed" };
          }
          if (t.status === "success" || t.status === "failed" || t.status === "wait") return t;
          if (t.cur < 5 && Math.random() > 0.4) {
            const nc = t.cur + 1; changed = true;
            const done = nc >= 5;
            setLog(l => [...l, { t: nowStr(), msg: `${done ? "✓" : "▸"} ${t.id} → ${stages[nc]}`, sev: done ? "pass" : "info" }]);
            return { ...t, cur: nc, status: done ? "success" : (t.fail ? "active" : "active") };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 900);
    return () => clearInterval(iv);
  }, [running]);

  // start the failing target's download after a beat
  useEffect(() => {
    const to = setTimeout(() => setTargets(prev => prev.map(t => t.fail && t.status === "wait" ? { ...t, cur: 1, status: "active" } : t)), 1500);
    return () => clearTimeout(to);
  }, []);

  const total = targets.length;
  const succ = targets.filter(t => t.status === "success").length;
  const fail = targets.filter(t => t.status === "failed").length;
  const overall = Math.round(targets.reduce((a, t) => a + t.cur, 0) / (total * 5) * 100);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>OTA rollout monitor</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>FW-CAM-2.4.2</span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>staged rollout · canary → wave-1 → wave-2 · auto-incident on failure</div>
        </div>
        <Stat3 label="ok" value={succ} sev="normal" />
        <Stat3 label="fail" value={fail} sev={fail ? "critical" : "disabled"} />
        <Stat3 label="targets" value={total} />
        <button className="btn sm" onClick={() => setRunning(r => !r)}><Icon name={running ? "pause" : "play"} size={14} /> {running ? "Pause" : "Resume"}</button>
        <button className="btn danger sm"><Icon name="rollback" size={14} /> Rollback</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: overall + "%", height: "100%", background: fail ? "var(--st-warning)" : "var(--brand)", transition: "width .5s" }} />
        </div>
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", width: 38 }}>{overall}%</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)" }}>
        {/* targets */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Target robots" sub={`${total} · staged`} dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            {targets.map(t => (
              <div key={t.id} style={{ padding: "11px 14px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <Icon name="robot" size={15} style={{ color: "var(--ink-3)" }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{t.id}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", padding: "1px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 3 }}>{t.group}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.gh}</span>
                  <div style={{ flex: 1 }} />
                  {t.status === "success" && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-normal)" }}>done</span>}
                  {t.status === "failed" && <StatusBadge sev="critical" label="fail" />}
                  {t.status === "active" && <span className="live-pulse mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-notice)" }}>{stages[t.cur]}…</span>}
                  {t.status === "wait" && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>wait</span>}
                  {t.status === "failed" && <button className="btn ghost sm" style={{ marginLeft: 6 }}><Icon name="refresh" size={13} /></button>}
                </div>
                {/* stage stepper */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {stages.map((s, si) => {
                    const reached = t.cur >= si;
                    const failedHere = t.status === "failed" && si === 1;
                    return (
                      <React.Fragment key={si}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: si === 0 ? "none" : 1 }}>
                          {si > 0 && <div style={{ position: "absolute" }} />}
                        </div>
                        {si > 0 && <div style={{ flex: 1, height: 3, borderRadius: 2, background: reached ? (failedHere ? "var(--st-critical)" : "var(--brand)") : "var(--surface-3)" }} />}
                        <span title={s} style={{ width: 9, height: 9, borderRadius: "50%", flex: "none",
                          background: failedHere ? "var(--st-critical)" : reached ? "var(--brand)" : "var(--surface-3)",
                          border: reached ? "none" : "1.5px solid var(--line-strong)" }} />
                      </React.Fragment>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {stages.map((s, si) => <span key={si} style={{ fontSize: 8.5, color: t.cur >= si ? "var(--ink-2)" : "var(--ink-3)", fontWeight: t.cur === si ? 700 : 500 }}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* event log */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1c1c1a" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}><Icon name="terminal" size={15} /> Deploy log</span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11.5, lineHeight: 1.7 }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                <span style={{ color: "#555" }}>{l.t} </span>{l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FirmwareDash, StaticAnalysis, CompatMatrix, OtaMonitor });
