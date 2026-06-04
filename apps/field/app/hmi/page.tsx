"use client";
// [SWS-FIELD-HMI / SWC-PRODUCT-FIELD] Field HMI Mock — on-robot operator panel(③, 직접 조작).
import { SurfaceHeader, useScope } from "@station/app-kit";
import { Icon, StatusBadge } from "@station/design-system";

const CONTROLS = [
  { label: "작업 시작", icon: "play" as const, primary: true },
  { label: "일시정지", icon: "pause" as const },
  { label: "재개", icon: "play" as const },
  { label: "복귀", icon: "home2" as const },
];

export default function Page() {
  const { scope } = useScope();
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-HMI" right={<span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>Field HMI Mock — on-robot operator panel</span>} />
      <div style={{ padding: "var(--panel-padding)", display: "flex", flexDirection: "column", gap: "var(--panel-gap)" }}>
        <div className="card" style={{ padding: "var(--panel-padding)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="robot" size={28} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{scope.robotId ?? "로봇 미선택"}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>authority ③ · local-first · 현장 직접 조작</div>
            </div>
            <span style={{ marginLeft: "auto" }}><StatusBadge sev="normal" label="ready" /></span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--panel-gap)" }}>
          {CONTROLS.map((c) => (
            <button key={c.label} className={`btn ${c.primary ? "primary" : ""}`} style={{ height: "var(--control-height)", fontSize: 16, gap: 8 }} disabled={!scope.robotId}>
              <Icon name={c.icon} size={22} /> {c.label}
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: "var(--panel-padding)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          현장 작업자(③)는 로봇 가까이서 직접 조작 — cloud(④)는 요청만(상위 권한 ③). E-stop·안전은 Safety 탭. 진행률·세부 제어는 후속.
        </div>
      </div>
    </div>
  );
}
