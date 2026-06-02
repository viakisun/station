/* ============================================================
   공통 컴포넌트 — StatusBadge, Icon, KPI, Sparkline, 확인 모달 …
   window 으로 export (다른 babel 스크립트와 스코프 공유)
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

/* ---- 라인 아이콘 세트 (간단한 stroke SVG) ---- */
const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  route: "M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM18 8h-5a3 3 0 00-3 3v2a3 3 0 01-3 3H6",
  board: "M4 4h16v16H4zM4 9h16M9 9v11M14 9v11",
  audit: "M9 3h6l1 3h3v15H5V6h3l1-3zM9 13l2 2 4-4",
  alert: "M12 3l9 16H3l9-16zM12 9v5M12 17h.01",
  chip: "M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z",
  hmi: "M4 5h16v11H4zM2 20h20M9 16v4M15 16v4",
  telemetry: "M4 14a8 8 0 0116 0M7 14a5 5 0 0110 0M12 14a0 0 0 010 0M3 18h18",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 00-2-1.2L14 2h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 22h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.5-2-1.5A7 7 0 0019 12z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0",
  chevR: "M9 6l6 6-6 6", chevD: "M6 9l6 6 6-6", chevL: "M15 6l-6 6 6 6",
  close: "M6 6l12 12M18 6L6 18",
  battery: "M3 8h14v8H3zM17 11h2v2h-2",
  robot: "M12 2v3M7 7h10v9H7zM10 11h.01M14 11h.01M9 20h6M9 16v4M15 16v4",
  pause: "M8 5v14M16 5v14", play: "M7 4l13 8-13 8z", stop: "M6 6h12v12H6z",
  home2: "M3 11l9-8 9 8M5 10v10h14V10",
  refresh: "M21 12a9 9 0 11-3-6.7M21 4v4h-4",
  filter: "M3 5h18l-7 8v5l-4 2v-7z",
  ext: "M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5",
  check: "M5 13l4 4 10-11", lock: "M6 11h12v9H6zM9 11V8a3 3 0 016 0v3",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  plus: "M12 5v14M5 12h14", dl: "M12 4v11M7 11l5 5 5-5M4 20h16",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5",
  grip: "M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01",
  beaker: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7 14h10",
  pkg: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  branch: "M6 3v12M6 21a3 3 0 100-6 3 3 0 000 6zM6 6a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM18 6a9 9 0 01-9 9",
  rocket: "M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11a8 8 0 015-7c4 0 6 2 6 6a8 8 0 01-7 5l-2-2-2-2zM14 9h.01",
  terminal: "M4 5h16v14H4zM7 9l3 3-3 3M13 15h4",
  code: "M8 6l-5 6 5 6M16 6l5 6-5 6",
  key: "M14 7a4 4 0 11-4 4l-7 7v3h3l1-1v-2h2v-2h2l1.5-1.5A4 4 0 0014 7z",
  server: "M4 4h16v6H4zM4 14h16v6H4zM7 7h.01M7 17h.01",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  rollback: "M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 4v4h4",
  gauge: "M12 14l4-4M5 19a9 9 0 1114 0M12 14a2 2 0 100-4 2 2 0 000 4",
  fileCode: "M7 3h7l5 5v13H7zM14 3v5h5M10 13l-2 2 2 2M14 13l2 2-2 2",
  flag: "M5 21V4h11l-1.5 4L16 12H5",
};
function Icon({ name, size = 18, stroke = 2, style, className }) {
  const d = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true">
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---- StatusBadge: sev(normal/notice/warning/critical/emergency/disabled) ---- */
function StatusBadge({ sev = "normal", label, dot = true, style }) {
  return (
    <span className={"badge " + sev} style={style}>
      {dot && <span className="dot" />}
      {label}
    </span>
  );
}

/* ---- 로봇 유형 태그 (적과/적심) ---- */
function RobotTypeTag({ type, size = "md" }) {
  const thin = type === "thin";
  const sm = size === "sm";
  // 중립 칩 + 마커로 구분 (적과=채워진 점, 적심=빈 점). 컬러 절제.
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      height: sm ? 18 : 20, padding: sm ? "0 6px" : "0 7px", borderRadius: 4,
      fontSize: sm ? 10.5 : 11.5, fontWeight: 700, letterSpacing: ".2px",
      color: "var(--ink-2)", background: "var(--surface-2)", border: "1px solid var(--line)",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: thin ? "var(--ink)" : "transparent",
        border: thin ? "none" : "1.5px solid var(--ink-2)" }} />
      {thin ? "Thin" : "Pinch"}
    </span>
  );
}

/* ---- 배터리 ---- */
function Battery({ pct }) {
  const color = pct <= 0 ? "var(--st-disabled)" : pct < 25 ? "var(--st-critical)" : pct < 45 ? "var(--st-warning)" : "var(--st-normal)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
      <span style={{ position: "relative", width: 24, height: 12, border: "1.5px solid var(--line-strong)", borderRadius: 3 }}>
        <span style={{ position: "absolute", right: -3, top: 3, width: 2, height: 6, background: "var(--line-strong)", borderRadius: 1 }} />
        <span style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: `calc(${Math.max(0, Math.min(100, pct))}% - 2px)`, background: color, borderRadius: 1 }} />
      </span>
      <span className="mono">{pct}%</span>
    </span>
  );
}

/* ---- KPI 카드 ---- */
function KpiCard({ label, value, unit, sub, sev, icon, onClick }) {
  const alert = sev === "critical" || sev === "emergency";
  return (
    <div className="card" onClick={onClick} style={{
      padding: "13px 15px", display: "flex", flexDirection: "column", gap: 7,
      cursor: onClick ? "pointer" : "default", minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
          {alert && <span style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--st-${sev})`, flex: "none" }} />}
          {label}
        </span>
        {icon && <span style={{ color: "var(--ink-3)", flex: "none" }}><Icon name={icon} size={15} stroke={1.8} /></span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="tnum" style={{ fontSize: 25, fontWeight: 700, lineHeight: 1, letterSpacing: "-.6px", color: alert ? `var(--st-${sev})` : "var(--ink)" }}>{value}</span>
        {unit && <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-3)" }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</span>}
    </div>
  );
}

/* ---- Sparkline ---- */
function Sparkline({ data = [], w = 120, h = 34, color = "var(--brand)", fill = true }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - 4 - ((v - min) / range) * (h - 8) ]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {fill && <path d={area} fill={color} opacity=".10" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.4" fill={color} />
    </svg>
  );
}

/* ---- 미니 막대 차트 (가동률 등) ---- */
function MiniBars({ items, max }) {
  const m = max || Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 56, fontSize: 12, color: "var(--ink-2)", fontWeight: 600, flex: "none" }}>{it.label}</span>
          <div style={{ flex: 1, height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: (it.value / m * 100) + "%", height: "100%", background: it.color || "var(--brand)", borderRadius: 999 }} />
          </div>
          <span className="tnum" style={{ width: 38, textAlign: "right", fontSize: 12, fontWeight: 700 }}>{it.value}{it.unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- 패널 헤더 ---- */
function PanelHead({ title, sub, right, dense }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: dense ? "10px 14px" : "13px 16px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---- 위험 액션 확인 모달 (감사 로그 고지 포함) ---- */
function ConfirmModal({ open, title, body, danger, confirmLabel = "Confirm", auditNote, onConfirm, onClose, requireHold }) {
  const [held, setHeld] = useState(0);
  const timer = useRef(null);
  useEffect(() => { if (!open) setHeld(0); }, [open]);
  if (!open) return null;
  const startHold = () => {
    if (!requireHold) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, (Date.now() - t0) / 1200 * 100);
      setHeld(p);
      if (p >= 100) { clearInterval(timer.current); onConfirm && onConfirm(); }
    }, 16);
  };
  const endHold = () => { if (timer.current) clearInterval(timer.current); if (held < 100) setHeld(0); };
  return (
    <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,25,35,.42)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(1.5px)" }}>
      <div onMouseDown={e => e.stopPropagation()} className="card" style={{ width: 440, boxShadow: "var(--shadow-3)", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 4px", display: "flex", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, flex: "none", display: "grid", placeItems: "center",
            color: danger ? "var(--st-emergency)" : "var(--brand)", background: danger ? "var(--tint-critical)" : "var(--surface-2)" }}>
            <Icon name={danger ? "alert" : "shield"} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 5, lineHeight: 1.5 }}>{body}</div>
          </div>
        </div>
        <div style={{ margin: "14px 20px 0", padding: "9px 11px", borderRadius: 7, background: "var(--surface-2)",
          border: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: "var(--ink-2)" }}>
          <Icon name="audit" size={15} style={{ color: "var(--ink-3)", flex: "none" }} />
          {auditNote || "This action is recorded to audit_log with operator, time and reason."}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 20px" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          {requireHold ? (
            <button className={"btn " + (danger ? "danger" : "primary")} style={{ position: "relative", overflow: "hidden", minWidth: 150 }}
              onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: held + "%", background: "rgba(255,255,255,.28)" }} />
              <span style={{ position: "relative" }}>{held > 0 && held < 100 ? "Hold…" : "Hold to execute"}</span>
            </button>
          ) : (
            <button className={"btn " + (danger ? "danger" : "primary")} onClick={() => onConfirm && onConfirm()}>{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- 빈/지연 상태 안내 ---- */
function EmptyNote({ icon = "doc", title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, padding: "40px 20px", color: "var(--ink-3)", textAlign: "center" }}>
      <Icon name={icon} size={28} />
      <div style={{ fontWeight: 700, color: "var(--ink-2)", fontSize: 14 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBadge, RobotTypeTag, Battery, KpiCard, Sparkline, MiniBars,
  PanelHead, ConfirmModal, EmptyNote,
});
