"use client";
/* ============================================================
   FIELD-01 HMI 홈 허브 — 5초 글랜스 상태 + 큰 분기 3
   Field 8원칙: ①한 화면 한 판단 ③상태/다음행동 고정 ⑤아이콘+라벨 ⑦지연/오프라인 상단
   ============================================================ */
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Icon,
  StatusBadge,
  ContextChip,
  SafetyBanner,
  KVStack,
  type IconName,
  type Sev,
} from "@station/design-system";
import { workPackage, fieldSafetyState, parseCtx, ctxSummary, type ContextEnvelope } from "@station/domain";
import { HmiFrame, HmiStatusBar } from "./HmiShell";

const robot = { type: "thin", id: workPackage.robot_id, model: "HV-Thinner X2", hmi: "HMI-FIELD-07" };

function networkBadge(net: string): { label: string; sev: Sev } {
  if (net === "online") return { label: "온라인", sev: "normal" };
  if (net === "delayed") return { label: "지연", sev: "warning" };
  return { label: "오프라인", sev: "critical" };
}

export default function HmiHomeHub() {
  const router = useRouter();
  const [ctx, setCtx] = useState<ContextEnvelope | null>(null);
  useEffect(() => {
    setCtx(parseCtx(new URLSearchParams(window.location.search).get("ctx")));
  }, []);
  const estop = fieldSafetyState.state === "estop";
  const online = fieldSafetyState.network === "online";
  const net = networkBadge(fieldSafetyState.network);

  return (
    <HmiFrame>
      <HmiStatusBar
        robot={robot}
        title="현장 운영 홈"
        connected={online}
        registered
        safety={estop ? "estop" : "safe"}
      />

      {/* ⑦ 상단 고정 안전 배너 */}
      {estop ? (
        <SafetyBanner sev="emergency" icon="power">
          긴급정지 활성 — 모든 자동 작업 잠금. 해제는 긴급정지 화면에서.
        </SafetyBanner>
      ) : !online ? (
        <SafetyBanner sev={fieldSafetyState.network === "offline" ? "critical" : "warning"} icon="wifi">
          네트워크 {net.label} — 원격 명령/텔레메트리 신뢰 저하. 현장 판단 우선.
        </SafetyBanner>
      ) : null}

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Context 핸드오프 출처 */}
        <div>
          <ContextChip origin={ctx?.origin || "ops"} ids={ctxSummary(ctx) || workPackage.robot_id} />
        </div>

        {/* 5초 글랜스 상태 — 로봇/작업/안전 (③ 고정 위치, ④ KV 스택, ⑤ 아이콘+라벨+색) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <GlanceCard
            icon="robot"
            title="로봇"
            badge={<StatusBadge sev={estop ? "emergency" : "normal"} label={estop ? "정지" : "대기"} />}
            pairs={[
              ["식별자", <span key="id" className="mono">{workPackage.robot_id}</span>],
              ["모델", "HV-Thinner X2"],
            ]}
          />
          <GlanceCard
            icon="route"
            title="작업"
            badge={<StatusBadge sev="notice" label="수신됨" />}
            pairs={[
              ["유형 · 구역", `적과 · ${workPackage.gh}/${workPackage.zone}`],
              ["경로 · 대상", `${workPackage.route_id} · ${workPackage.total}주`],
            ]}
          />
          <GlanceCard
            icon="shield"
            title="안전"
            badge={<StatusBadge sev={estop ? "emergency" : "normal"} label={estop ? "e-stop" : "정상"} />}
            pairs={[
              ["네트워크", <StatusBadge key="n" sev={net.sev} label={net.label} />],
              ["e-stop", estop ? "활성" : "비활성"],
            ]}
          />
        </div>

        {/* 큰 분기 버튼 3 (① 한 화면 한 판단으로 라우팅) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <BranchBtn icon="play" label="작업 제어" sub="게이트 확인 후 시작" tone="var(--brand)" disabled={estop}
            onClick={() => router.push("/hmi/operate")} />
          <BranchBtn icon="node" label="캘리브레이션" sub="좌표 · grip force 보정" tone="var(--st-notice)"
            onClick={() => router.push("/hmi/calibrate")} />
          <BranchBtn icon="power" label="긴급정지" sub="잠금 · 원인 · 해제" tone="var(--st-critical)" emergency
            onClick={() => router.push("/hmi/estop")} />
        </div>

        {/* 커미셔닝 링크 (보조) */}
        <button
          onClick={() => router.push("/hmi/commission")}
          style={{ height: 56, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}
        >
          <Icon name="settings" size={18} /> 커미셔닝 위저드 (모듈 재구성)
        </button>
      </div>
    </HmiFrame>
  );
}

function GlanceCard({ icon, title, badge, pairs }: { icon: IconName; title: string; badge: React.ReactNode; pairs: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800 }}>
          <Icon name={icon} size={18} style={{ color: "var(--ink-2)" }} /> {title}
        </span>
        {badge}
      </div>
      <KVStack pairs={pairs} />
    </div>
  );
}

function BranchBtn({ icon, label, sub, tone, onClick, disabled, emergency }:
  { icon: IconName; label: string; sub: string; tone: string; onClick: () => void; disabled?: boolean; emergency?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 120, borderRadius: "var(--r-md)", padding: 16, cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
        background: emergency ? "rgba(183,28,28,.08)" : "var(--surface)",
        border: emergency ? "2px solid var(--st-critical)" : "1px solid var(--line)",
        opacity: disabled ? 0.45 : 1, textAlign: "left",
      }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 11, background: tone, display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
        <Icon name={icon} size={24} />
      </span>
      <span>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </span>
    </button>
  );
}
