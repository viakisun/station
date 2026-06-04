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

const AUTH_COLOR: Record<Authority, string> = {
  "②": "var(--authority-agent)",
  "③": "var(--authority-field)",
  "④": "var(--authority-cloud)",
  "non-op": "var(--authority-build)",
};
const AUTH_KEY: Record<Authority, string> = { "②": "agent", "③": "field", "④": "cloud", "non-op": "build" };
const AUTH_LABEL: Record<Authority, string> = {
  "②": "② Agent policy",
  "③": "③ Field operator",
  "④": "④ Cloud mirror",
  "non-op": "non-operational",
};

const chip = (bg: string, fg = "#fff"): React.CSSProperties => ({
  fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700, padding: "1px 6px",
  borderRadius: "var(--radius-sm)", background: bg, color: fg, whiteSpace: "nowrap", lineHeight: 1.6,
});

export function AuthorityBadge({ authority, locus }: { authority: Authority; locus: Locus }) {
  return (
    <span data-authority={AUTH_KEY[authority]} style={{ display: "inline-flex", gap: 5 }}>
      <span style={chip(AUTH_COLOR[authority])} title="authority">{AUTH_LABEL[authority]}</span>
      <span style={{ ...chip("var(--surface-panel-raised)", "var(--text-secondary)"), border: "1px solid var(--line-strong)" }} title="locus">{locus}</span>
    </span>
  );
}

export function MirrorBadge({ mirrorOf, controlMode }: { mirrorOf: string; controlMode: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      <span style={{ ...chip("var(--surface-panel-raised)", "var(--text-secondary)"), border: "1px dashed var(--line-strong)" }} title="mirror of">⇄ {mirrorOf}</span>
      <span style={chip(controlMode === "none" ? "var(--state-critical)" : "var(--text-secondary)")} title="control mode">{controlMode}</span>
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
        background: isMirror ? "var(--mirror-mode-bg, var(--mirror-bg))" : "var(--surface-panel)",
        borderLeft: `3px solid ${isMirror ? "var(--mirror-mode-line, var(--mirror-line))" : "var(--authority-accent)"}`,
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
        {swt && <span className="mono" style={{ fontSize: 10, color: "var(--state-warning)" }}>TODO({swt})</span>}
      </div>
      {children ?? (
        <div style={{ fontSize: 12, color: "var(--stub-text)", lineHeight: 1.6 }}>
          구조 목업 — 레이아웃·식별자만. 실데이터·기능은 후속 MVP(이 surface의 SWT).
        </div>
      )}
    </div>
  );
}
