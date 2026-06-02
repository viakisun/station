/* ============================================================
   C01-04 작업 계획 보드 (칸반)  +  C01-01 온실 맵 목록/버전 관리
   ============================================================ */

function WorkPlanScreen({ onSelectRobot, onOpenSession, density }) {
  const M = window.MOCK;
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
          {cols.map(c => {
            const cards = M.workplan.filter(w => w.status === c.key);
            return (
              <div key={c.key} className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--surface-2)" }}>
                <div style={{ padding: "11px 13px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "1px 8px" }}>{cards.length}</span>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 9 }}>
                  {cards.map(w => <WorkCard key={w.id} w={w} onSelectRobot={onSelectRobot} onOpenSession={onOpenSession} />)}
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

function WorkCard({ w, onSelectRobot, onOpenSession }) {
  const M = window.MOCK;
  const wm = M.workMeta[w.status];
  const prioColor = w.prio === "high" ? "var(--st-critical)" : "var(--ink-3)";
  return (
    <div className="card" style={{ padding: 11, boxShadow: "var(--shadow-1)", cursor: "grab" }}
      onClick={() => w.status === "running" && onOpenSession && onOpenSession(M.sessions.find(s => s.zone === w.zone)?.id || M.sessions[0].id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <RobotTypeTag type={w.type} size="sm" />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: prioColor }}>● {w.prio}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{w.zone}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", marginBottom: 9 }}>
        <span className="mono">{w.route}</span>
        <span>{M.greenhouses.find(g => g.id === w.gh)?.name}</span>
      </div>
      {w.robot ? (
        <button onClick={(e) => { e.stopPropagation(); onSelectRobot(w.robot); }}
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

function CalendarView() {
  const M = window.MOCK;
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
          {hours.map(h => <div key={h} style={{ padding: "9px 0", textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", borderLeft: "1px solid var(--line)" }}>{h}:00</div>)}
        </div>
        {lanes.map((lane, i) => (
          <React.Fragment key={i}>
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- C01-01 맵 목록 ---------------- */
function MapListScreen({ density }) {
  const M = window.MOCK;
  const validMeta = { passed: { sev: "normal", label: "passed" }, running: { sev: "notice", label: "validating" }, failed: { sev: "critical", label: "failed" } };
  const stateMeta = { "active": "normal", "draft": "disabled", "validation failed": "critical", "archived": "disabled" };
  const [sel, setSel] = useState(M.maps[0].id);
  const selMap = M.maps.find(m => m.id === sel);

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", gap: "var(--gap)", height: "100%", minHeight: 0 }}>
      <div className="card" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <PanelHead title="Greenhouse maps" sub={`${M.maps.length} versions · 3 active / 1 draft`} dense={density === "compact"}
          right={<button className="btn primary"><Icon name="plus" size={15} /> New map</button>} />
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["Map / version", "Greenhouse", "State", "Routes", "Validation", "Updated", "Author"].map((h, i) =>
                  <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {M.maps.map(m => (
                <tr key={m.id} onClick={() => setSel(m.id)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer",
                  background: sel === m.id ? "var(--surface-2)" : "transparent" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.id}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-2)" }}>{M.greenhouses.find(g => g.id === m.gh)?.name}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge sev={stateMeta[m.state]} label={m.state} /></td>
                  <td style={{ padding: "10px 14px" }} className="tnum">{m.routes}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge sev={validMeta[m.valid].sev} label={validMeta[m.valid].label} /></td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-3)" }} className="mono">{m.updated}</td>
                  <td style={{ padding: "10px 14px", color: "var(--ink-2)" }}>{m.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* validation summary panel */}
      <div className="card" style={{ width: 320, flex: "none", display: "flex", flexDirection: "column" }}>
        <PanelHead title="Validation summary" sub={selMap.id} dense />
        <div style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 7, border: "1px solid var(--line)",
            background: selMap.valid === "failed" ? "var(--tint-critical)" : selMap.valid === "running" ? "var(--tint-notice)" : "var(--surface-2)" }}>
            <Icon name={selMap.valid === "failed" ? "alert" : selMap.valid === "running" ? "refresh" : "check"} size={22}
              style={{ color: `var(--st-${validMeta[selMap.valid].sev})` }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{validMeta[selMap.valid].label}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{selMap.name} · {selMap.version}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["Coordinate / scale", "passed"],
              ["Row spacing", selMap.valid === "failed" ? "failed" : "passed"],
              ["Safety-zone overlap", selMap.valid === "failed" ? "failed" : "passed"],
              ["Path turn radius", "passed"],
              ["Thin/Pinch compatibility", selMap.valid === "running" ? "running" : "passed"],
            ].map(([l, st], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5 }}>{l}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700,
                  color: st === "failed" ? "var(--st-critical)" : st === "running" ? "var(--st-notice)" : "var(--st-normal)" }}>
                  <Icon name={st === "failed" ? "close" : st === "running" ? "refresh" : "check"} size={13} />
                  {st === "failed" ? "failed" : st === "running" ? "validating" : "passed"}
                </span>
              </div>
            ))}
          </div>
          {selMap.valid === "failed" && (
            <div style={{ padding: 11, borderRadius: 7, background: "var(--tint-critical)", color: "var(--st-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, fontWeight: 600 }}>
              검증 실패 버전은 작업 계획·HMI 전송에 사용할 수 없습니다.
            </div>
          )}
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn" style={{ flex: 1 }}><Icon name="route" size={15} /> Edit routes</button>
            <button className="btn" style={{ flex: 1 }} disabled={selMap.valid !== "passed"}>Set active</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WorkPlanScreen, MapListScreen });
