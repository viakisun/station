// [SWS-FIELD-TELEMETRY / SWC-PRODUCT-FIELD] Field Telemetry setup — on-robot ③.
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-FIELD-TELEMETRY" right={<span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>on-robot operator panel</span>} />
      <StubPanel title="Telemetry Setup — 채널 매핑·보정 (현장 설정)">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          현장에서 raw 신호→표준 채널 매핑·센서 보정·샘플링 정책을 설정한다(on-robot). cloud의 Ops Telemetry Monitor는 이 업링크의 read-only 미러. 설정 위저드는 후속.
        </div>
      </StubPanel>
    </div>
  );
}
