"use client";
/* ============================================================
   Telemetry 콘솔 — 로컬 헬퍼 (디바이스 셸 프레임 · 상태바 · 터치 버튼)
   (원본: telemetry-console/shell.jsx — design-system 미수록 로컬 컴포넌트)
   ============================================================ */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "@station/design-system";

const TM_W = 1024,
  TM_H = 768,
  TM_BEZEL = 26;

export function TmFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const totalW = TM_W + TM_BEZEL * 2,
        totalH = TM_H + TM_BEZEL * 2;
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
        <div
          style={{
            width: TM_W + TM_BEZEL * 2,
            height: TM_H + TM_BEZEL * 2,
            background: "linear-gradient(155deg,#26262a,#161618)",
            borderRadius: 30,
            padding: TM_BEZEL,
            boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: TM_BEZEL / 2 - 3, left: "50%", transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: "#0b0b0c", border: "1px solid #333" }} />
          <div style={{ width: TM_W, height: TM_H, background: "var(--canvas)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

type Device = {
  id: string;
  model: string;
  robot: string;
  site: string;
  fw: string;
  uplink: string;
  power: string;
};

export function TmStatusBar({ device, mode, onMode, synced }: { device: Device; mode: string; onMode: (m: string) => void; synced?: boolean }) {
  const [now, setNow] = useState(tmTime());
  useEffect(() => {
    const t = setInterval(() => setNow(tmTime()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", background: "var(--surface)", borderBottom: "1px solid var(--line)", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--brand)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
          <Icon name="telemetry" size={17} />
        </div>
        <div style={{ lineHeight: 1.15, whiteSpace: "nowrap" }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 800 }}>{device.id}</span>
          <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600 }}>{device.model} · {device.robot} · {device.site}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 3 }}>
          {([["setup", "Setup", "sliders"], ["monitor", "Monitor", "activity"]] as [string, string, IconName][]).map(([id, label, ic]) => {
            const on = mode === id;
            return (
              <button key={id} onClick={() => onMode(id)} style={{ display: "flex", alignItems: "center", gap: 7, height: 30, padding: "0 16px", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 700, background: on ? "var(--surface)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)", boxShadow: on ? "var(--shadow-2)" : "none" }}>
                <Icon name={ic} size={15} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: synced ? "var(--st-normal)" : "var(--st-warning)" }}>
          <span className={synced ? "live-pulse" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "var(--brand-live)" : "var(--st-warning)" }} />
          {synced ? "sync live" : "sync lag"}
        </span>
        <Icon name="wifi" size={17} style={{ color: "var(--ink-2)" }} />
        <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{now}</span>
      </div>
    </div>
  );
}
function tmTime() {
  return new Date().toTimeString().slice(0, 5);
}

/* ---------------- Step 타입 + 공통 스텝 헤더 ---------------- */
export type Step = {
  id: string;
  n: number;
  icon: string;
  title: string;
  desc: string;
  state: string;
};

export function TStepHead({ step }: { step: Step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 22px", borderBottom: "1px solid var(--line)", flex: "none" }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={step.icon as IconName} size={20} />
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-3)", whiteSpace: "nowrap" }}>STEP 0{step.n}/4</span>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{step.title}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{step.desc}</div>
      </div>
    </div>
  );
}

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
    <button className={cls} onClick={onClick} disabled={disabled} style={{ height: 52, fontSize: 14.5, fontWeight: 700, padding: "0 20px", borderRadius: 9, width: full ? "100%" : "auto", gap: 9, ...style }}>
      {icon && <Icon name={icon} size={18} />} {children}
    </button>
  );
}
