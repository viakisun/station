"use client";
/* [SWC-PRODUCT-BUILD] 프로젝트 목록 — 카드 클릭 → 허브. [+ 새 프로젝트]는 시각 목업(저장 X). */
import { useState } from "react";
import Link from "next/link";
import { getProjects, getSitesOfProject, summarizeProjectAudits } from "@station/domain";
import { StatusBadge } from "@station/design-system";

const card: React.CSSProperties = { background: "var(--surface-panel)", border: "1px solid var(--line-default)", borderRadius: 10, padding: 16, textDecoration: "none", color: "inherit", display: "block" };

export function ProjectsList() {
  const [showForm, setShowForm] = useState(false);
  const projects = getProjects();

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>통합 프로젝트</h1>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>각 프로젝트는 한 로봇을 컨소시엄이 통합·감사·릴리스합니다.</div>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => setShowForm(true)} style={{ cursor: "pointer" }}>+ 새 프로젝트</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {projects.map((p) => {
          const s = summarizeProjectAudits(p.id);
          const site = getSitesOfProject(p.id)[0];
          const pct = s.total ? Math.round((s.approved / s.total) * 100) : 0;
          return (
            <Link key={p.id} href={`/projects/${p.id}`} style={card} className="hov-row">
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <strong style={{ fontSize: 13.5 }}>{p.name}</strong>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 3 }}>{p.id} · {site?.name ?? "—"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{s.approved}/{s.total}</span>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>승인</span>
                {s.blocked > 0 && <StatusBadge sev="critical" label={`차단 ${s.blocked}`} />}
                {s.inProgress > 0 && <StatusBadge sev="notice" label={`진행 ${s.inProgress}`} />}
              </div>
              <div style={{ height: 6, background: "var(--surface-muted)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--state-normal)" }} />
              </div>
            </Link>
          );
        })}
      </div>

      {showForm && <CreateProjectForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const input: React.CSSProperties = { width: "100%", height: 32, padding: "0 10px", fontSize: 12.5, border: "1px solid var(--line-strong)", borderRadius: 6, background: "var(--surface-panel)", color: "var(--text-primary)", boxSizing: "border-box" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: "var(--surface-panel)", border: "1px solid var(--line-default)", borderRadius: 12, padding: 18, boxShadow: "var(--shadow-3)" }}>
        <strong style={{ fontSize: 14 }}>새 프로젝트</strong>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, marginBottom: 14 }}>목업 — 저장되지 않습니다(백엔드 후속).</div>
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>프로젝트명</label>
        <input style={{ ...input, marginTop: 4, marginBottom: 10 }} placeholder="예) 김제 스마트팜 · 토마토 적과적심" />
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>발주처 / 기관</label>
        <input style={{ ...input, marginTop: 4, marginBottom: 10 }} placeholder="ORG-VIA" />
        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>사이트</label>
        <input style={{ ...input, marginTop: 4 }} placeholder="예) 김제 스마트팜 혁신밸리" />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button className="btn" onClick={onClose} style={{ cursor: "pointer" }}>취소</button>
          <button className="btn primary" onClick={onClose} style={{ cursor: "pointer" }}>생성(목업)</button>
        </div>
      </div>
    </div>
  );
}
