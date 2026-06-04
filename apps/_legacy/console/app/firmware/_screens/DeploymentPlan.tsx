"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  Battery,
  GateNotice,
  HoldButton,
  KVStack,
  EmptyNote,
} from "@station/design-system";
import { deploymentPlans, gateDeployPreflight, type DeployTargetRow } from "@station/domain";

/* ---------------- BUILD-10 배포 계획 (G6/G7 게이트) ---------------- */
const GROUP_LABEL: Record<string, string> = {
  canary: "Canary",
  "wave-1": "Wave 1",
  "wave-2": "Wave 2",
};

function targetBlocked(t: DeployTargetRow) {
  if (!t.online) return "오프라인";
  if (t.openCritical) return "open critical";
  if (t.battery < 25) return `배터리 ${t.battery}%`;
  return null;
}

export function DeploymentPlan({ firmwareId }: { firmwareId: string }) {
  const plan = deploymentPlans[firmwareId];
  const gate = gateDeployPreflight(firmwareId);
  const blocked = gate.severity === "blocked";
  const [done, setDone] = useState(false);

  if (!plan) {
    return (
      <div className="screen-enter" style={{ padding: "var(--gap)" }}>
        <div className="card" style={{ padding: 28 }}>
          <EmptyNote title={`${firmwareId} 의 배포 계획이 없습니다`} sub="릴리즈 승인 후 계획을 생성하세요." />
        </div>
      </div>
    );
  }

  const okCount = plan.targets.filter((t) => !targetBlocked(t)).length;

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* header */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>배포 계획</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{plan.firmware}</span>
            <StatusBadge sev={blocked ? "critical" : "notice"} label={blocked ? "preflight blocked" : "준비"} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            대상 {plan.targets.length}대 · 통과 {okCount} · {plan.groups.map((g) => GROUP_LABEL[g] || g).join(" → ")} · G6/G7 배포 preflight
          </div>
        </div>
        <a className="btn sm" href="../approve"><Icon name="check" size={14} /> 승인 단계</a>
      </div>

      <GateNotice
        severity={gate.severity}
        gateId={gate.gate}
        title={blocked ? "배포 preflight 차단" : "preflight 통과"}
        reason={gate.reason}
        actions={(gate.actions || []).map((a) => ({ label: a.label, href: a.href }))}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* 대상 테이블 (canary/wave 그룹별) */}
        <div className="card">
          <PanelHead title="배포 대상" sub="canary · wave 단계 / 대상별 preflight" dense
            right={<StatusBadge sev={blocked ? "critical" : "normal"} label={`${okCount}/${plan.targets.length} ready`} />} />
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ background: "var(--surface-2)", color: "var(--ink-3)", textAlign: "left" }}>
                {["로봇 ID", "GH", "그룹", "배터리", "연결", "preflight"].map((h, i) =>
                  <th key={i} style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {plan.groups.map((g) => {
                  const rows = plan.targets.filter((t) => t.group === g);
                  if (!rows.length) return null;
                  return (
                    <GroupRows key={g} group={g} rows={rows} />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 롤백 정책 + 그룹 + 최종 확인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card">
            <PanelHead title="롤백 정책" sub="자동 트리거 / 이전 안정버전" dense />
            <div style={{ padding: "4px 14px 14px" }}>
              <KVStack pairs={[
                ["자동 트리거", <span key="t" style={{ color: "var(--st-warning)", fontWeight: 700 }}>{plan.rollbackPolicy.trigger}</span>],
                ["이전 안정버전", <span className="mono" key="p">{plan.rollbackPolicy.prevStable}</span>],
                ["롤백 화면", <a className="mono" key="r" href="../rollback" style={{ color: "var(--brand)", fontWeight: 700 }}>rollback →</a>],
              ]} />
            </div>
          </div>

          <div className="card">
            <PanelHead title="배포 그룹" sub="단계별 비율" dense />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.groups.map((g) => {
                const rows = plan.targets.filter((t) => t.group === g);
                const bad = rows.filter((t) => targetBlocked(t)).length;
                return (
                  <div key={g} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", background: "var(--surface)" }}>
                    <Icon name="rocket" size={16} style={{ color: "var(--ink-3)", flex: "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{GROUP_LABEL[g] || g}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{rows.length}대 대상</div>
                    </div>
                    {bad > 0 ? <StatusBadge sev="critical" label={`${bad} 차단`} /> : <StatusBadge sev="normal" label="ready" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 10 }}>
            {done ? (
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <span style={{ color: "var(--st-normal)" }}><Icon name="check" size={18} stroke={2.4} /></span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>배포가 시작되었습니다</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Canary부터 순차 진행됩니다. (mock)</div>
                </div>
                <a className="btn primary sm" href="../../ota" style={{ marginLeft: "auto" }}>OTA 모니터 →</a>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  {blocked ? "차단 대상이 있어 배포를 시작할 수 없습니다. 제외하거나 재예약하세요." : "Hold하여 배포를 시작하세요."}
                </div>
                <HoldButton label="배포 시작" holdLabel="배포 시작 중…" disabled={blocked} onConfirm={() => setDone(true)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupRows({ group, rows }: { group: string; rows: DeployTargetRow[] }) {
  return (
    <>
      <tr>
        <td colSpan={6} style={{ padding: "7px 12px", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".3px", textTransform: "uppercase" }}>
          {GROUP_LABEL[group] || group} · {rows.length}대
        </td>
      </tr>
      {rows.map((t) => {
        const block = targetBlocked(t);
        return (
          <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
            <td style={{ padding: "9px 12px" }}><span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.id}</span></td>
            <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{t.gh}</td>
            <td style={{ padding: "9px 12px", color: "var(--ink-2)" }}>{GROUP_LABEL[t.group] || t.group}</td>
            <td style={{ padding: "9px 12px" }}><Battery pct={t.battery} /></td>
            <td style={{ padding: "9px 12px" }}>
              <StatusBadge sev={t.online ? "normal" : "critical"} label={t.online ? "online" : "offline"} dot />
            </td>
            <td style={{ padding: "9px 12px" }}>
              {block ? <StatusBadge sev="critical" label={block} /> : <StatusBadge sev="normal" label="ok" />}
            </td>
          </tr>
        );
      })}
    </>
  );
}
