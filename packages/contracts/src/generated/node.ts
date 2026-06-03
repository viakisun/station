/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * 로봇의 독립 컴퓨트 노드(기관 산출물). Local Agent가 노드 어댑터로 흡수해 표준 Signal/Command/Event로 노출한다.
 */
export interface Node {
  /**
   * 예 NODE-MCU-AGE, NODE-VPU-META
   */
  nodeId: string;
  /**
   * (개방형 노드종류 — 권장 MCU·VPU·ACU·Telemetry·LPU + custom 허용)
   */
  kind: string;
  /**
   * 이 노드를 만든 기관
   */
  ownerOrg: string;
  label: string;
  role?: string;
  /**
   * 이 노드가 내보내는 표준 채널(NS 이름). 예 machine.vision.fps
   */
  signals?: string[];
  /**
   * 이 노드가 받는 명령 verb. 예 vision.capture.start
   */
  commands?: string[];
  /**
   * ProtocolProfile.id 참조
   */
  protocolRef?: string;
}
