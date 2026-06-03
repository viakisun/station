/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 표준 신호 채널 정의(카탈로그). 기존 TCH-* 채널 + 캘리브/정책을 표준 NS 이름으로 승격.
 */
export interface SignalChannel {
  /**
   * 표준 NS 이름. 예 machine.vision.fps, env.greenhouse.temperature
   */
  channel: string;
  /**
   * 호환 alias. 예 TCH-cam-fps
   */
  legacyId?: string;
  label: string;
  unit: string;
  /**
   * Env | Robot | ...
   */
  group?: string;
  /**
   * 소속 노드
   */
  node?: "MCU" | "VPU" | "ACU" | "Telemetry" | "LPU";
  ownerOrg?: string;
  calibration?: {
    zero: number;
    span: number;
    offset: number;
    scale: number;
    due?: boolean;
  };
  policy?: {
    /**
     * 예 1s, 500ms
     */
    rate?: string;
    warn?: string;
    crit?: string;
    smooth?: string;
    /**
     * 임계 초과 시 Event/Incident 승격 여부
     */
    promote?: boolean;
  };
}
