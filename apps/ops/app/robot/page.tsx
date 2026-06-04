// [SWS-OPS-ROBOT / SWC-PRODUCT-OPS] Robot detail (stub). TODO(SWT-OPS-ROBOT-001).
import { SurfaceHeader, StubPanel } from "@station/app-kit";

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-ROBOT" />
      <StubPanel title="Robot Detail — 노드·작업·상태" swt="SWT-OPS-ROBOT-001">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          선택 로봇(scope)의 노드 health · 작업 세션 · 모듈 · 상태 요약. Cloud ④ — 관찰 중심, 명령은 Command surface에서 요청.
        </div>
      </StubPanel>
    </div>
  );
}
