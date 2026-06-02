"use client";
/* ============================================================
   Telemetry 설정 — Step 2: 채널 맵 빌더 (시그니처)
   (원본: telemetry-console/screens_setup.jsx ChannelMapBuilder)
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@station/design-system";
import { TELEMETRY } from "@station/domain";
import { TStepHead, type Step } from "./helpers";

export function ChannelMapBuilder({ step }: { step: Step }) {
  const T = TELEMETRY;
  const ROWH = 50;
  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    T.rawSignals.forEach((r) => {
      if (r.mapped) m[r.id] = r.mapped;
    });
    return m;
  });
  const [selRaw, setSelRaw] = useState<string | null>(null);
  const [svgW, setSvgW] = useState(180);
  const svgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      if (svgRef.current) setSvgW(svgRef.current.clientWidth);
    };
    fit();
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 60);
    return () => {
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, []);

  const chIndex = (id: string) => T.channels.findIndex((c) => c.id === id);
  const mappedCount = Object.keys(mappings).length;

  const clickRaw = (r: (typeof T.rawSignals)[number]) => setSelRaw(selRaw === r.id ? null : r.id);
  const clickCh = (c: (typeof T.channels)[number]) => {
    if (!selRaw) return;
    setMappings((m) => ({ ...m, [selRaw]: c.id }));
    setSelRaw(null);
  };
  const unmap = (rid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMappings((m) => {
      const n = { ...m };
      delete n[rid];
      return n;
    });
  };

  const y = (i: number) => i * ROWH + ROWH / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TStepHead step={step} />
      <div style={{ flex: "none", padding: "10px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          {selRaw ? <b style={{ color: "var(--ink)" }}>Raw signal selected — tap a standard channel on the right to map</b> : "Tap a raw signal on the left, then a standard channel on the right to map"}
        </span>
        <div style={{ flex: 1 }} />
        <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap", flex: "none" }}>{mappedCount}/{T.rawSignals.length} 매핑</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 22px" }}>
        <div style={{ display: "flex", gap: 0, position: "relative" }}>
          {/* left: raw signals */}
          <div style={{ width: 300, flex: "none" }}>
            <ColLabel icon="database" label="Raw signals" sub="raw message fields" />
            {T.rawSignals.map((r) => {
              const on = selRaw === r.id,
                mapped = !!mappings[r.id];
              return (
                <div key={r.id} onClick={() => clickRaw(r)} style={{ height: ROWH, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", cursor: "pointer", border: "1px solid " + (on ? "var(--ink)" : "var(--line)"), borderRadius: "var(--r-sm)", marginBottom: 4, background: on ? "var(--surface-2)" : "var(--surface)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: mapped ? "var(--brand)" : "var(--st-warning)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{r.key}</div>
                    <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{r.hex} · {r.hint}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{r.sample}</span>
                </div>
              );
            })}
          </div>

          {/* center: connection lines */}
          <div ref={svgRef} style={{ flex: 1, position: "relative", minWidth: 80 }}>
            <div style={{ height: 44 }} />
            <svg width={svgW} height={T.rawSignals.length * ROWH} style={{ display: "block" }}>
              {T.rawSignals.map((r, i) => {
                const cid = mappings[r.id];
                if (!cid) return null;
                const ci = chIndex(cid);
                if (ci < 0) return null;
                const y1 = y(i),
                  y2 = y(ci);
                const d = `M0 ${y1} C ${svgW * 0.45} ${y1}, ${svgW * 0.55} ${y2}, ${svgW} ${y2}`;
                const hot = selRaw === r.id;
                return <path key={r.id} d={d} fill="none" stroke={hot ? "var(--ink)" : "var(--brand)"} strokeWidth={hot ? 2.4 : 1.8} opacity={hot ? 1 : 0.7} />;
              })}
            </svg>
          </div>

          {/* right: standard channels */}
          <div style={{ width: 300, flex: "none" }}>
            <ColLabel icon="layers" label="Standard channels" sub="platform TelemetryChannel" right />
            {T.channels.map((c) => {
              const mappedFrom = Object.entries(mappings).find(([, v]) => v === c.id);
              const armed = !!selRaw;
              return (
                <div key={c.id} onClick={() => clickCh(c)} style={{ height: ROWH, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", cursor: armed ? "pointer" : "default", border: "1px solid " + (mappedFrom ? "var(--line)" : armed ? "var(--brand)" : "var(--line)"), borderRadius: "var(--r-sm)", marginBottom: 4, background: mappedFrom ? "var(--surface)" : armed ? "var(--surface-2)" : "var(--surface)", borderStyle: mappedFrom ? "solid" : armed ? "dashed" : "solid" }}>
                  <Icon name={c.icon as IconName} size={16} style={{ color: "var(--ink-3)", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.label} <span style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{c.unit}</span></div>
                    <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{c.id}</div>
                  </div>
                  {mappedFrom && <button onClick={(e) => unmap(mappedFrom[0], e)} className="icon-btn" style={{ width: 24, height: 24, flex: "none" }}><Icon name="close" size={13} /></button>}
                  {!mappedFrom && <span style={{ fontSize: 9.5, color: "var(--st-warning)", fontWeight: 700, flex: "none" }}>unmapped</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: "none", padding: "11px 22px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, background: mappedCount >= 6 ? "var(--surface-2)" : "var(--tint-warning)" }}>
        <Icon name={mappedCount >= 6 ? "check" : "alert"} size={17} style={{ color: mappedCount >= 6 ? "var(--st-normal)" : "var(--st-warning)" }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: mappedCount >= 6 ? "var(--st-normal)" : "var(--st-warning)" }}>
          {mappedCount >= 6 ? `${mappedCount} channels mapped · unit & type checks passed` : "Required channels unmapped — map Env & Robot channels"}
        </span>
      </div>
    </div>
  );
}

function ColLabel({ icon, label, sub, right }: { icon: IconName; label: string; sub: string; right?: boolean }) {
  return (
    <div style={{ height: 44, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", paddingBottom: 6 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800 }}><Icon name={icon} size={15} style={{ color: "var(--ink-3)" }} /> {label}</span>
      <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{sub}</span>
    </div>
  );
}
