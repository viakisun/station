"use client";
/* [SWS-OPS-ROBOT / SWC-FLEET / MVP-3] Robot detail — scope.robotId 라이브 drill-in.
   connection-scoped: 선택 로봇의 Local Agent(FleetManager)에 연결해 노드·신호·OBS 표시.
   endpoint 없는 로봇 = offline(mock). 데모는 RBT-THIN-0001 한 대 라이브. */
import { SurfaceHeader, useScope } from "@station/app-kit";
import { EmptyNote, StatusBadge } from "@station/design-system";
import { FleetAgentProvider, useAgentStatus, useNodes, useSignals, useObservations, useDispatch } from "@station/domain/runtime";
import type { CommandAck } from "@station/contracts";
import { useState } from "react";

const now = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 7).toUpperCase();

export default function Page() {
  const { scope } = useScope();
  return (
    <FleetAgentProvider robotId={scope.robotId}>
      <RobotLive robotId={scope.robotId} />
    </FleetAgentProvider>
  );
}

function RobotLive({ robotId }: { robotId: string | null }) {
  const status = useAgentStatus();
  const nodes = useNodes();
  const signals = useSignals();
  const observations = useObservations(10);
  const dispatch = useDispatch();
  const connected = status.state === "connected";
  const [scanning, setScanning] = useState(false);

  const scan = (verb: "scan.start" | "scan.stop") => {
    dispatch({ commandId: `CMD-OPS-${rid()}`, verb, target: { node: "AGENT" }, issuedBy: { role: "operator" }, issuedAt: now() }, (a: CommandAck) => {
      if (a.stage === "executed") setScanning(verb === "scan.start");
    });
  };
  const obs = observations[0];

  return (
    <div>
      <SurfaceHeader
        sws="SWS-OPS-ROBOT"
        right={
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
            <span className="mono" style={{ color: "var(--ink-3)" }}>{robotId ?? "(robot 미선택)"} · {status.endpoint}</span>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "var(--st-normal)" : status.state === "connecting" ? "var(--st-warning)" : "var(--st-disabled)" }} />
            <span className="mono" style={{ fontWeight: 700 }}>{connected ? `live · ${nodes.length} nodes` : status.state === "connecting" ? "connecting…" : "offline"}</span>
          </span>
        }
      />
      {!robotId ? (
        <div style={{ padding: 16 }}><EmptyNote icon="robot" title="로봇 미선택" sub="Fleet에서 로봇을 선택(drill-in)하세요. scope는 nav 후에도 유지됩니다." /></div>
      ) : !connected ? (
        <div style={{ padding: 16 }}>
          <EmptyNote icon="plug" title={status.state === "connecting" ? `${robotId} 연결 중…` : `${robotId} — 라이브 에이전트 없음(offline)`}
            sub={status.state === "connecting" ? status.endpoint : "이 로봇은 데모 endpoint가 없습니다. 생육분석 로봇 RBT-SCAN-0001(국립농업과학원) 선택 + start:agent 실행 시 라이브."} />
        </div>
      ) : (
        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
          <div className="card" style={{ padding: 12 }}>
            <strong style={{ fontSize: 12 }}>노드 · 라이브 신호 — {robotId}</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {nodes.map((n) => (
                <div key={n.nodeId} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 8 }}>
                  <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-2)" }}>{n.kind} · {n.ownerOrg}</div>
                  {n.signals.slice(0, 4).map((ch) => (
                    <div key={ch} className="mono" style={{ fontSize: 10.5, display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ flex: 1, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch}</span>
                      <span className="tnum" style={{ fontWeight: 700 }}>{typeof signals[ch]?.value === "number" ? signals[ch]!.value : String(signals[ch]?.value ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <strong style={{ fontSize: 12 }}>growth-scan · OBS (over WS)</strong>
            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              <button className="btn primary sm" onClick={() => scan("scan.start")} disabled={scanning}>Request scan.start</button>
              <button className="btn sm" onClick={() => scan("scan.stop")} disabled={!scanning}>scan.stop</button>
            </div>
            {obs ? (
              <div className="mono" style={{ fontSize: 10.5 }}>
                <div style={{ fontWeight: 700 }}>{obs.observationId}</div>
                <div style={{ color: "var(--ink-2)" }}>ndvi {obs.crop.ndvi} · {observations.length} obs</div>
                <StatusBadge sev={obs.quality === "good" ? "normal" : "warning"} label={obs.quality} />
              </div>
            ) : <div style={{ fontSize: 11, color: "var(--ink-3)" }}>scan.start로 OBS 합성</div>}
            <div style={{ fontSize: 10, color: "var(--st-warning)", marginTop: 10 }}>Cloud ④ — 명령은 robot-side evaluateGate 경유(요청).</div>
          </div>
        </div>
      )}
    </div>
  );
}
