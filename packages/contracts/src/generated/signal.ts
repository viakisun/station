/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 런타임 신호 1 표본. Local Agent의 SignalStore가 노드 어댑터에서 받아 HMI/관제로 푸시.
 */
export interface Signal {
  /**
   * 표준 NS 이름
   */
  channel: string;
  value: number | boolean;
  unit?: string;
  /**
   * ISO8601 또는 HH:MM:SS
   */
  ts: string;
  quality: "good" | "warn" | "bad";
  source?: {
    node?: "MCU" | "VPU" | "ACU" | "Telemetry" | "LPU";
    /**
     * 원천 키. 예 cam_fps
     */
    rawKey?: string;
    /**
     * 예 0x51
     */
    hex?: string;
  };
}
