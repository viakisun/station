"use client";
/* [SWC-HUB] Commercial SaaS landing.
   Audience: enterprise buyers evaluating consortium robot integration.
   디자인: 다크·중립(ADR-021), 상태색만 의미색. dev 메타 비노출. */
import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@station/app-kit";
import { PRODUCTS } from "@station/app-kit";
import * as D from "./_data";

const C = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" } as const;

function Section({ eyebrow, title, lead, children, pillar }: { eyebrow: string; title: string; lead?: string; children?: ReactNode; pillar?: "①" | "②" }) {
  return (
    <section style={{ borderTop: "1px solid var(--line-subtle)", padding: "56px 0" }}>
      <div style={C}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {pillar && (
            <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--text-inverse)", background: "var(--gray-100)", borderRadius: 4, padding: "2px 7px" }}>
              {pillar === "①" ? "기술 통합" : "조직 통합"}
            </span>
          )}
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-muted)" }}>{eyebrow}</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.4px", margin: "0 0 10px", lineHeight: 1.18 }}>{title}</h2>
        {lead && <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 780, lineHeight: 1.65, margin: "0 0 26px" }}>{lead}</p>}
        {children}
      </div>
    </section>
  );
}

const card = (extra?: CSSProperties): CSSProperties => ({
  background: "var(--surface-panel)",
  border: "1px solid var(--line-default)",
  borderRadius: "var(--radius-lg)",
  padding: 16,
  ...extra,
});

const READY_TONE: Record<D.Readiness, { c: string; bg: string; t: string }> = {
  verified: { c: "var(--state-normal)", bg: "var(--state-normal-bg)", t: "검증 완료" },
  in_progress: { c: "var(--state-notice)", bg: "var(--state-notice-bg)", t: "진행 중" },
  blocked: { c: "var(--state-warning)", bg: "var(--state-warning-bg)", t: "차단" },
};
const CHAN_TONE: Record<D.Channel, string> = { stable: "var(--state-normal)", beta: "var(--state-info)", canary: "var(--state-warning)", draft: "var(--text-muted)" };

const outcomeCards = [
  { k: "기관 분산", v: `${D.orgs.length}개 기관`, d: "기관별 산출물과 소유 범위를 하나의 계약 기준으로 정리합니다." },
  { k: "통합 대상", v: `${D.fabric.nodeCount}개 노드`, d: "MCU, VPU, LPU, ACU, Telemetry가 같은 통합 흐름에 올라옵니다." },
  { k: "검증 현황", v: `${D.readinessSummary.verified}/${D.readinessSummary.total}`, d: "릴리스 후보별 준비 상태를 산출물 단위로 판단합니다." },
  { k: "릴리스 판단", v: D.targetRobot.targetChannel, d: "검증 결과를 draft, canary, beta, stable 채널로 관리합니다." },
] as const;

/* ── Hero ───────────────────────────────────────────────── */
export function Hero() {
  return (
    <header style={{ padding: "72px 0 34px" }}>
      <div style={C}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--surface-panel-raised)", border: "1px solid var(--line-strong)", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.2px" }}>STATION</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>Integration orchestration SaaS</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.12, margin: "0 0 18px", maxWidth: 870 }}>
          여러 기관의 로봇 산출물을<br />
          {" "}<span style={{ color: "var(--accent-live)" }}>하나의 검증 가능한 릴리스</span>로 연결합니다.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 760, lineHeight: 1.68, margin: "0 0 26px" }}>
          STATION은 노드, 모듈, 계약, 검증 결과를 한 화면에 모아 통합 현황을 판단하게 합니다.
          전화와 메일로 확인하던 준비 상태, 차단 사유, 다음 책임자, 릴리스 가능 여부를 제품 안에서 추적합니다.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="#readiness" className="btn primary" style={{ textDecoration: "none" }}>Readiness 현황 보기</a>
          <a href="#fabric" className="btn" style={{ textDecoration: "none" }}>통합 구조 보기</a>
        </div>
      </div>
    </header>
  );
}

/* ── Problem / Outcome ──────────────────────────────────── */
export function ProblemOutcomeSection() {
  return (
    <section style={{ padding: "8px 0 48px" }}>
      <div style={C}>
        <div style={{ ...card({ background: "var(--surface-panel-raised)", borderColor: "var(--line-strong)", padding: 0, overflow: "hidden" }) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {outcomeCards.map((item) => (
              <div key={item.k} style={{ padding: "18px 18px 17px", borderRight: "1px solid var(--line-subtle)", borderBottom: "1px solid var(--line-subtle)" }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 7 }}>{item.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.2px", marginBottom: 7 }}>{item.v}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 기술 통합: 적과/적심 로봇 개념도 → 표준 계약 ────────── */
export function FabricSection() {
  return (
    <Section
      pillar="①"
      eyebrow="Integration Fabric · Local Agent"
      title="이기종 노드를 표준 계약 계층으로 정규화합니다"
      lead="적과·적심 로봇은 여러 기관이 만든 부위(모바일 베이스·측위·비전·매니퓰레이터·게이트웨이)로 이뤄진다. 각 부위는 CAN·ROS2·DDS·MQTT로 제각각 말하지만, Local Agent가 이를 흡수해 표준 Signal·Command·Event 계약 한 면으로 정규화한다."
    >
      <div id="fabric" style={card({ padding: 0, overflow: "hidden" })}>
        <RobotConcept />
      </div>

      {/* 노드 범례(자동 도출) + 정규화 면 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 12, marginTop: 12 }}>
        <div style={card()}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 10 }}>로봇 부위 = 기관별 노드</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {D.nodes.map((n, i) => (
              <div key={n.kind} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent-live)", color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", flex: "none" }}>{i + 1}</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, width: 74 }}>{n.kind}</span>
                <span className="badge" style={{ fontSize: 9.5 }}>{n.transport}</span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 4 }}>{D.robotRole[n.kind]}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>{n.ownerName}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card({ borderColor: "var(--line-strong)", background: "var(--surface-panel-raised)" })}>
          <strong style={{ fontSize: 13 }}>Local Agent · 계약 정규화</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {["SignalStore", "CommandRouter · 3-step ACK", "Gate", "Conformance", "App Runtime", "Policy"].map((m) => (
              <span key={m} className="chip" style={{ height: 24, fontSize: 11 }}>{m}</span>
            ))}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.6 }}>
            → 표준 Signal / Command / Event 한 면
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, alignItems: "center" }}>
        {[[`${D.fabric.nodeCount}`, "통합 노드"], [`${D.fabric.transports.length}`, "전송 방식"], [`${D.fabric.ifCount}`, "계약 인터페이스"], [`${D.fabric.verbCount}`, "명령 verb"], ["PASS", "Conformance"]].map(([v, l]) => (
          <div key={l} style={{ ...card({ padding: "10px 14px" }), display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{v}</span>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{l}</span>
          </div>
        ))}
        <span style={{ flex: 1 }} />
        <a href={`${process.env.NEXT_PUBLIC_BUILD_URL ?? "http://localhost:7333"}/transport`} className="linkish" style={{ fontSize: 12.5 }}>전송 현황 보기 → /transport</a>
      </div>
      <p className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 10 }}>Reference rig: pnpm --filter @station/local-agent start:rig</p>
    </Section>
  );
}

/* 적과·적심 로봇 개념도 — 부위(노드)가 이기종 전송으로 말하고 Local Agent 가 표준 계약으로 정규화. */
function RobotConcept() {
  const tx = (k: string) => D.nodes.find((n) => n.kind === k)?.transport ?? "";
  const A = [
    { k: "MCU", n: 1, x: 176, y: 266, hy: 140 },
    { k: "LPU", n: 2, x: 110, y: 242, hy: 164 },
    { k: "VPU", n: 3, x: 160, y: 103, hy: 188 },
    { k: "ACU", n: 4, x: 300, y: 196, hy: 212 },
    { k: "Telemetry", n: 5, x: 250, y: 168, hy: 236 },
  ];
  return (
    <svg viewBox="0 0 1040 350" role="img" aria-label="적과·적심 로봇 개념도 — 이기종 노드를 표준 계약으로 정규화"
      style={{ width: "100%", height: "auto", display: "block", color: "var(--text-secondary)", padding: "12px 4px" }}>
      {/* ground */}
      <line x1="24" y1="314" x2="404" y2="314" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" style={{ opacity: 0.5 }} />
      {/* plant target — 적과/적심 대상 */}
      <g stroke="currentColor" strokeWidth="2" fill="none" style={{ opacity: 0.7 }}>
        <path d="M348 300 V198" />
        <path d="M348 232 q-22 -6 -30 -24" />
        <path d="M348 214 q22 -6 30 -22" />
      </g>
      <g stroke="currentColor" strokeWidth="1.5" style={{ fill: "var(--state-warning-bg)" }}>
        <circle cx="334" cy="210" r="6" /><circle cx="360" cy="222" r="6" /><circle cx="340" cy="240" r="6" />
      </g>
      <text x="318" y="332" style={{ fill: "var(--text-muted)" }} fontSize="9.5">적과 · 적심 대상</text>
      {/* wheels + chassis (MCU) */}
      <g stroke="currentColor" strokeWidth="2">
        <circle cx="120" cy="300" r="20" style={{ fill: "var(--surface-muted)" }} />
        <circle cx="222" cy="300" r="20" style={{ fill: "var(--surface-muted)" }} />
        <circle cx="120" cy="300" r="5" fill="currentColor" /><circle cx="222" cy="300" r="5" fill="currentColor" />
        <rect x="86" y="250" width="178" height="34" rx="8" style={{ fill: "var(--surface-panel-raised)" }} />
      </g>
      {/* mast */}
      <rect x="152" y="116" width="16" height="134" rx="3" stroke="currentColor" strokeWidth="2" style={{ fill: "var(--surface-panel-raised)" }} />
      {/* vision head (VPU) */}
      <g stroke="currentColor" strokeWidth="2">
        <rect x="120" y="86" width="74" height="34" rx="6" style={{ fill: "var(--surface-panel)" }} />
        <circle cx="186" cy="103" r="8" style={{ fill: "var(--surface-muted)" }} /><circle cx="186" cy="103" r="3" fill="currentColor" />
      </g>
      {/* lidar (LPU) */}
      <g stroke="currentColor" strokeWidth="2">
        <rect x="96" y="234" width="30" height="16" rx="3" style={{ fill: "var(--surface-panel)" }} />
        <path d="M101 234 q10 -10 20 0" fill="none" />
      </g>
      {/* arm + gripper (ACU + EE) */}
      <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M168 150 H250 L300 196" />
        <path d="M300 196 l16 -9 M300 196 l16 9" />
      </g>
      {/* antenna (Telemetry) */}
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M240 250 L256 166" /><path d="M248 162 q8 -8 16 0" /><path d="M244 168 q12 -12 24 0" style={{ opacity: 0.5 }} />
      </g>
      {/* anchors + leader lines + transport labels */}
      {A.map((a) => (
        <g key={a.k}>
          <line x1={a.x} y1={a.y} x2={470} y2={a.hy} stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" style={{ opacity: 0.45 }} />
          <text x={462} y={a.hy} dy="-4" textAnchor="end" className="mono" style={{ fill: "var(--text-muted)" }} fontSize="9.5">{tx(a.k)}</text>
          <circle cx={a.x} cy={a.y} r="11" style={{ fill: "var(--accent-live)" }} />
          <text x={a.x} y={a.y} dy="3.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">{a.n}</text>
        </g>
      ))}
      {/* Local Agent hub */}
      <rect x="470" y="124" width="196" height="128" rx="12" strokeWidth="2" style={{ fill: "var(--surface-panel)", stroke: "var(--line-strong)" }} />
      <text x="568" y="170" textAnchor="middle" style={{ fill: "var(--text-primary)" }} fontSize="15" fontWeight="800">Local Agent</text>
      <text x="568" y="190" textAnchor="middle" className="mono" style={{ fill: "var(--text-muted)" }} fontSize="10.5">NodeAdapter · 계약 정규화</text>
      <text x="568" y="210" textAnchor="middle" className="mono" style={{ fill: "var(--text-secondary)" }} fontSize="10">CAN · ROS2 · DDS · MQTT → 흡수</text>
      {/* → standard contract */}
      <line x1="666" y1="188" x2="728" y2="188" stroke="currentColor" strokeWidth="2" />
      <path d="M722 183 l8 5 l-8 5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="730" y="150" width="286" height="76" rx="10" strokeWidth="2" style={{ fill: "var(--surface-panel-raised)", stroke: "var(--line-strong)" }} />
      <text x="746" y="172" className="mono" style={{ fill: "var(--text-muted)" }} fontSize="10">표준 계약</text>
      {["Signal", "Command", "Event"].map((s, i) => (
        <text key={s} x={746 + i * 92} y={199} style={{ fill: "var(--text-primary)" }} fontSize="13" fontWeight="700">{s}</text>
      ))}
      <text x="746" y="217" className="mono" style={{ fill: "var(--text-muted)" }} fontSize="9.5">on-robot HMI · cloud mirror · Build</text>
    </svg>
  );
}

/* ── 기관 / 의존 관계 ──────────────────────────────────── */
export function ConnectSection() {
  return (
    <Section
      eyebrow="Consortium Traceability"
      title="기관별 산출물과 의존 관계를 계약에서 추적합니다"
      lead="STATION은 어떤 기관이 어떤 노드와 명령을 책임지는지, 어떤 산출물이 다른 산출물의 검증을 기다리는지를 계약 데이터에서 계산합니다. 구매자는 통합 리스크를 기관, 산출물, 의존 관계 단위로 볼 수 있습니다."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginBottom: 18 }}>
        {D.orgs.map((o) => (
          <div key={o.orgId} style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 13.5 }}>{o.name}</strong>
              {o.platform && <span className="badge normal" style={{ fontSize: 9.5 }}><span className="dot" />platform</span>}
              <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>{o.orgId}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5, minHeight: 32 }}>{o.role}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              {(o.ownsNodes ?? []).map((n) => <span key={n} className="chip" style={{ height: 22, fontSize: 10.5 }}>{n}</span>)}
              {!!D.verbsByOrg[o.orgId] && <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center", marginLeft: 4 }}>{D.verbsByOrg[o.orgId]} verb</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={card({ padding: 14 })}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 10 }}>계약 의존 관계 · IF-L</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {D.dependencies.map((d) => (
            <span key={d.id} className="mono" style={{ fontSize: 11.5, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 10px", border: "1px solid var(--line-default)", borderRadius: 999 }}>
              <b>{d.from}</b><span style={{ color: "var(--text-muted)" }}>→</span><b>{d.to}</b>
              <span style={{ color: "var(--text-muted)" }}>· {d.carries}</span>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── 조직 통합: Readiness 보드 ─────────────────────────── */
export function ReadinessSection() {
  const s = D.readinessSummary;
  const pct = Math.round((s.verified / s.total) * 100);
  return (
    <Section
      pillar="②"
      eyebrow="Readiness · Release Control"
      title="릴리스 가능한 상태인지 한 화면에서 판단합니다"
      lead="목표 로봇을 기준으로 산출물의 검증 상태, 소유 기관, 차단 사유, 다음 책임자를 모읍니다. Readiness는 Conformance 결과와 계약 의존 관계를 기준으로 산출됩니다."
    >
      <div id="readiness" style={card({ padding: 0, overflow: "hidden" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--line-default)", background: "var(--surface-panel-raised)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{D.targetRobot.label} <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>{D.targetRobot.id}</span></div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>{D.targetRobot.blueprint}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 800 }}>{s.verified}/{s.total}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>검증 완료</span>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ height: 8, background: "var(--surface-muted)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--state-normal)" }} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>목표 채널</div>
            <span className="badge" style={{ color: CHAN_TONE[D.targetRobot.targetChannel], borderColor: CHAN_TONE[D.targetRobot.targetChannel] }}>{D.targetRobot.targetChannel}</span>
          </div>
        </div>

        {s.blocked.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", background: "var(--state-warning-bg)", borderBottom: "1px solid var(--line-default)", flexWrap: "wrap" }}>
            <span className="badge warning" style={{ fontSize: 10 }}><span className="dot" />차단 항목</span>
            <span style={{ fontSize: 12.5, color: "var(--state-warning)", lineHeight: 1.5 }}>
              {s.blocked.map((b) => `${b.artifact}(${b.ownerName})`).join(", ")} · 다음 책임자: <strong>{s.blocked[0]!.nextOwner}</strong>
            </span>
          </div>
        )}

        <div>
          {D.readiness.map((r) => {
            const tone = READY_TONE[r.readiness];
            return (
              <div key={r.artifact} className="hov-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(126px, 1fr))", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--line-subtle)", fontSize: 12.5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <strong>{r.artifact}</strong>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.kind}</span>
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{r.ownerName}</span>
                <span><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 4, background: tone.bg, color: tone.c, fontSize: 11, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.c }} />{tone.t}</span></span>
                <span><span className="mono" style={{ fontSize: 11, color: CHAN_TONE[r.channel], border: `1px solid ${CHAN_TONE[r.channel]}`, borderRadius: 4, padding: "1px 7px" }}>{r.channel}</span></span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 10 }}>Readiness = Conformance + 계약 의존 + 소유 기관 기준. 채널 = draft / canary / beta / stable.</p>
    </Section>
  );
}

/* ── Workflow Studio + lifecycle ────────────────────────── */
export function StudioSection() {
  return (
    <Section
      eyebrow="Workflow Studio"
      title="계약 기반 통합 계획 위에 승인과 채널을 관리합니다"
      lead="STATION은 자유롭게 그리는 워크플로우 도구가 아닙니다. Blueprint와 계약 의존 관계에서 통합 계획을 만들고, 사람은 승인 게이트, 담당자, 릴리스 채널을 관리합니다."
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {D.lifecycle.map((l, i) => (
          <div key={l.step} style={{ ...card({ padding: "12px 14px", flex: "1 1 150px" }), position: "relative" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{String(i + 1).padStart(2, "0")} · {l.step}</div>
            <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0 3px" }}>{l.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.45 }}>{l.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <div style={card()}>
          <strong style={{ fontSize: 13 }}>자동 산출</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <li>Blueprint에서 필요한 노드와 모듈을 계산</li>
            <li>IF-L 계약에서 산출물 간 의존 관계를 계산</li>
            <li>Conformance 결과로 검증 게이트를 반영</li>
          </ul>
        </div>
        <div style={card()}>
          <strong style={{ fontSize: 13 }}>사람의 결정</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <li>승인 게이트와 확인 체크포인트 관리</li>
            <li>통합 스텝별 담당 기관과 역할 할당</li>
            <li>검증된 산출물의 릴리스 채널 승급</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ── 제품군 ─────────────────────────────────────────────── */
export function ProductsSection() {
  return (
    <Section
      eyebrow="Products"
      title="같은 통합 코어 위에서 역할별 업무 화면을 제공합니다"
      lead="Ops, Build, Field, Agent는 분리된 제품처럼 보이지만 같은 로봇, 같은 계약, 같은 검증 상태를 공유합니다. 사용자는 자기 역할에 맞는 밀도와 권한으로 동일한 통합 흐름을 봅니다."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </Section>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line-subtle)", padding: "28px 0 56px" }}>
      <div style={{ ...C }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
          STATION — integration orchestration SaaS for multi-organization robot delivery.<br />
          Local Agent / Contracts / Readiness / Release channel · 계약 SSOT = @station/contracts.
        </div>
      </div>
    </footer>
  );
}
