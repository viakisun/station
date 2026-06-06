/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * Local Agent PolicyEngine 안전·운영 룰. when(구조화 조건)이 참이고 applies(verb)에 매칭되면 effect(gate severity)를 명령에 적용. 예: worker_detected → autonomy 차단. eval 없는 안전 평가.
 */
export interface PolicyRule {
  /**
   * 예 POL-WORKER-SAFETY
   */
  id: string;
  describe?: string;
  /**
   * 적용 대상 verb(glob 접두 *). 예 ["autonomy.*", "motion.set_speed_limit"]
   */
  applies: string[];
  when: Condition;
  /**
   * 충족 시 Gate severity
   */
  effect: "pass" | "warn" | "confirm_required" | "blocked";
  /**
   * 연결 Gate 이름. 예 G-Safety
   */
  gate?: string;
  reason?: string;
}
/**
 * 트리거 조건(참이면 effect 적용)
 */
export interface Condition {
  all?: Condition1[];
  any?: Condition1[];
  signal?: string;
  state?: string;
  op?: "==" | "!=" | "<" | ">" | "<=" | ">=";
  value?: number | string | boolean;
}
/**
 * all(AND)/any(OR) 또는 단일 비교. signal=SignalStore latest 채널, state=컨텍스트 변수.
 */
export interface Condition1 {
  all?: Condition1[];
  any?: Condition1[];
  signal?: string;
  state?: string;
  op?: "==" | "!=" | "<" | ">" | "<=" | ">=";
  value?: number | string | boolean;
}
