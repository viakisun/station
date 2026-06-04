"use client";
import { useEffect, useRef, useState } from "react";
import { Icon, PanelHead, StatusBadge, type Sev, type IconName } from "@station/design-system";
import {
  RELEASE,
  modulesToNodes,
  STANDARD_NODE_KINDS,
  isStandardNodeKind,
  ORGANIZATIONS,
} from "@station/domain";

/* ============================================================
   C02-08 Conformance · SDK — 노드 적합성 SDK (목업)
   "표준 계약을 따르면 어떤 노드든 합류 (O(N²)→O(1))"
   ============================================================ */

type CaseState = "pending" | "running" | "pass" | "fail";
type CaseResult = { state: CaseState; exp?: string; act?: string };
type LogLine = { line: string; sev: string; t: string };

// 표준 계약 체크리스트(7종) — manifest/profile/schema/contract 계열
const CONTRACTS: { key: string; label: string; sub: string; icon: IconName }[] = [
  { key: "capability_profile.yaml", label: "Capability Profile", sub: "노드 능력 선언", icon: "layers" },
  { key: "protocol_profile.yaml", label: "Protocol Profile", sub: "전송·인코딩 계약", icon: "branch" },
  { key: "telemetry_schema.json", label: "Telemetry Schema", sub: "채널·단위·품질", icon: "database" },
  { key: "command_contract.yaml", label: "Command Contract", sub: "verb·ack·timeout", icon: "terminal" },
  { key: "firmware_manifest.json", label: "Firmware Manifest", sub: "fw 버전·서명", icon: "server" },
  { key: "calibration_requirements.json", label: "Calibration", sub: "교정 요구사항", icon: "gauge" },
  { key: "manifest.json", label: "ModuleManifest", sub: "노드 식별·메타", icon: "pkg" },
];

const orgName = (orgId: string) => ORGANIZATIONS[orgId]?.name ?? orgId;

type SelNode = {
  nodeId: string;
  kind: string;
  ownerOrg: string;
  label: string;
  signals: string[];
  modules: string[];
  custom?: boolean;
};

export function NodeSdk() {
  // 좌측 목록: 표준 5종 노드(modulesToNodes) — 선택 가능
  const nodes: SelNode[] = modulesToNodes().map((n) => ({
    nodeId: n.nodeId,
    kind: n.kind,
    ownerOrg: n.ownerOrg,
    label: n.label,
    signals: n.signals ?? [],
    modules: n.modules,
  }));

  const [selId, setSelId] = useState<string>(nodes[0]?.nodeId ?? "");
  const selNode = nodes.find((n) => n.nodeId === selId) ?? nodes[0];

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* ── 상단: SDK 가치 ── */}
      <ValueHeader />

      {/* ── 중앙: 노드 적합성 리포트 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--gap)", alignItems: "start" }}>
        <NodeList nodes={nodes} selId={selId} onSelect={setSelId} />
        {selNode && <ConformanceReport key={selNode.nodeId} node={selNode} />}
      </div>

      {/* ── 하단: 신규 노드 합류 시연 ── */}
      <ThirdPartyOnboard />
    </div>
  );
}

/* ---------------- 상단 SDK 가치 ---------------- */
function ValueHeader() {
  const R = RELEASE;
  const okContracts = CONTRACTS.filter((c) => R.auditArtifacts.find((a) => a.f === c.key)?.ok).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      <div className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 44, height: 44, borderRadius: 10, flex: "none", display: "grid", placeItems: "center", background: "var(--brand)", color: "#fff" }}>
          <Icon name="shield" size={24} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>Conformance · SDK</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>v{R.kpi.sdkVersion}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            표준 계약을 따르면 <b>어떤 노드든 합류</b> — 노드↔노드 직접 통합{" "}
            <span className="mono" style={{ color: "var(--st-critical)" }}>O(N²)</span>
            {" → "}
            표준 계약 1건만 검증{" "}
            <span className="mono" style={{ color: "var(--st-normal)" }}>O(1)</span>
          </div>
        </div>
        <div style={{ textAlign: "center", flex: "none" }}>
          <div className="tnum" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "var(--st-normal)" }}>{okContracts}/{CONTRACTS.length}</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>표준 계약</div>
        </div>
      </div>

      {/* 표준 계약 체크리스트 */}
      <div className="card">
        <PanelHead title="표준 계약 체크리스트" sub="Capability · Protocol · Telemetry · Command · Firmware · Calibration · ModuleManifest" dense />
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
          {CONTRACTS.map((c) => {
            const art = RELEASE.auditArtifacts.find((a) => a.f === c.key);
            const ok = !!art?.ok;
            return (
              <div key={c.key} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "11px 12px", display: "flex", flexDirection: "column", gap: 7, background: "var(--surface)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-2)" }}><Icon name={c.icon} size={17} /></span>
                  <StatusBadge sev={ok ? "normal" : "warning"} label={ok ? "ok" : "missing"} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{c.label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{c.sub}</div>
                </div>
                <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{c.key}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 좌측 노드/모듈 목록 ---------------- */
function NodeList({ nodes, selId, onSelect }: { nodes: SelNode[]; selId: string; onSelect: (id: string) => void }) {
  const R = RELEASE;
  return (
    <div className="card" style={{ position: "sticky", top: 0 }}>
      <PanelHead title="노드 · 모듈" sub={`표준 ${STANDARD_NODE_KINDS.length}종 · ${R.modules.length} modules`} dense />
      <div style={{ maxHeight: 560, overflow: "auto" }}>
        {nodes.map((n) => {
          const on = n.nodeId === selId;
          return (
            <button key={n.nodeId} onClick={() => onSelect(n.nodeId)} style={{
              width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--line)",
              padding: "11px 14px", background: on ? "var(--surface-2)" : "transparent", display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: "var(--brand)", padding: "1px 6px", borderRadius: 4 }}>{n.kind}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{n.label}</span>
                {on && <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{n.nodeId}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-2)" }}>· {orgName(n.ownerOrg)}</span>
              </div>
              {/* 부착 모듈 + auditState 배지 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {n.modules.length === 0 && <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>모듈 없음</span>}
                {n.modules.map((mid) => {
                  const m = R.modules.find((x) => x.id === mid);
                  const am = m ? R.auditMeta[m.auditState] : undefined;
                  return (
                    <span key={mid} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, padding: "1px 6px", background: "var(--surface-3)", border: "1px solid var(--line)", borderRadius: 4 }}>
                      <span className="mono">{mid}</span>
                      {am && <StatusBadge sev={am.sev as Sev} label={am.label} dot={false} />}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 우측 Conformance 리포트 (ConformanceRunner 패턴) ---------------- */
function ConformanceReport({ node }: { node: SelNode }) {
  const R = RELEASE;
  const cases = R.testCases;
  const total = cases.length;

  const [results, setResults] = useState<Record<string, CaseResult>>({});
  const [log, setLog] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const done = Object.values(results).filter((r) => r.state === "pass" || r.state === "fail").length;
  const passed = Object.values(results).filter((r) => r.state === "pass").length;
  const failed = Object.values(results).filter((r) => r.state === "fail").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (line: string, sev = "info") => setLog((l) => [...l, { line, sev, t: nowStr() }]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setResults({}); setLog([]); setRunning(true); setActiveId(null);
    addLog(`conformance run started — ${node.nodeId} (${node.kind}) / ${orgName(node.ownerOrg)}`, "info");
    let acc = 300;
    cases.forEach((c) => {
      timers.current.push(setTimeout(() => {
        setActiveId(c.id); setResults((r) => ({ ...r, [c.id]: { state: "running" } }));
        addLog(`▶ ${c.id} ${c.name}`, "info");
      }, acc));
      acc += c.ms;
      timers.current.push(setTimeout(() => {
        const pass = !c.fail;
        setResults((r) => ({ ...r, [c.id]: { state: pass ? "pass" : "fail", exp: c.exp, act: c.act } }));
        addLog(pass ? `  ✓ pass (${c.ms}ms)` : `  ✕ FAIL — expected ${c.exp}, got ${c.act}`, pass ? "pass" : "fail");
      }, acc - 40));
    });
    timers.current.push(setTimeout(() => {
      setRunning(false); setActiveId(null);
      addLog(`run 완료 — ${cases.filter((c) => !c.fail).length} pass / ${cases.filter((c) => c.fail).length} fail`, "info");
    }, acc + 80));
  };

  // 스위트별 케이스 그룹
  const bySuite = R.testSuites.map((s) => ({ suite: s, cases: cases.filter((c) => c.suite === s.id) }));

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <PanelHead
        title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>노드 적합성 리포트 <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{node.nodeId}</span></span>}
        sub={`${node.label} · ${orgName(node.ownerOrg)} · Conformance suites ${R.testSuites.length}`}
        dense
        right={
          <button className="btn primary" onClick={run} disabled={running}>
            {running ? <><Icon name="refresh" size={15} className="live-pulse" /> running…</> : <><Icon name="play" size={15} /> Run</>}
          </button>
        }
      />

      {/* 통계 + 진행바 */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid var(--line)" }}>
        <Stat3 label="pass" value={passed} sev="normal" />
        <Stat3 label="fail" value={failed} sev={failed ? "critical" : "disabled"} />
        <Stat3 label="total" value={`${done}/${total}`} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: progress + "%", height: "100%", background: failed ? "var(--st-warning)" : "var(--brand)", transition: "width .3s" }} />
          </div>
          <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", width: 38 }}>{progress}%</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 0 }}>
        {/* suites × cases */}
        <div style={{ borderRight: "1px solid var(--line)" }}>
          {bySuite.map(({ suite, cases: scases }) => (
            <div key={suite.id} style={{ borderBottom: "1px solid var(--line)" }}>
              <div style={{ padding: "8px 14px", background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700 }}>{suite.name}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{suite.id}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-3)", marginLeft: "auto" }}>{suite.cases} cases</span>
              </div>
              {scases.length === 0 && (
                <div style={{ padding: "7px 14px 7px 14px", fontSize: 10.5, color: "var(--ink-3)" }}>대표 케이스 없음 (집계 {suite.cases})</div>
              )}
              {scases.map((c) => {
                const r = results[c.id] || { state: "pending" as CaseState };
                return (
                  <div key={c.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 14px", background: c.id === activeId ? "var(--surface-2)" : "transparent" }}>
                      <CaseDot state={r.state} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{c.id}</span>
                      </div>
                      {r.state === "pass" && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--st-normal)" }}>pass</span>}
                      {r.state === "fail" && <StatusBadge sev="critical" label="fail" />}
                      {r.state === "running" && <span className="live-pulse" style={{ fontSize: 11, fontWeight: 700, color: "var(--st-notice)" }}>running</span>}
                      {r.state === "pending" && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>queued</span>}
                    </div>
                    {r.state === "fail" && (
                      <div style={{ padding: "0 14px 10px 39px", display: "flex", flexDirection: "column", gap: 4 }}>
                        <DiffLine label="expected" val={r.exp} ok />
                        <DiffLine label="actual" val={r.act} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 라이브 로그 + artifacts */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", background: "#1c1c1a", minHeight: 240 }}>
            <div style={{ padding: "9px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}>
                <Icon name="terminal" size={15} /> Live log
              </span>
              {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
            </div>
            <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11, lineHeight: 1.7, maxHeight: 300 }}>
              {log.length === 0 && <span style={{ color: "#666" }}>$ idle — press &apos;Run&apos;</span>}
              {log.map((l, i) => (
                <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                  <span style={{ color: "#555" }}>{l.t} </span>{l.line}
                </div>
              ))}
            </div>
          </div>

          {/* audit artifacts 체크리스트 */}
          <div>
            <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--line)", fontSize: 12, fontWeight: 700 }}>Audit artifacts</div>
            <div style={{ maxHeight: 260, overflow: "auto" }}>
              {R.auditArtifacts.map((a) => (
                <div key={a.f} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 14px", borderBottom: "1px solid var(--line)" }}>
                  {a.ok
                    ? <Icon name="check" size={14} stroke={2.6} style={{ color: "var(--st-normal)", flex: "none" }} />
                    : <Icon name="close" size={14} stroke={2.6} style={{ color: "var(--st-warning)", flex: "none" }} />}
                  <span className="mono" style={{ fontSize: 11, flex: 1, color: a.ok ? "var(--ink)" : "var(--ink-3)" }}>{a.f}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{a.note || (a.ok ? "ok" : "missing")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 하단: 신규(제3자 custom) 노드 합류 시연 ---------------- */
const FCU_KIND = "FCU";
const FCU_CASES: { id: string; name: string; ms: number }[] = [
  { id: "FC-001", name: "manifest ext.module.sprayer.v1 검증", ms: 220 },
  { id: "FC-002", name: "Capability Profile 선언(살포·유량)", ms: 260 },
  { id: "FC-003", name: "Telemetry Schema 채널 매핑", ms: 240 },
  { id: "FC-004", name: "Command Contract spray.start/stop ack", ms: 300 },
  { id: "FC-005", name: "Safety interlock — geofence/E-STOP", ms: 280 },
  { id: "FC-006", name: "Protocol Profile PRT-MQTT-v2 정합", ms: 200 },
];

function ThirdPartyOnboard() {
  const [results, setResults] = useState<Record<string, CaseState>>({});
  const [log, setLog] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [doneRun, setDoneRun] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const total = FCU_CASES.length;
  const passed = Object.values(results).filter((s) => s === "pass").length;
  const progress = Math.round((Object.values(results).filter((s) => s === "pass" || s === "fail").length / total) * 100);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (line: string, sev = "info") => setLog((l) => [...l, { line, sev, t: nowStr() }]);

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setResults({}); setLog([]); setRunning(true); setDoneRun(false);
    addLog("3rd-party 노드 제출 — 방제 드론 FCU / blueprint.spray-drone", "info");
    addLog(`isStandardNodeKind("${FCU_KIND}") = ${isStandardNodeKind(FCU_KIND)} → custom kind 허용`, "info");
    let acc = 350;
    FCU_CASES.forEach((c) => {
      timers.current.push(setTimeout(() => {
        setResults((r) => ({ ...r, [c.id]: "running" }));
        addLog(`▶ ${c.id} ${c.name}`, "info");
      }, acc));
      acc += c.ms;
      timers.current.push(setTimeout(() => {
        setResults((r) => ({ ...r, [c.id]: "pass" }));
        addLog(`  ✓ pass (${c.ms}ms)`, "pass");
      }, acc - 40));
    });
    timers.current.push(setTimeout(() => {
      setRunning(false); setDoneRun(true);
      addLog("conformance 통과 — 레지스트리 등록", "pass");
      addLog("기존 플릿 무변경 · 어댑터 자동 흡수 (O(1))", "pass");
    }, acc + 100));
  };

  return (
    <div className="card">
      <PanelHead
        title="신규 노드 합류 시연 — 제3자 custom 노드"
        sub="방제 드론 FCU · manifest ext.module.sprayer.v1 · blueprint.spray-drone"
        dense
        right={
          <button className="btn primary" onClick={run} disabled={running}>
            {running ? <><Icon name="refresh" size={15} className="live-pulse" /> running…</> : <><Icon name="play" size={15} /> 적합성 Run</>}
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", padding: "var(--gap)" }}>
        {/* 좌: 제출 노드 카드 + 표준 5종 + FCU 배지 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "14px 16px", background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 9, flex: "none", display: "grid", placeItems: "center", background: "var(--surface-2)", border: "1px dashed var(--line-strong)" }}>
                <Icon name="zap" size={20} style={{ color: "var(--brand)" }} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>방제 드론 노드</span>
                  <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: "var(--st-notice)", padding: "1px 6px", borderRadius: 4 }}>{FCU_KIND}</span>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>NODE-FCU-3RDPARTY · custom</span>
              </div>
            </div>
            <KeyRow k="manifest" v="ext.module.sprayer.v1" />
            <KeyRow k="blueprint" v="blueprint.spray-drone" />
            <KeyRow k="protocol" v="PRT-MQTT-v2" />
            <KeyRow k="isStandardNodeKind" v={`("${FCU_KIND}") = ${String(isStandardNodeKind(FCU_KIND))}`} mark={isStandardNodeKind(FCU_KIND) ? "std" : "custom"} />
          </div>

          {/* 표준 5종 + FCU 배지 */}
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "12px 14px", background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>노드 종류 (개방형 taxonomy)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STANDARD_NODE_KINDS.map((k) => (
                <span key={k} className="mono" style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: "var(--surface-2)", border: "1px solid var(--line)" }}>{k}</span>
              ))}
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: "var(--st-notice)", color: "#fff" }}>+ {FCU_KIND}</span>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 8 }}>표준 5종 자동완성 + custom 허용 — 온실 분류에 가두지 않음.</div>
          </div>

          {/* 케이스 도트 + 진행바 + 결과 */}
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "12px 14px", background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: progress + "%", height: "100%", background: "var(--brand)", transition: "width .3s" }} />
              </div>
              <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{passed}/{total}</span>
            </div>
            {FCU_CASES.map((c) => {
              const st = results[c.id] || "pending";
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                  <CaseDot state={st} />
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{c.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{c.id}</span>
                </div>
              );
            })}
            {doneRun && (
              <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: "var(--r-sm)", background: "color-mix(in srgb, var(--st-normal) 12%, transparent)", border: "1px solid var(--st-normal)", display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="check" size={18} stroke={2.6} style={{ color: "var(--st-normal)", flex: "none" }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--st-normal)" }}>레지스트리 등록 완료</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>기존 플릿 무변경 · 어댑터 자동 흡수 <span className="mono" style={{ color: "var(--st-normal)" }}>O(1)</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우: 라이브 로그 */}
        <div style={{ display: "flex", flexDirection: "column", background: "#1c1c1a", borderRadius: "var(--r-sm)", minHeight: 320, overflow: "hidden" }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#ddd" }}>
              <Icon name="terminal" size={15} /> Onboarding log
            </span>
            {running && <span className="live-pulse" style={{ fontSize: 10.5, color: "var(--brand-live)", fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div ref={logRef} className="mono" style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11, lineHeight: 1.7 }}>
            {log.length === 0 && <span style={{ color: "#666" }}>$ idle — 제3자 노드 제출 후 &apos;적합성 Run&apos;</span>}
            {log.map((l, i) => (
              <div key={i} style={{ color: l.sev === "fail" ? "#ff8a6a" : l.sev === "pass" ? "#6fdca0" : "#9a9a93", whiteSpace: "pre-wrap" }}>
                <span style={{ color: "#555" }}>{l.t} </span>{l.line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 공통 소품 ---------------- */
function KeyRow({ k, v, mark }: { k: string; v: string; mark?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ fontSize: 11, color: "var(--ink-3)", width: 124, flex: "none" }}>{k}</span>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", flex: 1 }}>{v}</span>
      {mark && <span style={{ fontSize: 10, fontWeight: 700, color: mark === "custom" ? "var(--st-notice)" : "var(--ink-3)" }}>{mark}</span>}
    </div>
  );
}

function Stat3({ label, value, sev }: { label: string; value: React.ReactNode; sev?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: sev ? `var(--st-${sev})` : "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}
function CaseDot({ state }: { state: CaseState }) {
  if (state === "pass") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-normal)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="check" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "fail") return <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--st-critical)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="close" size={11} stroke={3} style={{ color: "#fff" }} /></span>;
  if (state === "running") return <span className="live-pulse" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--st-notice)", flex: "none" }} />;
  return <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--line-strong)", flex: "none" }} />;
}
function DiffLine({ label, val, ok }: { label: string; val?: string; ok?: boolean }) {
  return (
    <div className="mono" style={{ fontSize: 11, display: "flex", gap: 8 }}>
      <span style={{ width: 60, color: "var(--ink-3)", flex: "none" }}>{label}</span>
      <span style={{ color: ok ? "var(--st-normal)" : "var(--st-critical)" }}>{val}</span>
    </div>
  );
}
function nowStr() { const d = new Date(); return d.toTimeString().slice(0, 8); }
