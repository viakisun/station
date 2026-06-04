// [SWS-BUILD-FIRMWARE / SWC-PRODUCT-BUILD] Firmware · OTA (structural · RELEASE).
import { SurfaceHeader } from "@station/app-kit";
import { StatusBadge, type Sev } from "@station/design-system";
import { getFirmwares } from "@station/domain";

const sevOf = (s: string): Sev =>
  ({ passed: "normal", success: "normal", approved: "normal", warning: "warning", analyzing: "notice", draft: "disabled", blocked: "critical", failed: "critical", deploying: "notice" } as Record<string, Sev>)[s] ?? "notice";

export default function Page() {
  const fws = getFirmwares();
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-FIRMWARE" />
      <div style={{ padding: 14 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", textAlign: "left" }}>
                {["firmware", "module", "analysis", "findings", "deploy", "note"].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", fontSize: 9.5, textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fws.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td className="mono" style={{ padding: "7px 10px", fontWeight: 700 }}>{f.id}</td>
                  <td className="mono" style={{ padding: "7px 10px", color: "var(--ink-2)" }}>{f.module}</td>
                  <td style={{ padding: "7px 10px" }}><StatusBadge sev={sevOf(f.analysis)} label={f.analysis} /></td>
                  <td className="mono" style={{ padding: "7px 10px" }}>{f.findings}{f.critical ? <span style={{ color: "var(--st-critical)" }}> · {f.critical} crit</span> : null}</td>
                  <td style={{ padding: "7px 10px" }}><StatusBadge sev={sevOf(f.deploy)} label={f.deploy} /></td>
                  <td style={{ padding: "7px 10px", color: "var(--ink-3)" }}>{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 8 }}>정적분석 → 호환성 → 승인(G2) → OTA(canary·rollback). 승인 게이트·배포계획은 후속.</div>
      </div>
    </div>
  );
}
