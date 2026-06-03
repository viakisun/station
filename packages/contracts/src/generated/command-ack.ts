/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 명령 3단계 ACK 한 틱. received(게이트웨이 수신) → accepted(권한·상태·안전 통과·큐잉) → executed(완료). rejected/timeout은 종단.
 */
export interface CommandAck {
  commandId: string;
  stage: "received" | "accepted" | "executed" | "rejected" | "timeout";
  ts: string;
  /**
   * 거부 시 표준 에러코드. 예 SAFETY_LOCK
   */
  code?: string;
  detail?: string;
}
