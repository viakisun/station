/* ============================================================
   노드 종류 — 개방형(open) taxonomy
   권장 표준 5종 + custom 허용. "모든 로봇을 SDV로"의 전제:
   노드 분류를 온실 5종에 가두지 않는다(드론 FCU, AMR 등 수용).
   ============================================================ */

/** 권장 표준 노드(온실 멀티로봇 기준). 다른 로봇은 custom kind 를 더한다. */
export const STANDARD_NODE_KINDS = ["MCU", "VPU", "ACU", "Telemetry", "LPU"] as const;

export type StandardNodeKind = (typeof STANDARD_NODE_KINDS)[number];

/**
 * 개방형 노드 종류 — 표준 5종은 자동완성되고, 그 외 임의 문자열(custom)도 허용.
 * 예: "FCU"(flight control unit, 방제 드론), "ARM"(매니퓰레이터 전용 로봇) 등.
 */
export type NodeKind = StandardNodeKind | (string & {});

export function isStandardNodeKind(kind: string): kind is StandardNodeKind {
  return (STANDARD_NODE_KINDS as readonly string[]).includes(kind);
}
