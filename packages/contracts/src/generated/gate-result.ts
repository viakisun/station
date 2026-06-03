/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * Gate 4단계 평가 결과(ADR-006). domain gates.ts의 GateEval과 동형.
 */
export interface GateResult {
  /**
   * 예 G4 Calibration
   */
  gate: string;
  severity: "pass" | "warn" | "confirm_required" | "blocked";
  reason?: string;
  /**
   * 차단되는 대상/명령
   */
  blocks?: string[];
  actions?: {
    label: string;
    href?: string;
  }[];
}
