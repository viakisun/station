// [SWS-AGENT-STATUS / SWC-AGENT] Agent service surface (structural) — 사용자 제품 아님.
import { SurfaceHeader } from "@station/app-kit";
import { StatusBadge } from "@station/design-system";

const NODES = [
  { kind: "MCU", org: "ORG-AGE", role: "주행·E-stop", proto: "CAN" },
  { kind: "VPU", org: "ORG-META", role: "비전·생육 추론", proto: "ROS2" },
  { kind: "ACU", org: "ORG-META", role: "자율 미션", proto: "DDS" },
  { kind: "LPU", org: "ORG-DAEDONG", role: "측위", proto: "DDS" },
  { kind: "Telemetry", org: "ORG-VIA", role: "uplink", proto: "MQTT" },
];

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-AGENT-STATUS" />
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 12 }}>
          <strong style={{ fontSize: 12 }}>Node Registry — on-robot 노드(②)</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {NODES.map((n) => (
              <div key={n.kind} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, padding: "4px 0", borderBottom: "1px solid var(--line)" }}>
                <span className="mono" style={{ width: 80, fontWeight: 700 }}>{n.kind}</span>
                <span style={{ flex: 1, color: "var(--ink-2)" }}>{n.role}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{n.org} · {n.proto}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <strong style={{ fontSize: 12 }}>Agent (on-robot runtime)</strong>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 8 }}>
            Agent는 사용자 제품이 아니라 <b style={{ color: "var(--ink)" }}>on-robot daemon</b>(권한 ②) — command routing·policy·node registry. 깊은 라이브 인스펙션은 <b style={{ color: "var(--ink)" }}>Runtime Inspector</b>(/agent)에서.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <StatusBadge sev="normal" label="policy active" />
            <StatusBadge sev="notice" label="growth-scan loaded" />
          </div>
        </div>
      </div>
    </div>
  );
}
