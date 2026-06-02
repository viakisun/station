"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  HoldButton,
  ConfirmModal,
  KVStack,
  EmptyNote,
  type Sev,
} from "@station/design-system";
import { RELEASE, deploymentPlans } from "@station/domain";

/* ---------------- BUILD-12 롤백 + 감사 ---------------- */
type AuditRec = { actor: string; action: string; target: string; reason?: string; before?: string; after?: string };

type HistEvent = { ts: string; icon: "upload" | "fileCode" | "check" | "rocket" | "rollback"; label: string; actor: string; sev: Sev };

export function RollbackRecovery({ firmwareId }: { firmwareId: string }) {
  const R = RELEASE;
  const fw = R.firmwares.find((f) => f.id === firmwareId);
  const plan = deploymentPlans[firmwareId];
  const prevStable = plan?.rollbackPolicy.prevStable;
  const [confirm, setConfirm] = useState(false);
  const [audit, setAudit] = useState<AuditRec | null>(null);

  const affected = plan?.targets ?? [];

  const auditRec: AuditRec = {
    actor: "ops:배포관리자 (mock)",
    action: "FIRMWARE_ROLLBACK",
    target: `${affected.length}대 대상 · ${plan?.firmware ?? firmwareId}`,
    reason: plan?.rollbackPolicy.trigger || "수동 롤백",
    before: firmwareId,
    after: prevStable || "이전 안정버전",
  };

  const history: HistEvent[] = [
    { ts: "05-28 09:12", icon: "upload", label: `${firmwareId} 등록`, actor: fw?.vendor ?? "vendor", sev: "disabled" },
    { ts: "05-29 14:40", icon: "fileCode", label: "정적분석 완료", actor: "ci:analyzer", sev: fw && fw.critical > 0 ? "critical" : "normal" },
    { ts: "05-30 11:05", icon: "check", label: "릴리즈 승인 (G2)", actor: "qa:Kim H.", sev: "normal" },
    { ts: "06-01 08:20", icon: "rocket", label: "Canary 배포 시작", actor: "ops:배포관리자", sev: "notice" },
    ...(audit ? [{ ts: "지금", icon: "rollback" as const, label: `롤백 → ${prevStable ?? "이전 안정버전"}`, actor: "ops:배포관리자", sev: "warning" as Sev }] : []),
  ];

  if (!plan) {
    return (
      <div className="screen-enter" style={{ padding: "var(--gap)" }}>
        <div className="card" style={{ padding: 28 }}>
          <EmptyNote title={`${firmwareId} 의 배포·롤백 정책이 없습니다`} sub="릴리즈 승인·배포 후 롤백을 사용할 수 있습니다." />
        </div>
      </div>
    );
  }

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>롤백 · 복구</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{firmwareId}</span>
            <StatusBadge sev="warning" label="rollback ready" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            현재 {firmwareId} → 이전 안정버전 {prevStable} 으로 되돌립니다 · 영향 {affected.length}대
          </div>
        </div>
        <a className="btn sm" href="../../ota"><Icon name="rocket" size={14} /> OTA 모니터</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* 롤백 대상 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="롤백 대상" sub="버전 변경 · 영향 범위" dense />
            <div style={{ padding: "4px 14px 14px" }}>
              <KVStack pairs={[
                ["현재 버전", <span className="mono" key="c" style={{ color: "var(--st-warning)", fontWeight: 700 }}>{firmwareId}</span>],
                ["복구 버전", <span className="mono" key="p" style={{ color: "var(--st-normal)", fontWeight: 700 }}>{prevStable}</span>],
                ["트리거", plan.rollbackPolicy.trigger],
                ["영향 대상", <span className="tnum" key="a" style={{ fontWeight: 700 }}>{affected.length}대</span>],
              ]} />
            </div>
          </div>

          <div className="card">
            <PanelHead title="영향 대상 목록" dense right={<StatusBadge sev="warning" label={`${affected.length}`} />} />
            <div style={{ overflow: "auto", maxHeight: 220 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {affected.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "8px 12px" }}><span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.id}</span></td>
                      <td style={{ padding: "8px 12px", color: "var(--ink-3)" }}>{t.gh} · {t.group}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}><StatusBadge sev={t.online ? "normal" : "disabled"} label={t.online ? "online" : "offline"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--tint-critical)", border: "1px solid #f0d9ca", fontSize: 11.5, color: "var(--st-critical)", fontWeight: 600 }}>
              롤백은 되돌릴 수 없는 운영 동작이며 감사 기록(AuditEntry)이 남습니다.
            </div>
            {audit ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, fontWeight: 700, color: "var(--st-warning)" }}>
                <Icon name="rollback" size={17} /> 롤백이 실행되었습니다 (mock)
              </div>
            ) : (
              <HoldButton label="롤백 실행" holdLabel="롤백 실행 중…" danger onConfirm={() => setConfirm(true)} />
            )}
          </div>
        </div>

        {/* 감사 이력 타임라인 + AuditEntry 고지 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {audit && <AuditCard rec={audit} />}
          <div className="card">
            <PanelHead title="감사 이력" sub="등록 → 분석 → 승인 → 배포 → 롤백" dense />
            <div style={{ padding: "8px 14px 14px" }}>
              {history.map((e, i) => {
                const last = i === history.length - 1;
                return (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", background: "var(--surface-2)", border: `1.5px solid var(--st-${e.sev})`, color: `var(--st-${e.sev})` }}>
                        <Icon name={e.icon} size={12} />
                      </span>
                      {!last && <span style={{ width: 2, flex: 1, minHeight: 20, background: "var(--line)" }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: last ? 0 : 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{e.label}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{e.ts}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{e.actor}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirm}
        danger
        requireHold
        title="펌웨어 롤백 실행"
        confirmLabel="Hold하여 롤백"
        body={<span>{firmwareId} → <span className="mono">{prevStable}</span> · {affected.length}대 대상에 즉시 적용됩니다.</span>}
        auditNote={`AuditEntry · ${auditRec.action} · before ${auditRec.before} → after ${auditRec.after} · ${auditRec.reason}`}
        onClose={() => setConfirm(false)}
        onConfirm={() => { setAudit(auditRec); setConfirm(false); }}
      />
    </div>
  );
}

function AuditCard({ rec }: { rec: AuditRec }) {
  const row = (k: string, v: ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, textAlign: "right" }}>{v}</span>
    </div>
  );
  return (
    <div className="card" style={{ borderColor: "var(--st-warning)" }}>
      <PanelHead title="AuditEntry 고지" sub="불변 감사 기록 (mock)" dense
        right={<StatusBadge sev="warning" label="recorded" />} />
      <div style={{ padding: "4px 14px 12px" }}>
        {row("actor", rec.actor)}
        {row("action", <span className="mono">{rec.action}</span>)}
        {row("target", rec.target)}
        {row("reason", rec.reason)}
        {row("before → after", <span className="mono">{rec.before} → {rec.after}</span>)}
      </div>
    </div>
  );
}
