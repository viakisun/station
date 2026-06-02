"use client";
/* ============================================================
   Telemetry 콘솔 — 셸 (디바이스 프레임 + 상단 상태바 + 위저드 바)
   (원본: telemetry-console/app.jsx TmApp 의 프레임/네비 영역 — field 자체 셸)
   ============================================================ */
import type { ReactNode } from "react";
import { TELEMETRY } from "@station/domain";
import { TmFrame, TmStatusBar, TouchBtn } from "./helpers";

const TM_STEP_ORDER = ["onboard", "channel", "calib", "policy"];

export function TelemetryShell({
  mode,
  onMode,
  showWizardBar,
  idx,
  states,
  onPrev,
  onNext,
  children,
}: {
  mode: string;
  onMode: (m: string) => void;
  showWizardBar: boolean;
  idx: number;
  states: Record<string, string>;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
}) {
  return (
    <TmFrame>
      <div className="density-regular" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <TmStatusBar device={TELEMETRY.device} mode={mode} onMode={onMode} synced />

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
          {children}
        </div>

        {showWizardBar && (
          <div style={{ height: 66, flex: "none", borderTop: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
            <TouchBtn ghost icon="chevL" onClick={onPrev} style={{ height: 46 }}>{idx === 0 ? "Hub" : "Back"}</TouchBtn>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {TM_STEP_ORDER.map((id, i) => (
                <span key={id} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 999, background: states[id] === "done" ? "var(--brand)" : i === idx ? "var(--ink)" : "var(--line-strong)", transition: "all .2s" }} />
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }} className="mono">{idx + 1}/4</span>
            </div>
            <TouchBtn primary icon={idx === TM_STEP_ORDER.length - 1 ? "check" : "chevR"} onClick={onNext} style={{ height: 46 }}>
              {idx === TM_STEP_ORDER.length - 1 ? "Finish setup" : "Next"}
            </TouchBtn>
          </div>
        )}
      </div>
    </TmFrame>
  );
}
