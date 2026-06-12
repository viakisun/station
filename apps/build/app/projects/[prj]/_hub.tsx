"use client";
/* [SWC-PRODUCT-BUILD] 프로젝트 허브 — Audit Package 목록 + 라이브 정적 상태 힌트 + [+ 패키지](목업). */
import { useState } from "react";
import Link from "next/link";
import { getProjects, getSitesOfProject, getAuditPackagesOfProject, type AuditPackageState } from "@station/domain";
import { analyzeFiles, getTarget } from "@station/audit-kit";
import { StatusBadge, type Sev } from "@station/design-system";

const STATE_SEV: Record<AuditPackageState, Sev> = { approved: "normal", passed: "notice", running: "notice", submitted: "notice", draft: "disabled", failed: "critical", waiver_required: "warning" };
const STATE_LABEL: Record<AuditPackageState, string> = { approved: "승인", passed: "검증 통과", running: "실행 중", submitted: "제출됨", draft: "초안", failed: "실패", waiver_required: "waiver 필요" };

/** 라이브 정적분석 힌트 — 실 소스에 즉시 돌려 critical/warning 수 표시. */
function staticHint(targetId: string): { crit: number; warn: number } {
  const t = getTarget(targetId);
  if (!t) return { crit: 0, warn: 0 };
  const f = analyzeFiles(t.files);
  return { crit: f.filter((x) => x.severity === "critical").length, warn: f.filter((x) => x.severity === "warning").length };
}

export function ProjectHub({ projectId }: { projectId: string }) {
  const [showForm, setShowForm] = useState(false);
  const project = getProjects().find((p) => p.id === projectId);
  const site = getSitesOfProject(projectId)[0];
  const pkgs = getAuditPackagesOfProject(projectId);

  if (!project) return <div style={{ padding: 24, color: "var(--text-muted)" }}>프로젝트를 찾을 수 없습니다: {projectId}</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* 브레드크럼 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, fontSize: 12, color: "var(--text-muted)" }}>
        <Link href="/projects" className="linkish" style={{ textDecoration: "none" }}>Projects</Link>
        <span>/</span>
        <span className="mono">{project.id}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{project.name}</h1>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pkgs[0]?.robotId ?? "—"} · {site?.name ?? "—"}</div>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => setShowForm(true)} style={{ cursor: "pointer" }}>+ 패키지 온보딩</button>
      </div>

      {/* Audit Packages */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Audit Packages <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— 벤더/모듈별 감사 단위. 클릭하면 감사 워크벤치로.</span></div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {pkgs.map((a) => {
          const h = staticHint(a.targetId);
          return (
            <Link key={a.id} href={`/projects/${projectId}/audit/${a.id}`} className="hov-row" style={{ display: "grid", gridTemplateColumns: "minmax(180px,1.4fr) minmax(120px,1fr) 130px 150px 20px", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line-subtle)", textDecoration: "none", color: "inherit", fontSize: 12.5 }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <strong>{a.label}</strong>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.id}</span>
              </span>
              <span style={{ color: "var(--text-secondary)" }}>{a.vendorName}</span>
              <span><StatusBadge sev={STATE_SEV[a.state]} label={STATE_LABEL[a.state]} /></span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {h.crit > 0 ? <span style={{ color: "var(--state-critical)" }}>● 정적 critical {h.crit}</span> : h.warn > 0 ? <span style={{ color: "var(--state-warning)" }}>● warning {h.warn}</span> : <span style={{ color: "var(--state-normal)" }}>● 정적 clean</span>}
              </span>
              <span style={{ color: "var(--text-disabled)", textAlign: "center" }}>▸</span>
            </Link>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>정적 상태는 실 소스에 즉시 분석한 힌트입니다. 전체 감사(인터페이스·conformance·정책)는 패키지 클릭 → 워크벤치에서 실행.</div>

      {showForm && <OnboardForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function OnboardForm({ onClose }: { onClose: () => void }) {
  const input: React.CSSProperties = { width: "100%", height: 32, padding: "0 10px", fontSize: 12.5, border: "1px solid var(--line-strong)", borderRadius: 6, background: "var(--surface-panel)", color: "var(--text-primary)", boxSizing: "border-box" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, background: "var(--surface-panel)", border: "1px solid var(--line-default)", borderRadius: 12, padding: 18, boxShadow: "var(--shadow-3)" }}>
        <strong style={{ fontSize: 14 }}>Audit Package 온보딩</strong>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, marginBottom: 14 }}>목업 — 벤더/모듈 등록 후 워크벤치에서 감사 실행(저장 X).</div>
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>벤더</label>
        <input style={{ ...input, marginTop: 4, marginBottom: 10 }} placeholder="예) GreenEdge" />
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>모듈 / 노드</label>
        <input style={{ ...input, marginTop: 4, marginBottom: 10 }} placeholder="예) MOD-EE-PINCH" />
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>전송 프로토콜</label>
        <input style={{ ...input, marginTop: 4 }} placeholder="CAN / ROS2 / DDS / MQTT" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button className="btn" onClick={onClose} style={{ cursor: "pointer" }}>취소</button>
          <button className="btn primary" onClick={onClose} style={{ cursor: "pointer" }}>온보딩(목업)</button>
        </div>
      </div>
    </div>
  );
}
