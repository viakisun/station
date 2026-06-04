// [SWS-FIELD-TELEMETRY / SWC-PRODUCT-FIELD] Field Telemetry setup (structural · TELEMETRY).
import { SurfaceHeader } from "@station/app-kit";
import { Icon, StatusBadge } from "@station/design-system";
import { getTelemetryData } from "@station/domain";

export default function Page() {
  const t = getTelemetryData();
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-TELEMETRY" right={<span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>on-robot operator panel</span>} />
      <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
        <div className="card" style={{ padding: "var(--pad-card)" }}>
          <strong style={{ fontSize: 14 }}>채널 맵 — raw 신호 → 표준 채널</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {t.channels.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                <Icon name={c.icon as Parameters<typeof Icon>[0]["name"]} size={18} />
                <span style={{ flex: 1, fontSize: 13 }}>{c.label}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.unit}</span>
                <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{c.group}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: "var(--pad-card)" }}>
          <strong style={{ fontSize: 14 }}>센서 보정 (calibration)</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {t.calibrations.map((cal) => (
              <div key={cal.ch} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                <span style={{ flex: 1 }}>{cal.label}</span>
                <span className="mono tnum" style={{ fontSize: 12, color: "var(--ink-2)" }}>offset {cal.offset} · scale {cal.scale}</span>
                <StatusBadge sev={cal.due ? "warning" : "normal"} label={cal.due ? "보정 필요" : "정상"} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10 }}>현장 설정(on-robot). cloud Ops의 Telemetry Monitor는 이 업링크의 read-only 미러.</div>
        </div>
      </div>
    </div>
  );
}
