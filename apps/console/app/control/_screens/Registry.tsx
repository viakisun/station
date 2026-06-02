"use client";
import { useState } from "react";
import {
  Icon,
  StatusBadge,
  RobotTypeTag,
  PanelHead,
  EmptyNote,
} from "@station/design-system";
import { registryDevices, pairingCode, type RegistryDevice } from "@station/domain";

/* ---------------- Device Registry · 페어링 ---------------- */
const pairMeta: Record<RegistryDevice["pairing"], { label: string; sev: "normal" | "notice" | "disabled" }> = {
  paired: { label: "paired", sev: "normal" },
  pairing: { label: "pairing", sev: "notice" },
  unpaired: { label: "unpaired", sev: "disabled" },
};

export function Registry() {
  const [selId, setSelId] = useState<string | null>(null);
  const sel = registryDevices.find(d => d.robot_id === selId) ?? null;

  const paired = registryDevices.filter(d => d.pairing === "paired").length;

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* LEFT — registry table */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "var(--gap)", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>DEVICE REGISTRY</span>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>등록 로봇</h1>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>
            {registryDevices.length}대 · paired {paired}
          </span>
        </div>

        <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left",
                position: "sticky", top: 0, zIndex: 1 }}>
                {["Robot ID", "Type", "GH", "모듈", "HMI / Tel", "Pairing", "Firmware set"].map((h, i) => (
                  <th key={i} style={{ padding: "9px 12px", fontSize: 10.5, fontWeight: 700,
                    borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registryDevices.map(d => {
                const on = d.robot_id === selId;
                const pm = pairMeta[d.pairing];
                return (
                  <tr key={d.robot_id} className="hov-row" onClick={() => setSelId(d.robot_id)}
                    style={{ borderBottom: "1px solid var(--line)", cursor: "pointer",
                      background: on ? "var(--surface-2)" : "transparent" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{d.robot_id}</span>
                    </td>
                    <td style={{ padding: "9px 12px" }}><RobotTypeTag type={d.type} size="sm" /></td>
                    <td style={{ padding: "9px 12px" }}>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{d.gh}</span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span className="tnum" style={{ fontWeight: 700 }}>{d.modules.length}</span>
                      <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}> 모듈</span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-2)" }}>{d.hmi}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{d.tel}</div>
                    </td>
                    <td style={{ padding: "9px 12px" }}><StatusBadge sev={pm.sev} label={pm.label} dot={d.pairing !== "pairing"} /></td>
                    <td style={{ padding: "9px 12px" }}>
                      <span className="mono" style={{ fontSize: 10.5, color: d.firmware_set === "—" ? "var(--ink-3)" : "var(--ink-2)" }}>{d.firmware_set}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* module drawer (selected) */}
        {sel && (
          <div className="card" style={{ flex: "none", padding: 0 }}>
            <PanelHead
              title={<span className="mono">{sel.robot_id}</span>}
              sub={`구성 모듈 ${sel.modules.length}개 · ${sel.gh}`}
              dense
              right={<button className="btn sm" onClick={() => setSelId(null)}><Icon name="close" size={13} /> 닫기</button>}
            />
            <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {sel.modules.map(mid => (
                <div key={mid} style={{ display: "flex", alignItems: "center", gap: 9,
                  border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "8px 11px", background: "var(--surface)" }}>
                  <Icon name="chip" size={15} style={{ color: "var(--ink-3)" }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{mid}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — pairing panel */}
      <aside style={{ width: 320, flex: "none", borderLeft: "1px solid var(--line)",
        background: "var(--surface)", display: "flex", flexDirection: "column" }}>
        <PanelHead title="신규 페어링" sub="발급 코드를 신규 로봇 HMI에 입력" dense
          right={<span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-notice)" }} />
            대기
          </span>} />

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface-2)",
            padding: "18px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".4px", marginBottom: 10 }}>PAIRING CODE</div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "1px", color: "var(--ink)" }}>{pairingCode.code}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 12 }}>
              <Icon name="clock" size={14} style={{ color: "var(--st-warning)" }} />
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700, color: "var(--st-warning)" }}>{pairingCode.ttl}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>남음</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
            border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
            <Icon name="robot" size={16} style={{ color: "var(--ink-2)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)" }}>TARGET</div>
              <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{pairingCode.target}</div>
            </div>
            <StatusBadge sev="notice" label="pairing" dot={false} />
          </div>

          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.7 }}>
            <li>대상 로봇 HMI에서 <b>페어링 모드</b> 진입</li>
            <li>위 코드를 입력하고 확인</li>
            <li>모듈 인식 후 firmware set 동기화</li>
          </ol>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn sm" style={{ flex: 1 }}><Icon name="refresh" size={14} /> 코드 재발급</button>
            <button className="btn sm primary" style={{ flex: 1 }}><Icon name="qr" size={14} /> QR 표시</button>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>페어링 진행 중</div>
            {registryDevices.filter(d => d.pairing === "pairing").length === 0 ? (
              <EmptyNote icon="link" title="진행 중인 페어링 없음" />
            ) : (
              registryDevices.filter(d => d.pairing === "pairing").map(d => (
                <div key={d.robot_id} style={{ display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 11px", borderRadius: "var(--r-sm)", background: "var(--tint-notice, var(--surface-2))",
                  border: "1px solid var(--line)" }}>
                  <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-notice)" }} />
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{d.robot_id}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{d.gh}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
