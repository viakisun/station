// [SWS-AGENT-STATUS / SWC-AGENT] Agent service surface (stub) — 사용자 제품 아님.
import { SurfaceHeader, StubPanel } from "@station/app-kit";
export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-AGENT-STATUS" />
      <StubPanel title="Agent Status — on-robot runtime (②)">
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          Local Agent 데몬의 상태·node registry·정책 요약(service surface). Agent는 사용자 제품이 아니라 on-robot runtime — 깊은 인스펙션은 Runtime Inspector. 실 상태 연결은 후속.
        </div>
      </StubPanel>
    </div>
  );
}
