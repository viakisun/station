"use client";
/* ---------------- Step 4: 프로토콜 설정 ---------------- */
import { useState } from "react";
import { Icon, StatusBadge, PanelHead } from "@station/design-system";
import { HMI } from "@station/domain";
import { TouchBtn } from "../HmiShell";
import { StepHead, FLabel, PField, type Step } from "../helpers";

export function StepProtocol({ step }: { step: Step }) {
  const H = HMI, d = H.protocolDefaults;
  const [transport, setTransport] = useState(d.transport);
  const [qos, setQos] = useState(d.qos);
  const [ack, setAck] = useState(d.ack);
  const [test, setTest] = useState<string | null>(null); // null | testing | ok

  const runTest = () => { setTest("testing"); setTimeout(() => setTest("ok"), 1400); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* transport + fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 12 }}>Transport</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {H.transports.map(tr => {
                const on = transport === tr.id;
                return (
                  <button key={tr.id} onClick={() => setTransport(tr.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 13,
                    border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)", background: on ? "var(--surface-2)" : "var(--surface)", textAlign: "left", width: "100%" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", border: "2px solid " + (on ? "var(--brand)" : "var(--line-strong)"), display: "grid", placeItems: "center" }}>
                      {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{tr.label}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>{tr.desc}</span>
                    </div>
                    {tr.reco && <StatusBadge sev="normal" label="recommended" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* config */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <PanelHead title="Contract setup" sub={transport + " · standard protocol profile"} dense />
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <PField label="Broker / Endpoint" value={d.broker} mono />
            <PField label="command topic" value={d.topicCmd} mono />
            <PField label="telemetry topic" value={d.topicTel} mono />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <FLabel>QoS</FLabel>
                <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
                  {[0, 1, 2].map(q => <button key={q} onClick={() => setQos(q)} style={{ flex: 1, height: 36, border: "none", borderRadius: 5, fontWeight: 700, fontSize: 13,
                    background: qos === q ? "var(--surface)" : "transparent", color: qos === q ? "var(--ink)" : "var(--ink-3)", boxShadow: qos === q ? "var(--shadow-2)" : "none" }}>{q}</button>)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <FLabel>ack 정책</FLabel>
                <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
                  {([["at_least_once", "≥1"], ["exactly_once", "=1"]] as const).map(([a, l]) => <button key={a} onClick={() => setAck(a)} style={{ flex: 1, height: 36, border: "none", borderRadius: 5, fontWeight: 700, fontSize: 12.5,
                    background: ack === a ? "var(--surface)" : "transparent", color: ack === a ? "var(--ink)" : "var(--ink-3)", boxShadow: ack === a ? "var(--shadow-2)" : "none" }}>{l}</button>)}
                </div>
              </div>
            </div>
            <PField label="timeout / security" value={`${d.timeout}ms · ${d.security}`} />
          </div>
          <div style={{ marginTop: "auto", padding: 14, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
            <TouchBtn icon="terminal" onClick={runTest} disabled={test === "testing"} style={{ height: 48, fontSize: 13.5 }}>
              {test === "testing" ? "sending…" : "Test message"}
            </TouchBtn>
            {test === "ok" && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--st-normal)" }}><Icon name="check" size={16} /> ack received · 142ms</span>}
            {test === "testing" && <span className="live-pulse" style={{ fontSize: 12.5, color: "var(--st-notice)", fontWeight: 700 }}>round-trip 측정 중…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
