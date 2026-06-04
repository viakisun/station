// [SWS-OPS-HMI-MIRROR / SWC-AGENT-MIRROR] HMI Mirror (stub · observe/assist).
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-HMI-MIRROR" />
      <StubPanel title="HMI Mirror — Field HMI 원격 관찰·보조" swt="SWT-MIRROR-001">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          현장 operator(③)가 보는 HMI 패널의 cloud 미러(④). observe / assist만 — 현장 권한을 넘어 직접 조작하지 않는다. 실 미러 스트림은 후속(SWT-MIRROR-*).
        </div>
      </StubPanel>
    </div>
  );
}
