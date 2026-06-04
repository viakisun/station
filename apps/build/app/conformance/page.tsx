// [SWS-BUILD-CONFORMANCE / SWC-PRODUCT-BUILD] Conformance suites · audit package (structural).
import { SurfaceHeader } from "@station/app-kit";
import { Icon, StatusBadge } from "@station/design-system";
import { getReleaseData } from "@station/domain";

export default function Page() {
  const artifacts = getReleaseData().auditArtifacts;
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-CONFORMANCE" />
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 12 }}>
          <strong style={{ fontSize: 12 }}>Audit Package — 적합성 산출물 (TS-* suite)</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
            {artifacts.map((a) => (
              <div key={a.f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, padding: "3px 0" }}>
                <Icon name={a.ok ? "check" : "alert"} size={13} style={{ color: a.ok ? "var(--st-normal)" : "var(--st-critical)" }} />
                <span className="mono" style={{ flex: 1 }}>{a.f}</span>
                <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{a.note}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <strong style={{ fontSize: 12 }}>Conformance — 멀티벤더 게이트 (F7)</strong>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, marginTop: 8 }}>
            노드·모듈·앱·HMI·베이스 적합성 검사 → IF-P 시트 정합 · AppManifest · 적합성 suite. 통과해야 G5(운영 전환).
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <StatusBadge sev="normal" label="suite TS-SCAN 98/102" />
            <StatusBadge sev="warning" label="4 waiver" />
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 10 }}>suite 실행·리포트·waiver 게이트는 후속(SWT).</div>
        </div>
      </div>
    </div>
  );
}
