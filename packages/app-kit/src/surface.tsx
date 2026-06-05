"use client";
/* ============================================================
   [SWC-AGENT-MIRROR / WR-MVP-1] SurfaceHeader·badges·StubPanel.
   모든 surface 상단에 SurfaceHeader 강제 — SWS·product·authority·locus,
   미러 surface는 mirrorOf·controlMode + [data-mirror] 종속 표현(권한 ④<③).
   TODO(SWT-MIRROR-001): MirrorHeader authority/locus/mirror badge — 본 파일에서 구현.
   TODO(SWT-MIRROR-002): packages/agent-mirror 패키지로 미러 본체 추출(현재 app-kit + build inspector).
   ============================================================ */
import type { ReactNode } from "react";
import type { Authority, Locus, SurfaceDef } from "./product-matrix";
import { surfaceBySws } from "./product-matrix";

/* (ADR-021) authority = 명도 rank(밝을수록 고권한 ②>③>④), 색이 아닌 outline 배지.
   physical(①)만 안전 적색. 제품/상태 hue와 충돌 없음. */
const AUTH_KEY: Record<Authority, string> = { "②": "agent", "③": "field", "④": "cloud", "non-op": "build" };
const AUTH_LABEL: Record<Authority, string> = {
  "②": "② Agent policy",
  "③": "③ Field operator",
  "④": "④ Cloud mirror",
  "non-op": "non-operational",
};
/* locus = 아이콘(색 아님). on-robot 실체 vs cloud 그림자를 글리프로. */
const LOCUS_ICON: Record<Locus, string> = {
  "on-robot": "⌂", "on-robot daemon": "⌂", "cloud": "☁", "cloud/desktop": "☁",
};

const chip = (bg: string, fg = "var(--text-primary)"): React.CSSProperties => ({
  fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, padding: "1px 6px",
  borderRadius: "var(--radius-sm)", background: bg, color: fg, whiteSpace: "nowrap", lineHeight: 1.6,
});
/* outline 배지 — 채움 금지. 권한 rank 색은 *테두리+텍스트*로만. */
const outline = (accent: string): React.CSSProperties => ({
  fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, padding: "1px 6px",
  borderRadius: "var(--radius-sm)", background: "transparent", color: accent,
  border: `1px solid ${accent}`, whiteSpace: "nowrap", lineHeight: 1.6,
});

export function AuthorityBadge({ authority, locus }: { authority: Authority; locus: Locus }) {
  return (
    <span data-authority={AUTH_KEY[authority]} style={{ display: "inline-flex", gap: 5 }}>
      <span style={outline("var(--authority-accent)")} title="authority">{AUTH_LABEL[authority]}</span>
      <span style={{ ...chip("var(--surface-panel-raised)", "var(--text-secondary)"), border: "1px solid var(--line-strong)" }} title="locus">{LOCUS_ICON[locus]} {locus}</span>
    </span>
  );
}

export function MirrorBadge({ mirrorOf, controlMode }: { mirrorOf: string; controlMode: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      <span style={{ ...chip("var(--surface-panel-raised)", "var(--text-secondary)"), border: "1px dashed var(--line-strong)" }} title="mirror of">⇄ {mirrorOf}</span>
      <span style={controlMode === "none" ? outline("var(--state-critical)") : { ...chip("var(--surface-panel-raised)", "var(--text-muted)"), border: "1px solid var(--line-default)" }} title="control mode">{controlMode}</span>
    </span>
  );
}

/** 모든 신규 surface 상단에 강제. sws 만 주면 Product Matrix에서 메타 조회. */
export function SurfaceHeader({ sws, right }: { sws: string; right?: ReactNode }) {
  const s: SurfaceDef | undefined = surfaceBySws(sws);
  const isMirror = !!s?.mirrorOf;
  return (
    <div
      data-mirror={isMirror ? "true" : undefined}
      data-control-mode={s?.mirrorOf ? s.controlMode : undefined}
      data-authority={s ? AUTH_KEY[s.authority] : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 16px", borderBottom: "1px solid var(--line-default)",
        background: isMirror ? "var(--mirror-bg)" : "var(--surface-panel)",
        /* (ADR-021) 좌측 권한 컬러 보더 제거 → 중립 hairline. 미러 surface만
           controlMode 테두리-스타일(점선/실선/2px)로 종속성을 *형태*로 표현. */
        borderLeft: isMirror
          ? "var(--mirror-mode-width) var(--mirror-mode-style) var(--mirror-mode-line)"
          : "1px solid var(--line-default)",
      }}
    >
      <span style={{ ...chip("var(--surface-muted)", "var(--text-primary)"), border: "1px solid var(--line-strong)" }} title="SWS id">{sws}</span>
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
    <div style={{ padding: 14, margin: 14, background: "var(--stub-bg)", border: "1px dashed var(--stub-border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span className="mono" style={{ fontSize: 10, color: "var(--stub-text)" }}>structure stub</span>
        {swt && <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>TODO({swt})</span>}
      </div>
      {children ?? (
        <div style={{ fontSize: 12, color: "var(--stub-text)", lineHeight: 1.6 }}>
          구조 목업 — 레이아웃·식별자만. 실데이터·기능은 후속 MVP(이 surface의 SWT).
        </div>
      )}
    </div>
  );
}
