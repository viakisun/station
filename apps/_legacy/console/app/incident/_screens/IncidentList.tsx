"use client";
/* ============================================================
   C03-01 Incidents · 필터
   ============================================================ */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, StatusBadge } from "@station/design-system";
import { INCIDENT } from "@station/domain";
import { SrcTag, sevOf } from "./IncidentDash";

export function FilterGroup({
  label,
  value,
  set,
  opts,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  opts: [string, string][];
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 700 }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => set(v)} className={"chip" + (value === v ? " active" : "")} style={{ height: 28 }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function IncidentList({ density }: { density?: "compact" | "regular" }) {
  void density;
  const router = useRouter();
  const onOpen = (id: string) => router.push(`/incident/${id}`);

  const IC = INCIDENT;
  const [sev, setSev] = useState("all");
  const [status, setStatus] = useState("all");
  const [src, setSrc] = useState("all");
  const rows = IC.incidents.filter(
    (i) =>
      (sev === "all" || i.sev === sev) && (status === "all" || i.status === status) && (src === "all" || i.src === src),
  );

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FilterGroup
          label="Severity"
          value={sev}
          set={setSev}
          opts={[
            ["all", "all"],
            ["emergency", "emergency"],
            ["critical", "critical"],
            ["warning", "warning"],
            ["notice", "notice"],
          ]}
        />
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup
          label="Status"
          value={status}
          set={setStatus}
          opts={[
            ["all", "all"],
            ["open", "open"],
            ["progress", "in progress"],
            ["resolved", "resolved"],
          ]}
        />
        <div style={{ width: 1, height: 20, background: "var(--line)" }} />
        <FilterGroup
          label="Source"
          value={src}
          set={setSrc}
          opts={[
            ["all", "all"],
            ["robot", "robot"],
            ["firmware", "firmware"],
            ["hmi", "HMI"],
            ["telemetry", "Telemetry"],
          ]}
        />
        <div style={{ flex: 1 }} />
        <button className="btn sm">
          <Icon name="dl" size={14} /> CSV
        </button>
      </div>
      <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left", position: "sticky", top: 0 }}>
              {["Incident ID", "Severity", "Status", "Source", "Robot / module", "Cause", "Owner", "SLA", "Opened"].map((h, i) => (
                <th
                  key={i}
                  style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr
                key={i.id}
                onClick={() => onOpen(i.id)}
                className="hov-row"
                style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}
              >
                <td style={{ padding: "10px 12px" }}>
                  <span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>
                    {i.id}
                  </span>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 180,
                    }}
                  >
                    {i.title}
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <StatusBadge sev={sevOf(i)} label={IC.sevMeta[i.sev].label} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <StatusBadge sev={IC.statusMeta[i.status].sev} label={IC.statusMeta[i.status].label} dot={false} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <SrcTag src={i.src} />
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {i.robot}
                  </span>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                    {i.module}
                  </div>
                </td>
                <td style={{ padding: "10px 12px", color: "var(--ink-2)" }}>{i.cause}</td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: i.owner === "unassigned" ? "var(--st-critical)" : "var(--ink-2)",
                    fontWeight: i.owner === "unassigned" ? 700 : 500,
                  }}
                >
                  {i.owner}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {i.slaBreach ? (
                    <span style={{ color: "var(--st-critical)", fontWeight: 700 }} className="mono">
                      {i.sla}
                    </span>
                  ) : (
                    <span className="mono" style={{ color: "var(--ink-3)" }}>
                      {i.sla}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {i.at}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
