"use client";
/* ============================================================
   Wizard — 단계형 마법사 (스텝퍼 + 스텝 프레임)
   온보딩·펌웨어 등록 등 다단계 등록 화면 공용.
   ============================================================ */
import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface WizardStep {
  key: string;
  label: string;
  desc?: string;
}

export function WizardStepper({
  steps,
  current,
  onStep,
}: {
  steps: WizardStep[];
  current: number; // index
  onStep?: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 18 }}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const color =
          state === "done" ? "var(--st-normal)" : state === "current" ? "var(--brand)" : "var(--line-strong)";
        return (
          <div key={s.key} style={{ flex: 1, minWidth: 0, position: "relative" }}>
            {i < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 15,
                  left: "calc(50% + 18px)",
                  right: "calc(-50% + 18px)",
                  height: 2,
                  background: i < current ? "var(--st-normal)" : "var(--line)",
                }}
              />
            )}
            <button
              onClick={() => onStep && onStep(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                width: "100%",
                border: "none",
                background: "transparent",
                cursor: onStep ? "pointer" : "default",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: state === "todo" ? "var(--surface)" : color,
                  border: `1.5px solid ${color}`,
                  color: state === "todo" ? "var(--ink-3)" : "#fff",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  fontSize: 13,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {state === "done" ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: state === "current" ? 800 : 600,
                  color: state === "current" ? "var(--ink)" : "var(--ink-3)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function WizardFrame({
  title,
  sub,
  children,
  onPrev,
  onNext,
  nextLabel = "다음",
  prevLabel = "이전",
  canPrev = true,
  canNext = true,
  footer,
}: {
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: ReactNode;
  prevLabel?: ReactNode;
  canPrev?: boolean;
  canNext?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "12px 18px",
          borderTop: "1px solid var(--line)",
          background: "var(--surface-2)",
        }}
      >
        <div>{footer}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {onPrev && (
            <button className="btn" disabled={!canPrev} onClick={onPrev}>
              {prevLabel}
            </button>
          )}
          {onNext && (
            <button className="btn primary" disabled={!canNext} onClick={onNext}>
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
