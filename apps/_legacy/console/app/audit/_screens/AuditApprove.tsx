"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  GateNotice,
  HoldButton,
  KVStack,
} from "@station/design-system";
import { RELEASE, gateAuditOperational } from "@station/domain";

/* ---------------- BUILD-06 Audit 승인 → 운영 전환 (G5 게이트) ---------------- */
export function AuditApprove() {
  const R = RELEASE;
  const modules = R.modules;
  const [selId, setSelId] = useState(modules[0]?.id ?? "");
  const [promoted, setPromoted] = useState<Record<string, boolean>>({});

  const sel = modules.find((m) => m.id === selId) ?? modules[0];
  const gate = gateAuditOperational(sel.auditState);
  const blocked = gate.severity === "blocked";
  const isPromoted = !!promoted[sel.id];

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Audit 승인 · 운영 전환</span>
            <StatusBadge sev="notice" label="G5 게이트" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            AuditPackage가 approved 인 모듈만 운영(operational)으로 전환할 수 있습니다 · {modules.length} 모듈
          </div>
        </div>
        <a className="btn sm" href="package"><Icon name="pkg" size={14} /> Audit Package</a>
        <a className="btn sm" href="conformance"><Icon name="beaker" size={14} /> Conformance</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* 모듈 audit 상태 목록 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="모듈 Audit 상태" sub="선택하여 운영 전환 게이트 확인" dense />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["모듈", "벤더", "Audit ID", "상태", ""].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {modules.map((m) => {
                  const am = R.auditMeta[m.auditState];
                  const v = R.vendors.find((x) => x.id === m.vendor);
                  const on = m.id === selId;
                  return (
                    <tr key={m.id} className="hov-row" onClick={() => setSelId(m.id)}
                      style={{ borderBottom: "1px solid var(--line)", cursor: "pointer", background: on ? "var(--surface-2)" : "transparent", borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent" }}>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ fontWeight: 700 }}>{m.type}</div>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{v?.name}</td>
                      <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.audit}</span></td>
                      <td style={{ padding: "9px 12px" }}>
                        {promoted[m.id] ? <StatusBadge sev="normal" label="operational" /> : <StatusBadge sev={am.sev} label={am.label} />}
                      </td>
                      <td style={{ padding: "9px 12px" }}><Icon name="chevR" size={14} style={{ color: "var(--ink-3)" }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 선택 모듈 게이트 + 전환 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="선택 모듈" sub={sel.type} dense
              right={<StatusBadge sev={R.auditMeta[sel.auditState].sev} label={R.auditMeta[sel.auditState].label} />} />
            <div style={{ padding: "4px 14px 14px" }}>
              <KVStack pairs={[
                ["모듈", <span className="mono" key="m">{sel.id}</span>],
                ["Audit Package", <span className="mono" key="a">{sel.audit}</span>],
                ["펌웨어", <span className="mono" key="f">v{sel.fw}</span>],
                ["대상 로봇", sel.robots],
              ]} />
            </div>
          </div>

          <div className="card" style={{ padding: "var(--pad-card)" }}>
            <GateNotice
              severity={gate.severity}
              gateId={gate.gate}
              title={blocked ? "운영 전환 불가" : "운영 전환 가능"}
              reason={gate.reason}
              actions={(gate.actions || []).map((a) => ({ label: a.label, href: a.href }))}
            />
          </div>

          <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 10 }}>
            {isPromoted ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, fontWeight: 700, color: "var(--st-normal)" }}>
                <Icon name="check" size={17} stroke={2.4} /> {sel.id} 운영 전환 완료 (mock)
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  {blocked ? "approved 상태가 아니면 운영 전환할 수 없습니다." : "Hold하여 운영으로 전환하세요."}
                </div>
                <HoldButton label="운영 전환" holdLabel="전환 중…" disabled={blocked} onConfirm={() => setPromoted((p) => ({ ...p, [sel.id]: true }))} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
