// [SWS-BUILD-FIRMWARE / SWC-PRODUCT-BUILD] Firmware · OTA (stub).
import { SurfaceHeader, StubPanel } from "@station/app-kit";
export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-BUILD-FIRMWARE" />
      <StubPanel title="Firmware — 버전·호환성·OTA 배포">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          펌웨어 정적분석·호환성 매트릭스·OTA(canary·rollback). 승인 게이트는 후속.
        </div>
      </StubPanel>
    </div>
  );
}
