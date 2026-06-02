"use client";
import { useState, Fragment } from "react";
import { CONTROL, type WorkPlanItem } from "@station/domain";
import {
  Icon,
  StatusBadge,
  RobotTypeTag,
} from "@station/design-system";
import { useShell } from "@station/shell";

interface WorkPlanScreenProps {
  density?: "regular" | "compact";
}

export function WorkPlanScreen({ density }: WorkPlanScreenProps) {
  const M = CONTROL;
  const { selectRobot, openSession } = useShell();
  const onSelectRobot = (id: string) => selectRobot(id);
  const onOpenSession = (id: string) => openSession(id);

  const [view, setView] = useState("kanban");
  const cols = [
    { key: "planned",  label: "Planned" },
    { key: "assigned", label: "Assigned" },
    { key: "running",  label: "Running" },
    { key: "completed",label: "Completed" },
  ];

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", background: "var(--surface-3)", borderRadius: "var(--r-sm)", padding: 3 }}>
          {[["kanban", "Kanban"], ["calendar", "Calendar"]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} style={{
              padding: "6px 14px", border: "none", borderRadius: 5, fontSize: 12.5, fontWeight: 700,
              background: view === k ? "var(--surface)" : "transparent", color: view === k ? "var(--ink)" : "var(--ink-3)",
              boxShadow: view === k ? "var(--shadow-1)" : "none" }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn primary"><Icon name="plus" size={15} /> New work</button>
      </div>

      {view === "calendar" ? <CalendarView /> : (
        <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {cols.map((c) => {
            const cards = M.workplan.filter((w) => w.status === c.key);
            return (
              <div key={c.key} className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--surface-2)" }}>
                <div style={{ padding: "11px 13px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "1px 8px" }}>{cards.length}</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 9 }}>
                  {cards.map((w) => <WorkCard key={w.id} w={w} onSelectRobot={onSelectRobot} onOpenSession={onOpenSession} />)}
                  {!cards.length && <div style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center", padding: 16 }}>No items</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function WorkCard({ w, onSelectRobot, onOpenSession }: { w: WorkPlanItem; onSelectRobot: (id: string) => void; onOpenSession?: (id: string) => void }) {
  const M = CONTROL;
  const wm = M.workMeta[w.status];
  const prioColor = w.prio === "high" ? "var(--st-critical)" : "var(--ink-3)";
  return (
    <div className="card" style={{ padding: 11, boxShadow: "var(--shadow-1)", cursor: "grab" }}
      onClick={() => w.status === "running" && onOpenSession && onOpenSession(M.sessions.find((s) => s.zone === w.zone)?.id || M.sessions[0].id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <RobotTypeTag type={w.type} size="sm" />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: prioColor }}>● {w.prio}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{w.zone}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginBottom: 9 }}>
        <span className="mono">{w.route}</span>
        <span>{M.greenhouses.find((g) => g.id === w.gh)?.name}</span>
      </div>
      {w.robot ? (
        <button onClick={(e) => { e.stopPropagation(); onSelectRobot(w.robot!); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 6,
            border: "1px solid var(--line)", background: "var(--surface-2)", marginBottom: 8 }}>
          <Icon name="robot" size={14} style={{ color: "var(--ink-2)" }} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{w.robot.replace("RBT-", "")}</span>
        </button>
      ) : (
        <div style={{ padding: "6px 8px", borderRadius: 6, border: "1px dashed var(--line-strong)", marginBottom: 8,
          fontSize: 11, color: "var(--ink-3)", textAlign: "center", fontWeight: 600 }}>Robot unassigned — recommend</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--ink-3)" }}>
          <Icon name="clock" size={12} /> {w.win}
        </span>
        <StatusBadge sev={wm.sev} label={wm.label} />
      </div>
      {w.warn && (
        <div style={{ marginTop: 8, padding: "5px 8px", borderRadius: 5, background: "var(--tint-warning)", color: "var(--st-warning)", border: "1px solid #efe3c6",
          fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="alert" size={12} /> {w.warn}
        </div>
      )}
    </div>
  );
}

export function CalendarView() {
  const hours = ["07", "08", "09", "10", "11", "12", "13", "14"];
  const lanes = [
    { gh: "Greenhouse A", blocks: [{ s: 1, w: 2, t: "thin", l: "A-3 Thin" }, { s: 4, w: 1.5, t: "pinch", l: "A-6 Pinch" }, { s: 6, w: 1, t: "thin", l: "A-1" }] },
    { gh: "Greenhouse B", blocks: [{ s: 0.5, w: 2, t: "pinch", l: "B-2 Pinch" }, { s: 3, w: 2, t: "thin", l: "B-4 Thin" }] },
    { gh: "Greenhouse C", blocks: [{ s: 0, w: 1.5, t: "thin", l: "C-1 Thin" }, { s: 4.5, w: 1, t: "thin", l: "C-3" }] },
  ];
  return (
    <div className="card" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "90px 1fr" }}>
        <div />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${hours.length},1fr)`, borderBottom: "1px solid var(--line)" }}>
          {hours.map((h) => <div key={h} style={{ padding: "9px 0", textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", borderLeft: "1px solid var(--line)" }}>{h}:00</div>)}
        </div>
        {lanes.map((lane, i) => (
          <Fragment key={i}>
            <div style={{ padding: "0 12px", display: "flex", alignItems: "center", fontSize: 12.5, fontWeight: 700, borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}>{lane.gh}</div>
            <div style={{ position: "relative", height: 64, borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: `repeat(${hours.length},1fr)` }}>
              {hours.map((h, hi) => <div key={hi} style={{ borderLeft: "1px solid var(--line)" }} />)}
              {lane.blocks.map((b, bi) => {
                const thin = b.t === "thin";
                return (
                  <div key={bi} style={{ position: "absolute", top: 12, height: 40, left: `${b.s / hours.length * 100}%`, width: `${b.w / hours.length * 100}%`,
                    background: "var(--surface-2)", border: "1px solid var(--line-strong)",
                    borderRadius: 5, padding: "5px 9px", display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", flex: "none", background: thin ? "var(--ink)" : "transparent", border: thin ? "none" : "1.5px solid var(--ink-2)" }} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>{b.l}</span>
                  </div>
                );
              })}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
