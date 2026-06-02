"use client";
/* ---------------- Step 1: 연결 · 인증 ---------------- */
import { Icon, StatusBadge } from "@station/design-system";
import { HMI } from "@station/domain";
import { TouchBtn } from "../HmiShell";
import { StepHead, type Step } from "../helpers";

export function StepConnect({ step }: { step: Step }) {
  const H = HMI;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* pairing */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Robot pairing</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 110, height: 110, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)", flex: "none" }}>
              <Icon name="qr" size={56} stroke={1.4} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>Pairing code</div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "3px" }}>74 12 9F</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "var(--st-normal)", fontWeight: 700 }}>
                <Icon name="check" size={15} /> {H.robot.id} 연결됨
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>Network</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--st-normal)" }}><Icon name="wifi" size={15} /> good · edge-gw.local</span>
          </div>
        </div>

        {/* dev key */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Dev key auth</div>
          <div style={{ padding: 14, borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 16, fontWeight: 800 }}>{H.devKey.id}</span>
              <StatusBadge sev="normal" label="valid" />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
              발급: {H.devKey.issuer} · {H.devKey.issued}<br />
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>scope: {H.devKey.scope}</span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.6 }}>
            This key verifies access to the approved module registry and device registration on the control plane. Since this isn't plug & play, you then identify and select modules yourself.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <TouchBtn ghost icon="refresh" style={{ height: 48, fontSize: 13.5 }}>Re-verify key</TouchBtn>
            <TouchBtn ghost icon="key" style={{ height: 48, fontSize: 13.5 }}>Enter another key</TouchBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
