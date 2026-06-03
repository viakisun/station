/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * Local Agent PolicyEngine의 안전·운영 룰 선언(2단계 런타임이 평가). 예: VPU worker_detected → ACU slow_down → MCU speed_limit.
 */
export interface PolicyRule {
  /**
   * 예 P-WORKER-PROXIMITY
   */
  id: string;
  describe?: string;
  /**
   * 트리거 조건. 예 machine.vision.worker_detected == true
   */
  when: string;
  /**
   * 명령 발행 전 충족 조건(선택)
   */
  require?: string;
  /**
   * 연결 Gate 이름
   */
  gate: string;
  defaultSeverity?: "pass" | "warn" | "confirm_required" | "blocked";
}
