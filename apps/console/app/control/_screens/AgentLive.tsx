"use client";
/* ============================================================
   Local Agent 런타임 시뮬 (목업 · 실제 서버 0)
   노드 어댑터(MCU/VPU/ACU/Telemetry/LPU)가 표준 Signal 을 스트림하고
   Local Agent 허브(SignalStore·CommandRouter·EventBus·PolicyEngine)가
   인입 신호를 승격하고, 명령 ACK(received→accepted→executed)를 시연하며,
   PolicyEngine 이 WORKER-PROXIMITY(critical) 발화 시 자동 안전 명령을 건다.
   모든 값 mock(Math.random). 공유 파일 미수정.
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
  modulesToNodes,
  telemetryToSignalChannels,
  capabilityToCommands,
  type CommandDescriptor,
} from "@station/domain";

/* ---- owner_org 색 인라인 매핑 ---- */
const ORG_COLOR: Record<string, string> = {
  "ORG-VIA": "#1f6feb",
  "ORG-AGE": "#d97706",
  "ORG-META": "#16a34a",
  "ORG-DAEDONG": "#8b5cf6",
};
const orgColor = (org: string) => ORG_COLOR[org] ?? "var(--ink-3)";

/* ---- 품질 판정: policy warn/crit 문자열("≥ 28","≤ 10")을 파싱 ---- */
type Qual = "good" | "warn" | "bad";
const QUAL_SEV: Record<Qual, Sev> = { good: "normal", warn: "warning", bad: "critical" };
const QUAL_COLOR: Record<Qual, string> = {
  good: "var(--brand, #1f6feb)",
  warn: "var(--st-warning)",
  bad: "var(--st-critical)",
};

interface Thr { op: ">=" | "<="; n: number }
function parseThr(s?: string): Thr | null {
  if (!s) return null;
  const m = /([≥≤><]=?)\s*([\d.]+)/.exec(s);
  if (!m) return null;
  const op = m[1] === "≥" || m[1] === ">=" || m[1] === ">" ? ">=" : "<=";
  return { op, n: parseFloat(m[2]!) };
}
function judge(v: number, warn: Thr | null, crit: Thr | null): Qual {
  const hit = (t: Thr | null) => (t ? (t.op === ">=" ? v >= t.n : v <= t.n) : false);
  if (hit(crit)) return "bad";
  if (hit(warn)) return "warn";
  return "good";
}

/* ---- 채널 메타 인덱스 (NS channel → unit/policy/label) ---- */
interface ChanMeta {
  label: string;
  unit: string;
  base: number; // 시드 기준값
  warn: Thr | null;
  crit: Thr | null;
}
// NS 채널별 시드 기준값(목업). 매핑 없으면 50.
const BASE_HINT: Record<string, number> = {
  temperature: 25,
  humidity: 72,
  co2: 760,
  illuminance: 18000,
  fps: 28,
  "joint-temp": 58,
  "joint": 58,
  "grip-force": 14,
  grip: 14,
  deviation: 6,
  voltage: 48,
};
function seedBase(channel: string, label: string): number {
  const hay = (channel + " " + label).toLowerCase();
  for (const k of Object.keys(BASE_HINT)) if (hay.includes(k)) return BASE_HINT[k]!;
  return 50;
}

/* ---- 명령 ACK 단계 ---- */
type AckPhase = "received" | "accepted" | "executed" | "rejected";
const ACK_META: Record<AckPhase, { label: string; sev: Sev }> = {
  received: { label: "received", sev: "notice" },
  accepted: { label: "accepted", sev: "notice" },
  executed: { label: "executed", sev: "normal" },
  rejected: { label: "rejected", sev: "critical" },
};
interface CmdEnvelope {
  id: string;
  ts: string;
  nodeId: string;
  nodeLabel: string;
  verb: string;
  safety: CommandDescriptor["safety"];
  ack: CommandDescriptor["ack"];
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

const now = () => new Date().toLocaleTimeString("ko-KR", { hour12: false });
const rid = () => Math.random().toString(36).slice(2, 7).toUpperCase();

/* ---- 노드별 명령: capabilityToCommands 우선, 없으면 node.commands, 없으면 합성 ---- */
const NODE_MODULE: Record<string, string> = {
  VPU: "MOD-CAM-V01",
  ACU: "MOD-EE-PINCH",
};
function commandsForNode(kind: string, nodeCmds: string[] | undefined): CommandDescriptor[] {
  const mod = NODE_MODULE[kind];
  if (mod) {
    const cs = capabilityToCommands(mod);
    if (cs.length) return cs;
  }
  if (nodeCmds && nodeCmds.length)
    return nodeCmds.map((v) => ({ verb: v, ack: "at_least_once" as const, timeoutMs: 1000, safety: "none" as const }));
  // 합성(목업) — 노드 종류별 대표 명령
  const SYN: Record<string, CommandDescriptor[]> = {
    MCU: [
      { verb: "drive.speed_limit", ack: "at_least_once", timeoutMs: 800, safety: "guarded" },
      { verb: "drive.stop", ack: "exactly_once", timeoutMs: 500, safety: "safety_critical" },
    ],
    Telemetry: [{ verb: "telemetry.flush", ack: "at_most_once", timeoutMs: 1200, safety: "none" }],
    LPU: [{ verb: "localize.recalibrate", ack: "at_least_once", timeoutMs: 1500, safety: "none" }],
  };
  return SYN[kind] ?? [{ verb: "node.ping", ack: "at_most_once", timeoutMs: 500, safety: "none" }];
}

export function AgentLive() {
  const nodes = useRef(modulesToNodes()).current;
  const chanMeta = useRef<Record<string, ChanMeta>>({}).current;
  if (Object.keys(chanMeta).length === 0) {
    for (const c of telemetryToSignalChannels()) {
      chanMeta[c.channel] = {
        label: c.label,
        unit: c.unit,
        base: seedBase(c.channel, c.label),
        warn: parseThr(c.policy?.warn),
        crit: parseThr(c.policy?.crit),
      };
    }
  }

  // 노드별 시그널 시계열: { channel: { series, value, qual } }
  type SigState = Record<string, Record<string, { series: number[]; value: number; qual: Qual }>>;
  const [sigs, setSigs] = useState<SigState>(() => {
    const init: SigState = {};
    for (const n of nodes) {
      init[n.nodeId] = {};
      for (const ch of n.signals ?? []) {
        const meta = chanMeta[ch];
        const base = meta?.base ?? 50;
        const series = Array.from({ length: 16 }, () => base);
        init[n.nodeId]![ch] = { series, value: base, qual: "good" };
      }
    }
    return init;
  });

  const [signalCount, setSignalCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [promotedCount, setPromotedCount] = useState(0);
  const [estop, setEstop] = useState(false);
  const [cmds, setCmds] = useState<CmdEnvelope[]>([]);
  const [log, setLog] = useState<LogLine[]>([]);
  const [policyActive, setPolicyActive] = useState(false);

  // 언마운트 시 정리할 timeout 핸들
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const pushLog = (kind: LogKind, text: string) =>
    setLog((prev) => [{ id: rid(), ts: now(), kind, text }, ...prev].slice(0, 60));

  /* ---- 실시간 신호 스트림 tick (~1000ms) ---- */
  useEffect(() => {
    const t = setInterval(() => {
      let promotedThisTick = 0;
      let signalsThisTick = 0;
      setSigs((prev) => {
        const next: SigState = {};
        for (const n of nodes) {
          next[n.nodeId] = {};
          for (const ch of n.signals ?? []) {
            const meta = chanMeta[ch];
            const cur = prev[n.nodeId]?.[ch];
            const base = meta?.base ?? 50;
            const span = Math.max(base * 0.18, 2);
            // 이전값 기준 wobble + 가끔 스파이크
            const prevV = cur?.value ?? base;
            const drift = (Math.random() - 0.5) * span;
            const spike = Math.random() < 0.08 ? (Math.random() - 0.5) * span * 3 : 0;
            let v = prevV + drift + spike;
            // base 근처로 약하게 회귀
            v += (base - v) * 0.15;
            v = Math.round(v * 10) / 10;
            const hasThr = !!(meta?.warn || meta?.crit);
            const qual: Qual = hasThr
              ? judge(v, meta!.warn, meta!.crit)
              : Math.random() < 0.85 ? "good" : Math.random() < 0.6 ? "warn" : "bad";
            const series = [...(cur?.series ?? [base]), v].slice(-16);
            next[n.nodeId]![ch] = { series, value: v, qual };
            signalsThisTick++;
            // 승격 정책: warn/bad 또는 promote 채널은 EventBus 승격
            if (qual !== "good") promotedThisTick++;
          }
        }
        return next;
      });
      setSignalCount((c) => c + signalsThisTick);
      if (promotedThisTick > 0) {
        setPromotedCount((c) => c + promotedThisTick);
        setEventCount((c) => c + promotedThisTick);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- 명령 발행 + 3단계 ACK 체인 ---- */
  function issueCommand(node: { nodeId: string; label: string }, c: CommandDescriptor, auto = false) {
    const id = `CMD-${rid()}`;
    const rejected = estop && c.safety === "safety_critical";
    const env: CmdEnvelope = {
      id,
      ts: now(),
      nodeId: node.nodeId,
      nodeLabel: node.label,
      verb: c.verb,
      safety: c.safety,
      ack: c.ack,
      phase: "received",
      reason: rejected ? "SAFETY_LOCK" : undefined,
    };
    setCmds((prev) => [env, ...prev].slice(0, 30));
    setEventCount((c) => c + 1);
    pushLog("command", `${id} ${c.verb} → ${node.nodeId} · received${auto ? " (policy auto)" : ""}`);

    const setPhase = (phase: AckPhase, reason?: string) =>
      setCmds((prev) => prev.map((e) => (e.id === id ? { ...e, phase, reason } : e)));

    if (rejected) {
      const t = setTimeout(() => {
        setPhase("rejected", "SAFETY_LOCK");
        pushLog("safety", `${id} ${c.verb} → REJECTED · SAFETY_LOCK (e-stop 활성)`);
      }, 250);
      timers.current.push(t);
      return;
    }
    const t1 = setTimeout(() => { setPhase("accepted"); pushLog("command", `${id} accepted · ack=${c.ack}`); }, 250);
    const t2 = setTimeout(() => {
      setPhase("executed");
      pushLog("command", `${id} executed · ${node.nodeId} (${c.timeoutMs}ms timeout)`);
    }, 520);
    timers.current.push(t1, t2);
  }

  /* ---- PolicyEngine: 작업자 감지 주입 ---- */
  function injectWorkerProximity() {
    setPolicyActive(true);
    setEventCount((c) => c + 1);
    pushLog("policy", "EVT WORKER-PROXIMITY (critical) 발행 · PolicyEngine 트리거");

    const acu = nodes.find((n) => n.kind === "ACU");
    const mcu = nodes.find((n) => n.kind === "MCU");
    // 자동 안전 명령: ACU slow_down + MCU speed_limit
    const t1 = setTimeout(() => {
      if (acu) issueCommand(acu, { verb: "ee.slow_down", ack: "exactly_once", timeoutMs: 500, safety: "guarded" }, true);
    }, 120);
    const t2 = setTimeout(() => {
      if (mcu) issueCommand(mcu, { verb: "drive.speed_limit", ack: "exactly_once", timeoutMs: 500, safety: "guarded" }, true);
    }, 300);
    timers.current.push(t1, t2);
  }
  function resetPolicy() {
    setPolicyActive(false);
    pushLog("policy", "PolicyEngine 리셋 · WORKER-PROXIMITY 해제");
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* ---- 헤더 ---- */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".4px" }}>LOCAL AGENT · RUNTIME</span>
        <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Local Agent · 런타임 시뮬 (목업)</h1>
        <div style={{ flex: 1 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
          color: estop ? "var(--st-critical)" : "var(--ink-3)", cursor: "pointer" }}>
          <input type="checkbox" checked={estop} onChange={(e) => {
            setEstop(e.target.checked);
            pushLog("safety", `e-stop ${e.target.checked ? "활성" : "해제"} · safety-critical 명령 ${e.target.checked ? "차단" : "허용"}`);
          }} />
          <Icon name="power" size={14} /> e-stop {estop ? "활성" : "해제"}
        </label>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>
          <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--st-normal)" }} />
          agent live · {nodes.length} nodes
        </span>
      </div>

      {/* e-stop / policy 안전 배너 */}
      {policyActive && (
        <SafetyBanner sev="critical" icon="alert">
          PolicyEngine 발화 — WORKER-PROXIMITY 감지. ACU slow_down · MCU speed_limit 자동 인가됨.
        </SafetyBanner>
      )}
      {estop && !policyActive && (
        <SafetyBanner sev="emergency" icon="power">
          긴급정지(e-stop) 활성 — safety-critical 명령은 SAFETY_LOCK 으로 거부됩니다.
        </SafetyBanner>
      )}

      {/* ---- 3열 본문 ---- */}
      <div style={{ flex: 1, minHeight: 0, display: "grid",
        gridTemplateColumns: "minmax(300px,1.1fr) minmax(240px,0.9fr) minmax(300px,1.1fr)",
        gap: 0 }}>
        {/* === 좌: 노드 레인 === */}
        <section style={{ minHeight: 0, overflow: "auto", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <PanelHead title="노드 레인" sub="기관 산출 노드 · 표준 신호 스트림" dense
            right={<span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{nodes.length} nodes</span>} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {nodes.map((n) => {
              const oc = orgColor(n.ownerOrg);
              const nodeSigs = sigs[n.nodeId] ?? {};
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
                    {(n.signals ?? []).length === 0 ? (
                      <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--ink-3)" }}>표준 신호 없음</div>
                    ) : (n.signals ?? []).map((ch) => {
                      const s = nodeSigs[ch];
                      const meta = chanMeta[ch];
                      const q = s?.qual ?? "good";
                      return (
                        <div key={ch} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
                          <div style={{ width: 116, flex: "none", minWidth: 0 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta?.label ?? ch}</div>
                            <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch}</div>
                          </div>
                          <Sparkline data={s?.series ?? [0, 0]} w={86} h={24} color={QUAL_COLOR[q]} />
                          <div style={{ flex: 1 }} />
                          <span className="mono tnum" style={{ fontSize: 11.5, fontWeight: 700, width: 58, textAlign: "right" }}>
                            {s?.value ?? "—"}<span style={{ fontSize: 9, color: "var(--ink-3)", marginLeft: 2 }}>{meta?.unit}</span>
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
              <HubCounter label="발행 이벤트" value={eventCount} icon="zap" />
              <HubCounter label="승격 신호" value={promotedCount} icon="trending" />
              <HubCounter label="발행 명령" value={cmds.length} icon="terminal" />
            </div>

            {([
              { id: "SignalStore", desc: "표준 채널 수집·승격", icon: "database" as const },
              { id: "CommandRouter", desc: "verb → 노드 라우팅 · ACK", icon: "route" as const },
              { id: "EventBus", desc: "신호·명령·정책 이벤트", icon: "waves" as const },
              { id: "PolicyEngine", desc: "안전 규칙 자동 인가", icon: "shield" as const },
            ]).map((b) => {
              const hot = b.id === "PolicyEngine" && policyActive;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 13px",
                  borderRadius: "var(--r-sm)", background: "#16181d",
                  border: `1px solid ${hot ? "var(--st-critical)" : "#2a2f37"}` }}>
                  <Icon name={b.icon} size={18} style={{ color: hot ? "#ff7b72" : "#79c0ff", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#e6edf3" }}>{b.id}</div>
                    <div style={{ fontSize: 10.5, color: "#8b949e" }}>{b.desc}</div>
                  </div>
                  <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%",
                    background: hot ? "#ff7b72" : "#3fb950", flex: "none" }} />
                </div>
              );
            })}

            {/* PolicyEngine 시연 */}
            <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="shield" size={15} style={{ color: "var(--ink-2)" }} /> PolicyEngine 시연
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.45 }}>
                작업자 근접 이벤트를 EventBus 에 주입하면 ACU slow_down · MCU speed_limit 가 자동 인가됩니다.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn primary sm" onClick={injectWorkerProximity} style={{ flex: 1 }}>
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
            {/* 노드별 명령 버튼 */}
            {nodes.map((n) => {
              const cs = commandsForNode(n.kind, n.commands);
              return (
                <div key={n.nodeId} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, flex: "none", display: "grid", placeItems: "center",
                      background: orgColor(n.ownerOrg), color: "#fff", fontSize: 8, fontWeight: 800 }}>{n.kind}</span>
                    <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-2)" }}>{n.nodeId}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cs.map((c, i) => {
                      const danger = c.safety === "safety_critical";
                      const locked = estop && danger;
                      return danger ? (
                        <HoldButton key={c.verb + i} label={<span className="mono" style={{ fontSize: 10.5 }}>{c.verb}</span>}
                          holdLabel="hold…" danger disabled={locked} duration={700}
                          onConfirm={() => issueCommand(n, c)}
                          style={{ height: 30, padding: "0 10px", fontSize: 10.5 }} />
                      ) : (
                        <button key={c.verb + i} className="btn sm" onClick={() => issueCommand(n, c)}
                          style={{ height: 30 }} title={`ack=${c.ack} · ${c.timeoutMs}ms · safety=${c.safety}`}>
                          <span className="mono" style={{ fontSize: 10.5 }}>{c.verb}</span>
                          {c.safety === "guarded" && <Icon name="shield" size={11} style={{ marginLeft: 3, color: "var(--ink-3)" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 발행 이력 */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 7 }}>발행 이력</div>
              {cmds.length === 0 ? (
                <EmptyNote icon="terminal" title="발행된 명령 없음" sub="노드 명령을 눌러 ACK 흐름을 시연하세요." />
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
