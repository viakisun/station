/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 매니페스트/노드가 선언하는 '받을 수 있는 명령'(구 CapabilityProfile.CommandSpec).
 */
export interface CommandDescriptor {
  /**
   * 표준 NS 동사. 예 ee.pinch, vision.capture.start
   */
  verb: string;
  /**
   * 기존 SCREAMING 동사 병기. 예 PINCH, START_CAPTURE
   */
  legacyVerb?: string;
  ack: "at_least_once" | "exactly_once" | "at_most_once";
  timeoutMs: number;
  safety: "none" | "guarded" | "safety_critical";
  params?: {
    key: string;
    type: string;
    range?: string;
  }[];
}
