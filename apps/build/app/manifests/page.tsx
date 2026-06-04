// [SWS-BUILD-MANIFESTS / SWC-PRODUCT-BUILD] Module/App manifests (structural · RELEASE).
import { SurfaceHeader } from "@station/app-kit";
import { StatusBadge } from "@station/design-system";
import { getModules } from "@station/domain";

export default function Page() {
  const mods = getModules();
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-MANIFESTS" />
      <div style={{ padding: 14 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["module", "type", "vendor", "robots", "protocol", "fw", "audit"].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", fontSize: 9.5, textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mods.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="mono" style={{ padding: "7px 10px", fontWeight: 700 }}>{m.id}</td>
                  <td style={{ padding: "7px 10px" }}>{m.type}</td>
                  <td className="mono" style={{ padding: "7px 10px", color: "var(--ink-2)" }}>{m.vendor}</td>
                  <td style={{ padding: "7px 10px", color: "var(--ink-2)" }}>{m.robots}</td>
                  <td className="mono" style={{ padding: "7px 10px", color: "var(--ink-3)" }}>{m.proto}</td>
                  <td className="mono" style={{ padding: "7px 10px" }}>{m.fw}</td>
                  <td style={{ padding: "7px 10px" }}><StatusBadge sev={m.auditState === "approved" ? "normal" : m.auditState === "failed" ? "critical" : m.auditState === "waiver_required" ? "warning" : "notice"} label={m.auditState} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 8 }}>ModuleManifest · AppManifest(station.app.*) · Blueprint — @station/contracts SSOT. project/platform scope.</div>
      </div>
    </div>
  );
}
