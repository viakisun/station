import { ifpFor } from "@station/contracts";

/* ============================================================
   InterfaceGuard — IF-P notCarried(금지) 런타임 강제.
   노드가 자기 IF-P 가 *나르면 안 되는* 채널/verb 로 신호/이벤트를 올리면 드롭+경고.
   ADR 산문("MCU는 autonomy 안 나름", "VPU는 motion 직접제어 금지")을 코드로.
   carries 미포함(allowlist)은 soft(경고) — 완전성은 conformance(P4) 소관.
   ============================================================ */

export interface GuardVerdict {
  ok: boolean;
  reason?: string;
}

const globMatch = (pattern: string, value: string): boolean =>
  pattern.endsWith("*") ? value.startsWith(pattern.slice(0, -1)) : value === pattern;

/** 노드 kind 의 IF-P 로 업링크 채널이 허용되는지(notCarried 위반 = 차단). */
export function checkUplink(node: string, channel: string): GuardVerdict {
  const spec = ifpFor(node);
  if (!spec) return { ok: true }; // custom 노드(IF-P 미정의) — 통과
  for (const np of spec.notCarried ?? []) {
    if (globMatch(np, channel)) return { ok: false, reason: `${node} IF-P(${spec.id}) notCarried 위반: ${channel}` };
  }
  return { ok: true };
}

/** carries.signals/events 에 채널이 선언돼 있는지(soft 경고용). */
export function isDeclared(node: string, channel: string): boolean {
  const spec = ifpFor(node);
  if (!spec) return true;
  const decl = [...(spec.carries?.signals ?? []), ...(spec.carries?.events ?? [])];
  return decl.includes(channel);
}
