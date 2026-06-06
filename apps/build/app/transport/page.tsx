"use client";
/* [SWS-BUILD-TRANSPORT] Rig Transport Monitor — run-rig 의 TraceHub(ws:7102)에 접속해
   매체별(CAN·ROS2·DDS·MQTT) 전송 거동을 라이브로 시각화. read-only 관측.
   에이전트(run-rig) 미기동 시 안내 + 정적 프로파일 표 표시. */
import { useEffect, useRef, useState } from "react";
import { SurfaceHeader } from "@station/app-kit";

interface Rollup {
  profileId: string;
  transport: "CAN" | "ROS2" | "DDS" | "MQTT" | "SERIAL" | "WS";
  node: string;
  msgs: number;
  frames: number;
  appBytes: number;
  dropped: number;
  retries: number;
  avgLatencyMs: number;
  lastChannel?: string;
}
interface Trace {
  ts: number;
  transport: Rollup["transport"];
  kind: string;
  channel?: string;
  topic: string;
  qos: string;
  appBytes: number;
  frames: number;
  latencyMs: number;
  retries: number;
  delivered: boolean;
}
interface Snapshot {
  t: "transport";
  rollups: Rollup[];
  recent: Trace[];
  ts: number;
}

const TRACE_URL = process.env.NEXT_PUBLIC_TRACE_WS_URL ?? "ws://localhost:7102";

const TONE: Record<string, string> = {
  CAN: "var(--state-warning)",
  ROS2: "var(--state-info)",
  DDS: "var(--state-notice)",
  MQTT: "var(--state-normal)",
  SERIAL: "var(--text-muted)",
  WS: "var(--text-secondary)",
};

export default function Page() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [live, setLive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let stop = false;
    let retry: ReturnType<typeof setTimeout>;
    const connect = () => {
      if (stop) return;
      const ws = new WebSocket(TRACE_URL);
      wsRef.current = ws;
      ws.onopen = () => setLive(true);
      ws.onmessage = (ev) => {
        try {
          setSnap(JSON.parse(ev.data) as Snapshot);
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        setLive(false);
        if (!stop) retry = setTimeout(connect, 1500);
      };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => {
      stop = true;
      clearTimeout(retry);
      wsRef.current?.close();
    };
  }, []);

  const rollups = snap?.rollups ?? [];
  const maxFrames = Math.max(1, ...rollups.map((r) => r.frames));
  const maxLat = Math.max(1, ...rollups.map((r) => r.avgLatencyMs));

  return (
    <div>
      <SurfaceHeader
        sws="SWS-BUILD-TRANSPORT"
        right={
          <span className="badge" style={{ color: live ? "var(--state-normal)" : "var(--text-muted)" }}>
            <span className="dot" style={{ background: live ? "var(--accent-live)" : "var(--state-offline)" }} />
            {live ? "live · ws:7102" : "run-rig 대기"}
          </span>
        }
      />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {!live && (
          <div className="card" style={{ padding: 14, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            라이브 전송 트레이스를 보려면 레퍼런스 리그를 기동하세요:
            <div className="mono" style={{ marginTop: 8, padding: 10, background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}>
              pnpm --filter @station/local-agent start:rig
            </div>
            전 노드(MCU=CAN · VPU/LPU=ROS2 · ACU=DDS · Telemetry=MQTT)가 각자 전송으로 합류하고, 이 페이지가 ws:7102 의 TraceHub 에 자동 재접속합니다.
          </div>
        )}

        {/* 매체별 롤업 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>매체별 전송 (프로토콜-정확 시뮬)</div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="mono" style={{ display: "grid", gridTemplateColumns: "1.3fr .8fr .7fr 1fr .7fr 1.4fr 1.2fr", gap: 0, fontSize: 10.5, color: "var(--text-muted)", padding: "8px 12px", borderBottom: "1px solid var(--line-default)" }}>
              <span>NODE</span><span>TRANSPORT</span><span style={{ textAlign: "right" }}>MSGS</span><span style={{ textAlign: "right" }}>FRAMES</span><span style={{ textAlign: "right" }}>DROP</span><span>FRAMES/MSG</span><span>AVG LATENCY</span>
            </div>
            {rollups.length === 0 && <div style={{ padding: 14, fontSize: 12, color: "var(--text-muted)" }}>—</div>}
            {rollups.map((r) => {
              const fpm = r.msgs ? r.frames / r.msgs : 0;
              const dropPct = r.msgs ? (r.dropped / r.msgs) * 100 : 0;
              return (
                <div key={r.profileId} className="mono hov-row" style={{ display: "grid", gridTemplateColumns: "1.3fr .8fr .7fr 1fr .7fr 1.4fr 1.2fr", alignItems: "center", fontSize: 11.5, padding: "9px 12px", borderBottom: "1px solid var(--line-subtle)" }}>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{r.node}</span>
                  <span style={{ color: TONE[r.transport] }}>{r.transport}</span>
                  <span style={{ textAlign: "right", color: "var(--text-secondary)" }}>{r.msgs}</span>
                  <span style={{ textAlign: "right", color: "var(--text-secondary)" }}>{r.frames}</span>
                  <span style={{ textAlign: "right", color: dropPct > 0 ? "var(--state-warning)" : "var(--text-muted)" }}>{dropPct.toFixed(1)}%</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ flex: 1, height: 5, background: "var(--surface-muted)", borderRadius: 3, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${(r.frames / maxFrames) * 100}%`, background: TONE[r.transport] }} />
                    </span>
                    <span style={{ width: 34, textAlign: "right", color: "var(--text-secondary)" }}>{fpm.toFixed(1)}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ flex: 1, height: 5, background: "var(--surface-muted)", borderRadius: 3, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${(r.avgLatencyMs / maxLat) * 100}%`, background: TONE[r.transport] }} />
                    </span>
                    <span style={{ width: 52, textAlign: "right", color: "var(--text-secondary)" }}>{r.avgLatencyMs.toFixed(2)}ms</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
            CAN: 8B 프레임 → JSON 1건이 수십 프레임(바이너리 권장) · LPU ROS2 best-effort UDP 손실 · MQTT LTE 지연이 CAN/DDS 대비 자릿수↑
          </div>
        </div>

        {/* 최근 프레임 스트림 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>최근 전송 프레임</div>
          <div className="term" style={{ maxHeight: 320, overflow: "auto" }}>
            <div className="term-body">
              {(snap?.recent ?? []).slice().reverse().map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, whiteSpace: "nowrap" }}>
                  <span style={{ color: TONE[t.transport], width: 44 }}>{t.transport}</span>
                  <span className="l-dim" style={{ width: 56 }}>{t.kind}</span>
                  <span style={{ color: "var(--term-fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{t.topic}</span>
                  <span className="l-dim" style={{ width: 90 }}>{t.qos}</span>
                  <span style={{ width: 52, textAlign: "right", color: "var(--term-fg)" }}>{t.frames}f</span>
                  <span style={{ width: 64, textAlign: "right", color: "var(--term-fg)" }}>{t.latencyMs.toFixed(2)}ms</span>
                  <span style={{ width: 60, textAlign: "right", color: t.delivered ? "var(--term-green)" : "var(--term-red)" }}>{t.delivered ? "ok" : `drop${t.retries ? `·r${t.retries}` : ""}`}</span>
                </div>
              ))}
              {(!snap || snap.recent.length === 0) && <span className="l-dim">대기 중…</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
