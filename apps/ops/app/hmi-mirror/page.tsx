"use client";
/* [SWS-OPS-HMI-MIRROR / SWC-AGENT-MIRROR / MVP-3] HMI Mirror — 선택 로봇 라이브 관찰(observe).
   미러는 read-only/observe — useDispatch 미사용(현장 ③ 권한을 넘지 않음, cloud ④). */
import { SurfaceHeader, useScope } from "@station/app-kit";
import { EmptyNote } from "@station/design-system";
import { FleetAgentProvider, useAgentStatus, useSignals } from "@station/domain/runtime";

export default function Page() {
  const { scope } = useScope();
  return (
    <FleetAgentProvider robotId={scope.robotId}>
      <Mirror robotId={scope.robotId} />
    </FleetAgentProvider>
  );
}

function Mirror({ robotId }: { robotId: string | null }) {
  const status = useAgentStatus();
  const signals = useSignals();
  const connected = status.state === "connected";
  // 현장 HMI가 보는 대표 채널을 cloud에서 관찰(미러).
  const watch = ["machine.vision.fps", "machine.autonomy.state", "machine.localization.confidence", "crop.growth.ndvi"];

  return (
    <div>
      <SurfaceHeader sws="SWS-OPS-HMI-MIRROR" right={
        <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{robotId ?? "(robot 미선택)"} · {connected ? "live observe" : status.state}</span>
      } />
      {!connected ? (
        <div style={{ padding: 16 }}>
          <EmptyNote icon="hmi" title={robotId ? `${robotId} — 라이브 미러 없음` : "로봇 미선택"}
            sub="Field HMI(③)의 cloud 미러(④, observe/assist). 라이브는 RBT-SCAN-0001(생육분석) + start:agent." />
        </div>
      ) : (
        <div style={{ padding: 14 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>현장 HMI 관찰(observe only · 명령 경로 없음) — {robotId}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {watch.map((ch) => (
                <div key={ch} style={{ border: "1px solid var(--line-default)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch}</div>
                  <div className="mono tnum" style={{ fontSize: 16, fontWeight: 800 }}>{typeof signals[ch]?.value === "number" ? signals[ch]!.value : String(signals[ch]?.value ?? "—")}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>권한 ④ &lt; ③ — cloud 미러는 관찰·보조만, 현장 operator 권한을 넘지 않음.</div>
          </div>
        </div>
      )}
    </div>
  );
}
