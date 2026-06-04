"use client";
import { useState } from "react";
import {
  Icon,
  PanelHead,
  StatusBadge,
  GateNotice,
  HoldButton,
  KVStack,
  EmptyNote,
  type Sev,
} from "@station/design-system";
import { RELEASE, releaseApprovals, gateFirmwareRelease } from "@station/domain";

/* ---------------- BUILD-08 릴리즈 승인 (G2 게이트) ---------------- */
const STEP_SEV: Record<string, { sev: Sev; label: string }> = {
  passed: { sev: "normal", label: "통과" },
  pending: { sev: "notice", label: "대기" },
  failed: { sev: "critical", label: "실패" },
  waived: { sev: "warning", label: "면제" },
};

export function ReleaseApproval({ firmwareId }: { firmwareId: string }) {
  const R = RELEASE;
  const fw = R.firmwares.find((f) => f.id === firmwareId);
  const steps = releaseApprovals[firmwareId] || [];
  const gate = gateFirmwareRelease(firmwareId);
  const blocked = gate.severity === "blocked";
  const [done, setDone] = useState<"" | "approved" | "rejected">("");

  const dm = fw ? R.fwMeta[fw.deploy] : null;
  const am = fw ? R.fwAnalysisMeta[fw.analysis] : null;

  return (
    <div className="screen-enter" style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* header card */}
      <div className="card" style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>릴리즈 승인</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", padding: "2px 6px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>{firmwareId}</span>
            {dm && <StatusBadge sev={dm.sev} label={dm.label} />}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            {fw ? `${fw.module} · ${fw.vendor} · ${fw.note}` : "등록되지 않은 펌웨어"} · G2 펌웨어 릴리즈 게이트
          </div>
        </div>
        <a className="btn sm" href="../../static-analysis"><Icon name="fileCode" size={14} /> 정적분석</a>
        <a className="btn sm" href="../../compatibility"><Icon name="server" size={14} /> 호환성</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        {/* 승인 단계 타임라인 */}
        <div className="card">
          <PanelHead title="승인 단계" sub="정적분석 → 호환 → Audit → QA → 운영" dense
            right={<StatusBadge sev={blocked ? "critical" : steps.some((s) => s.status === "pending") ? "notice" : "normal"} label={`${steps.filter((s) => s.status === "passed").length}/${steps.length} 통과`} />} />
          {steps.length === 0 ? (
            <div style={{ padding: 16 }}><EmptyNote title="승인 단계 데이터가 없습니다" /></div>
          ) : (
            <div style={{ padding: "8px 14px 14px" }}>
              {steps.map((s, i) => {
                const meta = STEP_SEV[s.status];
                const last = i === steps.length - 1;
                const tone = s.status === "failed" ? "var(--st-critical)" : s.status === "passed" ? "var(--st-normal)" : s.status === "waived" ? "var(--st-warning)" : "var(--st-notice)";
                return (
                  <div key={s.key} style={{ display: "flex", gap: 12 }}>
                    {/* rail */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none",
                        background: s.status === "passed" ? "var(--st-normal)" : "var(--surface-2)",
                        border: s.status === "passed" ? "none" : `1.5px solid ${tone}`, color: "#fff" }}>
                        {s.status === "passed" ? <Icon name="check" size={12} stroke={2.5} />
                          : s.status === "failed" ? <Icon name="close" size={12} stroke={2.5} style={{ color: tone }} />
                          : <span className="tnum" style={{ fontSize: 10, color: tone, fontWeight: 700 }}>{i + 1}</span>}
                      </span>
                      {!last && <span style={{ width: 2, flex: 1, minHeight: 24, background: "var(--line)" }} />}
                    </div>
                    {/* body */}
                    <div style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</span>
                        <StatusBadge sev={meta.sev} label={meta.label} />
                      </div>
                      {s.detail && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{s.detail}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 게이트 + 결정 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card" style={{ padding: "var(--pad-card)" }}>
            <GateNotice
              severity={gate.severity}
              gateId={gate.gate}
              title={blocked ? "릴리즈 승인 불가" : gate.severity === "confirm_required" ? "운영 승인 확인 필요" : "승인 가능"}
              reason={gate.reason}
              actions={(gate.actions || []).map((a) => ({ label: a.label, href: a.href }))}
            />
          </div>

          <div className="card">
            <PanelHead title="승인 정보" dense />
            <div style={{ padding: "4px 14px 14px" }}>
              <KVStack pairs={[
                ["펌웨어", <span className="mono" key="fw">{firmwareId}</span>],
                ["모듈", <span className="mono" key="m">{fw?.module ?? "—"}</span>],
                ["정적분석", am ? <StatusBadge sev={am.sev} label={am.label} key="a" /> : "—"],
                ["findings", <span className="tnum" key="f" style={{ fontWeight: 700 }}>{fw?.findings ?? 0}{fw && fw.critical > 0 ? ` · ${fw.critical} critical` : ""}</span>],
                ["승인 요청자", "배포관리자 (mock)"],
              ]} />
            </div>
          </div>

          <div className="card" style={{ padding: "var(--pad-card)", display: "flex", flexDirection: "column", gap: 10 }}>
            {done ? (
              <Result kind={done} />
            ) : (
              <>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  {blocked ? "게이트 차단 상태에서는 승인할 수 없습니다." : "Hold하여 결정을 확정하세요."}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <HoldButton label="릴리즈 승인" holdLabel="승인 중…" disabled={blocked} onConfirm={() => setDone("approved")} style={{ flex: 1 }} />
                  <HoldButton label="반려" holdLabel="반려 중…" danger onConfirm={() => setDone("rejected")} style={{ flex: 1 }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Result({ kind }: { kind: "approved" | "rejected" }) {
  const ok = kind === "approved";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: "var(--r-sm)",
      background: ok ? "var(--tint-normal, var(--surface-2))" : "var(--tint-critical)",
      border: `1px solid ${ok ? "var(--line)" : "#f0d9ca"}` }}>
      <span style={{ color: ok ? "var(--st-normal)" : "var(--st-critical)", flex: "none" }}>
        <Icon name={ok ? "check" : "close"} size={18} stroke={2.4} />
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{ok ? "릴리즈가 승인되었습니다" : "릴리즈가 반려되었습니다"}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{ok ? "배포 계획 단계로 진행할 수 있습니다." : "사유와 함께 벤더에 회신됩니다."} (mock)</div>
      </div>
      {ok && <a className="btn primary sm" href="../deploy-plan" style={{ marginLeft: "auto" }}>배포 계획 →</a>}
    </div>
  );
}
