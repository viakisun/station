"use client";
import { useState } from "react";
import {
  Icon,
  StatusBadge,
  RobotTypeTag,
  PanelHead,
} from "@station/design-system";
import { twinState } from "@station/domain";

/* ---------------- 디지털트윈 MVP (2D 온실 트윈) ---------------- */
const stateMeta: Record<string, { label: string; sev: "normal" | "notice" | "warning" | "critical" | "disabled" }> = {
  working: { label: "작업 중", sev: "normal" },
  ready: { label: "대기", sev: "notice" },
  paused: { label: "일시정지", sev: "warning" },
};
const sevMap: Record<string, "normal" | "notice" | "warning" | "critical"> = {
  notice: "notice", warning: "warning", critical: "critical",
};

export function Twin() {
  const T = twinState;
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [toast, setToast] = useState<{ label: string; sev: string } | null>(null);

  // 시나리오 → 강조 대상 핀 매핑 (라벨에서 robot id 추출, 통로 이벤트는 없음)
  const eventTargets: Record<string, string | null> = {
    battery: "RBT-THIN-0002",
    tipover: "RBT-PINCH-0003",
    obstacle: null,
  };
  const highlightId = activeEvent ? eventTargets[activeEvent] : null;

  const fireEvent = (e: { id: string; label: string; sev: string }) => {
    setActiveEvent(e.id);
    setToast({ label: e.label, sev: e.sev });
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* MAP AREA */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "var(--gap)", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>DIGITAL TWIN · 2D</span>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{T.greenhouse.name}</h1>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{T.greenhouse.crop} · {T.greenhouse.id}</span>
          <div style={{ flex: 1 }} />
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-normal)" }} />
            mirror live · {T.mirror.latency}
          </span>
        </div>

        {/* square map */}
        <div className="card" style={{ flex: 1, minHeight: 0, display: "grid", placeItems: "center", overflow: "hidden",
          background: "linear-gradient(150deg,#eef4ee,#e7eef0)" }}>
          <div style={{ position: "relative", width: "min(100%, 70vh)", aspectRatio: "1 / 1", margin: 14 }}>
            {/* greenhouse frame */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 12, border: "2px solid var(--line-strong)",
              background: "rgba(255,255,255,.4)", overflow: "hidden" }}>
              {/* zone bands */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {T.greenhouse.zones.map((_, z) => {
                  const zw = 100 / T.greenhouse.zones.length;
                  return (
                    <rect key={z} x={z * zw + 0.6} y="3" width={zw - 1.2} height="94" rx="1.4"
                      fill={z % 2 ? "#dce7dc" : "#e4ece4"} stroke="var(--line)" strokeWidth="0.3" />
                  );
                })}
              </svg>

              {/* zone labels */}
              {T.greenhouse.zones.map((zn, z) => {
                const zw = 100 / T.greenhouse.zones.length;
                return (
                  <span key={zn} className="mono" style={{ position: "absolute", left: `${z * zw + zw / 2}%`, top: 10,
                    transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, color: "var(--ink-3)",
                    padding: "1px 6px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--line)" }}>{zn}</span>
                );
              })}

              {/* highlight overlay near event target */}
              {highlightId && (() => {
                const r = T.robots.find(x => x.id === highlightId);
                if (!r) return null;
                return (
                  <div style={{ position: "absolute", left: `${r.x}%`, top: `${r.y}%`, width: 96, height: 96,
                    transform: "translate(-50%,-50%)", borderRadius: "50%",
                    border: "2px dashed var(--st-critical)",
                    background: "radial-gradient(circle, rgba(230,81,0,.14), transparent 70%)" }} />
                );
              })()}

              {/* robot pins */}
              {T.robots.map(r => {
                const sm = stateMeta[r.state] ?? { label: r.state, sev: "disabled" as const };
                const hot = r.id === highlightId;
                return (
                  <div key={r.id} style={{ position: "absolute", left: `${r.x}%`, top: `${r.y}%`,
                    transform: "translate(-50%,-50%)", zIndex: hot ? 20 : 10,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
                      background: `var(--st-${sm.sev})`, color: "#fff", boxShadow: "var(--shadow-2)",
                      border: "2.5px solid #fff", position: "relative" }}>
                      <Icon name="robot" size={15} stroke={2.2} />
                      {hot && <span className="live-pulse" style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid var(--st-critical)" }} />}
                      {r.type === "pinch" && <span style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--ink-2)" }} />}
                    </div>
                    <span className="mono" style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 4,
                      background: "var(--surface)", border: "1px solid var(--line)", whiteSpace: "nowrap", boxShadow: "var(--shadow-1)" }}>
                      {r.id.replace("RBT-", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* control alert banner (mock toast) */}
        {toast && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px",
            borderRadius: "var(--r-sm)", border: `1px solid var(--st-${sevMap[toast.sev] ?? "notice"})`,
            background: "var(--surface)", boxShadow: "var(--shadow-2)" }}>
            <Icon name="alert" size={17} style={{ color: `var(--st-${sevMap[toast.sev] ?? "notice"})` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>관제 알림 발생</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{toast.label}</div>
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>twin · sim</span>
            <button className="btn sm" onClick={() => { setToast(null); setActiveEvent(null); }}><Icon name="close" size={13} /></button>
          </div>
        )}
      </div>

      {/* RIGHT — mirror + scenario sim */}
      <aside style={{ width: 320, flex: "none", borderLeft: "1px solid var(--line)",
        background: "var(--surface)", display: "flex", flexDirection: "column", overflow: "auto" }}>
        <PanelHead title="미러 상태" sub="실시간 디지털 미러" dense
          right={<span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--st-normal)", fontWeight: 700 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-normal)" }} /> sync
          </span>} />

        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { k: "latency", v: T.mirror.latency, icon: "activity" as const, sev: "normal" as const },
            { k: "sync", v: T.mirror.sync, icon: "refresh" as const, sev: "normal" as const },
            { k: "fidelity", v: T.mirror.fidelity, icon: "layers" as const, sev: "notice" as const },
          ].map(m => (
            <div key={m.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
              <Icon name={m.icon} size={16} style={{ color: "var(--ink-3)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)" }}>{m.k}</div>
                <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{m.v}</div>
              </div>
              {m.k === "fidelity"
                ? <StatusBadge sev="notice" label="2D · 3D 향후" dot={false} />
                : <StatusBadge sev={m.sev} label="ok" />}
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--line)" }} />

        <PanelHead title="시나리오 시뮬" sub="이벤트 주입 → 트윈 반영" dense />
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {T.simEvents.map(e => {
            const on = activeEvent === e.id;
            const sev = sevMap[e.sev] ?? "notice";
            return (
              <button key={e.id} onClick={() => fireEvent(e)}
                style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  border: `1px solid ${on ? `var(--st-${sev})` : "var(--line)"}`,
                  background: on ? "var(--surface-2)" : "var(--surface)",
                  borderRadius: "var(--r-sm)", padding: "10px 12px" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: `var(--st-${sev})`, flex: "none" }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{e.label}</span>
                <Icon name="play" size={13} style={{ color: "var(--ink-3)" }} />
              </button>
            );
          })}
          {activeEvent && (
            <button className="btn sm" onClick={() => { setActiveEvent(null); setToast(null); }}
              style={{ alignSelf: "flex-start", marginTop: 2 }}>
              <Icon name="rollback" size={13} /> 시뮬 초기화
            </button>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--line)" }} />

        <PanelHead title="배치 로봇" sub={`${T.robots.length}대 · ${T.greenhouse.id}`} dense />
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {T.robots.map(r => {
            const sm = stateMeta[r.state] ?? { label: r.state, sev: "disabled" as const };
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8,
                border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "8px 11px" }}>
                <RobotTypeTag type={r.type} size="sm" />
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{r.id.replace("RBT-", "")}</span>
                <StatusBadge sev={sm.sev} label={sm.label} />
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
