"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  GateNotice,
} from "@station/design-system";
import { protocolProfiles } from "@station/domain";

/* ---------------- C02-03 프로토콜 빌더 ---------------- */
const TRANSPORTS = ["MQTT", "ROS2", "DDS"] as const;
type Transport = (typeof TRANSPORTS)[number];

export function ProtocolBuilder({ density }: { density: string }) {
  const moduleId = "MOD-CAM-V01";
  const profile = protocolProfiles[moduleId];
  const [transport, setTransport] = useState<Transport>(profile.transport);
  const dense = density === "compact";

  // topic collision 경고 mock — telemetry/cmd dir이 같은 prefix를 공유하는지 단순 표시
  const collision = profile.topics.length > 1;

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>프로토콜 빌더</span>
            <StatusBadge sev="notice" label="C02-03" />
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{moduleId}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            <span className="mono">{profile.id}</span> · transport · topic 매핑 · payload schema · ack/timeout · security
          </div>
        </div>
      </div>

      {/* transport tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {TRANSPORTS.map((t) => {
          const on = t === transport;
          const isDefault = t === profile.transport;
          return (
            <button key={t} onClick={() => setTransport(t)} className="card" style={{ flex: 1, padding: "12px 16px", boxShadow: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 11, border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--surface-2)" : "var(--surface)", textAlign: "left" }}>
              <Icon name={t === "MQTT" ? "wifi" : t === "ROS2" ? "node" : "layers"} size={18} style={{ color: on ? "var(--brand)" : "var(--ink-3)", flex: "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>{t}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{t === "MQTT" ? "pub/sub broker" : t === "ROS2" ? "node graph" : "data-centric"}</div>
              </div>
              {isDefault && <StatusBadge sev="normal" label="기본" />}
            </button>
          );
        })}
      </div>

      {collision && (
        <GateNotice
          severity="warn"
          gateId={profile.id}
          title="Topic collision 경고"
          reason="cmd · telemetry 토픽이 동일한 robot/{id} prefix를 공유합니다. 라우팅 충돌을 피하려면 QoS/네임스페이스 분리를 검토하세요. (mock)"
        />
      )}

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)" }}>
        {/* 좌: topic 매핑 + payload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
          <div className="card">
            <PanelHead title="Topic / Endpoint 매핑" sub={`${profile.topics.length} topics · ${transport}`} dense />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["dir", "topic / endpoint", "payload"].map((h, i) =>
                  <th key={i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {profile.topics.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <StatusBadge sev={t.dir === "cmd" ? "notice" : "normal"} label={t.dir} />
                    </td>
                    <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 12 }}>{t.topic}</span></td>
                    <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{t.payload}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* payload schema preview */}
          <div className="card">
            <PanelHead title="Payload schema 미리보기" sub="CommandEnvelope" dense />
            <div className="mono" style={{ margin: 12, padding: 14, background: "#1c1c1a", borderRadius: "var(--r-sm)", fontSize: 11.5, lineHeight: 1.7, color: "#cfcfc7", overflow: "auto" }}>
              <div><span style={{ color: "#6fb8dc" }}>type</span> CommandEnvelope {"{"}</div>
              <div style={{ paddingLeft: 16 }}><span style={{ color: "#c9a36f" }}>verb</span>: <span style={{ color: "#6fdca0" }}>string</span>   <span style={{ color: "#666" }}>// CALIBRATE | START_CAPTURE …</span></div>
              <div style={{ paddingLeft: 16 }}><span style={{ color: "#c9a36f" }}>ts</span>: <span style={{ color: "#6fdca0" }}>string</span>     <span style={{ color: "#666" }}>// ISO time</span></div>
              <div style={{ paddingLeft: 16 }}><span style={{ color: "#c9a36f" }}>args</span>: <span style={{ color: "#6fdca0" }}>object</span>   <span style={{ color: "#666" }}>// command-specific</span></div>
              <div>{"}"}</div>
            </div>
          </div>
        </div>

        {/* 우: ack/timeout/security + sample */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
          <div className="card">
            <PanelHead title="전송 보장" sub="ack · timeout" dense />
            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Cell icon="check" label="ack" value={profile.ack} />
              <Cell icon="clock" label="timeout" value={profile.timeout} />
            </div>
          </div>

          <div className="card">
            <PanelHead title="Security" dense />
            <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "var(--surface-2)" }}>
                <Icon name="shield" size={18} style={{ color: "var(--st-normal)" }} />
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{profile.security}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>mutual auth · encrypted transport</div>
              </div>
            </div>
          </div>

          {/* 샘플 메시지 (.term mono box) */}
          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1c1c1a" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 7 }}>
              <Icon name="terminal" size={15} style={{ color: "#ddd" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>샘플 메시지</span>
              <span className="mono" style={{ fontSize: 10.5, color: "#777", marginLeft: "auto" }}>{transport} · {profile.topics[0]?.topic}</span>
            </div>
            <div className="mono" style={{ padding: 14, fontSize: 11.5, lineHeight: 1.7, color: "#9fdcb8", whiteSpace: "pre-wrap", overflow: "auto" }}>
              <span style={{ color: "#555" }}>$ publish &gt; </span>{"\n"}{profile.sample}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ icon, label, value }: { icon: import("@station/design-system").IconName; label: string; value: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon name={icon} size={13} style={{ color: "var(--ink-3)" }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)" }}>{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
