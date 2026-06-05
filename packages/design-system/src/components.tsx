"use client";
/* ============================================================
   공통 컴포넌트 — StatusBadge, RobotTypeTag, Battery, KpiCard,
   Sparkline, MiniBars, PanelHead, ConfirmModal, EmptyNote …
   (원본: farm-control/components.jsx — 마크업·스타일 1:1 보존)
   ============================================================ */
import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./Icon";

export type Sev =
  | "normal"
  | "notice"
  | "warning"
  | "critical"
  | "emergency"
  | "disabled";

/* ---- StatusBadge: sev(normal/notice/warning/critical/emergency/disabled) ---- */
export function StatusBadge({
  sev = "normal",
  label,
  dot = true,
  style,
}: {
  sev?: Sev;
  label: ReactNode;
  dot?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span className={"badge " + sev} style={style}>
      {dot && <span className="dot" />}
      {label}
    </span>
  );
}

/* ---- 로봇 유형 태그 (적과/적심) ---- */
export function RobotTypeTag({
  type,
  size = "md",
}: {
  type: string;
  size?: "sm" | "md";
}) {
  const thin = type === "thin";
  const sm = size === "sm";
  // 중립 칩 + 마커로 구분 (적과=채워진 점, 적심=빈 점). 컬러 절제.
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: sm ? 18 : 20,
        padding: sm ? "0 6px" : "0 7px",
        borderRadius: 4,
        fontSize: sm ? 10.5 : 11.5,
        fontWeight: 700,
        letterSpacing: ".2px",
        color: "var(--text-secondary)",
        background: "var(--surface-panel-raised)",
        border: "1px solid var(--line-default)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: thin ? "var(--text-primary)" : "transparent",
          border: thin ? "none" : "1.5px solid var(--text-secondary)",
        }}
      />
      {thin ? "Thin" : "Pinch"}
    </span>
  );
}

/* ---- 배터리 ---- */
export function Battery({ pct }: { pct: number }) {
  const color =
    pct <= 0
      ? "var(--state-offline)"
      : pct < 25
        ? "var(--state-critical)"
        : pct < 45
          ? "var(--state-warning)"
          : "var(--state-normal)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-secondary)",
      }}
    >
      <span
        style={{
          position: "relative",
          width: 24,
          height: 12,
          border: "1.5px solid var(--line-strong)",
          borderRadius: 3,
        }}
      >
        <span
          style={{
            position: "absolute",
            right: -3,
            top: 3,
            width: 2,
            height: 6,
            background: "var(--line-strong)",
            borderRadius: 1,
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 1,
            top: 1,
            bottom: 1,
            width: `calc(${Math.max(0, Math.min(100, pct))}% - 2px)`,
            background: color,
            borderRadius: 1,
          }}
        />
      </span>
      <span className="mono">{pct}%</span>
    </span>
  );
}

/* ---- KPI 카드 ---- */
export function KpiCard({
  label,
  value,
  unit,
  sub,
  sev,
  icon,
  onClick,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  sub?: ReactNode;
  sev?: Sev;
  icon?: IconName;
  onClick?: () => void;
}) {
  const alert = sev === "critical" || sev === "emergency";
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: "13px 15px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {alert && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: `var(--state-${sev})`,
                flex: "none",
              }}
            />
          )}
          {label}
        </span>
        {icon && (
          <span style={{ color: "var(--text-muted)", flex: "none" }}>
            <Icon name={icon} size={15} stroke={1.8} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          className="tnum"
          style={{
            fontSize: 25,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-.6px",
            color: alert ? `var(--state-${sev})` : "var(--text-primary)",
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</span>}
    </div>
  );
}

/* ---- Sparkline ---- */
export function Sparkline({
  data = [],
  w = 120,
  h = 34,
  color = "var(--product-accent)",
  fill = true,
}: {
  data?: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
}) {
  if (!data.length) return null;
  const min = Math.min(...data),
    max = Math.max(...data),
    range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 4 - ((v - min) / range) * (h - 8),
  ]);
  const line = pts
    .map((p, i) => (i ? "L" : "M") + p[0]!.toFixed(1) + " " + p[1]!.toFixed(1))
    .join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1]!;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {fill && <path d={area} fill={color} opacity=".10" />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}

/* ---- 미니 막대 차트 (가동률 등) ---- */
export function MiniBars({
  items,
  max,
}: {
  items: { label: ReactNode; value: number; unit?: string; color?: string }[];
  max?: number;
}) {
  const m = max || Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            style={{
              width: 56,
              fontSize: 12,
              color: "var(--text-secondary)",
              fontWeight: 600,
              flex: "none",
            }}
          >
            {it.label}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: "var(--surface-muted)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: (it.value / m) * 100 + "%",
                height: "100%",
                background: it.color || "var(--product-accent)",
                borderRadius: 999,
              }}
            />
          </div>
          <span
            className="tnum"
            style={{
              width: 38,
              textAlign: "right",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {it.value}
            {it.unit || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---- 패널 헤더 ---- */
export function PanelHead({
  title,
  sub,
  right,
  dense,
}: {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  dense?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: dense ? "10px 14px" : "13px 16px",
        borderBottom: "1px solid var(--line-default)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

/* ---- 위험 액션 확인 모달 (감사 로그 고지 포함) ---- */
export function ConfirmModal({
  open,
  title,
  body,
  danger,
  confirmLabel = "Confirm",
  auditNote,
  onConfirm,
  onClose,
  requireHold,
}: {
  open: boolean;
  title?: ReactNode;
  body?: ReactNode;
  danger?: boolean;
  confirmLabel?: ReactNode;
  auditNote?: ReactNode;
  onConfirm?: () => void;
  onClose?: () => void;
  requireHold?: boolean;
}) {
  const [held, setHeld] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!open) setHeld(0);
  }, [open]);
  if (!open) return null;
  const startHold = () => {
    if (!requireHold) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / 1200) * 100);
      setHeld(p);
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        onConfirm && onConfirm();
      }
    }, 16);
  };
  const endHold = () => {
    if (timer.current) clearInterval(timer.current);
    if (held < 100) setHeld(0);
  };
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,25,35,.42)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(1.5px)",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 440, boxShadow: "var(--shadow-3)", overflow: "hidden" }}
      >
        <div style={{ padding: "18px 20px 4px", display: "flex", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              flex: "none",
              display: "grid",
              placeItems: "center",
              color: danger ? "var(--state-emergency)" : "var(--product-accent)",
              background: danger ? "var(--state-critical-bg)" : "var(--surface-panel-raised)",
            }}
          >
            <Icon name={danger ? "alert" : "shield"} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 5,
                lineHeight: 1.5,
              }}
            >
              {body}
            </div>
          </div>
        </div>
        <div
          style={{
            margin: "14px 20px 0",
            padding: "9px 11px",
            borderRadius: 7,
            background: "var(--surface-panel-raised)",
            border: "1px solid var(--line-default)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 11.5,
            color: "var(--text-secondary)",
          }}
        >
          <Icon
            name="audit"
            size={15}
            style={{ color: "var(--text-muted)", flex: "none" }}
          />
          {auditNote ||
            "This action is recorded to audit_log with operator, time and reason."}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "16px 20px",
          }}
        >
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          {requireHold ? (
            <button
              className={"btn " + (danger ? "danger" : "primary")}
              style={{ position: "relative", overflow: "hidden", minWidth: 150 }}
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
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
              <span style={{ position: "relative" }}>
                {held > 0 && held < 100 ? "Hold…" : "Hold to execute"}
              </span>
            </button>
          ) : (
            <button
              className={"btn " + (danger ? "danger" : "primary")}
              onClick={() => onConfirm && onConfirm()}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- 진행률 바 (원본: drawer.jsx ProgressBar — 공통 재사용) ---- */
export function ProgressBar({
  pct,
  sub,
  big,
}: {
  pct: number;
  sub?: ReactNode;
  big?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span className="tnum" style={{ fontSize: big ? 20 : 13, fontWeight: 800 }}>
          {pct}%
        </span>
        {sub && (
          <span
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              alignSelf: "flex-end",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div
        style={{
          height: big ? 8 : 6,
          background: "var(--surface-muted)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: pct + "%",
            height: "100%",
            background: "var(--product-accent)",
            borderRadius: 999,
            transition: "width .4s",
          }}
        />
      </div>
    </div>
  );
}

/* ---- 빈/지연 상태 안내 ---- */
export function EmptyNote({
  icon = "doc",
  title,
  sub,
}: {
  icon?: IconName;
  title?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "40px 20px",
        color: "var(--text-muted)",
        textAlign: "center",
      }}
    >
      <Icon name={icon} size={28} />
      <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 14 }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 12.5 }}>{sub}</div>}
    </div>
  );
}
