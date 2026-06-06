"use client";
/* [SWC-HUB] Landing 섹션 — 두 기둥(통합 미들웨어 + 통합 오케스트레이션)을 보이는 화면.
   디자인: 다크·중립(ADR-021), 상태색만 의미색. dev 메타 비노출. design handoff 품질 기준. */
import type { ReactNode } from "react";
import { ProductCard } from "@station/app-kit";
import { PRODUCTS } from "@station/app-kit";
import * as D from "./_data";

const C = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" } as const;

function Section({ eyebrow, title, lead, children, pillar }: { eyebrow: string; title: string; lead?: string; children?: ReactNode; pillar?: "①" | "②" }) {
  return (
    <section style={{ borderTop: "1px solid var(--line-subtle)", padding: "56px 0" }}>
      <div style={C}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {pillar && (
            <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--text-inverse)", background: "var(--gray-100)", borderRadius: 4, padding: "2px 7px" }}>
              기둥 {pillar}
            </span>
          )}
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-muted)" }}>{eyebrow}</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.4px", margin: "0 0 10px", lineHeight: 1.2 }}>{title}</h2>
        {lead && <p style={{ fontSize: 14.5, color: "var(--text-secondary)", maxWidth: 760, lineHeight: 1.65, margin: "0 0 26px" }}>{lead}</p>}
        {children}
      </div>
    </section>
  );
}

const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "var(--surface-panel)", border: "1px solid var(--line-default)", borderRadius: "var(--radius-lg)", padding: 16, ...extra,
});

const READY_TONE: Record<D.Readiness, { c: string; bg: string; t: string }> = {
  verified: { c: "var(--state-normal)", bg: "var(--state-normal-bg)", t: "검증됨" },
  in_progress: { c: "var(--state-notice)", bg: "var(--state-notice-bg)", t: "진행중" },
  blocked: { c: "var(--state-warning)", bg: "var(--state-warning-bg)", t: "막힘" },
};
const CHAN_TONE: Record<D.Channel, string> = { stable: "var(--state-normal)", beta: "var(--state-info)", canary: "var(--state-warning)", draft: "var(--text-muted)" };

/* ── Hero ───────────────────────────────────────────────── */
export function Hero() {
  return (
    <header style={{ padding: "72px 0 8px" }}>
      <div style={C}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--surface-panel-raised)", border: "1px solid var(--line-strong)", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800 }}>S</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.2px" }}>STATION</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>VIA 통합관제 SaaS</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.12, margin: "0 0 18px", maxWidth: 820 }}>
          여러 기관이 <span style={{ color: "var(--text-secondary)" }}>하나의 로봇</span>을 통합한다 —<br />
          <span style={{ color: "var(--accent-live)" }}>기술</span>로 하나 되고, <span style={{ color: "var(--accent-live)" }}>조직</span>으로 하나 된다.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 720, lineHeight: 1.65, margin: "0 0 26px" }}>
          MCU·VPU·LPU·ACU·Telemetry를 각각 다른 회사가 만든다. 지금은 누가 준비됐고 무엇이 막혔는지를
          전화·메일로 확인한다. STATION은 그 통합을 <strong style={{ color: "var(--text-primary)" }}>하나의 미들웨어와 하나의 readiness 보드</strong>로
          보이게 한다.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="#readiness" className="btn primary" style={{ textDecoration: "none" }}>통합 보드 보기</a>
          <a href="#fabric" className="btn" style={{ textDecoration: "none" }}>미들웨어 아키텍처</a>
        </div>
      </div>
    </header>
  );
}

/* ── 기둥① 통합 미들웨어 (Local Agent / RAL) ────────────── */
export function FabricSection() {
  return (
    <Section pillar="①" eyebrow="Integration Fabric · Local Agent (RAL)" title="이질적인 벤더 노드를 하나의 표준 면으로 흡수한다"
      lead="각 기관의 노드는 CAN·ROS2·DDS·MQTT로 제각각 말한다. Local Agent의 NodeAdapter가 이를 흡수해 표준 Signal·Command·Event 한 면으로 노출한다. 노드의 이질성이 여기서 사라진다. — 새 노드 합류 = NodeAdapter 1개 + 매니페스트 1건.">
      <div id="fabric" style={{ display: "grid", gridTemplateColumns: "1fr auto 1.2fr auto .8fr", gap: 14, alignItems: "stretch" }}>
        <div style={card()}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 10 }}>벤더 노드 (이질적 전송)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {D.nodes.map((n) => (
              <div key={n.kind} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, width: 78 }}>{n.kind}</span>
                <span className="badge" style={{ fontSize: 9.5 }}>{n.transport}</span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginLeft: "auto" }}>{n.ownerName}</span>
              </div>
            ))}
          </div>
        </div>
        <Arrow />
        <div style={card({ borderColor: "var(--line-strong)", background: "var(--surface-panel-raised)" })}>
          <strong style={{ fontSize: 13 }}>Local Agent · NodeAdapter 흡수</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {["SignalStore", "CommandRouter · 3단 ACK", "Gate", "Conformance", "App Runtime", "Policy"].map((m) => (
              <span key={m} className="chip" style={{ height: 24, fontSize: 11 }}>{m}</span>
            ))}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.6 }}>
            → 표준 Signal / Command / Event 한 면
          </div>
        </div>
        <Arrow />
        <div style={card()}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 10 }}>소비면</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 12 }}>⌂ on-robot HMI</span>
            <span style={{ fontSize: 12 }}>☁ cloud mirror · 관제</span>
            <span style={{ fontSize: 12 }}>⚙ Build 인스펙터</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, alignItems: "center" }}>
        {[[`${D.fabric.nodeCount}`, "노드 합류"], [`${D.fabric.transports.length}`, "전송 흡수(CAN·ROS2·DDS·MQTT)"], [`${D.fabric.ifCount}`, "인터페이스(IF-P/L/X)"], [`${D.fabric.verbCount}`, "command verb"], ["PASS", "conformance(TS-MCU·ACU)"]].map(([v, l]) => (
        <div key={l} style={{ ...card({ padding: "10px 14px" }), display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{v}</span>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{l}</span>
        </div>
      ))}
        <span style={{ flex: 1 }} />
        <a href={`${process.env.NEXT_PUBLIC_BUILD_URL ?? "http://localhost:7333"}/transport`} className="linkish" style={{ fontSize: 12.5 }}>실 전송 흡수 보기 → /transport</a>
      </div>
      <p className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 10 }}>실행 가능 참조 — `pnpm --filter @station/local-agent start:rig` 로 5노드가 합류해 표준면으로 흐른다.</p>
    </Section>
  );
}

function Arrow() {
  return <div style={{ display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 20 }}>→</div>;
}

/* ── 누가 / 어떻게 연결되나 ─────────────────────────────── */
export function ConnectSection() {
  return (
    <Section eyebrow="Consortium · 계약 = 기관 인계면" title="각 기관의 작업이 계약으로 연결된다"
      lead="누가 무엇을 소유하고, 누구의 신호가 누구에게 흐르는지가 계약(IF-P/IF-L)에서 자동으로 도출된다. 더 이상 전화로 확인할 필요가 없다.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {D.orgs.map((o) => (
          <div key={o.orgId} style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
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
        <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 10 }}>논리 의존 (IF-L) — 자동 도출</div>
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

/* ── 기둥② 통합 Readiness 보드 (centerpiece) ───────────── */
export function ReadinessSection() {
  const s = D.readinessSummary;
  const pct = Math.round((s.verified / s.total) * 100);
  return (
    <Section pillar="②" eyebrow="Integration Orchestration · Readiness" title="이 로봇을 통합·검증·릴리스 — 한 화면에서"
      lead="목표 중심 보기. 산출물별 상태·소유·다음 책임자가 미들웨어의 conformance·계약·상태머신에서 파생된다. 막힌 곳과 그 책임자가 즉시 보인다.">
      <div id="readiness" style={card({ padding: 0, overflow: "hidden" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--line-default)", background: "var(--surface-panel-raised)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{D.targetRobot.label} <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>{D.targetRobot.id}</span></div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>{D.targetRobot.blueprint}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginLeft: 12 }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 800 }}>{s.verified}/{s.total}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>검증</span>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", background: "var(--state-warning-bg)", borderBottom: "1px solid var(--line-default)" }}>
            <span className="badge warning" style={{ fontSize: 10 }}><span className="dot" />막힘</span>
            <span style={{ fontSize: 12.5, color: "var(--state-warning)" }}>
              {s.blocked.map((b) => `${b.artifact}(${b.ownerName})`).join(", ")} — 다음 책임자: <strong>{s.blocked[0]!.nextOwner}</strong>
            </span>
          </div>
        )}

        <div>
          {D.readiness.map((r) => {
            const tone = READY_TONE[r.readiness];
            return (
              <div key={r.artifact} className="hov-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", alignItems: "center", padding: "11px 18px", borderBottom: "1px solid var(--line-subtle)", fontSize: 12.5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
      <p className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 10 }}>검증 = conformance(F7) 통과 · 채널 = 검증 결과의 발행 단계(stable/beta/canary/draft) · 다음 책임자 = 상태+의존+소유에서 자동 계산.</p>
    </Section>
  );
}

/* ── Workflow Studio (혼합) + 라이프사이클 ──────────────── */
export function StudioSection() {
  return (
    <Section eyebrow="Workflow Studio · 혼합" title="통합 워크플로우 — 자동 골격 + 수동 오버레이"
      lead="범용 워크플로우 빌더가 아니다. 통합 그래프는 blueprint·IF-L·conformance에서 자동으로 그려지고, 그 위에 사람은 게이트·할당·릴리스 채널만 얹는다.">
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {D.lifecycle.map((l, i) => (
          <div key={l.step} style={{ ...card({ padding: "12px 14px", flex: "1 1 150px" }), position: "relative" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{String(i + 1).padStart(2, "0")} · {l.step}</div>
            <div style={{ fontSize: 13, fontWeight: 700, margin: "4px 0 3px" }}>{l.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.45 }}>{l.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={card()}>
          <strong style={{ fontSize: 13 }}>자동 도출 (계약에서)</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <li>blueprint → 필요한 노드/모듈 = 통합 스텝</li>
            <li>IF-L → 스텝 간 의존(누가 누구를 기다리나)</li>
            <li>conformance → 검증 게이트 통과 여부</li>
          </ul>
        </div>
        <div style={card()}>
          <strong style={{ fontSize: 13 }}>수동 오버레이 (사람이)</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <li>게이트 — 승인/확인 체크포인트(G1~G7)</li>
            <li>할당 — 스텝 → 담당 org/역할/사람</li>
            <li>채널 — 검증된 산출물을 stable/beta로 발행</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ── 제품 = 미들웨어 위의 계기 ──────────────────────────── */
export function ProductsSection() {
  return (
    <Section eyebrow="Products · 역할별 계기" title="미들웨어 위에서, 각 역할이 자기 몫을 한다"
      lead="Ops·Build·Field·Agent는 별개 제품이 아니라 같은 통합 면 위의 계기다. 같은 계약·같은 로봇, 다른 권한·밀도.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
          STATION — 컨소시엄 통합 오케스트레이션 플랫폼. 통합 미들웨어(Local Agent/RAL) + 통합 오케스트레이션(readiness·할당·릴리스).<br />
          on-robot 실체 ↔ cloud 미러 · 권한 ① 물리 &gt; ② Agent &gt; ③ field &gt; ④ cloud · 계약 SSOT = @station/contracts.
        </div>
      </div>
    </footer>
  );
}
