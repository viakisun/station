/* ============================================================
   Telemetry 운영 — 개요 대시보드 + 데이터 품질 진단
   ============================================================ */

function MonitorView() {
  const T = window.TM;
  const [tab, setTab] = useState("overview");
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "none", display: "flex", gap: 4, padding: "10px 18px 0", borderBottom: "1px solid var(--line)" }}>
        {[["overview", "Overview"], ["quality", "Data quality"]].map(([k, l]) => {
          const on = tab === k;
          return <button key={k} onClick={() => setTab(k)} style={{ padding: "9px 14px", border: "none", background: "transparent", fontSize: 13.5,
            fontWeight: on ? 700 : 600, color: on ? "var(--ink)" : "var(--ink-3)", borderBottom: "2px solid " + (on ? "var(--ink)" : "transparent"), marginBottom: -1 }}>{l}</button>;
        })}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {tab === "overview" ? <Overview /> : <QualityDiag />}
      </div>
    </div>
  );
}

/* ---------------- 개요 대시보드 ---------------- */
function Overview() {
  const T = window.TM, k = T.kpi;
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 1600); return () => clearInterval(t); }, []);
  const lat = k.latency + (tick % 3) * 6;

  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
        <KpiCard label="Std channels" value={k.channelsTotal} sub={`mapped ${k.channelsMapped}`} icon="layers" />
        <KpiCard label="Data quality" value={k.quality} unit="%" icon="check" />
        <KpiCard label="Avg latency" value={lat} unit="ms" icon="activity" />
        <KpiCard label="Edge buffer" value={k.buffer} unit="%" icon="database" />
        <KpiCard label="Sync" value="live" icon="waves" />
        <KpiCard label="Devices online" value={k.devicesOnline} icon="telemetry" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, alignItems: "start" }}>
        <div className="card">
          <PanelHead title="Channel quality" sub={`${T.quality.length} active channels`} dense
            right={<span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", fontWeight: 700 }}><span className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-live)" }} /> LIVE</span>} />
          <div>
            {T.quality.map(q => {
              const m = T.qualityMeta[q.q];
              return (
                <div key={q.ch} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ width: 130, flex: "none" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{q.label}</div>
                    <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{q.ch}</div>
                  </div>
                  <Sparkline data={q.series} w={120} h={28} color={q.q === "bad" ? "var(--st-critical)" : q.q === "warn" ? "var(--st-warning)" : "var(--brand)"} />
                  <div style={{ flex: 1 }} />
                  <span className="tnum" style={{ fontSize: 11.5, color: "var(--ink-3)", width: 70, textAlign: "right" }}>{q.latency}ms</span>
                  <StatusBadge sev={m.sev} label={m.label} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 12 }}>Edge buffer / sync</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Donut pct={k.buffer} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <Row k="Buffer use" v={k.buffer + "%"} />
                <Row k="Retry queue" v="0 packets" />
                <Row k="Sync state" v={<span style={{ color: "var(--st-normal)", fontWeight: 700 }}>live</span>} />
              </div>
            </div>
          </div>
          <div className="card">
            <PanelHead title="Recent events" dense />
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {[["08:50", "warning", "TCH-gh-humidity nearing threshold 74%"], ["08:44", "info", "TCH-arm-joint-temp calibration applied"], ["08:38", "warning", "TCH-cam-fps data gap 12%"]].map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 11.5 }}>
                  <span className="mono" style={{ color: "var(--ink-3)", width: 40 }}>{e[0]}</span>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${T.qualityMeta[e[1] === "warning" ? "warn" : "good"].sev})`, flex: "none" }} />
                  <span style={{ flex: 1 }}>{e[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "var(--ink-3)" }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>;
}
function Donut({ pct }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <div style={{ position: "relative", width: 68, height: 68, flex: "none" }}>
      <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="7" />
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--brand)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ---------------- 데이터 품질 진단 ---------------- */
function QualityDiag() {
  const T = window.TM;
  const [sel, setSel] = useState(T.quality.find(q => q.q === "bad")?.ch || T.quality[0].ch);
  const cur = T.quality.find(q => q.ch === sel);
  const m = T.qualityMeta[cur.q];
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 1400); return () => clearInterval(t); }, []);
  // live-ish series for selected (append wobble)
  const liveSeries = cur.series.map((v, i) => v + (cur.q === "bad" && i === cur.series.length - 1 ? Math.sin(tick) * 6 : 0));

  return (
    <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, height: "100%", minHeight: 0 }}>
      {/* channel list */}
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <PanelHead title="Channel diagnostics" sub="gaps · latency · outliers · drift" dense />
        <div style={{ flex: 1, overflow: "auto" }}>
          {T.quality.map(q => {
            const qm = T.qualityMeta[q.q], on = sel === q.ch;
            return (
              <button key={q.ch} onClick={() => setSel(q.ch)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11,
                padding: "11px 14px", border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                background: on ? "var(--surface-2)" : "transparent" }}>
                <div style={{ width: 120, flex: "none" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{q.label}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{q.ch}</div>
                </div>
                <Sparkline data={q.series} w={90} h={26} color={q.q === "bad" ? "var(--st-critical)" : q.q === "warn" ? "var(--st-warning)" : "var(--brand)"} />
                <div style={{ flex: 1 }} />
                <StatusBadge sev={qm.sev} label={qm.label} />
              </button>
            );
          })}
        </div>
      </div>

      {/* detail */}
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <PanelHead title={cur.label + " diagnostics"} sub={cur.ch} dense
          right={cur.q === "bad" && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--st-critical)", fontWeight: 700 }}>● anomaly</span>} />
        <div style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge sev={m.sev} label={m.label} />
            <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{cur.q === "bad" ? "frame drop + latency together — inspect module" : cur.q === "warn" ? "outliers / drift observed — calibration recommended" : "within normal range"}</span>
          </div>
          <div style={{ background: "#1c1c1a", borderRadius: 8, padding: 14 }}>
            <Sparkline data={liveSeries} w={420} h={90} color={cur.q === "bad" ? "#ff8a6a" : cur.q === "warn" ? "#e6b800" : "var(--brand-live)"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            <Metric label="Completeness" v={cur.complete + "%"} warn={cur.complete < 96} />
            <Metric label="Latency" v={cur.latency + "ms"} warn={cur.latency > 300} />
            <Metric label="Outliers" v={cur.outliers + ""} warn={cur.outliers > 4} />
            <Metric label="Sensor drift" v={cur.drift} warn={cur.drift !== "—" && parseFloat(cur.drift) > 1.5} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <TouchBtn ghost icon="sliders" style={{ height: 46, fontSize: 13 }}>Calibrate</TouchBtn>
            <TouchBtn ghost icon="alert" style={{ height: 46, fontSize: 13 }}>Create incident</TouchBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, v, warn }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 8, background: warn ? "var(--tint-warning)" : "var(--surface-2)", border: "1px solid " + (warn ? "#efe3c6" : "var(--line)") }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: warn ? "var(--st-warning)" : "var(--ink)" }}>{v}</div>
    </div>
  );
}

Object.assign(window, { MonitorView });
