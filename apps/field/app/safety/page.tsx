"use client";
// [SWS-FIELD-SAFETY / SWC-PRODUCT-FIELD] Field Safety — E-stop·인터록 (on-robot ③, 물리 ① 최상위).
import { SurfaceHeader, useScope } from "@station/app-kit";
import { HoldButton, Icon, StatusBadge } from "@station/design-system";

const INTERLOCKS = [
  { label: "물리 E-stop 회로", state: "armed", sev: "normal" as const },
  { label: "작업자 근접 센서", state: "clear", sev: "normal" as const },
  { label: "도어 인터록", state: "closed", sev: "normal" as const },
  { label: "구동 안전 토크", state: "ok", sev: "normal" as const },
];

export default function Page() {
  const { scope } = useScope();
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-SAFETY" right={<span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>on-robot operator panel</span>} />
      <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
        <div className="card" style={{ padding: "var(--pad-card)", borderLeft: "4px solid var(--st-emergency)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Icon name="power" size={24} style={{ color: "var(--st-emergency)" }} />
            <strong style={{ fontSize: 16 }}>긴급정지 (E-stop)</strong>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>{scope.robotId ?? "로봇 미선택"}</span>
          </div>
          <HoldButton label="E-STOP 발동 (hold)" holdLabel="hold…" danger duration={900} style={{ width: "100%", height: "var(--control-h)", fontSize: 16 }} />
          <div style={{ fontSize: 12, color: "var(--st-critical)", marginTop: 10 }}>
            물리 E-stop(①)은 SW 비의존 최상위. 현장 HMI(③)는 안전 해제 가능, cloud(④)는 불가.
          </div>
        </div>
        <div className="card" style={{ padding: "var(--pad-card)" }}>
          <strong style={{ fontSize: 14 }}>인터록 상태</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {INTERLOCKS.map((it) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ flex: 1, fontSize: 14 }}>{it.label}</span>
                <StatusBadge sev={it.sev} label={it.state} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
