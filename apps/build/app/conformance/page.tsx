// [SWS-BUILD-CONFORMANCE / SWC-PRODUCT-BUILD] Conformance suites · SDK (stub).
import { SurfaceHeader, StubPanel } from "@station/app-kit";
export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-CONFORMANCE" />
      <StubPanel title="Conformance — 적합성 suite (IF-P 시트 · F7)">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          노드·모듈·앱·HMI 적합성 검사. 멀티벤더 통합 게이트. suite 실행·리포트는 후속.
        </div>
      </StubPanel>
    </div>
  );
}
