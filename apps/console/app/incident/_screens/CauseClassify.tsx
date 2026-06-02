"use client";
/* ============================================================
   OPS-07 원인 분류 · 영향 범위 (C03-04)
   좌: root-cause taxonomy tree · 우: 영향 범위 / 유사 장애 / 조치 가이드 연결
   ============================================================ */
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  PanelHead,
  StatusBadge,
  HoldButton,
  KVStack,
  ContextChip,
} from "@station/design-system";
import { INCIDENT, getIncident, rootCauseTaxonomy, type CauseNode } from "@station/domain";
import { sevOf } from "./IncidentDash";

/* ---- 재귀 taxonomy 행 ---- */
function CauseRow({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: CauseNode;
  depth: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const isSel = selected === node.id;
  const hasKids = !!node.children?.length;
  return (
    <>
      <button
        onClick={() => onSelect(node.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          width: "100%",
          textAlign: "left",
          padding: "8px 10px",
          paddingLeft: 10 + depth * 18,
          border: "none",
          borderLeft: isSel ? "3px solid var(--brand)" : "3px solid transparent",
          borderBottom: "1px solid var(--line)",
          background: isSel ? "var(--tint-brand, var(--surface-2))" : "var(--surface)",
          cursor: "pointer",
        }}
      >
        <Icon
          name={hasKids ? "chevD" : "dot"}
          size={hasKids ? 14 : 8}
          style={{ color: "var(--ink-3)", flex: "none" }}
        />
        <span
          style={{
            flex: 1,
            fontSize: hasKids ? 12.5 : 12,
            fontWeight: hasKids ? 700 : isSel ? 700 : 500,
            color: isSel ? "var(--brand)" : hasKids ? "var(--ink)" : "var(--ink-2)",
          }}
        >
          {node.label}
        </span>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {node.id}
        </span>
        {isSel && <Icon name="check" size={14} stroke={3} style={{ color: "var(--brand)" }} />}
      </button>
      {node.children?.map((c) => (
        <CauseRow key={c.id} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </>
  );
}

function flatLabel(id: string | null): string {
  if (!id) return "—";
  for (const n of rootCauseTaxonomy) {
    if (n.id === id) return n.label;
    for (const c of n.children || []) if (c.id === id) return `${n.label} › ${c.label}`;
  }
  return id;
}

export function CauseClassify({ incidentId }: { incidentId?: string }) {
  const router = useRouter();
  const IC = INCIDENT;
  const inc = (incidentId ? getIncident(incidentId) : null) || IC.incidents[1];

  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  // 유사 장애 검색 — 동일 module/code 또는 검색어 매칭
  const q = query.trim().toLowerCase();
  const similar = IC.incidents.filter((i) => {
    if (i.id === inc.id) return false;
    if (q) return (i.code + i.module + i.title).toLowerCase().includes(q);
    return i.module === inc.module || i.code === inc.code;
  });

  return (
    <div
      className="screen-enter"
      style={{ padding: "var(--gap)", display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn ghost sm" onClick={() => router.push(`/incident/${inc.id}`)}>
          <Icon name="chevL" size={15} /> 장애 상세
        </button>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>
          {inc.id}
        </span>
        <StatusBadge sev={sevOf(inc)} label={IC.sevMeta[inc.sev].label} />
        <StatusBadge sev={IC.statusMeta[inc.status].sev} label={IC.statusMeta[inc.status].label} dot={false} />
        <ContextChip origin="장애 상세" ids={inc.id} onReturn={() => router.push(`/incident/${inc.id}`)} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", alignItems: "stretch" }}>
        {/* 좌: root-cause taxonomy */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <PanelHead title="Root-cause taxonomy" sub="원인 분류 트리 · 선택 후 저장" dense />
          <div style={{ flex: 1, overflow: "auto" }}>
            {rootCauseTaxonomy.map((n) => (
              <CauseRow key={n.id} node={n} depth={0} selected={selected} onSelect={setSelected} />
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                padding: "9px 11px",
                borderRadius: "var(--r-sm)",
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                fontSize: 11.5,
                color: "var(--ink-2)",
              }}
            >
              선택 원인 <b style={{ color: "var(--ink)" }}>{flatLabel(selected)}</b>
              {saved && <span style={{ color: "var(--st-normal)", marginLeft: 8, fontWeight: 700 }}>· 저장됨</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <HoldButton
                label={<><Icon name="check" size={14} /> 원인 저장 (hold)</>}
                holdLabel="저장 중…"
                disabled={!selected}
                onConfirm={() => setSaved(selected)}
                style={{ flex: 1 }}
              />
              <button
                className="btn primary"
                style={{ flex: 1 }}
                disabled={!selected}
                onClick={() => router.push(`/incident/${inc.id}/action`)}
              >
                <Icon name="wrench" size={14} /> 조치 가이드 연결
              </button>
            </div>
          </div>
        </div>

        {/* 우: 영향 범위 / 유사 장애 / 가이드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0, overflow: "auto" }}>
          <div className="card">
            <PanelHead title="영향 범위" sub="작업 · 로봇 · 모듈" dense />
            <div style={{ padding: "10px 14px" }}>
              <KVStack
                pairs={[
                  ["영향 로봇", <span className="mono" key="r">{inc.robot}</span>],
                  ["영향 모듈", <span className="mono" key="m">{inc.module}</span>],
                  ["코드", <span className="mono" key="c">{inc.code}</span>],
                  ["작업 세션", inc.session ? <span className="mono" key="s">{inc.session}</span> : "—"],
                  ["영향", inc.impact],
                  ["재발", `x${inc.recur}`],
                ]}
              />
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PanelHead title="유사 장애 검색" sub={`${similar.length}건 매칭`} dense />
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 9px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  background: "var(--surface)",
                }}
              >
                <Icon name="search" size={14} style={{ color: "var(--ink-3)" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="코드 · 모듈 · 제목으로 검색"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, color: "var(--ink)" }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {similar.length === 0 ? (
                <div style={{ padding: 16, fontSize: 12, color: "var(--ink-3)" }}>매칭되는 장애 없음</div>
              ) : (
                similar.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/incident/${s.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 14px",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: "var(--surface)",
                      cursor: "pointer",
                    }}
                  >
                    <StatusBadge sev={sevOf(s)} label={IC.sevMeta[s.sev].label} />
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", flex: "none" }}>
                      {s.code}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.title}
                    </span>
                    {s.recur > 1 && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--st-warning)", flex: "none" }}>x{s.recur}</span>
                    )}
                    <Icon name="ext" size={13} style={{ color: "var(--ink-3)", flex: "none" }} />
                  </button>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--r-sm)",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              fontSize: 11.5,
              color: "var(--ink-2)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Icon name="audit" size={15} style={{ color: "var(--ink-3)" }} /> actor · action(cause.classify) · target {inc.id} · reason 기록은 audit_log에 남습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
