"use client";
// [SWS-OPS-TELE-MON / SWC-AGENT-MIRROR] Telemetry Monitor — read-only (제어권 0 · TELEMETRY).
import { SurfaceHeader } from "@station/app-kit";
import { Sparkline, StatusBadge, type Sev } from "@station/design-system";
import { getTelemetryData } from "@station/domain";

const qSev = (q: string): Sev => (q === "good" ? "normal" : q === "warn" ? "warning" : "critical");

export default function Page() {
  const quality = getTelemetryData().quality;
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-TELE-MON" right={<span className="mono" style={{ fontSize: 10.5, color: "var(--st-critical)" }}>read-only · controlMode none</span>} />
      <div style={{ padding: 14 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["channel", "quality", "complete", "latency", "drift", "trend"].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", fontSize: 9.5, textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quality.map((q) => (
                <tr key={q.ch} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "7px 10px" }}>{q.label}</td>
                  <td style={{ padding: "7px 10px" }}><StatusBadge sev={qSev(q.q)} label={q.q} /></td>
                  <td className="mono tnum" style={{ padding: "7px 10px" }}>{q.complete}%</td>
                  <td className="mono tnum" style={{ padding: "7px 10px", color: "var(--ink-2)" }}>{q.latency}ms</td>
                  <td className="mono" style={{ padding: "7px 10px", color: "var(--ink-3)" }}>{q.drift}</td>
                  <td style={{ padding: "7px 10px" }}><Sparkline data={q.series} w={80} h={22} color={`var(--st-${qSev(q.q)})`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 8 }}>cloud 관찰면(④) — Telemetry Gateway 업링크의 read-only 미러. 명령 경로 없음(useDispatch 미import).</div>
      </div>
    </div>
  );
}
