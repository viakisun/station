/* ============================================================
   C03-00 대시보드 / C03-01 목록·필터 / C03-05 조치 가이드
   ============================================================ */

function sevOf(i) { return window.IC.sevMeta[i.sev].sev; }
function SrcTag({ src }) {
  const m = window.IC.srcMeta[src];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 20, padding: "0 7px", borderRadius: 4,
      fontSize: 11, fontWeight: 700, color: "var(--ink-2)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <Icon name={m.icon} size={12} /> {m.label}
    </span>
  );
}

/* ---------------- C03-00 장애 운영 대시보드 ---------------- */
function IncidentDash({ onOpen, onNav, density }) {
  const IC = window.IC, k = IC.kpi;
  const queue = IC.incidents.filter(i => i.status === "open" || i.status === "ack" || i.status === "progress")
    .sort((a, b) => sevRank(b.sev) - sevRank(a.sev));
  const recurring = [...IC.incidents].filter(i => i.recur > 1).sort((a, b) => b.recur - a.recur).slice(0, 5);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="open incidents" value={k.open} sev="critical" icon="alert" onClick={() => onNav("list")} />
        <KpiCard label="critical+" value={k.critical} sev="critical" icon="flag" />
        <KpiCard label="SLA breach" value={k.slaBreach} sev={k.slaBreach ? "critical" : null} icon="clock" />
        <KpiCard label="today" value={k.today} unit="" icon="trending" />
        <KpiCard label="recurring" value={k.recurring} sev="warning" icon="refresh" />
        <KpiCard label="avg MTTR" value={k.mttr} icon="wrench" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* action queue */}
        <div className="card">
          <PanelHead title="Action queue" sub="open critical · SLA-breach first" dense={density === "compact"}
            right={<button className="btn ghost sm" onClick={() => onNav("list")}>all incidents <Icon name="ext" size={13} /></button>} />
          <div>
            {queue.map(i => (
              <button key={i.id} onClick={() => onOpen(i.id)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", border: "none", borderBottom: "1px solid var(--line)", background: "transparent" }} className="hov-row">
                <StatusBadge sev={sevOf(i)} label={IC.sevMeta[i.sev].label} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <SrcTag src={i.src} />
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{i.robot} · {i.code}</span>
                  </div>
                </div>
                {i.slaBreach && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-critical)" }}>SLA {i.sla}</span>}
                <span style={{ fontSize: 11, color: i.owner === "unassigned" ? "var(--st-critical)" : "var(--ink-3)", fontWeight: i.owner === "unassigned" ? 700 : 500, width: 60, textAlign: "right" }}>{i.owner}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 44, textAlign: "right" }}>{i.at}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* recurring rank */}
          <div className="card">
            <PanelHead title="Recurring incidents" sub="by recurrence count" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              {recurring.map((i, n) => (
                <button key={i.id} onClick={() => onOpen(i.id)} style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: 0, textAlign: "left", width: "100%" }}>
                  <span className="tnum" style={{ width: 18, fontSize: 13, fontWeight: 800, color: "var(--ink-3)" }}>{n + 1}</span>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${sevOf(i)})`, flex: "none" }} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.title}</span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--st-warning)" }}>×{i.recur}</span>
                </button>
              ))}
            </div>
          </div>
          {/* source distribution */}
          <div className="card">
            <PanelHead title="By source" sub="event origin" dense />
            <div style={{ padding: 14 }}>
              <SourceDist />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function sevRank(s) { return { emergency: 5, critical: 4, warning: 3, notice: 2, info: 1 }[s] || 0; }
function SourceDist() {
  const IC = window.IC;
  const counts = {};
  IC.incidents.forEach(i => counts[i.src] = (counts[i.src] || 0) + 1);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(e => e[1]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {entries.map(([src, n]) => {
        const m = IC.srcMeta[src];
        return (
          <div key={src} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 70, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600, flex: "none" }}><Icon name={m.icon} size={13} /> {m.label}</span>
            <div style={{ flex: 1, height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: (n / max * 100) + "%", height: "100%", background: "var(--ink)", borderRadius: 999 }} />
            </div>
            <span className="tnum" style={{ width: 20, textAlign: "right", fontSize: 12, fontWeight: 700 }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- C03-01 Incidents · 필터 ---------------- */
function IncidentList({ onOpen, density }) {
  const IC = window.IC;
  const [sev, setSev] = useState("all");
  const [status, setStatus] = useState("all");
  const [src, setSrc] = useState("all");
  const rows = IC.incidents.filter(i =>
    (sev === "all" || i.sev === sev) && (status === "all" || i.status === status) && (src === "all" || i.src === src));

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FilterGroup label="Severity" value={sev} set={setSev} opts={[["all", "all"], ["emergency", "emergency"], ["critical", "critical"], ["warning", "warning"], ["notice", "notice"]]} />
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup label="Status" value={status} set={setStatus} opts={[["all", "all"], ["open", "open"], ["progress", "in progress"], ["resolved", "resolved"]]} />
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup label="Source" value={src} set={setSrc} opts={[["all", "all"], ["robot", "robot"], ["firmware", "firmware"], ["hmi", "HMI"], ["telemetry", "Telemetry"]]} />
        <div style={{ flex: 1 }} />
        <button className="btn sm"><Icon name="dl" size={14} /> CSV</button>
      </div>
      <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left", position: "sticky", top: 0 }}>
            {["Incident ID", "Severity", "Status", "Source", "Robot / module", "Cause", "Owner", "SLA", "Opened"].map((h, i) =>
              <th key={i} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(i => (
              <tr key={i.id} onClick={() => onOpen(i.id)} className="hov-row" style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <td style={{ padding: "10px 12px" }}><span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{i.id}</span><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{i.title}</div></td>
                <td style={{ padding: "10px 12px" }}><StatusBadge sev={sevOf(i)} label={IC.sevMeta[i.sev].label} /></td>
                <td style={{ padding: "10px 12px" }}><StatusBadge sev={IC.statusMeta[i.status].sev} label={IC.statusMeta[i.status].label} dot={false} /></td>
                <td style={{ padding: "10px 12px" }}><SrcTag src={i.src} /></td>
                <td style={{ padding: "10px 12px" }}><span className="mono" style={{ fontSize: 11 }}>{i.robot}</span><div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{i.module}</div></td>
                <td style={{ padding: "10px 12px", color: "var(--ink-2)" }}>{i.cause}</td>
                <td style={{ padding: "10px 12px", color: i.owner === "unassigned" ? "var(--st-critical)" : "var(--ink-2)", fontWeight: i.owner === "unassigned" ? 700 : 500 }}>{i.owner}</td>
                <td style={{ padding: "10px 12px" }}>{i.slaBreach ? <span style={{ color: "var(--st-critical)", fontWeight: 700 }} className="mono">{i.sla}</span> : <span className="mono" style={{ color: "var(--ink-3)" }}>{i.sla}</span>}</td>
                <td style={{ padding: "10px 12px" }}><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{i.at}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function FilterGroup({ label, value, set, opts }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700 }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {opts.map(([v, l]) => <button key={v} onClick={() => set(v)} className={"chip" + (value === v ? " active" : "")} style={{ height: 28 }}>{l}</button>)}
      </div>
    </div>
  );
}

/* ---------------- C03-05 조치 가이드 ---------------- */
function ActionGuideScreen({ incidentId, onBack, onNav, density }) {
  const IC = window.IC;
  const g = IC.actionGuide;
  const inc = IC.incidents.find(i => i.id === incidentId) || IC.incidents.find(i => i.id === g.incident);
  const [done, setDone] = useState(() => g.steps.map(s => s.done));
  const doneN = done.filter(Boolean).length;

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={onBack}><Icon name="chevL" size={15} /> Incident detail</button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{inc.id}</span>
        <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title={g.title} sub={`${doneN}/${g.steps.length} steps done`} dense />
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--tint-warning)", display: "flex", gap: 9, alignItems: "flex-start" }}>
            <Icon name="shield" size={16} style={{ color: "var(--st-warning)", flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#7a5a06", fontWeight: 600, lineHeight: 1.5 }}>{g.safety}</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
            {g.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderBottom: "1px solid var(--line)" }}>
                <button onClick={() => setDone(d => d.map((x, j) => j === i ? !x : x))} style={{ width: 24, height: 24, borderRadius: 6, flex: "none", display: "grid", placeItems: "center",
                  border: done[i] ? "none" : "1.5px solid var(--line-strong)", background: done[i] ? "var(--brand)" : "var(--surface)", color: "#fff", cursor: "pointer" }}>
                  {done[i] && <Icon name="check" size={14} stroke={3} />}
                </button>
                <span style={{ flex: 1, fontSize: 13, fontWeight: done[i] ? 500 : 600, color: done[i] ? "var(--ink-3)" : "var(--ink)", textDecoration: done[i] ? "line-through" : "none" }}>{s.s}</span>
                {s.hmi && <button className="btn ghost sm" onClick={() => onNav && onNav("hmi")}><Icon name="hmi" size={13} /> HMI</button>}
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1 }}><Icon name="dot" size={15} /> Attach photo · note</button>
            <button className="btn primary" style={{ flex: 1 }} disabled={doneN < g.steps.length}><Icon name="check" size={15} /> Submit remediation</button>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Linked info</div>
          <KV3 pairs={[["Incident", <span className="mono">{inc.id}</span>], ["robot", <span className="mono">{inc.robot}</span>], ["Module", <span className="mono">{inc.module}</span>], ["Cause class", inc.cause], ["Work session", inc.session ? <span className="mono">{inc.session}</span> : "—"]]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button className="btn" style={{ width: "100%" }} onClick={() => onNav && onNav("telemetry")}><Icon name="telemetry" size={15} /> Test Telemetry channel</button>
            <button className="btn" style={{ width: "100%" }} onClick={() => onNav && onNav("hmi")}><Icon name="hmi" size={15} /> Open HMI calibration</button>
          </div>
          <div style={{ marginTop: "auto", padding: "10px 12px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 11.5, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} /> Owner, time & rationale recorded to audit_log.
          </div>
        </div>
      </div>
    </div>
  );
}
function KV3({ pairs }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p[0]}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p[1]}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { IncidentDash, IncidentList, ActionGuideScreen, SrcTag, sevOf, sevRank, FilterGroup });
