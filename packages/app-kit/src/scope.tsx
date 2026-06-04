"use client";
/* ============================================================
   [SWC-SCOPE / WR-MVP-1] 영속 스코프 — ORG → PRJ → SITE → RBT.
   현 ConsoleShell의 ephemeral robotId(nav마다 소실) 문제 대체(SWT-SCOPE-001/002).
   URL ?ctx= 직렬화(domain encodeCtx/parseCtx 재사용) → nav·deeplink·cross-app 유지.
   TODO(SWT-SCOPE-002): ephemeral robotId 버그 수정 — 완료(sessionStorage 영속).
   ============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  encodeCtx,
  parseCtx,
  getProjects,
  getSitesOfProject,
  getRobotsOfSite,
} from "@station/domain";
import type { ScopeDepth } from "./product-matrix";

export interface Scope {
  orgId: string; // ORG-VIA
  projectId: string | null; // PRJ-*
  siteId: string | null; // SITE-*
  robotId: string | null; // RBT-*
}
interface ScopeApi {
  scope: Scope;
  setProject: (id: string | null) => void;
  setSite: (id: string | null) => void;
  setRobot: (id: string | null) => void;
}

const DEFAULT: Scope = { orgId: "ORG-VIA", projectId: null, siteId: null, robotId: null };
const ScopeCtx = createContext<ScopeApi | null>(null);

const STORE_KEY = "station.scope";

/** URL ?ctx= 우선(deeplink/cross-app) → sessionStorage 폴백(same-app 전체 nav 유지). */
function loadScope(): Scope {
  if (typeof window === "undefined") return DEFAULT;
  const env = parseCtx(new URLSearchParams(window.location.search).get("ctx"));
  if (env && (env.project_id || env.robot_id || env.site)) {
    return { orgId: "ORG-VIA", projectId: env.project_id ?? null, siteId: env.site ?? null, robotId: env.robot_id ?? null };
  }
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Scope;
  } catch { /* ignore */ }
  return DEFAULT;
}
function persist(s: Scope): void {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  const ctx = encodeCtx({ project_id: s.projectId ?? undefined, site: s.siteId ?? undefined, robot_id: s.robotId ?? undefined });
  const u = new URL(window.location.href);
  u.searchParams.set("ctx", ctx);
  window.history.replaceState(null, "", u.toString());
}

export function ScopeProvider({ children, seedFirstProject = true }: { children: ReactNode; seedFirstProject?: boolean }) {
  const [scope, setScope] = useState<Scope>(DEFAULT);
  useEffect(() => {
    let s = loadScope();
    if (seedFirstProject && !s.projectId) {
      const p = getProjects()[0];
      const site = p ? getSitesOfProject(p.id)[0] : undefined;
      s = { ...s, projectId: p?.id ?? null, siteId: site?.id ?? null };
    }
    setScope(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (next: Scope): void => { setScope(next); persist(next); };
  const api: ScopeApi = {
    scope,
    setProject: (id) => {
      const site = id ? getSitesOfProject(id)[0]?.id ?? null : null;
      commit({ ...scope, projectId: id, siteId: site, robotId: null });
    },
    setSite: (id) => commit({ ...scope, siteId: id, robotId: null }),
    setRobot: (id) => commit({ ...scope, robotId: id }),
  };
  return <ScopeCtx.Provider value={api}>{children}</ScopeCtx.Provider>;
}

export function useScope(): ScopeApi {
  const v = useContext(ScopeCtx);
  if (!v) throw new Error("useScope must be used within ScopeProvider");
  return v;
}

const sel: React.CSSProperties = { height: 26, fontSize: 11, fontFamily: "var(--font-mono)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)", background: "var(--surface-panel)", color: "var(--text-primary)", padding: "0 6px", maxWidth: 200 };

/** project→site→robot 선택. scopeDepth로 노출 깊이 차등(Build의 일부 surface는 robot optional). */
export function ProjectScopePicker({ depth = "robot" }: { depth?: ScopeDepth }) {
  const { scope, setProject, setSite, setRobot } = useScope();
  if (depth === "none") return null;
  const sites = scope.projectId ? getSitesOfProject(scope.projectId) : [];
  const robots = scope.siteId ? getRobotsOfSite(scope.siteId) : [];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select aria-label="project" style={sel} value={scope.projectId ?? ""} onChange={(e) => setProject(e.target.value || null)}>
        <option value="">project…</option>
        {getProjects().map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
      </select>
      {depth !== "project" && (
        <select aria-label="site" style={sel} value={scope.siteId ?? ""} onChange={(e) => setSite(e.target.value || null)}>
          <option value="">site…</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
        </select>
      )}
      {depth === "robot" && (
        <select aria-label="robot" style={sel} value={scope.robotId ?? ""} onChange={(e) => setRobot(e.target.value || null)}>
          <option value="">robot…{robots.length ? ` (${robots.length})` : ""}</option>
          {robots.map((r) => <option key={r.id} value={r.id}>{r.id}</option>)}
        </select>
      )}
    </div>
  );
}

/** Hub용 축약 — 조작 없음. */
export function ScopeSummary() {
  const { scope } = useScope();
  const parts = [scope.projectId, scope.siteId, scope.robotId].filter(Boolean);
  return (
    <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
      scope: {parts.length ? parts.join(" · ") : "(none)"}
    </span>
  );
}
