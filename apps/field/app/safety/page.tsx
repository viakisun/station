// [SWS-FIELD-SAFETY / SWC-PRODUCT-FIELD] Field Safety — E-stop·인터록 (on-robot ③).
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-SAFETY" right={<span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>on-robot operator panel</span>} />
      <StubPanel title="Safety — E-stop · 인터록 (물리 안전 ① 최상위)">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          물리 E-stop(①)은 SW 비의존 최상위. 현장 HMI(③)는 안전 해제 권한을 가지나 cloud(④)는 불가. 인터록·복구는 후속.
        </div>
      </StubPanel>
    </div>
  );
}
