"use client";
/* ---------------- Step 5: 관제 연결 · 등록 ---------------- */
import { useState } from "react";
import { Icon } from "@station/design-system";
import { HMI } from "@station/domain";
import { TouchBtn } from "../HmiShell";
import { StepHead, FLabel, SumRow, type Step } from "../helpers";
import type { Assigns } from "./StepDiscover";

export function StepControl({ step, assigns }: { step: Step; assigns: Assigns }) {
  const H = HMI;
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [site, setSite] = useState("GH-A");
  const [pi, setPi] = useState(0);
  const phases = ["Connect to control plane", "Dev key auth", "device registry", "Profile sync", "Registered"];

  const connect = () => {
    setPhase("running"); setPi(0);
    let i = 0;
    const iv = setInterval(() => { i++; setPi(i); if (i >= phases.length) { clearInterval(iv); setPhase("done"); } }, 600);
  };

  const mods = Object.values(assigns).length || 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* registration summary */}
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Registration summary</div>
          <SumRow k="Robot" v={<span className="mono">{H.robot.id}</span>} />
          <SumRow k="Modules" v={`${mods} identified · mapped`} />
          <SumRow k="Versions" v="CAP-CAM-v3 · fw 2.4.2 · MQTT-v2" />
          <SumRow k="Dev key" v={<span className="mono">{H.devKey.id}</span>} />
          <div>
            <FLabel>Greenhouse / zone</FLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {H.sites.map(s => (
                <button key={s.id} onClick={() => setSite(s.id)} className={"chip" + (site === s.id ? " active" : "")} style={{ height: 40, fontSize: 13 }}>{s.name}</button>
              ))}
            </div>
          </div>
        </div>

        {/* connect action */}
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Connect to control plane</div>
          {phase === "idle" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--ink-3)", textAlign: "center" }}>
              <Icon name="link" size={40} stroke={1.4} />
              <div style={{ fontSize: 12.5, maxWidth: 240, lineHeight: 1.6 }}>Register this robot in the control plane device registry using the dev key scope.</div>
              <TouchBtn primary icon="link" onClick={connect}>Connect · register</TouchBtn>
            </div>
          )}
          {phase !== "idle" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
              {phases.map((p, i) => {
                const done = pi > i, active = pi === i && phase === "running";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 4px" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                      background: done ? "var(--brand)" : "var(--surface-2)", border: active ? "2px solid var(--st-notice)" : done ? "none" : "1.5px solid var(--line-strong)", color: "#fff" }}>
                      {done && <Icon name="check" size={13} stroke={3} />}
                      {active && <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-notice)" }} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: done || active ? 700 : 600, color: done ? "var(--ink)" : active ? "var(--st-notice)" : "var(--ink-3)" }}>{p}</span>
                  </div>
                );
              })}
              {phase === "done" && (
                <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="check" size={18} style={{ color: "var(--st-normal)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--st-normal)" }}>{H.robot.id} 등록 완료 — 관제에서 모니터링 가능</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
