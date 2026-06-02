/* ============================================================
   Telemetry 설정 — 센서 캘리브레이션 / 샘플링·임계값 정책
   ============================================================ */

/* ---------------- Step 3: 센서 캘리브레이션 ---------------- */
function SensorCalib({ step }) {
  const T = window.TM;
  const [sel, setSel] = useState(T.calibrations[0].ch);
  const [vals, setVals] = useState(() => {
    const v = {}; T.calibrations.forEach(c => v[c.ch] = { offset: c.offset, scale: c.scale }); return v;
  });
  const cur = T.calibrations.find(c => c.ch === sel);
  const v = vals[sel];
  const calc = (cur.raw + v.offset) * v.scale;

  const set = (k, d) => setVals(s => ({ ...s, [sel]: { ...s[sel], [k]: +(s[sel][k] + d).toFixed(3) } }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* channel list */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", fontSize: 12.5, fontWeight: 800 }}>Calibration targets</div>
          <div style={{ overflow: "auto" }}>
            {T.calibrations.map(c => {
              const on = sel === c.ch;
              return (
                <button key={c.ch} onClick={() => setSel(c.ch)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  padding: "13px 14px", border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                  background: on ? "var(--surface-2)" : "transparent" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{c.ch}</div>
                  </div>
                  {c.due ? <StatusBadge sev="warning" label="expired" /> : <StatusBadge sev="normal" label="valid" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* calibration form */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <PanelHead title={cur.label + " calibration"} sub={cur.ch} dense />
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
            {/* live reading */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "center" }}>
              <Reading label="raw" val={cur.raw} faded />
              <Icon name="arrowRight2" size={22} style={{ color: "var(--ink-3)" }} />
              <Reading label="calibrated" val={+calc.toFixed(2)} brand />
            </div>
            {/* offset / scale steppers */}
            <Stepper label="Offset" value={v.offset} unit="" onMinus={() => set("offset", -0.1)} onPlus={() => set("offset", 0.1)} />
            <Stepper label="Scale" value={v.scale} unit="×" onMinus={() => set("scale", -0.01)} onPlus={() => set("scale", 0.01)} />
            <div style={{ display: "flex", gap: 12 }}>
              <PStat label="Zero" v={cur.zero} />
              <PStat label="Span" v={cur.span} />
              <PStat label="Last cal" v={cur.due ? "expired" : "ok"} warn={cur.due} />
            </div>
          </div>
          <div style={{ marginTop: "auto", padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 10 }}>
            <TouchBtn ghost icon="rollback" style={{ height: 48, fontSize: 13.5 }} onClick={() => setVals(s => ({ ...s, [sel]: { offset: cur.offset, scale: cur.scale } }))}>Revert</TouchBtn>
            <div style={{ flex: 1 }} />
            <TouchBtn primary icon="check" style={{ height: 48, fontSize: 13.5 }}>Apply · save snapshot</TouchBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
function Reading({ label, val, faded, brand }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 30, fontWeight: 800, color: brand ? "var(--brand)" : faded ? "var(--ink-3)" : "var(--ink)" }}>{val}</div>
    </div>
  );
}
function Stepper({ label, value, unit, onMinus, onPlus }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 70, fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>{label}</span>
      <button className="btn" onClick={onMinus} style={{ width: 52, height: 48, fontSize: 22, padding: 0 }}>−</button>
      <div className="tnum mono" style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: 800, padding: "12px 0", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8 }}>
        {value > 0 && unit !== "×" ? "+" : ""}{value}{unit}
      </div>
      <button className="btn" onClick={onPlus} style={{ width: 52, height: 48, fontSize: 22, padding: 0 }}>+</button>
    </div>
  );
}
function PStat({ label, v, warn }) {
  return (
    <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 800, color: warn ? "var(--st-warning)" : "var(--ink)" }}>{v}</div>
    </div>
  );
}

/* ---------------- Step 4: 샘플링 · 임계값 정책 ---------------- */
function SamplingPolicy({ step }) {
  const T = window.TM;
  const [promote, setPromote] = useState(() => { const p = {}; T.policies.forEach(x => p[x.ch] = x.promote); return p; });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 18 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
              {["Channel", "Rate", "warning", "critical", "Smoothing", "Promote"].map((h, i) =>
                <th key={i} style={{ padding: "11px 14px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {T.policies.map(p => {
                const ch = T.channels.find(c => c.id === p.ch);
                return (
                  <tr key={p.ch} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Icon name={ch?.icon || "activity"} size={16} style={{ color: "var(--ink-3)" }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{ch?.label}</div>
                          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.ch}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span className="mono" style={{ fontSize: 12.5, padding: "3px 9px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 5, fontWeight: 700 }}>{p.rate}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-warning)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-warning)" }} />{p.warn}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-critical)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-critical)" }} />{p.crit}</span></td>
                    <td style={{ padding: "12px 14px", color: "var(--ink-2)" }}>{p.smooth}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => setPromote(s => ({ ...s, [p.ch]: !s[p.ch] }))} style={{ width: 46, height: 26, borderRadius: 999, border: "none", padding: 3, cursor: "pointer",
                        background: promote[p.ch] ? "var(--brand)" : "var(--surface-3)", display: "flex", justifyContent: promote[p.ch] ? "flex-end" : "flex-start", transition: "all .15s" }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-2)" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--ink-2)" }}>
          <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} />
          When a threshold is exceeded, channels with promotion on are forwarded to the incident console (C03) with their event_code.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SensorCalib, SamplingPolicy });
