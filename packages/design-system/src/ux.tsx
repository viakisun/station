"use client";
/* ============================================================
   목업 라운드 공유 UX 프리미티브
   GateNotice(4단계) · HoldButton · ContextChip · SafetyBanner · KVStack
   (00 §5 Gate · §7 Context · §9.3 Field · ADR-006)
   ============================================================ */
import {
  useState,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Icon, type IconName } from "./Icon";
import type { Sev } from "./components";

export type GateSeverity = "pass" | "warn" | "confirm_required" | "blocked";

export interface GateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

const GATE_META: Record<
  GateSeverity,
  { icon: IconName; label: string; tone: string }
> = {
  pass: { icon: "check", label: "사용 가능", tone: "var(--st-normal)" },
  warn: { icon: "alert", label: "주의 후 진행", tone: "var(--st-warning)" },
  confirm_required: { icon: "lock", label: "확인 필요 (hold)", tone: "var(--st-notice)" },
  blocked: { icon: "close", label: "진행 불가", tone: "var(--st-critical)" },
};

/* ---- Gate 4단계 표시: blocked/confirm는 사유 + 해결 행동 ---- */
export function GateNotice({
  severity,
  title,
  reason,
  actions = [],
  gateId,
}: {
  severity: GateSeverity;
  title?: ReactNode;
  reason?: ReactNode;
  actions?: GateAction[];
  gateId?: string;
}) {
  const m = GATE_META[severity];
  return (
    <div className={"gate-notice " + severity}>
      <span style={{ color: m.tone, flex: "none", marginTop: 1 }}>
        <Icon name={m.icon} size={16} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, color: m.tone }}>{title || m.label}</span>
          {gateId && (
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
              {gateId}
            </span>
          )}
        </div>
        {reason && (
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.5 }}>
            {reason}
          </div>
        )}
        {actions.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
            {actions.map((a, i) =>
              a.href ? (
                <a key={i} className="btn sm" href={a.href}>
                  {a.label}
                </a>
              ) : (
                <button key={i} className="btn sm" onClick={a.onClick}>
                  {a.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- hold-to-confirm 버튼 (ConfirmModal requireHold 일반화) ---- */
export function HoldButton({
  label,
  holdLabel = "Hold…",
  onConfirm,
  danger,
  duration = 1200,
  disabled,
  style,
  className,
}: {
  label: ReactNode;
  holdLabel?: ReactNode;
  onConfirm?: () => void;
  danger?: boolean;
  duration?: number;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const [held, setHeld] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    if (disabled) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / duration) * 100);
      setHeld(p);
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        onConfirm && onConfirm();
      }
    }, 16);
  };
  const end = () => {
    if (timer.current) clearInterval(timer.current);
    if (held < 100) setHeld(0);
  };
  return (
    <button
      className={"btn " + (danger ? "danger" : "primary") + (className ? " " + className : "")}
      disabled={disabled}
      style={{ position: "relative", overflow: "hidden", minWidth: 150, ...style }}
      onMouseDown={start}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchEnd={end}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: held + "%",
          background: "rgba(255,255,255,.28)",
        }}
      />
      <span style={{ position: "relative" }}>{held > 0 && held < 100 ? holdLabel : label}</span>
    </button>
  );
}

/* ---- Context 핸드오프 출처 칩 ---- */
export function ContextChip({
  origin,
  ids,
  onReturn,
  returnLabel = "돌아가기",
}: {
  origin: string;
  ids?: ReactNode;
  onReturn?: () => void;
  returnLabel?: string;
}) {
  return (
    <span className="ctx-chip">
      <Icon name="ext" size={13} style={{ color: "var(--ink-3)" }} />
      <span className="from">from {origin}</span>
      {ids && (
        <>
          <span className="mid" />
          <span className="mono" style={{ color: "var(--ink)" }}>
            {ids}
          </span>
        </>
      )}
      {onReturn && (
        <>
          <span className="mid" />
          <button
            onClick={onReturn}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--brand)",
              fontWeight: 700,
              fontSize: 11.5,
              padding: 0,
              cursor: "pointer",
            }}
          >
            ← {returnLabel}
          </button>
        </>
      )}
    </span>
  );
}

/* ---- 안전 배너 (상단 고정: 오프라인/지연/버전/캘리브 due) ---- */
export function SafetyBanner({
  sev = "notice",
  icon = "alert",
  children,
}: {
  sev?: Sev;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <div className={"safety-banner " + sev}>
      <Icon name={icon} size={17} style={{ flex: "none" }} />
      <span>{children}</span>
    </div>
  );
}

/* ---- KV 스택 (Field 기본 표현 · 테이블 대체) ---- */
export function KVStack({
  pairs,
  big,
}: {
  pairs: [ReactNode, ReactNode][];
  big?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {pairs.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: big ? "12px 0" : "8px 0",
            borderBottom: i < pairs.length - 1 ? "1px solid var(--line)" : "none",
          }}
        >
          <span style={{ fontSize: big ? 14 : 12, color: "var(--ink-3)", fontWeight: 600 }}>
            {p[0]}
          </span>
          <span style={{ fontSize: big ? 16 : 13, fontWeight: 700, textAlign: "right" }}>
            {p[1]}
          </span>
        </div>
      ))}
    </div>
  );
}
