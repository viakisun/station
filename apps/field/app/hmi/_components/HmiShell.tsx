"use client";
/* ============================================================
   HMI 디바이스 셸 — 태블릿 1024×768 베젤 + 스케일링 + 상태바
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon, RobotTypeTag, type IconName } from "@station/design-system";

export const HMI_W = 1024,
  HMI_H = 768,
  BEZEL = 26;

export function HmiFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const totalW = HMI_W + BEZEL * 2,
        totalH = HMI_H + BEZEL * 2;
      const s = Math.min((window.innerWidth - 48) / totalW, (window.innerHeight - 48) / totalH);
      if (ref.current) ref.current.style.transform = `scale(${Math.min(s, 1.4)})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0d0f", display: "grid", placeItems: "center", overflow: "hidden" }}>
      <div ref={ref} style={{ transformOrigin: "center", flex: "none" }}>
        {/* tablet bezel */}
        <div style={{ width: HMI_W + BEZEL * 2, height: HMI_H + BEZEL * 2, background: "linear-gradient(155deg,#26262a,#161618)",
          borderRadius: 30, padding: BEZEL, boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)", position: "relative" }}>
          {/* front camera */}
          <div style={{ position: "absolute", top: BEZEL / 2 - 3, left: "50%", transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: "#0b0b0c", border: "1px solid #333" }} />
          {/* screen */}
          <div style={{ width: HMI_W, height: HMI_H, background: "var(--canvas)", borderRadius: 8, overflow: "hidden",
            display: "flex", flexDirection: "column", position: "relative" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HmiStatusBar({
  robot,
  title,
  connected,
  registered,
  safety,
}: {
  robot: { type: string; id: string; model: string; hmi: string };
  title?: string;
  connected?: boolean;
  registered?: boolean;
  safety?: string;
}) {
  const [now, setNow] = useState(timeStr());
  useEffect(() => { const t = setInterval(() => setNow(timeStr()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 18px",
      background: "var(--surface)", borderBottom: "1px solid var(--line)", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
          <Icon name="hmi" size={17} />
        </div>
        <div style={{ lineHeight: 1.15, whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RobotTypeTag type={robot.type} size="sm" />
            <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{robot.id}</span>
          </div>
          <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600 }}>{robot.model} · {robot.hmi}</div>
        </div>
      </div>

      <div style={{ flex: 1, textAlign: "center" }}>
        {title && <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.2px" }}>{title}</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* safety */}
        <span className={"badge " + (safety === "safe" ? "normal" : "emergency")} style={{ height: 26, fontSize: 12 }}>
          <Icon name={safety === "safe" ? "shield" : "alert"} size={13} /> {safety === "safe" ? "safe" : "e-stop"}
        </span>
        {/* control link */}
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700,
          color: registered ? "var(--st-normal)" : "var(--ink-3)" }}>
          <Icon name={registered ? "link" : "unlink"} size={15} /> {registered ? "registered" : "unregistered"}
        </span>
        {/* network */}
        <Icon name="wifi" size={17} style={{ color: connected ? "var(--ink-2)" : "var(--st-disabled)" }} />
        <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{now}</span>
      </div>
    </div>
  );
}

function timeStr() { const d = new Date(); return d.toTimeString().slice(0, 5); }

/* 큰 터치 버튼 (HMI 전용, ≥56px) */
export function TouchBtn({
  children,
  onClick,
  primary,
  danger,
  ghost,
  disabled,
  full,
  icon,
  style,
}: {
  children?: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  full?: boolean;
  icon?: IconName;
  style?: CSSProperties;
}) {
  const cls = "btn" + (primary ? " primary" : danger ? " danger" : ghost ? " ghost" : "");
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={{
      height: 56, fontSize: 15, fontWeight: 700, padding: "0 22px", borderRadius: 9,
      width: full ? "100%" : "auto", gap: 9, ...style }}>
      {icon && <Icon name={icon} size={19} />} {children}
    </button>
  );
}
