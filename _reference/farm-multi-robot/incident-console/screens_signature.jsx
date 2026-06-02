/* ============================================================
   C03-02 실시간 events 스트림 / C03-03 장애 상세+통합 타임라인 / C03-08 리포트
   ============================================================ */

/* ---------------- C03-02 실시간 events 스트림 (시그니처) ---------------- */
function EventStream({ onOpen, density }) {
  const IC = window.IC;
  const [events, setEvents] = useState(IC.streamSeed);
  const [paused, setPaused] = useState(false);
  const [sevF, setSevF] = useState("all");
  const [sel, setSel] = useState(null);
  const ptr = useRef(0);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const seed = IC.streamIncoming[ptr.current % IC.streamIncoming.length]; ptr.current++;
      const e = { ...seed, t: new Date().toTimeString().slice(0, 8), promoted: seed.sev === "critical" ? "INC-new" : null, _new: true };
      setEvents(prev => [e, ...prev].slice(0, 40));
    }, 2200);
    return () => clearInterval(iv);
  }, [paused]);

  const shown = events.filter(e => sevF === "all" || e.sev === sevF || (sevF === "warn+" && sevRank(e.sev) >= 3));

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className={"btn sm " + (paused ? "" : "primary")} onClick={() => setPaused(p => !p)}>
          <Icon name={paused ? "play" : "pause"} size={14} /> {paused ? "Resume" : "Pause"}
        </button>
        {!paused && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--st-normal)" }}><span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-live)" }} /> receiving</span>}
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup label="Severity" value={sevF} set={setSevF} opts={[["all", "all"], ["warn+", "warn+"], ["critical", "critical"], ["emergency", "emergency"]]} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{shown.length} events · dedup active</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: sel ? "1fr 380px" : "1fr", gap: "var(--gap)" }}>
        <div className="card" style={{ minHeight: 0, overflow: "auto" }}>
          {shown.map((e, i) => {
            const m = IC.sevMeta[e.sev], sm = IC.srcMeta[e.src];
            const on = sel && sel._k === (e.t + e.code + i);
            return (
              <button key={e.t + e.code + i} onClick={() => setSel({ ...e, _k: e.t + e.code + i })} className="hov-row"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, padding: "9px 14px",
                  border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                  background: on ? "var(--surface-2)" : (e._new ? "var(--surface-2)" : "transparent") }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 60, flex: "none" }}>{e.t}</span>
                <StatusBadge sev={m.sev} label={m.label} />
                <SrcTag src={e.src} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 130, flex: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.node}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.msg}</span>
                {e.promoted && <span className="badge critical" style={{ flex: "none" }}><Icon name="flag" size={11} /> promoted</span>}
              </button>
            );
          })}
        </div>

        {sel && (
          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PanelHead title="Event detail" sub={sel.code} dense right={<button className="icon-btn" onClick={() => setSel(null)}><Icon name="close" size={17} /></button>} />
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge sev={IC.sevMeta[sel.sev].sev} label={IC.sevMeta[sel.sev].label} />
                <SrcTag src={sel.src} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{sel.t}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{sel.msg}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>raw payload</div>
                <div style={{ background: "#1c1c1a", borderRadius: 8, padding: 12 }}>
                  <pre className="mono" style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "#ddd", whiteSpace: "pre-wrap" }}>{rawPayload(sel)}</pre>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" style={{ flex: 1 }}><Icon name="dot" size={14} /> Copy</button>
                <button className="btn danger" style={{ flex: 1 }} onClick={() => onOpen && onOpen("INC-20260601-0229")}><Icon name="alert" size={14} /> Create incident</button>
              </div>
              {sel.promoted && <div style={{ padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--tint-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, color: "var(--st-critical)", fontWeight: 600 }}>Auto-promoted to an incident by an incident rule.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function rawPayload(e) {
  return `{\n  "event_code": "${e.code}",\n  "severity": "${e.sev}",\n  "source": "${e.src}",\n  "source_id": "${e.node}",\n  "occurred_at": "2026-06-01T${e.t}",\n  "payload": { "value": ${(Math.random() * 100).toFixed(1)}, "unit": "raw" }\n}`;
}

/* ---------------- C03-03 장애 상세 + Unified root-cause timeline (시그니처) ---------------- */
function IncidentDetail({ incidentId, onBack, onAction, onNav, density }) {
  const IC = window.IC;
  const inc = IC.incidents.find(i => i.id === incidentId) || IC.incidents[1];
  const [cause, setCause] = useState(inc.cause);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevL" size={15} /> Incidents</button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{inc.id}</span>
      </div>

      {/* summary header */}
      <div className="card" style={{ padding: "var(--pad-card)", display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
            <StatusBadge sev={IC.statusMeta[inc.status].sev} label={IC.statusMeta[inc.status].label} dot={false} />
            <SrcTag src={inc.src} />
            <span style={{ fontSize: 16, fontWeight: 800 }}>{inc.title}</span>
            {inc.recur > 1 && <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--st-warning)" }}>recurs x{inc.recur}</span>}
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 12, color: "var(--ink-2)" }}>
            <span>robot <b className="mono">{inc.robot}</b></span>
            <span>Module <b className="mono">{inc.module}</b></span>
            <span>Code <b className="mono">{inc.code}</b></span>
            <span>Impact <b>{inc.impact}</b></span>
            <span>Owner <b style={{ color: inc.owner === "unassigned" ? "var(--st-critical)" : "var(--ink)" }}>{inc.owner}</b></span>
          </div>
        </div>
        <button className="btn" onClick={() => onNav && onNav("telemetry")}><Icon name="dl" size={15} /> Logs</button>
        <button className="btn primary" onClick={() => onAction(inc.id)}><Icon name="wrench" size={15} /> Start remediation</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* unified timeline */}
        <div className="card">
          <PanelHead title="Unified root-cause timeline" sub="work · command · telemetry · HMI · firmware unified" dense />
          <div style={{ padding: "16px 18px" }}>
            {IC.timeline.map((ev, i) => {
              const lm = IC.laneMeta[ev.lane], m = IC.sevMeta[ev.sev];
              const last = i === IC.timeline.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 13 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, flex: "none", display: "grid", placeItems: "center",
                      background: m.sev === "critical" || m.sev === "emergency" ? `var(--st-${m.sev})` : "var(--surface-2)",
                      border: m.sev === "critical" || m.sev === "emergency" ? "none" : "1px solid var(--line)",
                      color: m.sev === "critical" || m.sev === "emergency" ? "#fff" : "var(--ink-2)" }}>
                      <Icon name={lm.icon} size={15} />
                    </span>
                    {!last && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 3, minHeight: 22 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{ev.t}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", padding: "1px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 3 }}>{lm.label}</span>
                      {(m.sev === "critical" || m.sev === "warning" || m.sev === "emergency") && <span style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--st-${m.sev})` }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, color: m.sev === "critical" || m.sev === "emergency" ? "var(--st-critical)" : "var(--ink)" }}>{ev.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{ev.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* cause + related */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="Cause classification" sub="root cause taxonomy" dense />
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {IC.causeTax.map(c => <button key={c} onClick={() => setCause(c)} className={"chip" + (cause === c ? " active" : "")} style={{ height: 30 }}>{c}</button>)}
              </div>
              <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, color: "var(--ink-2)" }}>
                selected cause <b style={{ color: "var(--ink)" }}>{cause}</b> · linked to {inc.recur} similar incidents
              </div>
            </div>
          </div>
          <div className="card">
            <PanelHead title="Linked objects" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <RelCard icon="robot" k="robot" v={inc.robot} onNav={() => onNav && onNav("control")} />
              <RelCard icon="chip" k="Module / firmware" v={inc.module} onNav={() => onNav && onNav("firmware")} />
              {inc.session && <RelCard icon="board" k="Work session" v={inc.session} onNav={() => onNav && onNav("control")} />}
              <RelCard icon="telemetry" k="Telemetry" v="Open quality diag" onNav={() => onNav && onNav("telemetry")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function RelCard({ icon, k, v, onNav }) {
  return (
    <button onClick={onNav} style={{ display: "flex", alignItems: "center", gap: 11, padding: 11, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)", textAlign: "left", width: "100%" }}>
      <Icon name={icon} size={17} style={{ color: "var(--ink-3)", flex: "none" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{k}</div>
        <div className="mono" style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div>
      </div>
      <Icon name="ext" size={14} style={{ color: "var(--ink-3)", flex: "none" }} />
    </button>
  );
}

/* ---------------- C03-08 장애 리포트 · 분석 ---------------- */
function ReportScreen({ density }) {
  const IC = window.IC, r = IC.report;
  const maxP = Math.max(...r.pareto.map(p => p.n));
  const maxT = Math.max(...r.trend);
  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {["Last 7d", "30d", "Quarter"].map((p, i) => <button key={p} className={"chip" + (i === 0 ? " active" : "")} style={{ height: 30 }}>{p}</button>)}
        <div style={{ flex: 1 }} />
        <button className="btn sm"><Icon name="dl" size={14} /> PDF report</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="avg MTTR" value={r.mttr} icon="wrench" />
        <KpiCard label="avg MTBF" value={r.mtbf} icon="clock" />
        <KpiCard label="total" value={r.total} unit="" icon="alert" />
        <KpiCard label="resolved" value={r.resolved} unit="" icon="check" />
        <KpiCard label="recur rate" value={r.recurRate} unit="%" sev="warning" icon="refresh" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}>
        <div className="card">
          <PanelHead title="Incident trend" sub="daily count" dense />
          <div style={{ padding: "20px 18px", display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {r.trend.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span className="tnum" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-2)" }}>{v}</span>
                <div style={{ width: "100%", height: (v / maxT * 130), background: "var(--ink)", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                <span style={{ fontSize: 10, color: "var(--ink-3)" }}>D-{r.trend.length - 1 - i}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <PanelHead title="Incidents by module (Pareto)" sub="top sources" dense />
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
            {r.pareto.map(p => (
              <div key={p.m} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span className="mono" style={{ width: 120, fontSize: 11.5, fontWeight: 700, flex: "none" }}>{p.m}</span>
                <div style={{ flex: 1, height: 18, background: "var(--surface-3)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: (p.n / maxP * 100) + "%", height: "100%", background: `var(--st-${p.sev})`, borderRadius: 5, opacity: .85 }} />
                </div>
                <span className="tnum" style={{ width: 24, textAlign: "right", fontSize: 12.5, fontWeight: 800 }}>{p.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EventStream, IncidentDetail, ReportScreen });
