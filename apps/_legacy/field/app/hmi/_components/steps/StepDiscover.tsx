"use client";
/* ---------------- Step 2: 모듈 디스커버리 & 선택 ---------------- */
import { useState } from "react";
import { Icon, StatusBadge, PanelHead, type Sev } from "@station/design-system";
import { HMI } from "@station/domain";
import { TouchBtn } from "../HmiShell";
import { StepHead, type Step } from "../helpers";

export type Assigns = Record<string, string>;

export function StepDiscover({ step, assigns, setAssigns }: { step: Step; assigns: Assigns; setAssigns: React.Dispatch<React.SetStateAction<Assigns>> }) {
  const H = HMI;
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [picking, setPicking] = useState<string | null>(null); // node being assigned

  const scan = () => {
    setScanning(true); setRevealed(false);
    setTimeout(() => { setScanning(false); setRevealed(true); }, 1800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <StepHead step={step} />
      <div style={{ flex: "none", padding: "12px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <TouchBtn icon="scan" onClick={scan} disabled={scanning} style={{ height: 48, fontSize: 13.5 }}>
          {scanning ? "scanning…" : "Re-scan bus"}
        </TouchBtn>
        <div style={{ flex: 1, fontSize: 12, color: "var(--ink-3)" }}>
          CAN · Ethernet · USB bus node detection. <b>Since this isn't plug & play</b> identify and select each node yourself.
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
          {scanning ? <span className="live-pulse">detecting…</span> : `${H.nodes.length} nodes`}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {scanning && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 30, color: "var(--ink-3)" }}>
            <Icon name="scan" size={22} className="live-pulse" /> 버스 스캔 중…
          </div>
        )}
        {!scanning && revealed && H.nodes.map(n => {
          const dm = H.detectMeta[n.detect as keyof typeof H.detectMeta];
          const assigned = assigns[n.node];
          const cat = (assigned || n.suggest) ? H.catalog.find(c => c.id === (assigned || n.suggest)) : null;
          const resolved = n.detect === "identified" || assigned;
          return (
            <div key={n.node} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 14,
              display: "flex", alignItems: "center", gap: 14, background: "var(--surface)" }}>
              <span style={{ width: 44, height: 44, borderRadius: 9, flex: "none", display: "grid", placeItems: "center",
                background: "var(--surface-2)", border: "1px solid var(--line)", color: resolved ? "var(--ink)" : "var(--ink-3)" }}>
                <Icon name={n.detect === "unidentified" ? "search" : "node"} size={22} />
              </span>
              <div style={{ width: 130, flex: "none" }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{n.node}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{n.port} · {n.raw}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {cat ? (
                  <>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cat.type}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{cat.vendor} · <span className="mono">{cat.id}</span> · fw {n.fw}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--st-warning)" }}>Unidentified device — manual selection needed</div>
                )}
                {n.conflict && <div style={{ fontSize: 11, color: "var(--st-critical)", fontWeight: 700, marginTop: 3 }}><Icon name="alert" size={12} /> {n.conflict}</div>}
              </div>
              <StatusBadge sev={assigned ? "normal" : (dm.sev as Sev)} label={assigned ? "identified" : dm.label} />
              <TouchBtn ghost style={{ height: 44, fontSize: 13 }} onClick={() => setPicking(n.node)}>
                {resolved ? "Change" : "Identify"}
              </TouchBtn>
            </div>
          );
        })}
      </div>

      {/* catalog picker sheet */}
      {picking && (
        <div onMouseDown={() => setPicking(null)} style={{ position: "absolute", inset: 0, background: "rgba(20,20,18,.4)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div onMouseDown={e => e.stopPropagation()} className="card" style={{ width: 560, maxHeight: 520, boxShadow: "var(--shadow-3)", display: "flex", flexDirection: "column" }}>
            <PanelHead title="Select module" sub={`approved modules for ${picking}`} right={<button className="icon-btn" onClick={() => setPicking(null)}><Icon name="close" size={18} /></button>} />
            <div style={{ overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {H.catalog.map(c => (
                <button key={c.id} onClick={() => { setAssigns(a => ({ ...a, [picking]: c.id })); setPicking(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 13, border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)", textAlign: "left", width: "100%" }}>
                  <Icon name="node" size={20} style={{ color: "var(--ink-3)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.type}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.vendor} · <span className="mono">{c.id}</span></div>
                  </div>
                  <Icon name="chevR" size={16} style={{ color: "var(--ink-3)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
