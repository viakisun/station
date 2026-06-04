"use client";
/* ============================================================
   Telemetry 설정 — Step 3: 센서 캘리브레이션
   (원본: telemetry-console/screens_setup2.jsx SensorCalib)
   ============================================================ */
import { useState, type ReactNode } from "react";
import { Icon, StatusBadge, PanelHead } from "@station/design-system";
import { TELEMETRY } from "@station/domain";
import { TStepHead, TouchBtn, type Step } from "./helpers";

export function SensorCalib({ step }: { step: Step }) {
  const T = TELEMETRY;
  const [sel, setSel] = useState(T.calibrations[0].ch);
  const [vals, setVals] = useState<Record<string, { offset: number; scale: number }>>(() => {
    const v: Record<string, { offset: number; scale: number }> = {};
    T.calibrations.forEach((c) => (v[c.ch] = { offset: c.offset, scale: c.scale }));
    return v;
  });
  const cur = T.calibrations.find((c) => c.ch === sel)!;
  const v = vals[sel];
  const calc = (cur.raw + v.offset) * v.scale;

  const set = (k: "offset" | "scale", d: number) => setVals((s) => ({ ...s, [sel]: { ...s[sel], [k]: +(s[sel][k] + d).toFixed(3) } }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* channel list */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", fontSize: 12.5, fontWeight: 800 }}>Calibration targets</div>
          <div style={{ overflow: "auto" }}>
            {T.calibrations.map((c) => {
              const on = sel === c.ch;
              return (
                <button key={c.ch} onClick={() => setSel(c.ch)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", border: "none", borderBottom: "1px solid var(--line)", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent", background: on ? "var(--surface-2)" : "transparent" }}>
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
            <TouchBtn ghost icon="rollback" style={{ height: 48, fontSize: 13.5 }} onClick={() => setVals((s) => ({ ...s, [sel]: { offset: cur.offset, scale: cur.scale } }))}>Revert</TouchBtn>
            <div style={{ flex: 1 }} />
            <TouchBtn primary icon="check" style={{ height: 48, fontSize: 13.5 }}>Apply · save snapshot</TouchBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
function Reading({ label, val, faded, brand }: { label: string; val: ReactNode; faded?: boolean; brand?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 30, fontWeight: 800, color: brand ? "var(--brand)" : faded ? "var(--ink-3)" : "var(--ink)" }}>{val}</div>
    </div>
  );
}
function Stepper({ label, value, unit, onMinus, onPlus }: { label: string; value: number; unit: string; onMinus: () => void; onPlus: () => void }) {
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
function PStat({ label, v, warn }: { label: string; v: ReactNode; warn?: boolean }) {
  return (
    <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 800, color: warn ? "var(--st-warning)" : "var(--ink)" }}>{v}</div>
    </div>
  );
}
