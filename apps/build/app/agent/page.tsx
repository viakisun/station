"use client";
/* [SWS-BUILD-INSPECTOR / SWC-AGENT-MIRROR] Runtime Inspector — M5 라이브 모니터 재배치.
   신규 런타임 0. 기존 @station/domain/runtime hooks(AgentRuntimeProvider·RemoteAgentClient)
   를 Build 제품 표면으로 재배치. 실행 중 Local Agent app(ws://localhost:7101)에 연결.
   TODO(SWT-MIRROR-003): RuntimeInspector를 Build 고도로 재배치 — 완료. */
import { useEffect, useRef, useState } from "react";
import { SurfaceHeader } from "@station/app-kit";
import { EmptyNote, StatusBadge } from "@station/design-system";
import {
  AgentRuntimeProvider,
  useAgentStatus,
  useNodes,
  useSignals,
  useEvents,
  useObservations,
  useDispatch,
} from "@station/domain/runtime";
import type { CommandAck } from "@station/contracts";

const now = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 7).toUpperCase();

export default function Page() {
  return (
    <AgentRuntimeProvider>
      <Inspector />
    </AgentRuntimeProvider>
  );
}

function Inspector() {
  const status = useAgentStatus();
  const nodes = useNodes();
  const signals = useSignals();
  const events = useEvents(40);
  const observations = useObservations(20);
  const dispatch = useDispatch();
  const connected = status.state === "connected";
  const [scanning, setScanning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((p) => [`${new Date().toLocaleTimeString("ko-KR", { hour12: false })} ${s}`, ...p].slice(0, 30));

  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const e of [...events].reverse()) {
      const k = e.ts + e.code;
      if (seen.current.has(k)) continue;
      seen.current.add(k);
      push(`EVT ${e.code} — ${e.message}`);
    }
  }, [events]);

  const scan = (verb: "scan.start" | "scan.stop") => {
    const id = `CMD-INS-${rid()}`;
    dispatch({ commandId: id, verb, target: { node: "AGENT" }, issuedBy: { role: "operator" }, issuedAt: now() }, (a: CommandAck) => {
      if (a.stage === "executed") { setScanning(verb === "scan.start"); push(`${verb} executed ${a.detail ?? ""}`); }
      else if (a.stage === "rejected") push(`${verb} rejected ${a.code ?? ""}`);
    });
  };

  const latestObs = observations[0];

  return (
    <div>
      <SurfaceHeader
        sws="SWS-BUILD-INSPECTOR"
        right={
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "var(--state-normal)" : status.state === "connecting" ? "var(--state-warning)" : "var(--state-critical)" }} />
            <span className="mono" style={{ color: "var(--text-muted)" }}>{status.endpoint}{status.agentId ? ` · ${status.agentId}` : ""}</span>
            <span className="mono" style={{ fontWeight: 700 }}>{connected ? `connected · ${nodes.length} nodes` : status.state === "connecting" ? "연결 중…" : "연결 끊김"}</span>
          </span>
        }
      />
      {!connected ? (
        <div style={{ padding: 14 }}>
          <EmptyNote icon="plug" title={status.state === "connecting" ? "Local Agent app 연결 중…" : "Local Agent app 미연결"}
            sub={`${status.endpoint} · 별 터미널에서  pnpm --filter @station/local-agent start:agent`} />
        </div>
      ) : (
        <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
          {/* 노드 레인 */}
          <div className="card" style={{ padding: 12 }}>
            <strong style={{ fontSize: 12 }}>노드 레인 · 표준 신호</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {nodes.map((n) => (
                <div key={n.nodeId} style={{ border: "1px solid var(--line-default)", borderRadius: "var(--radius-sm)", padding: 8 }}>
                  <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-secondary)" }}>{n.kind} · {n.nodeId} · {n.ownerOrg}</div>
                  {n.signals.map((ch) => (
                    <div key={ch} className="mono" style={{ fontSize: 10.5, display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ flex: 1, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch}</span>
                      <span className="tnum" style={{ fontWeight: 700 }}>{typeof signals[ch]?.value === "number" ? signals[ch]!.value : String(signals[ch]?.value ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* growth-scan + OBS + log */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 12 }}>
              <strong style={{ fontSize: 12 }}>growth-scan · OBS</strong>
              <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                <button className="btn primary sm" onClick={() => scan("scan.start")} disabled={scanning}>scan.start</button>
                <button className="btn sm" onClick={() => scan("scan.stop")} disabled={!scanning}>scan.stop</button>
              </div>
              {latestObs ? (
                <div className="mono" style={{ fontSize: 10.5 }}>
                  <div style={{ fontWeight: 700 }}>{latestObs.observationId}</div>
                  <div style={{ color: "var(--text-secondary)" }}>ndvi {latestObs.crop.ndvi} · h {latestObs.crop.plant_height} · {observations.length} obs</div>
                  <StatusBadge sev={latestObs.quality === "good" ? "normal" : "warning"} label={latestObs.quality} />
                </div>
              ) : <div style={{ fontSize: 11, color: "var(--text-muted)" }}>scan.start로 OBS 합성 시작</div>}
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--line-default)", fontSize: 11, fontWeight: 700 }}>EventBus · live</div>
              <div style={{ maxHeight: 220, overflow: "auto", padding: "6px 12px" }}>
                {log.length === 0 ? <div style={{ fontSize: 11, color: "var(--text-muted)" }}>이벤트 대기…</div> : log.map((l, i) => (
                  <div key={i} className="mono" style={{ fontSize: 10.5, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
