"use client";
/* ---------------- HMI 홈 상태판 (운용) ---------------- */
import { Icon, StatusBadge, PanelHead, type IconName, type Sev } from "@station/design-system";
import { TouchBtn } from "./HmiShell";

export function HmiHome({ onReconfigure }: { onReconfigure: () => void }) {
  const mods = [
    { t: "Vision camera", id: "MOD-CAM-V01", h: "normal" },
    { t: "Manipulator", id: "MOD-ARM-A2", h: "normal" },
    { t: "Thinning end-effector", id: "MOD-EE-THIN", h: "warning" },
    { t: "Navigation", id: "MOD-NAV-N1", h: "normal" },
  ];
  const mh: Record<string, { label: string; sev: Sev }> = { normal: { label: "normal", sev: "normal" }, warning: { label: "warning", sev: "warning" } };
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
        {([["Calibration", "target"], ["Manual jog", "sliders"], ["Incident", "alert"], ["Checklist", "check"]] as const).map(([l, ic]) => (
          <button key={l} style={{ height: 72, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            <Icon name={(ic === "target" ? "node" : ic) as IconName} size={22} style={{ color: "var(--ink-2)" }} /> {l}
          </button>
        ))}
      </div>
    </div>
  );
}
