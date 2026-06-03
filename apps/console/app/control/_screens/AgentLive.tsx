"use client";
/* ============================================================
   Local Agent 런타임 — 원격 모니터(M5)
   웹(Ops 콘솔)은 별 프로세스의 Local Agent app 에 HMI uplink(WS, IF-L-HMI-AGG)
   로 접속해 실 Signal·ACK·Event·Observation 을 모니터링·명령한다(@station/domain
   /runtime). 기본 토폴로지 = 원격(ws://localhost:7101) · 폴백 = 인프로세스 시뮬
   (NEXT_PUBLIC_AGENT_MODE=inproc). 에이전트는 노드(MCU/VPU/ACU/LPU)를 흡수하고
   growth-scan 으로 scan.start 시 GrowthObservation(OBS-*)을 합성한다.

   PolicyEngine·e-stop 게이트는 런타임 미구현(Step4) → "시뮬" 라벨 유지.
   디자인은 기존 목업 100% 보존, 데이터 배선만 교체.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import {
  Icon,
  StatusBadge,
  PanelHead,
  Sparkline,
  HoldButton,
  SafetyBanner,
  EmptyNote,
  type Sev,
} from "@station/design-system";
import {
  AgentRuntimeProvider,
  useNodes,
  useSignals,
  useEvents,
  useObservations,
  useDispatch,
  useAgentStatus,
} from "@station/domain/runtime";
import type { CommandAck, Event, Signal } from "@station/contracts";

/* ---- owner_org 색 인라인 매핑 ---- */
const ORG_COLOR: Record<string, string> = {
  "ORG-VIA": "#1f6feb",
  "ORG-AGE": "#d97706",
  "ORG-META": "#16a34a",
  "ORG-DAEDONG": "#8b5cf6",
};
const orgColor = (org: string) => ORG_COLOR[org] ?? "var(--ink-3)";

/* ---- 품질(실 Signal.quality) ---- */
type Qual = "good" | "warn" | "bad";
const QUAL_SEV: Record<Qual, Sev> = { good: "normal", warn: "warning", bad: "critical" };
const QUAL_COLOR: Record<Qual, string> = {
  good: "var(--brand, #1f6feb)",
  warn: "var(--st-warning)",
  bad: "var(--st-critical)",
};

/* ---- 런타임 채널 표시 메타(label/unit) — 없으면 채널명·무단위 ---- */
const CH_META: Record<string, { label: string; unit: string }> = {
  "machine.motion.speed": { label: "주행 속도", unit: "m/s" },
  "machine.vision.fps": { label: "비전 FPS", unit: "fps" },
  "machine.navigation.deviation": { label: "경로 편차", unit: "mm" },
  "machine.localization.confidence": { label: "측위 신뢰도", unit: "" },
  "machine.localization.pose.x": { label: "pose · x", unit: "m" },
  "machine.localization.pose.y": { label: "pose · y", unit: "m" },
  "machine.localization.pose.theta": { label: "pose · θ", unit: "rad" },
  "machine.autonomy.state": { label: "자율주행 상태", unit: "" },
  "crop.growth.plant_height": { label: "초장", unit: "m" },
  "crop.growth.lai": { label: "엽면적지수(LAI)", unit: "" },
  "crop.growth.ndvi": { label: "NDVI", unit: "" },
};
const chLabel = (ch: string) => CH_META[ch]?.label ?? ch;
const chUnit = (ch: string) => CH_META[ch]?.unit ?? "";

/* ---- verb → safety 등급(표시용 휴리스틱) ---- */
const CRITICAL_VERBS = new Set(["motion.stop"]);
const GUARDED_VERBS = new Set([
  "autonomy.pause",
  "autonomy.slow_down",
  "vision.calibrate",
  "localization.relocalize",
]);
type Safety = "none" | "guarded" | "safety_critical";
const verbSafety = (v: string): Safety =>
  CRITICAL_VERBS.has(v) ? "safety_critical" : GUARDED_VERBS.has(v) ? "guarded" : "none";

/* ---- 명령 ACK 단계 ---- */
type AckPhase = "received" | "accepted" | "executed" | "rejected" | "timeout";
const ACK_META: Record<AckPhase, { label: string; sev: Sev }> = {
  received: { label: "received", sev: "notice" },
  accepted: { label: "accepted", sev: "notice" },
  executed: { label: "executed", sev: "normal" },
  rejected: { label: "rejected", sev: "critical" },
  timeout: { label: "timeout", sev: "warning" },
};
interface CmdRow {
  id: string;
  ts: string;
  nodeId: string;
  verb: string;
  safety: Safety;
  phase: AckPhase;
  reason?: string;
}

/* ---- EventBus 로그 ---- */
type LogKind = "signal" | "command" | "policy" | "safety";
const LOG_COLOR: Record<LogKind, string> = {
  signal: "#7ee787",
  command: "#79c0ff",
  policy: "#d2a8ff",
  safety: "#ff7b72",
};
interface LogLine { id: string; ts: string; kind: LogKind; text: string }
const eventKind = (e: Event): LogKind =>
  e.severity === "critical" || e.severity === "emergency"
    ? "safety"
    : e.severity === "warning" || e.severity === "notice"
      ? "policy"
      : "signal";

const now = () => new Date().toLocaleTimeString("ko-KR", { hour12: false });
const nowISO = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 7).toUpperCase();

/* 페이지 = Provider + 런타임 콘솔. Provider 가 인프로세스 에이전트를 부팅. */
export function AgentLive() {
  return (
    <AgentRuntimeProvider>
      <AgentConsole />
    </AgentRuntimeProvider>
  );
}

function AgentConsole() {
  const nodes = useNodes();
  const signals = useSignals();
  const events = useEvents(60);
  const observations = useObservations(40);
  const dispatch = useDispatch();
  const status = useAgentStatus();

  const connected = status.state === "connected";
  const booted = connected && nodes.length > 0;

  /* ---- 노드별 채널 롤링 시계열(라이브 신호에서 누적) ---- */
  type Series = Record<string, Record<string, number[]>>;
  const [series, setSeries] = useState<Series>({});
  useEffect(() => {
    if (!booted) return;
    setSeries((prev) => {
      const next: Series = { ...prev };
      for (const n of nodes) {
        next[n.nodeId] = { ...(prev[n.nodeId] ?? {}) };
        for (const ch of n.signals) {
          const s = signals[ch];
          const v = typeof s?.value === "number" ? s.value : s?.value ? 1 : 0;
          const arr = [...(prev[n.nodeId]?.[ch] ?? []), v].slice(-16);
          // Sparkline 은 ≥2 포인트 필요(단일 포인트 → x 스케일 div0 → NaN path).
          next[n.nodeId]![ch] = arr.length < 2 ? [v, v] : arr;
        }
      }
      return next;
    });
  }, [signals, nodes, booted]);

  /* ---- 명령 이력 + 통계 ---- */
  const [cmds, setCmds] = useState<CmdRow[]>([]);
  const [signalCount, setSignalCount] = useState(0);
  const [estop, setEstop] = useState(false);
  const [policyActive, setPolicyActive] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);

  const pushLog = (kind: LogKind, text: string) =>
    setLog((prev) => [{ id: rid(), ts: now(), kind, text }, ...prev].slice(0, 60));

  /* 인입 신호 카운트(스로틀된 signals 변화마다 +채널수) */
  useEffect(() => {
    if (booted) setSignalCount((c) => c + Object.keys(signals).length);
  }, [signals, booted]);

  /* EventBus 이벤트를 통합 로그로 흘림(신규만) */
  const seenEvt = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const e of [...events].reverse()) {
      const key = e.ts + e.code + e.message;
      if (seenEvt.current.has(key)) continue;
      seenEvt.current.add(key);
      pushLog(eventKind(e), `${e.code} · ${e.message}`);
    }
  }, [events]);

  /* ---- 실 명령 발행 + ACK 구독 ---- */
  function issueCommand(node: { nodeId: string; kind: string }, verb: string, auto = false) {
    const safety = verbSafety(verb);
    if (estop && safety === "safety_critical") {
      const id = `CMD-${rid()}`;
      setCmds((prev) => [{ id, ts: now(), nodeId: node.nodeId, verb, safety, phase: "rejected" as const, reason: "SAFETY_LOCK" }, ...prev].slice(0, 30));
      pushLog("safety", `${id} ${verb} → REJECTED · SAFETY_LOCK (e-stop 활성, 페이지 게이트)`);
      return;
    }
    const id = `CMD-${rid()}`;
    setCmds((prev) => [{ id, ts: now(), nodeId: node.nodeId, verb, safety, phase: "received" as const }, ...prev].slice(0, 30));
    pushLog("command", `${id} ${verb} → ${node.nodeId} · received${auto ? " (policy auto)" : ""}`);

    const setPhase = (phase: AckPhase, reason?: string) =>
      setCmds((prev) => prev.map((e) => (e.id === id ? { ...e, phase, reason } : e)));

    dispatch(
      {
        commandId: id,
        verb,
        target: { node: node.kind },
        issuedBy: { role: "operator" },
        issuedAt: nowISO(),
        safety,
      },
      (a: CommandAck) => {
        if (a.stage === "received") return; // 이미 표시
        setPhase(a.stage as AckPhase, a.detail ?? a.code);
        const k: LogKind = a.stage === "rejected" ? "safety" : "command";
        pushLog(k, `${id} ${a.stage}${a.detail ? ` · ${a.detail}` : a.code ? ` · ${a.code}` : ""}`);
      },
    );
  }

  /* ---- growth-scan ---- */
  const [scanning, setScanning] = useState(false);
  function startScan() {
    const id = `CMD-SCAN-${rid()}`;
    pushLog("command", `${id} scan.start → AGENT · received`);
    dispatch(
      { commandId: id, verb: "scan.start", target: { node: "AGENT" }, issuedBy: { role: "operator" }, issuedAt: nowISO() },
      (a) => {
        if (a.stage === "executed") { setScanning(true); pushLog("command", `${id} executed · ${a.detail ?? ""}`); }
        else if (a.stage === "rejected") pushLog("safety", `${id} rejected · ${a.code ?? a.detail ?? ""}`);
        else if (a.stage === "accepted") pushLog("command", `${id} accepted`);
      },
    );
  }
  function stopScan() {
    const id = `CMD-SCAN-${rid()}`;
    dispatch(
      { commandId: id, verb: "scan.stop", target: { node: "AGENT" }, issuedBy: { role: "operator" }, issuedAt: nowISO() },
      (a) => { if (a.stage === "executed") { setScanning(false); pushLog("command", `${id} scan.stop executed`); } },
    );
  }

  /* ---- PolicyEngine 시뮬(Step4 후속) — 실 event/command 경유 ---- */
  function injectWorkerProximity() {
    setPolicyActive(true);
    pushLog("policy", "EVT WORKER-PROXIMITY (critical) · PolicyEngine 시뮬(Step4) 트리거");
    const acu = nodes.find((n) => n.kind === "ACU");
    const mcu = nodes.find((n) => n.kind === "MCU");
    if (acu) issueCommand(acu, "autonomy.slow_down", true);
    if (mcu) issueCommand(mcu, "motion.stop", true);
  }
  function resetPolicy() {
    setPolicyActive(false);
    pushLog("policy", "PolicyEngine 시뮬 리셋 · WORKER-PROXIMITY 해제");
  }

  const latestObs = observations[0];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* ---- 헤더 ---- */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".4px" }}>LOCAL AGENT · RUNTIME</span>
        <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Local Agent · {status.mode === "remote" ? "원격 모니터" : "인프로세스"}</h1>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{status.endpoint}{status.agentId ? ` · ${status.agentId}` : ""}</span>
        <div style={{ flex: 1 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
          color: estop ? "var(--st-critical)" : "var(--ink-3)", cursor: "pointer" }}>
          <input type="checkbox" checked={estop} onChange={(e) => {
            setEstop(e.target.checked);
            pushLog("safety", `e-stop ${e.target.checked ? "활성" : "해제"} · safety-critical 명령 ${e.target.checked ? "차단" : "허용"} (Step4 게이트 시뮬)`);
          }} />
          <Icon name="power" size={14} /> e-stop {estop ? "활성" : "해제"}
        </label>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%",
            background: connected ? "var(--st-normal)" : status.state === "connecting" ? "var(--st-warning)" : "var(--st-critical)" }} />
          {connected ? `connected · ${nodes.length} nodes` : status.state === "connecting" ? "연결 중…" : "연결 끊김"}
        </span>
      </div>

      {/* 안전 배너 */}
      {policyActive && (
        <SafetyBanner sev="critical" icon="alert">
          PolicyEngine 시뮬(Step4) — WORKER-PROXIMITY 감지. ACU slow_down · MCU stop 자동 인가(실 명령 경유).
        </SafetyBanner>
      )}
      {estop && !policyActive && (
        <SafetyBanner sev="emergency" icon="power">
          긴급정지(e-stop) 활성 — safety-critical 명령은 SAFETY_LOCK 으로 거부됩니다(Step4 게이트 시뮬).
        </SafetyBanner>
      )}

      {/* ---- 3열 본문 ---- */}
      <div style={{ flex: 1, minHeight: 0, display: "grid",
        gridTemplateColumns: "minmax(300px,1.1fr) minmax(240px,0.9fr) minmax(300px,1.1fr)", gap: 0 }}>
        {/* === 좌: 노드 레인 === */}
        <section style={{ minHeight: 0, overflow: "auto", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <PanelHead title="노드 레인" sub="기관 산출 노드 · 표준 신호 스트림" dense
            right={<span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{nodes.length} nodes</span>} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {!booted ? (
              status.mode === "remote" && status.state !== "connected" ? (
                <EmptyNote icon="plug" title={status.state === "connecting" ? "Local Agent app 연결 중…" : "Local Agent app 미연결"}
                  sub={`${status.endpoint} · 별 터미널에서  pnpm --filter @station/local-agent start:agent`} />
              ) : (
                <EmptyNote icon="waves" title="노드 합류 중" sub="에이전트에서 노드 스냅샷 수신 중입니다." />
              )
            ) : nodes.map((n) => {
              const oc = orgColor(n.ownerOrg);
              return (
                <div key={n.nodeId} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: `3px solid ${oc}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, flex: "none", display: "grid", placeItems: "center",
                      background: oc, color: "#fff", fontSize: 10, fontWeight: 800 }}>{n.kind}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{n.label}</div>
                      <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{n.nodeId}</div>
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: oc, padding: "2px 6px", borderRadius: 4,
                      background: "var(--surface-2)", border: `1px solid ${oc}33` }}>{n.ownerOrg}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {n.signals.length === 0 ? (
                      <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--ink-3)" }}>표준 신호 없음</div>
                    ) : n.signals.map((ch) => {
                      const s: Signal | undefined = signals[ch];
                      const q = (s?.quality ?? "good") as Qual;
                      const val = s === undefined ? "—" : typeof s.value === "number" ? s.value : String(s.value);
                      return (
                        <div key={ch} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
                          <div style={{ width: 116, flex: "none", minWidth: 0 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chLabel(ch)}</div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch}</div>
                          </div>
                          <Sparkline data={series[n.nodeId]?.[ch] ?? [0, 0]} w={86} h={24} color={QUAL_COLOR[q]} />
                          <div style={{ flex: 1 }} />
                          <span className="mono tnum" style={{ fontSize: 11.5, fontWeight: 700, width: 58, textAlign: "right" }}>
                            {val}<span style={{ fontSize: 9, color: "var(--ink-3)", marginLeft: 2 }}>{chUnit(ch)}</span>
                          </span>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: `var(--st-${QUAL_SEV[q]})` }} title={q} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* === 중앙: Local Agent 허브 === */}
        <section style={{ minHeight: 0, overflow: "auto", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <PanelHead title="Local Agent 허브" sub="노드 어댑터 → 표준 런타임" dense
            right={<span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--st-normal)", fontWeight: 700 }}>
              <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--st-normal)" }} /> live
            </span>} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <HubCounter label="인입 신호" value={signalCount} icon="waves" />
              <HubCounter label="발행 이벤트" value={events.length} icon="zap" />
              <HubCounter label="관측 OBS" value={observations.length} icon="trending" />
              <HubCounter label="발행 명령" value={cmds.length} icon="terminal" />
            </div>

            {([
              { id: "SignalStore", desc: "표준 채널 수집·승격", icon: "database" as const, hot: false },
              { id: "CommandRouter", desc: "verb → 게이트 → 노드/앱 ACK", icon: "route" as const, hot: false },
              { id: "EventBus", desc: "신호·명령·정책 이벤트", icon: "waves" as const, hot: false },
              { id: "AppRuntime", desc: "growth-scan active", icon: "pkg" as const, hot: scanning },
              { id: "PolicyEngine", desc: "안전 규칙(Step4 시뮬)", icon: "shield" as const, hot: policyActive },
            ]).map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 13px",
                borderRadius: "var(--r-sm)", background: "#16181d",
                border: `1px solid ${b.hot ? "var(--st-critical)" : "#2a2f37"}` }}>
                <Icon name={b.icon} size={18} style={{ color: b.hot ? "#ff7b72" : "#79c0ff", flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#e6edf3" }}>{b.id}</div>
                  <div style={{ fontSize: 10.5, color: "#8b949e" }}>{b.desc}</div>
                </div>
                <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%",
                  background: b.hot ? "#ff7b72" : "#3fb950", flex: "none" }} />
              </div>
            ))}

            {/* growth-scan 카드 */}
            <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="scan" size={15} style={{ color: "var(--ink-2)" }} /> 생육 스캔 · station.app.growth-scan
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.45 }}>
                scan.start → ACU 미션 + VPU capture(게이트 경유) → ndvi 프레임마다 pose⊕crop⊕state 를 합성해 GrowthObservation(OBS-*) 생성.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn primary sm" onClick={startScan} disabled={!booted || scanning} style={{ flex: 1 }}>
                  <Icon name="play" size={14} /> scan.start
                </button>
                <button className="btn sm" onClick={stopScan} disabled={!scanning}>
                  <Icon name="power" size={14} /> scan.stop
                </button>
              </div>
              {latestObs ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                  <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-2)" }}>{latestObs.observationId}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10.5, color: "var(--ink-2)" }}>
                    <span className="mono">ndvi {latestObs.crop.ndvi}</span>
                    <span className="mono">h {latestObs.crop.plant_height}m</span>
                    <span className="mono">lai {latestObs.crop.lai}</span>
                    {latestObs.pose && <span className="mono">pose ({latestObs.pose.x},{latestObs.pose.y})</span>}
                    <StatusBadge sev={QUAL_SEV[latestObs.quality]} label={latestObs.quality} />
                  </div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{latestObs.scanSessionId} · {observations.length} obs</div>
                </div>
              ) : (
                <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>관측 없음 — scan.start 로 합성을 시작하세요.</div>
              )}
            </div>

            {/* PolicyEngine 시뮬 */}
            <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="shield" size={15} style={{ color: "var(--ink-2)" }} /> PolicyEngine 시뮬 <span style={{ fontSize: 9.5, fontWeight: 600, color: "var(--ink-3)" }}>(Step4 후속)</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.45 }}>
                작업자 근접 이벤트 주입 → ACU slow_down · MCU stop 자동 인가(실 CommandRouter 경유). 자동 정책 로직은 Step4에서 런타임化.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn primary sm" onClick={injectWorkerProximity} disabled={!booted} style={{ flex: 1 }}>
                  <Icon name="alert" size={14} /> 작업자 감지 주입
                </button>
                <button className="btn sm" onClick={resetPolicy} disabled={!policyActive}>
                  <Icon name="rollback" size={14} /> 리셋
                </button>
              </div>
              {policyActive && <StatusBadge sev="critical" label="WORKER-PROXIMITY · 안전 인가 활성" />}
            </div>
          </div>
        </section>

        {/* === 우: 명령 발행 + ACK === */}
        <section style={{ minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <PanelHead title="명령 발행 · 3단계 ACK" sub="received → accepted → executed" dense
            right={estop ? <StatusBadge sev="critical" label="e-stop" /> : <StatusBadge sev="normal" label="armed" />} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {nodes.map((n) => (
              <div key={n.nodeId} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, flex: "none", display: "grid", placeItems: "center",
                    background: orgColor(n.ownerOrg), color: "#fff", fontSize: 8, fontWeight: 800 }}>{n.kind}</span>
                  <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-2)" }}>{n.nodeId}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {n.commands.length === 0 ? (
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>명령 없음</span>
                  ) : n.commands.map((verb, i) => {
                    const safety = verbSafety(verb);
                    const danger = safety === "safety_critical";
                    const locked = estop && danger;
                    return danger ? (
                      <HoldButton key={verb + i} label={<span className="mono" style={{ fontSize: 10.5 }}>{verb}</span>}
                        holdLabel="hold…" danger disabled={locked} duration={700}
                        onConfirm={() => issueCommand(n, verb)}
                        style={{ height: 30, padding: "0 10px", fontSize: 10.5 }} />
                    ) : (
                      <button key={verb + i} className="btn sm" onClick={() => issueCommand(n, verb)}
                        style={{ height: 30 }} title={`safety=${safety}`}>
                        <span className="mono" style={{ fontSize: 10.5 }}>{verb}</span>
                        {safety === "guarded" && <Icon name="shield" size={11} style={{ marginLeft: 3, color: "var(--ink-3)" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 7 }}>발행 이력</div>
              {cmds.length === 0 ? (
                <EmptyNote icon="terminal" title="발행된 명령 없음" sub="노드 명령을 눌러 실 ACK 흐름을 확인하세요." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {cmds.map((e) => {
                    const m = ACK_META[e.phase];
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                        border: "1px solid var(--line)", borderRadius: "var(--r-sm)",
                        background: e.phase === "rejected" ? "var(--tint-critical, var(--surface-2))" : "var(--surface)" }}>
                        <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", width: 56, flex: "none" }}>{e.ts}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="mono" style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.verb}</div>
                          <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{e.id} · {e.nodeId}{e.reason ? ` · ${e.reason}` : ""}</div>
                        </div>
                        {e.safety === "safety_critical" && <Icon name="power" size={12} style={{ color: "var(--st-critical)", flex: "none" }} />}
                        <StatusBadge sev={m.sev} label={m.label} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ---- 하단: EventBus 라이브 로그 ---- */}
      <div style={{ flex: "none", height: 168, borderTop: "1px solid var(--line)", background: "#0d1117",
        display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", borderBottom: "1px solid #21262d" }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#3fb950" }} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#e6edf3" }}>EventBus · live log</span>
          <div style={{ flex: 1 }} />
          <span style={{ display: "flex", gap: 12 }}>
            {(["signal", "command", "policy", "safety"] as LogKind[]).map((k) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8b949e" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: LOG_COLOR[k] }} />{k}
              </span>
            ))}
          </span>
          <span className="mono" style={{ fontSize: 10, color: "#6e7681", marginLeft: 8 }}>{log.length} lines</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "8px 14px", fontSize: 11.5, lineHeight: 1.6 }}>
          {log.length === 0 ? (
            <div style={{ color: "#6e7681", fontSize: 11 }}>이벤트 대기 중… 신호 승격·명령 ACK·정책 발화가 여기에 기록됩니다.</div>
          ) : log.map((l) => (
            <div key={l.id} className="mono" style={{ display: "flex", gap: 9, whiteSpace: "nowrap" }}>
              <span style={{ color: "#6e7681", flex: "none" }}>{l.ts}</span>
              <span style={{ color: LOG_COLOR[l.kind], fontWeight: 700, width: 62, flex: "none" }}>{l.kind.toUpperCase()}</span>
              <span style={{ color: "#c9d1d9", overflow: "hidden", textOverflow: "ellipsis" }}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- 허브 카운터 ---- */
function HubCounter({ label, value, icon }: { label: string; value: number; icon: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <div style={{ padding: "11px 12px", borderRadius: "var(--r-sm)", background: "#16181d", border: "1px solid #2a2f37" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon name={icon} size={13} style={{ color: "#8b949e" }} />
        <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 600 }}>{label}</span>
      </div>
      <div className="mono tnum" style={{ fontSize: 19, fontWeight: 800, color: "#e6edf3" }}>{value}</div>
    </div>
  );
}
