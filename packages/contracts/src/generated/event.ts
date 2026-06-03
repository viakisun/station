/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 비동기 이벤트/알람. Local Agent EventBus가 발행, 임계 초과 시 Incident로 승격(promotedIncidentId).
 */
export interface Event {
  ts: string;
  severity: "info" | "notice" | "warning" | "critical" | "emergency";
  /**
   * 발생 출처. 노드/모듈 ID. 예 NODE-VPU-META, MOD-EE-PINCH
   */
  source: string;
  /**
   * (개방형 노드종류 — 권장 MCU·VPU·ACU·Telemetry·LPU + custom 허용)
   */
  node?: string;
  /**
   * 표준 에러코드. 예 CAM-FRAME-DROP, NAV-SAFETY-INTERLOCK
   */
  code: string;
  message: string;
  /**
   * 관련 표준 채널(선택)
   */
  channel?: string;
  /**
   * 관련 명령(선택)
   */
  commandId?: string;
  workSessionId?: string;
  /**
   * 승격된 incident id 또는 null
   */
  promotedIncidentId?: string | null;
}
