"use client";
/* ============================================================
   C03-02 실시간 events 스트림 (시그니처)
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, PanelHead, StatusBadge } from "@station/design-system";
import { INCIDENT } from "@station/domain";
import { SrcTag, sevRank } from "./IncidentDash";
import { FilterGroup } from "./IncidentList";

type StreamEvent = {
  t: string;
  sev: string;
  src: string;
  code: string;
  node: string;
  msg: string;
  promoted?: string | null;
  _new?: boolean;
  _k?: string;
};

function rawPayload(e: StreamEvent) {
  return `{\n  "event_code": "${e.code}",\n  "severity": "${e.sev}",\n  "source": "${e.src}",\n  "source_id": "${e.node}",\n  "occurred_at": "2026-06-01T${e.t}",\n  "payload": { "value": ${(Math.random() * 100).toFixed(1)}, "unit": "raw" }\n}`;
}

export function EventStream({ density }: { density?: "compact" | "regular" }) {
  void density;
  const router = useRouter();
  const onOpen = (id: string) => router.push(`/incident/${id}`);

  const IC = INCIDENT;
  const [events, setEvents] = useState<StreamEvent[]>(IC.streamSeed);
  const [paused, setPaused] = useState(false);
  const [sevF, setSevF] = useState("all");
  const [sel, setSel] = useState<StreamEvent | null>(null);
  const ptr = useRef(0);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const seed = IC.streamIncoming[ptr.current % IC.streamIncoming.length];
      ptr.current++;
      const e: StreamEvent = {
        ...seed,
        t: new Date().toTimeString().slice(0, 8),
        promoted: seed.sev === "critical" ? "INC-new" : null,
        _new: true,
      };
      setEvents((prev) => [e, ...prev].slice(0, 40));
    }, 2200);
    return () => clearInterval(iv);
  }, [paused]);

  const shown = events.filter((e) => sevF === "all" || e.sev === sevF || (sevF === "warn+" && sevRank(e.sev) >= 3));

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className={"btn sm " + (paused ? "" : "primary")} onClick={() => setPaused((p) => !p)}>
          <Icon name={paused ? "play" : "pause"} size={14} /> {paused ? "Resume" : "Pause"}
        </button>
        {!paused && (
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--st-normal)" }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-live)" }} /> receiving
          </span>
        )}
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup
          label="Severity"
          value={sevF}
          set={setSevF}
          opts={[
            ["all", "all"],
            ["warn+", "warn+"],
            ["critical", "critical"],
            ["emergency", "emergency"],
          ]}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{shown.length} events · dedup active</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: sel ? "1fr 380px" : "1fr", gap: "var(--gap)" }}>
        <div className="card" style={{ minHeight: 0, overflow: "auto" }}>
          {shown.map((e, i) => {
            const m = IC.sevMeta[e.sev],
              sm = IC.srcMeta[e.src];
            void sm;
            const on = sel && sel._k === e.t + e.code + i;
            return (
              <button
                key={e.t + e.code + i}
                onClick={() => setSel({ ...e, _k: e.t + e.code + i })}
                className="hov-row"
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "9px 14px",
                  border: "none",
                  borderBottom: "1px solid var(--line)",
                  borderLeft: on ? "2px solid var(--ink)" : "2px solid transparent",
                  background: on ? "var(--surface-2)" : e._new ? "var(--surface-2)" : "transparent",
                }}
              >
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 60, flex: "none" }}>
                  {e.t}
                </span>
                <StatusBadge sev={m.sev} label={m.label} />
                <SrcTag src={e.src} />
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-2)",
                    width: 130,
                    flex: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {e.node}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {e.msg}
                </span>
                {e.promoted && (
                  <span className="badge critical" style={{ flex: "none" }}>
                    <Icon name="flag" size={11} /> promoted
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {sel && (
          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PanelHead
              title="Event detail"
              sub={sel.code}
              dense
              right={
                <button className="icon-btn" onClick={() => setSel(null)}>
                  <Icon name="close" size={17} />
                </button>
              }
            />
            <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge sev={IC.sevMeta[sel.sev].sev} label={IC.sevMeta[sel.sev].label} />
                <SrcTag src={sel.src} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {sel.t}
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{sel.msg}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>raw payload</div>
                <div style={{ background: "#1c1c1a", borderRadius: 8, padding: 12 }}>
                  <pre className="mono" style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: "#ddd", whiteSpace: "pre-wrap" }}>
                    {rawPayload(sel)}
                  </pre>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" style={{ flex: 1 }}>
                  <Icon name="dot" size={14} /> Copy
                </button>
                <button className="btn danger" style={{ flex: 1 }} onClick={() => onOpen("INC-20260601-0229")}>
                  <Icon name="alert" size={14} /> Create incident
                </button>
              </div>
              {sel.promoted && (
                <div
                  style={{
                    padding: "9px 11px",
                    borderRadius: "var(--r-sm)",
                    background: "var(--tint-critical)",
                    border: "1px solid #f0d9ca",
                    fontSize: 11.5,
                    color: "var(--st-critical)",
                    fontWeight: 600,
                  }}
                >
                  Auto-promoted to an incident by an incident rule.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
