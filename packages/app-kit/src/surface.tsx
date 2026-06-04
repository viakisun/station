"use client";
/* ============================================================
   [SWC-AGENT-MIRROR / WR-MVP-1] SurfaceHeader·badges·StubPanel.
   모든 surface 상단에 SurfaceHeader 강제 — SWS·product·authority·locus,
   미러 surface는 mirrorOf·controlMode + [data-mirror] 종속 표현(권한 ④<③).
   ============================================================ */
import type { ReactNode } from "react";
import type { Authority, Locus, SurfaceDef } from "./product-matrix";
import { surfaceBySws } from "./product-matrix";

const AUTH_COLOR: Record<Authority, string> = {
  "②": "var(--st-notice)",
  "③": "var(--st-normal)",
  "④": "var(--st-warning)",
  "non-op": "var(--ink-3)",
};
const AUTH_LABEL: Record<Authority, string> = {
  "②": "② Agent policy",
  "③": "③ Field operator",
  "④": "④ Cloud mirror",
  "non-op": "non-operational",
};

const chip = (bg: string, fg = "#fff"): React.CSSProperties => ({
  fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, padding: "1px 6px",
  borderRadius: "var(--r-sm)", background: bg, color: fg, whiteSpace: "nowrap", lineHeight: 1.6,
});

export function AuthorityBadge({ authority, locus }: { authority: Authority; locus: Locus }) {
  return (
    <span style={{ display: "inline-flex", gap: 5 }}>
      <span style={chip(AUTH_COLOR[authority])} title="authority">{AUTH_LABEL[authority]}</span>
      <span style={{ ...chip("var(--surface-2)", "var(--ink-2)"), border: "1px solid var(--line-strong)" }} title="locus">{locus}</span>
    </span>
  );
}

export function MirrorBadge({ mirrorOf, controlMode }: { mirrorOf: string; controlMode: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      <span style={{ ...chip("var(--surface-2)", "var(--ink-2)"), border: "1px dashed var(--line-strong)" }} title="mirror of">⇄ {mirrorOf}</span>
      <span style={chip(controlMode === "none" ? "var(--st-critical)" : "var(--ink-2)")} title="control mode">{controlMode}</span>
    </span>
  );
}

/** 모든 신규 surface 상단에 강제. sws 만 주면 Product Matrix에서 메타 조회. */
export function SurfaceHeader({ sws, right }: { sws: string; right?: ReactNode }) {
  const s: SurfaceDef | undefined = surfaceBySws(sws);
  const isMirror = !!s?.mirrorOf;
  return (
    <div
      data-mirror={isMirror ? "" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 16px", borderBottom: "1px solid var(--line)",
        background: isMirror ? "var(--tint-notice, var(--surface-2))" : "var(--surface)",
        borderLeft: isMirror ? "3px solid var(--st-warning)" : "3px solid transparent",
      }}
    >
      <span style={chip("var(--ink)")} title="SWS id">{sws}</span>
      <strong style={{ fontSize: 13 }}>{s?.label ?? sws}</strong>
      {s && <AuthorityBadge authority={s.authority} locus={s.locus} />}
      {s?.mirrorOf && <MirrorBadge mirrorOf={s.mirrorOf} controlMode={s.controlMode} />}
      <span style={{ flex: 1 }} />
      {right}
    </div>
  );
}

/** 균일 stub 카드 — WR-MVP-1은 깊이보다 일관성. 모든 stub surface가 같은 형태. */
export function StubPanel({ title, swt, children }: { title: string; swt?: string; children?: ReactNode }) {
  return (
    <div className="card" style={{ padding: 14, margin: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>structure stub</span>
        {swt && <span className="mono" style={{ fontSize: 10, color: "var(--st-warning)" }}>TODO({swt})</span>}
      </div>
      {children ?? (
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
          구조 목업 — 레이아웃·식별자만. 실데이터·기능은 후속 MVP(이 surface의 SWT).
        </div>
      )}
    </div>
  );
}
