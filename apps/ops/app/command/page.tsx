// [SWS-OPS-COMMAND / SWC-PRODUCT-OPS] Command request + ACK (stub).
// Cloud 권한 ④ = 직접 제어 아님 → "Request …" wording. 실 dispatch는 후속(SWT-ACK-001).
import { SurfaceHeader, StubPanel } from "@station/app-kit";

const REQUESTS = ["Request Scan Start", "Request Safe Stop", "Request Mission Pause"];
const ACK = [
  { t: "received", note: "gateway 수신" },
  { t: "accepted", note: "evaluateGate 통과 (robot-side)" },
  { t: "executed", note: "노드 완료" },
];

export default function Page() {
  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-COMMAND" />
      <StubPanel title="Command Request — Cloud ④ (직접 제어 아님)" swt="SWT-ACK-001">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {REQUESTS.map((r) => (
            <button key={r} className="btn sm" style={{ height: 28 }} disabled>
              <span className="mono" style={{ fontSize: 10.5 }}>{r}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>3-stage ACK timeline (stub):</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ACK.map((a) => (
            <div key={a.t} className="mono" style={{ fontSize: 11, display: "flex", gap: 8 }}>
              <span style={{ width: 70, color: "var(--text-secondary)" }}>{a.t}</span>
              <span style={{ color: "var(--text-muted)" }}>{a.note}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 10 }}>
          ※ 모든 명령은 robot-side evaluateGate를 통과. cloud는 요청만(권한 ④ &lt; field ③).
        </div>
      </StubPanel>
    </div>
  );
}
