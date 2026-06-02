"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTROL } from "@station/domain";
import {
  Icon,
  StatusBadge,
  RobotTypeTag,
  KpiCard,
  MiniBars,
  PanelHead,
  type Sev,
} from "@station/design-system";
import { useShell } from "@station/shell";

interface DashboardScreenProps {
  layout?: "balanced" | "ops-first";
  density?: "regular" | "compact";
}

export function DashboardScreen({ layout = "balanced", density }: DashboardScreenProps) {
  const M = CONTROL;
  const router = useRouter();
  const { selectRobot, openSession } = useShell();
  const onSelectRobot = (id: string) => selectRobot(id);
  const onOpenSession = (id: string) => openSession(id);
  const onNavScreen = (key: string) => {
    if (key === "map") router.push("/control/map");
    else if (key === "workplan") router.push("/control/work-plan");
    else if (key === "maplist") router.push("/control/maps");
  };

  const [ghFilter, setGhFilter] = useState("ALL");
  const k = M.kpi;

  const sessions = M.sessions.filter((s) => ghFilter === "ALL" || s.gh === ghFilter);
  const crit = M.incidents.filter((i) => i.sev === "emergency" || i.sev === "critical");

  const thinRobots = M.robots.filter((r) => r.type === "thin");
  const pinchRobots = M.robots.filter((r) => r.type === "pinch");
  const util = (arr: typeof M.robots) =>
    Math.round((arr.filter((r) => r.state === "working").length / arr.length) * 100);

  const Kpis = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "var(--gap)" }}>
      <KpiCard label="Robots online" value={k.robotsOnline} unit={`/ ${k.robotsTotal}`} sub="3 working" sev="normal" icon="robot" onClick={() => onNavScreen("map")} />
      <KpiCard label="Active work" value={k.sessionsActive} unit="sess" sub="2 blocked" sev="notice" icon="board" onClick={() => onNavScreen("workplan")} />
      <KpiCard label="Open incidents" value={k.incidentsOpen} sub={`critical ${k.incidentsCritical}`} sev="critical" icon="alert" />
      <KpiCard label="E-stop" value={1} unit="" sub="RBT-THIN-0008" sev="emergency" icon="lock" onClick={() => onSelectRobot("RBT-THIN-0008")} />
      <KpiCard label="Telemetry quality" value={k.telemetryQuality} unit="%" sub="channel avg" sev="normal" icon="telemetry" />
      <KpiCard label="Deploys" value={k.deploys} unit="" sub="Canary 2/6" sev="notice" icon="chip" />
    </div>
  );

  const GreenhouseCards = (
    <div className="card">
      <PanelHead title="Greenhouse status" sub="3 houses" dense={density === "compact"}
        right={<div style={{ display: "flex", gap: 6 }}>
          <Chip active={ghFilter === "ALL"} onClick={() => setGhFilter("ALL")}>All</Chip>
          {M.greenhouses.map((g) => <Chip key={g.id} active={ghFilter === g.id} onClick={() => setGhFilter(g.id)}>{g.name}</Chip>)}
        </div>} />
      <div style={{ padding: "var(--pad-card)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {M.greenhouses.filter((g) => ghFilter === "ALL" || g.id === ghFilter).map((g) => {
          const robots = M.robots.filter((r) => r.gh === g.id);
          const work = robots.filter((r) => r.state === "working").length;
          return (
            <div key={g.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <span style={{ fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: `var(--st-${g.state})` }} />{g.name}
                </span>
                <StatusBadge sev={g.state as Sev} label={g.state === "warning" ? "env warning" : "normal"} dot={false} />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 11 }}>{g.crop} · {g.area} · {g.beds} beds {g.rows} rows</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                <EnvStat label="Temp" val={g.temp} unit="°C" warn={g.temp > 26} />
                <EnvStat label="Humidity" val={g.humidity} unit="%" warn={g.humidity > 72} />
                <EnvStat label="CO₂" val={g.co2} unit="ppm" warn={false} />
              </div>
              <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>Robots <b className="tnum">{robots.length}</b> · working <b className="tnum" style={{ color: "var(--st-normal)" }}>{work}</b></span>
                <button className="btn ghost sm" onClick={() => onNavScreen("map")}>Map <Icon name="chevR" size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const WorkTable = (
    <div className="card">
      <PanelHead title="Active work" sub={`${sessions.length} sessions`} dense={density === "compact"}
        right={<button className="btn ghost sm" onClick={() => onNavScreen("workplan")}>Work board <Icon name="ext" size={13} /></button>} />
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
              {["Session", "Type", "Robot", "Zone", "Progress", "Status", ""].map((h, i) =>
                <th key={i} style={{ padding: "9px 12px", fontWeight: 700, fontSize: 11, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }} className="hov-row">
                <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5 }}>{s.id}</span></td>
                <td style={{ padding: "9px 12px" }}><RobotTypeTag type={s.type} size="sm" /></td>
                <td style={{ padding: "9px 12px" }}>
                  <button onClick={() => onSelectRobot(s.robot)} className="mono linkish" style={{ fontSize: 11.5 }}>{s.robot}</button>
                </td>
                <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{s.zone}</td>
                <td style={{ padding: "9px 12px", minWidth: 110 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: s.progress + "%", height: "100%", background: s.status === "blocked" ? "var(--st-critical)" : "var(--brand)" }} />
                    </div>
                    <span className="tnum" style={{ fontSize: 11, fontWeight: 700, width: 28 }}>{s.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px" }}><StatusBadge sev={M.workMeta[s.status].sev} label={M.workMeta[s.status].label} /></td>
                <td style={{ padding: "9px 12px" }}>
                  <button className="btn ghost sm" onClick={() => onOpenSession(s.id)}><Icon name="ext" size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CritList = (
    <div className="card">
      <PanelHead title="Emergency / critical" sub="immediate action" dense={density === "compact"}
        right={<StatusBadge sev="critical" label={`${crit.length}`} />} />
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {crit.map((i) => (
          <button key={i.id} onClick={() => onSelectRobot(i.robot)} style={{
            textAlign: "left", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 11, background: "var(--surface)", display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <StatusBadge sev={M.sevMeta[i.sev].sev} label={M.sevMeta[i.sev].label} />
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{i.at}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{i.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)" }}>
              <span className="mono">{i.robot}</span>
              <span>{i.owner === "unassigned" ? <span style={{ color: "var(--st-critical)", fontWeight: 700 }}>unassigned · SLA {i.sla}</span> : `owner ${i.owner}`}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const UtilChart = (
    <div className="card">
      <PanelHead title="Utilization by type" dense={density === "compact"} />
      <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 16 }}>
        <MiniBars items={[
          { label: "Thin", value: util(thinRobots), unit: "%", color: "var(--ink)" },
          { label: "Pinch", value: util(pinchRobots), unit: "%", color: "var(--ink-3)" },
        ]} max={100} />
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 13 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 9 }}>State distribution</div>
          <StateDistribution robots={M.robots} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {Kpis}
      {layout === "ops-first" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "var(--gap)" }}>{WorkTable}{CritList}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--gap)" }}>{GreenhouseCards}{UtilChart}</div>
        </>
      ) : (
        <>
          {GreenhouseCards}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 320px", gap: "var(--gap)" }}>
            {WorkTable}{CritList}{UtilChart}
          </div>
        </>
      )}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={"chip" + (active ? " active" : "")} onClick={onClick}>{children}</button>;
}
function EnvStat({ label, val, unit, warn }: { label: string; val: number; unit: string; warn: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "6px 2px", borderRadius: 5, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        {warn && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--st-warning)" }} />}{label}
      </div>
      <div className="tnum" style={{ fontSize: 14, fontWeight: 800, color: warn ? "var(--st-warning)" : "var(--ink)" }}>{val}<span style={{ fontSize: 9, fontWeight: 600, color: "var(--ink-3)" }}>{unit}</span></div>
    </div>
  );
}
function StateDistribution({ robots }: { robots: typeof CONTROL.robots }) {
  const M = CONTROL;
  const counts: Record<string, number> = {};
  robots.forEach((r) => { const s = M.robotStateMeta[r.state].sev; counts[s] = (counts[s] || 0) + 1; });
  const order = ["normal", "notice", "warning", "critical", "emergency", "disabled"];
  return (
    <div>
      <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
        {order.filter((s) => counts[s]).map((s) => (
          <div key={s} style={{ flex: counts[s], background: `var(--st-${s})` }} title={`${s}: ${counts[s]}`} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
        {order.filter((s) => counts[s]).map((s) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-2)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: `var(--st-${s})` }} />
            <span className="tnum" style={{ fontWeight: 700 }}>{counts[s]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
