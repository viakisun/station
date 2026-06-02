/* ============================================================
   Context Envelope (UX 핸드오프) — 00 §7 · ADR-002 1단계
   제품 경계를 넘어 선택 컨텍스트를 URL `ctx` 쿼리로 운반(ID만).
   서명/handoff_id는 단계 5. 여기선 URL-safe JSON.
   ============================================================ */
export interface ContextEnvelope {
  site?: string;
  robot_id?: string;
  work_session_id?: string;
  incident_id?: string;
  module_id?: string;
  firmware_id?: string;
  calibration_profile_id?: string;
  origin?: string; // ops | build | field
  return_to?: string; // URL
}

export function encodeCtx(env: ContextEnvelope): string {
  return encodeURIComponent(JSON.stringify(env));
}

export function parseCtx(raw: string | null | undefined): ContextEnvelope | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as ContextEnvelope;
  } catch {
    return null;
  }
}

/** 운반 ID 요약("RBT-… · WKS-…") — ContextChip ids용 */
export function ctxSummary(env: ContextEnvelope | null): string {
  if (!env) return "";
  return [env.robot_id, env.work_session_id, env.incident_id, env.firmware_id, env.module_id]
    .filter(Boolean)
    .join(" · ");
}
