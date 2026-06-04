"use client";
/* [SWS-OPS-FLEET / SWC-PRODUCT-OPS] Fleet — project→site→robot 탐색(스코프 showcase).
   TODO(SWT-FLEET-001/002): 라이브 fan-in·실 status는 후속 MVP. 지금은 fixture stub. */
import { SurfaceHeader, useScope } from "@station/app-kit";
import { getProjects, getSitesOfProject, getRobotsOfSite } from "@station/domain";

export default function Page() {
  const { scope, setProject, setRobot } = useScope();
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-FLEET" />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {getProjects().map((p) => (
          <div key={p.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{p.name}</strong>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{p.id}</span>
              <button className="btn sm" style={{ marginLeft: "auto", height: 24 }} onClick={() => setProject(p.id)}>scope</button>
            </div>
            {getSitesOfProject(p.id).map((s) => (
              <div key={s.id} style={{ marginTop: 6 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 4 }}>{s.id} · {s.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {getRobotsOfSite(s.id).map((r) => (
                    <button key={r.id} className="btn sm" onClick={() => { setProject(p.id); setRobot(r.id); }}
                      style={{ height: 26, borderColor: scope.robotId === r.id ? "var(--ink)" : undefined }}>
                      <span className="mono" style={{ fontSize: 10.5 }}>{r.id}</span>
                      <span style={{ fontSize: 9.5, color: "var(--ink-3)", marginLeft: 5 }}>{r.state} · {r.battery}%</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
