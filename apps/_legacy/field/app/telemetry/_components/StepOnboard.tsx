"use client";
/* ============================================================
   Telemetry 설정 — Step 1: 장치 온보딩
   (원본: telemetry-console/screens_setup.jsx StepOnboard)
   ============================================================ */
import { Icon, type IconName } from "@station/design-system";
import { TELEMETRY } from "@station/domain";
import { TStepHead, type Step } from "./helpers";

export function StepOnboard({ step }: { step: Step }) {
  const T = TELEMETRY;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Gateway pairing</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)", flex: "none" }}>
              <Icon name="telemetry" size={48} stroke={1.4} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{T.device.id}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{T.device.model} · {T.device.power}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "var(--st-normal)", fontWeight: 700 }}>
                <Icon name="check" size={15} /> 발견됨 · 연결 완료
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Connection targets</div>
          {([["Robot", T.device.robot, "robot"], ["Site / GH", T.device.site, "node"], ["Uplink", T.device.uplink, "wifi"], ["Platform", "registered in device registry", "link"]] as [string, string, IconName][]).map(([k, v, ic], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
              <Icon name={ic} size={17} style={{ color: "var(--ink-3)" }} />
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", flex: "none", width: 90 }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{v}</span>
              <Icon name="check" size={16} style={{ color: "var(--st-normal)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
