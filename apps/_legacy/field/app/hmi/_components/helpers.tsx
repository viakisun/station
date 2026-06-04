"use client";
/* ============================================================
   HMI 커미셔닝 — 로컬 헬퍼 (StepHead / FLabel / PField / SumRow)
   ============================================================ */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@station/design-system";

export type Step = {
  id: string;
  n: number;
  icon: string;
  title: string;
  desc: string;
  state: string;
};

/* ---------------- 공통 스텝 헤더 ---------------- */
export function StepHead({ step }: { step: Step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 22px", borderBottom: "1px solid var(--line)", flex: "none" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={step.icon as IconName} size={20} />
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-3)" }}>STEP 0{step.n}/5</span>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{step.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{step.desc}</div>
      </div>
    </div>
  );
}

export function FLabel({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 5 }}>{children}</div>;
}

export function PField({ label, value, mono }: { label: ReactNode; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className={mono ? "mono" : ""} style={{ height: 40, display: "flex", alignItems: "center", padding: "0 12px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface-2)", fontSize: 12.5, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

export function SumRow({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
    </div>
  );
}
