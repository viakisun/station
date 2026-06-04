// [SWS-OPS-TELE-MON / SWC-AGENT-MIRROR] Telemetry Monitor (stub · read-only).
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-TELE-MON" />
      <StubPanel title="Telemetry Monitor — read-only (제어권 0)" swt="SWT-TELE-001">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          Telemetry Gateway 업링크의 cloud 관찰면. <b style={{ color: "var(--st-critical)" }}>controlMode = none</b> — 명령 경로 없음(useDispatch 미import). 채널·품질·edge buffer는 후속.
        </div>
      </StubPanel>
    </div>
  );
}
