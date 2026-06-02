"use client";
/* ---------------- Step 3: 호환 버전 매칭 ---------------- */
import { useState } from "react";
import { Icon, StatusBadge, type IconName, type Sev } from "@station/design-system";
import { HMI } from "@station/domain";
import { StepHead, type Step } from "../helpers";

export function StepCompat({ step }: { step: Step }) {
  const H = HMI;
  const v = H.versions["MOD-CAM-V01"];
  const [pick, setPick] = useState<Record<string, string>>({ capability: "CAP-CAM-v3", firmware: "2.4.2", protocol: "PRT-MQTT-v2" });
  const groups = [
    { key: "capability", label: "Capability Profile", icon: "layers", items: v.capability },
    { key: "firmware", label: "Firmware version", icon: "fileCode", items: v.firmware },
    { key: "protocol", label: "Protocol profile", icon: "branch", items: v.protocol },
  ];
  const allOk = groups.every(g => { const m = H.verMeta[g.items.find(x => x.v === pick[g.key])?.state as keyof typeof H.verMeta]; return m && m.sev !== "critical"; });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: "none", padding: "12px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="node" size={17} style={{ color: "var(--ink-2)" }} />
        <span style={{ fontSize: 13.5, fontWeight: 800 }}>MOD-CAM-V01</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>OptiVision · Vision camera</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Approved versions from the registry (key scope)</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {groups.map(g => (
          <div key={g.key} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <Icon name={g.icon as IconName} size={16} style={{ color: "var(--ink-3)" }} />
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>{g.label}</span>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map(it => {
                const m = H.verMeta[it.state as keyof typeof H.verMeta];
                const on = pick[g.key] === it.v;
                const dis = it.state === "incompatible";
                return (
                  <button key={it.v} disabled={dis} onClick={() => !dis && setPick(p => ({ ...p, [g.key]: it.v }))}
                    style={{ textAlign: "left", border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)",
                      padding: 12, background: on ? "var(--surface-2)" : "var(--surface)", opacity: dis ? .5 : 1, width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{it.v}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StatusBadge sev={m.sev as Sev} label={m.label} />
                        {on && <Icon name="check" size={16} style={{ color: "var(--brand)" }} />}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{it.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: "none", padding: "12px 22px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10,
        background: allOk ? "var(--surface-2)" : "var(--tint-critical)" }}>
        <Icon name={allOk ? "check" : "alert"} size={18} style={{ color: allOk ? "var(--st-normal)" : "var(--st-critical)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: allOk ? "var(--st-normal)" : "var(--st-critical)" }}>
          {allOk ? "Selected version combo is compatible — you can continue" : "An incompatible version is selected — pick another"}
        </span>
      </div>
    </div>
  );
}
