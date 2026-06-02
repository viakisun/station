"use client";
/* ============================================================
   C03-00 장애 운영 대시보드
   ============================================================ */
import { useRouter } from "next/navigation";
import { Icon, type IconName, KpiCard, PanelHead, StatusBadge } from "@station/design-system";
import { INCIDENT, type Incident } from "@station/domain";

export function sevOf(i: Incident) {
  return INCIDENT.sevMeta[i.sev].sev;
}
export function sevRank(s: string) {
  return ({ emergency: 5, critical: 4, warning: 3, notice: 2, info: 1 } as Record<string, number>)[s] || 0;
}

export function SrcTag({ src }: { src: string }) {
  const m = INCIDENT.srcMeta[src];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 20,
        padding: "0 7px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        color: "var(--ink-2)",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
      }}
    >
      <Icon name={m.icon as IconName} size={12} /> {m.label}
    </span>
  );
}

function SourceDist() {
  const IC = INCIDENT;
  const counts: Record<string, number> = {};
  IC.incidents.forEach((i) => (counts[i.src] = (counts[i.src] || 0) + 1));
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {entries.map(([src, n]) => {
        const m = IC.srcMeta[src];
        return (
          <div key={src} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 70,
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11.5,
                color: "var(--ink-2)",
                fontWeight: 600,
                flex: "none",
              }}
            >
              <Icon name={m.icon as IconName} size={13} /> {m.label}
            </span>
            <div style={{ flex: 1, height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: (n / max) * 100 + "%", height: "100%", background: "var(--ink)", borderRadius: 999 }} />
            </div>
            <span className="tnum" style={{ width: 20, textAlign: "right", fontSize: 12, fontWeight: 700 }}>
              {n}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function IncidentDash({ density }: { density?: "compact" | "regular" }) {
  const router = useRouter();
  const onOpen = (id: string) => router.push(`/incident/${id}`);
  const onNav = (viewId: string) => {
    if (viewId === "list") router.push("/incident/list");
  };

  const IC = INCIDENT,
    k = IC.kpi;
  const queue = IC.incidents
    .filter((i) => i.status === "open" || i.status === "ack" || i.status === "progress")
    .sort((a, b) => sevRank(b.sev) - sevRank(a.sev));
  const recurring = [...IC.incidents].filter((i) => i.recur > 1).sort((a, b) => b.recur - a.recur).slice(0, 5);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "var(--gap)" }}>
        <KpiCard label="open incidents" value={k.open} sev="critical" icon="alert" onClick={() => onNav("list")} />
        <KpiCard label="critical+" value={k.critical} sev="critical" icon="flag" />
        <KpiCard label="SLA breach" value={k.slaBreach} sev={k.slaBreach ? "critical" : undefined} icon="clock" />
        <KpiCard label="today" value={k.today} unit="" icon="trending" />
        <KpiCard label="recurring" value={k.recurring} sev="warning" icon="refresh" />
        <KpiCard label="avg MTTR" value={k.mttr} icon="wrench" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* action queue */}
        <div className="card">
          <PanelHead
            title="Action queue"
            sub="open critical · SLA-breach first"
            dense={density === "compact"}
            right={
              <button className="btn ghost sm" onClick={() => onNav("list")}>
                all incidents <Icon name="ext" size={13} />
              </button>
            }
          />
          <div>
            {queue.map((i) => (
              <button
                key={i.id}
                onClick={() => onOpen(i.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  border: "none",
                  borderBottom: "1px solid var(--line)",
                  background: "transparent",
                }}
                className="hov-row"
              >
                <StatusBadge sev={sevOf(i)} label={IC.sevMeta[i.sev].label} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {i.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <SrcTag src={i.src} />
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                      {i.robot} · {i.code}
                    </span>
                  </div>
                </div>
                {i.slaBreach && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-critical)" }}>SLA {i.sla}</span>}
                <span
                  style={{
                    fontSize: 11,
                    color: i.owner === "unassigned" ? "var(--st-critical)" : "var(--ink-3)",
                    fontWeight: i.owner === "unassigned" ? 700 : 500,
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  {i.owner}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 44, textAlign: "right" }}>
                  {i.at}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* recurring rank */}
          <div className="card">
            <PanelHead title="Recurring incidents" sub="by recurrence count" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              {recurring.map((i, n) => (
                <button
                  key={i.id}
                  onClick={() => onOpen(i.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span className="tnum" style={{ width: 18, fontSize: 13, fontWeight: 800, color: "var(--ink-3)" }}>
                    {n + 1}
                  </span>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${sevOf(i)})`, flex: "none" }} />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {i.title}
                  </span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--st-warning)" }}>
                    ×{i.recur}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* source distribution */}
          <div className="card">
            <PanelHead title="By source" sub="event origin" dense />
            <div style={{ padding: 14 }}>
              <SourceDist />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
